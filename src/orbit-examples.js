import { compute } from './model/engine.ts';
import { evOf } from './evidence.js';

// Fixed physical examples accompany follow views without changing the reader's
// Scenario inputs. Neither speed nor altitude is measured from the compressed
// drawing or from its magnified spacecraft proxy.
export const ORBIT_EXAMPLES = Object.fromEntries(['geo','leo'].map(orbit=>[orbit,compute({orbit})]));
export const ORBIT_EXAMPLE_CLAIMS = Object.entries(ORBIT_EXAMPLES).flatMap(([orbit,model])=>
  ['orbitSpeedKmS','altitudeKm'].map(id=>{
    const row=model.claims[id];
    return {key:`orbit-example:${orbit}:${id}`,group:'orbit-example',label:`${orbit.toUpperCase()} example: ${row[0]}`,value:row[1],basis:row[2],ev:evOf(row),scope:'Fixed circular teaching example, independent of the current Scenario inputs. Drawing distances, spacecraft sizes, and playback pace are illustrative.'};
  }));
