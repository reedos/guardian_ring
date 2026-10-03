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

export const PLUME_FRAME={pos:[2.4,4.7,13],target:[0,3,0],focus:[0,3,0],detailSize:[7.4,6.7,3.2],minDistance:6};
export const plumeOverviewPose=(width,height)=>fitComponent(PLUME_FRAME,width,height);

function overlay(node,name) {
  node.name=name;node.userData.teachingOverlay=true;node.userData.solidForCamera=false;
  return node;
}

export function createPlumeIllustration({scene,asset,paths,hotspots,dataHotspots,heatHotspots}) {
  const head=overlay(new THREE.Group(),'Illustrative rising emission — no trajectory scale');scene.add(head);
  // Animate the existing Blender-authored gas surfaces. Molecular diagrams stay
  // separate at their enlarged teaching scale, never masquerading as gas density.
  const gas=[];
  for(const name of ['SourceCore','GasEnvelope','TurbulentRibbons','DissipatingWisps']) {
    const node=asset.getObjectByName(name);
    if(!node)throw new Error(`Missing authored plume group: ${name}`);
    head.attach(node);gas.push({node,position:node.position.clone(),quaternion:node.quaternion.clone()});
  }
  head.rotation.z=Math.PI;head.scale.setScalar(.65);
  const materials=new Map();head.traverse(node=>{
    if(node.isMesh)for(const material of Array.isArray(node.material)?node.material:[node.material])
      materials.set(material,{opacity:material.opacity,emissive:material.emissiveIntensity});
  });

  const ground=overlay(new THREE.Mesh(new THREE.SphereGeometry(10,80,48),new THREE.MeshStandardMaterial({color:'#102433',roughness:1,metalness:0})),
    'Schematic curved ground — no geographic location');
  ground.position.set(0,-10,-4);scene.add(ground);
  const atmosphere=overlay(new THREE.Mesh(new THREE.SphereGeometry(10.8,80,48),new THREE.ShaderMaterial({
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
  const map=new THREE.DataTexture(pixels,32,32);map.needsUpdate=true;
  const glow=overlay(new THREE.Sprite(new THREE.SpriteMaterial({map,color:'#f6a1b8',transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending})),
    'False-color emission glow — not a temperature');
  glow.scale.set(2.7,2.7,1);scene.add(glow);
  const heatPaths=paths.records.filter(r=>r.mode==='heat');
  const sourcePins=[hotspots.source,dataHotspots.source,heatHotspots.source];
  const bandPins=[hotspots.bands,dataHotspots.bands,heatHotspots.bands];
  hotspots.timeline.pos.splice(0,3,2.675,4.275,.7825);
  let lastKey='';
  return {head,ground,atmosphere,update(state,mode){
    const pose=plumePose(state),key=[pose.height,pose.fade,pose.phase,mode].join(':');
    if(key===lastKey)return;lastKey=key;
    head.position.set(.15*Math.sin(pose.phase*.12),pose.height,0);
    for(const [i,part] of gas.entries()){
      part.node.position.copy(part.position);
      part.node.quaternion.copy(part.quaternion);
      // Subtle billowing of authored surfaces, not a fluid-dynamics result.
      if(i>0){part.node.position.x+=.08*Math.sin(pose.phase+i);part.node.rotateY(.035*Math.sin(pose.phase*.7+i));}
    }
    for(const [material,rest] of materials){
      material.opacity=rest.opacity*pose.fade;
      if(Number.isFinite(rest.emissive))material.emissiveIntensity=rest.emissive*(2.6+.18*Math.sin(pose.phase));
    }
    glow.position.copy(head.position);glow.position.y-=.22;glow.material.opacity=pose.fade*(mode==='data'?.22:.62);
    for(const pin of sourcePins){pin.pos[0]=head.position.x;pin.pos[1]=pose.height-.26;pin.pos[2]=0;}
    for(const pin of bandPins){pin.pos[0]=head.position.x+.08;pin.pos[1]=pose.height-1.1;pin.pos[2]=.12;}
    heatHotspots.timeline.pos.splice(0,3,head.position.x+1.75,pose.height+.25,.75);
    for(const path of heatPaths){path.group.position.set(head.position.x,pose.height-5.04,0);}
    head.updateMatrixWorld(true);
  }};
}
