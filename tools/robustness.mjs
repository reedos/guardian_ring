// Forced-failure run: what a visitor sees when the explorer cannot get what it needs, captured on both forms.
//   1 loading     slow network: the veil shows the sentence and the byte progress
//   2 first-fail  every model request is refused: the first level shows its message and Try again, no uncaught error
//   3 retry       the network returns and Try again loads the level
//   4 later-fail  one later level's model is refused: the open level stays, with Try again and Stay actions
//   5 context     the WebGL context is lost and restored: message first, then the view draws again, console stays clean
//   6 no-webgl    WebGL turned off: the message, the six levels as text, and links to the pages that need no graphics
//   7 bad-link    an out-of-range view link opens the ring overview without errors
// Screenshots go to .local/robustness/<form>-<state>.png. Real GPU required, as for the other gates.
//   node tools/robustness.mjs [desktop|phone]     (GR_URL selects the preview)
import { chromium } from 'playwright';
import fs from 'node:fs';
import { BASE, finish } from './gate-common.mjs';

const form = process.argv[2] || 'desktop';
const pageOptions = form === 'phone' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const ARGS = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];
const OUT = '.local/robustness';
fs.mkdirSync(OUT, { recursive: true });
const fail = [], checked = [];
const check = (name, ok, why) => { checked.push(name); if (!ok) fail.push(`${name}: ${why}`); };
const url = new URL('visualizer.html', BASE).href;

