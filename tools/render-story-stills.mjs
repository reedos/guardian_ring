// Rebuild before capture so source hashes cannot certify an old preview bundle.
import {openGate,show,finish} from './gate-common.mjs';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {assetInputs,hash} from './story-asset-inputs.mjs';
if(!process.env.GR_URL)throw Error('Set GR_URL to your isolated built-preview port');
for(const command of [['node_modules/tsx/dist/cli.mjs','tools/write-pages.mjs'],['node_modules/vite/bin/vite.js','build']]){
  const result=spawnSync(process.execPath,command,{stdio:'inherit'});
  if(result.status!==0)throw Error('Fresh production build failed');
}
const response=await fetch(new URL('visualizer.html',process.env.GR_URL));
if(!response.ok||await response.text()!==fs.readFileSync('dist/visualizer.html','utf8'))throw Error('GR_URL does not serve this current production build');
const inputs=assetInputs(),outputs={};
fs.mkdirSync('.local/story-render',{recursive:true});
// Hardware stills come from the shipped GLBs in Blender (Cycles, AgX, authored lighting and
// orthographic fit), the pipeline of the committed originals. A WebGL capture of the explorer
// scene is far dimmer and smaller in frame, so it is used only for the ring and plume views.
const blender=process.env.BLENDER||'C:/Program Files/Blender Foundation/Blender 5.2/blender.exe';
const hardware=['satellite','payload','focal-plane','pixel'];
const render=spawnSync(blender,['--background','--python','tools/blender/render-authored.py','--',...hardware],{stdio:'inherit'});
if(render.status!==0)throw Error('Blender story render failed');
for(const name of hardware)for(const suffix of ['','-phone']){
  const webp=`public/look/${name}${suffix}.webp`;
  const result=spawnSync('python',['-c','from PIL import Image; import sys; Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"WEBP",quality=92,method=6)',`research/look/renders/${name}${suffix}.png`,webp],{encoding:'utf8'});
  if(result.status!==0)throw Error(result.stderr);
  outputs[webp]=hash(webp);
}
const g=await openGate('render-story-stills','desktop'),failures=[];
if(!g)throw Error('GPU unavailable');
try{
  for(const [suffix,width,height] of [['',1600,1000],['-phone',780,960]]){
    await g.page.setViewportSize({width,height});
    await g.page.addStyleTag({content:'#view{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;min-height:0!important;z-index:100!important}#view>:not(canvas){display:none!important}'});
    for(const [i,name] of [[0,'ring'],[5,'plume']]){
      await show(g.page,i,'light');
      await g.page.evaluate(i=>{grx.overview();grx.settle();grx.built[i].teaching?.seek(0,.95);},i);
      await g.page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      const png=`.local/story-render/${name}${suffix}.png`,webp=`public/look/${name}${suffix}.webp`;
      await g.page.locator('#gl').screenshot({path:png});
      const result=spawnSync('python',['-c','from PIL import Image; import sys; Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],quality=92)',png,webp],{encoding:'utf8'});
      if(result.status!==0)throw Error(result.stderr);
      outputs[webp]=hash(webp);
    }
  }
  if(JSON.stringify(inputs)!==JSON.stringify(assetInputs()))throw Error('Inputs changed during render');
  fs.writeFileSync('research/story-still-inputs.json',JSON.stringify({renderedAt:new Date().toISOString(),inputs,outputs},null,2)+'\n');
}catch(error){failures.push(error.stack||String(error));}
finally{await finish(g,failures,{states:Object.keys(outputs).length});}
