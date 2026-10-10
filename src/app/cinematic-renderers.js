import {INK} from './cinematic-drawing.js';
import {between,smooth,chargeSample,wheelSlew,eclipsePower,slabRadiance,syntheticTerrain,imageRows} from '../model/cinematic-physics.js';
import {planckSpectralRadiance,coolerEnergyBalance} from '../model/radiometry.ts';
import {Vector3} from 'three';

function pixel(d){
  const {p,plane,line,flow,label,dot,chart,panel,text}=d;
  d.grid();
  // Diagram of the hybrid layers; no fabrication dimensions or circuit topology.
  plane([[-1.6,.7,-1],[1.1,.7,-1],[1.1,.7,1],[-1.6,.7,1]],INK.light,.18);
  plane([[-1.6,-.65,-1],[1.1,-.65,-1],[1.1,-.65,1],[-1.6,-.65,1]],INK.charge,.22);
  for(let x=0;x<5;x++)for(let z=0;z<4;z++){
    const a=[-1.35+x*.52,.62,-.78+z*.5],b=[a[0],-.55,a[2]];
    line([a,b],INK.muted,3,.3);dot([a[0],.05,a[2]],INK.muted,3);
    if(p>.16&&p<.6&&(x+z)%3!==0)flow([a,b],p*4+(x+z)/9,INK.charge,1);
  }
  if(p<.56)for(let i=0;i<8;i++){
    const x=-1.3+i*.3;flow([[x,2.6,-.2],[x,.72,-.2]],p*4+i/8,INK.light,1);
    // Some light is not collected; there is no implied unit quantum efficiency.
    if(i%3===0)line([[x,.72,-.2],[x+.5,1.7,-.4]],INK.light,1,.15);
  }
  label([-.7,.95,-1.25],'Semiconductor absorber',INK.light);
  label([-1.4,.08,1.1],'Indium contact',INK.muted);
  label([-.7,-.85,1.1],'Readout circuit',INK.charge);
  const q=between(p,.18,.58),sample=chargeSample(q,.65,1,1,8);
  line([[1.1,-.65,0],[2,-.65,0],[2,.25,0]],INK.charge,1.4,.6);
  for(const x of [1.78,2.15])line([[x,-.05,-.38],[x,-.05,.38]],INK.charge,3,.8);
  if(p>.2&&p<.62)flow([[.1,-.65,0],[2,-.65,0],[2,-.05,0]],p*3,INK.charge,4);
  label([2,.45,0],'Integration capacitor',INK.charge);
  const values=Array.from({length:81},(_,i)=>i/80<=q?i/80*.65:null);
  if(p<.8){const r=chart([{values,color:INK.charge}],{title:p<.6?'Collected charge → voltage':'Analog voltage → digital bin',yLabel:'Signal magnitude · normalized',xLabel:'Illustrative integration time'});
  if(p>=.6){
    for(let n=1;n<8;n++){const y=r.y+r.h*(1-n/8);d.path([[r.x,y],[r.x+r.w,y]],INK.data,.8,.3);}
    const level=Math.min(sample.code,Math.floor(between(p,.6,.74)*(sample.code+1)));d.c.fillStyle='#a6f35a33';d.c.fillRect(r.x,r.y+r.h*(1-(level+1)/8),r.w,r.h/8);
    const y=r.y+r.h*(1-sample.voltage);d.path([[r.x,y],[r.x+r.w,y]],INK.charge,1.5,.8,5);
    text(`Assumed ADC example: ${sample.code.toString(2).padStart(3,'0')}`,panel.x,panel.y+panel.h+2,INK.data,d.phone?10:12);
  }}else{
    text('Digital sample → image cell',panel.x,panel.y,INK.white,d.phone?11:13);
    const size=Math.min(panel.w,panel.h-30),rect={x:panel.x+(panel.w-size)/2,y:panel.y+24,w:size,h:size};
    d.image(rect,{rows:12,columns:12,reveal:12,sample:{x:6,y:6,value:sample.code/7}});d.c.strokeStyle=INK.data;d.c.strokeRect(rect.x+size*.5,rect.y+size*.5,size/12,size/12);
    text(`Assumed sample code: ${sample.code.toString(2).padStart(3,'0')}`,panel.x,panel.y+panel.h+9,INK.data,d.phone?10:12);
    const u=smooth(between(p,.8,.9)),start=d.project([2,-.05,0]),end=[rect.x+size*6.5/12,rect.y+size*6.5/12];
    if(p<.9){d.path([start,end],INK.data,1,.3);d.c.fillStyle=INK.data;d.c.fillRect(start[0]+(end[0]-start[0])*u-3,start[1]+(end[1]-start[1])*u-3,6,6);}
  }
}

