import { describe, expect, it } from 'vitest';
import { compute } from '../model/engine';
import { content } from '../data.js';
import { comparisonRows, renderComparison, scenarioSummary } from './comparison.js';
import { resolveSourceClaim, sourceScenarioSearch } from './source-claim.js';

describe('pinned teaching comparison', () => {
  it('keeps saved values and evidence after orbit and band change', () => {
    const pinned = compute(), current = compute({ orbit: 'leo', band: 'swir' });
    const state = { M: current, C: content(current), pinned };
    for (const { id, current: now, pinned: saved } of comparisonRows(current, pinned)) {
      expect(saved).toBe(pinned.claims[id as keyof typeof pinned.claims]);
      expect(now).toBe(current.claims[id as keyof typeof current.claims]);
      const claim = resolveSourceClaim(state, `pinned:model:${id}`);
      expect(claim?.value).toBe(saved?.[1]);
      expect(claim?.ev).toEqual(saved?.[3]);
    }
    expect(resolveSourceClaim(state, 'pinned:model:lightTimeSeconds')?.value).not.toBe(resolveSourceClaim(state, 'model:lightTimeSeconds')?.value);
    expect(resolveSourceClaim(state, 'pinned:model:photonEnergyJ')?.value).not.toBe(resolveSourceClaim(state, 'model:photonEnergyJ')?.value);
  });
  it('does not invent civil diffraction or fall back after unpinning', () => {
    const current = compute(), pinned = compute({ aperture: 'civil' });
    const rows = comparisonRows(current, pinned);
    expect(rows.find(row => row.id === 'diffractionRadians')?.pinned).toBeNull();
    const html = renderComparison(current, pinned);
    expect(html).toContain('Unavailable');
    expect(html).not.toContain('data-src="pinned:model:diffractionRadians"');
    expect(resolveSourceClaim({ M: current, C: content(current), pinned: null }, 'pinned:model:photonEnergyJ')).toBeNull();
    expect(renderComparison(current, null)).toBe('');
  });
  it('identifies all four saved choices and labels each available value', () => {
    const current = compute({ orbit: 'heo', aperture: 'civil', band: 'lwir', detector: 'qwip' }), pinned = compute();
    expect(scenarioSummary(current)).toBe('HEO · Civil twin · LWIR · QWIP');
    const html = renderComparison(current, pinned);
    for (const { id, current: now, pinned: saved } of comparisonRows(current, pinned)) {
      if (now) expect(html).toContain(`data-src="model:${id}"`);
      if (saved) expect(html).toContain(`data-src="pinned:model:${id}"`);
    }
  });
  it('carries the saved scenario on evidence detours without replacing the active scenario', () => {
    const current = compute({ orbit: 'leo', aperture: 'civil', band: 'lwir', detector: 'qwip' }), pinned = compute();
    const state = { M: current, C: content(current), pinned }, search = new URLSearchParams(current.scenario).toString();
    const savedQuery = new URLSearchParams(sourceScenarioSearch(state, 'pinned:model:lightTimeSeconds', search));
    for (const [key, value] of Object.entries(pinned.scenario)) expect(savedQuery.get(key)).toBe(value);
    expect(sourceScenarioSearch(state, 'model:lightTimeSeconds', search)).toBe(search);
    expect(state.M.scenario).toEqual(current.scenario);
  });
});
