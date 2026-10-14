// The top bar: firmer once the hero has scrolled under it, a menu on phones, and the chapter on screen underlined.
import { withScenario } from './scenario-links.js';
const $ = id => document.getElementById(id);
const embedded = new URLSearchParams(location.search).has('embed') && window.parent !== window;
if (embedded) {
  document.documentElement.classList.add('embedded');
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href]');
    if (!a || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    const url = new URL(a.getAttribute('href'), location.href), page = url.pathname.split('/').pop();
    if (url.origin !== location.origin) { a.target = '_blank'; a.rel = 'noopener'; return; }
    if (page === 'visualizer.html') { e.preventDefault(); e.stopPropagation(); const destination = new URL(a.hasAttribute('data-scenario-fixed') ? url.href : withScenario(location.search, url.href)); parent.postMessage({ type: 'grx-view', search: destination.search }, location.origin); return; }
    if (['evidence.html', 'method.html', 'glossary.html', 'parts.html'].includes(page) || !page) { if (page) { url.searchParams.set('embed', '1'); a.setAttribute('href', `${page}${url.search}${url.hash}`); } return; }
    a.target = '_top';
  }, true);
  addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); parent.postMessage({ type: 'grx-sheet-close' }, location.origin); }
    if (event.key !== 'Tab') return;
    const focusable = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el => el.checkVisibility() && !el.disabled && el.tabIndex >= 0);
    if ((event.shiftKey && document.activeElement === focusable[0]) || (!event.shiftKey && document.activeElement === focusable.at(-1))) {
      event.preventDefault(); parent.postMessage({ type: 'grx-sheet-focus', back: event.shiftKey }, location.origin);
    }
  });
}
const bar = $('topbar'), nav = $('topnav'), menu = $('menu-btn'), hero = $('top');

// scrolled: the bar needs its own ground once the hero is gone from behind it
const onScroll = () => document.body.classList.toggle('scrolled', !hero || scrollY > hero.offsetHeight - (bar?.offsetHeight || 60) - 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// the phone menu
function setMenu(open) {
  nav?.classList.toggle('open', open);
  menu?.setAttribute('aria-expanded', String(open));
}
// The sheet fades in, and a link inside it cannot take focus until its visibility has switched on, so retry
// once the transition has started. Without this a keyboard user opened the menu and tabbed past it.
function focusFirstNavLink(tries = 6) {
  const link = nav.querySelector('a');
  link?.focus({ preventScroll: true });
  if (link && document.activeElement !== link && tries > 0 && nav.classList.contains('open')) requestAnimationFrame(() => focusFirstNavLink(tries - 1));
}
menu?.addEventListener('click', () => { const open = !nav.classList.contains('open'); setMenu(open); if (open) focusFirstNavLink(); });
nav?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && nav?.classList.contains('open')) { setMenu(false); menu.focus(); } });
document.addEventListener('click', e => { if (nav?.classList.contains('open') && !e.target.closest('#topnav, #menu-btn')) setMenu(false); });

// carry the reader's scenario across pages: without this, the topbar's cross-page links (brand, Evidence,
// Method, Glossary, and the back-to-visualizer anchors) would drop whichever scenario is set in the URL, so a
// source check on Evidence could never lead back to the scenario the reader started from. Computed at click
// time, from the URL as it stands then, so a scenario set after the page loaded is never stale.
const crossPage = a => {
  const href = a.getAttribute('href');
  if (!href || href.trimStart().startsWith('#')) return false;
  try {
    const url = new URL(href, location.href);
    // Assigning a.href below makes a relative URL absolute. Recognize it on
    // every click so a second new-tab visit uses the newly selected scenario.
    return /^https?:$/.test(url.protocol) && url.origin === location.origin
      && url.pathname.startsWith(new URL('.', location.href).pathname);
  } catch { return false; }
};
for (const type of ['click', 'auxclick']) document.addEventListener(type, e => {
  const a = e.target.closest?.('a[href]');
  // Pinned evidence links already carry the saved scenario, not the current one.
  if (a && crossPage(a) && !a.hasAttribute('data-scenario-fixed')) a.href = withScenario(location.search, a.getAttribute('href'));
});

// the chapter on screen: the last chapter heading above the middle of the window
const links = [...document.querySelectorAll('#topnav a[href^="#"], .journey-nav a[href^="#"]')];
const chapters = [...new Set(links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean))].sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
let ticking = false;
// Phone story: once the hero is behind the bar, a slim strip under it names the chapter on screen and shows how far
// down the page the reader is. The page is long; this keeps the place. It only shows where you are (the chapter
// menu already announces the same thing with aria-current), so it is hidden from assistive tech and not tappable.
const strip = document.body.classList.contains('landing') && bar && nav && chapters.length ? document.createElement('div') : null;
if (strip) {
  strip.className = 'read-strip'; strip.setAttribute('aria-hidden', 'true');
  strip.innerHTML = '<span class="rs-n"></span><span class="rs-t"></span><i class="rs-bar"></i>';
  bar.append(strip);
}
// the journey cards carry a number and an "Explorer level" line around the name; the strip wants the name alone
function linkName(a) { const copy = a.cloneNode(true); copy.querySelectorAll('span, small').forEach(n => n.remove()); return copy.textContent.trim(); }
function updateStrip(on) {
  if (!strip) return;
  const index = chapters.findIndex(c => c.id === on);
  const link = links.find(a => a.getAttribute('href') === `#${on}`);
  const name = index < 0 ? 'The whole trip' : linkName(link);
  strip.querySelector('.rs-n').textContent = index < 0 ? 'Start' : `${index + 1} of ${chapters.length}`;
  strip.querySelector('.rs-t').textContent = name;
  const room = document.documentElement.scrollHeight - innerHeight;
  strip.style.setProperty('--read', room > 0 ? Math.min(1, Math.max(0, scrollY / room)).toFixed(4) : '0');
}
function spy() {
  ticking = false;
  const mid = innerHeight * 0.45;
  let on = null;
  for (const c of chapters) if (c.getBoundingClientRect().top < mid) on = c.id;
  for (const a of links) a.setAttribute('aria-current', String(a.getAttribute('href') === `#${on}`));
  updateStrip(on);
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } }, { passive: true });
spy();

// A link to a formula inside a closed disclosure opens the disclosure so the target is visible.
function openDisclosureForHash() {
  if (!location.hash) return;
  let target = null;
  try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
  for (let node = target?.parentElement; node; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true;
  if (target && target.querySelector?.(':scope > details.formula')) target.querySelector(':scope > details.formula').open = true;
}
addEventListener('hashchange', openDisclosureForHash);
openDisclosureForHash();
