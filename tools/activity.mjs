import {lessonAction,setMotion,openParts} from './gate-actions.mjs';
// Immediate layer activity, retained motion intent, and orbital follow sharing.
// One real-GPU browser owns the complete desktop or phone run; no timing mocks.
import {openGate,finish,MODES,BASE} from './gate-common.mjs';
import {checkUI} from './gate-ui.mjs';

const form=process.argv[2]||'desktop',gate=await openGate('activity',form);
if(gate){
 const {page,scenes}=gate,failures=[],activityCases={running:[],paused:[],reduced:[]},repeatCases=[],lifecycleCases=[];
 let states=0,lifecycle=null;
 const check=(ok,message)=>{states++;if(!ok)throw new Error(message);};
 const frames=n=>page.evaluate(n=>new Promise(resolve=>{const tick=()=>--n>0?requestAnimationFrame(tick):resolve();requestAnimationFrame(tick);}),n);
 const ready=()=>page.waitForFunction(()=>window.grx?.built[grx.state.scene]&&!grx.isBusy()&&!grx.isCameraMoving());
 const lesson=()=>page.evaluate(()=>{const s=grx.built[grx.state.scene].teaching.state();return {index:s.index,progress:s.progress,total:s.total,playing:s.playing,repeating:s.repeating,inspection:s.inspection,suspended:s.suspended};});
 const camera=()=>page.evaluate(()=>({position:grx.camera.position.toArray(),target:grx.controls.target.toArray(),selected:grx.state.selected}));
 const stableCamera=async(before,context)=>check(await page.evaluate(saved=>grx.state.selected===saved.selected&&grx.camera.position.distanceTo(new grx.THREE.Vector3(...saved.position))<1e-5&&grx.controls.target.distanceTo(new grx.THREE.Vector3(...saved.target))<1e-5,before),`${context}: compatible layer change replaced the selected part or camera`);
 const layer=async mode=>{
  // Atmosphere has one public view. Preserve exhaustive engine coverage for
  // legacy shared Data/Heat links without pretending it has visible toggles.
  if(await page.evaluate(()=>grx.store.C.SCENES[grx.state.scene].id==='atmosphere')){
   check(!await page.locator('[data-mode]:visible').count(),'Atmosphere exposes removed layer toggles');
   await page.evaluate(value=>grx.setMode(value),mode);
  }else await page.locator(`[data-mode="${mode}"]`).click();
  await frames(3);
 };
 const action=name=>lessonAction(page,name);
 async function enter(scene){
  if(await page.locator('#level-pick').isVisible()){
   await page.locator('#level-pick').click();await page.locator(`#level-menu [data-level="${scene.i}"]`).click();
  }else await page.locator(`#steps [data-level="${scene.i}"]`).click();
  await page.waitForFunction(index=>grx.state.scene===index&&!grx.isBusy(),scene.i);await ready();await frames(3);
 }
 // Hash visible explanatory geometry and its material emphasis. Non-ray
 // functional connections change as a whole; they must not gain photon heads
 // merely to satisfy a motion test. A changing clock alone is insufficient.
 const geometry=()=>page.evaluate(()=>{
  const b=grx.built[grx.state.scene],rows=[];let marks=0;
  b.scene.traverseVisible(object=>{
   const position=object.userData.teachingOverlay&&object.geometry?.getAttribute('position');
   if(!position)return;
   const range=object.geometry.drawRange,start=range.start||0,count=Math.min(position.count-start,Number.isFinite(range.count)?range.count:position.count);
   if(count<=0)return;
   const values=[];
   for(let i=start;i<start+count;i++){
    const p=new grx.THREE.Vector3().fromBufferAttribute(position,i).applyMatrix4(object.matrixWorld).project(grx.camera);
    if(p.z<-1||p.z>1||Math.abs(p.x)>.98||Math.abs(p.y)>.98)continue;
    if(object.isPoints||object.isLineSegments||object.parent?.userData.flowKind==='optical-connection')marks++;
    values.push(Math.round(position.getX(i)*1e6),Math.round(position.getY(i)*1e6),Math.round(position.getZ(i)*1e6));
   }
   rows.push([object.name,object.type,values,object.material?.opacity]);
  });
  const display=b.activityDisplay?.state();
  return {marks,display:!!display?.active,signature:JSON.stringify([rows,display])};
 });
 async function chooseCompatiblePart(scene){
  const part=await page.evaluate(id=>{
   const b=grx.built[grx.state.scene],C=grx.store.C,lists=[C.PARTS[id],C.PARTS_DATA[id],C.PARTS_HEAT[id]],maps=[b.hotspots,b.dataHotspots,b.heatHotspots];
   return lists[0].find(part=>lists.every(list=>list.some(other=>other.id===part.id))&&maps.every(map=>map?.[part.id]?.view&&JSON.stringify(map[part.id].view)===JSON.stringify(maps[0][part.id].view)))?.id;
  },scene.id);
  check(!!part,`${scene.id}: no compatible authored part available for the layer-retention check`);
  await openParts(page);await page.locator('#part-select').selectOption(part);await ready();await frames(3);
 }
 async function matrix(kind){
  const running=kind==='running';
  for(const scene of scenes.filter(scene=>scene.i!==0)){
   await enter(scene);await layer('heat');
   for(const mode of MODES){
    const key=`${scene.id}/${mode}`,before=await camera();await layer(mode);
    const s=await lesson(),first=await geometry();
    check(!s.inspection&&s.progress>0&&s.progress<1,`${kind}/${key}: layer did not immediately show a meaningful lesson pose`);
    check(s.playing===running&&(!running||s.repeating),`${kind}/${key}: wrong activity/pause intent`);
    check(first.marks>0||first.display,`${kind}/${key}: no visible explanatory marks or display activity`);
    if(scene.id==='atmosphere'){
     check(!await page.locator('.animation-step').isVisible()&&await page.locator('#legend').isVisible()&&!!(await page.locator('#legend').innerText()).trim(),`${kind}/${key}: simplified view must replace sequence captions with its visible physical legend`);
    }else check(await page.locator('.animation-step').isVisible(),`${kind}/${key}: current activity has no visible explanation`);
    await stableCamera(before,`${kind}/${key}`);
    await frames(12);const next=await lesson(),second=await geometry();
    if(running){
     check(next.index!==s.index||next.progress!==s.progress,`${key}: the activity clock is not advancing`);
     check(first.signature!==second.signature,`${key}: the visible teaching geometry stays static while the clock advances`);
    }else{
     check(next.index===s.index&&next.progress===s.progress&&!next.playing,`${kind}/${key}: paused layer advanced`);
     check(first.signature===second.signature,`${kind}/${key}: paused geometry changed`);
    }
    await stableCamera(before,`${kind}/${key} after rendered frames`);activityCases[kind].push(key);
   }
   // Inspection can legitimately frame a part away from the currently active
   // route. Test its retention separately from activity visibility in Overview.
   await chooseCompatiblePart(scene);const inspected=await camera();
   for(const mode of MODES){
    await layer(mode);const s=await lesson();
    check(!s.inspection&&s.playing===running,`${kind}/${scene.id}/${mode}: selected-part layer switch lost activity intent`);
    await stableCamera(inspected,`${kind}/${scene.id}/${mode} selected part`);
   }
  }
 }
 try{
  check(scenes.filter(scene=>scene.i!==0).length>0,'No hardware scenes selected for activity coverage');
  await matrix('running');
  // Exercise real cycle boundaries, without seeking or setting repeat in the
  // test. Every matrix state independently asserts the UI's repeating intent.
  const atmosphere=scenes.find(scene=>scene.id==='atmosphere');
  if(atmosphere)for(const mode of MODES){
   await enter(atmosphere);await layer(mode);const initial=await lesson();
   await page.waitForFunction(progress=>{const s=grx.built[grx.state.scene].teaching.state();return s.playing&&s.repeating&&s.index===0&&s.progress<progress;},initial.progress,{polling:50,timeout:(initial.total+1)*4000});
   check((await lesson()).playing,`atmosphere/${mode}: activity stopped at the cycle boundary`);repeatCases.push(`atmosphere/${mode}`);
  }
  const payload=scenes.find(scene=>scene.id==='payload')||scenes.find(scene=>scene.i!==0);
  await enter(payload);await layer('data');await layer('light');
  const details=page.locator('.animation-explanation');
  await openParts(page);if(!await details.evaluate(node=>node.open))await details.locator('summary').click();
  // The payload's opening command has directly attached civil component facts.
  check(await page.locator('.animation-evidence [data-src]').count()>0,'Activity phase has no evidence control for the reading-hold check');
  await page.locator('.animation-evidence [data-src]').first().click();await page.locator('#src-pop').waitFor({state:'visible'});await frames(3);
  const held=await lesson(),heldGeometry=await geometry();await frames(12);
  check(held.playing&&held.suspended&&JSON.stringify(await lesson())===JSON.stringify(held),'Evidence reading did not suspend activity while preserving play intent');
  check((await geometry()).signature===heldGeometry.signature,'Evidence reading changed visible activity');
  check(!(await page.locator('#src-pop').innerText()).includes('Not traced'),'Activity evidence is untraced');
  await page.locator('#src-pop .sp-x').click();
  await page.waitForFunction(before=>{const s=grx.built[grx.state.scene].teaching.state();return !s.suspended&&(s.index!==before.index||s.progress!==before.progress);},held);
  await gate.screenshot({path:`.local/activity-${form}-payload.png`});
  // Chrome freezes background pages in addition to the visibility hold. Test
  // that a real lifecycle suspension cannot jump over the lesson on return.
  lifecycle=await page.context().newCDPSession(page);
  await page.evaluate(()=>{
   window.activityLifecycleEvents=[];
   window.activityLifecycleSnapshot=()=>{const s=grx.built[grx.state.scene].teaching.state();return {at:performance.now(),hidden:document.hidden,index:s.index,progress:s.progress,total:s.total,playing:s.playing,repeating:s.repeating,inspection:s.inspection,suspended:s.suspended};};
   window.activityLifecycleListener=event=>window.activityLifecycleEvents.push({event:event.type,...window.activityLifecycleSnapshot()});
   for(const event of ['freeze','resume','visibilitychange'])document.addEventListener(event,window.activityLifecycleListener,true);
  });
  // Measure from real lifecycle events, not an earlier Playwright snapshot.
  // The short case also prevents a >1-second frame-gap guard from masking a
  // missing lifecycle hold. Unfreezing alone need not restore visibility.
  for(const freezeMs of [250,1250]){
   const start=await page.evaluate(()=>window.activityLifecycleEvents.length);
   await lifecycle.send('Page.setWebLifecycleState',{state:'frozen'});
   await new Promise(resolve=>setTimeout(resolve,freezeMs));
   await lifecycle.send('Page.setWebLifecycleState',{state:'active'});await gate.restoreLifecycleVisibility();await frames(2);
   const {events,thawed}=await page.evaluate(start=>({events:window.activityLifecycleEvents.slice(start),thawed:window.activityLifecycleSnapshot()}),start);
   const frozen=events.find(event=>event.event==='freeze'),resumed=events.find(event=>event.event==='resume');
   const result={freezeMs,events,frozen,resumed,thawed};lifecycleCases.push(result);
   check(!!frozen&&!!resumed&&resumed.at>=frozen.at,`${freezeMs}ms lifecycle suspension did not emit ordered freeze/resume events: ${JSON.stringify(result)}`);
   check(frozen.playing&&resumed.playing&&thawed.playing&&frozen.total===thawed.total,`${freezeMs}ms lifecycle suspension lost the running lesson: ${JSON.stringify(result)}`);
   // Repeating lessons can cross their last-to-first boundary normally. Use
   // circular elapsed time rather than interpreting that wrap as a reversal.
   const elapsedTo=state=>{const steps=(state.index+state.progress)-(frozen.index+frozen.progress);return (frozen.repeating?(steps%frozen.total+frozen.total)%frozen.total:steps)*3.6;};
   result.suspendedElapsed=elapsedTo(resumed);result.totalElapsed=elapsedTo(thawed);
   check(result.suspendedElapsed>=0&&result.suspendedElapsed<.35&&result.totalElapsed>=0&&result.totalElapsed<.35,`${freezeMs}ms tab lifecycle resume skipped through the suspended lesson: ${JSON.stringify(result)}`);
   check(!thawed.hidden&&!thawed.suspended,`${freezeMs}ms lifecycle return did not restore a visible, unsuspended view: ${JSON.stringify(result)}`);
   await page.waitForFunction(before=>{const s=grx.built[grx.state.scene].teaching.state();return s.index!==before.index||s.progress!==before.progress;},thawed);
  }
  await lifecycle.detach();lifecycle=null;
  await action('play');check(!(await lesson()).playing,'Pause activity did not pause');
  await matrix('paused');

  const ring=scenes.find(scene=>scene.i===0);
  if(ring){
   await enter(ring);
   if(!await page.evaluate(()=>grx.built[0].motion()))await setMotion(page,!(await page.evaluate(()=>grx.built[0].motion())));
   await setMotion(page,!(await page.evaluate(()=>grx.built[0].motion())));
   const note=page.locator('.orbit-playback-note');if(!await note.evaluate(node=>node.open))await note.locator('summary').click();
   await page.locator('[data-follow="leo"]').click();await ready();await frames(4);
   check(await page.evaluate(()=>grx.orbitFollow()==='leo'&&!grx.built[0].motion()),'Pause the day → Follow LEO restarted motion');
   const pausedFollow=await camera();await frames(12);await stableCamera(pausedFollow,'Paused LEO follow');
   await setMotion(page,!(await page.evaluate(()=>grx.built[0].motion())));await page.locator('[data-follow="geo"]').click();await ready();await frames(4);
   check(await page.evaluate(()=>grx.orbitFollow()==='geo'&&grx.built[0].motion()),'Running day → Follow GEO did not resume prior motion');
   const movingFollow=await camera();await frames(12);
   check(await page.evaluate(before=>grx.camera.position.distanceTo(new grx.THREE.Vector3(...before.position))>1e-4,movingFollow),'Running follow camera is static');
   await setMotion(page,!(await page.evaluate(()=>grx.built[0].motion())));await page.locator('[data-follow="leo"]').click();await ready();await frames(3);
   // Capture the real Share handler's output without replacing the user's clipboard.
   await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async url=>{window.activitySharedUrl=url;}}}));
   await page.locator('#more-btn').click();await page.locator('#share-btn').click();
   const shared=await page.evaluate(()=>window.activitySharedUrl);
   check(!!shared&&new URL(shared).searchParams.get('follow')==='leo','Share this view omitted the followed spacecraft');
   await page.goto(shared);await ready();await page.waitForFunction(()=>grx.orbitFollow()==='leo'&&!grx.isCameraMoving());
   check(await page.locator('#part-select').inputValue()==='','Shared follow unexpectedly selected a component');
   await gate.screenshot({path:`.local/activity-${form}-follow.png`});
  }

  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(new URL('visualizer.html',BASE).href);await ready();
  await matrix('reduced');
  const ui=await page.evaluate(checkUI,{selector:'[data-mode],#hud-btns button,#part-select,#animation-controls button,#animation-controls summary'});
  check(!ui.length,`Reduced-motion activity controls: ${ui.join('; ')}`);
  await gate.screenshot({path:`.local/activity-${form}-reduced.png`});
 }catch(error){failures.push(error.stack||String(error));}
 finally{
  if(lifecycle){try{await lifecycle.send('Page.setWebLifecycleState',{state:'active'});await lifecycle.detach();}catch(error){failures.push(`Lifecycle cleanup: ${error.message}`);}}
  try{await page.evaluate(()=>{if(window.activityLifecycleListener)for(const event of ['freeze','resume','visibilitychange'])document.removeEventListener(event,window.activityLifecycleListener,true);});}catch(error){failures.push(`Lifecycle event cleanup: ${error.message}`);}
  await finish(gate,failures,{states,activityCases,repeatCases,lifecycleCases,activityCoverage:'all hardware scenes and layers: running, explicit pause, reduced motion; natural rendered repeat boundaries; evidence and lifecycle holds; orbit follow and shared follow'});
 }
}
