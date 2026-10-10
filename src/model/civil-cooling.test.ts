import {describe,expect,it} from 'vitest';
import {compute,SCENARIO_OPTIONS} from './engine';
import {content} from '../data.js';
describe('separate ideal civil-temperature refrigerator',()=>{
  it('conserves energy and entropy at the reversible bound',()=>{
    const e=compute({}).examples.civilCooling;
    expect(e.minimumWorkW).toBeCloseTo(5.976744186046512,12);
    expect(e.rejectedHeatW).toBeCloseTo(6.976744186046512,12);
    expect(e.rejectedHeatW-e.minimumWorkW).toBe(e.heatRemovedW);
    expect(e.rejectedHeatW/e.hotTemperatureK).toBeCloseTo(e.heatRemovedW/e.coldTemperatureK,14);
  });
  it('keeps the general detector temperature unknown and shows computed rows on the cold-stage card',()=>{
    for(const detector of SCENARIO_OPTIONS.detector){
      const model=compute({detector:detector.id}),e=model.examples.civilCooling;
      expect(model.outputs.detectorTemperatureK).toBeNull();
      const card=content(model).PARTS_HEAT['focal-plane'].find((p:{id:string})=>p.id==='cold-stage');
      expect(card.body).toContain('not TIRS-2 cooler power');
      expect(card.specs.find((r:unknown[])=>r[0]==='Ideal-example minimum work')?.[1]).toBe(`${e.minimumWorkW.toFixed(3)} W`);
      expect(card.specs.some((r:unknown[])=>r[2]==='assumed' && (r[3] as {assume?:string})?.assume==='civil-cooling-example')).toBeTruthy();
    }
  });
});
