// Regressions from the whole-project UX review. Run serially against a built
// preview; these checks use real controls and retain gate-common's GPU rule.
import fs from 'node:fs';
import { BASE, openGate, finish } from './gate-common.mjs';

const form = process.argv[2] || 'desktop';
const gate = await openGate('project-audit', form);
if (gate) {
  const { page } = gate, failures = [], cases = [];
  let states = 0;
  const check = (ok, message) => { states++; if (!ok) failures.push(message); };
  const frames = surface => surface.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const run = async (name, work) => {
    const before = failures.length;
    try { await work(); } catch (error) { failures.push(`${name}: ${error.stack || error}`); }
    cases.push({ name, status: failures.length === before ? 'PASS' : 'FAIL' });
    console.log(`${name}: ${cases.at(-1).status}`);
  };
  const explorer = async () => {
    await page.goto(new URL('visualizer.html', BASE).href);
    await page.waitForFunction(() => window.grx?.built[grx.state.scene] && !grx.isBusy(), null, { timeout: 90000 });
    await page.evaluate(() => { grx.setTransitions('instant'); grx.settle(); });
  };
  const scene = async (id, part = null) => {
    await page.evaluate(async ({ id, part }) => {
      await grx.go(id, { record: false }); grx.setMode('light');
      if (part) grx.select(part);
      grx.built[grx.state.scene].setMotion?.(false); grx.settle();
    }, { id, part });
    await frames(page);
  };
  const navLink = async file => {
    const link = page.locator(`#topnav a[href*="${file}"]`);
    if (!await link.isVisible()) await page.locator('#menu-btn').click();
    return link;
  };
  const more = async () => {
    await page.locator('#more-btn').focus(); await page.keyboard.press('Enter');
    await page.locator('#more-menu').waitFor({ state: 'visible' });
  };
  const focusIs = id => page.evaluate(id => document.activeElement?.id === id, id);

  await run('ideal focus diagram: controls, source reading and reduced motion', async () => {
    await scene('payload','optics');
    const launch=page.locator('.focus-demo-open');await launch.click();
    await page.locator('#focus-demo').waitFor({state:'visible'});
    check(await page.evaluate(()=>grx.focusDemo.state().playing&&!grx.built[grx.state.scene].teaching.state().playing),'Focus example failed to start independently of the payload lesson');
    await page.locator('#focus-demo [data-focus="play"]').click();
    const held=await page.evaluate(()=>grx.focusDemo.state().progress);await page.waitForTimeout(150);
    check(await page.evaluate(p=>grx.focusDemo.state().progress===p,held),'Paused focusing diagram advanced');
    await page.locator('#focus-demo input').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');
    check(await page.evaluate(()=>Math.abs(grx.focusDemo.state().progress-.001)<1e-9&&!grx.focusDemo.state().playing),'Focus slider did not hold the requested pulse');
    await page.locator('#focus-demo [data-focus="step"]').click();
    check(await page.evaluate(()=>Math.abs(grx.focusDemo.state().progress-.141)<1e-9),'Focus pulse could not be stepped');
    await page.locator('#focus-demo [data-focus="side"]').click();
    check(await page.evaluate(()=>grx.focusDemo.state().pitch===0),'Focus side view did not provide a fixed cross-section');
    const angle=await page.evaluate(()=>grx.focusDemo.state().yaw);await page.locator('#focus-demo canvas').focus();await page.keyboard.press('ArrowRight');
    check(await page.evaluate(before=>grx.focusDemo.state().yaw>before,angle),'Keyboard cannot rotate the focusing diagram');
    await page.locator('#focus-demo [data-focus="play"]').click();await page.locator('#focus-demo summary').click();
    await frames(page);check(await page.evaluate(()=>!grx.focusDemo.state().playing),'Opening focus evidence did not pause the diagram');
    check(await page.locator('#focus-demo').evaluate(node=>node.scrollWidth<=node.clientWidth+1),'Focus diagram overflows horizontally');
    await page.keyboard.press('Escape');await frames(page);
    check(!await page.locator('#focus-demo').isVisible()&&await launch.evaluate(node=>node===document.activeElement),'Escape failed to close focusing example and return focus');
    await launch.click();await frames(page);check(await page.evaluate(()=>!grx.focusDemo.state().playing),'Reopening visible focus evidence restarted playback');
    await page.locator('#focus-demo summary').click();await frames(page);
    check(!await page.locator('#focus-demo details').evaluate(node=>node.open),'Reduced-motion fixture must have its evidence closed');
    await page.locator('#focus-demo [data-focus="close"]').click();
    await page.emulateMedia({reducedMotion:'reduce'});await launch.click();await frames(page);
    const reduced=await page.evaluate(()=>grx.focusDemo.state());await page.waitForTimeout(150);
    check(!reduced.playing&&await page.evaluate(p=>grx.focusDemo.state().progress===p,reduced.progress),'Reduced-motion focus diagram started moving without consent');
    await page.locator('#focus-demo [data-focus="close"]').click();await page.emulateMedia({reducedMotion:'no-preference'});
    await page.evaluate(()=>grx.setMode('data'));check(!await launch.isVisible(),'Ideal optical demonstration appears in a non-light layer');
    await page.evaluate(async()=>{await grx.mission.start();grx.mission.pause();for(let chapter=0;chapter<4;chapter++)await grx.mission.next();grx.settle();});
    await page.locator('[data-mission="focus"]').click();await frames(page);
    check(await page.evaluate(()=>grx.focusDemo.state().open&&grx.mission.state().active&&!grx.mission.state().playing),'Mission cannot open the focus example while preserving its chapter');
    await page.locator('#focus-demo [data-focus="close"]').click();
    check(await page.evaluate(()=>grx.mission.state().index===4&&!grx.mission.state().playing),'Closing the focus example lost the mission chapter or resumed without consent');
    await page.evaluate(()=>grx.mission.stop());
  });

  await run('keyboard tab switch while the viewer is hovered', async () => {
    await scene('satellite', 'instrument');
    const canvas = await page.locator('#gl').boundingBox();
    await page.mouse.move(canvas.x + canvas.width / 2, canvas.y + canvas.height / 2);
    await page.locator('#tab-parts').focus();
    check(await page.locator('#viewer').evaluate(node => node.matches(':hover')), 'Keyboard test did not establish viewer hover');
    await page.keyboard.press('ArrowRight'); await frames(page);
    check(await page.evaluate(() => grx.state.selected === 'instrument' && !document.getElementById('pane-scenario').hidden
      && document.activeElement.id === 'tab-scenario'), 'ArrowRight from Parts changed the selected component or failed to keep Scenario active');
    await page.keyboard.press('ArrowLeft'); await frames(page);
    check(await page.evaluate(() => grx.state.selected === 'instrument' && document.getElementById('pane-scenario').hidden
      && document.activeElement.id === 'tab-parts'), 'ArrowLeft from Scenario changed the selected component or failed to restore Parts');
  });

  await run('menu and presentation keyboard continuity', async () => {
    await scene('satellite', 'instrument');
    await more(); await page.locator('#inspector-toggle').focus(); await page.keyboard.press('Enter');
    await page.locator('#more-menu').waitFor({ state: 'hidden' });
    check(await focusIs('more-btn'), 'An ordinary More choice left focus in its hidden menu');
    await more(); await page.locator('#inspector-toggle').focus(); await page.keyboard.press('Enter');
    check(await page.locator('#inspector').isVisible(), 'Details could not be restored after a keyboard menu choice');
    for (const exit of ['Escape', 'button']) {
      await more(); await page.locator('#presentation-view').focus(); await page.keyboard.press('Enter');
      await page.locator('#presentation-exit').waitFor({ state: 'visible' });
      check(await focusIs('presentation-exit'), `Present did not focus its visible exit (${exit})`);
      if (exit === 'Escape') await page.keyboard.press('Escape');
      else await page.keyboard.press('Enter');
      check(await focusIs('more-btn') && !await page.locator('#presentation-exit').isVisible()
        && !await page.locator('body').evaluate(node => node.classList.contains('presentation-view')), `${exit} did not leave presentation with focus on More`);
    }
    if (form === 'phone') {
      await page.locator('#level-pick').focus(); await page.keyboard.press('Enter');
      await page.locator('#level-menu [data-level="2"]').focus(); await page.keyboard.press('Enter');
      await page.waitForFunction(() => grx.state.scene === 2 && !grx.isBusy());
      check(await focusIs('level-pick') && !await page.locator('#level-menu').isVisible(), 'Keyboard level choice did not return focus to the level picker');
    }
  });

  await run('repeated new-tab links use the latest scenario', async () => {
    for (const expected of [{ orbit: 'geo', band: 'mwir' }, { orbit: 'leo', band: 'lwir' }]) {
      await page.evaluate(async scenario => { await grx.setScenario(scenario); }, expected);
      const link = await navLink('evidence.html');
      const opened = page.context().waitForEvent('page');
      await link.click({ modifiers: ['Control'] });
      const popup = await opened;
      popup.on('pageerror', error => gate.errors.push(`New-tab Evidence: ${error.message}`));
      try {
        await popup.locator('#claim-register[data-scenario-view="current"]').waitFor();
        const query = new URL(popup.url()).searchParams;
        check(query.get('orbit') === expected.orbit && query.get('band') === expected.band,
          `Repeated Ctrl-click carried stale choices: expected ${JSON.stringify(expected)}, got ${query}`);
        check(await popup.locator('#claim-scenario').textContent().then(text => text.includes(expected.orbit.toUpperCase()) && text.includes(expected.band.toUpperCase())), 'New-tab Evidence did not hydrate the latest choices');
      } finally { await popup.close(); }
    }
  });

  await run('orbit families hide their pins and clear hidden selections', async () => {
    await scene('orbits');
    for (const id of ['geo', 'heo', 'meo', 'leo']) {
      const toggle = page.locator(`#orbit-controls [data-family="${id}"]`), pin = page.locator(`#pins .pin[data-id="${id}"]`);
      if (await toggle.getAttribute('aria-pressed') === 'true') await toggle.click();
      await frames(page);
      check(await pin.evaluate(node => node.hidden), `${id}: a hidden family retained a floating component pin`);
      await page.locator('#part-select').selectOption(id); await page.evaluate(() => grx.settle()); await frames(page);
      check(await page.evaluate(id => grx.state.selected === id && grx.built[0].families()[id], id)
        && await pin.isVisible() && await toggle.getAttribute('aria-pressed') === 'true', `${id}: selecting a hidden family did not reveal its spacecraft and pin`);
      await toggle.click(); await page.evaluate(() => grx.settle()); await frames(page);
      check(await page.evaluate(id => grx.state.selected === null && document.getElementById('part-select').value === ''
        && document.getElementById('card').hidden && !grx.built[0].families()[id], id)
        && await pin.evaluate(node => node.hidden), `${id}: hiding the selected family left a selected component without geometry`);
    }
    // Data/Heat labels can name equipment on GEO rather than the orbit family
    // itself. Hiding GEO must clear those dependent selections as well.
    for (const [mode, id] of [['data', 'processing'], ['data', 'downlink'], ['heat', 'sunlight'], ['heat', 'power'], ['heat', 'radiator']]) {
      await page.evaluate(async ({ mode, id }) => { await grx.show({ scene: 0, mode, part: id }); grx.settle(); }, { mode, id });
      await frames(page);
      check(await page.evaluate(id => grx.state.selected === id && grx.built[0].families().geo, id), `${mode}/${id}: test did not select visible GEO equipment`);
      check(await page.locator(`#pins .pin[data-id="${id}"]`).isVisible(), `${mode}/${id}: selected equipment lost its marker when its physical path was absent`);
      const unrelated=page.locator('#orbit-controls [data-family="heo"]');
      if(await unrelated.getAttribute('aria-pressed')!=='true')await unrelated.click();
      await unrelated.click();await frames(page);
      check(await page.evaluate(id=>grx.state.selected===id,id), `${mode}/${id}: hiding another family cleared the GEO selection`);
      await page.locator('#orbit-controls [data-family="geo"]').click(); await page.evaluate(() => grx.settle()); await frames(page);
      check(await page.evaluate(() => grx.state.selected === null && document.getElementById('part-select').value === ''
        && document.getElementById('card').hidden && !grx.built[0].families().geo), `${mode}/${id}: hiding GEO left a selected dependent component`);
      check(await page.locator(`#pins .pin[data-id="${id}"]`).evaluate(node => node.hidden), `${mode}/${id}: hidden GEO retained a dependent pin`);
    }
  });

  await run('blocked sunlight retains its selected solar-array marker', async () => {
    // GEO and its ground reference co-rotate, so this drawing's GEO downlink
    // does not acquire a changing Earth obstruction during a day. Sunlight
    // does change orientation and exercises the observed failure directly.
    for(const [mode,id,port] of [['heat','sunlight','solar']]){
      const pose=await page.evaluate(async({mode,id,port})=>{
        await grx.show({scene:0,mode,part:id});const b=grx.built[0];
        // Sample the drawing's ordinary motion function to choose a blocked
        // inspection pose. No visibility or path calculation is overridden.
        let time=performance.now()/1000;b.setMotion(true);b.update(time);
        for(let sample=0;sample<260&&b.isPartVisible(id);sample++)b.update(time+=.4);
        b.setMotion(false);grx.select(id);grx.settle();
        const node=b.heatHotspots.power.node.children.find(child=>child.userData.port===port);
        const hardware=node.getWorldPosition(new grx.THREE.Vector3());
        const spot=(mode==='heat'?b.heatHotspots:b.dataHotspots)[id];
        return {family:b.families().geo,pathVisible:b.isPartVisible(id),selectedVisible:b.isPartVisible(id,{selected:true}),anchorError:hardware.distanceTo(new grx.THREE.Vector3(...spot.pos))};
      },{mode,id,port});
      await frames(page);
      check(pose.family&&!pose.pathVisible, `${mode}/${id}: did not exercise an actually absent physical path`);
      check(pose.selectedVisible&&pose.anchorError<1e-6, `${mode}/${id}: selected marker did not fall back to its real component port`);
      check(await page.locator(`#pins .pin[data-id="${id}"]`).isVisible(), `${mode}/${id}: selected marker disappeared with the blocked path`);
    }
  });

  const sourceReveal = async (surface, context) => {
    await surface.locator('#claim-register[data-scenario-view="current"]').waitFor();
    const link = surface.locator('#claim-register a[href^="#source-"]').first();
    const target = await link.getAttribute('href');
    const label = await link.evaluate(node => node.closest('[data-claim-key]').querySelector('h3').textContent);
    await surface.locator('#claim-search').fill(label);
    const source = surface.locator(`[id="${target.slice(1)}"]`);
    for (const pass of ['first hash jump', 'same-hash repeat']) {
      await surface.locator('#source-search').fill('zzzz-no-source-for-project-audit');
      check(!await source.isVisible(), `${context}: source search did not hide the test destination`);
      const before = await surface.evaluate(() => performance.timeOrigin);
      await link.click(); await frames(surface);
      check(await source.isVisible() && await surface.locator('#source-search').inputValue() === '', `${context}: ${pass} did not reveal its source`);
      check(await surface.locator('#claim-search').inputValue() === label, `${context}: ${pass} discarded the independent claim search`);
      check(await surface.evaluate(() => location.hash) === target && await surface.evaluate(() => performance.timeOrigin) === before,
        `${context}: ${pass} reloaded the document or lost its fragment`);
      check(!await surface.locator('#source-empty').isVisible() && !/^0\b/.test(await surface.locator('#source-count').textContent()), `${context}: source count or empty-state did not recover`);
    }
  };

  await run('Evidence reveals an initially search-hidden claim', async () => {
    const url = new URL('evidence.html', BASE);
    url.searchParams.set('orbit', 'leo'); url.searchParams.set('q', 'zzzz-no-claim-for-project-audit'); url.hash = 'claim-model:lightTimeSeconds';
    await page.goto(url.href); await page.locator('#claim-register[data-scenario-view="current"]').waitFor(); await frames(page);
    check(await page.locator('[data-claim-key="model:lightTimeSeconds"]').isVisible()
      && await page.locator('#claim-search').inputValue() === '', 'Initial Evidence claim fragment stayed hidden by q');
    const query = new URL(page.url()).searchParams;
    check(!query.has('q') && query.get('orbit') === 'leo', 'Initial claim reveal failed to clear only its filter query');
    check(!await page.locator('#claim-empty').isVisible() && !/^0\b/.test(await page.locator('#claim-count').textContent()), 'Initial claim reveal left stale count/empty-state');
  });
  await run('Evidence source links reveal filtered destinations', async () => {
    await page.goto(new URL('evidence.html', BASE).href); await sourceReveal(page, 'Standalone Evidence');
  });
  await run('embedded Evidence preserves same-document filtered links', async () => {
    await explorer(); const link = await navLink('evidence.html'); await link.click();
    await page.locator('#page-sheet').waitFor({ state: 'visible' });
    const frame = await page.locator('#ps-frame').elementHandle().then(handle => handle.contentFrame());
    await sourceReveal(frame, 'Embedded Evidence');
    await page.locator('#page-sheet .ps-x').click();
    check(!await page.locator('#page-sheet').isVisible(), 'Embedded Evidence could not return to the explorer');
  });

  for (const file of ['evidence', 'parts']) await run(`${file} tolerates a malformed fragment`, async () => {
    await page.goto(new URL(`${file}.html#%E0%A4%A`, BASE).href);
    await page.locator(`#${file === 'evidence' ? 'claim' : 'parts'}-register[data-scenario-view="current"]`).waitFor(); await frames(page);
    const input = page.locator(file === 'evidence' ? '#claim-search' : '#parts-search');
    await input.fill(file === 'evidence' ? 'orbit' : 'encoder');
    const rows = page.locator(file === 'evidence' ? '[data-claim-key]:not([hidden])' : '[data-part-entry]:not([hidden])');
    check(await rows.count() > 0, `${file}: malformed fragment prevented filtering`);
    await page.evaluate(() => { location.hash = '%ZZ'; }); await frames(page);
    await input.fill('');
    check(await rows.count() > 0, `${file}: malformed hashchange broke the page`);
  });

  fs.mkdirSync('.local/project-audit', { recursive: true });
  try { await page.screenshot({ path: `.local/project-audit/${form}.png` }); }
  catch (error) { failures.push(`Final screenshot: ${error.message}`); }
  await finish(gate, failures, { states, cases });
}
