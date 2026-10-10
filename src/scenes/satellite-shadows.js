// A single bounded shadow map gives the authored spacecraft a directional Sun.
// Tiny printed details do not need their own caster; overlays never cast shadows.
export function configureSatelliteShadows(built){
  const sun=built.scene.children.find(light=>light.isDirectionalLight);
  if(!sun)return;
  sun.castShadow=true;
  sun.shadow.mapSize.set(built.quality?.mobile?512:1024,built.quality?.mobile?512:1024);
  Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.5,far:25});
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias=-.0001;sun.shadow.normalBias=.02;
  for(const mesh of built.solids){
    if(mesh.userData.teachingOverlay||mesh.userData.printed)continue;
    mesh.geometry.computeBoundingSphere();
    mesh.castShadow=mesh.geometry.boundingSphere.radius>.08;
    mesh.receiveShadow=true;
  }
  built.look.shadows=true;
}
