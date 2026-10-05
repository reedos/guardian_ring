import {PerspectiveCamera,Vector3} from 'three';
import {syntheticTerrain,calibrate} from '../model/cinematic-physics.js';

export const INK={light:'#e6ba82',charge:'#84d8ff',data:'#a6f35a',heat:'#ff667f',muted:'#809aa8',white:'#eef6fa'};
// Projected mathematical diagrams, separate from the Blender hardware models.
// All names are composited last in screen space, so geometry cannot obscure them.
export function diagramSurface(c,w,h,p,{yaw=0,pitch=0,reduced=false,distance=9,target=[0,0,0]}={}) {
  const phone=w<600,main=phone?{x:0,y:5,w,h:h*.59}:{x:0,y:8,w:w*.61,h:h-16};
  const panel=phone?{x:20,y:h*.64,w:w-40,h:h*.32}:{x:w*.64,y:50,w:w*.32,h:h-90};
  const camera=new PerspectiveCamera(37,main.w/main.h,.1,100);
  const auto=reduced?0:Math.sin(p*Math.PI)*.13;
  camera.position.set(target[0]+Math.sin(.3+yaw+auto)*distance,target[1]+distance*.444+pitch*3,target[2]+Math.cos(.3+yaw+auto)*distance);camera.lookAt(...target);camera.updateMatrixWorld();
  const labels=[];
  function project(point){const v=new Vector3(...point).project(camera);return [main.x+(v.x+1)*main.w/2,main.y+(1-v.y)*main.h/2];}
  function path(points,color=INK.light,width=1,alpha=1,glow=0,closed=false,fill=null){
    c.save();c.globalAlpha=alpha;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(closed)c.closePath();
    if(fill){c.fillStyle=fill;c.fill();}c.strokeStyle=color;c.lineWidth=width;c.shadowColor=color;c.shadowBlur=glow;c.stroke();c.restore();
  }
  const line=(points,color=INK.light,width=1,alpha=1,glow=0)=>path(points.map(project),color,width,alpha,glow);
  function dot(point,color=INK.light,r=3){const [x,y]=project(point);c.save();c.fillStyle=color;c.shadowColor=color;c.shadowBlur=12;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.restore();}
  function plane(points,color=INK.light,alpha=.25){path(points.map(project),color,1,1,0,true,`${color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`);}
  function text(value,x,y,color=INK.muted,size=12,align='left'){c.save();c.font=`${size}px "IBM Plex Mono",monospace`;c.textAlign=align;c.fillStyle=color;c.fillText(value,x,y);c.restore();}
  function label(point,value,color=INK.white){const [x,y]=project(point);labels.push({x,y,value,color});}
  function flow(points,t,color=INK.light,count=7,strength=1){
    line(points,color,1,.22);const lengths=points.slice(1).map((pt,i)=>new Vector3(...pt).distanceTo(new Vector3(...points[i]))),total=lengths.reduce((a,b)=>a+b,0);
    for(let j=0;j<count;j++){
      let distance=((t+j/count)%1+1)%1*total;
      for(let i=0;i<lengths.length;i++){if(distance<=lengths[i]){const a=new Vector3(...points[i]),b=new Vector3(...points[i+1]);dot(a.lerp(b,distance/lengths[i]).toArray(),color,2.1*strength);break;}distance-=lengths[i];}
    }
  }
  function ring(center,r,color=INK.muted,axis='xz',angle=0){const pts=[];for(let j=0;j<=80;j++){const a=j/80*Math.PI*2+angle;pts.push(axis==='xy'?[center[0]+r*Math.cos(a),center[1]+r*Math.sin(a),center[2]]:[center[0]+r*Math.cos(a),center[1],center[2]+r*Math.sin(a)]);}line(pts,color,1,.65);}
  function grid(y=-1.1){for(let n=-4;n<=4;n++){line([[n*.55,y,-2.2],[n*.55,y,2.2]],INK.muted,.5,.12);line([[-2.2,y,n*.55],[2.2,y,n*.55]],INK.muted,.5,.12);}}
  function chart(curves,{title='',xLabel='',yLabel='',min=0,max=1}={}){
    const r={x:panel.x+8,y:panel.y+35,w:panel.w-22,h:panel.h-66};text(title,panel.x,panel.y,INK.white,phone?11:13);text(yLabel,r.x,r.y-10,INK.muted,10);
    for(let i=0;i<=4;i++){const y=r.y+i*r.h/4;path([[r.x,y],[r.x+r.w,y]],INK.muted,.5,.3);}
    path([[r.x,r.y],[r.x,r.y+r.h],[r.x+r.w,r.y+r.h]],INK.muted,1,.6);
    for(const {values,color,alpha=1} of curves){let segment=[];for(let i=0;i<values.length;i++){const v=values[i];if(v===null){if(segment.length>1)path(segment,color,2,alpha,4);segment=[];}else segment.push([r.x+i/(values.length-1)*r.w,r.y+r.h*(1-(v-min)/(max-min))]);}if(segment.length>1)path(segment,color,2,alpha,4);}
    text(xLabel,r.x+r.w,r.y+r.h+22,INK.muted,10,'right');return r;
  }
  function finish(){
    const placed=[];for(const item of labels){const size=phone?10:12;c.font=`${size}px "IBM Plex Mono",monospace`;const tw=c.measureText(item.value).width+14;
      const x=Math.max(7,Math.min(main.w-tw-7,item.x-tw/2));let y=Math.max(24,Math.min(main.h-9,item.y));
      for(let i=0;i<18&&placed.some(r=>x<r.x+r.w+4&&x+tw+4>r.x&&y-16<r.y+7&&y+7>r.y-16);i++)y=Math.max(24,Math.min(main.h-9,item.y+(i%2?1:-1)*23*(Math.floor(i/2)+1)));
      path([[item.x,item.y],[x+tw/2,y]],INK.muted,.6,.5);c.fillStyle='#071018ed';c.fillRect(x,y-15,tw,22);text(item.value,x+7,y,item.color,size);placed.push({x,y,w:tw});
    }
  }
  function image(rect,{rows=24,columns=24,reveal=24,raw=false,corrected=false,highlight=-1,sample=null}={}){
    c.fillStyle='#070d12';c.fillRect(rect.x,rect.y,rect.w,rect.h);
    for(let y=0;y<Math.min(rows,reveal);y++)for(let x=0;x<columns;x++){
      let v=sample&&x===sample.x&&y===sample.y?sample.value:syntheticTerrain((x+.5)/columns,(y+.5)/rows);if(raw||corrected)v=v*1.15+.15;if(corrected)v=calibrate(v,0,1,.15,1.3);v=Math.max(0,Math.min(1,v));
      c.fillStyle=`rgb(${Math.round(30+v*205)},${Math.round(60+v*137)},${Math.round(105+v*55)})`;
      c.fillRect(rect.x+x*rect.w/columns,rect.y+y*rect.h/rows,rect.w/columns+.2,rect.h/rows+.2);
    }
    c.strokeStyle=INK.muted;c.strokeRect(rect.x,rect.y,rect.w,rect.h);
    if(highlight>=0){c.strokeStyle=INK.data;c.lineWidth=2;c.strokeRect(rect.x,rect.y+highlight*rect.h/rows,rect.w,rect.h/rows);}
  }
  return {c,w,h,p,yaw,pitch,phone,main,panel,project,path,line,dot,plane,text,label,flow,ring,grid,chart,finish,image};
}
