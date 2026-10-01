// A test object, not a hardware model. It intentionally has no physical scale.
import { THREE, COLORS } from '../kit.js';
export async function preload() {}
export function build({ quality, model }) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#000000');
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ color: '#172029', roughness: .65, metalness: .15 }));
  mesh.name = 'scaffold-test-object'; mesh.userData.placeholder = true; scene.add(mesh);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: COLORS.light }));
  edges.userData.placeholder = true; scene.add(edges);
  scene.add(new THREE.AmbientLight('#d4e0f4', 1.6));
  const key = new THREE.DirectionalLight('#e6ba82', 3); key.position.set(3, 5, 4); scene.add(key);
  const camera = { pos: [4, 3, 5], target: [0, 0, 0], near: .05, far: 100, min: 3, max: 20 };
  const hotspots = { placeholder: { pos: [0, .75, 0], view: { pos: [3.5, 2.5, 4.5], target: [0, 0, 0] } } };
  return { scene, flows: [], dataFlows: [], heatFlows: [], camera, hotspots, dataHotspots: hotspots, heatHotspots: hotspots,
    quality, model, solids: [mesh], look: { exposure: 1, bloom: 0, threshold: 1, ao: 0, env: 'night' },
    setMode(mode) { edges.material.color.set(COLORS[mode]); }, update(_time) {} };
}
