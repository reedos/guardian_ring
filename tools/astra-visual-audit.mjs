import {openGate, show, finish} from './gate-common.mjs';
import fs from 'node:fs';
const phase=process.argv[2]||'before';
if(!['before','after'].includes(phase))throw Error('Use before or after');
const directory=`shots/astra-gr1/${phase}`;
fs.mkdirSync(directory,{recursive:true});
for(const [form,width,height] of [['desktop',1440,900],['phone',360,844]]){
  const gate=await openGate('astra-visual-audit',form),failures=[];
  if(!gate)continue;
  const {page}=gate;
  try{
    await page.setViewportSize({width,height});
    for(const scene of gate.scenes){
      await show(page,scene.i,'light');
      await page.evaluate(()=>{grx.overview();grx.settle();});
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))failures.push(`${scene.id}: document overflow at ${width}px`);
      await page.screenshot({path:`${directory}/${form}-${scene.id}.png`});
    }
    await page.evaluate(()=>grx.cinematic.open('calibration'));
    for(const [beat,seconds] of [['references',18],['comparison',28]]){
      await page.evaluate(seconds=>grx.cinematic.seek(seconds),seconds);
      await page.screenshot({path:`${directory}/${form}-calibration-${beat}.png`});
    }
    await page.evaluate(()=>grx.cinematic.close());
    if(phase==='before'){
      // Public reference is read-only; retain an exact screenshot for comparison.
      await page.goto('https://reedos.dev/intelligence_factory/',{waitUntil:'networkidle',timeout:60000});
      await page.screenshot({path:`${directory}/${form}-live-if.png`});
    }
  }catch(error){failures.push(error.stack||String(error));}
  finally{await finish(gate,failures,{states:gate.scenes.length+2});}
}
