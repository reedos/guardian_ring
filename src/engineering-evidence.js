// Primary sources opened for the learning journey on 10/01/2026.
// Civil applications remain attached to their named instruments; failed opens cannot support claims.
export const ENGINEERING_SOURCES = {
  'noaa-abi-fire-product': {
    title: 'Fire and Hot Spot Characterization', publisher: 'NOAA NESDIS / STAR',
    url: 'https://www.star.nesdis.noaa.gov/goesr/product_land_fire.php',
    kind: 'primary', marketing: false, dated: 'Undated product description', accessed: '10/07/2026', status: 'verified',
    section: 'Improvements and Benefits; Calibration and Validation; Kenneth Fire image and pre-operational notice',
  },
  'nasa-tirs2-water-application': {
    title: 'New Landsat Infrared Instrument Ships from NASA', publisher: 'NASA Goddard Space Flight Center',
    url: 'https://www.nasa.gov/missions/landsat/new-landsat-infrared-instrument-ships-from-nasa/',
    kind: 'primary', marketing: false, published: '08/23/2019', accessed: '10/01/2026', status: 'verified',
    section: 'Taking Earth’s temperatures from orbit: paragraphs on transpiration and evaporation',
  },
  'nasa-landsat-water-planning': {
    title: 'Ten Years of TIRS: Data for a Thirsty World', publisher: 'NASA Science / Landsat',
    url: 'https://science.nasa.gov/missions/landsat/ten-years-of-tirs-data-for-a-thirsty-world/',
    kind: 'primary', marketing: false, dated: 'NASA feature; publication day not established in the opened excerpts', accessed: '10/01/2026', status: 'verified',
    section: 'Idaho Department of Water Resources paragraph and OpenET figure caption',
  },
  'nasa-spacecraft-thermal-control-2026': {
    title: 'State-of-the-Art of Small Spacecraft Technology: 7.0 Thermal Control', publisher: 'NASA',
    url: 'https://www.nasa.gov/smallsat-institute/sst-soa/thermal-control/',
    kind: 'primary', marketing: false, published: '05/07/2026', accessed: '10/01/2026', status: 'verified',
    section: '7.1, energy balance; 7.2.1, conduction and radiation in vacuum',
  },
  'nasa-first-law-internal-energy': {
    title: 'First Law – Internal Energy', publisher: 'NASA Glenn Research Center',
    url: 'https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/first-law-internal-energy/',
    kind: 'primary', marketing: false, dated: 'Undated educational page', accessed: '10/01/2026', status: 'verified',
    section: 'First Law of Thermodynamics: E₂ − E₁ = Q − W and following sign-convention paragraph',
  },
  'nasa-jpl-kepler-coordinates': {
    title: 'Approximate Positions of the Planets', publisher: 'NASA Jet Propulsion Laboratory',
    url: 'https://ssd.jpl.nasa.gov/planets/approx_pos.html',
    kind: 'primary', marketing: false, dated: 'Undated technical page', accessed: '10/01/2026', status: 'verified',
    section: 'Formulae for using the Keplerian elements, steps 3–4; Solution of Kepler’s Equation. Only generic ellipse mathematics is used.',
  },
  'usgs-c2-atmospheric-auxiliary-unchecked': {
    title: 'Landsat Collection 2 Atmospheric Auxiliary Data', publisher: 'U.S. Geological Survey',
    url: 'https://www.usgs.gov/landsat-missions/landsat-collection-2-atmospheric-auxiliary-data',
    kind: 'primary', marketing: false, dated: 'Publication date not confirmed', attempted: '10/01/2026', status: 'unchecked',
    unchecked: 'Direct web open returned Internal Error. No page content admitted and no retry or alternate retrieval attempted.',
  },
  'usgs-c2-evapotranspiration-unchecked': {
    title: 'Landsat Collection 2 Provisional Actual Evapotranspiration Science Product', publisher: 'U.S. Geological Survey',
    url: 'https://www.usgs.gov/landsat-missions/landsat-collection-2-provisional-actual-evapotranspiration-science-product',
    kind: 'primary', marketing: false, dated: 'Publication date not confirmed', attempted: '10/01/2026', status: 'unchecked',
    unchecked: 'Direct web open returned Internal Error. No page content admitted and no retry or alternate retrieval attempted.',
  },
};

