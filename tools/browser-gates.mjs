// Same gate roles and geometric tests as IF, scoped to the Phase 0 scene contract.
import { openGate,show,finish,BASE,MODES } from './gate-common.mjs';
import { checkView,fly,checkCoplanar } from './gate-geometry.mjs';
import { TIERS } from '../src/app/render-quality.js';
import fs from 'node:fs';

// A visible card must agree with the selected part, not merely contain old text.
const checkPart=({scene,mode,id})=>{
 const bad=[],{C}=grx.store,b=grx.built[grx.state.scene],sceneId=C.SCENES[grx.state.scene].id;
 const list=({light:C.PARTS,data:C.PARTS_DATA,heat:C.PARTS_HEAT})[mode][sceneId];
 const hs=({light:b.hotspots,data:b.dataHotspots,heat:b.heatHotspots})[mode];
 const rendered=el=>{if(!el)return false;for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(p.hidden||s.display==='none'||s.visibility==='hidden')return false;}const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
 if(grx.state.scene!==scene||grx.state.mode!==mode||grx.state.selected!==id)bad.push('selected view does not match request');
 if(b.model!==grx.store.M)bad.push('scene has stale scenario model');
 const pins=[...document.querySelectorAll('.pin')],buttons=[...document.querySelectorAll('#parts button[data-id]')];
 if(!list.length)bad.push('no testable parts');
 if(pins.length!==list.length||buttons.length!==list.length)bad.push('part/pin/button counts differ');
 list.forEach((part,i)=>{
  if(!hs[part.id])bad.push(`${part.id}: no hotspot`);
  const matches=pins.filter(pin=>pin.dataset.id===part.id),rows=buttons.filter(button=>button.dataset.id===part.id);
  if(matches.length!==1||rows.length!==1)bad.push(`${part.id}: missing or duplicate pin/button`);
  if(matches[0]?.querySelector('.num')?.textContent.trim()!==String(i+1)||rows[0]?.querySelector('.pn')?.textContent.trim()!==String(i+1))bad.push(`${part.id}: incorrect part number`);
 });
 const selected=list.find(part=>part.id===id),card=document.getElementById('card'),pin=pins.find(p=>p.dataset.id===id),button=buttons.find(p=>p.dataset.id===id);
 if(!rendered(card))bad.push('selected card is hidden');
 if(!selected||document.getElementById('card-t')?.textContent!==selected.title||document.getElementById('card-b')?.textContent!==selected.body)bad.push('card content does not match selected part');
 if(!rendered(pin)||pin?.classList.contains('off'))bad.push('selected pin is hidden');
 if(pin?.getAttribute('aria-pressed')!=='true'||button?.getAttribute('aria-pressed')!=='true')bad.push('selected pin/button state missing');
 if(rendered(pin)){const r=pin.querySelector('.num').getBoundingClientRect(),v=document.getElementById('view').getBoundingClientRect();if(r.left<v.left||r.right>v.right||r.top<v.top||r.bottom>v.bottom)bad.push('selected pin lies outside view');}
 return bad;
};

