// IF reference-page sheet: read sources or the catalog without losing the view.
import { show, overview, sceneCount } from './stage.js';
import { emit, setScenario } from './store.js';
import { withScenario, SCENARIO_KEYS } from './scenario-links.js';

const PAGES = { 'evidence.html': 'Evidence', 'method.html': 'Method', 'glossary.html': 'Glossary', 'parts.html': 'Parts' };
const sheet = document.createElement('div');
sheet.className = 'page-sheet'; sheet.id = 'page-sheet'; sheet.hidden = true;
sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'ps-t');
sheet.innerHTML = `<button type="button" class="ps-scrim" tabindex="-1" aria-label="Close reference page"></button><div class="ps-panel"><div class="ps-bar"><b id="ps-t">Evidence</b><a class="ps-open" id="ps-open" href="evidence.html" target="_blank" rel="noopener">Open as a page <span aria-hidden="true">↗</span></a><button type="button" class="ps-x" aria-label="Close and go back to the visualizer">×</button></div><iframe id="ps-frame" title="Evidence"></iframe></div>`;
document.body.append(sheet);
const frame = sheet.querySelector('iframe'), title = sheet.querySelector('#ps-t'), openAsPage = sheet.querySelector('#ps-open'), closeButton = sheet.querySelector('.ps-x');
let opener = null, background = [];

// Links within the embedded reference can change its page or anchor. Keep the
// enclosing sheet and its new-tab destination attached to the document being read.
function syncReferencePage() {
  let url;
  try { url = new URL(frame.contentWindow.location.href); } catch { return; }
  const pageTitle = url.origin === location.origin && PAGES[url.pathname.split('/').pop()];
  if (!pageTitle) return;
  title.textContent = pageTitle; frame.title = pageTitle;
  url.searchParams.delete('embed'); openAsPage.href = url.href;
}
frame.addEventListener('load', syncReferencePage);
// History changes such as the Parts search do not reload the frame.
openAsPage.addEventListener('click', syncReferencePage);

export function openPage(href, fixedScenario = false) {
  const url = new URL(fixedScenario ? href : withScenario(location.search, href), location.href);
  if (sheet.hidden) {
    opener = document.activeElement;
    background = [...document.body.children].filter(el => el !== sheet && !['SCRIPT', 'STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
    background.forEach(([el]) => { el.inert = true; });
  }
  emit('reference-open');
  title.textContent = PAGES[url.pathname.split('/').pop()] || 'Reference'; frame.title = title.textContent;
  url.searchParams.delete('embed'); openAsPage.href = url.href;
  url.searchParams.set('embed', '1'); frame.src = url.href;
  sheet.hidden = false; document.body.classList.add('page-sheet-open'); closeButton.focus({ preventScroll: true });
}
export function closePage() {
  if (sheet.hidden) return;
  sheet.hidden = true; document.body.classList.remove('page-sheet-open');
  background.forEach(([el, inert]) => { el.inert = inert; }); background = [];
  if (opener?.isConnected && opener.checkVisibility()) opener.focus({ preventScroll: true });
  else document.getElementById('gl').focus({ preventScroll: true });
  opener = null;
}
closeButton.addEventListener('click', closePage);
sheet.querySelector('.ps-scrim').addEventListener('click', closePage);
addEventListener('keydown', event => {
  if (sheet.hidden) return;
  if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closePage(); }
  else if (event.key === 'Tab' && event.shiftKey && document.activeElement === openAsPage) {
    event.preventDefault();
    const items = [...(frame.contentDocument?.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]') || [])].filter(el => el.checkVisibility() && !el.disabled && el.tabIndex >= 0);
    (items.at(-1) || frame).focus();
  }
}, true);
document.addEventListener('click', event => {
  const link = event.target.closest?.('a[href]');
  if (!link || link.closest('#page-sheet') || link.target === '_blank' || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const url = new URL(link.getAttribute('href'), location.href);
  if (url.origin !== location.origin || !PAGES[url.pathname.split('/').pop()]) return;
  event.preventDefault(); event.stopPropagation();
  document.getElementById('topnav').classList.remove('open'); document.getElementById('menu-btn').setAttribute('aria-expanded', 'false');
  openPage(link.getAttribute('href'), link.hasAttribute('data-scenario-fixed'));
}, true);
addEventListener('message', async event => {
  if (event.origin !== location.origin || event.source !== frame.contentWindow || sheet.hidden) return;
  if (event.data?.type === 'grx-sheet-close') { closePage(); return; }
  if (event.data?.type === 'grx-sheet-focus') { (event.data.back ? closeButton : openAsPage).focus(); return; }
  if (event.data?.type !== 'grx-view') return;
  const query = new URLSearchParams(event.data.search || ''), value = query.get('view');
  const [scene, mode, part] = (value || '').split('.');
  if (value && (!/^\d+$/.test(scene) || +scene >= sceneCount || !['light', 'data', 'heat'].includes(mode))) return;
  closePage();
  const patch = Object.fromEntries(SCENARIO_KEYS.filter(key => query.has(key)).map(key => [key, query.get(key)]));
  if (Object.keys(patch).length) await setScenario(patch);
  if (value) { await show({ scene: +scene, mode, part: part || null }); if (!part) overview(); }
});
