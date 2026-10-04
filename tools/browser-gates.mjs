import {lessonAction,setMotion,openParts} from './gate-actions.mjs';
// Same gate roles and geometric tests as IF, against the Guardian Ring scene contract.
import { openGate,show,finish,BASE,MODES } from './gate-common.mjs';
import { checkView,fly,checkCoplanar } from './gate-geometry.mjs';
import { checkUI } from './gate-ui.mjs';
import { TIERS } from '../src/app/render-quality.js';
import fs from 'node:fs';
import { checkOrbitFollow } from './gate-orbit-follow.mjs';

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
  if(article?.dataset.component!==component.id||article?.querySelector('.component-title')?.textContent!==component.title||article?.querySelector('.component-role')?.textContent!==(component.role||undefined))bad.push(`${component.id}: component name/function mismatch`);
  const keys=[...(article?.querySelectorAll('[data-src]')||[])].map(el=>el.dataset.src);
  if(JSON.stringify(keys)!==JSON.stringify((component.specs||[]).map((_,n)=>`component:${sceneId}:${id}:${component.id}:${n}`)))bad.push(`${component.id}: component evidence is not synchronized`);
 });
 if(!rendered(pin)||pin?.classList.contains('off'))bad.push('selected pin is hidden');
 if(pin?.getAttribute('aria-pressed')!=='true'||button?.getAttribute('aria-pressed')!=='true')bad.push('selected pin/button state missing');
 if(rendered(pin)){const r=pin.querySelector('.num').getBoundingClientRect(),v=document.getElementById('view').getBoundingClientRect();if(r.left<v.left||r.right>v.right||r.top<v.top||r.bottom>v.bottom)bad.push('selected pin lies outside view');}
 return bad;
};

