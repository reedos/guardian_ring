// Deterministic virtual-day render. Only GEO is shown so the last-to-first
// transition closes without changing the other families' orbital periods.
import {openGate,show,finish} from './gate-common.mjs';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
if(!process.env.GR_URL)throw Error('Set GR_URL to an isolated built-preview port');
const g=await openGate('render-ring-loop','desktop'),failures=[];
if(!g)throw Error('GPU unavailable');
fs.mkdirSync('.local/ring-loop',{recursive:true});
try{
  await g.page.setViewportSize({width:1280,height:800});
  await show(g.page,0,'light');
  await g.page.addStyleTag({content:'#view{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;min-height:0!important;z-index:100!important}#view>:not(canvas){display:none!important}'});
  await g.page.evaluate(()=>{grx.overview();grx.settle();const b=grx.built[0];b.setMotion(false);for(const family of ['heo','meo','leo'])b.setFamily(family,false);});
  for(let frame=0;frame<240;frame++){
    await g.page.evaluate(f=>{grx.built[0].seekDay(f/240);},frame);
    await g.page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await g.page.locator('#gl').screenshot({path:`.local/ring-loop/${String(frame).padStart(4,'0')}.png`});
  }
  const result=spawnSync('ffmpeg',['-y','-framerate','30','-i','.local/ring-loop/%04d.png','-an','-c:v','libx264','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart','public/look/ring-loop.mp4'],{encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr);
}catch(error){failures.push(error.stack||String(error));}
finally{await finish(g,failures,{states:240});}
