import fs from 'node:fs';
import { openGate, finish, BASE } from './gate-common.mjs';
const form=process.argv[2]||'desktop',g=await openGate('reference-audit',form);
if(g){
 const {page}=g,failures=[];let states=0;
 const check=(ok,message)=>{states++;if(!ok)failures.push(message);};
 const dir='.local/audit-1004/reference';fs.mkdirSync(dir,{recursive:true});
 try{
  await page.evaluate(async()=>{await grx.go('atmosphere');grx.settle();});
  check(!await page.locator('[data-mode]:visible').count(),'Atmosphere still shows layer switches');
  check(!await page.locator('#animation-controls').isVisible(),'Atmosphere still shows sequence controls');
  await page.screenshot({path:`${dir}/${form}-atmosphere.png`});
  await page.goto(new URL('parts.html',BASE).href);
  await page.locator('#parts-register[data-scenario-view="current"]').waitFor();
  check(!await page.locator('[data-part-entry][open]').count(),'Parts assemblies should start collapsed');
  await page.screenshot({path:`${dir}/${form}-parts.png`});
  await page.locator('#parts-search').fill('encoder');
  check(await page.locator('#parts-payload-scan-system[open]').isVisible(),'Search did not reveal scan assembly');
  await page.evaluate(()=>{location.hash='parts-tirs2-arrays';});
  await page.locator('#parts-tirs2-arrays[open]').waitFor();
  check(await page.locator('#parts-search').inputValue()==='','Fragment did not clear conflicting Parts search');
  await page.goto(new URL('evidence.html',BASE).href);
  await page.locator('#claim-register[data-scenario-view="current"]').waitFor();
  const total=await page.locator('[data-claim-key]').count();
  check(total>900,'Evidence content was lost');
  check(!await page.locator('[data-claim-group][open]').count(),'Evidence groups should start collapsed');
  await page.screenshot({path:`${dir}/${form}-evidence.png`});
  const group=page.locator('[data-claim-group]').filter({has:page.locator('[data-claim-key^="card:light:satellite:"]')}).first();
  await group.locator('summary').click();
  const visited=new Set();
  do{
   const keys=await group.locator('[data-claim-key]:visible').evaluateAll(rows=>rows.map(r=>r.dataset.claimKey));
   check(keys.length<=12,'Evidence page exceeds 12 results');keys.forEach(key=>visited.add(key));
   const next=group.getByRole('button',{name:'Next page'});
   if(await next.isDisabled())break;
   await next.click();
  }while(true);
  check(visited.size===await group.locator('[data-claim-key]').count(),'Pagination skipped or repeated claims');
  const last=await group.locator('[data-claim-key]').last().getAttribute('id');
  await page.locator('#claim-search').fill('impossible-reference-search');
  check(await page.locator('#claim-empty').isVisible(),'Evidence empty state missing');
  await page.evaluate(id=>{location.hash=id;},last);
  await page.locator(`[id="${last}"]`).waitFor({state:'visible'});
  check(await page.locator('#claim-search').inputValue()==='','Fragment did not clear conflicting evidence search');
  await page.locator('#claim-search').fill('one-way vacuum light time');
  check(await page.locator('[data-claim-key="model:lightTimeSeconds"]').isVisible(),'Search did not reveal matching group');
  await page.screenshot({path:`${dir}/${form}-evidence-search.png`});
  check(await page.locator('[data-claim-key]').count()===total,'Search removed reference content');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Reference page overflows horizontally');
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states});
}
