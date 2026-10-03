// Dimensionless ideal prime-focus geometry. The parabolic surface is a
// mathematical demonstration, not a prescription for the representative payload.
import { Vector3 } from 'three';
export function parabolicRay(x,y,{f=1.5,entry=4.4}={}) {
  if(![x,y,f,entry].every(Number.isFinite)||f<=0)throw new RangeError('Finite coordinates and a positive focal length are required');
  const z=(x*x+y*y)/(4*f);
  if(entry<=z)throw new RangeError('The entry plane must be ahead of the mirror');
  const hit=new Vector3(x,y,z),normal=new Vector3(-x/(2*f),-y/(2*f),1).normalize();
  const incoming=new Vector3(0,0,-1),outgoing=incoming.clone().reflect(normal);
  const focus=new Vector3(0,0,f),start=new Vector3(x,y,entry);
  return {points:[start.toArray(),hit.toArray(),focus.toArray()],normal:normal.toArray(),incoming:incoming.toArray(),outgoing:outgoing.toArray(),length:start.distanceTo(hit)+hit.distanceTo(focus)};
}

// All on-axis paths share entry + f length. Sampling by distance therefore
// shows the same propagation pace before and after reflection, and simultaneous
// arrival at the ideal focus for a plane wavefront.
export function pointOnFocusRay(ray,progress) {
  const [start,hit,focus]=ray.points.map(p=>new Vector3(...p));
  const incoming=start.distanceTo(hit),distance=Math.max(0,Math.min(1,progress))*ray.length;
  return distance<=incoming?start.lerp(hit,distance/incoming).toArray():hit.lerp(focus,(distance-incoming)/(ray.length-incoming)).toArray();
}

export function focusPulseState(rays,progress) {
  const leading=progress/.8;
  const firstReflection=Math.min(...rays.map(ray=>new Vector3(...ray.points[0]).distanceTo(new Vector3(...ray.points[1]))/ray.length));
  return {leading,glow:leading<1?0:Math.max(0,Math.sin(Math.PI*(progress-.8)/.2)),
    phase:leading<firstReflection?'incoming':leading<1?'reflecting':'arriving'};
}
