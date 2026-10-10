// Pure teaching calculations. Hardware figures belong to separately named, cited civil cards.
import { EARTH_EQUATORIAL_RADIUS_M, SIDEREAL_DAY_SECONDS, orbitalPeriodSeconds,
  orbitalRadiusMeters, orbitalSpeedMetersPerSecond, semiMajorAxisMeters, slantRangeMeters } from './orbits';
import { diffractionRadians, integratePlanckBand, lightTimeSeconds, photonEnergyJ } from './radiometry';
import {civilCoolingExample} from './civil-cooling';

export const SCENARIO_OPTIONS = {
  orbit: [{ id: 'geo', label: 'GEO' }, { id: 'heo', label: 'HEO' }, { id: 'meo', label: 'MEO' }, { id: 'leo', label: 'LEO' }],
  aperture: [{ id: 'representative', label: 'Representative' }, { id: 'civil', label: 'Civil twin' }],
  band: [{ id: 'swir', label: 'SWIR' }, { id: 'mwir', label: 'MWIR' }, { id: 'lwir', label: 'LWIR' }],
  detector: [{ id: 'hgcdte', label: 'HgCdTe' }, { id: 'insb', label: 'InSb' }, { id: 't2sl', label: 'T2SL' }, { id: 'qwip', label: 'QWIP' }],
} as const;
export type Scenario = { orbit: string; aperture: string; band: string; detector: string };
export const DEFAULT_SCENARIO: Scenario = { orbit: 'geo', aperture: 'representative', band: 'mwir', detector: 'hgcdte' };

export interface Ev { refs?: [string, string][]; calc?: string; assume?: string }
export type SpecRow = [label: string, value: string, basis: 'reported' | 'derived' | 'assumed', evidence: Ev];

const BANDS: Record<string, { wavelength: number; min: number; max: number }> = {
  swir: { wavelength: 2.0, min: 1.5, max: 2.5 },
  mwir: { wavelength: 4.3, min: 3.8, max: 4.8 },
  lwir: { wavelength: 10.0, min: 8, max: 12 },
};
const ORBIT_REFS: [string, string][] = [
  ['nasa-jpl-parameters', 'Planetary Masses: Earth GM; parameter table: mean sidereal day'],
  ['nasa-earth-facts', 'Bulk parameters: equatorial radius'],
  ['nasa-kepler-derivation', 'Equation 4, Kepler’s Third Law; negligible secondary mass approximation'],
  ['noaa-geo-definition', 'Geostationary orbit definition: 35,786 km reference altitude'],
  ['nasa-orbit-catalog', 'Highly Elliptical Orbits: generic Molniya eccentricity 0.722; this model chooses a half-sidereal-day example'],
];
const CONSTANT_REFS: [string, string][] = [['nist-codata-2022', 'Rows for speed of light, Planck constant and Boltzmann constant']];

function row(label: string, value: string, calc: string, assume: string, refs: [string, string][] = []): SpecRow {
  // Each result owns its evidence arrays, so a consumer cannot alter a later calculation's evidence.
  return [label, value, 'derived', { calc, assume, refs: refs.map(([id, at]) => [id, at]) }];
}

