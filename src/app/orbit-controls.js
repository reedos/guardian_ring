import { on, store } from './store.js';
import { ORBIT_EXAMPLES } from '../orbit-examples.js';
import { chip } from '../evidence.js';
import { built, destination, preparePlayback, overview, setOrbitFollow, orbitFollow, orbitMotionRequested, setActivityEnabled } from './stage.js';

const root = document.createElement('section'); root.id = 'orbit-controls'; root.className = 'orbit-playback'; root.hidden = true; root.setAttribute('aria-label', 'Schematic orbit playback');
root.innerHTML = '<div class="orbit-playback-row"><button type="button" class="btn" id="day-play">Pause the day</button><div class="orbit-families" role="group" aria-label="Show orbit families"></div></div><div class="orbit-playback-row orbit-follow-row" role="group" aria-label="Orbital follow camera"><button type="button" class="btn" data-follow="geo" aria-pressed="false">Follow GEO</button><button type="button" class="btn" data-follow="leo" aria-pressed="false">Follow LEO</button><button type="button" class="btn" data-follow="free" aria-pressed="true">Free view</button></div><details class="orbit-playback-note"><summary>How this illustration moves</summary><p>Earth and GEO rotate together; LEO moves over the turning ground. The cross marks the geometric nadir point, and its surface trace shows where that point moved. It is not a sensor footprint. Follow views magnify the representative spacecraft. Distances, positions, and playback pace are illustrative.</p><p>Amber streaks show infrared light, pale blue wavefronts show a radio downlink, green wavefronts show a separate GEO crosslink, and pink streaks show thermal radiation. Yellow sunlight stays aligned with the fixed Sun. These moving symbols identify paths; their spacing and pace do not show frequency, throughput, or latency.</p></details>';
document.getElementById('viewer').append(root);
document.getElementById('mm-view').hidden = true;
const play = root.querySelector('#day-play'), family = root.querySelector('.orbit-families');
const fact=document.createElement('p');fact.className='orbit-follow-fact';fact.hidden=true;
const explanation=root.querySelector('.orbit-playback-note');
explanation.querySelector('summary').textContent='Follow a spacecraft · Motion details';
explanation.querySelector('summary').after(root.querySelector('.orbit-follow-row'),fact);let factFamily=null;
const current = () => destination() === 0 ? built[0] : null;
play.addEventListener('click', () => { const b = current(); if (b) { const playing = orbitMotionRequested();setActivityEnabled(!playing); if (!playing&&!orbitFollow()) preparePlayback(); b.setMotion(!playing); } sync(); });
for(const button of root.querySelectorAll('[data-follow]'))button.addEventListener('click',()=>{setOrbitFollow(button.dataset.follow==='free'?null:button.dataset.follow);sync();});
for (const id of ['geo','heo','meo','leo']) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'btn'; button.dataset.family = id; button.textContent = id.toUpperCase();
  button.addEventListener('click', () => {
    const b = current();
    if (b) {
      const visible=!b.families()[id];
      if(!visible&&orbitFollow()===id)setOrbitFollow(null);
      b.setFamily(id,visible);
      if(!visible&&store.ui.selected&&!b.isPartVisible(store.ui.selected,{selected:true}))overview();
    }
    sync();
  }); family.append(button);
}
function sync() {
  const b = current(); root.hidden = !b?.setMotion; if (root.hidden) return;
  play.textContent = orbitMotionRequested() ? 'Pause the day' : 'Play the day'; play.setAttribute('aria-pressed',String(orbitMotionRequested()));
  for (const button of family.children) button.setAttribute('aria-pressed',String(b.families()[button.dataset.family]));
  for(const button of root.querySelectorAll('[data-follow]'))button.setAttribute('aria-pressed',String((orbitFollow()||'free')===button.dataset.follow));
  const followed=orbitFollow();fact.hidden=!followed;
  if(followed&&factFamily!==followed){
    factFamily=followed;const sample=ORBIT_EXAMPLES[followed];
    fact.innerHTML=`${followed.toUpperCase()} circular teaching example · ${sample.claims.orbitSpeedKmS[1]} ${chip('derived',`orbit-example:${followed}:orbitSpeedKmS`,'orbital speed')} · ${sample.claims.altitudeKm[1]} altitude ${chip('derived',`orbit-example:${followed}:altitudeKm`,'orbit altitude')}<span>Physical calculation; drawing distances and playback speed are compressed.</span>`;
  }
}
on('scene',sync); on('scene-settings',sync);
