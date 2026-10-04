import {openGate,finish} from './gate-common.mjs';
import {checkUI} from './gate-ui.mjs';
import fs from 'node:fs';
const form=process.argv[2]||'desktop',g=await openGate('controls-audit',form,{returning:false});
if(g){const {page}=g,failures=[],rows=[];
 const check=(ok,message)=>{if(!ok)failures.push(message);};
 try{
  await page.waitForFunction(()=>grx.mission.state().active&&!grx.isCameraMoving());
  const visible=await page.evaluate(()=>[...document.querySelectorAll('button,a[href],input,select,summary')].filter(el=>{
   if(!el.checkVisibility())return false;
   let r=el.getBoundingClientRect();
   if(r.width<=0||r.height<=0)return false;
   for(let n=el;n;n=n.parentElement){const s=getComputedStyle(n);if(n.hidden||Number(s.opacity)===0)return false;}
   return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&el.contains(document.elementFromPoint(Math.max(0,Math.min(innerWidth-1,(r.left+r.right)/2)),Math.max(0,Math.min(innerHeight-1,(r.top+r.bottom)/2))));
  }).map(el=>el.id||el.getAttribute('aria-label')||el.textContent.trim()));
  rows.push({firstLoadControls:visible});check(visible.length<=(form==='phone'?12:20),`First load has ${visible.length} controls: ${visible.join(', ')}`);
  fs.mkdirSync('.local/controls-audit',{recursive:true});await page.screenshot({path:`.local/controls-audit/${form}-first.png`});
  await page.evaluate(()=>grx.mission.stop());
  const height=await page.locator('#gl').evaluate(el=>el.getBoundingClientRect().height);
  for(const family of ['geo','heo','meo','leo','all']){
   await page.locator(`[data-family="${family}"]`).click();
   const state=await page.evaluate(()=>grx.built[0].families());
   check(Object.entries(state).every(([id,on])=>on===(family==='all'||id===family)),`${family}: family chips are not exclusive`);
   check(Math.abs(await page.locator('#gl').evaluate(el=>el.getBoundingClientRect().height)-height)<1,'Orbit chip changed canvas height');
   rows.push({family,height});
  }
  await page.evaluate(()=>grx.built[0].setMotion(true));
  await page.locator('#orbit-time').focus();
  await page.keyboard.down('Home');
  const scrubbed=await page.evaluate(()=>({moving:grx.built[0].motion(),progress:grx.built[0].dayProgress()}));
  check(!scrubbed.moving&&scrubbed.progress<.001,'Day scrubber did not pause and seek to the beginning');
  await page.keyboard.up('Home');
  check(await page.evaluate(()=>grx.built[0].motion()),'Day scrubber did not restore running motion');
  rows.push({scrubber:scrubbed});
  await page.evaluate(async()=>{await grx.go('payload',{record:false});grx.setTransitions('instant');grx.overview();grx.settle();});
  if(form==='phone')await page.locator('#tab-parts').click();
  check(await page.locator('#gl').evaluate(el=>el.getBoundingClientRect().height/innerHeight)>=(form==='phone'?.45:.60)-.001,'Parts sheet shrank the canvas below its viewport floor');
  failures.push(...await page.evaluate(checkUI,{}));
  await page.locator('#card-next').click();
  await page.waitForFunction(()=>!grx.isCameraMoving()&&grx.built[2].teaching.state().playing);
  const start=await page.evaluate(()=>({selected:grx.state.selected,...grx.built[2].teaching.state()}));
  await page.waitForFunction(()=>!grx.built[2].teaching.state().playing);
  const end=await page.evaluate(()=>({selected:grx.state.selected,...grx.built[2].teaching.state()}));
  check(end.selected===start.selected&&end.index===start.index&&end.progress===1,'Next did not play exactly one part activity');
  rows.push({part:start.selected,phase:start.index,completed:end.progress});
  await page.screenshot({path:`.local/controls-audit/${form}-parts.png`});
  await page.emulateMedia({reducedMotion:'reduce'});
  const reducedURL=new URL(page.url());reducedURL.search='?view=2.light';
  await page.goto(reducedURL.href);
  await page.waitForFunction(()=>window.grx?.built[2]&&!grx.isBusy());
  await page.locator('#card-next').click();
  await page.waitForFunction(()=>!grx.isCameraMoving()&&grx.built[2].teaching.state().progress===.72);
  const reduced=await page.evaluate(()=>({selected:grx.state.selected,...grx.built[2].teaching.state()}));
  check(!reduced.playing&&reduced.progress===.72,'Reduced-motion Next did not retain a useful stationary pose');
  rows.push({reduced:reduced.selected,progress:reduced.progress});
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states:rows.length,rows});
}
