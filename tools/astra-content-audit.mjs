import {openGate,show,finish} from './gate-common.mjs';
import {openParts} from './gate-actions.mjs';
for(const form of ['desktop','phone']){
  const g=await openGate('astra-content-audit',form),failures=[];
  if(!g)continue;
  try{
    const {page}=g;if(form==='phone')await page.setViewportSize({width:360,height:844});
    await show(page,3,'heat','cold-stage');await openParts(page);
    if(await page.locator('#card-more').isVisible())await page.locator('#card-more').click();
    const text=await page.locator('#card-s').innerText();
    for(const value of ['0.1673','5.977 W','6.977 W'])if(!text.includes(value))throw Error(`Missing rendered cooling value ${value}`);
    await page.locator('#card-s').scrollIntoViewIfNeeded();
    await page.screenshot({path:`shots/astra-gr1/after/${form}-cooling-card.png`});
    await show(page,7,'light');await openParts(page);
    await page.locator('.learning-example summary').click();
    await page.locator('.learning-example img').scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>document.querySelector('.learning-example img')?.naturalWidth>0);
    // The image changes height after lazy loading; frame it again after decode.
    await page.locator('.learning-example img').evaluate(image=>image.decode());
    await page.locator('.learning-example img').scrollIntoViewIfNeeded();
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    await page.screenshot({path:`shots/astra-gr1/after/${form}-civil-fire.png`});
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))throw Error('Civil example overflows');
  }catch(error){failures.push(error.stack||String(error));}
  finally{await finish(g,failures,{states:5});}
}