function cooling(d){
  const {p,plane,line,flow,label,panel,text}=d;d.grid();
  plane([[-2,.4,-.7],[-.9,.4,-.7],[-.9,.4,.7],[-2,.4,.7]],INK.charge,.4);
  line([[-1.45,.35,0],[-1.45,-.25,0],[.2,-.25,0]],INK.charge,9,.6);
  d.ring([.2,-.25,0],.35,INK.charge,'xy');
  plane([[.1,-.6,-.6],[1.2,-.6,-.6],[1.2,.6,-.6],[.1,.6,-.6]],INK.muted,.28);
  const radiator=[[2,-.3,-1],[2,1.1,-1],[2,1.1,1],[2,-.3,1]];plane(radiator,INK.heat,.16);
  for(let i=0;i<7;i++)line([[2,-.25+i*.2,-1],[2,-.25+i*.2,1]],INK.heat,1,.3);
  label([-1.65,.75,-.6],'Detector',INK.charge);label([-1,-.55,.55],'Cold finger',INK.charge);
  label([.65,.95,0],'Cryocooler',INK.white);label([2,1.4,0],'Radiator',INK.heat);
  if(p>.1)flow([[-1.65,.4,0],[-1.45,-.25,0],[.2,-.25,0]],p*2,INK.charge,4);
  if(p>.34)flow([[.3,-1.7,0],[.3,-.55,0]],p*2,INK.data,8);
  if(p>.48)flow([[.7,-.25,0],[2,-.25,0],[2,.4,0]],p*2,INK.heat,12);
  if(p>.64)for(let i=0;i<5;i++)flow([[2,.15+i*.18,0],[3.3,.15+i*.2,(i-2)*.4]],p*2+i/9,INK.heat,2);
  text('Steady-cycle energy balance',panel.x,panel.y,INK.white,d.phone?11:13);
  const step=(panel.h-28)/3,barH=Math.min(29,step-19),y=panel.y+24,maxW=panel.w-8,removed=1,work=2,rejected=coolerEnergyBalance(removed,work);
  const bars=[['Heat removed',INK.charge,removed/rejected],['Electrical work',INK.data,work/rejected],['Heat rejected',INK.heat,1]];
  bars.forEach(([title,color,v],i)=>{text(title,panel.x,y+i*step,color,10);d.c.fillStyle=color;d.c.globalAlpha=p>i*.2?.8:.2;d.c.fillRect(panel.x,y+5+i*step,maxW*v,barH);d.c.globalAlpha=1;});
  text('Calc. Qhot = Qcold + Win',panel.x,panel.y+panel.h+9,INK.white,d.phone?10:12);
}

function wheel(d){
  const {p,line,plane,label,ring,chart}=d,s=wheelSlew(p);
  const rotate=(v,a)=>[v[0]*Math.cos(a)-v[2]*Math.sin(a),v[1],v[0]*Math.sin(a)+v[2]*Math.cos(a)];
  const corners=[[-1,0,-1],[1,0,-1],[1,0,1],[-1,0,1]].map(v=>rotate(v,s.busAngle));
  plane(corners,INK.muted,.22);line([...corners,corners[0]],INK.light,2,.7);
  for(const sign of [-1,1])plane([[sign*1.05,0,-.7],[sign*2.4,0,-.7],[sign*2.4,0,.7],[sign*1.05,0,.7]].map(v=>rotate(v,s.busAngle)),INK.charge,.2);
  ring([0,.08,0],.7,INK.charge);ring([0,.08,0],.61,INK.charge);
  for(let i=0;i<8;i++){const a=i*Math.PI/4+s.busAngle+s.wheelRelativeAngle;line([[0,.1,0],[.62*Math.cos(a),.1,.62*Math.sin(a)]],INK.charge,2,.7);}
  const point=rotate([0,.15,-2],s.busAngle);line([[0,.15,0],point],INK.light,2,1,7);d.dot(point,INK.light,5);
  label([0,.2,0],'Reaction wheel',INK.charge,[0,-d.main.h*.24]);label(point,'Body pointing',INK.light);
  const values=Array.from({length:101},(_,i)=>i/100>p?null:wheelSlew(i/100));
  // Momentum, not speed: equal magnitudes around zero.
  const bus=values.map(v=>v?12*v.busVelocity/40:null),rotor=bus.map(v=>v===null?null:-v);
  chart([{values:bus,color:INK.light},{values:rotor,color:INK.charge}],{title:'Opposite momentum changes',yLabel:'Normalized · about the same axis',xLabel:'Illustrative maneuver',min:-1,max:1});
  d.text('Amber: body   Blue: wheel',d.panel.x,d.panel.y+d.panel.h+8,INK.muted,d.phone?10:11);
}

