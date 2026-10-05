import {CINEMATIC_LESSONS} from '../cinematic-lessons.js';
import {CINEMATIC_ROWS} from '../cinematic-evidence.js';
import {BASIS,CALCS,ASSUMPTIONS} from '../evidence.js';
import {SOURCES} from '../sources.js';
import {diagramSurface} from './cinematic-drawing.js';
import {RENDERERS} from './cinematic-renderers.js';
import {prepareLessonEarth,drawGeo} from './cinematic-earth.js';
import {smooth,between} from '../model/cinematic-physics.js';

export function mountCinematicDemo({beforeOpen=()=>{}}={}){
  const dialog=document.createElement('dialog');dialog.id='cinematic-demo';dialog.className='focus-demo cinematic-demo';dialog.setAttribute('aria-labelledby','cinematic-title');
  dialog.innerHTML=`<header><div><p class="eyebrow"></p><h2 id="cinematic-title"></h2></div><button type="button" class="btn" data-cinematic="close">Back to scene</button></header>
    <p class="cinematic-intro">Press Play. The lesson guides itself. Drag the diagram to look around.</p>
    <canvas tabindex="0" aria-describedby="cinematic-caption"></canvas>
    <div class="cinematic-progress" aria-hidden="true"><i></i></div>
    <div class="cinematic-caption" id="cinematic-caption" role="status"><h3></h3><p></p></div>
    <div class="focus-transport"><button type="button" class="btn" data-cinematic="play">Play</button><button type="button" class="btn" data-cinematic="replay">Replay</button><span class="cinematic-time"></span></div>
    <p class="cinematic-basis">Assumed presentation · schematic geometry, synthetic data, illustrative timing.</p>
    <details><summary>Evidence, equations and limits</summary><div class="cinematic-evidence"></div></details>`;
  document.body.append(dialog);
  const canvas=dialog.querySelector('canvas'),c=canvas.getContext('2d'),play=dialog.querySelector('[data-cinematic="play"]'),details=dialog.querySelector('details'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let id='pixel',elapsed=0,playing=false,last=null,frame=0,yaw=0,pitch=0,drag=null,returnFocus=null,phase=-1,earth=null,disposed=false,suspended=false;
  let earthPromise=null;
  const state=()=>({open:dialog.open,id,elapsed,progress:elapsed/CINEMATIC_LESSONS[id].duration,playing,yaw,pitch,phase,reduced:reduced.matches,suspended});
  function evidence(){
    const host=dialog.querySelector('.cinematic-evidence');host.replaceChildren();
    for(const key of [...CINEMATIC_LESSONS[id].evidence,'presentation','inputs']){
      const [label,value,basis,ev]=CINEMATIC_ROWS[key],section=document.createElement('section'),title=document.createElement('h4');title.textContent=`${BASIS[basis].short} · ${label}`;section.append(title);
      const body=document.createElement('p');body.textContent=value;section.append(body);
      for(const description of [ev.calc&&CALCS[ev.calc]?.how,ev.assume&&ASSUMPTIONS[ev.assume]?.why].filter(Boolean)){const p=document.createElement('p');p.textContent=description;section.append(p);}
      for(const [sourceId,where] of ev.refs||[]){const source=SOURCES[sourceId];if(!source||source.unchecked)continue;const p=document.createElement('p'),a=document.createElement('a');a.href=source.url;a.target='_blank';a.rel='noopener';a.textContent=`${source.publisher}: ${source.title}`;p.append(a,document.createTextNode(` — ${where}`));section.append(p);}
      host.append(section);
    }
    if(['geo','eclipse'].includes(id)){const p=document.createElement('p');p.textContent='Earth imagery: NASA Earth Observatory historical Blue Marble, January 2004. Reuses the project’s credited GLB texture; this is not current weather.';host.append(p);}
  }
  function draw(){
    if(!dialog.open||!c)return;
    const lesson=CINEMATIC_LESSONS[id],p=Math.min(1,elapsed/lesson.duration),r=canvas.getBoundingClientRect(),w=Math.max(1,r.width),h=Math.max(1,r.height),ratio=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*ratio)||canvas.height!==Math.round(h*ratio)){canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);}
    c.setTransform(ratio,0,0,ratio,0,0);c.clearRect(0,0,w,h);
    const glow=c.createRadialGradient(w*.35,h*.45,0,w*.35,h*.45,w*.8);glow.addColorStop(0,'#142d3b');glow.addColorStop(1,'#030609');c.fillStyle=glow;c.fillRect(0,0,w,h);
    // Fixed stars are a visual reference, never moving with a reaction wheel.
    if(id!=='wheel')for(let i=0;i<75;i++){c.fillStyle=i%4?'#69869755':'#c7dee688';c.fillRect((i*173.21)%w,(i*89.47)%h,i%4?1:1.5,1);}
    const closeup=id==='pixel'?smooth(between(p,.1,.24))*(1-smooth(between(p,.55,.72))):0;
    const d=diagramSurface(c,w,h,p,{yaw,pitch,reduced:reduced.matches||id==='wheel',distance:id==='wheel'?7.5:9-(reduced.matches?0:closeup*1.25),target:[-closeup*.15,closeup*.2,0]});
    if(id==='wheel'){c.save();c.beginPath();c.rect(d.main.x,d.main.y,d.main.w,d.main.h);c.clip();for(let i=0;i<50;i++)d.dot([Math.sin(i*2.4)*6,Math.cos(i*1.2)*5,-6-Math.sin(i)*2],'#78909c',.7);c.restore();}
    if(id==='geo')drawGeo(d,earth);else RENDERERS[id](d,earth);d.finish();
    const next=lesson.starts?lesson.starts.findLastIndex(start=>p>=start):Math.min(lesson.beats.length-1,Math.floor(p*lesson.beats.length));
    if(next!==phase){phase=next;const beat=lesson.beats[next];dialog.querySelector('.cinematic-caption h3').textContent=beat.title;dialog.querySelector('.cinematic-caption p').textContent=beat.body;canvas.setAttribute('aria-label',`${lesson.title}. ${beat.title}. ${beat.body}${id==='downlink'?'':id==='geo'?' Left and right arrows turn the view; Home resets it.':' Arrow keys rotate; Home restores the guided view.'}`);}
    dialog.querySelector('.cinematic-progress i').style.width=`${p*100}%`;
    dialog.querySelector('.cinematic-time').textContent=elapsed>=lesson.duration?'Lesson complete':`${Math.floor(elapsed)} / ${lesson.duration} s · illustrative playback`;
  }
  function tick(time){frame=0;if(!dialog.open||!playing)return;if(!document.hidden&&!suspended&&last!==null){const dt=(time-last)/1000;if(dt>=0&&dt<1)elapsed=Math.min(CINEMATIC_LESSONS[id].duration,elapsed+dt);}last=time;draw();if(elapsed>=CINEMATIC_LESSONS[id].duration){setPlaying(false);return;}frame=requestAnimationFrame(tick);}
  function setPlaying(value){playing=!!value&&dialog.open&&!details.open;last=null;cancelAnimationFrame(frame);frame=0;play.textContent=playing?'Pause':elapsed>=CINEMATIC_LESSONS[id].duration?'Play again':elapsed>0?'Resume':'Play';play.setAttribute('aria-pressed',String(playing));if(playing)frame=requestAnimationFrame(tick);draw();}
  function replay(){elapsed=0;phase=-1;yaw=0;pitch=0;details.open=false;setPlaying(true);}
  const close=()=>dialog.close();
  dialog.addEventListener('click',event=>{const action=event.target.closest('[data-cinematic]')?.dataset.cinematic;if(action==='close')close();if(action==='replay')replay();if(action==='play'){if(elapsed>=CINEMATIC_LESSONS[id].duration)replay();else setPlaying(!playing);}});
  dialog.addEventListener('close',()=>{setPlaying(false);drag=null;returnFocus?.focus({preventScroll:true});});
  dialog.addEventListener('keydown',event=>event.stopPropagation());
  details.addEventListener('toggle',()=>{if(details.open)setPlaying(false);});
  canvas.addEventListener('pointerdown',event=>{if(id==='downlink')return;drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag)return;yaw=Math.max(-.6,Math.min(.6,yaw+(event.clientX-drag.x)*.005));pitch=Math.max(-.5,Math.min(.5,pitch+(event.clientY-drag.y)*.005));drag={x:event.clientX,y:event.clientY};draw();});
  for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>{drag=null;});
  canvas.addEventListener('keydown',event=>{if(id==='downlink'||(id==='geo'&&['ArrowUp','ArrowDown'].includes(event.key))||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key))return;event.preventDefault();if(event.key==='Home'){yaw=0;pitch=0;}else if(event.key==='ArrowLeft'||event.key==='ArrowRight')yaw=Math.max(-.6,Math.min(.6,yaw+(event.key==='ArrowLeft'?-.1:.1)));else pitch=Math.max(-.5,Math.min(.5,pitch+(event.key==='ArrowUp'?-.1:.1)));draw();});
  const visibility=()=>{last=null;},freeze=()=>{suspended=true;last=null;},resume=()=>{suspended=false;last=null;};
  document.addEventListener('visibilitychange',visibility);document.addEventListener('freeze',freeze);document.addEventListener('resume',resume);
  const resize=new ResizeObserver(draw);resize.observe(canvas);reduced.addEventListener('change',draw);
  return {state,open(topic){if(!CINEMATIC_LESSONS[topic])throw new Error('Unknown cinematic lesson');beforeOpen();returnFocus=document.activeElement;id=topic;elapsed=0;phase=-1;yaw=0;pitch=0;details.open=false;const lesson=CINEMATIC_LESSONS[id];dialog.querySelector('h2').textContent=lesson.title;dialog.querySelector('.eyebrow').textContent=lesson.eyebrow;dialog.querySelector('.cinematic-intro').textContent='Press Play. The lesson guides itself.'+(id==='downlink'?'':id==='geo'?' Drag left or right to turn the view.':' Drag the diagram to look around.');evidence();dialog.showModal();setPlaying(false);play.focus();
    if(['geo','eclipse'].includes(id)&&!earthPromise)earthPromise=prepareLessonEarth().then(drawEarth=>{if(disposed)return;earth=drawEarth;draw();}).catch(()=>{if(!disposed)dialog.querySelector('.cinematic-intro').textContent='Earth imagery could not load. The geometry diagram remains available. Press Play to begin.';});
  },close,
  // Deterministic review hook; no seeking control is required in the user interface.
  seek(value){elapsed=Math.max(0,Math.min(CINEMATIC_LESSONS[id].duration,value));phase=-1;last=null;draw();},
  dispose(){disposed=true;close();cancelAnimationFrame(frame);resize.disconnect();reduced.removeEventListener('change',draw);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('freeze',freeze);document.removeEventListener('resume',resume);dialog.remove();}};
}
