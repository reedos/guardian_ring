// Cited story figures and component roles. Numerical rows preserve the reviewed
// fact ledger; additional roles are documented in research/LEVELS-CONTENT-REVIEW.md.
// No story claim is an output or performance estimate for a real sensor.
export const STORY_CLAIMS = [
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
    ev: { refs: [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7']] },
    scope: 'General molecular spectroscopy in a civil combustion study; no system performance implication.',
  },
  {
    key: 'story:h2o-band', group: 'story',
    label: 'H2O molecular emission band', value: 'Near 2.7 μm', basis: 'reported',
    ev: { refs: [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7']] },
    scope: 'General molecular spectroscopy in a civil combustion study; no system performance implication.',
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
  {
    key: 'story:schematic', group: 'story',
    label: 'Illustration geometry', value: 'Representative / not to scale', basis: 'assumed',
    ev: { assume: 'look-model' },
    scope: 'As-drawn teaching geometry; no real constellation, performance, or physical dimensions.',
  },
];
