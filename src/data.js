// IF's scene and card shape, deliberately empty of domain figures in Phase 0.
export { BASIS } from './evidence.js';
import { orbitsContent } from './level-content.js';
import { remainingContent } from './remaining-content.js';
// A level joins this set after its predecessor has passed the browser gates.
const LIVE = new Set(['orbits','satellite','payload','focal-plane']);
export const SCENES = [
  ['orbits', 'The ring'], ['satellite', 'The satellite'], ['payload', 'The payload'],
  ['focal-plane', 'The focal plane'], ['pixel', 'The pixel'], ['plume', 'The photon'],
  ['ground', 'Ground segment'], ['abi', 'Civil twin: ABI'], ['tirs2', 'Civil twin: TIRS-2'], ['atmosphere', 'The atmosphere'],
].map(([id, title], i) => ({ id, title, name: title, short: title.replace('The ', ''), scale: 'Placeholder · no physical scale', unit: 1, side: i >= 6,
  intro: 'This level is reserved for the source-reviewed explainer. The shape is a viewer test object, with no physical scale or sensor performance implied.' }));
export function content(model) {
  const parts = layer => Object.fromEntries(SCENES.map(scene => [scene.id, [{
    id: 'placeholder', title: `${layer} placeholder`, kicker: 'Scaffold only',
    body: 'The viewer, camera, layers, cards and evidence links are ready. Source review comes first; the look and geometry await Reed’s review.',
    specs: [],
  }]]));
  const levels = {orbits:orbitsContent(model),...remainingContent(model)};
  const layer = name => Object.fromEntries([...LIVE].map(id=>[id,levels[id][name]]));
  return { SCENES: SCENES.map(scene => LIVE.has(scene.id) ? {...scene, intro:levels[scene.id].intro, scale:levels[scene.id].scale,ready:true} : scene),
    PARTS: {...parts('Light'), ...layer('light')}, PARTS_DATA:{...parts('Data'), ...layer('data')}, PARTS_HEAT:{...parts('Heat'), ...layer('heat')} };
}
