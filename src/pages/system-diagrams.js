// Responsive, prerenderable system diagrams. Component identities and evidence
// come from the same catalog as the explorer; no independent fact registry.
import { COMPONENT_CATALOG } from '../component-catalog.js';
import { chip } from '../evidence.js';
import { INSTRUMENT_ASSEMBLIES, INSTRUMENT_INTERFACES } from '../instrument-integration.js';

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ref = (scene, part, id) => ({scene, part, id});
const bus = (part,id) => ref('satellite',part,id);
const abi = (part,id) => ref('payload',part,id);
const tirs = (part,id) => ref('tirs2',part,id);
const node = (...refs) => ({refs});
const named = (title, role, ...refs) => ({title,role,refs});
const wire = (type,label,both=false) => ({type,label,both});
const flow = (id,title,nodes,wires,note='') => ({id,title,nodes,wires,note});

export const SYSTEM_DIAGRAMS = [
  {
    id:'spacecraft-support',eyebrow:'Spacecraft support systems',title:'GOES-R: the bus supports the instrument',
    intro:'Power, attitude control and thermal transport connect different assemblies. These selected GOES-R connections keep the spacecraft functions separate from the instrument’s internal electronics.',
    flows:[
      flow('array-power','From the solar wing to protected feeds',[
        named('Solar cells, strings and circuits','Convert and collect solar power',bus('solar-array','photovoltaic-cell'),bus('solar-array','comp-bus-array-circuits')),
        node(bus('array-drive','comp-bus-slip-ring')),
        node(bus('power','comp-bus-pru')),
        node(bus('power','comp-bus-pdm'),bus('power','comp-bus-fba')),
      ],[wire('power','Array power'),wire('power','Wing interface'),wire('power','Regulated supply')]),
      flow('battery-power','Stored energy and bidirectional conversion',[
        node(bus('battery','comp-bus-battery-banks')),
        node(bus('power','comp-bus-bcd')),
        node(bus('power','comp-bus-pru')),
      ],[wire('power','Charge / discharge',true),wire('power','Battery / bus',true)]),
      flow('attitude-control','Measurements become actuator commands',[
        node(bus('attitude','comp-bus-star-trackers'),bus('attitude','comp-bus-imu')),
        node(bus('computer','comp-bus-obc')),
        node(bus('computer','comp-bus-riu-siu')),
        node(bus('wheels','comp-bus-rwa')),
      ],[wire('data','Measurements'),wire('data','Commands'),wire('data','Actuator interface')],
      'The star trackers and IMUs measure the spacecraft state. Reaction wheels supply the attitude-control actuation.'),
      flow('bus-heat','A deliberate path from mounted equipment to space',[
        node(bus('radiator','comp-bus-wet-mounts')),
        node(bus('structure','comp-bus-equipment-panels')),
        node(bus('radiator','comp-bus-osr')),
      ],[wire('heat','Conducted heat'),wire('heat','Spread / emit heat')],
      'MLI and low-conductivity supports limit unwanted exchange. Conductive mounts and radiator hardware provide selected paths for heat to leave.'),
    ],
  },
  {
    id:'abi-instrument',eyebrow:'Civil instrument architecture',title:'ABI: optics, mechanisms and electronics',
    intro:'ABI is one instrument delivered through several coordinated physical units. The Sensor Unit includes optics, mechanisms and its own electronics; the Electronics Unit is a common chassis of cards; cooler controls mount separately. These civil groupings organize the representative cutaway.',
    flows:[
      flow('abi-optical','Scene radiation reaches a filtered focal-plane module',[
        node(abi('scan-system','comp-abi-scan-mirrors')),
        node(abi('optics','comp-abi-telescope')),
        node(abi('aft-optics','comp-abi-bs1'),abi('aft-optics','comp-abi-bs2')),
        node(abi('aft-optics','comp-abi-channel-filters'),abi('aft-optics','comp-abi-windows-stops')),
        node(abi('detector','comp-abi-fpm')),
      ],[wire('light','Steered view'),wire('light','Formed image'),wire('light','Spectral branches'),wire('light','Selected channels')],
      'The beamsplitters create branches rather than a single serial band. A fold mirror redirects the VNIR branch; the channel filters are stationary.'),
      flow('abi-calibration','Calibration supplies reference views',[
        node(abi('calibration','comp-abi-ict'),abi('calibration','comp-abi-sct'),abi('calibration','comp-abi-space-reference')),
        node(abi('scan-system','comp-abi-scan-mirrors')),
        node(abi('optics','comp-abi-telescope')),
      ],[wire('light','Reference view'),wire('light','Optical path')],
      'ICT is an onboard infrared blackbody. SCT is ABI’s solar diffuser. The space reference is a viewing direction, with no extra target installed on the bench.'),
      flow('abi-science','Detector readout and the digital output',[
        node(abi('detector','comp-abi-fpa'),abi('detector','comp-abi-roic')),
        node(abi('readout','comp-abi-vp-samples'),abi('digitizer','comp-abi-digitization')),
        node(abi('data-interface','comp-abi-data-processor')),
        node(abi('data-interface','comp-abi-hsio')),
      ],[wire('data','Detector samples'),wire('data','Formatted samples'),wire('data','Packets to interface')],
      'Sample collection and digitization are functions of the Sensor Unit Electronics. The Data Processor and HSIO belong to the Electronics Unit; HSIO provides the spacecraft SpaceWire interface.'),
      flow('abi-scan-control','Mirror drive and measured position',[
        node(abi('scan-system','comp-abi-simd')),
        node(abi('scan-system','comp-abi-scan-drive')),
        node(abi('scan-system','comp-abi-scan-mirrors')),
      ],[wire('power','Motor drive'),wire('mechanical','Mirror motion')],
      'The Support Bearing Assembly carries the opposite side of the mirror. The motor supplies motion; the encoder reports position.'),
      flow('abi-encoder','The scan-position feedback path',[
        node(abi('scan-system','comp-abi-scan-encoder')),
        node(abi('scan-system','comp-abi-encoder-processors')),
      ],[wire('data','Position measurement')]),
      flow('abi-peripherals','Separate control of focus, covers and thermal hardware',[
        node(abi('data-interface','comp-abi-tnt')),
        node(abi('controller','comp-abi-ptc')),
        node(abi('mechanisms','comp-abi-focus-motor'),abi('mechanisms','comp-abi-opc'),abi('mechanisms','comp-abi-scc')),
      ],[wire('data','Serial command / telemetry',true),wire('power','Mechanism control')],
      'P&TC belongs to the Sensor Unit Electronics and excludes the scanner. OPC deploys once using its release and spring-hinge hardware; the solar-calibration cover is motor driven.'),
      flow('abi-heat','Heat travels from the cold region to the radiator',[
        node(abi('detector','comp-abi-fpm')),
        node(abi('thermal','comp-abi-pulse-tube')),
        node(abi('thermal','comp-abi-lhp')),
        node(abi('thermal','comp-abi-radiator')),
      ],[wire('heat','Focal-plane heat'),wire('heat','Pumped heat'),wire('heat','Transport to radiator')]),
      flow('abi-cooler-feedback','Electrical feedback controls active refrigeration',[
        node(abi('thermal','comp-abi-prt')),
        node(abi('thermal','comp-abi-cce')),
        node(abi('thermal','comp-abi-power-amplifiers')),
        node(abi('thermal','comp-abi-tdu')),
      ],[wire('data','Cold-head temperature'),wire('data','Duty-cycle control'),wire('power','Cooler drive')],
      'The thermometer, controller and power amplifier form the feedback path. Heat transport is shown in the separate row above.'),
    ],
  },
  {
    id:'tirs2-interfaces',eyebrow:'NASA TIRS-2 design architecture',title:'TIRS-2: electrical interfaces and thermal hardware',
    intro:'The 2018 TIRS-2 design groups command/data, power, thermal, mechanism and high-speed-interface boards inside Main Electronics Boxes. Detector-side electronics and cooler electronics are separately identified. This is another coherent instrument architecture, with its own names and selected redundant connections.',
    flows:[
      flow('tirs-science','Focal-plane electronics connect through an interface board',[
        node(tirs('readout','fpe')),
        node(tirs('readout','fib')),
        node(tirs('electronics','meb')),
      ],[wire('data','Detector-side interface'),wire('data','Selected cross-connections')],
      'MEB-A/B contain distinct command/data, power, temperature-control, mechanism-control and high-speed-interface functions.'),
      flow('tirs-scene-control','The scene-select mechanism has its own electrical control',[
        node(tirs('electronics','mce')),
        node(tirs('scene-select','scene-drive')),
        node(tirs('scene-select','scene-mirror')),
      ],[wire('power','Motor drive'),wire('mechanical','Mirror selection')],
      'The mirror selects Earth, the onboard blackbody or a space view. Its selection role differs from ABI’s two-axis scan system.'),
      flow('tirs-position','The encoders return measured position',[
        node(tirs('scene-select','scene-drive')),
        node(tirs('electronics','mce')),
      ],[wire('data','Encoder telemetry')]),
      flow('tirs-cooler-power','Cooler switching is an electrical path',[
        node(tirs('cooling','cce')),
        node(tirs('cooling','rse')),
        node(tirs('cooling','tmu')),
      ],[wire('power','Cooler-control connection'),wire('power','Selected cooler drive')],
      'RSE selects the connection between the paired cooler-control electronics and the thermomechanical unit. It is an electronics interface, not a heat pipe.'),
      flow('tirs-heat','Thermal transport and emission have different hardware',[
        named('Heat pipes','Transport heat',tirs('radiator','thermal')),
        named('Radiators','Release thermal energy',tirs('radiator','thermal')),
      ],[wire('heat','Transported heat')],
      'The Earth shield, blankets and isolation also manage external and conducted heat. This row shows thermal roles rather than reconstructing the cooler’s complete thermal network.'),
      flow('tirs-heaters','Heater circuits add controlled heat',[
        named('Temperature-control boards','Electrical thermal-control functions within the MEB',tirs('electronics','meb')),
        named('Operational heater circuits','Support operational thermal control',tirs('radiator','heaters')),
      ],[wire('power','Heater supply')],
      'NASA separately identifies survival-heater supply. Operational control, survival heating and cryocooler drive are distinct paths in the design.'),
    ],
  },
];

