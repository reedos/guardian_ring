import { describe, expect, it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; the app's TS environment is browser-only.
import { readFileSync } from 'node:fs';
// @ts-expect-error Node crypto is provided by Vitest; the app's TS environment is browser-only.
import { createHash } from 'node:crypto';
import * as THREE from 'three';
import { authoredOrbitalPorts, createOrbitFollowEmphasis } from './orbits.js';
import { ORBIT_PROXY_BOUNDS } from './orbit-presentation.js';

const bytes = readFileSync(new URL('../../public/models/earth-orbits.glb', import.meta.url));
const gltf = JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString());
const vehicles = gltf.nodes.filter((node: { name: string }) => /^(GEO|HEO|MEO|LEO)_Satellite_\d+$/.test(node.name));
const bounds = new THREE.Box3(new THREE.Vector3(...ORBIT_PROXY_BOUNDS.min), new THREE.Vector3(...ORBIT_PROXY_BOUNDS.max));

function authoredTree() {
  const nodes = gltf.nodes.map((raw: { name: string; translation?: number[]; rotation?: number[]; scale?: number[]; extras?: object }) => {
    const node = new THREE.Group(); node.name = raw.name; node.userData = { ...raw.extras };
    if (raw.translation) node.position.fromArray(raw.translation);
    if (raw.rotation) node.quaternion.fromArray(raw.rotation);
    if (raw.scale) node.scale.fromArray(raw.scale);
    return node;
  });
  gltf.nodes.forEach((raw: { children?: number[] }, index: number) => raw.children?.forEach(child => nodes[index].add(nodes[child])));
  const root = nodes.find((node: THREE.Group) => node.name === 'GuardianRingAsset')!;
  root.updateMatrixWorld(true); return root;
}

describe('authored orbital hardware retains the established camera contract', () => {
  it('preserves all twelve v3 spacecraft root transforms', () => {
    const transforms = vehicles.toSorted((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name))
      .map((node: { name: string; translation: number[]; rotation: number[]; scale?: number[] }) =>
        [node.name, ...node.translation, ...node.rotation, ...(node.scale || [1, 1, 1])]
          .map(value => typeof value === 'number' ? Number(value.toFixed(7)) : value));
    expect(vehicles).toHaveLength(12);
    // Captured from the v3 GLB before adding detail. Rounded only below the
    // exporter float precision; it pins translation, attitude, and magnification.
    expect(createHash('sha256').update(JSON.stringify(transforms)).digest('hex'))
      .toBe('6a2507a7033b7836c468aaedb62e2081d199e1e7d708b125605a8da6274998f9');
  });

  it('shares one bounded mesh with four material batches and a fixed geometry budget', () => {
    const meshIds = vehicles.map((node: { children: number[] }) => gltf.nodes[node.children.find(index => gltf.nodes[index].mesh !== undefined)!].mesh);
    expect(new Set(meshIds).size).toBe(1);
    const mesh = gltf.meshes[meshIds[0]], actual = new THREE.Box3();
    let triangles = 0;
    for (const primitive of mesh.primitives) {
      const positions = gltf.accessors[primitive.attributes.POSITION];
      actual.expandByPoint(new THREE.Vector3(...positions.min)); actual.expandByPoint(new THREE.Vector3(...positions.max));
      triangles += gltf.accessors[primitive.indices].count / 3;
    }
    expect(mesh.primitives).toHaveLength(4);
    expect(triangles).toBeLessThanOrEqual(3600);
    expect(bounds.containsBox(actual)).toBe(true);
    [-.2, -.0435, -.034].forEach((value, i) => expect(actual.min.getComponent(i)).toBeCloseTo(value, 7));
    [.2, .0705, .0445].forEach((value, i) => expect(actual.max.getComponent(i)).toBeCloseTo(value, 7));
  });

  it('provides distinct component ports on every orbiter, carried by its authored transform', () => {
    const root = authoredTree();
    const positions: Record<string, number[]> = {
      optical: [0, .057, .0343], radio: [-.018, -.018, .0441],
      solar: [.135, 0, -.0074], thermal: [.006, -.006, -.0341],
    };
    for (const raw of vehicles) {
      const vehicle = root.getObjectByName(raw.name)!;
      const ports = authoredOrbitalPorts(vehicle);
      for (const [id, anchor] of Object.entries(ports) as [string, THREE.Object3D][]) {
        expect(anchor.parent).toBe(vehicle);
        expect(anchor.userData).toMatchObject({ port: id, representative: true, solidForCamera: false });
        expect(bounds.containsPoint(anchor.position)).toBe(true);
        positions[id].forEach((value, i) => expect(anchor.position.getComponent(i)).toBeCloseTo(value, 5));
        expect(anchor.position.length()).toBeGreaterThan(.02);
        expect(new THREE.Vector3(...anchor.userData.localDirection).length()).toBeCloseTo(1);
      }
      const before = ports.optical.getWorldPosition(new THREE.Vector3());
      vehicle.rotateY(.2); vehicle.scale.multiplyScalar(1.5); root.updateMatrixWorld(true);
      const after = ports.optical.getWorldPosition(new THREE.Vector3());
      expect(after.distanceTo(before)).toBeGreaterThan(.001);
      expect(after.distanceTo(vehicle.localToWorld(ports.optical.position.clone()))).toBeLessThan(1e-10);
    }
    expect(() => authoredOrbitalPorts(new THREE.Group())).toThrow(/Missing authored optical port/);
  });
});

