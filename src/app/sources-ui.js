// Source popovers. A basis chip with data-src names one claim (src/claims.js); its popover says what the label means
// and what backs that one figure: each source with where in it the figure is, when it was published and when it was
// checked; or how the model calculates it; or what the model assumes and why.
import { SOURCES } from '../sources.js';
import { BASIS, CALCS, ASSUMPTIONS } from '../evidence.js';
import { resolveSourceClaim, sourceScenarioSearch } from './source-claim.js';
import { scenarioSummary } from './comparison.js';
import { store, on } from './store.js';

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const pop = document.createElement('div');
pop.className = 'src-pop'; pop.id = 'src-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Sources'); pop.hidden = true;
document.body.appendChild(pop);
let opener = null;

// the method page, keeping the reader's scenario
const methodLink = (hash, text, search, fixed) => `<a href="method.html?${esc(search)}#${hash}"${fixed}>${text}</a>`;
const dated = s => [s.published && `published ${esc(s.published)}`, s.accessed && `checked ${esc(s.accessed)}`].filter(Boolean).join(' · ');
const refItem = ([id, at]) => {
  const s = SOURCES[id]; if (!s) return '';
  return `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a><span>${esc(s.publisher)}${at ? ` · ${esc(at)}` : ''}</span>${dated(s) ? `<span class="sp-d">${dated(s)}</span>` : ''}</li>`;
};

function body(key) {
  const c = resolveSourceClaim(store, key);
  const search = sourceScenarioSearch(store, key, location.search), fixed = c?.pinned ? ' data-scenario-fixed' : '';
  const basis = c?.basis && BASIS[c.basis] ? c.basis : 'assumed', b = BASIS[basis], ev = c?.ev;
  const head = `<div class="sp-head"><span class="chip ${basis}">${b.short}</span><b>${b.label}</b><button type="button" class="sp-x" aria-label="Close">×</button></div>
    ${c ? `<p class="sp-claim">${esc(c.label)}${c.value ? `: <b>${esc(c.value)}</b>` : ''}</p>` : ''}${c?.pinned ? `<p class="sp-note">Pinned choices: ${esc(scenarioSummary(store.pinned))}</p>` : ''}<p class="sp-mean">${b.meaning}</p>`;
  if (ev) {
    let html = head;
    if (ev.vs) html += `<p class="sp-note">Compared with: ${esc(ev.vs)}</p>`;
    if (ev.calc && CALCS[ev.calc]) html += `<p class="sp-k">How it is calculated</p><p class="sp-note" data-calc="${esc(ev.calc)}">${esc(CALCS[ev.calc].how)} ${methodLink(`calc-${ev.calc}`, 'Method', search, fixed)}</p>`;
    if (ev.assume && ASSUMPTIONS[ev.assume]) { const a = ASSUMPTIONS[ev.assume]; html += `<p class="sp-k">What the model assumes</p><p class="sp-note" data-assume="${esc(ev.assume)}">${esc(a.title)}: ${esc(a.value)}. ${esc(a.why)} ${methodLink(`assume-${ev.assume}`, 'Method', search, fixed)}</p>`; }
    if (ev.refs?.length) html += `<p class="sp-k">${ev.calc ? 'Its published inputs' : 'Sources for this figure'}</p><ul>${ev.refs.map(refItem).join('')}</ul>`;
    if (c?.label) { const query = new URLSearchParams(search); query.set('q', c.label); html += `<p class="sp-all"><a href="evidence.html?${esc(query.toString())}"${fixed}>Claims like it on the Evidence page</a></p>`; }
    return html;
  }
  return head + '<p class="sp-k">Not traced to a source, a calculation or an assumption.</p>';
}

// Prefer the space beside the chip, then clamp the scrollable dialog into the viewport.
// A tall source record may fit neither above nor below a chip in the middle of the screen.
function place(chip) {
  const r = chip.getBoundingClientRect(), w = Math.min(380, innerWidth - 24);
  pop.style.width = `${w}px`;
  const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
  const below = r.bottom + 8, h = pop.offsetHeight;
  pop.style.left = `${left}px`;
  const preferred = below + h > innerHeight - 12 && r.top - h - 8 >= 12 ? r.top - h - 8 : below;
  pop.style.top = `${Math.max(12, Math.min(innerHeight - h - 12, preferred))}px`;
}
const more = () => pop.classList.toggle('has-more', pop.scrollHeight - pop.clientHeight - pop.scrollTop > 8);
pop.addEventListener('scroll', more, { passive: true });
function open(chip) {
  if (opener && opener !== chip) opener.setAttribute('aria-expanded','false');
  pop.innerHTML = body(chip.dataset.src);
  pop.hidden = false;
  place(chip);
  // Reset after layout: a hidden element may retain its old scroll position.
  pop.scrollTop = 0;
  more();
  opener = chip; chip.setAttribute('aria-expanded', 'true');
  pop.querySelector('.sp-x').addEventListener('click', close);
  pop.querySelector('a, .sp-x')?.focus({ preventScroll: true });
}
function close() {
  if (pop.hidden) return;
  pop.hidden = true;
  if (opener) { opener.setAttribute('aria-expanded', 'false'); if (pop.contains(document.activeElement) || document.activeElement === document.body) opener.focus({ preventScroll: true }); }
  opener = null;
}
// Auto-cycle and model changes can replace the opener without any scroll event.
// Close synchronously with the state change so evidence never outlives its claim.
for (const event of ['select', 'mode', 'scene', 'scenario', 'pin', 'reference-open']) on(event, close);
// capture phase, so a chip inside a linked row opens its sources instead of following the row's link
document.addEventListener('click', e => {
  const chip = e.target.closest?.('[data-src]');
  if (chip) { e.preventDefault(); e.stopPropagation(); if (opener === chip) close(); else open(chip); return; }
  if (!pop.contains(e.target)) close();
}, true);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || pop.hidden) return;
  // Consume the topmost dialog's Escape before an enclosing reference sheet.
  e.preventDefault(); e.stopPropagation(); close();
});
// a scroll moves the popover with its chip, whether the reader scrolled or a tour step scrolled the column on its own;
// it closes only once the chip is off screen or gone
function follow() {
  if (pop.hidden || !opener) return;
  const r = opener.getBoundingClientRect();
  if (!opener.isConnected || !r.width || r.bottom < 0 || r.top > innerHeight) close(); else place(opener);
}
addEventListener('scroll', follow, { passive: true });
addEventListener('resize', close);
document.getElementById('parts')?.closest('.panel-scroll')?.addEventListener('scroll', follow, { passive: true });
