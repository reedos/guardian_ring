import { claimByKey } from '../claims.js';

// A pinned value is a snapshot. Never fall back to the current model for it.
export function resolveSourceClaim(state, key) {
  if (key?.startsWith('pinned:model:')) {
    if (!state.pinned) return null;
    const claim = claimByKey(state.pinned, state.C, key.slice('pinned:'.length));
    return claim ? { ...claim, key, pinned: true } : null;
  }
  return claimByKey(state.M, state.C, key);
}

export function sourceScenarioSearch(state, key, search) {
  const query = new URLSearchParams(search);
  if (key?.startsWith('pinned:model:') && state.pinned) {
    for (const [choice, value] of Object.entries(state.pinned.scenario)) query.set(choice, String(value));
  }
  return query.toString();
}
