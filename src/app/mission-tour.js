import * as stage from './stage.js';
import { store, on } from './store.js';
import { teachingFocus } from '../scenes/teaching-focus.js';
import { ORBIT_EXAMPLES } from '../orbit-examples.js';
import { chip } from '../evidence.js';
import { claimByKey } from '../claims.js';
import { missionEntry } from './mission-entry.js';

// These chapters order an explanation. They are not an operations schedule:
// collecting, transferring, controlling and rejecting heat can happen together.
export const MISSION_CHAPTERS = [
  { scene:'orbits',mode:'light',follow:'geo',title:'Ride with GEO',body:'Earth and the spacecraft turn together. The same region stays below a geostationary satellite.',duration:8 },
  { scene:'orbits',mode:'light',follow:'leo',title:'A faster view of Earth',body:'A low-orbit spacecraft moves across the rotating Earth. The point below it is a geometric reference, not a sensor footprint.',duration:8 },
  { scene:'plume',mode:'light',title:'Begin with infrared light',body:'A source emits infrared radiation. These molecular examples explain emission, not a particular launch or its brightness.' },
  { scene:'satellite',mode:'light',title:'The spacecraft supports the observation',body:'The instrument collects light while the spacecraft supplies pointing, power, computing, and communication interfaces.' },
  { scene:'payload',mode:'light',title:'Follow the instrument inside',body:'Trace collection, detection, readout, and digitization through an integrated representative instrument.' },
  { scene:'pixel',mode:'light',title:'See the signal take shape',body:'Absorption and readout turn an optical observation into an electrical measurement. The highlights represent stages, not measured signal levels.' },
  { scene:'payload',mode:'data',title:'The instrument assembles its data',body:'Commands and measured feedback have their own directions. Image data passes through processing and the spacecraft interface.' },
  { scene:'payload',mode:'heat',title:'Keep the instrument operating',body:'Electrical power, temperature feedback, and heat rejection support observation. These tasks can continue alongside data collection.' },
  { scene:'orbits',mode:'data',follow:'geo',title:'Send the observation to Earth',body:'A radio link carries information between spacecraft and ground. Traveling symbols show direction; their speed and spacing are illustrative.',duration:8 },
  { scene:'ground',mode:'data',title:'Receive, process, and distribute',body:'The receiver recovers data for processing, operator displays, and storage. This layout supplies no operational warning timeline.' },
];

