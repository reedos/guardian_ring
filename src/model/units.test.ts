import { describe, expect, it } from 'vitest';
import { feetToMeters, poundsToKilograms } from './units';
import { SBIRS_PUBLISHED_CLAIMS } from '../sbirs-published.js';

describe('unit conversion of published figures', () => {
  it('uses the exact international foot and pound, checked through inches and grains', () => {
    // 1 ft = 12 in, 1 in = 2.54 cm; 1 lb = 7000 grains, 1 grain = 64.79891 mg.
    expect(feetToMeters(1)).toBeCloseTo(12 * 2.54 / 100, 15);
    expect(poundsToKilograms(1)).toBeCloseTo(7000 * 64.79891e-6, 15);
    expect(() => feetToMeters(-1)).toThrow(RangeError);
  });
  it('shows the published SBIRS GEO figures converted, independently of the module', () => {
    const value = (id: string) => SBIRS_PUBLISHED_CLAIMS.find((c: { key: string }) => c.key === `story:${id}`)!.value;
    expect(value('sbirs-sensor-dimensions-si')).toBe('About 2.1 m × 1.2 m × 0.9 m');   // 2.1336, 1.2192, 0.9144
    expect(value('sbirs-sensor-weight-si')).toBe('About 240 kg');                       // 240.40
    expect(value('sbirs-geo-dimensions-si')).toBe('About 14.9 m × 6.7 m × 6.1 m with all appendages deployed on orbit'); // 14.935, 6.706, 6.096
    expect(value('sbirs-geo-weight-si')).toBe('About 2,506 kg, including about 499 kg of payload and 195 kg of fuel');   // 2506.1, 498.95, 195.04
  });
  it('keeps every published figure attached to SBIRS GEO, not the drawn spacecraft', () => {
    for (const claim of SBIRS_PUBLISHED_CLAIMS) {
      expect(claim.scope).toContain('not the site’s representative as-drawn spacecraft');
      expect(claim.ev.refs[0][0]).toBe('ssc-sbirs-factsheet');
    }
  });
});
