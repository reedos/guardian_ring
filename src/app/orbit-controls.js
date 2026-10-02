import { on } from './store.js';
import { built, destination } from './stage.js';

const root = document.createElement('div'); root.id = 'orbit-controls'; root.hidden = true;
root.innerHTML = '<button type="button" class="mm-item" id="day-play">Pause the day</button><div class="orbit-families" role="group" aria-label="Schematic orbit families"></div><p class="mm-note">Earth and GEO rotate together. Playback speed, distances and positions are illustrative.</p>';
document.getElementById('mm-view').append(root);
const play = root.querySelector('#day-play'), family = root.querySelector('.orbit-families');
const current = () => destination() === 0 ? built[0] : null;
play.addEventListener('click', () => { const b = current(); b?.setMotion(!b.motion()); sync(); });
for (const id of ['geo','heo','meo','leo']) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'btn'; button.dataset.family = id; button.textContent = id.toUpperCase();
  button.addEventListener('click', () => { const b = current(); if (b) b.setFamily(id,!b.families()[id]); sync(); }); family.append(button);
}
function sync() {
  const b = current(); root.hidden = !b?.setMotion; root.parentElement.hidden = root.hidden; if (root.hidden) return;
  play.textContent = b.motion() ? 'Pause the day' : 'Play the day'; play.setAttribute('aria-pressed',String(b.motion()));
  for (const button of family.children) button.setAttribute('aria-pressed',String(b.families()[button.dataset.family]));
}
on('scene',sync); on('scene-settings',sync);
