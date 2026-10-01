import { illustrated } from './illustrated.js';
const scene = illustrated({
  url:'models/satellite.glb?v=2',
  camera:{pos:[5,4.5,10],target:[0,.45,0],min:3.2,max:24},distance:6,
  cameraPhone:{pos:[6.5,6,13]},
  points:{instrument:'AnchorPayload',structure:'AnchorBus',links:'AnchorAntenna'},
  heatPoints:{instrument:'AnchorPayload',structure:'AnchorPower',links:'AnchorRadiator'},
  views:{links:{pos:[-5,4.8,6],target:[-.77,1.6,0]}},
  heatViews:{},
  paths:{
    light:[[[0,1.5,3.3],'AnchorPayload']],
    data:[['AnchorPayload',[0,1,.99],'AnchorBus'],['AnchorBus',[-1.1,.2,1],[-1.1,2.2,.4],'AnchorAntenna']],
    heat:[[[2.65,2.4,1.5],'AnchorPower'],['AnchorPower',[1.1,.05,.9],'AnchorBus'],['AnchorBus',[1.1,0,1],'AnchorRadiator',[2.1,1.2,1.3]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
