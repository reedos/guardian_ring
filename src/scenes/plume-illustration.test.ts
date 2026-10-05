import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {plumePose,plumeOverviewPose,createPlumeIllustration,PLUME_FRAME} from './plume-illustration.js';
import {createTeachingSequence} from './teaching-sequence.js';

describe('qualitative plume illustration',()=>{
  const steps=[{id:'emit'},{id:'timeline'}];
  it('holds a paused or suspended lesson and fades before the repeat reset',()=>{
    const clock=createTeachingSequence(steps,{duration:1});
    clock.seek(0,.5);const paused=plumePose(clock.state());
    expect(plumePose(clock.tick(50))).toEqual(paused);
    clock.play({repeat:true});clock.tick(50);clock.setSuspended(true);
    expect(plumePose(clock.tick(50.5))).toEqual(paused);
    const at=(index:number,progress:number)=>plumePose({...clock.state(),index,progress});
    expect(at(0,1)).toEqual(at(1,0));
    expect(at(1,1).fade).toBe(0);expect(at(0,0).fade).toBe(0);
    expect(at(1,.99).fade).toBeLessThan(.01);
  });
  it('frames the full illustration across narrow and wide canvases',()=>{
    for(const [width,height] of [[390,302],[320,480],[1040,535],[844,200]]){
      const frame=plumeOverviewPose(width,height),camera=new THREE.PerspectiveCamera(width/height<.9?48:35,width/height,.025,150);
      camera.position.fromArray(frame.pos);camera.lookAt(new THREE.Vector3(...frame.target));camera.updateMatrixWorld();
      for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
        const p=new THREE.Vector3(...PLUME_FRAME.focus).add(new THREE.Vector3(x*PLUME_FRAME.detailSize[0]/2,y*PLUME_FRAME.detailSize[1]/2,z*PLUME_FRAME.detailSize[2]/2)).project(camera);
        expect(Math.abs(p.x)).toBeLessThan(.82);expect(Math.abs(p.y)).toBeLessThan(.76);
      }
    }
  });
  it('keeps emission pins and radiation attached to the moving source while molecular diagrams stay fixed',()=>{
    const scene=new THREE.Scene(),asset=new THREE.Group();scene.add(asset);
    for(const name of ['SourceCore','GasEnvelope','TurbulentRibbons','DissipatingWisps','MolecularSymbols']){
      const node=new THREE.Group();node.name=name;asset.add(node);
      node.add(new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshStandardMaterial({transparent:true,opacity:.5})));
    }
    const pin=()=>({co2:{pos:[1.85,3.85,-.1]},h2o:{pos:[-1.65,2.63,-.2]},source:{pos:[0,0,0]},bands:{pos:[0,0,0]},timeline:{pos:[2.9,3.15,1.9]}}),hotspots=pin(),dataHotspots=pin(),heatHotspots=pin();
    const ray={mode:'heat',group:new THREE.Group()};
    const earth=new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshStandardMaterial({map:new THREE.Texture()}));
    const view=createPlumeIllustration({scene,asset,paths:{records:[ray]},hotspots,dataHotspots,heatHotspots,earth});
    expect(view.ground).toBe(earth);expect(view.ground.material.map).toBeTruthy();
    const clock=createTeachingSequence(steps);clock.seek(0,.5);view.update(clock.state(),'heat');
    expect(hotspots.source.pos).toEqual(dataHotspots.source.pos);expect(hotspots.source.pos).toEqual(heatHotspots.source.pos);
    expect(hotspots.source.pos[1]).toBeCloseTo(view.head.position.y-.26);
    expect(ray.group.position.y+4.78).toBeCloseTo(hotspots.source.pos[1]);
    expect(hotspots.bands.pos[1]).toBeCloseTo(view.head.position.y-1.1);
    expect(heatHotspots.timeline.pos[1]).toBeCloseTo(ray.group.position.y+5.29);
    expect(dataHotspots.timeline.pos).toEqual([2.9,3.15,1.9]);
    expect(asset.getObjectByName('MolecularSymbols')?.parent).toBe(asset);
    const pose=view.head.position.clone();view.update(clock.tick(500),'heat');expect(view.head.position.equals(pose)).toBe(true);
    expect(view.ground.userData.solidForCamera).toBe(false);
  });
});
