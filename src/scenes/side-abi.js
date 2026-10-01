import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/abi.glb?v=1',
  camera:{pos:[8,7.5,11],target:[0,.7,-.1],min:3,max:30},
  distance:6,
  points:{telescope:'AnchorTelescope',bands:'AnchorBands','focal-planes':'AnchorFocalPlanes'},
  heatPoints:{telescope:'AnchorTelescope',bands:'AnchorCooler','focal-planes':'AnchorRadiator'},
  heatViews:{bands:{pos:[-.6,4.5,-5.5],target:[-.78,.88,-1.53]}},
  paths:{
    light:[[[ -4.1,2,1],'AnchorTelescope',[-1.15,1.1,.7],[.05,1.2,-.65],'AnchorBands','AnchorFocalPlanes']],
    data:[['AnchorTelescope','AnchorBands','AnchorFocalPlanes',[3.5,1,.5]]],
    heat:[['AnchorFocalPlanes',[1.7,.7,-1.35],'AnchorCooler','AnchorRadiator',[3.3,2.3,-2.1]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
