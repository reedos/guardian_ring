// General two-body geometry. No constellation coverage or real spacecraft state is modeled.
// NASA/JPL sources and the spherical-Earth assumption are cataloged in model/evidence.js.
export const EARTH_GM_M3_S2 = 398600.435507e9;
export const EARTH_EQUATORIAL_RADIUS_M = 6378.137e3;
export const SIDEREAL_DAY_SECONDS = 86164.09054;

function positive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and positive`);
}

/** Keplerian period for a negligible-mass body, with distance measured from the central body's center. */
export function orbitalPeriodSeconds(semiMajorAxisM: number, gmM3S2 = EARTH_GM_M3_S2): number {
  positive(semiMajorAxisM, 'Semi-major axis');
  positive(gmM3S2, 'Gravitational parameter');
  return 2 * Math.PI * Math.sqrt(semiMajorAxisM ** 3 / gmM3S2);
}

export function semiMajorAxisMeters(periodSeconds: number, gmM3S2 = EARTH_GM_M3_S2): number {
  positive(periodSeconds, 'Period');
  positive(gmM3S2, 'Gravitational parameter');
  return Math.cbrt(gmM3S2 * (periodSeconds / (2 * Math.PI)) ** 2);
}

/** Radius at a true anomaly in radians; this is ellipse geometry, not an ephemeris. */
export function orbitalRadiusMeters(semiMajorAxisM: number, eccentricity: number, trueAnomalyRadians: number): number {
  positive(semiMajorAxisM, 'Semi-major axis');
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError('Elliptic eccentricity must be finite and in [0, 1)');
  }
  if (!Number.isFinite(trueAnomalyRadians)) throw new RangeError('True anomaly must be finite');
  return semiMajorAxisM * (1 - eccentricity ** 2) / (1 + eccentricity * Math.cos(trueAnomalyRadians));
}

/** Straight-line distance to a point on a sphere. It makes no visibility or propagation-path claim. */
export function slantRangeMeters(orbitalRadiusM: number, centralAngleRadians = 0, earthRadiusM = EARTH_EQUATORIAL_RADIUS_M): number {
  positive(earthRadiusM, 'Sphere radius');
  positive(orbitalRadiusM, 'Orbital radius');
  if (orbitalRadiusM < earthRadiusM) throw new RangeError('Orbital radius must be outside the sphere');
  if (!Number.isFinite(centralAngleRadians) || centralAngleRadians < 0 || centralAngleRadians > Math.PI) {
    throw new RangeError('Central angle must be finite and in [0, pi]');
  }
  // The half-angle form avoids subtracting nearly equal squares near the surface at nadir.
  return Math.hypot(orbitalRadiusM - earthRadiusM,
    2 * Math.sqrt(orbitalRadiusM * earthRadiusM) * Math.sin(centralAngleRadians / 2));
}
