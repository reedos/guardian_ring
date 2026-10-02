// Same gate roles and geometric tests as IF, against the Guardian Ring scene contract.
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
 const picker=document.getElementById('part-select'),expectedOptions=[['','0. Overview'],...list.map((part,i)=>[part.id,`${i+1}. ${part.title}`])];
 if(!picker||JSON.stringify([...picker.options].map(option=>[option.value,option.textContent]))!==JSON.stringify(expectedOptions))bad.push('part picker options do not match this level/layer');
 if(picker?.value!==id)bad.push('part picker is not synchronized with selected card');
 if(!rendered(card))bad.push('selected card is hidden');
 if(!selected||document.getElementById('card-t')?.textContent!==selected.title||document.getElementById('card-b')?.textContent!==selected.body)bad.push('card content does not match selected part');
 const title=document.getElementById('card-t'),role=document.getElementById('card-k');
 if(!(title.compareDocumentPosition(role)&Node.DOCUMENT_POSITION_FOLLOWING)||role.textContent!==selected?.kicker)bad.push('component name is not followed by its function');
 const components=selected?.components||[],anatomy=[...document.querySelectorAll('#card-components .component-detail')];
 if(anatomy.length!==components.length)bad.push('assembly component details are missing or stale');
 components.forEach((component,i)=>{
  const article=anatomy[i];
  if(article?.dataset.component!==component.id||article?.querySelector('h5')?.textContent!==component.title||article?.querySelector('.component-role')?.textContent!==(component.role||undefined))bad.push(`${component.id}: component name/function mismatch`);
  const keys=[...(article?.querySelectorAll('[data-src]')||[])].map(el=>el.dataset.src);
  if(JSON.stringify(keys)!==JSON.stringify((component.specs||[]).map((_,n)=>`component:${sceneId}:${id}:${component.id}:${n}`)))bad.push(`${component.id}: component evidence is not synchronized`);
 });
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
  const textureCounts=[];
  for(const [scenarioIndex,scenario] of combos.entries()){
   const scenarioStarted=Date.now();
   if(scenarioIndex===0)console.log(`${name}: checking all ${combos.length} scenarios`);
   await page.evaluate(async s=>{await grx.setScenario(s);},scenario);
   for(const sc of scenes)for(const mode of MODES){
    await show(page,sc.i,mode);
    const ids=await page.locator('#parts button[data-id]').evaluateAll(bs=>bs.map(b=>b.dataset.id));
    if(!ids.length)fail.push(`${sc.id}/${mode}: no parts`);
    for(let i=0;i<ids.length;i++){
     const id=ids[i];
     if(name==='parts'){await page.locator('#parts button[data-id]').nth(i).click();await page.evaluate(()=>grx.settle());}
     else await page.evaluate(async id=>{grx.select(id);grx.settle();await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},id);
     states++;
     const result=await page.evaluate(checkPart,{scene:sc.i,mode,id});
     fail.push(...result.map(error=>`${JSON.stringify(scenario)}/${sc.id}/${mode}/${id}: ${error}`));
    }
   }
   if(name==='cycle'){
    // The first complete traversal uploads every scene's textures. Each
    // scenario rebuild must then replace its printed labels without growth.
    const textures=await page.evaluate(()=>grx.renderer().info.memory.textures);
    textureCounts.push(textures);
    if(!Number.isInteger(textures)||textures<0)fail.push(`scenario ${scenarioIndex+1}: invalid texture count ${textures}`);
    else if(textures!==textureCounts[0])fail.push(`scenario ${scenarioIndex+1}: ${textures} textures after complete traversal; baseline ${textureCounts[0]}`);
   }
   console.log(`${name}: ${scenarioIndex+1}/${combos.length} scenarios complete; ${states} selections; ${((Date.now()-scenarioStarted)/1000).toFixed(1)}s`);
  }
  if(name==='cycle'){details.textureBaseline=textureCounts[0];details.textureCounts=textureCounts;}
  details.scenarios=combos.length;
 } else if(name==='views'||name==='flights'||name==='coplanar'){
  if(name==='flights')await page.evaluate(()=>grx.setTransitions('quick'));
  for(const sc of scenes)for(const mode of MODES){if(name==="flights")console.log(`Flights: ${sc.id}/${mode}`);await show(page,sc.i,mode);const parts=await page.locator('#parts button[data-id]').evaluateAll(bs=>bs.map(b=>b.dataset.id));if(!parts.length)fail.push(`${sc.id}/${mode}: no testable placeholder parts`);
   if(name==='coplanar'){const r=await page.evaluate(checkCoplanar);states++;if(r.hits.length)fail.push(`${sc.id}/${mode}: ${JSON.stringify(r.hits)}`);}
   else if(name==='flights'){
    const moves=[...parts.map(to=>({from:null,to})),...parts.flatMap(from=>parts.filter(to=>to!==from).map(to=>({from,to})))];
    for(const {from,to}of moves){
     // Reset the start pose immediately; only the requested flight is measured.
     await page.evaluate(()=>grx.setTransitions('instant'));
     await show(page,sc.i,mode,from);
     if(from===null)await page.evaluate(()=>{grx.overview();grx.settle();});
     await page.evaluate(()=>grx.setTransitions('quick'));
     const r=await page.evaluate(fly,{id:to});states++;
     if(states%50===0)console.log(`Flights: ${states} routes checked (${sc.id}/${mode})`);
     if(r.hits||(r.motionRequired&&r.frames<2)){
      const problem=`${sc.id}/${mode}/${from||'overview'} → ${to}: ${JSON.stringify(r)}`;
      fail.push(problem);console.error(problem);
     }
    }
   }else for(const id of parts){states++;await show(page,sc.i,mode,id);const r=await page.evaluate(checkView);if(r.err||r.blocked||r.covers.length)fail.push(`${sc.id}/${mode}: ${JSON.stringify(r)}`);}
  }
  if(name==='flights')details.flightCoverage='overview-to-each plus every ordered distinct part pair within each level/layer';
 } else if(name==='ui'){
  const audited=[];
  const audit=async(label,selector)=>{await settleLayout(page);states++;audited.push(label);const result=await page.evaluate(checkUI,{selector});fail.push(...result.map(error=>`${label}: ${error}`));};
  for(const sc of scenes)for(const mode of MODES){
   await show(page,sc.i,mode);await audit(`${sc.id}/${mode}/parts`);
   // Exercise the native picker against every distinct level/layer list, then
   // check both transport directions from an unselected overview.
   const ids=await page.locator('#parts button[data-id]').evaluateAll(bs=>bs.map(button=>button.dataset.id));
   const inspect=async(id,label)=>{await page.evaluate(()=>grx.settle());const result=await page.evaluate(checkPart,{scene:sc.i,mode,id});states++;audited.push(`${sc.id}/${mode}/${label}`);fail.push(...result.map(error=>`${sc.id}/${mode}/${label}: ${error}`));};
   await page.getByRole('combobox',{name:'Selected part'}).selectOption(ids.at(-1));await inspect(ids.at(-1),'pick last part');
   await page.locator('#part-select').selectOption('');await page.evaluate(()=>grx.settle());
   const overview=await page.evaluate(()=>({selected:grx.state.selected,cardHidden:document.getElementById('card').hidden,pressed:document.querySelectorAll('#parts [aria-pressed="true"],#pins [aria-pressed="true"]').length,camera:grx.camera.position.toArray(),expected:grx.built[grx.state.scene].camera.pos}));
   states++;audited.push(`${sc.id}/${mode}/overview`);
   if(overview.selected!==null||!overview.cardHidden||overview.pressed||overview.camera.some((v,i)=>Math.abs(v-overview.expected[i])>1e-6))fail.push(`${sc.id}/${mode}: overview did not restore camera and clear part/card/pins`);
   await page.locator('#card-prev').click();await inspect(ids.at(-1),'previous from overview');
   await page.locator('#card-next').click();await inspect(ids[0],'next wraps to first');
  }
  // Use the actual layer controls: layers may have different part IDs. A layer
  // switch must choose a valid card rather than leave a stale selection hidden.
  for(const sc of scenes){
   await show(page,sc.i,'light');
   for(const mode of ['data','heat','light']){
    await page.locator(`[data-mode="${mode}"]`).click();
    const id=await page.evaluate(()=>grx.state.selected);
    const result=await page.evaluate(checkPart,{scene:sc.i,mode,id});states++;
    fail.push(...result.map(error=>`${sc.id}/${mode}/layer-switch: ${error}`));
   }
  }
  // A layer may expose another face or electronics assembly of the same part.
  // Exercise the actual layer button, not show()'s explicit part flight.
  if(scenes.some(scene=>scene.id==='payload'))for(const [id,mode] of [['scan-system','data'],['thermal','heat']]){
   await show(page,2,'light',id);await page.locator(`[data-mode="${mode}"]`).click();await page.evaluate(()=>grx.settle());
   const result=await page.evaluate(checkPart,{scene:2,mode,id}),view=await page.evaluate(checkView);states++;
   fail.push(...result.map(error=>`payload/${id}/layer-button: ${error}`));
   if(view.blocked||view.covers?.length)fail.push(`payload/${id}/layer-button: ${JSON.stringify(view)}`);
  }
  for(const sc of scenes){
   await show(page,sc.i,'light');await page.locator('#more-btn').focus();await page.keyboard.press('Enter');
   const focused=await page.evaluate(()=>{const menu=document.getElementById('more-menu'),active=document.activeElement;return menu.contains(active)&&active.checkVisibility();});
   if(!focused)fail.push(`${sc.id}: More did not focus a visible choice`);
   await audit(`${sc.id}/more menu`,'#more-menu button,#more-menu select,#more-btn');await page.keyboard.press('Escape');
   if(!await page.locator('#more-btn').evaluate(el=>el===document.activeElement))fail.push(`${sc.id}: Escape did not return focus to More`);
  }
  await show(page,0,'light','placeholder');
  if(await page.locator('#level-pick').isVisible()){await page.locator('#level-pick').click();await audit('level menu','#level-menu button,#level-pick');await page.keyboard.press('Escape');}
  if(await page.locator('#menu-btn').isVisible()){await page.locator('#menu-btn').click();await audit('main menu','#topnav a,#menu-btn');await page.keyboard.press('Escape');}
  await page.locator('[data-pane="scenario"]').click();await audit('scenario pane');
  const choices=await page.locator('[data-choice]').evaluateAll(bs=>bs.map(b=>({key:b.dataset.choice,value:b.dataset.value})));
  for(const {key,value} of choices){await page.locator(`[data-choice="${key}"][data-value="${value}"]`).click();await page.waitForFunction(({key,value})=>!grx.isBusy()&&grx.store.scenario[key]===value,{key,value});if(await page.locator(`[data-choice="${key}"][data-value="${value}"]`).getAttribute('aria-pressed')!=='true')fail.push(`${key}/${value}: selected choice not reflected`);}
  const choose=async values=>{for(const [key,value]of Object.entries(values)){await page.locator(`[data-choice="${key}"][data-value="${value}"]`).click();await page.waitForFunction(({key,value})=>!grx.isBusy()&&grx.store.scenario[key]===value,{key,value});}};
  const savedScenario={orbit:'geo',aperture:'representative',band:'mwir',detector:'hgcdte'};
  await choose(savedScenario);await page.locator('#sc-pin').click();await audit('scenario pinned');
  if(await page.locator('#sc-pin').getAttribute('aria-pressed')!=='true')fail.push('scenario comparison did not pin');
  const saved=await page.evaluate(()=>Object.fromEntries(Object.entries(grx.store.pinned.claims).map(([id,row])=>[id,row[1]])));
  await choose({orbit:'leo',aperture:'civil',band:'lwir',detector:'qwip'});await audit('pinned comparison after changes');
  const ids=['orbitPeriodSeconds','lightTimeSeconds','photonEnergyJ','diffractionRadians','bandRadianceWm2Sr'];
  const current=await page.evaluate(()=>Object.fromEntries(Object.entries(grx.store.M.claims).map(([id,row])=>[id,row[1]])));
  for(const id of ids){
   const row=page.locator(`[data-comparison-claim="${id}"]`);
   if(await row.locator('[data-comparison-side="pinned"] .comparison-value').innerText()!==saved[id])fail.push(`${id}: pinned value changed`);
   const now=await row.locator('[data-comparison-side="current"] .comparison-value').innerText();
   if(now!==(current[id]||'Unavailable'))fail.push(`${id}: current comparison value is stale`);
   if(id==='diffractionRadians'&&await row.locator('[data-comparison-side="current"] [data-src]').count())fail.push('unavailable civil diffraction has an evidence chip');
  }
  for(const id of ['orbitPeriodSeconds','lightTimeSeconds','photonEnergyJ','bandRadianceWm2Sr'])if(current[id]===saved[id])fail.push(`${id}: comparison fixture did not change`);
  const summary=await page.locator('#sc-pinned').innerText();
  for(const label of ['GEO','Representative','MWIR','HgCdTe'])if(!summary.includes(label))fail.push(`pinned summary missing ${label}`);
  await page.locator('#sc-comparison [data-src="pinned:model:lightTimeSeconds"]').click();
  const pop=page.locator('#src-pop');await pop.waitFor({state:'visible'});
  if(await pop.locator('.sp-claim b').innerText()!==saved.lightTimeSeconds)fail.push('pinned source dialog shows current light time');
  for(const selector of ['a[href*="#calc-vacuum-light-time"]','a[href^="evidence.html"]']){
   const link=pop.locator(selector).first(),href=await link.getAttribute('href'),query=new URL(href,BASE).searchParams;
   for(const [key,value]of Object.entries(savedScenario))if(query.get(key)!==value)fail.push(`pinned source link lost ${key}`);
   if(await link.getAttribute('data-scenario-fixed')===null)fail.push('pinned source link can be overwritten by active scenario');
  }
  states++;await page.keyboard.press('Escape');await page.locator('#sc-pin').click();
  if(await page.locator('#sc-comparison').isVisible())fail.push('unpin did not hide comparison');
  await page.locator('[data-pane="parts"]').click();await audit('parts after scenario');
  // IF holds the playback clock while someone reads evidence. Use the actual
  // dwell so a regression cannot replace the claim while its source is open.
  await show(page,0,'light');
  const beforeCycle=await page.evaluate(()=>grx.state.selected);
  await page.locator('#part-play').click();
  try{
   await page.locator('#card-s [data-src]').first().click();await pop.waitFor({state:'visible'});
   await page.waitForTimeout(8500);
   if(await page.evaluate(()=>grx.state.selected)!==beforeCycle||!await pop.isVisible())fail.push('auto-cycle advanced while reading evidence');
   if(await page.locator('#part-play').getAttribute('aria-pressed')!=='true')fail.push('source-reading hold stopped rather than paused playback');
   await pop.getByRole('button',{name:'Close',exact:true}).click();
   await page.waitForFunction(id=>grx.state.selected!==id,beforeCycle,{timeout:20000});
   const selected=await page.evaluate(()=>grx.state.selected),result=await page.evaluate(checkPart,{scene:0,mode:'light',id:selected});
   states++;audited.push('auto-cycle waits for source reading and resumes');
   fail.push(...result.map(error=>`auto-cycle: ${error}`));
  }finally{
   await page.keyboard.press('Escape');
   if(await page.locator('#part-play').getAttribute('aria-pressed')==='true')await page.locator('#part-play').click();
  }
  if(await page.locator('#part-play').getAttribute('aria-pressed')!=='false')fail.push('Escape did not stop auto-cycle');
  await page.locator('#part-play').click();
  await page.locator('#part-select').selectOption({index:1});
  if(await page.locator('#part-play').getAttribute('aria-pressed')!=='false')fail.push('manual picker choice did not stop auto-cycle');
  await page.locator('#part-play').click();await page.locator('[data-mode="data"]').click();
  if(await page.locator('#part-play').getAttribute('aria-pressed')!=='false')fail.push('layer change did not stop auto-cycle');
  states++;audited.push('manual choice and layer change stop auto-cycle');
  await page.locator('#part-select').focus();const focusedScene=await page.evaluate(()=>grx.state.scene);
  await page.keyboard.press('2');
  if(await page.evaluate(()=>grx.state.scene)!==focusedScene)fail.push('picker keyboard input triggered a level shortcut');
  // Present and Hide details retain the always-visible picker and transport;
  // Escape restores the previous detail visibility, as in IF.
  const moreChoice=async id=>{await page.locator('#more-btn').click();await page.locator(id).click();await settleLayout(page);};
  await moreChoice('#presentation-view');await audit('presentation');
  if(await page.locator('#inspector').isVisible())fail.push('Present did not hide details');
  await page.locator('#card-next').click();
  if(await page.locator('#inspector').isVisible())fail.push('part navigation unexpectedly ended Present');
  await page.keyboard.press('Escape');await audit('exit presentation');
  if(!await page.locator('#inspector').isVisible())fail.push('Escape did not restore details');
  await moreChoice('#inspector-toggle');await audit('hide details');
  await moreChoice('#presentation-view');await page.keyboard.press('Escape');
  if(await page.locator('#inspector').isVisible())fail.push('Present forgot previously hidden details');
  await page.locator('#part-select').selectOption({index:1});await audit('part choice restores details');
  if(!await page.locator('#inspector').isVisible())fail.push('part picker did not reveal details');
  const transport=await page.locator('#reset-view').evaluate(el=>{const group=el.closest('.part-nav');return !!group?.contains(document.getElementById('card-prev'))&&group.contains(document.getElementById('card-next'))&&!el.closest('#more-menu')&&el.checkVisibility();});
  if(!transport)fail.push('Overview is not visible beside Previous and Next');
  await page.locator('#reset-view').click();
  if(await page.locator('#part-select').inputValue()!==''||await page.evaluate(()=>grx.state.selected)!==null)fail.push('persistent Overview did not reset selection');
  states++;audited.push('persistent Overview');
  await page.locator('#more-btn').click();
  if(!await page.locator('#mm-tools #share-btn').isVisible()||!await page.locator('#mm-tools .mm-select').isVisible())fail.push('More tools are not grouped with rendering controls');
  await page.keyboard.press('Escape');
  // Reference reading preserves the exact explorer state and camera. These
  // real navigation clicks must open the IF-style sheet, including the catalog.
  await show(page,1,'data');
  const referenceStart=await page.evaluate(()=>({state:{...grx.state},camera:grx.camera.position.toArray(),scenario:{...grx.store.scenario}}));
  for(const file of ['evidence.html','method.html','glossary.html','parts.html']){
   const link=page.locator(`#topnav a[href^="${file}"]`);
   if(!await link.isVisible())await page.locator('#menu-btn').click();
   await link.click();await page.locator('#page-sheet').waitFor({state:'visible'});
   const embedded=page.frameLocator('#ps-frame');await embedded.locator('h1').waitFor();
   await audit(`${file}/reference sheet`,'#page-sheet button,#page-sheet a');
   const external=new URL(await page.locator('#ps-open').getAttribute('href'));
   if(external.searchParams.has('embed'))fail.push(`${file}: Open as a page retains embed`);
   for(const [key,value]of Object.entries(referenceStart.scenario))if(external.searchParams.get(key)!==value)fail.push(`${file}: reference sheet lost ${key}`);
   if(await embedded.locator('.topbar').isVisible())fail.push(`${file}: embedded page repeats the site header`);
   if(file==='evidence.html'||file==='parts.html'){
    const chip=embedded.locator('button[data-src]:visible').first();await chip.click();
    await embedded.locator('#src-pop').waitFor({state:'visible'});await page.keyboard.press('Escape');
    await embedded.locator('#src-pop').waitFor({state:'hidden'});
    // Wait for an erroneous iframe close message, rather than racing its delivery.
    await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
    if(!await page.locator('#page-sheet').isVisible()||!await chip.evaluate(el=>el===document.activeElement))fail.push(`${file}: source Escape closed its parent sheet or lost focus`);
    states++;audited.push(`${file}/nested source Escape`);
   }
   if(file==='parts.html'){
    const evidenceLink=embedded.locator('.part-evidence-link').first(),destination=new URL(await evidenceLink.getAttribute('href'),BASE);
    await evidenceLink.click();await page.waitForFunction(()=>document.getElementById('ps-t').textContent==='Evidence');
    const linked=new URL(await page.locator('#ps-open').getAttribute('href'));
    if(!linked.pathname.endsWith('/evidence.html')||linked.hash!==destination.hash||linked.searchParams.has('embed')||await page.locator('#ps-frame').getAttribute('title')!=='Evidence')fail.push('reference sheet navigation left stale title or Open as a page destination');
    for(const [key,value]of Object.entries(referenceStart.scenario))if(linked.searchParams.get(key)!==value)fail.push(`reference cross-page navigation lost ${key}`);
    states++;audited.push('reference cross-page title and destination');
   }
   // Escape from inside the iframe must close the parent sheet as well.
   await embedded.locator('h1').click();await page.keyboard.press('Escape');
   await page.locator('#page-sheet').waitFor({state:'hidden'});
   const after=await page.evaluate(()=>({state:{...grx.state},camera:grx.camera.position.toArray(),inert:document.getElementById('topbar').inert}));
   if(JSON.stringify(after.state)!==JSON.stringify(referenceStart.state)||after.camera.some((v,i)=>Math.abs(v-referenceStart.camera[i])>1e-6)||after.inert)fail.push(`${file}: closing the sheet lost the view or kept the background inert`);
  }
  // A catalog deep link is handled by the live viewer, not another page load.
  const catalog=page.locator('#topnav a[href^="parts.html"]');if(!await catalog.isVisible())await page.locator('#menu-btn').click();await catalog.click();
  const partLink=page.frameLocator('#ps-frame').locator('a.part-open').first();await partLink.waitFor();
  const partView=new URL(await partLink.getAttribute('href'),BASE).searchParams.get('view').split('.');
  await partLink.click();await page.locator('#page-sheet').waitFor({state:'hidden'});
  await page.waitForFunction(v=>!grx.isBusy()&&grx.state.scene===Number(v[0])&&grx.state.mode===v[1]&&grx.state.selected===(v[2]||null),partView);
  states++;audited.push('catalog component link returns to live viewer');
  if(form==='phone'){
   if(await page.locator('#sheet-toggle').getAttribute('aria-expanded')==='true')await page.locator('#sheet-toggle').click();
   await page.locator('#card-more').click();await audit('Details expands phone sheet');
   if(await page.locator('#sheet-toggle').getAttribute('aria-expanded')!=='true')fail.push('Details did not expand the phone sheet');
  }
  if(await page.locator('#intro-more').isVisible()){
   await page.locator('#intro-more').click();await audit('expanded overview prose');
   if(await page.locator('#intro-more').getAttribute('aria-expanded')!=='true'||!await page.locator('#intro').evaluate(el=>el.classList.contains('open')))fail.push('Read overview did not reveal complete introduction');
   await page.locator('#intro-more').click();
  }
  if(form==='phone'){
   const viewport=page.viewportSize();await page.setViewportSize({width:320,height:844});await audit('320 px phone controls');await page.setViewportSize(viewport);
  }
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
  for(const file of ['index.html','visualizer.html','evidence.html','method.html','glossary.html','parts.html']){await page.goto(new URL(file,BASE).href);states++;if(!/noindex/.test(await page.locator('meta[name=robots]').getAttribute('content')))fail.push(`${file}: missing noindex`);if(await page.locator('h1').count()!==1)fail.push(`${file}: requires one h1`);if(!await page.locator('#topnav a[href^="parts.html"]').count()||!await page.locator('#menu-btn').count())fail.push(`${file}: shared Parts/navigation menu is missing`);if(file!=='visualizer.html'&&!await page.locator('#top-cta').isVisible())fail.push(`${file}: visualizer entry is not persistently visible`);const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>h&&!/^(https?:|mailto:)/.test(h)));for(const href of links){const url=new URL(href,new URL(file,BASE));const response=await page.request.get(url.href);if(!response.ok())fail.push(`${file}: ${href} HTTP ${response.status()}`);if(url.searchParams.has('view')){await page.goto(url.href);await page.waitForFunction(()=>window.grx?.built[grx.state.scene]&&!grx.isBusy());const expected=url.searchParams.get('view').split('.');const state=await page.evaluate(()=>grx.state);if(state.scene!==Number(expected[0])||state.mode!==expected[1]||state.selected!==(expected[2]||null))fail.push(`${href}: did not land on the requested view`);}}}

  // A source-reading detour must retain all four scenario choices.
  const wanted={orbit:'leo',aperture:'civil',band:'lwir',detector:'qwip'};
  await page.goto(new URL('visualizer.html?'+new URLSearchParams(wanted),BASE).href);
  await page.waitForFunction(()=>window.grx?.built[grx.state.scene]);
  if(!await page.evaluate(()=>grx.state.selected))fail.push('URL without view lost its first-card default');
  for(const file of ['index.html','evidence.html','method.html','glossary.html','parts.html','visualizer.html']){
   const link=page.locator('nav a[href^="'+file+'"]').first();
   // Use the phone's real navigation affordance before following its hidden link.
   if(!await link.isVisible()&&await page.locator('#menu-btn').isVisible())await page.locator('#menu-btn').click();
   await link.click();
   await page.waitForURL(url=>url.pathname.endsWith('/'+file));states++;
   const query=new URL(page.url()).searchParams;
   for(const [key,value]of Object.entries(wanted))if(query.get(key)!==value)fail.push(file+': lost '+key+' during navigation');
  }
  await page.waitForFunction(()=>window.grx?.built[grx.state.scene]);
  const restored=await page.evaluate(()=>grx.store.scenario);
  for(const [key,value]of Object.entries(wanted))if(restored[key]!==value)fail.push('return to explorer: '+key+' not restored');

  // Share the real picker-selected Overview. Capture only the clipboard write,
  // avoiding OS clipboard permissions while exercising the actual Share button.
  await show(page,1,'data');
  if(!await page.evaluate(()=>grx.state.selected))fail.push('show() without a part lost its first-card default');
  await page.locator('#part-select').selectOption('');await page.evaluate(()=>grx.settle());
  await page.waitForFunction(()=>new URLSearchParams(location.search).get('view')==='1.data');
  await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async url=>{document.body.dataset.sharedUrl=url;}}});});
  await page.locator('#more-btn').click();await page.locator('#share-btn').click();
  const sharedURL=await page.locator('body').getAttribute('data-shared-url'),sharedQuery=new URL(sharedURL).searchParams;
  if(sharedQuery.get('view')!=='1.data')fail.push('Overview share link contains a selected part');
  for(const [key,value]of Object.entries(wanted))if(sharedQuery.get(key)!==value)fail.push('Overview share link lost '+key);
  for(const action of ['shared link','reload']){
   if(action==='shared link')await page.goto(sharedURL);else await page.reload();
   await page.waitForFunction(()=>window.grx?.built[1]&&!grx.isBusy()&&grx.state.scene===1);
   await page.evaluate(()=>{grx.setTransitions('instant');grx.settle();});await settleLayout(page);
   const result=await page.evaluate(()=>{
    const preset=grx.built[1].camera;
    return {state:{...grx.state},scenario:{...grx.store.scenario},picker:document.getElementById('part-select').value,
     cardHidden:document.getElementById('card').hidden,pressed:document.querySelectorAll('#parts [aria-pressed="true"],#pins [aria-pressed="true"]').length,
     camera:grx.camera.position.toArray(),target:grx.controls.target.toArray(),preset};
   });
   states++;
   if(result.state.scene!==1||result.state.mode!=='data'||result.state.selected!==null||result.picker!==''||!result.cardHidden||result.pressed)fail.push(`Overview ${action}: selected state/card/pins were not restored`);
   if(result.camera.some((v,i)=>Math.abs(v-result.preset.pos[i])>1e-6)||result.target.some((v,i)=>Math.abs(v-result.preset.target[i])>1e-6))fail.push(`Overview ${action}: overview camera was not restored`);
   for(const [key,value]of Object.entries(wanted))if(result.scenario[key]!==value)fail.push(`Overview ${action}: ${key} not restored`);
  }
  details.overviewRestores=['shared link','reload'];
 } else if(name==='shot'){fs.mkdirSync('shots',{recursive:true});await page.screenshot({path:`shots/scaffold-${form}.png`,fullPage:true});states++;}
 else throw new Error(`Unknown gate: ${name}`);
 } catch(e){fail.push(e.stack||String(e));}
 await finish(g,fail,{states,...details});
}
