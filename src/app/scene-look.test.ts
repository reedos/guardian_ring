import { describe, expect, it, vi } from 'vitest';
import { Color, DirectionalLight, HemisphereLight, Scene, Texture, Vector3 } from 'three';
import { createSceneLook, sceneLookProfile } from './scene-look.js';

function fixture() {
  const scene = new Scene();
  scene.background = new Color('#000000');
  const hemisphere = new HemisphereLight('#dcecff', '#15212b', 1.6);
  const key = new DirectionalLight('#fff1da', 3.4); key.position.set(5, 7, 5);
  const fill = new DirectionalLight('#84bfff', 1.25); fill.position.set(-4, 3, -2);
  scene.add(hemisphere, key, fill);
  return { built: { scene, look: { env: 'studio', exposure: 1 } }, scene, hemisphere, key, fill };
}

function harness() {
  const renderer = { toneMappingExposure: 1.3 };
  const captures: { kind: string; size: number; texture: Texture; dispose: ReturnType<typeof vi.fn> }[] = [];
  const environmentFactory = vi.fn((kind: string, size: number) => {
    const target = { kind, size, texture: new Texture(), dispose: vi.fn() };
    captures.push(target); return target;
  });
  return { renderer, captures, environmentFactory, finish: createSceneLook(renderer, { environmentFactory }) };
}

describe('cached scene lighting', () => {
  it('disables spacecraft shadows on the next scene and restores the renderer on disposal',()=>{
    const renderer={toneMappingExposure:1,shadowMap:{enabled:false,type:0}};
    const finish=createSceneLook(renderer,{environmentFactory:()=>({texture:new Texture(),dispose(){}})});
    const spacecraft=fixture().built,ground=fixture().built;
    Object.assign(spacecraft.look,{shadows:true});
    finish.activate(spacecraft);expect(renderer.shadowMap.enabled).toBe(true);
    finish.activate(ground);expect(renderer.shadowMap.enabled).toBe(false);
    finish.activate(spacecraft);finish.dispose();expect(renderer.shadowMap).toEqual({enabled:false,type:0});
  });
  it('shares captures across scenes and tiers without adding hardware or changing the black background', () => {
    const { finish, environmentFactory } = harness(), first = fixture(), second = fixture();
    const background = first.scene.background, children = [...first.scene.children];
    finish.apply(first.built, { sceneId: 'satellite', tier: 0 });
    finish.apply(second.built, { sceneId: 'payload', tier: 2 });
    expect(environmentFactory).toHaveBeenCalledTimes(1);
    expect(first.scene.environment).toBe(second.scene.environment);
    expect(first.scene.background).toBe(background);
    expect(first.scene.children).toEqual(children);
    expect(first.scene.userData.sceneLook).toMatchObject({ env: 'studio', environmentSize: 256, bloom: false, ao: false, liveCapture: false });
  });

  it('uses a smaller shared capture on battery tiers while retaining authored material illumination', () => {
    const { finish, captures, environmentFactory } = harness(), { built, scene } = fixture();
    finish.apply(built, { sceneId: 'payload', tier: 0 });
    const intensity = scene.environmentIntensity;
    for (const tier of [4, 5, 6]) finish.apply(built, { sceneId: 'payload', tier });
    expect(environmentFactory).toHaveBeenCalledTimes(2);
    expect(captures.map(capture => capture.size)).toEqual([256, 128]);
    expect(scene.environment).toBe(captures[1].texture);
    expect(scene.environmentIntensity).toBe(intensity);
    finish.apply(built, { sceneId: 'payload', tier: 0 });
    expect(scene.environment).toBe(captures[0].texture);
    expect(environmentFactory).toHaveBeenCalledTimes(2);
  });

  it('sets absolute lighting values so repeated quality changes cannot compound the look', () => {
    const { finish } = harness(), { built, hemisphere, key, fill } = fixture();
    const direction = key.position.clone();
    finish.apply(built, { sceneId: 'ground', tier: 0 });
    const intensities = [hemisphere.intensity, key.intensity, fill.intensity];
    for (const tier of [6, 0, 4, 1]) finish.apply(built, { sceneId: 'ground', tier });
    expect([hemisphere.intensity, key.intensity, fill.intensity]).toEqual(intensities);
    expect(key.position.equals(direction)).toBe(true);
  });

  it('preserves the orbital Sun direction and authored night lighting', () => {
    const { finish } = harness(), { built, scene, hemisphere, key, fill } = fixture();
    built.look.env = 'night'; hemisphere.intensity = .22; fill.intensity = .06;
    key.position.set(-5, 2, 1);
    finish.apply(built, { sceneId: 'orbits', tier: 0 });
    expect([hemisphere.intensity, key.intensity, fill.intensity]).toEqual([.22, 3.4, .06]);
    expect(key.position.equals(new Vector3(-5, 2, 1))).toBe(true);
    expect(scene.environmentIntensity).toBe(.12);
  });

  it('honors explicit scene environment intensity and exposure, restoring exposure on scene changes', () => {
    const { finish, renderer } = harness(), first = fixture(), second = fixture();
    Object.assign(first.built.look, { envIntensity: .37, exposure: .9 });
    second.built.look.exposure = 1.1;
    finish.apply(first.built, { sceneId: 'satellite' }); finish.apply(second.built, { sceneId: 'ground' });
    finish.activate(first.built);
    expect(renderer.toneMappingExposure).toBe(.9); expect(first.scene.environmentIntensity).toBe(.37);
    finish.activate(second.built); expect(renderer.toneMappingExposure).toBe(1.1);
  });

  it('restores original scene state and disposes each shared target only once', () => {
    const { finish, renderer, captures } = harness(), first = fixture(), second = fixture();
    const original = new Texture(); first.scene.environment = original; first.scene.environmentIntensity = .28;
    finish.apply(first.built, { sceneId: 'satellite' }); finish.apply(second.built, { sceneId: 'ground' });
    finish.apply(second.built, { sceneId: 'ground', tier: 4 }); finish.activate(first.built);
    finish.dispose(); finish.dispose();
    expect(first.scene.environment).toBe(original); expect(first.scene.environmentIntensity).toBe(.28);
    expect(second.scene.environment).toBeNull(); expect(first.hemisphere.intensity).toBe(1.6);
    expect(first.key.intensity).toBe(3.4); expect(first.fill.intensity).toBe(1.25);
    expect(renderer.toneMappingExposure).toBe(1.3);
    expect(first.scene.userData.sceneLook).toBeUndefined();
    for (const target of captures) expect(target.dispose).toHaveBeenCalledTimes(1);
    expect(() => finish.apply(first.built)).toThrow(/disposed/);
  });

  it('keeps exposure and finish choices separate from the scenario model', () => {
    const model = Object.freeze({ detectorTemperatureK: 43, frameRateHz: 10 });
    const { built } = fixture();
    const before = sceneLookProfile({ ...built, model }, { sceneId: 'focal-plane' });
    const after = sceneLookProfile({ ...built, model: { detectorTemperatureK: 77, frameRateHz: 1 } }, { sceneId: 'focal-plane' });
    expect(after).toEqual(before);
  });
});
