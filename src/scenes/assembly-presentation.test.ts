import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { createAssemblyPresentation } from './assembly-presentation.js';

function fixture() {
  const asset = new THREE.Group();
  asset.position.set(1, 2, 3); asset.rotation.y = .3;
  const physical = (name: string, role = '') => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.8, .1, .6), new THREE.MeshStandardMaterial());
    mesh.name = name; mesh.userData.assetRole = role; mesh.userData.solidForCamera = true;
    mesh.position.set(asset.children.length * .4, .5, -.3); asset.add(mesh);
    return mesh;
  };
  const sensorCover = physical('SensorCover');
  const electronicsCover = new THREE.Group(); electronicsCover.name = 'ElectronicsCover'; asset.add(electronicsCover);
  const lid = physical('Electronics lid', 'ElectronicsCover'), fasteners = physical('Cover fasteners');
  electronicsCover.attach(lid); electronicsCover.attach(fasteners);
  const coolerCover = [physical('Cooler cover panel', 'CoolerCover'), physical('Cooler cover lip', 'CoolerCover')];
  const similarName = physical('ElectronicsCoverMount', 'CoolerCoverMount');
  const board = physical('Instrument controller'), harness = physical('Mounted harness'), thermalContact = physical('Thermal contact');
  const assemblies = [
    { id: 'sensor', title: 'Sensor Unit Electronics', coverRole: 'SensorCover', partIds: ['readout', 'digitizer'], roles: ['VideoProcessor'], anchor: 'SensorAnchor' },
    { id: 'electronics', title: 'Electronics Unit', coverRole: 'ElectronicsCover', partIds: ['controller', 'power'], roles: ['Controller', 'Power'], anchor: [2, 1, 0] },
    { id: 'cooler', title: 'Cryocooler Control Electronics', coverRole: 'CoolerCover', partIds: ['cooler-control'], roles: ['CoolerController'], anchor: 'CoolerAnchor' },
  ];
  asset.updateMatrixWorld(true);
  const onChange = vi.fn(), presentation = createAssemblyPresentation({ asset, assemblies, onChange });
  return { asset, assemblies, onChange, presentation, covers: [sensorCover, electronicsCover, ...coolerCover],
    internals: [board, harness, thermalContact], similarName, lid, fasteners };
}

describe('instrument assembly presentation', () => {
  it('removes every explicit cover without moving mounted hardware or changing camera solids', () => {
    const { asset, presentation, covers, internals, similarName, onChange } = fixture();
    const nodes: THREE.Object3D[] = []; asset.traverse(object => nodes.push(object));
    const transforms = nodes.map(object => object.matrixWorld.toArray());
    const materials = internals.map(object => object.material);
    expect(presentation.state().view).toBe('assembled');
    expect(covers.every(cover => cover.visible)).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(presentation.setView('inside')).toBe(true);
    expect(covers.every(cover => !cover.visible)).toBe(true);
    expect(internals.every(object => object.visible)).toBe(true);
    expect(similarName.visible).toBe(true);
    asset.updateMatrixWorld(true);
    expect(nodes.map(object => object.matrixWorld.toArray())).toEqual(transforms);
    expect(internals.map(object => object.material)).toEqual(materials);
    expect(nodes.filter(object => 'isMesh' in object).every(object => object.userData.solidForCamera)).toBe(true);
    expect(presentation.setView('assembled')).toBe(true);
    expect(covers.every(cover => cover.visible)).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('reveals only known internal parts and reports which pins can be shown', () => {
    const { presentation, onChange } = fixture();
    expect(presentation.isPartVisible('controller')).toBe(false);
    expect(presentation.isPartVisible('optics')).toBe(true);
    expect(presentation.revealPart('optics')).toBe(false);
    expect(presentation.revealPart('unknown-part')).toBe(false);
    expect(presentation.state().view).toBe('assembled');
    expect(presentation.revealPart('controller')).toBe(true);
    expect(presentation.isPartVisible('controller')).toBe(true);
    expect(presentation.isPartVisible('digitizer')).toBe(true);
    expect(presentation.revealPart('digitizer')).toBe(false);
    expect(presentation.setView('inside')).toBe(false);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('opens before playback and restores independent snapshots without changing its definitions', () => {
    const { presentation, assemblies } = fixture();
    const assembled = presentation.capture();
    presentation.preparePlayback();
    const inside = presentation.capture();
    expect(inside).toEqual({ view: 'inside' });
    expect(presentation.restore(assembled)).toBe(true);
    expect(presentation.capture()).toEqual({ view: 'assembled' });
    expect(presentation.restore(inside)).toBe(true);
    const state = presentation.state(); state.assemblies[0].partIds.push('optics');
    assemblies[0].partIds.push('external');
    presentation.setView('assembled');
    expect(presentation.revealPart('optics')).toBe(false);
    expect(presentation.revealPart('external')).toBe(false);
    expect(presentation.state().assemblies[0].partIds).toEqual(['readout', 'digitizer']);
  });

  it('preserves individual cover-child visibility under a named role parent', () => {
    const { presentation, lid, fasteners } = fixture();
    fasteners.visible = false;
    presentation.setView('inside'); presentation.setView('assembled');
    expect(lid.visible).toBe(true);
    expect(fasteners.visible).toBe(false);
  });

  it('rejects invalid state changes without mutating covers or notifying observers', () => {
    const { presentation, covers, onChange } = fixture();
    expect(() => presentation.setView('exploded')).toThrow(RangeError);
    expect(() => presentation.restore({ view: 'unknown' })).toThrow(RangeError);
    expect(presentation.state().view).toBe('assembled');
    expect(covers.every(cover => cover.visible)).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('fails before mutating the asset when a cover role is missing or only a prefix matches', () => {
    const { asset, assemblies, covers } = fixture();
    covers[0].visible = false;
    expect(() => createAssemblyPresentation({ asset, assemblies: [...assemblies, {
      id: 'missing', title: 'Missing assembly', coverRole: 'Electronics', partIds: [],
    }] })).toThrow('Missing assembly cover role: Electronics');
    expect(covers[0].visible).toBe(false);
    const empty = new THREE.Group(); empty.name = 'EmptyCover'; asset.add(empty);
    expect(() => createAssemblyPresentation({ asset, assemblies: [{
      id: 'empty', title: 'Empty assembly', coverRole: 'EmptyCover', partIds: [],
    }] })).toThrow('Missing assembly cover role: EmptyCover');
  });
});
