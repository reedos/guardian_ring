import * as THREE from 'three';
import { polylineSampler } from './teaching-sequence.js';

export const FLOW_TYPES = {
  light:{label:'Light',color:'#e6ba82',trail:true},
  charge:{label:'Detector signal',color:'#64d9ed',dash:.045},
  analog:{label:'Analog measurement',color:'#6ee4bb'},
  'image-data':{label:'Image data',color:'#a6f35a',dash:.16},
  command:{label:'Command / timing',color:'#86b9ff',dash:.19},
  feedback:{label:'Measured feedback',color:'#d5a5ef',dash:.05},
  electrical:{label:'Electrical power',color:'#ffd06b'},
  heat:{label:'Heat transfer',color:'#ff786b'},
  radiation:{label:'Thermal radiation',color:'#f6a1b8',trail:true},
  radio:{label:'Radio signal',color:'#bed5ff',trail:true},
  timeline:{label:'Event order',color:'#bac4ce',dash:.09},
};
export const DEFAULT_PHASES = {light:['collect'],charge:['integrate'],analog:['readout'],'image-data':['transfer'],command:['command'],feedback:['feedback'],electrical:['power'],heat:['lift','reject'],radiation:['radiate'],radio:['receive'],timeline:['timeline']};
const defaultKind={light:'light',data:'image-data',heat:'heat'};
function overlay(object) { object.userData.teachingOverlay=true;object.userData.solidForCamera=false;return object; }

// Geometry here consists only of explanatory strokes. Physical parts stay in GLB.
export function createTeachingFlows(config, resolve) {
  const records=[], root=new THREE.Group();root.name='Typed teaching paths';
  for(const [mode,inputs] of Object.entries(config))for(const raw of inputs){
    const input=Array.isArray(raw)?{points:raw}:raw;
    const kind=input.kind||defaultKind[mode], style=FLOW_TYPES[kind];
    if(!style)throw new Error(`Unknown teaching-flow kind: ${kind}`);
    const points=input.points.map(resolve), path=polylineSampler(points);
    const group=overlay(new THREE.Group());group.name=`${kind}: ${input.name||mode}`;group.userData.flowKind=kind;root.add(group);
    const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));
    const options={color:style.color,transparent:true,opacity:.3,depthWrite:false};
    const material=style.dash?new THREE.LineDashedMaterial({...options,dashSize:style.dash,gapSize:style.dash*.75}):new THREE.LineBasicMaterial(options);
    const line=overlay(new THREE.Line(geometry,material));line.computeLineDistances();group.add(line);
    // A compact luminous trail for radiation; chevrons distinguish circuit and
    // thermal directions. Neither glyph count nor width carries a quantity.
    const markGeometry=new THREE.BufferGeometry();markGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(36),3));
    const mark=overlay(new THREE.LineSegments(markGeometry,new THREE.LineBasicMaterial({...options,opacity:1})));group.add(mark);
    records.push({mode,kind,group,line,mark,path,phases:input.phases||DEFAULT_PHASES[kind],start:input.start||0,exclusive:input.exclusive||false,style});
  }
  const up=new THREE.Vector3(0,1,0), side=new THREE.Vector3(), tangent=new THREE.Vector3();
  return {root,records,
    legend(mode,steps) { const ids=new Set(steps.map(s=>s.id));return [...new Set(records.filter(r=>r.mode===mode||r.phases.some(p=>ids.has(p))).map(r=>r.kind))].map(kind=>({kind,...FLOW_TYPES[kind]})); },
    update(state,mode) {
      for(const r of records){
        const active=!state.inspection&&r.phases.includes(state.step.id)&&state.progress>=r.start;
        r.group.visible=active||r.mode===mode&&(!r.exclusive||state.inspection);
        r.line.material.opacity=active?.85:state.inspection?.34:.12;
        r.mark.visible=active||state.inspection&&r.mode===mode;
        if(!r.mark.visible)continue;
        const values=r.mark.geometry.attributes.position.array;let n=0;
        const write=p=>{values[n++]=p[0];values[n++]=p[1];values[n++]=p[2];};
        const progress=state.inspection?.58:Math.max(0,(state.progress-r.start)/(1-r.start));
        if(r.style.trail){
          // All trails advance linearly in arc length, even through route vertices.
          for(let k=0;k<6;k++){
            const end=Math.max(0,progress-k*.013),start=Math.max(0,end-.010);
            write(r.path.at(start).point);write(r.path.at(end).point);
          }
        }else{
          for(let k=0;k<3;k++){
            const u=state.inspection?(k+1)/4:Math.max(0,Math.min(1,progress-.10*k));
            const {point,tangent:dir}=r.path.at(u);tangent.set(...dir);side.crossVectors(tangent,up);
            if(side.lengthSq()<.001)side.crossVectors(tangent,new THREE.Vector3(1,0,0));side.normalize();
            const size=r.kind==='feedback'?.05:.075;
            const base=point.map((v,i)=>v-dir[i]*size);
            write(base.map((v,i)=>v+side.getComponent(i)*size*.58));write(point);
            write(base.map((v,i)=>v-side.getComponent(i)*size*.58));write(point);
          }
        }
        r.mark.geometry.attributes.position.needsUpdate=true;
        // Dynamic marker geometry otherwise retains its first frame's bounds.
        r.mark.frustumCulled=false;
      }
    },
  };
}

export function createSignalIndicator(point, radius=.36, phases=['absorb','integrate']) {
  const root=overlay(new THREE.Group());root.name='Qualitative detector integration indicator';root.position.set(...point);root.position.y+=.07;
  const count=48, position=new Float32Array(count*6), geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(position,3));
  const ring=overlay(new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:FLOW_TYPES.charge.color,transparent:true,opacity:.9,depthWrite:false})));root.add(ring);ring.frustumCulled=false;
  return {root,update(state){
    root.visible=!state.inspection&&phases.includes(state.step.id);
    if(!root.visible)return;
    const fill=state.step.id==='integrate'?state.progress:.12;
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2,b=(i+1)/count*Math.PI*2,show=(i+1)/count<=fill;
      for(const [j,v] of [a,b].entries()){const o=i*6+j*3;position[o]=Math.cos(v)*radius;position[o+1]=0;position[o+2]=Math.sin(v)*radius;if(!show&&j===1){position[o]=position[o-3];position[o+2]=position[o-1];}}
    }
    geometry.attributes.position.needsUpdate=true;
  }};
}

// Reversible material emphasis identifies the actual owning component, including
// an exploded layer whose interior marker may be hidden by the layer above it.
export function createPhaseHighlights(asset,roles={}) {
  const records=[];
  for(const [phase,role] of Object.entries(roles)){
    const node=asset.getObjectByName(role);if(!node)throw new Error(`Missing lesson highlight component: ${role}`);
    node.traverse(o=>{if(!o.isMesh||o.userData.printed)return;for(const material of Array.isArray(o.material)?o.material:[o.material])if(material.emissive)records.push({phase,material,color:material.emissive.clone(),intensity:material.emissiveIntensity});});
  }
  return {update(state){
    // Reset all originals first because one component can own several phases.
    for(const r of records){r.material.emissive.copy(r.color);r.material.emissiveIntensity=r.intensity;}
    if(state.inspection)return;
    for(const r of records)if(r.phase===state.step.id){r.material.emissive.set(FLOW_TYPES.charge.color);r.material.emissiveIntensity=state.step.id==='integrate'?.18+.55*state.progress:.6;}
  }};
}
