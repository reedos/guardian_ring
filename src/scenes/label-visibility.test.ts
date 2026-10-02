import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { labelVisibility, labelController } from './label-visibility.js';

function fixture() {
  const label=new THREE.InstancedMesh(new THREE.PlaneGeometry(),new THREE.MeshBasicMaterial(),1);
  label.setMatrixAt(0,new THREE.Matrix4().makeScale(2,.5,1)); label.updateMatrixWorld(true);
  const camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(0,0,5);camera.lookAt(0,0,0);camera.updateMatrixWorld();
  const viewport={width:600,height:600};
  return {label,camera,viewport};
}
describe('printed component labels',()=>{
  it('rejects a covered edge even when the center is clear',()=>{
    const {label,camera,viewport}=fixture();
    const blocker=new THREE.Mesh(new THREE.BoxGeometry(.25,.3,.1),new THREE.MeshBasicMaterial());
    blocker.position.set(.82,.18,.2);blocker.updateMatrixWorld();
    expect(labelVisibility(label,camera,[],viewport).clear).toBe(true);
    expect(labelVisibility(label,camera,[blocker],viewport).reason).toContain('covered by');
  });
  it('hides reverse faces and print too small to read',()=>{
    const {label,camera,viewport}=fixture();
    camera.position.z=-5;camera.lookAt(0,0,0);camera.updateMatrixWorld();
    expect(labelVisibility(label,camera,[],viewport).reason).toContain('back face');
    camera.position.z=90;camera.lookAt(0,0,0);camera.updateMatrixWorld();
    expect(labelVisibility(label,camera,[],viewport).reason).toBe('too small');
  });
  it('catches narrow interior obstruction between the center and plate edge',()=>{
    const {label,camera,viewport}=fixture();
    const blocker=new THREE.Mesh(new THREE.BoxGeometry(.07,.05,.1),new THREE.MeshBasicMaterial());
    blocker.position.set(.4,.11,.2);blocker.updateMatrixWorld();
    expect(labelVisibility(label,camera,[blocker],viewport).reason).toContain('covered by');
  });
  it('removes text during camera movement and reevaluates after settling',()=>{
    const {label,camera,viewport}=fixture(),controller=labelController([label],[]);
    controller.update(camera,viewport);expect(label.visible).toBe(false);
    controller.update(camera,viewport);controller.update(camera,viewport);expect(label.visible).toBe(true);
    camera.position.x=1;camera.updateMatrixWorld();controller.update(camera,viewport);expect(label.visible).toBe(false);
  });
  it('restores labels before an imperceptible damping tail becomes bit-identical',()=>{
    const {label,camera,viewport}=fixture(),controller=labelController([label],[]);
    for(let frame=0;frame<100;frame++){
      camera.position.x=.2*(1-Math.pow(.9,frame));camera.lookAt(0,0,0);camera.updateMatrixWorld();controller.update(camera,viewport);
    }
    expect(camera.position.x).not.toBe(.2);
    expect(label.visible).toBe(true);
  });
  it('reevaluates when a scene control covers otherwise readable print',()=>{
    const {label,camera,viewport}=fixture(),controller=labelController([label],[]);
    for(let i=0;i<3;i++)controller.update(camera,viewport);
    expect(label.visible).toBe(true);
    const covered={...viewport,obstacles:[{left:250,right:350,top:250,bottom:350}]};
    for(let i=0;i<3;i++)controller.update(camera,covered);
    expect(label.visible).toBe(false);
    expect(label.userData.readability.reason).toContain('scene controls');
    for(let i=0;i<3;i++)controller.update(camera,viewport);
    expect(label.visible).toBe(true);
  });
});
