import { describe,expect,it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; the app's TS environment is browser-only.
import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Matrix3,Mesh,Quaternion,Raycaster,Vector3 } from 'three';
import { MIRROR_DEMONSTRATIONS,OPTICAL_CONNECTIONS,TIRS_REFERENCE_DIRECTIONS } from './optical-routing.js';
import { createMirrorDemo } from './mirror-demo.js';
import { createTeachingFlows } from './teaching-flows.js';
import { teachingProgram } from './teaching-programs.js';
import { mechanismAngle } from './mechanism-pose.js';

const load=async(file:string)=>{
  const b=readFileSync(new URL(`../../public/models/${file}.glb`,import.meta.url));
  return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'' )).scene;
};

describe('optical connections and actual authored reflective surfaces',()=>{
  for(const scene of ['payload','abi'] as const){
    it(`${scene} puts local reflection on the actual exterior face throughout the motion`,async()=>{
      const asset=await load(scene);asset.updateMatrixWorld(true);
      for(const spec of MIRROR_DEMONSTRATIONS[scene]){
        const pivot=asset.getObjectByName(spec.node)!;expect(pivot,spec.node).toBeTruthy();
        const faces:Mesh[]=[];
        pivot.traverse(object=>{if(object instanceof Mesh&&/Reflective.*surface/.test(object.name))faces.push(object);});
        expect(faces.length,`${spec.node}: authored reflective mesh`).toBeGreaterThan(0);
        const rest=pivot.quaternion.clone(),demo=createMirrorDemo(pivot,spec.normal,{surfaceOffset:spec.surfaceOffset});
        for(const angle of [-spec.range,0,spec.range]){
          pivot.quaternion.copy(rest);pivot.rotateOnAxis(new Vector3().fromArray(spec.axis),angle);asset.updateMatrixWorld(true);
          demo.update({inspection:false,step:{id:'slew'}});
          const positions=demo.line.geometry.getAttribute('position');
          const interaction=new Vector3().fromBufferAttribute(positions,1);
          const normal=new Vector3().fromArray(spec.normal).normalize().applyQuaternion(pivot.getWorldQuaternion(new Quaternion()));
          // Raycast the loaded GLB face, not a stand-in mathematical plane.
          // An offset at the shaft or at the rear face fails this check.
          const ray=new Raycaster(interaction.clone().addScaledVector(normal,.2),normal.clone().negate());
          const hits=ray.intersectObjects(faces,false);expect(hits.length,`${spec.node} at ${angle}`).toBeGreaterThan(0);
          expect(hits[0].point.distanceTo(interaction)).toBeLessThan(2e-6);
          const actualNormal=hits[0].face!.normal.clone().applyMatrix3(new Matrix3().getNormalMatrix(hits[0].object.matrixWorld)).normalize();
          expect(actualNormal.dot(normal)).toBeCloseTo(1,5);
          const incoming=interaction.clone().sub(new Vector3().fromBufferAttribute(positions,0)).normalize();
          const outgoing=new Vector3().fromBufferAttribute(positions,3).sub(interaction).normalize();
          expect(incoming.reflect(actualNormal).distanceTo(outgoing)).toBeLessThan(2e-6);
        }
        pivot.quaternion.copy(rest);asset.updateMatrixWorld(true);
      }
    });

    it(`${scene} never animates photon heads along a functional connection`,async()=>{
      const asset=await load(scene);asset.updateMatrixWorld(true);
      const flows=createTeachingFlows({light:OPTICAL_CONNECTIONS[scene]},(anchor:string)=>{
        const object=asset.getObjectByName(anchor);expect(object,anchor).toBeTruthy();
        return object!.getWorldPosition(new Vector3()).toArray();
      });
      for(const phase of ['collect','reference'])for(const progress of [0,.25,.75,1]){
        flows.update({step:{id:phase},progress,inspection:false},'light');
        for(const record of flows.records){
          expect(record.kind).toBe('optical-connection');
          expect(record.heads.visible).toBe(false);
          expect(record.mark.visible).toBe(false);
        }
        if(scene==='abi')expect(flows.records.filter(record=>record.group.visible)).toHaveLength(1);
      }
      const collect=teachingProgram(scene,'light').find((step:{id:string;body:string})=>step.id==='collect');
      expect(collect?.body).toContain('not traced rays');
    });
  }

  it('connects TIRS-2 references through the authored component anchors, not invented ray elbows',async()=>{
    const asset=await load('tirs2');asset.updateMatrixWorld(true);
    const resolve=(point:string|number[])=>{
      if(Array.isArray(point))return point;
      const object=asset.getObjectByName(point);expect(object,point).toBeTruthy();
      return object!.getWorldPosition(new Vector3()).toArray();
    };
    const routes=OPTICAL_CONNECTIONS.tirs2;
    expect(routes[0].points[0]).toEqual(TIRS_REFERENCE_DIRECTIONS.earth);
    expect(routes[1].points[0]).toBe('AnchorBlackbody');
    expect(routes[2].points[0]).toEqual(TIRS_REFERENCE_DIRECTIONS.space);
    const sceneSelect=resolve('AnchorSceneSelect');
    expect(TIRS_REFERENCE_DIRECTIONS.earth[0]).toBeLessThan(sceneSelect[0]);
    expect(TIRS_REFERENCE_DIRECTIONS.space[1]).toBeGreaterThan(sceneSelect[1]);
    const flows=createTeachingFlows({light:routes},resolve);
    for(const [index,route] of routes.entries()){
      expect(route.points.slice(1)).toEqual(['AnchorSceneSelect','AnchorTelescope','AnchorFilters','AnchorArrays']);
      const positions=flows.records[index].line.geometry.getAttribute('position');
      expect(positions.count).toBe(route.points.length);
      for(const [vertex,point] of route.points.entries()){
        expect(new Vector3().fromBufferAttribute(positions,vertex).distanceTo(new Vector3(...resolve(point)))).toBeLessThan(1e-6);
      }
    }
  });

  it('shows only the settled TIRS-2 reference connection without traveling light marks',async()=>{
    const asset=await load('tirs2');asset.updateMatrixWorld(true);
    const flows=createTeachingFlows({light:OPTICAL_CONNECTIONS.tirs2},(point:string|number[])=>Array.isArray(point)?point:asset.getObjectByName(point)!.getWorldPosition(new Vector3()).toArray());
    const steps=teachingProgram('tirs2','light');
    const settledAngles:Record<string,number>={earth:0,blackbody:1,space:-1};
    for(const step of steps)for(const progress of [0,.15,.279,.28,.5,.75,1]){
      const state={step,steps,progress,inspection:false};
      flows.update(state,'light');
      const selected=flows.records.filter(record=>record.group.visible);
      const expected=step.id==='earth'||['blackbody','space'].includes(step.id)&&progress>=.28;
      expect(selected).toHaveLength(expected?1:0);
      for(const record of flows.records){
        expect(record.kind).toBe('optical-connection');
        expect(record.heads.visible).toBe(false);
        expect(record.mark.visible).toBe(false);
      }
      if(selected.length){
        expect(selected[0].phases).toEqual([step.id]);
        // A unit range checks settling independently of the illustrative angle.
        expect(mechanismAngle({motion:'reference',range:1},state)).toBe(settledAngles[step.id]);
      }
    }
    expect(flows.legend('light',steps).map(item=>item.kind)).toEqual(['optical-connection']);
  });

  it('keeps molecular Data lessons as event records instead of light propagation',()=>{
    for(const scene of ['plume','atmosphere']){
      const steps=teachingProgram(scene,'data');
      expect(steps.map((step:{id:string})=>step.id)).toEqual(['timeline']);
      expect(steps[0].body).toContain('isolated timeline');
    }
  });
});
