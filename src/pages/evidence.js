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
  return {
    filter,
    reveal(node) {
      // Only clear the search that hides this destination. A source citation
      // must not also discard the reader's independent claim search.
      const row = node.closest(rowSelector);
      if (!row?.hidden) return;
      input.value = '';
      filter(true);
    },
  };
}
const filterClaims = connectFilter({ inputId: 'claim-search', rowSelector: '[data-claim-key]', emptyId: 'claim-empty', countId: 'claim-count', noun: 'claim', queryKey: 'q' });
const filterSources = connectFilter({ inputId: 'source-search', rowSelector: '[data-source-key]', emptyId: 'source-empty', countId: 'source-count', noun: 'source record' });
on('scenario', () => { hydrateClaims(); filterClaims?.filter(); });

function revealHash(hash) {
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
  const node = document.getElementById(id);
  if (!node) return;
  filterClaims?.reveal(node);
  filterSources?.reveal(node);
  node.scrollIntoView();
}
// A same-hash click does not dispatch hashchange, so handle it as well. Leave
// native fragment navigation intact after revealing its destination.
document.addEventListener('click', event => {
  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest?.('a[href]');
  if (!link) return;
  // The embedded reference shell rewrites fragments to same-page URLs before
  // this listener runs. Accept both forms, including repeated same-hash links.
  const url = new URL(link.getAttribute('href'), location.href);
  if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
    revealHash(url.hash);
    // Clearing a search can change the query. Keep the native jump in this
    // document rather than reloading an embedded URL with the stale filter.
    link.setAttribute('href', url.hash);
  }
});
addEventListener('hashchange', () => revealHash(location.hash));
if (location.hash) requestAnimationFrame(() => revealHash(location.hash));
