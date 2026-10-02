// Meaningful component stops for the civil instruments and the smaller context levels.
// Each stop retains one physical identity across the three views.
import { catalogFact } from './component-catalog.js';
import { COMPONENT_NAMES } from './component-names.js';
const modes=['light','data','heat'];
const drawn=['Drawing','Representative arrangement / not to scale','assumed',{assume:'look-model'}];
const detail=(id,title,keys,views)=>({id,title,keys,views});
const additions={
  abi:[
    detail('scan-system','ABI scan mirrors and drives',['comp-abi-scan-mirrors','abi-scanners'],[
      ['Redirect the scene into the telescope','The north–south and east–west scan mirrors are separate moving optics upstream of the telescope. Their drawn supports distinguish mirror surfaces, bearings, motors and position feedback.'],
      ['Measure position while commanding motion','Motor-driver and encoder-processor electronics close the mirror-position path. Their information is separate from the image samples carried by the video electronics.'],
      ['Separate moving optics from thermal shielding','The scan structure supports motion; surrounding shrouds intercept unwanted energy. The cooler and radiator handle other thermal paths, so the moving assembly is not represented as a refrigerator.'],
    ]),
    detail('calibration','ABI calibration targets',['comp-abi-ict','comp-abi-sct','comp-abi-space-reference'],[
      ['Observe infrared and solar references','ABI has an internal infrared target and a solar calibration target. A space view is another reference direction, not a third installed target.'],
      ['Identify reference samples','The selected target, mirror position and instrument state establish the context of a reference observation. The diagram keeps reference observations separate from Earth-view observations.'],
      ['Distinguish the thermal target from the diffuser','The infrared reference has a thermal role; the solar target redirects incident sunlight. The two target types should not be treated as interchangeable blackbodies.'],
    ]),
    detail('readout','ABI Sensor Unit Electronics',['abi-video','abi-digitize','abi-roic'],[
      ['Connect the detectors to warm electronics','The focal-plane module converts the optical image to an electrical signal. Sensor Unit Electronics then operate and read the detector interface.'],
      ['Supply bias and timing, then collect samples','ABI video processors provide detector timing and bias and collect the outputs. Sensor Unit Electronics digitize the focal-plane data before the Electronics Unit prepares transmission packets.'],
      ['Keep the cold package and warm cards distinct','The detector-side readout and warm electronics occupy different thermal roles. Their connection carries electrical signals across the boundary; no interface conductance or wiring design is inferred.'],
    ]),
    detail('controller','ABI controller and data-interface cards',['abi-controller','abi-timing','abi-packets'],[
      ['Coordinate an observation','The Instrument Controller operates ABI. Its cards are physically distinct from the telescope and the detector that first receive the scene.'],
      ['Format samples and hand them to the spacecraft','The Data Processor formats and packetizes measurements. High Speed I/O supplies the SpaceWire interface, while Telemetry and Timing generates system clocks and supports instrument telemetry.'],
      ['Carry electronics heat through the mounting interface','The warm Electronics Unit has a spacecraft-panel thermal interface. This path is separate from refrigeration at the focal plane.'],
    ]),
    detail('thermal','ABI cryocooler and heat transport',['abi-cooler','abi-cce','abi-shroud'],[
      ['Keep the infrared assembly in its thermal environment','The cooler serves the cold focal-plane region. Shields and shrouds limit unwanted radiation before that energy becomes another load to remove.'],
      ['Use temperature feedback to control refrigeration','A cold-head thermometer supplies feedback to Cryocooler Control Electronics. Cooler control is a separate circuit from the instrument image-data interface.'],
      ['Trace heat from cold hardware to space','The cooler removes heat from the cold assembly. Warm-side rejection and heat-transport hardware carry energy toward the radiator. The geometry illustrates a path without assigning cooler performance.'],
    ]),
    detail('power','ABI instrument power supply',['abi-power','comp-abi-parent-board','comp-abi-sue-redundancy'],[
      ['Provide energy to the instrument assemblies','The EU Power Supply converts spacecraft input into instrument electrical supplies. It supports the electronics responsible for observing, reading and controlling the instrument.'],
      ['Keep power conversion separate from command routing','The supply card and parent board support the instrument electronics, but do not replace the controller or data interface. Published redundant card sets remain specific to ABI.'],
      ['Account for the warm electrical path','Power conversion and the operating cards contribute to the instrument thermal load. Their warm mounting interface remains distinct from the cooled detector region.'],
    ]),
  ],
  tirs2:[
    detail('scene-select','TIRS-2 scene-select mechanism',['tirs-scene-select','tirs-motion'],[
      ['Select Earth, blackbody or space','The mirror changes which scene reaches the telescope. The onboard blackbody is hardware; the space reference is a viewing direction.'],
      ['Command motion and measure position','The mechanism includes motor, bearings, position encoders and control electronics. Commanded motion and measured position are separate responsibilities.'],
      ['Support the mechanism within the instrument','Bearings and mounts support the moving mirror. The drawing specifies neither bearing construction nor motor duty cycle.'],
    ]),
    detail('blackbody','TIRS-2 onboard blackbody',['tirs-scene-select','tirs-thermal'],[
      ['Provide an onboard thermal reference','The scene-select mirror can direct the telescope toward an internal blackbody reference instead of Earth. The target is distinct from the telescope lenses.'],
      ['Associate samples with a reference view','Reference observations need the scene identity to accompany their samples. This illustration identifies the reference route without reproducing calibration algorithms.'],
      ['Connect the reference to thermal control','The thermal target belongs to the instrument thermal design. Its drawn shape assigns no emissivity, operating temperature or calibration accuracy.'],
    ]),
    detail('readout','TIRS-2 focal-plane electronics',['tirs-fpe','tirs-redundancy'],[
      ['Connect the detector package to instrument electronics','The Focal Plane Electronics form the detector-side electrical interface. They are distinct from the detector material and from the main electronics chassis.'],
      ['Pass measurements through the interface board','The Focal-plane Interface Board connects selected FPE and main-electronics paths. NASA’s civil design uses selected cross-connections rather than every possible redundant connection.'],
      ['Keep the readout interfaces physically identifiable','Electrical continuity and thermal mounting are different design responsibilities. The exposed boards clarify the connection without prescribing package or harness details.'],
    ]),
    detail('electronics','TIRS-2 Main Electronics Box',['tirs-meb','tirs-redundancy'],[
      ['House the instrument-control electronics','The Main Electronics Box contains several functional boards. It operates downstream of the telescope and focal plane rather than acting as another optical stage.'],
      ['Separate command, mechanism and science-data interfaces','NASA’s block diagram distinguishes command/data handling, power, temperature control, mechanism control and high-speed interfaces. Each has a different responsibility within the electronics box.'],
      ['Connect thermal control with instrument operation','Temperature-control boards command thermal functions. The controlled heaters and the electronics that drive them are distinct items.'],
    ]),
    detail('radiator','TIRS-2 radiators and Earth shield',['tirs-thermal','tirs-restraint'],[
      ['Separate thermal shielding from the observing path','The Earth shield manages the instrument environment. It is not another imaging mirror or an installed calibration target.'],
      ['Distinguish deployment from continuous control','The Earth-shield deployment interface and cryocooler launch lock serve configuration changes. Thermal measurements and heater commands serve continuing operation.'],
      ['Carry and reject heat outside the cold assembly','The published civil design includes radiators, heat pipes, isolation, blankets and heaters. These complement the cryocooler rather than duplicating its refrigeration cycle.'],
    ]),
    detail('filters','TIRS-2 interference filters',['gap-tirs2-interference-filters','tirs-baffles'],[
      ['Select spectral channels above the arrays','Fixed interference filters select TIRS-2’s thermal channels. The filter tiles are separate from the telescope lenses and detector surfaces.'],
      ['Preserve the channel identity','The filter selects the optical channel before the electronic signal is read. No bit depth, sample rate or additional channel is implied by the drawing.'],
      ['Place spectral selection in the detector environment','The filter and detector assembly belong to the instrument’s thermal design. The illustrated mount does not specify its material, coating stack or heat conductance.'],
    ]),
  ],
  ground:[
    detail('receiver','Receiver and demodulation equipment',['gap-ground-receiver'],[
      ['Receive the communication signal','This is radio reception after the spacecraft has made an observation. It is separate from infrared detection at the payload.'],
      ['Recover the data carried by the signal','RF front ends and receiver processing turn received waveforms into data for the ground system. The illustration assigns no actual network route or receiver configuration.'],
      ['Support the receiver electronics','The drawn equipment rack represents electrical hardware with a power and cooling interface. Its construction and thermal capacity are illustrative.'],
    ]),
    detail('archive','Telemetry and science-data archive',['gap-ground-archive'],[
      ['Give recorded observations a storage destination','The cabinet marks a storage role rather than another sensor. It is a representative physical display of a function that may be distributed.'],
      ['Preserve records for later interpretation','An archive stores mission telemetry and science records for retrieval and analysis. It is distinct from the receiver and the processing stage.'],
      ['Include storage in facility support','Storage equipment depends on electrical and environmental support. The model makes no claim about capacity, cooling method or availability.'],
    ]),
    detail('power','Uninterruptible power supply',['gap-ground-ups'],[
      ['Support the ground equipment','The supply cabinet illustrates supporting infrastructure beneath the visible antenna, workstations and data racks. It is not a spacecraft component.'],
      ['Maintain electrical continuity','A UPS provides a backup-power function. The schematic does not describe a real facility’s redundancy or operating procedure.'],
      ['Keep the facility energy budget explicit','Backup power and heat removal are different responsibilities. The drawn cabinet has no specified energy storage, load rating or runtime.'],
    ]),
  ],
  pixel:[
    detail('bump','Indium interconnect',['gap-pixel-bump'],[
      ['Join the detector to its readout','Webb is a public example of a hybrid detector joined to silicon readout by indium. This enlarged joint is conceptual.'],
      ['Carry the local electrical response','The interconnect bridges detector and readout. It is not the separate output route from the readout to warm electronics.'],
      ['Show the material interface','The joint also sits within a mechanical and thermal assembly. Its dimensions and conductance remain unspecified.'],
    ]),
    detail('support','Detector support and circuit-board interface',['gap-pixel-support'],[
      ['Hold the detector and readout assembly','NASA Goddard describes packaging detectors and their readout onto fixtures and circuit boards. The support drawn here is representative.'],
      ['Carry the package interfaces','The package connects the detector assembly with surrounding instrument electronics. It is separate from the absorber and each pixel’s local readout.'],
      ['Connect the assembly to its mounting environment','The mounting support is part of the thermal path. This drawing specifies no material, interface conductance or operating temperature.'],
    ]),
    detail('output','Readout output circuitry',['gap-pixel-output'],[
      ['Continue beyond a single pixel','The absorber and interconnect feed the readout; its output continues toward the wider instrument. The exposed trace is symbolic.'],
      ['Route pixel measurements outward','Webb’s ROIC architecture connects many pixels to fewer outputs. This example explains the output role without assigning a generic array size or rate.'],
      ['Place the output in the electronics assembly','The output belongs to the readout and package thermal environment. It is not another refrigerator or a separate detector.'],
    ]),
  ],
};

