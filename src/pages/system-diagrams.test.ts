import { describe, expect, it } from 'vitest';
import { content } from '../data.js';
import { compute } from '../model/engine';
import { allClaims } from '../claims.js';
import { renderParts } from './parts-content.js';
import { renderSystemDiagrams, SYSTEM_DIAGRAMS, systemDiagramReferences } from './system-diagrams.js';

describe('prerendered system diagrams', () => {
  it('renders every diagram with component links and evidence that resolve in the current catalog', () => {
    const model=compute(), current=content(model);
    const html=renderSystemDiagrams();
    const parts=renderParts(current);
    const claims=new Set(allClaims(model,current).map(claim=>claim.key));
    for(const diagram of SYSTEM_DIAGRAMS) expect(html).toContain(`id="diagram-${diagram.id}"`);
    const references=systemDiagramReferences();
    expect(references.length).toBeGreaterThan(0);
    for(const {scene,part,id} of references) {
      const anchor=`parts-${scene}-${part}`;
      expect(html).toContain(`href="#${anchor}"`);
      expect(parts).toContain(`id="${anchor}"`);
      expect(parts).toContain(`id="component-${scene}-${part}-${id}"`);
      expect(claims.has(`component:${scene}:${part}:${id}:0`),`${scene}/${part}/${id}`).toBe(true);
    }
  });
});
