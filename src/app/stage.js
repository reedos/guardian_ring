// IF's viewer contract, adapted for the Guardian Ring's sourced teaching scenes.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { store, on, emit } from './store.js';
import { TIERS, qualityPressure } from './render-quality.js';
import { poseAt, clearPath } from './camera-path.js';
import { createCameraClearance, constrainCameraPose, CLEARANCE_BAND } from './camera-clearance.js';
import { occupancyBuilder } from './occupancy.js';
import { createPartCycle } from './part-cycle.js';
import { declutterPins, pinLabelBox, avoidPinObstacles } from './pin-layout.js';
import { chip } from '../evidence.js';
import { renderComponentDetails } from './component-details.js';
import { createVisitHistory, retainedPart, capturePane, refreshScenarioContent } from './exploration-context.js';
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
let renderer, started = false, busy = false, tween = null, transitions = reduced ? 'instant' : 'full', buildEpoch = 0;
let renderedFlightProgress = 1;
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
export const isCameraMoving = () => busy || !!tween;
// Progress belongs to the last camera pose played, not a gate callback's clock.
// Keep the completed value after tween is cleared so observers can record u=1.
export const getFlightProgress = () => renderedFlightProgress;
export const getTeaching = () => built[ui.scene]?.teaching || null;
const inspect = active => getTeaching()?.setInspection(active);
function captureView() {
  return { scene: ui.scene, mode: ui.mode, selected: ui.selected, position: camera.position.toArray(), target: controls.target.toArray(), pane: capturePane() };
}
export const destination = () => ui.scene;
export const stageActive = () => $('viewer').contains(document.activeElement) || $('viewer').matches(':hover');
export const observeFrame = fn => { frameObservers.add(fn); return () => frameObservers.delete(fn); };
export const onTick = fn => { tickers.add(fn); return () => tickers.delete(fn); };
export const TRANSITIONS = { full: 1, quick: .6, instant: 0 };
export function setTransitions(value) { if (value in TRANSITIONS) { transitions = value; if (value === 'instant') settle(); } }
export const getTransitions = () => transitions;
export function settle() {
  if (tween) { camera.position.copy(tween.p1); controls.target.copy(tween.t1); tween = null; }
  renderedFlightProgress = 1;
  controls.update(); camera.updateMatrixWorld(); updatePins();
}
export function flyTo(pos, target, duration = .9) {
  inspect(true);
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
function resize() {
  if (!renderer) return;
  const width = Math.max(1, view.clientWidth), height = Math.max(1, view.clientHeight);
  ratio = Math.min(devicePixelRatio || 1, TIERS[tiers[Math.max(0, ui.scene)]].ratio);
  renderer.setPixelRatio(ratio); renderer.setSize(width, height, false);
  camera.aspect = width / height; camera.fov = camera.aspect < .9 ? 48 : 35; camera.updateProjectionMatrix(); updatePins();
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
    button.hidden = p.z < -1 || p.z > 1 || x < 12 || x > width - 12 || y < 12 || y > height - 12;
    if (!button.hidden) points.push({ id:button.dataset.id, x, y, button });
  }
  // The reference viewer's fan keeps nearby parts selectable on a phone. Leaders
  // retain the true geometry anchor when a marker moves to make room for another.
  const printedBounds=(built[ui.scene]?.labels||[]).filter(label=>label.visible&&label.userData.readability?.bounds).map(label=>label.userData.readability.bounds);
  const fan=declutterPins(points, { expanded:new Set(points.map(p => p.id)) });
  const placements=avoidPinObstacles(fan.placements,{obstacles:[...printedBounds,...hudBounds],width,height,selected:ui.selected});
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
    if(box){label.style.left=`${box.left-x+11}px`;label.style.top=`${box.top-y+11}px`;}
    else selected.button.classList.add('hide-lbl');
  }
}
function buildPanel() {
  const scene = store.C.SCENES[ui.scene], parts = partsFor(ui.scene);
  $('hud-title').textContent = scene.title; $('hud-sub').textContent = scene.scale;
  if ($('scene-note')) $('scene-note').textContent = scene.id === 'orbits' ? 'Schematic orbits · not to scale\nHistorical NASA Earth textures' : scene.ready ? 'Representative geometry · not to scale\nAnimated paths are illustrative' : 'Reserved level\nViewer test object';
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
    button.innerHTML = `<span class="num">${index + 1}</span><span class="lbl"></span>`; button.querySelector('.lbl').textContent = part.title; button.classList.add('hide-lbl'); button.addEventListener('click', () => select(part.id)); $('pins').append(button);
  });
  $('card').hidden = true; updateCycle(); updatePins();
}
function updateCycle() {
  const available = partCount(ui.scene) > 1;
  for (const id of ['card-prev', 'card-next', 'part-play']) $(id).disabled = !available;
  $('part-play').setAttribute('aria-pressed', String(partCycle.playing)); $('part-play').textContent = partCycle.playing ? 'Pause' : 'Auto-cycle';
  $('part-play').title = available ? 'Cycle through the parts, holding each for 8 seconds after the camera arrives. Reading sources pauses the clock; choosing a part stops it.' : 'Available when this level has several parts';
}
export function select(id, fly = true) {
  const part = partsFor(ui.scene).find(candidate => candidate.id === id); if (!part) return;
  if (!partCycle.selecting) partCycle.stop();
  if (fly) { inspect(true); built[ui.scene]?.setMotion?.(false); emit('scene-settings'); }
  ui.selected = id; $('card').hidden = false; $('card-k').textContent = part.kicker; $('card-t').textContent = part.title; $('card-b').textContent = part.body;
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
  built[ui.scene]?.setPart?.(id); emit('scene-settings');
  const spot = hotspotsFor(ui.scene)[id]; if (fly && spot?.view) flyTo(spot.view.pos, spot.view.target);
  emit('select', id); updateCycle();
  if (fly) emit('part-inspect', id);
}
export function deselect() {
  ui.selected = null; $('card').hidden = true;
  document.querySelectorAll('#parts button, #pins button').forEach(button => { button.setAttribute('aria-pressed', 'false'); button.classList.remove('on'); });
  emit('select', null);
}
export function overview() {
  const preset = built[ui.scene]?.camera; if (!preset) return;
  partCycle.stop(); deselect(); flyTo(preset.pos, preset.target);
}
// Playback starts from the whole assembly, after the camera reaches its safe preset.
export function preparePlayback() { overview(); settle(); inspect(false); emit('scene-settings'); }
export function cycle(direction) {
  const parts = partsFor(ui.scene); if (!parts.length) return;
  const index = parts.findIndex(part => part.id === ui.selected);
  select(parts[index < 0 ? direction < 0 ? parts.length - 1 : 0 : (index + direction + parts.length) % parts.length].id);
}
const partCycle = createPartCycle({ parts: () => partsFor(ui.scene).map(part => part.id), selected: () => ui.selected, select,
  ready: () => !document.hidden && !isCameraMoving() && $('src-pop')?.hidden !== false && $('page-sheet')?.hidden !== false, changed: updateCycle });
