import { illustrated } from './illustrated.js';
const scene = illustrated({
  teaching:'satellite',
  url:'models/satellite.glb?v=7',
  camera:{pos:[8,6.5,13.5],target:[0,1.35,.25],min:1.8,max:32},distance:4.2,
  cameraPhone:{pos:[9.5,8,20]},
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
  labels:[
    {text:'BATTERY ASSEMBLY',p:[-.85,.55,.98],size:[.89,.15],face:'front',mount:{prefix:'Battery_',reach:.3},partIds:['battery']},
    {text:'POWER UNIT',p:[.80,.64,1.05],size:[.86,.16],face:'front',mount:{prefix:'Power_',reach:.3},partIds:['power']},
    {text:'FLIGHT COMPUTER',p:[-.69,1.76,.72],size:[.97,.17],face:'front',mount:{prefix:'Computer_',reach:.3},partIds:['computer']},
    {text:'PAYLOAD PROCESSOR',p:[.67,1.43,.51],size:[.88,.16],face:'front',mount:{prefix:'Computer_',reach:.3},partIds:['computer']},
    {text:'REACTION WHEELS',p:[-.06,.26,1.56],size:[.66,.15],face:'front',mount:{prefix:'Wheels_',reach:.25},partIds:['wheels']},
    {text:'RADIATOR',p:[1.93,1.90,1.54],size:[.53,.12],face:'front',mount:{prefix:'Radiator_',reach:.2},partIds:['radiator']},
    {text:'MLI BLANKET',p:[-1.92,1.43,1.75],size:[.65,.16],face:'front',mount:{prefix:'Structure_',reach:.25},partIds:['structure']},
  ],
  paths:{
    light:[[[0,2.78,4.2],'AnchorPayload'],[[-1.06,2.44,2.3],'AnchorAttitude']],
    data:[{kind:'image-data',phases:['readout'],points:['AnchorPayload',[.3,2.08,.5],'AnchorComputer']},{kind:'image-data',points:['AnchorComputer',[.8,2.05,-.4],'AnchorAntenna']},{kind:'feedback',points:['AnchorAttitude',[-1.1,1.94,.3],'AnchorComputer']},{kind:'command',points:['AnchorComputer',[0,1.20,1.25],'AnchorWheels']}],
    heat:[{kind:'electrical',points:['AnchorSolarArray',[2.1,1.4,.1],'AnchorPower']},{kind:'electrical',points:['AnchorBattery',[-.18,.91,.70],'AnchorPower']},{kind:'heat',phases:['reject'],points:['AnchorComputer',[1.22,1.85,.90],'AnchorRadiator']},{kind:'radiation',points:['AnchorRadiator',[2.75,1.5,2.3]]}],
  },
});
export const preload=scene.preload;
export const build=scene.build;
