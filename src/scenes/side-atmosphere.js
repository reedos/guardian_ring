import { illustrated } from './illustrated.js';
const scene=illustrated({
  teaching:'atmosphere',signal:'AnchorCO2',signalRadius:.30,
  url:'models/atmosphere.glb?v=2',
  camera:{pos:[6.4,4.8,8.5],target:[0,1.8,0],min:2.5,max:24},
  cameraPhone:{pos:[8.2,6.5,11]},distance:6,
  points:{air:'AnchorAir',bands:'AnchorBands',context:'AnchorContext',co2:'AnchorCO2',h2o:'AnchorH2O'},
  views:{
    air:{pos:[4.5,3.4,6],target:[-.9,3.1,.6]},
    bands:{pos:[4.8,4,6.5],target:[.4,2.3,1.25]},
    context:{pos:[4.8,2.7,6.5],target:[.7,.25,.6]},
    co2:{pos:[6.0,3.9,6],target:[1.95,2.55,.43],focus:[1.95,2.55,.25],detailSize:[1.4,.55,.65],minDistance:2.5},
    h2o:{pos:[-5.7,3.2,6],target:[-1.9,1.55,.34],focus:[-1.9,1.45,.15],detailSize:[1.1,.75,.60],minDistance:2.5},
  },
  paths:{
    light:[{kind:'light',phases:['arrive'],points:[[1.95,4.5,.43],'AnchorCO2']},{kind:'light',phases:['transmit'],points:[[-.9,4.5,.3],[-.9,.35,.3]]}],
    // Separate event-order graphic in front of the molecular illustration; it is
    // neither a cable nor a second path through the atmosphere.
    data:[{kind:'timeline',name:'Order of illustrative observations',points:[[-.1,1.35,3.2],[1.5,1.35,2],[3.1,1.35,.8]]}],
    heat:[{kind:'radiation',phases:['emit'],points:['AnchorH2O',[-2.6,2.9,1.7]]}],
  },
});
export const preload=scene.preload;
export const build=scene.build;
