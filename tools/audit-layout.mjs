import {openGate,show,finish} from './gate-common.mjs';
import fs from 'node:fs';
import {checkOrbitFollow} from './gate-orbit-follow.mjs';
import {titleContrast} from './gate-title-contrast.mjs';
import {checkUI} from './gate-ui.mjs';
const form=process.argv[2]||'desktop',g=await openGate('audit-layout',form);
if(g){
 const {page,scenes}=g,failures=[],rows=[];
 const directory='.local/audit-1004/glitches';fs.mkdirSync(directory,{recursive:true});
 const prefix=form==='phone'?'p':'d';
 const check=async label=>{
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const row=await page.evaluate(()=>{
   const height=document.querySelector('#gl').getBoundingClientRect().height;
   const detached=[...document.querySelectorAll('.pin:not(.off):not(.hide-lbl)')].flatMap(pin=>{
    const label=pin.querySelector('.lbl');if(!label.checkVisibility())return [];
    const p=pin.querySelector('.num').getBoundingClientRect(),b=label.getBoundingClientRect(),x=(p.left+p.right)/2,y=(p.top+p.bottom)/2;
    const distance=Math.hypot(Math.max(b.left,Math.min(b.right,x))-x,Math.max(b.top,Math.min(b.bottom,y))-y);
    return distance>220.5?[{id:pin.dataset.id,distance}]:[];
   });
   return {height,viewport:innerHeight,detached};
  });
  rows.push({label,...row});
  if(row.height<row.viewport*(form==='phone'?.45:.60)-1)failures.push(`${label}: stage ${row.height}px is below viewport floor`);
  if(row.detached.length)failures.push(`${label}: detached labels ${JSON.stringify(row.detached)}`);
 };
 try{
  for(const sc of scenes)for(const mode of ['light','data','heat']){
   await show(page,sc.i,mode);await check(`${sc.id}/${mode}/selected`);
   await page.evaluate(()=>{document.querySelector('.panel-scroll').scrollTop=500;grx.overview();grx.settle();});
   await check(`${sc.id}/${mode}/overview`);
   failures.push(...(await page.evaluate(checkUI,{})).map(problem=>`${sc.id}/${mode}: ${problem}`));
   await page.screenshot({path:`${directory}/${prefix}-lvl${sc.i}-${sc.id}-${mode}.png`});
   const contrast=await titleContrast(page);
   if(!contrast.hidden&&contrast.p95>.18)failures.push(`${sc.id}/${mode}: title backing p95 luminance ${contrast.p95} exceeds .18`);
   if(await page.locator('.panel-scroll').evaluate(el=>el.scrollTop)>1)failures.push(`${sc.id}/${mode}: overview retains scroll`);
   for(const open of [true,false]){
    await page.evaluate(open=>{document.body.classList.toggle('sheet-open',open);},open);
    await check(`${sc.id}/${mode}/sheet-${open}`);
    if(open&&sc.id==='payload'&&mode==='light')await page.screenshot({path:`${directory}/${prefix}-sheet-open.png`});
   }
   const teaching=await page.evaluate(()=>grx.built[grx.state.scene].teaching?.state().total||0);
   for(let i=0;i<teaching;i++){
    await page.evaluate(i=>{const t=grx.built[grx.state.scene].teaching;t.seek(i);t.play();},i);
    await check(`${sc.id}/${mode}/sequence-${i}`);
   }
   if(teaching<3&&await page.locator('#animation-controls [data-action]:visible').count())failures.push(`${sc.id}/${mode}: redundant short-lesson controls`);
  }
  await show(page,0,'light');
  const follow=await checkOrbitFollow(page);failures.push(...follow.failures);
  await page.locator('.orbit-playback-note').evaluate(el=>el.open=true);await check('expanded-follow');
  await page.evaluate(()=>grx.mission.start());await page.evaluate(()=>grx.mission.pause());
  for(let i=0;i<10;i++){
   await page.waitForFunction(()=>!grx.isBusy()&&!grx.isCameraMoving());await check(`mission-${i+1}`);
   await page.screenshot({path:`${directory}/${prefix}-mission-${String(i+1).padStart(2,'0')}.png`});
   if(i<9)await page.evaluate(()=>grx.mission.next());
  }
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states:rows.length,rows});
}
