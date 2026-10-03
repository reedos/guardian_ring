// A deterministic presentation clock. Seconds here pace a lesson, never a sensor.
export function createTeachingSequence(steps, { reduced = false, duration = 3.6 } = {}) {
  if (!steps.length || !Number.isFinite(duration) || duration <= 0) throw new Error('A lesson needs steps and a positive duration');
  let index = 0, progress = 0, playing = false, inspection = true, suspended = false, repeating = false, last = null;
  const listeners = new Set();
  const state = () => ({ index, progress, playing, inspection, suspended, repeating, reduced, step: steps[index], steps, total: steps.length });
  const emit = () => { for (const fn of listeners) fn(state()); };
  return {
    state,
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    play({ repeat = false } = {}) { inspection = false; playing = true; repeating = repeat; last = null; emit(); },
    pause() { playing = false; last = null; emit(); },
    reset() { index = 0; progress = 0; playing = false; repeating = false; last = null; emit(); },
    step(delta = 1) { index = (index + Math.trunc(delta) % steps.length + steps.length) % steps.length; progress = .72; playing = false; inspection = false; repeating = false; last = null; emit(); },
    seek(nextIndex, nextProgress = 0) {
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= steps.length || !Number.isFinite(nextProgress) || nextProgress < 0 || nextProgress > 1) throw new RangeError('Seek requires a valid step and progress in [0, 1]');
      index = nextIndex; progress = nextProgress; playing = false; inspection = false; repeating = false; last = null; emit();
    },
    setInspection(value) { inspection = !!value; if (inspection) playing = false; last = null; emit(); },
    setSuspended(value) {const next=!!value;if(next!==suspended){suspended=next;last=null;}},
    tick(time) {
      if (!Number.isFinite(time)) return state();
      const dt = last === null ? 0 : Math.max(0, time - last); last = time;
      // Returning from a hidden tab must not skip an entire explanation.
      if (!playing || inspection || suspended || dt > 1) return state();
      progress += dt / duration;
      while (progress >= 1) {
        progress -= 1;
        if (++index === steps.length) {
          if (repeating) index = 0;
          else { index = steps.length - 1; progress = 1; playing = false; emit(); break; }
        }
        emit();
      }
      return state();
    },
  };
}

// Walk each straight segment by cumulative distance. No spline easing, corner
// cutting, or apparent acceleration of a photon at an arbitrary route vertex.
export function polylineSampler(points) {
  if (points.length < 2 || points.some(p => p.length !== 3 || p.some(v => !Number.isFinite(v)))) throw new Error('A path needs finite 3D points');
  const lengths = points.slice(1).map((p, i) => Math.hypot(...p.map((v, k) => v - points[i][k])));
  const length = lengths.reduce((a, b) => a + b, 0);
  if (!length) throw new Error('A teaching path cannot have zero length');
  return { length, at(fraction) {
    let distance = Math.max(0, Math.min(1, fraction)) * length;
    for (let i = 0; i < lengths.length; i++) {
      if (!lengths[i]) continue;
      if (distance <= lengths[i] || i === lengths.length - 1) {
        const u = distance / lengths[i];
        return { point: points[i].map((v, k) => v + (points[i + 1][k] - v) * u), tangent: points[i].map((v, k) => (points[i + 1][k] - v) / lengths[i]) };
      }
      distance -= lengths[i];
    }
    return { point: [...points.at(-1)], tangent: [0, 0, 1] };
  } };
}
