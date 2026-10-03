import { describe,expect,it } from 'vitest';
import { Group, Vector3 } from 'three';
import { createMirrorDemo, reflectedDirection } from './mirror-demo.js';
describe('mirror steering teaches reflection, not arbitrary ray bends',()=>{
  it('preserves tangential direction and reverses the normal component',()=>{
    const normal=new Vector3(.6,.2,.7).normalize(),incoming=new Vector3(.1,-.2,-1).normalize();
    const reflected=new Vector3(...reflectedDirection(incoming.toArray(),normal.toArray()));
    expect(reflected.length()).toBeCloseTo(1);expect(reflected.dot(normal)).toBeCloseTo(-incoming.dot(normal));
    expect(reflected.clone().addScaledVector(normal,-reflected.dot(normal)).distanceTo(incoming.clone().addScaledVector(normal,-incoming.dot(normal)))).toBeLessThan(1e-12);
  });
  it('turns a ray by twice the change in mirror angle in its incidence plane',()=>{
    const a=.1,n0=[0,0,1],n1=[Math.sin(a),0,Math.cos(a)];
    const r0=new Vector3(...reflectedDirection([0,0,-1],n0)),r1=new Vector3(...reflectedDirection([0,0,-1],n1));
    expect(r0.angleTo(r1)).toBeCloseTo(2*a,12);
  });
  it('keeps the reflection interaction on the moving optical face, ahead of the shaft pivot',()=>{
    const pivot=new Group();pivot.position.set(-2.47,.01,3.94);
    const normal=new Vector3(.72,.22,.66).normalize(),surfaceOffset=.067;
    const demo=createMirrorDemo(pivot,normal.toArray(),{surfaceOffset});
    for(const angle of [-.28,0,.28]){
      pivot.rotation.x=angle;pivot.updateMatrixWorld(true);
      demo.update({inspection:false,step:{id:'slew'}});
      const expected=normal.clone().multiplyScalar(surfaceOffset).applyMatrix4(pivot.matrixWorld);
      const positions=demo.line.geometry.getAttribute('position');
      expect(new Vector3().fromBufferAttribute(positions,1).distanceTo(expected)).toBeLessThan(1e-6);
      expect(new Vector3().fromBufferAttribute(positions,2).distanceTo(expected)).toBeLessThan(1e-6);
    }
    demo.update({inspection:true,step:{id:'slew'}});expect(demo.line.visible).toBe(false);
    demo.update({inspection:false,step:{id:'collect'}});expect(demo.line.visible).toBe(false);
  });
});
