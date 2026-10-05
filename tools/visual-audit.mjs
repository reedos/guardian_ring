import fs from 'node:fs';
import {openGate,finish} from './gate-common.mjs';
const form=process.argv[2]||'desktop',g=await openGate('visual-audit',form);
if(g){const {page}=g,failures=[],rows=[];const prefix=form==='phone'?'p':'d';
 fs.mkdirSync('.local/audit-1004/visuals',{recursive:true});
 const shot=name=>page.screenshot({path:`.local/audit-1004/visuals/${prefix}-${name}.png`});
 try{
  for(const id of ['orbits','satellite','payload','focal-plane','plume','ground'])for(const mode of ['light','data','heat']){
   await page.evaluate(async({id,mode})=>{await grx.go(id,{record:false});grx.setMode(mode);grx.overview();grx.settle();const t=grx.built[grx.state.scene].teaching;if(t)t.seek(0,.85);grx.setSceneActivity(false);},{id,mode});
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   const result=await page.evaluate(()=>{
    const b=grx.built[grx.state.scene],materials=[];b.asset?.traverse(o=>{if(o.isMesh&&!o.userData.printed)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.push({color:m.color?.getHexString(),opacity:m.opacity});});
    return {index:grx.state.scene,height:document.querySelector('#gl').getBoundingClientRect().height/innerHeight,materials};
   });
   if(result.height<(form==='phone'?.45:.60)-.001)failures.push(`${id}/${mode}: stage below viewport floor`);
   if(id==='plume'){
    const earth=await page.evaluate(()=>{
     const scene=grx.built[5].scene,earth=scene.getObjectByName('Earth context — historical NASA imagery, no event location');
     return !!earth?.material.map?.image&&earth.material.emissiveIntensity===0&&!!earth.userData.sourceImages&&!!scene.getObjectByName('Molecular inset backing');
    });
    if(!earth)failures.push(`plume/${mode}: credited Earth texture or readable molecule inset missing`);
   }
   if(['satellite','payload','focal-plane'].includes(id)&&mode!=='light'){
    const changed=result.materials.filter(m=>mode==='data'?m.color==='a6f35a':['84d8ff','ff786b','ffd06b','f6a1b8'].includes(m.color)).length;
    if(changed<5||!result.materials.some(m=>m.opacity===.3))failures.push(`${id}/${mode}: hardware did not visibly change`);
    rows.push({id,mode,changed});
   }else rows.push({id,mode});
   await shot(`lvl${result.index}-${id}-${mode}`);
  }
  await page.evaluate(async()=>{await grx.go('ground',{record:false});grx.setMode('data');grx.settle();});
  const antenna=await page.evaluate(()=>{const b=grx.built[6],t=b.teaching,node=b.asset.getObjectByName('GroundAntennaElevation');t.seek(0,0);const a=node.quaternion.clone();t.seek(0,.25);return a.angleTo(node.quaternion);});
  if(antenna<.05)failures.push('The authored antenna joint did not move');rows.push({antenna});
  await page.evaluate(async()=>{await grx.show({scene:'ground',mode:'data',part:'operations'});grx.built[6].teaching.seek(2,1);grx.settle();});
  await page.waitForTimeout(150);await shot('mission-10');
  const alert=await page.evaluate(()=>grx.built[6].activityDisplay.state().alert);if(!alert)failures.push('Final display has no generic alert');
  if(!await page.locator('[data-level="0"]').first().isVisible())await page.locator('#level-pick').click();
  await page.locator('[data-level="0"]:visible').first().click();
  await page.waitForFunction(()=>grx.state.scene===0&&!grx.isCameraMoving());
  const ring=await page.evaluate(()=>{const view=document.querySelector('#view'),expected=grx.built[0].overviewFrame(view.clientWidth,view.clientHeight);return grx.camera.position.distanceTo(new grx.THREE.Vector3(...expected.pos));});
  if(ring>1e-5)failures.push('Ring tab did not return to the responsive opening frame');rows.push({ringFrameError:ring});
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states:rows.length,rows});
}
