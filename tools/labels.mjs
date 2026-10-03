// Real-GPU acceptance for whole, readable printed component labels. Independently
// sample the plate, including its edge, and require authored-view coverage.
import {openGate,show,finish,MODES} from './gate-common.mjs';
const form=process.argv[2]||'desktop',g=await openGate('labels',form);
if(g){
 const failures=[],coverage={},visibility=[];let states=0;
 try{
  for(const sc of g.scenes){
   const seen=new Set();
   for(const mode of MODES){
    await show(g.page,sc.i,mode);
    const ids=await g.page.locator('#parts button[data-id]').evaluateAll(bs=>bs.map(b=>b.dataset.id));
    for(const id of [null,...ids]){
     await show(g.page,sc.i,mode,id);
     if(id===null)await g.page.evaluate(()=>{grx.overview();grx.settle();});
     await g.page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r)))));
     const check=await g.page.evaluate(()=>{
      const T=grx.THREE,b=grx.built[grx.state.scene],bad=[],visible=[],hidden=[];
      if(grx.state.selected){
       const label=document.querySelector('.pin.on .lbl'),view=document.getElementById('view').getBoundingClientRect();
       if(!label?.checkVisibility())bad.push('selected component callout hidden');
       else {
        const r=label.getBoundingClientRect();
        if(r.left<view.left||r.right>view.right||r.top<view.top||r.bottom>view.bottom)bad.push('selected component callout clipped');
        const title=document.getElementById('card-t').textContent;
        if(label.textContent!==title)bad.push('selected callout does not match component name');
        for(const element of document.querySelectorAll('#view .hud,#view .hud-row,#scene-note'))if(element.checkVisibility()){
         const p=element.getBoundingClientRect();
         if(r.left<p.right&&r.right>p.left&&r.top<p.bottom&&r.bottom>p.top)bad.push('selected callout covers scene controls or note');
        }
        for(const pin of document.querySelectorAll('.pin .num'))if(pin.checkVisibility()){
         const p=pin.getBoundingClientRect();
         if(r.left<p.right&&r.right>p.left&&r.top<p.bottom&&r.bottom>p.top)bad.push('selected callout covers a numbered pin');
        }
        for(const plate of b.labels||[])if(plate.visible&&plate.userData.readability?.bounds){
         const p=plate.userData.readability.bounds;
         if(r.left-view.left<p.right&&r.right-view.left>p.left&&r.top-view.top<p.bottom&&r.bottom-view.top>p.top)bad.push(`selected callout covers ${plate.name}`);
        }
        const hotspots=({light:b.hotspots,data:b.dataHotspots,heat:b.heatHotspots})[grx.state.mode];
        for(const name of hotspots?.[grx.state.selected]?.view?.labelNodes||[]){
         const node=b.asset?.getObjectByName(name),pixels=[];
         if(!node){bad.push(`missing protected component ${name}`);continue;}
         // Project actual mesh vertices independently of the viewer's world-box
         // placement exclusion. The selected name must leave these faces clear.
         node.traverseVisible(object=>{
          const positions=object.geometry?.getAttribute('position');if(!object.isMesh||!positions)return;
          for(let i=0;i<positions.count;i++){
           const p=new T.Vector3().fromBufferAttribute(positions,i).applyMatrix4(object.matrixWorld).project(grx.camera);
           if(p.z>=-1&&p.z<=1)pixels.push({x:view.left+(p.x+1)*view.width/2,y:view.top+(1-p.y)*view.height/2});
          }
         });
         if(pixels.length){
          const region={left:Math.min(...pixels.map(p=>p.x)),right:Math.max(...pixels.map(p=>p.x)),top:Math.min(...pixels.map(p=>p.y)),bottom:Math.max(...pixels.map(p=>p.y))};
          if(r.left<region.right&&r.right>region.left&&r.top<region.bottom&&r.bottom>region.top)bad.push(`selected callout covers protected component ${name}`);
         }
        }
       }
      }
      for(const label of b.labels||[]){
       if(!label.visible){hidden.push({name:label.name,reason:label.userData.readability?.reason});continue;}
       const bounds=label.userData.readability?.bounds,canvas=document.getElementById('view').getBoundingClientRect();
       if(bounds)for(const element of document.querySelectorAll('#view .hud,#view .hud-row,#scene-note'))if(element.checkVisibility()){
        const p=element.getBoundingClientRect();
        if(p.left-canvas.left<bounds.right&&p.right-canvas.left>bounds.left&&p.top-canvas.top<bounds.bottom&&p.bottom-canvas.top>bounds.top)bad.push(`${label.name}: covered by scene controls or note`);
       }
       if(bounds)for(const pin of document.querySelectorAll('.pin .num'))if(pin.checkVisibility()){
        const p=pin.getBoundingClientRect();
        if(p.left-canvas.left<bounds.right&&p.right-canvas.left>bounds.left&&p.top-canvas.top<bounds.bottom&&p.bottom-canvas.top>bounds.top)bad.push(`${label.name}: covered by numbered pin`);
       }
       visible.push(label.name);
       const m=new T.Matrix4();label.getMatrixAt(0,m);m.premultiply(label.matrixWorld);
       const from=grx.camera.position,ray=new T.Raycaster();
       const visibleSolid=o=>{for(let q=o;q;q=q.parent)if(!q.visible)return false;return true;};
       for(let y=-.48;y<=.481;y+=.24)for(let x=-.48;x<=.481;x+=.096){
        const point=new T.Vector3(x,y,0).applyMatrix4(m),d=point.sub(from),length=d.length();ray.set(from,d.normalize());ray.far=length-.002;
        const hit=ray.intersectObjects(b.solids,false).find(h=>visibleSolid(h.object)&&(!h.object.material?.transparent||h.object.material.opacity>=.85));
        if(hit){bad.push(`${label.name}: print covered by ${hit.object.name}`);break;}
       }
      }
      return {bad:[...new Set(bad)],visible,hidden,labels:(b.labels||[]).map(l=>l.name)};
     });
     states++;check.visible.forEach(name=>seen.add(name));
     failures.push(...check.bad.map(text=>`${sc.id}/${mode}/${id||'overview'}: ${text}`));
     visibility.push({scene:sc.id,mode,part:id,visible:check.visible,hidden:check.hidden});
     coverage[sc.id]={labels:check.labels,seen:[]};
    }
   }
   coverage[sc.id].seen=[...seen];
   // Phone may omit microprint; the component's full name remains available in
   // the fixed selector and card. Every decal still needs a readable desktop view.
   if(form==='desktop')for(const name of coverage[sc.id].labels)if(!seen.has(name))failures.push(`${sc.id}: no clear authored view for ${name}`);
  }
 }catch(error){failures.push(error.stack||String(error));}
 await finish(g,failures,{states,coverage,visibility});
}
