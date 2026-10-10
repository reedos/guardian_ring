// Runs unchanged in the browser and in the synthetic DOM regression fixture.
export function collectPageClaims(document) {
  const selector='p,li,dt,dd,td,th,h1,h2,h3,h4,figcaption,button,label';
  const containers='p,li,dt,dd,td,th,h1,h2,h3,h4,figcaption,label';
  return [...document.querySelectorAll(selector)].filter(el=>{
    // Inline evidence buttons do not replace their containing sentence.
    if(el.matches('button')&&el.closest(containers))return false;
    // Keep a structural leaf, while allowing its inline buttons and links.
    return !el.querySelector(containers);
  }).map(el=>{
    const clone=el.cloneNode(true);
    clone.querySelectorAll('button[data-src]').forEach(button=>button.remove());
    const owner=el.closest('tr,article,section,li')||el.parentElement;
    const inline=[...el.querySelectorAll('[data-src]')];
    return {text:clone.textContent.replace(/\s+/g,' ').trim(),
      contextId:el.closest('article[id],section[id],tr[id]')?.id||'',
      links:[...el.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
      keys:[...new Set((inline.length?inline:[...owner.querySelectorAll('[data-src]')]).map(e=>e.dataset.src))]};
  }).filter(row=>/\d|\bbecause\b/i.test(row.text));
}

export function classifyPageRow(row, reviews) {
  const record=reviews.find(review=>review.page===row.page&&review.text===row.text&&
    (review.contextId||'')===(row.contextId||'')&&
    JSON.stringify(review.links||[])===JSON.stringify(row.links||[])&&
    JSON.stringify([...review.keys].sort())===JSON.stringify([...row.keys].sort()));
  if(!record)return {status:'unreviewed',basis:'No exact reviewed text/evidence match'};
  if(!['confirmed','footnoted','ui-label'].includes(record.status)||!record.basis?.trim())
    return {status:'unreviewed',basis:'Review must name supporting references or a specific UI-label exemption'};
  return {status:record.status,basis:record.basis};
}
