// IF's viewer contract, adapted for the Guardian Ring's sourced teaching scenes.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { store, on, emit } from './store.js';
import { TIERS, qualityPressure } from './render-quality.js';
import { poseAt, clearPath } from './camera-path.js';
import { createCameraClearance, constrainCameraPose, CLEARANCE_BAND } from './camera-clearance.js';
import { occupancyBuilder } from './occupancy.js';
import { createPartCycle } from './part-cycle.js';
import { layoutAnchoredPins, pinLabelBox } from './pin-layout.js';
import { fitComponent } from './component-frame.js';
import { teachingFocus } from '../scenes/teaching-focus.js';
import { chip } from '../evidence.js';
import { renderComponentDetails } from './component-details.js';
import { createVisitHistory, retainedPart, capturePane, refreshScenarioContent } from './exploration-context.js';
import { assemblyViewFromQuery } from './explorer-url.js';
import { followFromQuery } from './explorer-url.js';
import { createSceneLook } from './scene-look.js';
import * as orbits from '../scenes/orbits.js';
import * as satellite from '../scenes/satellite.js';
import * as payload from '../scenes/payload.js';
import * as focalPlane from '../scenes/focal-plane.js';
import * as pixel from '../scenes/pixel.js';
import * as plume from '../scenes/plume.js';
import * as ground from '../scenes/side-ground.js';
import * as abi from '../scenes/side-abi.js';
import * as tirs2 from '../scenes/side-tirs2.js';
import * as atmosphere from '../scenes/side-atmosphere.js';

const BUILDERS = [orbits, satellite, payload, focalPlane, pixel, plume, ground, abi, tirs2, atmosphere];
export const MAIN_LEVELS = 6, sceneCount = BUILDERS.length;
export const isSide = i => i >= MAIN_LEVELS;
const $ = id => document.getElementById(id), ui = store.ui, view = $('view'), canvas = $('gl');
const modes = ['light', 'data', 'heat'], keys = { light: 'PARTS', data: 'PARTS_DATA', heat: 'PARTS_HEAT' };
export const built = [], composers = [];
const visits = createVisitHistory();
export const camera = new THREE.PerspectiveCamera(35, 1, .05, 100);
export const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .1; controls.minDistance = 3; controls.maxDistance = 20;
export const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const clearanceStats = { builds: 0, buildMs: 0, standIn: 0, unplanned: 0, plans: 0, planMs: 0, hits: 0, prefetched: 0, clear: true, pending: false };
let renderer, sceneLook, started = false, busy = false, tween = null, transitions = reduced ? 'instant' : 'full', buildEpoch = 0;
let renderedFlightProgress = 1;
let framedPart = null, framedOverview = false;
let orbitTracking = null;
let orbitExitMinimum = null;
let navigationOwner = null;
let lifecycleFrozen = false, resetFrameClock = false, frozenAt = null;
export const activitySuspended = () => lifecycleFrozen || document.hidden || $('src-pop')?.hidden === false || $('page-sheet')?.hidden === false;
// A deliberate Pause or manual step survives subsequent layer/level changes.
// Camera inspection can pause the current pose without changing this preference.
let activityEnabled = !reduced;
export function setActivityEnabled(playing) { activityEnabled=!!playing;if(orbitTracking?.entering)orbitTracking.resumeMotion=activityEnabled; }
function previewActivity() {
  getTeaching()?.preview?.({playing:activityEnabled});
  if(orbitTracking?.entering)orbitTracking.resumeMotion=activityEnabled;
  else built[ui.scene]?.setMotion?.(activityEnabled);
  emit('scene-settings');
}
let ratio = 1, gpu = 'Unavailable', preference = 'auto', governorAt = 0, frameSamples = [], cpuSamples = [], judged = null;
const tiers = Array(sceneCount).fill(0), ceilings = Array(sceneCount).fill(0), held = new Set(), frameObservers = new Set(), tickers = new Set();
try { const saved = localStorage.getItem('grx-render-preference'); if (['auto', 'max', 'laptop'].includes(saved)) preference = saved; } catch { /* optional */ }
export const getRenderer = () => renderer;
export const renderScale = () => ratio;
export const qualityInfo = () => ({ gpu, integrated: /intel|radeon.*graphics/i.test(gpu), timers: false, governing: preference !== 'max',
  tiers: [...tiers], ceilings: [...ceilings], ratio, preference, bloom: false, particleFraction: TIERS[tiers[Math.max(0, ui.scene)]].particles,
  cpuMs: judged?.cpu ?? null, gpuMs: null, drawMs: judged?.cpu ?? null, composerRatio: ratio, ao: false, judged, pending: 0, quietFor: 0, window: frameSamples.length });
