import { describe, expect, it, vi } from 'vitest';
import { content, SCENES } from '../data.js';
import { compute } from '../model/engine';
import { LEARNING, learningFor } from '../learning-content.js';
import { createVisitHistory, refreshScenarioContent } from './exploration-context.js';
import { renderMath } from './math-view.js';
import { resolveSourceClaim } from './source-claim.js';

describe('learning path and retained exploration', () => {
  it('gives every shipped scene a question and valid continuation', () => {
    for (const scene of SCENES) {
      const lesson = learningFor(scene.id);
      expect(lesson?.question.endsWith('?')).toBe(true);
      if (lesson?.next) expect(SCENES.some(next => next.id === lesson.next)).toBe(true);
      expect(['orbit', 'wavelength', 'blackbody']).toContain(lesson?.experiment);
      expect(learningFor(scene.id, 'heat')?.experiment).toBe('blackbody');
      expect(learningFor(scene.id, 'heat')?.try).toContain('thermal spectrum');
    }
    expect(Object.keys(LEARNING)).toHaveLength(SCENES.length);
  });
  it('returns through nested side visits with the original part, layer, pose and pane', () => {
    const history = createVisitHistory();
    const original = { scene: 2, mode: 'heat', selected: 'thermal', position: [2, 3, 4], target: [0, 1, 0], pane: { pane: 'scenario', scroll: 630, expanded: true } };
    history.enter(original, 8, true);
    original.position[0] = 99;
    history.enter({ ...original, scene: 8, selected: 'arrays' }, 9, true);
    expect(history.back()?.scene).toBe(8);
    expect(history.back()).toEqual({ ...original, position: [2, 3, 4] });
    expect(history.back()).toBeNull();
    history.enter(original, 8, true); history.enter(original, 3, false);
    expect(history.length).toBe(0);
  });
  it.each(['thermal', null])('updates model and evidence while retaining selection %s and scene identity', selected => {
    const current = compute(), changed = compute({ orbit: 'leo', band: 'lwir' });
    const setModel = vi.fn(), scene = { model: current, setModel, camera: { position: [4, 5, 6] }, teaching: { playing: true, index: 2 } };
    const built = [scene], select = vi.fn(), deselect = vi.fn(), restorePane = vi.fn();
    const pane = { pane: 'scenario', scroll: 804, expanded: true, details: ['temperature'] };
    refreshScenarioContent({ built, model: changed, parts: [{ id: 'thermal' }], selected, refreshPanel: vi.fn(), select, deselect, restorePane, pane });
    expect(built[0]).toBe(scene); expect(scene.model).toBe(changed); expect(setModel).toHaveBeenCalledWith(changed);
    expect(scene.camera.position).toEqual([4, 5, 6]); expect(scene.teaching).toEqual({ playing: true, index: 2 });
    expect(restorePane).toHaveBeenCalledWith(pane);
    if (selected) { expect(select).toHaveBeenCalledWith(selected, false); expect(deselect).not.toHaveBeenCalled(); }
    else { expect(select).not.toHaveBeenCalled(); expect(deselect).toHaveBeenCalledOnce(); }
  });
  it('keeps every displayed math value attached to a resolvable current claim', () => {
    for (const scenario of [{}, { orbit: 'heo', aperture: 'civil', band: 'lwir' }]) {
      const model = compute(scenario), html = renderMath(model), state = { M: model, C: content(model), pinned: null };
      for (const [, key] of html.matchAll(/data-src="([^"]+)"/g)) expect(resolveSourceClaim(state, key), key).not.toBeNull();
      expect(html.indexOf('data-math-claim="lightTimeSeconds"')).toBeLessThan(html.indexOf('data-math-work="orbit"'));
      expect(html).toContain('data-adjust="orbit"'); expect(html).toContain('data-adjust="band"');
      if (model.scenario.aperture === 'civil') expect(html).not.toContain('data-src="model:diffractionRadians"');
    }
  });
});
