// Manual lesson steps inspect an authored part view; continuous playback uses
// the overview. These are editorial links to existing component IDs, not a
// guess based on matching a phase name to geometry or a hardware claim.
const focus = {
  satellite: {
    light: { collect: 'instrument', readout: 'computer', transfer: 'links' },
    data: { command: 'computer', feedback: 'attitude', readout: 'instrument', transfer: 'links' },
    heat: { power: 'power', reject: 'radiator', radiate: 'radiator' },
  },
  payload: {
    light: { command: 'controller', slew: 'scan-system', feedback: 'scan-system', collect: 'optics', absorb: 'detector', integrate: 'detector', readout: 'readout', digitize: 'digitizer', transfer: 'data-interface' },
    data: { command: 'controller', feedback: 'scan-system', readout: 'readout', digitize: 'digitizer', transfer: 'data-interface' },
    // Heat from several enclosures converges on a radiator that is visible in
    // the overview but has no separate selectable part. The thermal part's
    // heat-layer view inspects the cooler control electronics instead.
    heat: { power: 'power', sense: 'thermal', lift: 'thermal', reject: null, radiate: null },
  },
  'focal-plane': {
    light: { collect: 'array', absorb: 'array', integrate: 'array', readout: 'readout', digitize: 'readout', transfer: 'readout' },
    data: { command: 'bias-timing', readout: 'readout', digitize: 'readout', transfer: 'readout' },
    // Both the cold assembly and warm readout send heat beyond this close-up;
    // its radiator belongs to the larger instrument, not a local part.
    heat: { power: 'thermal-feedback', sense: 'thermal-feedback', lift: 'cold-stage', reject: null },
  },
  pixel: {
    light: { collect: 'absorber', absorb: 'absorber', integrate: 'readout', readout: 'readout', transfer: 'output' },
    data: { collect: 'absorber', absorb: 'absorber', integrate: 'readout', readout: 'readout', transfer: 'output' },
    heat: { lift: 'absorber', reject: 'support' },
  },
  plume: {
    // The emission beat shows both molecular examples, not a single molecule.
    light: { emit: null, timeline: 'timeline' },
    data: { emit: null, timeline: 'timeline' },
    heat: { emit: 'source' },
  },
  ground: {
    // These final beats branch among processing, operations and archive
    // equipment, or show dissipation from several cabinets together.
    light: { receive: 'receive', readout: 'receiver', transfer: null },
    data: { receive: 'receive', readout: 'receiver', transfer: null },
    heat: { power: 'power', reject: null },
  },
  abi: {
    light: { command: 'scan-system', slew: 'scan-system', feedback: 'scan-system', collect: 'telescope', reference: 'calibration', readout: 'readout', digitize: 'readout', transfer: 'controller' },
    data: { command: 'controller', feedback: 'scan-system', readout: 'readout', digitize: 'readout', transfer: 'controller' },
    heat: { power: 'power', sense: 'thermal', lift: 'thermal', reject: 'thermal', radiate: 'thermal' },
  },
  tirs2: {
    // Space is a reference direction selected by the mirror, not an installed
    // target. The blackbody is a real separate component in this drawing.
    light: { earth: 'scene-select', blackbody: 'blackbody', space: 'scene-select', readout: 'readout', digitize: 'readout', transfer: 'electronics', return: 'scene-select' },
    data: { command: 'electronics', feedback: 'scene-select', readout: 'readout', digitize: 'readout', transfer: 'electronics' },
    heat: { power: 'electronics', sense: 'cooling', lift: 'cooling', reject: 'radiator', radiate: 'radiator' },
  },
  atmosphere: {
    light: { arrive: 'co2', absorb: 'co2', transmit: 'air' },
    data: { timeline: null },
    heat: { emit: 'h2o' },
  },
};

// A missing mapping is an authoring error. Only an explicitly authored null
// asks for the contextual overview, so new lesson phases cannot silently lose
// their intended inspection view.
export function teachingFocus(sceneId, mode, phaseId) {
  const phases = Object.hasOwn(focus, sceneId) && focus[sceneId]?.[mode];
  if (!phases || !Object.hasOwn(phases, phaseId)) throw new RangeError(`Missing teaching focus: ${sceneId}/${mode}/${phaseId}`);
  return phases[phaseId];
}

// One-shot part inspection uses the action that best demonstrates this
// component, not whichever phase happens to appear first in the full story.
// Absorption shows the array's detector response; collection describes optics.
const partActions = {
  abi: { light: { 'scan-system':'slew' }, heat: { thermal:'lift' } },
  payload: { heat: { thermal:'lift' } },
  'focal-plane': { light: { array:'absorb' } },
  tirs2: { heat: { cooling:'lift' } },
};
export function teachingPartPhase(sceneId, mode, partId, steps) {
  const action=partActions[sceneId]?.[mode]?.[partId];
  if(action){
    const index=steps.findIndex(step=>step.id===action);
    if(index<0||teachingFocus(sceneId,mode,action)!==partId)throw new RangeError(`Invalid part activity: ${sceneId}/${mode}/${partId}/${action}`);
    return index;
  }
  return steps.findIndex(step=>teachingFocus(sceneId,mode,step.id)===partId);
}
