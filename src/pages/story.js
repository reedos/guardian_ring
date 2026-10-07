// Shared navigation and the same evidence popover used by the visualizer.
import '../app/site.js';
import '../app/sources-ui.js';

// Motion is opt-in, including for reduced-motion visitors. The still remains a
// complete fallback when video loading or playback is unavailable.
const loop=document.querySelector('#ring-loop'),toggle=document.querySelector('#ring-loop-toggle');
document.querySelectorAll('.civil-fire img').forEach(image=>image.addEventListener('error',()=>{image.hidden=true;},{once:true}));
if(loop&&toggle){
  const paused=()=>{toggle.textContent='Play Earth loop';toggle.setAttribute('aria-pressed','false');};
  toggle.addEventListener('click',async()=>{
    if(!loop.paused){loop.pause();paused();return;}
    try{loop.hidden=false;await loop.play();toggle.textContent='Pause Earth loop';toggle.setAttribute('aria-pressed','true');}
    catch{loop.hidden=true;paused();toggle.textContent='Earth loop unavailable';}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){loop.pause();paused();}});
}
