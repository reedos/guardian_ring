// Every GLB is meshopt-compressed (tools/compress-models.mjs); every loader decodes it with three's MeshoptDecoder.
// Compression stores normals, UVs and colors as normalized integers. Scene code reads and edits these geometries
// next to its own float geometry (activity-display.js reads UVs and normals), and mixing the two gives wrong normals,
// which a real GPU draws as a black scene. So each vertex attribute comes back as plain float32 once loaded: the
// download stays small and the scene code sees the same geometry it saw before compression.
import { BufferAttribute } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

function toFloat(attribute) {
  if (attribute.array instanceof Float32Array && !attribute.normalized && !attribute.isInterleavedBufferAttribute) return attribute;
  const { count, itemSize } = attribute, out = new Float32Array(count * itemSize), get = ['getX', 'getY', 'getZ', 'getW'];
  for (let i = 0; i < count; i++) for (let c = 0; c < itemSize; c++) out[i * itemSize + c] = attribute[get[c]](i);
  const result = new BufferAttribute(out, itemSize);
  result.name = attribute.name;
  return result;
}

export function floatAttributes(scene) {
  scene.traverse(object => {
    const geometry = object.geometry;
    if (!geometry) return;
    for (const name of Object.keys(geometry.attributes)) geometry.setAttribute(name, toFloat(geometry.attributes[name]));
  });
  return scene;
}

export const gltfLoader = () => {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const parse = loader.parse.bind(loader);
  loader.parse = (data, path, onLoad, onError) => parse(data, path, gltf => { gltf.scenes.forEach(floatAttributes); onLoad(gltf); }, onError);
  return loader;
};
