import {describe,it,expect} from 'vitest';
import {missionEntry,MISSION_VISIT_KEY} from './mission-entry.js';
describe('mission entry intent',()=>{
  const memory=()=>{const values=new Map();return {getItem:(key:string)=>values.get(key),setItem:(key:string,value:string)=>values.set(key,value)};};
  it('offers a bare first visit once while leaving return visits alone',()=>{
    const storage=memory(),first=missionEntry('https://example.test/visualizer.html',storage);
    expect(first.requested).toBe(true);expect(first.automatic).toBe(true);first.remember();
    expect(storage.getItem(MISSION_VISIT_KEY)).toBe('1');
    expect(missionEntry('https://example.test/visualizer.html',storage).requested).toBe(false);
  });
  it('respects explicit destinations and keeps an explicit mission request available',()=>{
    for(const suffix of ['?view=2.light.optics','?view=0.light','?assembly=inside','?follow=leo','?pane=scenario','?orbit=leo','?mission=0','#detector'])
      expect(missionEntry(`https://example.test/visualizer.html${suffix}`,memory()).requested).toBe(false);
    const storage=memory();storage.setItem(MISSION_VISIT_KEY,'1');
    const requested=missionEntry('https://example.test/visualizer.html?view=0.light&mission=1',storage);
    expect(requested.requested).toBe(true);expect(requested.automatic).toBe(false);
  });
  it('does not turn unavailable storage into a repeated automatic intro',()=>{
    const storage={getItem(){throw new Error('unavailable');},setItem(){throw new Error('unavailable');}};
    const entry=missionEntry('https://example.test/visualizer.html',storage);
    expect(entry.requested).toBe(false);expect(()=>entry.remember()).not.toThrow();
    expect(missionEntry('https://example.test/visualizer.html?mission=1',storage).requested).toBe(true);
  });
  it('reports a failed write even when reading storage works',()=>{
    const storage={getItem(){return null;},setItem(){throw new Error('quota');}};
    const entry=missionEntry('https://example.test/visualizer.html',storage);
    expect(entry.automatic).toBe(true);expect(entry.remember()).toBe(false);
  });
});
