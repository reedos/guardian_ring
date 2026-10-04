// Sample the rendered backing with only title ink suppressed. This measures
// the CSS scrim composited over the actual GPU scene, not a nominal CSS color.
export async function titleContrast(page) {
 const bounds=await page.locator('.hud.tl').evaluate(el=>{
  if(!el.checkVisibility())return null;
  const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};
 });
 if(!bounds)return {hidden:true};
 const style=await page.addStyleTag({content:'.hud.tl > * {color:transparent !important;text-shadow:none !important;}'});
 let screenshot;
 try{screenshot=await page.screenshot({clip:bounds});}finally{await style.evaluate(el=>el.remove());}
 return page.evaluate(async uri=>{
  const image=new Image();image.src=uri;await image.decode();
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
  const data=ctx.getImageData(0,0,canvas.width,canvas.height).data,values=[];
  for(let i=0;i<data.length;i+=16)values.push((.2126*data[i]+.7152*data[i+1]+.0722*data[i+2])/255);
  values.sort((a,b)=>a-b);
  return {p95:values[Math.floor(values.length*.95)],mean:values.reduce((a,b)=>a+b,0)/values.length};
 },`data:image/png;base64,${screenshot.toString('base64')}`);
}