// Open popups are audited as their own interaction surface: they intentionally
// cover background controls. Closed-state checks still cover those controls.
const checkUI=({selector='button,select,.topbar a'})=>{
 const bad=[],label=el=>el.id||el.getAttribute('aria-label')||el.textContent.trim().slice(0,70);
 const rendered=el=>{for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(p.hidden||s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
 const nodes=[...document.querySelectorAll(selector)].filter(rendered);
 if(!nodes.length)return ['no rendered controls in audited state'];
 const intersection=(a,b)=>({left:Math.max(a.left,b.left),right:Math.min(a.right,b.right),top:Math.max(a.top,b.top),bottom:Math.min(a.bottom,b.bottom)});
 const clip=el=>{let c={left:0,right:innerWidth,top:0,bottom:innerHeight};for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),r=p.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(s.overflowX))c={...c,left:Math.max(c.left,r.left),right:Math.min(c.right,r.right)};if(/auto|scroll|hidden|clip/.test(s.overflowY))c={...c,top:Math.max(c.top,r.top),bottom:Math.min(c.bottom,r.bottom)};}return c;};
 // Compare only the portions currently exposed by scrolling containers.
 const exposed=nodes.map(el=>({el,r:intersection(el.getBoundingClientRect(),clip(el))})).filter(({r})=>r.right>r.left&&r.bottom>r.top);
 for(let i=0;i<exposed.length;i++)for(let j=i+1;j<exposed.length;j++){const a=exposed[i],b=exposed[j];if(a.el.contains(b.el)||b.el.contains(a.el))continue;const r=intersection(a.r,b.r);if(r.right-r.left>2&&r.bottom-r.top>2)bad.push(`${label(a.el)} overlaps ${label(b.el)}`);}
 const scrollables=[...document.querySelectorAll('*')].filter(el=>el.scrollHeight>el.clientHeight||el.scrollWidth>el.clientWidth).map(el=>[el,el.scrollLeft,el.scrollTop]);
 for(const el of nodes){
  // Scrollable controls may begin below the fold, but every one must be reachable.
  const locked=[];for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/hidden|clip/.test(s.overflowX)||/hidden|clip/.test(s.overflowY))locked.push([p,p.scrollLeft,p.scrollTop,s.overflowX,s.overflowY]);}
  el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  for(const [p,x,y,ox,oy] of locked)if((/hidden|clip/.test(ox)&&Math.abs(p.scrollLeft-x)>1)||(/hidden|clip/.test(oy)&&Math.abs(p.scrollTop-y)>1)){bad.push(`${label(el)}: requires scrolling a non-scrollable container`);p.scrollLeft=x;p.scrollTop=y;}
  const r=el.getBoundingClientRect(),c=clip(el);
  if(r.left<c.left-1||r.right>c.right+1||r.top<c.top-1||r.bottom>c.bottom+1)bad.push(`${label(el)}: clipped or outside viewport after scrolling`);
  const x=(r.left+r.right)/2,y=(r.top+r.bottom)/2,top=document.elementFromPoint(x,y);
  if(!top||!(el===top||el.contains(top)))bad.push(`${label(el)}: center obscured by ${top?label(top):'viewport edge'}`);
 }
 scrollables.forEach(([el,x,y])=>{el.scrollLeft=x;el.scrollTop=y;});
 if(document.documentElement.scrollWidth>innerWidth+1)bad.push('horizontal page overflow');
 return [...new Set(bad)];
};

