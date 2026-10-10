// Proof that a refactor changed nothing the reader can see.
//   node tools/kit-parity.mjs capture <outDir>      screenshots + computed-style dumps from GR_URL
//   node tools/kit-parity.mjs diff <dirA> <dirB>    pixel and computed-style comparison; exit 1 over threshold
// Poses are fixed: every static page at 360 and 1440 px; every visualizer scene in all three layers at the scene's
// own framing, in a rotated pose, and with its first part selected. Transitions are instant, motion is reduced,
// fonts are blocked (so a flaky network cannot move text), and the canvas is read after two frames.
// Threshold (see PIXEL_TOLERANCE and MAX_DIFF_FRACTION): a pixel differs when any channel moves by more than
// 2/255; a capture passes when under 0.1% of its pixels differ.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.GR_URL || 'http://127.0.0.1:41391/';
export const PIXEL_TOLERANCE = 2, MAX_DIFF_FRACTION = 0.001;
const PAGES = ['index', 'evidence', 'glossary', 'method', 'parts'];
const WIDTHS = [[360, 800], [1440, 900]];
const MODES = ['light', 'data', 'heat'];
const MAX_SHOT_HEIGHT = 9000;

const launch = () => chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
async function newPage(browser, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, route => route.abort());
  await context.addInitScript(() => localStorage.setItem('grx-mission-visited-v1', '1'));
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  return page;
}

// Computed style of every distinct tag+class signature (two instances each), all properties.
const styleDump = () => {
  const groups = new Map(), out = {};
  for (const el of document.querySelectorAll('body, body *')) {
    const sig = `${el.tagName.toLowerCase()}.${[...el.classList].sort().join('.')}${el.hidden ? '[hidden]' : ''}`;
    const n = groups.get(sig) || 0;
    if (n >= 2) continue;
    groups.set(sig, n + 1);
    const style = getComputedStyle(el), props = {};
    for (const name of style) props[name] = style.getPropertyValue(name);
    out[`${sig}#${n}`] = props;
  }
  return out;
};

async function shot(page, file, fullPage) {
  await page.mouse.move(1, 1);   // a pointer parked over a pin leaves its scale transition mid-flight
  await page.waitForTimeout(500);
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  if (fullPage) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot({ path: file, fullPage: true, clip: { x: 0, y: 0, width: page.viewportSize().width, height: Math.min(height, MAX_SHOT_HEIGHT) } });
  } else await page.screenshot({ path: file });
}

