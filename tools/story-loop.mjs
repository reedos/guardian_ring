import {openGate,finish} from './gate-common.mjs';
import fs from 'node:fs';
for(const form of ['desktop','phone']){
  const g=await openGate('story-loop',form),failures=[];
  if(!g)continue;
  try{
    const {page}=g;
    if(form==='phone')await page.setViewportSize({width:360,height:844});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(process.env.GR_URL,{waitUntil:'networkidle'});
    const video=page.locator('#ring-loop'),button=page.locator('#ring-loop-toggle');
    if(!await video.evaluate(v=>v.paused&&v.hidden))throw Error('Video must start paused behind the still');
    if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Story overflows');
    fs.mkdirSync('shots/astra-gr1/after',{recursive:true});
    await page.screenshot({path:`shots/astra-gr1/after/${form}-story.png`});
    await button.click();
    await page.waitForFunction(()=>document.querySelector('#ring-loop').currentTime>.15);
    if(await video.evaluate(v=>v.videoWidth!==1280||v.videoHeight!==800||Math.abs(v.duration-8)>.1))throw Error('Unexpected loop dimensions or duration');
    if(await button.getAttribute('aria-pressed')!=='true')throw Error('Playing state not announced');
    await page.screenshot({path:`shots/astra-gr1/after/${form}-story-loop.png`});
    await button.click();
    if(!await video.evaluate(v=>v.paused))throw Error('Pause button did not pause');
    const t=await video.evaluate(v=>v.currentTime);await page.waitForTimeout(300);
    if(await video.evaluate((v,t)=>Math.abs(v.currentTime-t)>.05,t))throw Error('Paused video advanced');
    // A failing source restores the complete still instead of leaving an empty hero.
    await page.evaluate(()=>{const v=document.querySelector('#ring-loop');v.src='missing-loop-test.mp4';v.load();});
    await button.click();
    await page.waitForFunction(()=>document.querySelector('#ring-loop').hidden);
  }catch(error){failures.push(error.stack||String(error));}
  finally{await finish(g,failures,{states:8});}
}
