import fs from 'node:fs';
import {openGate,show,finish} from './gate-common.mjs';
import {openParts} from './gate-actions.mjs';
import {CINEMATIC_LESSONS} from '../src/cinematic-lessons.js';
const form=process.argv[2]||'desktop',gate=await openGate('cinematics',form);
if(gate){
  const {page,scenes}=gate,failures=[],cases=[],captures=[];let states=0;
  const check=(ok,message)=>{states++;if(!ok)throw Error(message);};
  const state=()=>page.evaluate(()=>grx.cinematic.state());
  const frames=n=>page.evaluate(n=>new Promise(resolve=>{const tick=()=>--n?requestAnimationFrame(tick):resolve();requestAnimationFrame(tick);}),n);
  fs.mkdirSync('.local/cinematic-gates',{recursive:true});
  try{
    for(const [id,lesson] of Object.entries(CINEMATIC_LESSONS)){
      const scene=scenes.find(s=>s.id===lesson.scene);if(!scene)continue;
      await show(page,scene.i,'light');await openParts(page);
      const opener=page.getByRole('button',{name:lesson.title,exact:true});
      // Exercise both secondary lessons directly in Light: no mode swap needed.
      if(!await opener.isVisible())await page.locator('.cinematic-more summary').click();
      await opener.click();await page.locator('#cinematic-demo').waitFor({state:'visible'});
      const start=await state();check(!start.playing&&start.elapsed===0,`${id}: opened already playing or with stale progress`);
      check(await page.locator('#cinematic-demo [data-cinematic="play"]').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.width>=44&&r.height>=44;}),`${id}: Play is clipped or below the fold`);
      check(await page.locator('#cinematic-demo').evaluate(el=>el.scrollWidth<=el.clientWidth+1),`${id}: horizontal overflow`);
      check(await page.locator('#cinematic-demo input, #cinematic-demo select').count()===0,`${id}: required parameter controls reintroduced`);
      await page.locator('#cinematic-demo [data-cinematic="play"]').click();await page.waitForFunction(()=>grx.cinematic.state().elapsed>.12);
      const running=await state(),before=await page.locator('#cinematic-demo canvas').evaluate(el=>el.toDataURL());
      // Some lessons intentionally establish a still reference before motion.
      await page.waitForFunction(before=>document.querySelector('#cinematic-demo canvas').toDataURL()!==before,before,{timeout:8000});
      check((await state()).elapsed>running.elapsed,`${id}: Play does not advance`);
      check(await page.locator('#cinematic-demo canvas').evaluate((el,before)=>el.toDataURL()!==before,before),`${id}: no rendered movement after Play`);
      await page.locator('#cinematic-demo canvas').focus();await page.keyboard.press('ArrowRight');await frames(3);
      check((await state()).playing,`${id}: camera keyboard gesture stopped playback`);
      const box=await page.locator('#cinematic-demo canvas').boundingBox();await page.mouse.move(box.x+box.width*.3,box.y+box.height*.3);await page.mouse.down();await page.mouse.move(box.x+box.width*.4,box.y+box.height*.34,{steps:4});await page.mouse.up();
      check((await state()).playing,`${id}: drag stopped playback`);
      await page.locator('#cinematic-demo [data-cinematic="play"]').click();const paused=await state();await frames(8);check((await state()).elapsed===paused.elapsed,`${id}: explicit pause did not hold`);
      for(let beat=0;beat<lesson.beats.length;beat++){
        const starts=lesson.starts||lesson.beats.map((_,i)=>i/lesson.beats.length),p=starts[beat]+((starts[beat+1]??1)-starts[beat])*.65;
        await page.evaluate(seconds=>grx.cinematic.seek(seconds),p*lesson.duration);await frames(2);
        check((await state()).phase===beat,`${id}: caption beat ${beat} does not match time`);
        check(await page.locator('#cinematic-demo .cinematic-caption h3').textContent()===lesson.beats[beat].title,`${id}: missing caption`);
        const path=`.local/cinematic-gates/${form}-${id}-${beat}.png`;await page.screenshot({path});captures.push(path);
      }
      await page.locator('#cinematic-demo details summary').click();await frames(2);check(!(await state()).playing,`${id}: evidence did not pause`);
      check(await page.locator('#cinematic-demo .cinematic-evidence section').count()>=3,`${id}: evidence missing`);
      await page.locator('#cinematic-demo [data-cinematic="replay"]').click();await frames(3);check((await state()).playing&&(await state()).elapsed<1,`${id}: replay did not reset and resume`);
      await page.evaluate(seconds=>grx.cinematic.seek(seconds),lesson.duration-.12);await page.waitForFunction(()=>!grx.cinematic.state().playing);
      check((await state()).elapsed===lesson.duration,`${id}: failed to finish`);
      await page.keyboard.press('Escape');check(!(await state()).open,`${id}: Escape did not close`);check(await opener.evaluate(el=>document.activeElement===el),`${id}: focus did not return to opener`);
      cases.push(id);
    }
    await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>grx.cinematic.open('pixel'));await frames(3);check(!(await state()).playing,'Reduced motion starts without Play');
    await page.locator('#cinematic-demo [data-cinematic="play"]').click();await frames(8);check((await state()).playing&&(await state()).elapsed>0,'Explicit Play fails under reduced motion');
    await page.evaluate(()=>grx.cinematic.close());
    const rows=Object.entries(CINEMATIC_LESSONS).map(([id,lesson])=>`<h2>${lesson.title}</h2><div>${lesson.beats.map((b,i)=>`<figure><img src="${form}-${id}-${i}.png"><figcaption>${b.title}</figcaption></figure>`).join('')}</div>`);
    fs.writeFileSync(`.local/cinematic-gates/${form}.html`,`<!doctype html><meta charset="utf-8"><title>Cinematic review</title><style>body{background:#080c10;color:#eee;font:14px system-ui;margin:24px}div{display:flex;overflow:auto;gap:14px}figure{margin:0;flex:0 0 ${form==='phone'?260:560}px}img{width:100%}h2{color:#e6ba82}</style><h1>${form}: automatic lesson storyboards</h1>${rows.join('')}`);
  }catch(error){failures.push(error.stack||String(error));}
  finally{await finish(gate,failures,{states,lessonCases:cases,captures});}
}
