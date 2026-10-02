import { illustrated } from './illustrated.js';
const scene=illustrated({
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
    light:[['AnchorSource',[2.5,2.3,1],[3.5,3.8,1.5]],['AnchorBands',[3,4.5,1],[4,5.2,1.5]]],
    data:[['AnchorSource',[.8,2.5,1],'AnchorBands',[.8,5,.8],'AnchorTimeline']],
    heat:[['AnchorSource',[-.6,2.5,.5],[-1,4.2,.5],'AnchorTimeline']],
  },
});
export const preload=scene.preload;
export const build=scene.build;
