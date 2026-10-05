// Keep the complete prerendered reference in the document. Pagination is a
// progressive enhancement; citation fragments can always reveal their page.
export function referencePager(host, selector, { size = 12 } = {}) {
  const rows = [...host.querySelectorAll(selector)];
  const nav = document.createElement('nav'); nav.className = 'reference-pager'; nav.setAttribute('aria-label', 'Reference result pages');
  const previous = document.createElement('button'), next = document.createElement('button'), status = document.createElement('span');
  previous.type = next.type = 'button'; previous.className = next.className = 'btn';
  previous.textContent = 'Previous page'; next.textContent = 'Next page'; status.setAttribute('role', 'status');
  nav.append(previous, status, next); host.append(nav);
  let matches = rows, page = 0;
  function render() {
    const pages = Math.max(1, Math.ceil(matches.length / size)); page = Math.min(page, pages - 1);
    const visible = new Set(matches.slice(page * size, (page + 1) * size));
    for (const row of rows) row.hidden = !visible.has(row);
    previous.disabled = page === 0; next.disabled = page === pages - 1;
    nav.hidden = matches.length <= size; status.textContent = `Page ${page + 1} of ${pages}`;
  }
  function turn(delta) { page += delta; render(); (host.closest('details')?.querySelector('summary') || host).scrollIntoView({ block: 'start' }); }
  previous.addEventListener('click', () => turn(-1)); next.addEventListener('click', () => turn(1));
  return {
    filter(query) { matches = rows.filter(row => row.dataset.search.includes(query)); page = 0; render(); return matches.length; },
    reveal(node) { const row = node.closest(selector); const index = matches.indexOf(row); if (index < 0) return false; page = Math.floor(index / size); render(); return true; },
    contains(node) { return rows.includes(node.closest(selector)); },
  };
}