async function capture(out) {
  fs.mkdirSync(out, { recursive: true });
  const browser = await launch(), index = { base: BASE, shots: [], styles: [], errors: [] };
  try {
    for (const [width, height] of WIDTHS) {
      const page = await newPage(browser, width, height);
      for (const name of PAGES) {
        await page.goto(new URL(`${name}.html`, BASE).href, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(400);
        const id = `page-${name}-${width}`;
        await shot(page, path.join(out, `${id}.png`), true);
        fs.writeFileSync(path.join(out, `${id}.style.json`), JSON.stringify(await page.evaluate(styleDump)));
        index.shots.push(`${id}.png`); index.styles.push(`${id}.style.json`);
      }
      await page.goto(new URL('visualizer.html', BASE).href);
      await page.waitForFunction(() => window.grx?.built[window.grx.state.scene], null, { timeout: 90000 });
      await page.evaluate(() => { grx.setTransitions('instant'); grx.setSceneActivity?.(false); grx.settle(); });
      const scenes = await page.evaluate(() => grx.store.C.SCENES.map((s, i) => ({ i, id: s.id })));
      for (const { i, id: sceneId } of scenes) {
        for (const mode of MODES) {
          const tag = `viz-${String(i).padStart(2, '0')}-${sceneId}-${mode}-${width}`;
          const ready = await page.evaluate(async view => { await grx.show(view, { scroll: false }); grx.setSceneActivity?.(false); grx.settle(); return true; }, { scene: i, mode, part: null }).catch(e => String(e));
          if (ready !== true) { index.errors.push(`${tag}: ${ready}`); continue; }
          await page.waitForTimeout(250);
          await shot(page, path.join(out, `${tag}-default.png`), false); index.shots.push(`${tag}-default.png`);
          if (mode === 'light') {
            fs.writeFileSync(path.join(out, `${tag}.style.json`), JSON.stringify(await page.evaluate(styleDump))); index.styles.push(`${tag}.style.json`);
            await page.evaluate(() => { const c = grx.controls, cam = grx.camera, t = c.target; cam.position.sub(t).applyAxisAngle(cam.up, 0.7).add(t); c.update(); grx.settle(); });
            await page.waitForTimeout(150);
            await shot(page, path.join(out, `${tag}-rotated.png`), false); index.shots.push(`${tag}-rotated.png`);
            const part = await page.evaluate(sceneIndex => grx.store.C.PARTS?.[grx.store.C.SCENES[sceneIndex].id]?.[0]?.id ?? null, i);
            if (part) {
              const picked = await page.evaluate(async view => { await grx.show(view, { scroll: false }); grx.settle(); return true; }, { scene: i, mode, part }).catch(e => String(e));
              if (picked === true) { await page.waitForTimeout(250); await shot(page, path.join(out, `${tag}-part.png`), false); index.shots.push(`${tag}-part.png`); }
            }
          }
        }
      }
      index.errors.push(...page.errors.map(e => `${width}: ${e}`));
      await page.context().close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
  console.log(`captured ${index.shots.length} screenshots and ${index.styles.length} style dumps in ${out}; ${index.errors.length} errors`);
  for (const e of index.errors) console.error(e);
  if (index.errors.length) process.exitCode = 1;
}

async function diff(a, b) {
  const A = JSON.parse(fs.readFileSync(path.join(a, 'index.json'), 'utf8')), B = JSON.parse(fs.readFileSync(path.join(b, 'index.json'), 'utf8'));
  const browser = await chromium.launch({ headless: true }), page = await browser.newPage(), rows = [];
  const missing = [...A.shots.filter(s => !B.shots.includes(s)), ...B.shots.filter(s => !A.shots.includes(s))];
  try {
    for (const name of A.shots.filter(s => B.shots.includes(s))) {
      const urls = [a, b].map(d => `data:image/png;base64,${fs.readFileSync(path.join(d, name)).toString('base64')}`);
      const result = await page.evaluate(async ([u1, u2, tol]) => {
        const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
        const [i1, i2] = await Promise.all([load(u1), load(u2)]);
        if (i1.width !== i2.width || i1.height !== i2.height) return { size: [i1.width, i1.height, i2.width, i2.height] };
        const read = i => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const g = c.getContext('2d'); g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
        const d1 = read(i1), d2 = read(i2); let bad = 0, max = 0;
        for (let p = 0; p < d1.length; p += 4) {
          const m = Math.max(Math.abs(d1[p] - d2[p]), Math.abs(d1[p + 1] - d2[p + 1]), Math.abs(d1[p + 2] - d2[p + 2]));
          if (m > max) max = m;
          if (m > tol) bad++;
        }
        return { pixels: i1.width * i1.height, bad, max };
      }, [urls[0], urls[1], PIXEL_TOLERANCE]);
      rows.push({ name, ...result, fraction: result.size ? 1 : result.bad / result.pixels });
    }
  } finally { await browser.close(); }
  const styleRows = [];
  for (const name of A.styles.filter(s => B.styles.includes(s))) {
    const x = JSON.parse(fs.readFileSync(path.join(a, name), 'utf8')), y = JSON.parse(fs.readFileSync(path.join(b, name), 'utf8')), diffs = [];
    for (const sig of new Set([...Object.keys(x), ...Object.keys(y)])) {
      if (!x[sig] || !y[sig]) { diffs.push(`${sig}: only in ${x[sig] ? 'A' : 'B'}`); continue; }
      for (const prop of new Set([...Object.keys(x[sig]), ...Object.keys(y[sig])])) if (x[sig][prop] !== y[sig][prop]) diffs.push(`${sig} ${prop}: ${x[sig][prop]} -> ${y[sig][prop]}`);
    }
    styleRows.push({ name, signatures: Object.keys(x).length, diffs: diffs.length, sample: diffs.slice(0, 5) });
  }
  const worst = rows.reduce((m, r) => Math.max(m, r.fraction), 0), over = rows.filter(r => r.fraction >= MAX_DIFF_FRACTION), styleBad = styleRows.filter(r => r.diffs);
  const summary = { a, b, threshold: `${(MAX_DIFF_FRACTION * 100).toFixed(1)}% of pixels differing by more than ${PIXEL_TOLERANCE}/255`, screenshots: rows.length, worstFraction: worst, over: over.map(r => r.name), missing, styleDumps: styleRows.length, styleSignatures: styleRows.reduce((n, r) => n + r.signatures, 0), styleDifferences: styleBad.map(r => ({ name: r.name, diffs: r.diffs, sample: r.sample })), rows };
  fs.writeFileSync(path.join(b, `diff-vs-${path.basename(a)}.json`), JSON.stringify(summary, null, 1));
  console.log(`${rows.length} screenshots compared; worst ${(worst * 100).toFixed(4)}% differing (max channel step ${rows.reduce((m, r) => Math.max(m, r.max || 0), 0)}); ${over.length} over threshold; ${missing.length} unmatched; ${styleRows.length} style dumps, ${styleBad.length} with differences`);
  for (const r of over) console.error(`OVER ${r.name}: ${(r.fraction * 100).toFixed(3)}%`);
  for (const r of styleBad) console.error(`STYLE ${r.name}: ${r.diffs} differences, e.g. ${r.sample[0]}`);
  process.exitCode = over.length || missing.length || styleBad.length ? 1 : 0;
}

const [cmd, one, two] = process.argv.slice(2);
if (cmd === 'capture' && one) await capture(one);
else if (cmd === 'diff' && one && two) await diff(one, two);
else { console.error('usage: kit-parity.mjs capture <dir> | diff <dirA> <dirB>'); process.exitCode = 2; }
