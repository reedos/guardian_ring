import {Vector3} from 'three';
import {scanRay,scanPose,sampleScanPath} from '../model/scan-optics.js';

export const SCAN_LESSONS={
  reflection:{title:'How a scan mirror reflects light',body:'Light reflects into the fixed telescope entrance. The green dashed normal turns with the mirror; incidence and reflection angles stay equal.'},
  sweep:{title:'Turn the mirror. Move the view.',body:'Tilt the mirror and watch the viewed direction sweep. The blue trace records directions visited, not pixels or a footprint.'},
  axes:{title:'Two axes. One viewing direction.',body:'Two mirrors steer the view while the telescope stays fixed. Follow incoming light across both surfaces in this ideal geometry.'},
  feedback:{title:'Command and position feedback',body:'Commands travel to the motor driver; encoder feedback returns toward the controller. This ideal illustration shows their roles without modeling servo response.'},
};

export function drawScanDiagram({context:c,width,height,project,stroke,progress,lesson,normals}) {
  const twoAxes=lesson==='axes',pose=scanPose(progress,lesson),ray=scanRay(pose.a,pose.b,{twoAxes});
  const color='#e6ba82';
  function dot(p,r=3,tint=color){const [x,y]=project(p);c.fillStyle=tint;c.shadowColor=tint;c.shadowBlur=12;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.shadowBlur=0;}
  const labels=[];
  function label(p,text,dy=0){
    const [px,py]=project(p);c.font=`${width<500?10:12}px "IBM Plex Mono", monospace`;
    const ceiling=lesson==='feedback'?height-80:height-18,w=c.measureText(text).width+14,x=Math.max(7,Math.min(width-w-7,px-w/2));let y=Math.max(24,Math.min(ceiling,py+dy));
    for(let i=0;i<12&&labels.some(b=>x<b.x+b.w+5&&x+w+5>b.x&&y-17<b.y+8&&y+8>b.y-17);i++)y=Math.max(24,Math.min(ceiling,py+dy+(i%2?1:-1)*22*(Math.floor(i/2)+1)));
    labels.push({x,y,w,px,py,text});
  }
  // A direction screen is mathematical context, not a detector or a planet.
  const screen=twoAxes?[[.05,-1,2.4],[2.25,-1,2.4],[2.25,1,2.4],[.05,1,2.4],[.05,-1,2.4]]:[[2.8,-.65,-1.4],[2.8,.65,-1.4],[2.8,.65,1.4],[2.8,-.65,1.4],[2.8,-.65,-1.4]];
  stroke(screen,'#507082',1,.65);
  if(lesson!=='reflection'){
    const trail=[];
    for(let i=0;i<=100;i++){const p=scanPose(progress-i/500,lesson);trail.push(scanRay(p.a,p.b,{twoAxes}).points.at(-1));}
    stroke(trail,'#64d9ed',2,.45,5);
  }
  ray.mirrors.forEach((m,i)=>{
    const center=new Vector3(...m.center),normal=new Vector3(...m.normal),u=i?new Vector3(1,0,1).normalize():new Vector3(0,1,0),v=new Vector3().crossVectors(normal,u).normalize();
    const corner=(a,b)=>center.clone().addScaledVector(u,a).addScaledVector(v,b).toArray(),size=i?.95:.62;
    const quad=[corner(-size,-size),corner(size,-size),corner(size,size),corner(-size,size),corner(-size,-size)];
    c.beginPath();quad.forEach((p,j)=>{const [x,y]=project(p);j?c.lineTo(x,y):c.moveTo(x,y);});c.fillStyle='#35637b88';c.fill();stroke(quad,'#a8d9ef',2,.95);
    stroke([corner(-size*1.4,0),corner(size*1.4,0)],'#d5a5ef',3,.8);
    if(normals){c.setLineDash([5,5]);stroke([center.toArray(),center.clone().addScaledVector(normal,1).toArray()],'#a6f35a',1,.9);c.setLineDash([]);}
    if(lesson==='reflection'){
      // The two directions away from the surface straddle its normal. These
      // equal angular arcs are annotations, not additional light paths.
      for(const end of [ray.points[0],ray.points[2]]){
        const direction=new Vector3(...end).sub(center).normalize(),arc=[];
        for(let k=0;k<=24;k++)arc.push(center.clone().addScaledVector(normal.clone().lerp(direction,k/24).normalize(),.38).toArray());
        stroke(arc,'#a6f35a',2,.85);
      }
      label(center.clone().addScaledVector(normal,1.05).toArray(),'Equal angles',-10);
    }
    label(corner(-size*1.35,0),i?'Mirror B':'Mirror A',20);
  });
  // Trace a viewing ray outward to solve geometry, then reverse propagation
  // for received light. Slow mirror motion is a quasi-static illustration.
  const incoming=[...ray.points].reverse();stroke(incoming,color,2,.8,8);
  for(let i=0;i<6;i++)dot(sampleScanPath(incoming,(progress*5+i/6)%1),2.6,'#ffe5c5');
  dot(ray.points.at(-1),5,'#64d9ed');dot(ray.points[0],4,'#a6f35a');
  label(ray.points[0],'Fixed telescope entrance',-16);
  label(ray.points.at(-1),'Viewed direction',-19);
  if(lesson==='feedback'){
    const labels=['Controller','Motor driver','Mirror / encoder'],gap=8,w=(width-32-gap*2)/3,y=height-38;
    c.font='11px "IBM Plex Mono", monospace';
    labels.forEach((name,i)=>{const x=16+i*(w+gap);c.fillStyle='#0b1823';c.fillRect(x,y,w,25);c.strokeStyle=i===2?'#d5a5ef':'#86b9ff';c.strokeRect(x,y,w,25);c.fillStyle='#f0f0fa';c.fillText(name,x+5,y+16,Math.max(1,w-10));});
    c.strokeStyle='#86b9ff';c.beginPath();c.moveTo(20,y-17);c.lineTo(width-20,y-17);c.stroke();
    c.fillStyle='#86b9ff';c.fillRect(20+(width-40)*((progress*3)%1),y-20,5,6);
    c.strokeStyle='#d5a5ef';c.beginPath();c.moveTo(20,y-6);c.lineTo(width-20,y-6);c.stroke();
    c.fillStyle='#d5a5ef';c.fillRect(width-20-(width-40)*((progress*3)%1),y-9,5,6);
  }
  // Annotation layer comes last: moving light must never cover a component name.
  c.font=`${width<500?10:12}px "IBM Plex Mono", monospace`;
  for(const {x,y,w,px,py,text} of labels){c.strokeStyle='#617482';c.beginPath();c.moveTo(px,py);c.lineTo(Math.max(x,Math.min(x+w,px)),y+5);c.stroke();c.fillStyle='#071118';c.fillRect(x,y-15,w,21);c.fillStyle='#f0f0fa';c.fillText(text,x+7,y);}
  return lesson==='reflection'?'Equal angles about the surface normal.':lesson==='sweep'?'Calc. single-plane steering: direction change = 2 × mirror rotation.':lesson==='axes'?'Mirror A and Mirror B redirect the same calculated ray.':'Blue: command toward the drive. Purple: position feedback toward the controller.';
}
