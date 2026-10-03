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
  const viewer = document.getElementById('viewer'), view = document.getElementById('view');
  const panel = document.getElementById('inspector'), transport = document.getElementById('hud-btns');
  const playback = [document.getElementById('mission-tour'), document.getElementById('animation-controls'), document.getElementById('orbit-controls')].filter(Boolean);
  const mission = document.getElementById('mission-tour');
  const animationNote = document.querySelector('.animation-explanation'), stepTitle = document.querySelector('.animation-step');
  const stepSummary = animationNote?.querySelector('summary');
  if (stepSummary) {
    const prompt = document.createElement('span'); prompt.className = 'explanation-prompt';
    prompt.append(...stepSummary.childNodes); stepSummary.append(prompt);
  }
  const presentationExit = document.getElementById('presentation-exit');
  const dock = document.createElement('section');
  dock.id = 'playback-dock'; dock.className = 'playback-dock'; dock.hidden = true;
  dock.setAttribute('aria-label', 'Playback and presentation controls');
  panel.before(dock);
  let queued = false, invitationHeight = 0;
  function update() {
    queued = false;
    const landscape = matchMedia('(max-width: 1100px) and (max-height: 600px) and (orientation: landscape)').matches;
    const phonePortrait = matchMedia('(max-width: 760px) and (orientation: portrait)').matches;
    const focused = document.activeElement;
    dock.hidden = !landscape;
    let movedFocus = null;
    function reparent(node, parent) {
      if (node.parentElement === parent) return;
      if (node.contains(focused)) movedFocus = focused;
      parent.append(node);
    }
    // Move the existing controls, preserving their focus, listeners and clocks.
    // Landscape gives the canvas its own column instead of stacking every row.
    for (const node of playback) {
      const parent = landscape ? dock : viewer;
      reparent(node, parent);
    }
    const exitParent = landscape ? dock : transport;
    reparent(presentationExit, exitParent);
    // A live phase title is also a useful disclosure label. Reuse that row on
    // portrait phones rather than stacking a second generic explanation label.
    if (stepTitle && stepSummary) {
      if (phonePortrait) reparent(stepTitle, stepSummary);
      else if (stepTitle.parentElement === stepSummary) animationNote.before(stepTitle);
    }
    const missionActive = document.body.classList.contains('mission-active');
    if (!phonePortrait || missionActive) document.body.classList.remove('mission-invitation-retracted');
    if (movedFocus?.isConnected && movedFocus.checkVisibility()) movedFocus.focus({ preventScroll: true });
    if (landscape) {
      // The side dock is one scroller. Nested note caps can hide Follow below
      // its own summary, while an uncapped dock pushes the reading pane away.
      const height = Math.max(0, Math.floor(viewer.parentElement.getBoundingClientRect().height - (panel.checkVisibility() ? 150 : 0)));
      const value = `${height}px`;
      if (dock.style.getPropertyValue('--playback-max-height') !== value) dock.style.setProperty('--playback-max-height', value);
      return;
    }
    if (!matchMedia('(max-width: 760px)').matches) return;
    const availableHeight = viewer.parentElement.getBoundingClientRect().height;
    const minimumNoteHeight = details => {
      const follow = details.querySelector('.orbit-follow-row');
      const followHeight = follow && details.open ? follow.getBoundingClientRect().height + (parseFloat(getComputedStyle(follow).marginTop) || 0) : 0;
      return details.querySelector('summary').getBoundingClientRect().height + followHeight;
    };
    const notes = [...viewer.querySelectorAll('.animation-explanation, .orbit-playback-note')].filter(details => details.checkVisibility());
    if (phonePortrait && !missionActive) {
      if (mission.checkVisibility()) invitationHeight = mission.getBoundingClientRect().height;
      // Compare the same complete budget while the invitation is retracted,
      // avoiding a hide/show loop when its missing row creates enough space.
      let minimumControls = [...viewer.children].filter(node => node !== view && node !== mission && node.checkVisibility())
        .reduce((height, node) => height + node.getBoundingClientRect().height, 0);
      for (const details of notes) if (details.open) minimumControls -= Math.max(0, details.getBoundingClientRect().height - minimumNoteHeight(details));
      document.body.classList.toggle('mission-invitation-retracted', !missionInvitationFits({
        availableHeight, controlsHeight: minimumControls, invitationHeight,
        paneMinimum: panel.checkVisibility() ? 150 : 0,
      }));
    }
    const controlsHeight = [...viewer.children].filter(node => node !== view && node.checkVisibility())
      .reduce((height, node) => height + node.getBoundingClientRect().height, 0);
    for (const details of notes) {
      const height = explanationHeightLimit({
        availableHeight,
        fixedControlsHeight: controlsHeight - details.getBoundingClientRect().height,
        paneMinimum: panel.checkVisibility() ? 150 : 0,
        summaryMinimum: minimumNoteHeight(details),
      });
      const value = `${height}px`;
      if (details.style.getPropertyValue('--explanation-max-height') !== value) details.style.setProperty('--explanation-max-height', value);
    }
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  const observer = new ResizeObserver(schedule);
  observer.observe(viewer.parentElement);
  observer.observe(viewer); observer.observe(dock); observer.observe(panel);
  for (const node of viewer.children) if (node !== view) observer.observe(node);
  window.addEventListener('resize', schedule);
  document.addEventListener('toggle', schedule, true);
  schedule();
}

export function measureInspectorLimits() {
  const viewer = document.getElementById('viewer'), view = document.getElementById('view');
  const availableHeight = viewer.parentElement.getBoundingClientRect().height;
  const dock = document.getElementById('playback-dock');
  if (dock?.checkVisibility()) return inspectorHeightLimits({ availableHeight, controlsHeight: dock.getBoundingClientRect().height, canvasMinimum: 0 });
  const controlsHeight = [...viewer.children].filter(node => node !== view && node.checkVisibility())
    .reduce((height, node) => height + node.getBoundingClientRect().height, 0);
  return inspectorHeightLimits({ availableHeight, controlsHeight, canvasMinimum: parseFloat(getComputedStyle(view).minHeight) || 140 });
}
