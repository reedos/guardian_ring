// Read-only layout sweep of every page at 360/390/430 px and desktop.
// Reports horizontal overflow, controls under 44 px on touch widths, controls without an accessible
// name, clipped text and controls whose keyboard focus is not visibly marked. It changes nothing.
import { chromium } from 'playwright';
import fs from 'node:fs';
const base=(process.env.GR_URL||'http://127.0.0.1:47601/').replace(/\/?$/,'/');
const pages=(process.env.GR_PAGES||'index.html,visualizer.html,evidence.html,method.html,glossary.html,parts.html').split(',');
const all=[[360,780],[390,844],[430,932],[1440,900]],only=(process.env.GR_WIDTHS||'').split(',').filter(Boolean).map(Number),widths=only.length?all.filter(x=>only.includes(x[0])):all;
const shotDir=process.env.GR_SWEEP_SHOTS||'';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const out=[];
for(const [w,h] of widths)for(const file of pages){
 const phone=w<=430;
 const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:phone?2:1,isMobile:phone,hasTouch:phone});
 await ctx.addInitScript(()=>localStorage.setItem('grx-mission-visited-v1','1'));
 const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(new URL(file,base).href);
 if(file==='visualizer.html')await page.waitForFunction(()=>window.grx?.built[window.grx.state.scene],null,{timeout:90000});
 await page.waitForTimeout(800);
 // GR_CLICK="#more-btn,#tab-parts": open an in-page state on the visualizer before measuring.
 if(file==='visualizer.html')for(const sel of (process.env.GR_CLICK||'').split(',').filter(Boolean)){const t=page.locator(sel).first();if(await t.count()&&await t.isVisible()){await t.click();await page.waitForTimeout(500);}}
 if(process.env.GR_OPEN_ALL)await page.evaluate(()=>document.querySelectorAll('details').forEach(d=>{d.open=true;}));
 const r=await page.evaluate(({phone})=>{
  const vis=el=>{for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(p.hidden||s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false;if(p.tagName==='DETAILS'&&!p.open&&!(el.tagName==='SUMMARY'&&el.parentElement===p))return false;}const b=el.getBoundingClientRect();return b.width>0&&b.height>0;};
  const name=el=>(el.getAttribute('aria-label')||el.getAttribute('aria-labelledby')&&[...el.getAttribute('aria-labelledby').split(' ')].map(i=>document.getElementById(i)?.textContent).join(' ')||el.labels&&[...el.labels].map(l=>l.textContent).join(' ')||el.textContent||el.getAttribute('title')||el.getAttribute('alt')||'').trim();
  const desc=el=>el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className?'.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):'')+' "'+name(el).slice(0,30)+'"';
  const root=document.documentElement,res={overflowX:root.scrollWidth-innerWidth,wide:[],small:[],unnamed:[],clipped:[],noFocus:[]};
  const controls=[...document.querySelectorAll('button,a[href],input,select,textarea,summary,[role=button],[tabindex]:not([tabindex="-1"])')].filter(vis);
  for(const el of controls){
   const b=el.getBoundingClientRect();
   if(!name(el)&&!(el.tagName==='INPUT'&&el.type==='hidden'))res.unnamed.push(desc(el));
   const inline=((el.tagName==='A'&&getComputedStyle(el).display==='inline')||(el.matches('button.chip')&&el.parentElement.tagName==='P'))&&[...el.parentNode.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>3);
   if(phone&&!inline&&el.tagName!=='CANVAS'){
    // Effective touch area: how far a finger can land on this control along each axis, counting
    // pseudo-element hit areas but not space owned by neighbors.
    document.documentElement.style.scrollBehavior='auto';
    const owns=(x,y)=>{const t=document.elementFromPoint(x,y);return !!t&&(t===el||el.contains(t));};
    const measure=()=>{el.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
     const c=el.getBoundingClientRect(),cx=c.left+c.width/2,cy=c.top+c.height/2;
     const run=(dx,dy)=>{let n=0;for(let k=1;k<=30;k++){if(owns(cx+dx*k,cy+dy*k))n=k;else break;}return n;};
     return {cx,cy,vert:run(0,-1)+run(0,1)+1,horiz:run(-1,0)+run(1,0)+1};};
    let m=measure();if(m.vert<43||m.horiz<43){const again=measure();if(again.vert+again.horiz>m.vert+m.horiz)m=again;}
    const {cx,cy,vert,horiz}=m;
    const bw=Math.max(b.width,horiz),bh=Math.max(b.height,vert);
    const lab=el.closest('label'),lb=lab&&lab.getBoundingClientRect();
    const labelled=lb&&lb.height>=43&&lb.width>=43;   // the whole labelled row is the tap target
    const under=el.matches('.pin')&&!(()=>{const t=document.elementFromPoint(cx,cy);return !t||t.closest('#pins,canvas,.pin');})();   // pin hidden beneath an open menu
    if(!labelled&&!under&&(bw<43||bh<43))res.small.push(desc(el)+' in '+(el.parentElement.tagName.toLowerCase()+'.'+(typeof el.parentElement.className==='string'?el.parentElement.className.split(' ')[0]:''))+'/'+(el.parentElement.parentElement?.className||'').toString().split(' ')[0]+' '+Math.round(b.width)+'x'+Math.round(b.height)+' reach '+horiz+'x'+vert+(vert<43?' covered by '+(()=>{const t=document.elementFromPoint(cx,cy-(vert>1?vert:0)/2-3);return t?t.tagName+'.'+(t.className||'')+' y='+Math.round(cy):'null y='+Math.round(cy);})():''));
   }
  }
  for(const el of document.querySelectorAll('body *')){
   if(!vis(el))continue;const b=el.getBoundingClientRect();
   if(b.right>innerWidth+1&&getComputedStyle(el).position!=='fixed'&&!el.closest('canvas,svg,table,pre,.table-wrap,[data-scroll]')){
    let clippedAncestor=false;for(let p=el.parentElement;p&&p!==document.body;p=p.parentElement){const o=getComputedStyle(p).overflowX;if(o!=='visible'&&p.getBoundingClientRect().right<=innerWidth+1){clippedAncestor=true;break;}}
    if(!clippedAncestor)res.wide.push(desc(el)+' right='+Math.round(b.right));
   }
   const s=getComputedStyle(el);
   if(el.children.length===0&&el.textContent.trim()&&(s.overflow==='hidden'||s.textOverflow==='ellipsis')&&el.scrollWidth>el.clientWidth+1&&s.textOverflow!=='ellipsis'&&!el.matches('.sr-only,.visually-hidden'))res.clipped.push(desc(el)+' '+el.scrollWidth+'>'+el.clientWidth);
  }
  res.wide=res.wide.slice(0,8);res.small=[...new Set(res.small.map(x=>x.replace(/"[^"]*"/,'').replace(/\d+x\d+/,m=>m)))].slice(0,40);res.unnamed=res.unnamed.slice(0,20);res.clipped=res.clipped.slice(0,12);
  res.controls=controls.length;return res;
 },{phone});
 // Focus visibility: press the real Tab key and require a visible indicator on each stop.
 await page.evaluate(()=>{document.activeElement?.blur?.();window.scrollTo(0,0);});
 const noFocus=[],seen=new Set();let stops=0;
 for(let i=0;i<150;i++){
  await page.keyboard.press('Tab');
  const info=await page.evaluate(()=>{const el=document.activeElement;if(!el||el===document.body)return null;const s=getComputedStyle(el);
   const ring=s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0&&s.outlineColor!=='rgba(0, 0, 0, 0)';
   const cs=el.closest('[class]');const key=el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+'.'+(typeof el.className==='string'?el.className.split(' ')[0]:'');
   return {key,ring,fv:el.matches(':focus-visible'),shadow:s.boxShadow!=='none',label:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,24),sig:key+'|'+s.outlineStyle+s.outlineWidth+s.boxShadow};},);
  if(!info)continue;stops++;
  if(seen.has(info.sig))continue;seen.add(info.sig);
  if(!info.fv||(!info.ring&&!info.shadow))noFocus.push(info.key+' "'+info.label+'"'+(info.fv?'':' (not :focus-visible)'));
 }
 r.focusStops=stops;
 r.noFocus=[...new Set(noFocus)].slice(0,20);r.errors=errors;
 out.push({file,w,...r});
 if(shotDir){fs.mkdirSync(shotDir,{recursive:true});await page.screenshot({path:`${shotDir}/${file.replace('.html','')}${process.env.GR_SWEEP_TAG||''}-${w}.png`,fullPage:file!=='visualizer.html'});}
 await ctx.close();
}
await browser.close();
fs.mkdirSync('.local',{recursive:true});fs.writeFileSync(`.local/sweep${process.env.GR_SWEEP_TAG||''}.json`,JSON.stringify(out,null,1));
let bad=0;
for(const o of out){const issues=[];if(o.overflowX>0)issues.push('overflowX '+o.overflowX);for(const k of ['wide','small','unnamed','clipped','noFocus','errors'])if(o[k]?.length)issues.push(k+': '+o[k].join('; '));
 console.log(`${o.file} @${o.w}: ${issues.length?issues.join(' | '):'clean'} (${o.controls} controls)`);if(issues.length)bad++;}
console.log(`${out.length-bad}/${out.length} page-width cells clean`);
process.exitCode=bad?1:0;
