import { describe, expect, it } from 'vitest';
import { EARTH_EQUATORIAL_RADIUS_M, SIDEREAL_DAY_SECONDS, orbitalPeriodSeconds,
  orbitalRadiusMeters, semiMajorAxisMeters, slantRangeMeters } from './orbits';

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
  });
});
