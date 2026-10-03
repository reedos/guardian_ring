// Guided-mission, orbit-follow and interruption regressions on a real GPU.
import {openGate,finish,BASE} from './gate-common.mjs';
import {checkView} from './gate-geometry.mjs';
import {checkUI} from './gate-ui.mjs';
import {teachingFocus} from '../src/scenes/teaching-focus.js';
const form=process.argv[2]||'desktop',g=await openGate('mission',form);
if(g){const {page}=g,failures=[];let states=0;
 const check=(ok,message)=>{states++;if(!ok)throw new Error(message);};
 const frames=n=>page.evaluate(n=>new Promise(resolve=>{const tick=()=>--n>0?requestAnimationFrame(tick):resolve();requestAnimationFrame(tick);}),n);
 const state=()=>page.evaluate(()=>grx.mission.state());
 const ready=()=>page.waitForFunction(()=>!grx.mission.state().loading&&!grx.isCameraMoving());
 const press=action=>page.locator(`[data-mission="${action}"]`).click();
 try{
   check(!(await state()).active,'Mission must be opt-in');
   check(await page.locator('[data-mission="start"]').isVisible(),'Mission entry is hidden behind another menu');
  const scenario=await page.evaluate(()=>JSON.stringify(grx.store.scenario));
  if(!await page.locator('[data-mission="start"]').isVisible()){
   await page.locator('#more-btn').click();await page.locator('#mission-launch').focus();
  }else await page.locator('[data-mission="start"]').focus();
  await page.keyboard.press('Enter');await ready();await frames(4);
  check(await page.evaluate(()=>document.activeElement===document.querySelector('[data-mission="play"]')),'Starting a mission lost keyboard focus');
  check(await page.evaluate(()=>grx.orbitFollow()==='geo'&&grx.mission.state().active),'Mission did not enter GEO follow');
  await page.waitForFunction(()=>grx.mission.state().elapsed>.3);
  await press('play');await frames(3);
  const paused=await page.evaluate(()=>({time:grx.mission.state().elapsed,camera:grx.camera.position.toArray()}));
  await page.waitForTimeout(250);
  check(await page.evaluate(before=>grx.mission.state().elapsed===before.time&&grx.camera.position.distanceTo(new grx.THREE.Vector3(...before.camera))<1e-6,paused),'Pause did not hold the orbit and follow camera');
  await press('play');await frames(3);
  await page.locator('#mission-tour [data-src]').first().click();await page.locator('#src-pop').waitFor({state:'visible'});await frames(3);
  check(!(await page.locator('#src-pop').innerText()).includes('Not traced'),'Mission orbital speed has no evidence');
  const held=await state();await page.waitForTimeout(250);
  check((await state()).elapsed===held.elapsed,'Reading evidence advanced the mission');
  await page.keyboard.press('Escape');check((await state()).active,'Closing evidence ended the mission');
  await press('next');await ready();await frames(4);
  check(await page.evaluate(()=>grx.orbitFollow()==='leo'&&grx.mission.state().index===1),'Next chapter did not enter LEO follow');
  check(await page.evaluate(()=>JSON.stringify(grx.store.scenario))===scenario,'Following an orbit overwrote Scenario inputs');
  const motion=await page.evaluate(()=>({position:grx.camera.position.toArray(),time:grx.mission.state().elapsed}));await page.waitForTimeout(200);
  check(await page.evaluate(old=>grx.camera.position.distanceTo(new grx.THREE.Vector3(...old.position))>.005&&grx.camera.position.length()>1.1,motion),'LEO following did not move safely outside Earth');
  await page.evaluate(()=>grx.mission.pause());
  await page.screenshot({path:`.local/mission-${form}-leo.png`});
  for(const viewport of form==='phone'?[{width:390,height:844},{width:844,height:390}]:[{width:1440,height:900}]){
   await page.setViewportSize(viewport);await frames(4);
    const ui=await page.evaluate(checkUI,{selector:'#mission-tour button,#mission-tour input,#mission-tour summary,#hud-btns button,#part-select'});
   check(!ui.length,`Mission controls collide at ${viewport.width}: ${ui.join('; ')}`);
   check(await page.locator('#view').evaluate(el=>el.clientHeight>=120&&el.clientWidth>=200),`Mission leaves too little canvas at ${viewport.width}`);
  }
  await page.setViewportSize(form==='phone'?{width:390,height:844}:{width:1440,height:900});
  // The same clock and camera transitions used by playback cross every authored
  // phase. Seek near the boundary, then let rendered frames advance it.
  const total=(await state()).total;
  for(let chapter=2;chapter<total;chapter++){
   await press('next');await ready();await frames(4);
    const current=await state();check(current.index===chapter&&!current.failed,`Chapter ${chapter} failed to load`);
    if(current.chapter.follow)continue;
    check(await page.locator('.mission-step-controls').isVisible(),`${current.chapter.scene}: mission has no manual step controls`);
    if(chapter===4){
     await page.evaluate(()=>grx.mission.play());
     await page.locator('.mission-explanation > summary').click();await frames(3);
     check(!(await state()).playing,'Opening the current-step explanation did not pause the mission');
     check(await page.locator('.mission-description').innerText()===await page.evaluate(()=>grx.built[grx.state.scene].teaching.state().step.body),'Mission explanation is not the current teaching step');
     check(await page.locator('.mission-legend [data-kind]').count()>0,'Mission explanation has no typed-flow legend');
     await page.locator('.mission-evidence [data-src]').first().click();await page.locator('#src-pop').waitFor({state:'visible'});
     check(!(await page.locator('#src-pop').innerText()).includes('Not traced'),'Mission step evidence is not traced');
     const heldStep=await page.evaluate(()=>grx.built[grx.state.scene].teaching.state().progress);await page.waitForTimeout(200);
     check(await page.evaluate(before=>!grx.mission.state().playing&&grx.built[grx.state.scene].teaching.state().progress===before,heldStep),'Reading mission step evidence changed the paused phase');
     await page.keyboard.press('Escape');check((await state()).active,'Closing step evidence ended the mission');
     await page.locator('.mission-explanation > summary').click();
     await press('step-next');await ready();await frames(3);
     check(await page.evaluate(()=>{const s=grx.built[grx.state.scene].teaching.state();return grx.mission.state().phase===1&&!grx.mission.state().playing&&!s.playing&&s.progress===.72&&grx.state.selected==='scan-system';}),'Manual mission step did not retain a meaningful paused scan pose');
     await press('step-previous');await ready();await frames(3);
     check(await page.evaluate(()=>grx.mission.state().phase===0&&!grx.mission.state().playing&&grx.built[grx.state.scene].teaching.state().progress===.72),'Previous mission step failed to return to the paused opening phase');
    }
   const count=await page.evaluate(()=>grx.built[grx.state.scene].teaching.state().total);
   for(let phase=0;phase<count;phase++){
    await ready();await frames(3);
    const lesson=await page.evaluate(()=>grx.built[grx.state.scene].teaching.state());
     const wanted=teachingFocus(current.chapter.scene,current.chapter.mode,lesson.step.id);
     check(lesson.index===phase&&await page.evaluate(id=>grx.state.selected===id,wanted),`${current.chapter.scene}/${lesson.step.id}: mission focused the wrong component`);
     check(await page.locator('.mission-description').textContent()===lesson.step.body,`${current.chapter.scene}/${lesson.step.id}: mission details did not follow the phase`);
     check(await page.locator('#pins .pin:not(.on)').evaluateAll(pins=>pins.every(pin=>!pin.checkVisibility())),`${current.chapter.scene}/${lesson.step.id}: inactive pins distract from the guided subject`);
    if(wanted){const view=await page.evaluate(checkView);check(!view.err&&!view.blocked&&!view.covers.length,`${current.chapter.scene}/${lesson.step.id}: obstructed mission view ${JSON.stringify(view)}`);}
    if(phase<count-1){
     await page.evaluate(()=>{const t=grx.built[grx.state.scene].teaching,s=t.state();t.seek(s.index,.999);t.play();});
     await page.waitForFunction(expected=>grx.mission.state().phase===expected,phase+1);
    }
   }
   await page.evaluate(()=>grx.mission.pause());
   if(chapter===total-1){
    check(await page.locator('[data-mission="next"]').isDisabled(),'Final chapter Next should be disabled');
    await page.evaluate(()=>{const t=grx.built[grx.state.scene].teaching;t.seek(t.state().index,.72);});await frames(3);
    await page.screenshot({path:`.local/mission-${form}-ground.png`});
   }else await page.evaluate(()=>grx.mission.play());
  }
  await press('stop');check(!(await state()).active,'Explore did not stop the guided mission');
  check(await page.evaluate(()=>document.activeElement.id==='part-select'),'Explore did not restore a usable control');
  // Releasing a close camera must cancel an unfinished entry. An authored
  // Overview then restores the original safe orbit-control distance.
  await page.evaluate(async()=>{await grx.go('orbits',{record:false});grx.setTransitions('quick');grx.setOrbitFollow('leo');});
  await page.waitForFunction(()=>grx.isCameraMoving());
  await page.evaluate(()=>grx.setOrbitFollow(null));
  check(!await page.evaluate(()=>grx.isCameraMoving()),'Free view retained a canceled follow-entry flight');
  await page.evaluate(()=>{grx.overview();grx.settle();});
  check(await page.evaluate(()=>grx.controls.minDistance===grx.built[0].camera.min),'Overview retained the close-follow zoom limit');
  await page.evaluate(()=>{grx.setTransitions('instant');grx.setOrbitFollow('leo');grx.settle();});await frames(3);
  await page.evaluate(()=>{grx.setOrbitFollow(null);grx.built[0].setMotion(false);});await frames(3);
  const closeView=await page.evaluate(()=>grx.camera.position.toArray());
  await page.evaluate(()=>grx.go('ground'));await page.locator('#back-out').click();
  await page.waitForFunction(()=>grx.state.scene===0&&!grx.isBusy());await frames(3);
  check(await page.evaluate(position=>grx.camera.position.distanceTo(new grx.THREE.Vector3(...position))<1e-6&&!grx.built[0].motion(),closeView),'Back lost the paused close orbit view');
  await page.evaluate(()=>{grx.overview();grx.settle();});
  check(await page.evaluate(()=>grx.controls.minDistance===grx.built[0].camera.min),'Back from a close view prevented restoration of the authored zoom limit');
  // Direct navigation is also an interruption, independent of pointer events.
  await page.evaluate(()=>grx.mission.start());await ready();
  await page.evaluate(()=>grx.go('pixel',{record:false}));await frames(3);
  check(!(await state()).active&&await page.evaluate(()=>grx.state.scene===4),'Programmatic navigation was overwritten by the mission');
  // A pending chapter must not arrive after the reader chooses Explore.
  for(const action of form==='desktop'?['scenario','stop']:['stop']){
   let release,arrived;const hold=new Promise(resolve=>release=resolve),requested=new Promise(resolve=>arrived=resolve);
   await page.route('**/models/plume.glb*',async route=>{arrived();await hold;await route.continue();});
   await page.goto(new URL('visualizer.html',BASE).href);await page.waitForFunction(()=>window.grx?.built[0]&&!grx.isBusy());
   await page.evaluate(()=>{grx.setTransitions('instant');return grx.mission.start();});await ready();
   await press('next');await ready();await press('next');await requested;
   if(action==='scenario'){
    await page.locator('#tab-scenario').click();release();await ready();await frames(3);
    check(!(await state()).playing&&await page.locator('#pane-scenario').isVisible(),'A completed pending chapter replaced the reader’s Scenario pane');
    await press('stop');
   }else{
    await press('stop');const retained=await page.evaluate(()=>grx.state.scene);release();await page.waitForTimeout(500);
    check(!(await state()).active&&await page.evaluate(scene=>grx.state.scene===scene&&!grx.isBusy(),retained),'A canceled chapter replaced the retained scene after loading');
   }
   await page.unroute('**/models/plume.glb*');
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(new URL('visualizer.html?view=0.light&mission=1',BASE).href);
  await page.waitForFunction(()=>window.grx?.mission.state().active&&!grx.mission.state().loading);await frames(4);
  check(!(await state()).playing&&!new URL(page.url()).searchParams.has('mission'),'Reduced-motion entry played automatically or kept a restart parameter');
   await press('next');await ready();await frames(3);
   check((await state()).index===1&&!(await state()).playing,'Reduced-motion chapter stepping did not stay paused');
   for(let chapter=2;chapter<=4;chapter++){await press('next');await ready();await frames(3);}
   check(await page.evaluate(()=>grx.mission.state().index===4&&grx.mission.state().phase===0&&!grx.mission.state().playing&&grx.built[grx.state.scene].teaching.state().progress===.72),'Reduced-motion chapter entry has no meaningful stationary phase');
   await press('step-next');await ready();await frames(3);
   check(await page.evaluate(()=>grx.mission.state().phase===1&&!grx.mission.state().playing&&!grx.built[grx.state.scene].teaching.state().playing&&grx.built[grx.state.scene].teaching.state().progress===.72),'Reduced-motion reader cannot step through a hardware chapter while paused');
   await page.locator('.mission-explanation > summary').click();
   for(const viewport of form==='phone'?[{width:390,height:844},{width:844,height:390}]:[{width:1440,height:900}]){
    await page.setViewportSize(viewport);await frames(4);
    const ui=await page.evaluate(checkUI,{selector:'#mission-tour button,#mission-tour input,#mission-tour summary,#hud-btns button,#part-select'});
    check(!ui.length,`Mission step/details controls collide at ${viewport.width}: ${ui.join('; ')}`);
    check(await page.locator('#view').evaluate(el=>el.clientHeight>=120&&el.clientWidth>=200),`Mission details leave too little canvas at ${viewport.width}`);
   }
   await page.keyboard.press('Escape');check(!(await state()).active,'Escape did not exit the mission');
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states});
}
