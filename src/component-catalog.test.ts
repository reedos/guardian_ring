import { describe, expect, it, vi } from 'vitest';
import { componentLedgers, modelDocument } from '../tools/component-fixtures.mjs';
import { content, SCENES } from './data.js';
import { compute, SCENARIO_OPTIONS, type Scenario } from './model/engine';
import { COMPONENT_NAMES } from './component-names.js';
import { COMPONENT_CATALOG, catalogFact } from './component-catalog.js';
import { allClaims, LAYERS } from './claims.js';
import { evOf, problems } from './evidence.js';
import { SOURCES } from './sources.js';
import { SPACECRAFT_FACTS, spacecraftFact } from './spacecraft-content.js';
import { partInventory, renderParts } from './pages/parts-content.js';
import { COMPONENT_GLOSSARY } from './pages/component-glossary.js';
import { resolveSourceClaim } from './app/source-claim.js';

type Row = [string, string, string, { refs?: string[][]; calc?: string; assume?: string }];
type Component = { id: string; title: string; role: string; body: string; specs: Row[] };
type Part = { id: string; title: string; kicker: string; specs: Row[]; components?: Component[] };
type SceneConfig = { url: string; points: Record<string, string>; views: Record<string, { pos: number[]; target: number[] }> };
const sceneConfigs = vi.hoisted(() => new Map<string, SceneConfig>());
// Capture the production scene declarations without constructing a canvas or GPU.
vi.mock('./scenes/illustrated.js', () => ({ illustrated: (config: SceneConfig) => {
  sceneConfigs.set(config.url.split('/').pop()!.split('.')[0], config);
  return { preload: () => {}, build: () => {} };
} }));
import './scenes/satellite.js';
import './scenes/payload.js';
import './scenes/focal-plane.js';

const facts: { runtimeKey: string; row: Row }[] = componentLedgers.flatMap(ledger => ledger.facts);
const model = compute(), C = content(model), claims = allClaims(model, C);
const registry = new Map(claims.map(claim => [claim.key, claim]));
const modes = LAYERS as [string, 'PARTS' | 'PARTS_DATA' | 'PARTS_HEAT'][];
const cards = (data: ReturnType<typeof content>, key: 'PARTS' | 'PARTS_DATA' | 'PARTS_HEAT', scene: string): Part[] => data[key][scene];
const componentNames: Record<string, Record<string, string>> = COMPONENT_NAMES;
const sourceStatus = (id: string) => (SOURCES as Record<string, { status?: string }>)[id]?.status;
const captures = (html: string, pattern: RegExp) => [...html.matchAll(pattern)].map(match => match[1]);

describe('component identity and canonical evidence', () => {
  it('keeps physical names and IDs stable across every level, layer and scenario', () => {
    expect(SCENES).toHaveLength(10);
    expect(Object.keys(COMPONENT_NAMES).sort()).toEqual(SCENES.map(scene => scene.id).sort());
    const scenarios = Object.entries(SCENARIO_OPTIONS).reduce<Partial<Scenario>[]>((rows, [key, choices]) =>
      rows.flatMap(row => choices.map(choice => ({ ...row, [key]: choice.id }))), [{}]);
    expect(scenarios).toHaveLength(96);
    for (const scenario of scenarios) {
      const current = content(compute(scenario));
      for (const scene of SCENES) {
        const seen = new Set<string>();
        for (const [, key] of modes) {
          const parts = cards(current, key, scene.id), original = cards(C, key, scene.id);
          expect(parts.map(part => part.id), `${scene.id}/${key}`).toEqual(original.map(part => part.id));
          expect(new Set(parts.map(part => part.id)).size).toBe(parts.length);
          for (const part of parts) {
            seen.add(part.id);
            expect(part.title, `${scene.id}/${key}/${part.id}`).toBe(componentNames[scene.id][part.id]);
            expect(part.kicker.trim()).not.toBe('');
            expect(part.kicker).not.toBe(part.title);
          }
        }
        expect([...seen].sort(), scene.id).toEqual(Object.keys(componentNames[scene.id]).sort());
      }
    }
  });

  it('retains every canonical runtimeKey without silently overwriting or drifting a fact', () => {
    const keys = facts.map(fact => fact.runtimeKey);
    expect(new Set(keys).size).toBe(keys.length);
    for (const fact of facts) expect(catalogFact(fact.runtimeKey), fact.runtimeKey).toEqual(fact.row);
    for (const [key, row] of Object.entries(SPACECRAFT_FACTS)) {
      expect(facts.find(fact => fact.runtimeKey === key)?.row, key).toEqual(row);
      expect(spacecraftFact(key), key).toEqual(catalogFact(key));
    }
    expect(() => catalogFact('not-a-reviewed-fact')).toThrow('Unreviewed component fact');
    const copy = catalogFact(facts[0].runtimeKey) as Row;
    copy[1] = 'changed by a consumer'; copy[3].refs![0][1] = 'changed locator';
    expect(catalogFact(facts[0].runtimeKey)).toEqual(facts[0].row);
  });

  it('registers each anatomy claim once, with verified evidence and the same fact in every layer', () => {
    const canonicalRows = new Set(facts.map(fact => JSON.stringify(fact.row)));
    const componentKeys: string[] = [];
    for (const [scene, assemblies] of Object.entries(COMPONENT_CATALOG)) {
      for (const [partId, components] of Object.entries(assemblies) as [string, Component[]][]) {
        expect(components.length, `${scene}/${partId}`).toBeGreaterThan(0);
        expect(new Set(components.map(component => component.id)).size).toBe(components.length);
        for (const [, key] of modes) expect(cards(C, key, scene).find(part => part.id === partId)?.components).toEqual(components);
        for (const component of components) {
          expect(component.title.trim()).not.toBe(''); expect(component.role.trim()).not.toBe(''); expect(component.body.trim()).not.toBe('');
          expect(component.specs.length).toBeGreaterThan(0);
          component.specs.forEach((row, i) => {
            const key = `component:${scene}:${partId}:${component.id}:${i}`;
            componentKeys.push(key);
            expect(canonicalRows.has(JSON.stringify(row)), key).toBe(true);
            const claim = registry.get(key);
            expect(claim, key).toMatchObject({ label: row[0], value: row[1], basis: row[2], ev: evOf(row) });
            expect(resolveSourceClaim({ M: model, C, pinned: null }, key), key).toEqual(claim);
            expect(problems(claim, SOURCES), key).toEqual([]);
            for (const [source] of row[3].refs || []) expect(sourceStatus(source), source).toBe('verified');
          });
        }
      }
    }
    expect(componentKeys.length).toBeGreaterThan(100);
    expect(claims.filter(claim => claim.group === 'component').map(claim => claim.key).sort()).toEqual(componentKeys.sort());
    expect(new Set(claims.map(claim => claim.key)).size).toBe(claims.length);
  });
});