export function mountMissionTour({openFocusDemo=()=>{}}={}) {
  const entry=missionEntry(location.href,{getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)});
  const owner=Symbol('guided-mission');
  const host=document.createElement('section');host.className='mission-tour';host.id='mission-tour';host.setAttribute('aria-label','Guided mission');
  host.innerHTML='<div class="mission-prompt"><button type="button" class="btn go" data-mission="start">Watch the mission <span aria-hidden="true">→</span></button><span>From orbit to the ground · guided illustration</span></div><div class="mission-active-panel" hidden><div class="mission-heading"><span class="eyebrow">Illustrative mission</span><span class="mission-count"></span></div><div class="mission-copy" aria-live="polite"><strong class="mission-title"></strong><p class="mission-body"></p><p class="mission-phase"></p></div><div class="mission-step-controls" role="group" aria-label="Steps in this chapter" hidden><button type="button" class="btn" data-mission="step-previous" aria-label="Previous mission step">← Step</button><span class="mission-step-count" aria-live="polite"></span><button type="button" class="btn" data-mission="step-next" aria-label="Next mission step">Step →</button></div><details class="mission-explanation"><summary>About this step</summary><p class="mission-description"></p><div class="animation-legend mission-legend" aria-label="Flow legend"></div><div class="animation-evidence mission-evidence"></div><p class="mission-detail-note"></p></details><div class="mission-progress" aria-hidden="true"><i></i></div><div class="mission-transport" role="group" aria-label="Mission playback"><button type="button" class="btn" data-mission="play">Pause</button><button type="button" class="btn" data-mission="previous">← Chapter</button><button type="button" class="btn" data-mission="next">Chapter →</button><button type="button" class="btn" data-mission="stop">Explore this view</button><label><input type="checkbox" data-mission="repeat"> Repeat</label></div><p class="mission-note">Presentation time is compressed. Hardware, routes, and activity are representative; the ordered explanation separates tasks that may overlap.</p></div>';
  document.getElementById('viewer').insertBefore(host,document.getElementById('animation-controls'));
  const find=selector=>host.querySelector(selector),prompt=find('.mission-prompt'),panel=find('.mission-active-panel');
  const focusDemoButton=document.createElement('button');focusDemoButton.type='button';focusDemoButton.className='btn';focusDemoButton.dataset.mission='focus';focusDemoButton.textContent='See light focus';focusDemoButton.setAttribute('aria-haspopup','dialog');focusDemoButton.hidden=true;find('.mission-copy').append(focusDemoButton);
  focusDemoButton.addEventListener('click',openFocusDemo);
  const explanation=find('.mission-explanation'),stepControls=find('.mission-step-controls');
  const legend=find('.mission-legend'),evidence=find('.mission-evidence');let explanationKey='';
  const menuStart=document.createElement('button');menuStart.type='button';menuStart.id='mission-launch';menuStart.className='mm-item';menuStart.textContent='Watch the mission';
  document.getElementById('mm-tools-title').after(menuStart);
  menuStart.addEventListener('click',()=>void start());
  const orbitFact=document.createElement('p');orbitFact.className='orbit-follow-fact';orbitFact.hidden=true;
  find('.mission-copy').after(orbitFact);let factFamily=null;
  let active=false,playing=false,loading=false,generation=0,index=0,elapsed=0,phase=-1,cameraHold=false,mutating=false,lastProgress=-1,completed=false,failed=false;
  const state=()=>({active,playing,loading,index,total:MISSION_CHAPTERS.length,phase,completed,failed,elapsed,chapter:MISSION_CHAPTERS[index]});
  const blocked=()=>stage.activitySuspended();
  const mutate=fn=>{const previous=mutating;mutating=true;try{return fn();}finally{mutating=previous;}};
  function describeStep(chapter,lesson) {
    const key=`${index}:${lesson?.index??'orbit'}`;if(key===explanationKey)return;
    explanationKey=key;
    const orbital=chapter.follow;
    find('.mission-description').textContent=orbital
      ? 'The follow camera magnifies the representative spacecraft. The cross marks its geometric nadir; the trace records that point on the rotating Earth. It does not show a sensor footprint. Moving symbols identify light or radio paths, with separate illustrative drawing and playback scales.'
      : lesson.step.body;
    const types=orbital
      ? chapter.mode==='data'?[{kind:'radio',label:'Radio downlink',color:'#bed5ff'},{kind:'crosslink',label:'Separate GEO crosslink',color:'#a6f35a'}]:[{kind:'light',label:'Infrared light',color:'#e6ba82'}]
      : lesson.legend||[];
    legend.replaceChildren();
    for(const item of types){const entry=document.createElement('span'),swatch=document.createElement('i');entry.dataset.kind=item.kind;swatch.style.background=item.color;entry.append(swatch,document.createTextNode(item.label));legend.append(entry);}
    const keys=orbital?[`orbit-example:${orbital}:orbitSpeedKmS`,`orbit-example:${orbital}:altitudeKm`]:lesson.step.claimKeys||[];
    evidence.innerHTML=keys.map(key=>{const claim=claimByKey(store.M,store.C,key);return claim?chip(claim.basis,key,claim.label):'';}).join('');
    evidence.hidden=!evidence.childElementCount;
    find('.mission-detail-note').textContent=orbital?'The physical circular-orbit example is independent of the current Scenario.':lesson.note||'Animation timing and paths are illustrative.';
  }
  function render() {
    prompt.hidden=active;panel.hidden=!active;document.body.classList.toggle('mission-active',active);
    if(!active)return;
    const chapter=MISSION_CHAPTERS[index];
    focusDemoButton.hidden=chapter.scene!=='payload'||chapter.mode!=='light';
    orbitFact.hidden=!chapter.follow;
    if(chapter.follow&&factFamily!==chapter.follow){const family=chapter.follow,example=ORBIT_EXAMPLES[family];factFamily=family;orbitFact.innerHTML=`${example.claims.orbitSpeedKmS[1]} ${chip('derived',`orbit-example:${family}:orbitSpeedKmS`,`${family.toUpperCase()} teaching speed`)} · ${example.claims.altitudeKm[1]} altitude ${chip('derived',`orbit-example:${family}:altitudeKm`,'teaching altitude')}<span>Physical circular-orbit example; drawing and playback scales are illustrative.</span>`;}
    find('.mission-count').textContent=`${index+1} / ${MISSION_CHAPTERS.length}`;
    find('.mission-title').textContent=chapter.title;find('.mission-body').textContent=chapter.body;
    find('[data-mission="play"]').textContent=failed?'Retry':completed?'Replay':playing?'Pause':'Play';
    find('[data-mission="play"]').setAttribute('aria-pressed',String(playing));
    const focused=document.activeElement;
    find('[data-mission="previous"]').disabled=loading||index===0;
    find('[data-mission="next"]').disabled=loading||index===MISSION_CHAPTERS.length-1;
    const lesson=!chapter.follow&&!loading&&!failed?stage.getTeaching()?.state():null;
    stepControls.hidden=!lesson;
    find('[data-mission="step-previous"]').disabled=!lesson||lesson.index===0;
    find('[data-mission="step-next"]').disabled=!lesson||lesson.index===lesson.total-1;
    find('.mission-step-count').textContent=lesson?`Step ${lesson.index+1} / ${lesson.total}`:'';
    explanation.hidden=loading||failed;
    if(!explanation.hidden&&(chapter.follow||lesson))describeStep(chapter,lesson);
    if(host.contains(focused)&&focused.disabled)find('[data-mission="play"]').focus();
  }
  function focusPhase({progress=playing?0:.72}={}) {
    const teaching=stage.getTeaching();if(!teaching)return;
    const lesson=teaching.state(),chapter=MISSION_CHAPTERS[index];
    phase=lesson.index;cameraHold=true;
    mutate(()=>{
      teaching.pause();
      const id=teachingFocus(chapter.scene,chapter.mode,lesson.step.id);
      if(id)stage.select(id,true,{reveal:false});else stage.overview();
      // A paused chapter or manual step shows a useful stationary pose. During
      // playback the phase starts at its beginning after the camera settles.
      teaching.seek(phase,progress);
    });
    find('.mission-phase').textContent=lesson.step.title;
    render();
  }
  function step(direction) {
    if(!active||loading||failed||MISSION_CHAPTERS[index].follow)return;
    const teaching=stage.getTeaching();if(!teaching)return;
    const lesson=teaching.state(),next=Math.max(0,Math.min(lesson.total-1,lesson.index+direction));
    playing=false;completed=false;stage.setActivityEnabled(false);teaching.pause();
    teaching.seek(next,.72);focusPhase({progress:.72});
  }
  async function enter(next) {
    const token=++generation;index=next;loading=true;completed=false;failed=false;elapsed=0;phase=-1;cameraHold=false;lastProgress=-1;render();
    const chapter=MISSION_CHAPTERS[index];
    try {
      await stage.go(chapter.scene,{record:false,owner,resetPane:false});
      if(token!==generation||!active)return;
      if(store.C.SCENES[stage.destination()]?.id!==chapter.scene){stop();return;}
      mutate(()=>{
        stage.setMode(chapter.mode,{activity:false});
        if(chapter.follow){
          stage.setOrbitFollow(chapter.follow);cameraHold=true;
          find('.mission-phase').textContent=chapter.follow==='geo'?'An Earth-facing, co-rotating view':'Follow the changing ground beneath the spacecraft';
        }else{
          stage.preparePlayback();stage.getTeaching().seek(0,0);focusPhase();
        }
      });
    } catch(error) {
      if(token===generation){playing=false;failed=true;find('.mission-phase').textContent='This chapter could not load. Retry, choose another chapter, or explore the view.';}
      console.error(error);
    } finally {if(token===generation){loading=false;render();}}
  }
  function stop({focus=false}={}) {
    if(!active)return;
    stage.cancelNavigation(owner);
    generation++;active=false;playing=false;loading=false;cameraHold=false;
    mutate(()=>{stage.getTeaching()?.pause();stage.setOrbitFollow(null);stage.built[stage.destination()]?.setMotion?.(false);});
    render();if(focus)document.getElementById('part-select').focus({preventScroll:true});
  }
  async function start() {
    const url=new URL(location.href);url.searchParams.delete('mission');history.replaceState(null,'',url);
    explanation.open=false;explanationKey='';active=true;playing=!stage.reduced;stage.setActivityEnabled(playing);const opening=enter(0);find('[data-mission="play"]').focus();await opening;
  }
  function pause({remember=true}={}) {playing=false;if(remember)stage.setActivityEnabled(false);stage.getTeaching()?.pause();stage.built[stage.destination()]?.setMotion?.(false);render();}
  function play() {
    stage.setActivityEnabled(true);
    explanation.open=false;
    if(failed){playing=true;void enter(index);return;}
    if(completed){playing=true;void enter(0);return;}
    playing=true;
    if(!loading&&!cameraHold){stage.getTeaching()?.play();stage.built[stage.destination()]?.setMotion?.(true);}
    render();
  }
  function advance() {
    if(index<MISSION_CHAPTERS.length-1){void enter(index+1);return;}
    if(find('[data-mission="repeat"]').checked){void enter(0);return;}
    completed=true;pause({remember:false});find('.mission-phase').textContent='Mission walkthrough complete. Explore this view or replay the journey.';
  }
  host.addEventListener('click',event=>{
    const action=event.target.closest('[data-mission]')?.dataset.mission;if(!action)return;
    if(action==='start')void start();
    else if(action==='stop')stop({focus:true});
    else if(action==='play')playing?pause():play();
    else if(action==='previous'&&index>0)void enter(index-1);
    else if(action==='next'&&index<MISSION_CHAPTERS.length-1)void enter(index+1);
    else if(action==='step-previous')step(-1);
    else if(action==='step-next')step(1);
  });
  // Reading a changing paragraph should not require racing the lesson clock.
  explanation.addEventListener('toggle',()=>{if(explanation.open&&active&&playing)pause();});
  // An explicit exploration action immediately gives the controls back to the
  // reader. Evidence, quality and panel controls may be used without ending it.
  document.addEventListener('click',event=>{
    if(!active||host.contains(event.target))return;
    if(event.target.closest('[data-level],[data-mode],#parts button,#pins button,#card-prev,#card-next,#reset-view,#part-play,#learning-next,#back-out,#card-drill'))stop();
    else if(event.target.closest('[data-pane="scenario"],#learning-try,[data-choice]'))pause();
  },true);
  document.getElementById('part-select').addEventListener('change',()=>stop());
  document.addEventListener('keydown',event=>{
    if(!active||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||blocked())return;
    if(event.key==='Escape'){stop({focus:true});event.preventDefault();return;}
    if(event.target.closest?.('input,select,textarea,button,a[href],summary,[role="tablist"],[contenteditable="true"]'))return;
    if(stage.stageActive()&&(/^[1-6ldh]$/i.test(event.key)||['ArrowLeft','ArrowRight'].includes(event.key)))stop();
  });
  stage.controls.addEventListener('start',()=>stop());
  on('navigation-request',request=>{if(active&&request.owner!==owner)stop();});
  on('part-inspect',()=>{if(active&&!mutating)stop();});
  on('mode',()=>{if(active&&!mutating)stop();});
  const untick=stage.onTick((time,dt)=>{
    if(!active||loading||failed||blocked()||stage.isBusy())return;
    if(cameraHold){
      if(stage.isCameraMoving())return;
      cameraHold=false;
      if(playing){stage.getTeaching()?.play();stage.built[stage.destination()]?.setMotion?.(true);}
      else stage.built[stage.destination()]?.setMotion?.(false);
    }
    const chapter=MISSION_CHAPTERS[index],teaching=stage.getTeaching();
    let progress=0;
    if(chapter.follow){if(playing&&dt<=1)elapsed+=dt;progress=Math.min(1,elapsed/chapter.duration);}
    else {
      const lesson=teaching.state();
      if(lesson.index!==phase){focusPhase();return;}
      progress=(lesson.index+lesson.progress)/lesson.total;
    }
    // Avoid mutating DOM on every rendered frame.
    const quantized=Math.floor(progress*100);if(quantized!==lastProgress){lastProgress=quantized;find('.mission-progress i').style.width=`${quantized}%`;}
    if(playing&&progress>=1)advance();
  });
  let requested=entry.requested,remembered=false;
  const cancelEntry=()=>{requested=false;};
  document.addEventListener('pointerdown',cancelEntry,{capture:true});document.addEventListener('keydown',cancelEntry,{capture:true});
  const unready=stage.onTick(()=>{
    if(stage.isBusy()||stage.destination()<0)return;
    if(!remembered){remembered=true;if(!entry.remember()&&entry.automatic)requested=false;}
    if(requested&&!blocked()){requested=false;void start();}
  });
  return {state,start,stop,pause,play,step,next:()=>index<MISSION_CHAPTERS.length-1?enter(index+1):undefined,previous:()=>index>0?enter(index-1):undefined,dispose(){stop();untick();unready();document.removeEventListener('pointerdown',cancelEntry,{capture:true});document.removeEventListener('keydown',cancelEntry,{capture:true});host.remove();menuStart.remove();}};
}
