// Shared static/browser render keeps the reference, cards and source registry in agreement.
import { LAYERS } from '../claims.js';
import { chip } from '../evidence.js';
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const specRows=(rows,key)=>`<dl class="part-specs">${rows.map((row,index)=>`<div><dt>${esc(row[0])}</dt><dd>${esc(row[1])} ${chip(row[2],`${key}:${index}`,row[0])}<a class="part-evidence-link" href="evidence.html#claim-${esc(`${key}:${index}`)}">Evidence →</a></dd></div>`).join('')}</dl>`;
export function partInventory(content) {
  return content.SCENES.map((scene,level)=>{
    const parts=new Map();
    for(const [mode,key] of LAYERS) for(const part of content[key][scene.id]||[]) {
      if(!parts.has(part.id)) parts.set(part.id,{id:part.id,title:part.title,assembly:part.assembly,assemblyNote:part.assemblyNote,components:part.components||[],views:[]});
      parts.get(part.id).views.push({mode,...part});
    }
    return {scene,level,parts:[...parts.values()]};
  });
}
export function renderParts(content) {
  return partInventory(content).map(({scene,level,parts})=>`<section class="parts-level" id="parts-${esc(scene.id)}" data-parts-level><header><p class="eyebrow">${scene.side?'Civil / context level':'Journey level'}</p><h2>${esc(scene.title)}</h2><p>${esc(scene.intro)}</p></header>${parts.map(part=>{
    const search=[scene.title,part.title,part.assembly?.title,part.assemblyNote,...part.views.flatMap(v=>[v.kicker,v.body]),...part.components.flatMap(c=>[c.title,c.role,c.body])].filter(Boolean).join(' ').toLowerCase();
    return `<details class="parts-assembly" id="parts-${esc(scene.id)}-${esc(part.id)}" data-part-entry="${esc(scene.id)}:${esc(part.id)}" data-search="${esc(search)}"><summary class="parts-heading"><div>${part.assembly?`<p class="part-parent">${esc(part.assembly.title)} / Component detail</p>`:""}<h3>${esc(part.title)}</h3><p>${esc(part.views[0].kicker)}</p></div><a class="part-open" href="visualizer.html?view=${level}.${part.views[0].mode}.${esc(part.id)}">View in 3D <span aria-hidden="true">↗</span></a></summary>${part.assemblyNote?`<p class="part-parent-note">${esc(part.assemblyNote)}</p>`:""}<div class="part-layer-views">${part.views.map((v,index)=>`<details class="part-layer"${index===0?' open':''}><summary>${esc(v.mode[0].toUpperCase()+v.mode.slice(1))} <span>${esc(v.kicker)}</span></summary><div><p>${esc(v.body)}</p>${specRows(v.specs||[],`card:${v.mode}:${scene.id}:${part.id}`)}</div></details>`).join('')}</div>${part.components.length?`<details class="part-anatomy" open><summary>Inside this assembly <span>${part.components.length} component entries</span></summary><div class="parts-components">${part.components.map(c=>`<section class="part-component" id="component-${esc(scene.id)}-${esc(part.id)}-${esc(c.id)}" data-component-entry><h4>${esc(c.title)}</h4><p class="component-role">${esc(c.role)}</p><p>${esc(c.body)}</p>${specRows(c.specs||[],`component:${scene.id}:${part.id}:${c.id}`)}</section>`).join('')}</div></details>`:''}</details>`;
  }).join('')}</section>`).join('\n');
}
