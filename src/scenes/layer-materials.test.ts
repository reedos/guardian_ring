import {describe,it,expect} from 'vitest';
import {Group,Mesh,BoxGeometry,MeshStandardMaterial} from 'three';
import {createLayerMaterials} from './layer-materials.js';
describe('qualitative layer materials',()=>{
 it('changes authored hardware, holds a paused pose, and restores its physical finish',()=>{
  const root=new Group(),cold=new Group(),warm=new Group();cold.name='Cold';warm.name='Warm';root.add(cold,warm);
  const mats=[0,1,2].map(()=>new MeshStandardMaterial({color:'#796451',emissive:'#020304',metalness:.8}));
  [cold,warm,root].forEach((owner,i)=>owner.add(new Mesh(new BoxGeometry(),mats[i])));
  const effect=createLayerMaterials(root,{data:['Warm'],heat:{Cold:'cold',Warm:'warm'}}),pose={inspection:false,progress:.4};
  effect.update('heat',pose);expect(mats[0].color.getHexString()).toBe('84d8ff');expect(mats[1].color.getHexString()).toBe('ff786b');expect(mats[2].opacity).toBe(.3);
  const held=mats[0].emissiveIntensity;effect.update('heat',pose);expect(mats[0].emissiveIntensity).toBe(held);
  effect.update('data',pose);expect(mats[1].color.getHexString()).toBe('a6f35a');expect(mats[0].opacity).toBe(.3);
  effect.update('light',pose);for(const material of mats){expect(material.color.getHexString()).toBe('796451');expect(material.opacity).toBe(1);expect(material.transparent).toBe(false);expect(material.metalness).toBe(.8);}
 });
 it('rejects missing authored roles',()=>{expect(()=>createLayerMaterials(new Group(),{data:['Missing']})).toThrow(/Missing layer-material role/);});
});
