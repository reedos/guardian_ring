// Prerender the reference pages: npx tsx tools/write-pages.mjs [evidence method glossary]
// The story and explorer are authored independently and are never overwritten here.
import fs from 'node:fs';
import { compute, DEFAULT_SCENARIO } from '../src/model/engine.ts';
import { content } from '../src/data.js';
import { allClaims } from '../src/claims.js';
import { SOURCES } from '../src/sources.js';
import { ASSUMPTIONS, BASIS, CALCS, problems } from '../src/evidence.js';
import { renderClaimRows, scenarioLabel } from '../src/pages/evidence-content.js';
import { SPACECRAFT_FACTS } from '../src/spacecraft-content.js';
import { COMPONENT_GLOSSARY } from '../src/pages/component-glossary.js';
import { renderSystemDiagrams } from '../src/pages/system-diagrams.js';
import { renderParts, partInventory } from '../src/pages/parts-content.js';
import { PUBLICATION_NOTICE, REFERENCE_NAV, siteHeader, siteFooter } from '../src/pages/page-shell.js';

const notice = PUBLICATION_NOTICE;
const nav = [['index', 'The story'], ['visualizer', 'Visualizer'], ...REFERENCE_NAV];
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const model = compute();
const registry = allClaims(model, content(model));
for (const claim of registry) {
  const errors = problems(claim, SOURCES, true);
  if (errors.length) throw new Error(`${claim.key}: ${errors.join('; ')}`);
}
const uniqueRefs = refs => [...new Map(refs.map(ref => [JSON.stringify(ref), ref])).values()];
const sourceLink = ([id, at], local = false) => {
  const source = SOURCES[id];
  if (!source || source.status !== 'verified' || source.unchecked) throw new Error(`Cannot cite unverified source ${id}`);
  return `<li><a href="${local ? `#source-${esc(id)}` : esc(source.url)}"${local ? '' : ' rel="noopener noreferrer" target="_blank"'}>${esc(source.title)}</a><span>${esc(at)}</span></li>`;
};
const refsList = (refs, local = false) => refs.length ? `<ul class="claim-refs">${uniqueRefs(refs).map(ref => sourceLink(ref, local)).join('')}</ul>` : '';
const claimRows = renderClaimRows(registry);

const sourceRecords = Object.entries(SOURCES).map(([id, source]) => {
  const verified = source.status === 'verified' && !source.unchecked;
  return `<article class="source ${verified ? '' : 'unchecked'}" id="source-${esc(id)}" data-source-key="${esc(id)}" data-search="${esc([id, source.title, source.publisher, source.status, source.unchecked].join(' ').toLowerCase())}"><p class="kicker">${verified ? 'Verified public source' : 'Unchecked · not cited'}</p><h3>${esc(source.title || id)}</h3><p>${esc(source.publisher || 'Publisher not established')} · ${esc(source.published || source.dated || 'Publication date not established')} · ${verified ? 'Checked' : 'Attempted'} ${esc(source.accessed || source.attempted || 'Date not recorded')}</p>${verified ? `${source.section ? `<p>${esc(source.section)}</p>` : ''}<a href="${esc(source.url)}" rel="noopener noreferrer" target="_blank">Open source ↗</a>` : `<p>${esc(source.unchecked || 'The source has not been verified and cannot support a claim.')}</p>`}</article>`;
}).join('\n');

