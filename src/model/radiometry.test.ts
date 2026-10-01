import { describe, expect, it } from 'vitest';
import { BOLTZMANN_J_K, SPEED_OF_LIGHT_M_S, carnotRefrigeratorCOP, diffractionRadians,
  integratePlanckBand, lightTimeSeconds, photonEnergyJ, planckPhotonSpectralRadiance, planckSpectralRadiance } from './radiometry';

describe('ideal radiation in SI units', () => {
  it('pins vacuum travel time and photon energy independently of the scenario', () => {
    expect(lightTimeSeconds(299792458)).toBe(1);
    expect(lightTimeSeconds(0)).toBe(0);
    expect(photonEnergyJ(1e-6) / 1.9864458571489286e-19).toBeCloseTo(1, 14);
  });
  it('pins the 300 K, 10 μm Planck density in per-micrometer units', () => {
    expect(planckSpectralRadiance(10e-6, 300) * 1e-6).toBeCloseTo(9.92403333, 7);
  });
  it('converges to the Rayleigh-Jeans limit at long wavelengths', () => {
    const rayleighJeans = 2 * SPEED_OF_LIGHT_M_S * BOLTZMANN_J_K * 300;
    expect(planckSpectralRadiance(1, 300) / rayleighJeans).toBeCloseTo(1, 4);
  });
  it('returns zero at absolute zero and underflows cleanly on the far Wien tail', () => {
    expect(planckSpectralRadiance(10e-6, 0)).toBe(0);
    expect(planckSpectralRadiance(1e-9, 3)).toBe(0);
  });
  it('integrates to the Stefan-Boltzmann law after the hemispheric π factor', () => {
    const sigma = 5.670374419e-8; // NIST CODATA 2022, W m^-2 K^-4.
    for (const temperature of [100, 300, 1000]) {
      const integral = integratePlanckBand(1e-9, 0.1, temperature, 2048);
      expect(Math.PI * integral.radianceWm2Sr / (sigma * temperature ** 4)).toBeCloseTo(1, 8);
    }
  });
  it('integrates a narrow band with the correct wavelength dimension', () => {
    const low = 9.999e-6, high = 10.001e-6;
    const integrated = integratePlanckBand(low, high, 300).radianceWm2Sr;
    const midpoint = planckSpectralRadiance(10e-6, 300) * (high - low);
    expect(integrated / midpoint).toBeCloseTo(1, 7);
  });
  it('conserves energy when converting a monochromatic density to photon units', () => {
    for (const wavelength of [0.5e-6, 4.3e-6, 10e-6]) {
      const photons = planckPhotonSpectralRadiance(wavelength, 600);
      expect(photons * photonEnergyJ(wavelength) / planckSpectralRadiance(wavelength, 600)).toBeCloseTo(1, 14);
    }
  });
  it('places a finite-band mean photon energy between the endpoint energies', () => {
    const band = integratePlanckBand(8e-6, 12e-6, 288);
    const meanEnergy = band.radianceWm2Sr / band.photonRadiancePerSm2Sr;
    expect(meanEnergy).toBeGreaterThan(photonEnergyJ(12e-6));
    expect(meanEnergy).toBeLessThan(photonEnergyJ(8e-6));
  });
  it('converges under quadrature refinement and gives an empty band zero radiance', () => {
    const coarse = integratePlanckBand(3.8e-6, 4.8e-6, 288, 128);
    const fine = integratePlanckBand(3.8e-6, 4.8e-6, 288, 512);
    expect(coarse.radianceWm2Sr / fine.radianceWm2Sr).toBeCloseTo(1, 8);
    expect(integratePlanckBand(1e-6, 1e-6, 288)).toEqual({ radianceWm2Sr: 0, photonRadiancePerSm2Sr: 0 });
  });
  it('checks the diffraction scaling and refrigerator limit as independent ideal formulas', () => {
    expect(diffractionRadians(500e-9, 0.1)).toBeCloseTo(6.1e-6, 12);
    expect(diffractionRadians(500e-9, 0.2)).toBeCloseTo(3.05e-6, 12);
    expect(carnotRefrigeratorCOP(100, 300)).toBe(0.5);
  });
  it('rejects invalid physical inputs and integration settings', () => {
    for (const invalid of [0, -1, NaN, Infinity]) expect(() => photonEnergyJ(invalid)).toThrow(RangeError);
    expect(() => planckSpectralRadiance(1e-6, -1)).toThrow(RangeError);
    expect(() => integratePlanckBand(2e-6, 1e-6, 300)).toThrow(RangeError);
    expect(() => integratePlanckBand(1e-6, 2e-6, 300, 3)).toThrow(RangeError);
    expect(() => diffractionRadians(1e-6, 0)).toThrow(RangeError);
    expect(() => lightTimeSeconds(-1)).toThrow(RangeError);
    expect(() => carnotRefrigeratorCOP(100, 100)).toThrow(RangeError);
  });
});
