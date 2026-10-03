// Open popups are audited as their own interaction surface: they intentionally
// cover background controls. Closed-state checks still cover those controls.
export const checkUI=({selector='button,select,summary,.topbar a'})=>{
 const bad=[],label=el=>el.id||el.getAttribute('aria-label')||el.textContent.trim().slice(0,70);
 const rendered=el=>{if(!el.checkVisibility())return false;for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(p.hidden||s.display==='none'||s.visibility==='hidden'||Number(s.opacity)===0)return false;}const r=el.getBoundingClientRect();return r.width>0&&r.height>0;};
 const nodes=[...document.querySelectorAll(selector)].filter(rendered);
 if(!nodes.length)return ['no rendered controls in audited state'];
 const intersection=(a,b)=>({left:Math.max(a.left,b.left),right:Math.min(a.right,b.right),top:Math.max(a.top,b.top),bottom:Math.min(a.bottom,b.bottom)});
 const clip=el=>{let c={left:0,right:innerWidth,top:0,bottom:innerHeight};for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p),r=p.getBoundingClientRect();if(/auto|scroll|hidden|clip/.test(s.overflowX))c={...c,left:Math.max(c.left,r.left),right:Math.min(c.right,r.right)};if(/auto|scroll|hidden|clip/.test(s.overflowY))c={...c,top:Math.max(c.top,r.top),bottom:Math.min(c.bottom,r.bottom)};}return c;};
 // Compare only the portions currently exposed by scrolling containers.
 const exposed=nodes.map(el=>({el,r:intersection(el.getBoundingClientRect(),clip(el))})).filter(({r})=>r.right>r.left&&r.bottom>r.top);
 for(let i=0;i<exposed.length;i++)for(let j=i+1;j<exposed.length;j++){const a=exposed[i],b=exposed[j];if(a.el.contains(b.el)||b.el.contains(a.el))continue;const r=intersection(a.r,b.r);if(r.right-r.left>2&&r.bottom-r.top>2)bad.push(`${label(a.el)} overlaps ${label(b.el)}`);}
 const scrollables=[...document.querySelectorAll('*')].filter(el=>el.scrollHeight>el.clientHeight||el.scrollWidth>el.clientWidth).map(el=>[el,el.scrollLeft,el.scrollTop]);
 for(const el of nodes){
  // Scrollable controls may begin below the fold, but every one must be reachable.
  const locked=[];for(let p=el.parentElement;p;p=p.parentElement){const s=getComputedStyle(p);if(/hidden|clip/.test(s.overflowX)||/hidden|clip/.test(s.overflowY))locked.push([p,p.scrollLeft,p.scrollTop,s.overflowX,s.overflowY]);}
  el.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  for(const [p,x,y,ox,oy] of locked)if((/hidden|clip/.test(ox)&&Math.abs(p.scrollLeft-x)>1)||(/hidden|clip/.test(oy)&&Math.abs(p.scrollTop-y)>1)){bad.push(`${label(el)}: requires scrolling a non-scrollable container`);p.scrollLeft=x;p.scrollTop=y;}
  const r=el.getBoundingClientRect(),c=clip(el);
  if(r.left<c.left-1||r.right>c.right+1||r.top<c.top-1||r.bottom>c.bottom+1)bad.push(`${label(el)}: clipped or outside viewport after scrolling`);
  const x=(r.left+r.right)/2,y=(r.top+r.bottom)/2,top=document.elementFromPoint(x,y);
  if(!top||!(el===top||el.contains(top)))bad.push(`${label(el)}: center obscured by ${top?label(top):'viewport edge'}`);
 }
 scrollables.forEach(([el,x,y])=>{el.scrollLeft=x;el.scrollTop=y;});
 if(document.documentElement.scrollWidth>innerWidth+1)bad.push('horizontal page overflow');
 return [...new Set(bad)];
};

