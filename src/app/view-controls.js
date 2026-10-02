// Shared explorer affordances from IF: a part picker, overview and a clear view.
import { on, store } from './store.js';
import { partsFor, select, overview } from './stage.js';

const $ = id => document.getElementById(id);
const picker = $('part-select'), details = $('inspector-toggle'), present = $('presentation-view');
const introduction = $('intro'), introductionMore = $('intro-more');
let previousCollapsed = false;

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

function collapseInspector(collapsed) {
  document.body.classList.toggle('inspector-collapsed', collapsed);
  details.setAttribute('aria-expanded', String(!collapsed));
  details.textContent = collapsed ? 'Show details' : 'Hide details';
}

function setPresentation(enabled) {
  if (enabled) previousCollapsed = document.body.classList.contains('inspector-collapsed');
  document.body.classList.toggle('presentation-view', enabled);
  present.setAttribute('aria-pressed', String(enabled));
  present.textContent = enabled ? 'Exit presentation' : 'Present';
  $('presentation-exit').hidden = !enabled;
  collapseInspector(enabled || previousCollapsed);
}

// A direct part choice must reveal its description even when a long component
// list has pushed the card below the fold. The picker remains in view throughout.
function revealCard() {
  if (document.body.classList.contains('presentation-view')) return;
  collapseInspector(false);
  $('tab-parts').click();
  requestAnimationFrame(() => {
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
present.addEventListener('click', () => setPresentation(!document.body.classList.contains('presentation-view')));
$('presentation-exit').addEventListener('click', () => { setPresentation(false); $('more-btn').focus({ preventScroll: true }); });
details.addEventListener('click', () => {
  const wasCollapsed = document.body.classList.contains('inspector-collapsed');
  if (document.body.classList.contains('presentation-view')) setPresentation(false);
  collapseInspector(!wasCollapsed);
});
addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.body.classList.contains('presentation-view')) setPresentation(false);
});
on('select', syncParts);
for (const event of ['scene', 'mode', 'scenario']) on(event, () => { syncParts(); syncIntroduction(true); });
syncParts();
