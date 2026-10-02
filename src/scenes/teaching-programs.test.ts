import { describe,expect,it } from 'vitest';
import { teachingProgram } from './teaching-programs.js';
import { compute } from '../model/engine';
import { content } from '../data.js';
import { claimByKey } from '../claims.js';
describe('lesson evidence and assembly boundaries',()=>{
  it('resolves every canonical claim in every scene and layer',()=>{
    const model=compute(),C=content(model);let n=0;
    for(const id of ['satellite','payload','focal-plane','pixel','plume','ground','abi','tirs2','atmosphere'])for(const mode of ['light','data','heat'])for(const step of teachingProgram(id,mode))for(const key of step.claimKeys||[]){expect(claimByKey(model,C,key),`${id}/${mode}/${step.id}: ${key}`).not.toBeNull();n++;}
    expect(n).toBeGreaterThan(10);
  });
  it('does not introduce conversion hardware or a radiator in the wrong assembly',()=>{
    expect(teachingProgram('satellite','data').some((s:{id:string})=>s.id==='digitize')).toBe(false);
    expect(teachingProgram('pixel','light').some((s:{id:string})=>s.id==='digitize')).toBe(false);
    expect(teachingProgram('focal-plane','data').some((s:{id:string})=>s.id==='feedback')).toBe(false);
    expect(teachingProgram('focal-plane','heat').some((s:{id:string})=>s.id==='radiate')).toBe(false);
    expect(teachingProgram('ground','heat')[0].body).not.toContain('cooler');
  });
});
