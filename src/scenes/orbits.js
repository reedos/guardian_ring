import * as THREE from 'three';
import { copyModel, litScene, preloadModel, teachingLine } from './model-scene.js';

const URL = 'models/earth-orbits.glb?v=2';
// A fixed lighting direction for the illustration, unrelated to a date or ephemeris.
const ILLUSTRATIVE_SUN = new THREE.Vector3(-5, 2, 1).normalize();

function shadeHistoricalNightMap(material) {
  if (!material.isMeshStandardMaterial || !material.emissiveMap) return;
  material.onBeforeCompile = shader => {
    const common = '#include <common>', normal = '#include <normal_vertex>', emission = '#include <emissivemap_fragment>';
    // Fail explicitly if a future Three.js upgrade changes the shader contract.
    if (!shader.vertexShader.includes(common) || !shader.vertexShader.includes(normal)
      || !shader.fragmentShader.includes(common) || !shader.fragmentShader.includes(emission)) {
      throw new Error('The Earth night-map shader needs the standard normal and emissive chunks.');
    }
    shader.uniforms.grSunDirectionWorld = { value: ILLUSTRATIVE_SUN };
    shader.vertexShader = shader.vertexShader
      .replace(common, `${common}\nvarying vec3 vGrWorldNormal;`)
      .replace(normal, `${normal}\nvGrWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );`);
    shader.fragmentShader = shader.fragmentShader
      .replace(common, `${common}\nvarying vec3 vGrWorldNormal;\nuniform vec3 grSunDirectionWorld;`)
      .replace(emission, `${emission}
        // This softened day/night boundary is a drawing choice, not an atmospheric model.
        float grSunFacing = dot( normalize( vGrWorldNormal ), grSunDirectionWorld );
        float grNight = 1.0 - smoothstep( -0.08, 0.08, grSunFacing );
        totalEmissiveRadiance *= grNight;
      `);
  };
  material.customProgramCacheKey = () => 'guardian-ring-historical-night-mask-v1';
  material.needsUpdate = true;
}

export const preload = () => preloadModel(URL);
export function build({ quality, model }) {
  const scene = litScene(), asset = copyModel(URL); scene.add(asset);
  const spin = asset.getObjectByName('EarthSpin'), earth = asset.getObjectByName('earth');
  // Keep this darker fill local to the ring; hardware levels retain their product lighting.
  for (const light of scene.children.filter(object => object.isHemisphereLight)) light.intensity = .22;
  const [sun, fill] = scene.children.filter(object => object.isDirectionalLight);
  sun.position.copy(ILLUSTRATIVE_SUN).multiplyScalar(10);
  if (fill) fill.intensity = .06;
  for (const material of Array.isArray(earth.material) ? earth.material : [earth.material]) shadeHistoricalNightMap(material);
  const family = Object.fromEntries(['geo','heo','meo','leo'].map(id => [id, asset.getObjectByName(id.toUpperCase() + 'Family')]));
  family.heo.visible = false; family.meo.visible = false; family.leo.visible = false;
  const satellites = []; asset.traverse(o => { if (o.userData.role === 'representative-satellite') satellites.push(o); });
  const moving = { value: !matchMedia('(prefers-reduced-motion: reduce)').matches };
  const layerGroups = Object.fromEntries(['light','data','heat'].map(id => [id, new THREE.Group()]));
  Object.values(layerGroups).forEach(group => spin.add(group));
  // Every overlay below is an identified illustration, not a performance model.
  const point = [1.398, 0, 2.073], ground = [.25, .48, .88];
  layerGroups.light.add(teachingLine([ground,point], '#e6ba82', .5));
  layerGroups.data.add(teachingLine([point,[1.0,.75,1.55],ground], '#a6f35a'));
  layerGroups.data.add(teachingLine([point,[2.0,.5,.8],[2.403,0,-.689]], '#a6f35a', .4));
  layerGroups.heat.add(teachingLine([[2.9,1.5,2.7],point], '#ffc34a'));
  layerGroups.heat.add(teachingLine([point,[2.1,.6,2.7]], '#ff5a6e'));
  const camera = { pos: [7,5,9], target: [0,.2,0], near: .03, far: 120, min: 4.2, max: 25 };
  const make = (positions, rotating = true) => Object.fromEntries(Object.entries(positions).map(([id,pos]) => [id, { pos:[...pos], local:[...pos], rotating, view:{pos:[...camera.pos],target:[...pos]} }]));
  const hotspots = make({ geo:point, earth:ground, 'orbit-families':[-2,0,.4] });
  const dataHotspots = make({ processing:point, downlink:[1.0,.75,1.55], ground });
  const heatHotspots = make({ sunlight:[2.9,1.5,2.7], power:point, radiator:[2.1,.6,2.7] });
  const spots = [...Object.values(hotspots),...Object.values(dataHotspots),...Object.values(heatHotspots)];
  let last = null;
  function locate() {
    scene.updateMatrixWorld(true);
    for (const spot of spots) {
      const p = spin.localToWorld(new THREE.Vector3(...spot.local)); spot.pos = p.toArray();
      const radial = p.clone().normalize().multiplyScalar(8.5); radial.y = Math.max(3.4, radial.y);
      spot.view.pos = radial.toArray(); spot.view.target = p.toArray();
    }
  }
  locate();
  return { scene, quality, model, camera, hotspots, dataHotspots, heatHotspots,
    flows:layerGroups.light.children, dataFlows:layerGroups.data.children, heatFlows:layerGroups.heat.children,
    solids:[earth], satellites, look:{ exposure:1, bloom:0, threshold:1, ao:0, env:'night' },
    setMode(mode) { for (const [id,group] of Object.entries(layerGroups)) group.visible = id === mode; },
    setMotion(play) { moving.value = play; last = null; },
    motion() { return moving.value; },
    setFamily(id,visible) { if (family[id]) family[id].visible = visible; },
    families() { return Object.fromEntries(Object.entries(family).map(([id,group])=>[id,group.visible])); },
    update(time) { if (last !== null && moving.value) spin.rotation.y += Math.min(.1,Math.max(0,time-last))*.065; last=time; locate(); },
  };
}
