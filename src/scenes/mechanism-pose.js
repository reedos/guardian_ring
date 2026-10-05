// Drawing angles only. A reference selection holds through readout; an explicit
// return phase restores Earth before the next loop and the initial rest pose.
export function mechanismAngle(mechanism, state) {
  if (state.inspection) return 0;
  const phase = state.step.id, p = state.progress;
  if (mechanism.motion === 'pointing') return phase === 'receive' ? Math.sin(p * Math.PI * 2) * mechanism.range : 0;
  if (mechanism.motion === 'scan') return phase === 'slew' ? Math.sin(p * Math.PI * 2) * mechanism.range : 0;
  if (mechanism.motion !== 'reference') return 0;
  const u = Math.min(1, p / .25), ease = u * u * (3 - 2 * u);
  if (phase === 'earth') return 0;
  if (phase === 'blackbody') return mechanism.range * ease;
  if (phase === 'space') return mechanism.range * (1 - 2 * ease);
  if (phase === 'return') return -mechanism.range * (1 - ease);
  return state.steps?.some(step => step.id === 'space') ? -mechanism.range : 0;
}
