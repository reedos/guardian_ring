import { describe, expect, it } from 'vitest';
import { compute, DEFAULT_SCENARIO, SCENARIO_OPTIONS } from './engine';
import { MODEL_ASSUMPTIONS, MODEL_CALCS } from './evidence.js';
import { SOURCES } from '../sources.js';

describe('the educational scenario contract', () => {
  it('normalizes unsupported values without mutating its input', () => {
    const input = { ...DEFAULT_SCENARIO, orbit: 'unknown', band: 'lwir' };
    expect(compute(input).scenario).toEqual({ ...DEFAULT_SCENARIO, band: 'lwir' });
    expect(input.orbit).toBe('unknown');
  });
  it('pins the general GEO example to a sidereal day and about 119 ms at nadir', () => {
    const result = compute().outputs;
    expect(result.orbitPeriodSeconds).toBeCloseTo(86164, -1);
    expect(result.altitudeKm).toBeCloseTo(35786, 7);
    expect(result.lightTimeSeconds).toBeCloseTo(0.119369, 6);
    expect(result.orbitSpeedKmS).toBeCloseTo(3.074661, 6);
  });

  it('uses apogee consistently for the teaching ellipse, with about an 11 h 58 min period', () => {
    const result = compute({ orbit: 'heo' });
    expect(result.orbitPosition).toContain('Apogee');
    expect(result.outputs.orbitPeriodSeconds / 3600).toBeCloseTo(11.9672, 4);
    expect(result.outputs.perigeeAltitudeKm).toBeGreaterThan(0);
    expect(result.outputs.altitudeKm).toBeCloseTo(result.outputs.apogeeAltitudeKm, 7);
    expect(result.outputs.apogeeAltitudeKm).toBeGreaterThan(result.outputs.perigeeAltitudeKm);
    expect(result.outputs.slantRangeKm).toBeCloseTo(result.outputs.apogeeAltitudeKm, 7);
    expect(result.outputs.orbitSpeedKmS).toBeCloseTo(1.556490, 6);
    expect(result.claims.orbitSpeedKmS![0]).toContain('at apogee');
  });

  it('attaches speed to the physical orbit example and its equation, independently of optical choices', () => {
    for (const orbit of SCENARIO_OPTIONS.orbit) {
      const reference = compute({ orbit: orbit.id });
      for (const band of SCENARIO_OPTIONS.band) for (const detector of SCENARIO_OPTIONS.detector) {
        expect(compute({ orbit: orbit.id, band: band.id, detector: detector.id, aperture: 'civil' }).outputs.orbitSpeedKmS)
          .toBe(reference.outputs.orbitSpeedKmS);
      }
      const claim = reference.claims.orbitSpeedKmS!;
      expect(claim[1]).toBe(`${reference.outputs.orbitSpeedKmS.toFixed(3)} km/s`);
      expect(claim[2]).toBe('derived');
      expect(claim[3]).toMatchObject({ calc: 'orbit-speed', assume: 'model-orbits' });
      expect(claim[3].refs?.some(([id]) => id === 'nasa-jsc-vis-viva')).toBe(true);
      expect(orbit.id === 'heo' ? claim[0].includes('apogee') : claim[0].includes('circular')).toBe(true);
    }
    expect(compute({ orbit: 'leo' }).outputs.orbitSpeedKmS).toBeGreaterThan(compute({ orbit: 'meo' }).outputs.orbitSpeedKmS);
    expect(compute({ orbit: 'meo' }).outputs.orbitSpeedKmS).toBeGreaterThan(compute({ orbit: 'geo' }).outputs.orbitSpeedKmS);
  });

  it('does not convert a detector material into an instrument temperature', () => {
    for (const detector of SCENARIO_OPTIONS.detector) {
      expect(compute({ detector: detector.id }).outputs.detectorTemperatureK).toBeNull();
      expect(compute({ detector: detector.id, aperture: 'civil' }).outputs.detectorTemperatureK).toBeNull();
    }
  });

  it('leaves an unverified civil aperture and its diffraction value unavailable', () => {
    const result = compute({ aperture: 'civil' });
    expect(result.outputs.apertureDiameterM).toBeNull();
    expect(result.outputs.diffractionRadians).toBeNull();
    expect(result.unavailable.aperture).toContain('not verified');
    expect(result.claims.apertureDiameterM).toBeUndefined();
    expect(result.claims.diffractionRadians).toBeUndefined();
  });

  it('keeps source radiance and photon energy independent of orbit and detector selection', () => {
    const baseline = compute().outputs;
    for (const orbit of SCENARIO_OPTIONS.orbit) for (const detector of SCENARIO_OPTIONS.detector) {
      const result = compute({ orbit: orbit.id, detector: detector.id, aperture: 'civil' }).outputs;
      expect(result.bandRadianceWm2Sr).toBe(baseline.bandRadianceWm2Sr);
      expect(result.bandPhotonRadiancePerSm2Sr).toBe(baseline.bandPhotonRadiancePerSm2Sr);
      expect(result.photonEnergyJ).toBe(baseline.photonEnergyJ);
    }
  });

  it('traces every numeric output across every declared combination', () => {
    const calcs = MODEL_CALCS as Record<string, unknown>;
    const assumptions = MODEL_ASSUMPTIONS as Record<string, unknown>;
    const sources = SOURCES as Record<string, { status: string }>;
    for (const orbit of SCENARIO_OPTIONS.orbit) for (const aperture of SCENARIO_OPTIONS.aperture)
      for (const band of SCENARIO_OPTIONS.band) for (const detector of SCENARIO_OPTIONS.detector) {
        const scenario = { orbit: orbit.id, aperture: aperture.id, band: band.id, detector: detector.id };
        const result = compute(scenario);
        expect(result.scenario).toEqual(scenario);
        for (const [key, value] of Object.entries(result.outputs)) {
          if (value === null) continue;
          expect(Number.isFinite(value), key).toBe(true);
          expect(value, key).toBeGreaterThan(0);
          expect(result.claims[key as keyof typeof result.outputs], key).toBeDefined();
        }
        for (const [, , basis, ev] of result.specs) {
          if (basis === 'derived') expect(calcs[ev.calc!]).toBeDefined();
          if (basis === 'assumed') expect(assumptions[ev.assume!]).toBeDefined();
          for (const [id, locator] of ev.refs || []) {
            expect(sources[id]?.status, id).toBe('verified');
            expect(locator.length).toBeGreaterThan(0);
          }
        }
      }
  });

  it('gives each result its own writable evidence and output objects', () => {
    const result = compute();
    result.scenario.orbit = 'leo';
    result.outputs.orbitPeriodSeconds = 0;
    result.claims.orbitPeriodSeconds![3].refs![0][0] = 'changed';
    const fresh = compute();
    expect(fresh.scenario).toEqual(DEFAULT_SCENARIO);
    expect(fresh.outputs.orbitPeriodSeconds).toBeGreaterThan(86000);
    expect(fresh.claims.orbitPeriodSeconds![3].refs![0][0]).toBe('nasa-jpl-parameters');
  });
});

