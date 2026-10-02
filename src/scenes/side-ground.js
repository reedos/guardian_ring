import { illustrated } from './illustrated.js';
const scene=illustrated({
  url:'models/ground.glb?v=2',
  camera:{pos:[9.5,8.5,13],target:[0,.9,1.15],min:3,max:34},
  cameraPhone:{pos:[12.5,11.5,18]},distance:7,
  points:{receive:'AnchorReceive',process:'AnchorProcess',operations:'AnchorOperations',receiver:'AnchorReceiver',archive:'AnchorArchive',power:'AnchorPower'},
  views:{
    receive:{pos:[-6.6,5.2,5.7],target:[-2.65,1.95,.15]},
    process:{pos:[2.9,5.5,5.7],target:[-.35,1.45,.13]},
    operations:{pos:[6.5,4.1,5.9],target:[2.20,1.38,.22]},
    receiver:{pos:[-5.8,3.6,8.7],target:[-2.65,1.355,3.30]},
    archive:{pos:[3.3,3.8,8.8],target:[-.35,1.735,3.30]},
    power:{pos:[6.0,3.6,9.2],target:[2.20,1.065,3.90]},
  },
  labels:[
    {text:'RECEIVER',p:[-2.65,1.355,3.271],size:[.73,.12],face:'front',partIds:['receiver']},
    {text:'MISSION ARCHIVE',p:[-.35,1.735,3.271],size:[.73,.12],face:'front',partIds:['archive']},
    {text:'UPS / DISTRIBUTION',p:[2.20,1.065,3.871],size:[.73,.12],face:'front',partIds:['power']},
    {text:'PROCESSING SERVER',p:[-.35,2.385,.04],size:[.73,.12],face:'front',partIds:['process']},
  ],
  paths:{
    light:[[[ -4.5,4.5,1.5],'AnchorReceive']],
    data:[['AnchorReceive',[-3.5,.35,2.5],'AnchorReceiver'],['AnchorReceiver',[-1.5,.30,2.1],'AnchorProcess'],['AnchorProcess',[.6,.4,.6],[2.2,.4,.6],'AnchorOperations'],['AnchorProcess',[.7,.25,1.8],'AnchorArchive']],
    heat:[['AnchorPower',[3.3,.35,3.1],[3.3,.35,.6],'AnchorOperations'],['AnchorProcess',[-.4,2.9,.3],[-.4,3.5,.3]],['AnchorArchive',[.4,2.6,2.7],[.4,3.1,2.7]]],
  },
});
export const preload=scene.preload;
export const build=scene.build;
