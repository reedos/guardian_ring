import * as THREE from 'three';
import { polylineSampler } from './teaching-sequence.js';

export const FLOW_TYPES = {
  light:{label:'Light',color:'#e6ba82',trail:true},
  'optical-connection':{label:'Optical connection · not a traced ray',color:'#e6ba82',dash:.11,static:true},
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
export const DEFAULT_PHASES = {light:['collect'],'optical-connection':['collect'],charge:['integrate'],analog:['readout'],'image-data':['transfer'],command:['command'],feedback:['feedback'],electrical:['power'],heat:['lift','reject'],radiation:['radiate'],radio:['receive'],timeline:['timeline']};
const defaultKind={light:'light',data:'image-data',heat:'heat'};
function overlay(object) { object.userData.teachingOverlay=true;object.userData.solidForCamera=false;return object; }

function headTexture(packet) {
  const size=16,pixels=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const dx=(x+.5)/size-.5,dy=(y+.5)/size-.5;
    const distance=packet?Math.max(Math.abs(dx)/.46,Math.abs(dy)/.32):Math.hypot(dx,dy)/.48;
    const alpha=Math.max(0,Math.min(1,(1-distance)*3));
    const offset=(y*size+x)*4;pixels.set([255,255,255,Math.round(alpha*255)],offset);
  }
  const texture=new THREE.DataTexture(pixels,size,size,THREE.RGBAFormat);
  texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;
  return texture;
}
const ROUND_HEAD=headTexture(false),PACKET_HEAD=headTexture(true);
const PACKET_KINDS=new Set(['image-data','command','feedback']);

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
    // Heads have a modest screen-space size so motion stays legible in an
    // overview. The drawn count, width and spacing never represent a rate.
    const count=kind==='timeline'?1:PACKET_KINDS.has(kind)?7:5;
    const breaks=[0];let distance=0;
    for(let i=1;i<points.length;i++){distance+=Math.hypot(...points[i].map((v,k)=>v-points[i-1][k]));breaks.push(distance/path.length);}
    // Every trail can cross each route segment, plus two arrow strokes. Allocate
    // once and change draw ranges; no geometry/material churn while playing.
    const markGeometry=new THREE.BufferGeometry();markGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(Math.max(count,3)*(points.length+2)*6),3));markGeometry.setDrawRange(0,0);
    const mark=overlay(new THREE.LineSegments(markGeometry,new THREE.LineBasicMaterial({...options,opacity:1})));group.add(mark);
    mark.frustumCulled=false;
    const headGeometry=new THREE.BufferGeometry();headGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));headGeometry.setDrawRange(0,0);
    const heads=overlay(new THREE.Points(headGeometry,new THREE.PointsMaterial({...options,map:PACKET_KINDS.has(kind)?PACKET_HEAD:ROUND_HEAD,size:PACKET_KINDS.has(kind)?8:7,sizeAttenuation:false,opacity:1,toneMapped:false})));
    heads.name=`Illustrative ${kind} activity heads`;heads.frustumCulled=false;group.add(heads);
    const start=input.start??0;if(!Number.isFinite(start)||start<0||start>=1)throw new RangeError('Teaching-flow start must be in [0, 1)');
    records.push({mode,kind,group,line,mark,heads,path,breaks,count,phases:input.phases||DEFAULT_PHASES[kind],start,exclusive:input.exclusive||false,style});
  }
  const up=new THREE.Vector3(0,1,0), alternate=new THREE.Vector3(1,0,0),side=new THREE.Vector3(),tangent=new THREE.Vector3();
  let previous=null;
  return {root,records,
    legend(mode,steps) { const ids=new Set(steps.map(s=>s.id));return [...new Set(records.filter(r=>r.mode===mode||r.phases.some(p=>ids.has(p))).map(r=>r.kind))].map(kind=>({kind,...FLOW_TYPES[kind]})); },
    update(state,mode) {
      // Paused, suspended and inspection states are pure snapshots. Repeating
      // them does not upload the same marker buffers again on every frame.
      const snapshotProgress=state.inspection?0:state.progress;
      if(previous&&previous.mode===mode&&previous.inspection===state.inspection&&previous.phase===state.step.id&&previous.progress===snapshotProgress)return;
      previous={mode,inspection:state.inspection,phase:state.step.id,progress:snapshotProgress};
      for(const r of records){
        const active=!state.inspection&&r.phases.includes(state.step.id)&&state.progress>=r.start;
        r.group.visible=active||r.mode===mode&&(!r.exclusive||state.inspection);
        // A functional optical connection has no propagation marks. Gentle
        // whole-route emphasis identifies its active selection without making
        // its arbitrary elbows look like physical reflections.
        r.line.material.opacity=active?(r.style.static?.5+.35*Math.sin(Math.PI*state.progress):.85):state.inspection?.34:.12;
        r.mark.visible=!r.style.static&&(active||state.inspection&&r.mode===mode);
        r.heads.visible=!r.style.static&&active;
        if(!r.mark.visible)continue;
        const values=r.mark.geometry.attributes.position.array,headValues=r.heads.geometry.attributes.position.array;let n=0,h=0;
        const write=p=>{values[n++]=p[0];values[n++]=p[1];values[n++]=p[2];};
        const span=(from,to)=>{
          // Split at the authored vertices. Connecting only the span endpoints
          // would cut corners and imply light/signal paths through other parts.
          for(let i=1;i<r.breaks.length;i++){
            const a=Math.max(from,r.breaks[i-1]),b=Math.min(to,r.breaks[i]);
            if(b>a){write(r.path.at(a).point);write(r.path.at(b).point);}
          }
        };
        const progress=Math.max(0,Math.min(1,(state.progress-r.start)/(1-r.start)));
        const count=state.inspection?3:r.count,spacing=.18;
        for(let k=0;k<count;k++){
          const u=state.inspection?(k+1)/4:progress*(1+spacing*(count-1))-spacing*k;
          // Signals enter at the source and leave at the receiver, never wrap
          // visibly from the receiving end back to the transmitting end.
          if(u<0||u>1)continue;
          const {point,tangent:dir}=r.path.at(u);
          if(!state.inspection){headValues[h++]=point[0];headValues[h++]=point[1];headValues[h++]=point[2];}
          span(Math.max(0,u-(r.style.trail?.09:.055)),u);
          if(!r.style.trail){
            tangent.set(...dir);side.crossVectors(tangent,up);
            if(side.lengthSq()<.001)side.crossVectors(tangent,alternate);side.normalize();
            const size=Math.min(.14,Math.max(.055,r.path.length*.025))*(r.kind==='feedback'?.8:1);
            const base=point.map((v,i)=>v-dir[i]*size);
            write(base.map((v,i)=>v+side.getComponent(i)*size*.58));write(point);
            write(base.map((v,i)=>v-side.getComponent(i)*size*.58));write(point);
          }
        }
        r.mark.geometry.setDrawRange(0,n/3);r.heads.geometry.setDrawRange(0,h/3);
        r.mark.geometry.attributes.position.needsUpdate=true;
        r.heads.geometry.attributes.position.needsUpdate=true;
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
  const phaseKind={command:'command',feedback:'feedback',readout:'analog',digitize:'image-data',transfer:'image-data',collect:'light',power:'electrical',sense:'feedback',lift:'heat',reject:'heat',radiate:'radiation'};
  for(const [phase,bindings] of Object.entries(roles))for(const raw of Array.isArray(bindings)?bindings:[bindings]){
    const binding=typeof raw==='string'?{role:raw,kind:phaseKind[phase]||'charge',intensity:.065}:raw;
    const node=asset.getObjectByName(binding.role);if(!node)throw new Error(`Missing lesson highlight component: ${binding.role}`);
    if(!FLOW_TYPES[binding.kind])throw new Error(`Unknown highlight kind: ${binding.kind}`);
    node.traverse(o=>{if(!o.isMesh||o.userData.printed)return;for(const material of Array.isArray(o.material)?o.material:[o.material])if(material.emissive)records.push({phase,material,color:material.emissive.clone(),intensity:material.emissiveIntensity,kind:binding.kind,emphasis:binding.intensity??.24});});
  }
  return {update(state){
    // Reset all originals first because one component can own several phases.
    for(const r of records){r.material.emissive.copy(r.color);r.material.emissiveIntensity=r.intensity;}
    if(state.inspection)return;
    for(const r of records)if(r.phase===state.step.id){r.material.emissive.set(FLOW_TYPES[r.kind].color);r.material.emissiveIntensity=r.emphasis*(.45+.55*Math.sin(Math.PI*state.progress));}
  }};
}
