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
