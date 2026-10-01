// Phase 2 static look prototype. Values and source locations are carried from
// research/verified-facts.json; none are outputs of a sensor or scenario model.
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
    key: 'story:schematic', group: 'story',
    label: 'Illustration geometry', value: 'Representative / not to scale', basis: 'assumed',
    ev: { assume: 'look-model' },
    scope: 'As-drawn teaching geometry for the static look prototype.',
  },
];
