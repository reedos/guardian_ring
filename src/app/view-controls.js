// Shared explorer affordances from IF: a part picker, overview and a clear view.
import { on, store, emit } from './store.js';
import { partsFor, select, overview } from './stage.js';

const $ = id => document.getElementById(id);
const picker = $('part-select');
const introduction = $('intro'), introductionMore = $('intro-more');


function syncParts() {
  const { scene, mode, selected } = store.ui, parts = scene < 0 ? [] : partsFor(scene);
  const key = JSON.stringify([scene, mode, parts.map(part => [part.id, part.title])]);
  if (picker.dataset.parts !== key) {
    picker.replaceChildren(new Option('0. Overview', ''));
    const groups=new Map();
    parts.forEach((part,index)=>{
      let parent=picker;
      if(part.assembly){if(!groups.has(part.assembly.id)){const group=document.createElement('optgroup');group.label=part.assembly.title;groups.set(part.assembly.id,group);picker.append(group);}parent=groups.get(part.assembly.id);}
      parent.append(new Option(`${index+1}. ${part.title}`,part.id));
    });
    picker.dataset.parts = key;
  }
  picker.value = selected || '';
  picker.title = picker.selectedOptions[0]?.textContent || 'Selected part';
  picker.disabled = scene < 0;
}

function syncIntroduction(reset = false) {
  if (reset) introduction.classList.remove('open');
  const expanded = introduction.classList.contains('open');
  introductionMore.hidden = !expanded && introduction.scrollHeight <= introduction.clientHeight + 1;
  introductionMore.setAttribute('aria-expanded', String(expanded));
  introductionMore.textContent = expanded ? 'Less overview' : 'Read overview';
}
introductionMore.addEventListener('click', () => { introduction.classList.toggle('open'); syncIntroduction(); });
new ResizeObserver(() => syncIntroduction()).observe(introduction);

// A direct part choice must reveal its description even when a long component
// list has pushed the card below the fold. The picker remains in view throughout.
function revealCard() {
  document.body.classList.remove('inspector-collapsed');
  emit('pane-request', {pane:'parts',reset:true,expand:true});
  const selected = store.ui.selected, scene = store.ui.scene, mode = store.ui.mode;
  requestAnimationFrame(() => {
    if (store.ui.scene !== scene || store.ui.mode !== mode || store.ui.selected !== selected) return;
    const card = $('card'), scroller = document.querySelector('.panel-scroll');
    if (!card.hidden) scroller.scrollTop += card.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 12;
  });
}

picker.addEventListener('change', () => {
  if (picker.value) select(picker.value);
  else overview();
});
on('part-inspect', revealCard);
$('reset-view').addEventListener('click', overview);
on('select', syncParts);
for (const event of ['scene', 'mode', 'scenario']) on(event, () => { syncParts(); syncIntroduction(true); });
syncParts();
