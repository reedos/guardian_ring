// Canonical component anatomy: one reviewed ledger serves the explorer and Parts reference.
import spacecraft from '../research/spacecraft-facts.json';
import comprehensive from '../research/comprehensive-systems-facts.json';
import tirs from '../research/tirs2-architecture-facts.json';
import practices from '../research/design-practices-facts.json';
const facts = Object.fromEntries([...spacecraft.facts,...comprehensive.facts,...tirs.facts,...practices.facts].map(f=>[f.runtimeKey,f.row]));
export const catalogFact = key => {
  if(!facts[key]) throw new Error(`Unreviewed component fact: ${key}`);
  return structuredClone(facts[key]);
};
const c=(id,title,role,body,...keys)=>({id,title,role,body,specs:keys.map(catalogFact)});
export const COMPONENT_CATALOG = {
  tirs2:{
    telescope:[
      c('scene-mirror','Scene-select mirror','Choose Earth or a calibration reference','The TIRS-2 scene-select mechanism points toward Earth, its onboard blackbody or a space view. This civil mechanism has a different observing role from ABI’s two-axis scanning assembly.','tirs-scene-select'),
      c('scene-drive','Scene-select motor, bearings and encoders','Move and measure the mirror','NASA’s TIRS-2 design separates the motor, mirror support, encoders and mechanism-control electronics. Motion and measured position are distinct hardware responsibilities.','tirs-motion'),
      c('blackbody','Onboard blackbody target','Provide a thermal reference','The blackbody is an internal reference that the scene-select mirror can observe. Space supplies another reference view rather than another installed target.','tirs-scene-select'),
      c('baffles','Lens baffles and spacers','Control unwanted light around the lenses','The TIRS-2 design includes lens-region baffles and spacers. Its refractive optical train is distinct from ABI’s reflective telescope; the fixed interference filters are a separately selectable assembly.','tirs-baffles'),
    ],
    arrays:[
      c('fpe','Focal Plane Electronics','Connect and operate detector readout','NASA’s design diagram separates the detector assemblies from the FPE and main electronics. The FPE forms the instrument’s detector-side electrical interface.','tirs-fpe'),
      c('fib','Focal-plane Interface Board','Provide selected cross-connections','The TIRS-2 interface board connects the focal-plane electronics to the paired main electronics. The design uses selected cross-strapping rather than making every possible connection redundant.','tirs-fpe','tirs-redundancy'),
      c('meb','Main Electronics Box','House instrument-control and interface boards','The MEB contains separate functions for command/data handling, power, temperature control, mechanism control and high-speed data interfaces. The NASA diagram distinguishes power, command, telemetry and science-data connections.','tirs-meb'),
      c('mce','Mechanism-control electronics','Drive the scene-select mechanism','The MCE interfaces with the motor, encoders and deployable hardware in NASA’s block diagram. It is separate from the high-speed science-data interface.','tirs-motion','tirs-meb'),
      c('redundant','Redundant electronics interfaces','Provide alternate hardware paths','The 2018 design pairs main-electronics and cooler-control functions and cross-connects selected interfaces. This is an explicitly named civil design example, not an assumed property of the representative payload.','tirs-redundancy'),
    ],
    cooling:[
      c('tmu','Cryocooler thermomechanical unit','Provide refrigeration','TIRS-2 separates the cooler’s thermomechanical hardware from its control and switching electronics. This description admits no new performance or operating-temperature values from the design presentation.','tirs-cooler'),
      c('cce','Cryocooler Control Electronics','Drive and control the cooler','The NASA block diagram includes paired cooler-control electronics connected to the thermomechanical unit through switching hardware.','tirs-cooler','tirs-redundancy'),
      c('rse','Redundancy Switch Electronics','Select the cooler-control connection','The RSE connects the redundant cooler electronics to the thermomechanical unit. It is a distinct interface assembly in the TIRS-2 design.','tirs-cooler'),
      c('thermal','Radiators, heat pipes and Earth shield','Manage external and conducted heat','TIRS-2’s thermal design includes transport, emitting surfaces, shielding, blankets and isolation. These hardware roles are distinct from the active refrigeration cycle.','tirs-thermal'),
      c('heaters','Operational and survival heater circuits','Support separate thermal operating states','NASA’s design distinguishes operational temperature control from survival-heater supply. Temperature-control boards and the heaters they drive are separate items in the electrical diagram.','tirs-thermal','tirs-meb'),
      c('restraint','Cryocooler launch lock and Earth-shield deployment hardware','Restrain hardware for launch','The TIRS-2 diagram includes launch-restraint and deployment interfaces. These serve structural configuration changes rather than image-data processing.','tirs-restraint'),
    ],
  },
};

