// Runtime teaching overlays are separate from future Blender hardware.
export function disposeScene(scene) {
  const geometries = new Set(), materials = new Set();
  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => material.dispose());
}
