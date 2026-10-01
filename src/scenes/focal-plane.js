import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/focal-plane.glb?v=2',
  camera:{pos:[4.5,4.8,6],target:[.5,.2,-.2],min:2,max:19},distance:5.2,
  points:{array:'AnchorArray',readout:'AnchorReadout','cold-stage':'AnchorColdStage',shield:'AnchorShield',flex:'AnchorFlex',carrier:'AnchorCarrier'},
  views:{
    array:{pos:[1.7,3.8,4.6],target:[-.65,.5,0]},
    readout:{pos:[3.8,3.2,4.2],target:[2.05,.1,-.1]},
    'cold-stage':{pos:[1.5,3.2,-5],target:[-.1,.2,-1.2]},
    shield:{pos:[1.4,3.8,4.5],target:[-.65,.7,0]},
    flex:{pos:[2.8,3.3,4.6],target:[.8,.25,.26]},
    carrier:{pos:[2.5,2.5,5.6],target:[-.6,-.1,.2]},
  },
  labels:[
    {text:'VIDEO',p:[2.11,.253,-.29],size:[.46,.21]},
    {text:'BIAS / TIMING',p:[2.10,.253,.50],size:[.38,.17]},
    {text:'COLD CARRIER',p:[-.65,-.434,.97],size:[1.05,.13]},
  ],
  paths:{
    light:[[[-.8,2.7,.15],'AnchorArray']],
    data:[['AnchorArray',[.2,.52,.28],[.8,.15,.28],[1.5,.18,.28],'AnchorReadout']],
    heat:[['AnchorArray',[-.77,.35,-.8],'AnchorColdStage'],['AnchorColdStage',[.5,.44,-1.36],[1.4,.4,-1.6],[2.4,1,-1.9]],['AnchorReadout',[2.6,.4,-.8],[2.9,1,-1.4]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
