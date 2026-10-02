import { SCENARIO_OPTIONS } from '../model/engine.ts';
import { store, setScenario, pin, on } from './store.js';
import { renderMath } from './math-view.js';
import { renderComparison, scenarioSummary } from './comparison.js';
import { learningFor } from '../learning-content.js';
import { go, setMode, select } from './stage.js';
const root = document.getElementById('scenario-controls');
const labels = { orbit: 'Orbit geometry', aperture: 'Optics example', band: 'Teaching wavelength interval', detector: 'Detector reference topic' };
const notes = {
  orbit: 'Changes the teaching orbit period, distance, and one-way vacuum light time.',
  band: 'Changes photon energy, the ideal diffraction angle, and the slice of the ideal spectrum.',
  aperture: 'The laboratory example uses its stated assumed aperture. The civil reference has no verified aperture here, so it supplies no diffraction result.',
  detector: 'Reference only. These material names change no calculated output, hardware drawing, or operating temperature. Read a named civil instrument for its actual specifications.',
};
const query = new URLSearchParams(location.search), patch = {};
for (const key of Object.keys(SCENARIO_OPTIONS)) if (query.has(key)) patch[key] = query.get(key);
setScenario(patch);
for (const key of ['orbit', 'band', 'aperture', 'detector']) {
  const group = document.createElement('div'); group.className = 'sc-group';
  const label = document.createElement('span'); label.className = 'lab'; label.textContent = labels[key];
  const note = document.createElement('p'); note.className = 'sc-input-note'; note.id = `sc-${key}-note`; note.textContent = notes[key];
  const segment = document.createElement('div'); segment.className = 'sc-seg'; segment.id = `sc-${key}`; segment.setAttribute('role', 'group'); segment.setAttribute('aria-label', labels[key]); segment.setAttribute('aria-describedby', note.id);
  for (const option of SCENARIO_OPTIONS[key]) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.choice = key; button.dataset.value = option.id;
    button.textContent = key === 'aperture' ? option.id === 'representative' ? 'Ideal laboratory' : 'Civil reference' : option.label;
    button.addEventListener('click', () => {
      setScenario({ [key]: option.id });
      const id = key === 'orbit' ? 'lightTimeSeconds' : key === 'band' ? 'photonEnergyJ' : 'diffractionRadians';
      const row = store.M.claims[id];
      document.getElementById('scenario-announcement').textContent = key === 'detector' ? `${option.label} reference selected. Calculated results are unchanged.` : row ? `${row[0]}: ${row[1]}. Results updated; your selected part and view are unchanged.` : 'Civil aperture unavailable. No diffraction result is supplied. Your selected part and view are unchanged.';
    }); segment.append(button);
  }
  group.append(label, segment, note);
  if (key === 'detector') {
    const link = document.createElement('a'); link.href = 'visualizer.html?view=8.light.arrays'; link.textContent = 'Explore the published TIRS-2 detector →';
    link.addEventListener('click', async event => { event.preventDefault(); await go(8); if (store.ui.scene === 8) { setMode('light'); select('arrays'); } });
    group.append(link);
  }
  root.append(group);
}
function sync() {
  document.querySelectorAll('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(store.scenario[button.dataset.choice] === button.dataset.value)));
  document.getElementById('pane-sum').textContent = `${store.scenario.orbit.toUpperCase()} · ${store.scenario.band.toUpperCase()}`;
  const query = new URLSearchParams(location.search); for (const [key, value] of Object.entries(store.scenario)) query.set(key, value);
  history.replaceState(null, '', `${location.pathname}?${query}${location.hash}`);
  const scroller = document.querySelector('.panel-scroll'), scroll = scroller.scrollTop;
  showMath(); showComparison(); scroller.scrollTop = scroll;
}
const lab = document.getElementById('physics-results');
lab.addEventListener('click', event => {
  const input = event.target.closest('[data-adjust]')?.dataset.adjust;
  if (!input) return;
  document.getElementById('scenario-adjust').open = true;
  const button = root.querySelector(`[data-choice="${input}"][aria-pressed="true"]`);
  button?.scrollIntoView({ block: 'nearest' }); button?.focus({ preventScroll: true });
});
function showMath() {
  const opened = [...lab.querySelectorAll('details[open]')].map(node => node.dataset.mathWork);
  lab.innerHTML = `<div id="math-results">${renderMath(store.M)}</div><a href="method.html#calculations">All formulas and assumptions →</a>`;
  for (const node of lab.querySelectorAll('details')) node.open = opened.includes(node.dataset.mathWork);
  highlightContext();
}
function highlightContext(experiment) {
  const context = experiment || learningFor(store.C.SCENES[store.ui.scene]?.id, store.ui.mode)?.experiment || 'orbit';
  for (const section of lab.querySelectorAll('[data-math-section]')) {
    section.classList.toggle('math-current', section.dataset.mathSection === context);
    section.querySelector('.math-context-tag').hidden = section.dataset.mathSection !== context;
  }
}
const compare = document.getElementById('sc-pin');
const comparison = document.createElement('section'); comparison.id = 'sc-comparison'; comparison.className = 'scenario-comparison'; comparison.setAttribute('aria-labelledby', 'sc-comparison-title'); comparison.hidden = true;
compare.closest('.sc-compare').after(comparison);
function showComparison() {
  const pinned = store.pinned;
  compare.setAttribute('aria-pressed', String(!!pinned)); compare.textContent = pinned ? 'Unpin scenario' : 'Pin to compare';
  document.getElementById('sc-pinned').textContent = pinned ? `Pinned choices: ${scenarioSummary(pinned)}` : 'Save these results, then change an input.';
  comparison.hidden = !pinned; comparison.innerHTML = renderComparison(store.M, pinned);
}
compare.addEventListener('click', () => pin(!store.pinned));
on('pin', showComparison);
on('scene', () => highlightContext()); on('mode', () => highlightContext()); on('experiment', highlightContext);
on('scenario', sync); sync();