export function systemDiagramReferences() {
  return SYSTEM_DIAGRAMS.flatMap(diagram => diagram.flows.flatMap(row => row.nodes.flatMap(item => item.refs)));
}

function componentFor(reference) {
  const {scene,part,id}=reference;
  const component=COMPONENT_CATALOG[scene]?.[part]?.find(item=>item.id===id);
  if(!component) throw new Error(`System diagram references missing component: ${scene}/${part}/${id}`);
  return component;
}

function renderNode(item, assemblyPrefix) {
  const components=item.refs.map(reference=>({reference,component:componentFor(reference)}));
  const titles=item.title
    ? `<a class="sd-node-name" href="${esc(assemblyPrefix)}#parts-${esc(item.refs[0].scene)}-${esc(item.refs[0].part)}">${esc(item.title)}</a><p class="sd-role">${esc(item.role)}</p>`
    : components.map(({reference:r,component:c})=>`<div class="sd-component"><a class="sd-node-name" href="${esc(assemblyPrefix)}#parts-${esc(r.scene)}-${esc(r.part)}">${esc(c.title)}</a><p class="sd-role">${esc(c.role)}</p></div>`).join('');
  const evidence=components.map(({reference:r,component:c})=>chip(c.specs[0][2],`component:${r.scene}:${r.part}:${c.id}:0`,c.title)).join('');
  return `<li class="sd-node">${titles}<div class="sd-node-evidence" aria-label="Evidence for the component roles">${evidence}</div></li>`;
}