export function compute(input: Partial<Scenario> = {}) {
  const scenario = { ...DEFAULT_SCENARIO };
  for (const key of Object.keys(SCENARIO_OPTIONS) as (keyof Scenario)[]) {
    const id = input[key];
    if (SCENARIO_OPTIONS[key].some(option => option.id === id)) scenario[key] = id!;
  }
  const heo = scenario.orbit === 'heo';
  const eccentricity = heo ? 0.722 : 0;
  const circularAltitudeM = scenario.orbit === 'geo' ? 35786e3 : scenario.orbit === 'meo' ? 20000e3 : 1000e3;
  const semiMajorAxisM = heo ? semiMajorAxisMeters(SIDEREAL_DAY_SECONDS / 2) : EARTH_EQUATORIAL_RADIUS_M + circularAltitudeM;
  const radiusM = orbitalRadiusMeters(semiMajorAxisM, eccentricity, heo ? Math.PI : 0);
  const distanceM = slantRangeMeters(radiusM);
  const band = BANDS[scenario.band];
  const temperatureK = 288;
  const diameterM = scenario.aperture === 'representative' ? 0.30 : null;
  const bandRadiance = integratePlanckBand(band.min * 1e-6, band.max * 1e-6, temperatureK);
  const outputs = {
    orbitPeriodSeconds: orbitalPeriodSeconds(semiMajorAxisM),
    orbitSpeedKmS: orbitalSpeedMetersPerSecond(semiMajorAxisM, radiusM) / 1000,
    altitudeKm: (radiusM - EARTH_EQUATORIAL_RADIUS_M) / 1000,
    perigeeAltitudeKm: (semiMajorAxisM * (1 - eccentricity) - EARTH_EQUATORIAL_RADIUS_M) / 1000,
    apogeeAltitudeKm: (semiMajorAxisM * (1 + eccentricity) - EARTH_EQUATORIAL_RADIUS_M) / 1000,
    slantRangeKm: distanceM / 1000,
    lightTimeSeconds: lightTimeSeconds(distanceM),
    wavelengthMicrometers: band.wavelength,
    bandMinMicrometers: band.min,
    bandMaxMicrometers: band.max,
    apertureDiameterM: diameterM,
    diffractionRadians: diameterM === null ? null : diffractionRadians(band.wavelength * 1e-6, diameterM),
    photonEnergyJ: photonEnergyJ(band.wavelength * 1e-6),
    blackbodyTemperatureK: temperatureK,
    bandRadianceWm2Sr: bandRadiance.radianceWm2Sr,
    bandPhotonRadiancePerSm2Sr: bandRadiance.photonRadiancePerSm2Sr,
    detectorTemperatureK: null,
  };
  const altitudeRefs: [string, string][] = [...ORBIT_REFS,
    ['nasa-orbit-equation', 'Opening discussion: r = a(1 − e²)/(1 + e cos φ)']];
  const claims: Partial<Record<keyof typeof outputs, SpecRow>> = {
    orbitPeriodSeconds: row('Teaching orbit period', `${(outputs.orbitPeriodSeconds / 3600).toFixed(3)} h`, 'orbit-period', 'model-orbits', ORBIT_REFS),
    orbitSpeedKmS: row(heo ? 'Teaching orbital speed at apogee' : 'Teaching circular orbital speed', `${outputs.orbitSpeedKmS.toFixed(3)} km/s`, 'orbit-speed', 'model-orbits',
      [...ORBIT_REFS, ['nasa-jsc-vis-viva', 'PDF p. 173, printed slide 86, Typical Form of Vis-Viva Equation, Eq. (1)']]),
    altitudeKm: row(heo ? 'Teaching altitude at apogee' : 'Teaching circular altitude', `${outputs.altitudeKm.toFixed(0)} km`, 'orbit-altitude', 'model-orbits', altitudeRefs),
    perigeeAltitudeKm: row('Teaching perigee altitude', `${outputs.perigeeAltitudeKm.toFixed(0)} km`, 'orbit-altitude', 'model-orbits', altitudeRefs),
    apogeeAltitudeKm: row('Teaching apogee altitude', `${outputs.apogeeAltitudeKm.toFixed(0)} km`, 'orbit-altitude', 'model-orbits', altitudeRefs),
    slantRangeKm: row('Geometric distance to nadir', `${outputs.slantRangeKm.toFixed(0)} km`, 'orbit-slant-range', 'model-nadir', ORBIT_REFS),
    lightTimeSeconds: row('One-way vacuum light time', `${outputs.lightTimeSeconds.toFixed(4)} s`, 'vacuum-light-time', 'model-nadir', CONSTANT_REFS),
    wavelengthMicrometers: ['Teaching wavelength', `${band.wavelength.toFixed(1)} μm`, 'assumed', { assume: 'model-band-examples' }],
    bandMinMicrometers: ['Teaching band lower bound', `${band.min.toFixed(1)} μm`, 'assumed', { assume: 'model-band-examples' }],
    bandMaxMicrometers: ['Teaching band upper bound', `${band.max.toFixed(1)} μm`, 'assumed', { assume: 'model-band-examples' }],
    photonEnergyJ: row('Energy per photon', `${outputs.photonEnergyJ.toExponential(3)} J`, 'photon-energy', 'model-band-examples',
      [...CONSTANT_REFS, ['nasa-em-math', 'Activity 47, PDF p. 112: E = hν and wavelength × frequency = c']]),
    blackbodyTemperatureK: ['Ideal blackbody temperature', `${temperatureK} K`, 'assumed', { assume: 'model-blackbody' }],
    bandRadianceWm2Sr: row('Ideal blackbody band radiance', `${outputs.bandRadianceWm2Sr.toPrecision(4)} W m⁻² sr⁻¹`, 'planck-band-radiance', 'model-blackbody',
      [...CONSTANT_REFS, ['noaa-planck-function', 'First formula image: wavelength-form Planck law and spectral radiance units']]),
    bandPhotonRadiancePerSm2Sr: row('Ideal blackbody photon radiance', `${outputs.bandPhotonRadiancePerSm2Sr.toExponential(3)} photons s⁻¹ m⁻² sr⁻¹`, 'planck-band-photons', 'model-blackbody',
      [...CONSTANT_REFS, ['noaa-planck-function', 'First formula image; energy radiance divided by hc/λ before integration']]),
  };
  if (diameterM !== null && outputs.diffractionRadians !== null) {
    claims.apertureDiameterM = ['Ideal laboratory aperture', `${diameterM.toFixed(2)} m`, 'assumed', { assume: 'model-lab-aperture' }];
    claims.diffractionRadians = row('Ideal laboratory diffraction angle', `${(outputs.diffractionRadians * 1e6).toFixed(2)} μrad`, 'ideal-diffraction', 'model-lab-aperture',
      [['nasa-em-math', 'Activity 46, PDF p. 110: θ = 1.22 λ/D']]);
  }
  return {
    scenario,
    status: 'educational' as const,
    scope: 'Independent mathematical examples of orbit geometry, vacuum light travel, ideal diffraction, and ideal blackbody radiation. No real sensor performance is calculated.',
    orbitPosition: heo ? 'Apogee of the teaching ellipse' : 'Circular teaching orbit',
    outputs, claims, specs: Object.values(claims) as SpecRow[],
    examples:{civilCooling:civilCoolingExample()},
    assumptions: ['model-orbits', 'model-nadir', 'model-band-examples', 'model-blackbody',
      ...(diameterM === null ? [] : ['model-lab-aperture'])],
    unavailable: {
      aperture: diameterM === null ? 'The ABI aperture was not verified in the opened sources. No civil diameter or diffraction value is supplied.' : null,
      detectorTemperature: 'A material name does not define an operating temperature. Published civil temperatures belong to the explicitly named instrument; selecting QWIP does not assign the TIRS-2 temperature.',
      performance: 'This model does not supply detection thresholds, sensor photon counts, signal-to-noise ratios, ground resolution, coverage, revisit, array format, frame rate, cryocooler power, or warning latency.',
    },
  };
}
