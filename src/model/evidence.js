// Merge these catalogs into the shared IF evidence registry. All dates are access/review dates unless noted.
import { ENGINEERING_SOURCES, ENGINEERING_CALCS, ENGINEERING_ASSUMPTIONS } from '../engineering-evidence.js';
import { CINEMATIC_SOURCES, CINEMATIC_CALCS, CINEMATIC_ASSUMPTIONS } from '../cinematic-evidence.js';
export const MODEL_SOURCES = {
  ...CINEMATIC_SOURCES,
  ...ENGINEERING_SOURCES,
  'nist-codata-2022': {
    title: 'Fundamental Physical Constants: complete listing, 2022 CODATA adjustment', publisher: 'NIST',
    url: 'https://physics.nist.gov/cuu/Constants/Table/allascii.txt', dated: '2022 adjustment; current table checked 10/01/2026',
    accessed: '10/01/2026', kind: 'primary', status: 'verified',
    quote: 'speed of light in vacuum', section: 'Rows for c, h, k and the Stefan-Boltzmann constant',
  },
  'nasa-jpl-parameters': {
    title: 'Astrodynamic Parameters', publisher: 'NASA Jet Propulsion Laboratory',
    url: 'https://ssd.jpl.nasa.gov/astro_par.html', dated: 'Undated page; Earth GM from DE440 (2021); sidereal day cites Seidelmann (1992)',
    accessed: '10/01/2026', kind: 'primary', status: 'verified',
    quote: 'Earth | 398600.435507', section: 'Planetary Masses: Earth GM in km³ s⁻²; parameter table: mean sidereal day',
  },
  'nasa-earth-facts': {
    title: 'Earth Fact Sheet', publisher: 'NASA Goddard Space Flight Center / NSSDCA',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html', published: '11/15/2024',
    accessed: '10/01/2026', kind: 'primary', status: 'verified',
    quote: 'Equatorial radius (km) 6378.137', section: 'Bulk parameters',
  },
  'nasa-kepler-derivation': {
    title: 'Deriving Kepler’s Formula for Binary Stars', publisher: 'NASA Goddard Space Flight Center / Imagine the Universe',
    url: 'https://imagine.gsfc.nasa.gov/features/yba/CygX1_mass/binary/equation_derive.html', published: '09/23/2020',
    accessed: '10/01/2026', kind: 'primary', status: 'verified',
    quote: 'P^2/a^3 = 4 pi^2/(G (m1+m2))', section: 'Equation 4, Kepler’s Third Law; negligible secondary mass in this model',
  },
  'nasa-jsc-vis-viva': {
    title: 'Libration Point Mission Design Considerations: Typical Form of Vis-Viva Equation',
    publisher: 'NASA Johnson Space Center / Jerry Condon',
    url: 'https://ntrs.nasa.gov/api/citations/20140003573/downloads/20140003573.pdf',
    dated: 'Downloaded PDF cover dated 06/15/2017; appended vis-viva slide dated 04/10/2014',
    accessed: '10/03/2026', kind: 'primary', status: 'verified',
    quote: 'V² = 2μ/r − μ/a', section: 'PDF p. 173, printed slide 86, Eq. (1); downloaded and visually verified',
  },
  'nasa-orbit-equation': {
    title: 'How Orbital Motion is Calculated', publisher: 'NASA Goddard Space Flight Center / From Stargazers to Starships',
    url: 'https://pwg.gsfc.nasa.gov/stargaze/Smotion.htm', dated: 'Educational page; publication date not established',
    accessed: '10/01/2026', kind: 'primary', status: 'verified',
    quote: 'r = a(1 – e²)/(1 + e cos φ)', section: 'Opening orbital-elements discussion, polar equation of the orbit',
  },
  'nasa-em-math': {
    title: 'Electromagnetic Math', publisher: 'NASA Space Math / Sten Odenwald',
    url: 'https://science.nasa.gov/wp-content/uploads/2023/09/Electromagnetic_Math.pdf', dated: 'Book based on 2004–2010 educational activities; publication date not established',
    accessed: '10/01/2026', kind: 'primary', status: 'verified',
    quote: 'θ = 1.22 λ / D', section: 'Activity 46, PDF p. 110; activity 47, PDF p. 112: photon energy and frequency × wavelength',
  },
  'noaa-planck-function': {
    title: 'Planck Function', publisher: 'NOAA NESDIS / Changyong Cao and Xi Shao',
    url: 'https://ncc.nesdis.noaa.gov/planck.html', dated: 'Undated teaching calculator; checked 10/01/2026',
    accessed: '10/01/2026', kind: 'primary', status: 'verified',
    quote: 'blackbody radiance', section: 'First formula image: wavelength form and radiance units; current NIST constants replace rounded historical constants',
  },
};

