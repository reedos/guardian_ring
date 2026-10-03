import { describe, expect, it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; app types are browser-only.
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { createSurfacePathClear } from './surface-path.js';
import { authoredOrbitalPorts } from './orbits.js';
import { DAY_PLAYBACK_SECONDS } from './orbit-motion.js';
import { earthClearSegment } from './orbit-presentation.js';

// Decode the actual opaque spacecraft primitives without loading Earth images
// or requiring a DOM/GPU. Preserve authored faces, material sides, and hierarchy.
function orbitalAsset() {
  const bytes = readFileSync(new URL('../../public/models/earth-orbits.glb', import.meta.url));
  const jsonLength = bytes.readUInt32LE(12), gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString()), binStart = 28 + jsonLength;
  const attribute = (index: number) => {
    const accessor = gltf.accessors[index], view = gltf.bufferViews[accessor.bufferView];
    const sizes: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
    const types: Record<number, typeof Uint16Array | typeof Uint32Array | typeof Float32Array> = { 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
    expect(view.byteStride).toBeUndefined();
    const raw = bytes.subarray(binStart + view.byteOffset + (accessor.byteOffset || 0));
    return new THREE.BufferAttribute(new types[accessor.componentType](raw.buffer, raw.byteOffset, accessor.count * sizes[accessor.type]), sizes[accessor.type]);
  };
  const nodes: THREE.Group[] = gltf.nodes.map((raw: any) => {
    const node = new THREE.Group(); node.name = raw.name; node.userData = { ...raw.extras };
    if (raw.translation) node.position.fromArray(raw.translation); if (raw.rotation) node.quaternion.fromArray(raw.rotation); if (raw.scale) node.scale.fromArray(raw.scale);
    if (raw.matrix) { node.matrix.fromArray(raw.matrix); node.matrix.decompose(node.position, node.quaternion, node.scale); }
    if (raw.mesh !== undefined && /Satellite_\d+_hardware/.test(raw.name)) for (const primitive of gltf.meshes[raw.mesh].primitives) {
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', attribute(primitive.attributes.POSITION)); geometry.setIndex(attribute(primitive.indices));
      const rawMaterial = gltf.materials[primitive.material], material = new THREE.MeshBasicMaterial({ side: rawMaterial.doubleSided ? THREE.DoubleSide : THREE.FrontSide });
      material.name = rawMaterial.name; node.add(new THREE.Mesh(geometry, material));
    }
    return node;
  });
  gltf.nodes.forEach((raw: any, index: number) => raw.children?.forEach((child: number) => nodes[index].add(nodes[child])));
  const root = nodes.find(node => node.name === 'GuardianRingAsset')!; root.updateMatrixWorld(true); return root;
}

describe('finite connections clear actual spacecraft surfaces', () => {
  it('rejects interior obstruction but permits endpoint contact, finite clear segments, and overlays', () => {
    const root = new THREE.Group(); root.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()));
    const overlay = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial()); overlay.position.x = 2; overlay.userData.teachingOverlay = true; root.add(overlay); root.updateMatrixWorld(true);
    const clear = createSurfacePathClear(root);
    expect(clear([-2, 0, 0], [2, 0, 0])).toBe(false);
    expect(clear([-2, 0, 0], [-.5, 0, 0])).toBe(true);
    expect(clear([.5, 0, 0], [3, 0, 0])).toBe(true);
    expect(clear([-2, 0, 0], [-1, 0, 0])).toBe(true);
    expect(clear([0, 2, 0], [0, 2, 0])).toBe(true);
    expect(clear([NaN, 0, 0], [0, 0, 0])).toBe(false);
  });

  it('matches every authored port normal to the actual face or recessed entrance', () => {
    const root = orbitalAsset();
    root.traverse(vehicle => {
      if (!/^(GEO|HEO|MEO|LEO)_Satellite_\d+$/.test(vehicle.name)) return;
      const scale = vehicle.getWorldScale(new THREE.Vector3()).x;
      for (const [id, port] of Object.entries(authoredOrbitalPorts(vehicle)) as [string, THREE.Object3D][]) {
        const point = port.getWorldPosition(new THREE.Vector3()), normal = new THREE.Vector3(...port.userData.localDirection).transformDirection(port.matrixWorld);
        const hit = new THREE.Raycaster(point.clone().addScaledVector(normal, .1 * scale), normal.clone().negate(), 0, .15 * scale).intersectObject(vehicle, true)[0];
        expect(hit, `${vehicle.name} ${id}`).toBeDefined();
        const faceNormal = hit.face!.normal.clone().applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld));
        expect(faceNormal.dot(normal)).toBeCloseTo(1, 6);
        // Optical anchor is the open mouth ahead of the recessed disk; other
        // roles have only a tiny deliberate drawing offset above their faces.
        expect(Math.abs(hit.point.distanceTo(point) / scale - (id === 'optical' ? .0073 : id === 'solar' ? .0004 : .0001))).toBeLessThan(2e-6);
      }
    });
  });

  it('suppresses the actual grazing-sun bus intersections through a day and both GEO magnifications', () => {
    const root = orbitalAsset(), vehicle = root.getObjectByName('GEO_Satellite_05')!, spin = root.getObjectByName('EarthSpin')!;
    const ports = authoredOrbitalPorts(vehicle), clear = createSurfacePathClear(vehicle), sun = new THREE.Vector3(-5, 2, 1).normalize();
    for (const magnification of [1, 1.5]) {
      vehicle.scale.setScalar(magnification); let blocked = 0, clearCount = 0;
      for (let sample = 0; sample <= 720; sample++) {
        spin.rotation.y = sample / 720 * DAY_PLAYBACK_SECONDS * .065; root.updateMatrixWorld(true);
        const point = ports.solar.getWorldPosition(new THREE.Vector3()), normal = new THREE.Vector3(...ports.solar.userData.localDirection).transformDirection(ports.solar.matrixWorld);
        if (normal.dot(sun) <= 0 || !earthClearSegment(point.toArray(), point.clone().addScaledVector(sun, 20).toArray())) continue;
        const start = point.clone().addScaledVector(sun, 1.6).toArray();
        if (clear(start, point.toArray())) clearCount++; else blocked++;
        const thermal = ports.thermal.getWorldPosition(new THREE.Vector3()), outward = new THREE.Vector3(...ports.thermal.userData.localDirection).transformDirection(ports.thermal.matrixWorld);
        expect(clear(thermal.toArray(), thermal.clone().addScaledVector(outward, 1.15).toArray())).toBe(true);
      }
      expect(blocked).toBeGreaterThan(0); expect(clearCount).toBeGreaterThan(blocked);
    }
  });
});
