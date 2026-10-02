import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/atmosphere.glb?v=2',
  camera:{pos:[6.4,4.8,8.5],target:[0,1.8,0],min:2.5,max:24},
  cameraPhone:{pos:[8.2,6.5,11]},distance:6,
  points:{air:'AnchorAir',bands:'AnchorBands',context:'AnchorContext',co2:'AnchorCO2',h2o:'AnchorH2O'},
  views:{
    air:{pos:[4.5,3.4,6],target:[-.9,3.1,.6]},
    bands:{pos:[4.8,4,6.5],target:[.4,2.3,1.25]},
    context:{pos:[4.8,2.7,6.5],target:[.7,.25,.6]},
    co2:{pos:[6.0,3.9,6],target:[1.95,2.55,.43]},
    h2o:{pos:[-5.7,3.2,6],target:[-1.9,1.55,.34]},
  },
  paths:{
    light:[[[.4,4.5,.6],[.4,3.2,.6],'AnchorBands'],[[-.9,4.5,.3],[-.9,2.5,.3],[-.9,.35,.3]]],
    data:[['AnchorContext',[1.8,1,1],[1.8,2.3,1],'AnchorBands']],
    heat:[['AnchorBands',[.9,2.6,1.6],[1.6,2.9,1.7]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
