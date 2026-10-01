import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CLEARANCE_BAND, createCameraClearance } from './camera-clearance.js';
import { clearPath, poseAt, samplePath } from './camera-path.js';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const limits = { minDistance: 1, maxDistance: 20, minPolarAngle: 0, maxPolarAngle: Math.PI };
const move = () => ({ p0: V(-4, 0, 3), t0: V(-4, 0, -3), p1: V(4, 0, 3), t1: V(4, 0, -3), limits });
// Analytic box queries make the fixture independent of voxel resolution.
const boxMap = (box: THREE.Box3) => ({
  segment(a: THREE.Vector3, b: THREE.Vector3, r0 = 0, r1 = r0) {
    const bounds = box.clone().expandByScalar(Math.max(r0, r1));
    if (bounds.containsPoint(a) || bounds.containsPoint(b)) return true;
    const delta = b.clone().sub(a), length = delta.length();
    if (!length) return false;
    const hit = new THREE.Ray(a, delta.divideScalar(length)).intersectBox(bounds, new THREE.Vector3());
    return !!hit && hit.distanceTo(a) <= length;
  },
});

describe('camera movement and sight clearance', () => {
  it('detours when the camera path clears hardware but its forward view does not', () => {
    const m = move(), map = boxMap(new THREE.Box3(V(-.75, -2, -.25), V(.75, 2, .25)));
    const check = createCameraClearance(m, map), authored = samplePath(m, 32);
    expect(authored.slice(1).some((b, i) => map.segment(authored[i].pos, b.pos, .08))).toBe(false);
    expect(authored.slice(1).some((b, i) => check(authored[i], b) > CLEARANCE_BAND)).toBe(true);
    const result = clearPath(m, check, { n: 32, maxTries: 320, through: 100, goodEnough: CLEARANCE_BAND });
    expect(result.good).toBe(true);
    expect(result.tries).toBeGreaterThan(0);
    expect(result.tries).toBeLessThanOrEqual(320);
    const planned = samplePath(m, 128);
    expect(planned.slice(1).every((b, i) => check(planned[i], b) <= CLEARANCE_BAND)).toBe(true);
    expect(planned[0].pos.distanceTo(m.p0)).toBeLessThan(1e-9);
    expect(planned.at(-1)!.pos.distanceTo(m.p1)).toBeLessThan(1e-9);
  });

  it('keeps the margin scaled to endpoint framing when the moving aim comes close', () => {
    const m = { ...move(), limits: { ...limits, minDistance: 0 } }, radii: number[] = [];
    const check = createCameraClearance(m, { segment(_a: THREE.Vector3, _b: THREE.Vector3, r: number) { radii.push(r); return false; } });
    check({ u: .5, pos: V(0, 0, 3), target: V(0, 0, 2.9) }, { u: .55, pos: V(.1, 0, 3), target: V(.1, 0, 2.9) });
    expect(radii[0]).toBeCloseTo(.075 * 6);
  });

  it('tapers into the authored framing without exempting a coarse map cell', () => {
    const m = move(), map = { cell: 10, segment: () => true }, check = createCameraClearance(m, map);
    const a = { u: 0, pos: m.p0, target: m.t0 };
    expect(check(a, { u: .01, pos: m.p0.clone().add(V(.1, 0, 0)), target: m.t0 })).toBe(0);
    expect(check(a, { u: .1, pos: m.p0.clone().add(V(.3, 0, 0)), target: m.t0 })).toBe(100);
  });

  it('does not accept a clipped flight pose even within an endpoint exemption', () => {
    const m = move(), check = createCameraClearance(m, null, { ...limits, minDistance: 5.95 });
    expect(check({ u: 0, pos: m.p0, target: m.t0 }, { u: .01, pos: m.p0.clone(), target: m.t0.clone().add(V(0, 0, .1)) })).toBe(100);
  });

  it('samples the same radius- and polar-limited route that OrbitControls can fly', () => {
    const m = { ...move(), limits: { ...limits, maxDistance: 6, minPolarAngle: 1, maxPolarAngle: 2.4 }, hop: { up: 30, back: 3, side: 0 } };
    const free = poseAt({ ...m, limits: undefined }, .5), mid = poseAt(m, .5);
    expect(free.pos.distanceTo(free.target)).toBeGreaterThan(6);
    expect(mid.pos.y - mid.target.y).toBeCloseTo(6 * Math.cos(1), 9);
    expect(mid.pos.z - mid.target.z).toBeCloseTo(6 * Math.sin(1), 9);
    for (const point of samplePath(m, 64)) {
      const offset = point.pos.clone().sub(point.target), sphere = new THREE.Spherical().setFromVector3(offset);
      expect(sphere.radius).toBeLessThanOrEqual(m.limits.maxDistance + 1e-9);
      expect(sphere.radius).toBeGreaterThanOrEqual(m.limits.minDistance - 1e-9);
      expect(sphere.phi).toBeGreaterThanOrEqual(m.limits.minPolarAngle - 1e-9);
      expect(sphere.phi).toBeLessThanOrEqual(m.limits.maxPolarAngle + 1e-9);
    }
  });
});
