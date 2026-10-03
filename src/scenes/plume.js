import { illustrated } from './illustrated.js';
import { createPlumeIllustration, PLUME_FRAME, plumeOverviewPose } from './plume-illustration.js';
const points={source:'AnchorSource',bands:'AnchorBands',timeline:'AnchorTimeline',co2:'AnchorCO2',h2o:'AnchorH2O'};
const scene=illustrated({
  teaching:'plume',
  url:'models/plume.glb?v=2',
  camera:{...PLUME_FRAME,min:3,max:35},distance:7,
  illustration:createPlumeIllustration,
  lessonNote:'False-color rising emission; motion, glow, gas shape and atmosphere thickness are illustrative. No flight trajectory, altitude, absorption threshold or sensor visibility is calculated. Molecules are enlarged diagrams.',
  points,
  dataPoints:{...points,timeline:[2.9,3.15,1.9]},
  heatPoints:{...points,timeline:[1.75,5.29,.75]},
  views:{
    source:{...PLUME_FRAME,detailSize:[5.4,6.7,3.2]},
    bands:{...PLUME_FRAME,focus:[0,3.6,0],detailSize:[5.2,4.6,2.6]},
    timeline:{...PLUME_FRAME,focus:[1,3.3,.8],detailSize:[5.8,5.8,3.2]},
    co2:{pos:[6.0,4.7,6.8],target:[1.85,3.85,.065],focus:[1.85,3.85,-.10],detailSize:[1.4,.75,.65],minDistance:3},
    h2o:{pos:[-5.0,3.4,6.8],target:[-1.65,2.75,-.025],focus:[-1.65,2.63,-.20],detailSize:[1.25,.85,.65],minDistance:3},
  },
  paths:{
    light:[{kind:'radiation',phases:['emit'],points:['AnchorCO2',[3.5,4.7,1.5]]},{kind:'radiation',phases:['emit'],points:['AnchorH2O',[-3.5,3.7,1.5]]}],
    data:[{kind:'timeline',points:[[2.9,1.3,1.9],[2.9,5.0,1.9]]}],
    heat:[{kind:'radiation',phases:['emit'],points:[[0,4.78,0],[3.5,5.8,1.5]]}],
  },
});
export const preload=scene.preload;
export function build(options){return {...scene.build(options),overviewFrame:plumeOverviewPose};}
