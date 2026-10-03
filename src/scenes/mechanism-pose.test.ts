import {describe,it,expect} from 'vitest';
import {mechanismAngle} from './mechanism-pose.js';
import {teachingProgram} from './teaching-programs.js';
import {createTeachingSequence} from './teaching-sequence.js';
describe('continuous illustrative reference selection',()=>{
  const mechanism={motion:'reference',range:.52};
  const steps=teachingProgram('tirs2','light');
  const angle=(id:string,p:number,inspection=false)=>mechanismAngle(mechanism,{step:{id},steps,progress:p,inspection});
  it('meets every adjacent phase and the repeating boundary without a jump',()=>{
    for(let i=0;i<steps.length;i++)expect(angle(steps[i].id,1)).toBeCloseTo(angle(steps[(i+1)%steps.length].id,0),12);
  });
  it('holds reference directions, returns smoothly to Earth, and leaves inspection still',()=>{
    expect(angle('blackbody',.72)).toBe(.52);expect(angle('space',.72)).toBe(-.52);
    expect(angle('readout',.72)).toBe(-.52);expect(angle('earth',.72)).toBeCloseTo(0);
    expect(angle('earth',0)).toBe(0);expect(angle('earth',.125)).toBe(0);
    expect(angle('return',.125)).toBeCloseTo(-.26);expect(angle('return',.72)).toBeCloseTo(0);
    expect(angle('space',.72,true)).toBe(0);
  });
  it('starts continuously from inspection and repeats the real lesson with a distinct return phase',()=>{
    expect(steps.map((step:{id:string})=>step.id)).toEqual(['earth','blackbody','space','readout','digitize','transfer','return']);
    const clock=createTeachingSequence(steps,{duration:1});
    let previous=mechanismAngle(mechanism,clock.state());
    clock.play({repeat:true});clock.tick(0);
    expect(mechanismAngle(mechanism,clock.state())).toBe(previous);
    for(let frame=1;frame<=steps.length*200;frame++){
      const current=mechanismAngle(mechanism,clock.tick(frame/100));
      // Bounds the change for the fastest authored reference transition;
      // a hidden reset or a phase-boundary jump is much larger.
      expect(Math.abs(current-previous)).toBeLessThan(.065);previous=current;
    }
    expect(clock.state().step.id).toBe('earth');expect(previous).toBeCloseTo(0);
  });
});