export const MODEL_CALCS = {
  ...CINEMATIC_CALCS,
  ...ENGINEERING_CALCS,
  'orbit-period': {
    title: 'Two-body orbital period', how: 'T = 2π√(a³/μ), where a is the ellipse’s semi-major axis (the center-to-center radius for a circular orbit). The satellite mass is neglected. GEO uses the public reference altitude; other choices use the stated teaching geometry. Earth is treated as spherical; perturbations are omitted.',
    inputs: ['semi-major axis', 'Earth GM from NASA/JPL', 'model-orbits assumption'],
  },
  'orbit-speed': {
    title: 'Two-body orbital speed',
    how: 'v = √[μ(2/r − 1/a)], where r is distance from Earth’s center and a is the semi-major axis. The result is an Earth-centered inertial speed, not speed over the rotating ground. A circle has r = a and v = √(μ/r). HEO is evaluated at apogee, r = a(1 + e). The calculation uses the physical teaching orbit, never the compressed drawing coordinates. Gravity is the only modeled acceleration; perturbations and maneuvers are omitted.',
    inputs: ['physical semi-major axis and orbital radius', 'Earth GM from NASA/JPL', 'NASA JSC vis-viva Eq. (1)', 'model-orbits assumption'],
  },
  'orbit-altitude': {
    title: 'Altitude on an ideal ellipse', how: 'r = a(1 − e²)/(1 + e cos ν); altitude = r − R. Perigee and apogee use a(1 − e) − R and a(1 + e) − R. The HEO teaching example is evaluated at apogee, not averaged over time.',
    inputs: ['semi-major axis and eccentricity', 'true anomaly', 'spherical Earth radius'],
  },
  'orbit-slant-range': {
    title: 'Geometric distance to nadir', how: 'd² = r² + R² − 2rR cos ψ. The displayed example sets ψ = 0, so d = r − R. This is distance to the point directly below the orbit position, not a ground station link, coverage calculation, or actual observation.',
    inputs: ['orbital radius', 'Earth radius', 'assumed nadir geometry'],
  },
  'vacuum-light-time': {
    title: 'One-way light travel time', how: 't = d/c, with c = 299,792,458 m/s. Only vacuum propagation is counted. It is not warning latency; processing, communications routing, and other delays are absent.',
    inputs: ['geometric nadir distance', 'exact SI speed of light'],
  },
  'ideal-diffraction': {
    title: 'Ideal circular-aperture diffraction', how: 'θ ≈ 1.22 λ/D radians: the Airy first-minimum angular radius for an unobstructed circular aperture. D = 0.30 m is a stand-alone laboratory example. No real payload aperture, image resolution, pixel size, or ground spot is inferred.',
    inputs: ['model-lab-aperture assumption', 'model-band-examples assumption'],
  },
  'photon-energy': {
    title: 'Energy per photon', how: 'E = hν = hc/λ. Wavelength is converted from micrometers to meters. The calculation uses the exact SI values of h and c.',
    inputs: ['illustrative wavelength', 'NIST h and c'],
  },
  'planck-band-radiance': {
    title: 'Ideal blackbody radiance in a teaching band', how: 'Bλ = 2hc²/[λ⁵(exp(hc/(λkT)) − 1)] in W m⁻² sr⁻¹ m⁻¹. Integrate Bλ dλ over the assumed top-hat wavelength interval. Composite Simpson quadrature uses 512 intervals in log wavelength, including the λ Jacobian. This is an ideal 288 K blackbody, not the observed Earth or a plume.',
    inputs: ['NIST h, c and k', 'model-blackbody assumption', 'model-band-examples assumption'],
  },
  'planck-band-photons': {
    title: 'Ideal blackbody photon radiance', how: 'Integrate Bλ/(hc/λ) dλ over the same teaching interval. Units are photons s⁻¹ m⁻² sr⁻¹, not photons at a detector. No aperture area, field of view, atmosphere, throughput, quantum efficiency, or detector response is applied.',
    inputs: ['Planck spectral radiance', 'photon energy at each wavelength', 'assumed teaching band'],
  },
  'orbit-compare': {
    title: 'Four-orbit comparison row', how: 'Altitude, period and one-way light time are the orbit-altitude, orbit-period and vacuum-light-time results for the same teaching orbits. Share of Earth in view is the spherical-cap fraction (1 − R/r)/2 of Earth’s surface that lies above the horizon of a point at orbital radius r from Earth’s center (R is Earth’s radius). It applies no minimum elevation angle, no field of view and no sensor, so it is geometry, not coverage, revisit or performance. HEO is evaluated at apogee, like the other HEO calculations.',
    inputs: ['orbit-altitude, orbit-period and vacuum-light-time results', 'spherical Earth radius', 'model-orbits assumption'],
  },
  'horizon-elevation': {
    title: 'Angle above the horizon from a latitude', how: 'elevation = atan2(cos ψ − R/r, sin ψ), where ψ is the central angle between a ground point and the point directly below the satellite (for a GEO satellite on the equator, the latitude on the same meridian) and r is the orbital radius. The satellite sits on the horizon where cos ψ = R/r. Spherical Earth; no terrain, no atmospheric refraction and no minimum-elevation rule. It is a geometric viewing angle and says nothing about what any sensor can or cannot detect.',
    inputs: ['GEO orbital radius from the model-orbits assumption', 'spherical Earth radius', 'model-view-geometry assumption'],
  },
  'planck-contrast-example': {
    title: 'Ideal blackbody contrast between hot gas and the ground', how: 'For two ideal blackbodies, one at 288 K and one at an assumed 1,000 K, integrate the Planck spectral radiance over the teaching bands 3.8–4.8 μm and 8–12 μm with the same quadrature as the band-radiance calculation, then divide the hot value by the ground value. Emissivity is 1; there is no atmosphere, no molecular band structure, no optics and no detector. Real exhaust emits in molecular bands and varies in temperature along the plume, so this shows only how contrast changes with temperature and wavelength.',
    inputs: ['NIST h, c and k', 'model-blackbody assumption', 'illustrative-hot-gas assumption', 'model-band-examples assumption'],
  },
  'carnot-cop': {
    title: 'Ideal refrigerator coefficient of performance', how: 'COPCarnot = Tc/(Th − Tc), with absolute temperatures and Th > Tc > 0. This limit is not the efficiency or input power of a real cryocooler; the scenario does not assign such values.',
    inputs: ['cold and hot temperatures supplied to the pure function', 'NIST refrigeration review, Eq. 1'],
  },
  'us-customary-to-si': {
    title: 'Unit conversion of published figures',
    how: 'Length in meters = feet × 0.3048 exactly; mass in kilograms = pounds × 0.45359237 exactly (international foot and avoirdupois pound). Dimensions are shown to 0.1 m and masses to the nearest kilogram; the source’s own “approximately” qualifier still applies. Converts official published SBIRS GEO figures only; no dimension or mass is estimated or assigned to the site’s drawn hardware.',
    inputs: ['ssc-sbirs-factsheet published U.S.-customary figures', 'exact foot and pound definitions'],
  },
  'ideal-cooling-work': {
    title:'Ideal refrigerator work and rejected heat',
    how:'For the separate civil-temperature teaching example, COP = Tc/(Th−Tc), Wmin = Qcold/COP and Qhot = Qcold + Wmin. The cold temperature is the published TIRS-2 value; hot temperature and heat load are arbitrary teaching inputs. Reversible operation gives a lower work bound, not a real cooler power estimate or a military temperature.',
    inputs:['nasa-tirs2-build: two-stage cryocooler paragraph','nist-refrigeration-2020: Eq. (1)','civil-cooling-example assumption'],
  },
};

