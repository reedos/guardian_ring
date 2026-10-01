// IF's shared scenario, computed content, comparison and UI state contract.
import { compute, DEFAULT_SCENARIO } from '../model/engine.ts';
import { content } from '../data.js';
const listeners = new Map();
export const store = { scenario: { ...DEFAULT_SCENARIO }, M: null, C: null, pinned: null,
  ui: { scene: -1, selected: null, mode: 'light', tokenMath: false } };
export function on(event, fn) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(fn);
  return () => listeners.get(event).delete(fn);
}
export function emit(event, detail) { return Promise.all([...(listeners.get(event) || [])].map(fn => fn(detail))); }
export function setScenario(patch) {
  store.M = compute({ ...store.scenario, ...patch }); store.scenario = { ...store.M.scenario }; store.C = content(store.M);
  return emit('scenario', store.M);
}
export function pin(enabled = true) { store.pinned = enabled ? store.M : null; emit('pin', store.pinned); }
setScenario({});