describe('assembly references and geometry anchors', () => {
  it('anchors all satellite, payload and focal-plane parent cards in the actual GLBs', () => {
    for (const [scene, count] of [['satellite', 12], ['payload', 13], ['focal-plane', 8]] as const) {
      const config = sceneConfigs.get(scene)!;
      expect(config, scene).toBeDefined();
      const partIds = cards(C, 'PARTS', scene).map(part => part.id).sort();
      expect(partIds).toHaveLength(count);
      expect(Object.keys(config.points).sort()).toEqual(partIds);
      expect(Object.keys(config.views).sort()).toEqual(partIds);
      for (const [, key] of modes) expect(cards(C, key, scene).map(part => part.id).sort()).toEqual(partIds);
      const gltf = modelDocument(config.url);
      const names = gltf.nodes.map((node: { name?: string }) => node.name);
      for (const part of partIds) {
        expect(names.filter((name: string) => name === config.points[part]), `${scene}/${part}`).toHaveLength(1);
        const view = config.views[part];
        expect(view.pos).toHaveLength(3); expect(view.target).toHaveLength(3);
        expect([...view.pos, ...view.target].every(Number.isFinite)).toBe(true);
        expect(view.pos).not.toEqual(view.target);
      }
    }
  });

  it('renders every layer of every parent card and all anatomy with valid numeric viewer URLs', () => {
    const inventory = partInventory(C) as { scene: { id: string }; parts: Part[] }[], html = renderParts(C);
    const expectedAssemblies = inventory.flatMap(({ scene, parts }) => parts.map(part => `${scene.id}:${part.id}`));
    expect(captures(html, /data-part-entry="([^"]+)"/g)).toEqual(expectedAssemblies);
    const urls = captures(html, /class="part-open" href="([^"]+)"/g);
    expect(urls).toHaveLength(expectedAssemblies.length);
    const destinations = urls.map(href => {
      const url = new URL(href, 'https://example.test/guardian_ring/');
      expect(url.pathname).toBe('/guardian_ring/visualizer.html');
      const view = url.searchParams.get('view')!;
      expect(view).toMatch(/^\d+\.(light|data|heat)\.[a-z0-9-]+$/);
      const [level, mode, id] = view.split('.'), scene = C.SCENES[Number(level)], key = modes.find(row => row[0] === mode)![1];
      expect(cards(C, key, scene.id).some(part => part.id === id), view).toBe(true);
      return `${scene.id}:${id}`;
    });
    expect(destinations).toEqual(expectedAssemblies);
    const keys = captures(html, /data-src="([^"]+)"/g);
    expect([...keys].sort()).toEqual(claims.filter(claim => ['card', 'component'].includes(claim.group)).map(claim => claim.key).sort());
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(registry.has(key), key).toBe(true);
    expect(captures(html, /class="part-evidence-link" href="evidence.html#claim-([^"]+)"/g)).toEqual(keys);
    expect(new Set(captures(html, /\bid="([^"]+)"/g)).size).toBe(captures(html, /\bid="([^"]+)"/g).length);
  });

  it('gives the new glossary terms canonical, verified locators and unique anchors', () => {
    expect(COMPONENT_GLOSSARY).toHaveLength(15);
    const canonicalRefs = new Set(facts.flatMap(fact => fact.row[3].refs || []).map(ref => JSON.stringify(ref)));
    expect(new Set(COMPONENT_GLOSSARY.map(entry => entry[0])).size).toBe(COMPONENT_GLOSSARY.length);
    for (const [id, title, definition, refs] of COMPONENT_GLOSSARY as [string, string, string, string[][]][]) {
      expect(id).toMatch(/^[a-z][a-z0-9-]+$/); expect(title).toContain('('); expect(definition.length).toBeGreaterThan(40);
      expect(refs.length).toBeGreaterThan(0);
      for (const ref of refs) { expect(canonicalRefs.has(JSON.stringify(ref)), id).toBe(true); expect(sourceStatus(ref[0])).toBe('verified'); }
    }
  });
});
