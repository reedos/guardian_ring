// Supporting-page gate against an already built preview. Run separately from other GPU gates.
// GR_URL may point to a subpath mount. This tool never opens external source websites.
import { chromium } from 'playwright';
import fs from 'node:fs';

const base = (process.env.GR_URL || 'http://127.0.0.1:47601/').replace(/\/?$/, '/');
const reports = [];
fs.mkdirSync('.local/pages', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });

async function checkLinks(page, hrefs, failures) {
  const documents = new Map();
  for (const href of new Set(hrefs)) {
    const url = new URL(href, page.url());
    if (url.origin !== new URL(base).origin || !/^https?:$/.test(url.protocol)) continue;
    const hash = decodeURIComponent(url.hash.slice(1));
    url.hash = '';
    const address = url.href;
    if (!documents.has(address)) {
      const response = await page.request.get(address);
      if (!response.ok()) { failures.push(`Broken local link ${href}: HTTP ${response.status()}`); continue; }
      const html = await response.text();
      const ids = await page.evaluate(text => [...new DOMParser().parseFromString(text, 'text/html').querySelectorAll('[id]')].map(el => el.id), html);
      documents.set(address, new Set(ids));
    }
    if (hash && !documents.get(address)?.has(hash)) failures.push(`Missing destination anchor: ${href}`);
  }
}

async function checkRetainedScenario(page, failures) {
  // Expected values are independently rounded reference cases, not read from
  // the displayed register or its source dialog. This catches two stale views
  // agreeing with one another as well as a mismatched row and popup.
  const cases = [
    { query: { orbit: 'leo' }, summary: 'LEO · Representative · MWIR · HgCdTe',
      values: { 'model:lightTimeSeconds': '0.0033 s', 'model:altitudeKm': '1000 km',
        'card:data:orbits:downlink:0': '0.0033 s', 'card:data:orbits:downlink:1': '1000 km' },
      altitudeLabel: 'Teaching circular altitude', absent: [] },
    { query: { orbit: 'heo', aperture: 'civil', band: 'lwir', detector: 'qwip' }, summary: 'HEO · Civil twin · LWIR · QWIP',
      values: { 'model:lightTimeSeconds': '0.1313 s', 'model:altitudeKm': '39361 km',
        'model:orbitPeriodSeconds': '11.967 h', 'model:wavelengthMicrometers': '10.0 μm',
        'card:data:orbits:downlink:0': '0.1313 s', 'card:data:orbits:downlink:1': '39361 km' },
      altitudeLabel: 'Teaching altitude at apogee', absent: ['model:apertureDiameterM', 'model:diffractionRadians'] },
  ];
  const phrase = 'one-way vacuum light time';
  const retained = (expected, where) => {
    const query = new URL(page.url()).searchParams;
    for (const [key, value] of Object.entries(expected)) if (query.get(key) !== value) failures.push(`${where}: lost ${key}=${value}`);
  };
  for (const sample of cases) {
    const url = new URL('evidence.html', base);
    for (const [key, value] of Object.entries(sample.query)) url.searchParams.set(key, value);
    url.searchParams.set('q', phrase); url.hash = 'claims-heading';
    await page.goto(url.href);
    await page.locator('#claim-register[data-scenario-view="current"]').waitFor();
    const expectedHeading = `Current teaching choices: ${sample.summary}`;
    if (await page.locator('#claim-scenario').textContent() !== expectedHeading) failures.push(`${sample.summary}: scenario heading does not match the normalized choices`);
    if (await page.locator('#claim-search').inputValue() !== phrase || !await page.locator('[data-claim-key="model:lightTimeSeconds"]').isVisible()) failures.push(`${sample.summary}: retained search was not applied after hydration`);
    retained({ ...sample.query, q: phrase }, `${sample.summary} initial query`);
    await page.locator('#claim-search').fill('');
    retained(sample.query, `${sample.summary} cleared search`);
    if (await page.locator('[data-claim-key="model:altitudeKm"] h3').textContent() !== sample.altitudeLabel) failures.push(`${sample.summary}: stale altitude label`);
    for (const key of sample.absent) {
      if (await page.locator(`[data-claim-key="${key}"], button[data-src="${key}"]`).count()) failures.push(`${sample.summary}: unavailable claim still has a row or chip: ${key}`);
    }
    for (const [key, expected] of Object.entries(sample.values)) {
      const row = page.locator(`[data-claim-key="${key}"]`);
      const value = (await row.locator('.claim-value').textContent()).trim();
      if (value !== expected) failures.push(`${sample.summary}: ${key} expected ${expected}, displayed ${value}`);
      await page.evaluate(id=>{location.hash=id;}, await row.getAttribute('id'));
      await row.locator('button[data-src]').click();
      const pop = page.locator('#src-pop'); await pop.waitFor({ state: 'visible' });
      const popupValue = (await pop.locator('.sp-claim b').textContent()).trim();
      if (popupValue !== value) failures.push(`${sample.summary}: ${key} row ${value} differs from popup ${popupValue}`);
      if (/Not traced|undefined/.test(await pop.textContent())) failures.push(`${sample.summary}: untraced popup ${key}`);
      await page.keyboard.press('Escape');
    }
    // Search and both directions of an actual formula navigation retain every
    // scenario parameter; back navigation must hydrate the same rows again.
    await page.locator('#claim-search').fill(phrase);
    await page.locator('button[data-src="model:lightTimeSeconds"]').click();
    await page.locator('#src-pop a[href*="#calc-vacuum-light-time"]').first().click();
    retained({ ...sample.query, q: phrase }, `${sample.summary} formula navigation`);
    if (new URL(page.url()).hash !== '#calc-vacuum-light-time') failures.push(`${sample.summary}: formula destination changed`);
    await page.goBack();
    await page.locator('#claim-register[data-scenario-view="current"]').waitFor();
    retained({ ...sample.query, q: phrase }, `${sample.summary} back navigation`);
    if ((await page.locator('[data-claim-key="model:lightTimeSeconds"] .claim-value').textContent()).trim() !== sample.values['model:lightTimeSeconds']) failures.push(`${sample.summary}: back navigation restored stale values`);
    await page.keyboard.press('Escape');
  }
  await page.goto(new URL('evidence.html', base).href);
  await page.locator('#claim-register[data-scenario-view="current"]').waitFor();
}

