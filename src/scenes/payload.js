import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/payload.glb?v=5',
  camera:{pos:[6.7,5.5,8.3],target:[.3,-.3,-.3],min:1.7,max:26},distance:4.3,
  cameraPhone:{pos:[8.5,7.2,11]},
  points:{optics:'AnchorOptics',baffles:'AnchorBaffles',detector:'AnchorDetector',readout:'AnchorReadout',digitizer:'AnchorDigitizer',controller:'AnchorController',thermal:'AnchorThermal'},
  views:{
    optics:{pos:[1.8,2.8,4.4],target:[-1.2,.2,-.15]},
    baffles:{pos:[-.2,2.8,4.9],target:[-1.65,.45,1.45]},
    detector:{pos:[-.2,2,-4.9],target:[-1.1,-.45,-1.97]},
    readout:{pos:[1.4,1.8,3.7],target:[.55,-.58,.9]},
    digitizer:{pos:[3.4,1.8,3.7],target:[2.1,-.57,.84]},
    controller:{pos:[3.8,1.8,1],target:[1.99,-.4,-.90]},
    thermal:{pos:[4.8,2.6,-4.5],target:[2.14,-.8,-2.24]},
  },
  labels:[
    {text:'REFLECTIVE TELESCOPE',p:[-1.42,-1.34,2.177],size:[1.51,.16],face:'front'},
    {text:'READOUT FRONT END',p:[.55,-1.04,1.540],size:[.78,.14],face:'front'},
    {text:'DIGITIZER',p:[2.12,-1.04,1.540],size:[.87,.14],face:'front'},
    {text:'INSTRUMENT CONTROL',p:[1.98,-1.03,-.243],size:[.94,.14],face:'front'},
    {text:'COOLER',p:[2.2,-1.22,-1.912],size:[.75,.13],face:'front'},
  ],
  paths:{
    light:[[[ -1,.38,3.1],'AnchorOptics',[-1.37,.06,1.35],[-1.45,0,-.9],'AnchorDetector']],
    data:[['AnchorDetector',[-.3,-.2,-1],[.15,-.31,.20],'AnchorReadout'],['AnchorReadout',[1.4,-.24,.94],'AnchorDigitizer'],['AnchorDigitizer',[2.86,-.12,.12],'AnchorController',[3.2,.1,-.60]]],
    heat:[['AnchorDetector',[-.3,-.45,-2.45],'AnchorThermal',[3.1,-.6,-2.4],[4.2,.1,-2.0]],['AnchorReadout',[.6,-1.34,.95],[2.5,-1.32,.90],[3.4,-.6,-1.2]],['AnchorController',[2.85,-.75,-1.2],[3.4,-.2,-1.2]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
