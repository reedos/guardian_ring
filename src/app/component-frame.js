import { PerspectiveCamera, Vector3 } from 'three';

// Adapted from IF's housing-frame.js: a component is fitted to the usable
// canvas, keeping the authored viewing direction and surrounding hardware.
// Inspection regions and minimum distances are drawing coordinates, not specs.
export function fitComponent(preset, width, height, {
  safe = { x0: -.82, x1: .82, y0: -.76, y1: .76 },
  minDistance = 0,
  maxDistance = Infinity,
} = {}) {
  if (!preset.detailSize) return preset;
  const focus = preset.focus || preset.target;
  if (![preset.pos,preset.target,focus,preset.detailSize].every(v => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite))
      || preset.detailSize.some(v => v <= 0)) throw new TypeError('A component frame needs finite vectors and positive region dimensions.');
  if (![safe.x0,safe.x1,safe.y0,safe.y1].every(Number.isFinite) || safe.x0 >= safe.x1 || safe.y0 >= safe.y1
      || safe.x0 <= -1 || safe.x1 >= 1 || safe.y0 <= -1 || safe.y1 >= 1) throw new RangeError('A component frame needs a usable region inside the canvas.');
  const floor = Math.max(0, minDistance, preset.minDistance || 0);
  if (!Number.isFinite(floor) || Number.isNaN(maxDistance) || maxDistance <= 0 || floor > maxDistance) throw new RangeError('Invalid component camera distance limits.');
  const aspect = Math.max(1,width) / Math.max(1,height);
  const camera = new PerspectiveCamera(aspect < .9 ? 48 : 35, aspect, .001, 1000000);
  const direction = new Vector3(...preset.pos).sub(new Vector3(...preset.target));
  if (direction.lengthSq() < 1e-12) throw new RangeError('A component camera needs an authored viewing direction.');
  direction.normalize();
  const center = new Vector3(...focus), corners = [];
  for (const x of [-1,1]) for (const y of [-1,1]) for (const z of [-1,1]) {
    corners.push(center.clone().add(new Vector3(x*preset.detailSize[0]/2,y*preset.detailSize[1]/2,z*preset.detailSize[2]/2)));
  }
  camera.position.copy(center).add(direction);camera.lookAt(center);camera.updateMatrixWorld();
  const right = new Vector3().setFromMatrixColumn(camera.matrixWorld,0), up = new Vector3().setFromMatrixColumn(camera.matrixWorld,1);
  const tanY = Math.tan(camera.fov*Math.PI/360), midX=(safe.x0+safe.x1)/2, midY=(safe.y0+safe.y1)/2;
  const target = new Vector3();
  const place = distance => {
    target.copy(center).addScaledVector(right,-midX*distance*tanY*aspect).addScaledVector(up,-midY*distance*tanY);
    camera.position.copy(target).addScaledVector(direction,distance);camera.lookAt(target);camera.updateMatrixWorld();
    return corners.every(point => {
      const p=point.clone().project(camera);
      return p.z>-1 && p.z<1 && p.x>=safe.x0 && p.x<=safe.x1 && p.y>=safe.y0 && p.y<=safe.y1;
    });
  };
  let low=0, high=Math.max(1,new Vector3(...preset.detailSize).length());
  while (!place(high) && high<100000) high*=2;
  for(let i=0;i<32;i++){const mid=(low+high)/2;if(place(mid))high=mid;else low=mid;}
  // Never force an eye through a housing to fill more pixels. The authored
  // floor also leaves a little context around very small or recessed subjects.
  place(Math.min(maxDistance,Math.max(floor,high*1.015)));
  return {...preset,pos:camera.position.toArray(),target:target.toArray()};
}
