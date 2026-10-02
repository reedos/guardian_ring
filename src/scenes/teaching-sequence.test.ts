import { describe, expect, it } from 'vitest';
import { createTeachingSequence, polylineSampler } from './teaching-sequence.js';
const steps = [{id:'first'}, {id:'second'}, {id:'third'}];
describe('a presentation clock rather than a sensor clock', () => {
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
