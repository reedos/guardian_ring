// Shared scene contract for Blender-authored teaching assemblies. All distances
// here are drawing coordinates; evidence and physical inputs live in the model.
import * as THREE from 'three';
import { copyModel, litScene, preloadModel, teachingLine } from './model-scene.js';
import { printDecals, textTexture, stick } from './print-kit.js';
import { labelController } from './label-visibility.js';

const COLORS = { light:'#e6ba82', data:'#a6f35a', heat:'#ff6b78' };
export function illustrated(config) {
  return {
    preload: () => preloadModel(config.url),
    build({quality,model}) {
      const scene = litScene(), asset = copyModel(config.url); scene.add(asset);
      scene.updateMatrixWorld(true);
      const resolve = point => {
        if (Array.isArray(point)) return [...point];
        const anchor = asset.getObjectByName(point);
        if (!anchor) throw new Error(`Missing teaching anchor: ${point}`);
        return anchor.getWorldPosition(new THREE.Vector3()).toArray();
      };
      const camera = {near:.025,far:150,min:2,max:28,...config.camera,...(quality.mobile?config.cameraPhone:{})};
      // Surface labels use IF's printed adapter, separate from selectable pins.
      // No catalog numbers or ratings: these name the teaching component roles.
      const labels=[];
      for (const label of config.labels || []) {
        const {text,anchor,p,size,face='top',mount,partIds=[],...placement}=label;
        const point=anchor?resolve(anchor):p;
        const normal={top:[0,1,0],front:[0,0,1],back:[0,0,-1],right:[1,0,0],left:[-1,0,0]}[face];
        const surface=mount?stick(asset,point.map((v,i)=>v+normal[i]*(mount.reach||.6)),normal.map(v=>-v),o=>o.name.startsWith(mount.prefix),{footprint:size}):null;
        if(mount&&!surface)throw new Error(`No mounting surface for ${text}`);
        const lines=Array.isArray(text)?text:[text];
        const mesh=printDecals(asset, {texture:textTexture(lines,{aspect:size[0]/size[1],ink:'#eaf1f6',plate:'#0b1015',px:96}),
          size,placements:[{p:point,face,...placement,...surface}],lift:.006,name:`Role label: ${lines.join(' ')}`});
        if(mesh){mesh.userData.partIds=partIds;mesh.userData.textLines=lines.length;mesh.visible=false;labels.push(mesh);}
      }
      const direction = new THREE.Vector3(...camera.pos).sub(new THREE.Vector3(...camera.target)).normalize();
      const make = (positions,views=config.views||{}) => Object.fromEntries(Object.entries(positions).map(([id,point]) => {
        const pos = resolve(point), authored = views[id]||config.views?.[id];
        const eye = new THREE.Vector3(...pos).addScaledVector(direction,config.distance||6);
        return [id,{pos,view:authored||{pos:eye.toArray(),target:[...pos]}}];
      }));
      const hotspots = make(config.points), dataHotspots = make(config.dataPoints||config.points,config.dataViews), heatHotspots = make(config.heatPoints||config.points,config.heatViews);
      const paths = [], groups = Object.fromEntries(Object.entries(COLORS).map(([mode,color]) => {
        const group = new THREE.Group(); group.name = `${mode}-teaching-overlay`; scene.add(group);
        for (const input of config.paths?.[mode]||[]) {
          const points = input.map(resolve), line = teachingLine(points,color,.75); group.add(line);
          const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...points[0])]);
          const particle = new THREE.Points(geometry,new THREE.PointsMaterial({color,size:.07,transparent:true,opacity:.9,depthWrite:false}));
          particle.userData.teachingOverlay = true; group.add(particle);
          paths.push({particle,curve:new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'catmullrom',0),offset:paths.length*.23});
        }
        return [mode,group];
      }));
      const solids=[];asset.traverse(o=>{if(o.isMesh&&!o.userData.teachingOverlay&&!o.userData.printed&&o.userData.solidForCamera!==false)solids.push(o);});
      const printed=labelController(labels,solids);
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      return { scene,asset,quality,model,camera,hotspots,dataHotspots,heatHotspots,solids,labels,
        updateLabels:printed.update,
        flows:groups.light.children,dataFlows:groups.data.children,heatFlows:groups.heat.children,
        look:{exposure:1,bloom:0,threshold:1,ao:0,env:'studio'},
        setMode(mode) { for(const [id,group] of Object.entries(groups)) group.visible=id===mode; },
        update(time) { if(reduced)return; for(const {particle,curve,offset} of paths){const p=curve.getPoint((time*.15+offset)%1);particle.geometry.attributes.position.setXYZ(0,p.x,p.y,p.z);particle.geometry.attributes.position.needsUpdate=true;} },
      };
    },
  };
}