async function open(browser, { throttle = false } = {}) {
  const page = await browser.newPage(pageOptions);
  page.setDefaultTimeout(30000);
  await page.addInitScript(() => localStorage.setItem('grx-mission-visited-v1', '1'));
  const problems = [];
  // Refused requests also log "Failed to load resource"; that line is the failure under test, not a defect.
  page.on('pageerror', e => problems.push(`uncaught: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) problems.push(`console: ${m.text()}`); if (m.type() === 'warning' && /^WebGL|THREE\.WebGLProgram/.test(m.text())) problems.push(`warning: ${m.text().slice(0, 140)}`); });
  if (throttle) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 30, downloadThroughput: 450 * 1024, uploadThroughput: 100000 });
  }
  return { page, problems };
}
const shot = (page, state) => page.screenshot({ path: `${OUT}/${form}-${state}.png` });
const visible = (page, selector) => page.locator(selector).evaluate(el => !el.hidden && el.checkVisibility()).catch(() => false);
const ready = page => page.waitForFunction(() => window.grx?.built[window.grx.state.scene] && !window.grx.isBusy(), null, { timeout: 60000 });
const noErrors = (name, problems) => check(name, problems.length === 0, problems.slice(0, 3).join(' | '));

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ARGS });
const gate = { browser, page: null, errors: [], scenes: [], gpu: 'unavailable', name: 'robustness', form };
try {
  // 1 loading
  {
    const { page, problems } = await open(browser, { throttle: true });
    await page.goto(url);
    await page.waitForFunction(() => document.querySelector('#veil .veil-bytes')?.textContent, null, { timeout: 60000 });
    await page.waitForTimeout(600);
    const veil = await page.locator('#veil').innerText();
    check('loading: sentence and byte progress', /\d+(\.\d)? (MB|kB)/.test(veil) && /Loading|Preparing/i.test(veil), `veil reads "${veil.replace(/\n/g, ' ')}"`);
    await shot(page, 'loading');
    await ready(page);
    check('loading: the level appears when the download finishes', await page.evaluate(() => document.getElementById('veil').hidden), 'veil stayed after load');
    noErrors('loading: no errors', problems);
    await page.close();
  }

  // 2 first-fail and 3 retry
  {
    const { page, problems } = await open(browser);
    let blocked = true;
    await page.route('**/models/*.glb*', route => blocked ? route.abort() : route.continue());
    await page.goto(url);
    await page.waitForSelector('#stage-error:not([hidden])');
    const text = await page.locator('#stage-error-t').innerText();
    check('first-fail: message names the level and the way out', /could not load/.test(text) && /story, evidence and method pages remain available/.test(text), `message "${text}"`);
    check('first-fail: Try again is offered and focused', await page.evaluate(() => document.activeElement?.textContent === 'Try again'), 'Try again is not focused');
    check('first-fail: veil says the viewer could not load', /could not load/i.test(await page.locator('#veil').innerText()), 'veil text');
    await shot(page, 'first-fail');
    // A click on another level while nothing is loaded must not become an uncaught rejection.
    await page.locator('#steps button').nth(2).click().catch(() => {});
    await page.waitForTimeout(800);
    noErrors('first-fail: no uncaught error, including a click on another level', problems);
    blocked = false;
    await page.locator('#stage-error-actions button', { hasText: 'Try again' }).click().catch(async () => { await page.locator('#steps button').nth(0).click(); });
    await ready(page);
    check('retry: the level loads once the network returns', await page.evaluate(() => !!grx.built[grx.state.scene]) && !await visible(page, '#stage-error'), 'level or message state');
    await shot(page, 'retry');
    noErrors('retry: no errors', problems);
    await page.close();
  }

  // 4 later-fail
  {
    const { page, problems } = await open(browser);
    let blocked = true;
    await page.goto(url);
    await ready(page);
    await page.route('**/models/payload.glb*', route => blocked ? route.abort() : route.continue());
    const before = await page.evaluate(() => grx.state.scene);
    await page.evaluate(() => { grx.go(2).catch(() => {}); });
    await page.waitForSelector('#stage-error:not([hidden])');
    const actions = await page.locator('#stage-error-actions button').allTextContents();
    check('later-fail: Try again and Stay actions', actions.includes('Try again') && actions.some(a => /^Stay on/.test(a)), `actions ${JSON.stringify(actions)}`);
    check('later-fail: the open level stays in place', await page.evaluate(() => grx.state.scene) === before && await page.evaluate(() => document.getElementById('veil').hidden), 'level changed or veil stayed');
    await shot(page, 'later-fail');
    blocked = false;
    await page.locator('#stage-error-actions button', { hasText: 'Try again' }).click();
    await page.waitForFunction(() => grx.state.scene === 2 && !grx.isBusy(), null, { timeout: 60000 });
    check('later-fail: Try again opens the level', await page.evaluate(() => grx.state.scene) === 2, 'level 3 did not open');
    noErrors('later-fail: no errors', problems);
    await page.close();
  }

  // 5 context loss and restore
  {
    const { page, problems } = await open(browser);
    await page.goto(url);
    await ready(page);
    const gpu = await page.evaluate(() => { const gl = grx.renderer().getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
    gate.gpu = gpu;
    if (/swiftshader|software|basic render|unknown/i.test(gpu)) throw new Error(`Real GPU required: ${gpu}`);
    console.log(`robustness/${form}: ${gpu}`);
    await page.evaluate(() => grx.setTransitions('instant'));
    await page.evaluate(() => { window.__ext = grx.renderer().getContext().getExtension('WEBGL_lose_context'); window.__ext.loseContext(); });
    await page.waitForSelector('#stage-error:not([hidden])');
    check('context: message and a reload action', /lost its graphics connection/.test(await page.locator('#stage-error-t').innerText()) && await page.locator('#stage-error-actions button', { hasText: 'Reload the page' }).count() === 1, 'message or action');
    await shot(page, 'context-lost');
    await page.evaluate(() => window.__ext.restoreContext());
    await page.waitForSelector('#stage-error', { state: 'hidden' });
    await page.waitForTimeout(800);
    const frames = await page.evaluate(() => new Promise(resolve => { let n = 0; const tick = () => { if (++n >= 20) resolve(n); else requestAnimationFrame(tick); }; requestAnimationFrame(tick); }));
    check('context: the view runs again after restore', frames === 20 && !await visible(page, '#stage-error'), 'message stayed or frames stopped');
    // Move to another level to prove the restored renderer still builds and draws scenes.
    await page.evaluate(async () => { await grx.show({ scene: 2, mode: 'light' }, { scroll: false }); grx.settle(); });
    await page.waitForTimeout(500);
    await shot(page, 'context-restored');
    noErrors('context: console stays clean through loss and restore', problems);
    await page.close();
  }

  // 7 bad link
  {
    const { page, problems } = await open(browser);
    await page.goto(new URL('visualizer.html?view=99.light.nope', BASE).href);
    await ready(page);
    check('bad-link: an out-of-range view opens a level', await page.evaluate(() => grx.state.scene >= 0 && grx.state.scene < grx.store.C.SCENES.length && grx.state.selected === null), 'no valid level');
    await shot(page, 'bad-link');
    noErrors('bad-link: no errors', problems);
    await page.close();
  }
} catch (error) { fail.push(error.stack || String(error)); }

// 6 no-webgl: a browser with 3D APIs off
try {
  const plain = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-3d-apis', '--disable-gpu'] });
  const { page, problems } = await open(plain);
  await page.goto(url);
  await page.waitForSelector('body.no-webgl', { timeout: 30000 });
  const text = await page.locator('#stage-error-t').innerText();
  check('no-webgl: message', /needs WebGL/.test(text), `message "${text}"`);
  const levels = await page.locator('#parts li').count();
  check('no-webgl: six levels listed as text', levels === 6, `${levels} listed`);
  const hrefs = await page.locator('#stage-error-actions a').evaluateAll(links => links.map(a => a.getAttribute('href')));
  check('no-webgl: links to story, evidence and method', ['index.html', 'evidence.html', 'method.html'].every(h => hrefs.includes(h)), `links ${JSON.stringify(hrefs)}`);
  await shot(page, 'no-webgl');
  noErrors('no-webgl: no errors', problems);
  await plain.close();
} catch (error) { fail.push(error.stack || String(error)); }

await finish(gate, fail, { states: checked.length, checks: checked });
