// Public UI for motion preference; direct phase probes preserve exhaustive
// engineering coverage after removal of the duplicate sequence transport.
export async function setMotion(page,playing){
 if(!await page.locator('#more-menu').isVisible())await page.locator('#more-btn').click();
 await page.locator('#activity-motion').setChecked(playing);
 if(await page.locator('#more-menu').isVisible())await page.locator('#more-btn').click();
}
export async function lessonAction(page,name){
 if(name==='play'){
  const playing=await page.evaluate(()=>grx.built[grx.state.scene].teaching.state().playing);
  if(!playing)await page.evaluate(()=>{grx.overview();grx.settle();});
  return setMotion(page,!playing);
 }
 await page.evaluate(name=>{grx.setSceneActivity(false);grx.stepTeaching(name==='previous'?-1:1,{reset:name==='reset'});grx.settle();},name);
}
export async function openParts(page){
 if(await page.locator('#tab-parts').isVisible()&&await page.evaluate(()=>innerWidth<=760&&!document.body.classList.contains('sheet-open')))await page.locator('#tab-parts').click();
}
