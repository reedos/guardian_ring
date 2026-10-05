import { chip } from '../evidence.js';
import { claimByKey } from '../claims.js';
import { store } from './store.js';
// Scene-local lesson controls. Stage owns camera/inspection safety and invokes
// preparePlayback before this module requests any animated hardware state.
export function mountAnimationControls(host,{getTeaching,getAssemblyPresentation=()=>null,setAssemblyView=()=>{},openFocusDemo=()=>{}}) {
  let teaching=null,unsubscribe=null;
  host.classList.add('animation-controls');
  host.innerHTML='<span class="animation-step" aria-live="polite"></span><details class="animation-explanation"><summary>How this part works</summary><p class="animation-description"></p><div class="animation-legend" aria-label="Flow legend"></div><div class="animation-evidence"></div><p class="animation-note"></p></details>';
  const assembly=document.createElement('div');assembly.className='assembly-controls';assembly.hidden=true;
  assembly.innerHTML='<span>Electronics</span><div role="group" aria-label="Electronics enclosure view"><button type="button" class="btn" id="assembly-assembled" data-assembly-view="assembled">Assembled</button><button type="button" class="btn" id="assembly-inside" data-assembly-view="inside">Inside</button></div><span class="assembly-note">Illustrative cutaway</span>';
  host.prepend(assembly);
  const focusButton=document.createElement('button');focusButton.type='button';focusButton.className='btn focus-demo-open';focusButton.textContent='See light focus';focusButton.hidden=true;focusButton.setAttribute('aria-haspopup','dialog');
  host.append(focusButton);focusButton.addEventListener('click',openFocusDemo);
  const title=host.querySelector('.animation-step'),description=host.querySelector('.animation-description'),legend=host.querySelector('.animation-legend'),note=host.querySelector('.animation-note');
  const evidence=host.querySelector('.animation-evidence');let legendKey='',evidenceKey='';
  function render(){
    host.hidden=!teaching;title.hidden=!teaching;document.body.classList.toggle('activity-playing',!!teaching?.state().playing);if(!teaching)return;
    const presentation=getAssemblyPresentation();assembly.hidden=!presentation;
    if(presentation){const view=presentation.capture().view;for(const button of assembly.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.assemblyView===view));assembly.querySelector('.assembly-note').textContent=view==='inside'?'Covers hidden · as drawn':'Choose Inside to see boards';}
    const state=teaching.state();host.dataset.inspection=String(state.inspection);
    focusButton.hidden=store.C.SCENES[store.ui.scene]?.id!=='payload'||state.mode!=='light';
    title.textContent=state.inspection?'Choose a part. Next shows its activity.':state.step.title;description.textContent=state.step.body;
    const keys=state.step.claimKeys||[],claimKey=keys.join(',');if(claimKey!==evidenceKey){evidenceKey=claimKey;evidence.innerHTML=keys.map(key=>{const claim=claimByKey(store.M,store.C,key);return claim?chip(claim.basis,key,claim.label):'';}).join('');}
    note.textContent=state.inspection?'Press Next to inspect a part and play its activity once. Animation timing is illustrative.':`${state.repeating?'Repeating activity illustration. ':''}${state.note||'Illustrative sequence; no real sensor timing, signal level, or throughput.'}`;
    const key=(state.legend||[]).map(v=>v.kind).join(',');if(key!==legendKey){legendKey=key;legend.replaceChildren();for(const item of state.legend||[]){const entry=document.createElement('span'),swatch=document.createElement('i');entry.dataset.kind=item.kind;swatch.style.background=item.color;entry.append(swatch,document.createTextNode(item.label));legend.append(entry);}}
  }
  function act(event){
    const assemblyView=event.target.closest('[data-assembly-view]')?.dataset.assemblyView;
    if(assemblyView){setAssemblyView(assemblyView);render();}
  }
  host.addEventListener('click',act);
  return {sync(){const next=getTeaching();if(next!==teaching){unsubscribe?.();teaching=next;unsubscribe=teaching?.subscribe(render);}render();},dispose(){unsubscribe?.();host.removeEventListener('click',act);host.replaceChildren();}};
}
