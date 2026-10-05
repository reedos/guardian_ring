import '../app/sources-ui.js';
import { store, setScenario } from '../app/store.js';
import { SCENARIO_KEYS } from '../app/scenario-links.js';
import { renderParts } from './parts-content.js';
import { scenarioLabel } from './evidence-content.js';
const query=new URLSearchParams(location.search);
setScenario(Object.fromEntries(SCENARIO_KEYS.filter(key=>query.has(key)).map(key=>[key,query.get(key)])));
const register=document.getElementById('parts-register');
register.innerHTML=renderParts(store.C); register.dataset.scenarioView='current';
document.getElementById('parts-scenario').textContent=`Current teaching choices: ${scenarioLabel(store.scenario)}`;
const input=document.getElementById('parts-search'),count=document.getElementById('parts-count'),empty=document.getElementById('parts-empty');
input.value=query.get('q')||'';
function filter(update=false) {
  const terms=input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);let matches=0;
  for(const row of register.querySelectorAll('[data-part-entry]')) {row.hidden=!terms.every(term=>row.dataset.search.includes(term));row.open=terms.length>0&&!row.hidden;if(!row.hidden)matches++;}
  for(const level of register.querySelectorAll('[data-parts-level]')) level.hidden=![...level.querySelectorAll('[data-part-entry]')].some(row=>!row.hidden);
  count.textContent=`${matches} assembly entries${terms.length?' found':''}`;empty.hidden=matches>0;
  if(update){const params=new URLSearchParams(location.search);if(input.value.trim())params.set('q',input.value.trim());else params.delete('q');history.replaceState(null,'',`${location.pathname}${params.size?`?${params}`:''}${location.hash}`);}
}
input.addEventListener('input',()=>filter(true));filter();
// Native details keep long diagrams readable; deep links open their containing sections.
function revealHash(hash) {
  let id;
  try { id=decodeURIComponent(hash.replace(/^#/,'')); } catch { return; }
  const node=document.getElementById(id);
  if(!node)return;
  // A persistent chapter or diagram link must reveal a search-hidden target.
  if(node.closest('[hidden]')) { input.value=''; filter(true); }
  if(node instanceof HTMLDetailsElement)node.open=true;
  for(let parent=node.parentElement;parent;parent=parent.parentElement) if(parent instanceof HTMLDetailsElement)parent.open=true;
  node.scrollIntoView();
}
document.addEventListener('click',event=>{
  if(event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  const link=event.target.closest?.('a[href]');if(!link)return;
  const url=new URL(link.getAttribute('href'),location.href);
  if(url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search&&url.hash){revealHash(url.hash);link.setAttribute('href',url.hash);}
});
addEventListener('hashchange',()=>revealHash(location.hash));
if(location.hash) requestAnimationFrame(()=>revealHash(location.hash));
