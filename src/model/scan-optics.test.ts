import {describe,it,expect} from 'vitest';
import {Vector3} from 'three';
import {scanRay,scanPose,sampleScanPath} from './scan-optics.js';
const v=(p:number[])=>new Vector3(...p);
describe('ideal scan optics',()=>{
  it('keeps the animated ray inside the drawn mirror aperture and closes its loop',()=>{
    for(let i=0;i<=500;i++){
      const pose=scanPose(i/500,'axes'),r=scanRay(pose.a,pose.b),offset=v(r.points[2]).sub(v(r.mirrors[1].center));
      const axis=v([1,0,1]).normalize(),across=new Vector3().crossVectors(v(r.mirrors[1].normal),axis).normalize();
      expect(Math.abs(offset.dot(axis))).toBeLessThan(.95);
      expect(Math.abs(offset.dot(across))).toBeLessThan(.95);
    }
    const start=scanPose(0,'axes'),end=scanPose(1,'axes');
    expect(end.a).toBeCloseTo(start.a,12);expect(end.b).toBeCloseTo(start.b,12);
  });
  it('intersects both planes and obeys reflection in both propagation directions',()=>{
    for(const a of [-.16,-.08,0,.08,.16])for(const b of [-.16,0,.16]){
      const r=scanRay(a,b),p=r.points.map(v);
      for(let i=0;i<2;i++){
        const n=v(r.mirrors[i].normal),hit=p[i+1],d=hit.clone().sub(p[i]).normalize(),e=p[i+2].clone().sub(hit).normalize();
        expect(hit.clone().sub(v(r.mirrors[i].center)).dot(n)).toBeCloseTo(0,12);
        expect(d.clone().reflect(n).distanceTo(e)).toBeLessThan(1e-12);
        expect(e.clone().negate().reflect(n).distanceTo(d.clone().negate())).toBeLessThan(1e-12);
      }
      expect(p[3].z).toBeCloseTo(2.4,12);
      expect(p.every(p=>p.toArray().every(Number.isFinite))).toBe(true);
    }
  });
  it('doubles a single mirror angular change, without treating two axes as independent scalar angles',()=>{
    const reference=v(scanRay().middle);
    for(const a of [-.15,-.05,.05,.15])expect(reference.angleTo(v(scanRay(a).middle))).toBeCloseTo(2*Math.abs(a),12);
    expect(scanRay(0,.1).points[3][1]).not.toBeCloseTo(scanRay(0,0).points[3][1],6);
  });
  it('preserves ray vertices and samples endpoints rather than a curved path',()=>{
    const p=scanRay(.08,.09).points;
    expect(sampleScanPath(p,0)).toEqual(p[0]);
    expect(v(sampleScanPath(p,1)).distanceTo(v(p.at(-1)!))).toBeLessThan(1e-12);
    expect(()=>scanRay(NaN,0)).toThrow();expect(()=>scanRay(.3,0)).toThrow();
  });
});
