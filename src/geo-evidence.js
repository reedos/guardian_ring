// Evidence shared by every place that states the geostationary altitude or period (story, explorer card, ledgers).
// Both are Calc.: Kepler's third law with the sidereal day (src/model/orbits.ts). NOAA and NASA state the same numbers,
// so they are listed as corroboration, not as the basis.
export const GEO_REFS = [
  ['nasa-jpl-parameters', 'Planetary Masses: Earth GM; parameter table: mean sidereal day (86,164.09 s)'],
  ['nasa-earth-facts', 'Bulk parameters: equatorial radius (6,378.137 km)'],
  ['nasa-kepler-derivation', 'Equation 4, Kepler’s Third Law; negligible secondary mass approximation'],
];
export const GEO_ALTITUDE_CORROBORATION = ['noaa-geo-definition', 'Definition paragraph: states 35,786 km as the geostationary altitude; corroborates the calculation'];
export const GEO_PERIOD_CORROBORATION = ['nasa-orbit-catalog', 'Introduction, opening example just before the Three Classes of Orbit heading (a weather satellite about 36,000 km up, one orbit in 23 h 56 min 4 s; the page does not state 35,786 km); corroborates the calculation'];
export const geoAltitudeEvidence = () => ({ calc: 'geo-sidereal-kepler', refs: [...GEO_REFS, GEO_ALTITUDE_CORROBORATION].map(r => [...r]) });
export const geoPeriodEvidence = () => ({ calc: 'geo-sidereal-kepler', refs: [...GEO_REFS, GEO_PERIOD_CORROBORATION].map(r => [...r]) });
