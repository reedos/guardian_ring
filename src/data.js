// IF's scene and card shape, deliberately empty of domain figures in Phase 0.
export { BASIS } from './evidence.js';
export const SCENES = [
  ['orbits', 'The ring'], ['satellite', 'The satellite'], ['payload', 'The payload'],
  ['focal-plane', 'The focal plane'], ['pixel', 'The pixel'], ['plume', 'The photon'],
  ['ground', 'Ground segment'], ['abi', 'Civil twin: ABI'], ['tirs2', 'Civil twin: TIRS-2'], ['atmosphere', 'The atmosphere'],
].map(([id, title], i) => ({ id, title, name: title, short: title.replace('The ', ''), scale: 'Placeholder · no physical scale', unit: 1, side: i >= 6,
  intro: 'This level is reserved for the source-reviewed explainer. The shape is a viewer test object, with no physical scale or sensor performance implied.' }));
export function content(_model) {
  const parts = layer => Object.fromEntries(SCENES.map(scene => [scene.id, [{
    id: 'placeholder', title: `${layer} placeholder`, kicker: 'Scaffold only',
    body: 'The viewer, camera, layers, cards and evidence links are ready. Source review comes first; the look and geometry await Reed’s review.',
    specs: [],
  }]]));
  return { SCENES, PARTS: parts('Light'), PARTS_DATA: parts('Data'), PARTS_HEAT: parts('Heat') };
}