async function checkStaticSnapshot(viewport, failures) {
  const context = await browser.newContext({ viewport, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const url = new URL('evidence.html?orbit=heo&aperture=civil&band=lwir&detector=qwip', base);
    await page.goto(url.href);
    if (!await page.locator('#claim-register[data-scenario-view="default"]').count()) failures.push('No-JS page lost its static default register');
    if (!(await page.locator('#claim-scenario').textContent()).includes('Default teaching choices: GEO · Representative · MWIR · HgCdTe')) failures.push('No-JS register is not clearly labeled as the default snapshot');
    if ((await page.locator('[data-claim-key="model:lightTimeSeconds"] .claim-value').textContent()).trim() !== '0.1194 s') failures.push('No-JS default light-time claim is missing or changed');
    if (!await page.locator('[data-claim-key="model:apertureDiameterM"]').count()) failures.push('No-JS default aperture claim is missing');
    if (new URL(page.url()).search !== url.search) failures.push('No-JS visit changed the requested query');
  } finally { await context.close(); }
}

try {
  for (const [form, width, height] of [['desktop', 1440, 1000], ['phone', 390, 844]]) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1,
      isMobile: form === 'phone', hasTouch: form === 'phone' });
    try {
      for (const name of ['evidence', 'method', 'glossary', 'parts']) {
        const page = await context.newPage(), failures = [];
        const extraLinks = [];
        page.on('pageerror', error => failures.push(error.message));
        page.on('console', message => { if (message.type() === 'error') failures.push(message.text()); });
        const response = await page.goto(new URL(`${name}.html`, base).href);
        if (!response?.ok()) failures.push(`${name}: HTTP ${response?.status()}`);
        await page.evaluate(() => document.fonts.ready);
        if (await page.locator('h1').count() !== 1) failures.push('Expected one h1');
        if (await page.locator('meta[name="robots"]').getAttribute('content') !== 'index, follow') failures.push('Public page must allow indexing and following');
        if (await page.locator('nav[aria-label="Site"] a[aria-current="page"]').count() !== 1) failures.push('Missing active navigation item');
        const metadata = await page.evaluate(() => {
          const ids = [...document.querySelectorAll('[id]')].map(el => el.id);
          let jsonld;
          try { jsonld = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || ''); } catch { return { duplicateIds: [], jsonld: false }; }
          return { duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i), jsonld: jsonld['@type'] === 'WebPage' };
        });
        if (metadata.duplicateIds.length) failures.push(`Duplicate IDs: ${metadata.duplicateIds.join(', ')}`);
        if (!metadata.jsonld) failures.push('Invalid WebPage JSON-LD');

        let chips = 0;
        if (name === 'evidence') {
          await page.locator('#claim-register[data-scenario-view="current"]').waitFor();
          const rows = page.locator('[data-claim-key]');
          const total = await rows.count();
          if (!total) failures.push('Claim register is empty');
          if (!await page.locator('[data-claim-key^="model:"]').count()) failures.push('Model claims are missing');
          if (!await page.locator('[data-claim-key^="card:"]').count()) failures.push('Explorer card claims are missing');
          const search = page.locator('#claim-search');
          await search.fill('one-way vacuum light time');
          if (!await page.locator('[data-claim-key="model:lightTimeSeconds"]').isVisible()) failures.push('Model claim search did not find light time');
          if (new URL(page.url()).searchParams.get('q') !== 'one-way vacuum light time') failures.push('Claim query was not preserved in URL');
          await search.fill('no-such-guardian-claim');
          if (!await page.locator('#claim-empty').isVisible() || await page.locator('[data-claim-key]:visible').count()) failures.push('Claim empty state failed');
          await search.fill('');
          if (await page.locator('[data-claim-key]').count() !== total || await page.locator('[data-claim-group][open]').count()) failures.push('Clearing search must retain every claim and collapse the groups');
          const sourceSearch = page.locator('#source-search');
          await sourceSearch.fill('nist-codata-2022');
          if (await page.locator('[data-source-key]:visible').count() !== 1) failures.push('Source search did not isolate NIST constants');
          await sourceSearch.fill('no-such-guardian-source');
          if (!await page.locator('#source-empty').isVisible()) failures.push('Source empty state failed');
          await sourceSearch.fill('');

          const claimChips = await page.locator('button[data-src]').all();
          chips = claimChips.length;
          for (const chip of claimChips) {
            const key = await chip.getAttribute('data-src');
            await page.evaluate(id=>{location.hash=id;},await chip.evaluate(el=>el.closest('[data-claim-key]').id));
            await chip.scrollIntoViewIfNeeded();
            await chip.click();
            const pop = page.locator('#src-pop');
            await pop.waitFor({ state: 'visible' });
            const text = await pop.innerText();
            if (/Not traced|unknown calculation|unknown assumption|undefined/.test(text)) failures.push(`Untraced source dialog: ${key}`);
            // Inspect the evidence record, not text-transform-dependent rendered headings.
            if (key === 'model:lightTimeSeconds') {
              const formula = pop.locator('[data-calc="vacuum-light-time"]');
              if (!await formula.count() || !(await formula.textContent()).includes('t = d/c') || !await formula.locator('a[href*="#calc-vacuum-light-time"]').count()) failures.push('Model Calc. dialog has no formula or method link');
            }
            if (key === 'model:apertureDiameterM') {
              const assumption = pop.locator('[data-assume="model-lab-aperture"]');
              if (!await assumption.count() || !(await assumption.textContent()).includes('0.30 m') || !await assumption.locator('a[href*="#assume-model-lab-aperture"]').count()) failures.push('Model Assumed dialog has no assumption or method link');
            }
            const scroll = await pop.evaluate(el => ({ max: el.scrollHeight - el.clientHeight, initial: el.scrollTop }));
            if (scroll.initial > 1) failures.push(`Source dialog did not start at its heading: ${key}`);
            if (scroll.max > 1) {
              await pop.evaluate(el => { el.scrollTop = el.scrollHeight; });
              const bottom = await pop.evaluate(el => ({ position: el.scrollTop, max: el.scrollHeight - el.clientHeight }));
              if (Math.abs(bottom.position - bottom.max) > 1) failures.push(`Source dialog content cannot scroll to its end: ${key}`);
            }
            extraLinks.push(...await pop.locator('a[href]').evaluateAll(els => els.map(el => el.getAttribute('href'))));
            const box = await pop.boundingBox();
            if (!box || box.x < -1 || box.x + box.width > width + 1 || box.y < -1 || box.y + box.height > height + 1) failures.push(`Source dialog outside viewport: ${key}`);
            await page.keyboard.press('Escape');
            if (await pop.isVisible()) failures.push(`Escape failed to close source dialog: ${key}`);
          }
          // Follow the actual formula and assumption links exposed by model dialogs.
          for (const [key, hash] of [['model:lightTimeSeconds', '#calc-vacuum-light-time'], ['model:apertureDiameterM', '#assume-model-lab-aperture']]) {
            await page.evaluate(id=>{location.hash=id;}, `claim-${key}`);
            await page.locator(`button[data-src="${key}"]`).click();
            const destination = page.locator(`#src-pop a[href*="${hash}"]`).first();
            await destination.click();
            if (new URL(page.url()).hash !== hash || !await page.locator(hash).count()) failures.push(`Dialog link failed: ${hash}`);
            await page.goBack();
            await page.locator('#claim-search').waitFor();
            await page.keyboard.press('Escape');
          }
          await checkRetainedScenario(page, failures);
          await checkStaticSnapshot({ width, height }, failures);
        }
        if (name === 'method') {
          if (await page.locator('[id^="calc-"]').count() < 9) failures.push('Missing formula sections');
          if (await page.locator('[id^="assume-"]').count() < 6) failures.push('Missing assumption sections');
        }
        if (name === 'glossary' && await page.locator('[id^="term-"]').count() < 30) failures.push('Glossary is incomplete');
        if (name === 'parts') {
          await page.locator('#parts-register[data-scenario-view="current"]').waitFor();
          const total=await page.locator('[data-part-entry]').count();
          if(total<50||await page.locator('[data-component-entry]').count()<150)failures.push('Component catalog is incomplete');
          if(await page.locator('[data-parts-level]').count()!==10)failures.push('Parts omits a level');
          const input=page.locator('#parts-search');
          await input.fill('encoder');
          if(!await page.locator('#parts-payload-scan-system').isVisible())failures.push('Encoder search did not find scan hardware');
          await page.locator('a[href="#parts-plume"]').first().click();
          if(!await page.locator('#parts-plume').isVisible()||await input.inputValue()!==''||new URL(page.url()).searchParams.has('q'))failures.push('Parts chapter link did not reveal its search-hidden destination');
          await input.fill('encoder');
          await page.locator('.parts-schematics').evaluate(el=>{el.open=true;});
          await page.locator('.system-diagram a[href="#parts-satellite-solar-array"]').first().click();
          if(!await page.locator('#parts-satellite-solar-array').isVisible()||await input.inputValue()!==''||new URL(page.url()).searchParams.has('q'))failures.push('System diagram link did not reveal its search-hidden component');
          await page.locator('.parts-schematics').evaluate(el=>{el.open=false;});
          await input.fill('no-such-guardian-component');
          if(!await page.locator('#parts-empty').isVisible()||await page.locator('[data-part-entry]:visible').count())failures.push('Parts empty state failed');
          await input.fill('');
          if(await page.locator('[data-part-entry]:visible').count()!==total)failures.push('Clearing Parts search lost assemblies');
          await page.locator('.parts-schematics>summary').click();
          if(await page.locator('.system-diagram').count()!==3)failures.push('Expected three sourced system diagrams');
          const keys=[...new Set(await page.locator('.system-diagram button[data-src], #parts-satellite-computer button[data-src], #parts-payload-calibration button[data-src], #parts-tirs2-arrays button[data-src]').evaluateAll(els=>els.map(el=>el.dataset.src)))];
          for(const key of keys) {
            const button=page.locator(`button[data-src="${key}"]`).first();
            await button.evaluate(el=>{for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;});
            await button.click();
            const pop=page.locator('#src-pop');await pop.waitFor({state:'visible'});
            if(/Not traced|undefined|unknown calculation|unknown assumption/.test(await pop.textContent()))failures.push(`Untraced Parts dialog ${key}`);
            await page.keyboard.press('Escape');chips++;
          }
          const nojs=await browser.newContext({viewport:{width,height},javaScriptEnabled:false});
          const staticPage=await nojs.newPage();await staticPage.goto(new URL('parts.html',base).href);
          if(await staticPage.locator('[data-part-entry]').count()!==total||await staticPage.locator('.part-evidence-link').count()<500)failures.push('Parts is incomplete without JavaScript');
          await nojs.close();
          // Native deep links carry exact numeric scene/layer/part identities.
          const links=await page.locator('.part-open').evaluateAll(els=>els.map(el=>new URL(el.href).searchParams.get('view')));
          if(links.some(view=>!/^\d\.(light|data|heat)\.[a-z0-9-]+$/.test(view||'')))failures.push('Invalid Parts visualizer deep link');
          await page.locator('.parts-schematics').evaluate(el=>{el.open=false;});
        }

        const hrefs = await page.locator('main a[href]').evaluateAll(els => els.map(el => el.getAttribute('href')));
        await checkLinks(page, [...hrefs, ...extraLinks], failures);
        const layout = await page.evaluate(() => ({
          overflowing: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
          offenders: [...document.querySelectorAll('main article, main section, main input')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).map(el => el.id || el.className),
        }));
        if (layout.overflowing) failures.push(`Horizontal overflow: ${layout.offenders.join(', ')}`);
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
        await page.screenshot({ path: `.local/pages/${name}-${form}.png`, fullPage: !['evidence','parts'].includes(name) });
        reports.push({ page: name, form, url: page.url(), status: failures.length ? 'FAIL' : 'PASS', chips, failures });
        console.log(JSON.stringify(reports.at(-1)));
        await page.close();
      }
    } finally { await context.close(); }
  }
} finally {
  await browser.close();
  fs.writeFileSync('.local/pages/results.json', JSON.stringify(reports, null, 2));
}
if (reports.some(report => report.failures.length)) process.exitCode = 1;
