import { describe, expect, it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; the app's TS environment is browser-only.
import { readFileSync } from 'node:fs';
import { DRAWN_ORBITS, drawnOrbitPosition } from './orbit-motion.js';
describe('markers stay on the authored orbit guides',()=>{
  it('begins exactly at each existing GLB spacecraft position',()=>{
    const buffer=readFileSync(new URL('../../public/models/earth-orbits.glb',import.meta.url));
    const gltf=JSON.parse(buffer.subarray(20,20+buffer.readUInt32LE(12)).toString());
    for(const orbit of DRAWN_ORBITS){const name=`${orbit.family.toUpperCase()}_Satellite_${String(orbit.index).padStart(2,'0')}`;const node=gltf.nodes.find((n:{name:string})=>n.name===name);const p=drawnOrbitPosition(orbit,0);p.forEach((v:number,i:number)=>expect(v).toBeCloseTo(node.translation[i],5));}
  });
  it('preserves each guide plane and its circle or focus-offset ellipse',()=>{
    for(const orbit of DRAWN_ORBITS)for(let t=0;t<100;t+=.37){
      const [x,y,z]=drawnOrbitPosition(orbit,t),c=Math.cos(orbit.longitude),s=Math.sin(orbit.longitude);
      const lateral=x*c-z*s,other=-x*s-z*c;
      if(orbit.family==='heo'){
        expect(other).toBeCloseTo(0,10);
        expect(lateral*lateral/(orbit.a*orbit.a*(1-orbit.e*orbit.e))+(y-orbit.a*orbit.e)**2/(orbit.a*orbit.a)).toBeCloseTo(1,10);
        expect(Math.hypot(x,y,z)).toBeGreaterThan(1);
      }else{
        expect(Math.hypot(x,y,z)).toBeCloseTo(orbit.a,10);
        const inclination='inclination' in orbit?Number(orbit.inclination):0;
        expect(y*Math.cos(inclination)-other*Math.sin(inclination)).toBeCloseTo(0,10);
      }
    }
  });
});
