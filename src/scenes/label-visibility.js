import * as THREE from 'three';

// Test the whole printed plate, not just its center. Surface lettering should
// disappear as a unit when a component covers it, never show sliced-up words.
export function labelVisibility(mesh, camera, solids, viewport) {
  const matrix = new THREE.Matrix4(); mesh.getMatrixAt(0, matrix); matrix.premultiply(mesh.matrixWorld);
  const center = new THREE.Vector3().applyMatrix4(matrix);
  const normal = new THREE.Vector3(0, 0, 1).transformDirection(matrix);
  if (normal.dot(camera.position.clone().sub(center).normalize()) < .25) return { clear:false, reason:'edge-on or back face' };
  const pixels = [];
  const ray = new THREE.Raycaster();
  for (const y of [-.48, -.24, 0, .24, .48]) for (const x of Array.from({length:11},(_,i)=>-.48+i*.096)) {
    const point = new THREE.Vector3(x, y, 0).applyMatrix4(matrix);
    const screen = point.clone().project(camera);
    if (screen.z < -1 || screen.z > 1 || Math.abs(screen.x) > .99 || Math.abs(screen.y) > .99) return { clear:false, reason:'outside view' };
    pixels.push([(screen.x+1)*viewport.width/2,(1-screen.y)*viewport.height/2]);
    const direction = point.clone().sub(camera.position), distance = direction.length();
    ray.set(camera.position, direction.normalize()); ray.far = distance - .001;
    const hit = ray.intersectObjects(solids, false).find(hit => {
      for (let o=hit.object;o;o=o.parent) if (!o.visible) return false;
      const material=Array.isArray(hit.object.material)?hit.object.material[hit.face?.materialIndex||0]:hit.object.material;
      return !material?.transparent || material.opacity >= .85;
    });
    if (hit) return { clear:false, reason:`covered by ${hit.object.name}` };
  }
  const height = Math.min(...Array.from({length:11},(_,i)=>Math.hypot(pixels[i][0]-pixels[i+44][0],pixels[i][1]-pixels[i+44][1])));
  // Below this size the textured print is only visual noise. The numbered pin,
  // part selector and component card retain the full accessible name.
  const readable=height>=9*(mesh.userData.textLines||1);
  const bounds={left:Math.min(...pixels.map(p=>p[0])),right:Math.max(...pixels.map(p=>p[0])),top:Math.min(...pixels.map(p=>p[1])),bottom:Math.max(...pixels.map(p=>p[1]))};
  if((viewport.obstacles||[]).some(p=>bounds.left<p.right&&bounds.right>p.left&&bounds.top<p.bottom&&bounds.bottom>p.top))return {clear:false,reason:'behind scene controls or note',height,bounds};
  return { clear:readable, reason:readable?'clear':'too small', height, bounds };
}

export function labelController(labels, solids) {
  let projection='', previous=null, checked=null, stable=0;
  const different=(a,b,positionTolerance,rotationTolerance)=>!a||b.some((value,i)=>Math.abs(value-a[i])>(i>=12&&i<=14?positionTolerance:rotationTolerance));
  return {
    update(camera, viewport) {
      const next=[...camera.matrixWorld.elements], framing=[...camera.projectionMatrix.elements,viewport.width,viewport.height,JSON.stringify(viewport.obstacles||[])].join(',');
      const moving=framing!==projection||different(previous,next,.0001,.00001);
      previous=next;projection=framing;
      if(moving){stable=0;checked=null;for(const mesh of labels)mesh.visible=false;return;}
      // OrbitControls approaches rest asymptotically. Subpixel damping must not
      // suppress labels for seconds while floating-point values finish settling.
      if(++stable<2||!different(checked,next,.001,.0001))return;
      for (const mesh of labels) {
        const result=labelVisibility(mesh,camera,solids,viewport);
        mesh.userData.readability=result; mesh.visible=result.clear;
      }
      checked=next;
    },
  };
}
