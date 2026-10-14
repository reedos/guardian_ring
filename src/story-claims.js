// Cited story figures and component roles. Numerical rows preserve the reviewed
// fact ledger; additional roles are documented in research/LEVELS-CONTENT-REVIEW.md.
// No story claim is an output or performance estimate for a real sensor.
import { SPACECRAFT_FACTS } from './spacecraft-content.js';
import { SBIRS_PUBLISHED_CLAIMS } from './sbirs-published.js';
import { ORBIT_ROWS, orbitRow, geoViewAngles, contrastExample, toyPixel, storyNumbers } from './model/story-examples.js';
const architecture = (key,label,value,ids) => ({
  key:`story:${key}`,group:'story',label,value,basis:'spec',
  ev:{refs:ids.flatMap(id=>SPACECRAFT_FACTS[id][3].refs)},
  scope:'Named GOES-R / ABI civil engineering example. Linked 3D components use representative geometry, not a GOES-R or military hardware layout.',
});
export const STORY_CLAIMS = [
  architecture('spacecraft-power','GOES-R electrical power path','Array regulation, protected load distribution, and rechargeable battery support',['solar-strings','power-regulation','power-distribution','battery-support','abi-power']),
  architecture('spacecraft-pointing','GOES-R pointing equipment','Star trackers, inertial reference, flight software, reaction wheels, and momentum management',['attitude-sensors','flight-computer','wheel-control']),
  architecture('spacecraft-thermal','GOES-R heat paths','Isolation and blankets control unwanted transfer; panels, heat pipes, and radiators reject heat',['mli','equipment-thermal','radiator','instrument-isolation']),
  architecture('payload-electronics','ABI signal and control chain','Detector/ROIC, video processing, digitization, packetization, and spacecraft interface',['abi-roic','abi-video','abi-digitize','abi-packets','abi-timing','abi-controller','abi-cce']),
  {
    key: 'story:geo-altitude', group: 'story',
    label: 'Geostationary altitude', value: '35,786 km', basis: 'reported',
    ev: { refs: [['noaa-geo-definition', 'Definition paragraph']] },
    scope: 'General circular equatorial GEO definition; no slot positions.',
  },
  {
    key: 'story:geo-period', group: 'story',
    label: 'Geosynchronous period', value: '23 h 56 min 4 s', basis: 'reported',
    ev: { refs: [['nasa-orbit-catalog', 'Introductory altitude-and-period example']] },
    scope: 'General orbital reference value.',
  },
  {
    key: 'story:abi-bands', group: 'story',
    label: 'ABI spectral channels', value: '16', basis: 'spec',
    ev: { refs: [['noaa-abi-page', 'Instrument description']] },
    scope: 'GOES-R ABI civil twin only; never a military payload figure.',
  },
  {
    key: 'story:tirs2-temperature', group: 'story',
    label: 'TIRS-2 focal-plane design temperature', value: '43 K', basis: 'spec',
    ev: { refs: [['nasa-tirs2-build', 'Two-stage cryocooler paragraph']] },
    scope: 'Landsat 9 TIRS-2 civil twin only; never a military payload figure.',
  },
  {
    key: 'story:co2-band', group: 'story',
    label: 'CO2 molecular emission band', value: 'Near 4.3 μm', basis: 'reported',
    ev: { refs: [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7'], ['nasa-rocket-plume-transmittance-2003', 'PDF p. 4, CO2 4.26 μm and H2O 2.66/2.74 μm band centers; PDF p. 1, rocket-plume IR emitters']] },
    scope: 'General molecular spectroscopy in a civil combustion study, corroborated by a NASA rocket-engine plume study; no system performance implication.',
  },
  {
    key: 'story:h2o-band', group: 'story',
    label: 'H2O molecular emission band', value: 'Near 2.7 μm', basis: 'reported',
    ev: { refs: [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7'], ['nasa-rocket-plume-transmittance-2003', 'PDF p. 4, CO2 4.26 μm and H2O 2.66/2.74 μm band centers; PDF p. 1, rocket-plume IR emitters']] },
    scope: 'General molecular spectroscopy in a civil combustion study, corroborated by a NASA rocket-engine plume study; no system performance implication.',
  },
  {
    key: 'story:abi-image-role', group: 'story',
    label: 'ABI telescope role', value: 'Forms a scene image on focal-plane detectors', basis: 'spec',
    ev: { refs: [['goes-r-databook', 'Table 3-4, printed p. 3-6 / PDF p. 34, Telescope row']] },
    scope: 'Named ABI component role; the generic telescope geometry remains representative.',
  },
  {
    key: 'story:abi-detector-role', group: 'story',
    label: 'ABI detector role', value: 'Converts incident photons into an electrical signal', basis: 'spec',
    ev: { refs: [['goes-r-databook', 'Table 3-4, printed p. 3-6 / PDF p. 34, Focal Plane Modules and Aft Optics row']] },
    scope: 'Named ABI component role; no efficiency, material assignment, or generic pixel construction is inferred.',
  },
  {
    key: 'story:abi-readout-role', group: 'story',
    label: 'ABI readout role', value: 'Reads detector arrays with video-processing electronics', basis: 'spec',
    ev: { refs: [['goes-r-databook', 'Table 3-4, printed p. 3-6 / PDF p. 34, Sensor Unit Electronics row']] },
    scope: 'Named ABI role; no generic frame rate, precision, or data rate.',
  },
  {
    key: 'story:abi-cooler-role', group: 'story',
    label: 'ABI cooler heat path', value: 'Focal planes to loop heat pipes and radiator', basis: 'spec',
    ev: { refs: [['goes-r-databook', 'Cryocooler, printed p. 3-14 / PDF p. 42']] },
    scope: 'Named ABI thermal path; the generic illustration does not reproduce its hardware layout.',
  },
  {
    key: 'story:abi-radiator-role', group: 'story',
    label: 'ABI radiator role', value: 'Rejects excess instrument thermal energy to space', basis: 'spec',
    ev: { refs: [['goes-r-databook', 'Radiator/Loop Heat Pipe Assembly, printed p. 3-13 / PDF p. 41']] },
    scope: 'Named ABI example of heat rejection; no generic radiator area, temperature, or power.',
  },
  {
    key: 'story:cryogenic-noise-role', group: 'story',
    label: 'Cryogenic cooling', value: 'Can reduce thermal noise', basis: 'reported',
    ev: { refs: [['nist-cryocooler-2009', 'PDF p. 2, Table 1, benefits of cryogenic temperatures']] },
    scope: 'General cryogenic benefit, not a detector-material temperature or noise magnitude.',
  },
  {
    key: 'story:atmospheric-absorption', group: 'story',
    label: 'Atmospheric absorption', value: 'Gases absorb some wavelengths while transmitting others', basis: 'reported',
    ev: { refs: [['nasa-atmospheric-windows', 'Absorption Bands and Atmospheric Windows, first two paragraphs']] },
    scope: 'Qualitative atmospheric physics; no transmission curve, altitude dependence, or operational visibility.',
  },
  // Teaching round 1 (10/11/2026): the atmosphere half of outcome 1. Passages re-read in the NTRS PDF text on 10/11/2026.
  {
    key: 'story:air-absorbs-plume-bands', group: 'story',
    label: 'Air absorbs in the plume bands', value: 'The air’s own water vapor and carbon dioxide absorb strongly at the band centers where hot exhaust emits, and the loss grows with the length of the path', basis: 'reported',
    ev: { refs: [['nasa-rocket-plume-transmittance-2003', 'PDF p. 1, Abstract (the same molecular species emit and absorb, with closely matching line positions; transmittance losses along the path) and Introduction (attenuation mainly by absorption by atmospheric molecular species, including H2O and CO2); PDF p. 4, Figs. 1a–1b discussion (strong H2O and very strong CO2 absorption at the band centers)']] },
    scope: 'Near-ground test-stand paths in a NASA Stennis study. The story’s comparison of light from the ground with light from hot gas higher up is this site’s qualitative reading of the path-length result, not a finding of the study. No altitude, transmittance value, plume signal or sensor performance is implied.',
  },
  {
    key: 'story:next-gen-opir-successor', group: 'story',
    label: 'Next Gen OPIR', value: 'Planned system intended to replace SBIRS', basis: 'reported',
    ev: { refs: [['gao-21-105249', 'Highlights, What GAO Found (also on the GAO product page): the planned Next Generation Overhead Persistent Infrared (Next Gen OPIR) system “is intended to replace the Space Based Infrared System”']] },
    scope: 'GAO description of a planned program at the time of its report. No launch status, count, orbit or performance is implied.',
  },
  {
    key: 'story:public-components', group: 'story',
    label: 'Public architecture', value: 'Bus, infrared payload, mission processor, communications', basis: 'reported',
    ev: { refs: [['gao-26-107085', 'PWSA-Enabling Technologies and Processes, opening description.']] },
    scope: 'GAO description of PWSA component roles; not the implementation of the generic GEO illustration.',
  },
  {
    key: 'story:forge-role', group: 'story',
    label: 'FORGE role', value: 'Spacecraft operations and mission-data processing', basis: 'reported',
    ev: { refs: [['gao-21-105249', 'Printed p. 1 (PDF p. 5), opening paragraph; printed p. 8 (PDF p. 12), acquisition-strategy paragraph.']] },
    scope: 'GAO description of the planned system; no present operational status or software internals.',
  },
  // Round 4 accuracy review (10/11/2026): evidence keys for the story lane. Rows mirror
  // research/accuracy-2026-10-10-facts.json; no story prose is changed here.
  {
    key: 'story:rocket-plume-emitters', group: 'story',
    label: 'Rocket-engine plume IR emitters', value: 'Water vapor, carbon dioxide and carbon monoxide', basis: 'reported',
    ev: { refs: [['nasa-rocket-plume-transmittance-2003', 'PDF p. 1, Abstract']] },
    scope: 'Named molecules in a NASA Stennis rocket-engine test-plume study. No intensity, temperature, vehicle or detectability is implied.',
  },
  {
    key: 'story:rocket-plume-co2-band', group: 'story',
    label: 'CO2 ν3 band center (rocket-plume study)', value: '4.26 μm', basis: 'reported',
    ev: { refs: [['nasa-rocket-plume-transmittance-2003', 'PDF p. 4, CO2 ν3 fundamental at 4.26 μm; PDF p. 1, emission and absorption lines of the same species coincide']] },
    scope: 'Molecular band location only; no band strength is assigned.',
  },
  {
    key: 'story:rocket-plume-h2o-band', group: 'story',
    label: 'H2O ν3 and ν1 band centers (rocket-plume study)', value: '2.66 μm and 2.74 μm', basis: 'reported',
    ev: { refs: [['nasa-rocket-plume-transmittance-2003', 'PDF p. 4, H2O ν3 fundamental at 2.66 μm and ν1 at 2.74 μm; PDF p. 1, emission and absorption lines of the same species coincide']] },
    scope: 'Molecular band locations only; no band strength, plume temperature or sensor passband is assigned.',
  },
  {
    key: 'story:meo-mwmt-layer', group: 'story',
    label: 'Resilient Missile Warning/Missile Tracking – MEO', value: 'Planned missile warning and tracking satellites in medium Earth orbit', basis: 'reported',
    ev: { refs: [['gao-26-107085', 'Table 1, Resilient Missile Warning/Missile Tracking – Medium Earth Orbit row; sentence beginning “DOD is prioritizing development of missile warning and tracking capabilities in LEO and medium Earth orbit (MEO)”']] },
    scope: 'GAO description of a planned layer as of its 01/28/2026 report. No count, launch status, orbit parameters or performance.',
  },
  {
    key: 'story:leo-tracking-layer', group: 'story',
    label: 'SDA Tranche 1 Tracking Layer', value: 'Missile warning and tracking from low Earth orbit with wide-field-of-view infrared sensors', basis: 'reported',
    ev: { refs: [['sda-tranche1-award', 'Award paragraph and director quotation (07/18/2022)'], ['gao-26-107085', 'Table 1, Proliferated Warfighter Space Architecture Tracking and Transport Layers row (low Earth orbit)']] },
    scope: 'Dated award description and GAO architecture table. No numerical field of view, resolution, count or operational status.',
  },
  {
    key: 'story:sbirs-scanning-staring', group: 'story',
    label: 'SBIRS infrared payload sensors', value: 'A scanner and a step-starer (scanning and step-staring sensors)', basis: 'spec',
    ev: { refs: [['ssc-sbirs-factsheet', 'Payload paragraph: “two sensors; a scanner and a step-starer”'],
      ['lm-sbirs-geo2-payload-2009', 'Payload description paragraph (secondary, contractor)'],
      ['lm-sbirs-product-card-2016', 'PDF p. 2, overview paragraph (secondary, contractor)']] },
    scope: 'Official sensor types only (Space Force fact sheet, current as of March 2023). Sensitivity, revisit, focal-plane colors and detector counts are not adopted; published dimensions and weights appear as separate Spec rows.',
  },
  {
    key: 'story:sbirs-program-segments', group: 'story',
    label: 'SBIRS program composition', value: 'GEO satellites, HEO sensors on host satellites, legacy DSP satellites and ground systems', basis: 'spec',
    ev: { refs: [['ssc-sbirs-factsheet', 'Program composition paragraph']] },
    scope: 'Official architecture description, current as of March 2023. No count, slot or status implied.',
  },
  {
    key: 'story:sbirs-data-downlink', group: 'story',
    label: 'SBIRS sensor data to the ground', value: 'Raw unprocessed data plus on-board detected events', basis: 'spec',
    ev: { refs: [['ssc-sbirs-factsheet', 'Data paragraph: raw data down-linked; on-board signal processing transmits detected events']] },
    scope: 'Official data-path description. No processing algorithm, rate, latency or performance implied.',
  },
  {
    key: 'story:sbirs-ir-bands', group: 'story',
    label: 'SBIRS infrared signal categories', value: 'Short-wave and mid-wave infrared', basis: 'spec',
    ev: { refs: [['ssc-sbirs-factsheet', 'Mission paragraph: “detect short-wave and mid-wave infrared signals”']] },
    scope: 'Official broad band categories only; no passband, sensitivity or focal-plane format.',
  },
  {
    key: 'story:schematic', group: 'story',
    label: 'Illustration geometry', value: 'Representative / not to scale', basis: 'assumed',
    ev: { assume: 'look-model' },
    scope: 'As-drawn teaching geometry; no real constellation, performance, or physical dimensions.',
  },
];

// Improvement round 1, teaching (10/14/2026): quantified beats for outcomes 1 and 2 and a worked toy pixel.
// Every figure comes from src/model/story-examples.ts; src/model/story-examples.test.ts checks index.html against it.
const ORBIT_COMPARE_REFS = [
  ['nasa-jpl-parameters', 'Planetary Masses: Earth GM; parameter table: mean sidereal day'],
  ['nasa-earth-facts', 'Bulk parameters: equatorial radius'],
  ['nasa-kepler-derivation', 'Equation 4, Kepler’s Third Law; negligible secondary mass approximation'],
  ['noaa-geo-definition', 'Geostationary orbit definition: 35,786 km reference altitude'],
  ['nasa-orbit-catalog', 'Medium Earth Orbit: Molniya orbit paragraphs, eccentricity 0.722 and 12-hour period; this model chooses a half-sidereal-day example'],
  ['nist-codata-2022', 'Rows for speed of light, Planck constant and Boltzmann constant'],
];
const ORBIT_NAMES = { geo: 'GEO', heo: 'HEO', meo: 'MEO', leo: 'LEO' };
const N = storyNumbers();
const contrast = [
  ['nist-codata-2022', 'Rows for speed of light, Planck constant and Boltzmann constant'],
  ['noaa-planck-function', 'First formula image: wavelength-form Planck law and spectral radiance units'],
];
export const STORY_CALC_CLAIMS = [
  ...ORBIT_ROWS.map(id => {
    const row = orbitRow(id);
    return {
      key: `story:orbit-compare-${id}`, group: 'story',
      label: `${ORBIT_NAMES[id]} teaching orbit: altitude, period, share of Earth in view, light time`,
      value: `Altitude ${row.text.altitude}; period ${row.text.period}; ${row.text.share} of Earth’s surface above the horizon; ${row.text.light} one-way light time straight down`,
      basis: 'derived', ev: { calc: 'orbit-compare', assume: 'model-orbits', refs: ORBIT_COMPARE_REFS },
      scope: 'A teaching orbit (the model-orbits assumption), not a program parameter. The share of Earth in view is horizon-to-horizon geometry with no minimum elevation angle or field of view, so it is not sensor coverage, revisit or performance.',
    };
  }),
  {
    key: 'story:geo-view-angle', group: 'story',
    label: 'Angle above the horizon from high latitudes, GEO satellite on the same meridian',
    value: `${N['geo:elevation:60']} at 60° latitude, ${N['geo:elevation:75']} at 75° latitude, on the horizon at ${N['geo:limb']}`,
    basis: 'derived', ev: { calc: 'horizon-elevation', assume: 'model-view-geometry', refs: ORBIT_COMPARE_REFS.slice(1, 4) },
    scope: 'Spherical-Earth viewing geometry only. It says nothing about what any sensor can or cannot detect, and it is not a coverage statement for any real system.',
  },
  {
    key: 'story:plume-contrast', group: 'story',
    label: 'Ideal blackbody contrast: 1,000 K gas versus 288 K ground',
    value: `About ${N['contrast:mwir:ratio']} times brighter in 3.8–4.8 μm and about ${N['contrast:lwir:ratio']} times in 8–12 μm`,
    basis: 'derived', ev: { calc: 'planck-contrast-example', assume: 'illustrative-hot-gas', refs: contrast },
    scope: 'Ideal radiators at an assumed illustrative temperature. Not a plume measurement or estimate, a transmission through air, or a sensor signal, threshold or performance.',
  },
  {
    key: 'story:ground-288k', group: 'story',
    label: 'Earth’s surface treated as an ideal radiator', value: 'About 288 K (15 °C), emissivity 1', basis: 'assumed', ev: { assume: 'model-blackbody' },
    scope: 'A round teaching value for an ideal source, not a measured scene temperature.',
  },
  {
    key: 'story:pixel-toy', group: 'story',
    label: 'Toy pixel: photons, charge, a whole number',
    value: `${N['pixel:photons']} photons, ${N['pixel:electrons']} electrons, whole-number output ${N['pixel:code']} of 0 to ${toyPixel().levels - 1}`,
    basis: 'derived', ev: { calc: 'cinematic-charge', assume: 'story-toy-pixel' },
    scope: 'Round numbers for a hand-followable example. Not a real detector’s efficiency, full well, noise or bit depth.',
  },
  {
    key: 'story:abi-full-disk-cadence', group: 'story',
    label: 'ABI full-disk repeat time', value: 'Every 10 minutes', basis: 'spec',
    ev: { refs: [['noaa-abi-page', 'Instrument description']] },
    scope: 'GOES-R ABI civil twin only; never a military payload figure. It is how often the whole disk is imaged again, not a detection time.',
  },
];
STORY_CLAIMS.push(...STORY_CALC_CLAIMS);
// Round 6: official published SBIRS GEO figures (see src/sbirs-published.js).
STORY_CLAIMS.push(...SBIRS_PUBLISHED_CLAIMS);
