// Compare the already formatted teaching claims; no new calculation or delta.
import { chip } from '../evidence.js';
import { SCENARIO_OPTIONS } from '../model/engine.ts';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export const COMPARISON_IDS = ['orbitPeriodSeconds', 'lightTimeSeconds', 'photonEnergyJ', 'diffractionRadians', 'bandRadianceWm2Sr'];
export const scenarioSummary = model => Object.entries(SCENARIO_OPTIONS).map(([key, choices]) => choices.find(choice => choice.id === model.scenario[key])?.label || model.scenario[key]).join(' · ');

export function comparisonRows(current, pinned) {
  if (!pinned) return [];
  return COMPARISON_IDS.map(id => ({ id, current: current.claims[id] || null, pinned: pinned.claims[id] || null })).filter(row => row.current || row.pinned);
}

export function renderComparison(current, pinned) {
  if (!pinned) return '';
  const cell = (row, id, saved) => `<dd data-comparison-side="${saved ? 'pinned' : 'current'}"><span class="comparison-side">${saved ? 'Pinned' : 'Current'}</span><span class="comparison-value">${row ? esc(row[1]) : 'Unavailable'}</span>${row ? chip(row[2], `${saved ? 'pinned:' : ''}model:${id}`, `${saved ? 'pinned' : 'current'} ${row[0]}`) : '<span aria-hidden="true">—</span>'}</dd>`;
  return `<h3 id="sc-comparison-title">Pinned and current</h3><p class="note">Current choices: ${esc(scenarioSummary(current))}</p><dl>${comparisonRows(current, pinned).map(({ id, current: now, pinned: saved }) => `<div data-comparison-claim="${id}"><dt>${esc((now || saved)[0])}</dt>${cell(saved, id, true)}${cell(now, id, false)}</div>`).join('')}</dl>${current.unavailable.aperture || pinned.unavailable.aperture ? '<p class="note">The civil aperture is unverified, so its diffraction value is unavailable.</p>' : ''}<p class="note">Independent teaching examples. These values do not describe the performance of the drawn spacecraft.</p>`;
}
