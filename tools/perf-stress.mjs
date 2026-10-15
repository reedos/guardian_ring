// Load and low-power measurements, reported beside (never instead of) the real-GPU budgets in perf.mjs.
// The budget gate runs the highest tier on the development GPU. This tool answers a different question:
// what the render-quality governor does when the machine is slow, and what each tier costs there.
//
//   profile gpu-cpu6       real GPU (D3D11) + 6x CPU throttle through the Chrome DevTools protocol, phone window
//   profile software-cpu4  software GL (SwiftShader, a low-power-GPU stand-in) + 4x CPU throttle, phone window
//
// Each profile (1) forces every tier in turn on three levels and records frame intervals, then (2) leaves the
// governor free on those levels and records which tiers it reaches and the resulting frame times. Results are
// measurements, not budgets; the only failures are page errors, too few samples, and a governor that never engages
// where the frames are clearly slow. Writes .local/gates/perf-stress-<profile>.json and research/perf-stress.md.
//
//   node tools/perf-stress.mjs [profile ...]        (GR_URL selects the preview; default http://127.0.0.1:47601/)
import { chromium } from 'playwright';
import fs from 'node:fs';
import { TIERS } from '../src/explainer-kit/src/render-quality.js';
import { BASE } from './gate-common.mjs';

const PROFILES = {
  'gpu-cpu6': { label: 'Real GPU (D3D11), 6x CPU throttle', throttle: 6, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'], software: false },
  'software-cpu4': { label: 'Software GL (SwiftShader), 4x CPU throttle', throttle: 4, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], software: true },
};
const LEVELS = process.env.GR_STRESS_LEVELS ? process.env.GR_STRESS_LEVELS.split(',') : ['orbits', 'payload', 'plume'];
const SWEEP_FRAMES = Number(process.env.GR_STRESS_FRAMES) || 90, SWEEP_MAX_MS = 14000;
const GOVERN_MS = Number(process.env.GR_STRESS_GOVERN_MS) || 40000;
const requested = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROFILES);
const unknown = requested.filter(id => !PROFILES[id]);
if (unknown.length) throw new Error(`Unknown profile ${unknown}; use ${Object.keys(PROFILES)}`);

const stats = values => {
  const sorted = [...values].sort((a, b) => a - b), n = sorted.length;
  return n ? { samples: n, p50: sorted[Math.floor(n * .5)], p95: sorted[Math.min(n - 1, Math.floor(n * .95))], max: sorted[n - 1] } : { samples: 0, p50: null, p95: null, max: null };
};
const ms = v => v === null || v === undefined ? 'n/a' : v.toFixed(1);