describe('orbital follow emphasis respects navigation state', () => {
  it('subdues contextual hardware and guides without changing family flags or transforms, then restores exact materials', () => {
    const asset = new THREE.Group(), geo = new THREE.Group(), leo = new THREE.Group();
    geo.userData.orbitFamily = 'geo'; leo.userData.orbitFamily = 'leo'; leo.visible = false; asset.add(geo, leo);
    const satellite = (name: string, family: THREE.Group) => {
      const node = new THREE.Group(); node.name = name; node.userData.orbitFamily = family.userData.orbitFamily;
      node.position.set(2, 1, 3); node.rotation.y = .3; node.scale.setScalar(.7); family.add(node);
      node.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: '#8295ad', emissive: '#092131', envMapIntensity: .7 })));
      return node;
    };
    const selected = satellite('selected', geo), sibling = satellite('sibling', geo), unrelated = satellite('unrelated', leo);
    const guide = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial({ color: '#ba9344', emissive: '#806121', envMapIntensity: .4 }));
    guide.userData.role = 'schematic-orbit-guide'; geo.add(guide);
    const materials = [selected, sibling, unrelated].map(node => (node.children[0] as THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>).material).concat(guide.material);
    const snapshots = materials.map(material => ({ color: material.color.clone(), emissive: material.emissive.clone(), env: material.envMapIntensity }));
    const transforms = [selected, sibling, unrelated].map(node => [node.position.toArray(), node.quaternion.toArray(), node.scale.toArray()]);
    const emphasis = createOrbitFollowEmphasis(asset, [selected, sibling, unrelated]);
    emphasis.setFocus(selected);
    expect(materials[0].color.equals(snapshots[0].color)).toBe(true);
    expect(materials[0].envMapIntensity).toBe(snapshots[0].env);
    for (const i of [1, 2, 3]) {
      expect(materials[i].color.r).toBeLessThan(snapshots[i].color.r);
      expect(materials[i].envMapIntensity).toBeLessThan(snapshots[i].env);
    }
    expect([geo.visible, leo.visible, selected.visible]).toEqual([true, false, true]);
    expect([selected, sibling, unrelated].map(node => [node.position.toArray(), node.quaternion.toArray(), node.scale.toArray()])).toEqual(transforms);
    emphasis.setFocus(unrelated); emphasis.setFocus(selected); emphasis.setFocus(null);
    materials.forEach((material, i) => {
      expect(material.color.equals(snapshots[i].color)).toBe(true);
      expect(material.emissive.equals(snapshots[i].emissive)).toBe(true);
      expect(material.envMapIntensity).toBe(snapshots[i].env);
    });
    expect([geo.visible, leo.visible]).toEqual([true, false]);
  });
});
