// Additional assembly cards use the same reviewed civil facts as the component reference.
import { spacecraftFact as fact } from './spacecraft-content.js';
import { catalogFact } from './component-catalog.js';
import { expandLevelDetails } from './level-detail-content.js';
const drawn = ['Drawing','Representative arrangement / not to scale','assumed',{assume:'look-model'}];
const card=(id,title,kicker,body,ids)=>({id,title,kicker,body,specs:[...ids.map(fact),drawn]});
const payload = {
  'scan-system': ['Scan mirrors and drive assembly', ['abi-scanners','abi-timing'],
    ['Steer incoming radiation into the telescope','ABI places independently driven scan mirrors ahead of its telescope. Mirror rotation redirects the line of sight while the telescope and focal-plane assemblies remain mounted to the optical bench. The two exposed axes in this teaching assembly separate the mirror surface, shaft, bearing support, motor and position encoder.'],
    ['Close the mirror-position control loop','The instrument controller coordinates the requested scan with the timing electronics. Motor-driver circuitry supplies the actuators, and encoder circuitry measures mirror position. Position information accompanies the optical sampling process; the moving mirror, its position sensor and its driver are distinct hardware.'],
    ['Support moving optics and remove absorbed heat','The scan assembly combines motorized hardware with an optical entrance. ABI uses surrounding scan shrouds to intercept unwanted solar energy and heat pipes to move that absorbed heat away. Bearings and mounting structure support motion; the shroud supplies a separate thermal path.']],
  mechanisms: ['Port-cover and focus mechanisms',['abi-baffles','abi-peripherals'],
    ['Protect the entrance and adjust optical focus','The optical-port cover protects the instrument before deployment. A separate telescope focus motor adjusts the optical assembly. ABI assigns cover and focus control to its peripheral electronics. The drawing opens the cover on a hinge and separates the focus actuator so their different jobs are visible.'],
    ['Command actuators through peripheral electronics','ABI’s Sensor Unit Electronics release the optical-port and solar-calibration cover launch locks. The optical-port cover then opens on spring-loaded hinges. Peripheral and Thermal Control electronics operate the motor-driven solar-calibration cover and telescope focus mechanism alongside heater functions. The drawn hinge and actuator packaging are representative.'],
    ['Keep mechanisms within their thermal environment','Mechanical interfaces also conduct heat. ABI combines mechanism control and thermal-control functions in its peripheral electronics, while its operational, survival and outgas heaters serve different purposes. No motor duty cycle or mechanism operating temperature is assigned to this drawing.']],
  calibration: ['Calibration targets and reference views',['abi-peripherals','abi-scanners'],
    ['Observe known references as well as Earth','ABI uses an internal infrared calibration target, a solar calibration target for reflected-solar channels, and a view of space. These are distinct reference observations. The drawn cavity and diffuser represent the named civil instrument’s two target types; space is a viewing direction, not another object inside the payload.'],
    ['Associate samples with the reference observation','Calibration needs both the selected reference and a record of the instrument state. The controller commands the observation, scan encoders describe the mirror position, and peripheral electronics support the target. Calibration processing can then distinguish reference samples from Earth-view samples.'],
    ['Measure and control the thermal reference','The infrared target provides a controlled thermal reference. ABI’s peripheral electronics include target and thermal-control functions. A solar diffuser has a different role: it redirects sunlight for the reflected-solar channels and is not a blackbody source for the thermal-infrared detector.']],
  'aft-optics': ['Beamsplitters, filters and cold stops',['abi-cold-optics','abi-roic'],
    ['Divide the image into spectral channels','After the telescope, ABI’s beamsplitters divide the radiation among spectral regions. Channel filters define which wavelengths reach each array, while windows and cold stops complete the optical interfaces. The exploded deck separates these stationary elements; it does not depict a filter wheel.'],
    ['Preserve channel identity at the readout','A spectral channel is a physical optical selection paired with its detector and readout. In ABI, filters and focal-plane arrays are grouped into modules. The electronics must preserve that channel identity when detector outputs are digitized and organized into data.'],
    ['Bound the detector’s optical environment','Cold stops and cooled aft optics help define the radiation environment seen by the detector. They are distinct from the active refrigeration that removes heat. The illustrated stop, filter mounts and window occupy separate supports so the optical and thermal responsibilities remain visible.']],
  'data-interface': ['Data processor and spacecraft interface',['abi-packets','abi-timing'],
    ['Carry observations beyond the optical assembly','Once the focal-plane signal has been digitized, its route continues through electronics. ABI’s Data Processor prepares the samples for transmission and its High Speed I/O card connects with the spacecraft using SpaceWire. These are downstream of the detector and video electronics.'],
    ['Format data and cross the spacecraft interface','ABI’s Data Processor, High Speed I/O and timing cards share its Electronics Unit chassis. The Data Processor organizes samples into packets, HSIO communicates with the spacecraft and the timing card supplies clocks and telemetry services. They are coordinated cards within one electrical assembly, with distinct functional responsibilities.'],
    ['Conduct electronics heat through the chassis','The interface and processing cards consume electrical power and belong to the instrument’s warm Electronics Unit. GOES-R mounts that unit on thermally controlled equipment panels. Card supports, chassis and panel interfaces form a heat path separate from the cold detector assembly.']],
  power: ['Instrument power supply and distribution',['abi-power','power-distribution'],
    ['Supply the instrument’s electrical assemblies','The telescope does not supply its own operating power. ABI’s Electronics Unit converts spacecraft input power into instrument supplies. The resulting feeds support controllers, readout electronics and mechanism-related circuitry; the cryocooler also has its own control electronics.'],
    ['Separate supply conversion from command handling','A power-supply card converts electrical input, while command and timing cards coordinate instrument operation. These functions share ABI’s Electronics Unit chassis and parent board. The cutaway exposes the supply card inside that common enclosure so the power path can be followed alongside the internal data and control connections.'],
    ['Carry conversion heat to the mounting panel','Electrical conversion is part of the instrument’s heat load. The Electronics Unit rejects heat through its spacecraft equipment-panel interface. The cold head is served by the cooler and its dedicated thermal transport, so instrument electronics and detector cooling are represented as separate branches.']],
};
const focal={
  'bias-timing':['Detector bias and timing electronics',['abi-video','abi-roic'],
    ['Establish the detector’s electrical operating conditions','A focal-plane module needs electrical bias and a readout sequence in addition to incoming light. ABI’s video processors supply the timing and bias that operate its arrays. The separate board strip in this cutaway represents those functions without assigning voltages, clock rates or a particular circuit design.'],
    ['Clock the array and collect its output','The readout integrated circuit is associated with the detector array. Warm video electronics supply the bias and timing, collect the output and prepare it for later processing. Keeping those electronics separate from the cold ROIC prevents the drawing from collapsing several distinct stages into one board.'],
    ['Keep warm drive electronics separate from the cold package','The detector’s electrical interfaces cross a thermal boundary. The teaching interconnect connects the cold package to a separately mounted warm board. It shows the need for both electrical continuity and controlled heat flow; its conductor layout and thermal conductance are unspecified.']],
  'thermal-feedback':['Cold-head thermometer and cooler controller',['abi-cce','abi-cooler'],
    ['Measure the cold-head condition','ABI uses a platinum resistance thermometer at the cooler cold head. The sensor is an electrical temperature measurement device; it is separate from the imaging detector. The cutaway distinguishes this small sensor from the cold finger that transports heat.'],
    ['Adjust the cooler from temperature feedback','The measured cold-head temperature feeds ABI’s Cryocooler Control Electronics. The controller adjusts the power-amplifier duty cycle to regulate temperature. The feedback path runs from thermometer to electronics to cooler drive, alongside the outward instrument-data path.'],
    ['Regulate heat removal through the cooler','The cold finger accepts heat from the detector region, while the cooler’s warm side rejects both the extracted heat and the energy needed to drive refrigeration. Feedback governs the cooler drive; loop heat pipes and the radiator carry away the rejected heat.']],
};

export function expandContent(levels) {
  for(const [scene, additions] of [['payload',payload],['focal-plane',focal]]) {
    ['light','data','heat'].forEach((mode,index)=>{
      for(const [id,[title,ids,...views]] of Object.entries(additions)) {
        const [role,body]=views[index];
        const extra = id==='scan-system'&&mode==='heat'?['abi-shroud']:id==='data-interface'||id==='power'?['equipment-thermal']:id==='mechanisms'&&mode==='heat'?['abi-heaters']:[];
        const item=card(id,title,role,body,[...ids,...extra]);
        if(id==='calibration') item.specs.unshift(...['comp-abi-ict','comp-abi-sct','comp-abi-space-reference'].map(catalogFact));
        if(id==='mechanisms') item.specs.unshift(...['comp-abi-opc-lock','comp-abi-opc-hinges','comp-abi-scc'].map(catalogFact));
        levels[scene][mode].push(item);
      }
    });
  }
  levels.payload.intro='Start with a complete instrument: sensor assembly, instrument electronics chassis and separate cooler controls. Open the enclosures to follow their boards and functions. ABI supplies the named civil packaging example; the drawing is representative. Component stops identify details and connections within that instrument, not an independent box for every function or company.';
  return expandLevelDetails(levels);
}