export const MODEL_ASSUMPTIONS = {
  ...CINEMATIC_ASSUMPTIONS,
  ...ENGINEERING_ASSUMPTIONS,
  'civil-cooling-example': {
    title:'Independent ideal cooling example',value:'300 K warm reservoir; 1 W cold load; reversible operation',
    why:'These arbitrary inputs demonstrate the refrigeration limit with the separately cited 43 K TIRS-2 cold temperature. They do not describe TIRS-2 heat load, radiator temperature, efficiency, electrical input or any military instrument. No fraction of Carnot performance is assigned.',
  },
  'model-view-geometry': {
    title: 'Viewing-angle geometry', value: 'Spherical Earth; satellite on the same meridian as the ground point',
    why: 'The angle above the horizon is computed on a sphere of Earth’s published equatorial radius for a GEO satellite on the equator and a ground point on its meridian. It includes no terrain, no atmospheric refraction and no minimum-elevation rule, and it is not a statement about what any sensor sees.',
  },
  'illustrative-hot-gas': {
    title: 'Illustrative hot gas', value: '1,000 K, emissivity 1, compared with a 288 K ground',
    why: 'A round-number temperature chosen to show how contrast depends on temperature and wavelength. It is not a measured or estimated rocket-exhaust temperature, and real exhaust emits in molecular bands rather than as a smooth blackbody. The 288 K ground is the model-blackbody assumption. The result is ideal radiance, not a sensor signal, detection threshold or performance.',
  },
  'story-toy-pixel': {
    title: 'Toy pixel example', value: '1,000 photons, 65% each freeing one electron, full scale 1,000 electrons, eight output levels',
    why: 'Round numbers chosen so the three steps (photons, charge, a whole number) can be followed by hand. The 65% efficiency and eight levels are the lesson inputs of the cinematic-model-inputs assumption. Nothing here is a real detector’s efficiency, well capacity, noise or bit depth, and no sensor performance is implied.',
  },
  'model-orbits': {
    title: 'General orbit examples', value: 'A spherical Earth and negligible satellite mass',
    why: 'The sphere uses the published equatorial radius, 6,378.137 km. GEO uses a 35,786 km circular reference altitude. HEO is a teaching ellipse with period one half of the published sidereal day and eccentricity 0.722, evaluated at apogee. MEO and LEO are arbitrary circular examples at 20,000 km and 1,000 km. These are not program or spacecraft orbital parameters, and no constellation is computed.',
  },
  'model-nadir': {
    title: 'Reference distance', value: 'The surface point directly below the illustrated orbit position',
    why: 'The central angle is zero. This keeps the distance and light-time example simple without assuming a real observing direction or ground station. HEO uses the apogee position.',
  },
  'model-lab-aperture': {
    title: 'Ideal laboratory aperture', value: '0.30 m unobstructed circular diameter',
    why: 'An arbitrary mathematical example used only for diffraction. It is not the aperture of any depicted military hardware or civil instrument. The civil aperture selection returns unavailable because the ABI diameter has not been verified.',
  },
  'model-band-examples': {
    title: 'Teaching wavelengths and integration bounds', value: 'SWIR: 2.0 μm, interval 1.5–2.5 μm; MWIR: 4.3 μm, interval 3.8–4.8 μm; LWIR: 10.0 μm, interval 8–12 μm',
    why: 'These illustrative wavelengths and top-hat integration bounds are chosen to compare the equations. They are not formal definitions of the broad infrared band names and are not any instrument’s spectral response or atmospheric transmission windows.',
  },
  'model-blackbody': {
    title: 'Ideal thermal source', value: '288 K, emissivity 1',
    why: 'A uniform ideal blackbody provides an elementary radiance example. It is not a measured Earth scene, plume, satellite background, or detector background. Orbit, aperture and detector choices do not affect this source radiance.',
  },
};
