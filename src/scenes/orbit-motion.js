import { meanAnomalyRadians, orbitalPlanePosition, SIDEREAL_DAY_SECONDS } from '../model/orbits.ts';
import { compute } from '../model/engine.ts';

// These parameters reproduce the unchanged build-orbits.py v3 guides exactly. They describe drawing
// guides, not the separate physical orbit examples or any observed spacecraft.
export const DRAWN_ORBITS = [
  ...[-.52,.90].map((longitude,i)=>({family:'heo',index:i+1,a:2.2,e:.5,longitude,phase:(51+i*7)*Math.PI*2/240})),
  ...[-.40,1.12].map((longitude,i)=>({family:'meo',index:i+1,a:1.83,e:0,inclination:51*Math.PI/180,longitude,phase:(21+i*87)*Math.PI*2/240})),
  ...[-.48,.64,1.75].map((longitude,i)=>({family:'leo',index:i+1,a:1.20,e:0,inclination:74*Math.PI/180,longitude,phase:(15+i*64)*Math.PI*2/240})),
];
const periods=Object.fromEntries(['heo','meo','leo'].map(orbit=>[orbit,compute({orbit}).outputs.orbitPeriodSeconds]));
export const DAY_PLAYBACK_SECONDS=2*Math.PI/.065;
export function drawnOrbitPosition(orbit,elapsedSeconds) {
  const period=DAY_PLAYBACK_SECONDS*periods[orbit.family]/SIDEREAL_DAY_SECONDS;
  // Authored HEO has apogee toward +Y. Rotate the focus-centered ellipse;
  // do not move the focus, or use the engine's different illustrative e here.
  const initialE=orbit.family==='heo'?orbit.phase+Math.PI/2:orbit.phase;
  const initialM=initialE-orbit.e*Math.sin(initialE);
  const p=orbitalPlanePosition(orbit.a,orbit.e,meanAnomalyRadians(elapsedSeconds,period,initialM));
  const c=Math.cos(orbit.longitude),s=Math.sin(orbit.longitude);
  if(orbit.family==='heo')return [p.y*c,-p.x,-p.y*s];
  const y=p.y*Math.cos(orbit.inclination),z=p.y*Math.sin(orbit.inclination);
  return [p.x*c-y*s,z,-(p.x*s+y*c)];
}
