import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/payload.glb?v=2',
  camera:{pos:[4.5,3.5,5.5],target:[0,0,-.2],min:2.5,max:18},distance:5.6,
  points:{optics:'AnchorOptics',detector:'AnchorDetector',thermal:'AnchorThermal'},
  views:{
    optics:{pos:[4.2,3.3,4.6],target:[.35,.3,-.8]},
    detector:{pos:[4,2.5,-5.8],target:[0,.28,-1.7]},
    thermal:{pos:[5,3,-3.3],target:[.47,.1,-1.7]},
  },
  paths:{
    light:[[[.48,.38,2.3],'AnchorOptics',[.08,.06,.80],[0,0,-1.85]],[[.30,-.4,2.3],[.30,-.4,-1.1],[.05,-.07,.8],[0,0,-1.85]]],
    data:[['AnchorDetector',[.34,.34,-1.92],'AnchorThermal',[1.0,.1,-2.1]]],
    heat:[['AnchorDetector',[.45,-.25,-1.8],'AnchorThermal',[1.3,-.1,-1.9]],[[.9,-.65,0],[1.1,-1.1,-1.1],[1.7,-1.1,-1.6]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
