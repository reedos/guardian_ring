// Engine smoke run: WebKit (the iOS and Safari engine) and Firefox, beside the Chrome gates. The budget and layout
// gates all run in Chrome on one GPU, so this answers a narrower question: does the site work in the other two engines?
// Every page loads without errors; the explorer reaches every level with a drawn (not blank) canvas; losing and restoring
// the WebGL context shows the message and recovers; frame intervals are recorded for information. No frame budget applies:
// these engines run on whatever renderer the machine gives them, and headless WebKit and Firefox on Windows may be software.
//   node tools/cross-browser.mjs [webkit-phone] [webkit-desktop] [firefox-desktop]   (GR_URL selects the preview)
// Writes .local/gates/cross-browser-<profile>.json and research/cross-browser.md.
import { webkit, firefox, devices } from 'playwright';
import fs from 'node:fs';
import { BASE } from './gate-common.mjs';

const PROFILES = {
  'webkit-phone': { label: 'WebKit, iPhone 13 profile', type: webkit, options: { ...devices['iPhone 13'] } },
  'webkit-desktop': { label: 'WebKit, desktop 1440 x 900', type: webkit, options: { viewport: { width: 1440, height: 900 } } },
  'firefox-desktop': { label: 'Firefox, desktop 1440 x 900', type: firefox, options: { viewport: { width: 1440, height: 900 } } },
};
const PAGES = ['', 'visualizer.html', 'evidence.html', 'method.html', 'glossary.html', 'parts.html'];
const requested = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PROFILES);
const unknown = requested.filter(id => !PROFILES[id]);
if (unknown.length) throw new Error(`Unknown profile ${unknown}; use ${Object.keys(PROFILES)}`);

// Share of the pixels in a screenshot that are not near-black: a blank or black canvas scores about 0.
const litShare = (page, buffer) => page.evaluate(async b64 => {
  const image = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = `data:image/png;base64,${b64}`; });
  const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
  const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(image, 0, 0);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data; let lit = 0;
  for (let i = 0; i < data.length; i += 4) if (data[i] + data[i + 1] + data[i + 2] > 60) lit++;
  return lit / (data.length / 4);
}, buffer.toString('base64'));

async function runProfile(id) {
  const profile = PROFILES[id], fail = [], errors = [], levels = [], pages = [];
  const browser = await profile.type.launch({ headless: true });
  try {
    const context = await browser.newContext(profile.options);
    await context.addInitScript(() => { try { localStorage.setItem('grx-mission-visited-v1', '1'); } catch { /* optional */ } });
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    let phase = 'start';
    page.on('pageerror', e => errors.push(`${phase}: ${e.message}`));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(`${phase}: ${m.text()}`); });

    for (const file of PAGES) {
      phase = file || 'story';
      if (file === 'visualizer.html') continue;
      await page.goto(new URL(file, BASE).href, { waitUntil: 'load' });
      const h1 = await page.locator('h1').count(), overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      pages.push({ page: phase, h1, overflow });
      if (h1 !== 1) fail.push(`${phase}: ${h1} h1 elements`);
      if (overflow) fail.push(`${phase}: horizontal overflow`);
    }

    phase = 'explorer';
    await page.goto(new URL('visualizer.html', BASE).href);
    await page.waitForFunction(() => window.grx?.built[window.grx.state.scene], null, { timeout: 90000 });
    const renderer = await page.evaluate(() => { const gl = grx.renderer().getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return { version: gl.getParameter(gl.VERSION), gpu: e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), tier: grx.quality().tiers[0] }; });
    console.log(`${id}: ${renderer.version}; ${renderer.gpu}`);
    await page.evaluate(() => grx.setTransitions('instant'));
    const scenes = await page.evaluate(() => grx.store.C.SCENES.map((s, i) => ({ i, id: s.id })));
    for (const scene of scenes) {
      phase = `level ${scene.id}`;
      await page.evaluate(async i => { await grx.show({ scene: i, mode: 'light' }, { scroll: false }); grx.settle(); }, scene.i);
      await page.waitForTimeout(500);
      const lit = await litShare(page, await page.locator('#view').screenshot());
      levels.push({ level: scene.id, lit: Number(lit.toFixed(4)) });
      if (lit < .02) fail.push(`${scene.id}: the canvas looks blank (${(lit * 100).toFixed(1)}% lit pixels)`);
    }

    // Frame intervals on the first level, for information.
    phase = 'frames';
    await page.evaluate(async () => { await grx.show({ scene: 0, mode: 'light' }, { scroll: false }); grx.settle(); grx.built[0].setMotion?.(true); });
    const intervals = await page.evaluate(() => new Promise(resolve => { const v = []; let last = performance.now(), n = 0; const tick = now => { if (n++ > 6) v.push(now - last); last = now; if (v.length >= 90) resolve(v); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); }));
    intervals.sort((a, b) => a - b);
    const frames = { p50: intervals[45], p95: intervals[85], max: intervals.at(-1), samples: intervals.length };

    // Context loss and restore: the message appears, then the view recovers.
    phase = 'context loss';
    const lost = await page.evaluate(async () => {
      const gl = grx.renderer().getContext(), ext = gl.getExtension('WEBGL_lose_context');
      if (!ext) return { supported: false };
      ext.loseContext(); await new Promise(r => setTimeout(r, 400));
      const shown = !document.getElementById('stage-error').hidden;
      ext.restoreContext(); await new Promise(r => setTimeout(r, 1500));
      const cleared = document.getElementById('stage-error').hidden;
      return { supported: true, shown, cleared };
    });
    if (lost.supported && !lost.shown) fail.push('context loss did not show the message');
    if (lost.supported && !lost.cleared) fail.push('the message stayed after the context was restored');
    if (lost.supported && lost.cleared) {
      const lit = await litShare(page, await page.locator('#view').screenshot());
      if (lit < .02) fail.push('the canvas stayed blank after the context was restored');
    }
    if (errors.length) fail.push(...errors.map(e => `page error: ${e}`));
    return { id, label: profile.label, engine: browser.version(), ...renderer, date: new Date().toISOString(), url: BASE, pages, levels, frames, contextLoss: lost, failures: fail };
  } finally { await browser.close(); }
}

