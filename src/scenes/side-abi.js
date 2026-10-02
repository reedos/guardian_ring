import { illustrated } from './illustrated.js';
const scene=illustrated({
  teaching:'abi',signal:'AnchorFocalPlanes',signalRadius:.43,
  phaseHighlights:{readout:'Readout',digitize:'Readout'},
  mechanisms:[{node:'ABIScanNorthSouth',axis:[1,0,0],normal:[.64,.25,.72],range:.19,motion:'scan'},{node:'ABIScanEastWest',axis:[0,1,0],normal:[-.64,.45,.63],range:.17,motion:'scan'}],
  url:'models/abi.glb?v=6',
  camera:{pos:[12,12,16],target:[.4,.35,.1],min:3,max:38},cameraPhone:{pos:[11.5,13,18.5]},distance:6,
  points:{telescope:'AnchorTelescope',bands:'AnchorBands','focal-planes':'AnchorFocalPlanes','scan-system':'AnchorScanSystem',calibration:'AnchorCalibration',readout:'AnchorReadout',controller:'AnchorController',thermal:'AnchorThermal',power:'AnchorPower'},
  views:{
    telescope:{pos:[.5,6.5,3.6],target:[-2.3,.65,.3]},
    bands:{pos:[2.6,4.7,3.7],target:[.73,.99,-.16]},
    'focal-planes':{pos:[6.4,4.8,3.1],target:[2.70,.43,0]},
    'scan-system':{pos:[-.6,4.8,7.0],target:[-2.16,.94,2.97]},
    calibration:{pos:[1.3,4.8,6.9],target:[.59,.64,2.75]},
    readout:{pos:[4.2,4.6,7.0],target:[2.77,.42,2.74]},
    controller:{pos:[7.9,4.6,2.8],target:[4.44,.46,-.02]},
    thermal:{pos:[.8,10,3.7],target:[.70,.48,-2.35]},
    power:{pos:[7.4,4.7,6.1],target:[4.59,.47,2.82]},
  },
  labels:[
    {text:'TELESCOPE MIRRORS',p:[-2.4,-.058,1.43],size:[2.4,.22],partIds:['telescope']},
    {text:'ORTHOGONAL SCAN MIRRORS',p:[-2.48,-.038,3.78],size:[2.36,.22],partIds:['scan-system']},
    {text:'CALIBRATION TARGETS',p:[.61,-.038,3.63],size:[1.62,.22],partIds:['calibration']},
    {text:'AFT-OPTICS SPLITTERS',p:[.67,-.038,1.34],size:[1.42,.22],partIds:['bands']},
    {text:'FOCAL-PLANE MODULES',p:[2.73,-.038,1.38],size:[1.66,.22],partIds:['focal-planes']},
    {text:'SENSOR ELECTRONICS',p:[2.78,.042,3.80],size:[1.80,.22],partIds:['readout']},
    {text:'ELECTRONICS UNIT',p:[4.44,.43,1.401],size:[1.25,.25],face:'front',partIds:['controller']},
    {text:'POWER SUPPLY',p:[4.54,.012,3.82],size:[1.34,.22],partIds:['power']},
    {text:'CRYOCOOLER / RADIATOR',p:[-.04,.002,-1.59],size:[2.33,.22],partIds:['thermal']},
  ],
  paths:{
    light:[{kind:'light',points:[[-3.2,1.2,5.1],'AnchorScanSystem',[-3.4,1.05,.55],[-2.40,.97,-.65],[-1.43,1.08,.47],[-.48,.94,-.65],'AnchorBands','AnchorFocalPlanes']},{kind:'light',exclusive:true,phases:['reference'],points:['AnchorCalibration','AnchorScanSystem',[-3.4,1.05,.55],'AnchorBands','AnchorFocalPlanes']}],
    data:[{kind:'analog',points:['AnchorFocalPlanes',[3.39,.72,1.39],'AnchorReadout']},{kind:'image-data',points:['AnchorReadout',[3.68,.71,1.73],'AnchorController',[5.75,.95,.64]]},{kind:'command',points:['AnchorController',[3.56,.84,2.07],[-3.98,1.0,3.0],'AnchorScanSystem']},{kind:'feedback',points:['AnchorScanSystem',[-4.20,1.0,3.0],[-4.5,1.0,1.9],[3.0,.85,1.9],'AnchorController']}],
    heat:[{kind:'heat',phases:['lift'],points:['AnchorFocalPlanes',[2.13,.48,-1.33],'AnchorThermal']},{kind:'heat',phases:['reject'],points:['AnchorThermal','AnchorRadiator']},{kind:'radiation',points:['AnchorRadiator',[4.0,2.2,-4.2]]},{kind:'electrical',points:['AnchorPower',[-2.60,.42,-2.63],'AnchorThermal']},{kind:'feedback',phases:['sense'],points:['AnchorCooler',[-1.10,.65,-2.9],[-2.60,.42,-2.63]]},{kind:'heat',phases:['reject'],points:['AnchorReadout',[2.77,.12,2.74],[4.10,.12,1.77],'AnchorRadiator']}],
  },
});
export const preload=scene.preload;
export const build=scene.build;