async function settleLayout(page){
 await page.evaluate(async()=>{const animations=document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity);await Promise.all(animations.map(a=>a.finished.catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
}

export async function run(name,form=process.argv[2]||'desktop'){
 const g=await openGate(name,form);if(!g)return;const {page,scenes}=g,fail=[];let states=0;const details={};
 try {
 if(name==='cycle'||name==='parts'){
  const combos=await page.evaluate(()=>{const options=grx.scenarioOptions;return Object.entries(options).reduce((rows,[key,vs])=>rows.flatMap(row=>vs.map(v=>({...row,[key]:v.id}))),[{}]);});
  if(!combos.length)throw new Error('No scenario combinations to audit');
  for(const scenario of combos){await page.evaluate(async s=>{await grx.setScenario(s);},scenario);for(const sc of scenes)for(const mode of MODES){await show(page,sc.i,mode);const ids=await page.locator('#parts button[data-id]').evaluateAll(bs=>bs.map(b=>b.dataset.id));if(!ids.length)fail.push(`${sc.id}/${mode}: no parts`);for(let i=0;i<ids.length;i++){const id=ids[i];if(name==='parts'){await page.locator('#parts button[data-id]').nth(i).click();await page.evaluate(()=>grx.settle());}else await show(page,sc.i,mode,id);states++;const result=await page.evaluate(checkPart,{scene:sc.i,mode,id});fail.push(...result.map(error=>`${JSON.stringify(scenario)}/${sc.id}/${mode}/${id}: ${error}`));}}}
  details.scenarios=combos.length;
 } else if(name==='views'||name==='flights'||name==='coplanar'){
  if(name==='flights')await page.evaluate(()=>grx.setTransitions('quick'));
  for(const sc of scenes)for(const mode of MODES){await show(page,sc.i,mode);const parts=await page.locator('#parts button[data-id]').evaluateAll(bs=>bs.map(b=>b.dataset.id));if(!parts.length)fail.push(`${sc.id}/${mode}: no testable placeholder parts`);
   if(name==='coplanar'){const r=await page.evaluate(checkCoplanar);states++;if(r.hits.length)fail.push(`${sc.id}/${mode}: ${JSON.stringify(r.hits)}`);}
   else for(const id of parts){states++;if(name==='flights'){const r=await page.evaluate(fly,{id});if(r.hits||r.frames<2)fail.push(`${sc.id}/${mode}: ${JSON.stringify(r)}`);}else{await show(page,sc.i,mode,id);const r=await page.evaluate(checkView);if(r.err||r.blocked||r.covers.length)fail.push(`${sc.id}/${mode}: ${JSON.stringify(r)}`);}}
  }
 } else if(name==='ui'){
  const audited=[];
  const audit=async(label,selector)=>{await settleLayout(page);states++;audited.push(label);const result=await page.evaluate(checkUI,{selector});fail.push(...result.map(error=>`${label}: ${error}`));};
  for(const sc of scenes)for(const mode of MODES){await show(page,sc.i,mode,'placeholder');await audit(`${sc.id}/${mode}/parts`);}
  await show(page,0,'light','placeholder');
  await page.locator('#more-btn').click();await audit('more menu','#more-menu button,#more-menu select,#more-btn');await page.keyboard.press('Escape');
  if(await page.locator('#level-pick').isVisible()){await page.locator('#level-pick').click();await audit('level menu','#level-menu button,#level-pick');await page.keyboard.press('Escape');}
  if(await page.locator('#menu-btn').isVisible()){await page.locator('#menu-btn').click();await audit('main menu','#topnav a,#menu-btn');await page.keyboard.press('Escape');}
  await page.locator('[data-pane="scenario"]').click();await audit('scenario pane');
  const choices=await page.locator('[data-choice]').evaluateAll(bs=>bs.map(b=>({key:b.dataset.choice,value:b.dataset.value})));
  for(const {key,value} of choices){await page.locator(`[data-choice="${key}"][data-value="${value}"]`).click();await page.waitForFunction(({key,value})=>!grx.isBusy()&&grx.store.scenario[key]===value,{key,value});if(await page.locator(`[data-choice="${key}"][data-value="${value}"]`).getAttribute('aria-pressed')!=='true')fail.push(`${key}/${value}: selected choice not reflected`);}
  await page.locator('#sc-pin').click();await audit('scenario pinned');if(await page.locator('#sc-pin').getAttribute('aria-pressed')!=='true')fail.push('scenario comparison did not pin');await page.locator('#sc-pin').click();
  await page.locator('[data-pane="parts"]').click();await audit('parts after scenario');
  if(await page.locator('#sheet-toggle').isVisible()){await page.locator('#sheet-toggle').click();await audit('collapsed sheet');await page.locator('#sheet-toggle').click();await audit('expanded sheet');}
  details.uiStates=audited;
  fs.mkdirSync('shots',{recursive:true});await page.screenshot({path:`shots/scaffold-${form}.png`,fullPage:true});
 } else if(name==='perf'){
  const rows=[];await page.evaluate(()=>grx.forceTier(0,{hold:true}));
  for(const sc of scenes)for(const mode of MODES){await show(page,sc.i,mode);await page.evaluate(()=>grx.forceTier(0,{hold:true}));const r=await page.evaluate(()=>new Promise(resolve=>{const values=[];let last=performance.now(),warm=24;const tick=now=>{if(warm-->0){last=now;requestAnimationFrame(tick);return;}values.push(now-last);last=now;if(values.length<240)return requestAnimationFrame(tick);values.sort((a,b)=>a-b);const R=grx.renderer(),q=grx.quality();resolve({median:values[120],p95:values[228],calls:R.info.render.calls,triangles:R.info.render.triangles,tier:q.tiers[grx.state.scene],ratio:q.ratio});};requestAnimationFrame(tick);}));rows.push({scene:sc.id,mode,...r});states++;if(r.tier!==0)fail.push(`${sc.id}/${mode}: measured tier ${r.tier}, expected 0`);if(r.p95>(form==='phone'?7:15))fail.push(`${sc.id}/${mode}: p95 ${r.p95.toFixed(2)} ms exceeds budget`);}
  details.rows=rows;details.worstP95=Math.max(...rows.map(r=>r.p95));console.log(`Worst p95 ${details.worstP95.toFixed(2)} ms`);
 } else if(name==='govern'){
  const rows=[];
  const inspect=async(tier,label,preference=null)=>{
   const r=await page.evaluate(()=>{const R=grx.renderer(),q=grx.quality(),gl=R.getContext(),v=document.getElementById('view'),size=R.getSize(new grx.THREE.Vector2()),buffer=R.getDrawingBufferSize(new grx.THREE.Vector2());return {quality:q,tier:q.tiers[grx.state.scene],dpr:devicePixelRatio,ratio:R.getPixelRatio(),size:[size.x,size.y],view:[v.clientWidth,v.clientHeight],buffer:[buffer.x,buffer.y],canvas:[R.domElement.width,R.domElement.height],gpuBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight]};});
   const expectedRatio=Math.min(r.dpr,TIERS[tier].ratio),expectedBuffer=r.view.map(n=>Math.floor(Math.max(1,n)*expectedRatio));
   states++;rows.push({label,expectedTier:tier,expectedRatio,expectedBuffer,...r});
   if(r.tier!==tier)fail.push(`${label}: tier ${r.tier}, expected ${tier}`);
   if(preference&&r.quality.preference!==preference)fail.push(`${label}: preference ${r.quality.preference}, expected ${preference}`);
   if(Math.abs(r.ratio-expectedRatio)>1e-6||Math.abs(r.quality.ratio-expectedRatio)>1e-6)fail.push(`${label}: renderer/reported ratio ${r.ratio}/${r.quality.ratio}, expected ${expectedRatio}`);
   if(r.size.some((n,i)=>n!==Math.max(1,r.view[i])))fail.push(`${label}: renderer CSS size ${r.size} differs from view ${r.view}`);
   for(const key of ['buffer','canvas','gpuBuffer'])if(r[key].some((n,i)=>n!==expectedBuffer[i]||n<=0))fail.push(`${label}: ${key} ${r[key]}, expected ${expectedBuffer}`);
  };
  for(let tier=0;tier<TIERS.length;tier++){await page.evaluate(t=>grx.forceTier(t,{hold:true}),tier);await show(page,0,'light');await inspect(tier,`forced tier ${tier}`);}
  await page.locator('#more-btn').click();const select=page.getByRole('combobox',{name:'Rendering quality'});for(const pref of ['laptop','max','auto']){await select.selectOption(pref);await inspect(pref==='laptop'?4:0,`preference ${pref}`,pref);}
  await select.selectOption('laptop');await page.reload();await page.waitForFunction(()=>window.grx?.built[grx.state.scene]);await page.locator('#more-btn').click();if(await select.inputValue()!=='laptop')fail.push('battery-saver preference did not persist');await inspect(4,'persisted battery saver','laptop');await select.selectOption('auto');details.renderChecks=rows;
 } else if(name==='links'){
  for(const file of ['index.html','visualizer.html','evidence.html','method.html','glossary.html']){await page.goto(new URL(file,BASE).href);states++;if(!/noindex/.test(await page.locator('meta[name=robots]').getAttribute('content')))fail.push(`${file}: missing noindex`);if(await page.locator('h1').count()!==1)fail.push(`${file}: requires one h1`);const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>h&&!/^(https?:|mailto:)/.test(h)));for(const href of links){const url=new URL(href,new URL(file,BASE));const response=await page.request.get(url.href);if(!response.ok())fail.push(`${file}: ${href} HTTP ${response.status()}`);if(url.searchParams.has('view')){await page.goto(url.href);await page.waitForFunction(()=>window.grx?.built[grx.state.scene]);const expected=url.searchParams.get('view').split('.');const state=await page.evaluate(()=>grx.state);if(state.scene!==Number(expected[0])||state.mode!==expected[1]||state.selected!==expected[2])fail.push(`${href}: did not land on the part`);}}}

  // A source-reading detour must retain all four scenario choices.
  const wanted={orbit:'leo',aperture:'civil',band:'lwir',detector:'qwip'};
  await page.goto(new URL('visualizer.html?'+new URLSearchParams(wanted),BASE).href);
  await page.waitForFunction(()=>window.grx?.built[grx.state.scene]);
  for(const file of ['index.html','evidence.html','method.html','glossary.html','visualizer.html']){
   await page.locator('nav a[href^="'+file+'"]').first().click();
   await page.waitForURL(url=>url.pathname.endsWith('/'+file));states++;
   const query=new URL(page.url()).searchParams;
   for(const [key,value]of Object.entries(wanted))if(query.get(key)!==value)fail.push(file+': lost '+key+' during navigation');
  }
  await page.waitForFunction(()=>window.grx?.built[grx.state.scene]);
  const restored=await page.evaluate(()=>grx.store.scenario);
  for(const [key,value]of Object.entries(wanted))if(restored[key]!==value)fail.push('return to explorer: '+key+' not restored');
 } else if(name==='shot'){fs.mkdirSync('shots',{recursive:true});await page.screenshot({path:`shots/scaffold-${form}.png`,fullPage:true});states++;}
 else throw new Error(`Unknown gate: ${name}`);
 } catch(e){fail.push(e.stack||String(e));}
 await finish(g,fail,{states,...details});
}
