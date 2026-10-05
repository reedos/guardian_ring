import {Vector3} from 'three';

// Dimensionless planes: an ideal reciprocal viewing ray, not ABI's optical
// prescription. Reverse these vertices to show incoming scene light.
const v=p=>new Vector3(...p);
export function scanRay(a=0,b=0,{twoAxes=true}={}) {
  if(![a,b].every(Number.isFinite)||Math.abs(a)>.16||Math.abs(b)>.16)throw new RangeError('Diagram angles must stay inside the illustrated aperture');
  const first=v([-1,0,0]),second=v([1,0,0]),start=v([-1,0,2.4]);
  const n1=v([1,0,1]).normalize().applyAxisAngle(v([0,1,0]),a);
  const n2=v([1,0,-1]).normalize().applyAxisAngle(v([1,0,1]).normalize(),b);
  const incoming=v([0,0,-1]),middle=incoming.clone().reflect(n1);
  const t=second.clone().sub(first).dot(n2)/middle.dot(n2);
  const hit=first.clone().addScaledVector(middle,t),outgoing=middle.clone().reflect(n2);
  const end=twoAxes?hit.clone().addScaledVector(outgoing,(2.4-hit.z)/outgoing.z):first.clone().addScaledVector(middle,(2.8-first.x)/middle.x);
  return {points:(twoAxes?[start,first,hit,end]:[start,first,end]).map(p=>p.toArray()),
    mirrors:(twoAxes?[{center:first,normal:n1},{center:second,normal:n2}]:[{center:first,normal:n1}]).map(m=>({center:m.center.toArray(),normal:m.normal.toArray()})),
    incoming:incoming.toArray(),middle:middle.toArray(),outgoing:outgoing.toArray(),a,b};
}

export function scanPose(progress,lesson) {
  const phase=2*Math.PI*progress;
  return {a:(lesson==='axes'?.11:.13)*Math.sin(phase),b:lesson==='axes'?.11*Math.sin(phase*2+Math.PI/4):0};
}

// Constant distance along connected straight segments, including reflections.
export function sampleScanPath(points,u) {
  const vertices=points.map(v),lengths=vertices.slice(1).map((p,i)=>p.distanceTo(vertices[i])),total=lengths.reduce((a,b)=>a+b,0);
  let distance=Math.max(0,Math.min(1,u))*total;
  for(let i=0;i<lengths.length;i++){
    if(distance<=lengths[i]||i===lengths.length-1)return vertices[i].clone().lerp(vertices[i+1],distance/lengths[i]).toArray();
    distance-=lengths[i];
  }
}
