import { SCENARIO_OPTIONS } from '../model/engine.ts';
import { store, setScenario, pin, on } from './store.js';
import { renderMath } from './math-view.js';
const root = document.getElementById('scenario-controls');
const labels = { orbit: 'Teaching orbit', aperture: 'Optics example', band: 'Teaching band', detector: 'Detector material' };
const query = new URLSearchParams(location.search), patch = {};
for (const key of Object.keys(SCENARIO_OPTIONS)) if (query.has(key)) patch[key] = query.get(key);
setScenario(patch);
for (const [key, options] of Object.entries(SCENARIO_OPTIONS)) {
  const group = document.createElement('div'); group.className = 'sc-group';
  const label = document.createElement('span'); label.className = 'lab'; label.textContent = labels[key];
  const segment = document.createElement('div'); segment.className = 'sc-seg'; segment.id = `sc-${key}`; segment.setAttribute('role', 'group'); segment.setAttribute('aria-label', labels[key]);
  for (const option of options) {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.choice = key; button.dataset.value = option.id; button.textContent = option.label;
    button.addEventListener('click', () => setScenario({ [key]: option.id })); segment.append(button);
  }
  group.append(label, segment); root.append(group);
}
function sync() {
  document.querySelectorAll('[data-choice]').forEach(button => button.setAttribute('aria-pressed', String(store.scenario[button.dataset.choice] === button.dataset.value)));
  document.getElementById('pane-sum').textContent = `${store.scenario.orbit.toUpperCase()} · ${store.scenario.band.toUpperCase()}`;
  const query = new URLSearchParams(location.search); for (const [key, value] of Object.entries(store.scenario)) query.set(key, value);
  history.replaceState(null, '', `${location.pathname}?${query}${location.hash}`);
  showMath();
}
const lab = document.createElement('section'); lab.className = 'scenario-lab';
lab.innerHTML = '<h3>Show the math</h3><p class="note">Follow the chosen inputs through three independent examples. They do not specify the spacecraft in the drawing.</p><div id="math-results"></div><div class="math-detector-note"><h4>What detector choice means here</h4><p class="note" id="math-gap"></p></div><a href="method.html#calculations">All formulas and assumptions →</a>';
root.after(lab);
function showMath() {
  lab.querySelector('#math-results').innerHTML = renderMath(store.M);
  lab.querySelector('#math-gap').textContent = store.M.unavailable.detectorTemperature;
}
const compare = document.getElementById('sc-pin');
compare.addEventListener('click', () => pin(!store.pinned));
on('pin', () => { compare.setAttribute('aria-pressed', String(!!store.pinned)); compare.textContent = store.pinned ? 'Unpin scenario' : 'Pin to compare'; document.getElementById('sc-pinned').textContent = store.pinned ? `Pinned choices: ${store.pinned.scenario.orbit.toUpperCase()} · ${store.pinned.scenario.band.toUpperCase()} · ${store.pinned.scenario.detector}` : ''; });
on('scenario', sync); sync();
