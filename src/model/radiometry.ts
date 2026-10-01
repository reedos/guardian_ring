// SI throughout: wavelength in meters, temperature in kelvins. Radiance is per steradian.
// These functions describe ideal radiation and optics, not a sensor or a launch.
export const SPEED_OF_LIGHT_M_S = 299792458;
export const PLANCK_J_S = 6.62607015e-34;
export const BOLTZMANN_J_K = 1.380649e-23;

function positive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and positive`);
}
function temperature(value: number) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Temperature must be finite and nonnegative');
}

export function lightTimeSeconds(distanceM: number): number {
  if (!Number.isFinite(distanceM) || distanceM < 0) throw new RangeError('Distance must be finite and nonnegative');
  return distanceM / SPEED_OF_LIGHT_M_S;
}

export function photonEnergyJ(wavelengthM: number): number {
  positive(wavelengthM, 'Wavelength');
  return PLANCK_J_S * SPEED_OF_LIGHT_M_S / wavelengthM;
}

/** Small-angle Airy first-minimum radius for an ideal, unobstructed circular aperture. */
export function diffractionRadians(wavelengthM: number, diameterM: number): number {
  positive(wavelengthM, 'Wavelength');
  positive(diameterM, 'Diameter');
  return 1.22 * wavelengthM / diameterM;
}

/** B_lambda in W m^-2 sr^-1 m^-1. Multiply by 1e-6 for a per-micrometer density. */
export function planckSpectralRadiance(wavelengthM: number, temperatureK: number): number {
  positive(wavelengthM, 'Wavelength');
  temperature(temperatureK);
  if (temperatureK === 0) return 0;
  const x = PLANCK_J_S * SPEED_OF_LIGHT_M_S / (wavelengthM * BOLTZMANN_J_K * temperatureK);
  // log(expm1(x)) retains the Rayleigh-Jeans limit and avoids exponential overflow on the Wien tail.
  const logDenominator = x > 50 ? x + Math.log1p(-Math.exp(-x)) : Math.log(Math.expm1(x));
  return Math.exp(Math.log(2 * PLANCK_J_S * SPEED_OF_LIGHT_M_S ** 2) - 5 * Math.log(wavelengthM) - logDenominator);
}

/** Photon spectral radiance in photons s^-1 m^-2 sr^-1 m^-1. */
export function planckPhotonSpectralRadiance(wavelengthM: number, temperatureK: number): number {
  return planckSpectralRadiance(wavelengthM, temperatureK) / photonEnergyJ(wavelengthM);
}

export interface BandRadiance {
  radianceWm2Sr: number;
  photonRadiancePerSm2Sr: number;
}

/** Integrate an ideal top-hat band with composite Simpson quadrature in log wavelength. */
export function integratePlanckBand(minWavelengthM: number, maxWavelengthM: number,
  temperatureK: number, intervals = 512): BandRadiance {
  positive(minWavelengthM, 'Minimum wavelength');
  positive(maxWavelengthM, 'Maximum wavelength');
  temperature(temperatureK);
  if (maxWavelengthM < minWavelengthM) throw new RangeError('Band bounds must be ordered');
  if (!Number.isInteger(intervals) || intervals < 2 || intervals % 2 || intervals > 65536) {
    throw new RangeError('Quadrature intervals must be an even integer from 2 through 65536');
  }
  if (maxWavelengthM === minWavelengthM || temperatureK === 0) {
    return { radianceWm2Sr: 0, photonRadiancePerSm2Sr: 0 };
  }
  const start = Math.log(minWavelengthM);
  const step = (Math.log(maxWavelengthM) - start) / intervals;
  let energy = 0, photons = 0;
  for (let i = 0; i <= intervals; i++) {
    const wavelength = Math.exp(start + i * step);
    const weight = i === 0 || i === intervals ? 1 : i % 2 ? 4 : 2;
    // d(lambda) = lambda d(log(lambda)); omitting this Jacobian gives the wrong dimensions.
    const contribution = weight * wavelength * planckSpectralRadiance(wavelength, temperatureK);
    energy += contribution;
    photons += contribution / photonEnergyJ(wavelength);
  }
  return { radianceWm2Sr: energy * step / 3, photonRadiancePerSm2Sr: photons * step / 3 };
}

/** Ideal refrigeration limit; no efficiency or cryocooler performance is assumed. */
export function carnotRefrigeratorCOP(coldTemperatureK: number, hotTemperatureK: number): number {
  positive(coldTemperatureK, 'Cold temperature');
  positive(hotTemperatureK, 'Hot temperature');
  if (hotTemperatureK <= coldTemperatureK) throw new RangeError('Hot temperature must exceed cold temperature');
  return coldTemperatureK / (hotTemperatureK - coldTemperatureK);
}
