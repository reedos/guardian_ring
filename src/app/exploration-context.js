// A side visit is a stack, so nested civil/atmosphere detours return to their origin.
// Snapshots contain view state only. The shared scenario and pinned comparison stay live.
export function createVisitHistory() {
  const visits = [];
  return {
    enter(snapshot, destination, side) {
      if (snapshot.scene < 0 || snapshot.scene === destination) return;
      if (side) visits.push(structuredClone(snapshot));
      else visits.length = 0;
    },
    back() { return visits.pop() || null; },
    peek() { return visits.at(-1) || null; },
    get length() { return visits.length; },
  };
}

export function retainedPart(parts, selected) {
  return selected && parts.some(part => part.id === selected) ? selected : null;
}

// A scenario changes these independent teaching calculations, not the hardware.
// Keep the scene objects (and their camera/animation state) while refreshing cards.
export function refreshScenarioContent({ built, model, parts, selected, refreshPanel, select, deselect, restorePane, pane }) {
  for (const item of built) if (item) { item.setModel?.(model); item.model = model; }
  const retained = retainedPart(parts, selected);
  refreshPanel();
  if (retained) select(retained, false); else deselect();
  restorePane(pane);
}

export function capturePane() {
  const active = document.activeElement;
  return { pane: document.getElementById('try-it')?.open&&!document.getElementById('try-it').hidden?'scenario':'parts',
    scroll: document.querySelector('.panel-scroll')?.scrollTop || 0,
    expanded: document.body.classList.contains('sheet-open'),
    size: document.body.style.getPropertyValue('--inspector-size'),
    collapsed: document.body.classList.contains('inspector-collapsed'),
    details: [...document.querySelectorAll('#card-components details[open]')].map(node => node.dataset.component),
    focus: { id: active?.id || null, level: active?.dataset?.level || null, part: active?.dataset?.id || null },
  };
}
