import { store, on, emit } from './store.js';
import { learningFor } from '../learning-content.js';
import { LEARNING_EXAMPLES } from '../learning-examples.js';
import { chip } from '../evidence.js';
import { go, backOut, isSide } from './stage.js';

const host = document.getElementById('learning-guide');
const next = document.getElementById('learning-next');
const $ = id => document.getElementById(id);
export function syncLearning() {
  const scene = store.C.SCENES[store.ui.scene], lesson = learningFor(scene?.id, store.ui.mode);
  if (!lesson || !host) return;
  $('learning-question').textContent = lesson.question;
  $('learning-takeaway').textContent = lesson.takeaway;
  $('learning-try').textContent = lesson.try;
  $('learning-try').hidden = !['orbits','pixel','atmosphere'].includes(scene.id);
  $('learning-try').onclick = () => emit('experiment', lesson.experiment);
  const nextIndex = store.C.SCENES.findIndex(item => item.id === lesson.next);
  next.hidden = nextIndex < 0 && !isSide(store.ui.scene);
  next.textContent = isSide(store.ui.scene) ? 'Return to your exploration →' : nextIndex >= 0 ? `Next level: ${store.C.SCENES[nextIndex].title.replace(/^The /, 'the ')} →` : '';
  next.onclick = () => { void (isSide(store.ui.scene) ? backOut() : go(nextIndex)); };
  host.dataset.scene = scene.id;
  host.querySelector('.learning-example')?.remove();
  const example = LEARNING_EXAMPLES[scene.id];
  if (example) {
    const box = document.createElement('details'); box.className = 'learning-example';
    const summary = document.createElement('summary'); summary.textContent = example.title;
    const body = document.createElement('p'); body.textContent = example.body;
    box.append(summary, body);
    if(example.image){
      const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');
      image.src=example.image;image.alt=example.imageCaption;image.loading='lazy';image.referrerPolicy='no-referrer';
      caption.textContent=example.imageCaption;figure.append(image,caption);box.append(figure);
      image.addEventListener('error',()=>{image.hidden=true;caption.textContent+=' Image unavailable; use the public source link below.';},{once:true});
    }
    example.specs.forEach((row, index) => box.insertAdjacentHTML('beforeend', chip(row[2], example.claimKeys[index], row[0])));
    const source = document.createElement('a'); source.href = example.href; source.target = '_blank'; source.rel = 'noopener noreferrer'; source.className = 'learning-source'; source.textContent = 'Read the public example ↗';
    box.append(source);
    host.append(box);
  }
}
for (const event of ['scene', 'mode']) on(event, syncLearning);
syncLearning();
