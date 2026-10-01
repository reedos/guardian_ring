// IF's graded movement and forward-view clearance, isolated from the DOM.
// The browser flight gate probes 6% of the aim distance around the camera and
// 45% ahead; these slightly larger planning margins absorb sampling differences.
import * as THREE from 'three';

export const CLEARANCE_BAND = 0.05;
const CLEAR = 0.075, HOME = 0.03, SIGHT = 0.55;
const MARGIN_TIERS = [[0.85, 0.3], [0.7, 1], [0.45, 3], [0.2, 10]];

// Match OrbitControls' radius/polar clamps before a pose is tested or played.
// Without this, an outward detour can be tested beyond maxDistance but flown
// much closer to the hardware when controls.update() clamps it each frame.
export function constrainCameraPose(pos, target, limits) {
  if (!limits) return;
  const x = pos.x - target.x, y = pos.y - target.y, z = pos.z - target.z;
  const radius = Math.hypot(x, y, z), phi = radius ? Math.acos(Math.max(-1, Math.min(1, y / radius))) : 0;
  const r = Math.max(limits.minDistance, Math.min(limits.maxDistance, radius));
  const p = Math.max(1e-6, Math.min(Math.PI - 1e-6, Math.max(limits.minPolarAngle, Math.min(limits.maxPolarAngle, phi))));
  if (r === radius && p === phi) return;
  const theta = Math.atan2(x, z), sin = Math.sin(p);
  pos.set(target.x + r * sin * Math.sin(theta), target.y + r * Math.cos(p), target.z + r * sin * Math.cos(theta));
}

// Return the deterministic cost of one sampled camera step. Endpoint framings
// keep their authored close view; the approach between them remains checked.
export function createCameraClearance(move, map, limits = move.limits) {
  const home = [
    { pos: move.p0, d: move.p0.distanceTo(move.t0) },
    { pos: move.p1, d: move.p1.distanceTo(move.t1) },
  ];
  const sightEnd = new THREE.Vector3();
  const scale = q => Math.max(q.pos.distanceTo(q.target), home[0].d + (home[1].d - home[0].d) * q.u);
  return (a, b) => {
    // A caller using another sampler must not claim clearance for a pose that
    // controls would move. poseAt applies the same limits in normal playback.
    if (limits && b.u > 0 && b.u < 1) {
      const d = b.pos.distanceTo(b.target), phi = d ? Math.acos(Math.max(-1, Math.min(1, (b.pos.y - b.target.y) / d))) : 0;
      if (d < limits.minDistance - 1e-9 || d > limits.maxDistance + 1e-9 || phi < limits.minPolarAngle - 1e-9 || phi > limits.maxPolarAngle + 1e-9) return 100;
    }
    // Match the flight gate's framing exemption. Two occupancy cells would
    // swallow too much of the approach with the viewer's deliberately coarse map.
    if (home.some(h => a.pos.distanceTo(h.pos) <= HOME * h.d && b.pos.distanceTo(h.pos) <= HOME * h.d)) return 0;
    if (!map) return 0;
    const ra = CLEAR * Math.sin(Math.PI * a.u) * scale(a), rb = CLEAR * Math.sin(Math.PI * b.u) * scale(b);
    const ends = { from: a.u > 0, to: b.u < 1 };
    if (map.segment(a.pos, b.pos, ra, rb, ends)) {
      if (map.segment(a.pos, b.pos, 0, 0, ends)) return 100;
      for (let i = MARGIN_TIERS.length - 1; i >= 0; i--) {
        const [fraction, cost] = MARGIN_TIERS[i];
        if (map.segment(a.pos, b.pos, ra * fraction, rb * fraction, ends)) return cost;
      }
      return CLEARANCE_BAND;
    }
    // A camera can clear a wall while looking straight into it. Keep the view
    // ahead clear as well, tapering to the authored framing at both ends.
    const sight = SIGHT * Math.sin(Math.PI * b.u) * scale(b);
    if (sight > 1e-9) {
      sightEnd.subVectors(b.target, b.pos).setLength(sight).add(b.pos);
      if (map.segment(b.pos, sightEnd, 1e-9, 1e-9, { from: false })) {
        for (let i = MARGIN_TIERS.length - 1; i >= 0; i--) {
          const [fraction, cost] = MARGIN_TIERS[i];
          sightEnd.subVectors(b.target, b.pos).setLength(sight * fraction).add(b.pos);
          if (map.segment(b.pos, sightEnd, 1e-9, 1e-9, { from: false })) return cost;
        }
        return CLEARANCE_BAND;
      }
    }
    return 0;
  };
}
