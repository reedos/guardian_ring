import {store,on} from './store.js';
import {getTeaching,onTick} from './stage.js';

const orbitLegends={
  light:[['#e6ba82','Infrared / illustrative GEO patches'],['#659cbb','Atmosphere context']],
  data:[['#bed5ff','Radio downlink'],['#a6f35a','GEO crosslink']],
  heat:[['#ffd06b','Sunlight'],['#f6a1b8','Thermal radiation']],
};
const shortLabels={'optical-connection':'Optical roles · dashed','image-data':'Image data',radiation:'Thermal radiation',electrical:'Electrical power',feedback:'Measured feedback',command:'Command / timing',analog:'Analog measurement',charge:'Detector signal',timeline:'Event order',light:'Light',heat:'Heat transfer',radio:'Radio signal'};

// Every current asset is schematic. Giving these meshes a numeric scale bar
// would imply dimensions they do not possess. Retain IF's always-visible key
// and explain scale honestly until a dimensioned asset is introduced.
export function mountSceneKey(){
  const legend=document.createElement('div');legend.id='legend';legend.className='hud br scene-key';legend.setAttribute('aria-label','Illustrative visual key');
  document.getElementById('view').append(legend);
  // Short screens give the scale note and key their own control row, clear
  // of the molecular diagrams and detector face.
  const view=document.getElementById('view'),note=document.getElementById('scene-note');
  const dock=document.createElement('div');dock.className='compact-scene-key';dock.hidden=true;view.after(dock);
  const compact=matchMedia('(max-width:760px) and (max-height:640px) and (orientation:portrait), (max-width:700px) and (max-height:400px) and (orientation:landscape)');
  const placeKey=()=>{dock.hidden=!compact.matches;(compact.matches?dock:view).append(note,legend);};
  compact.addEventListener('change',placeKey);placeKey();
  let previous='';
  const sync=()=>{
    const id=store.C.SCENES[store.ui.scene]?.id,mode=store.ui.mode;
    const lesson=getTeaching()?.state(),key=[id,mode,lesson?.step.id,lesson?.inspection].join(':');if(key===previous)return;previous=key;
    const entries=id==='orbits'?orbitLegends[mode]:(lesson?.visibleLegend||[]).map(item=>[item.color,shortLabels[item.kind]||item.label]);
    legend.replaceChildren();
    for(const [color,label] of entries||[]){const entry=document.createElement('span'),swatch=document.createElement('i');entry.className='legend-item';swatch.className='sw';swatch.style.setProperty('--c',color);entry.append(swatch,document.createTextNode(label));legend.append(entry);}
  };
  on('scene',sync);on('mode',sync);on('scene-settings',sync);
  const untick=onTick(sync);sync();
  return {dispose(){untick();compact.removeEventListener('change',placeKey);view.append(note);legend.remove();dock.remove();}};
}