function renderWire(edge) {
  // Arrows scale independently of the HTML labels. On a phone the same sequence
  // runs down the page, preserving readable component names and reading order.
  return `<li class="sd-connector sd-${esc(edge.type)}"><svg class="sd-arrow" viewBox="0 0 40 24" aria-hidden="true" focusable="false"><path class="sd-wire" d="M3 12H35"/><path class="sd-tip" d="M29 6L35 12L29 18"/>${edge.both?'<path class="sd-tip" d="M9 6L3 12L9 18"/>':''}</svg><span class="sd-connection-label">${esc(edge.label)}</span></li>`;
}

function renderInstrumentArchitecture() {
  const children = {
    sensor: ['Optical bench, telescope and scan mechanisms', 'Focal-plane modules and ROICs', 'Sensor Unit Electronics: Video Processors, conversion circuitry and P&TC'],
    electronics: ['Common chassis and parent board', 'Instrument Controller, Data Processor, HSIO and TNT cards', 'Power supply, scanner driver and encoder-processor cards'],
    cooler: ['Spacecraft-mounted cooler-control electronics', 'Electrical connection to the cooler in the Sensor Unit', 'Temperature feedback and controlled drive'],
  };
  const packages = INSTRUMENT_ASSEMBLIES.map(assembly => `<section class="sd-package"><h4>${esc(assembly.title)}</h4><ul>${children[assembly.id].map(name => `<li>${esc(name)}</li>`).join('')}</ul><p>${esc(assembly.body)}</p>${chip('spec',assembly.evidence,`${assembly.title}: ABI packaging`)}</section>`).join('');
  const interfaces = INSTRUMENT_INTERFACES.map(item => `<div><dt>${esc(item.title)}</dt><dd>${esc(item.body)} ${chip('spec',`integration:${item.fact}`,item.title)}</dd></div>`).join('');
  return `<section class="sd-instrument" aria-labelledby="sd-instrument-title"><header><p class="eyebrow">Physical assembly view / ABI civil example</p><h4 id="sd-instrument-title">One instrument, coordinated units</h4><p>Enclosures contain several functions. Shared electronics do not require the whole instrument to occupy one housing. ${chip('spec','integration:abi-units','ABI physical units')}</p></header><div class="sd-packages">${packages}</div><details class="sd-interface-details"><summary>Across the instrument-to-spacecraft boundary</summary><dl class="sd-interfaces">${interfaces}</dl></details><details class="sd-interface-details"><summary>Who supplies it, and who integrates it?</summary><p>Contract responsibility is a different map from physical packaging. Lockheed Martin’s 2014 announcement identifies it as SBIRS prime and Northrop Grumman as payload provider, with the delivered payload proceeding to satellite-bus integration. That establishes delivery roles only. ${chip('vendor','integration:supplier-delivery','Historical SBIRS delivery roles')}</p><p>NASA’s Landsat 9 example describes mechanical attachment of the instruments followed by power and spacecraft data-handling integration. ${chip('reported','integration:spacecraft-integration','Landsat 9 integration')}</p><p>NASA’s interface-management guidance separates organizational boundaries from functional and physical interfaces. Teams define and control those interfaces during design and verify compatibility during integration. There is no universal rule that one company, one enclosure and one function are the same boundary. ${chip('spec','integration:interface-management','NASA interface management')}</p></details></section>`;
}

