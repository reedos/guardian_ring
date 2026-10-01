// Phase 0 contract only. Physical calculations follow source and look review.
export const SCENARIO_OPTIONS = {
  orbit: [{ id: 'geo', label: 'GEO' }, { id: 'heo', label: 'HEO' }, { id: 'meo', label: 'MEO' }, { id: 'leo', label: 'LEO' }],
  aperture: [{ id: 'representative', label: 'Representative' }, { id: 'civil', label: 'Civil twin' }],
  band: [{ id: 'swir', label: 'SWIR' }, { id: 'mwir', label: 'MWIR' }, { id: 'lwir', label: 'LWIR' }],
  detector: [{ id: 'hgcdte', label: 'HgCdTe' }, { id: 'insb', label: 'InSb' }, { id: 't2sl', label: 'T2SL' }, { id: 'qwip', label: 'QWIP' }],
} as const;
export type Scenario = { orbit: string; aperture: string; band: string; detector: string };
export const DEFAULT_SCENARIO: Scenario = { orbit: 'geo', aperture: 'representative', band: 'mwir', detector: 'hgcdte' };
export function compute(input: Partial<Scenario> = {}) {
  const scenario = { ...DEFAULT_SCENARIO };
  for (const key of Object.keys(SCENARIO_OPTIONS) as (keyof Scenario)[]) {
    const id = input[key];
    if (SCENARIO_OPTIONS[key].some(option => option.id === id)) scenario[key] = id!;
  }
  return { scenario, status: 'scaffold' as const, outputs: {} };
}
