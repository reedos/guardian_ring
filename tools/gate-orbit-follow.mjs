// Runtime follow coverage complements the static authored-pose unit tests.
// The 15% obstruction rule applies to orbit guides, not the intentional Earth
// backdrop or the spacecraft being inspected.
export async function checkOrbitFollow(page) {
 return page.evaluate(async()=>{
  const T=grx.THREE,b=grx.built[0],bad=[],samples=[];
  grx.overview();grx.settle();b.setMotion(true);grx.setOrbitFollow('leo');
  await new Promise(resolve=>{const tick=()=>grx.isCameraMoving()?requestAnimationFrame(tick):resolve();requestAnimationFrame(tick);});
  const guides=[];b.scene.traverse(o=>{if(o.userData.role==='schematic-orbit-guide')guides.push(o);});
  for(const guide of guides)if(!guide.isLine||guide.material.depthWrite||guide.material.blending!==T.AdditiveBlending||guide.material.linewidth!==1)bad.push(`${guide.name}: orbit guide must remain a thin additive line`);
  const start=performance.now();let last=0;
  await new Promise(resolve=>{
   const tick=()=>{
    const now=performance.now();
    if(now-last>=100){
     last=now;
     const camera=grx.camera,aim=grx.controls.target,d=camera.position.distanceTo(aim),ahead=camera.position.clone().lerp(aim,.45);
     const occupied=b.occupancy?.segment(camera.position,ahead,.06*d,0)||camera.position.length()<=1.06;
     if(occupied)bad.push('LEO follow camera or forward clearance intersects Earth');
     const row={elapsed:now-start,distance:d,occupied};samples.push(row);
    }
    if(now-start>=9000)resolve();else requestAnimationFrame(tick);
   };tick();
  });
  grx.setOrbitFollow(null);b.setMotion(false);
  return {failures:[...new Set(bad)],samples,guideCount:guides.length};
 });
}
