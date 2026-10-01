import {describe,it,expect,vi} from 'vitest';
import * as THREE from 'three';
import {disposeScene} from './fx.js';

describe('scene resource lifetime',()=>{
  it('releases owned label maps once and retains shared imported textures for rebuilds',()=>{
    const scene=new THREE.Scene(), geometry=new THREE.BoxGeometry();
    const label=new THREE.Texture();label.userData.sceneOwned=true;
    const imported=new THREE.Texture();
    const printed=new THREE.MeshStandardMaterial({map:label,emissiveMap:label});
    const hardware=new THREE.MeshStandardMaterial({map:imported});
    scene.add(new THREE.Mesh(geometry,printed),new THREE.Mesh(geometry,printed),new THREE.Mesh(geometry,hardware));
    const labelDisposed=vi.spyOn(label,'dispose'), importedDisposed=vi.spyOn(imported,'dispose');
    const geometryDisposed=vi.spyOn(geometry,'dispose'), materialDisposed=vi.spyOn(printed,'dispose');
    disposeScene(scene);
    expect(labelDisposed).toHaveBeenCalledTimes(1);
    expect(importedDisposed).not.toHaveBeenCalled();
    expect(geometryDisposed).toHaveBeenCalledTimes(1);
    expect(materialDisposed).toHaveBeenCalledTimes(1);
  });
});
