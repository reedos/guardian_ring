import { on, store } from './store.js';
import { ORBIT_EXAMPLES } from '../orbit-examples.js';
import { chip } from '../evidence.js';
import { built, destination, overview, setOrbitFollow, orbitFollow, onTick } from './stage.js';

const root = document.createElement('section'); root.id = 'orbit-controls'; root.className = 'orbit-playback'; root.hidden = true; root.setAttribute('aria-label', 'Schematic orbit playback');
root.innerHTML = '<div class="orbit-playback-row"><div class="orbit-families" role="group" aria-label="Show orbit families"></div></div><div class="orbit-playback-row orbit-follow-row" role="group" aria-label="Orbital follow camera"><button type="button" class="btn" data-follow="geo" aria-pressed="false">Follow GEO</button><button type="button" class="btn" data-follow="leo" aria-pressed="false">Follow LEO</button><button type="button" class="btn" data-follow="free" aria-pressed="true">Free view</button></div><details class="orbit-playback-note"><summary>How this illustration moves</summary><p>Earth and GEO rotate together; LEO moves over the turning ground. The cross marks the geometric nadir point, and its surface trace shows where that point moved. It is not a sensor footprint. Follow views magnify the representative spacecraft. Distances, positions, and playback pace are illustrative.</p><p>Amber streaks show infrared light, pale blue wavefronts show a radio downlink, green wavefronts show a separate GEO crosslink, and pink streaks show thermal radiation. Yellow sunlight stays aligned with the fixed Sun. These moving symbols identify paths; their spacing and pace do not show frequency, throughput, or latency.</p></details>';
document.getElementById('view').append(root);
document.getElementById('mm-view').hidden = true;
const family = root.querySelector('.orbit-families');
const fact=document.createElement('p');fact.className='orbit-follow-fact';fact.hidden=true;
const explanation=root.querySelector('.orbit-playback-note');
const patchesNote=document.createElement('p');patchesNote.textContent='Amber GEO viewing patches remain fixed on the rotating ground. Their sizes are illustrative and do not represent sensor coverage. The starfield is illustrative; historical Earth imagery supplies surface context.';explanation.append(patchesNote);
explanation.querySelector('summary').textContent='How to read this view';
explanation.append(fact);let factFamily=null;
const explanationHost=document.createElement('section');explanationHost.id='orbit-explanation';explanationHost.hidden=true;
explanationHost.append(explanation);document.getElementById('viewer').append(explanationHost);
const scrub=document.createElement('input');scrub.type='range';scrub.id='orbit-time';scrub.min='0';scrub.max='100';scrub.step='.1';scrub.setAttribute('aria-label','Illustrative day progress');
const scrubLabel=document.createElement('label');scrubLabel.className='orbit-time-label';scrubLabel.append(document.createTextNode('Day'),scrub);root.append(scrubLabel);
let scrubbing=false,resumeMotion=false;
const beginScrub=()=>{if(scrubbing)return;const b=current();if(!b)return;scrubbing=true;resumeMotion=b.motion();b.setMotion(false);};
const endScrub=()=>{if(!scrubbing)return;scrubbing=false;current()?.setMotion(resumeMotion);};
scrub.addEventListener('pointerdown',beginScrub);window.addEventListener('pointerup',endScrub);window.addEventListener('pointercancel',endScrub);
scrub.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key))beginScrub();});scrub.addEventListener('keyup',endScrub);scrub.addEventListener('blur',endScrub);
scrub.addEventListener('input',()=>{const b=current();if(b){b.seekDay(Number(scrub.value)/100);}});
onTick(()=>{const b=current();if(b&&!scrubbing){const value=String(Math.round(b.dayProgress()*1000)/10);if(scrub.value!==value){scrub.value=value;scrub.setAttribute('aria-valuetext',`${value}% through the illustrative day`);}}});
const current = () => destination() === 0 ? built[0] : null;
for(const button of root.querySelectorAll('[data-follow]'))button.addEventListener('click',()=>{const id=button.dataset.follow;if(id!=='free')chooseFamily(id);setOrbitFollow(id==='free'?null:id);sync();});
function chooseFamily(id){
  const b=current();if(!b)return;
  if(orbitFollow()&&id!==orbitFollow()&&id!=='all')setOrbitFollow(null);
  for(const family of ['geo','heo','meo','leo'])b.setFamily(family,id==='all'||id===family);
  if(store.ui.selected&&!b.isPartVisible(store.ui.selected,{selected:true}))overview();
}
for (const id of ['geo','heo','meo','leo','all']) {
  const button=document.createElement('button');button.type='button';button.className='btn';button.dataset.family=id;button.textContent=id==='all'?'All':id.toUpperCase();
  button.addEventListener('click',()=>{chooseFamily(id);sync();});family.append(button);
}
function sync() {
  const b = current(); root.hidden = !b?.setMotion;explanationHost.hidden=root.hidden; if (root.hidden) return;
  const visible=b.families(),all=Object.values(visible).every(Boolean);
  for (const button of family.children) button.setAttribute('aria-pressed',String(button.dataset.family==='all'?all:!all&&visible[button.dataset.family]));
  for(const button of root.querySelectorAll('[data-follow]'))button.setAttribute('aria-pressed',String((orbitFollow()||'free')===button.dataset.follow));
  const followed=orbitFollow();fact.hidden=!followed;
  if(followed&&factFamily!==followed){
    factFamily=followed;const sample=ORBIT_EXAMPLES[followed];
    fact.innerHTML=`${followed.toUpperCase()} circular teaching example · ${sample.claims.orbitSpeedKmS[1]} ${chip('derived',`orbit-example:${followed}:orbitSpeedKmS`,'orbital speed')} · ${sample.claims.altitudeKm[1]} altitude ${chip('derived',`orbit-example:${followed}:altitudeKm`,'orbit altitude')}<span>Physical calculation; drawing distances and playback speed are compressed.</span>`;
  }
}
on('scene',sync); on('scene-settings',sync);
