import fs from 'node:fs';
import {openGate,show,finish,BASE,MODES} from './gate-common.mjs';
import {openParts} from './gate-actions.mjs';
const form=process.argv[2]||'desktop',gate=await openGate('optics',form);
if(gate){
 const {page,scenes}=gate,failures=[];let states=0;
 const check=(ok,message)=>{states++;if(!ok)throw Error(message);};
 const frames=n=>page.evaluate(n=>new Promise(resolve=>{const tick=()=>--n?requestAnimationFrame(tick):resolve();requestAnimationFrame(tick);}),n);
 const lesson=()=>page.evaluate(()=>{const s=grx.built[grx.state.scene].teaching.state();return {playing:s.playing,index:s.index,progress:s.progress};});
 const camera=()=>page.evaluate(()=>grx.camera.position.toArray().concat(grx.controls.target.toArray()));
 const cdp=form==='phone'?await page.context().newCDPSession(page):null;
 async function gesture(kind='rotate',selector='#gl'){
  const r=await page.locator(selector).boundingBox(),x=r.x+r.width*.22,y=r.y+r.height*.55;
  if(cdp&&selector==='#gl'){
   const points=dx=>kind==='zoom'?[{x:x-dx,y,id:1},{x:x+65+dx,y:y+25,id:2}]:[{x:x+dx,y:y+dx*.3,id:1}];
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points(0)});
   for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:points(i*5)});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }else{
   await page.mouse.move(x,y);
   if(kind==='zoom')await page.mouse.wheel(0,100);
   else{await page.mouse.down({button:kind==='pan'?'right':'left'});await page.mouse.move(x+45,y+15,{steps:8});await page.mouse.up({button:kind==='pan'?'right':'left'});}
  }
  await frames(12);
 }
 try{
  for(const scene of scenes.filter(s=>s.id!=='orbits'))for(const mode of MODES){
   await show(page,scene.i,mode);await page.evaluate(()=>grx.setSceneActivity(true));await frames(4);
   for(const kind of form==='phone'?['rotate','zoom']:['rotate','pan','zoom']){
    const before=await lesson(),pose=await camera();await gesture(kind);const after=await lesson();
    check(after.playing,`${scene.id}/${mode}/${kind}: camera gesture paused activity`);
    check(after.index!==before.index||after.progress!==before.progress,`${scene.id}/${mode}/${kind}: presentation clock stopped`);
    check(JSON.stringify(pose)!==JSON.stringify(await camera()),`${scene.id}/${mode}/${kind}: gesture did not move the camera`);
   }
   await page.evaluate(()=>grx.setSceneActivity(false));const paused=await lesson();await gesture();
   check(JSON.stringify(paused)===JSON.stringify(await lesson()),`${scene.id}/${mode}: gesture restarted a deliberate pause`);
  }
  await page.evaluate(async()=>{grx.setSceneActivity(true);await grx.mission.start();});await frames(8);await gesture();
  check(await page.evaluate(()=>!grx.mission.state().active&&grx.built[0].motion()),'Manual mission camera did not release navigation and retain orbital motion');
  await page.evaluate(async()=>{await grx.mission.start();for(let i=0;i<4;i++)await grx.mission.next();});await frames(8);await gesture();
  check(await page.evaluate(()=>!grx.mission.state().active&&grx.built[grx.state.scene].teaching.state().playing),'Manual payload camera stopped mission activity');
  await show(page,2,'light');await openParts(page);await page.getByRole('button',{name:'See scan mirrors',exact:true}).click();
  await page.locator('#focus-demo').waitFor({state:'visible'});fs.mkdirSync('.local/optics',{recursive:true});
  for(const topic of ['reflection','sweep','axes','feedback','focus']){
   await page.getByLabel('Optics demonstration',{exact:true}).selectOption(topic);await frames(8);
   const before=await page.evaluate(()=>grx.focusDemo.state());await gesture('rotate','#focus-demo canvas');const after=await page.evaluate(()=>grx.focusDemo.state());
   check(after.playing&&after.progress!==before.progress&&after.yaw!==before.yaw,`${topic}: rotating diagram stopped motion`);
   await page.locator('#focus-demo [data-focus="play"]').click();const paused=await page.evaluate(()=>grx.focusDemo.state().progress);await gesture('rotate','#focus-demo canvas');
   check(await page.evaluate(p=>!grx.focusDemo.state().playing&&grx.focusDemo.state().progress===p,paused),`${topic}: rotating restarted paused diagram`);
   const normals=await page.evaluate(()=>grx.focusDemo.state().normals);await page.locator('#focus-demo [data-focus="normals"]').click();
   check(await page.evaluate(before=>grx.focusDemo.state().normals!==before,normals),`${topic}: surface-normal control did not toggle`);
   await page.locator('#focus-demo [data-focus="normals"]').click();
   await page.locator('#focus-demo [data-focus="side"]').click();await page.locator('#focus-demo canvas').focus();await page.keyboard.press('ArrowLeft');
   check(await page.evaluate(topic=>Math.abs(grx.focusDemo.state().pitch-(topic==='focus'?0:1.45))<1e-9,topic),`${topic}: rotating the fixed view changed elevation unexpectedly`);
   await page.keyboard.press('Home');
   check(await page.evaluate(topic=>Math.abs(grx.focusDemo.state().yaw-(topic==='focus'?1.12:.4))<1e-9,topic),`${topic}: Home did not restore the lesson perspective`);
   await page.locator('#focus-demo [data-focus="perspective"]').click();check(await page.locator('#focus-demo').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${topic}: dialog overflows horizontally`);
   await page.screenshot({path:`.local/optics/${form}-${topic}.png`});await page.locator('#focus-demo [data-focus="play"]').click();
  }
  await page.keyboard.press('Escape');check(!await page.locator('#focus-demo').isVisible(),'Escape did not close optics diagram');
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(new URL('visualizer.html?view=2.light',BASE).href);await page.waitForFunction(()=>grx?.built[2]&&!grx.isBusy());await frames(5);
  await gesture();check(!(await lesson()).playing,'Reduced-motion scene started on camera gesture');
  await openParts(page);await page.getByRole('button',{name:'See scan mirrors',exact:true}).click();await frames(3);await gesture('rotate','#focus-demo canvas');
  check(await page.evaluate(()=>!grx.focusDemo.state().playing),'Reduced-motion scan diagram started on rotation');
 }catch(error){failures.push(error.stack||String(error));}
 finally{await cdp?.detach();await finish(gate,failures,{states});}
}
