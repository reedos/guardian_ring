import { describe, expect, it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; the app's TS environment is browser-only.
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { DAY_PLAYBACK_SECONDS, DRAWN_ORBITS, drawnOrbitPosition } from './orbit-motion.js';
import { compute } from '../model/engine.js';
import { SIDEREAL_DAY_SECONDS } from '../model/orbits.js';
import { earthClearSegment, nadirPoint, orbitalFollowPose, ORBIT_PROXY_BOUNDS } from './orbit-presentation.js';
import { createOrbitalStream } from './orbit-streams.js';

describe('orbital presentation preserves geometric meaning', () => {
  it('only draws straight radio paths that remain outside Earth', () => {
    expect(earthClearSegment([0, 0, 2.5], [0, 0, 1.014])).toBe(true);
    expect(earthClearSegment([0, 0, 2.5], [0, 0, -1.014])).toBe(false);
    expect(earthClearSegment([0, 0, 2.5], [2.5, 0, 0])).toBe(true);
    expect(earthClearSegment([-2.5, 0, 0], [2.5, 0, 0])).toBe(false);
  });

  it('places the geometric nadir point on the surface in the spacecraft direction', () => {
    const point = new THREE.Vector3(...nadirPoint([.5, 1.1, -.2]));
    expect(point.length()).toBeCloseTo(1.014, 10);
    expect(point.clone().normalize().dot(new THREE.Vector3(.5, 1.1, -.2).normalize())).toBeCloseTo(1, 10);
  });

  it('frames the actual magnified proxy against the Earth limb without entering Earth', () => {
    const buffer=readFileSync(new URL('../../public/models/earth-orbits.glb',import.meta.url));
    const gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
    const nodes={geo:gltf.nodes.find((node:{name:string})=>node.name==='GEO_Satellite_05'),leo:gltf.nodes.find((node:{name:string})=>node.name==='LEO_Satellite_01')};
    const mesh=gltf.meshes[gltf.nodes[nodes.geo.children[0]].mesh];
    const actual=new THREE.Box3();
    for(const primitive of mesh.primitives){const p=gltf.accessors[primitive.attributes.POSITION];actual.expandByPoint(new THREE.Vector3(...p.min));actual.expandByPoint(new THREE.Vector3(...p.max));}
    expect(new THREE.Box3(new THREE.Vector3(...ORBIT_PROXY_BOUNDS.min),new THREE.Vector3(...ORBIT_PROXY_BOUNDS.max)).containsBox(actual)).toBe(true);
    const leo = DRAWN_ORBITS.find(orbit => orbit.family === 'leo')!;
    const up=new THREE.Vector3(0,1,0);
    for (const family of ['geo', 'leo'] as const) for (const aspect of [.5, .88, 1.45, 2.8]) for (let time = 0; time < 100; time += 2.5) {
      const node=nodes[family],initial=new THREE.Vector3(...node.translation);
      const center = family === 'geo' ? initial.clone().applyAxisAngle(up,time*.065).toArray() : drawnOrbitPosition(leo, time);
      const velocity = family === 'geo' ? new THREE.Vector3().crossVectors(up,new THREE.Vector3(...center)).toArray() : drawnOrbitPosition(leo, time + .02).map((n: number, i: number) => n - center[i]);
      const orientation=(family==='geo'?new THREE.Quaternion().setFromAxisAngle(up,time*.065):new THREE.Quaternion().setFromUnitVectors(initial.normalize(),new THREE.Vector3(...center).normalize())).multiply(new THREE.Quaternion(...node.rotation));
      const scale=new THREE.Vector3(...(node.scale||[1,1,1])).multiplyScalar(family==='geo'?1.5:3.5);
      const fov = aspect < 1 ? 48 : 35;
      const pose = orbitalFollowPose(center, velocity, family, { aspect, fov, minDistance: .4, attitude:orientation.toArray(), proxyScale:scale.toArray() })!;
      const eye = new THREE.Vector3(...pose.pos), target = new THREE.Vector3(...pose.target);
      expect(eye.length()).toBeGreaterThan(1.16);
      expect(eye.distanceTo(target)).toBeGreaterThan(.4);
      expect(eye.distanceTo(target)).toBeLessThan(4.2);
      expect(earthClearSegment(eye.toArray(),target.toArray(),1.06)).toBe(true);
      const camera = new THREE.PerspectiveCamera(fov, aspect, .03, 120);
      camera.position.copy(eye); camera.lookAt(target); camera.updateMatrixWorld();
      const ys:number[]=[],xs:number[]=[];
      // Frame the real slender proxy; do not make a bounding sphere or the
      // whole Earth the subject and accidentally zoom back out to overview.
      for(const x of [actual.min.x,actual.max.x])for(const y of [actual.min.y,actual.max.y])for(const z of [actual.min.z,actual.max.z]){
        const p=new THREE.Vector3(x,y,z).multiply(scale).applyQuaternion(orientation).add(new THREE.Vector3(...center)).project(camera);
        expect(Math.abs(p.x)).toBeLessThanOrEqual(.801);expect(Math.abs(p.y)).toBeLessThanOrEqual(.431);
        expect(p.z).toBeGreaterThan(-1);expect(p.z).toBeLessThan(1);ys.push(p.y);xs.push(p.x);
      }
      const height=(Math.max(...ys)-Math.min(...ys))/2,width=(Math.max(...xs)-Math.min(...xs))/2;
      // A very tall phone can be width-limited by the long solar wings. Keep
      // the complete spacecraft legible instead of clipping its outer panels.
      expect(height>.30||width>.70,`${family}/${aspect}/${time}: ${height} high, ${width} wide`).toBe(true);
      // The limb must intersect the view, even though Earth is intentionally
      // allowed to extend beyond it. No operational footprint is calculated.
      const earthDirection=eye.clone().negate().normalize(),viewDirection=target.clone().sub(eye).normalize();
      const limbAngle=earthDirection.angleTo(viewDirection)-Math.asin(1.014/eye.length());
      const halfAngle=Math.min(THREE.MathUtils.degToRad(fov)/2,Math.atan(Math.tan(THREE.MathUtils.degToRad(fov)/2)*aspect));
      expect(limbAngle).toBeLessThan(halfAngle);
    }
  });

  it('keeps both authored solar wings broadside over twelve orbital phases on desktop and phone',()=>{
    const buffer=readFileSync(new URL('../../public/models/earth-orbits.glb',import.meta.url));
    const gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
    const leo=DRAWN_ORBITS.find(orbit=>orbit.family==='leo')!,worldUp=new THREE.Vector3(0,1,0);
    const nodes={geo:gltf.nodes.find((node:{name:string})=>node.name==='GEO_Satellite_05'),leo:gltf.nodes.find((node:{name:string})=>node.name==='LEO_Satellite_01')};
    for(const family of ['geo','leo'] as const){
      const node=nodes[family],initial=new THREE.Vector3(...node.translation);
      const period=family==='geo'?DAY_PLAYBACK_SECONDS:DAY_PLAYBACK_SECONDS*compute({orbit:'leo'}).outputs.orbitPeriodSeconds/SIDEREAL_DAY_SECONDS;
      for(let phase=0;phase<12;phase++){
        const time=period*phase/12;
        const center=family==='geo'?initial.clone().applyAxisAngle(worldUp,time*.065):new THREE.Vector3(...drawnOrbitPosition(leo,time));
        const velocity=family==='geo'?new THREE.Vector3().crossVectors(worldUp,center):new THREE.Vector3(...drawnOrbitPosition(leo,time+.02)).sub(center);
        const attitude=(family==='geo'?new THREE.Quaternion().setFromAxisAngle(worldUp,time*.065):new THREE.Quaternion().setFromUnitVectors(initial.clone().normalize(),center.clone().normalize())).multiply(new THREE.Quaternion(...node.rotation));
        const scale=new THREE.Vector3(...(node.scale||[1,1,1])).multiplyScalar(family==='geo'?1.5:3.5);
        const wingAxis=new THREE.Vector3(1,0,0).applyQuaternion(attitude),panelNormal=new THREE.Vector3(0,0,-1).applyQuaternion(attitude);
        for(const aspect of [.88,1.45]){
          const pose=orbitalFollowPose(center.toArray(),velocity.toArray(),family,{aspect,fov:aspect<1?48:35,attitude:attitude.toArray(),proxyScale:scale.toArray()})!;
          const towardEye=new THREE.Vector3(...pose.pos).sub(new THREE.Vector3(...pose.target)).normalize();
          // At least 80% of the full array span is across the image plane;
          // panel normals remain well clear of a grazing, edge-on view.
          expect(Math.sqrt(1-towardEye.dot(wingAxis)**2),`${family}/${phase}/${aspect} wing span`).toBeGreaterThan(.80);
          expect(towardEye.dot(panelNormal),`${family}/${phase}/${aspect} panel face`).toBeGreaterThan(.55);
          expect(earthClearSegment(pose.pos,pose.target,1.06)).toBe(true);
        }
      }
    }
  });

  it('updates existing stream buffers to the current endpoints without inventing bends', () => {
    const stream = createOrbitalStream('radio', '#bed5ff');
    const start = [1.2, .4, .5], end = [2.4, .2, .7];
    stream.update(start, end, .4);
    const line = stream.group.children[0] as THREE.Line;
    const attribute = line.geometry.getAttribute('position');
    expect(attribute.count).toBe(2);
    [...start, ...end].forEach((value, i) => expect(attribute.array[i]).toBeCloseTo(value, 6));
    const original = line.geometry;
    stream.update([0, 1, 0], [0, 2, 0], .7);
    expect(line.geometry).toBe(original);
    stream.update(start, end, .9, false);
    expect(stream.group.visible).toBe(false);
  });
});
