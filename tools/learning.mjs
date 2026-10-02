// Browser regressions for the guided journey and causal animation controls.
// Run against the built preview, one form at a time on the real GPU.
import { openGate, show, finish, MODES, BASE } from './gate-common.mjs';
import fs from 'node:fs';

const form = process.argv[2] || 'desktop';
const gate = await openGate('learning', form);
if (gate) {
  const { page, scenes } = gate, failures = [];
  let states = 0;
  const check = (condition, message) => { if (!condition) throw new Error(message); states++; };
  const sequence = () => page.evaluate(() => {
    const s = grx.built[grx.state.scene].teaching.state();
    return { index:s.index, progress:s.progress, playing:s.playing, inspection:s.inspection, title:s.step.title, total:s.total };
  });
  const frames = count => page.evaluate(n => new Promise(resolve => {
    function tick() { if (--n <= 0) resolve(); else requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  }), count);
  const action = name => page.locator(`#animation-controls [data-action="${name}"]`).click();
  try {
    for (const scene of scenes.filter(s => s.id !== 'orbits')) for (const mode of MODES) {
      await show(page, scene.i, mode);
      await action('play');
      await page.waitForFunction(() => grx.built[grx.state.scene].teaching.state().progress > .04);
      let s = await sequence();
      check(s.playing && !s.inspection, `${scene.id}/${mode}: sequence did not play`);
      check(await page.evaluate(() => grx.state.selected === null), `${scene.id}/${mode}: playback did not use overview`);
      await action('play');
      const paused = await sequence(); await frames(8); s = await sequence();
      check(!s.playing && s.progress === paused.progress, `${scene.id}/${mode}: pause drifted`);
      await action('next'); s = await sequence();
      check(s.index === (paused.index + 1) % s.total && !s.playing, `${scene.id}/${mode}: next step failed`);
      check(await page.locator('.animation-step').textContent() === s.title, `${scene.id}/${mode}: step title is stale`);
      await action('previous'); s = await sequence();
      check(s.index === paused.index, `${scene.id}/${mode}: previous step failed`);
      await action('reset'); s = await sequence();
      check(s.index === 0 && s.progress === 0 && !s.playing, `${scene.id}/${mode}: reset failed`);
    }

    // Animated hardware returns to the authored pose before part inspection.
    await show(page,'abi','light');
    await page.evaluate(() => { window.learningMirrorRest=grx.built[grx.state.scene].asset.getObjectByName('ABIScanNorthSouth').quaternion.toArray(); });
    await action('next');
    check(await page.evaluate(() => grx.built[grx.state.scene].asset.getObjectByName('ABIScanNorthSouth').quaternion.angleTo(new grx.THREE.Quaternion(...window.learningMirrorRest))>.01), 'ABI step did not move the authored mirror pivot');
    await page.locator('#part-select').selectOption('scan-system');
    check(await page.evaluate(() => grx.built[grx.state.scene].asset.getObjectByName('ABIScanNorthSouth').quaternion.angleTo(new grx.THREE.Quaternion(...window.learningMirrorRest))<1e-6), 'Part inspection did not restore stationary mirror geometry');

    // Pause holds an orbiter at its current position; its pin follows that node.
    await show(page,'orbits','light');
    if (!(await page.evaluate(() => grx.built[0].motion()))) await page.locator('#day-play').click();
    await page.evaluate(() => { window.learningOrbitStart=grx.built[0].hotspots.heo.node.position.toArray(); });
    await frames(12);
    check(await page.evaluate(() => grx.built[0].hotspots.heo.node.position.distanceTo(new grx.THREE.Vector3(...window.learningOrbitStart))>1e-5), 'Schematic HEO did not advance');
    await page.locator('#day-play').click();
    await page.evaluate(() => { window.learningOrbitPause=grx.built[0].hotspots.heo.node.position.toArray(); });
    await frames(8);
    check(await page.evaluate(() => !grx.built[0].motion() && grx.built[0].hotspots.heo.node.position.distanceTo(new grx.THREE.Vector3(...window.learningOrbitPause))===0), 'Pausing the day did not hold the current orbital pose');
    await page.locator('#part-select').selectOption('heo');
    check(await page.evaluate(() => { const spot=grx.built[0].hotspots.heo;return new grx.THREE.Vector3(...spot.pos).distanceTo(spot.node.getWorldPosition(new grx.THREE.Vector3()))<1e-6; }), 'Selected orbital pin no longer meets its moving spacecraft');

    // Reading a source temporarily holds playback, without changing user intent.
    await show(page, 'focal-plane', 'heat');
    for (let i=0; i<3; i++) await action('next');
    await page.locator('.animation-explanation').evaluate(node => { node.open = true; });
    // Open in the same task as Play so even a slow test host cannot consume the
    // remaining step before the source-reading suspension is exercised.
    await page.evaluate(async () => {
      document.querySelector('#animation-controls [data-action="play"]').click();
      await Promise.resolve();
      document.querySelector('.animation-evidence [data-src="learning:cooler-balance"]').click();
    });
    await frames(3); const held = await sequence(); await frames(8);
    check(held.playing && (await sequence()).progress === held.progress, 'Evidence dialog did not hold animation');
    check(await page.locator('#src-pop').innerText().then(t => !t.includes('Not traced')), 'Animation evidence is untraced');
    await page.locator('#src-pop .sp-x').click();
    await page.waitForFunction(p => grx.built[grx.state.scene].teaching.state().progress > p, held.progress);
    await action('play');
    await page.locator('.animation-evidence [data-src="learning:cooler-balance"]').click();
    await page.locator('#src-pop .sp-x').click();
    await frames(4);
    check(!(await sequence()).playing, 'Closing evidence overrode explicit pause');

    // A scenario edit updates calculations without discarding the inspected view.
    await show(page, 'payload', 'data');
    await page.locator('#part-select').selectOption({ index:3 });
    await page.evaluate(() => { grx.settle(); grx.pin(true); window.learningBefore = {
      scene:grx.built[grx.state.scene], selected:grx.state.selected, mode:grx.state.mode,
      camera:grx.camera.position.toArray(), target:grx.controls.target.toArray(), pinned:grx.store.pinned,
    }; });
    await page.locator('#tab-scenario').click();
    await page.locator('#scenario-adjust').evaluate(node => { node.open = true; });
    const choice = await page.evaluate(() => grx.store.scenario.orbit === 'leo' ? 'geo' : 'leo');
    await page.locator(`[data-choice="orbit"][data-value="${choice}"]`).click();
    check(await page.evaluate(() => {
      const old=window.learningBefore, built=grx.built[grx.state.scene];
      return built===old.scene && built.model===grx.store.M && grx.state.selected===old.selected && grx.state.mode===old.mode && grx.store.pinned===old.pinned && grx.camera.position.distanceTo(new grx.THREE.Vector3(...old.camera))<1e-6 && grx.controls.target.distanceTo(new grx.THREE.Vector3(...old.target))<1e-6 && document.querySelector('#tab-scenario').getAttribute('aria-selected')==='true';
    }), 'Scenario edit lost hardware/view/selection/comparison/pane context');
    await page.locator('#part-select').selectOption('');
    await page.evaluate(async () => { await grx.setScenario({detector:grx.store.scenario.detector==='qwip'?'hgcdte':'qwip'}); });
    check(await page.evaluate(() => grx.state.selected===null), 'Scenario edit lost overview');

    // Side visits form a stack and restore the originating selected component.
    await page.evaluate(async () => { await grx.go('payload'); grx.setMode('heat'); grx.select(grx.store.C.PARTS_HEAT.payload[2].id,false); grx.settle(); window.learningOrigin={scene:grx.state.scene,selected:grx.state.selected,mode:grx.state.mode}; await grx.go('abi'); await grx.go('atmosphere'); });
    await page.locator('#back-out').click();
    await page.waitForFunction(() => grx.store.C.SCENES[grx.state.scene].id==='abi' && !grx.isBusy());
    await page.locator('#back-out').click();
    await page.waitForFunction(() => grx.store.C.SCENES[grx.state.scene].id==='payload' && !grx.isBusy());
    check(await page.evaluate(() => Object.entries(window.learningOrigin).every(([k,v])=>grx.state[k]===v)), 'Nested side visit lost its origin');
    await page.locator('#learning-next').click();
    await page.waitForFunction(() => grx.store.C.SCENES[grx.state.scene].id==='focal-plane' && !grx.isBusy());
    check(true, 'Next level advances independently of part navigation');

    // Both real-world examples must expose a usable, traced primary-source link.
    for (const id of ['abi','tirs2']) {
      await show(page,id,'light');
      await page.locator('.learning-example summary').click();
      check(await page.locator('.learning-example a[href^="https://"]').count()>0, `${id}: real-world example lacks source link`);
      await page.locator('.learning-example [data-src]').first().click();
      check(!(await page.locator('#src-pop').innerText()).includes('Not traced'), `${id}: untraced application claim`);
      await page.locator('#src-pop .sp-x').click();
    }

    // Reduced-motion users start with a stable view and can deliberately step.
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(new URL('visualizer.html',BASE).href);
    await page.waitForFunction(() => window.grx?.built[0]);
    check(await page.evaluate(() => !grx.built[0].motion()), 'Reduced motion started orbit playback');
    await show(page,'pixel','light');
    check(!(await sequence()).playing, 'Reduced motion started the teaching sequence');
    await action('next'); check((await sequence()).index===1, 'Reduced motion blocked deliberate stepping');
    fs.mkdirSync('.local/learning',{recursive:true});
    await page.screenshot({path:`.local/learning/${form}.png`});
  } catch (error) {
    failures.push(error.stack || String(error));
    fs.mkdirSync('.local/learning',{recursive:true});
    await page.screenshot({path:`.local/learning/${form}-failure.png`}).catch(()=>{});
  }
  await finish(gate, failures, { states });
}
