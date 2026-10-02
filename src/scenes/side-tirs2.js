import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/tirs2.glb?v=4',
  camera:{pos:[12,12,16],target:[.3,.5,.1],min:3,max:38},cameraPhone:{pos:[11.5,13,18.5]},distance:6,
  points:{telescope:'AnchorTelescope',arrays:'AnchorArrays',cooling:'AnchorCooling','scene-select':'AnchorSceneSelect',blackbody:'AnchorBlackbody',readout:'AnchorReadout',electronics:'AnchorElectronics',radiator:'AnchorRadiator',filters:'AnchorFilters'},
  views:{
    telescope:{pos:[-.3,6.9,3.6],target:[-2.35,.55,.75]},
    arrays:{pos:[-5.3,10,-5.5],target:[-2.38,.4,-2.6]},
    cooling:{pos:[-.5,10,-6.9],target:[.55,.48,-3.13]},
    'scene-select':{pos:[-.5,4.9,7.1],target:[-2.35,1.10,3.05]},
    blackbody:{pos:[1.8,4.7,7],target:[.17,.74,3]},
    readout:{pos:[3.1,4.7,4.2],target:[1.27,.42,1]},
    electronics:{pos:[7.9,5.1,4.2],target:[3.72,.54,.64]},
    radiator:{pos:[6.3,10,-4.6],target:[3.57,.77,-2.71]},
    filters:{pos:[.9,5,1],target:[.08,.34,-1.65]},
  },
  labels:[
    {text:'REFRACTIVE TELESCOPE',p:[-2.36,-.033,1.98],size:[2.30,.22],partIds:['telescope']},
    {text:'SCENE-SELECT MIRROR',p:[-2.35,-.008,3.92],size:[2.25,.22],partIds:['scene-select']},
    {text:'ONBOARD BLACKBODY',p:[.20,-.013,3.87],size:[1.69,.22],partIds:['blackbody']},
    {text:'QWIP ARRAYS / SHIMS',p:[-2.39,-.023,-3.48],size:[2.21,.22],yaw:Math.PI,partIds:['arrays']},
    {text:'FIXED SPECTRAL FILTERS',p:[.05,-.023,-.49],size:[1.86,.22],partIds:['filters']},
    {text:'FOCAL-PLANE ELECTRONICS',p:[1.27,.38,1.932],size:[1.52,.32],face:'front',partIds:['readout']},
    {text:'MAIN ELECTRONICS BOX',p:[3.72,.007,2.60],size:[1.97,.22],partIds:['electronics']},
    {text:'CRYOCOOLER / CONTROLS',p:[.18,-.043,-3.92],size:[2.44,.22],yaw:Math.PI,partIds:['cooling']},
    {text:'RADIATOR / EARTH SHIELD',p:[3.62,1.166,-2.07],size:[2.33,.22],yaw:Math.PI,partIds:['radiator']},
  ],
  paths:{
    light:[[[-2.35,1.10,5.3],'AnchorSceneSelect',[-2.35,1.10,1.30],[-2.35,1.10,-.7],'AnchorFilters','AnchorArrays'],['AnchorBlackbody','AnchorSceneSelect']],
    data:[['AnchorArrays',[-.39,.66,-1.48],'AnchorReadout','AnchorElectronics',[5.70,1.11,.64]],['AnchorElectronics',[1.50,1.0,2.40],'AnchorSceneSelect']],
    heat:[['AnchorArrays',[-1.50,.53,-3.12],'AnchorCooling',[1.30,.55,-3.65],'AnchorRadiator',[4.30,2.10,-4.13]],['AnchorElectronics',[3.72,.14,-1.02],'AnchorRadiator']],
  },
});
export const preload=scene.preload;
export const build=scene.build;