export const ENGINEERING_CALCS = {
  'kepler-illustration-motion': {
    title: 'Position on an illustrative ellipse',
    how: 'Advance mean anomaly M uniformly in the illustration clock, solve M = E − e sin E, then use x = a(cos E − e), y = a√(1 − e²)sin E. The focus is the origin and positive x points to pericenter. Angles are radians. Drawing parameters and playback time are not measured spacecraft states; they do not replace the separate orbit examples.',
    inputs: ['authored illustrative semi-major axis and eccentricity', 'illustration clock and phase', 'NASA orbital motion and JPL generic coordinate formulas'],
  },
  'cooler-energy-balance': {
    title: 'Refrigerator energy balance',
    how: 'Qhot = Qcold + Win for a complete cycle with no net stored-energy change. Qcold and Win are nonnegative energy magnitudes into the cooler; Qhot is the heat rejected. All terms must use the same energy unit, or all may be steady average powers. This follows from the first law, ΔU = Q − W, using work done on the cooler as positive input. The equation alone does not determine cooling capacity, temperature, efficiency, or electrical power.',
    inputs: ['heat removed and work supplied in matching units', 'NASA first law and sign conventions', 'no net stored energy over the cycle'],
  },
};

export const ENGINEERING_ASSUMPTIONS = {
  'illustration-orbit-motion': {
    title: 'Schematic orbit playback', value: 'Compressed drawing geometry and an illustration clock',
    why: 'Orbit guides retain their authored drawing dimensions and shapes. Motion follows each guide’s own ellipse or circle. The physical teaching orbit calculations are separate: no real constellation state, observation geometry, or operational schedule is inferred from this animation.',
  },
  'cooler-cycle-boundary': {
    title: 'Cooler energy accounting boundary', value: 'Complete cycle or steady average; no net stored energy',
    why: 'The symbolic balance treats the cooler as a closed cyclic device with heat absorbed, input work, and rejected heat. It assigns no numerical load, efficiency, temperature, or rate to a spacecraft. Startup, cooldown, and other transients would require a stored-energy term.',
  },
};

export const ENGINEERING_ROWS = {
  abiFire: ['ABI civil application', 'Visible and infrared fire products help forecasters monitor wildfire changes', 'reported', { refs: [['noaa-abi-fire-product', 'Improvements and Benefits']] }],
  tirsWater: ['Landsat civil application', 'Thermal and optical observations support modeled evapotranspiration and water planning', 'reported', { refs: [['nasa-tirs2-water-application', 'Taking Earth’s temperatures from orbit: transpiration and evaporation paragraphs'], ['nasa-landsat-water-planning', 'Idaho water-planning paragraph and OpenET figure caption']] }],
  thermalTransfer: ['Spacecraft heat transfer', 'Conduction within hardware and thermal radiation to the surroundings', 'reported', { refs: [['nasa-spacecraft-thermal-control-2026', 'Section 7.2.1, opening paragraph']] }],
  coolerBalance: ['Cooler energy balance', 'Qhot = Qcold + Win', 'derived', { calc: 'cooler-energy-balance', assume: 'cooler-cycle-boundary', refs: [['nasa-first-law-internal-energy', 'First Law of Thermodynamics equation and sign convention']] }],
  orbitMotion: ['Illustrative orbital motion', 'Uniform mean anomaly; changing speed along an ellipse', 'derived', { calc: 'kepler-illustration-motion', assume: 'illustration-orbit-motion', refs: [['nasa-orbit-equation', 'Opening discussion and Kepler’s Equation section'], ['nasa-jpl-kepler-coordinates', 'Formulae for using the Keplerian elements, steps 3–4']] }],
};

export const ENGINEERING_CLAIMS = [
  ['abi-fire', 'abiFire', 'GOES-R ABI civil application; no thresholds or military performance are inferred.'],
  ['tirs-water', 'tirsWater', 'Landsat civil application. Water-use estimates require models and additional information; the instrument measures radiation.'],
  ['thermal-transfer', 'thermalTransfer', 'General spacecraft engineering principle. A particular thermal design requires its own boundary conditions.'],
  ['cooler-balance', 'coolerBalance', 'Symbolic cycle energy accounting, not a cooler rating or mission power estimate.'],
  ['orbit-motion', 'orbitMotion', 'Schematic, compressed geometry and illustrative playback; no real ephemerides.'],
].map(([id, rowId, scope]) => {
  const [label, value, basis, ev] = ENGINEERING_ROWS[rowId];
  return { key: `learning:${id}`, group: 'learning', label, value, basis, ev, scope };
});
