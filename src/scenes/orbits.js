import * as THREE from 'three';
import { copyModel, litScene, preloadModel } from './model-scene.js';
import { DRAWN_ORBITS, drawnOrbitPosition } from './orbit-motion.js';
import { earthClearSegment, nadirPoint, orbitalFollowPose } from './orbit-presentation.js';
import { createNadirReference, createOrbitalStream } from './orbit-streams.js';
import { createSurfacePathClear } from './surface-path.js';
import { orbitalOverviewPose, createOrbitBackdrop, createGeoViewingPatches } from './orbit-overview.js';

const URL = 'models/earth-orbits.glb?v=4';
// A fixed lighting direction for the illustration, unrelated to a date or ephemeris.
const ILLUSTRATIVE_SUN = new THREE.Vector3(-5, 2, 1).normalize();

// Follow emphasis changes only materials. Orbit-family choices, spacecraft
// transforms, and the selected vehicle's visibility remain under their owners.
export function createOrbitFollowEmphasis(asset, satellites) {
  const records = [];
  const remember = (object, owner, guide = false) => {
    if (!object.isMesh) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) records.push({
      material, owner, guide,
      family: owner.userData.orbitFamily || owner.parent?.userData.orbitFamily,
      color: material.color?.clone(), emissive: material.emissive?.clone(), envMapIntensity: material.envMapIntensity,
    });
  };
  asset.traverse(object => { if (object.userData.role === 'schematic-orbit-guide') remember(object, object, true); });
  for (const satellite of satellites) satellite.traverse(object => remember(object, satellite));
  return {
    setFocus(selected) {
      if (selected && !satellites.includes(selected)) throw new Error('Follow emphasis requires an authored spacecraft');
      for (const record of records) {
        const factor = !selected || record.owner === selected ? 1 : record.guide ? record.family === selected.userData.orbitFamily ? .42 : .13 : .18;
        if (record.color) record.material.color.copy(record.color).multiplyScalar(factor);
        if (record.emissive) record.material.emissive.copy(record.emissive).multiplyScalar(factor);
        if (record.envMapIntensity !== undefined) record.material.envMapIntensity = record.envMapIntensity * factor;
      }
    },
  };
}

export function authoredOrbitalPorts(node) {
  return Object.fromEntries(['optical', 'radio', 'solar', 'thermal'].map(id => {
    const anchor = node.children.find(child => child.userData.port === id);
    if (!anchor) throw new Error(`Missing authored ${id} port on ${node.name}`);
    return [id, anchor];
  }));
}

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

