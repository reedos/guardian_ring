import { describe, expect, it } from 'vitest';
import { renderMath } from './math-view.js';
import { compute, SCENARIO_OPTIONS } from '../model/engine';
import { content } from '../data.js';
import { resolveSourceClaim } from './source-claim.js';
import { CALCS, problems } from '../evidence.js';
import { SOURCES } from '../sources.js';

describe('orbital speed in the math reading path', () => {
  it('displays the current calculated speed with working evidence and method links', () => {
    for (const orbit of SCENARIO_OPTIONS.orbit) {
      const model = compute({ orbit: orbit.id }), html = renderMath(model);
      expect(html).toContain('data-math-claim="orbitSpeedKmS"');
      expect(html).toContain(model.claims.orbitSpeedKmS![1]);
      expect(html).toContain('data-src="model:orbitSpeedKmS"');
      expect(html).toContain('href="method.html#calc-orbit-speed"');
      const claim = resolveSourceClaim({ M: model, C: content(model), pinned: null }, 'model:orbitSpeedKmS');
      expect(claim?.basis).toBe('derived');
      expect(problems(claim, SOURCES)).toEqual([]);
      expect(CALCS['orbit-speed'].how).toContain('Earth-centered inertial speed');
      expect(html).toContain('not speed over the rotating ground');
    }
  });

  it('keeps apogee speed identified when the scenario changes from a circle to an ellipse', () => {
    const circular = renderMath(compute({ orbit: 'geo' })), elliptical = renderMath(compute({ orbit: 'heo' }));
    expect(circular).toContain('Teaching circular orbital speed');
    expect(elliptical).toContain('Teaching orbital speed at apogee');
    expect(elliptical).toContain('Its distance and speed change around the orbit.');
    expect(elliptical).not.toContain('Teaching circular orbital speed');
  });
});
