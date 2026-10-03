// Exercise the controls a reader actually presses, including the distinction
// between inspecting parts and stepping through an animated explanation.
import {openGate,finish,MODES} from './gate-common.mjs';
import {checkView,fly} from './gate-geometry.mjs';
import {teachingFocus} from '../src/scenes/teaching-focus.js';
const form=process.argv[2]||'desktop',g=await openGate('navigation',form);
if(g){const {page}=g,failures=[];let states=0;
 const frames=()=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 const check=(ok,message)=>{states++;if(!ok)failures.push(message);};
 try{
  for(const scene of g.scenes)for(const mode of MODES){
   await page.evaluate(async({scene,mode})=>{await grx.go(scene,{record:false});grx.setMode(mode);grx.settle();},{scene:scene.i,mode});await frames();
   check(await page.evaluate(()=>grx.state.selected===null&&document.querySelector('#part-select').value===''&&document.querySelector('#card').hidden),`${scene.id}/${mode}: new level must open in unselected overview`);
   const ids=await page.locator('#part-select option').evaluateAll(options=>options.map(o=>o.value).filter(Boolean));
   const home=await page.evaluate(()=>grx.camera.position.toArray());
   for(const [i,id] of ids.entries()){
    await page.locator('#card-next').click();await frames();await page.evaluate(()=>grx.settle());
    const result=await page.evaluate(({id,home})=>{
     const pin=document.querySelector(`.pin[data-id="${id}"]`);
     return {selected:grx.state.selected,picker:document.querySelector('#part-select').value,visible:pin?.checkVisibility(),
      moved:grx.camera.position.distanceTo(new grx.THREE.Vector3(...home))>1e-3,
      title:document.querySelector('#card-t').textContent};
    },{id,home});
    check(result.selected===id&&result.picker===id&&result.visible&&!!result.title,`${scene.id}/${mode}/${id}: Next failed to select and identify its part`);
    if(i===0)check(result.moved,`${scene.id}/${mode}: first Next left camera at overview`);
    const view=await page.evaluate(checkView);
    check(!view.err&&!view.blocked&&!view.covers.length,`${scene.id}/${mode}/${id}: Next framing ${JSON.stringify(view)}`);
   }
   await page.locator('#reset-view').click();await frames();await page.evaluate(()=>grx.settle());
   check(await page.evaluate(home=>grx.state.selected===null&&grx.camera.position.distanceTo(new grx.THREE.Vector3(...home))<1e-6,home),`${scene.id}/${mode}: Overview did not restore full assembly`);
   await page.locator('#card-prev').click();await frames();await page.evaluate(()=>grx.settle());
   check(await page.evaluate(id=>grx.state.selected===id,ids.at(-1)),`${scene.id}/${mode}: Previous from Overview did not select final part`);
   if(scene.id==='orbits')continue;
   await page.locator('#animation-controls [data-action="reset"]').click();await frames();
   const total=await page.evaluate(()=>grx.built[grx.state.scene].teaching.state().total);
   for(let i=0;i<total;i++){
    const lesson=await page.evaluate(()=>grx.built[grx.state.scene].teaching.state());
    const wanted=teachingFocus(scene.id,mode,lesson.step.id);
    check(!lesson.playing&&!lesson.inspection&&lesson.index===i,`${scene.id}/${mode}/${lesson.step.id}: step state does not match explanation`);
    check(await page.evaluate(id=>grx.state.selected===id&&document.querySelector('#part-select').value===(id||''),wanted),`${scene.id}/${mode}/${lesson.step.id}: animation step did not focus its subject`);
    await page.evaluate(()=>grx.settle());
    if(wanted){const view=await page.evaluate(checkView);check(!view.err&&!view.blocked&&!view.covers.length,`${scene.id}/${mode}/${lesson.step.id}: step framing ${JSON.stringify(view)}`);}
    await page.locator('#animation-controls [data-action="next"]').click();await frames();
   }
   await page.locator('#animation-controls [data-action="play"]').click();await frames();
   check(await page.evaluate(()=>grx.state.selected===null&&grx.built[grx.state.scene].teaching.state().playing),`${scene.id}/${mode}: full sequence should play in overview`);
  }
  // Real UI flights must finish without using the test hook to force arrival.
  for(const scene of ['payload','pixel','tirs2']){
   await page.evaluate(async scene=>{await grx.go(scene,{record:false});grx.setMode('data');grx.setTransitions('quick');},scene);
   for(let i=0;i<3;i++){
    const before=await page.evaluate(()=>grx.camera.position.toArray());
    await page.locator('#card-next').click();
    await page.waitForFunction(()=>!grx.isCameraMoving());
    check(await page.evaluate(before=>grx.flightProgress()===1&&grx.camera.position.distanceTo(new grx.THREE.Vector3(...before))>.01,before),`${scene}: Next ${i+1} did not visibly finish its camera flight`);
   }
  }
  // Measure camera routes against the actual paused mechanism pose too, not
  // only the rest geometry used by ordinary component inspection.
  for(const scene of ['payload','abi','tirs2']){
   await page.evaluate(async scene=>{grx.setTransitions('instant');await grx.go(scene,{record:false});grx.setMode('light');},scene);
   await page.locator('#animation-controls [data-action="reset"]').click();await frames();await page.evaluate(()=>{grx.settle();grx.setTransitions('quick');});
   const pivots=scene==='payload'?['PayloadScanFirst','PayloadScanSecond']:scene==='abi'?['ABIScanNorthSouth','ABIScanEastWest']:['TIRSSceneSelect'];
   const rest=await page.evaluate(names=>names.map(name=>grx.built[grx.state.scene].asset.getObjectByName(name).quaternion.toArray()),pivots);
   for(let i=0;i<2;i++){
    const route=await page.evaluate(fly,{id:scene==='tirs2'?(i===0?'blackbody':'scene-select'):'scan-system',animationStep:1});
    check(route.hits===0&&route.progress.end===1&&(!route.motionRequired||route.frames>2),`${scene}: animation-step route ${i+1} ${JSON.stringify(route)}`);
    const expected=scene==='tirs2'?['blackbody','space'][i]:['slew','feedback'][i];
    const pose=await page.evaluate(({pivots,rest})=>{
     const b=grx.built[grx.state.scene],lesson=b.teaching.state();
     return {phase:lesson.step.id,paused:!lesson.playing&&!lesson.inspection,angles:pivots.map((name,index)=>b.asset.getObjectByName(name).quaternion.angleTo(new grx.THREE.Quaternion(...rest[index])))};
    },{pivots,rest});
    check(pose.phase===expected&&pose.paused&&(expected==='feedback'?pose.angles.every(angle=>angle<1e-6):pose.angles.every(angle=>angle>.03)),`${scene}: route did not retain the expected paused mechanism pose ${JSON.stringify(pose)}`);
   }
  }
  // Refitting is geometric: all eight corners must remain in the canvas and
  // occupy a useful fraction. A centered hotspot alone cannot prove focus.
  for(const viewport of form==='phone'?[{width:390,height:844},{width:844,height:390}]:[{width:1440,height:900}]){
   await page.setViewportSize(viewport);
   for(const [scene,id] of [['pixel','bump'],['tirs2','arrays'],['plume','co2'],['focal-plane','flex']]){
    await page.evaluate(async({scene,id})=>{grx.setTransitions('instant');await grx.show({scene,mode:'light',part:id});grx.settle();},{scene,id});await frames();
    const region=await page.evaluate(()=>{
     const w=grx,b=w.built[w.state.scene],v=b.hotspots[w.state.selected].view,c=v.focus||v.target,p=[];
     for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])p.push(new w.THREE.Vector3(c[0]+x*v.detailSize[0]/2,c[1]+y*v.detailSize[1]/2,c[2]+z*v.detailSize[2]/2).project(w.camera));
     const xs=p.map(v=>v.x),ys=p.map(v=>v.y);
     return {inside:p.every(p=>Math.abs(p.x)<.9&&Math.abs(p.y)<.9&&p.z<1),span:Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))/2};
    });
    check(region.inside&&region.span>.25,`${scene}/${id}/${viewport.width}: component is clipped or too small ${JSON.stringify(region)}`);
   }
  }
  await page.evaluate(async()=>{grx.setTransitions('instant');await grx.go('abi',{record:false});grx.setMode('light');});
  await page.locator('#animation-controls [data-action="reset"]').click();
  await page.locator('#animation-controls [data-action="next"]').click();await frames();
  const savedLesson=await page.evaluate(()=>({selected:grx.state.selected,phase:grx.built[7].teaching.state().step.id,pose:grx.built[7].asset.getObjectByName('ABIScanNorthSouth').quaternion.toArray()}));
  await page.evaluate(async()=>{await grx.go('atmosphere');});await page.locator('#back-out').click();await frames();
  check(await page.evaluate(saved=>{const b=grx.built[7],s=b.teaching.state();return grx.state.scene===7&&grx.state.selected===saved.selected&&s.step.id===saved.phase&&!s.playing&&!s.inspection&&b.asset.getObjectByName('ABIScanNorthSouth').quaternion.angleTo(new grx.THREE.Quaternion(...saved.pose))<1e-6;},savedLesson),'Back lost the paused animation subject or mechanism pose');
  await page.evaluate(async()=>{await grx.show({scene:'pixel',mode:'light',part:'bump'});await grx.go('atmosphere');});
  await page.locator('#back-out').click();await frames();
  const old=await page.evaluate(()=>grx.camera.position.toArray());
  // A genuinely tall canvas changes the fitting constraint; two wide canvases
  // can correctly keep exactly the same distance for this vertical subject.
  await page.setViewportSize({width:390,height:1400});await frames();await page.evaluate(()=>grx.settle());
  check(await page.evaluate(old=>grx.state.selected==='bump'&&grx.camera.position.distanceTo(new grx.THREE.Vector3(...old))>.01,old),'Back lost automatic component refitting on viewport change');
  const custom=await page.evaluate(()=>{grx.controls.dispatchEvent({type:'start'});grx.camera.position.x+=.4;grx.controls.update();return grx.camera.position.toArray();});
  await page.setViewportSize(form==='phone'?{width:420,height:900}:{width:1100,height:1000});await frames();
  check(await page.evaluate(custom=>grx.camera.position.distanceTo(new grx.THREE.Vector3(...custom))<1e-6,custom),'Resizing overrode a deliberate user camera adjustment');
  await page.screenshot({path:`.local/navigation-${form}.png`});
 }catch(e){failures.push(e.stack||String(e));}
 await finish(g,failures,{states});
}
