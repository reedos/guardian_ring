// Detailed geometry is authored in Blender. This module supplies only loading,
// product lighting and nonphysical teaching overlays shared by the levels.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const assets = new Map();
export function preloadModel(url) {
  if (!assets.has(url)) {
    const record = { scene: null, promise: null };
    record.promise = new GLTFLoader().loadAsync(url).then(gltf => { record.scene = gltf.scene; });
    assets.set(url, record);
    record.promise.catch(() => assets.delete(url));
  }
  return assets.get(url).promise;
}
export function copyModel(url) {
  const source = assets.get(url)?.scene;
  if (!source) throw new Error(`Asset was not preloaded: ${url}`);
  const group = source.clone(true);
  group.traverse(object => {
    if (!object.isMesh) return;
    // Keep Blender's distinction between metal, polymer, foil, and coverglass.
    // The scene-look environment supplies reflections instead of making every
    // material less metallic to compensate for a missing environment.
    const copy = material => material.clone();
    object.material = Array.isArray(object.material) ? object.material.map(copy) : copy(object.material);
  });
  return group;
}
export function litScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#000000');
  scene.add(new THREE.HemisphereLight('#dcecff', '#15212b', 1.6));
  const key = new THREE.DirectionalLight('#fff1da', 3.4); key.position.set(5, 7, 5); scene.add(key);
  const fill = new THREE.DirectionalLight('#84bfff', 1.25); fill.position.set(-4, 3, -2); scene.add(fill);
  return scene;
}
export function teachingLine(points, color, opacity = .8) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p)));
  const material = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
  const line = new THREE.Line(geometry, material);
  line.userData.teachingOverlay = true;
  return line;
}