// In-page sampler: frame intervals between animation frames over a fixed number of frames or a time cap.
const sample = (page, { frames, maxMs }) => page.evaluate(({ frames, maxMs }) => new Promise(resolve => {
  const values = [], started = performance.now();
  let last = started, warm = 8;
  const tick = now => {
    if (warm > 0) { warm--; last = now; requestAnimationFrame(tick); return; }
    values.push(now - last); last = now;
    if (values.length >= frames || now - started > maxMs) { const R = grx.renderer(); resolve({ values, calls: R.info.render.calls, triangles: R.info.render.triangles, ratio: R.getPixelRatio(), buffer: R.getDrawingBufferSize(new grx.THREE.Vector2()).toArray() }); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), { frames, maxMs });

const startMotion = page => page.evaluate(() => {
  const b = grx.built[grx.state.scene];
  if (b.teaching) { b.teaching.reset(); b.teaching.play({ repeat: true }); }
  b.setMotion?.(true);
});

async function runProfile(id) {
  const profile = PROFILES[id], fail = [], errors = [];
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: profile.args });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    page.setDefaultTimeout(60000);
    await page.addInitScript(() => localStorage.setItem('grx-mission-visited-v1', '1'));
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.throttle });
    await page.goto(new URL('visualizer.html', BASE).href);
    await page.waitForFunction(() => window.grx?.built[window.grx.state.scene], null, { timeout: 180000 });
    const gpu = await page.evaluate(() => { const gl = grx.renderer().getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); });
    console.log(`${id}: ${gpu}`);
    if (profile.software !== /swiftshader|software|llvmpipe/i.test(gpu)) fail.push(`${id}: expected ${profile.software ? 'a software' : 'a real'} renderer, got ${gpu}`);
    const scenes = await page.evaluate(() => grx.store.C.SCENES.map((s, i) => ({ i, id: s.id })));
    const sweep = [], governed = [];

    // (1) Every tier held in turn: what each costs on this machine.
    for (const levelId of LEVELS) {
      const level = scenes.find(s => s.id === levelId);
      await page.evaluate(() => grx.setTransitions('instant'));
      await page.evaluate(async i => { await grx.show({ scene: i, mode: 'light' }, { scroll: false }); grx.settle(); }, level.i);
      await startMotion(page);
      for (let tier = 0; tier < TIERS.length; tier++) {
        await page.evaluate(t => grx.forceTier(t, { hold: true }), tier);
        const r = await sample(page, { frames: SWEEP_FRAMES, maxMs: SWEEP_MAX_MS });
        const row = { level: levelId, tier, ratio: r.ratio, buffer: r.buffer, calls: r.calls, triangles: r.triangles, ...stats(r.values) };
        sweep.push(row);
        if (row.samples < Math.min(10, SWEEP_FRAMES)) fail.push(`${id}/${levelId}/tier ${tier}: only ${row.samples} frames sampled`);
        console.log(`  hold ${levelId} tier ${tier}: p50 ${ms(row.p50)} ms, p95 ${ms(row.p95)} ms (${row.samples} frames, ${row.buffer.join('x')})`);
      }
    }

    // (2) Governor free: start at tier 0 and watch where it settles.
    for (const levelId of LEVELS) {
      const level = scenes.find(s => s.id === levelId);
      await page.evaluate(async i => { await grx.show({ scene: i, mode: 'light' }, { scroll: false }); grx.settle(); grx.forceTier(0, { hold: false, i }); }, level.i);
      await startMotion(page);
      const timeline = [], intervals = [], started = Date.now();
      // Record every frame interval alongside a once-per-second tier snapshot.
      await page.evaluate(() => { window.__stress = { values: [], stop: false }; const loop = now => { const s = window.__stress; if (s.last) s.values.push([now, now - s.last]); s.last = now; if (!s.stop) requestAnimationFrame(loop); }; requestAnimationFrame(loop); });
      while (Date.now() - started < GOVERN_MS) {
        await page.waitForTimeout(1000);
        const q = await page.evaluate(i => { const q = grx.quality(); return { tier: q.tiers[i], ratio: q.ratio, frame: q.judged?.frame ?? null, cpu: q.judged?.cpu ?? null, at: performance.now() }; }, level.i);
        timeline.push({ t: (Date.now() - started) / 1000, ...q });
      }
      const raw = await page.evaluate(() => { window.__stress.stop = true; return window.__stress.values; });
      const t0 = raw[0]?.[0] ?? 0, endAt = raw.at(-1)?.[0] ?? 0;
      const first = raw.filter(([t]) => t - t0 < 6000).map(v => v[1]), last = raw.filter(([t]) => endAt - t < 8000).map(v => v[1]);
      const reached = Math.max(...timeline.map(r => r.tier)), final = timeline.at(-1);
      const firstChange = timeline.find(r => r.tier > 0);
      const row = { level: levelId, startTier: 0, maxTier: reached, finalTier: final.tier, finalRatio: final.ratio, secondsToFirstStep: firstChange ? firstChange.t : null,
        timeline: timeline.map(r => [Number(r.t.toFixed(1)), r.tier]), first6s: stats(first), last8s: stats(last), seconds: GOVERN_MS / 1000 };
      governed.push(row);
      console.log(`  governed ${levelId}: tier 0 -> ${final.tier} (max ${reached}), first 6 s p50/p95 ${ms(row.first6s.p50)}/${ms(row.first6s.p95)} ms, last 8 s p50/p95 ${ms(row.last8s.p50)}/${ms(row.last8s.p95)} ms`);
      if (row.first6s.samples < 3 || row.last8s.samples < 3) fail.push(`${id}/${levelId}: too few governed frames (${row.first6s.samples}/${row.last8s.samples})`);
      // Where tier 0 is clearly slow the governor must respond; where it is fast it must leave the tier alone.
      const slow = (sweep.find(r => r.level === levelId && r.tier === 0)?.p50 ?? 0) > 26;
      if (slow && reached === 0) fail.push(`${id}/${levelId}: tier-0 frames were slow (p50 > 26 ms) but the governor never stepped down`);
    }
    if (errors.length) fail.push(...errors.map(e => `page error: ${e}`));
    return { id, label: profile.label, gpu, cpuThrottle: profile.throttle, form: 'phone 390x844 @3x', date: new Date().toISOString(), url: BASE, sweep, governed, failures: fail };
  } finally { await browser.close(); }
}