const results = [];
for (const id of requested) {
  try { results.push(await runProfile(id)); } catch (error) { results.push({ id, label: PROFILES[id].label, failures: [error.stack || String(error)], levels: [], pages: [] }); }
}
fs.mkdirSync('.local/gates', { recursive: true });
for (const r of results) fs.writeFileSync(`.local/gates/cross-browser-${r.id}.json`, JSON.stringify(r, null, 2));

const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
const f1 = v => v === undefined ? 'n/a' : v.toFixed(1);
let md = `# Other-engine smoke run\n\nProduced by \`node tools/cross-browser.mjs\` on ${date}. The budget, layout and interaction gates run in Chrome on one GPU. This run loads every page in WebKit (the iOS and Safari engine) and Firefox, reaches all ten explorer levels, checks that each canvas is drawn, and loses then restores the WebGL context. Frame intervals are recorded, not budgeted: headless WebKit and Firefox on this machine do not report a real device, and the figures say nothing about a phone.\n\n| Profile | Engine | WebGL | Renderer string | Pages without errors | Levels drawn | Frame p50 / p95 (ms) | Context loss and restore | Result |\n|---|---|---|---|---|---|---|---|---|\n`;
for (const r of results) {
  if (!r.engine) { md += `| ${r.label} | n/a | n/a | n/a | n/a | n/a | n/a | n/a | Not run: ${r.failures[0]?.split('\n')[0]} |\n`; continue; }
  md += `| ${r.label} | ${r.engine} | ${r.version} | ${r.gpu} | ${r.pages.length + 1} of ${PAGES.length} | ${r.levels.filter(l => l.lit >= .02).length} of ${r.levels.length} | ${f1(r.frames.p50)} / ${f1(r.frames.p95)} | ${r.contextLoss.supported ? (r.contextLoss.shown && r.contextLoss.cleared ? 'message shown, then recovered' : 'failed') : 'extension unavailable'} | ${r.failures.length ? 'FAIL' : 'PASS'} |\n`;
}
fs.writeFileSync('research/cross-browser.md', md);
let failed = 0;
for (const r of results) {
  console.log(`${r.failures.length ? 'FAIL' : 'PASS'}: ${r.id}, ${r.failures.length} problems`);
  for (const f of r.failures) { console.error(f); failed++; }
}
process.exitCode = failed ? 1 : 0;
