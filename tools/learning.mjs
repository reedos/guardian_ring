// Browser regressions for the guided journey and causal animation controls.
// Run against the built preview, one form at a time on the real GPU.
import { openGate, show, finish, MODES, BASE } from './gate-common.mjs';
import { checkView, fly } from './gate-geometry.mjs';
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
  const assemblyAction = view => page.locator(`.assembly-controls [data-assembly-view="${view}"]`).click();
  const checkAssembly = async (wanted, context) => {
    const result = await page.evaluate(view => {
      const b=grx.built[grx.state.scene], state=b.presentation?.state(), bad=[];
      if(state?.view!==view)bad.push(`presentation is ${state?.view}`);
      for(const button of document.querySelectorAll('.assembly-controls [data-assembly-view]')) {
        if(button.getAttribute('aria-pressed')!==String(button.dataset.assemblyView===view))bad.push('enclosure button is stale');
      }
      const shown=object=>{for(let node=object;node;node=node.parent)if(!node.visible)return false;return true;};
      for(const assembly of state?.assemblies||[]) {
        const covers=new Set();
        b.asset.traverse(object=>{
          if(object.isMesh&&object.userData.assetRole===assembly.coverRole)covers.add(object);
          if(object.name===assembly.coverRole)object.traverse(child=>{if(child.isMesh)covers.add(child);});
        });
        if(!covers.size)bad.push(`${assembly.id}: missing physical cover`);
        for(const cover of covers)if(shown(cover)!==(view==='assembled'))bad.push(`${assembly.id}: incorrect cover visibility`);
      }
      return bad;
    },wanted);
    check(!result.length,`${context}: ${result.join('; ')}`);
  };
  try {
    // An explicit inspection starts with coordinated, closed assemblies.
    // Selecting an enclosed component reveals its parent before its detail view.
    await show(page,'payload','light');
    await checkAssembly('assembled','Payload default');
    const internalByMode={};
    for(const mode of MODES) {
      await show(page,'payload',mode);
      const catalog=await page.evaluate(()=>{
        const b=grx.built[grx.state.scene], C=grx.store.C;
        const parts=({light:C.PARTS,data:C.PARTS_DATA,heat:C.PARTS_HEAT})[grx.state.mode].payload;
        const enclosed=new Set(b.presentation.state().assemblies.flatMap(assembly=>assembly.partIds));
        const picker=document.getElementById('part-select'), bad=[];
        for(const [index,part] of parts.entries()) {
          const options=[...picker.options].filter(option=>option.value===part.id);
          if(options.length!==1||options[0].textContent!==`${index+1}. ${part.title}`)bad.push(`${part.id}: picker label/number mismatch`);
          if(part.assembly&&options[0]?.closest('optgroup')?.label!==part.assembly.title)bad.push(`${part.id}: missing parent group`);
        }
        if(picker.options.length!==parts.length+1)bad.push('picker duplicates or omits an entry');
        return {bad,internal:parts.filter(part=>enclosed.has(part.id)).map(part=>part.id),
          parents:[...new Map(parts.filter(part=>part.assembly).map(part=>[part.assembly.id,{part:part.id,...part.assembly}])).values()]};
      });
      check(!catalog.bad.length,`payload/${mode}: ${catalog.bad.join('; ')}`);
      check(catalog.internal.length>0,`payload/${mode}: no enclosed components were exercised`);
      internalByMode[mode]=catalog.internal;
      for(const id of catalog.internal) {
        await assemblyAction('assembled');
        await page.locator('#part-select').selectOption(id);await frames(3);
        await checkAssembly('inside',`payload/${mode}/${id}`);
        check(await page.evaluate(id=>grx.state.selected===id&&document.getElementById('part-select').value===id&&document.querySelector(`.pin[data-id="${id}"]`)?.checkVisibility(),id),`payload/${mode}/${id}: selected component/pin/picker disagree`);
        const view=await page.evaluate(checkView);
        check(!view.err&&!view.blocked&&!view.covers.length,`payload/${mode}/${id}: interior detail view is obstructed: ${JSON.stringify(view)}`);
      }
      // Every parent grouping carries usable evidence, independently of its
      // children and of whether that parent happens to have a removable cover.
      check(catalog.parents.length>0,`payload/${mode}: no assembly parents in the picker`);
      for(const parent of catalog.parents) {
        await page.locator('#part-select').selectOption(parent.part);
        check(await page.locator('#card-assembly').innerText().then(text=>text.includes(parent.title)),`payload/${mode}/${parent.id}: card lost its parent`);
        await page.locator('#card-assembly [data-src]').click();
        await page.locator('#src-pop').waitFor({state:'visible'});
        const evidence=await page.locator('#src-pop').innerText();
        check(!evidence.includes('Not traced')&&await page.locator('#src-pop a[href^="https://"]').count()>0,`payload/${mode}/${parent.id}: parent evidence is unusable`);
        await page.locator('#src-pop .sp-x').click();
      }
    }
    await show(page,'payload','data');
    await action('play');
    await page.waitForFunction(()=>grx.built[grx.state.scene].teaching.state().progress>.04);
    await assemblyAction('assembled');await frames(3);
    await checkAssembly('assembled','Close during playback');
    check(await page.evaluate(()=>{
      const b=grx.built[grx.state.scene],s=b.teaching.state();
      return !s.playing&&s.inspection&&grx.state.selected===null&&document.getElementById('part-select').value===''&&
        grx.camera.position.distanceTo(new grx.THREE.Vector3(...b.camera.pos))<1e-6&&grx.controls.target.distanceTo(new grx.THREE.Vector3(...b.camera.target))<1e-6;
    }),'Assembled did not pause, deselect and restore exterior Overview');
    // Closing from a close inspection is a real camera route, not just a
    // state toggle. Keep the same independent collision checks as flights.
    for(const id of internalByMode.data) {
      await page.locator('#part-select').selectOption(id);await frames(3);
      await page.evaluate(()=>grx.setTransitions('quick'));
      const flight=await page.evaluate(fly,{assemblyView:'assembled'});
      await page.evaluate(()=>grx.setTransitions('instant'));
      check(flight.motionRequired&&flight.frames>2&&flight.hits===0&&flight.progress.end===1,`payload/${id}: closing flight failed: ${JSON.stringify(flight)}`);
      await checkAssembly('assembled',`Close from ${id}`);
    }
    for(const name of ['play','next']) {
      await assemblyAction('assembled');await action(name);await frames(3);
      await checkAssembly('inside',`Open for ${name}`);
      const state=await sequence();
      check(!state.inspection&&state.playing===(name==='play'),`payload/${name}: opening lost deliberate playback intent`);
    }

    if(form==='phone') {
      const originalViewport=page.viewportSize();
      for(const viewport of [{width:390,height:844},{width:320,height:667},{width:844,height:390},{width:667,height:375}]) {
        await page.setViewportSize(viewport);
        await page.locator('.animation-explanation').evaluate(node=>{node.open=true;});
        await page.locator('#tab-scenario').click();await frames(3);
        const layout=await page.evaluate(()=>{
          const bad=[],selector='.assembly-controls button,#part-select,#card-prev,#card-next,#reset-view,#animation-controls .animation-transport button';
          const focus=document.querySelector('.focus-demo-open');
          const focusExpected=grx.store.C.SCENES[grx.state.scene].id==='payload'&&grx.state.mode==='light';
          if(!focus||focus.hidden===focusExpected)bad.push('Light-focus action availability does not match the layer');
          // The focus demonstration belongs only to payload Light. All other
          // transport and enclosure controls remain mandatory in this check.
          const nodes=[...document.querySelectorAll(selector)].filter(node=>node!==focus||focusExpected),boxes=[];
          for(const node of nodes) {
            if(!node.checkVisibility()){bad.push(`${node.id||node.textContent}: hidden`);continue;}
            const box=node.getBoundingClientRect(),hit=document.elementFromPoint((box.left+box.right)/2,(box.top+box.bottom)/2);
            if(box.left<0||box.top<0||box.right>innerWidth+.5||box.bottom>innerHeight+.5||!hit||!(node===hit||node.contains(hit)))bad.push(`${node.id||node.textContent}: clipped or covered`);
            boxes.push({node,box});
          }
          for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++) {
            const a=boxes[i].box,b=boxes[j].box;
            // Joined transport buttons share a 1 px border. Match the main UI
            // gate's 2 px intersection tolerance; center-hit checks stay strict.
            if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)bad.push(`${boxes[i].node.id} overlaps ${boxes[j].node.id}`);
          }
          if(document.getElementById('view').getBoundingClientRect().height<139.5)bad.push('canvas lost its usable minimum height');
          return bad;
        });
        check(!layout.length,`${viewport.width}×${viewport.height}: ${layout.join('; ')}`);
        await assemblyAction('assembled');await assemblyAction('inside');await action('next');
        await checkAssembly('inside',`${viewport.width}×${viewport.height} controls`);
      }
      await page.setViewportSize(originalViewport);await page.locator('#tab-parts').click();
    }

    // Share the real emitted URL, then start a fresh viewer from it. Enclosure
    // state is independent of selection: an external part can be viewed open.
    const reloadPayload = async (url, label, assembly, selected) => {
      await page.goto(url);
      await page.waitForFunction(()=>window.grx?.built[2]&&grx.state.scene===2&&!grx.isBusy(),null,{timeout:90000});
      await page.evaluate(()=>{grx.setTransitions('instant');grx.settle();});await frames(3);
      await checkAssembly(assembly,label);
      check(await page.evaluate(selected=>grx.state.selected===selected&&document.getElementById('part-select').value===(selected||''),selected),`${label}: selected component was not restored`);
    };
    for(const saved of [
      {label:'Inside overview',mode:'data',assembly:'inside',part:null},
      {label:'Inside external component',mode:'light',assembly:'inside',part:'optics'},
      {label:'Assembled external component',mode:'light',assembly:'assembled',part:'optics'},
      {label:'Inside internal component',mode:'data',assembly:'inside',part:'controller'},
      {label:'Assembled overview',mode:'heat',assembly:'assembled',part:null},
    ]) {
      await show(page,'payload',saved.mode);await assemblyAction(saved.assembly);
      if(saved.part)await page.locator('#part-select').selectOption(saved.part);
      const scenario=await page.evaluate(()=>({...grx.store.scenario}));
      const expectedView=['2',saved.mode,saved.part].filter(value=>value!==null).join('.');
      await page.waitForFunction(({view,assembly})=>{
        const query=new URLSearchParams(location.search);return query.get('view')===view&&query.get('assembly')===assembly;
      },{view:expectedView,assembly:saved.assembly});
      // Intercept the clipboard write instead of changing the user's clipboard.
      await page.evaluate(()=>{
        window.learningSharedURL=null;
        Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{window.learningSharedURL=value;}}});
      });
      await page.locator('#more-btn').click();await page.locator('#share-btn').click();
      await page.waitForFunction(()=>typeof window.learningSharedURL==='string');
      const shared=await page.evaluate(()=>window.learningSharedURL),query=new URL(shared).searchParams;
      check(query.get('view')===expectedView&&query.get('assembly')===saved.assembly,`${saved.label}: Share omitted the selected enclosure view`);
      await reloadPayload(shared,`${saved.label} shared link`,saved.assembly,saved.part);
      check(await page.evaluate(expected=>Object.entries(expected).every(([key,value])=>grx.store.scenario[key]===value),scenario),`${saved.label}: reload lost the scenario`);
    }
    for(const legacy of [
      {view:'2.data',assembly:null,wanted:'inside',part:null,activity:true},
      {view:'2.light.optics',assembly:null,wanted:'assembled',part:'optics'},
      {view:'2.data.controller',assembly:null,wanted:'inside',part:'controller'},
      {view:'2.data',assembly:'unknown',wanted:'inside',part:null,activity:true},
      {view:'2.data.controller',assembly:'assembled',wanted:'inside',part:'controller'},
    ]) {
      const url=new URL('visualizer.html',BASE);url.searchParams.set('view',legacy.view);
      if(legacy.assembly)url.searchParams.set('assembly',legacy.assembly);
      await reloadPayload(url.href,`Compatible link ${legacy.view}/${legacy.assembly||'default'}`,legacy.wanted,legacy.part);
      const linkedActivity=await page.evaluate(()=>{const s=grx.built[2].teaching.state();return {playing:s.playing,repeating:s.repeating,inspection:s.inspection};});
      check(legacy.activity?linkedActivity.playing&&linkedActivity.repeating&&!linkedActivity.inspection:!linkedActivity.playing&&linkedActivity.inspection,
        `Compatible link ${legacy.view}/${legacy.assembly||'default'}: default activity or explicit part inspection was not preserved`);
    }
    await show(page,'pixel','light');
    await page.waitForFunction(()=>!new URLSearchParams(location.search).has('assembly'));
    check(true,'Leaving the payload removes obsolete enclosure state from the URL');

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
    await page.locator('#part-select').selectOption('controller');
    await checkAssembly('inside','Scenario origin');
    await page.evaluate(() => { grx.settle(); grx.pin(true); window.learningBefore = {
      scene:grx.built[grx.state.scene], selected:grx.state.selected, mode:grx.state.mode,
      camera:grx.camera.position.toArray(), target:grx.controls.target.toArray(), pinned:grx.store.pinned,
      presentation:grx.built[grx.state.scene].presentation.capture(),
    }; });
    await page.locator('#tab-scenario').click();
    await page.locator('#scenario-adjust').evaluate(node => { node.open = true; });
    const choice = await page.evaluate(() => grx.store.scenario.orbit === 'leo' ? 'geo' : 'leo');
    await page.locator(`[data-choice="orbit"][data-value="${choice}"]`).click();
    check(await page.evaluate(() => {
      const old=window.learningBefore, built=grx.built[grx.state.scene];
      return built===old.scene && built.model===grx.store.M && grx.state.selected===old.selected && grx.state.mode===old.mode && grx.store.pinned===old.pinned && grx.camera.position.distanceTo(new grx.THREE.Vector3(...old.camera))<1e-6 && grx.controls.target.distanceTo(new grx.THREE.Vector3(...old.target))<1e-6 && document.querySelector('#tab-scenario').getAttribute('aria-selected')==='true'&&JSON.stringify(built.presentation.capture())===JSON.stringify(old.presentation);
    }), 'Scenario edit lost hardware/view/selection/comparison/pane context');
    await page.locator('#part-select').selectOption('');
    await page.evaluate(async () => { await grx.setScenario({detector:grx.store.scenario.detector==='qwip'?'hgcdte':'qwip'}); });
    check(await page.evaluate(() => grx.state.selected===null), 'Scenario edit lost overview');

    // Side visits form a stack and restore the originating selected component.
    await page.evaluate(async () => { await grx.go('payload'); grx.setMode('heat'); grx.select(grx.store.C.PARTS_HEAT.payload[2].id,false);grx.setAssemblyView('inside');grx.select('controller'); grx.settle(); window.learningOrigin={state:{scene:grx.state.scene,selected:grx.state.selected,mode:grx.state.mode},presentation:grx.built[grx.state.scene].presentation.capture(),camera:grx.camera.position.toArray(),target:grx.controls.target.toArray()}; await grx.go('abi'); await grx.go('atmosphere'); });
    await page.locator('#back-out').click();
    await page.waitForFunction(() => grx.store.C.SCENES[grx.state.scene].id==='abi' && !grx.isBusy());
    await page.locator('#back-out').click();
    await page.waitForFunction(() => grx.store.C.SCENES[grx.state.scene].id==='payload' && !grx.isBusy());
    check(await page.evaluate(() => {
      const old=window.learningOrigin;
      return Object.entries(old.state).every(([k,v])=>grx.state[k]===v)&&JSON.stringify(grx.built[grx.state.scene].presentation.capture())===JSON.stringify(old.presentation)&&grx.camera.position.distanceTo(new grx.THREE.Vector3(...old.camera))<1e-6&&grx.controls.target.distanceTo(new grx.THREE.Vector3(...old.target))<1e-6;
    }), 'Nested side visit lost its origin, enclosure view or camera');
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
    await show(page,'payload','data');await checkAssembly('assembled','Reduced-motion payload default');
    await action('next');await checkAssembly('inside','Reduced-motion payload step');
    check((await sequence()).index===1&&!(await sequence()).playing,'Reduced motion blocked the deliberate interior step');
    fs.mkdirSync('.local/learning',{recursive:true});
    await page.screenshot({path:`.local/learning/${form}.png`});
  } catch (error) {
    failures.push(error.stack || String(error));
    fs.mkdirSync('.local/learning',{recursive:true});
    await page.screenshot({path:`.local/learning/${form}-failure.png`}).catch(()=>{});
  }
  await finish(gate, failures, { states });
}
