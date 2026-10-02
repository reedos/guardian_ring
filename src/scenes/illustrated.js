// Shared scene contract for Blender-authored teaching assemblies. All distances
// here are drawing coordinates; evidence and physical inputs live in the model.
import * as THREE from 'three';
import { copyModel, litScene, preloadModel } from './model-scene.js';
import { printDecals, textTexture, stick } from './print-kit.js';
import { labelController } from './label-visibility.js';
import { createTeachingSequence } from './teaching-sequence.js';
import { teachingProgram } from './teaching-programs.js';
import { createTeachingFlows, createSignalIndicator, createPhaseHighlights } from './teaching-flows.js';
import { createMirrorDemo } from './mirror-demo.js';

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
      const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
      const id=config.teaching||config.url.split('/').at(-1).split('.')[0];
      const paths=createTeachingFlows(config.paths||{},resolve);scene.add(paths.root);
      const indicator=config.signal?createSignalIndicator(resolve(config.signal),config.signalRadius||.36,config.absorptionSignal?['integrate']:['absorb','integrate']):null;if(indicator)scene.add(indicator.root);
      const absorption=config.absorptionSignal?createSignalIndicator(resolve(config.absorptionSignal),config.signalRadius||.36,['absorb']):null;if(absorption)scene.add(absorption.root);
      const highlights=createPhaseHighlights(asset,config.phaseHighlights);
      const pivots=(config.mechanisms||[]).map(m=>{
        const node=asset.getObjectByName(m.node);if(!node)throw new Error(`Missing authored mechanism pivot: ${m.node}`);
        return {...m,node,rest:node.quaternion.clone()};
      });
      const mirrors=pivots.filter(p=>p.normal).map(p=>createMirrorDemo(p.node,p.normal));for(const mirror of mirrors)scene.add(mirror.line);
      let mode='light',clock=createTeachingSequence(teachingProgram(id,mode),{reduced});
      const listeners=new Set();
      const changed=()=>{for(const fn of listeners)fn(teaching.state());};
      let unclock=clock.subscribe(changed);
      function pose(state){
        for(const mechanism of pivots){
          mechanism.node.quaternion.copy(mechanism.rest);
          if(state.inspection)continue;
          const phase=state.step.id,p=state.progress;
          let angle=0;
          if(mechanism.motion==='scan')angle=phase==='slew'?Math.sin(p*Math.PI*2)*mechanism.range:0;
          if(mechanism.motion==='reference'){
            const u=Math.min(1,p/.25),ease=u*u*(3-2*u);
            angle=phase==='blackbody'?mechanism.range*ease:phase==='space'?mechanism.range*(1-2*ease):0;
          }
          mechanism.node.rotateOnAxis(new THREE.Vector3(...mechanism.axis),angle);
        }
        if(pivots.length)asset.updateMatrixWorld(true);
        paths.update(state,mode);indicator?.update(state);absorption?.update(state);highlights.update(state);for(const mirror of mirrors)mirror.update(state);
      }
      const teaching={
        state:()=>({...clock.state(),mode,legend:paths.legend(mode,clock.state().steps),note:config.lessonNote||'Drawing motion and sequence timing are illustrative; no real instrument performance is simulated.'}),
        subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn);},
        play(){clock.play();pose(clock.state());},pause(){clock.pause();pose(clock.state());},
        step(delta){clock.step(delta);pose(clock.state());},reset(){clock.reset();pose(clock.state());},
        setInspection(value){clock.setInspection(value);pose(clock.state());},
        setSuspended(value){clock.setSuspended(value);},
      };
      const solids=[];asset.traverse(o=>{if(o.isMesh&&!o.userData.teachingOverlay&&!o.userData.printed&&o.userData.solidForCamera!==false)solids.push(o);});
      const printed=labelController(labels,solids);
      pose(clock.state());
      return { scene,asset,quality,model,camera,hotspots,dataHotspots,heatHotspots,solids,labels,teaching,
        updateLabels:printed.update,
        flows:paths.records.filter(r=>r.mode==='light').map(r=>r.group),dataFlows:paths.records.filter(r=>r.mode==='data').map(r=>r.group),heatFlows:paths.records.filter(r=>r.mode==='heat').map(r=>r.group),
        look:{exposure:1,bloom:0,threshold:1,ao:0,env:'studio'},
        setMode(next) {if(mode!==next){mode=next;unclock();clock=createTeachingSequence(teachingProgram(id,mode),{reduced});unclock=clock.subscribe(changed);}pose(clock.state());changed();},
        setModel(next){this.model=next;},
        update(time) {pose(clock.tick(time));},
      };
    },
  };
}
