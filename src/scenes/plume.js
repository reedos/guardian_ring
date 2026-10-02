import { illustrated } from './illustrated.js';
const scene=illustrated({
  teaching:'plume',
  url:'models/plume.glb?v=2',
  camera:{pos:[8,5.8,11],target:[0,3.2,0],min:3,max:28},distance:7,
  points:{source:'AnchorSource',bands:'AnchorBands',timeline:'AnchorTimeline',co2:'AnchorCO2',h2o:'AnchorH2O'},
  views:{
    source:{pos:[5,3.4,7],target:[0,1.4,0]},
    bands:{pos:[6,5.8,8],target:[.67,4.45,.55]},
    timeline:{pos:[5,6.8,8],target:[0,5,0]},
    co2:{pos:[6.0,4.7,6.8],target:[1.85,3.85,.065]},
    h2o:{pos:[-5.0,3.4,6.8],target:[-1.65,2.75,-.025]},
  },
  paths:{
    light:[{kind:'radiation',phases:['emit'],points:['AnchorCO2',[3.5,4.7,1.5]]},{kind:'radiation',phases:['emit'],points:['AnchorH2O',[-3.5,3.7,1.5]]}],
    data:[{kind:'timeline',points:[[2.9,1.3,1.9],[2.9,5.0,1.9]]}],
    heat:[{kind:'radiation',phases:['emit'],points:['AnchorSource',[3.5,2.8,1.5]]}],
  },
});
export const preload=scene.preload;
export const build=scene.build;
