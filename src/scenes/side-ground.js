import { illustrated } from './illustrated.js';
const scene=illustrated({
  teaching:'ground',
  mechanisms:[{node:'GroundAntennaElevation',axis:[1,0,0],range:.10,motion:'pointing'}],
  // Use the authored front faces, feed, and display glass as restrained route
  // destinations. Furniture and cabinet bodies retain their physical finish.
  // These responses are explanatory, not equipment health or telemetry.
  phaseHighlights:{
    receive:[{role:'Receive_—_Folded_blanket_edging',kind:'radio',intensity:.06},{role:'Receiver_—_Blank_illustrative_monitor_glass',kind:'radio',intensity:.09}],
    readout:{role:'Process_—_Machined_aluminum',kind:'image-data',intensity:.035},
    transfer:{role:'Archive_—_Machined_aluminum',kind:'image-data',intensity:.04},
    power:{role:'Power_—_Blank_illustrative_monitor_glass',kind:'electrical',intensity:.09},
    reject:[{role:'Process_—_Machined_aluminum',kind:'heat',intensity:.025},{role:'Archive_—_Machined_aluminum',kind:'heat',intensity:.025}],
  },
  activityDisplay:{role:'Operations',materialName:'Blank illustrative monitor glass'},
  lessonNote:'Illustrative event. The antenna demonstrates a pointing adjustment, not a real satellite track. Abstract tiles and the final ALERT demonstrate received data, processing, and notification. They are not a real event, site, operational timeline, threshold, sensor format, or detection performance.',
  url:'models/ground.glb?v=3',
  camera:{pos:[9.5,8.5,13],target:[0,.9,1.15],min:3,max:34},
  cameraPhone:{pos:[10,9.38,14.63]},distance:7,
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
    light:[{kind:'radio',points:[[-4.5,4.5,1.5],'AnchorReceive']}],
    data:[
      {kind:'radio',phases:['receive'],points:['AnchorReceive',[-3.5,1.10,2.5],'AnchorReceiver']},
      {kind:'image-data',phases:['readout'],points:['AnchorReceiver',[-1.5,1.10,2.1],'AnchorProcess']},
      {kind:'image-data',points:['AnchorProcess',[.6,1.20,.6],[2.2,1.20,.6],'AnchorOperations']},
      {kind:'image-data',start:.16,points:['AnchorProcess',[.7,1.18,1.8],'AnchorArchive']},
    ],
    heat:[{kind:'electrical',points:['AnchorPower',[3.3,.35,3.1],[3.3,.35,.6],'AnchorOperations']},{kind:'heat',phases:['reject'],points:['AnchorProcess',[-.4,2.9,.3],[-.4,3.5,.3]]},{kind:'heat',phases:['reject'],points:['AnchorArchive',[.4,2.6,2.7],[.4,3.1,2.7]]}],
  },
});
export const preload=scene.preload;
export const build=scene.build;
