import { illustrated } from './illustrated.js';
import { OPTICAL_CONNECTIONS } from './optical-routing.js';
const scene=illustrated({
  teaching:'tirs2',signal:'AnchorArrays',signalRadius:.50,
  phaseHighlights:{readout:'Readout',digitize:'Readout'},
  lessonNote:'Dashed amber lines connect the selected reference, scene selector, and optical components by function; they are not traced rays. Earth and space endpoints mark reference directions, not installed targets. Mirror angles, packaging, and playback time are illustrative.',
  mechanisms:[{node:'TIRSSceneSelect',axis:[0,0,1],range:.52,motion:'reference'}],
  url:'models/tirs2.glb?v=5',
  camera:{pos:[12,12,16],target:[.3,.5,.1],min:3,max:38},cameraPhone:{pos:[11.5,13,18.5]},distance:6,
  points:{telescope:'AnchorTelescope',arrays:'AnchorArrays',cooling:'AnchorCooling','scene-select':'AnchorSceneSelect',blackbody:'AnchorBlackbody',readout:'AnchorReadout',electronics:'AnchorElectronics',radiator:'AnchorRadiator',filters:'AnchorFilters'},
  views:{
    telescope:{pos:[-.3,6.9,3.6],target:[-2.35,.55,.75],focus:[-2.35,1,.3],detailSize:[2.1,2.2,2.9],minDistance:3.2,labelNodes:['Telescope'],safe:{x0:-.82,x1:.82,y0:-.76,y1:.48}},
    arrays:{pos:[-5.3,10,-5.5],target:[-2.38,.4,-2.6],focus:[-2.38,.36,-2.65],detailSize:[3.1,.9,2.8],minDistance:4},
    cooling:{pos:[-.5,10,-6.9],target:[.55,.48,-3.13],focus:[.30,.40,-3.02],detailSize:[3.8,1.3,2.7],minDistance:3.5},
    'scene-select':{pos:[-.5,4.9,7.1],target:[-2.35,1.10,3.05]},
    blackbody:{pos:[1.8,4.7,7],target:[.17,.74,3]},
    readout:{pos:[3.1,4.7,4.2],target:[1.27,.42,1]},
    electronics:{pos:[7.9,5.1,4.2],target:[3.72,.54,.64],focus:[3.72,.5,.8],detailSize:[2.7,1.5,4.4],minDistance:4,safe:{x0:-.82,x1:.82,y0:-.6,y1:.5}},
    radiator:{pos:[6.3,10,-4.6],target:[3.57,.77,-2.71],focus:[3.57,.9,-2.71],detailSize:[3.3,2.0,2.1],minDistance:4,safe:{x0:-.82,x1:.82,y0:-.76,y1:.48}},
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
    light:OPTICAL_CONNECTIONS.tirs2,
    data:[{kind:'analog',points:['AnchorArrays',[-.39,.66,-1.48],'AnchorReadout']},{kind:'image-data',phases:['digitize','transfer'],points:['AnchorReadout','AnchorElectronics',[5.70,1.11,.64]]},{kind:'command',points:['AnchorElectronics',[1.50,1.0,2.40],'AnchorSceneSelect']},{kind:'feedback',points:['AnchorSceneSelect',[-2.35,1.10,2.65],[.40,1.10,2.16],'AnchorElectronics']}],
    heat:[{kind:'heat',phases:['lift'],points:['AnchorArrays',[-1.50,.53,-3.12],'AnchorCooling']},{kind:'heat',phases:['reject'],points:['AnchorCooling',[1.30,.55,-3.65],'AnchorRadiator']},{kind:'radiation',points:['AnchorRadiator',[4.30,2.10,-4.13]]},{kind:'electrical',points:['AnchorElectronics',[1.48,.50,-3.12],'AnchorCooling']},{kind:'feedback',phases:['sense'],points:['AnchorArrays',[-.5,.75,-2.40],[1.48,.50,-3.12]]},{kind:'heat',phases:['reject'],points:['AnchorElectronics',[3.72,.14,-1.02],'AnchorRadiator']}],
  },
});
export const preload=scene.preload;
export const build=scene.build;
