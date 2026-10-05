import {copyModel,preloadModel} from '../scenes/model-scene.js';
import {INK} from './cinematic-drawing.js';
import {smooth,between} from '../model/cinematic-physics.js';

// Reuse the NASA historical Blue Marble texture already packed in the authored
// Earth GLB. This small software sphere adds no WebGL context or new asset.
export async function prepareLessonEarth(){
  await preloadModel('models/earth-orbits.glb?v=4');
  const root=copyModel('models/earth-orbits.glb?v=4'),earth=root.getObjectByName('earth');
  const material=Array.isArray(earth.material)?earth.material[0]:earth.material,image=material.map.image;
  const map=document.createElement('canvas');map.width=512;map.height=256;
  const mc=map.getContext('2d',{willReadFrequently:true});mc.drawImage(image,0,0,512,256);const pixels=mc.getImageData(0,0,512,256).data;
  root.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});
  const sphere=document.createElement('canvas');sphere.width=192;sphere.height=192;
  const ctx=sphere.getContext('2d'),out=ctx.createImageData(192,192),surface=[];
  for(let y=0;y<192;y++)for(let x=0;x<192;x++){
    const u=(x-95.5)/95.5,v=(95.5-y)/95.5,r2=u*u+v*v;if(r2>1)continue;
    const z=Math.sqrt(1-r2),ny=v*.914+z*.406,nz=z*.914-v*.406;
    surface.push({index:(y*192+x)*4,lon:Math.atan2(u,nz),lat:Math.asin(ny),light:.42+.58*Math.max(0,u*-.5+v*.5+z*.707)});
  }
  let prior=-1;
  return (c,x,y,r,angle)=>{
    const frame=Math.round(angle*60);
    if(frame!==prior){prior=frame;
      for(const s of surface){const longitude=((s.lon-angle)/(Math.PI*2)+.5+100)%1,tx=Math.floor(longitude*512),ty=Math.min(255,Math.floor((.5-s.lat/Math.PI)*256)),idx=(ty*512+tx)*4;
        for(let k=0;k<3;k++)out.data[s.index+k]=pixels[idx+k]*s.light;out.data[s.index+3]=255;
      }ctx.putImageData(out,0,0);
    }
    c.save();c.shadowColor='#66b9ff';c.shadowBlur=17;c.drawImage(sphere,x-r,y-r,r*2,r*2);c.restore();
  };
}

export function drawGeo(d,earth){
  const {p,c,main,panel,text}=d,angle=p*Math.PI*2,blend=smooth(between(p,.36,.58)),viewAngle=angle*(1-blend)-d.yaw;
  // Orthographic globe, orbit and longitude marker share the same coordinate
  // transform. The texture's visible equator is y=.406*r*cos(longitude).
  function view(cx,cy,r,rotation,caption){
    const a=rotation+.6,sx=cx+2.55*r*Math.sin(a),sy=cy+2.55*r*.406*Math.cos(a),gx=cx+r*Math.sin(a),gy=cy+r*.406*Math.cos(a),front=Math.cos(a)>=0;
    c.strokeStyle='#e6ba8266';c.beginPath();c.ellipse(cx,cy,r*2.55,r*2.55*.406,0,0,Math.PI*2);c.stroke();
    const markers=()=>{d.path([[gx,gy],[sx,sy]],INK.light,1,.65);c.fillStyle=INK.light;c.beginPath();c.arc(sx,sy,4,0,Math.PI*2);c.fill();if(front){c.fillStyle=INK.heat;c.beginPath();c.arc(gx,gy,3,0,Math.PI*2);c.fill();}};
    if(!front)markers();
    if(earth)earth(c,cx,cy,r,rotation);else{c.fillStyle='#153f56';c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.fill();}
    if(front)markers();
    if(caption)text('GEO satellite',Math.max(12,Math.min(main.w-105,sx+9)),sy+18,INK.light,d.phone?10:12);
  }
  view(main.w*.5,main.h*.53,Math.min(main.w/5.8,main.h*.23),viewAngle,true);
  text(blend>.95?'EARTH-ROTATING VIEW':blend>.05?'CHANGING REFERENCE FRAME':'SPACE-FIXED VIEW',16,24,INK.white,d.phone?10:12);
  text('Always space-fixed',panel.x,panel.y,INK.white,d.phone?11:13);
  view(panel.x+panel.w*.5,panel.y+panel.h*.5,Math.min(panel.w/5.8,panel.h*.28),angle,false);
  text('Same motion · different frame',panel.x,panel.y+panel.h+10,INK.muted,d.phone?10:11);
}