// Independent re-derivation (accuracy review 10/10/2026): values computed outside the engine with
// μ = 398600.435507 km³ s⁻², R = 6378.137 km, exact SI h, c, k and a 200,000-step trapezoid Planck integral.
describe('displayed teaching values match an independent re-derivation', () => {
  const expected: Record<string, [string, string, string, string]> = {
    geo: ['23.934 h', '3.075 km/s', '35786 km', '0.1194 s'],
    heo: ['11.967 h', '1.556 km/s', '39361 km', '0.1313 s'],
    meo: ['11.843 h', '3.887 km/s', '20000 km', '0.0667 s'],
    leo: ['1.752 h', '7.350 km/s', '1000 km', '0.0033 s'],
  };
  it.each(Object.entries(expected))('%s orbit strings', (orbit, [period, speed, altitude, light]) => {
    const { claims } = compute({ orbit });
    expect([claims.orbitPeriodSeconds![1], claims.orbitSpeedKmS![1], claims.altitudeKm![1], claims.lightTimeSeconds![1]])
      .toEqual([period, speed, altitude, light]);
  });
  it('places the teaching Molniya perigee near 1,006 km', () => {
    expect(compute({ orbit: 'heo' }).claims.perigeeAltitudeKm![1]).toBe('1006 km');
  });
  const bands: Record<string, [string, string, string, string]> = {
    swir: ['9.932e-20 J', '0.0003730 W m⁻² sr⁻¹', '4.449e+15 photons s⁻¹ m⁻² sr⁻¹', '8.13 μrad'],
    mwir: ['4.620e-20 J', '0.7708 W m⁻² sr⁻¹', '1.715e+19 photons s⁻¹ m⁻² sr⁻¹', '17.49 μrad'],
    lwir: ['1.986e-20 J', '31.39 W m⁻² sr⁻¹', '1.583e+21 photons s⁻¹ m⁻² sr⁻¹', '40.67 μrad'],
  };
  it.each(Object.entries(bands))('%s radiation strings', (band, [photon, radiance, photons, diffraction]) => {
    const { claims } = compute({ band });
    expect([claims.photonEnergyJ![1], claims.bandRadianceWm2Sr![1], claims.bandPhotonRadiancePerSm2Sr![1], claims.diffractionRadians![1]])
      .toEqual([photon, radiance, photons, diffraction]);
  });
});
describe('ideal civil-temperature cooling example matches an independent re-derivation', () => {
  it('uses COP = 43/(300 − 43), W = 257/43 W and Qhot = 1 + W', () => {
    const e = compute().examples.civilCooling;
    expect(e.idealCOP).toBeCloseTo(43 / 257, 14);
    expect(e.idealCOP.toFixed(4)).toBe('0.1673');
    expect(e.minimumWorkW.toFixed(3)).toBe('5.977');
    expect(e.rejectedHeatW.toFixed(3)).toBe('6.977');
  });
});
