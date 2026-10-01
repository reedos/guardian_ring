// Claims and sources are prerendered by tools/write-pages.mjs. Search only filters
// their existing rows, so the complete evidence remains readable without JS.
import '../app/sources-ui.js';

function connectFilter({ inputId, rowSelector, emptyId, countId, noun, queryKey }) {
  const input = document.getElementById(inputId);
  const rows = [...document.querySelectorAll(rowSelector)];
  const empty = document.getElementById(emptyId);
  const count = document.getElementById(countId);
  if (!input || !empty || !count) return;
  if (queryKey) input.value = new URLSearchParams(location.search).get(queryKey) || '';
  function filter(updateAddress = false) {
    const query = input.value.trim().toLowerCase();
    let matches = 0;
    for (const row of rows) {
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
}
connectFilter({ inputId: 'claim-search', rowSelector: '[data-claim-key]', emptyId: 'claim-empty', countId: 'claim-count', noun: 'claim', queryKey: 'q' });
connectFilter({ inputId: 'source-search', rowSelector: '[data-source-key]', emptyId: 'source-empty', countId: 'source-count', noun: 'source record' });
