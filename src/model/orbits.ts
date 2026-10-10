// General two-body geometry. No constellation coverage or real spacecraft state is modeled.
// NASA/JPL sources and the spherical-Earth assumption are cataloged in model/evidence.js.
export const EARTH_GM_M3_S2 = 398600.435507e9;
export const EARTH_EQUATORIAL_RADIUS_M = 6378.137e3;
export const SIDEREAL_DAY_SECONDS = 86164.09054;

function positive(value: number, name: string) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(`${name} must be finite and positive`);
}
function elliptic(eccentricity: number) {
  if (!Number.isFinite(eccentricity) || eccentricity < 0 || eccentricity >= 1) {
    throw new RangeError('Elliptic eccentricity must be finite and in [0, 1)');
  }
}
function wrappedRadians(angle: number): number {
  const remainder = angle % (2 * Math.PI);
  return remainder > Math.PI ? remainder - 2 * Math.PI : remainder < -Math.PI ? remainder + 2 * Math.PI : remainder;
}

/** Uniform mean anomaly, wrapped to [-pi, pi]. Elapsed time and period use the same time unit. */
export function meanAnomalyRadians(elapsedSeconds: number, periodSeconds: number, initialPhase = 0): number {
  positive(periodSeconds, 'Period');
  if (!Number.isFinite(elapsedSeconds) || !Number.isFinite(initialPhase)) throw new RangeError('Time and phase must be finite');
  // Reduce before multiplying so long-running illustration clocks do not overflow.
  return wrappedRadians(wrappedRadians(initialPhase) + 2 * Math.PI * ((elapsedSeconds % periodSeconds) / periodSeconds));
}

/** Solve M = E - e sin(E) in radians. Bracketed Newton steps also handle nearly parabolic ellipses. */
export function eccentricAnomalyRadians(meanAnomaly: number, eccentricity: number): number {
  elliptic(eccentricity);
  if (!Number.isFinite(meanAnomaly)) throw new RangeError('Mean anomaly must be finite');
  const mean = wrappedRadians(meanAnomaly);
  if (eccentricity === 0 || mean === 0 || Math.abs(mean) === Math.PI) return mean;
  let low = -Math.PI, high = Math.PI, eccentric = mean;
  for (let iteration = 0; iteration < 80; iteration++) {
    // Near pericenter, E and e*sin(E) nearly cancel. Evaluate E-sin(E)
    // through its series and retain the separate (1-e)*E term instead.
    const square = eccentric * eccentric;
    const eMinusSin = Math.abs(eccentric) < .1
      ? eccentric * square * (1/6 + square * (-1/120 + square * (1/5040 + square * (-1/362880 + square/39916800))))
      : eccentric - Math.sin(eccentric);
    const residual = (1-eccentricity)*eccentric + eccentricity*eMinusSin - mean;
    if (residual === 0) return eccentric;
    if (residual > 0) high = eccentric; else low = eccentric;
    const newton = eccentric - residual / ((1-eccentricity) + 2*eccentricity*Math.sin(eccentric/2)**2);
    const next = newton > low && newton < high ? newton : (low + high) / 2;
    if (next === eccentric || Math.abs(next - eccentric) <= Number.EPSILON * Math.abs(next)) return next;
    eccentric = next;
  }
  return eccentric;
}

/** Focus at the origin; +x points to pericenter, motion initially toward +y. Length units follow a.
 * Drawing coordinates are valid inputs, but must not be presented as physical spacecraft distances.
 */
export function orbitalPlanePosition(semiMajorAxis: number, eccentricity: number, meanAnomaly: number) {
  positive(semiMajorAxis, 'Semi-major axis');
  const eccentric = eccentricAnomalyRadians(meanAnomaly, eccentricity);
  const x = semiMajorAxis * (Math.cos(eccentric) - eccentricity);
  const y = semiMajorAxis * Math.sqrt((1 - eccentricity) * (1 + eccentricity)) * Math.sin(eccentric);
  return { x, y, radius: Math.hypot(x, y), eccentricAnomalyRadians: eccentric };
}

/** Keplerian period for a negligible-mass body, with distance measured from the central body's center. */
export function orbitalPeriodSeconds(semiMajorAxisM: number, gmM3S2 = EARTH_GM_M3_S2): number {
  positive(semiMajorAxisM, 'Semi-major axis');
  positive(gmM3S2, 'Gravitational parameter');
  return 2 * Math.PI * Math.sqrt(semiMajorAxisM ** 3 / gmM3S2);
}

/** Vis-viva speed in an inertial frame centered on the attracting body.
 * This helper is restricted to bound, nondegenerate ellipses: 0 < r < 2a.
 * Lengths are physical meters, not the compressed scene's drawing coordinates.
 */
export function orbitalSpeedMetersPerSecond(semiMajorAxisM: number, radiusM: number, gmM3S2 = EARTH_GM_M3_S2): number {
  positive(semiMajorAxisM, 'Semi-major axis');
  positive(radiusM, 'Orbital radius');
  positive(gmM3S2, 'Gravitational parameter');
  const radiusRatio = radiusM / semiMajorAxisM;
  if (radiusRatio >= 2) throw new RangeError('A bound ellipse requires orbital radius smaller than twice its semi-major axis');
  // Equivalent to sqrt(mu * (2/r - 1/a)); avoid subtracting two small reciprocals.
  const speed = Math.sqrt(gmM3S2 / radiusM) * Math.sqrt(2 - radiusRatio);
  positive(speed, 'Orbital speed');
  return speed;
}

export function semiMajorAxisMeters(periodSeconds: number, gmM3S2 = EARTH_GM_M3_S2): number {
  positive(periodSeconds, 'Period');
  positive(gmM3S2, 'Gravitational parameter');
  return Math.cbrt(gmM3S2 * (periodSeconds / (2 * Math.PI)) ** 2);
}

/** Radius at a true anomaly in radians; this is ellipse geometry, not an ephemeris. */
export function orbitalRadiusMeters(semiMajorAxisM: number, eccentricity: number, trueAnomalyRadians: number): number {
  positive(semiMajorAxisM, 'Semi-major axis');
  elliptic(eccentricity);
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
