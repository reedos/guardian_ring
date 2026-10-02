// Phone inspector height is a preference within the space left by the canvas
// and its live controls. Disclosure content stays in the pane's own scroller.
export function inspectorHeightLimits({ availableHeight, controlsHeight, canvasMinimum = 140, paneMinimum = 150 }) {
  const maximum = Math.max(0, Math.floor(availableHeight - controlsHeight - canvasMinimum));
  return { minimum: Math.min(paneMinimum, maximum), maximum };
}

export function explanationHeightLimit({ availableHeight, fixedControlsHeight, canvasMinimum = 140, paneMinimum = 150, summaryMinimum = 44 }) {
  return Math.max(summaryMinimum, Math.min(150, Math.floor(availableHeight - fixedControlsHeight - canvasMinimum - paneMinimum)));
}

// Expanded teaching notes share the finite phone height with the inspector.
// Scroll the note itself rather than allowing it to push navigation offscreen.
export function mountInspectorLayout() {
  const viewer = document.getElementById('viewer'), view = document.getElementById('view');
  const panel = document.getElementById('inspector'), transport = document.getElementById('hud-btns');
  const playback = [document.getElementById('animation-controls'), document.getElementById('orbit-controls')];
  const presentationExit = document.getElementById('presentation-exit');
  const dock = document.createElement('section');
  dock.id = 'playback-dock'; dock.className = 'playback-dock'; dock.hidden = true;
  dock.setAttribute('aria-label', 'Playback and presentation controls');
  panel.before(dock);
  let queued = false;
  function update() {
    queued = false;
    const landscape = matchMedia('(max-width: 1100px) and (max-height: 600px) and (orientation: landscape)').matches;
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
    if (movedFocus?.isConnected && movedFocus.checkVisibility()) movedFocus.focus({ preventScroll: true });
    if (landscape) {
      const controlsHeight = dock.getBoundingClientRect().height;
      for (const details of dock.querySelectorAll('.animation-explanation, .orbit-playback-note')) {
        if (!details.checkVisibility()) continue;
        const height = explanationHeightLimit({
          availableHeight: viewer.parentElement.getBoundingClientRect().height,
          fixedControlsHeight: controlsHeight - details.getBoundingClientRect().height,
          canvasMinimum: 0,
          paneMinimum: panel.checkVisibility() ? 150 : 0,
          summaryMinimum: details.querySelector('summary').getBoundingClientRect().height,
        });
        const value = `${height}px`;
        if (details.style.getPropertyValue('--explanation-max-height') !== value) details.style.setProperty('--explanation-max-height', value);
      }
      return;
    }
    if (!matchMedia('(max-width: 760px)').matches) return;
    const controlsHeight = [...viewer.children].filter(node => node !== view && node.checkVisibility())
      .reduce((height, node) => height + node.getBoundingClientRect().height, 0);
    for (const details of viewer.querySelectorAll('.animation-explanation, .orbit-playback-note')) {
      if (!details.checkVisibility()) continue;
      const height = explanationHeightLimit({
        availableHeight: viewer.parentElement.getBoundingClientRect().height,
        fixedControlsHeight: controlsHeight - details.getBoundingClientRect().height,
        paneMinimum: panel.checkVisibility() ? 150 : 0,
        summaryMinimum: details.querySelector('summary').getBoundingClientRect().height,
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
