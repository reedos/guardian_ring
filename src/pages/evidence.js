// The default claim register remains readable without JS. With JS, both the
// displayed rows and source dialogs follow the normalized scenario in the URL.
import '../app/sources-ui.js';
import { store, setScenario, on } from '../app/store.js';
import { SCENARIO_KEYS } from '../app/scenario-links.js';
import { allClaims } from '../claims.js';
import { renderClaimRows, scenarioLabel } from './evidence-content.js';
import { referencePager } from './reference-pager.js';

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
  let pagers = [];
  function setup() {
    const hosts = queryKey ? [...document.querySelectorAll('[data-claim-group]')] : [document.getElementById('source-register')];
    pagers = hosts.map(host => ({ host, pager: referencePager(host.querySelector('[data-reference-rows]') || host, rowSelector) }));
  }
  setup();
  function filter(updateAddress = false) {
    const query = input.value.trim().toLowerCase();
    let matches = 0;
    for (const { host, pager } of pagers) {
      const found = pager.filter(query); matches += found;
      host.hidden = !found;
      if (host instanceof HTMLDetailsElement) { host.open = !!query; host.querySelector('summary span').textContent = `${found} claims`; }
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
    setup,
    reveal(node) {
      // Only clear the search that hides this destination. A source citation
      // must not also discard the reader's independent claim search.
      const row = node.closest(rowSelector);
      if (!row) return;
      const group = pagers.find(({ pager }) => pager.contains(row));
      if (!group?.pager.reveal(row)) { input.value = ''; filter(true); group?.pager.reveal(row); }
      if (group?.host instanceof HTMLDetailsElement) group.host.open = true;
    },
  };
}
const filterClaims = connectFilter({ inputId: 'claim-search', rowSelector: '[data-claim-key]', emptyId: 'claim-empty', countId: 'claim-count', noun: 'claim', queryKey: 'q' });
const filterSources = connectFilter({ inputId: 'source-search', rowSelector: '[data-source-key]', emptyId: 'source-empty', countId: 'source-count', noun: 'source record' });
on('scenario', () => { hydrateClaims(); filterClaims?.setup(); filterClaims?.filter(); });

function revealHash(hash) {
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
  const node = document.getElementById(id);
  if (!node) return;
  if (node.matches('[data-claim-group]') && node.hidden) {
    document.getElementById('claim-search').value = '';
    filterClaims?.filter(true);
  }
  filterClaims?.reveal(node);
  filterSources?.reveal(node);
  if (node instanceof HTMLDetailsElement) node.open = true;
  for (let parent = node.parentElement; parent; parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true;
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
