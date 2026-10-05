import './app/entry-location.js';
import { store, setScenario, pin, on } from './app/store.js';
import * as stage from './app/stage.js';
import { THREE } from './kit.js';
import { SCENARIO_OPTIONS } from './model/engine.ts';
import './app/scenario.js';
import './app/share.js';
import './app/sources-ui.js';
import './app/site.js';
import './app/toprow.js';
import './app/orbit-controls.js';
import './app/view-controls.js';
import './app/page-sheet.js';
import './app/learning-journey.js';
import { mountAnimationControls } from './app/animation-controls.js';
import { mountFocusDemo } from './app/focus-demo.js';
import { mountSceneKey } from './app/scene-key.js';
import { mountMissionTour } from './app/mission-tour.js';
import { moreCue } from './app/more-cue.js';
import { measureInspectorLimits, mountInspectorLayout, inspectorDragExpanded } from './app/inspector-layout.js';

window.grx = {
  store, setScenario, pin, state: store.ui, go: stage.go, select: stage.select, setMode: stage.setMode,
  camera: stage.camera, controls: stage.controls, composers: stage.composers, built: stage.built, settle: stage.settle,
  renderer: stage.getRenderer, renderScale: stage.renderScale, quality: stage.qualityInfo, forceTier: stage.forceTier, setTransitions: stage.setTransitions,
  show: stage.show, overview: stage.overview, THREE, clearance: stage.clearanceStats, occupancy: stage.occupancy, scenarioOptions: SCENARIO_OPTIONS,
  setQualityPreference: stage.setQualityPreference, isBusy: stage.isBusy, isCameraMoving: stage.isCameraMoving,
  flightProgress: stage.getFlightProgress, stepTeaching:stage.stepTeaching, setSceneActivity:stage.setSceneActivity,
  setAssemblyView:stage.setAssemblyView,
  setOrbitFollow:stage.setOrbitFollow,orbitFollow:stage.orbitFollow,
};
let focusDemo;
window.grx.mission = mountMissionTour({openFocusDemo:()=>focusDemo.open()});
focusDemo=mountFocusDemo({beforeOpen(){window.grx.mission.pause();stage.setActivityEnabled(false);stage.getTeaching()?.pause();}});
window.grx.focusDemo=focusDemo;
const animationControls = mountAnimationControls(document.getElementById('animation-controls'), { getTeaching: stage.getTeaching, preparePlayback: stage.preparePlayback, stepTeaching:stage.stepTeaching, getAssemblyPresentation:stage.getAssemblyPresentation,setAssemblyView:stage.setAssemblyView,setActivityEnabled:stage.setActivityEnabled,openFocusDemo:()=>focusDemo.open() });
mountSceneKey();
mountInspectorLayout();
for (const event of ['scene', 'mode', 'scene-settings']) on(event, () => animationControls.sync());
const tabs = [...document.querySelectorAll('[data-pane]')], scenario = document.getElementById('pane-scenario'), sheetButton = document.getElementById('sheet-toggle');
const tryIt=document.getElementById('try-it');let requestedPane='parts';
document.getElementById('learning-guide').after(tryIt);
const hasExperiment=()=>['orbits','pixel','atmosphere'].includes(store.C.SCENES[store.ui.scene]?.id);
function setSheet(open) { document.body.style.removeProperty('--inspector-size'); document.body.classList.toggle('sheet-open', open); sheetButton.setAttribute('aria-expanded', String(open));if(matchMedia('(max-width:760px)').matches)document.getElementById('tab-parts').setAttribute('aria-expanded',String(open)); sheetButton.setAttribute('aria-label', open ? 'Shrink the panel' : 'Expand the panel'); }
function showPane(which, { reset = true } = {}) {
  requestedPane=which;tryIt.hidden=!hasExperiment();tryIt.open=which==='scenario'&&!tryIt.hidden;
  scenario.hidden=!tryIt.open;
  if (reset) document.querySelector('.panel-scroll').scrollTop = 0;
}
tryIt.addEventListener('toggle',()=>{scenario.hidden=!tryIt.open;requestedPane=tryIt.open?'scenario':'parts';});
on('scene',()=>showPane(requestedPane,{reset:false}));
on('pane-request', ({ pane, reset = true, expand = false }) => {showPane(pane, { reset });if(expand&&matchMedia('(max-width:760px)').matches)setSheet(true);});
on('experiment', experiment => {
  showPane('scenario'); setSheet(true);
  requestAnimationFrame(() => {
    const section = document.querySelector(`[data-math-section="${experiment}"]`);
    section?.scrollIntoView({ block: 'nearest' });
    section?.querySelector('summary')?.focus({ preventScroll: true });
  });
});
on('restore-pane', saved => {
  showPane(saved.pane, { reset: false });
  setSheet(saved.expanded);
  if (saved.size) document.body.style.setProperty('--inspector-size', saved.size);
  document.body.classList.toggle('inspector-collapsed', saved.collapsed);
  for (const details of document.querySelectorAll('#card-components details')) details.open = saved.details.includes(details.dataset.component);
  document.querySelector('.panel-scroll').scrollTop = saved.scroll;
  if (saved.restoreFocus) {
    const candidates = [...document.querySelectorAll('button, select, a[href]')];
    const previous = candidates.find(node => saved.focus?.id && node.id === saved.focus.id)
      || candidates.find(node => saved.focus?.level && node.dataset.level === saved.focus.level && node.checkVisibility())
      || candidates.find(node => saved.focus?.part && node.dataset.id === saved.focus.part && node.checkVisibility());
    (previous?.checkVisibility() ? previous : document.getElementById('part-select')).focus({ preventScroll: true });
  }
});
tabs.forEach(button => {
  button.addEventListener('click', () => { showPane(button.dataset.pane); if (button.dataset.pane === 'scenario') setSheet(true);else if(!dragged&&matchMedia('(max-width:760px)').matches)setSheet(!document.body.classList.contains('sheet-open'));dragged=false; });
});
const scroller = document.querySelector('.panel-scroll');
moreCue(scroller, { host: document.getElementById('inspector'), label: () => {
  if (!scenario.hidden) return 'More';
  const fold = scroller.getBoundingClientRect().bottom - 24;
  const below = [...document.querySelectorAll('#parts button[data-id]')].filter(button => button.getBoundingClientRect().top > fold).length;
  return below ? `${below} more part${below === 1 ? '' : 's'}` : 'More';
}, press: () => { if (matchMedia('(max-width: 1100px)').matches && !document.body.classList.contains('sheet-open')) { setSheet(true); return true; } return false; } });
document.getElementById('card-more').addEventListener('click', () => setSheet(true));
let sheetDrag = null, dragged = false;
for(const handle of [sheetButton,document.getElementById('tab-parts')])handle.addEventListener('pointerdown', event => {
  if (!matchMedia('(max-width: 1100px)').matches) return;
  sheetDrag = { y: event.clientY, height: document.getElementById('inspector').getBoundingClientRect().height }; dragged = false; event.currentTarget.setPointerCapture(event.pointerId);
});
for(const handle of [sheetButton,document.getElementById('tab-parts')])handle.addEventListener('pointermove', event => {
  if (!sheetDrag) return;
  const delta = sheetDrag.y - event.clientY; if (Math.abs(delta) > 5) dragged = true; if (!dragged) return;
  const limits = measureInspectorLimits();
  const height = Math.max(Math.min(limits.minimum,48), Math.min(limits.maximum, sheetDrag.height + delta));
  document.body.style.setProperty('--inspector-size', `${height}px`);
  const open = inspectorDragExpanded(height); document.body.classList.toggle('sheet-open', open); sheetButton.setAttribute('aria-expanded', String(open));if(matchMedia('(max-width:760px)').matches)document.getElementById('tab-parts').setAttribute('aria-expanded',String(open)); sheetButton.setAttribute('aria-label', open ? 'Shrink the panel' : 'Expand the panel');
});
for(const handle of [sheetButton,document.getElementById('tab-parts')])handle.addEventListener('pointerup', () => { sheetDrag = null; });
for(const handle of [sheetButton,document.getElementById('tab-parts')])handle.addEventListener('pointercancel', () => { sheetDrag = null; dragged = false; });
sheetButton.addEventListener('click', () => { if (!dragged) setSheet(!document.body.classList.contains('sheet-open')); dragged = false; });
if (new URLSearchParams(location.search).get('pane') === 'scenario') { showPane('scenario'); setSheet(true); }
const motion=document.getElementById('activity-motion');
motion.checked=!stage.reduced;
motion.addEventListener('change',()=>{if(!motion.checked)window.grx.mission.pause();stage.setSceneActivity(motion.checked);});
for(const name of ['scene','scene-settings'])on(name,()=>{motion.checked=!!(stage.getTeaching()?.state().playing||stage.built[stage.destination()]?.motion?.());});
stage.onTick(()=>{const playing=!!(stage.getTeaching()?.state().playing||stage.built[stage.destination()]?.motion?.());if(motion.checked!==playing)motion.checked=playing;});
stage.start();
