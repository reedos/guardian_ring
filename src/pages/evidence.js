import { SOURCES } from '../sources.js';
const root=document.getElementById('source-register');
const search=document.getElementById('source-search');
const esc=s=>String(s||'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function render(){const query=search.value.toLowerCase();root.innerHTML=Object.entries(SOURCES).filter(([,s])=>`${s.title} ${s.publisher}`.toLowerCase().includes(query)).map(([id,s])=>`<article class="source ${s.unchecked?'unchecked':''}" id="${esc(id)}"><p class="kicker">${s.unchecked?'Unchecked · not cited':'Verified source · no claim published'}</p><h2>${esc(s.title)}</h2><p>${esc(s.publisher)} · ${esc(s.published||s.dated)} · Checked ${esc(s.accessed||s.attempted)}</p>${s.unchecked?`<p>${esc(s.unchecked)}</p>`:`<a href="${esc(s.url)}" rel="noopener noreferrer" target="_blank">Open source ↗</a>`}</article>`).join('')||'<p>No matching source records.</p>';}
search.addEventListener('input',render);render();
