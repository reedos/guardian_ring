// What backs each figure the site shows, one claim at a time.
//
// A claim is a figure beside a basis chip, on a scene card or in the verified research table.
// Its basis says what kind of statement it is; its evidence says what supports it.
//
//   spec      Published spec. The maker or a standards body states it for the named product or standard.
//   vendor    Vendor claim. A vendor's own comparison or performance figure, attributed to it, with the baseline it
//             is compared against. Not checked independently here.
//   reported  Published report. Stated by a named party outside a formal specification: a government agency, a
//             researcher, an analyst, the trade press, or an operator in an informal statement such as a post.
//   derived   Calculated here. This site's model computes it from the scenario and cited inputs; CALCS says how.
//   assumed   Assumption. A value the model chooses where no single published figure applies; ASSUMPTIONS says why.
//
// Evidence rides with the claim: the last element of a [label, value, basis, ..., ev] row, or an `ev` field on an
// object row. Its forms:
//   spec, vendor, reported   { refs: [[sourceId, 'where in the source: section, table, page or figure'], ...] }
//                            a vendor claim also carries vs: 'what it is compared against'
//   derived                  { calc: 'calc-id' }       (optionally refs too, for the published inputs)
//   assumed                  { assume: 'assumption-id' }
// A spec must cite at least one primary source (the maker, the standards body, the agency that publishes the data).
// Sources live in src/sources.js with the date each was published (when it says) and the date it was checked.

export const BASIS = {
  spec: { label: 'Published spec', short: 'Spec', meaning: 'The maker or a standards body publishes this figure for the named product or standard.' },
  vendor: { label: 'Vendor claim', short: 'Vendor', meaning: 'The vendor’s own comparison or performance figure, attributed to it. The site has not checked it independently.' },
  reported: { label: 'Published report', short: 'Reported', meaning: 'Stated by a named party outside a formal specification: a government agency, a researcher, an analyst, the trade press, or an operator in an informal statement such as a post.' },
  derived: { label: 'Calculated here', short: 'Calc.', meaning: 'Calculated by this site’s model from the scenario and the figures it cites. The method page shows how.' },
  assumed: { label: 'Assumption', short: 'Assumed', meaning: 'A value the model chooses where no single published figure applies. The method page says why.' },
  // the labels every figure carried before claims were traced one by one; none may remain once they are (STRICT)
  typical: { label: 'Industry typical', short: 'Typical', meaning: 'Not yet traced to a specific source for this figure.', legacy: true },
  est: { label: 'Estimate', short: 'Est.', meaning: 'Not yet traced to a calculation or an assumption.', legacy: true },
};
export const CITED = new Set(['spec', 'vendor', 'reported']);

// Every claim is traced: a legacy label, or a claim with no evidence, is a test failure (tools/claims.mjs reports it too).
export const STRICT = true;

// the evidence carried by a claim row, wherever it sits
export function evOf(row) {
  if (Array.isArray(row)) { const last = row[row.length - 1]; return last && typeof last === 'object' && !Array.isArray(last) && (last.refs || last.calc || last.assume) ? last : null; }
  return row?.ev || null;
}

// Physical calculations are deferred to Phase 3.
export const CALCS = {};
export const ASSUMPTIONS = {};

// the basis chip for one claim: a button that opens that claim's evidence (src/app/sources-ui.js)
const attr = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const chip = (basis, key, label = '') => { const b = BASIS[basis] || BASIS.est;
  return `<button type="button" class="chip ${basis}" data-src="${attr(key)}" aria-expanded="false" aria-label="${attr(`${b.label}${label ? ` for ${String(label).replace(/<[^>]+>/g, '')}` : ''}: what backs it`)}">${b.short}</button>`; };

// what is wrong with one claim's evidence, as sentences (empty when it holds up)
export function problems(claim, SOURCES, strict = STRICT) {
  const out = [], { basis, ev } = claim, b = BASIS[basis];
  if (!b) return [`unknown basis ${basis}`];
  if (b.legacy) { if (strict) out.push(`still labeled ${basis}`); return out; }
  if (!ev) return strict ? [`no evidence for a ${basis} claim`] : [];   // not yet traced one by one
  if (CITED.has(basis)) {
    if (!ev.refs?.length) out.push('cites no source');
    if (basis === 'vendor' && !ev.vs) out.push('vendor claim without its baseline');
  }
  if (basis === 'derived' && !CALCS[ev.calc]) out.push(`unknown calculation ${ev.calc}`);
  if (basis === 'assumed' && !ASSUMPTIONS[ev.assume]) out.push(`unknown assumption ${ev.assume}`);
  if (ev.refs && !Array.isArray(ev.refs)) return [...out, 'source references must be an array'];
  for (const ref of ev.refs || []) {
    if (!Array.isArray(ref) || ref.length !== 2) { out.push('source reference must be [id, location]'); continue; }
    const [id, at] = ref, s = SOURCES[id];
    if (!s) { out.push(`unknown source ${id}`); continue; }
    if (!at || !String(at).trim()) out.push(`${id}: no location in the source`);
    if (s.unchecked) out.push(`${id}: unchecked source (${s.unchecked})`);
    if (s.status && s.status !== 'verified') out.push(`${id}: source status is ${s.status}`);
    if (!s.accessed) out.push(`${id}: never checked (no access date)`);
    if (!['primary', 'secondary'].includes(s.kind)) out.push(`${id}: not marked primary or secondary`);
    if (!s.title || !s.publisher || !/^https?:\/\//.test(s.url || '')) out.push(`${id}: incomplete source title, publisher or URL`);
    if (!s.published && !s.dated) out.push(`${id}: no publication date or explicit dating note`);
  }
  if (basis === 'spec' && ev.refs?.length && !ev.refs.some(ref => Array.isArray(ref) && SOURCES[ref[0]]?.kind === 'primary')) out.push('a spec with no primary source');
  return out;
}