function terrainPlane(d,p){
  const n=24,scan=between(p,.12,.84),row=imageRows(scan,n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const a=x/n*4-2,z=y/n*4-2,v=syntheticTerrain((x+.5)/n,(y+.5)/n),color=v<.2?'#23526d':v<.5?'#496b59':'#9b9568';
    d.plane([[a,-.5,z],[a+4/n,-.5,z],[a+4/n,-.5,z+4/n],[a,-.5,z+4/n]],color,.8);
  }
  const z=-2+scan*4;
  d.line([[-2,-.47,z],[2,-.47,z]],INK.data,3,1,8);
  d.line([[-2,-.45,z],[0,2,z],[2,-.45,z]],INK.light,1,.55);
  d.line([[-.5,2,z],[.5,2,z]],INK.charge,6,1,6);
  d.label([0,2.3,z],'Detector row',INK.charge);return row;
}
function pushbroom(d){
  const rows=terrainPlane(d,d.p),r=d.panel,size=Math.min(r.w,r.h-22),rect={x:r.x+(r.w-size)/2,y:r.y+18,w:size,h:size};
  d.text('Synthetic image · matching rows',r.x,r.y,INK.white,d.phone?10:12);
  d.image(rect,{reveal:rows,highlight:Math.min(rows,23)});
}

function power(d,earth){
  const {p,panel,flow,label,plane,text}=d,s=eclipsePower(p);d.grid();
  plane([[-2,.1,-.9],[-.6,.1,-.9],[-.6,.1,.9],[-2,.1,.9]],INK.charge,s.eclipse?.07:.4);
  plane([[.1,.1,-.5],[1,.1,-.5],[1,.1,.5],[.1,.1,.5]],INK.data,.3);
  plane([[1.8,-.3,-.7],[2.5,-.3,-.7],[2.5,.6,-.7],[1.8,.6,-.7]],INK.light,.3);
  label([-1.4,.45,0],'Solar array',INK.charge);label([.5,.5,0],'Power distribution',INK.data);label([2,.9,-.7],'Battery',INK.light);label([.5,-1.5,0],'Electrical load',INK.white);
  if(s.solar>0){flow([[-3,2,0],[-1.4,.15,0]],p*3,INK.light,6);flow([[-1.3,.1,0],[.5,.1,0]],p*3,INK.data,6);}
  flow([[.5,.1,0],[.5,-1.25,0]],p*3,INK.data,5);
  if(s.battery!==0)flow(s.battery>0?[[.5,.1,0],[2,.1,-.7]]:[[2,.1,-.7],[.5,.1,0]],p*3,INK.light,5);
  d.chart([{values:Array.from({length:101},(_,i)=>i/100<=p?eclipsePower(i/100).energy:null),color:INK.light}],{title:s.eclipse?'In shadow · battery supplies load':s.battery>0?'Sunlit · charging surplus':'Sunlit · array supplies load',yLabel:'Stored energy · normalized',xLabel:'Illustrative eclipse cycle'});
  text('Calc. solar = load + charging',panel.x,panel.y+panel.h+9,INK.white,d.phone?10:11);
  // Separate orbit-context diagram. Its compressed geometry places shadow entry
  // and exit at the very same times as the battery model.
  const cx=d.main.w*.31,cy=47,orbit=28,er=orbit*Math.sin(.3*Math.PI),angle=(p-.4)*Math.PI*2,sx=cx+orbit*Math.cos(angle),sy=cy+orbit*Math.sin(angle);
  d.c.fillStyle='#030608aa';d.c.fillRect(cx-78,8,170,81);d.c.fillStyle='#0009';d.c.fillRect(cx,cy-er,88,er*2);
  for(let i=-1;i<=1;i++)d.path([[cx-72,cy+i*12],[cx-er,cy+i*12]],INK.light,1,.5);
  d.c.strokeStyle='#73899988';d.c.beginPath();d.c.arc(cx,cy,orbit,0,Math.PI*2);d.c.stroke();
  if(earth)earth(d.c,cx,cy,er,0);else{d.c.fillStyle='#28475b';d.c.beginPath();d.c.arc(cx,cy,er,0,Math.PI*2);d.c.fill();}
  d.c.fillStyle=s.eclipse?INK.heat:INK.light;d.c.beginPath();d.c.arc(sx,sy,3,0,Math.PI*2);d.c.fill();
  text('Orbit context · compressed',cx-76,86,INK.muted,9);text('Shadow',cx+34,19,INK.muted,9);
}

