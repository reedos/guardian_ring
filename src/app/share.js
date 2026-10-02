// IF's share-link contract, renamed for the Guardian Ring.
import { store, on } from './store.js';
import { getAssemblyPresentation } from './stage.js';
import { explorerQuery } from './explorer-url.js';
let timer;
const currentQuery = () => explorerQuery(location.search, { ...store.ui, assemblyView:getAssemblyPresentation()?.capture().view });
function write() {
  clearTimeout(timer); timer = setTimeout(() => {
    if (store.ui.scene < 0) return;
    const query = currentQuery();
    history.replaceState(null, '', `${location.pathname}?${query}${location.hash}`);
  }, 100);
}
on('scene', write); on('mode', write); on('select', write); on('scenario', write);
on('scene-settings', write);
document.getElementById('share-btn')?.addEventListener('click', async () => {
  const query = currentQuery();
  const url = `${location.origin}${location.pathname}?${query}`;
  let copied = false; try { await navigator.clipboard.writeText(url); copied = true; } catch { /* display selectable URL */ }
  const toast = document.getElementById('toast'); toast.textContent = copied ? 'Link copied: it opens this scenario and view.' : url;
  toast.hidden = false; toast.classList.toggle('select', !copied); setTimeout(() => { toast.hidden = true; }, copied ? 2600 : 9000);
});
