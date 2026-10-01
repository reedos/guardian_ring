import { SCENARIO_OPTIONS } from '../model/engine.ts';
import { store, setScenario, pin, on } from './store.js';
const root = document.getElementById('scenario-controls');
const labels = { orbit: 'Orbit', aperture: 'Aperture', band: 'Band', detector: 'Detector' };
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
}
const compare = document.getElementById('sc-pin');
compare.addEventListener('click', () => pin(!store.pinned));
on('pin', () => { compare.setAttribute('aria-pressed', String(!!store.pinned)); compare.textContent = store.pinned ? 'Unpin scenario' : 'Pin to compare'; document.getElementById('sc-pinned').textContent = store.pinned ? 'Choices saved; physical outputs are deferred.' : ''; });
on('scenario', sync); sync();