function downlink(d){
  const {p,main,panel,text,path}=d,sourceSize=Math.min(main.w*.47,main.h*.55),destSize=Math.min(panel.w*.72,panel.h-28),source={x:main.w*.12,y:main.h*.22,w:sourceSize,h:sourceSize},destination={x:panel.x+(panel.w-destSize)/2,y:panel.y+28,w:destSize,h:destSize};
  const fraction=between(p,.6,.9),row=imageRows(fraction);d.image(source,{highlight:p>.15&&p<.9?Math.min(row,23):-1});
  text('SPACECRAFT MEMORY',source.x,source.y-18,INK.light,d.phone?10:12);
  const a=[source.x+source.w+7,source.y+source.h*.5],tx=[main.w*.82,main.h*.67],rx=d.phone?[destination.x+destSize+20,destination.y+destSize*.5]:[destination.x-20,destination.y+destSize*.5],end=d.phone?[destination.x+destSize,rx[1]]:[destination.x,rx[1]];
  const wire=[a,[tx[0],a[1]],tx],radio=d.phone?[tx,[tx[0],rx[1]],rx]:[tx,[rx[0],tx[1]],rx];
  function stream(points,color,active){path(points,color,1,active?.5:.15);if(!active)return;const lengths=points.slice(1).map((b,i)=>Math.hypot(b[0]-points[i][0],b[1]-points[i][1])),total=lengths.reduce((a,b)=>a+b,0);
    for(let i=0;i<5;i++){let s=((p*3+i/5)%1)*total;for(let j=0;j<lengths.length;j++){if(s<=lengths[j]){const u=s/lengths[j],a=points[j],b=points[j+1];d.c.fillStyle=color;d.c.fillRect(a[0]+(b[0]-a[0])*u-3,a[1]+(b[1]-a[1])*u-2,6,4);break;}s-=lengths[j];}}
  }
  stream(wire,INK.data,p>.2&&p<.9);stream(radio,INK.charge,p>.4&&p<.9);stream([rx,end],INK.data,p>=.6&&p<.9);
  for(const point of [tx,rx]){d.c.strokeStyle=INK.charge;d.c.beginPath();d.c.arc(point[0],point[1],7,0,Math.PI*2);d.c.stroke();}
  text('Transmitter',tx[0],tx[1]+22,INK.charge,10,'center');
  text('GROUND RECONSTRUCTION',panel.x,panel.y,INK.data,d.phone?10:12);d.image(destination,{reveal:row,highlight:p<.88?Math.min(row,23):-1});
  text('Receiver',rx[0],rx[1]-14,INK.charge,9,'center');
  if(p>.2&&p<.9)text(`Row ${Math.min(row+1,24)} · illustrative groups`,source.x,source.y+source.h+20,INK.data,d.phone?9:11);
}

