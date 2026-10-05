import { describe, expect, it, vi } from 'vitest';
import { compute } from '../model/engine';
import { content } from '../data.js';
import { teachingProgram } from './teaching-programs.js';
import { teachingFocus, teachingPartPhase } from './teaching-focus.js';

type SceneConfig = { teaching: string; points: Record<string, unknown>; dataPoints?: Record<string, unknown>; heatPoints?: Record<string, unknown> };
// Capture the real, authored point inventories without loading assets or
// constructing a DOM/WebGL scene. The program and cards remain real too.
const { configs } = vi.hoisted(() => ({ configs: new Map<string, SceneConfig>() }));
vi.mock('./illustrated.js', () => ({ illustrated(config: SceneConfig) {
  configs.set(config.teaching, config);
  return { preload() {}, build() {} };
} }));
import './satellite.js';
import './payload.js';
import './focal-plane.js';
import './pixel.js';
import './plume.js';
import './side-ground.js';
import './side-abi.js';
import './side-tirs2.js';
import './side-atmosphere.js';

const scenes = ['satellite', 'payload', 'focal-plane', 'pixel', 'plume', 'ground', 'abi', 'tirs2', 'atmosphere'];
const modes = ['light', 'data', 'heat'] as const;
const C = content(compute());
const cards = { light: C.PARTS, data: C.PARTS_DATA, heat: C.PARTS_HEAT };

describe('manual teaching-step focus', () => {
  it('demonstrates scan motion, detector response and cooler heat lift on one-shot inspection', () => {
    for(const [scene,mode,part,action] of [
      ['abi','light','scan-system','slew'],['payload','heat','thermal','lift'],
      ['abi','heat','thermal','lift'],['tirs2','heat','cooling','lift'],
      ['focal-plane','light','array','absorb'],
    ]){
      const steps=teachingProgram(scene,mode);
      expect(steps[teachingPartPhase(scene,mode,part,steps)].id).toBe(action);
      expect(teachingFocus(scene,mode,action)).toBe(part);
    }
  });
  it('keeps ordinary parts on their authored activity and leaves unanimated parts still', () => {
    const steps=teachingProgram('payload','light');
    expect(steps[teachingPartPhase('payload','light','optics',steps)].id).toBe('collect');
    expect(teachingPartPhase('payload','light','unanimated',steps)).toBe(-1);
    expect(()=>teachingPartPhase('abi','light','scan-system',[{id:'command'}])).toThrow(RangeError);
  });
  it('maps every actual lesson step to a real card and hotspot in its current layer', () => {
    expect([...configs.keys()].sort()).toEqual([...scenes].sort());
    let focused = 0;
    for (const sceneId of scenes) for (const mode of modes) {
      const config = configs.get(sceneId)!;
      const points = (mode === 'data' ? config.dataPoints : mode === 'heat' ? config.heatPoints : null) || config.points;
      for (const step of teachingProgram(sceneId, mode)) {
        const label = `${sceneId}/${mode}/${step.id}`;
        // A missing phase throws rather than passing as a contextual overview.
        const part = teachingFocus(sceneId, mode, step.id);
        if (part === null) continue;
        expect(typeof part, label).toBe('string');
        expect(Object.hasOwn(points, part), `${label}: missing hotspot ${part}`).toBe(true);
        expect(cards[mode][sceneId].some((card: { id: string }) => card.id === part), `${label}: missing card ${part}`).toBe(true);
        focused++;
      }
    }
    expect(focused).toBeGreaterThan(90);
  });

  it('reserves overview for the explicitly contextual, multi-component beats', () => {
    const overviews: string[] = [];
    for (const sceneId of scenes) for (const mode of modes) for (const step of teachingProgram(sceneId, mode)) {
      if (teachingFocus(sceneId, mode, step.id) === null) overviews.push(`${sceneId}/${mode}/${step.id}`);
    }
    expect(overviews.sort()).toEqual([
      'payload/heat/reject', 'payload/heat/radiate', 'focal-plane/heat/reject',
      'plume/light/emit', 'atmosphere/data/timeline',
      'ground/heat/reject',
    ].sort());
  });

  it('keeps detector response, sensor-side conversion and interface processing in their own components', () => {
    expect(teachingFocus('pixel', 'light', 'absorb')).toBe('absorber');
    expect(teachingFocus('pixel', 'light', 'integrate')).toBe('readout');
    expect(teachingFocus('pixel', 'data', 'transfer')).toBe('output');
    expect(teachingFocus('payload', 'data', 'readout')).toBe('readout');
    expect(teachingFocus('payload', 'data', 'digitize')).toBe('digitizer');
    expect(teachingFocus('payload', 'data', 'transfer')).toBe('data-interface');
    expect(teachingFocus('satellite', 'data', 'readout')).toBe('instrument');
    expect(teachingFocus('satellite', 'data', 'transfer')).toBe('links');
    expect(() => teachingFocus('pixel', 'data', 'digitize')).toThrow(RangeError);
    expect(() => teachingFocus('satellite', 'data', 'digitize')).toThrow(RangeError);
  });

  it('distinguishes ABI scan motion from TIRS scene selection and its physical blackbody', () => {
    expect(teachingFocus('payload', 'light', 'command')).toBe('controller');
    expect(teachingFocus('payload', 'light', 'slew')).toBe('scan-system');
    expect(teachingFocus('payload', 'light', 'feedback')).toBe('scan-system');
    expect(teachingFocus('abi', 'light', 'slew')).toBe('scan-system');
    expect(teachingFocus('abi', 'light', 'reference')).toBe('calibration');
    expect(teachingFocus('tirs2', 'light', 'earth')).toBe('scene-select');
    expect(teachingFocus('tirs2', 'light', 'blackbody')).toBe('blackbody');
    expect(teachingFocus('tirs2', 'light', 'space')).toBe('scene-select');
    expect(teachingFocus('tirs2', 'light', 'return')).toBe('scene-select');
    expect(teachingFocus('tirs2', 'heat', 'radiate')).toBe('radiator');
  });

  it('rejects unrecognized scene, layer and phase IDs instead of guessing', () => {
    for (const args of [
      ['orbits', 'light', 'collect'], ['payload', 'unknown', 'collect'],
      ['payload', 'data', 'readout-typo'], ['toString', 'light', 'collect'],
      ['payload', 'data', 'toString'],
    ]) expect(() => teachingFocus(...args as [string, string, string])).toThrow(/Missing teaching focus/);
  });
});
