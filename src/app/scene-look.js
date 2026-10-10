// IF's scene look contract, with cached lighting only. Reflection panels exist
// in the environment capture, never in the teaching scene or camera geometry.
// No live capture, bloom, AO, or full-screen pass. Only the spacecraft opts into
// one bounded Sun shadow map; other scenes retain their original lighting path.
import * as THREE from 'three';

const PROFILES = {
  // One dominant Sun direction; a restrained ambient term keeps the cutaway
  // readable without flattening every face into a studio-lit gray box.
  satellite: { envIntensity: .22, hemisphere: .12, directional: [3.4, 0] },
  ground: { envIntensity: .58, hemisphere: .90, directional: [2.45, 1.05] },
  pixel: { envIntensity: .65, hemisphere: .75, directional: [2.25, 1.0] },
  'focal-plane': { envIntensity: .65, hemisphere: .75, directional: [2.35, 1.0] },
};
const HARDWARE = { envIntensity: .62, hemisphere: .78, directional: [2.45, 1.05] };

export function sceneLookProfile(built, { sceneId = '', tier = 0 } = {}) {
  const look = built.look || {}, night = sceneId === 'orbits' || look.env === 'night';
  const profile = night ? { envIntensity: .12 } : PROFILES[sceneId] || HARDWARE;
  return {
    env: look.env || (night ? 'night' : 'studio'),
    envIntensity: look.envIntensity ?? profile.envIntensity,
    exposure: look.exposure ?? 1,
    // Lower tiers use a smaller static map; every tier retains material cues.
    environmentSize: tier >= 4 ? 128 : 256,
    hemisphere: profile.hemisphere,
    directional: profile.directional,
  };
}

function reflectionScene(kind) {
  if (!['studio', 'night'].includes(kind)) throw new RangeError(`Unknown reflection environment: ${kind}`);
  const scene = new THREE.Scene();
  const box = (w, h, d, color, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
    mesh.position.set(x, y, z); scene.add(mesh);
  };
  const panel = (w, h, color, gain, x, y, z, rx, ry) => {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(gain), side: THREE.DoubleSide }));
    mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, 0); scene.add(mesh);
  };
  if (kind === 'studio') {
    // IF's softbox and restrained colored rims describe metal and coverglass.
    box(20, 12, 20, '#0b0d11', 0, 3, 0);
    panel(8, 5, '#ffffff', 4.5, 0, 7, 4, -Math.PI / 2 + .5, 0);
    panel(1.2, 7, '#bcd4ff', 3.2, -8, 3, -2, 0, Math.PI / 2);
    panel(1.2, 7, '#ffd9b0', 2.6, 8, 3, -2, 0, -Math.PI / 2);
    panel(20, 20, '#1a1d22', 1, 0, -2.9, 0, -Math.PI / 2, 0);
  } else {
    box(40, 20, 40, '#0a1020', 0, 5, 0);
    panel(40, 6, '#243048', 1.4, 0, 1, -19.5, 0, 0);
  }
  return scene;
}

function disposeCapture(scene) {
  scene.traverse(object => {
    if (!object.isMesh) return;
    object.geometry.dispose();
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) material.dispose();
  });
}

/**
 * Stage integration:
 *   const finish = createSceneLook(renderer);
 *   finish.apply(built, { sceneId: 'satellite', tier: 0 }); // build/tier change
 *   finish.activate(built); // active scene change, before rendering
 *   finish.dispose(); // renderer teardown
 *
 * apply() changes only lighting and environment, leaving materials, background,
 * hardware, and overlays intact. activate() restores this scene's exposure;
 * it does not allocate or render. Captures are shared across all built scenes.
 * environmentFactory is a CPU-test seam returning { texture, dispose() }.
 * @param {any} renderer
 * @param {{environmentFactory?: ((kind: string, size: number) => {texture: THREE.Texture, dispose: () => void}) | null}} [options]
 */
export function createSceneLook(renderer, { environmentFactory = null } = {}) {
  const cache = new Map(), originals = new Map();
  let pmrem = null, disposed = false;
  const initialExposure = renderer.toneMappingExposure;
  const initialShadows=renderer.shadowMap?{enabled:renderer.shadowMap.enabled,type:renderer.shadowMap.type}:null;
  function environment(kind, size) {
    const key = `${kind}:${size}`;
    if (!cache.has(key)) {
      let target;
      if (environmentFactory) target = environmentFactory(kind, size);
      else {
        const source = reflectionScene(kind);
        try {
          pmrem ||= new THREE.PMREMGenerator(renderer);
          target = pmrem.fromScene(source, .04, .1, 100, { size });
        } finally { disposeCapture(source); }
      }
      cache.set(key, target);
    }
    return cache.get(key).texture;
  }
  return {
    apply(built, options = {}) {
      if (disposed) throw new Error('Scene look has been disposed');
      const scene = built.scene, profile = sceneLookProfile(built, options);
      if (!originals.has(scene)) originals.set(scene, {
        environment: scene.environment, intensity: scene.environmentIntensity,
        lights: scene.children.filter(object => object.isLight).map(light => ({ light, intensity: light.intensity })),
      });
      scene.environment = environment(profile.env, profile.environmentSize);
      scene.environmentIntensity = profile.envIntensity;
      if (profile.hemisphere !== undefined) {
        const hemisphere = scene.children.find(object => object.isHemisphereLight);
        if (hemisphere) hemisphere.intensity = profile.hemisphere;
      }
      const directional = scene.children.filter(object => object.isDirectionalLight);
      profile.directional?.forEach((intensity, index) => { if (directional[index]) directional[index].intensity = intensity; });
      scene.userData.sceneLook = { version: 1, ...profile, bloom: false, ao: false, liveCapture: false };
      return scene.userData.sceneLook;
    },
    activate(built) {
      if (disposed) throw new Error('Scene look has been disposed');
      renderer.toneMappingExposure = built.scene.userData.sceneLook?.exposure ?? built.look?.exposure ?? 1;
      if(renderer.shadowMap){renderer.shadowMap.enabled=!!built.look?.shadows;renderer.shadowMap.type=THREE.PCFShadowMap;}
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const [scene, original] of originals) {
        scene.environment = original.environment; scene.environmentIntensity = original.intensity;
        for (const { light, intensity } of original.lights) light.intensity = intensity;
        delete scene.userData.sceneLook;
      }
      for (const target of cache.values()) target.dispose();
      cache.clear(); originals.clear(); pmrem?.dispose();
      renderer.toneMappingExposure = initialExposure;
      if(initialShadows)Object.assign(renderer.shadowMap,initialShadows);
    },
  };
}
