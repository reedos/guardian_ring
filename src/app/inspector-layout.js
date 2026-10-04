// Phone inspector height is a preference within the space left by the canvas
// and its live controls. Disclosure content stays in the pane's own scroller.
export function inspectorHeightLimits({ availableHeight, controlsHeight, canvasMinimum = 140, paneMinimum = 150 }) {
  const maximum = Math.max(0, Math.floor(availableHeight - controlsHeight - canvasMinimum));
  return { minimum: Math.min(paneMinimum, maximum), maximum };
}

export function explanationHeightLimit({ availableHeight, fixedControlsHeight, canvasMinimum = 140, paneMinimum = 150, summaryMinimum = 44 }) {
  return Math.max(summaryMinimum, Math.min(150, Math.floor(availableHeight - fixedControlsHeight - canvasMinimum - paneMinimum)));
}

export function missionInvitationFits({ availableHeight, controlsHeight, invitationHeight, canvasMinimum = 140, paneMinimum = 150 }) {
  return controlsHeight + invitationHeight + canvasMinimum + paneMinimum <= availableHeight;
}

// Expanded teaching notes share the finite phone height with the inspector.
// Scroll the note itself rather than allowing it to push navigation offscreen.
export function mountInspectorLayout() {
  const panel = document.getElementById('inspector');
  const playback = [document.getElementById('mission-tour'), document.getElementById('animation-controls'), document.getElementById('orbit-explanation')].filter(Boolean);
  const dock = document.createElement('section');
  dock.id = 'playback-dock'; dock.className = 'playback-dock';
  dock.setAttribute('aria-label', 'Playback and presentation controls');
  panel.querySelector('.panel-scroll').prepend(dock);
  // Playback owns a bounded scroller in the inspector, never a canvas row.
  // Reparent existing nodes once so listeners, focus and lesson clocks survive.
  dock.append(...playback);
  document.body.classList.add('stage-priority');
  const picker=document.querySelector('.view-part'),transport=document.getElementById('hud-btns');
  const pickerHome=picker.parentElement,viewer=document.getElementById('viewer'),view=document.getElementById('view');
  const phone=matchMedia('(max-width:760px)');
  function placeNavigation(){
    const focused=document.activeElement;
    for(const tab of document.querySelectorAll('[data-pane]'))tab.setAttribute('role',phone.matches?'button':'tab');
    document.querySelector('.pane-tabs').setAttribute('role',phone.matches?'group':'tablist');
    const parts=document.getElementById('tab-parts');
    if(phone.matches)parts.setAttribute('aria-expanded',String(document.body.classList.contains('sheet-open')));else parts.removeAttribute('aria-expanded');
    if(phone.matches){panel.querySelector('.panel-scroll').prepend(picker);view.append(transport);}
    else {pickerHome.prepend(picker);view.after(transport);}
    if(focused?.isConnected&&focused.checkVisibility())focused.focus({preventScroll:true});
  }
  phone.addEventListener('change',placeNavigation);placeNavigation();
}

export function measureInspectorLimits() {
  const viewer = document.getElementById('viewer'), view = document.getElementById('view');
  const availableHeight = viewer.parentElement.getBoundingClientRect().height;
  const controlsHeight = [...viewer.children].filter(node => node !== view && node.checkVisibility())
    .reduce((height, node) => height + node.getBoundingClientRect().height, 0);
  return inspectorHeightLimits({ availableHeight, controlsHeight,
    canvasMinimum: innerHeight * (matchMedia('(max-width: 1100px)').matches ? .45 : .60), paneMinimum: 80 });
}
