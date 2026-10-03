import {describe,it,expect} from 'vitest';
import {Vector3} from 'three';
import {parabolicRay,pointOnFocusRay} from './ideal-focus.js';
describe('ideal prime focus',()=>{
  it('reflects each sampled on-axis ray to the same focus with equal optical path length',()=>{
    for(const f of [.8,1.5,3])for(let angle=0;angle<6.28;angle+=.24)for(const radius of [.3,.8,1.5]){
      const ray=parabolicRay(radius*Math.cos(angle),radius*Math.sin(angle),{f,entry:5});
      const direction=new Vector3(...ray.points[2]).sub(new Vector3(...ray.points[1])).normalize();
      expect(direction.distanceTo(new Vector3(...ray.outgoing))).toBeLessThan(1e-12);
      expect(ray.length).toBeCloseTo(5+f,12);
      const normal=new Vector3(...ray.normal);
      expect(new Vector3(...ray.incoming).dot(normal)).toBeCloseTo(-new Vector3(...ray.outgoing).dot(normal),12);
      expect(pointOnFocusRay(ray,0)).toEqual(ray.points[0]);
      expect(new Vector3(...pointOnFocusRay(ray,1)).distanceTo(new Vector3(...ray.points[2]))).toBeLessThan(1e-12);
    }
  });
  it('samples equal distance per step on both straight segments without corner cutting',()=>{
    const ray=parabolicRay(1.2,.6),hitFraction=new Vector3(...ray.points[0]).distanceTo(new Vector3(...ray.points[1]))/ray.length;
    for(const u of [.1,hitFraction+.05]){
      const a=new Vector3(...pointOnFocusRay(ray,u)),b=new Vector3(...pointOnFocusRay(ray,u+.01));
      expect(a.distanceTo(b)).toBeCloseTo(ray.length*.01,12);
    }
    expect(new Vector3(...pointOnFocusRay(ray,hitFraction)).distanceTo(new Vector3(...ray.points[1]))).toBeLessThan(1e-12);
    expect(()=>parabolicRay(1,1,{f:0})).toThrow();
  });
});
