import { illustrated } from './illustrated.js';
const scene=illustrated({
  teaching:'pixel',signal:'AnchorReadout',absorptionSignal:'AnchorAbsorber',signalRadius:.42,
  phaseHighlights:{absorb:'Absorber',integrate:'Readout'},
  url:'models/pixel.glb?v=2',
  camera:{pos:[4.7,3.6,6],target:[0,1.25,0],min:2,max:18},distance:5.5,
  points:{absorber:'AnchorAbsorber',contact:'AnchorContact',readout:'AnchorReadout',bump:'AnchorBump',support:'AnchorSupport',output:'AnchorOutput'},
  views:{
    absorber:{pos:[3.5,4.6,5.2],target:[0,2.3,0]},
    contact:{pos:[3.3,2.8,4.5],target:[0,1.82,.708],focus:[0,1.82,0],detailSize:[1.95,.35,1.65],minDistance:2.4},
    readout:{pos:[3.4,2.2,5],target:[.44,.326,-.21]},
    bump:{pos:[3.3,1.65,4.5],target:[0,1.1,.254],focus:[0,1.1,0],detailSize:[.9,1.2,.9],minDistance:2},
    support:{pos:[3.5,1.4,4.7],target:[0,-.03,1.001]},
    output:{pos:[4.9,1.9,4.5],target:[1.747,.27,.486],focus:[1.62,.20,0],detailSize:[1.0,.7,1.4],minDistance:2.2},
  },
  paths:{
    light:[[[0,3.6,.1],'AnchorAbsorber']],
    data:[{kind:'charge',phases:['integrate','readout'],points:['AnchorAbsorber','AnchorContact','AnchorBump',[0,.5,.1],'AnchorReadout']},{kind:'analog',phases:['digitize','transfer'],points:['AnchorReadout','AnchorOutput']}],
    heat:[{kind:'heat',phases:['lift','reject'],points:['AnchorAbsorber',[.75,1.8,.6],[.75,.5,.6],'AnchorSupport']},{kind:'heat',phases:['reject'],points:['AnchorReadout',[1.1,.5,-.21],'AnchorSupport']}],
  },
});
export const preload=scene.preload;
export const build=scene.build;
