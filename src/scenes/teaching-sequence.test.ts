import { describe, expect, it } from 'vitest';
import { createTeachingSequence, polylineSampler } from './teaching-sequence.js';
const steps = [{id:'first'}, {id:'second'}, {id:'third'}];
describe('a presentation clock rather than a sensor clock', () => {
  it('compresses a full chapter without losing any phase, then restores normal part pacing',()=>{
    const c=createTeachingSequence(steps,{duration:3.6});const visited=new Set<string>();
    c.play({duration:8/steps.length});
    for(let frame=0;frame<=481;frame++){c.tick(frame/60);visited.add(c.state().step.id);}
    expect([...visited]).toEqual(['first','second','third']);expect(c.state()).toMatchObject({playing:false,progress:1});
    c.seek(0);c.play({singleStep:true});c.tick(20);c.tick(20.9);
    expect(c.state().progress).toBeCloseTo(.25);
  });
  it('plays an inspected part once without advancing into another component',()=>{
    const clock=createTeachingSequence(steps,{duration:.5});clock.seek(1);clock.play({singleStep:true});
    for(const time of [0,.2,.4,.6,.8])clock.tick(time);
    expect(clock.state()).toMatchObject({index:1,progress:1,playing:false,repeating:false});
    clock.seek(0);clock.play();for(const time of [1,1.5,2,2.5])clock.tick(time);
    expect(clock.state()).toMatchObject({index:2,progress:1,playing:false});
  });
  it('repeats activity continuously while keeping the ordered lesson one-shot', () => {
    const c=createTeachingSequence(steps,{duration:.5});c.play({repeat:true});
    for(const t of [0,.5,1,1.5,2])c.tick(t);
    expect(c.state()).toMatchObject({index:1,progress:0,playing:true,repeating:true});
    c.pause();c.tick(2.5);expect(c.state().playing).toBe(false);
    c.setSuspended(true);c.play({repeat:true});c.tick(3);c.tick(3.5);expect(c.state().progress).toBe(0);
    c.setSuspended(false);c.tick(4);c.tick(4.25);expect(c.state().progress).toBe(.5);
    c.seek(2);c.play();c.tick(5);c.tick(5.5);expect(c.state()).toMatchObject({index:2,progress:1,playing:false,repeating:false});
  });
  it('produces the same phase for different frame cadences', () => {
    const run = (times: number[]) => { const c=createTeachingSequence(steps,{duration:2}); c.play(); for(const t of times)c.tick(t); return c.state(); };
    expect(run([0,.1,.7,1.4,2,2.8,3.4])).toMatchObject({index:1,progress:.7});
    expect(run(Array.from({length:35},(_,i)=>i/10))).toMatchObject({index:1,progress:expect.closeTo(.7)});
  });
  it('pauses at an inspection pose and never advances after a tab suspension', () => {
    const c=createTeachingSequence(steps); c.play();c.tick(0);c.tick(.5);const p=c.state().progress;
    c.tick(40);expect(c.state().progress).toBe(p);c.setInspection(true);c.tick(41);expect(c.state()).toMatchObject({playing:false,inspection:true,progress:p});
  });
  it('supports reduced-motion stepping and stops at the end without an invisible restart', () => {
    const c=createTeachingSequence(steps,{duration:.5,reduced:true});expect(c.state().playing).toBe(false);
    c.step(-1);expect(c.state()).toMatchObject({index:2,progress:.72,inspection:false,playing:false});
    c.reset();c.play();for(const t of [0,.5,1,1.5,2])c.tick(t);expect(c.state()).toMatchObject({index:2,progress:1,playing:false});
  });
  it('seeks an exact phase start without changing deliberate user stepping', () => {
    const c=createTeachingSequence(steps,{duration:2});c.step(1);expect(c.state()).toMatchObject({index:1,progress:.72});
    c.seek(1);expect(c.state()).toMatchObject({index:1,progress:0,playing:false,inspection:false});
    c.play();c.tick(50);c.tick(50.5);expect(c.state()).toMatchObject({index:1,progress:.25});
    c.seek(2,.4);c.play();c.tick(100);expect(c.state()).toMatchObject({index:2,progress:.4});
    c.step(-1);expect(c.state()).toMatchObject({index:1,progress:.72,playing:false});
  });
  it('replays a complete phase from zero through its end at different frame rates', () => {
    for(const dt of [1/120,1/60,1/30]){
      const c=createTeachingSequence(steps,{duration:1});let elapsed=0,count=0,passes=0,min=1,max=0;
      while(count<240){
        c.seek(1);c.play();c.tick(elapsed);
        while(c.state().index===1){elapsed+=dt;c.tick(elapsed);if(c.state().index!==1)break;const p=c.state().progress;count++;min=Math.min(min,p);max=Math.max(max,p);}
        passes++;
      }
      expect(min).toBeLessThan(.04);expect(max).toBeGreaterThan(.96);expect(count).toBeGreaterThanOrEqual(240);expect(passes).toBeGreaterThanOrEqual(2);
    }
  });
  it('rejects invalid seeks without changing the current phase or pause state', () => {
    const c=createTeachingSequence(steps);c.seek(1,.3);const before=c.state();
    for(const [index,progress] of [[-1,0],[3,0],[1.5,0],[1,NaN],[1,-.1],[1,1.1]])expect(()=>c.seek(index,progress)).toThrow(RangeError);
    expect(c.state()).toEqual(before);
  });
});
describe('straight light routes at constant drawing speed', () => {
  it('uses cumulative length across unequal segments without stopping at vertices', () => {
    const p=polylineSampler([[0,0,0],[1,0,0],[1,3,0]]);
    expect(p.length).toBe(4);expect(p.at(.125).point).toEqual([.5,0,0]);expect(p.at(.5).point).toEqual([1,1,0]);expect(p.at(.75).point).toEqual([1,2,0]);
  });
  it('keeps exact endpoints, handles duplicate vertices, and rejects degenerate routes', () => {
    const p=polylineSampler([[0,0,0],[0,0,0],[0,2,0]]);
    expect(p.at(0).point).toEqual([0,0,0]);expect(p.at(1).point).toEqual([0,2,0]);
    expect(()=>polylineSampler([[0,0,0],[0,0,0]])).toThrow();expect(()=>polylineSampler([[0,0,0],[NaN,0,0]])).toThrow();
  });
});
