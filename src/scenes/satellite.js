import { illustrated } from './illustrated.js';
import {configureSatelliteShadows} from './satellite-shadows.js';
const scene = illustrated({
  teaching:'satellite',
  layerMaterials:{data:['Payload','Computer','Links','Attitude','Wheels'],heat:{Power:'power',Battery:'warm',Computer:'warm',Radiator:'radiator',SolarArrayLeft:'power',SolarArrayRight:'power'}},
  // Qualitative emphasis follows the existing hardware and each signal's
  // receiving role. Color identifies a process, never a measured state.
  phaseHighlights:{
    collect:{role:'Payload',kind:'light',intensity:.22},
    readout:{role:'Computer',kind:'image-data',intensity:.20},
    transfer:{role:'Links',kind:'image-data',intensity:.24},
    command:{role:'Wheels',kind:'command',intensity:.22},
    feedback:{role:'Computer',kind:'feedback',intensity:.18},
    power:{role:'Power',kind:'electrical',intensity:.20},
    reject:{role:'Radiator',kind:'heat',intensity:.18},
    radiate:{role:'Radiator',kind:'radiation',intensity:.16},
  },
  url:'models/satellite.glb?v=8',
  camera:{pos:[8,6.5,13.5],target:[0,1.35,.25],min:1.8,max:32},distance:4.2,
  cameraPhone:{pos:[7.885,6.87,16.643]},
  points:{instrument:'AnchorPayload',structure:'AnchorBus','solar-array':'AnchorSolarArray','array-drive':'AnchorArrayDrive',power:'AnchorPower',battery:'AnchorBattery',attitude:'AnchorAttitude',wheels:'AnchorWheels',propulsion:'AnchorPropulsion',computer:'AnchorComputer',links:'AnchorAntenna',radiator:'AnchorRadiator'},
  views:{
    instrument:{pos:[2.7,4.3,5.5],target:[0,2.7,.6]},
    structure:{pos:[-4,3.5,5],target:[-.5,1.2,.5]},
    'solar-array':{pos:[3.4,1.9,3.7],target:[3.01,1.1,-.09]},
    'array-drive':{pos:[-3.4,3,3.6],target:[-1.88,1.16,.07]},
    power:{pos:[2.2,2.6,3.7],target:[.8,.65,.6]},
    battery:{pos:[-.8,2.7,3.6],target:[-.85,.55,.6]},
    attitude:{pos:[-3.3,3.6,3.4],target:[-1.06,2.44,-.1]},
    wheels:{pos:[1.3,1.8,4],target:[-.08,.56,1.4]},
    propulsion:{pos:[3.5,4.5,3.3],target:[.88,1.45,-.74]},
    computer:{pos:[-.7,2.1,3.6],target:[-.69,1.64,.15]},
    links:{pos:[-3.2,4.8,1.8],target:[-.52,3.05,-.95]},
    radiator:{pos:[3.9,2.8,4.6],target:[1.93,1.28,1.53]},
  },
  // Names belong to the numbered callouts and component cards. Large invented
  // black nameplates on every enclosure made the spacecraft read as a toy kit.
  labels:[],
  paths:{
    light:[[[0,2.78,4.2],'AnchorPayload'],[[-1.06,2.44,2.3],'AnchorAttitude']],
    data:[{kind:'image-data',phases:['readout'],points:['AnchorPayload',[.3,2.08,.5],'AnchorComputer']},{kind:'image-data',points:['AnchorComputer',[.8,2.05,-.4],'AnchorAntenna']},{kind:'feedback',points:['AnchorAttitude',[-1.1,1.94,.3],'AnchorComputer']},{kind:'command',points:['AnchorComputer',[0,1.20,1.25],'AnchorWheels']}],
    heat:[{kind:'electrical',points:['AnchorSolarArray',[2.1,1.4,.1],'AnchorPower']},{kind:'electrical',points:['AnchorBattery',[-.18,.91,.70],'AnchorPower']},{kind:'heat',phases:['reject'],points:['AnchorComputer',[1.22,1.85,.90],'AnchorRadiator']},{kind:'radiation',points:['AnchorRadiator',[2.75,1.5,2.3]]}],
  },
});
export const preload=scene.preload;
export function build(options){const built=scene.build(options);configureSatelliteShadows(built);return built;}
