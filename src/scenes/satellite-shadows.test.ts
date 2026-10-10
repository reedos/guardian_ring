import {it,expect} from 'vitest';
import {Scene,DirectionalLight,Mesh,BoxGeometry,MeshStandardMaterial} from 'three';
import {configureSatelliteShadows} from './satellite-shadows.js';
it('uses one bounded Sun and keeps small details and teaching overlays out of the caster set',()=>{
  const scene=new Scene(),sun=new DirectionalLight(),fill=new DirectionalLight();scene.add(sun,fill);
  const box=(size:number)=>new Mesh(new BoxGeometry(size,size,size),new MeshStandardMaterial());
  const structure=box(1),fineDetail=box(.01),overlay=box(1);overlay.userData.teachingOverlay=true;
  const built={scene,solids:[structure,fineDetail,overlay],quality:{mobile:true},look:{shadows:false}};
  configureSatelliteShadows(built);
  expect(sun.castShadow).toBe(true);expect(fill.castShadow).toBe(false);
  expect(sun.shadow.mapSize.toArray()).toEqual([512,512]);
  expect(structure.castShadow&&structure.receiveShadow).toBe(true);
  expect(fineDetail.castShadow).toBe(false);expect(fineDetail.receiveShadow).toBe(true);
  expect(overlay.castShadow||overlay.receiveShadow).toBe(false);
  expect(built.look.shadows).toBe(true);
});
