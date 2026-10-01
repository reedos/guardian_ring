import * as THREE from 'three';
import { copyModel, litScene, preloadModel, teachingLine } from './model-scene.js';

const URL = 'models/earth-orbits.glb?v=2';
export const preload = () => preloadModel(URL);
export function build({ quality, model }) {
  const scene = litScene(), asset = copyModel(URL); scene.add(asset);
  const spin = asset.getObjectByName('EarthSpin'), earth = asset.getObjectByName('earth');
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
