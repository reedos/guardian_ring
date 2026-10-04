import fs from 'node:fs';
import {openGate,finish} from './gate-common.mjs';
import {openParts} from './gate-actions.mjs';
import {checkUI} from './gate-ui.mjs';
const form=process.argv[2]||'desktop',g=await openGate('cuts-audit',form);
if(g){const {page}=g,failures=[],rows=[];const prefix=form==='phone'?'p':'d';
 fs.mkdirSync('.local/audit-1004/cuts',{recursive:true});
 try{
  for(const scene of g.scenes){
   await page.evaluate(async id=>{await grx.go(id,{record:false});grx.setMode('light');grx.overview();grx.settle();grx.setSceneActivity(false);},scene.id);
   await openParts(page);
   const supported=['orbits','pixel','atmosphere'].includes(scene.id);
   if(await page.locator('#try-it').isVisible()!==supported)failures.push(`${scene.id}: incorrect Try it availability`);
   if(await page.locator('#side-levels,#presentation-view,#inspector-toggle,#mission-launch,#part-play').count())failures.push('Removed controls remain in the DOM');
   if(supported){
    await page.locator('#tab-scenario').click();
    if(!await page.locator('#pane-parts').isVisible()||!await page.locator('#pane-scenario').isVisible())failures.push(`${scene.id}: Try it replaced the Parts panel`);
    failures.push(...await page.evaluate(checkUI,{selector:'#try-it button,#try-it summary,#tab-parts,#hud-btns button'}));
    await page.screenshot({path:`.local/audit-1004/cuts/${prefix}-scenario.png`});
    await page.locator('#tab-scenario').click();
   }
   const height=await page.locator('#gl').evaluate(el=>el.getBoundingClientRect().height/innerHeight);
   if(height<(form==='phone'?.45:.60)-.001)failures.push(`${scene.id}: stage floor lost`);
   await page.screenshot({path:`.local/audit-1004/cuts/${prefix}-lvl${scene.i}-${scene.id}-light.png`});rows.push({scene:scene.id,supported,height});
  }
  await page.locator('#level-pick').click();
  for(let i=6;i<10;i++)if(!await page.locator(`#level-menu [data-level="${i}"]`).isVisible())failures.push(`Side level ${i} is unreachable`);
  await page.keyboard.press('Escape');
  await page.locator('#more-btn').click();failures.push(...await page.evaluate(checkUI,{selector:'#more-menu button,#more-menu select,#more-menu summary,#more-menu input'}));
  await page.screenshot({path:`.local/audit-1004/cuts/${prefix}-more.png`});
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states:rows.length,rows});
}
