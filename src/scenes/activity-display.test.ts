import { describe,expect,it } from 'vitest';
import { Group,Mesh,BoxGeometry,MeshStandardMaterial,DataTexture } from 'three';
import { createActivityDisplay } from './activity-display.js';

function fixture(){
  const asset=new Group(),owner=new Group();owner.name='Operations';asset.add(owner);
  const glass=new MeshStandardMaterial({name:'Blank illustrative monitor glass',color:'#123456',emissive:'#010203',emissiveIntensity:.1});
  const screen=new Mesh(new BoxGeometry(),glass);screen.name='Operations glass';owner.add(screen);
  const receiver=new Mesh(new BoxGeometry(),glass);asset.add(receiver);
  const before=screen.matrix.toArray(),display=createActivityDisplay(asset,{role:'Operations',materialName:glass.name});
  return {asset,screen,receiver,glass,before,display};
}
const state=(id:string,progress:number,inspection=false)=>({step:{id},progress,inspection});

describe('schematic ground display activity',()=>{
  it('ends processing with a stationary generic alert and clears it on a new receive phase',()=>{
    const {display,screen}=fixture();display.update(state('transfer',.6));
    const before=Array.from((screen.material.map as DataTexture).image.data as Uint8Array);
    display.update(state('transfer',.8));expect(display.state().alert).toBe(true);
    expect(Array.from((screen.material.map as DataTexture).image.data as Uint8Array)).not.toEqual(before);
    expect(display.update(state('transfer',.8))).toBe(false);
    display.update(state('receive',.1));expect(display.state().alert).toBe(false);
  });
  it('paints only existing operator glass, leaving shared receiver material and hardware unchanged',()=>{
    const {asset,screen,receiver,glass,before,display}=fixture(),nodes:number[]=[];asset.traverse(node=>nodes.push(node.id));
    display.update(state('receive',.4));
    expect(screen.material).not.toBe(glass);expect(receiver.material).toBe(glass);
    expect(screen.material.map).toBeInstanceOf(DataTexture);
    expect(screen.material.userData).toMatchObject({representativeDisplay:true,assumption:'look-model'});
    expect(screen.matrix.toArray()).toEqual(before);
    const after:number[]=[];asset.traverse(node=>after.push(node.id));expect(after).toEqual(nodes);
  });
  it('uses only lesson phase and progress, freezing the same snapshot without texture uploads',()=>{
    const {screen,display}=fixture();display.update(state('receive',.2));
    const texture=screen.material.map as DataTexture,before=Array.from(texture.image.data as Uint8Array),version=texture.version;
    expect(display.update(state('receive',.2))).toBe(false);expect(texture.version).toBe(version);
    display.update(state('receive',.8));expect(texture.version).toBeGreaterThan(version);
    expect(Array.from(texture.image.data as Uint8Array)).not.toEqual(before);
    expect(display.state()).toMatchObject({active:true,phase:'receive'});
  });
  it('fills the authored front UV island without moving or rebuilding hardware',()=>{
    const asset=new Group(),owner=new Group();owner.name='Operations';asset.add(owner);
    const geometry=new BoxGeometry(),uv=geometry.getAttribute('uv'),normal=geometry.getAttribute('normal');
    for(let vertex=0;vertex<uv.count;vertex++)if(normal.getZ(vertex)>.999)uv.setXY(vertex,.375+uv.getX(vertex)*.25,.125+uv.getY(vertex)*.25);
    const originalUvs=Array.from(uv.array),glass=new MeshStandardMaterial({name:'glass'}),screen=new Mesh(geometry,glass);owner.add(screen);
    const display=createActivityDisplay(asset,{role:'Operations',materialName:'glass'});display.update(state('readout',.5));
    const texture=screen.material.map as DataTexture;
    expect(texture.repeat.toArray()).toEqual([4,4]);expect(texture.offset.toArray()).toEqual([-1.5,-.5]);
    expect(screen.geometry).toBe(geometry);expect(Array.from(uv.array)).toEqual(originalUvs);
  });
  it('restores exact authored glass for inspection and non-data phases',()=>{
    const {screen,glass,display}=fixture();
    for(const phase of ['receive','readout','transfer']){
      display.update(state(phase,.7));expect(screen.material).not.toBe(glass);
      display.update(state(phase,.7,true));expect(screen.material).toBe(glass);
    }
    display.update(state('transfer',.7));display.update(state('reject',.7));expect(screen.material).toBe(glass);
    display.update(state('readout',.7));display.dispose();expect(screen.material).toBe(glass);
  });
  it('rejects missing authored surfaces instead of inventing a screen',()=>{
    expect(()=>createActivityDisplay(new Group(),{role:'Operations',materialName:'glass'})).toThrow(/Missing activity-display component/);
    const asset=new Group(),owner=new Group();owner.name='Operations';asset.add(owner);
    expect(()=>createActivityDisplay(asset,{role:'Operations',materialName:'glass'})).toThrow(/Missing activity-display glass/);
  });
});
