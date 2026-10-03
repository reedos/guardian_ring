import { chromium } from 'playwright';
import fs from 'node:fs';
import { openLifecycleBrowser } from './lifecycle-browser.mjs';
export const BASE=process.env.GR_URL||'http://127.0.0.1:47601/';
export const MODES=['light','data','heat'];
export async function openGate(name,form='desktop') {
  const gate={browser:null,page:null,errors:[],scenes:[],gpu:'unavailable',name,form};
  try {
  // Exhaustive state checks still await rendered frames, but need not wait for
  // display refresh. Camera flights and interaction gates retain normal timing.
  const uncapped=['perf','cycle','parts'].includes(name);
  const pageOptions=form==='phone'?{viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900},deviceScaleFactor:1};
  const lifecycle=name==='activity'?await openLifecycleBrowser(pageOptions):null;
  const browser=lifecycle?.browser||await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist',...(uncapped?['--disable-gpu-vsync','--disable-frame-rate-limit']:[])]});
  gate.browser=browser;
  if(lifecycle){gate.closeBrowser=lifecycle.close;gate.restoreLifecycleVisibility=lifecycle.restoreVisibility;}
  const page=lifecycle?.page||await browser.newPage(pageOptions);
  gate.page=page;page.setDefaultTimeout(15000);
  const errors=gate.errors;page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.goto(new URL('visualizer.html',BASE).href);
  await page.waitForFunction(()=>window.grx?.built[window.grx.state.scene],null,{timeout:90000});
  await page.evaluate(()=>{grx.setTransitions('instant');grx.settle();});
  const gpu=await page.evaluate(()=>{const gl=grx.renderer().getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):'unknown';});
  gate.gpu=gpu;
  if(/swiftshader|software|basic render|unknown/i.test(gpu))throw new Error(`Real GPU required: ${gpu}`);
  console.log(`${name}/${form}: ${gpu}`);
  let scenes=await page.evaluate(()=>grx.store.C.SCENES.map((s,i)=>({i,id:s.id,ready:!!s.ready})));
  if(process.env.GR_LEVELS){const requested=process.env.GR_LEVELS.split(',');scenes=scenes.filter(s=>requested.includes(s.id)||requested.includes(String(s.i)));}
  if(!scenes.length)throw new Error('No scenes available for gate coverage');
  gate.scenes=scenes;return gate;
  } catch(error) {
    await finish(gate,[error.stack||String(error)],{states:0,phase:'startup'});
    return null;
  }
}
export async function show(page,scene,mode,part=null){await page.evaluate(async view=>{await grx.show(view,{scroll:false});grx.settle();},{scene,mode,part});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));}
export async function finish(gate,failures=[],details={}){
  failures.push(...gate.errors);fs.mkdirSync('.local/gates',{recursive:true});
  const report={gate:gate.name,form:gate.form,status:failures.length?'FAIL':'PASS',date:new Date().toISOString(),url:BASE,gpu:gate.gpu,scope:process.env.GR_LEVELS||'all implemented and reserved levels',scenes:gate.scenes,...details,failures};
  fs.writeFileSync(`.local/gates/${gate.name}-${gate.form}.json`,JSON.stringify(report,null,2));
  if(process.env.GR_LEVELS){
    const archive=`.local/gates/levels/${process.env.GR_LEVELS.replace(/[^a-z0-9,-]/gi,'_')}`;
    fs.mkdirSync(archive,{recursive:true});
    fs.writeFileSync(`${archive}/${gate.name}-${gate.form}.json`,JSON.stringify(report,null,2));
  }
  console.log(`${report.status}: ${failures.length} problems${details.states?`; ${details.states} states`:''}`);for(const f of failures)console.error(f);
  try { if(gate.closeBrowser)await gate.closeBrowser();else await gate.browser?.close(); } finally { if(failures.length)process.exitCode=1; }
}