export function expandLevelDetails(levels) {
  for(const [scene,items] of Object.entries(additions)) for(const [i,mode] of modes.entries()) {
    for(const {id,title,keys,views} of items) {
      const [kicker,body]=views[i];
      levels[scene][mode].push({id,title,kicker,body,specs:[...keys.map(catalogFact),structuredClone(drawn)]});
    }
  }
  for(const scene of ['plume','atmosphere']) for(const mode of modes) {
    const rows=levels[scene].light.find(p=>p.id==='bands').specs;
    for(const [id,molecule,needle] of [['co2','Carbon dioxide','CO2'],['h2o','Water vapor','H2O']]) {
      const facts=rows.filter(row=>row[0].includes(needle));
      const context=scene==='plume'?'the named civil combustion example':'the qualitative atmospheric view';
      const descriptions={
        light:[scene==='plume'?'Identify an emitting molecule':'Identify a gas in the optical path',scene==='plume'?`${molecule} supplies one of the molecular-emission examples in the cited civil study. The molecular marker locates that identity within the schematic plume; it does not assign abundance or brightness.`:`${molecule} is identified separately in the schematic gas column. The band row is a molecular-emission reference; it does not supply atmospheric transmission or a visibility calculation.`],
        data:['Keep molecule and wavelength together',`The species label and cited band reference remain paired in ${context}. They do not identify the channels of an operational warning instrument.`],
        heat:['Distinguish a band location from its strength',`A molecular band identifies a wavelength region, not a gas temperature or radiant intensity. The colored ${scene==='plume'?'emission marker':'gas marker'} is an explanatory choice.`],
      };
      const [kicker,body]=descriptions[mode];
      levels[scene][mode].push({id,title:`${molecule} molecules`,kicker,body,specs:[...structuredClone(facts),structuredClone(drawn)]});
    }
  }
  levels.abi.intro='Explore ABI as separate optical, scanning, calibration, detector, readout, controller, power and thermal assemblies. Each stop retains its named civil evidence; dimensions and placement remain representative.';
  levels.tirs2.intro='Explore TIRS-2’s telescope, scene selection, blackbody, fixed filters, detector package, focal-plane electronics, main electronics, cooler and heat rejection. Ground-established alignment shims are distinct from moving mechanisms.';
  levels.ground.intro='Trace a representative ground path from antenna and receiver to processing, archive and spacecraft operations, with separate electrical support. Civil NASA ground-system examples provide the detail; public FORGE statements establish only its high-level roles.';
  levels.pixel.intro='An enlarged conceptual hybrid separates absorber, contact, indium connection, readout cell, mounting support and output. Webb and NASA Goddard supply explicitly named public examples; the drawing is not a fabrication stack for ABI, TIRS-2 or a military sensor.';
  // The original three-stop civil tours mixed several assemblies in each card.
  // Keep their reviewed figures, but attach them to the now-selectable assembly.
  const part=(scene,mode,id)=>levels[scene][mode].find(item=>item.id===id);
  const addRows=(target,rows)=>{
    const labels=new Set(target.specs.map(row=>row[0]));
    for(const row of rows) if(!labels.has(row[0])) { target.specs.push(structuredClone(row)); labels.add(row[0]); }
  };
  const abiTelescopeData=part('abi','data','telescope');
  const controllerLabels=new Set(['abi-controller','abi-timing'].map(key=>catalogFact(key)[0]));
  addRows(part('abi','data','controller'),abiTelescopeData.specs.filter(row=>controllerLabels.has(row[0])));
  addRows(part('abi','data','scan-system'),abiTelescopeData.specs.filter(row=>!controllerLabels.has(row[0])));
  abiTelescopeData.kicker='Form the image that the detectors measure';
  abiTelescopeData.title=COMPONENT_NAMES.abi.telescope;
  abiTelescopeData.body='The telescope forms a scene image on the focal-plane modules. Its mirrors and optical bench establish the optical path upstream of detection; the scan drives, clock generation and packet formatting have their own assembly stops.';
  abiTelescopeData.specs=structuredClone(part('abi','light','telescope').specs);
  const abiBandsData=part('abi','data','bands');
  abiBandsData.kicker='Separate spectral paths before detection';
  abiBandsData.title=COMPONENT_NAMES.abi.bands;
  abiBandsData.body='The aft optics use beamsplitters to divide broad spectral regions. Filters above the detector arrays select individual channels, preserving channel identity before the readout collects electrical samples.';
  abiBandsData.specs=[...['comp-abi-bs1','comp-abi-bs2','comp-abi-channel-filters'].map(catalogFact),structuredClone(drawn)];
  const abiFocalHeat=part('abi','heat','focal-planes');
  addRows(part('abi','heat','thermal'),abiFocalHeat.specs);
  abiFocalHeat.kicker='Maintain the detector modules within their thermal regions';
  abiFocalHeat.title=COMPONENT_NAMES.abi['focal-planes'];
  abiFocalHeat.body='The focal-plane modules sit in the instrument’s separately described visible/near-infrared and infrared thermal regions. The complete GOES-R qualifier accompanies the published temperature rows. Cooling links connect the detector assembly with separately identified refrigeration and heat-rejection hardware.';
  abiFocalHeat.specs=structuredClone([...part('abi','heat','telescope').specs,...part('abi','heat','bands').specs.filter(row=>row[0]!=='Drawing')]);
  for(const mode of modes) {
    const cooler=part('tirs2',mode,'cooling');
    cooler.title=COMPONENT_NAMES.tirs2.cooling;
    if(mode!=='heat') addRows(part('tirs2',mode,'filters'),cooler.specs);
    cooler.kicker={light:'Provide refrigeration for the detector assembly',data:'Operate the cooler through control and switching electronics',heat:'Move heat from the cold assembly toward rejection'}[mode];
    cooler.body={light:'The cryocooler thermomechanical unit provides refrigeration to the detector assembly. It is physically distinct from the fixed filters that select the thermal channels.',data:'Cryocooler Control Electronics operate the thermomechanical unit through the Redundancy Switch Electronics. These interfaces support the cooler rather than carrying the instrument’s science-image samples.',heat:'The cooler removes heat from the cold assembly; the external thermal hardware transports and rejects that heat. The cold-stage temperature belongs to the named civil design, while the drawn cooler and heat links remain representative.'}[mode];
    cooler.specs=[catalogFact('tirs-cooler'),structuredClone(drawn)];
    if(mode==='heat') addRows(cooler,part('tirs2','heat','arrays').specs);
  }
  // Existing cards keep their numeric evidence while no longer swallowing the new assemblies.
  for(const mode of modes) {
    const computer=levels.satellite[mode].find(p=>p.id==='computer');
    computer.specs.push(...['gap-safing','gap-fault-containment','gap-radiation-assurance'].map(catalogFact));
    if(mode==='data') computer.body+=' Fault protection coordinates recovery across the power, attitude, thermal and communications systems. A safe state is an operating condition, not another hardware box. Radiation assurance evaluates the mission environment and electronics rather than assigning a universal radiation-proof label.';
    const contact=levels.pixel[mode].find(p=>p.id==='contact');
    contact.title=COMPONENT_NAMES.pixel.contact;
    contact.kicker={light:'Provide the detector-side electrical interface',data:'Pass the response to the interconnect',heat:'Include the pad in the package structure'}[mode];
    contact.body={light:'The contact pad is the metallized electrical interface on the detector side. It is distinct from the indium joint that bridges to the readout in the illustrated hybrid.',data:'The path proceeds from detector contact to interconnect to readout. The separate output circuitry then carries the readout signal toward the instrument interface.',heat:'The enlarged pad belongs to the package structure. Its metal, dimensions and thermal conductance are unspecified; this is a conceptual cross-section.'}[mode];
  }
  return levels;
}
