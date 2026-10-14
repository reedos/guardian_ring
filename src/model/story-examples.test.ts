import { describe, expect, it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; the app's TS environment is browser-only.
import { readFileSync } from 'node:fs';
import { compute } from './engine';
import { EARTH_EQUATORIAL_RADIUS_M as R, elevationAboveHorizonDegrees, horizonCentralAngleDegrees, visibleSurfaceFraction } from './orbits';
import { ORBIT_ROWS, contrastExample, geoViewAngles, orbitRow, storyNumbers, toyPixel, GROUND_K, HOT_GAS_K } from './story-examples';

const h = 6.62607015e-34, c = 299792458, k = 1.380649e-23;
const relative = (actual: number, expected: number, tolerance = 1e-9) =>
  expect(Math.abs((actual - expected) / expected)).toBeLessThan(tolerance);

// Independent of the model's quadrature and of its Planck kernel: midpoint rule in frequency.
function frequencyBand(loUm: number, hiUm: number, temperature: number) {
  const lo = loUm * 1e-6, hi = hiUm * 1e-6, n = 40000, start = c / hi, step = (c / lo - start) / n;
  let energy = 0;
  for (let i = 0; i < n; i++) {
    const nu = start + (i + .5) * step;
    energy += 2 * nu * nu / (c * c) / Math.expm1(h * nu / (k * temperature)) * h * nu * step;
  }
  return energy;
}

describe('story examples: independent geometry checks', () => {
  it('counts the visible share of an Earth sphere by line of sight, not by the cap formula', () => {
    // Equal-area sampling of a sphere (Archimedes): z uniform in [-1, 1]. A surface point p is in view of a
    // satellite at s when the segment s-p does not pass through the sphere, i.e. (s - p) . p > 0.
    for (const orbit of ORBIT_ROWS) {
      const r = orbitRow(orbit).radiusM, n = 200000;
      let seen = 0;
      for (let i = 0; i < n; i++) {
        const z = -1 + 2 * (i + .5) / n, rho = Math.sqrt(1 - z * z);
        const p = [R * rho, 0, R * z], s = [0, 0, r];
        if ((s[0] - p[0]) * p[0] + (s[1] - p[1]) * p[1] + (s[2] - p[2]) * p[2] > 0) seen++;
      }
      expect(Math.abs(seen / n - orbitRow(orbit).shareOfEarth)).toBeLessThan(2e-5);
      expect(visibleSurfaceFraction(r)).toBeCloseTo(orbitRow(orbit).shareOfEarth, 14);
    }
  });
  it('finds the angle above the horizon from explicit three-dimensional vectors', () => {
    for (const r of [orbitRow('geo').radiusM, orbitRow('meo').radiusM, orbitRow('leo').radiusM]) {
      for (const degrees of [0, 10, 30, 45, 60, 75, 80]) {
        const psi = degrees * Math.PI / 180;
        const ground = [R * Math.cos(psi), R * Math.sin(psi), 0], up = [Math.cos(psi), Math.sin(psi), 0];
        const toSat = [r - ground[0], -ground[1], 0], length = Math.hypot(toSat[0], toSat[1]);
        const sinElevation = (toSat[0] * up[0] + toSat[1] * up[1]) / length;
        expect(elevationAboveHorizonDegrees(r, psi)).toBeCloseTo(Math.asin(sinElevation) * 180 / Math.PI, 9);
      }
    }
  });
  it('puts the satellite exactly on the horizon at the horizon central angle and straight overhead at zero', () => {
    const { radiusM, limbDeg } = geoViewAngles();
    expect(elevationAboveHorizonDegrees(radiusM, limbDeg * Math.PI / 180)).toBeCloseTo(0, 9);
    expect(elevationAboveHorizonDegrees(radiusM, 0)).toBeCloseTo(90, 9);
    expect(horizonCentralAngleDegrees(radiusM)).toBeCloseTo(limbDeg, 12);
    // Elevation must fall as the ground point moves poleward.
    const [lat60, lat75] = geoViewAngles().elevations.map(item => item.elevationDeg);
    expect(lat60).toBeGreaterThan(lat75);
    expect(lat75).toBeGreaterThan(0);
  });
  it('uses the same teaching orbits as the engine', () => {
    for (const orbit of ORBIT_ROWS) {
      const row = orbitRow(orbit), o = compute({ orbit }).outputs;
      expect(row.altitudeKm).toBeCloseTo(o.altitudeKm, 9);
      expect(row.periodSeconds).toBeCloseTo(o.orbitPeriodSeconds, 6);
      expect(row.lightTimeSeconds).toBeCloseTo(o.lightTimeSeconds, 12);
    }
  });
  it('recovers each orbit row’s distance from its light time and its altitude from its radius', () => {
    for (const orbit of ORBIT_ROWS) {
      const row = orbitRow(orbit), model = compute({ orbit });
      relative(row.lightTimeSeconds * c, model.outputs.slantRangeKm * 1000);
      relative(row.radiusM - R, row.altitudeKm * 1000);
    }
  });
});

describe('story examples: contrast and toy pixel', () => {
  it('matches the hot-to-ground band ratios through a frequency-space integral', () => {
    const { mwirRatio, lwirRatio } = contrastExample();
    relative(mwirRatio, frequencyBand(3.8, 4.8, HOT_GAS_K) / frequencyBand(3.8, 4.8, GROUND_K), 2e-8);
    relative(lwirRatio, frequencyBand(8, 12, HOT_GAS_K) / frequencyBand(8, 12, GROUND_K), 2e-8);
    // The teaching point: hot gas stands out far more in the mid-wave band than in the long-wave band.
    expect(mwirRatio).toBeGreaterThan(20 * lwirRatio);
  });
  it('follows photons to electrons to a whole number by counting thresholds', () => {
    const p = toyPixel();
    expect(p.electrons).toBe(1000 * 0.65);
    let code = 0;
    for (let threshold = 1; threshold < p.levels; threshold++) if (p.electrons >= threshold * p.fullScale / p.levels) code++;
    expect(p.code).toBe(code);
  });
});

describe('story page figures', () => {
  const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const printed = [...html.matchAll(/<(\w+)[^>]*\sdata-calc="([^"]+)"[^>]*>([^<]*)</g)].map(m => [m[2], m[3].trim()] as const);
  const expected: Record<string, string> = storyNumbers();
  it('prints every data-calc figure exactly as the model computes it', () => {
    expect(printed.length).toBeGreaterThan(20);
    for (const [key, text] of printed) {
      expect(expected[key], `unknown data-calc key ${key}`).toBeDefined();
      expect(text, key).toBe(expected[key]);
    }
  });
  it('prints every orbit-table and contrast figure at least once', () => {
    const keys = new Set(printed.map(([key]) => key));
    for (const key of Object.keys(expected)) if (/^(orbit|contrast|pixel|geo):/.test(key)) expect(keys.has(key), `index.html does not print ${key}`).toBe(true);
  });
});
