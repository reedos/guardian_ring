import { describe, expect, it } from 'vitest';
import { EARTH_EQUATORIAL_RADIUS_M, SIDEREAL_DAY_SECONDS, eccentricAnomalyRadians, meanAnomalyRadians,
  orbitalPeriodSeconds, orbitalPlanePosition, orbitalRadiusMeters, semiMajorAxisMeters, slantRangeMeters } from './orbits';

describe('general two-body orbit mathematics', () => {
  it('matches the published GEO radius to a sidereal period', () => {
    expect(orbitalPeriodSeconds(42164e3)).toBeCloseTo(SIDEREAL_DAY_SECONDS, -1);
    expect(semiMajorAxisMeters(SIDEREAL_DAY_SECONDS) / 1000).toBeCloseTo(42164.17, 1);
  });
  it('obeys Kepler scaling when the semi-major axis doubles', () => {
    expect(orbitalPeriodSeconds(2e7) / orbitalPeriodSeconds(1e7)).toBeCloseTo(Math.sqrt(8), 12);
  });
  it('locates the extrema of an ellipse and the quadrature point', () => {
    expect(orbitalRadiusMeters(10, 0.6, 0)).toBeCloseTo(4, 12);
    expect(orbitalRadiusMeters(10, 0.6, Math.PI)).toBeCloseTo(16, 12);
    expect(orbitalRadiusMeters(10, 0.6, Math.PI / 2)).toBeCloseTo(6.4, 12);
  });
  it('recovers a circular radius at every angle', () => {
    for (const angle of [0, 0.1, 1, Math.PI, 5.7]) expect(orbitalRadiusMeters(7e6, 0, angle)).toBe(7e6);
  });
  it('solves Kepler’s equation across circular, drawn, and high-eccentricity ellipses', () => {
    for (const e of [0, 0.5, 0.722, 0.95, 0.999999]) {
      for (const mean of [-Math.PI, -2, -0.25, -1e-6, 0, 1e-6, 0.25, 2, Math.PI]) {
        const eccentric = eccentricAnomalyRadians(mean, e);
        expect(eccentric - e * Math.sin(eccentric)).toBeCloseTo(mean, 13);
        expect(eccentricAnomalyRadians(-mean, e)).toBeCloseTo(-eccentric, 12);
      }
    }
  });
  it('advances mean anomaly uniformly, wraps revolutions, and preserves phase on reverse time', () => {
    expect(meanAnomalyRadians(0, 8, 0.4)).toBe(0.4);
    expect(meanAnomalyRadians(2, 8)).toBeCloseTo(Math.PI / 2, 14);
    expect(meanAnomalyRadians(10, 8)).toBeCloseTo(Math.PI / 2, 14);
    expect(meanAnomalyRadians(-2, 8)).toBeCloseTo(-Math.PI / 2, 14);
    expect(Number.isFinite(meanAnomalyRadians(Number.MAX_VALUE, 8))).toBe(true);
  });
  it('places pericenter and apocenter about the focus and agrees with the polar radius', () => {
    const near = orbitalPlanePosition(10, 0.6, 0), far = orbitalPlanePosition(10, 0.6, Math.PI);
    expect(near.x).toBeCloseTo(4, 13); expect(near.y).toBe(0);
    expect(far.x).toBeCloseTo(-16, 13); expect(far.y).toBeCloseTo(0, 13);
    for (const mean of [0.2, 1, 2, 4.5]) {
      const point = orbitalPlanePosition(10, 0.6, mean);
      expect(point.radius).toBeCloseTo(orbitalRadiusMeters(10, 0.6, Math.atan2(point.y, point.x)), 12);
      expect(((point.x + 6) / 10) ** 2 + (point.y / 8) ** 2).toBeCloseTo(1, 12);
      const repeated = orbitalPlanePosition(10, 0.6, mean + 2 * Math.PI);
      expect(repeated.x).toBeCloseTo(point.x, 12); expect(repeated.y).toBeCloseTo(point.y, 12);
    }
  });
  it('sweeps equal areas per unit mean anomaly and moves faster near pericenter', () => {
    const a = 10, e = 0.6, step = 1e-5;
    for (const mean of [0, 0.7, 1.9, Math.PI]) {
      const p = orbitalPlanePosition(a, e, mean), next = orbitalPlanePosition(a, e, mean + step), previous = orbitalPlanePosition(a, e, mean - step);
      const dx = (next.x - previous.x) / (2 * step), dy = (next.y - previous.y) / (2 * step);
      expect(p.x * dy - p.y * dx).toBeCloseTo(a * a * Math.sqrt(1 - e * e), 6);
    }
    const near = orbitalPlanePosition(a, e, step), far = orbitalPlanePosition(a, e, Math.PI + step);
    expect(Math.abs(near.y / far.y)).toBeCloseTo((1 + e) / (1 - e), 7);
  });
  it('computes nadir and ordinary triangle distances without cancellation', () => {
    expect(slantRangeMeters(EARTH_EQUATORIAL_RADIUS_M + 0.001)).toBeCloseTo(0.001, 8);
    expect(slantRangeMeters(4, Math.PI / 2, 3)).toBeCloseTo(5, 12);
    expect(slantRangeMeters(4, Math.PI, 3)).toBeCloseTo(7, 12);
  });
  it('rejects invalid or non-elliptic geometry', () => {
    for (const invalid of [0, -1, NaN, Infinity]) expect(() => orbitalPeriodSeconds(invalid)).toThrow(RangeError);
    for (const invalid of [-0.1, 1, 2, NaN]) expect(() => orbitalRadiusMeters(1e7, invalid, 0)).toThrow(RangeError);
    expect(() => slantRangeMeters(1)).toThrow(RangeError);
    expect(() => slantRangeMeters(1e7, -0.1)).toThrow(RangeError);
    expect(() => slantRangeMeters(1e7, Math.PI + 0.1)).toThrow(RangeError);
    expect(() => meanAnomalyRadians(1, 0)).toThrow(RangeError);
    expect(() => meanAnomalyRadians(Infinity, 1)).toThrow(RangeError);
    expect(() => meanAnomalyRadians(0, 1, NaN)).toThrow(RangeError);
    expect(() => eccentricAnomalyRadians(NaN, 0.5)).toThrow(RangeError);
    expect(() => orbitalPlanePosition(1, 1, 0)).toThrow(RangeError);
    expect(() => orbitalPlanePosition(0, 0.5, 0)).toThrow(RangeError);
  });
});