const extraCalcRefs = { 'carnot-cop': [['nist-refrigeration-2020', 'PDF pp. 2–3, equation (1) and definitions of cold and hot temperatures']] };
const calcAssumptions = {
  'orbit-period': ['model-orbits'], 'orbit-altitude': ['model-orbits'],
  'orbit-slant-range': ['model-orbits', 'model-nadir'], 'vacuum-light-time': ['model-orbits', 'model-nadir'],
  'ideal-diffraction': ['model-lab-aperture', 'model-band-examples'], 'photon-energy': ['model-band-examples'],
  'planck-band-radiance': ['model-blackbody', 'model-band-examples'], 'planck-band-photons': ['model-blackbody', 'model-band-examples'],
};
const calcPlain = {
  'cinematic-spectrum': 'Compares how much light a cooler and a hotter object give off at each wavelength.',
  'cinematic-charge': 'Follows light into collected charge, then into a whole-number reading.',
  'cinematic-wheel': 'Shows how spinning a wheel one way turns the spacecraft the other way.',
  'cinematic-power': 'Tracks the battery as sunlight comes and goes over an illustrative orbit.',
  'cinematic-slab': 'Shows how a layer of gas both dims the light behind it and adds its own glow.',
  'cinematic-calibration': 'Corrects a reading using two known reference values.',
  'ideal-prime-focus': 'Shows that a parabolic mirror sends parallel light to one point.',
  'ideal-scan-reflection': 'Shows that tilting a mirror turns the reflected beam by twice the tilt.',
  'kepler-illustration-motion': 'Places a satellite along an ellipse over time, fastest when closest to Earth.',
  'cooler-energy-balance': 'The heat a cooler must throw away is the heat it removes plus the power it uses.',
  'orbit-period': 'How long one lap takes, from the orbit’s size.',
  'orbit-speed': 'How fast a satellite moves at a given distance from Earth’s center.',
  'orbit-altitude': 'The height above Earth at a point along an ellipse.',
  'orbit-slant-range': 'The straight-line distance from a satellite down to the ground point below it.',
  'vacuum-light-time': 'How long light takes to cover a distance in empty space.',
  'ideal-diffraction': 'The smallest angle an ideal circular opening can separate, set by wavelength and width.',
  'photon-energy': 'The energy carried by one particle of light, from its wavelength.',
  'planck-band-radiance': 'How bright an ideal warm object looks in a stated band of wavelengths.',
  'planck-band-photons': 'The same brightness counted as particles of light instead of energy.',
  'orbit-compare': 'Puts the four teaching orbits side by side: height, lap time, share of Earth in view, light time.',
  'horizon-elevation': 'How high above the horizon a satellite appears from a given latitude.',
  'planck-contrast-example': 'How many times brighter an ideal hot gas is than an ideal ground-temperature surface, in two bands.',
  'carnot-cop': 'The best a refrigerator could possibly do between a cold and a warm temperature.',
  'us-customary-to-si': 'Converts published feet and pounds into meters and kilograms.',
  'ideal-cooling-work': 'The least power an ideal cooler needs to hold a cold stage, and the heat it rejects.',
};
const calcRows = Object.entries(CALCS).map(([id, calc]) => {
  const usedBy = registry.filter(claim => claim.ev?.calc === id);
  const refs = [...usedBy.flatMap(claim => claim.ev.refs || []), ...(extraCalcRefs[id] || [])];
  const assumptions = calcAssumptions[id] || [];
  return `<article class="assumption-row" id="calc-${esc(id)}"><p class="kicker">Calc.${id === 'carnot-cop' ? ' · reference formula only' : ''}</p><h3>${esc(calc.title)}</h3><p class="plain-calc">${esc(calcPlain[id] || '')}</p><details class="formula"><summary>Show the formula and inputs</summary><p>${esc(calc.how)}</p>${calc.inputs?.length ? `<p><strong>Inputs:</strong> ${calc.inputs.map(esc).join('; ')}.</p>` : ''}</details>${assumptions.length ? `<p>${assumptions.map(key => `<a href="#assume-${esc(key)}">${esc(ASSUMPTIONS[key].title)}</a>`).join(' · ')}</p>` : ''}${id === 'carnot-cop' ? '<p>The pure mathematics module includes this limit. The scenario assigns no cold-stage load, actual efficiency, cooler input power, or instrument temperature.</p>' : ''}${refsList(refs)}</article>`;
}).join('\n');
const assumptionRows = Object.entries(ASSUMPTIONS).map(([id, assumption]) => {
  const refs = registry.filter(claim => claim.ev?.assume === id).flatMap(claim => claim.ev.refs || []);
  return `<article class="assumption-row" id="assume-${esc(id)}"><p class="kicker">Assumed</p><h3>${esc(assumption.title)}</h3><p><strong>${esc(assumption.value)}</strong></p><p>${esc(assumption.why)}</p>${refs.length ? `<p>The following references supply the underlying physics or published reference inputs. The choice of teaching inputs remains an assumption.</p>${refsList(refs)}` : ''}</article>`;
}).join('\n');
const labels = Object.entries(BASIS).filter(([, basis]) => !basis.legacy).map(([, basis]) => `<dt>${esc(basis.short)}</dt><dd>${esc(basis.meaning)}</dd>`).join('');
const defaultScenarioLabel = scenarioLabel(DEFAULT_SCENARIO);
const engineeringRefs = (...ids) => ids.flatMap(id => SPACECRAFT_FACTS[id][3].refs);

