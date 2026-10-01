// Preparatory content only: integrate a level after the preceding scene passes
// its gates. No DOM, geometry, source retrieval, or model calculations live here.
// Numerical rows preserve research/verified-facts.json. Additional qualitative
// civil component roles are reviewed in research/LEVELS-CONTENT-REVIEW.md.
// Civil facts stay on their named instruments; drawings use look-model.
const FACTS = {
  'satellite-components': ['Public architecture', 'Bus, infrared payload, mission processor, communications', 'reported', { refs: [['gao-26-107085', 'PWSA-Enabling Technologies and Processes, opening description.']] }],
  'forge-public-role': ['FORGE role', 'Spacecraft operations and mission-data processing', 'reported', { refs: [['gao-21-105249', 'Printed p. 1 (PDF p. 5), opening paragraph; printed p. 8 (PDF p. 12), acquisition-strategy paragraph.']] }],
  'abi-bands': ['ABI spectral channels', '16', 'spec', { refs: [['noaa-abi-page', 'Instrument description']] }],
  'abi-full-disk': ['ABI full-disk cadence', '10 min', 'spec', { refs: [['noaa-abi-page', 'Instrument description']] }],
  'abi-conus': ['ABI mainland U.S. cadence', '5 min', 'spec', { refs: [['noaa-abi-page', 'Instrument description']] }],
  'abi-meso': ['ABI mesoscale cadence', '30-60 s', 'spec', { refs: [['noaa-abi-page', 'One or two smaller areas, instrument description']] }],
  'abi-optics': ['ABI telescope', 'Four mirrors; three focal-plane modules', 'spec', { refs: [['goes-r-databook', 'Printed p. 3-8 / PDF p. 36']] }],
  'abi-detector-material': ['ABI infrared channels', 'HgCdTe', 'spec', { refs: [['goes-r-databook', 'Table 3-5, printed p. 3-11 / PDF p. 39']] }],
  'abi-ir-temp': ['ABI MWIR/LWIR optics and focal planes', 'Approximately 60 K', 'spec', { refs: [['goes-r-databook', 'Printed p. 3-8 / PDF p. 36']] }],
  'abi-vnir-temp': ['ABI VNIR optics and focal plane', 'Approximately 170 K; GOES-R FPM 180 K', 'spec', { refs: [['goes-r-databook', 'Printed p. 3-8 / PDF p. 36']] }],
  'abi-cooling': ['ABI cryocooler design', 'Two redundant two-stage pulse-tube coolers', 'spec', { refs: [['goes-r-databook', 'Printed p. 3-14 / PDF p. 42']] }],
  'abi-support-role': ['ABI optical-bench role', 'Structural support for sensor subsystems', 'spec', { refs: [['goes-r-databook', 'Table 3-4, printed p. 3-6 / PDF p. 34, Optical Bench row']] }],
  'abi-image-role': ['ABI telescope role', 'Forms a scene image on focal-plane detectors', 'spec', { refs: [['goes-r-databook', 'Table 3-4, printed p. 3-6 / PDF p. 34, Telescope row']] }],
  'abi-detector-role': ['ABI detector role', 'Converts incident photons into an electrical signal', 'spec', { refs: [['goes-r-databook', 'Table 3-4, printed p. 3-6 / PDF p. 34, Focal Plane Modules and Aft Optics row']] }],
  'abi-readout-role': ['ABI readout role', 'Reads detector arrays with video-processing electronics', 'spec', { refs: [['goes-r-databook', 'Table 3-4, printed p. 3-6 / PDF p. 34, Sensor Unit Electronics row']] }],
  'abi-cooler-role': ['ABI cooler heat path', 'Focal planes to loop heat pipes and radiator', 'spec', { refs: [['goes-r-databook', 'Cryocooler, printed p. 3-14 / PDF p. 42']] }],
  'abi-radiator-role': ['ABI radiator role', 'Rejects excess instrument thermal energy to space', 'spec', { refs: [['goes-r-databook', 'Radiator/Loop Heat Pipe Assembly, printed p. 3-13 / PDF p. 41']] }],
  'cryogenic-noise-role': ['Cryogenic cooling', 'Can reduce thermal noise', 'reported', { refs: [['nist-cryocooler-2009', 'PDF p. 2, Table 1, benefits of cryogenic temperatures']] }],
  'tirs2-detectors': ['TIRS-2 detector assemblies', 'Three QWIP arrays; 640 × 512 physical pixels each', 'spec', { refs: [['nasa-tirs2-spectral', 'PDF p. 1, Introduction']] }],
  'tirs2-effective': ['TIRS-2 effective science row', '1,850 cross-track pixels', 'spec', { refs: [['nasa-tirs2-spectral', 'PDF p. 1; two physical rows combined per channel and inter-array overlap']] }],
  'tirs2-swath': ['TIRS-2 swath', '185 km', 'spec', { refs: [['nasa-tirs2-build', 'Instrument design paragraphs']] }],
  'tirs2-gsd': ['TIRS-2 ground sampling', '100 m', 'spec', { refs: [['nasa-tirs2-build', 'Instrument design paragraphs']] }],
  'tirs2-optics': ['TIRS-2 refractive telescope', 'Four elements; f/1.64', 'spec', { refs: [['nasa-tirs2-build', 'Instrument design paragraphs']] }],
  'tirs2-fov': ['TIRS-2 field of view', '15 degrees', 'spec', { refs: [['nasa-tirs2-spectral', 'PDF p. 1, Introduction']] }],
  'tirs2-cold': ['TIRS-2 focal-plane design temperature', '43 K', 'spec', { refs: [['nasa-tirs2-build', 'Two-stage cryocooler paragraph']] }],
  'tirs2-telescope-temp': ['TIRS-2 telescope design temperature', '185 K', 'spec', { refs: [['nasa-tirs2-build', 'Radiators paragraph']] }],
  'tirs-bands': ['TIRS thermal bands', '10.6-11.2 μm; 11.5-12.5 μm', 'spec', { refs: [['landsat9-tirs2-nasa', 'Spectral Bands table, bands 10 and 11']] }],
  'co2-band': ['CO2 molecular emission band', 'Near 4.3 μm', 'reported', { refs: [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7']] }],
  'h2o-band': ['H2O molecular emission band', 'Near 2.7 μm', 'reported', { refs: [['nasa-combustion-bands', 'Printed p. 5 / PDF p. 7']] }],
  'atmospheric-absorption': ['Atmospheric absorption', 'Gases absorb some wavelengths while transmitting others', 'reported', { refs: [['nasa-atmospheric-windows', 'Absorption Bands and Atmospheric Windows, first two paragraphs']] }],
};

const asDrawn = () => ['Drawing', 'Representative / not to scale', 'assumed', { assume: 'look-model' }];
const fact = id => {
  const [label, value, basis, ev] = FACTS[id];
  return [label, value, basis, { refs: ev.refs.map(ref => [...ref]) }];
};
// IF's drill field is a numeric scene index. Root wires these destinations only
// after their scenes are ready: ground=6, ABI=7, TIRS-2=8, atmosphere=9.
const card = (id, title, kicker, body, facts = [], drill) => ({
  id, title, kicker, body, specs: [...facts.map(fact), asDrawn()],
  ...(drill === undefined ? {} : { drill }),
});

export function remainingContent(_model) {
  return {
    satellite: {
      intro: 'A representative spacecraft connects an observing payload to structure, electrical power, communications, and thermal paths. The arrangement is a teaching model.',
      scale: 'Spacecraft · representative proportions',
      light: [
        card('instrument', 'Give the instrument a view', 'The payload opening', 'The opening marks where the representative instrument receives light. The housing, shade, and baffles illustrate component roles. The ABI civil example provides a separately identified published optical design.', [], 7),
        card('structure', 'Support the optical assembly', 'The spacecraft bus', 'The bus provides the structure that carries the payload and supporting equipment. Within the named ABI instrument, an optical bench supports its sensor subsystems. The generic drawing chooses its own clearances and mounting points.', ['abi-support-role']),
        card('links', 'Separate observing from communicating', 'Different paths', 'The payload receives radiation for observation. Antennas and communication terminals carry information. The drawn connections distinguish those functions without assigning a real spacecraft configuration.'),
      ],
      data: [
        card('instrument', 'Read the observation', 'Payload and processor', 'GAO’s public PWSA description names an infrared payload, mission processor, and communications equipment. Those component roles guide this schematic; the representative spacecraft is not a model of PWSA hardware.', ['satellite-components']),
        card('structure', 'Connect the electronics', 'Representative internal paths', 'Internal connections carry electrical signals between equipment. The drawing groups electronics by role, without specifying bus protocols, processing rates, or a real spacecraft wiring layout.'),
        card('links', 'Pass information onward', 'Communications equipment', 'A communications interface connects spacecraft information to another part of the architecture. Follow the ground example for the publicly described operations and mission-data-processing roles.', [], 6),
      ],
      heat: [
        card('instrument', 'Connect the payload to a thermal path', 'Heat at the instrument', 'A payload needs a thermal design as well as an optical design. The drawn links show that relationship. The named TIRS-2 example supplies published temperatures for its own civil instrument.', [], 8),
        card('structure', 'Supply electrical power', 'Arrays and equipment', 'Solar arrays supply electrical energy. Equipment uses that energy and produces heat during operation. The routes here explain those roles without setting an electrical or thermal budget.'),
        card('links', 'Let heat leave the spacecraft', 'Representative radiator', 'A radiator releases thermal energy as radiation. ABI supplies a published civil example: its radiator rejects excess instrument energy to space. The generic surface and outgoing paths assign no area, orientation requirement, or operating temperature.', ['abi-radiator-role']),
      ],
    },
    payload: {
      intro: 'A representative optical cutaway connects the entrance, optical surfaces, and detector region. Published civil instruments provide the detailed examples in the side levels.',
      scale: 'Optical assembly · schematic geometry',
      light: [
        card('optics', 'Guide the incoming light', 'Representative optical surfaces', 'Optical surfaces direct incoming radiation toward an image plane. ABI’s published component table identifies this image-forming role for its telescope. The generic surfaces and rays explain the role without specifying an optical prescription.', ['abi-image-role'], 7),
        card('detector', 'Place the image at the detector', 'The focal-plane region', 'The focal plane is where the optical image meets detector elements. ABI’s published telescope description supplies a named civil example. This generic drawing assigns no military field of view or detector format.', ['abi-image-role'], 3),
        card('thermal', 'Keep the surrounding structure visible', 'Baffles and enclosure', 'The housing and internal baffles belong to the optical assembly as well as its mechanical structure. Their representative placement makes the entrance, interior, and detector region legible.'),
      ],
      data: [
        card('optics', 'Keep light paths distinct from wires', 'Before the readout', 'The illustrated optical path brings radiation to the detector. Electrical information begins with the detector and its readout; a drawn ray is not a data packet.'),
        card('detector', 'Take the signal to the readout', 'At the image plane', 'Detector elements produce electrical responses that readout electronics can measure. ABI’s published component roles provide a named example of this conversion and readout. The generic drawing separates them from later processing and communication.', ['abi-detector-role', 'abi-readout-role']),
        card('thermal', 'Route connections through the assembly', 'Mechanical and electrical interfaces', 'Electrical connections must be supported through the payload structure. Their route is representative; the cutaway does not specify connector types, harness geometry, or processing electronics.'),
      ],
      heat: [
        card('optics', 'Include the telescope in the thermal design', 'Optics have temperature too', 'The optical assembly and the detector can belong to different thermal regions. The named TIRS-2 example publishes separate design temperatures for its telescope and focal plane.', [], 8),
        card('detector', 'Support the cold region', 'Representative cold stage', 'A cooled detector is connected to a cold stage. Supports, electrical leads, and thermal links meet there. Their geometry explains relationships without setting a heat load or temperature.'),
        card('thermal', 'Carry heat toward rejection', 'Cold side and warm side', 'A cooler moves heat from a cold region toward a warmer rejection path while using input power. ABI’s published cooler path connects its focal planes to loop heat pipes and a radiator. The cutaway illustrates those roles without copying its hardware layout.', ['abi-cooler-role'], 7),
      ],
    },
    'focal-plane': {
      intro: 'A representative cooled detector assembly brings together the detector, readout, supports, and cold stage. Detailed material, format, and temperature figures remain attached to named civil instruments.',
      scale: 'Detector assembly · representative proportions',
      light: [
        card('array', 'Put detector elements in the image', 'Representative array', 'The dark detector face marks the region receiving an optical image. Its package and connections are illustrative and do not specify an actual sensor format. TIRS-2 provides a published civil array example.', [], 8),
        card('readout', 'Connect each response to electronics', 'Below the absorbing region', 'An electrical response must reach a readout circuit. ABI’s component table identifies detector conversion and readout as separate roles. The generic layered drawing separates the absorbing region from its measuring electronics.', ['abi-detector-role', 'abi-readout-role']),
        card('cold-stage', 'Place the array on a support', 'The detector mount', 'The detector assembly needs physical support. The plate and mounting features here explain that support while leaving material choices and dimensions representative.'),
      ],
      data: [
        card('array', 'Distinguish physical and read-out layouts', 'A named civil example', 'An instrument’s physical detector layout and the data used to form an image need not be identical. The TIRS-2 side level keeps its published physical arrays and effective science row separately labeled.', [], 8),
        card('readout', 'Measure the electrical response', 'Readout electronics', 'Readout electronics turn a detector response into information that can be processed. ABI supplies a published example of electronics reading its detector arrays. This generic schematic sets no frame rate, bit depth, or output data rate.', ['abi-readout-role']),
        card('cold-stage', 'Carry signals across the interface', 'Representative connections', 'Electrical leads connect the detector region with the surrounding electronics. The drawn flex and contact paths show connectivity, without representing an actual harness or interface standard.'),
      ],
      heat: [
        card('array', 'Reduce thermal noise', 'Cooling the detector', 'NIST identifies low thermal noise as a benefit of cryogenic temperatures. This general reason for cooling sets no material-wide operating temperature. Named civil examples provide instrument-specific values.', ['cryogenic-noise-role'], 8),
        card('readout', 'Account for electronics heat', 'A neighboring thermal role', 'Readout and support electronics also belong in the thermal design. The warm and cold colors distinguish roles in the drawing; they are not a calibrated temperature map.'),
        card('cold-stage', 'Join the detector to the cooler', 'Representative thermal link', 'The cold stage provides a thermal connection to the detector assembly. ABI’s published cooler path gives a named civil example of moving heat toward a radiator. The generic link and supports set no heat lift or input power.', ['abi-cooler-role']),
      ],
    },
    pixel: {
      intro: 'An enlarged conceptual detector element separates the absorbing region, electrical contact, and readout cell. Its layer stack and proportions are representative.',
      scale: 'Detector element · enlarged conceptual view',
      light: [
        card('absorber', 'Let light interact with material', 'The absorbing region', 'Incoming radiation interacts with the detector material. This layer represents that role without assigning a military detector material, thickness, or quantum efficiency.'),
        card('contact', 'Make an electrical connection', 'Representative contact', 'The contact stands for the electrical connection between detector and readout. Its enlarged shape makes the connection visible; it is not a fabrication drawing.'),
        card('readout', 'Place electronics beneath the response', 'The readout cell', 'The readout cell measures the detector’s electrical response. ABI’s detector-array readout supplies a civil example of the role. The generic layer stack is a conceptual arrangement, not ABI pixel construction.', ['abi-readout-role']),
      ],
      data: [
        card('absorber', 'Begin with an electrical response', 'From radiation to signal', 'Absorbed light can produce an electrical response in a semiconductor detector. ABI’s published detector role gives a named civil example. The generic schematic assigns no material, conversion gain, signal size, or ABI pixel construction.', ['abi-detector-role']),
        card('contact', 'Pass the response through a contact', 'Connection, not a network', 'The local electrical contact connects detector and readout. It is a different part of the story from the spacecraft communications link or the ground data path.'),
        card('readout', 'Measure before processing', 'Readout and later stages', 'Measuring a detector response precedes later image processing and communication. ABI’s published array-readout role illustrates this stage. The conceptual cell assigns no ABI construction, timing, digitization precision, or data rate.', ['abi-readout-role']),
      ],
      heat: [
        card('absorber', 'Recognize thermal noise', 'Material and temperature', 'Thermal noise is part of the measurement problem; NIST lists its reduction among the benefits of cryogenic temperatures. The general principle assigns no material or operating conditions to a real military sensor.', ['cryogenic-noise-role']),
        card('contact', 'See the physical bridge', 'Electrical and thermal roles', 'A physical contact also belongs to the thermal structure. Its shape here explains a connection, without specifying electrical resistance or thermal conductance.'),
        card('readout', 'Keep instrument temperatures specific', 'Use a named example', 'The temperature of a detector assembly is an instrument-specific design choice. The TIRS-2 side level provides a published civil focal-plane value; it does not set a generic pixel temperature.', [], 8),
      ],
    },
    plume: {
      intro: 'An illustrative hot-gas plume introduces molecular infrared emission. Band locations come from a civil combustion study; shape, brightness, and any animation are schematic.',
      scale: 'Hot-gas source · illustrative geometry',
      light: [
        card('source', 'Start with emitting gas', 'An illustrative source', 'Hot gases can emit infrared radiation. The colored plume introduces emission as the start of a light path. It has no assigned temperature, radiant intensity, or real vehicle identity.'),
        card('bands', 'Keep the molecular bands named', 'Civil combustion spectroscopy', 'A civil combustion study identifies emission bands associated with carbon dioxide and water. These approximate band locations explain molecular spectroscopy; they do not define a military sensor’s passbands.', ['co2-band', 'h2o-band'], 9),
        card('timeline', 'Read the light paths as symbols', 'Schematic rays', 'The drawn rays connect the emitting region to the rest of the explanation. Their count, direction, brightness, and spacing are visual choices, not simulated photons or a sensor measurement.'),
      ],
      data: [
        card('source', 'Mark an illustrative event', 'The source in the story', 'A source event provides context for an observation. The drawing carries no real launch location, event record, or operational timing.'),
        card('bands', 'Keep wavelength with its label', 'Metadata matters', 'A wavelength label belongs to the stated molecular emission band. Keep that source identity with the value when following the light into the detector explanation.', ['co2-band', 'h2o-band']),
        card('timeline', 'Treat animation time as a teaching aid', 'An illustrative sequence', 'Any animated progression is chosen for explanation. It is not a measured event duration or the time a warning system takes to produce an output.'),
      ],
      heat: [
        card('source', 'Connect heat with radiation', 'Thermal emission', 'Radiation is one way energy leaves a hot emitting region. The plume’s drawn color and glow make that idea visible without acting as a thermometer.'),
        card('bands', 'Separate molecular identity from brightness', 'General spectroscopy', 'A molecular band location and the amount of radiation in that band are different quantities. The cited rows locate the bands; no band intensity is assigned here.', ['co2-band', 'h2o-band']),
        card('timeline', 'Leave the thermal history unspecified', 'A representative shape', 'The changing shape of an illustrative plume does not establish a temperature history, fuel, engine cycle, or real flight event.'),
      ],
    },
    ground: {
      intro: 'A representative ground segment shows receiving, processing, and spacecraft-operations roles. The named FORGE role comes from a public GAO description of the planned system.',
      scale: 'Ground roles · schematic arrangement',
      light: [
        card('receive', 'Separate communication from observation', 'At the receiving interface', 'The ground interface receives information from the space segment. A drawn beam here symbolizes communication; it is not the telescope’s optical view.'),
        card('process', 'Show information on a display', 'Representative work surface', 'A display makes information available to its user. The screen imagery and equipment arrangement are illustrative and do not reproduce an operational console.'),
        card('operations', 'Give the interface a place', 'A schematic operations area', 'The operations area provides a visual setting for the ground role. Its room layout, equipment, and staffing are drawing choices.'),
      ],
      data: [
        card('receive', 'Connect space and ground', 'A communications role', 'The receive marker represents the interface between spacecraft information and ground equipment. The path sets no real network route, communications rate, or latency.'),
        card('process', 'Identify the public processing role', 'FORGE as publicly described', 'GAO’s public description of the planned FORGE system includes processing the mission data collected by satellites. This card names that role without describing software internals or operational algorithms.', ['forge-public-role']),
        card('operations', 'Keep spacecraft operations distinct', 'A separate ground function', 'The same public description gives FORGE a spacecraft-operations role. Operating a spacecraft and processing its observations are distinct responsibilities within the high-level architecture.', ['forge-public-role']),
      ],
      heat: [
        card('receive', 'Power the receiving equipment', 'Generic equipment role', 'Receiving equipment needs electrical power and produces heat during operation. The drawn energy paths are representative and carry no facility power budget.'),
        card('process', 'Remember the electronics heat', 'Processing equipment', 'Electronic processing equipment belongs in a thermal design. The illustration indicates the role of heat removal without depicting an actual equipment room or cooling installation.'),
        card('operations', 'Keep room conditions unspecified', 'Representative environment', 'The room and equipment arrangement provide context. Their appearance supplies no operating temperatures, cooling capacities, or actual site configuration.'),
      ],
    },
    abi: {
      intro: 'GOES-R ABI is a named civil instrument with published optical, spectral, scanning, and cooling specifications. The drawn optical layout and ray paths remain representative.',
      scale: 'GOES-R ABI · representative instrument layout',
      light: [
        card('telescope', 'Follow ABI’s reflective telescope', 'Published component counts', 'The GOES-R Data Book identifies the telescope’s mirrors and focal-plane modules. These counts describe the telescope, not every mirror in the instrument. The illustration preserves those counts while keeping mirror shapes, spacing, and ray paths representative.', ['abi-optics', 'abi-image-role']),
        card('bands', 'Separate the spectral channels', 'The named ABI instrument', 'ABI observes Earth using visible and infrared channels. Its published channel count belongs to ABI, and the display’s band colors are illustrative.', ['abi-bands']),
        card('focal-planes', 'Identify ABI’s infrared detector material', 'Published civil hardware', 'The Data Book identifies the material used for ABI’s infrared channels. That civil-instrument specification stays with ABI; it does not identify any military detector material.', ['abi-detector-material']),
      ],
      data: [
        card('telescope', 'Distinguish the image regions', 'ABI scan products', 'NOAA describes different cadences for ABI’s full-disk and mainland U.S. images. These are image-acquisition descriptions for the named weather instrument, not warning-system timings.', ['abi-full-disk', 'abi-conus']),
        card('bands', 'Keep channel identity with the data', 'ABI spectral information', 'Each ABI channel contributes a different spectral observation. Preserve the channel identity when comparing the instrument’s images and their physical meaning.', ['abi-bands']),
        card('focal-planes', 'Read the smaller-area cadence in context', 'ABI mesoscale images', 'NOAA describes imaging of one or two smaller areas of the hemisphere. The published cadence is tied to that ABI observation mode; it is not a focal-plane readout rate.', ['abi-meso']),
      ],
      heat: [
        card('telescope', 'Keep ABI’s thermal regions distinct', 'VNIR design context', 'The Data Book distinguishes the visible/near-infrared optics and focal-plane region, including a stated GOES-R focal-plane exception. The full qualifier stays with the published temperature row.', ['abi-vnir-temp']),
        card('bands', 'Identify the infrared cold region', 'MWIR and LWIR design context', 'The Data Book gives an approximate temperature for ABI’s MWIR/LWIR optics and focal planes. It is a named civil-instrument design value, not a default for an infrared band.', ['abi-ir-temp']),
        card('focal-planes', 'Name the published cooler design', 'ABI thermal hardware', 'The Data Book describes ABI’s redundant pulse-tube cooler design and the path from its focal planes to the radiator. The drawn cooler and thermal links remain representative.', ['abi-cooling', 'abi-cooler-role', 'abi-radiator-role']),
      ],
    },
    tirs2: {
      intro: 'Landsat 9 TIRS-2 supplies published civil examples of refractive optics, QWIP detector arrays, and separate telescope and focal-plane temperatures. Layout and proportions are representative.',
      scale: 'Landsat 9 TIRS-2 · representative instrument layout',
      light: [
        card('telescope', 'Follow the refractive telescope', 'TIRS-2 optical design', 'NASA describes TIRS-2’s refractive telescope and field of view. The drawing must preserve the published element count while identifying lens shapes, distances, and ray paths as representative.', ['tirs2-optics', 'tirs2-fov']),
        card('arrays', 'Name the TIRS-2 detector assemblies', 'Published QWIP arrays', 'The published TIRS-2 description identifies its QWIP arrays and physical format. A simplified drawn pixel pattern represents that assembly; it need not draw every physical detector.', ['tirs2-detectors']),
        card('cooling', 'Keep the thermal bands instrument-specific', 'NASA’s TIRS-family description', 'NASA lists the thermal spectral bands for the TIRS instrument family. These named civil bands provide context for the cooled focal plane without assigning bands to a military sensor.', ['tirs-bands']),
      ],
      data: [
        card('telescope', 'Attach the image scale to TIRS-2', 'Civil Earth observation', 'NASA publishes TIRS-2’s swath and ground sampling. Those values describe this civil instrument and do not establish a generic telescope’s imaging performance.', ['tirs2-swath', 'tirs2-gsd']),
        card('arrays', 'Separate the physical array from the science row', 'TIRS-2 readout context', 'The detector study explains the combination of physical rows and overlap between arrays. Its effective science row is a separately labeled quantity, not the physical array dimensions.', ['tirs2-effective', 'tirs2-detectors']),
        card('cooling', 'Keep channel labels with the samples', 'Named thermal-band data', 'The band identity belongs with each thermal observation. The cited spectral ranges provide that identity; the drawing assigns no sample rate, bit depth, or communications rate.', ['tirs-bands']),
      ],
      heat: [
        card('telescope', 'Identify the telescope temperature', 'TIRS-2 design value', 'NASA describes a controlled telescope temperature for TIRS-2. It is a separate published design value from the colder focal plane.', ['tirs2-telescope-temp']),
        card('arrays', 'Hold the focal plane at its design temperature', 'TIRS-2 cold stage', 'NASA describes a mechanical cryocooler maintaining the TIRS-2 focal plane at its required operating temperature. This specification belongs to the named civil instrument.', ['tirs2-cold']),
        card('cooling', 'Connect the cold stage to heat rejection', 'TIRS-2 thermal roles', 'NASA’s thermal description connects the cold focal plane, telescope environment, and heat rejection. The drawing shows those roles; the cooler shape and thermal-link layout remain representative.', ['tirs2-cold', 'tirs2-telescope-temp']),
      ],
    },
    atmosphere: {
      intro: 'A schematic air column introduces wavelength-dependent absorption. It is a qualitative molecular-physics view, with no altitude-dependent transmission or sensor-detection model.',
      scale: 'Atmospheric column · qualitative illustration',
      light: [
        card('air', 'Let wavelength matter', 'Qualitative absorption', 'Atmospheric gases absorb some wavelengths while transmitting others. The air column illustrates that qualitative idea; layer spacing and colors do not encode a measured transmission profile.', ['atmospheric-absorption']),
        card('bands', 'Keep emission and transmission distinct', 'A molecular reference', 'The cited carbon-dioxide and water values locate emission bands in a civil combustion study. They are not atmospheric transmission percentages or altitude-dependent visibility results.', ['co2-band', 'h2o-band']),
        card('context', 'Read the path as a schematic', 'No quantitative air column', 'The path through the column connects the source, intervening atmosphere, and instrument. It sets no atmospheric state, weather profile, or operational line of sight.'),
      ],
      data: [
        card('air', 'Record the physical context', 'A useful distinction', 'Interpreting a spectral observation requires keeping its physical context clear. This drawing supplies a qualitative absorption concept, not corrections for a measured observation.', ['atmospheric-absorption']),
        card('bands', 'Carry the band label with the value', 'Named molecular examples', 'Keep the emitting molecule and the approximate wavelength together. Those labels describe the cited examples and do not identify a real warning sensor’s channels.', ['co2-band', 'h2o-band']),
        card('context', 'Separate illustration from measurement', 'The evidence boundary', 'An animated ray or colored atmospheric layer is an explanatory symbol. A measured spectrum or modeled transmission curve would need its own inputs, method, and evidence.'),
      ],
      heat: [
        card('air', 'Include absorption in the energy story', 'Radiation interacting with gas', 'Absorption transfers energy from radiation to material. The cited qualitative atmospheric description explains why wavelength belongs in that energy story.', ['atmospheric-absorption']),
        card('bands', 'Keep color separate from temperature', 'Illustrative band colors', 'The band colors distinguish parts of the explanation. They are neither visible colors of the gases nor a calibrated temperature scale.'),
        card('context', 'Leave the thermal profile unspecified', 'A schematic column', 'This column has no assigned temperature, humidity, or altitude profile. Its purpose is to connect molecular absorption with the light path at a qualitative level.'),
      ],
    },
  };
}
