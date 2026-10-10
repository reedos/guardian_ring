import { describe, it, expect } from 'vitest';
import { qualityPressure, particleBudget } from '../explainer-kit/src/render-quality.js';

describe('adaptive rendering pressure', () => {
  it('responds before 40 fps and sheds faster under severe load', () => {
    expect(qualityPressure({ frame: 23, gpu: 19, cpu: 3 })).toBe(1);
    expect(qualityPressure({ frame: 55, gpu: 42, cpu: 3 })).toBe(2);
  });
  it('handles expensive animation CPU and unavailable GPU timing', () => {
    expect(qualityPressure({ frame: 25, gpu: 4, cpu: 19 })).toBe(1);
    expect(qualityPressure({ frame: 25, gpu: null, cpu: 3 })).toBe(1);
    expect(qualityPressure({ frame: 60, gpu: NaN, cpu: 3 })).toBe(2);
  });
  it('keeps quality under an idle GPU frame cap and requires measured recovery headroom', () => {
    expect(qualityPressure({ frame: 33.3, gpu: 3, cpu: 3 })).toBe(0);
    expect(qualityPressure({ frame: 16.7, gpu: null, cpu: 3 })).toBe(0);
    expect(qualityPressure({ frame: 16.7, gpu: 3, cpu: 3 })).toBe(-1);
    expect(qualityPressure({ frame: 16.7, gpu: 10, cpu: 3 })).toBe(0);
  });
  it('keeps sparse overlay routes visible without adding particles', () => {
    for (const count of [1, 2, 3, 8, 30]) {
      expect(particleBudget(count, .3)).toBeGreaterThanOrEqual(Math.min(count, 3));
      expect(particleBudget(count, .3)).toBeLessThanOrEqual(count);
    }
  });
});
