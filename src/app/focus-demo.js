import {PerspectiveCamera,Vector3} from 'three';
import {parabolicRay,pointOnFocusRay,focusPulseState} from '../model/ideal-focus.js';

// An explicitly separate, projected 3D mathematical diagram. It uses a 2D
// drawing surface and the site's lesson controls; no second WebGL renderer,
// invented instrument prescription, or frame-dependent physics is introduced.
export function mountFocusDemo({beforeOpen=()=>{}}={}) {
  const dialog=document.createElement('dialog');dialog.id='focus-demo';dialog.className='focus-demo';
  dialog.setAttribute('aria-labelledby','focus-demo-title');
  dialog.innerHTML=`<header><div><p class="eyebrow">Light · ideal geometric optics</p><h2 id="focus-demo-title">A wide mirror. One focus.</h2></div><button class="btn" type="button" data-focus="close">Back to payload</button></header>
    <p>Parallel light from one distant direction reflects toward a common focus. Drag to look around, or focus the diagram and use the arrow keys.</p>
    <canvas tabindex="0" aria-label="Interactive ideal parabolic mirror: parallel incoming rays reflect toward the focal point. Drag to rotate; use Side view for a fixed cross-section."></canvas>
    <div class="focus-legend"><span><i class="focus-ray"></i>Incoming and reflected light</span><span><i class="focus-mirror"></i>Ideal mirror surface</span><span><i class="focus-pixel"></i>Enlarged detector-cell diagram</span></div>
    <div class="focus-transport"><button class="btn" type="button" data-focus="play">Pause</button><button class="btn" type="button" data-focus="step">Advance pulse</button><button class="btn" type="button" data-focus="side">Side view</button><button class="btn" type="button" data-focus="perspective">Perspective</button><label>Light pulse <input type="range" min="0" max="1000" value="0" aria-label="Position of the light pulse"></label></div>
    <p class="focus-status" role="status"></p><details><summary>Calc. geometry · Assumed presentation — evidence and limits</summary><p>The ideal surface is z = (x² + y²)/(4f). Each ray reflects using d′ = d − 2(d·n)n and reaches (0, 0, f). Equal path lengths from the entry plane give equal arrival times at the focus.</p><p><a href="https://science.nasa.gov/learn/basics-of-space-flight/chapter6-5/" target="_blank" rel="noopener">NASA: reflection and prime focus</a> describes this principle and its use in optical telescopes. This drawing is a separate mathematical example, not the payload's optical design.</p><p>Ray count, proportions, cell sizes, glow, false color and playback pace are illustrative. The cells show where a detector would sample an image, not a real array format. Geometric rays meet at an ideal point; diffraction and a real instrument spread the image. Neither that spread nor sensor performance is calculated here.</p></details>`;
  document.body.append(dialog);
  const canvas=dialog.querySelector('canvas'),context=canvas.getContext('2d'),slider=dialog.querySelector('input'),play=dialog.querySelector('[data-focus="play"]'),status=dialog.querySelector('.focus-status');
  const camera=new PerspectiveCamera(39,2,.01,100),target=new Vector3(0,0,1.9);
  const rays=[];
  for(const radius of [.65,1.2,1.65])for(let j=0;j<12;j++){const angle=j*Math.PI/6;rays.push(parabolicRay(radius*Math.cos(angle),radius*Math.sin(angle)));}
  let progress=.3,playing=false,yaw=1.12,pitch=.28,frame=0,last=null,drag=null,returnFocus=null,width=1,height=1,lastPhase='';
  const state=()=>({open:dialog.open,progress,playing,yaw,pitch});
  function project(point){const p=new Vector3(...point).project(camera);return [(p.x+1)*width/2,(1-p.y)*height/2];}
  function stroke(points,color,lineWidth=1,alpha=1,glow=0){
    context.beginPath();points.forEach((p,i)=>{const [x,y]=project(p);if(i)context.lineTo(x,y);else context.moveTo(x,y);});
    context.strokeStyle=color;context.lineWidth=lineWidth;context.globalAlpha=alpha;context.shadowColor=color;context.shadowBlur=glow;context.stroke();context.shadowBlur=0;context.globalAlpha=1;
  }
  function draw(){
    if(!dialog.open||!context)return;
    const ratio=Math.min(devicePixelRatio||1,2),rect=canvas.getBoundingClientRect();width=Math.max(1,rect.width);height=Math.max(1,rect.height);
    if(canvas.width!==Math.round(width*ratio)||canvas.height!==Math.round(height*ratio)){canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);}
    context.setTransform(ratio,0,0,ratio,0,0);context.clearRect(0,0,width,height);
    camera.aspect=width/height;camera.updateProjectionMatrix();
    const distance=width<500?11:9;
    camera.position.set(Math.sin(yaw)*Math.cos(pitch)*distance,Math.sin(pitch)*distance,1.9+Math.cos(yaw)*Math.cos(pitch)*distance);camera.lookAt(target);camera.updateMatrixWorld();
    const background=context.createRadialGradient(width*.47,height*.5,0,width*.47,height*.5,width*.65);background.addColorStop(0,'#10222c');background.addColorStop(1,'#030609');context.fillStyle=background;context.fillRect(0,0,width,height);
    // Wireframe circles and meridians identify the mathematical surface only.
    for(const radius of [.3,.65,1,1.35,1.7]){
      const ring=[];for(let j=0;j<=72;j++){const angle=j*Math.PI/36;ring.push([radius*Math.cos(angle),radius*Math.sin(angle),radius*radius/6]);}stroke(ring,'#88aec1',radius===1.7?1.8:.8,.65);
    }
    for(let j=0;j<16;j++){
      const points=[];for(let k=0;k<=24;k++){const radius=k/24*1.7,angle=j*Math.PI/8;points.push([radius*Math.cos(angle),radius*Math.sin(angle),radius*radius/6]);}stroke(points,'#88aec1',.7,.4);
    }
    // Enlarged cells are a diagram, not obstructing physical hardware. Incoming
    // rays start outside this small diagram so no ray passes through a pixel.
    for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){
      const s=.17,cx=x*.19,cy=y*.19;
      stroke([[cx-s/2,cy-s/2,1.5],[cx+s/2,cy-s/2,1.5],[cx+s/2,cy+s/2,1.5],[cx-s/2,cy+s/2,1.5],[cx-s/2,cy-s/2,1.5]],'#8fd9e8',1,.6);
    }
    const pulseState=focusPulseState(rays,progress),pulse=pulseState.leading;
    for(const ray of rays){
      stroke(ray.points,'#e6ba82',.7,.14);
      if(pulse<1.105){
        const end=Math.min(1,pulse),start=Math.max(0,pulse-.105);
        const hit=(4.4-ray.points[1][2])/ray.length;
        const points=[pointOnFocusRay(ray,start)];if(start<hit&&end>hit)points.push(ray.points[1]);points.push(pointOnFocusRay(ray,end));
        stroke(points,'#f6a1b8',5,.16,12);stroke(points,'#ffe5c5',1.5,.95,5);
      }
    }
    const [fx,fy]=project([0,0,1.5]),glow=pulseState.glow;
    if(glow){const halo=context.createRadialGradient(fx,fy,0,fx,fy,34);halo.addColorStop(0,`rgba(224,247,255,${glow})`);halo.addColorStop(.2,`rgba(246,161,184,${glow*.65})`);halo.addColorStop(1,'rgba(246,161,184,0)');context.fillStyle=halo;context.fillRect(fx-34,fy-34,68,68);}
    slider.value=String(Math.round(progress*1000));
    const phase={incoming:'Light approaches the mirror.',reflecting:'The curved surface redirects the rays toward the focus.',arriving:'The wavefront reaches the ideal focus.'}[pulseState.phase];
    if(phase!==lastPhase){lastPhase=phase;status.textContent=phase;}
  }
  function loop(time){
    frame=0;if(!dialog.open)return;
    if(playing&&!document.hidden&&last!==null){const dt=(time-last)/1000;if(dt<=1)progress=(progress+dt/7)%1;}
    last=time;draw();if(playing)frame=requestAnimationFrame(loop);
  }
  function setPlaying(value){playing=value;play.textContent=value?'Pause':'Play pulse';play.setAttribute('aria-pressed',String(value));last=null;cancelAnimationFrame(frame);frame=0;if(value)frame=requestAnimationFrame(loop);draw();}
  function close(){if(dialog.open)dialog.close();}
  dialog.addEventListener('close',()=>{setPlaying(false);drag=null;returnFocus?.focus();});
  dialog.addEventListener('keydown',event=>event.stopPropagation());
  dialog.addEventListener('click',event=>{
    const action=event.target.closest('[data-focus]')?.dataset.focus;if(!action)return;
    if(action==='close')close();if(action==='play')setPlaying(!playing);
    if(action==='step'){setPlaying(false);progress=(progress+.14)%1;draw();}
    if(action==='side'){yaw=Math.PI/2;pitch=0;draw();}if(action==='perspective'){yaw=1.12;pitch=.28;draw();}
  });
  dialog.querySelector('details').addEventListener('toggle',event=>{if(event.target.open)setPlaying(false);});
  slider.addEventListener('input',()=>{const next=Number(slider.value)/1000;setPlaying(false);progress=next;draw();});
  canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag)return;yaw+=(event.clientX-drag.x)*.008;pitch=Math.max(-.9,Math.min(.9,pitch+(event.clientY-drag.y)*.008));drag={x:event.clientX,y:event.clientY};draw();});
  canvas.addEventListener('pointerup',()=>{drag=null;});canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(event.key)||event.altKey||event.ctrlKey||event.metaKey)return;
    event.preventDefault();
    if(event.key==='Home'){yaw=1.12;pitch=.28;}
    else if(event.key==='ArrowLeft'||event.key==='ArrowRight')yaw+=event.key==='ArrowLeft'?-.12:.12;
    else pitch=Math.max(-.9,Math.min(.9,pitch+(event.key==='ArrowUp'?-.12:.12)));
    draw();
  });
  const resize=new ResizeObserver(()=>draw());resize.observe(canvas);
  const visibility=()=>{last=null;};document.addEventListener('visibilitychange',visibility);document.addEventListener('freeze',visibility);document.addEventListener('resume',visibility);
  return {state,open(){beforeOpen();returnFocus=document.activeElement;progress=.3;yaw=1.12;pitch=.28;dialog.showModal();setPlaying(!dialog.querySelector('details').open&&!matchMedia('(prefers-reduced-motion: reduce)').matches);},close,dispose(){close();resize.disconnect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('freeze',visibility);document.removeEventListener('resume',visibility);dialog.remove();}};
}