const spectrum=(temperature)=>Array.from({length:161},(_,i)=>planckSpectralRadiance((1+19*i/160)*1e-6,temperature));
const BASE_SPECTRUM=spectrum(400),HOT_SPECTRUM=spectrum(800),HOT_MAX=Math.max(...HOT_SPECTRUM);
function thermal(d){
  const {p,line,dot,label}=d,t=smooth(between(p,.12,.65)),temperature=400+400*t;
  for(let j=0;j<18;j++){
    const a=j*Math.PI/9,points=[];for(let i=0;i<=30;i++){const b=i*Math.PI/15;points.push([.7*Math.cos(a)*Math.sin(b),.7*Math.cos(b),.7*Math.sin(a)*Math.sin(b)]);}line(points,INK.heat,1,.25+t*.25);
  }
  for(let i=0;i<32;i++){const a=i*2.39996,b=Math.acos(1-2*(i+.5)/32),u=.85+((p*2+i/32)%1)*1.8;dot([u*Math.sin(b)*Math.cos(a),u*Math.cos(b),u*Math.sin(b)*Math.sin(a)],INK.heat,1.5+t*1.8);}
  label([0,-1.4,0],'Ideal thermal emitter',INK.heat);
  d.chart([{values:BASE_SPECTRUM.map(v=>v/HOT_MAX),color:INK.charge,alpha:.55},{values:spectrum(temperature).map(v=>v/HOT_MAX),color:INK.heat}],{title:'Calc. Planck spectral radiance',yLabel:'Fixed normalized radiance scale',xLabel:'1 → 20 µm · increasing wavelength'});
  d.text(`Assumed temperature: ${Math.round(temperature)} K`,d.panel.x,d.panel.y+d.panel.h+9,INK.white,d.phone?10:12);
  if(p>=.8){const y=d.main.h*.9,x=d.main.w*.13;
    d.text('Molecular emission: separate spectral bands',x,y,INK.light,d.phone?9:11);
    for(let i=0;i<5;i++){const cx=x+22+i*d.main.w*.14,wiggle=Math.sin(p*90+i)*3;d.path([[cx-7,y-22],[cx,y-26-wiggle],[cx+7,y-22]],INK.light,2,.8);}
  }
}

const INCOMING=spectrum(500),AIR=spectrum(280),SLAB_MAX=Math.max(...INCOMING);
function atmosphere(d){
  const {p,plane,flow,label}=d;
  plane([[-.2,-1.2,-1],[-.2,1.5,-1],[-.2,1.5,1],[-.2,-1.2,1]],INK.charge,.12);
  plane([[.5,-1.2,-1],[.5,1.5,-1],[.5,1.5,1],[.5,-1.2,1]],INK.charge,.2);
  for(let i=0;i<7;i++){
    const y=-.8+i*.32;flow([[-2.8,y,0],[-.2,y,0]],p*2+i/7,INK.light,3);
    if(p>.22&&i%3!==0)flow([[.5,y,0],[2.6,y,0]],p*2+i/7,INK.light,2);
    if(p>.43)flow([[.4,y,.2],[2.6,y+.2,.2]],p*2+i/7,INK.heat,1);
  }
  label([-.1,1.9,0],'Isothermal slab',INK.charge);label([-2,-1.4,0],'Source light',INK.light);label([2,-1.4,0],'Outgoing light',INK.white);
  const values=INCOMING.map((v,i)=>{const x=i/160,tau=Math.exp(-(.25+2*Math.exp(-(((x-.36)/.12)**2))+1.3*Math.exp(-(((x-.74)/.09)**2))));return slabRadiance(v,AIR[i],tau);});
  const curves=[{values:INCOMING.map(v=>v/SLAB_MAX),color:INK.muted,alpha:.4}];
  if(p>.18)curves.push({values:values.map(v=>v.transmitted/SLAB_MAX),color:INK.light});
  if(p>.4)curves.push({values:values.map(v=>v.emitted/SLAB_MAX),color:INK.heat});
  if(p>.61)curves.push({values:values.map(v=>v.outgoing/SLAB_MAX),color:INK.charge});
  d.chart(curves,{title:'Transmission + the air’s emission',yLabel:'Same normalized radiance scale',xLabel:'1 → 20 µm · illustrative absorption'});
  d.text('Gray: in · Amber: transmitted',d.panel.x,d.panel.y+d.panel.h+2,INK.muted,d.phone?9:11);
  d.text('Pink: emitted · Blue: total',d.panel.x,d.panel.y+d.panel.h+15,INK.white,d.phone?9:11);
}

