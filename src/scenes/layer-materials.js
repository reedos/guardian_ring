import {Color} from 'three';

// Reversible teaching colors on authored hardware. Categories are qualitative
// engineering roles, not a temperature field or a real instrument measurement.
const thermal={cold:'#84d8ff',warm:'#ff786b',radiator:'#f6a1b8',power:'#ffd06b'};
/** @param {import('three').Object3D} asset @param {{data?:string[],heat?:Record<string,string>}} options */
export function createLayerMaterials(asset,{data=[],heat={}}={}){
 for(const role of new Set([...data,...Object.keys(heat)]))if(!asset.getObjectByName(role))throw new Error(`Missing layer-material role: ${role}`);
 const dataRoles=new Set(data),records=[];
 asset.traverse(mesh=>{
  if(!mesh.isMesh||mesh.userData.printed||mesh.userData.teachingOverlay)return;
  let dataRole=false,heatRole=null;
  for(let node=mesh;node&&node!==asset;node=node.parent){dataRole||=dataRoles.has(node.name);heatRole||=heat[node.name];}
  for(const material of Array.isArray(mesh.material)?mesh.material:[mesh.material]){
   if(!material.color||!material.emissive)continue;
   records.push({material,dataRole,heatRole,heatColor:heatRole?new Color(thermal[heatRole]):null,dataColor:new Color('#a6f35a'),color:material.color.clone(),emissive:material.emissive.clone(),intensity:material.emissiveIntensity,opacity:material.opacity,transparent:material.transparent,depthWrite:material.depthWrite,metalness:material.metalness});
  }
 });
 let current='light';
 return {records,update(mode,state){
  const pulse=state.inspection?.2:.22+.16*Math.sin(Math.PI*state.progress);
  for(const r of records){const m=r.material;
   if(mode==='light'){
    if(current!=='light'){m.color.copy(r.color);m.emissive.copy(r.emissive);m.emissiveIntensity=r.intensity;m.opacity=r.opacity;m.transparent=r.transparent;m.depthWrite=r.depthWrite;m.metalness=r.metalness;m.needsUpdate=true;}
    continue;
   }
   const active=mode==='heat'?!!r.heatRole:r.dataRole;
   const color=mode==='heat'?r.heatColor:r.dataColor;
   m.color.copy(active?color:r.color).multiplyScalar(active?1:.35);
   if(active)m.emissive.copy(color);else m.emissive.set('#000000');m.emissiveIntensity=active?pulse:0;
   m.opacity=active?r.opacity:Math.min(r.opacity,.3);m.transparent=!active||r.transparent;
   m.depthWrite=active&&r.depthWrite;m.metalness=active?.12:r.metalness;
   if(current!==mode)m.needsUpdate=true;
  }
  current=mode;
 }};
}
