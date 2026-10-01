import { describe, expect, it } from 'vitest';
import { compute, DEFAULT_SCENARIO, SCENARIO_OPTIONS } from './engine';

describe('the scaffold scenario contract', () => {
  it('normalizes unsupported values without mutating its input', () => {
    const input = { ...DEFAULT_SCENARIO, orbit: 'unknown', band: 'lwir' };
    expect(compute(input).scenario).toEqual({ ...DEFAULT_SCENARIO, band: 'lwir' });
    expect(input.orbit).toBe('unknown');
  });
  it('accepts all declared combinations while making no physical claims', () => {
    for (const orbit of SCENARIO_OPTIONS.orbit) for (const aperture of SCENARIO_OPTIONS.aperture)
      for (const band of SCENARIO_OPTIONS.band) for (const detector of SCENARIO_OPTIONS.detector) {
        const scenario = { orbit: orbit.id, aperture: aperture.id, band: band.id, detector: detector.id };
        expect(compute(scenario)).toEqual({ scenario, status: 'scaffold', outputs: {} });
      }
  });
});
