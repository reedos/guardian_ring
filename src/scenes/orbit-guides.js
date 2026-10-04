import * as THREE from 'three';

// Nonphysical diagram lines use the same compressed drawing coordinates as
// build-orbits.py. A world-space bevel becomes a wall when a follow camera
// approaches it; a one-pixel line keeps its weight at every camera distance.
export function orbitGuidePoints(name) {
  const family = name.split('-')[0], index = Number(name.split('-')[2] || 1) - 1;
  const longitude = ({ geo:[0], heo:[-.52,.90], meo:[-.40,1.12], leo:[-.48,.64,1.75] })[family]?.[index];
  if (longitude === undefined) throw new Error(`Unknown authored orbit guide: ${name}`);
  return Array.from({length:240}, (_,i) => {
    const phase=i*Math.PI*2/240, c=Math.cos(longitude), s=Math.sin(longitude);
    if(family==='heo') {
      const x=2.2*Math.sqrt(.75)*Math.cos(phase), z=2.2*Math.sin(phase)+1.1;
      return new THREE.Vector3(x*c,z,-x*s);
    }
    const radius=({geo:2.5,meo:1.83,leo:1.2})[family];
    const inclination=({geo:0,meo:51,leo:74})[family]*Math.PI/180;
    const x=radius*Math.cos(phase), y=radius*Math.sin(phase)*Math.cos(inclination), z=radius*Math.sin(phase)*Math.sin(inclination);
    return new THREE.Vector3(x*c-y*s,z,-(x*s+y*c));
  });
}

export function replaceOrbitGuideTubes(asset) {
  const guides=[];
  asset.traverse(node=>{if(node.isMesh&&node.userData.role==='schematic-orbit-guide')guides.push(node);});
  for(const mesh of guides) {
    const material=new THREE.LineBasicMaterial({color:mesh.material.color,transparent:true,opacity:.65,
      blending:THREE.AdditiveBlending,depthWrite:false,linewidth:1});
    const line=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(orbitGuidePoints(mesh.name)),material);
    line.name=mesh.name;line.userData={...mesh.userData,teachingOverlay:true,solidForCamera:false};
    line.position.copy(mesh.position);line.quaternion.copy(mesh.quaternion);line.scale.copy(mesh.scale);
    mesh.parent.add(line);mesh.removeFromParent();mesh.material.dispose();
  }
}
