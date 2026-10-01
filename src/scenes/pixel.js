import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/pixel.glb?v=1',
  camera:{pos:[4.7,3.6,6],target:[0,1.25,0],min:2,max:18},distance:5.5,
  points:{absorber:'AnchorAbsorber',contact:'AnchorContact',readout:'AnchorReadout'},
  views:{
    absorber:{pos:[3.5,4.6,5.2],target:[0,2.3,0]},
    contact:{pos:[3.3,1.65,4.5],target:[0,1.1,.15]},
    readout:{pos:[3.4,2.2,5],target:[.44,.326,-.21]},
  },
  paths:{
    light:[[[0,3.6,.1],'AnchorAbsorber']],
    data:[['AnchorAbsorber',[0,1.8,.1],'AnchorContact',[0,.5,.1],'AnchorReadout',[1.1,.4,-.21]]],
    heat:[['AnchorAbsorber',[.75,1.8,.6],[.75,.5,.6],[1.5,.3,.9]],['AnchorReadout',[1.1,.5,-.21],[1.5,.7,-.5]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
