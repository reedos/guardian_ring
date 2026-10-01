import fs from 'node:fs';
import { openGate,show,finish,MODES } from './gate-common.mjs';
const id=process.argv[2]||'orbits',form=process.argv[3]||'desktop';
const gate=await openGate('scene-shot',form);
if(gate){
  const failures=[];let states=0;
  try{
    const scene=gate.scenes.find(s=>s.id===id);if(!scene)throw new Error(`Unknown scene ${id}`);
    fs.mkdirSync('shots',{recursive:true});
    for(const mode of MODES){await show(gate.page,scene.i,mode);await gate.page.screenshot({path:`shots/${id}-${mode}-${form}.png`,fullPage:true});states++;}
  }catch(e){failures.push(e.stack||String(e));}
  await finish(gate,failures,{states});
}
