import { describe,expect,it } from 'vitest';
import { createTeachingFlows,createPhaseHighlights,createSignalIndicator } from './teaching-flows.js';
import { createTeachingSequence } from './teaching-sequence.js';
import { Group,Mesh,BoxGeometry,MeshStandardMaterial } from 'three';
describe('physically distinct teaching paths',()=>{
  it('allows only one reference source to propagate during a TIRS selection',()=>{
    const flows=createTeachingFlows({light:['earth','blackbody','space'].map((phase,i)=>({kind:'light',phases:[phase],exclusive:true,points:[[i,0,0],[i,0,3]]}))},(p:number[])=>p);
    const clock=createTeachingSequence([{id:'earth'},{id:'blackbody'},{id:'space'}]);
    for(let i=0;i<3;i++){
      clock.step(i===0?0:1);flows.update(clock.state(),'light');
      expect(flows.records.filter(r=>r.group.visible)).toHaveLength(1);
      expect(flows.records[i].group.visible).toBe(true);
    }
  });
  it('carries command and measured feedback in opposite directions, with different stroke patterns',()=>{
    const flows=createTeachingFlows({data:[{kind:'command',points:[[0,0,0],[3,0,0]]},{kind:'feedback',points:[[3,0,0],[0,0,0]]}]},(p:number[])=>p);
    expect(flows.records[0].path.at(.5).tangent).toEqual([1,0,0]);expect(flows.records[1].path.at(.5).tangent).toEqual([-1,0,0]);
    expect(flows.records[0].style.dash).not.toBe(flows.records[1].style.dash);
    flows.root.traverse(o=>{if('isLine' in o&&o.isLine)expect(o.userData).toMatchObject({teachingOverlay:true,solidForCamera:false});});
  });
  it('freezes source-reading playback without changing an explicit pause choice',()=>{
    const clock=createTeachingSequence([{id:'one'},{id:'two'}]);clock.play();clock.tick(0);clock.tick(.25);
    const p=clock.state().progress;clock.setSuspended(true);clock.tick(.5);clock.tick(.75);expect(clock.state()).toMatchObject({playing:true,progress:p});
    clock.pause();clock.setSuspended(false);clock.tick(1);clock.tick(1.25);expect(clock.state()).toMatchObject({playing:false,progress:p});
  });
  it('keeps advancing when stage reiterates an unchanged suspension state each frame',()=>{
    const clock=createTeachingSequence([{id:'one'}],{duration:2});clock.play();
    for(const t of [0,.1,.2,.3,.4,.5]){clock.setSuspended(false);clock.tick(t);}
    expect(clock.state().progress).toBeCloseTo(.25);
  });
  it('emphasizes the actual absorbing component and restores material appearance for inspection',()=>{
    const root=new Group(),component=new Group();component.name='Absorber';root.add(component);
    const material=new MeshStandardMaterial({emissive:'#142536',emissiveIntensity:.12}),mesh=new Mesh(new BoxGeometry(),material);component.add(mesh);
    const before=material.emissive.clone(),highlights=createPhaseHighlights(root,{absorb:'Absorber'}),clock=createTeachingSequence([{id:'absorb'}]);
    clock.step(0);highlights.update(clock.state());expect(material.emissive.equals(before)).toBe(false);
    clock.setInspection(true);highlights.update(clock.state());expect(material.emissive.equals(before)).toBe(true);expect(material.emissiveIntensity).toBe(.12);
  });
  it('never puts a digitization ring on a detector array',()=>{
    const signal=createSignalIndicator([0,0,0]);const clock=createTeachingSequence([{id:'digitize'}]);clock.step(0);signal.update(clock.state());expect(signal.root.visible).toBe(false);
  });
});
