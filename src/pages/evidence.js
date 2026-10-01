// The default claim register remains readable without JS. With JS, both the
// displayed rows and source dialogs follow the normalized scenario in the URL.
import '../app/sources-ui.js';
import { store, setScenario, on } from '../app/store.js';
import { SCENARIO_KEYS } from '../app/scenario-links.js';
import { allClaims } from '../claims.js';
import { renderClaimRows, scenarioLabel } from './evidence-content.js';

const query = new URLSearchParams(location.search);
const patch = Object.fromEntries(SCENARIO_KEYS.filter(key => query.has(key)).map(key => [key, query.get(key)]));
setScenario(patch);

function hydrateClaims() {
  const register = document.getElementById('claim-register');
  if (!register) return;
  // Replace the entire register: some choices remove claims (for example, the
  // unavailable civil aperture) or change their labels as well as their values.
  register.innerHTML = renderClaimRows(allClaims(store.M, store.C), { current: true });
  document.getElementById('claim-scenario').textContent = `Current teaching choices: ${scenarioLabel(store.scenario)}`;
  register.dataset.scenarioView = 'current';
}
hydrateClaims();

function connectFilter({ inputId, rowSelector, emptyId, countId, noun, queryKey }) {
  const input = document.getElementById(inputId);
  const empty = document.getElementById(emptyId);
  const count = document.getElementById(countId);
  if (!input || !empty || !count) return;
  if (queryKey) input.value = new URLSearchParams(location.search).get(queryKey) || '';
  function filter(updateAddress = false) {
    const query = input.value.trim().toLowerCase();
    let matches = 0;
    for (const row of document.querySelectorAll(rowSelector)) {
      row.hidden = !row.dataset.search.includes(query);
      if (!row.hidden) matches++;
    }
    empty.hidden = matches > 0;
    count.textContent = `${matches} ${noun}${matches === 1 ? '' : 's'}${query ? ' found' : ''}`;
    if (updateAddress && queryKey) {
      const params = new URLSearchParams(location.search);
      if (input.value.trim()) params.set(queryKey, input.value.trim()); else params.delete(queryKey);
      history.replaceState(null, '', `${location.pathname}${params.size ? `?${params}` : ''}${location.hash}`);
    }
  }
  input.addEventListener('input', () => filter(true));
  filter();
  return filter;
}
const filterClaims = connectFilter({ inputId: 'claim-search', rowSelector: '[data-claim-key]', emptyId: 'claim-empty', countId: 'claim-count', noun: 'claim', queryKey: 'q' });
connectFilter({ inputId: 'source-search', rowSelector: '[data-source-key]', emptyId: 'source-empty', countId: 'source-count', noun: 'source record' });
on('scenario', () => { hydrateClaims(); filterClaims?.(); });
