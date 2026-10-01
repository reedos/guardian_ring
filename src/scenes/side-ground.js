import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/ground.glb?v=1',
  camera:{pos:[8,6.5,10],target:[0,.8,0],min:3,max:30},
  cameraPhone:{pos:[11,8.6,14]},distance:6,
  points:{receive:'AnchorReceive',process:'AnchorProcess',operations:'AnchorOperations'},
  paths:{
    light:[[[ -4.5,4.5,1.5],'AnchorReceive']],
    data:[['AnchorReceive',[-2.1,.35,.6],[-.35,.35,.6],'AnchorProcess'],['AnchorProcess',[.6,.4,.6],[2.2,.4,.6],'AnchorOperations']],
    heat:[['AnchorProcess',[-.4,2.2,.3],[-.4,3.2,.3]],['AnchorOperations',[2.2,2,.3],[2.2,3,.3]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
