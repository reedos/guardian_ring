// Numbers the story page prints, all computed here from the same teaching model the explorer uses.
// src/model/story-examples.test.ts reads index.html and fails if a data-calc figure drifts from this file.
// Plain JS with explicit .ts imports so the Node gates (look, claims) can load it without a bundler.
import { EARTH_EQUATORIAL_RADIUS_M, SIDEREAL_DAY_SECONDS, elevationAboveHorizonDegrees, horizonCentralAngleDegrees, orbitalPeriodSeconds,
  orbitalRadiusMeters, semiMajorAxisMeters, slantRangeMeters, visibleSurfaceFraction } from './orbits.ts';
import { integratePlanckBand, lightTimeSeconds } from './radiometry.ts';
import { chargeSample } from './cinematic-physics.js';

export const GROUND_K = 288;
export const HOT_GAS_K = 1000;
export const MWIR_BAND_UM = [3.8, 4.8];
export const LWIR_BAND_UM = [8, 12];
export const VIEW_LATITUDES_DEG = [60, 75];
export const TOY_PIXEL = { photons: 1000, efficiency: 0.65, fullScaleElectrons: 1000, levels: 8 };

const group = n => Math.round(n).toLocaleString('en-US');
const sig = (n, digits) => {
  const scale = 10 ** (Math.floor(Math.log10(Math.abs(n))) - digits + 1);
  return Math.round(n / scale) * scale;
};
const hoursMinutes = seconds => {
  const minutes = Math.round(seconds / 60);
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};
const milliseconds = seconds => seconds * 1000 < 10 ? `${(seconds * 1000).toFixed(1)} ms` : `${Math.round(seconds * 1000)} ms`;

export const ORBIT_ROWS = ['geo', 'heo', 'meo', 'leo'];
// The same teaching orbits as src/model/engine.ts (model-orbits assumption); story-examples.test.ts compares them with compute().
const CIRCULAR_ALTITUDE_M = { geo: 35786e3, meo: 20000e3, leo: 1000e3 };

export function orbitRow(id) {
  const heo = id === 'heo';
  const semiMajorAxisM = heo ? semiMajorAxisMeters(SIDEREAL_DAY_SECONDS / 2) : EARTH_EQUATORIAL_RADIUS_M + CIRCULAR_ALTITUDE_M[id];
  const radiusM = orbitalRadiusMeters(semiMajorAxisM, heo ? 0.722 : 0, heo ? Math.PI : 0);
  const o = { altitudeKm: (radiusM - EARTH_EQUATORIAL_RADIUS_M) / 1000, orbitPeriodSeconds: orbitalPeriodSeconds(semiMajorAxisM),
    lightTimeSeconds: lightTimeSeconds(slantRangeMeters(radiusM)) };
  return {
    id, radiusM, altitudeKm: o.altitudeKm, periodSeconds: o.orbitPeriodSeconds, lightTimeSeconds: o.lightTimeSeconds,
    shareOfEarth: visibleSurfaceFraction(radiusM),
    text: {
      altitude: id === 'heo' ? `${group(o.altitudeKm)} km at apogee` : `${group(o.altitudeKm)} km`,
      period: hoursMinutes(o.orbitPeriodSeconds),
      share: `${Math.round(visibleSurfaceFraction(radiusM) * 100)}%`,
      light: milliseconds(o.lightTimeSeconds),
    },
  };
}

/** Geostationary orbit worked out from the sidereal day alone (Kepler's third law), the check beside the NOAA and NASA definitions. */
export function geoFromSiderealDay() {
  const radiusM = semiMajorAxisMeters(SIDEREAL_DAY_SECONDS);
  return { siderealDaySeconds: SIDEREAL_DAY_SECONDS, radiusM, altitudeKm: (radiusM - EARTH_EQUATORIAL_RADIUS_M) / 1000, earthRadiusKm: EARTH_EQUATORIAL_RADIUS_M / 1000 };
}

export function geoViewAngles() {
  const radiusM = orbitRow('geo').radiusM;
  return {
    radiusM,
    elevations: VIEW_LATITUDES_DEG.map(lat => ({ lat, elevationDeg: elevationAboveHorizonDegrees(radiusM, lat * Math.PI / 180) })),
    limbDeg: horizonCentralAngleDegrees(radiusM),
  };
}

export function contrastExample() {
  const band = (range, kelvin) => integratePlanckBand(range[0] * 1e-6, range[1] * 1e-6, kelvin).radianceWm2Sr;
  const mwir = { ground: band(MWIR_BAND_UM, GROUND_K), hot: band(MWIR_BAND_UM, HOT_GAS_K) };
  const lwir = { ground: band(LWIR_BAND_UM, GROUND_K), hot: band(LWIR_BAND_UM, HOT_GAS_K) };
  return { mwir, lwir, mwirRatio: mwir.hot / mwir.ground, lwirRatio: lwir.hot / lwir.ground };
}

export function toyPixel() {
  const t = TOY_PIXEL;
  const sample = chargeSample(t.photons, t.efficiency, 1, t.fullScaleElectrons, t.levels);
  return { photons: t.photons, electrons: sample.charge, code: sample.code, levels: t.levels, fullScale: t.fullScaleElectrons };
}


/** Every figure the story page prints with a data-calc attribute, as the exact display string. */
export function storyNumbers() {
  const out = {};
  for (const id of ORBIT_ROWS) {
    const row = orbitRow(id);
    out[`orbit:${id}:altitude`] = row.text.altitude;
    out[`orbit:${id}:period`] = row.text.period;
    out[`orbit:${id}:share`] = row.text.share;
    out[`orbit:${id}:light`] = row.text.light;
  }
  const check = geoFromSiderealDay();
  out['geo:check:sidereal'] = `${group(check.siderealDaySeconds)} s`;
  out['geo:check:radius'] = `${group(check.radiusM / 1000)} km`;
  out['geo:check:earth'] = `${group(check.earthRadiusKm)} km`;
  out['geo:check:altitude'] = `${group(check.altitudeKm)} km`;
  const view = geoViewAngles();
  for (const { lat, elevationDeg } of view.elevations) out[`geo:elevation:${lat}`] = `${Math.round(elevationDeg)}°`;
  out['geo:limb'] = `${Math.round(view.limbDeg)}°`;
  const c = contrastExample();
  const r = n => n >= 1000 ? group(sig(n, 3)) : n >= 100 ? String(Math.round(n)) : n >= 10 ? n.toFixed(1) : n >= 1 ? n.toFixed(2) : n.toPrecision(3);
  out['contrast:mwir:ground'] = r(c.mwir.ground);
  out['contrast:mwir:hot'] = r(c.mwir.hot);
  out['contrast:lwir:ground'] = r(c.lwir.ground);
  out['contrast:lwir:hot'] = r(c.lwir.hot);
  out['contrast:mwir:ratio'] = group(sig(c.mwirRatio, 2));
  out['contrast:lwir:ratio'] = group(sig(c.lwirRatio, 2));
  const p = toyPixel();
  out['pixel:photons'] = group(p.photons);
  out['pixel:electrons'] = group(p.electrons);
  out['pixel:exact'] = (p.electrons / p.fullScale * p.levels).toFixed(1);
  out['pixel:code'] = String(p.code);
  out['pixel:levels'] = String(p.levels);
  out['pixel:fullscale'] = group(p.fullScale);
  return out;
}
