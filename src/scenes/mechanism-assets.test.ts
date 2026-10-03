import { describe,expect,it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; the app's TS environment is browser-only.
import { readFileSync } from 'node:fs';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Vector3 } from 'three';
const load=async (file:string)=>{const b=readFileSync(new URL(`../../public/models/${file}.glb`,import.meta.url));return (await new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'' )).scene;};
const cases:[string,string,string[]][]=[['payload','ScanSystem',['PayloadScanFirst','PayloadScanSecond']],['abi','ScanSystem',['ABIScanNorthSouth','ABIScanEastWest']],['tirs2','SceneSelect',['TIRSSceneSelect']]];
describe('authored moving faces preserve fixed mounting interfaces',()=>{
  for(const [file,role,pivots] of cases)it(`${file} moves only explicit pivot children and returns exactly to inspection`,async()=>{
    const asset=await load(file);asset.updateMatrixWorld(true);const parent=asset.getObjectByName(role)!;
    const fixed=parent.children.filter(o=>'isMesh' in o&&o.isMesh);expect(fixed.length).toBeGreaterThan(0);
    const before=fixed.map(o=>o.matrixWorld.toArray());
    for(const name of pivots){
      const pivot=asset.getObjectByName(name)!;expect(pivot).toBeTruthy();expect(pivot.parent).toBe(parent);expect(pivot.children.length).toBeGreaterThan(0);
      const child=pivot.children[0],rest=pivot.quaternion.clone(),point=new Vector3(.1,.2,.3).applyMatrix4(child.matrixWorld);
      pivot.rotateOnAxis(new Vector3(...pivot.userData.motionAxis),.2);asset.updateMatrixWorld(true);
      expect(new Vector3(.1,.2,.3).applyMatrix4(child.matrixWorld).distanceTo(point)).toBeGreaterThan(.001);
      expect(fixed.map(o=>o.matrixWorld.toArray())).toEqual(before);
      pivot.quaternion.copy(rest);asset.updateMatrixWorld(true);
      expect(new Vector3(.1,.2,.3).applyMatrix4(child.matrixWorld).distanceTo(point)).toBeLessThan(1e-10);
    }
  });
});
