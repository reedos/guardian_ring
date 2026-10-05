import {afterEach,describe,expect,it,vi} from 'vitest';
import * as THREE from 'three';
// The standalone browser gate also runs against these small Three.js fixtures.
import {checkCoplanar} from '../../tools/gate-geometry.mjs';

function fixture(gap:number,tilt=.01){
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera();
 const triangle=(xy:number[][],offset:number,color:number)=>{
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(xy.flatMap(([x,y])=>[x,y,offset-tilt*x]),3));
  scene.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color})));
 };
 triangle([[0,0],[.06,0],[0,.06]],0,0x424f59);
 triangle([[.01,.01],[.04,.01],[.01,.04]],gap,0xaab6c0);
 vi.stubGlobal('window',{grx:{state:{scene:0},built:[{scene,camera:{pos:[0,0,1],target:[0,0,0]}}],camera}});
 return checkCoplanar();
}
afterEach(()=>vi.unstubAllGlobals());
describe('coplanar gate plane geometry',()=>{
 it('detects overlapping axis-aligned faces',()=>expect(fixture(0,0).hits.length).toBeGreaterThan(0));
 it('detects coplanar tilted faces with different first-vertex depths',()=>expect(fixture(0).hits.length).toBeGreaterThan(0));
 it('rejects separated tilted planes despite equal first-vertex depths',()=>expect(fixture(.0001).hits).toEqual([]));
 it('retains the existing near-coplanar separation tolerance',()=>{
  expect(fixture(.00001).hits.length).toBeGreaterThan(0);
  expect(fixture(.00004).hits).toEqual([]);
 });
});
