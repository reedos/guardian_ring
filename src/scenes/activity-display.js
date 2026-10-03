import { DataTexture, RGBAFormat, SRGBColorSpace, NearestFilter } from 'three';

const WIDTH=96,HEIGHT=64,PHASES=['receive','readout','transfer'];
// Abstract screen graphics only. Tile counts, brightness and progress have no
// relation to sensor format, telemetry, received image content or elapsed time.
function paint(pixels,phase,progress) {
  const rectangle=(x,y,width,height,color)=>{
    for(let row=y;row<y+height;row++)for(let column=x;column<x+width;column++){
      const offset=(row*WIDTH+column)*4;
      pixels[offset]=color[0];pixels[offset+1]=color[1];pixels[offset+2]=color[2];pixels[offset+3]=255;
    }
  };
  rectangle(0,0,WIDTH,HEIGHT,[7,17,24]);
  rectangle(5,5,86,2,[40,87,106]);
  const filled=phase==='receive'?progress*.45:phase==='readout'?.45+progress*.5:1;
  // An abstract tiled panel and an independent three-stage status strip avoid
  // fabricated maps, operational text, counters or instrument readouts.
  for(let row=0;row<3;row++)for(let column=0;column<5;column++){
    const index=row*5+column,ready=index/15<filled;
    const colors=[[71,175,172],[101,199,174],[166,223,110]];
    rectangle(6+column*17,12+row*12,14,9,ready?colors[(row+column)%colors.length]:[17,41,53]);
  }
  const current=PHASES.indexOf(phase);
  for(let index=0;index<3;index++)rectangle(6+index*29,53,25,5,index===current?[211,232,246]:index<current?[96,153,108]:[29,60,73]);
  rectangle(6,60,Math.max(1,Math.round(83*progress)),1,[159,194,216]);
}

// Use an existing authored glass surface, with its existing UVs and transforms.
// No display hardware or labels are added by JavaScript.
export function createActivityDisplay(asset,{role,materialName,surfaceNormal=[0,0,1]}) {
  const owner=asset.getObjectByName(role);
  if(!owner)throw new Error(`Missing activity-display component: ${role}`);
  const records=[],copies=new Map(),pixels=new Uint8Array(WIDTH*HEIGHT*4);let uvRect=null;
  const texture=new DataTexture(pixels,WIDTH,HEIGHT,RGBAFormat);
  texture.colorSpace=SRGBColorSpace;texture.magFilter=NearestFilter;texture.minFilter=NearestFilter;
  owner.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const source=Array.isArray(mesh.material)?mesh.material:[mesh.material];
    if(!source.some(material=>material.name===materialName))return;
    const uv=mesh.geometry.getAttribute('uv'),normal=mesh.geometry.getAttribute('normal');
    if(!uv||!normal)throw new Error(`Activity-display surface has no authored UVs or normals: ${mesh.name}`);
    // A Blender box uses an atlas: its front may occupy only a small UV island.
    // Fill that authored front island, keeping the existing geometry untouched.
    const rect=[Infinity,Infinity,-Infinity,-Infinity],index=mesh.geometry.index;
    const groups=Array.isArray(mesh.material)?mesh.geometry.groups:[{start:0,count:index?.count??uv.count,materialIndex:0}];
    for(const group of groups){
      if(source[group.materialIndex??0]?.name!==materialName)continue;
      for(let offset=group.start;offset<group.start+group.count;offset++){
        const vertex=index?index.getX(offset):offset;
        if(normal.getX(vertex)*surfaceNormal[0]+normal.getY(vertex)*surfaceNormal[1]+normal.getZ(vertex)*surfaceNormal[2]<.999)continue;
        const u=uv.getX(vertex),v=uv.getY(vertex);
        rect[0]=Math.min(rect[0],u);rect[1]=Math.min(rect[1],v);rect[2]=Math.max(rect[2],u);rect[3]=Math.max(rect[3],v);
      }
    }
    if(!rect.every(Number.isFinite)||rect[2]<=rect[0]||rect[3]<=rect[1])throw new Error(`Missing activity-display front UV island: ${mesh.name}`);
    if(uvRect&&rect.some((value,i)=>Math.abs(value-uvRect[i])>1e-5))throw new Error('Activity-display surfaces must share their authored front UV island');
    uvRect=rect;
    const active=source.map(material=>{
      if(material.name!==materialName)return material;
      if(!copies.has(material)){
        const copy=material.clone();copy.name='Assumed schematic activity display';
        copy.color.set('#ffffff');copy.emissive.set('#ffffff');copy.emissiveIntensity=.7;
        copy.map=texture;copy.emissiveMap=texture;copy.metalness=0;copy.roughness=.65;
        copy.userData={...copy.userData,representativeDisplay:true,assumption:'look-model'};
        copies.set(material,copy);
      }
      return copies.get(material);
    });
    records.push({mesh,original:mesh.material,active:Array.isArray(mesh.material)?active:active[0]});
  });
  if(!records.length){texture.dispose();throw new Error(`Missing activity-display glass: ${role}/${materialName}`);}
  texture.repeat.set(1/(uvRect[2]-uvRect[0]),1/(uvRect[3]-uvRect[1]));
  texture.offset.set(-uvRect[0]*texture.repeat.x,-uvRect[1]*texture.repeat.y);texture.updateMatrix();
  let key='',snapshot={active:false,phase:null,frame:0};
  return {
    state:()=>({...snapshot}),
    update(state){
      const active=!state.inspection&&PHASES.includes(state.step.id),phase=active?state.step.id:null;
      const frame=active?Math.floor(Math.max(0,Math.min(1,state.progress))*40):0,next=`${phase}:${frame}`;
      if(next===key)return false;
      key=next;snapshot={active,phase,frame};
      for(const record of records)record.mesh.material=active?record.active:record.original;
      if(active){paint(pixels,phase,frame/40);texture.needsUpdate=true;}
      return true;
    },
    dispose(){for(const record of records)record.mesh.material=record.original;for(const material of copies.values())material.dispose();texture.dispose();},
  };
}
