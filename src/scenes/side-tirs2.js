import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/tirs2.glb?v=1',
  camera:{pos:[5.8,4.5,7.3],target:[.3,.5,0],min:2,max:22},distance:6,
  points:{telescope:'AnchorTelescope',arrays:'AnchorArrays',cooling:'AnchorCooling'},
  views:{
    telescope:{pos:[3.8,3.6,6],target:[-.55,.75,.2]},
    arrays:{pos:[4,3.8,.7],target:[-.55,.78,-1.42]},
    cooling:{pos:[5.2,3.4,4],target:[1.62,.4,-.62]},
  },
  paths:{
    light:[[[ -.55,.76,3],[-.55,.76,1.22],[-.55,.76,-.79],'AnchorArrays']],
    data:[['AnchorArrays',[1.1,.45,-1.8],[1.63,.62,.75],[2.8,.7,1]]],
    heat:[['AnchorArrays',[.7,.7,-1.67],[1.62,.45,-1.36],'AnchorCooling',[2.46,1.2,-1.04],[3.3,1.7,-1.04]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
