import { on } from './store.js';
import { built, destination, preparePlayback } from './stage.js';

const root = document.createElement('section'); root.id = 'orbit-controls'; root.className = 'orbit-playback'; root.hidden = true; root.setAttribute('aria-label', 'Schematic orbit playback');
root.innerHTML = '<div class="orbit-playback-row"><button type="button" class="btn" id="day-play">Pause the day</button><div class="orbit-families" role="group" aria-label="Show orbit families"></div></div><details class="orbit-playback-note"><summary>How this illustration moves</summary><p>Earth and GEO rotate together. Other families follow their own schematic paths. Distances, positions, and playback time are illustrative.</p></details>';
document.getElementById('viewer').append(root);
document.getElementById('mm-view').hidden = true;
const play = root.querySelector('#day-play'), family = root.querySelector('.orbit-families');
const current = () => destination() === 0 ? built[0] : null;
play.addEventListener('click', () => { const b = current(); if (b) { const playing = b.motion(); if (!playing) preparePlayback(); b.setMotion(!playing); } sync(); });
for (const id of ['geo','heo','meo','leo']) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'btn'; button.dataset.family = id; button.textContent = id.toUpperCase();
  button.addEventListener('click', () => { const b = current(); if (b) b.setFamily(id,!b.families()[id]); sync(); }); family.append(button);
}
function sync() {
  const b = current(); root.hidden = !b?.setMotion; if (root.hidden) return;
  play.textContent = b.motion() ? 'Pause the day' : 'Play the day'; play.setAttribute('aria-pressed',String(b.motion()));
  for (const button of family.children) button.setAttribute('aria-pressed',String(b.families()[button.dataset.family]));
}
on('scene',sync); on('scene-settings',sync);
