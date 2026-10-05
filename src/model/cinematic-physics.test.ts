import {describe,it,expect} from 'vitest';
import {chargeSample,wheelSlew,eclipsePower,slabRadiance,calibrate,imageRows} from './cinematic-physics.js';

describe('automatic lesson physics',()=>{
  it('collects only the efficiency fraction, converts Q/C and clips the ideal ADC',()=>{
    expect(chargeSample(10,.6,2,5,8)).toEqual({charge:6,voltage:3,code:4});
    expect(chargeSample(100,.6,2,5,8).code).toBe(7);
    expect(chargeSample(10,0,2,5,8).code).toBe(0);
    expect(()=>chargeSample(1,1.1,1,1,8)).toThrow();
  });
  it('conserves inertial angular momentum and ends a slew at rest without reversing the body',()=>{
    let previous=-1;
    for(let i=0;i<=1000;i++){
      const p=i/1000,s=wheelSlew(p);expect(13*s.busVelocity+s.wheelRelativeVelocity).toBeCloseTo(0,12);
      expect(s.busAngle).toBeGreaterThanOrEqual(previous-1e-10);previous=s.busAngle;
      if(i>121&&i<798){const h=1e-6,derivative=(wheelSlew(p+h).busAngle-wheelSlew(p-h).busAngle)/(2*h);expect(derivative).toBeCloseTo(s.busVelocity,7);}
    }
    expect(wheelSlew(0).busVelocity).toBe(0);expect(wheelSlew(1).busVelocity).toBe(0);expect(wheelSlew(1).busAngle).toBeCloseTo(1.2);
  });
  it('balances power and integrates the battery energy across eclipse boundaries',()=>{
    for(let i=0;i<=1000;i++){const p=i/1000,s=eclipsePower(p);expect(s.solar).toBeCloseTo(s.load+s.battery);if(![250,550,850].includes(i)&&i>0&&i<1000){const h=1e-6;expect((eclipsePower(p+h).energy-eclipsePower(p-h).energy)/(2*h)).toBeCloseTo(s.battery,6);}}
    expect(eclipsePower(.4).solar).toBe(0);expect(eclipsePower(1).energy).toBeCloseTo(eclipsePower(0).energy);
  });
  it('includes emission, has correct transparent/opaque limits and preserves thermal equilibrium',()=>{
    expect(slabRadiance(10,2,1).outgoing).toBe(10);expect(slabRadiance(10,2,0).outgoing).toBe(2);
    expect(slabRadiance(10,2,.5).outgoing).toBe(6);
    for(const tau of [0,.2,.7,1])expect(slabRadiance(4,4,tau).outgoing).toBeCloseTo(4);
  });
  it('recovers only the injected affine error from two distinct references',()=>{
    for(const signal of [.05,.2,.6,.9])expect(calibrate(signal*1.15+.15,0,1,.15,1.3)).toBeCloseTo(signal,12);
    expect(()=>calibrate(1,0,1,.3,.3)).toThrow();
  });
  it('reveals complete samples and never invents an extra image row',()=>{
    expect(imageRows(0)).toBe(0);expect(imageRows(.5)).toBe(12);expect(imageRows(1)).toBe(24);expect(imageRows(2)).toBe(24);
  });
});