export function setMode(mode) {
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
  }
  emit('mode', mode);
}
export async function go(index, { record = true, restore = null } = {}) {
  if (typeof index === 'string') index = store.C.SCENES.findIndex(scene => scene.id === index);
  if (!Number.isInteger(index) || index < 0 || index >= sceneCount) return;
  const firstView = ui.scene < 0;
  if (record) visits.enter(captureView(), index, isSide(index));
  built[ui.scene]?.teaching?.pause();
  const epoch = ++buildEpoch; busy = true; partCycle.stop(); $('veil').hidden = false; $('veil').classList.remove('off'); $('veil').textContent = 'Preparing the scene…';
  try {
    if (!built[index]) {
      await BUILDERS[index].preload(); if (epoch !== buildEpoch) return;
      built[index] = BUILDERS[index].build({ quality: { ...TIERS[tiers[index]], mobile }, model: store.M });
      built[index].scene.updateMatrixWorld(true);
      const start = performance.now(), builder = occupancyBuilder(built[index].solids, { maxCells: 64_000 }); builder.step();
      built[index].occupancy = builder.result; clearanceStats.builds++; clearanceStats.buildMs = performance.now() - start;
    }
    if (epoch !== buildEpoch) return;
    ui.scene = index; ui.selected = null; tween = null; renderedFlightProgress = 1;
    if (restore) ui.mode = restore.mode;
    const preset = built[index].camera; camera.position.set(...preset.pos); controls.target.set(...preset.target); camera.near = preset.near; camera.far = preset.far; controls.minDistance = preset.min; controls.maxDistance = preset.max;
    controls.update(); built[index].setMode(ui.mode); buildPanel(); resize(); emit('scene', index);
    if (restore) {
      document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === ui.mode)));
      const id = retainedPart(partsFor(index), restore.selected);
      if (id) { inspect(true); select(id, false); } else deselect();
      camera.position.fromArray(restore.position); controls.target.fromArray(restore.target); settle();
      emit('mode', ui.mode); emit('restore-pane', { ...restore.pane, restoreFocus: true });
    } else { select(partsFor(index)[0]?.id, false); if (!firstView) emit('pane-request', { pane: 'parts', reset: true }); }
    $('veil').hidden = true; emit('scene-settings');
  } catch (error) { $('veil').textContent = 'The viewer could not start. Reload to try again; the source and method pages remain available.'; throw error; }
  finally { if (epoch === buildEpoch) busy = false; }
}
export async function show({ scene = ui.scene, mode = ui.mode, part = null }) { if (modes.includes(mode)) ui.mode = mode; await go(scene, { record: false }); setMode(mode); if (part) select(part); }
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
  controls.addEventListener('start', () => { tween = null; partCycle.stop(); inspect(true); built[ui.scene]?.setMotion?.(false); emit('scene-settings'); });
  document.addEventListener('visibilitychange', () => {
    const suspended = document.hidden || $('src-pop')?.hidden === false || $('page-sheet')?.hidden === false;
    getTeaching()?.setSuspended?.(suspended); built[ui.scene]?.setSuspended?.(suspended);
  });
  new ResizeObserver(resize).observe(view);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && partCycle.playing) partCycle.stop();
    if (!stageActive() || /INPUT|SELECT|TEXTAREA/.test(event.target.tagName)) return;
    if (/^[1-6]$/.test(event.key)) void go(Number(event.key) - 1);
    else if (['l', 'd', 'h'].includes(event.key.toLowerCase())) setMode({ l: 'light', d: 'data', h: 'heat' }[event.key.toLowerCase()]);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); cycle(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  let last = performance.now();
  renderer.setAnimationLoop(now => {
    const dt = Math.max(0, (now - last) / 1000); last = now;
    const suspended = document.hidden || $('src-pop')?.hidden === false || $('page-sheet')?.hidden === false;
    getTeaching()?.setSuspended?.(suspended); built[ui.scene]?.setSuspended?.(suspended);
    if (document.hidden || ui.scene < 0 || !built[ui.scene]) return;
    const cpuStart = performance.now();
    if (tween) { const u = Math.max(0, Math.min(1, (now - tween.start) / tween.duration)); poseAt(tween, u, camera.position, controls.target); renderedFlightProgress = u; if (u >= 1) tween = null; }
    controls.update(); built[ui.scene].update(now / 1000); partCycle.tick(dt); tickers.forEach(fn => fn(now / 1000, dt)); updatePins();
    renderer.render(built[ui.scene].scene, camera);
    const cpu = performance.now() - cpuStart; if (dt < .25) { frameSamples.push(dt * 1000); cpuSamples.push(cpu); }
    frameObservers.forEach(fn => fn({ frame: dt * 1000, cpu })); govern(now);
  });
  const [level, mode, part] = (new URLSearchParams(location.search).get('view') || '').split('.');
  if (/^\d$/.test(level) && modes.includes(mode)) {
    void show({ scene: Number(level), mode, part: part || null }).then(() => {
      // A shared two-field view explicitly means Overview. Keep show()'s
      // first-card default for ordinary navigation and the test-hook contract.
      if (!part && ui.scene === Number(level) && ui.mode === mode) overview();
    });
  }
  else void go(0);
}