export function setQualityPreference(value) {
  if (!['auto', 'max', 'laptop'].includes(value)) return;
  preference = value; held.clear();
  try { localStorage.setItem('grx-render-preference', value); } catch { /* optional */ }
  tiers.fill(value === 'laptop' ? 4 : 0); ceilings.fill(value === 'laptop' ? 4 : 0);
  $('quality') && ($('quality').value = value); resize(); emit('render-quality');
}
export function forceTier(n, { hold = false, i = ui.scene } = {}) {
  if (!Number.isInteger(n) || n < 0 || n >= TIERS.length || i < 0 || i >= sceneCount) return;
  tiers[i] = n; ceilings[i] = hold ? n : 0; if (hold) held.add(i); else held.delete(i); resize();
}
export const partsFor = (i, mode = ui.mode) => store.C[keys[mode]]?.[store.C.SCENES[i]?.id] || [];
export const pinNumber = (i, id, mode = ui.mode) => { const index = partsFor(i, mode).findIndex(part => part.id === id); return index < 0 ? null : index + 1; };
export const partCount = (i, mode = ui.mode) => partsFor(i, mode).length;
export const hasPart = (i, id, mode = ui.mode) => partsFor(i, mode).some(part => part.id === id);
const hotspotsFor = i => built[i]?.[ui.mode === 'data' ? 'dataHotspots' : ui.mode === 'heat' ? 'heatHotspots' : 'hotspots'] || {};
export const occupancy = () => built[ui.scene]?.occupancy || null;
export const isBusy = () => busy;
export function cancelNavigation(owner) {
  if (!busy || owner === null || navigationOwner !== owner) return false;
  buildEpoch++;busy=false;navigationOwner=null;$('veil').hidden=true;return true;
}
export const isCameraMoving = () => busy || !!tween;
// Progress belongs to the last camera pose played, not a gate callback's clock.
// Keep the completed value after tween is cleared so observers can record u=1.
export const getFlightProgress = () => renderedFlightProgress;
export const getTeaching = () => built[ui.scene]?.teaching || null;
export const getAssemblyPresentation = () => built[ui.scene]?.presentation || null;
export const orbitFollow = () => orbitTracking?.family || null;
export const orbitMotionRequested = () => orbitTracking?.entering?orbitTracking.resumeMotion:built[0]?.motion?.()||false;
export function setOrbitFollow(family) {
  if (family === null) {
    if(orbitTracking){
      orbitExitMinimum=orbitTracking.minDistance;
      controls.minDistance=Math.min(orbitExitMinimum,camera.position.distanceTo(controls.target));
      // Cancel entry too: Free view must immediately release camera ownership.
      tween=null;
    }
    orbitTracking = null; built[0]?.setFocusFamily?.(null); emit('scene-settings'); return;
  }
  const current = built[ui.scene];
  if (ui.scene !== 0 || !['geo', 'leo'].includes(family) || !current?.followTarget) return;
  partCycle.stop(); deselect(); current.setFamily(family, true); current.setFocusFamily(family);
  const resumeMotion=orbitTracking?.entering?orbitTracking.resumeMotion:current.motion();
  current.setMotion(false);
  const previousMinimum=orbitTracking?.minDistance??orbitExitMinimum??controls.minDistance;
  orbitExitMinimum=null;
  controls.minDistance=.4;
  const pose = current.followTarget(family, { aspect: camera.aspect, fov: camera.fov, minDistance: controls.minDistance });
  flyTo(pose.pos, pose.target, .9, { inspection: false });
  orbitTracking = { family, entering: true, resumeMotion, minDistance:previousMinimum }; emit('scene-settings');
}
function updateOrbitFollow(suspended) {
  if (!orbitTracking || ui.scene !== 0 || suspended || tween || busy) return;
  const current = built[0];
  if (orbitTracking.entering) {
    orbitTracking.entering = false; current.setMotion(orbitTracking.resumeMotion); emit('scene-settings');
  }
  const pose = current.followTarget(orbitTracking.family, { aspect: camera.aspect, fov: camera.fov, minDistance: controls.minDistance });
  camera.position.fromArray(pose.pos); controls.target.fromArray(pose.target);
  controls.update(); camera.updateMatrixWorld();
}
const inspect = active => getTeaching()?.setInspection(active);
function captureView() {
  const lesson=getTeaching()?.state();
  return { scene: ui.scene, mode: ui.mode, selected: ui.selected, framedPart, framedOverview, position: camera.position.toArray(), target: controls.target.toArray(), orbitMinimum:ui.scene===0?orbitTracking?.minDistance??orbitExitMinimum:null, minDistance:controls.minDistance, pane: capturePane(), presentation:getAssemblyPresentation()?.capture(), lesson:lesson&&{index:lesson.index,progress:lesson.progress,inspection:lesson.inspection} };
}
export const destination = () => ui.scene;
export const stageActive = () => $('viewer').contains(document.activeElement) || $('viewer').matches(':hover');
export const observeFrame = fn => { frameObservers.add(fn); return () => frameObservers.delete(fn); };
export const onTick = fn => { tickers.add(fn); return () => tickers.delete(fn); };
function restoreOrbitMinimum() {
  if(!orbitTracking&&orbitExitMinimum!==null&&camera.position.distanceTo(controls.target)>=orbitExitMinimum-1e-6){
    controls.minDistance=orbitExitMinimum;orbitExitMinimum=null;
  }
}
export const TRANSITIONS = { full: 1, quick: .6, instant: 0 };
export function setTransitions(value) { if (value in TRANSITIONS) { transitions = value; if (value === 'instant') settle(); } }
export const getTransitions = () => transitions;
export function settle() {
  if (tween) { camera.position.copy(tween.p1); controls.target.copy(tween.t1); tween = null; }
  renderedFlightProgress = 1;
  restoreOrbitMinimum();
  controls.update(); camera.updateMatrixWorld(); updatePins();
}
export function flyTo(pos, target, duration = .9, { inspection = true } = {}) {
  if(inspection)inspect(true);
  const limits = { minDistance: controls.minDistance, maxDistance: controls.maxDistance, minPolarAngle: controls.minPolarAngle, maxPolarAngle: controls.maxPolarAngle };
  const move = { p0: camera.position.clone(), t0: controls.target.clone(), p1: new THREE.Vector3(...pos), t1: new THREE.Vector3(...target), limits, start: 0, duration: duration * TRANSITIONS[transitions] * 1000 };
  constrainCameraPose(move.p1, move.t1, limits);
  // Instant and reduced-motion views have no intermediate flight to plan.
  if (!move.duration) { tween = move; renderedFlightProgress = 0; settle(); return; }
  const map = occupancy(), start = performance.now();
  const result = clearPath(move, createCameraClearance(move, map, limits), { n: 32, maxTries: 320, through: 100, goodEnough: CLEARANCE_BAND });
  clearanceStats.plans++; clearanceStats.planMs = performance.now() - start; clearanceStats.clear = result.good; clearanceStats.costs = result.costs;
  clearanceStats.tries = result.tries; clearanceStats.chosen = move.via ? { via: move.via.length } : move.hop || null;
  move.duration *= Math.min(1.6, 1 + .6 * Math.max(0, result.stretch - 1));
  // Planning time must not consume the beginning of the checked flight.
  move.start = performance.now();
  tween = move; renderedFlightProgress = 0;
}
function partFrame(spot) {
  return fitComponent(spot.view,view.clientWidth,view.clientHeight,{minDistance:controls.minDistance,maxDistance:controls.maxDistance});
}
function overviewFrame() { return built[ui.scene]?.overviewFrame?.(view.clientWidth,view.clientHeight)||built[ui.scene]?.camera; }
function resize() {
  if (!renderer) return;
  if(built[ui.scene])sceneLook?.apply(built[ui.scene],{sceneId:store.C.SCENES[ui.scene].id,tier:tiers[ui.scene]});
  const width = Math.max(1, view.clientWidth), height = Math.max(1, view.clientHeight);
  ratio = Math.min(devicePixelRatio || 1, TIERS[tiers[Math.max(0, ui.scene)]].ratio);
  renderer.setPixelRatio(ratio); renderer.setSize(width, height, false);
  camera.aspect = width / height; camera.fov = camera.aspect < .9 ? 48 : 35; camera.updateProjectionMatrix();
  // Refit only a view we still own. A user's orbit/zoom must survive pane and
  // orientation changes; explicit part selection opts back into authored framing.
  const spot=framedPart&&hotspotsFor(ui.scene)[framedPart];
  if(spot?.view?.detailSize){
    const frame=partFrame(spot),position=tween?.p1||camera.position,target=tween?.t1||controls.target;
    if(position.distanceTo(new THREE.Vector3(...frame.pos))>1e-6||target.distanceTo(new THREE.Vector3(...frame.target))>1e-6)flyTo(frame.pos,frame.target,.35,{inspection:false});
  }
  if(framedOverview&&!orbitTracking&&built[ui.scene]?.overviewFrame){
    const frame=overviewFrame(),position=tween?.p1||camera.position,target=tween?.t1||controls.target;
    if(position.distanceTo(new THREE.Vector3(...frame.pos))>1e-6||target.distanceTo(new THREE.Vector3(...frame.target))>1e-6)flyTo(frame.pos,frame.target,.35,{inspection:false});
  }
  updatePins();
}
function updatePins() {
  if (ui.scene < 0) return;
  camera.updateMatrixWorld();
  const width = view.clientWidth, height = view.clientHeight;
  const origin=view.getBoundingClientRect();
  const hudBounds=[...view.querySelectorAll('.hud,.hud-row,#scene-note')].filter(el=>el.checkVisibility()).map(el=>{
    const r=el.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top};
  });
  built[ui.scene]?.updateLabels?.(camera,{width,height,obstacles:hudBounds});
  const points = [];
  for (const button of $('pins').querySelectorAll('button')) {
    const spot = hotspotsFor(ui.scene)[button.dataset.id]; if (!spot) continue;
    const p = new THREE.Vector3(...spot.pos).project(camera);
    const x = (p.x + 1) / 2 * width, y = (1 - p.y) / 2 * height;
    button.hidden = !!orbitTracking || getAssemblyPresentation()?.isPartVisible(button.dataset.id) === false || built[ui.scene]?.isPartVisible?.(button.dataset.id, {selected:button.dataset.id===ui.selected}) === false || p.z < -1 || p.z > 1 || x < 12 || x > width - 12 || y < 12 || y > height - 12;
    if (!button.hidden) points.push({ id:button.dataset.id, x, y, button });
  }
  // Keep badges at the component whenever possible. Resolve only local
  // collisions, with leaders retaining the true anchor for displaced badges.
  const printedBounds=(built[ui.scene]?.labels||[]).filter(label=>label.visible&&label.userData.readability?.bounds).map(label=>label.userData.readability.bounds);
  const markerBounds=[];
  for(const spot of Object.values(hotspotsFor(ui.scene))){
    if(!spot.markerRegion)continue;
    const {center,size}=spot.markerRegion,projected=[];
    for(const dx of [-1,1])for(const dy of [-1,1])for(const dz of [-1,1]){
      const p=new THREE.Vector3(center[0]+dx*size[0]/2,center[1]+dy*size[1]/2,center[2]+dz*size[2]/2).project(camera);
      if(p.z>-1&&p.z<1)projected.push({x:(p.x+1)*width/2,y:(1-p.y)*height/2});
    }
    if(projected.length===8)markerBounds.push({left:Math.min(...projected.map(p=>p.x)),right:Math.max(...projected.map(p=>p.x)),top:Math.min(...projected.map(p=>p.y)),bottom:Math.max(...projected.map(p=>p.y))});
  }
  const {placements}=layoutAnchoredPins(points,{obstacles:[...printedBounds,...hudBounds,...markerBounds],width,height,selected:ui.selected});
  for (const point of points) {
    const spot = placements.get(point.id), button = point.button;
    const x = Math.max(13,Math.min(width-13,spot.x)), y = Math.max(13,Math.min(height-13,spot.y));
    button.style.left = `${x}px`; button.style.top = `${y}px`;
    const dx = point.x-x, dy = point.y-y, length = Math.hypot(dx,dy);
    button.classList.toggle('fanned',length>.5);
    button.style.setProperty('--lead-len',`${Math.max(0,length-12)}px`);
    button.style.setProperty('--lead-a',`${Math.atan2(dy,dx)}rad`);
    if(point.id!==ui.selected)button.classList.add('hide-lbl');
  }
  // Keep the selected component name readable even when its physical nameplate
  // is on the far side or too small. Reserve the HUD and other numbered pins.
  const selected=points.find(point=>point.id===ui.selected);
  if(selected){
    const label=selected.button.querySelector('.lbl');
    const reserved=[...points.map(p=>p.button.querySelector('.num'))]
      .filter(el=>el.checkVisibility()).map(el=>{const r=el.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top};});
    reserved.push(...hudBounds,...printedBounds);
    // A label must not sit on the detail the reader came to inspect. For an
    // authored component region, reserve its projected face as well as pins.
    // When no clear label lane remains, the picker and card retain its name.
    const detail=hotspotsFor(ui.scene)[ui.selected]?.view;
    const regions=[];
    if(detail?.detailSize){
      const center=detail.focus||detail.target, size=detail.detailSize;
      regions.push(new THREE.Box3(new THREE.Vector3(...center).addScaledVector(new THREE.Vector3(...size),-.5),new THREE.Vector3(...center).addScaledVector(new THREE.Vector3(...size),.5)));
    }
    for(const name of detail?.labelNodes||[]){
      const node=built[ui.scene]?.asset?.getObjectByName(name);
      if(node)regions.push(new THREE.Box3().setFromObject(node));
    }
    for(const region of regions){
      const projected=[];
      for(const dx of [-1,1])for(const dy of [-1,1])for(const dz of [-1,1]){
        const point=new THREE.Vector3(dx<0?region.min.x:region.max.x,dy<0?region.min.y:region.max.y,dz<0?region.min.z:region.max.z).project(camera);
        projected.push({x:(point.x+1)*width/2,y:(1-point.y)*height/2});
      }
      reserved.push({left:Math.min(...projected.map(p=>p.x)),right:Math.max(...projected.map(p=>p.x)),top:Math.min(...projected.map(p=>p.y)),bottom:Math.max(...projected.map(p=>p.y))});
    }
    const x=parseFloat(selected.button.style.left),y=parseFloat(selected.button.style.top),maxWidth=Math.min(270,width-32);
    selected.button.classList.remove('hide-lbl');label.style.maxWidth=`${maxWidth}px`;label.style.width='max-content';
    const naturalWidth=Math.ceil(label.offsetWidth);let box=null;
    // Keep the full name at the same type size. A narrower, wrapped label can
    // use a clear corner on a phone where a wide label has no horizontal lane.
    for(const candidate of [...new Set([naturalWidth,220,180,140].map(w=>Math.min(naturalWidth,w)))]){
      label.style.width=`${candidate}px`;
      box=pinLabelBox(x,y,candidate,width,view.clientHeight,reserved,true,label.offsetHeight);
      if(box)break;
    }
    if(box){
      label.style.left=`${box.left-x+11}px`;label.style.top=`${box.top-y+11}px`;
      const dx=Math.max(box.left,Math.min(box.right,x))-x,dy=Math.max(box.top,Math.min(box.bottom,y))-y;
      selected.button.style.setProperty('--label-lead-len',`${Math.max(0,Math.hypot(dx,dy)-14)}px`);
      selected.button.style.setProperty('--label-lead-a',`${Math.atan2(dy,dx)}rad`);
    }
    else selected.button.classList.add('hide-lbl');
  }
}
function buildPanel() {
  const scene = store.C.SCENES[ui.scene], parts = partsFor(ui.scene);
  $('hud-title').textContent = scene.title; $('hud-sub').textContent = scene.scale;
  if ($('scene-note')) $('scene-note').textContent = scene.id === 'orbits' ? 'Schematic positions · not to scale\nGEO patches: illustrative, not sensor coverage\nHistorical NASA Earth textures' : scene.ready ? 'Representative geometry · not to scale\nAnimated paths are illustrative' : 'Reserved level\nViewer test object';
  $('intro').textContent = scene.intro; $('parts-n').textContent = ` ${parts.length}`;
  $('lp-k').textContent = isSide(ui.scene) ? 'Side level' : `Level ${ui.scene + 1} of ${MAIN_LEVELS}`;
  $('lp-t').textContent = scene.title; $('back-out').hidden = !isSide(ui.scene);
  if (isSide(ui.scene)) $('back-out').textContent = `← Back to ${store.C.SCENES[visits.peek()?.scene ?? 0].title.replace(/^The /, 'the ')}`;
  document.querySelectorAll('[data-level]').forEach(button => button.setAttribute('aria-current', +button.dataset.level === ui.scene ? 'step' : 'false'));
  $('parts').replaceChildren(); $('pins').replaceChildren();
  parts.forEach((part, index) => {
    const li = document.createElement('li'), row = document.createElement('button'); row.type = 'button'; row.dataset.id = part.id;
    const number = document.createElement('span'); number.className = 'pn'; number.textContent = String(index + 1);
    const title = document.createElement('span'); title.className = 'pt'; title.textContent = part.title;
    const kicker = document.createElement('span'); kicker.className = 'pk'; kicker.textContent = part.kicker;
    row.append(number, title, kicker); row.addEventListener('click', () => select(part.id)); li.append(row); $('parts').append(li);
    const button = document.createElement('button'); button.type = 'button'; button.className = 'pin'; button.dataset.id = part.id; button.setAttribute('aria-label', part.title);
    button.innerHTML = `<span class="num">${index + 1}</span><span class="label-leader" aria-hidden="true"></span><span class="lbl"></span>`; button.querySelector('.lbl').textContent = part.title; button.classList.add('hide-lbl'); button.addEventListener('click', () => select(part.id)); $('pins').append(button);
  });
  $('card').hidden = true; updateCycle(); updatePins();
}
function updateCycle() {
  const available = partCount(ui.scene) > 1;
  for (const id of ['card-prev', 'card-next', 'part-play']) $(id).disabled = !available;
  $('part-play').setAttribute('aria-pressed', String(partCycle.playing)); $('part-play').textContent = partCycle.playing ? 'Pause' : 'Auto-cycle';
  $('part-play').title = available ? 'Cycle through the parts, holding each for 8 seconds after the camera arrives. Reading sources pauses the clock; choosing a part stops it.' : 'Available when this level has several parts';
}
export function select(id, fly = true, { reveal = true } = {}) {
  if (orbitTracking) setOrbitFollow(null);
  const part = partsFor(ui.scene).find(candidate => candidate.id === id); if (!part) return;
  framedOverview=false;
  if (!partCycle.selecting) partCycle.stop();
  if (fly) { inspect(true); built[ui.scene]?.setMotion?.(false); emit('scene-settings'); }
  ui.selected = id; $('card').hidden = false; $('card-k').textContent = part.kicker; $('card-t').textContent = part.title; $('card-b').textContent = part.body;
  let assembly=$('card-assembly');
  if(!assembly){assembly=document.createElement('div');assembly.id='card-assembly';assembly.className='card-assembly';$('card-b').before(assembly);}
  assembly.hidden=!part.assembly;assembly.replaceChildren();
  if(part.assembly){const title=document.createElement('p');title.textContent=part.assembly.title;assembly.append(title);assembly.insertAdjacentHTML('beforeend',chip('spec',part.assembly.evidence,'Civil reference'));if(part.assemblyNote){const note=document.createElement('p');note.className='assembly-context';note.textContent=part.assemblyNote;assembly.append(note);}}
  renderComponentDetails($('card-components'), part.components, { sceneId: store.C.SCENES[ui.scene].id, partId: id });
  $('card-s').replaceChildren();
  part.specs.forEach((row, index) => {
    const entry = document.createElement('div'), dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = row[0]; dd.textContent = row[1];
    entry.append(dt, dd); entry.insertAdjacentHTML('beforeend', chip(row[2], `card:${ui.mode}:${store.C.SCENES[ui.scene].id}:${id}:${index}`)); $('card-s').append(entry);
  });
  $('card-s').hidden = !part.specs.length;
  const next = store.C.SCENES[part.drill];
  $('card-drill').hidden = !next?.ready;
  $('card-drill').textContent = next ? `Explore ${next.title.replace(/^The /,'the ')} →` : '';
  $('card-drill').onclick = () => void go(part.drill);
  document.querySelectorAll('#parts button, #pins button').forEach(button => {
    const active = button.dataset.id === id;
    button.setAttribute('aria-pressed',String(active));
    if(button.classList.contains('pin'))button.classList.toggle('on',active);
  });
  getAssemblyPresentation()?.revealPart(id);
  built[ui.scene]?.setPart?.(id); emit('scene-settings');
  const spot = hotspotsFor(ui.scene)[id]; if (fly && spot?.view) {const frame=partFrame(spot);flyTo(frame.pos,frame.target);framedPart=id;}
  emit('select', id); updateCycle();
  if (fly && reveal) emit('part-inspect', id);
}
export function deselect() {
  framedPart = null; framedOverview=false; ui.selected = null; $('card').hidden = true;
  document.querySelectorAll('#parts button, #pins button').forEach(button => { button.setAttribute('aria-pressed', 'false'); button.classList.remove('on'); });
  emit('select', null);
}
export function overview() {
  if (orbitTracking) setOrbitFollow(null);
  const preset = overviewFrame(); if (!preset) return;
  partCycle.stop(); deselect(); framedOverview=true; flyTo(preset.pos, preset.target);
}
// Covers disappear only for the illustrative cutaway. Camera clearance always
// includes the complete enclosures, so closing cannot trap a detail camera.
export function setAssemblyView(view) {
  const presentation=getAssemblyPresentation();if(!presentation)return;
  getTeaching()?.pause();inspect(true);overview();
  presentation.setView(view);updatePins();emit('scene-settings');
}
// Playback starts from the whole assembly, after the camera reaches its safe preset.
export function preparePlayback() { overview(); settle();getAssemblyPresentation()?.preparePlayback();inspect(false);emit('scene-settings'); }
// Manual animation steps inspect their subject; full playback keeps the whole
// route visible. The step is applied after selection so its paused mechanism
// pose is not reset by select() entering hardware inspection.
export function stepTeaching(direction, { reset = false } = {}) {
  const teaching=getTeaching();if(!teaching)return;
  const state=teaching.state(),index=reset?0:(state.index+direction+state.total)%state.total;
  const id=teachingFocus(store.C.SCENES[ui.scene].id,ui.mode,state.steps[index].id);
  teaching.pause();getAssemblyPresentation()?.preparePlayback();
  if(id&&hasPart(ui.scene,id))select(id);else overview();
  if(reset)teaching.seek(0,0);else teaching.step(direction);
  emit('scene-settings');
}
export function cycle(direction) {
  const parts = partsFor(ui.scene); if (!parts.length) return;
  const index = parts.findIndex(part => part.id === ui.selected);
  select(parts[index < 0 ? direction < 0 ? parts.length - 1 : 0 : (index + direction + parts.length) % parts.length].id);
}
const partCycle = createPartCycle({ parts: () => partsFor(ui.scene).map(part => part.id), selected: () => ui.selected, select,
  ready: () => !document.hidden && !isCameraMoving() && $('src-pop')?.hidden !== false && $('page-sheet')?.hidden !== false, changed: updateCycle });
