import * as THREE from 'three';

// Specular reflection of a unit direction at a unit surface normal. This local
// ray demonstration makes no statement about the instrument optical prescription.
export function reflectedDirection(incoming,normal) {
  const d=new THREE.Vector3(...incoming).normalize(),n=new THREE.Vector3(...normal).normalize();
  if(!d.lengthSq()||!n.lengthSq())throw new Error('Reflection needs nonzero direction and normal');
  return d.reflect(n).toArray();
}
export function createMirrorDemo(node,normal,{surfaceOffset=0}={}) {
  const positions=new Float32Array(12),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const line=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color:'#e6ba82',transparent:true,opacity:.9,depthWrite:false}));
  line.userData.teachingOverlay=true;line.userData.solidForCamera=false;line.name='Local reflection-law demonstration';line.frustumCulled=false;
  const q=new THREE.Quaternion(),p=new THREE.Vector3(),n=new THREE.Vector3(),incoming=new THREE.Vector3(0,0,-1);
  return {line,update(state){
    line.visible=!state.inspection&&state.step.id==='slew';if(!line.visible)return;
    node.getWorldPosition(p);node.getWorldQuaternion(q);n.set(...normal).normalize().applyQuaternion(q);
    // The mechanical shaft can be behind the reflective exterior. Keep the
    // ray interaction on that authored face as it turns about the shaft.
    p.addScaledVector(n,surfaceOffset);
    const start=p.clone().addScaledVector(incoming,-.80),end=p.clone().addScaledVector(incoming.clone().reflect(n),.80);
    positions.set(start.toArray(),0);positions.set(p.toArray(),3);positions.set(p.toArray(),6);positions.set(end.toArray(),9);geometry.attributes.position.needsUpdate=true;
  }};
}
