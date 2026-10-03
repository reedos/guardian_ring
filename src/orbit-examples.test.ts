import { describe, expect, it } from 'vitest';
import { ORBIT_EXAMPLE_CLAIMS, ORBIT_EXAMPLES } from './orbit-examples.js';
import { allClaims } from './claims.js';
import { compute } from './model/engine';
import { content } from './data.js';
import { problems } from './evidence.js';
import { SOURCES } from './sources.js';

describe('orbital follow evidence',()=>{
  it('keeps fixed follow examples distinct from a reader’s HEO scenario',()=>{
    const model=compute({orbit:'heo'}),claims=allClaims(model,content(model));
    for(const sample of ORBIT_EXAMPLE_CLAIMS){
      expect(claims.find(row=>row.key===sample.key)).toEqual(sample);
      expect(problems(sample,SOURCES,true)).toEqual([]);
    }
    expect(ORBIT_EXAMPLES.leo.outputs.orbitSpeedKmS).toBeGreaterThan(ORBIT_EXAMPLES.geo.outputs.orbitSpeedKmS);
    expect(ORBIT_EXAMPLES.geo.outputs.orbitSpeedKmS).toBeGreaterThan(model.outputs.orbitSpeedKmS);
    expect(model.scenario.orbit).toBe('heo');
  });
});
