// Physical identity is stable across Light, Data and Heat. Layer copy describes its role.
export const COMPONENT_NAMES = {
  orbits: {geo:'Geostationary satellite',earth:'Earth', 'orbit-families':'Orbit paths',processing:'Payload, mission processor and communications',downlink:'Space-to-ground communications path',ground:'Ground segment',sunlight:'Incident sunlight',power:'Solar array',radiator:'Spacecraft radiator',heo:'Highly elliptical orbit spacecraft',meo:'Medium Earth orbit spacecraft',leo:'Low Earth orbit spacecraft'},
  satellite: {instrument:'Infrared instrument and mounting platform',structure:'Spacecraft bus and equipment panels','solar-array':'Solar array','array-drive':'Solar-array deployment and drive assembly',power:'Power regulation and distribution unit',battery:'Rechargeable battery assembly',attitude:'Attitude and navigation sensors',wheels:'Reaction-wheel assembly',propulsion:'Propellant tanks and thrusters',computer:'Flight computer and remote interface units',links:'Antennas and radio electronics',radiator:'Radiator panels and thermal insulation'},
  payload: {optics:'Telescope and optical bench',baffles:'Optical-port baffles and sunshield',detector:'Focal-plane modules',readout:'Video processor electronics',digitizer:'Analog-to-digital conversion electronics',controller:'Instrument controller and timing cards',thermal:'Cryocooler and heat-transport assembly','scan-system':'Scan mirrors and drive assembly',mechanisms:'Port-cover and focus mechanisms',calibration:'Calibration targets and reference views','aft-optics':'Beamsplitters, filters and cold stops','data-interface':'Data processor and spacecraft interface',power:'Instrument power supply and distribution'},
  'focal-plane':{array:'Detector array and readout integrated circuit',shield:'Window and cold-stop assembly',carrier:'Detector carrier and mounting frame',flex:'Detector-package interconnect',readout:'Warm video electronics','cold-stage':'Cold finger and thermal strap','bias-timing':'Detector bias and timing electronics','thermal-feedback':'Cold-head thermometer and cooler controller'},
  pixel:{absorber:'Infrared absorber',contact:'Detector contact pad',readout:'Readout circuit cell',bump:'Indium interconnect',support:'Detector support and circuit-board interface',output:'Readout output circuitry'},
  plume:{source:'Hot emitting gas',bands:'Molecular emission bands',timeline:'Radiation paths',co2:'Carbon dioxide molecules',h2o:'Water-vapor molecules'},
  ground:{receive:'Ground-station antenna',process:'Mission-data processing equipment',operations:'Spacecraft-operations workstations',receiver:'Receiver and demodulation equipment',archive:'Telemetry and science-data archive',power:'Uninterruptible power supply'},
  abi:{telescope:'ABI telescope and optical bench',bands:'ABI beamsplitters and spectral filters','focal-planes':'ABI focal-plane modules','scan-system':'ABI scan mirrors and drives',calibration:'ABI calibration targets',readout:'ABI Sensor Unit Electronics',controller:'ABI controller and data-interface cards',thermal:'ABI cryocooler and heat transport',power:'ABI instrument power supply'},
  tirs2:{telescope:'TIRS-2 refractive telescope',arrays:'TIRS-2 detector arrays',cooling:'TIRS-2 cryocooler', 'scene-select':'TIRS-2 scene-select mechanism',blackbody:'TIRS-2 onboard blackbody',readout:'TIRS-2 focal-plane electronics',electronics:'TIRS-2 Main Electronics Box',radiator:'TIRS-2 radiators and Earth shield',filters:'TIRS-2 interference filters'},
  atmosphere:{air:'Atmospheric gas column',bands:'Molecular absorption bands',context:'Source-to-sensor path',co2:'Atmospheric carbon dioxide',h2o:'Atmospheric water vapor'},
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