const definitions=Object.fromEntries(comprehensive.facts.map(f=>[f.runtimeKey,f]));
const physicalNames={
  'comp-abi-digitization':'Analog-to-digital conversion electronics',
  'comp-grounding-reference':'Ground-reference connections',
  'comp-cable-shielding':'Cable shields',
};
for(const group of comprehensive.coverage) {
  const scene=group.level==='cross-cutting'?'satellite':group.level;
  const part=group.level==='cross-cutting'?'structure':group.part;
  COMPONENT_CATALOG[scene] ||= {};
  const components=group.factKeys.map(key=>{
    const f=definitions[key];
    return c(key,physicalNames[key]||f.componentName,f.row[1],f.body,key);
  });
  COMPONENT_CATALOG[scene][part]=[...(COMPONENT_CATALOG[scene][part]||[]),...components];
}
// The general solar-cell principle complements the named GOES-R circuit description.
COMPONENT_CATALOG.satellite['solar-array'].unshift(c('photovoltaic-cell','Photovoltaic cells','Convert sunlight into electrical current','A semiconductor photovoltaic cell converts absorbed light into electrical energy. NASA describes multi-junction cells as stacked junctions that respond to different portions of the solar spectrum.','solar-cells'));
// Civil comparisons expose the same detailed ABI modules without duplicating evidence definitions.
COMPONENT_CATALOG.abi={
  telescope:[...COMPONENT_CATALOG.payload.optics,...COMPONENT_CATALOG.payload.mechanisms],
  bands:[...COMPONENT_CATALOG.payload['aft-optics']],
  'focal-planes':[...COMPONENT_CATALOG.payload.detector],
  'scan-system':[...COMPONENT_CATALOG.payload['scan-system']],
  calibration:[...COMPONENT_CATALOG.payload.calibration],
  readout:[...COMPONENT_CATALOG.payload.readout],
  controller:[...COMPONENT_CATALOG.payload.controller,...COMPONENT_CATALOG.payload['data-interface']],
  thermal:[...COMPONENT_CATALOG.payload.thermal],
  power:[...COMPONENT_CATALOG.payload.power],
};
// Promote the formerly crowded civil overview groups into separately selectable assemblies.
const select=(items,ids)=>items.filter(item=>ids.includes(item.id));
const oldTirs=COMPONENT_CATALOG.tirs2;
COMPONENT_CATALOG.tirs2={
  telescope:select(oldTirs.telescope,['baffles']),
  arrays:[],
  cooling:select(oldTirs.cooling,['tmu','cce','rse']),
  'scene-select':select(oldTirs.telescope,['scene-mirror','scene-drive']),
  blackbody:select(oldTirs.telescope,['blackbody']),
  readout:select(oldTirs.arrays,['fpe','fib']),
  electronics:select(oldTirs.arrays,['meb','mce','redundant']),
  radiator:select(oldTirs.cooling,['thermal','heaters','restraint']),
  filters:[],
};
// New evidence follows the same canonical ledger; ground/test and software practices
// remain explanations of existing hardware instead of invented flight boxes.
for(const f of practices.facts) for(const {scene,part} of f.parents||[]) {
  COMPONENT_CATALOG[scene] ||= {};
  COMPONENT_CATALOG[scene][part] ||= [];
  COMPONENT_CATALOG[scene][part].push(c(f.runtimeKey,f.componentName,f.row[1],f.body,f.runtimeKey));
}
export function attachComponents(levels) {
  for(const [scene,parts] of Object.entries(COMPONENT_CATALOG)) for(const mode of ['light','data','heat']) {
    for(const part of levels[scene][mode]) part.components=parts[part.id]||[];
  }
  return levels;
}
