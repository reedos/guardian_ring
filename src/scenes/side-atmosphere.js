import { illustrated } from './illustrated.js';
import { fitComponent } from '../app/component-frame.js';
// Drawing bounds include the curved air slab, enlarged molecules and incident rays.
// These are composition coordinates, not an atmospheric height or scale.
const overview={pos:[2.6,3.3,10],target:[.1,1.95,.3],focus:[.1,1.95,.3],detailSize:[4.9,4.1,2.4],minDistance:5};
const scene=illustrated({
  teaching:'atmosphere',signal:'AnchorCO2',signalRadius:.30,
  url:'models/atmosphere.glb?v=6',
  camera:{...overview,min:2.5,max:24},distance:6,
  points:{air:'AnchorAir',bands:'AnchorBands',context:'AnchorContext',co2:'AnchorCO2',h2o:'AnchorH2O'},
  markerRegions:{co2:{center:[1.2,2.22,-.08],size:[.9,.4,.4]},h2o:{center:[-1.25,1.2,-.08],size:[.65,.5,.4]}},
  views:{
    air:{pos:[2.1,4.1,9],target:[.1,1.95,.3],focus:[.1,1.95,.3],detailSize:[4.9,4.1,2.4],minDistance:5},
    bands:{pos:[4.8,4,6.5],target:[0,2,.2],focus:[0,2,.2],detailSize:[5.4,3.8,3.4],minDistance:4},
    context:{pos:[4.8,2.7,6.5],target:[0,.6,0],focus:[0,.6,0],detailSize:[4,2,3.8],minDistance:3,safe:{x0:-.82,x1:.82,y0:-.76,y1:.48}},
    co2:{pos:[4.8,3.45,4.9],target:[1.2,2.22,-.08],focus:[1.2,2.22,-.08],detailSize:[1.05,.45,.5],minDistance:2.2},
    h2o:{pos:[-4.6,2.5,5.0],target:[-1.25,1.25,-.08],focus:[-1.25,1.2,-.08],detailSize:[.85,.6,.5],minDistance:2.2},
  },
  paths:{
    light:[{kind:'light',phases:['arrive'],points:[[1.2,4.5,-.08],'AnchorCO2']},{kind:'light',phases:['transmit'],points:[[-.9,4.5,.3],[-.9,.35,.3]]}],
    // Separate event-order graphic in front of the molecular illustration; it is
    // neither a cable nor a second path through the atmosphere.
    data:[{kind:'timeline',name:'Order of illustrative observations',points:[[-.1,1.35,3.2],[1.5,1.35,2],[3.1,1.35,.8]]}],
    heat:[{kind:'radiation',phases:['emit'],points:['AnchorH2O',[-2.2,2.5,1.7]]}],
  },
});
export const preload=scene.preload;
export function build(options){return {...scene.build(options),overviewFrame:(width,height)=>fitComponent(overview,width,height)};}
