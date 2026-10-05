// The visualizer's top row: the level picker (phones) and the one "⋯" menu, each a button that opens a panel under
// it. A panel closes on Escape (focus goes back to its button), on a tap outside it, or once one of its choices is
// made. On phones the layer switch joins this row too, so nothing but pins and the scale sit over the view.
const $ = id => document.getElementById(id);
const pops = [['level-pick', 'level-menu'], ['more-btn', 'more-menu']].map(([b, m]) => ({ btn: $(b), menu: $(m) })).filter(p => p.btn && p.menu);

function close(p, { focus = false } = {}) {
  if (p.menu.hidden) return;
  p.menu.hidden = true; p.btn.setAttribute('aria-expanded', 'false');
  if (focus) p.btn.focus({ preventScroll: true });
}
function open(p) {
  pops.forEach(q => q !== p && close(q));
  p.menu.hidden = false; p.btn.setAttribute('aria-expanded', 'true');
  // Ring controls remain mounted under a hidden parent on other levels.
  // A :not([hidden]) selector alone still finds those unfocusable buttons.
  const choices = [...p.menu.querySelectorAll('button:not(:disabled), select:not(:disabled)')].filter(el => el.checkVisibility());
  (choices.find(el => el.getAttribute('aria-current') === 'step') || choices[0])?.focus({ preventScroll: true });
}
export const closeMenus = () => pops.forEach(p => close(p));
for (const p of pops) {
  p.btn.addEventListener('click', () => (p.menu.hidden ? open(p) : close(p)));
  // Restore keyboard continuity when a choice hides its own focused control.
  // A choice such as Present may already have moved focus to its visible exit;
  // preserve that deliberate destination instead of returning to this opener.
  const closeChoice = () => close(p, { focus: p.menu.contains(document.activeElement) });
  p.menu.addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.closest('label')) closeChoice(); });
  p.menu.addEventListener('change', e => { if (e.target.id === 'link-view') closeChoice(); });
}
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  // A source dialog opened from this menu owns the first Escape.
  if (['src-pop','page-sheet'].some(id=>$(id)?.hidden===false)) return;
  const p = pops.find(q => !q.menu.hidden);
  if (p) { e.stopPropagation(); close(p, { focus: true }); }
}, true);
document.addEventListener('pointerdown', e => { for (const p of pops) if (!p.menu.hidden && !p.menu.contains(e.target) && !p.btn.contains(e.target)) close(p); }, true);

// phones: the layer switch moves from over the view into the top row
const phone = matchMedia('(max-width: 760px), (max-width: 1100px) and (max-height: 600px) and (orientation: landscape)');
const layers = document.querySelector('.hud.tr .mode'), home = document.querySelector('.hud.tr'), slot = $('mode-slot');
function placeLayers() {
  if (!layers || !slot || !home) return;
  const parent = phone.matches ? slot : home;
  if (layers.parentElement === parent) return;
  const focused = layers.contains(document.activeElement) ? document.activeElement : null;
  if (phone.matches) parent.append(layers); else parent.prepend(layers);
  if (focused?.isConnected && focused.checkVisibility()) focused.focus({ preventScroll: true });
}
phone.addEventListener('change', placeLayers); placeLayers();
