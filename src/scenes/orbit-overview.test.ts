import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createGeoViewingPatches, orbitalOverviewPose } from './orbit-overview.js';

describe('Earth opening composition', () => {
  it('keeps a large complete globe on portrait, landscape, and desktop canvases', () => {
    for (const [width,height] of [[390,300],[320,480],[844,200],[1040,520],[1440,700]]) {
      const pose=orbitalOverviewPose(width,height),aspect=width/height;
      const camera=new THREE.PerspectiveCamera(aspect<.9?48:35,aspect,.03,120);
      camera.position.fromArray(pose.pos);camera.lookAt(new THREE.Vector3(...pose.target));camera.updateMatrixWorld();
      const xs:number[]=[],ys:number[]=[];
      for(let lat=-90;lat<=90;lat+=5)for(let lon=0;lon<360;lon+=5){
        const p=new THREE.Vector3().setFromSphericalCoords(1,THREE.MathUtils.degToRad(90-lat),THREE.MathUtils.degToRad(lon)).project(camera);
        xs.push(p.x);ys.push(p.y);expect(Math.abs(p.x)).toBeLessThan(.75);expect(Math.abs(p.y)).toBeLessThan(.75);
      }
      const extent=Math.max((Math.max(...xs)-Math.min(...xs))/2,(Math.max(...ys)-Math.min(...ys))/2);
      expect(extent).toBeGreaterThan(.65);expect(extent).toBeLessThan(.72);
      expect(camera.position.length()).toBeGreaterThan(2.6);
    }
  });
  it('keeps the illustrative patch centers on the GEO subpoints through Earth rotation', () => {
    const spin=new THREE.Group(),family=new THREE.Group();spin.add(family);
    const vehicles=[.2,1.5,3.1,4.2,5.5].map(a=>{const node=new THREE.Object3D();node.position.set(2.5*Math.cos(a),0,2.5*Math.sin(a));family.add(node);return node;});
    const patches=createGeoViewingPatches(vehicles);spin.add(patches);
    for(let angle=0;angle<Math.PI*2;angle+=.31){
      spin.rotation.y=angle;spin.updateMatrixWorld(true);
      for(let i=0;i<vehicles.length;i++){
        const center=patches.material.uniforms.centers.value[i].clone();patches.localToWorld(center).normalize();
        expect(center.distanceTo(vehicles[i].getWorldPosition(new THREE.Vector3()).normalize())).toBeLessThan(1e-12);
      }
    }
    expect(patches.userData.physicalCoverage).toBe(false);
    expect(patches.material.depthWrite).toBe(false);
    patches.geometry.dispose();patches.material.dispose();
  });
});
