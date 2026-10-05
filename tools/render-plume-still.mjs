// Capture the shipped scene, including its authored gas and runtime illustration.
import {chromium} from 'playwright';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
fs.mkdirSync('.local/story-render',{recursive:true});
try{for(const [suffix,width,height] of [['',1600,1000],['-phone',780,960]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
 await page.goto(new URL('visualizer.html?view=5.light',process.env.GR_URL||'http://127.0.0.1:47601/').href);
 await page.waitForFunction(()=>window.grx?.built[5]&&!grx.isBusy());
 await page.addStyleTag({content:'#view{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;min-height:0!important;z-index:100!important}#view>:not(canvas){display:none!important}'});
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await page.evaluate(()=>{grx.setTransitions('instant');grx.overview();grx.settle();grx.built[5].teaching.seek(0,.95);});
 await page.locator('#gl').screenshot({path:`.local/story-render/plume${suffix}.png`});await page.close();
 const conversion=spawnSync('python',['-c','from PIL import Image; import sys; Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],quality=92)',`.local/story-render/plume${suffix}.png`,`public/look/plume${suffix}.webp`],{encoding:'utf8'});
 if(conversion.status)throw new Error(conversion.stderr);
}
 const inputs=['public/models/plume.glb','public/models/earth-orbits.glb','src/scenes/plume.js','src/scenes/plume-illustration.js'];
 fs.writeFileSync('research/plume-still-inputs.json',JSON.stringify({date:new Date().toLocaleDateString('en-US'),inputs:Object.fromEntries(inputs.map(file=>[file,createHash('sha256').update(fs.readFileSync(file)).digest('hex')]))},null,2)+'\n');
}finally{await browser.close();}
