import * as THREE from 'three';

// Drawing units only: discard the first/last millionth of a finite segment so
// a connection may touch its own surface without treating that contact as a
// blocker. This is not a physical clearance or optical model. The caller owns
// current world matrices; geometry is static beneath the moving root.
const ENDPOINT_TOLERANCE = 1e-6;
export function createSurfacePathClear(root) {
  const meshes = [], ray = new THREE.Raycaster(), origin = new THREE.Vector3(), direction = new THREE.Vector3(), hits = [];
  root.traverse(object => {
    if (!object.isMesh) return;
    for (let parent = object; parent; parent = parent.parent) {
      if (parent.userData.teachingOverlay || parent.userData.explanatoryAnchor) return;
      if (parent === root) break;
    }
    meshes.push(object);
  });
  return (startWorld, endWorld) => {
    origin.fromArray(startWorld); direction.fromArray(endWorld).sub(origin);
    const length = direction.length();
    if (!Number.isFinite(length)) return false;
    if (length <= 2 * ENDPOINT_TOLERANCE) return true;
    direction.divideScalar(length); ray.set(origin, direction);
    ray.near = ENDPOINT_TOLERANCE; ray.far = length - ENDPOINT_TOLERANCE;
    hits.length = 0; ray.intersectObjects(meshes, false, hits);
    return hits.length === 0;
  };
}
