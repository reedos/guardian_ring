import {describe,it,expect} from 'vitest';
// @ts-expect-error Vitest supplies Node I/O; app types remain browser-only.
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {orbitGuidePoints,replaceOrbitGuideTubes} from './orbit-guides.js';

describe('screen-space orbit guides',()=>{
 it('retains the authored GLB guide coordinates and family transforms',()=>{
  const buffer=readFileSync(new URL('../../public/models/earth-orbits.glb',import.meta.url));
  const gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
  const guides=gltf.nodes.filter((n:any)=>n.extras?.role==='schematic-orbit-guide');
  expect(guides.length).toBe(8);
  for(const node of guides){
   const accessor=gltf.accessors[gltf.meshes[node.mesh].primitives[0].attributes.POSITION];
   const bounds=new THREE.Box3().setFromPoints(orbitGuidePoints(node.name));
   for(let i=0;i<3;i++){
    expect(Math.abs(bounds.min.getComponent(i)-accessor.min[i]),node.name).toBeLessThan(.004);
    expect(Math.abs(bounds.max.getComponent(i)-accessor.max[i]),node.name).toBeLessThan(.004);
   }
  }
 });
 it('replaces only diagram tubes with additive pixel-width lines',()=>{
  const root=new THREE.Group(),family=new THREE.Group();root.add(family);
  const guide=new THREE.Mesh(new THREE.TorusGeometry(),new THREE.MeshStandardMaterial({color:'#e6ba82'}));
  guide.name='geo-orbit';guide.userData.role='schematic-orbit-guide';family.add(guide);
  const craft=new THREE.Mesh();family.add(craft);replaceOrbitGuideTubes(root);
  const line=root.getObjectByName('geo-orbit') as THREE.LineLoop;
  expect(line.isLineLoop).toBe(true);expect(line.parent).toBe(family);expect(craft.parent).toBe(family);
  const material=line.material as THREE.LineBasicMaterial;
  expect(material.linewidth).toBe(1);expect(material.depthWrite).toBe(false);expect(material.blending).toBe(THREE.AdditiveBlending);
 });
});