const results = [];
for (const id of requested) {
  try { results.push(await runProfile(id)); } catch (error) { results.push({ id, label: PROFILES[id].label, failures: [error.stack || String(error)], sweep: [], governed: [] }); }
}
fs.mkdirSync('.local/gates', { recursive: true });
for (const r of results) fs.writeFileSync(`.local/gates/perf-stress-${r.id}.json`, JSON.stringify(r, null, 2));

// research/perf-stress.md: only profiles run this time are replaced; the others are kept as last recorded.
const file = 'research/perf-stress.md';
const section = r => {
  if (!r.sweep.length) return `## ${r.label}\n\nNot recorded: ${r.failures[0]?.split('\n')[0] || 'run failed'}.\n`;
  const date = new Date(r.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  let md = `## ${r.label}\n\nRecorded ${date} against \`${new URL(r.url).host}\`. Renderer: ${r.gpu}. Window: ${r.form}. CPU throttle ${r.cpuThrottle}x.\n\n`;
  md += `### Each tier held (frame interval, ms)\n\n| Level | Tier | Pixel ratio | Buffer | p50 | p95 | max | Frames |\n|---|---|---|---|---|---|---|---|\n`;
  for (const s of r.sweep) md += `| ${s.level} | ${s.tier} | ${s.ratio.toFixed(2)} | ${s.buffer.join(' x ')} | ${ms(s.p50)} | ${ms(s.p95)} | ${ms(s.max)} | ${s.samples} |\n`;
  md += `\n### Governor free, starting at tier 0 for ${r.governed[0]?.seconds ?? 0} s (frame interval, ms)\n\n| Level | Highest tier reached | Final tier | First step after | First 6 s p50 / p95 | Last 8 s p50 / p95 |\n|---|---|---|---|---|---|\n`;
  for (const g of r.governed) md += `| ${g.level} | ${g.maxTier} | ${g.finalTier} | ${g.secondsToFirstStep === null ? 'never' : `${g.secondsToFirstStep.toFixed(0)} s`} | ${ms(g.first6s.p50)} / ${ms(g.first6s.p95)} | ${ms(g.last8s.p50)} / ${ms(g.last8s.p95)} |\n`;
  return md;
};
const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
const kept = Object.keys(PROFILES).filter(id => !results.some(r => r.id === id)).map(id => {
  const label = PROFILES[id].label, at = previous.indexOf(`## ${label}`);
  if (at < 0) return '';
  const rest = previous.slice(at + 3), next = rest.search(/\n## /);
  return previous.slice(at, next < 0 ? undefined : at + 3 + next + 1).trimEnd() + '\n';
}).filter(Boolean);
const order = Object.keys(PROFILES), body = [...results.map(section), ...kept].sort((a, b) => order.findIndex(id => a.includes(PROFILES[id].label)) - order.findIndex(id => b.includes(PROFILES[id].label)));
fs.writeFileSync(file, `# Low-power and load measurements\n\nProduced by \`node tools/perf-stress.mjs\`. These sit beside the real-GPU budget runs (\`perf.mjs\`, worst p95 about 15 ms desktop and 7 ms phone on the development PC) and do not replace them: the budget gate holds the top tier on the development GPU, while these runs show what the render-quality governor does when the machine is slow. A software renderer and a throttled main thread stand in for a mid-range phone; they are not a phone, and no figure here is a measurement of one.\n\nFrame interval is the time between animation frames. A 60 Hz phone display shows 16.7 ms when the page keeps up; the headless browser here is not locked to a display, so a fast machine shows shorter intervals (the budget gate reads the same way). The governor judges a level every two seconds from the median interval, and treats an interval over 20.5 ms as pressure. Tiers are the seven render-quality tiers in \`src/explainer-kit/src/render-quality.js\`: tier 0 is the full look and tier 6 renders at 0.75 pixel ratio with no mirror, ambient occlusion, depth of field, bloom, halo or live shadows.\n\n${body.join('\n')}`);
let failed = 0;
for (const r of results) {
  console.log(`${r.failures.length ? 'FAIL' : 'PASS'}: ${r.id}, ${r.failures.length} problems`);
  for (const f of r.failures) { console.error(f); failed++; }
}
process.exitCode = failed ? 1 : 0;
