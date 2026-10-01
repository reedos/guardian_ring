// Release scene-owned rendering resources while preserving cached GLB textures.
export function disposeScene(scene) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    if (object.material) for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
  });
  geometries.forEach(geometry => geometry.dispose());
  materials.forEach(material => {
    // Material.dispose() does not release texture storage. Runtime printed
    // labels are recreated per scene; imported asset maps belong to the cache.
    for (const value of Object.values(material)) if (value?.isTexture && value.userData?.sceneOwned) textures.add(value);
    material.dispose();
  });
  textures.forEach(texture => texture.dispose());
}
