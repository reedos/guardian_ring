import { describe, expect, it } from 'vitest';
import { content } from './data.js';
import { compute } from './model/engine';
import { allClaims } from './claims.js';
import { problems } from './evidence.js';
import { SOURCES } from './sources.js';
import { INSTRUMENT_ASSEMBLIES, PAYLOAD_ASSEMBLY_FOR_PART, INSTRUMENT_INTERFACES, INTEGRATION_CLAIMS } from './instrument-integration.js';
import { renderSystemDiagrams } from './pages/system-diagrams.js';
import { partInventory, renderParts } from './pages/parts-content.js';
type PayloadPart = { id: string; assembly: (typeof INSTRUMENT_ASSEMBLIES)[number]; assemblyNote: string };

describe('instrument packaging and integration boundaries', () => {
  const model = compute(), C = content(model);
  it('keeps each stable payload detail under one physical teaching group in navigation order', () => {
    const ids = ['optics','baffles','detector','readout','digitizer','controller','thermal','scan-system','mechanisms','calibration','aft-optics','data-interface','power'];
    expect(INSTRUMENT_ASSEMBLIES.flatMap(group => group.parts).sort()).toEqual([...ids].sort());
    for (const key of ['PARTS','PARTS_DATA','PARTS_HEAT'] as const) {
      const parts = C[key].payload as PayloadPart[];
      expect(parts.map(part => part.id).sort()).toEqual([...ids].sort());
      expect(parts.map(part => part.id)).toEqual((C.PARTS.payload as PayloadPart[]).map(part => part.id));
      const order = parts.map(part => INSTRUMENT_ASSEMBLIES.findIndex(group => group.id === part.assembly.id));
      expect(order).toEqual([...order].sort());
      for (const part of parts) expect(part.assembly).toBe(PAYLOAD_ASSEMBLY_FOR_PART[part.id]);
    }
    expect(PAYLOAD_ASSEMBLY_FOR_PART.digitizer.id).toBe('sensor');
    expect(PAYLOAD_ASSEMBLY_FOR_PART.power.id).toBe('electronics');
    expect(PAYLOAD_ASSEMBLY_FOR_PART['data-interface'].id).toBe('electronics');
    for (const id of ['scan-system','controller','thermal']) expect((C.PARTS.payload as PayloadPart[]).find(part => part.id === id)!.assemblyNote.length).toBeGreaterThan(40);
  });

  it('retains the assembly context in the shared catalog and exposes only resolvable evidence', () => {
    const inventory = partInventory(C) as { scene: { id: string }; parts: PayloadPart[] }[];
    const entries = inventory.find(group => group.scene.id === 'payload')!.parts;
    const html = renderParts(C), diagrams = renderSystemDiagrams();
    const claims = new Map(allClaims(model, C).map(claim => [claim.key, claim]));
    for (const entry of entries) expect(html).toContain(`${entry.assembly.title} / Component detail`);
    for (const key of [...diagrams.matchAll(/data-src="([^"]+)"/g)].map(match => match[1])) expect(claims.has(key), key).toBe(true);
    for (const claim of INTEGRATION_CLAIMS) expect(problems(claim, SOURCES)).toEqual([]);
    for (const item of INSTRUMENT_INTERFACES) expect(claims.has(`integration:${item.fact}`)).toBe(true);
    expect(diagrams).toContain('Physical assembly view / ABI civil example');
    expect(diagrams).toContain('Who supplies it, and who integrates it?');
    expect(diagrams).toContain('inside Main Electronics Boxes');
  });
});
