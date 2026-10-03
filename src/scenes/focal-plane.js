import { illustrated } from './illustrated.js';
const scene=illustrated({
  teaching:'focal-plane',signal:'AnchorArray',signalRadius:.48,
  phaseHighlights:{absorb:'DetectorPackage',integrate:'DetectorPackage',digitize:'WarmReadout'},
  url:'models/focal-plane.glb?v=5',
  camera:{pos:[5.7,6.2,8.7],target:[.5,.1,-.35],min:2,max:25},distance:5.2,
  cameraPhone:{pos:[7,8.5,13]},
  points:{array:'AnchorArray',readout:'AnchorReadout','cold-stage':'AnchorColdStage',shield:'AnchorShield',flex:'AnchorFlex',carrier:'AnchorCarrier','bias-timing':'AnchorBiasTiming','thermal-feedback':'AnchorThermalFeedback'},
  views:{
    array:{pos:[1.7,3.8,4.6],target:[-.65,.5,0]},
    readout:{pos:[3.8,3.2,4.2],target:[2.05,.1,-.1],focus:[2.04,.20,-.1],detailSize:[1.65,.6,2.1],minDistance:2.5},
    'cold-stage':{pos:[1.5,3.2,-5],target:[-.1,.2,-1.2]},
    shield:{pos:[1.4,3.8,4.5],target:[-.65,.7,0]},
    flex:{pos:[2.8,3.3,4.6],target:[.8,.25,.26],focus:[.86,.25,.26],detailSize:[1.85,.7,1.05],minDistance:2.3},
    carrier:{pos:[2.5,2.5,5.6],target:[-.6,-.1,.2]},
    'bias-timing':{pos:[4.1,3.7,5.1],target:[2.04,.32,1.78]},
    'thermal-feedback':{pos:[4.5,3.8,-5.4],target:[2.13,.33,-2.62]},
  },
  labels:[
    {text:['VIDEO','PROCESSOR'],p:[2.11,.253,-.29],size:[.46,.25],mount:{prefix:'WarmReadout_',reach:.25},partIds:['readout']},
    {text:'DETECTOR CARRIER',p:[-.65,-.434,.97],size:[1.24,.15],mount:{prefix:'ColdCarrier_',reach:.15},partIds:['carrier']},
    {text:'BIAS / TIMING CARD',p:[2.04,.060,2.41],size:[1.34,.12],face:'front',mount:{prefix:'BiasTiming_',reach:.2},partIds:['bias-timing']},
    {text:'CRYOCOOLER CONTROLLER',p:[2.13,.12,-3.26],size:[1.56,.19],face:'back',mount:{prefix:'ThermalFeedback_',reach:.25},partIds:['thermal-feedback']},
  ],
  paths:{
    light:[[[-.8,2.7,.15],'AnchorArray']],
    data:[{kind:'analog',points:['AnchorArray',[.2,.52,.28],[.8,.15,.28],[1.5,.18,.28],'AnchorReadout']},{kind:'command',points:['AnchorBiasTiming',[1.17,.48,1.22],'AnchorFlex','AnchorArray']},{kind:'image-data',phases:['digitize','transfer'],points:['AnchorReadout',[2.80,.42,.30],[3.45,.42,.30]]}],
    heat:[
      {kind:'heat',phases:['lift'],points:['AnchorArray',[-.77,.35,-.8],'AnchorColdStage']},
      {kind:'heat',phases:['reject'],points:['AnchorColdStage',[.5,.44,-1.36],[1.4,.4,-1.6],[2.4,1,-1.9]]},
      {kind:'heat',phases:['reject'],points:['AnchorReadout',[2.6,.4,-.8],[2.9,1,-1.4]]},
      {kind:'feedback',phases:['sense'],points:[[-.64,.30,-1],[-.13,.40,-1.66],'AnchorThermalFeedback']},
      {kind:'electrical',points:['AnchorThermalFeedback',[1.08,.25,-2.45],[.95,.21,-1.89],[.97,.20,-1.38]]},

    ],
  },
});
export const preload=scene.preload;
export const build=scene.build;
