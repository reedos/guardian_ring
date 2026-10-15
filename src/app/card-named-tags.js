// Says on the explorer card which named civil hardware each row describes, and that the drawn part is not that hardware.
// It decorates the card after the explorer fills it, instead of editing the explorer's own render code, so the
// story-still inputs (src/app/stage.js and friends) stay byte-identical and no still needs re-rendering.
import { namedSubject, NOT_DRAWN_NOTE } from './named-subject.js';

const ASSEMBLY_TAG = 'GOES-R ABI, named instrument · not the drawn part';

function tag(text) {
  const small = document.createElement('small');
  small.className = 'named-tag'; small.textContent = text;
  return small;
}

export function decorateCard(card = document.getElementById('card')) {
  if (!card) return;
  const assembly = card.querySelector('#card-assembly');
  if (assembly && !assembly.hidden && assembly.children.length && !assembly.querySelector('.named-tag')) assembly.append(tag(ASSEMBLY_TAG));
  const specs = card.querySelector('#card-s');
  if (!specs) return;
  let named = 0;
  for (const row of specs.children) {
    const existing = row.querySelector('.named-tag');
    if (existing) { named++; continue; }
    const subject = namedSubject(row.querySelector('dt')?.textContent);
    if (subject) { row.append(tag(subject)); named++; }
  }
  let note = card.querySelector('#card-named');
  if (!note) { note = document.createElement('p'); note.id = 'card-named'; note.className = 'named-note'; note.hidden = true; specs.after(note); }
  const text = named ? NOT_DRAWN_NOTE : '';
  if (note.textContent !== text) note.textContent = text;
  if (note.hidden === Boolean(named)) note.hidden = !named;
}

export function mountCardNamedTags() {
  const card = document.getElementById('card');
  if (!card || card.dataset.namedTags) return;
  card.dataset.namedTags = '1';
  new MutationObserver(() => decorateCard(card)).observe(card, { childList: true, subtree: true });
  decorateCard(card);
}