export function setMode(mode, { activity = true } = {}) {
  if (!modes.includes(mode)) return;
  partCycle.stop();
  const selected = ui.selected;
  const previous=hotspotsFor(ui.scene)[selected]?.view;
  ui.mode = mode; document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  if (ui.scene >= 0) {
    built[ui.scene]?.setMode(mode);
    const id=selected === null ? null : hasPart(ui.scene,selected)?selected:partsFor(ui.scene)[0]?.id;
    const next=hotspotsFor(ui.scene)[id]?.view;
    buildPanel();
    if(id)select(id,!!previous&&JSON.stringify(previous)!==JSON.stringify(next));
    if(activity)previewActivity();
  }
  emit('mode', mode);
}
export async function go(index, { record = true, restore = null, owner = null, resetPane = true, activity = true } = {}) {
  if (typeof index === 'string') index = store.C.SCENES.findIndex(scene => scene.id === index);
  if (!Number.isInteger(index) || index < 0 || index >= sceneCount) return;
  emit('navigation-request', { scene: index, owner });
  if (orbitTracking) setOrbitFollow(null);
  const firstView = ui.scene < 0;
  if (record) visits.enter(captureView(), index, isSide(index));
  built[ui.scene]?.teaching?.pause();
  const epoch = ++buildEpoch; busy = true; navigationOwner=owner;partCycle.stop(); $('veil').hidden = false; $('veil').classList.remove('off'); $('veil').textContent = 'Preparing the scene…';
  try {
    if (!built[index]) {
      await BUILDERS[index].preload(); if (epoch !== buildEpoch) return;
      built[index] = BUILDERS[index].build({ quality: { ...TIERS[tiers[index]], mobile }, model: store.M });
      sceneLook.apply(built[index],{sceneId:store.C.SCENES[index].id,tier:tiers[index]});
      built[index].scene.updateMatrixWorld(true);
      const start = performance.now(), builder = occupancyBuilder(built[index].solids, { maxCells: 64_000 }); builder.step();
      built[index].occupancy = builder.result; clearanceStats.builds++; clearanceStats.buildMs = performance.now() - start;
    }
    if (epoch !== buildEpoch) return;
    ui.scene = index; ui.selected = null; framedPart = null; framedOverview=!restore; tween = null; renderedFlightProgress = 1;
    orbitExitMinimum=null;
    if (restore) ui.mode = restore.mode;
    const preset = built[index].camera; camera.position.set(...preset.pos); controls.target.set(...preset.target); camera.near = preset.near; camera.far = preset.far; controls.minDistance = preset.min; controls.maxDistance = preset.max;
    controls.update(); built[index].setMode(ui.mode); buildPanel(); resize(); emit('scene', index);
    if (restore) {
      if(index===0&&restore.orbitMinimum!==null&&Number.isFinite(restore.orbitMinimum)&&Number.isFinite(restore.minDistance)){
        controls.minDistance=restore.minDistance;orbitExitMinimum=restore.orbitMinimum;
        built[index].setMotion?.(false);
      }
      getAssemblyPresentation()?.restore(restore.presentation);
      document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === ui.mode)));
      const id = retainedPart(partsFor(index), restore.selected);
      if (id) { inspect(true); select(id, false); } else deselect();
      framedPart=id&&restore.framedPart===id?id:null;
      framedOverview=!id&&!!restore.framedOverview;
      camera.position.fromArray(restore.position); controls.target.fromArray(restore.target); settle();
      if(restore.lesson&&getTeaching()){
        getTeaching().seek(restore.lesson.index,restore.lesson.progress);
        inspect(restore.lesson.inspection);
        // Seeking opens electronics for a lesson. Restore closed hardware when
        // the saved view was a normal exterior inspection.
        getAssemblyPresentation()?.restore(restore.presentation);
      }
      emit('mode', ui.mode); emit('restore-pane', { ...restore.pane, restoreFocus: true });
    } else { if(getAssemblyPresentation()){getAssemblyPresentation().setView('assembled');inspect(true);}deselect();framedOverview=true; if (!firstView&&resetPane) emit('pane-request', { pane: 'parts', reset: true }); }
    if(!restore&&owner===null&&activity)previewActivity();
    $('veil').hidden = true; emit('scene-settings');
  } catch (error) { if(epoch!==buildEpoch)return;$('veil').textContent = 'The viewer could not start. Reload to try again; the source and method pages remain available.'; throw error; }
  finally { if (epoch === buildEpoch) {busy = false;navigationOwner=null;} }
}
// Preserve the test hook's default-first-part contract. Normal level navigation
// uses go(), which opens an honest unselected overview.
export async function show({ scene = ui.scene, mode = ui.mode, part = null }) { if (modes.includes(mode)) ui.mode = mode; await go(scene, { record: false, activity:false }); setMode(mode,{activity:false}); select(part||partsFor(ui.scene)[0]?.id); }
export async function backOut() { const origin = visits.back(); await go(origin?.scene ?? 0, { record: false, restore: origin }); }
on('scenario', () => {
  if (!started) return;
  // Scene geometry represents hardware, not these independent mathematical inputs.
  // Refresh model-aware teaching overlays and evidence without resetting the view.
  if (ui.scene < 0) return;
  refreshScenarioContent({ built, model: store.M, parts: partsFor(ui.scene), selected: ui.selected,
    refreshPanel: buildPanel, select, deselect, pane: capturePane(), restorePane: pane => emit('restore-pane', pane) });
  emit('scene-settings');
});
function median(values) { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)] || 0; }
function govern(now) {
  if (now - governorAt < 2000 || frameSamples.length < 30) return;
  judged = { frame: median(frameSamples), cpu: median(cpuSamples), gpu: null };
  if (preference !== 'max' && !held.has(ui.scene)) {
    const pressure = qualityPressure(judged), floor = preference === 'laptop' ? 4 : 0;
    if (pressure > 0 && tiers[ui.scene] < TIERS.length - 1) { tiers[ui.scene] = Math.min(TIERS.length - 1, tiers[ui.scene] + pressure); resize(); }
    else if (pressure < 0 && tiers[ui.scene] > floor) { tiers[ui.scene]--; resize(); }
  }
  governorAt = now; frameSamples = []; cpuSamples = [];
}
export function start() {
  if (started) return; started = true;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
    sceneLook=createSceneLook(renderer);
    const gl = renderer.getContext(), debug = gl.getExtension('WEBGL_debug_renderer_info'); gpu = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  } catch { $('veil').textContent = 'WebGL is unavailable. The source and method pages remain available.'; busy = false; return; }
  setQualityPreference(preference);
  const mainLevels = document.createElement('div'), sideLevels = document.createElement('div');
  mainLevels.className = 'lm-group'; sideLevels.className = 'lm-group';
  const sideHeading = document.createElement('p'); sideHeading.className = 'mm-h'; sideHeading.textContent = 'Related views'; sideLevels.append(sideHeading);
  $('level-menu').append(mainLevels, sideLevels);
  store.C.SCENES.forEach((scene, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'step'; button.dataset.level = String(index); button.style.setProperty('--c', 'var(--accent)');
    button.innerHTML = `<span class="top"><span class="n">${index < MAIN_LEVELS ? index + 1 : '↳'}</span><span class="t"></span></span><span class="meta">${scene.ready?'Schematic':'Coming next'}</span>`;
    button.querySelector('.t').textContent = scene.short;
    const item = document.createElement('button'); item.type = 'button'; item.className = 'lm-item'; item.dataset.level = String(index);
    item.innerHTML = `<span class="n">${index < MAIN_LEVELS ? index + 1 : '↳'}</span><span class="t"></span><span class="meta"></span>`;
    item.querySelector('.t').textContent = scene.title; item.querySelector('.meta').textContent = scene.scale;
    item.addEventListener('click', () => void go(index)); (index < MAIN_LEVELS ? mainLevels : sideLevels).append(item);
    if (index < MAIN_LEVELS) { button.addEventListener('click', () => void go(index)); $('steps').append(button); }
    else { const side = document.createElement('button'); side.className = 'btn'; side.type = 'button'; side.textContent = scene.title; side.dataset.level = String(index); side.addEventListener('click', () => void go(index)); $('side-levels').append(side); }
  });
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $('card-prev').addEventListener('click', () => cycle(-1)); $('card-next').addEventListener('click', () => cycle(1)); $('part-play').addEventListener('click', () => partCycle.toggle()); $('back-out').addEventListener('click', backOut);
  $('quality').addEventListener('change', event => setQualityPreference(event.target.value));
  controls.addEventListener('start', () => { if(orbitTracking)setOrbitFollow(null);framedPart = null; framedOverview=false; tween = null; partCycle.stop(); inspect(true); built[ui.scene]?.setMotion?.(false); emit('scene-settings'); });
  const suspendActivity = () => {
    const suspended = activitySuspended();
    getTeaching()?.setSuspended?.(suspended); built[ui.scene]?.setSuspended?.(suspended);
  };
  document.addEventListener('visibilitychange', suspendActivity);
  // Chrome can freeze a page independently of visibility. Reset all clocks at
  // the lifecycle boundary, including short freezes below the gap safeguard.
  document.addEventListener('freeze', () => {
    lifecycleFrozen = true; frozenAt = performance.now(); suspendActivity();
  });
  document.addEventListener('resume', () => {
    if (tween && frozenAt !== null) tween.start += performance.now() - frozenAt;
    lifecycleFrozen = false; frozenAt = null; resetFrameClock = true; suspendActivity();
  });
  new ResizeObserver(resize).observe(view);
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Escape' && partCycle.playing) partCycle.stop();
    const target = event.target instanceof Element ? event.target : null;
    if (!stageActive() || target?.closest('input, select, textarea, [contenteditable="true"], [role="tablist"], [role="dialog"], button, a[href], summary')) return;
    if (/^[1-6]$/.test(event.key)) void go(Number(event.key) - 1);
    else if (['l', 'd', 'h'].includes(event.key.toLowerCase())) setMode({ l: 'light', d: 'data', h: 'heat' }[event.key.toLowerCase()]);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycle(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  let last = performance.now();
  renderer.setAnimationLoop(now => {
    const dt = resetFrameClock ? 0 : Math.max(0, (now - last) / 1000); last = now; resetFrameClock = false;
    const suspended = activitySuspended();
    getTeaching()?.setSuspended?.(suspended); built[ui.scene]?.setSuspended?.(suspended);
    if (lifecycleFrozen || document.hidden || ui.scene < 0 || !built[ui.scene]) return;
    const cpuStart = performance.now();
    if (tween) { const u = Math.max(0, Math.min(1, (now - tween.start) / tween.duration)); poseAt(tween, u, camera.position, controls.target); renderedFlightProgress = u; if (u >= 1) tween = null; }
    if(!tween)restoreOrbitMinimum();
    controls.update();
    // A reader can rotate the released close view around a spacecraft. Keep
    // that free camera outside Earth until an authored view restores its limit.
    if(ui.scene===0&&!orbitTracking&&!tween&&camera.position.length()<1.10){camera.position.setLength(1.10);camera.lookAt(controls.target);}
    built[ui.scene].update(now / 1000); updateOrbitFollow(suspended); partCycle.tick(dt); tickers.forEach(fn => fn(now / 1000, dt)); updatePins();
    sceneLook.activate(built[ui.scene]);renderer.render(built[ui.scene].scene, camera);
    const cpu = performance.now() - cpuStart; if (dt < .25) { frameSamples.push(dt * 1000); cpuSamples.push(cpu); }
    frameObservers.forEach(fn => fn({ frame: dt * 1000, cpu })); govern(now);
  });
  const [level, mode, part] = (new URLSearchParams(location.search).get('view') || '').split('.');
  const sharedAssemblyView = assemblyViewFromQuery(location.search);
  const sharedFollow = followFromQuery(location.search);
  if (/^\d$/.test(level) && modes.includes(mode)) {
    ui.mode=mode;
    const opening=part?show({scene:Number(level),mode,part}):go(Number(level),{record:false});
    void opening.then(() => {
      if (ui.scene !== Number(level) || ui.mode !== mode) return;
      setMode(mode,{activity:false});
      // A shared two-field view means Overview. An explicit enclosure choice
      // remains a still inspection; other overviews offer live layer activity.
      if (!part) overview();
      const presentation = getAssemblyPresentation();
      if (presentation && sharedAssemblyView) {
        presentation.setView(sharedAssemblyView);
        // A malformed closed+internal-part link must still reveal its subject.
        // Restoring a presentation must not clear a valid external selection.
        if (ui.selected) presentation.revealPart(ui.selected);
        updatePins(); emit('scene-settings');
      }
      if(!part&&Number(level)===0&&sharedFollow)setOrbitFollow(sharedFollow);
      else if(!part&&!sharedAssemblyView)previewActivity();
    });
  }
  else void go(0);
}
