import { describe,expect,it } from 'vitest';
import { Vector3 } from 'three';
import { reflectedDirection } from './mirror-demo.js';
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
});