// Definitions are qualitative. Numerical civil specifications remain in the claim register.
const glossaryGroups = [
  ['orbits', 'Orbits and geometry', [
    ['geostationary', 'Geostationary orbit', 'A circular orbit over the equator that moves with Earth’s rotation and keeps a satellite above the same ground location.', [['noaa-geo-definition', 'Definition paragraph']]],
    ['geosynchronous', 'Geosynchronous orbit', 'An orbit with a period equal to Earth’s rotation relative to the stars. The circular, equatorial, prograde case is geostationary.', [['nasa-orbit-catalog', 'High Earth Orbit']]],
    ['heo', 'HEO', 'Highly elliptical orbit: a highly eccentric path whose closest and farthest distances from Earth differ greatly. NASA’s catalog describes the Molniya orbit as an example. This site’s HEO example is a generic teaching ellipse.', [['nasa-orbit-catalog', 'Medium Earth Orbit: Molniya orbit paragraphs (highly eccentric; eccentricity 0.722)']]],
    ['leo-meo', 'LEO and MEO', 'Low Earth orbit and medium Earth orbit are orbit families. Their selected altitudes here are teaching inputs, not the parameters of a military program.', [['nasa-orbit-catalog', 'Low Earth Orbit; Medium Earth Orbit']]],
    ['semi-major-axis', 'Semi-major axis', 'Half the longest diameter of an ellipse. In the two-body model it sets the orbital period; it is measured from the ellipse’s center, not from Earth’s surface.', [['nasa-orbit-equation', 'Opening orbital-elements discussion']]],
    ['eccentricity', 'Eccentricity', 'A measure of an orbit’s shape. A circular orbit has zero eccentricity; increasing elliptic eccentricity makes the ellipse more elongated.', [['nasa-orbit-equation', 'Opening orbital-elements discussion']]],
    ['apogee-perigee', 'Apogee and perigee', 'The farthest and closest points, respectively, in an orbit around Earth. The HEO calculation displayed here uses apogee.', [['nasa-orbit-equation', 'Polar equation and motion near perigee and apogee']]],
    ['inclination', 'Inclination', 'The angle between an orbital plane and its reference plane. Earth’s equatorial plane is the usual reference for Earth satellites.', [['nasa-orbit-equation', 'The Orbit in Space']]],
    ['nadir', 'Nadir', 'The direction toward the surface point directly below the observer. The model uses that point to define its reference distance.', [], 'method.html#assume-model-nadir'],
    ['sidereal-day', 'Sidereal day', 'Earth’s rotation period measured against the stars rather than the Sun, so a few minutes shorter than a solar day. JPL’s tabulated mean value is referenced to the equinox. It supplies the general geosynchronous reference period.', [['nasa-jpl-parameters', 'Parameter table: mean sidereal day']]],
    ['kelvin', 'Kelvin (K)', 'The SI unit of temperature, used on this site for cold detectors. The kelvin scale counts up from absolute zero, the coldest possible temperature; one kelvin step equals one degree Celsius step.', [], 'method.html#calculations'],
  ]],
  ['light', 'Light and thermal radiation', [
    ['infrared', 'Infrared', 'Electromagnetic radiation at wavelengths longer than visible light. Infrared instruments can measure thermal emission from warm objects.', [['nasa-em-math', 'Electromagnetic spectrum and The Energy of Light activities']]],
    ['photon', 'Photon', 'A quantum of electromagnetic radiation. A photon’s energy depends on its frequency, and therefore on its wavelength.', [['nasa-em-math', 'Activity 47, PDF p. 112']]],
    ['wavelength', 'Wavelength', 'The spatial repeat distance of a wave. In vacuum, wavelength multiplied by frequency equals the speed of light.', [['nasa-em-math', 'Activity 47, PDF p. 112, problem 4']]],
    ['spectral-band', 'Spectral band', 'A selected interval of wavelengths. An instrument channel has a particular spectral response; the model’s teaching intervals are ideal rectangles, not instrument responses.', [['landsat9-tirs2-nasa', 'Spectral Bands']], 'method.html#assume-model-band-examples'],
    ['swir-mwir-lwir', 'SWIR, MWIR and LWIR', 'Short-wave, mid-wave and long-wave infrared. The model uses these broad labels to organize illustrative wavelengths, without adopting universal boundaries or a real sensor bandpass.', [['nasa-irdetectors-ntrs', 'Sections A.1–A.3 and Table 1']], 'method.html#assume-model-band-examples'],
    ['molecular-band', 'Molecular emission band', 'A region of the spectrum associated with radiation from a molecule. The cited civil combustion study identifies bands of carbon dioxide and water vapor.', [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7, gaseous combustion products paragraph']]],
    ['atmospheric-window', 'Atmospheric absorption and windows', 'Atmospheric gases absorb some wavelengths more strongly than others. A window is a region with greater transmission; this site does not calculate a transmission curve.', [['nasa-atmospheric-windows', 'Absorption Bands and Atmospheric Windows']]],
    ['blackbody', 'Blackbody', 'An ideal thermal radiator whose spectrum depends on its temperature. The model’s uniform blackbody is a teaching source, not a measured Earth scene or plume.', [['noaa-planck-function', 'First formula image']], 'method.html#assume-model-blackbody'],
    ['spectral-radiance', 'Spectral radiance', 'Radiant power per projected area, per solid angle, and per wavelength interval. Stating the wavelength unit matters: a per-meter density differs from a per-micrometer density.', [['noaa-planck-function', 'Wavelength calculator and first formula image']]],
    ['band-radiance', 'Band radiance', 'Spectral radiance integrated across a stated wavelength interval. The result retains area and solid-angle units; it is not power collected by a detector.', [['noaa-planck-function', 'Wavelength-form Planck law']], 'method.html#calc-planck-band-radiance'],
    ['photon-radiance', 'Photon radiance', 'Radiance expressed as a photon rate per projected area and solid angle. Each wavelength’s energy radiance is divided by the energy of one photon before integration.', [['nasa-em-math', 'Activity 47, PDF p. 112']], 'method.html#calc-planck-band-photons'],
    ['diffraction', 'Diffraction', 'The spreading and interference associated with a wave passing through an aperture. The ideal circular-aperture example gives an angular scale, not the measured resolution of a real instrument.', [['nasa-em-math', 'Activity 46, PDF p. 110']], 'method.html#calc-ideal-diffraction'],
    ['light-time', 'Vacuum light time', 'The time light takes to cross a stated distance in vacuum. Processing and communications routing add other delays, so this is not a warning-system latency.', [['nist-codata-2022', 'Speed of light in vacuum']], 'method.html#calc-vacuum-light-time'],
    ['plume', 'Plume', 'The hot exhaust gas behind a rocket engine. Hot combustion gases such as carbon dioxide and water vapor emit infrared radiation in molecular bands, as the cited civil combustion study shows; this site’s plume is an illustration, not a measured intensity.', [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7']]],
  ]],
  ['hardware', 'Instruments and architecture', [
    ['opir', 'OPIR', 'Overhead persistent infrared: the term used in the cited public architecture documents for space-based infrared observation supporting warning and related missions.', [['gao-21-105249', 'Background, printed pp. 3–4']]],
    ['missile-warning', 'Missile warning', 'Detecting a missile launch and alerting the people who must respond. The cited GAO report describes missile-warning satellites that observe Earth in the infrared from space; this site explains their physics and public architecture only.', [['gao-21-105249', 'Background, printed pp. 3–4']]],
    ['sbirs', 'SBIRS', 'Space Based Infrared System. The Space Force fact sheet describes GEO satellites, HEO sensors riding on host satellites, legacy DSP satellites and ground systems, with an infrared payload of two sensors: a scanner and a step-starer. GAO describes the same geosynchronous and highly elliptical orbits.', [['ssc-sbirs-factsheet', 'Payload and program composition paragraphs (current as of March 2023)'], ['gao-21-105249', 'Printed p. 4 / PDF p. 8']]],
    ['bus-payload', 'Bus and payload', 'The bus is the spacecraft platform supporting the mission equipment. An infrared payload, a mission processor, and communications equipment have distinct roles in the public architecture described by GAO.', [['gao-26-107085', 'PWSA-Enabling Technologies and Processes, opening description']]],
    ['pwsa', 'PWSA', 'Proliferated Warfighter Space Architecture: the Space Development Agency’s planned satellite architecture. GAO’s public description names a spacecraft bus, infrared payload, mission processor, and communications equipment.', [['gao-26-107085', 'PWSA-Enabling Technologies and Processes, opening description.']]],
    ['ground-segment', 'Ground segment', 'The receiving, spacecraft-operations, and mission-data-processing parts of a space system on the ground. A drawn ground marker represents those roles, not an actual facility layout.', [['gao-21-105249', 'Printed p. 1 / PDF p. 5 and printed p. 8 / PDF p. 12']]],
    ['forge', 'FORGE', 'Future Operationally Resilient Ground Evolution. GAO’s historical program description assigns the planned system spacecraft-operations and mission-data-processing roles.', [['gao-21-105249', 'Printed p. 1 / PDF p. 5, opening paragraph']]],
    ['abi', 'ABI', 'Advanced Baseline Imager, the civil imaging instrument of the GOES-R satellite series. Its published channel and observing-cadence figures describe that instrument alone.', [['noaa-abi-page', 'Instrument description']]],
    ['tirs2', 'TIRS-2', 'Thermal Infrared Sensor 2, the Landsat 9 civil thermal instrument. Its published detector, optics, and cooling specifications remain attached to that named instrument.', [['nasa-tirs2-build', 'Instrument design and cryocooler paragraphs']]],
    ['focal-plane', 'Focal plane', 'The region where an optical system forms its image and detector assemblies receive the light. The civil examples show that instrument-specific optical and detector designs vary.', [['goes-r-databook', 'Printed pp. 3-8 and 3-11 / PDF pp. 36 and 39']]],
    ['scanning-staring', 'Scanning and staring', 'Two broad ways to cover a scene. A scanning instrument sweeps its line of sight across the scene with moving mirrors, as ABI does with two scan mirrors. A staring instrument holds a two-dimensional detector array on the whole scene at once.', [['goes-r-databook', 'Printed p. 3-7 / PDF p. 35, Optical System and Figure 3-4']]],
    ['qwip', 'QWIP', 'Quantum well infrared photodetector, a detector technology used in the named TIRS civil instruments. Selecting this material family does not assign an operating temperature.', [['landsat9-tirs2-nasa', 'Design section']]],
    ['hgcdte-insb', 'HgCdTe and InSb', 'Mercury cadmium telluride and indium antimonide: infrared detector materials discussed in the opened NASA detector review. A material name alone is not a temperature or performance specification.', [['nasa-irdetectors-ntrs', 'PDF pp. 3–7, sections A.1–A.3']]],
    ['cryocooler', 'Cryocooler', 'A refrigerator that removes heat from a cold region. The cold-stage temperature, heat lift, and required input power depend on the particular device and operating conditions.', [['nist-refrigeration-2020', 'Opening refrigeration discussion, PDF pp. 2–3']]],
    ['carnot-cop', 'Carnot coefficient of performance', 'The ideal refrigeration limit relating heat removed at the cold temperature to required work. A real cooler’s efficiency and heat load are separate quantities.', [['nist-refrigeration-2020', 'PDF pp. 2–3, equation (1) and definitions']], 'method.html#calc-carnot-cop'],
  ]],
  ['spacecraft', 'Spacecraft services', [
    ['solar-string', 'Solar cell, string, and array', 'A photovoltaic cell produces electrical current from absorbed light. Cells connected in series form a string; strings can be connected in parallel as part of an array circuit. Mechanical panel boundaries and electrical circuit boundaries are different descriptions.', engineeringRefs('solar-cells','solar-strings')],
    ['slip-ring', 'Slip ring', 'An electrical connection across a rotating interface. GOES-R uses a slip-ring assembly to transfer power from its rotating solar wing to the spacecraft; the motor and resolver belong to the associated drive assembly.', engineeringRefs('array-drive')],
    ['power-conditioning', 'Power conditioning and distribution', 'Conditioning regulates or converts the available electrical supply. Distribution delivers it to equipment through feeds and switches, with sensing and protection. GOES-R assigns these functions to different modules in its Power Regulation Unit.', engineeringRefs('power-regulation','power-distribution')],
    ['buck-boost', 'Buck and boost converters', 'DC power converters that step voltage down or up. GOES-R uses buck/boost converters for battery charge and discharge, and buck converters to derive its lower-voltage bus from the higher-voltage supply.', engineeringRefs('power-regulation')],
    ['battery-eclipse', 'Eclipse power', 'Stored electrical energy supports spacecraft loads while Earth blocks sunlight from the array. In GOES-R, batteries also supply demand beyond the available array output and recharge when excess array power is available.', engineeringRefs('battery-support')],
    ['attitude', 'Attitude versus orbit', 'Attitude is the spacecraft’s orientation; its orbit describes its path around Earth. GOES-R’s guidance, navigation, and control subsystem determines both, using attitude-reference sensors for orientation and separate navigation information for orbital position.', engineeringRefs('attitude-sensors')],
    ['star-tracker', 'Star tracker and inertial reference', 'A star tracker uses celestial observations as an attitude reference. An inertial unit measures motion with onboard sensors. GOES-R combines star trackers and an inertial measurement unit to determine attitude.', engineeringRefs('attitude-sensors').concat([['nasa-onboard-attitude','Celestial Reference and Inertial Reference']])],
    ['reaction-wheel', 'Reaction wheel', 'A motor-driven wheel exchanges angular momentum with the spacecraft to control its attitude. Propulsion can help manage accumulated wheel momentum. A wheel is an actuator; a star tracker is a sensor.', engineeringRefs('wheel-principle','wheel-control')],
    ['mli', 'Multilayer insulation (MLI)', 'Thermal blankets used to reduce unwanted heat transfer. GOES-R uses MLI alongside coatings and low-conductivity supports; radiators provide a deliberately different path for rejecting heat.', engineeringRefs('mli','radiator')],
    ['ttc', 'Tracking, telemetry, and command (TT&C)', 'Spacecraft communication functions for tracking, reporting engineering status, and receiving commands. GOES-R documents these responsibilities separately from instrument-data transmission and relay services.', engineeringRefs('communications','command-gateway')],
  ]],
  ['electronics', 'Payload electronics and interfaces', [
    ['fpa-fpm', 'FPA and FPM', 'In ABI, a focal-plane array combines the detector array and its associated readout integrated circuit for one spectral channel. A focal-plane module groups the filtered channels for a spectral region. These are different levels of assembly.', [['goes-r-databook', 'Printed p. 3-9 / PDF p. 37, Focal Plane Modules']]],
    ['roic', 'Readout integrated circuit (ROIC)', 'The integrated circuit associated with a detector array that reads its electrical response. In ABI this belongs to the focal-plane array; the video-processing electronics are a separate stage.', [['goes-r-databook', 'Printed p. 3-9 / PDF p. 37']]],
    ['video-processor', 'Video Processor', 'ABI electronics that generate array timing and bias, collect detector samples, and format them for transmission to the Data Processor in the Electronics Unit.', [['goes-r-databook', 'Printed p. 3-16 / PDF p. 44, Sensor Unit Electronics']]],
    ['bias-timing', 'Detector bias and timing', 'Electrical operating voltages and clock signals supplied to read out the detector arrays. ABI assigns these functions to its Video Processors.', [['goes-r-databook', 'Printed p. 3-16 / PDF p. 44, Video Processors paragraph']]],
    ['sue', 'Sensor Unit Electronics (SUE)', 'In ABI, electronics in the Sensor Unit that digitize focal-plane data and control mechanisms. Video Processors and Peripheral and Thermal Control electronics form the SUE.', [['goes-r-databook', 'Printed pp. 3-15–3-16 / PDF pp. 43–44']]],
    ['eu', 'Electronics Unit (EU)', 'ABI’s main electrical interface to the spacecraft. Its chassis and circuit cards provide power supplies, command and control, data processing, telemetry, and scan control.', [['goes-r-databook', 'Printed p. 3-16 / PDF p. 44, Electronics Unit']]],
    ['packetization', 'Packetization', 'Organizing data into packets for further handling. ABI’s Data Processor formats and packetizes detector data received from the Video Processor; this is distinct from the earlier digitization of the detector signals.', [['goes-r-databook', 'Printed p. 3-15 / PDF p. 43 and Table 3-6, printed p. 3-17 / PDF p. 45']]],
    ['cce', 'Cryocooler Control Electronics (CCE)', 'ABI electronics that operate each cryocooler. A platinum resistance thermometer measures the cold-head temperature; the controller adjusts power-amplifier duty cycle to maintain its set point.', [['goes-r-databook', 'Printed p. 3-17 / PDF p. 45, Cryocooler Control Electronics']]],
    ['thermal-interface', 'Thermal interface', 'A physical connection whose thermal role must be accounted for. GOES-R isolates ABI from its platform with titanium mounting feet while providing a separate loop-heat-pipe connection to its dedicated radiator.', [['goes-r-databook', 'Printed p. 14-5 / PDF p. 159, Earth Pointing Platform']]],
  ]],
  ['subsystems', 'Electronics and mechanism assemblies', COMPONENT_GLOSSARY],
  ['reading', 'Reading this project', [
    ['civil-twin', 'Civil twin', 'This project’s name for a specifically identified civil instrument used to explain published engineering. Its specifications are never substituted for an unknown military payload.', [], 'method.html#scope'],
    ['as-drawn', 'As drawn', 'A representative illustration. Its dimensions, spacecraft placement, colors, and exploded spacing are visual choices, not hardware specifications.', [], 'method.html#assume-look-model'],
    ['level', 'Level', 'A place in the visual journey, from Earth and orbit families to an instrument or detector element.', [], 'visualizer.html'],
    ['layer', 'Layer', 'One of the explorer’s Light, Data, and Heat views, each highlighting different component roles in the same schematic geometry.', [], 'visualizer.html'],
    ['calculation', 'Calc.', 'A value calculated by this site. Its formula, chosen inputs, and source references are available separately from published specifications.', [], 'method.html#calculations'],
    ['assumption', 'Assumed', 'A documented teaching or drawing choice. The label identifies a chosen input, not a verified property of a real system.', [], 'method.html#assumptions'],
    ['unchecked', 'Unchecked', 'A source that has not been successfully verified for use here. A failed fetch, an access challenge, or an unresolved source pointer cannot support a claim.', [], 'evidence.html#sources-heading'],
  ]],
];
const glossary = glossaryGroups.map(([group, title, entries]) => `<section aria-labelledby="gloss-${esc(group)}"><h2 id="gloss-${esc(group)}">${esc(title)}</h2>${entries.map(([id, term, definition, refs, method]) => `<article class="source" id="term-${esc(id)}"><h3>${esc(term)}</h3><p>${esc(definition)}</p>${refsList(refs)}${method ? `<p><a href="${esc(method)}">How this project uses the term →</a></p>` : ''}</article>`).join('\n')}</section>`).join('\n');

const inventory = partInventory(content(model));
const assemblyCount = inventory.reduce((n,entry)=>n+entry.parts.length,0);
const componentCount = inventory.reduce((n,entry)=>n+entry.parts.reduce((m,part)=>m+part.components.length,0),0);
const TOP_FACT_KEYS = ["story:geo-altitude", "story:co2-band", "story:h2o-band", "story:plume-contrast", "story:orbit-compare-geo", "story:geo-view-angle", "story:sbirs-scanning-staring", "story:abi-full-disk-cadence", "story:tirs2-temperature", "story:sbirs-data-downlink", "story:public-components", "story:atmospheric-absorption"];
const topFacts = TOP_FACT_KEYS.map(key => {
  const claim = registry.find(row => row.key === key);
  if (!claim) throw new Error(`Top fact ${key} is not in the registry`);
  return `<li><a href="#claim-${esc(key)}"><strong>${esc(claim.label)}</strong></a>: ${esc(claim.value)} <span class="basis-tag">${esc(BASIS[claim.basis].short)}</span></li>`;
}).join('');
const body = {
  parts: `<p class="eyebrow">Parts</p><h1>Every assembly, named</h1><p class="lede">The complete component reference behind the visualizer: what each assembly is, what is inside it, and how light, data, power and heat connect it to the rest of the spacecraft.</p><p class="hero-note">${notice}</p><details class="parts-schematics"><summary>System diagrams <span>Spacecraft · ABI · TIRS-2</span></summary>${renderSystemDiagrams()}</details><section id="parts-guide"><h2>Read the hardware</h2><p>The same component names and descriptions appear here and in the 3D cards. Large assemblies contain individually named subcomponents; each entry carries its evidence. Payload details are grouped under their sensor, electronics or cooler-control parent. A selectable function does not imply a separate enclosure, and a supplier responsibility does not define a physical box. GOES-R and ABI provide the detailed civil spacecraft example, while TIRS-2 shows a different instrument architecture. Shared components appear again where a close-up or civil comparison needs them.</p><p>The diagrams and 3D geometry are representative arrangements. This is a public engineering reference, not an as-built bill of materials for a military spacecraft. Connectors, fasteners, cable routing and package dimensions remain drawing choices where the sources do not establish them.</p><p id="parts-scenario"><strong>Default teaching choices: ${esc(defaultScenarioLabel)}</strong></p><p class="scenario-gloss">Teaching choices are the explorer’s own inputs, not the settings of any real sensor: an orbit, a telescope size (representative or a civil twin), an infrared band (<a href="glossary.html#term-swir-mwir-lwir">SWIR, MWIR or LWIR</a>: short-, mid- or long-wave infrared) and a detector material (<a href="glossary.html#term-hgcdte-insb">HgCdTe</a> is mercury cadmium telluride).</p><label for="parts-search">Find a component or function</label><input type="search" id="parts-search" placeholder="Solar array, encoder, interface, cryocooler…" aria-controls="parts-register"><p class="filter-count" id="parts-count" role="status">${assemblyCount} assembly entries · ${componentCount} component entries</p><p class="filter-empty" id="parts-empty" hidden>No matching components.</p></section><div id="parts-register" data-scenario-view="default">${renderParts(content(model))}</div>`,
  evidence: `<p class="eyebrow">Evidence</p><h1>What backs each figure</h1><p class="lede">Every figure has a label and a trail: a published source, a calculation, or an explicit assumption.</p><p class="hero-note">${notice}</p><section class="start-here-evidence" id="start-here" aria-labelledby="start-here-heading"><h2 id="start-here-heading">Start here</h2><p>This page is a reference, so you do not need to read it in order. Read a few facts, learn how to read a label, then search the register when you want the source behind a figure.</p><div class="chip-guide"><h3>How to read a label</h3><ol><li><strong>Find the label</strong> beside a figure: Spec, Vendor, Reported, Calc. or Assumed.</li><li><strong>Tap it.</strong> A panel shows the source and the passage, the calculation, or the assumption behind the figure.</li><li><strong>Read the scope.</strong> Each entry says what the figure is not, for example never a military performance.</li></ol></div><div class="top-facts"><h3>Twelve facts to start with</h3><ul>${topFacts}</ul></div></section><section aria-labelledby="claims-heading"><h2 id="claims-heading">Claim register</h2><label for="claim-search">Find a claim</label><input type="search" id="claim-search" placeholder="Label, value, basis or source" aria-controls="claim-register"><p class="filter-count" id="claim-count" role="status">${registry.length} claims</p><p>The register includes the story, the current explorer cards, and the mathematical examples. Civil specifications always belong to the named instrument.</p><p id="claim-scenario"><strong>Default teaching choices: ${esc(defaultScenarioLabel)}</strong></p><p class="scenario-gloss">Teaching choices are the explorer’s own inputs, not the settings of any real sensor: an orbit, a telescope size (representative or a civil twin), an infrared band (<a href="glossary.html#term-swir-mwir-lwir">SWIR, MWIR or LWIR</a>: short-, mid- or long-wave infrared) and a detector material (<a href="glossary.html#term-hgcdte-insb">HgCdTe</a> is mercury cadmium telluride).</p><p>The default snapshot remains readable without JavaScript. With JavaScript, the register follows the teaching choices in the page address.</p><p>Each Calc. entry links to its formula; each Assumed entry explains the chosen input. Published inputs list the exact passage. These links remain available without JavaScript.</p><div class="claim-register" id="claim-register" data-scenario-view="default">${claimRows}</div><p class="filter-empty" id="claim-empty" hidden>No matching claims.</p></section><section aria-labelledby="labels-heading"><h2 id="labels-heading">The labels</h2><dl class="basis-list">${labels}</dl></section><section aria-labelledby="sources-heading"><h2 id="sources-heading">Source register</h2><p>A verified record can support a claim only when that claim identifies the relevant passage. Unchecked records and source pointers are retained for transparency and do not support claims. Publication dates describe the source; checked dates record this project’s review.</p><label for="source-search">Filter source records</label><input type="search" id="source-search" placeholder="Title, publisher, status or source ID" aria-controls="source-register"><p class="filter-count" id="source-count" role="status">${Object.keys(SOURCES).length} source records</p><div id="source-register">${sourceRecords}</div><p class="filter-empty" id="source-empty" hidden>No matching source records.</p></section>`,
  method: `<p class="eyebrow">Method</p><h1>Show the reasoning</h1><p class="lede">General physics explains the relationships. Cited civil instruments supply their own published detail. The boundary between them stays visible.</p><p class="hero-note">${notice}</p><aside class="start-here" aria-label="Start here"><p><strong>Start here.</strong> This is the reference page. The story at the top of this site explains the physics in plain language; come here to check the reasoning.</p><p>Every formula below opens from a one-line summary, so you can read the idea first and the mathematics only if you want it.</p></aside><section id="scope"><h2>What the engine calculates</h2><p>The orbit example gives a two-body period, altitude, geometric distance to nadir, and one-way vacuum light travel time. Separate radiation examples calculate the energy of a photon, ideal circular-aperture diffraction, and the radiance of an ideal blackbody over a stated wavelength interval.</p><p>The teaching inputs do not specify the spacecraft in the drawing. Orbit choice affects the orbit example. Wavelength affects the optical and radiation examples. Changing orbit or detector material does not change the blackbody source radiance. A laboratory aperture is used only for the independent diffraction example.</p><p>The civil aperture selection leaves diameter and diffraction unavailable because the ABI aperture was not verified in the opened sources. Detector material selections do not assign a temperature. Published TIRS-2 temperatures describe Landsat 9 TIRS-2 specifically.</p><p>The engine contains no real plume intensity, received sensor photon count, detection threshold, signal-to-noise ratio, ground resolution, array format, frame rate, or cryocooler power model. It does not calculate constellation coverage, revisit, operational status, or warning latency. Atmospheric absorption is explained qualitatively; no transmission curve is assumed.</p></section><section id="calculations"><h2>Formulas and units</h2><p>Calculations use meters, seconds, kelvins, and exact SI radiation constants internally. Display values are rounded for reading. Each formula below links to its published physics and the teaching assumptions used with it.</p>${calcRows}</section><section id="assumptions"><h2>Teaching and drawing assumptions</h2><p>These choices make the equations readable. They remain labeled Assumed even when a calculation uses them. A numerical result does not make its chosen inputs into measured hardware properties.</p>${assumptionRows}<p>The scene colors and exploded spacing separate component roles. Amber light paths and blue cold parts are visual cues, not measured radiance or temperature. Geometric scales may be compressed or enlarged for legibility.</p></section><section id="checks"><h2>How the work is checked</h2><p>The numerical tests check the orbital reference values, ellipse geometry, and vacuum light time. Radiation tests check wavelength units, the long-wavelength limit, integrated blackbody energy, photon-energy conversion, and convergence when integration intervals are refined. Tests also check every declared scenario combination and preserve unavailable civil and detector values.</p><p>The claim audit follows the same registry used by the cards and source dialogs. It rejects missing evidence, unknown calculations or assumptions, legacy labels, and unchecked citations. Type checks and browser gates cover interface behavior, framing, camera paths, rendering, and links.</p><p><a href="evidence.html">Read the claim and source registers →</a></p></section>`,
  glossary: `<p class="eyebrow">Glossary</p><h1>A shared vocabulary</h1><p class="lede">The orbit, light, spacecraft, instrument, and evidence terms used in the explainer, with the public sources that ground them.</p><p class="hero-note">${notice}</p>${glossary}`,
};
const descriptions = {
  parts: 'A sourced component reference for spacecraft systems, infrared payload electronics, optics, mechanisms, cooling and civil instruments.',
  evidence: 'Sources, assumptions and calculations behind The Guardian Ring’s cited educational explainer.',
  method: 'The general orbit and radiation formulas, teaching assumptions and limitations used by The Guardian Ring.',
  glossary: 'Cited definitions of orbit, infrared, instrument and evidence terms used by The Guardian Ring.',
};

// The right-hand side of each reference page's head: one of the story's own stills (the same files the story uses) and an
// index of the page's sections, so the head is not a quarter-width column of type with an empty right side.
const STILL_ALT = {
  satellite: 'Open representative spacecraft bus with solar-cell strings, array drives, a telescope under a flared sunshade, battery and avionics equipment, reaction wheels, a propellant tank, antennas, and a displaced radiator.',
  ring: 'An illuminated Earth surrounded by a schematic orbital ring of enlarged representative satellites.',
  'focal-plane': 'Representative detector and readout package inside an open cold shield, with mounting supports, a gold flex interconnect, thermal strap, cooler, warm video electronics, bias/timing board and temperature-feedback electronics.',
  payload: 'Representative integrated infrared instrument: sensor assembly with optics and detector-side electronics, common instrument-electronics chassis, and separate cooler controls.',
};
const HEAD_ASIDE = {
  evidence: { still: 'satellite', caption: 'Representative spacecraft, as drawn. A generic illustration, not a model of a real satellite.',
    toc: [['start-here', 'Start here'], ['claims-heading', 'Claim register'], ['labels-heading', 'The labels'], ['sources-heading', 'Source register']] },
  method: { still: 'ring', caption: 'The ring, as drawn: schematic positions, compressed orbit spacing, enlarged satellites.',
    toc: [['scope', 'What the engine calculates'], ['calculations', 'Formulas and units'], ['assumptions', 'Teaching and drawing assumptions'], ['checks', 'How the work is checked']] },
  glossary: { still: 'focal-plane', caption: 'Representative detector package, as drawn.',
    toc: glossaryGroups.map(([group, title]) => [`gloss-${group}`, title]) },
  parts: { still: 'payload', caption: 'Representative instrument, as drawn.',
    toc: [['parts-guide', 'Read the hardware'], ...inventory.map(({ scene }) => [`parts-${scene.id}`, scene.title])] },
};
function headAside(id) {
  const { still, caption, toc } = HEAD_ASIDE[id];
  return `<aside class="page-aside"><figure class="page-fig"><img src="look/${still}.webp?v=exp1" width="1600" height="1000" alt="${esc(STILL_ALT[still])}" decoding="async"><figcaption>${esc(caption)}</figcaption></figure><nav class="page-toc" aria-label="On this page"><p class="mini-label">On this page</p><ol>${toc.map(([anchor, title]) => `<li><a href="#${esc(anchor)}">${esc(title)}</a></li>`).join('')}</ol></nav></aside>`;
}
const requested = process.argv.slice(2), targets = requested.length ? requested : ['evidence', 'method', 'glossary', 'parts'];
for (const id of targets) {
  if (!Object.hasOwn(body, id)) throw new Error(`Unsupported page: ${id}; supported pages are evidence, method, glossary, parts`);
  const title = nav.find(([page]) => page === id)[1];
  const canonical = `https://reedos.dev/guardian_ring/${id}.html`;
  const jsonld = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', '@id': canonical,
    url: canonical, name: `${title} · The Guardian Ring`, description: descriptions[id], inLanguage: 'en-US',
    isPartOf: { '@type': 'WebSite', name: 'The Guardian Ring', url: 'https://reedos.dev/guardian_ring/' } }).replace(/</g, '\\u003c');
  const pageBody = body[id].replace(/^(.*?<p class="hero-note">.*?<\/p>)/s, head => `<header class="page-head has-aside"><div class="page-head-text">${head.replace('<h1>', '<h1 class="page-t">')}</div>${headAside(id)}</header>`);
  fs.writeFileSync(`${id}.html`, `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="robots" content="index, follow"><meta name="description" content="${esc(descriptions[id])}"><link rel="canonical" href="${canonical}"><link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='11' fill='%230b1015' stroke='%23e6ba82' stroke-width='2'/%3E%3C/svg%3E"><title>${title} · The Guardian Ring</title><link rel="stylesheet" href="/src/pages/site.css">${id === 'parts' ? '<link rel="stylesheet" href="/src/pages/parts.css"><link rel="stylesheet" href="/src/pages/system-diagrams.css">' : ''}<link rel="stylesheet" href="/src/phone.css"><script type="application/ld+json">${jsonld}</script></head><body class="page scrolled"><a class="skip" href="#main">Skip to content</a>${siteHeader(id)}<main class="wrap page-wrap" id="main">${pageBody}</main>${siteFooter()}${['evidence','parts'].includes(id) ? `<script type="module" src="/src/pages/${id}.js"></script>` : ''}<script type="module" src="/src/app/site.js"></script></body></html>\n`);
  console.log(`Wrote ${id}.html`);
}
