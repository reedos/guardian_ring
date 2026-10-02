// Physical identity is stable across Light, Data and Heat. Layer copy describes its role.
export const COMPONENT_NAMES = {
  orbits: {geo:'Geostationary satellite',earth:'Earth', 'orbit-families':'Orbit paths',processing:'Payload, mission processor and communications',downlink:'Space-to-ground communications path',ground:'Ground segment',sunlight:'Incident sunlight',power:'Solar array',radiator:'Spacecraft radiator'},
  satellite: {instrument:'Infrared instrument and mounting platform',structure:'Spacecraft bus and equipment panels','solar-array':'Solar array','array-drive':'Solar-array deployment and drive assembly',power:'Power regulation and distribution unit',battery:'Rechargeable battery assembly',attitude:'Attitude and navigation sensors',wheels:'Reaction-wheel assembly',propulsion:'Propellant tanks and thrusters',computer:'Flight computer and remote interface units',links:'Antennas and radio electronics',radiator:'Radiator panels and thermal insulation'},
  payload: {optics:'Telescope and optical bench',baffles:'Optical-port baffles and sunshield',detector:'Focal-plane modules',readout:'Video processor electronics',digitizer:'Analog-to-digital conversion electronics',controller:'Instrument controller and timing cards',thermal:'Cryocooler and heat-transport assembly','scan-system':'Scan mirrors and drive assembly',mechanisms:'Port-cover and focus mechanisms',calibration:'Calibration targets and reference views','aft-optics':'Beamsplitters, filters and cold stops','data-interface':'Data processor and spacecraft interface',power:'Instrument power supply and distribution'},
  'focal-plane':{array:'Detector array and readout integrated circuit',shield:'Window and cold-stop assembly',carrier:'Detector carrier and mounting frame',flex:'Detector-package interconnect',readout:'Warm video electronics','cold-stage':'Cold finger and thermal strap','bias-timing':'Detector bias and timing electronics','thermal-feedback':'Cold-head thermometer and cooler controller'},
  pixel:{absorber:'Infrared absorber',contact:'Electrical contact',readout:'Readout circuit cell'},
  plume:{source:'Hot emitting gas',bands:'Molecular emission bands',timeline:'Radiation paths'},
  ground:{receive:'Ground communications interface',process:'Mission-data processing equipment',operations:'Spacecraft-operations workstations'},
  abi:{telescope:'ABI telescope and scan mirrors',bands:'ABI spectral channels and electronics','focal-planes':'ABI focal-plane modules and cooler'},
  tirs2:{telescope:'TIRS-2 telescope and scene-select mechanism',arrays:'TIRS-2 detector arrays and electronics',cooling:'TIRS-2 cryocooler and thermal hardware'},
  atmosphere:{air:'Atmospheric gas column',bands:'Molecular absorption bands',context:'Source-to-sensor path'},
};

export function nameComponents(levels) {
  for(const [scene,names] of Object.entries(COMPONENT_NAMES)) for(const mode of ['light','data','heat']) {
    for(const part of levels[scene][mode]) {
      if(!names[part.id]) throw new Error(`Missing component name: ${scene}/${part.id}`);
      // Earlier cards led with a verb. Preserve that function beneath the component name.
      if(part.title !== names[part.id] && /^(Keep|Make|Give|Follow|Read|Let|Choose|Carry|Aim|Measure|Turn|Connect|Coordinate|Form|Represent|Separate|Control|Remove|Stabilize|Conduct|Cool|Spread|Start|Treat|Leave|Identify|Name|Show|Place|Recognize|See|Power|Remember|Mark|Locate|Understand|Compare|Trace|Meet|Hold|Supply|Reject)\b/.test(part.title)) part.kicker=part.title;
      part.title=names[part.id];
    }
  }
  return levels;
}
