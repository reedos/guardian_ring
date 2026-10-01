import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/focal-plane.glb?v=1',
  camera:{pos:[4.5,4.8,6],target:[.5,.2,-.2],min:2,max:19},distance:5.2,
  points:{array:'AnchorArray',readout:'AnchorReadout','cold-stage':'AnchorColdStage'},
  paths:{
    light:[[[-.8,2.7,.15],'AnchorArray']],
    data:[['AnchorArray',[.2,.52,.28],[.8,.15,.28],[1.5,.18,.28],'AnchorReadout']],
    heat:[['AnchorArray',[-.77,.35,-.8],'AnchorColdStage'],['AnchorColdStage',[.5,.44,-1.36],[1.4,.4,-1.6],[2.4,1,-1.9]],['AnchorReadout',[2.6,.4,-.8],[2.9,1,-1.4]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
