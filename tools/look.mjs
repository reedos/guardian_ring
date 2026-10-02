// Phase 2 checks against the built story page, including the actual Tailscale mount.
import { chromium } from 'playwright';
import fs from 'node:fs';
import { STORY_CLAIMS } from '../src/story-claims.js';

const base = process.env.GR_URL || 'http://127.0.0.1:47601/';
const reports = [];
fs.mkdirSync('.local/look', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  for (const [form, width, height] of [['desktop', 1440, 1000], ['phone', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: form === 'phone', hasTouch: form === 'phone' });
    const failures = [];
    page.on('pageerror', e => failures.push(e.message));
    page.on('console', m => { if (m.type() === 'error') failures.push(m.text()); });
    const response = await page.goto(base);
    if (!response.ok()) failures.push(`Story HTTP ${response.status()}`);
    await page.evaluate(() => document.fonts.ready);
    if (await page.locator('h1').count() !== 1) failures.push('Story needs one h1');
    if (!/noindex/.test(await page.locator('meta[name=robots]').getAttribute('content'))) failures.push('Missing noindex');
    const pictures = page.locator('picture img');
    if (await pictures.count() !== 6) failures.push('Expected six main-level stills');
    for (const img of await pictures.all()) {
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(el => el.decode());
      const info = await img.evaluate(el => ({ src: el.currentSrc, width: el.naturalWidth, alt: el.alt }));
      if (!info.width || !info.alt) failures.push(`Missing image or description: ${info.src}`);
      if (form === 'phone' && !info.src.includes('-phone.')) failures.push(`Phone image not selected: ${info.src}`);
    }
    const links = await page.locator('a[href]').evaluateAll(els => els.map(el => el.getAttribute('href')).filter(h => !/^(https?:|mailto:)/.test(h)));
    for (const href of new Set(links)) {
      const url = new URL(href, base);
      if (url.pathname === new URL(base).pathname && url.hash) {
        if (!await page.locator(`[id="${url.hash.slice(1)}"]`).count()) failures.push(`Missing anchor ${href}`);
      } else {
        const target = await page.request.get(url.href);
        if (!target.ok()) failures.push(`Broken link ${href}`);
        if (url.hash && !(await target.text()).includes(`id="${url.hash.slice(1)}"`)) failures.push(`Missing destination anchor ${href}`);
      }
    }
    const chips = page.locator('button[data-src]');
    const keys = new Set(await chips.evaluateAll(els => els.map(el => el.dataset.src)));
    for (const claim of STORY_CLAIMS) if (!keys.has(claim.key)) failures.push(`Missing story claim ${claim.key}`);
    for (const chip of await chips.all()) {
      await chip.scrollIntoViewIfNeeded();
      await chip.click();
      const pop = page.locator('#src-pop');
      await pop.waitFor({ state: 'visible' });
      const body = await pop.innerText();
      if (/Not traced|unknown|undefined/.test(body)) failures.push(`Untraced popover ${await chip.getAttribute('data-src')}`);
      const r = await pop.boundingBox();
      if (!r || r.x < -1 || r.x + r.width > width + 1 || r.y < -1 || r.y + r.height > height + 1) failures.push('Source popover outside viewport');
      await page.keyboard.press('Escape');
      if (await pop.isVisible()) failures.push('Escape did not close sources');
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) failures.push('Horizontal overflow');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    if (form === 'phone') {
      await page.locator('#menu-btn').click();
      // IF's menu has a visibility transition; inspect its settled open state.
      try { await page.locator('#topnav a').first().waitFor({ state: 'visible', timeout: 2000 }); }
      catch { failures.push('Phone menu did not become visible'); }
      if (!await page.locator('#topnav a').first().isVisible()) failures.push('Phone menu did not open');
      if (await page.locator('#menu-btn').getAttribute('aria-expanded') !== 'true') failures.push('Phone menu did not expose its expanded state');
      await page.keyboard.press('Escape');
      try { await page.locator('#topnav a').first().waitFor({ state: 'hidden', timeout: 2000 }); }
      catch { failures.push('Phone menu remained visible after Escape'); }
      if (await page.locator('#menu-btn').getAttribute('aria-expanded') !== 'false') failures.push('Phone menu did not close');
    }
    await page.screenshot({ path: `.local/look/story-${form}.png`, fullPage: true });
    await page.screenshot({ path: `.local/look/hero-${form}.png` });
    for (const id of ['satellite', 'payload', 'focal-plane', 'pixel', 'photon']) await page.locator(`#${id}`).screenshot({ path: `.local/look/${id}-${form}.png` });
    reports.push({ form, url: base, status: failures.length ? 'FAIL' : 'PASS', stills: await pictures.count(), chips: await chips.count(), failures });
    console.log(JSON.stringify(reports.at(-1)));
    await page.close();
  }
} finally { await browser.close(); }
fs.writeFileSync('.local/look/results.json', JSON.stringify(reports, null, 2));
if (reports.some(r => r.failures.length)) process.exitCode = 1;
