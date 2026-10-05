import fs from 'node:fs';
import {openGate,finish} from './gate-common.mjs';
const form=process.argv[2]||'desktop',g=await openGate('story-audit',form,{returning:false});
if(g){const {page}=g,failures=[],chapters=new Map();let states=0;
 try{
  await page.evaluate(()=>grx.setTransitions('full'));
  const began=Date.now();let done=false,launchRise=0,launchLow=Infinity,launchHigh=-Infinity;
  fs.mkdirSync('.local/audit-1004/story',{recursive:true});
  while(Date.now()-began<115000){
   const s=await page.evaluate(()=>{
    const m=grx.mission.state(),b=grx.built[grx.state.scene],caption=document.querySelector('.mission-active-panel');
    return {...m,height:document.querySelector('#gl').getBoundingClientRect().height/innerHeight,
     copy:document.querySelector('.mission-copy').innerText,words:caption.innerText.trim().split(/\s+/).length,
     lesson:b?.teaching?.state(),alert:b?.activityDisplay?.state().alert,
     plume:b?.scene.getObjectByName('Illustrative rising emission — no trajectory scale')?.position.y};
   });
   if(s.active&&!s.loading){
    states++;
    if(s.height<(form==='phone'?.45:.60)-.001)throw new Error(`Chapter ${s.index}: stage below height floor`);
    if(/\b(illustrative|representative)\b/i.test(s.copy))throw new Error(`Scope disclaimer repeated in primary caption: ${s.copy}`);
    if(s.words>=40)throw new Error(`Chapter ${s.index}: ${s.words} words in visible mission bar`);
    if(!chapters.has(s.index))chapters.set(s.index,{title:s.chapter.title,begin:Date.now()-began,phases:[],maxWords:0});
    const row=chapters.get(s.index);row.maxWords=Math.max(row.maxWords,s.words);
    if(s.lesson&&!row.phases.includes(s.lesson.step.id))row.phases.push(s.lesson.step.id);
    if(!row.shot&&!s.establishing&&!await page.evaluate(()=>grx.isCameraMoving())){
     row.shot=true;await page.screenshot({path:`.local/audit-1004/story/${form==='phone'?'p':'d'}-mission-${String(s.index+1).padStart(2,'0')}.png`});
    }
    if(s.chapter.event==='launch'&&Number.isFinite(s.plume)){launchLow=Math.min(launchLow,s.plume);launchHigh=Math.max(launchHigh,s.plume);launchRise=launchHigh-launchLow;}
    if(s.completed){
     if(!s.alert)throw new Error('The mission ended without a visible generic alert on the authored display');
     await page.screenshot({path:`.local/audit-1004/story/${form==='phone'?'p':'d'}-mission-10.png`});
     done=true;break;
    }
   }
   await page.waitForTimeout(200);
  }
  if(!done)failures.push('Autoplay did not complete within 115 seconds');
  if(chapters.size!==10)failures.push(`Only ${chapters.size} chapters played`);
  if(launchRise<1)failures.push(`The launch did not visibly rise: ${launchRise}`);
  for(const [index,row] of chapters){const next=chapters.get(index+1);if(next&&next.begin-row.begin>(index===0?15000:11500))failures.push(`${row.title} exceeded its chapter pacing allowance, including camera and loading`);}
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states,chapters:[...chapters.values()]});
}
