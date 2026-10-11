import { describe, expect, it } from 'vitest';
// @ts-expect-error Node I/O is provided by Vitest; the app's TS environment is browser-only.
import { readFileSync } from 'node:fs';
import { DRAWN_ORBITS, drawnOrbitPosition } from './orbit-motion.js';
import { HEO_INCLINATION, heoPlanePoint } from './orbit-guides.js';
describe('highly elliptical guides follow the generic Molniya geometry',()=>{
  it('tilts each plane 63.4 degrees and puts apogee at the northernmost latitude',()=>{
    for(const longitude of [-.52,.90]){
      const apogee=heoPlanePoint(0,2.2*1.5,longitude),r=Math.hypot(...apogee);
      expect(Math.asin(apogee[1]/r)*180/Math.PI).toBeCloseTo(63.4,6);
      expect(r).toBeCloseTo(3.3,10);
      const perigee=heoPlanePoint(0,-2.2*.5,longitude);
      expect(Math.asin(perigee[1]/Math.hypot(...perigee))*180/Math.PI).toBeCloseTo(-63.4,6);
      // No point of the plane reaches a higher latitude than the inclination.
      for(let k=0;k<360;k++){const a=k*Math.PI/180,p=heoPlanePoint(Math.cos(a),Math.sin(a),longitude);
        expect(Math.asin(p[1]/Math.hypot(...p))).toBeLessThanOrEqual(HEO_INCLINATION+1e-12);}
    }
  });
});
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
        // Apogee axis W and plane normal for the generic Molniya tilt.
        const ci=Math.cos(HEO_INCLINATION),si=Math.sin(HEO_INCLINATION);
        const height=-s*ci*x+si*y-c*ci*z, normal=s*si*x+ci*y+c*si*z;
        expect(normal).toBeCloseTo(0,10);
        expect(lateral*lateral/(orbit.a*orbit.a*(1-orbit.e*orbit.e))+(height-orbit.a*orbit.e)**2/(orbit.a*orbit.a)).toBeCloseTo(1,10);
        expect(Math.hypot(x,y,z)).toBeGreaterThan(1);      }else{
        expect(Math.hypot(x,y,z)).toBeCloseTo(orbit.a,10);
        const inclination='inclination' in orbit?Number(orbit.inclination):0;
        expect(y*Math.cos(inclination)-other*Math.sin(inclination)).toBeCloseTo(0,10);
      }
    }
  });
});
