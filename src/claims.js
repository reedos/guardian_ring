// One claim registry shared by the cards, source popovers and audit.
import { evOf } from './evidence.js';
import { STORY_CLAIMS } from './story-claims.js';
import { ENGINEERING_CLAIMS } from './engineering-evidence.js';
export const LAYERS = [['light', 'PARTS'], ['data', 'PARTS_DATA'], ['heat', 'PARTS_HEAT']];
export function allClaims(model, content) {
  const out = [...STORY_CLAIMS, ...ENGINEERING_CLAIMS, ...Object.entries(model?.claims || {}).map(([id,row]) => ({ key:`model:${id}`, group:'model', label:row[0], value:row[1], basis:row[2], ev:evOf(row) }))];
  content.SCENES.forEach((scene, level) => {
    const componentsSeen = new Set();
    for (const [mode, key] of LAYERS) for (const part of content[key][scene.id] || []) {
      (part.specs || []).forEach((row, i) => out.push({ key: `card:${mode}:${scene.id}:${part.id}:${i}`, group: 'card', level, mode, scene, part,
        label: row[0], value: row[1], basis: row[2], ev: evOf(row) }));
      for(const component of part.components || []) {
        const id=`${part.id}:${component.id}`;
        if(componentsSeen.has(id)) continue;
        componentsSeen.add(id);
        (component.specs || []).forEach((row,i)=>out.push({key:`component:${scene.id}:${part.id}:${component.id}:${i}`,group:'component',level,scene,part,component,
          label:row[0],value:row[1],basis:row[2],ev:evOf(row)}));
      }
    }
  });
  return out;
}
export const claimByKey = (model, content, key) => allClaims(model, content).find(claim => claim.key === key) || null;
