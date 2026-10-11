// Official published SBIRS GEO figures (U.S. Space Force fact sheet, current as of March 2023).
// Use approved by Reed on 10/11/2026 (relayed by the review coordinator; see research/review-accuracy-2026-10-10.md).
// These describe SBIRS GEO as published. They are NOT properties of this site's representative, as-drawn
// satellite, which is assigned no mass or dimensions. Metric values are Calc. unit conversions only.
import { feetToMeters, poundsToKilograms } from './model/units.ts';

const SHEET = 'ssc-sbirs-factsheet';
const SCOPE = 'Official SBIRS GEO figure as published by the U.S. Space Force (fact sheet current as of March 2023). It describes the real SBIRS GEO satellite, not the site’s representative as-drawn spacecraft, which has no assigned mass or dimensions.';
const ref = at => ({ refs: [[SHEET, at]] });
const m = ft => feetToMeters(ft).toFixed(1);
const kg = lb => Math.round(poundsToKilograms(lb)).toLocaleString('en-US');
const spec = (id, label, value, at) => ({ key: `story:${id}`, group: 'story', label, value, basis: 'spec', ev: ref(at), scope: SCOPE });
const calc = (id, label, value, at) => ({ key: `story:${id}`, group: 'story', label, value, basis: 'derived', ev: { calc: 'us-customary-to-si', ...ref(at) }, scope: `${SCOPE} Metric value converted here from the published U.S.-customary figure.` });

export const SBIRS_PUBLISHED = { sensorFt: [7, 4, 3], sensorLb: 530, geoFt: [49, 22, 20], geoLb: 5525, payloadLb: 1100, fuelLb: 430 };
const P = SBIRS_PUBLISHED;
export const SBIRS_PUBLISHED_CLAIMS = [
  spec('sbirs-sensor-dimensions', 'SBIRS GEO sensor dimensions (published)', `Approximately ${P.sensorFt.join(' ft × ')} ft`, 'General characteristics: sensor dimensions'),
  calc('sbirs-sensor-dimensions-si', 'SBIRS GEO sensor dimensions, metric (published figure converted)', `About ${P.sensorFt.map(m).join(' m × ')} m`, 'General characteristics: sensor dimensions'),
  spec('sbirs-sensor-weight', 'SBIRS GEO sensor weight (published)', `${P.sensorLb} lb`, 'General characteristics: sensor weight'),
  calc('sbirs-sensor-weight-si', 'SBIRS GEO sensor mass, metric (published figure converted)', `About ${kg(P.sensorLb)} kg`, 'General characteristics: sensor weight'),
  spec('sbirs-geo-dimensions', 'SBIRS GEO satellite dimensions (published)', `Approximately ${P.geoFt.join(' ft × ')} ft with all appendages deployed on orbit`, 'General characteristics: satellite dimensions'),
  calc('sbirs-geo-dimensions-si', 'SBIRS GEO satellite dimensions, metric (published figure converted)', `About ${P.geoFt.map(m).join(' m × ')} m with all appendages deployed on orbit`, 'General characteristics: satellite dimensions'),
  spec('sbirs-geo-weight', 'SBIRS GEO satellite weight on orbit (published)', `${P.geoLb.toLocaleString('en-US')} lb, including a ${P.payloadLb.toLocaleString('en-US')} lb two-sensor payload and ${P.fuelLb} lb of fuel`, 'General characteristics: satellite weight'),
  calc('sbirs-geo-weight-si', 'SBIRS GEO satellite mass on orbit, metric (published figure converted)', `About ${kg(P.geoLb)} kg, including about ${kg(P.payloadLb)} kg of payload and ${kg(P.fuelLb)} kg of fuel`, 'General characteristics: satellite weight'),
  spec('sbirs-power-source', 'SBIRS GEO power source (published)', 'Sun-tracking solar arrays', 'General characteristics: power source'),
  spec('sbirs-geo-launches', 'SBIRS GEO satellite launches (published)', '05/07/2011, 03/19/2013, 01/20/2017, 01/19/2018, 05/18/2021 and 08/04/2022 (sixth and final)', 'Launch list: first through sixth (final) satellite launch'),
];
