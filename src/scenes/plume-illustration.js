import * as THREE from 'three';
import { fitComponent } from '../app/component-frame.js';

// Drawing coordinates and presentation time only. This is not a trajectory,
// gas-flow calculation, atmospheric profile, or sensor-response simulation.
export function plumePose(state) {
  const progress=state.inspection?.78:(state.index+state.progress)/state.total;
  const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
  return {
    height:2.7+3*progress,
    fade:state.inspection?1:smooth(progress/.1)*smooth((1-progress)/.12),
    phase:progress*Math.PI*12,
  };
}

export const PLUME_FRAME={pos:[1.3,3.5,11],target:[.3,2.7,0],focus:[.3,2.7,0],detailSize:[6.8,7.4,3.5],minDistance:5};
export const plumeOverviewPose=(width,height)=>fitComponent(PLUME_FRAME,width,height,
  width<=760?{safe:{x0:-.82,x1:.82,y0:Math.max(-.76,-1+168/height),y1:.76}}:{});

function overlay(node,name) {
  node.name=name;node.userData.teachingOverlay=true;node.userData.solidForCamera=false;
  return node;
}

export function createPlumeIllustration({scene,asset,paths,hotspots,dataHotspots,heatHotspots,earth}) {
  const head=overlay(new THREE.Group(),'Illustrative rising emission — no trajectory scale');scene.add(head);
  // Animate the existing Blender-authored gas surfaces. Molecular diagrams stay
  // separate at their enlarged teaching scale, never masquerading as gas density.
  const gas=[];
  for(const name of ['SourceCore','GasEnvelope','TurbulentRibbons','DissipatingWisps']) {
    const node=asset.getObjectByName(name);
    if(!node)throw new Error(`Missing authored plume group: ${name}`);
    head.attach(node);gas.push({node,position:node.position.clone(),quaternion:node.quaternion.clone()});
  }
  head.rotation.z=Math.PI;head.scale.set(.92,.65,.92);
  const materials=new Map();head.traverse(node=>{
    if(node.isMesh)for(const material of Array.isArray(node.material)?node.material:[node.material])
      materials.set(material,{opacity:Math.min(.8,material.opacity*2.2),emissive:material.emissiveIntensity});
  });

  // Reuse the Blender-authored Earth and credited historical NASA texture from
  // the ring. This is a scale-separated backdrop, never an event-site marker.
  const ground=overlay(earth,
    'Earth context — historical NASA imagery, no event location');
  ground.removeFromParent();ground.position.set(0,-4,-4);ground.scale.setScalar(5);
  ground.rotation.set(0,.8,0);
  // Daylight geography provides context; city-light emission is not appropriate
  // under this scene's illustrative daylight lighting.
  ground.material.emissiveIntensity=0;scene.add(ground);
  const atmosphere=overlay(new THREE.Mesh(new THREE.SphereGeometry(5.08,80,48),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.FrontSide,blending:THREE.AdditiveBlending,
    uniforms:{tint:{value:new THREE.Color('#659cbb')}},
    vertexShader:'varying vec3 normalView;varying vec3 eyeView;void main(){vec4 p=modelViewMatrix*vec4(position,1.0);normalView=normalize(normalMatrix*normal);eyeView=-p.xyz;gl_Position=projectionMatrix*p;}',
    fragmentShader:'uniform vec3 tint;varying vec3 normalView;varying vec3 eyeView;void main(){float rim=1.0-max(0.0,dot(normalize(normalView),normalize(eyeView)));float glow=pow(rim,3.0)*(1.0-smoothstep(.94,1.0,rim));gl_FragColor=vec4(tint,glow*.42);}',
  })),'Atmosphere context — exaggerated thickness, no absorption boundary');
  atmosphere.position.copy(ground.position);scene.add(atmosphere);

  const pixels=new Uint8Array(32*32*4);
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    const r=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5);
    pixels.set([255,255,255,Math.round(255*Math.exp(-r*r*5)*Math.max(0,1-r))],(y*32+x)*4);
  }
  const map=new THREE.DataTexture(pixels,32,32);map.minFilter=map.magFilter=THREE.LinearFilter;map.needsUpdate=true;
  const glow=overlay(new THREE.Sprite(new THREE.SpriteMaterial({map,color:'#e6ba82',transparent:true,opacity:.9,depthWrite:false,blending:THREE.AdditiveBlending})),
    'False-color emission glow — not a temperature');
  glow.scale.set(5.4,5.4,1);scene.add(glow);
  const inset=overlay(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[1.85,.05,.32],[3.15,.05,.32],[3.15,1.95,.32],[1.85,1.95,.32]].map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color:'#659cbb',transparent:true,opacity:.45,depthWrite:false})), 'Molecular diagrams — enlarged inset');scene.add(inset);
  const insetBack=overlay(new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.9),new THREE.MeshBasicMaterial({color:'#080e15',side:THREE.DoubleSide})), 'Molecular inset backing');
  insetBack.position.set(2.5,1,.08);scene.add(insetBack);
  const heatPaths=paths.records.filter(r=>r.mode==='heat');
  const sourcePins=[hotspots.source,dataHotspots.source,heatHotspots.source];
  const bandPins=[hotspots.bands,dataHotspots.bands,heatHotspots.bands];
  // Preserve the molecular structure beneath a finger-sized marker. The layout
  // moves only its badge and keeps a leader attached to the actual molecule.
  for(const pins of [hotspots,dataHotspots,heatHotspots]){
    pins.co2.markerRegion={center:[2.5,1.45,.3],size:[.91,.49,.43]};
    pins.h2o.markerRegion={center:[2.5,.48,.3],size:[.82,.56,.43]};
  }
  hotspots.timeline.pos.splice(0,3,2.675,4.275,.7825);
  let lastKey='';
  return {head,ground,atmosphere,update(state,mode){
    const pose=plumePose(state),key=[pose.height,pose.fade,pose.phase,mode].join(':');
    if(key===lastKey)return;lastKey=key;
    head.position.set(-.65+.15*Math.sin(pose.phase*.12),pose.height,0);
    for(const [i,part] of gas.entries()){
      part.node.position.copy(part.position);
      part.node.quaternion.copy(part.quaternion);
      // Subtle billowing of authored surfaces, not a fluid-dynamics result.
      if(i>0){part.node.position.x+=.08*Math.sin(pose.phase+i);part.node.rotateY(.035*Math.sin(pose.phase*.7+i));}
    }
    for(const [material,rest] of materials){
      material.opacity=rest.opacity*pose.fade;
      if(Number.isFinite(rest.emissive))material.emissiveIntensity=rest.emissive*(4.2+.45*Math.sin(pose.phase));
    }
    glow.position.copy(head.position);glow.position.y-=.6;glow.material.opacity=pose.fade*(mode==='data'?.4:.9);
    for(const pin of sourcePins){pin.pos[0]=head.position.x;pin.pos[1]=pose.height-.26;pin.pos[2]=0;}
    for(const pin of bandPins){pin.pos[0]=head.position.x+.08;pin.pos[1]=pose.height-1.1;pin.pos[2]=.12;}
    heatHotspots.timeline.pos.splice(0,3,head.position.x+1.75,pose.height+.25,.75);
    for(const path of heatPaths){path.group.position.set(head.position.x,pose.height-5.04,0);}
    head.updateMatrixWorld(true);
  }};
}
