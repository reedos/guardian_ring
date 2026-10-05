// Shared by static generation and browser hydration so both render the same claim contract.
import { ASSUMPTIONS, BASIS, CALCS, chip } from '../evidence.js';
import { SOURCES } from '../sources.js';
import { SCENARIO_OPTIONS } from '../model/engine.ts';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export const scenarioLabel = scenario => Object.entries(SCENARIO_OPTIONS)
  .map(([key, options]) => options.find(option => option.id === scenario[key])?.label || scenario[key]).join(' · ');

function scopeOf(claim, current) {
  return claim.scope || (claim.group === 'model'
    ? `${current ? 'Current' : 'Default'} teaching example. Independent of the drawn hardware; no real sensor performance is inferred.`
    : `${claim.scene?.title || claim.scene?.name || 'Explorer'} · ${claim.mode ? `${claim.mode} layer · ` : ''}${claim.part?.title || ''}${claim.component ? ` · ${claim.component.title}` : ''}. Civil specifications apply only to the named instrument.`);
}

export function renderClaimRows(claims, { current = false, grouped = true } = {}) {
  if (grouped) {
    const groups = new Map();
    for (const claim of claims) {
      const id = claim.scene?.id || claim.group || 'other';
      if (!groups.has(id)) groups.set(id, { title: claim.scene?.title || ({ story: 'The story', model: 'Teaching calculations' }[id] || 'Reference claims'), claims: [] });
      groups.get(id).claims.push(claim);
    }
    return `<nav class="parts-toc" aria-label="Evidence by level">${[...groups].map(([id, group]) => `<a href="#evidence-${esc(id)}">${esc(group.title)}</a>`).join('')}</nav>` + [...groups].map(([id, group]) => `<details class="reference-group" id="evidence-${esc(id)}" data-claim-group><summary>${esc(group.title)} <span>${group.claims.length} claims</span></summary><div data-reference-rows>${renderClaimRows(group.claims, { current, grouped: false })}</div></details>`).join('');
  }
  return claims.map(claim => {
    const ev = claim.ev || {}, scope = scopeOf(claim, current);
    const refs = [...new Map((ev.refs || []).map(ref => [JSON.stringify(ref), ref])).values()];
    const search = [claim.key, claim.label, claim.value, scope, BASIS[claim.basis]?.short,
      ...refs.flatMap(([id, at]) => [id, at, SOURCES[id]?.title, SOURCES[id]?.publisher])].filter(Boolean).join(' ').toLowerCase();
    const references = refs.map(([id, at]) => {
      const source = SOURCES[id];
      if (!source || source.status !== 'verified' || source.unchecked) throw new Error(`Cannot cite unverified source ${id}`);
      return `<li><a href="#source-${esc(id)}">${esc(source.title)}</a><span>${esc(at)}</span></li>`;
    }).join('');
    return `<article class="claim-row" id="claim-${esc(claim.key)}" data-claim-key="${esc(claim.key)}" data-search="${esc(search)}"><div class="claim-heading"><h3>${esc(claim.label)}</h3>${chip(claim.basis, claim.key, claim.label)}</div><p class="claim-value">${esc(claim.value)}</p><p class="claim-scope">${esc(scope)}</p>${ev.calc ? `<p class="claim-refs"><a href="method.html#calc-${esc(ev.calc)}">Formula: ${esc(CALCS[ev.calc].title)}</a></p>` : ''}${ev.assume ? `<p class="claim-refs"><a href="method.html#assume-${esc(ev.assume)}">Assumption: ${esc(ASSUMPTIONS[ev.assume].title)}</a></p>` : ''}${references ? `<ul class="claim-refs">${references}</ul>` : ''}</article>`;
  }).join('\n');
}