async function settleLayout(page){
 await page.evaluate(async()=>{
  let timeout;
  const settled=async()=>{const animations=document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity);await Promise.all(animations.map(a=>a.finished.catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));};
  // The desktop orbit hint intentionally waits 10 seconds before its 800 ms
  // fade. Retain that finite animation in the barrier and allow it to finish.
  try{await Promise.race([settled(),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Layout did not finish rendering within 15 seconds')),15000);})]);}
  finally{clearTimeout(timeout);}
 });
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
  if(name==='flights'){
   details.flightCoverage='overview-to-each plus every ordered distinct part pair within each level/layer; active LEO follow';
   await show(page,0,'light');const follow=await checkOrbitFollow(page);details.orbitFollow=follow;
   fail.push(...follow.failures);states+=follow.samples.length;
  }
 } else if(name==='ui'){
  const audited=[];
  const audit=async(label,selector)=>{await settleLayout(page);states++;audited.push(label);const result=await page.evaluate(checkUI,{selector});fail.push(...result.map(error=>`${label}: ${error}`));};
  for(const sc of scenes)for(const mode of MODES){
   await show(page,sc.i,mode);await audit(`${sc.id}/${mode}/parts`);
   const componentSummaries=page.locator('#card-components details > summary');
   const expandCard=await componentSummaries.count()>0&&!await componentSummaries.first().isVisible();
   if(expandCard)await page.locator('#card-more').click();
   for(let i=0;i<await componentSummaries.count();i++)await componentSummaries.nth(i).click();
   if(await componentSummaries.count())await audit(`${sc.id}/${mode}/expanded component anatomy`);
   if(expandCard)await page.locator('#tab-parts').click();
   const exampleSummary=page.locator('.learning-example > summary');
   if(await exampleSummary.isVisible()){
    await exampleSummary.click();await audit(`${sc.id}/${mode}/civil application`);await exampleSummary.click();
   }
   if(await page.locator('.animation-explanation').isVisible()){
    await lessonAction(page,'next');
    const explanation=page.locator('.animation-explanation');
    if(!await explanation.evaluate(el=>el.open))await explanation.locator('summary').click();
    await audit(`${sc.id}/${mode}/expanded animation explanation`);
    await show(page,sc.i,mode);
   }
   // Exercise the native picker against every distinct level/layer list, then
   // check both transport directions from an unselected overview.
   const ids=await page.locator('#parts button[data-id]').evaluateAll(bs=>bs.map(button=>button.dataset.id));
   const inspect=async(id,label)=>{await page.evaluate(()=>grx.settle());await settleLayout(page);const result=await page.evaluate(checkPart,{scene:sc.i,mode,id});states++;audited.push(`${sc.id}/${mode}/${label}`);fail.push(...result.map(error=>`${sc.id}/${mode}/${label}: ${error}`));};
   await page.getByRole('combobox',{name:'Selected part'}).selectOption(ids.at(-1));await inspect(ids.at(-1),'pick last part');
   await page.locator('#part-select').selectOption('');await page.evaluate(()=>grx.settle());await settleLayout(page);
   const overview=await page.evaluate(()=>{
    const built=grx.built[grx.state.scene],view=document.getElementById('view');
    // The scene contract can author an overview for the actual canvas shape.
    // Its static camera remains the fallback, not the responsive destination.
    const expected=built.overviewFrame?.(view.clientWidth,view.clientHeight)||built.camera;
    return {selected:grx.state.selected,cardHidden:document.getElementById('card').hidden,pressed:document.querySelectorAll('#parts [aria-pressed="true"],#pins [aria-pressed="true"]').length,camera:grx.camera.position.toArray(),target:grx.controls.target.toArray(),expected,finished:grx.flightProgress()===1};
   });
   states++;audited.push(`${sc.id}/${mode}/overview`);
   if(overview.selected!==null||!overview.cardHidden||overview.pressed||!overview.finished||overview.camera.some((v,i)=>Math.abs(v-overview.expected.pos[i])>1e-6)||overview.target.some((v,i)=>Math.abs(v-overview.expected.target[i])>1e-6))fail.push(`${sc.id}/${mode}: overview did not restore camera and clear part/card/pins`);
   await page.locator('#card-prev').click();await inspect(ids.at(-1),'previous from overview');
   await page.locator('#card-next').click();await inspect(ids[0],'next wraps to first');
  }
  // Use the actual layer controls: layers may have different part IDs. A layer
  // switch must choose a valid card rather than leave a stale selection hidden.
  for(const sc of scenes){
   await show(page,sc.i,'light');
   for(const mode of ['data','heat','light']){
    await page.locator(`[data-mode="${mode}"]`).click();
    // Layer-specific playback controls can resize the phone canvas. Sample
    // after ResizeObserver and rendering, with the same unchanged pin bounds.
    await settleLayout(page);
    const id=await page.evaluate(()=>grx.state.selected);
    const result=await page.evaluate(checkPart,{scene:sc.i,mode,id});states++;
    fail.push(...result.map(error=>`${sc.id}/${mode}/layer-switch: ${error}`));
   }
  }
  // A layer may expose another face or electronics assembly of the same part.
  // Exercise the actual layer button, not show()'s explicit part flight.
  if(scenes.some(scene=>scene.id==='payload'))for(const [id,mode] of [['scan-system','data'],['thermal','heat']]){
   await show(page,2,'light',id);await page.locator(`[data-mode="${mode}"]`).click();await page.evaluate(()=>grx.settle());await settleLayout(page);
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
  const reasoning=page.locator('[data-math-work] > summary');
  for(let i=0;i<await reasoning.count();i++)await reasoning.nth(i).click();
  await audit('expanded physics reasoning');
  await page.locator('#scenario-adjust > summary').click();await audit('expanded teaching inputs');
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
  // Next animates one selected component; evidence reading holds that clock.
  await show(page,2,'light');await page.locator('#reset-view').click();await page.locator('#card-next').click();
  await page.waitForFunction(()=>!grx.isCameraMoving()&&grx.built[2].teaching.state().playing);
  await page.locator('#card-s [data-src]').first().click();await pop.waitFor({state:'visible'});
  const before=await page.evaluate(()=>({selected:grx.state.selected,phase:grx.built[2].teaching.state().progress}));
  await page.waitForTimeout(500);
  if(!await page.evaluate(before=>grx.state.selected===before.selected&&grx.built[2].teaching.state().progress===before.phase,before))fail.push('part activity advanced while reading evidence');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!grx.built[2].teaching.state().playing);
  if(!await page.evaluate(before=>grx.state.selected===before.selected&&grx.built[2].teaching.state().progress===1,before))fail.push('part activity did not finish once after evidence closed');
  await page.locator('#part-select').selectOption({index:2});
  if(await page.evaluate(()=>grx.built[2].teaching.state().playing))fail.push('direct part choice did not stop animation');
  states++;audited.push('one-shot part activity holds for evidence and stops for manual selection');
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
  await page.locator('#card-next').click();await audit('part choice restores details');
  if(!await page.locator('#inspector').isVisible())fail.push('part picker did not reveal details');
  const transport=await page.locator('#reset-view').evaluate(el=>{const group=el.closest('.part-nav');return !!group?.contains(document.getElementById('card-prev'))&&group.contains(document.getElementById('card-next'))&&!el.closest('#more-menu')&&el.checkVisibility();});
  if(!transport)fail.push('Overview is not visible beside Previous and Next');
  await page.locator('#reset-view').click();
  if(await page.locator('#part-select').inputValue()!==''||await page.evaluate(()=>grx.state.selected)!==null)fail.push('persistent Overview did not reset selection');
  states++;audited.push('persistent Overview');
  await page.locator('#more-btn').click();
  if(!await page.locator('#mm-tools #share-btn').isVisible()||!await page.locator('#quality').isVisible())fail.push('More tools are not grouped with rendering controls');
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
   if(await page.evaluate(()=>document.body.classList.contains('sheet-open')))await page.locator('#tab-parts').click();
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
   // Expanded teaching notes, Scenario, and a dragged sheet compete for the
   // same phone height. Check them together, including a shorter viewport.
   const checkPhoneBudget=async label=>{
    await audit(label,'#hud-btns button,#hud-btns select,#animation-controls .animation-transport button,.assembly-controls button,.mission-prompt button,.orbit-playback button,#sheet-toggle,#tab-parts,#tab-scenario');
    const problems=await page.evaluate(()=>{
     const bad=[],view=document.getElementById('view').getBoundingClientRect(),panel=document.getElementById('inspector').getBoundingClientRect();
     if(view.height<innerHeight*.45-.5)bad.push('canvas lost its 45% viewport floor');
     if(panel.bottom>innerHeight+.5||panel.height<59.5)bad.push('inspector exceeds the viewport or loses its reading area');
     for(const node of document.querySelectorAll('#hud-btns button,#hud-btns select,.animation-transport button,.assembly-controls button,.mission-prompt button,.orbit-playback button')){
      if(!node.checkVisibility())continue;
      const r=node.getBoundingClientRect(),hit=document.elementFromPoint((r.left+r.right)/2,(r.top+r.bottom)/2);
      if(r.height<43.5)bad.push(`${node.id||node.textContent}: touch target is shorter than 44 px`);
      // Inspector playback is intentionally scrollable; audit() verifies every control is reachable.
      if(node.closest('#hud-btns')&&(r.bottom>panel.top+.5||r.top<0||r.left<0||r.right>innerWidth||!hit||!(node===hit||node.contains(hit))))bad.push(`${node.id||node.textContent}: part navigation is not fully exposed above the inspector`);
     }
     return bad;
    });
    fail.push(...problems.map(problem=>`${label}: ${problem}`));
   };
   // Enter the same running overview a first-time visitor receives. show()
   // intentionally enters inspection and cannot detect the extra live rows.
   for(const size of [{width:390,height:667},{width:320,height:667},{width:320,height:721}]){
    await page.setViewportSize(size);
    for(const [scene,index] of [['payload',2],['abi',7]]){
     await page.goto(new URL(`visualizer.html?view=${index}.light`,BASE).href);
     await page.waitForFunction(()=>window.grx?.built[grx.state.scene]&&!grx.isBusy()&&!grx.isCameraMoving());
     await settleLayout(page);
     const defaultState=await page.evaluate(()=>grx.built[grx.state.scene].teaching.state());
     if(!defaultState.playing||!defaultState.repeating||await page.evaluate(()=>grx.state.selected!==null))fail.push(`${size.width}×${size.height} ${scene}: navigation did not start the running overview`);
     for(const pane of ['parts','scenario']){
      await page.locator(`#tab-${pane}`).click();
      for(const open of [false,true]){
       const note=page.locator('.animation-explanation');
       if(await note.evaluate(el=>el.open)!==open)await note.locator('summary').click();
       await checkPhoneBudget(`${size.width}×${size.height} ${scene} default activity + ${pane} + notes ${open?'open':'closed'}`);
      }
     }
     // Observe an authored later title through normal playback, including the
     // longest available later phrase that can wrap in the narrow summary.
     const later=defaultState.steps.reduce((best,step,index)=>index>0&&step.title.length>defaultState.steps[best].title.length?index:best,1);
     await page.waitForFunction(index=>{const s=grx.built[grx.state.scene].teaching.state();return s.playing&&s.index===index;},later,{timeout:(defaultState.total+1)*4000});
     await checkPhoneBudget(`${size.width}×${size.height} ${scene} later activity title`);
    }
    await page.goto(new URL('visualizer.html?view=0.light',BASE).href);
    await page.waitForFunction(()=>window.grx?.built[0]&&!grx.isBusy()&&!grx.isCameraMoving());await settleLayout(page);
    if(!await page.locator('[data-mission="start"]').isVisible())fail.push(`${size.width}×${size.height}: initial mission invitation is hidden`);
    await page.locator('[data-mission="start"]').click();await page.waitForFunction(()=>!grx.mission.state().loading&&!grx.isCameraMoving());
    await page.locator('[data-mission="play"]').click();
    for(const chapter of [0,4]){
     if(chapter)for(let i=0;i<4;i++){await page.locator('[data-mission="next"]').click();await page.waitForFunction(()=>!grx.mission.state().loading&&!grx.isCameraMoving());}
     await audit(`${size.width}×${size.height} mission ${chapter} touch controls`,'.mission-active-panel button,.mission-active-panel summary,.mission-transport label');
     const missionProblems=await page.evaluate(()=>{
      const bad=[];for(const node of document.querySelectorAll('.mission-active-panel button,.mission-active-panel summary,.mission-transport label'))if(node.checkVisibility()&&node.getBoundingClientRect().height<43.5)bad.push(`${node.textContent}: mission touch target below 44 px`);
      const view=document.getElementById('view').getBoundingClientRect(),mission=document.querySelector('.panel-scroll').getBoundingClientRect();
      if(view.height<innerHeight*.45-.5||mission.bottom>innerHeight+.5)bad.push('mission exceeded the viewport or lost the canvas minimum');return bad;
     });fail.push(...missionProblems.map(problem=>`${size.width}×${size.height} mission ${chapter}: ${problem}`));
    }
    await page.locator('[data-mission="stop"]').click();
   }
   for(const size of [{width:390,height:844},{width:320,height:844},{width:390,height:667},{width:320,height:667}]){
    await page.setViewportSize(size);await show(page,'abi','light');
    await lessonAction(page,'play');
    await page.locator('.animation-explanation').evaluate(node=>{node.open=true;});
    await page.locator('#tab-scenario').click();
    const label=`${size.width}×${size.height} animation notes + Scenario`;
    await checkPhoneBudget(label);
    const handle=await page.locator('#tab-parts').boundingBox();
    await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();
    await page.mouse.move(handle.x+handle.width/2,20,{steps:8});await page.mouse.up();
    await checkPhoneBudget(`${label} + tall sheet drag`);
    await show(page,'orbits','light');await page.locator('.orbit-playback-note').evaluate(node=>{node.open=true;});
    await page.locator('#tab-scenario').click();await checkPhoneBudget(`${size.width}×${size.height} orbit explanation + Scenario`);
   }
   for(const size of [{width:844,height:390},{width:667,height:375}]){
    await page.setViewportSize(size);
    for(const lesson of ['abi','orbits']){
     await show(page,lesson,'light');
     if(lesson==='abi'){
      await lessonAction(page,'play');
      await page.locator('.animation-explanation').evaluate(node=>{node.open=true;});
     }else await page.locator('.orbit-playback-note').evaluate(node=>{node.open=true;});
     await page.locator('#tab-scenario').click();
     const label=`${size.width}×${size.height} ${lesson} landscape playback + Scenario`;
     await audit(label,'#hud-btns button,#hud-btns select,#playback-dock button,.pane-tabs button');
     const problems=await page.evaluate(()=>{
      const bad=[],view=document.getElementById('view').getBoundingClientRect(),panel=document.getElementById('inspector').getBoundingClientRect();
      if(view.height<innerHeight*.45-.5)bad.push('canvas lost its 45% viewport floor');
      if(panel.bottom>innerHeight+.5||panel.height<59.5)bad.push('reading pane exceeds viewport or loses its minimum');
      const layers=document.querySelector('.mode'),layerRect=layers.getBoundingClientRect();
      if(layers.parentElement.id!=='mode-slot'||layerRect.bottom>view.top+.5||!document.getElementById('level-pick').checkVisibility())bad.push('landscape layer/level controls cover the canvas');
      return bad;
     });
     fail.push(...problems.map(problem=>`${label}: ${problem}`));
    }
   }
   await page.setViewportSize(viewport);await show(page,'abi','light');
   await lessonAction(page,'play');
   await page.locator('#card-next').focus();
   await page.evaluate(()=>{window.rotationScene=grx.built[grx.state.scene];});
   for(const [size,playing] of [[{width:844,height:390},true],[viewport,false]]){
    if(!playing)await lessonAction(page,'play');
    await page.setViewportSize(size);await settleLayout(page);
    const stable=await page.evaluate(expected=>grx.built[grx.state.scene]===window.rotationScene&&grx.state.selected===null&&window.rotationScene.teaching.state().playing===expected&&document.activeElement?.id==='card-next',playing);
    states++;audited.push(`rotation preserves ${playing?'playing':'paused'} lesson and focus`);
    if(!stable)fail.push(`rotation lost ${playing?'playing':'paused'} lesson, Overview, scene identity or focus`);
   }
   await show(page,'orbits','light');await page.locator('#tab-parts').click();
  }
  if(await page.locator('#sheet-toggle').isVisible()){await page.locator('#sheet-toggle').click();await audit('collapsed sheet');await page.locator('#sheet-toggle').click();await audit('expanded sheet');}
  details.uiStates=audited;
  fs.mkdirSync('shots',{recursive:true});await page.screenshot({path:`shots/scaffold-${form}.png`,fullPage:true});
 } else if(name==='perf'){
  const rows=[];await page.evaluate(()=>grx.forceTier(0,{hold:true}));
  const settlePerformanceView=async()=>{
    // Match IF's settled-view benchmark: 24 uncapped frames can last less than
    // the pin's 150 ms selection transition. Keep all measured slow frames.
    await page.waitForTimeout(300);
    await page.waitForFunction(()=>!document.getAnimations().some(a=>a instanceof CSSTransition&&a.playState==='running'),null,{timeout:5000});
  };
  const samplePerformance=options=>page.evaluate(({index,follow=null,missionChapter=null,part=null})=>new Promise((resolve,reject)=>{
     const values=[],b=grx.built[grx.state.scene],started=performance.now(),named=index>=0&&!!b.teaching;
     const scene=grx.state.scene,mode=grx.state.mode,mission=missionChapter!==null;
     const progressBins=Array(10).fill(0);let last=started,warm=24,restarts=0,completePasses=0,minProgress=1,maxProgress=0,previousProgress=0,calls=0,triangles=0;
     let running=false,boundary=false,movingSamples=0,cameraTravel=0,targetTravel=0,previousCamera=null,previousTarget=null,unsubscribe=()=>{},warmUntil=0;
     const completed=state=>state.index===index+1||(index===state.total-1&&state.index===index&&state.progress===1&&!state.playing);
     // Hold a guided chapter only once its full phase has finished. This keeps
     // the real mission panel, focused camera, lesson clock and activity live
     // during measurement without navigating away before a repeat pass.
     if(mission)unsubscribe=b.teaching.subscribe(state=>{
      if(running&&!boundary&&completed(state)){boundary=true;grx.mission.pause();}
     });
     const clean=()=>{running=false;unsubscribe();if(mission)grx.mission.pause();};
     const failSample=message=>{clean();reject(new Error(message));};
     const finish=()=>{
      values.sort((a,b)=>a-b);const q=grx.quality(),n=values.length;
      clean();
      resolve({median:values[Math.floor(n*.5)],p95:values[Math.min(n-1,Math.floor(n*.95))],samples:n,restarts,calls,triangles,tier:q.tiers[grx.state.scene],ratio:q.ratio,
       progressCoverage:named?{start:0,end:1,completePasses,minSample:minProgress,maxSample:maxProgress,bins:progressBins}:null,
       followCoverage:follow?{family:follow,movingSamples,cameraTravel,targetTravel}:null,missionChapter:mission?missionChapter:null,selected:mission?part:null});
     };
     const tick=now=>{
      if(now-started>15000){failSample('Performance sampling exceeded 15 seconds');return;}
      if(grx.state.scene!==scene||grx.state.mode!==mode||grx.isBusy()){failSample('Performance view changed during sampling');return;}
      if(mission&&(!grx.mission.state().active||grx.mission.state().index!==missionChapter||grx.mission.state().loading||grx.mission.state().failed)){failSample('Guided mission left the requested chapter');return;}
      // Warm the exact phase at rest, then begin at zero. User Step intentionally
      // lands at 72%; using it here would omit early mechanism motion entirely.
      if(warm>0){
       last=now;
       // A repeated guided phase must reacquire its original focused camera;
       // no camera-flight or held lesson frames enter either complete pass.
       if(mission&&(now<warmUntil||grx.mission.state().phase!==index||grx.isCameraMoving()||document.getAnimations().some(a=>a instanceof CSSTransition&&a.playState==='running'))){requestAnimationFrame(tick);return;}
       if(--warm===0&&named){
        if(mission&&grx.state.selected!==part){failSample('Guided phase did not focus its intended component');return;}
        b.teaching.seek(index,0);boundary=false;running=true;
        if(mission)grx.mission.play();else b.teaching.play();
       }
       requestAnimationFrame(tick);return;
      }
      const state=named?b.teaching.state():null;
      if(named&&(state.index!==index||!state.playing)){
       if(!completed(state)){failSample('Teaching phase stopped before completing its progress range');return;}
       completePasses++;
       // Complete the phase even if 240 samples arrived earlier. At lower frame
       // rates repeat whole passes until the same minimum sample count is met.
       // The interval crossing a phase boundary is excluded from both passes.
       if(values.length>=240){finish();return;}
       running=false;b.teaching.seek(index,0);
       if(mission){warm=24;warmUntil=now+300;}else b.teaching.play();
       last=now;previousProgress=0;restarts++;requestAnimationFrame(tick);return;
      }
      if(named&&(!Number.isFinite(state.progress)||state.progress<0||state.progress>1||state.progress<previousProgress||state.suspended||state.inspection)){failSample('Invalid or held teaching phase during performance measurement');return;}
      if(mission&&(!grx.mission.state().playing||grx.isCameraMoving()||grx.state.selected!==part)){failSample('Guided phase paused or lost its focused view during measurement');return;}
      if(named&&state.progress===0){last=now;requestAnimationFrame(tick);return;}
      if(follow&&(!b.motion()||grx.orbitFollow()!==follow||b.focusFamily()!==follow||!b.families()[follow]||grx.isCameraMoving())){failSample('Orbital follow view is not actively moving with the requested spacecraft');return;}
      const interval=now-last;last=now;
      if(interval>0&&Number.isFinite(interval)){
       values.push(interval);const R=grx.renderer();calls=Math.max(calls,R.info.render.calls);triangles=Math.max(triangles,R.info.render.triangles);
       if(named){previousProgress=state.progress;minProgress=Math.min(minProgress,state.progress);maxProgress=Math.max(maxProgress,state.progress);progressBins[Math.min(9,Math.floor(state.progress*10))]++;}
       if(follow){
        const camera=grx.camera.position.toArray(),target=grx.controls.target.toArray();
        if(![...camera,...target].every(Number.isFinite)){failSample('Orbital follow camera has a nonfinite pose');return;}
        if(previousCamera){cameraTravel+=Math.hypot(...camera.map((v,i)=>v-previousCamera[i]));targetTravel+=Math.hypot(...target.map((v,i)=>v-previousTarget[i]));}
        previousCamera=camera;previousTarget=target;movingSamples++;
       }
      }
      if(!named&&values.length>=240){finish();return;}
      requestAnimationFrame(tick);
     };requestAnimationFrame(tick);
    }),options);
  const recordPerformance=(scene,mode,phase,r)=>{
    rows.push({scene,mode,phase,...r});states++;
    if(r.samples<240)fail.push(`${scene}/${mode}/${phase}: fewer than 240 valid samples`);
    if(r.progressCoverage&&(!r.progressCoverage.completePasses||r.progressCoverage.bins.some(n=>!n)))fail.push(`${scene}/${mode}/${phase}: incomplete phase progress coverage`);
    if(r.followCoverage&&(r.followCoverage.movingSamples!==r.samples||r.followCoverage.cameraTravel<=1e-4||r.followCoverage.targetTravel<=1e-4))fail.push(`${scene}/${mode}/${phase}: camera/target did not travel throughout active follow sampling`);
    if(r.tier!==0)fail.push(`${scene}/${mode}/${phase}: measured tier ${r.tier}, expected 0`);
    if(r.p95>(form==='phone'?7:15))fail.push(`${scene}/${mode}/${phase}: p95 ${r.p95.toFixed(2)} ms exceeds budget`);
  };
  for(const sc of scenes)for(const mode of MODES){
   await show(page,sc.i,mode);await page.evaluate(()=>grx.forceTier(0,{hold:true}));
   const phases=await page.evaluate(()=>grx.built[grx.state.scene].teaching?.state().steps.map((step,index)=>({name:step.id,index}))||[{name:'orbital playback',index:0}]);
   for(const phase of [{name:'selected-part',index:-2},{name:'inspection',index:-1},...phases]){
    await page.evaluate(index=>{
     const b=grx.built[grx.state.scene];
     if(index===-2){if(!grx.state.selected)throw new Error('Selected-part performance requires a selected component');grx.select(grx.state.selected);}
     else grx.overview();
     grx.settle();
     if(b.teaching){b.teaching.reset();if(index<0)b.teaching.setInspection(true);else b.teaching.seek(index,0);}
     else b.setMotion?.(index>=0);
    },phase.index);
    await settlePerformanceView();
    recordPerformance(sc.id,mode,phase.name,await samplePerformance({index:phase.index}));
   }
   if(sc.id==='orbits')for(const follow of ['geo','leo']){
    // Follow preserves the reader's pause intent. Start playback explicitly
    // for this active-motion benchmark after the previous case's cleanup.
    await page.evaluate(family=>{grx.built[0].setMotion(true);grx.setOrbitFollow(family);grx.settle();},follow);
    await page.waitForFunction(family=>grx.orbitFollow()===family&&grx.built[0].motion()&&!grx.isCameraMoving(),follow);
    await settlePerformanceView();
    recordPerformance(sc.id,mode,`active follow ${follow.toUpperCase()}`,await samplePerformance({index:0,follow}));
    await page.evaluate(()=>{grx.setOrbitFollow(null);grx.built[0].setMotion(false);});
   }
   console.log(`${sc.id}/${mode}: ${phases.length+2+(sc.id==='orbits'?2:0)} performance conditions checked`);
  }
  // Exercise the actual guided panel and component camera, as well as the
  // overview phases above. These cover mirror motion, onboard packet trains,
  // and received/processed display activity without treating setup as playback.
  const missionConditions=[
   {scene:'payload',mode:'light',phase:'slew',part:'scan-system'},
   {scene:'payload',mode:'data',phase:'transfer',part:'data-interface'},
   {scene:'ground',mode:'data',phase:'transfer',part:null},
  ].filter(condition=>scenes.some(scene=>scene.id===condition.scene));
  for(const condition of missionConditions){
   const sample=await page.evaluate(async condition=>{
    grx.mission.stop();await grx.mission.start();grx.mission.pause();
    let mission=grx.mission.state();
    while(mission.chapter.scene!==condition.scene||mission.chapter.mode!==condition.mode){
     if(mission.index===mission.total-1)throw new Error(`Missing performance mission chapter ${condition.scene}/${condition.mode}`);
     await grx.mission.next();mission=grx.mission.state();
    }
    grx.forceTier(0,{hold:true});
    const teaching=grx.built[grx.state.scene].teaching,index=teaching.state().steps.findIndex(step=>step.id===condition.phase);
    if(index<0)throw new Error(`Missing performance mission phase ${condition.phase}`);
    teaching.seek(index,0);grx.settle();
    return {index,missionChapter:mission.index,part:condition.part};
   },condition);
   await page.waitForFunction(({index,missionChapter,part})=>grx.mission.state().index===missionChapter&&grx.mission.state().phase===index&&!grx.isCameraMoving()&&grx.state.selected===part,sample);
   await settlePerformanceView();
   recordPerformance(condition.scene,condition.mode,`mission ${condition.phase}`,await samplePerformance(sample));
   await page.evaluate(()=>grx.mission.stop());
   console.log(`${condition.scene}/${condition.mode}: guided ${condition.phase} performance checked`);
  }
  details.additionalCoverage={orbitalFollow:scenes.some(scene=>scene.id==='orbits')?['geo','leo']:[],mission:missionConditions};
  details.rows=rows;details.settleMilliseconds=300;details.minimumSamples=240;details.worstP95=Math.max(...rows.map(r=>r.p95));console.log(`Worst p95 ${details.worstP95.toFixed(2)} ms`);
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
  if(!await page.evaluate(()=>{
   const p=grx.built[grx.state.scene].camera;
   return grx.state.selected===null&&document.getElementById('part-select').value===''&&document.getElementById('card').hidden&&
     grx.camera.position.distanceTo(new grx.THREE.Vector3(...p.pos))<1e-6;
  }))fail.push('URL without view did not open an unselected overview');
  await page.locator('#card-next').click();await page.evaluate(()=>grx.settle());states++;
  if(!await page.evaluate(()=>{
   const first=document.querySelector('#part-select option[value]:not([value=""])').value;
   return grx.state.selected===first&&document.getElementById('part-select').value===first&&!document.getElementById('card').hidden;
  }))fail.push('First Next from the opening overview skipped the first component');
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