export function renderSystemDiagram(id,{assemblyPrefix=''}={}) {
  const diagram=SYSTEM_DIAGRAMS.find(item=>item.id===id);
  if(!diagram) throw new Error(`Unknown system diagram: ${id}`);
  const rows=diagram.flows.map(row=>{
    if(row.wires.length!==row.nodes.length-1) throw new Error(`Invalid diagram connection count: ${row.id}`);
    const sequence=row.nodes.map((item,i)=>renderNode(item,assemblyPrefix)+(row.wires[i]?renderWire(row.wires[i]):'')).join('');
    return `<section class="sd-path" aria-labelledby="sd-${esc(row.id)}"><h4 id="sd-${esc(row.id)}">${esc(row.title)}</h4><ol class="sd-flow" style="--sd-steps:${row.nodes.length}">${sequence}</ol>${row.note?`<p class="sd-path-note">${esc(row.note)}</p>`:''}</section>`;
  }).join('');
  const legend=[['light','Light'],['data','Data / control'],['power','Electrical power'],['heat','Heat'],['mechanical','Mechanical motion']].map(([type,label])=>`<li class="sd-${type}"><svg viewBox="0 0 40 24" aria-hidden="true" focusable="false"><path class="sd-wire" d="M3 12H35"/><path class="sd-tip" d="M29 6L35 12L29 18"/></svg><span>${label}</span></li>`).join('');
  return `<figure class="system-diagram" id="diagram-${esc(id)}" aria-labelledby="sd-title-${esc(id)}"><figcaption><p class="eyebrow">${esc(diagram.eyebrow)}</p><h3 id="sd-title-${esc(id)}">${esc(diagram.title)}</h3><p>${esc(diagram.intro)}</p></figcaption>${id==='abi-instrument'?renderInstrumentArchitecture():''}<ul class="sd-legend" aria-label="Connection types">${legend}</ul><div class="sd-paths">${rows}</div><p class="sd-boundary">Selected functional connections. Arrows describe a connection or processing step, not a separate housing for every block. <a href="method.html#assume-look-model">Drawing arrangement is schematic.</a> Component buttons open the reviewed evidence; component names link to the assembly catalog.</p></figure>`;
}

export const renderSystemDiagrams = options => SYSTEM_DIAGRAMS.map(diagram=>renderSystemDiagram(diagram.id,options)).join('\n');
