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
import { moreCue } from './app/more-cue.js';

window.grx = {
  store, setScenario, pin, state: store.ui, go: stage.go, select: stage.select, setMode: stage.setMode,
  camera: stage.camera, controls: stage.controls, composers: stage.composers, built: stage.built, settle: stage.settle,
  renderer: stage.getRenderer, renderScale: stage.renderScale, quality: stage.qualityInfo, forceTier: stage.forceTier, setTransitions: stage.setTransitions,
  show: stage.show, overview: stage.overview, THREE, clearance: stage.clearanceStats, occupancy: stage.occupancy, scenarioOptions: SCENARIO_OPTIONS,
  setQualityPreference: stage.setQualityPreference, isBusy: stage.isBusy, isCameraMoving: stage.isCameraMoving,
  flightProgress: stage.getFlightProgress,
};
const animationControls = mountAnimationControls(document.getElementById('animation-controls'), { getTeaching: stage.getTeaching, preparePlayback: stage.preparePlayback });
for (const event of ['scene', 'mode', 'scene-settings']) on(event, () => animationControls.sync());
const tabs = [...document.querySelectorAll('[data-pane]')], scenario = document.getElementById('pane-scenario'), sheetButton = document.getElementById('sheet-toggle');
function setSheet(open) { document.body.style.removeProperty('--inspector-size'); document.body.classList.toggle('sheet-open', open); sheetButton.setAttribute('aria-expanded', String(open)); sheetButton.setAttribute('aria-label', open ? 'Shrink the panel' : 'Expand the panel'); }
function showPane(which, { reset = true } = {}) {
  tabs.forEach(button => { const selected = button.dataset.pane === which; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
  scenario.hidden = which !== 'scenario';
  document.querySelectorAll('.panel-scroll > :not(#pane-scenario):not(.pane-note)').forEach(element => element.classList.toggle('pane-off', which === 'scenario'));
  if (reset) document.querySelector('.panel-scroll').scrollTop = 0;
}
on('pane-request', ({ pane, reset = true }) => showPane(pane, { reset }));
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
  document.getElementById('inspector-toggle').setAttribute('aria-expanded', String(!saved.collapsed));
  document.getElementById('inspector-toggle').textContent = saved.collapsed ? 'Show details' : 'Hide details';
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
tabs.forEach((button, index) => {
  button.addEventListener('click', () => { showPane(button.dataset.pane); if (button.dataset.pane === 'scenario') setSheet(true); });
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].click(); tabs[next].focus();
  });
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
sheetButton.addEventListener('pointerdown', event => {
  if (!matchMedia('(max-width: 1100px)').matches) return;
  sheetDrag = { y: event.clientY, height: document.getElementById('inspector').getBoundingClientRect().height }; dragged = false; sheetButton.setPointerCapture(event.pointerId);
});
sheetButton.addEventListener('pointermove', event => {
  if (!sheetDrag) return;
  const delta = sheetDrag.y - event.clientY; if (Math.abs(delta) > 5) dragged = true; if (!dragged) return;
  const height = Math.max(150, Math.min(innerHeight * .62, sheetDrag.height + delta));
  document.body.style.setProperty('--inspector-size', `${height}px`);
  const open = height > innerHeight * .35; document.body.classList.toggle('sheet-open', open); sheetButton.setAttribute('aria-expanded', String(open)); sheetButton.setAttribute('aria-label', open ? 'Shrink the panel' : 'Expand the panel');
});
sheetButton.addEventListener('pointerup', () => { sheetDrag = null; });
sheetButton.addEventListener('pointercancel', () => { sheetDrag = null; dragged = false; });
sheetButton.addEventListener('click', () => { if (!dragged) setSheet(!document.body.classList.contains('sheet-open')); dragged = false; });
if (new URLSearchParams(location.search).get('pane') === 'scenario') { showPane('scenario'); setSheet(true); }
stage.start();