function shadeAtmosphericLimb(atmosphere) {
  if (!atmosphere?.isMesh) return;
  // Reuse the authored exaggerated shell; this glow is an explanatory visual,
  // not a scattering or atmospheric-thickness calculation.
  atmosphere.material = new THREE.ShaderMaterial({
    uniforms: { sunDirection: { value: ILLUSTRATIVE_SUN } }, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 worldPoint; void main(){vec4 p=modelMatrix*vec4(position,1.0);worldPoint=p.xyz;gl_Position=projectionMatrix*viewMatrix*p;}',
    fragmentShader: 'uniform vec3 sunDirection; varying vec3 worldPoint; void main(){vec3 radial=normalize(worldPoint);float edge=pow(1.0-abs(dot(radial,normalize(cameraPosition-worldPoint))),2.5);float day=smoothstep(-0.2,0.4,dot(radial,sunDirection));vec3 color=mix(vec3(0.035,0.12,0.32),vec3(0.12,0.46,0.95),day);gl_FragColor=vec4(color,edge*(0.25+0.65*day));}',
  });
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
  shadeAtmosphericLimb(asset.getObjectByName('Atmosphere'));
  scene.add(createOrbitBackdrop());
  const family = Object.fromEntries(['geo','heo','meo','leo'].map(id => [id, asset.getObjectByName(id.toUpperCase() + 'Family')]));
  family.heo.visible = true; family.meo.visible = false; family.leo.visible = false;
  const satellites = []; asset.traverse(o => { if (o.userData.role === 'representative-satellite') satellites.push(o); });
  const patches=createGeoViewingPatches(satellites.filter(node=>node.parent===family.geo));spin.add(patches);
  const attachments = new Map(satellites.map(node => [node, authoredOrbitalPorts(node)]));
  const surfaceClear = new Map(satellites.map(node => [node, createSurfacePathClear(node)]));
  const followEmphasis = createOrbitFollowEmphasis(asset, satellites);
  const moving = { value: !matchMedia('(prefers-reduced-motion: reduce)').matches };
  let elapsed=0,suspended=false,mode='light',focusFamily=null;
  const orbiters=DRAWN_ORBITS.map(spec=>{
    const node=asset.getObjectByName(`${spec.family.toUpperCase()}_Satellite_${String(spec.index).padStart(2,'0')}`);
    if(!node)throw new Error(`Missing drawn orbiter: ${spec.family} ${spec.index}`);
    return {spec,node,radial:node.position.clone().normalize(),attitude:node.quaternion.clone()};
  });
  const featured = { geo: asset.getObjectByName('GEO_Satellite_05'), leo: asset.getObjectByName('LEO_Satellite_01') };
  const relay = asset.getObjectByName('GEO_Satellite_01');
  if (!featured.geo || !featured.leo || !relay) throw new Error('Missing authored spacecraft for orbital teaching paths.');
  const baseScales = Object.fromEntries(Object.entries(featured).map(([id,node]) => [id,node.scale.clone()]));
  const layerGroups = Object.fromEntries(['light','data','heat'].map(id => [id, new THREE.Group()]));
  Object.values(layerGroups).forEach(group => scene.add(group));
  const streams = {
    light: createOrbitalStream('light', '#e6ba82'),
    downlink: createOrbitalStream('radio', '#bed5ff', {width:.075}),
    crosslink: createOrbitalStream('radio', '#a6f35a', {count:6,width:.065}),
    sunlight: createOrbitalStream('light', '#ffd06b', {count:6}),
    radiation: createOrbitalStream('radiation', '#f6a1b8', {count:6}),
  };
  layerGroups.light.add(streams.light.group);
  layerGroups.data.add(streams.downlink.group, streams.crosslink.group);
  layerGroups.heat.add(streams.sunlight.group, streams.radiation.group);
  const nadir = createNadirReference(); scene.add(nadir.group); nadir.group.visible=false;
  // Earth-fixed illustrative ground receiver, not a real station or event site.
  const ground = new THREE.Vector3(.25,.48,.88).normalize().multiplyScalar(1.014).toArray();
  const point = featured.geo.position.toArray();
  const camera = { ...orbitalOverviewPose(1000,600), near: .03, far: 120, min: 2.6, max: 25 };
  const make = (positions, rotating = true) => Object.fromEntries(Object.entries(positions).map(([id,pos]) => [id, { pos:[...pos], local:[...pos], rotating, view:{pos:[...camera.pos],target:[...pos]} }]));
  const hotspots = make({ geo:point, earth:ground, 'orbit-families':[-2,0,.4] });
  const dataHotspots = make({ processing:point, downlink:point, ground });
  const heatHotspots = make({ sunlight:point, power:point, radiator:point });
  for(const spot of [hotspots.geo,dataHotspots.processing,heatHotspots.power])spot.node=featured.geo;
  // These anchors follow authored spacecraft, rather than unconnected dots on
  // an orbit guide. HEO/MEO/LEO are independent of Earth's GEO rotation.
  for (const id of ['heo','meo','leo']) {
    const node=asset.getObjectByName(`${id.toUpperCase()}_Satellite_01`);
    if(!node)throw new Error(`Missing ${id} spacecraft anchor`);
    for(const set of [hotspots,dataHotspots,heatHotspots])set[id]={pos:[0,0,0],node,rotating:false,view:{pos:[...camera.pos],target:[0,0,0]}};
  }
  const spots = [...Object.values(hotspots),...Object.values(dataHotspots),...Object.values(heatHotspots)];
  const world = new THREE.Vector3(), receiver = new THREE.Vector3(), active = new THREE.Vector3(), peer = new THREE.Vector3();
  const sunStart = new THREE.Vector3(), heatEnd = new THREE.Vector3(), midpoint = new THREE.Vector3(), groundPoint = new THREE.Vector3();
  const optical = new THREE.Vector3(), radio = new THREE.Vector3(), solar = new THREE.Vector3(), thermal = new THREE.Vector3();
  const solarNormal = new THREE.Vector3(), thermalNormal = new THREE.Vector3(), farSun = new THREE.Vector3();
  const leoSpec=orbiters.find(orbiter=>orbiter.spec.family==='leo'&&orbiter.spec.index===1).spec;
  let last = null;
  function locate() {
    patches.visible=mode==='light'&&family.geo.visible&&!focusFamily;
    scene.updateMatrixWorld(true);
    for (const spot of spots) {
      const p = spot.node?spot.node.getWorldPosition(world):spin.localToWorld(world.set(...spot.local)); spot.pos = p.toArray();
      const radial = p.clone().normalize().multiplyScalar(8.5); radial.y = Math.max(3.4, radial.y);
      spot.view.pos = radial.toArray(); spot.view.target = p.toArray();
    }
    const activeNode=focusFamily==='leo'?featured.leo:featured.geo, ports=attachments.get(activeNode);
    activeNode.getWorldPosition(active);
    ports.optical.getWorldPosition(optical);ports.radio.getWorldPosition(radio);
    ports.solar.getWorldPosition(solar);ports.thermal.getWorldPosition(thermal);
    solarNormal.fromArray(ports.solar.userData.localDirection).transformDirection(ports.solar.matrixWorld);
    thermalNormal.fromArray(ports.thermal.userData.localDirection).transformDirection(ports.thermal.matrixWorld);
    spin.localToWorld(receiver.set(...ground)); attachments.get(relay).radio.getWorldPosition(peer);
    groundPoint.fromArray(focusFamily==='leo'?nadirPoint(active.toArray()):receiver.toArray());
    const start=active.toArray(), end=receiver.toArray(), activeVisible=family[focusFamily||'geo'].visible;
    streams.light.update(groundPoint.toArray(),optical.toArray(),elapsed*.32,activeVisible&&earthClearSegment(groundPoint.toArray(),optical.toArray()));
    const communicationsVisible=activeVisible&&earthClearSegment(radio.toArray(),end);
    streams.downlink.update(radio.toArray(),end,elapsed*.22,communicationsVisible);
    // A separate representative GEO-to-GEO link; it is not a LEO relay claim.
    streams.crosslink.update(radio.toArray(),peer.toArray(),elapsed*.18,activeVisible&&focusFamily!=='leo'&&earthClearSegment(radio.toArray(),peer.toArray()));
    // Incoming sunlight stays parallel to the inertial lighting direction as
    // the spacecraft moves. Never co-rotate this vector with EarthSpin.
    sunStart.copy(solar).addScaledVector(ILLUSTRATIVE_SUN,1.6);
    farSun.copy(solar).addScaledVector(ILLUSTRATIVE_SUN,20);
    heatEnd.copy(thermal).addScaledVector(thermalNormal,1.15);
    streams.sunlight.update(sunStart.toArray(),solar.toArray(),elapsed*.28,activeVisible&&solarNormal.dot(ILLUSTRATIVE_SUN)>0&&earthClearSegment(solar.toArray(),farSun.toArray())&&surfaceClear.get(activeNode)(sunStart.toArray(),solar.toArray()));
    streams.radiation.update(thermal.toArray(),heatEnd.toArray(),elapsed*.24,activeVisible&&earthClearSegment(thermal.toArray(),heatEnd.toArray()));
    for(const spot of [dataHotspots.processing,heatHotspots.power]){spot.pos=[...start];spot.view.target=[...start];}
    // If a physical path is absent, inspection still has a real component to
    // identify. Anchor its selected marker at the antenna or solar surface,
    // without reviving a blocked radio or sunlight connection.
    midpoint.copy(radio);if(streams.downlink.group.visible)midpoint.lerp(receiver,.48);
    dataHotspots.downlink.pos=midpoint.toArray();dataHotspots.downlink.view.target=midpoint.toArray();
    midpoint.copy(solar);if(streams.sunlight.group.visible)midpoint.lerp(sunStart,.7);
    heatHotspots.sunlight.pos=midpoint.toArray();heatHotspots.sunlight.view.target=midpoint.toArray();
    midpoint.copy(thermal).lerp(heatEnd,.65);heatHotspots.radiator.pos=midpoint.toArray();heatHotspots.radiator.view.target=midpoint.toArray();
    nadir.group.visible=focusFamily!==null&&activeVisible;
    if(nadir.group.visible){
      const reference=nadirPoint(start), history=[];
      if(focusFamily==='leo')for(let i=0;i<=48;i++){
        const age=1.4*(48-i)/48;
        // Rotate past subpoints with the Earth after they were crossed. The
        // trace is fixed to the surface, rather than sliding in inertial space.
        world.fromArray(nadirPoint(drawnOrbitPosition(leoSpec,elapsed-age)));
        world.applyAxisAngle(new THREE.Vector3(0,1,0),age*.065);history.push(world.toArray());
      }
      nadir.update(reference,history);
    }
  }
  locate();
  return { scene, quality, model, camera, overviewFrame:orbitalOverviewPose, hotspots, dataHotspots, heatHotspots,
    flows:layerGroups.light.children, dataFlows:layerGroups.data.children, heatFlows:layerGroups.heat.children,
    solids:[earth], satellites, look:{ exposure:1, bloom:0, threshold:1, ao:0, env:'night' },
    setMode(next) { mode=next;for (const [id,group] of Object.entries(layerGroups)) group.visible = id === mode; },
    setPart(id) {
      if(family[id])family[id].visible=true;
      else if(['processing','downlink','sunlight','power','radiator'].includes(id))family.geo.visible=true;
    },
    isPartVisible(id, {selected=false}={}) {
      if(family[id])return family[id].visible;
      if(id==='downlink')return family.geo.visible&&(selected||streams.downlink.group.visible);
      if(id==='sunlight')return family.geo.visible&&(selected||streams.sunlight.group.visible);
      return ['processing','power','radiator'].includes(id)?family[focusFamily||'geo'].visible:true;
    },
    setFocusFamily(id) {
      focusFamily=['geo','leo'].includes(id)?id:null;
      for(const [key,node] of Object.entries(featured))node.scale.copy(baseScales[key]);
      // The authored proxies are already enlarged. A follow view magnifies the
      // same GLB proxy further for legibility, as identified in the controls.
      if(focusFamily){family[focusFamily].visible=true;featured[focusFamily].scale.multiplyScalar(focusFamily==='leo'?3.5:1.5);}
      followEmphasis.setFocus(focusFamily?featured[focusFamily]:null);
      locate();
    },
    focusFamily() { return focusFamily; },
    followTarget(id='geo',options={}) {
      if(!featured[id])return null;
      scene.updateMatrixWorld(true);const center=featured[id].getWorldPosition(new THREE.Vector3());
      const velocity=id==='leo'?new THREE.Vector3(...drawnOrbitPosition(leoSpec,elapsed+.02)).sub(center):new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),center);
      return orbitalFollowPose(center.toArray(),velocity.toArray(),id,{
        ...options,
        attitude:featured[id].getWorldQuaternion(new THREE.Quaternion()).toArray(),
        proxyScale:featured[id].getWorldScale(new THREE.Vector3()).toArray(),
      });
    },
    setMotion(play) { moving.value = play; last = null; },
    setSuspended(value) {const next=!!value;if(next!==suspended){suspended=next;last=null;}},
    setModel(next){this.model=next;},
    motion() { return moving.value; },
    setFamily(id,visible) { if (family[id]) { family[id].visible = visible; locate(); } },
    families() { return Object.fromEntries(Object.entries(family).map(([id,group])=>[id,group.visible])); },
    update(time) {
      const dt=last===null?0:Math.max(0,time-last);last=time;
      if(moving.value&&!suspended&&dt<=1){
        elapsed+=dt;spin.rotation.y=elapsed*.065;
        for(const {spec,node,radial,attitude} of orbiters){
          node.position.set(...drawnOrbitPosition(spec,elapsed));
          node.quaternion.setFromUnitVectors(radial,node.position.clone().normalize()).multiply(attitude);
        }
      }
      locate();
    },
  };
}
