import { describe,expect,it } from 'vitest';
import { createTeachingFlows,createPhaseHighlights,createSignalIndicator,FLOW_TYPES } from './teaching-flows.js';
import { createTeachingSequence } from './teaching-sequence.js';
import { Color,Group,Mesh,BoxGeometry,MeshStandardMaterial } from 'three';
const state=(id:string,progress:number,inspection=false)=>({step:{id},progress,inspection});
const straight=(kind='image-data',extra={})=>createTeachingFlows({data:[{kind,points:[[0,0,0],[10,0,0]],...extra}]},(p:number[])=>p);
describe('physically distinct teaching paths',()=>{
  it('keeps functional optical connections dashed and static through playback, inspection, and mode changes',()=>{
    const flows=createTeachingFlows({light:[{kind:'optical-connection',points:[[0,0,0],[1,0,0],[1,2,0]],phases:['collect'],exclusive:true}]},(p:number[])=>p);
    const record=flows.records[0],backbone=record.line.geometry.getAttribute('position');
    const original=Array.from(backbone.array),marks=record.mark.geometry.getAttribute('position'),heads=record.heads.geometry.getAttribute('position');
    const markVersion=marks.version,headVersion=heads.version;
    expect(record.line.material.type).toBe('LineDashedMaterial');
    for(const inspection of [false,true])for(const mode of ['light','data','heat'])for(const phase of ['collect','readout','reject'])for(const progress of [0,.25,.72,1]){
      flows.update(state(phase,progress,inspection),mode);
      expect(record.heads.visible).toBe(false);expect(record.mark.visible).toBe(false);
      expect(record.heads.geometry.drawRange.count).toBe(0);expect(record.mark.geometry.drawRange.count).toBe(0);
      expect(Array.from(backbone.array)).toEqual(original);
    }
    expect(marks.version).toBe(markVersion);expect(heads.version).toBe(headVersion);
  });
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
  it('uses each process color only on its active component and clears it before the next operation',()=>{
    const root=new Group(),roles:Record<string,string|{role:string,kind:string}>={},materials:Record<string,MeshStandardMaterial>={};
    const kinds={command:'command',feedback:'feedback',digitize:'image-data',reject:'heat',receive:'radio'};
    for(const phase of Object.keys(kinds)){
      const component=new Group();component.name=`Component_${phase}`;root.add(component);roles[phase]=phase==='receive'?{role:component.name,kind:'radio'}:component.name;
      materials[phase]=new MeshStandardMaterial({emissive:'#142536',emissiveIntensity:.12});
      component.add(new Mesh(new BoxGeometry(),materials[phase]));
    }
    const highlights=createPhaseHighlights(root,roles),original=materials.command.emissive.clone();
    for(const [phase,kind] of Object.entries(kinds)){
      highlights.update(state(phase,.5));
      for(const [id,material] of Object.entries(materials)){
        if(id===phase)expect(material.emissive.equals(new Color(FLOW_TYPES[kind as keyof typeof FLOW_TYPES].color))).toBe(true);
        else {expect(material.emissive.equals(original)).toBe(true);expect(material.emissiveIntensity).toBe(.12);}
      }
    }
    highlights.update(state('receive',.5,true));
    for(const material of Object.values(materials)){expect(material.emissive.equals(original)).toBe(true);expect(material.emissiveIntensity).toBe(.12);}
  });
  it('never puts a digitization ring on a detector array',()=>{
    const signal=createSignalIndicator([0,0,0]);const clock=createTeachingSequence([{id:'digitize'}]);clock.step(0);signal.update(clock.state());expect(signal.root.visible).toBe(false);
  });
  it('moves a legible train along the full route and splits trails at every bend',()=>{
    const flows=createTeachingFlows({light:[{kind:'light',points:[[0,0,0],[1,0,0],[1,1,0]]}]},(p:number[])=>p),record=flows.records[0];
    flows.update(state('collect',.4),'light');
    expect(record.heads.visible).toBe(true);expect(record.heads.geometry.drawRange.count).toBeGreaterThan(2);
    const strokes=record.mark.geometry.getAttribute('position'),count=record.mark.geometry.drawRange.count;
    let touchesCorner=false;
    for(let vertex=0;vertex<count;vertex+=2){
      const x1=strokes.getX(vertex),y1=strokes.getY(vertex),x2=strokes.getX(vertex+1),y2=strokes.getY(vertex+1);
      expect((Math.abs(y1)<1e-6&&Math.abs(y2)<1e-6)||(Math.abs(x1-1)<1e-6&&Math.abs(x2-1)<1e-6)).toBe(true);
      if((Math.abs(x1-1)<1e-6&&Math.abs(y1)<1e-6)||(Math.abs(x2-1)<1e-6&&Math.abs(y2)<1e-6))touchesCorner=true;
    }
    expect(touchesCorner).toBe(true);
  });
  it('places activity heads by distance on unequal route segments and advances forward',()=>{
    const flows=createTeachingFlows({data:[{kind:'image-data',points:[[0,0,0],[1,0,0],[1,3,0]]}]},(p:number[])=>p),record=flows.records[0];
    flows.update(state('transfer',.2),'data');
    const head=record.heads.geometry.getAttribute('position'),before=[head.getX(0),head.getY(0),head.getZ(0)];
    const expected=record.path.at(.2*(1+.18*6)).point;
    expected.forEach((value:number,index:number)=>expect(before[index]).toBeCloseTo(value));
    flows.update(state('transfer',.3),'data');expect(head.getY(0)).toBeGreaterThan(before[1]);
    expect(record.heads.material.sizeAttenuation).toBe(false);
    expect(record.heads.userData).toMatchObject({teachingOverlay:true,solidForCamera:false});
  });
  it('keeps command and feedback activity moving toward their respective receiver',()=>{
    const flows=createTeachingFlows({data:[{kind:'command',points:[[0,0,0],[3,0,0]]},{kind:'feedback',points:[[3,0,0],[0,0,0]]}]},(p:number[])=>p);
    for(const [index,phase,direction] of [[0,'command',1],[1,'feedback',-1]] as const){
      flows.update(state(phase,.1),'data');const positions=flows.records[index].heads.geometry.getAttribute('position'),before=positions.getX(0);
      flows.update(state(phase,.2),'data');expect((positions.getX(0)-before)*direction).toBeGreaterThan(0);
    }
  });
  it('respects delayed source start and never propagates inactive references',()=>{
    const flows=straight('image-data',{start:.4,exclusive:true}),record=flows.records[0];
    flows.update(state('transfer',.2),'data');expect(record.group.visible).toBe(false);expect(record.heads.visible).toBe(false);
    flows.update(state('transfer',.4),'data');expect(record.group.visible).toBe(true);expect(record.heads.geometry.drawRange.count).toBe(1);
    expect(record.heads.geometry.getAttribute('position').getX(0)).toBe(0);
    flows.update(state('integrate',.7),'data');expect(record.group.visible).toBe(false);expect(record.heads.visible).toBe(false);
  });
  it('keeps paused and inspection snapshots stable without repeated buffer uploads',()=>{
    const flows=straight(),record=flows.records[0];flows.update(state('transfer',.4),'data');
    const marks=record.mark.geometry.getAttribute('position'),heads=record.heads.geometry.getAttribute('position'),version=marks.version,headVersion=heads.version;
    flows.update(state('transfer',.4),'data');expect(marks.version).toBe(version);expect(heads.version).toBe(headVersion);
    flows.update(state('transfer',.4,true),'data');expect(record.heads.visible).toBe(false);
    const inspection=Array.from(marks.array),inspectionVersion=marks.version;
    flows.update(state('transfer',.8,true),'data');expect(Array.from(marks.array)).toEqual(inspection);expect(marks.version).toBe(inspectionVersion);
  });
  it('reuses bounded geometry and finite marker buffers across a full phase',()=>{
    const flows=straight(),record=flows.records[0],marks=record.mark.geometry,heads=record.heads.geometry,material=record.heads.material;
    for(let frame=0;frame<=100;frame++){
      flows.update(state('transfer',frame/100),'data');
      for(const geometry of [marks,heads]){
        expect(geometry.drawRange.count).toBeLessThanOrEqual(geometry.getAttribute('position').count);
        expect(Array.from(geometry.getAttribute('position').array).every(Number.isFinite)).toBe(true);
      }
    }
    expect(record.mark.geometry).toBe(marks);expect(record.heads.geometry).toBe(heads);expect(record.heads.material).toBe(material);
    expect(()=>straight('image-data',{start:1})).toThrow(/start/);expect(()=>straight('image-data',{start:-.1})).toThrow(/start/);
  });
});
