// Camera and line geometry for the schematic orbit illustration. These drawing
// units are never converted into physical distance, speed, coverage, or latency.
import * as THREE from 'three';

export function earthClearSegment(start, end, radius = 1.005) {
  const a = new THREE.Vector3(...start), delta = new THREE.Vector3(...end).sub(a);
  const lengthSq = delta.lengthSq();
  if (!lengthSq) return a.length() >= radius;
  const t = THREE.MathUtils.clamp(-a.dot(delta) / lengthSq, 0, 1);
  return a.addScaledVector(delta, t).lengthSq() >= radius * radius;
}

export function nadirPoint(center, radius = 1.014) {
  return new THREE.Vector3(...center).normalize().multiplyScalar(radius).toArray();
}

// Padded local envelope shared by the Blender earth-orbits v3 and v4 proxies. It is a
// drawing envelope, not a spacecraft dimension. The runtime supplies the actual
// node attitude and scale, including the explicit follow-view magnification.
export const ORBIT_PROXY_BOUNDS = { min:[-.205,-.0485,-.039], max:[.205,.0755,.0495] };

// Ride alongside the spacecraft, with the Earth limb as context. Whole-Earth
// fitting is deliberately absent: the detailed subject owns the framing. The
// outward offset keeps the camera and its approach to the craft clear of Earth.
/**
 * @param {number[]} center
 * @param {number[]} velocity
 * @param {string} family
 * @param {{aspect?:number,fov?:number,minDistance?:number,attitude?:number[],proxyScale?:number[]}} [options]
 */
export function orbitalFollowPose(center, velocity, family, { aspect = 1.5, fov = 35, minDistance = .4, attitude, proxyScale } = {}) {
  if (!['geo', 'leo'].includes(family)) return null;
  const satellite = new THREE.Vector3(...center), radial = satellite.clone().normalize();
  const orientation=attitude?new THREE.Quaternion(...attitude):new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,-1),radial);
  const wingAxis=new THREE.Vector3(1,0,0).applyQuaternion(orientation),bodyUp=new THREE.Vector3(0,1,0).applyQuaternion(orientation);
  // Follow the authored spacecraft frame, not its orbital-plane tangent. The
  // latter can point along a solar wing and hide both arrays at some phases.
  // An outward three-quarter view retains the Earth limb while consistently
  // exposing panel faces, bus depth, and the instrument-side edge.
  const eyeDirection=family==='geo'
    ?radial.clone().multiplyScalar(.82).addScaledVector(bodyUp,.43).addScaledVector(wingAxis,.38).normalize()
    :radial.clone().multiplyScalar(.58).addScaledVector(bodyUp,.62).addScaledVector(wingAxis,.42).normalize();
  const scale=proxyScale?new THREE.Vector3(...proxyScale):new THREE.Vector3().setScalar(family==='geo'?1.5:1.155);
  const bounds=ORBIT_PROXY_BOUNDS,midpoint=new THREE.Vector3(...bounds.min).add(new THREE.Vector3(...bounds.max)).multiplyScalar(.5);
  const target=midpoint.clone().multiply(scale).applyQuaternion(orientation).add(satellite),forward=eyeDirection.clone().negate();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));
  if (right.lengthSq() < 1e-8) right.crossVectors(forward, new THREE.Vector3(0, 0, 1));
  right.normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  const v=Math.tan(THREE.MathUtils.degToRad(fov)/2),h=v*Math.max(.1,aspect);
  let distance=Math.max(.42,minDistance+.02);
  // Give the hero useful screen area while limiting horizontal
  // extent on a narrow phone. Project the slender proxy instead of fitting a
  // sphere around its long wings, which made the craft too small to inspect.
  for(const x of [bounds.min[0],bounds.max[0]])for(const y of [bounds.min[1],bounds.max[1]])for(const z of [bounds.min[2],bounds.max[2]]){
    const offset=new THREE.Vector3(x,y,z).sub(midpoint).multiply(scale).applyQuaternion(orientation),depth=offset.dot(forward);
    distance=Math.max(distance,Math.abs(offset.dot(right))/(h*.80)-depth,Math.abs(offset.dot(up))/(v*.43)-depth,offset.length()+.10);
  }
  const eye = target.clone().addScaledVector(eyeDirection, distance);
  return { pos: eye.toArray(), target: target.toArray(), center: [...center], family };
}
