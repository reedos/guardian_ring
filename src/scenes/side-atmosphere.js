import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/atmosphere.glb?v=1',
  camera:{pos:[5.4,4.1,7],target:[0,1.8,0],min:2.5,max:22},
  cameraPhone:{pos:[6.2,4.5,8]},distance:6,
  points:{air:'AnchorAir',bands:'AnchorBands',context:'AnchorContext'},
  paths:{
    light:[[[.4,4.5,.6],[.4,3.2,.6],'AnchorBands'],[[-.9,4.5,.3],[-.9,2.5,.3],[-.9,.35,.3]]],
    data:[['AnchorContext',[1.8,1,1],[1.8,2.3,1],'AnchorBands']],
    heat:[['AnchorBands',[.9,2.6,1.6],[1.6,2.9,1.7]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
