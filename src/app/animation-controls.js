import { chip } from '../evidence.js';
import { claimByKey } from '../claims.js';
import { store } from './store.js';
// Scene-local lesson controls. Stage owns camera/inspection safety and invokes
// preparePlayback before this module requests any animated hardware state.
export function mountAnimationControls(host,{getTeaching,preparePlayback,stepTeaching,getAssemblyPresentation=()=>null,setAssemblyView=()=>{},setActivityEnabled=()=>{}}) {
  let teaching=null,unsubscribe=null;
  host.classList.add('animation-controls');
  host.innerHTML='<div class="animation-transport" role="group" aria-label="Teaching animation"><button type="button" class="btn" data-action="play" title="Play the complete sequence in overview">Play sequence</button><button type="button" class="btn" data-action="previous" aria-label="Previous animation step" title="Focus on the previous animation step">← Step</button><button type="button" class="btn" data-action="next" aria-label="Next animation step" title="Focus on the next animation step">Step →</button><button type="button" class="btn" data-action="reset">Reset</button><span class="animation-counter"></span></div><p class="animation-step" aria-live="polite"></p><details class="animation-explanation"><summary>How this step works</summary><p class="animation-description"></p><div class="animation-legend" aria-label="Flow legend"></div><div class="animation-evidence"></div><p class="animation-note"></p></details>';
  host.querySelector('details').open=matchMedia('(min-width:1101px)').matches;
  const assembly=document.createElement('div');assembly.className='assembly-controls';assembly.hidden=true;
  assembly.innerHTML='<span>Electronics</span><div role="group" aria-label="Electronics enclosure view"><button type="button" class="btn" id="assembly-assembled" data-assembly-view="assembled">Assembled</button><button type="button" class="btn" id="assembly-inside" data-assembly-view="inside">Inside</button></div><span class="assembly-note">Illustrative cutaway</span>';
  host.prepend(assembly);
  const buttons=Object.fromEntries([...host.querySelectorAll('[data-action]')].map(b=>[b.dataset.action,b]));
  const title=host.querySelector('.animation-step'),description=host.querySelector('.animation-description'),counter=host.querySelector('.animation-counter'),legend=host.querySelector('.animation-legend'),note=host.querySelector('.animation-note');
  const evidence=host.querySelector('.animation-evidence');let legendKey='',evidenceKey='';
  function render(){
    host.hidden=!teaching;document.body.classList.toggle('activity-playing',!!teaching?.state().playing);if(!teaching)return;
    const presentation=getAssemblyPresentation();assembly.hidden=!presentation;
    if(presentation){const view=presentation.capture().view;for(const button of assembly.querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.assemblyView===view));assembly.querySelector('.assembly-note').textContent=view==='inside'?'Covers hidden · as drawn':'Choose Inside to see boards';}
    const state=teaching.state();host.dataset.inspection=String(state.inspection);buttons.play.textContent=state.playing?(state.repeating?'Pause & inspect':'Pause sequence'):state.progress===1&&state.index===state.total-1?'Replay sequence':'Play sequence';
    buttons.play.title=state.playing?'Pause motion and reveal the numbered components':'Play the complete sequence in overview';
    buttons.play.setAttribute('aria-pressed',String(state.playing));counter.textContent=`${state.index+1} / ${state.total}`;
    title.textContent=state.step.title;description.textContent=state.step.body;
    const keys=state.step.claimKeys||[],claimKey=keys.join(',');if(claimKey!==evidenceKey){evidenceKey=claimKey;evidence.innerHTML=keys.map(key=>{const claim=claimByKey(store.M,store.C,key);return claim?chip(claim.basis,key,claim.label):'';}).join('');}
    note.textContent=state.inspection?'Inspection pose. Play or step to follow the sequence. All animation timing is illustrative.':`${state.repeating?'Repeating activity illustration. ':''}${state.note||'Illustrative sequence; no real sensor timing, signal level, or throughput.'}`;
    const key=(state.legend||[]).map(v=>v.kind).join(',');if(key!==legendKey){legendKey=key;legend.replaceChildren();for(const item of state.legend||[]){const entry=document.createElement('span'),swatch=document.createElement('i');entry.dataset.kind=item.kind;swatch.style.background=item.color;entry.append(swatch,document.createTextNode(item.label));legend.append(entry);}}
  }
  async function act(event){
    const assemblyView=event.target.closest('[data-assembly-view]')?.dataset.assemblyView;
    if(assemblyView){setAssemblyView(assemblyView);render();return;}
    const action=event.target.closest('[data-action]')?.dataset.action;if(!teaching||!action)return;
    const active=teaching;
    if(action==='play'&&active.state().playing){setActivityEnabled(false);active.pause();render();return;}
    if(action==='reset'){setActivityEnabled(false);stepTeaching(0,{reset:true});render();return;}
    if(action==='previous'||action==='next'){setActivityEnabled(false);stepTeaching(action==='previous'?-1:1);render();return;}
    await preparePlayback();if(getTeaching()!==active)return;
    if(action==='play'){setActivityEnabled(true);const s=active.state();if(s.index===s.total-1&&s.progress===1)active.reset();active.play();}
    render();
  }
  host.addEventListener('click',act);
  return {sync(){const next=getTeaching();if(next!==teaching){unsubscribe?.();teaching=next;unsubscribe=teaching?.subscribe(render);}render();},dispose(){unsubscribe?.();host.removeEventListener('click',act);host.replaceChildren();}};
}
