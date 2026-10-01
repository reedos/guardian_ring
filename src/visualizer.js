import { store, setScenario, pin } from './app/store.js';
import * as stage from './app/stage.js';
import { THREE } from './kit.js';
import { SCENARIO_OPTIONS } from './model/engine.ts';
import './app/scenario.js';
import './app/share.js';
import './app/sources-ui.js';
import './app/site.js';
import './app/toprow.js';
import './app/orbit-controls.js';

window.grx = {
  store, setScenario, pin, state: store.ui, go: stage.go, select: stage.select, setMode: stage.setMode,
  camera: stage.camera, controls: stage.controls, composers: stage.composers, built: stage.built, settle: stage.settle,
  renderer: stage.getRenderer, renderScale: stage.renderScale, quality: stage.qualityInfo, forceTier: stage.forceTier, setTransitions: stage.setTransitions,
  show: stage.show, THREE, clearance: stage.clearanceStats, occupancy: stage.occupancy, scenarioOptions: SCENARIO_OPTIONS,
  setQualityPreference: stage.setQualityPreference, isBusy: stage.isBusy, isCameraMoving: stage.isCameraMoving,
};
stage.start();
const tabs = [...document.querySelectorAll('[data-pane]')], scenario = document.getElementById('pane-scenario'), sheetButton = document.getElementById('sheet-toggle');
function setSheet(open) { document.body.classList.toggle('sheet-open', open); sheetButton.setAttribute('aria-expanded', String(open)); sheetButton.setAttribute('aria-label', open ? 'Shrink the panel' : 'Expand the panel'); }
function showPane(which) {
  tabs.forEach(button => { const selected = button.dataset.pane === which; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
  scenario.hidden = which !== 'scenario';
  document.querySelectorAll('.panel-scroll > :not(#pane-scenario):not(.pane-note)').forEach(element => element.classList.toggle('pane-off', which === 'scenario'));
  document.querySelector('.panel-scroll').scrollTop = 0;
}
tabs.forEach((button, index) => {
  button.addEventListener('click', () => { showPane(button.dataset.pane); if (button.dataset.pane === 'scenario') setSheet(true); });
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].click(); tabs[next].focus();
  });
});
sheetButton.addEventListener('click', () => setSheet(!document.body.classList.contains('sheet-open')));
