import { afterEach, describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { fly } from '../../tools/gate-geometry.mjs';
import { ease } from './camera-path.js';

const uniform = Array.from({ length:33 }, (_, i) => i / 32);
const irregular = [0,.02,.66,.68,.70,.72,.74,.8,.85,.9,.95,.99,1];
const cadences = [uniform,irregular,[0,1],[0,.99,1]];

// Exercise the production browser gate's real mesh raycasts with deterministic
// rendered poses. Only scheduling and the viewer hook are supplied by the fixture.
function flight(schedule:number[], options:{wall?:boolean, omitProgress?:boolean, progress?:(u:number,frame:number)=>unknown}={}) {
  const camera = new THREE.PerspectiveCamera(35,1,.025,150);
  const target = new THREE.Vector3(), scene = new THREE.Scene();
  camera.position.set(0,0,40); camera.lookAt(target); camera.updateMatrixWorld();
  const intendedTarget = new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshBasicMaterial());
  intendedTarget.name='Intended endpoint subject'; scene.add(intendedTarget);
  if(options.wall){
    const wall=new THREE.Mesh(new THREE.BoxGeometry(4,4,.5),new THREE.MeshBasicMaterial());
    wall.name='Actual midflight wall'; wall.position.z=18; scene.add(wall);
  }
  scene.updateMatrixWorld(true);
  let frame=0,u=1;
  vi.stubGlobal('grx',{
    THREE, state:{scene:0,mode:'light'}, camera, controls:{target},
    built:[{scene,hotspots:{part:{view:{pos:[0,0,6],target:[0,0,0]}}}}],
    select:()=>{u=0;frame=0;}, settle:()=>{u=1;},
    isCameraMoving:()=>frame<schedule.length-1,
    flightProgress:options.omitProgress?undefined:()=>options.progress?options.progress(u,frame):u,
  });
  vi.stubGlobal('requestAnimationFrame',(callback:FrameRequestCallback)=>{
    queueMicrotask(()=>{
      frame=Math.min(frame+1,schedule.length-1);u=schedule[frame];
      camera.position.z=40+(6-40)*ease(u);camera.lookAt(target);camera.updateMatrixWorld();
      callback(frame*16.67);
    });
    return frame;
  });
  return fly({id:'part'});
}

afterEach(()=>vi.unstubAllGlobals());

describe('flight acceptance uses the progress of each rendered pose',()=>{
  it('keeps the intended subject clear under uniform and dropped-frame cadences',async()=>{
    for(const schedule of cadences){
      const result=await flight(schedule);
      expect(result.motionRequired).toBe(true);
      expect(result.hits).toBe(0);
      expect(result.progress).toMatchObject({source:'rendered-flight-progress',start:0,end:1});
    }
  });
  it('still detects a real midflight wall, including jumps between endpoint regions',async()=>{
    for(const schedule of cadences){
      const result=await flight(schedule,{wall:true});
      expect(result.hits).toBeGreaterThan(0);
      expect(result.first?.what).toBe('Actual midflight wall');
    }
  });
  it('rejects a missing progress hook',async()=>{
    await expect(flight(uniform,{omitProgress:true})).rejects.toThrow('Missing rendered flight-progress');
  });
  it.each([undefined,NaN,-.01,1.01])('rejects invalid progress %s',async invalid=>{
    await expect(flight(uniform,{progress:()=>invalid})).rejects.toThrow('Invalid rendered flight progress');
  });
  it('rejects progress moving backward instead of falling back to frame rank',async()=>{
    await expect(flight(uniform,{progress:(u,frame)=>frame===4?0:u})).rejects.toThrow('Nonmonotonic rendered flight progress');
  });
  it('rejects a stopped flight that never reaches its endpoint',async()=>{
    await expect(flight([0,.2,.4,.6])).rejects.toThrow('Flight stopped before completion');
  });
});