function calibration(d){
  const {p,line,label,dot,panel,text}=d;
  // Once the references are measured, devote the phone canvas to the result.
  // A small image underneath the already-explained mirror hid the correction.
  if(d.phone&&p>=.6){
    const size=Math.min(d.w-40,d.h*.72),rect={x:(d.w-size)/2,y:(d.h-size)/2,w:size,h:size};
    text('Before  |  corrected affine error',rect.x,rect.y-24,INK.white,10);
    d.image(rect,{raw:true});
    const reveal=smooth(between(p,.6,.79)),split=rect.x+rect.w*(1-reveal*.5);
    d.c.save();d.c.beginPath();d.c.rect(split,rect.y,rect.w*reveal*.5,rect.h);d.c.clip();d.image(rect,{corrected:true});d.c.restore();
    d.path([[split,rect.y],[split,rect.y+size]],INK.data,1.5);
    text('Same synthetic samples · only gain and offset change',rect.x,rect.y+size+24,INK.muted,8);
    return;
  }
  const targets=[[-1.8,.2,-1.3],[.2,.2,-2],[2,.2,-1]],from=p<.2?0:p<.4?0:p<.8?1:2,to=p<.2?0:p<.4?1:p<.8?2:0;
  const start=p<.2?0:p<.4?.2:p<.8?.4:.8,transition=smooth(between(p,start,start+.045));
  const target=new Vector3(...targets[from]).lerp(new Vector3(...targets[to]),transition).toArray();
  for(const [point,name,color] of [[[-1.8,.2,-1.3],'Earth',INK.charge],[[.2,.2,-2],'Blackbody',INK.heat],[[2,.2,-1],'Space',INK.muted]]){dot(point,color,8);label([point[0],.8,point[2]],name,color);}
  const incoming=new Vector3(...target).normalize().negate(),outgoing=new Vector3(0,-1,1.6).normalize(),normal=incoming.clone().sub(outgoing).normalize();
  const across=new Vector3().crossVectors(normal,new Vector3(0,1,0)).normalize().multiplyScalar(.58),up=new Vector3().crossVectors(normal,across).normalize().multiplyScalar(.32);
  d.plane([across.clone().add(up),across.clone().sub(up),across.clone().negate().sub(up),across.clone().negate().add(up)].map(v=>v.toArray()),INK.white,.5);
  if(transition===1||p<.2)d.flow([target,[0,0,0],[0,-1,1.6]],p*3,INK.light,6);label([0,-1.25,1.6],'Detector',INK.light);
  if(p>=.2&&p<.6){
    const fitted=p>=.45,values=Array.from({length:41},(_,i)=>fitted?.15+1.15*i/40:null),r=d.chart([{values,color:INK.data}],{title:fitted?'Two references define the response':'Measure the reference signals',yLabel:'Reading · normalized',xLabel:'Known reference signal',max:1.4});
    const points=[{x:r.x,y:r.y+r.h*(1-.15/1.4),label:'Space reference'},{x:r.x+r.w,y:r.y+r.h*(1-1.3/1.4),label:'Blackbody reference'}];
    points.forEach((pt,i)=>{
      if(!i&&!fitted)return;
      d.c.fillStyle=INK.light;d.c.beginPath();d.c.arc(pt.x,pt.y,4,0,Math.PI*2);d.c.fill();
      // Put each label in the opposite empty corner, with an edge leader back
      // to its point, rather than letting the fitted line cross the letters.
      const x=i?pt.x-8:pt.x+8,y=i?r.y+r.h-10:r.y+12;
      d.path([[pt.x,pt.y],[pt.x,y+3],[x,y+3]],INK.muted,.6,.6);
      text(pt.label,x,y,INK.light,10,i?'right':'left');
    });
    text('Calc. reading = gain × signal + offset',panel.x,panel.y+panel.h+9,INK.white,d.phone?9:11);return;
  }
  const size=Math.min(panel.w,panel.h-28),rect={x:panel.x+(panel.w-size)/2,y:panel.y+25,w:size,h:size};
  text(p<.6?'Synthetic image · injected error':'Before  |  corrected affine error',panel.x,panel.y,INK.white,d.phone?10:12);
  d.image(rect,{raw:true});
  if(p>=.6){const reveal=smooth(between(p,.6,.79)),split=rect.x+rect.w*(1-reveal*.5);d.c.save();d.c.beginPath();d.c.rect(split,rect.y,rect.w*reveal*.5,rect.h);d.c.clip();d.image(rect,{corrected:true});d.c.restore();d.path([[split,rect.y],[split,rect.y+size]],INK.data,1.5);}
}

export const RENDERERS={pixel,cooling,wheel,pushbroom,eclipse:power,downlink,thermal,atmosphere,calibration};
