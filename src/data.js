// IF's scene and card contract, populated by the source-reviewed teaching levels.
export { BASIS } from './evidence.js';
import { orbitsContent } from './level-content.js';
import { remainingContent } from './remaining-content.js';
import { focalContent } from './focal-content.js';
export const SCENES = [
  ['orbits', 'The ring'], ['satellite', 'The satellite'], ['payload', 'The payload'],
  ['focal-plane', 'The focal plane'], ['pixel', 'The pixel'], ['plume', 'The photon'],
  ['ground', 'Ground segment'], ['abi', 'Civil twin: ABI'], ['tirs2', 'Civil twin: TIRS-2'], ['atmosphere', 'The atmosphere'],
].map(([id, title], i) => ({ id, title, name: title, short: title.replace('The ', ''), unit: 1, side: i >= 6 }));
export function content(model) {
  const levels = {orbits:orbitsContent(model),...remainingContent(model),'focal-plane':focalContent()};
  const layer = name => Object.fromEntries(SCENES.map(({id})=>[id,levels[id][name]]));
  return { SCENES: SCENES.map(scene => ({...scene,intro:levels[scene.id].intro,scale:levels[scene.id].scale,ready:true})),
    PARTS:layer('light'),PARTS_DATA:layer('data'),PARTS_HEAT:layer('heat') };
}
