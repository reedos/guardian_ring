import { illustrated } from './illustrated.js';
const scene = illustrated({
  url:'models/satellite.glb?v=4',
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
    {text:'BATTERY',p:[-.85,.38,.903],size:[.64,.14],face:'front'},
    {text:'POWER DISTRIBUTION',p:[.80,.44,.975],size:[.79,.13],face:'front'},
    {text:'FLIGHT COMPUTER',p:[-.69,1.61,.330],size:[.83,.13],face:'front'},
    {text:'PAYLOAD PROCESSOR',p:[.67,1.41,.501],size:[.88,.13],face:'front'},
    {text:'REACTION WHEELS',p:[-.06,.285,1.21],size:[.65,.14],face:'top'},
    {text:'RADIATOR',p:[1.93,1.90,1.543],size:[.53,.12],face:'front'},
    {text:'MLI · COVER REMOVED',p:[-1.92,.39,1.732],size:[.65,.14],face:'front'},
  ],
  paths:{
    light:[[[0,2.78,4.2],'AnchorPayload'],[[-1.06,2.44,2.3],'AnchorAttitude']],
    data:[['AnchorPayload',[.3,2.08,.5],'AnchorComputer'],['AnchorComputer',[.8,2.05,-.4],'AnchorAntenna'],['AnchorAttitude',[-1.1,1.94,.3],'AnchorComputer'],['AnchorComputer',[0,1.20,1.25],'AnchorWheels']],
    heat:[['AnchorSolarArray',[2.1,1.4,.1],'AnchorPower'],['AnchorBattery',[-.18,.91,.70],'AnchorPower'],['AnchorComputer',[1.22,1.85,.90],'AnchorRadiator',[2.75,1.5,2.3]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
