import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { fitComponent } from './component-frame.js';

const preset={pos:[6,8,9],target:[1,.4,-.2],focus:[1,.6,-.1],detailSize:[2.8,.8,1.6],minDistance:2};
const safe={x0:-.8,x1:.86,y0:-.7,y1:.55};
const cameraFor=(frame:{pos:number[];target:number[]},width:number,height:number)=>{
  const camera=new PerspectiveCamera(width/height<.9?48:35,width/height,.001,1000000);
  camera.position.fromArray(frame.pos);camera.lookAt(new Vector3(...frame.target));camera.updateMatrixWorld();return camera;
};

describe('component framing uses the available canvas',()=>{
  it('leaves authored context and overview views unchanged',()=>{
    const context={pos:[8,5,10],target:[0,1,0]};expect(fitComponent(context,390,420)).toBe(context);
  });
  it.each([[1000,700],[390,420],[390,140],[667,190]])('fits every subject corner at %i by %i', (width,height)=>{
    // Exercise both a caller override and an authored label lane. Resizing
    // should retain the scene's lane when the stage supplies only limits.
    for(const frame of [fitComponent(preset,width,height,{safe}),fitComponent({...preset,safe},width,height,{minDistance:0,maxDistance:30})]){
      const camera=cameraFor(frame,width,height);
      for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1]){
        const p=new Vector3(preset.focus[0]+x*1.4,preset.focus[1]+y*.4,preset.focus[2]+z*.8).project(camera);
        expect(p.x).toBeGreaterThanOrEqual(safe.x0);expect(p.x).toBeLessThanOrEqual(safe.x1);
        expect(p.y).toBeGreaterThanOrEqual(safe.y0);expect(p.y).toBeLessThanOrEqual(safe.y1);
      }
      expect(new Vector3(...frame.pos).distanceTo(new Vector3(...frame.target))).toBeLessThan(new Vector3(...preset.pos).distanceTo(new Vector3(...preset.target)));
    }
  });
  it('retains the safe authored viewing direction and does not mutate the preset',()=>{
    const original=structuredClone(preset),frame=fitComponent(preset,390,420,{safe});
    const expected=new Vector3(...preset.pos).sub(new Vector3(...preset.target)).normalize();
    const actual=new Vector3(...frame.pos).sub(new Vector3(...frame.target)).normalize();
    expect(actual.distanceTo(expected)).toBeLessThan(1e-10);expect(preset).toEqual(original);
  });
  it('respects both the authored housing clearance floor and control limits',()=>{
    const tiny={pos:[0,1,4],target:[0,0,0],detailSize:[.2,.2,.2],minDistance:2.4};
    for(const [minDistance,want] of [[1,2.4],[3,3]]){
      const frame=fitComponent(tiny,800,600,{minDistance});
      expect(new Vector3(...frame.pos).distanceTo(new Vector3(...frame.target))).toBeCloseTo(want,8);
    }
    const frame=fitComponent(preset,390,420,{maxDistance:2.5});
    expect(new Vector3(...frame.pos).distanceTo(new Vector3(...frame.target))).toBeCloseTo(2.5,8);
  });
  it('rejects regions that would produce invalid poses',()=>{
    expect(()=>fitComponent({...preset,detailSize:[0,1,1]},390,420)).toThrow();
    expect(()=>fitComponent({...preset,pos:preset.target},390,420)).toThrow();
    expect(()=>fitComponent(preset,390,420,{safe:{x0:0,x1:0,y0:-.5,y1:.5}})).toThrow();
  });
});
