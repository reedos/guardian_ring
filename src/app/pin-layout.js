export const overlapsRect = (a, b, gap = 0) => a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;

const PIN_DIRECTIONS = Array.from({length:16},(_,i)=>({x:Math.sin(i*Math.PI/8),y:-Math.cos(i*Math.PI/8)}));

// Preserve clear geometry anchors before looking for space for collided markers.
// Unlike a cluster fan, moving one marker never moves the other anchors as a group.
// Search is deterministic and bounded; a fully occupied viewport keeps every pin
// in placements and reports the unsolved IDs instead of silently hiding controls.
/** @param {{id:string,x:number,y:number}[]} points
 * @param {{width:number,height:number,obstacles?:{left:number,right:number,top:number,bottom:number}[],selected?:string|null}} options
 * @returns {{placements:Map<string,{x:number,y:number,ax:number,ay:number}>,unresolved:Set<string>}} */
export function layoutAnchoredPins(points, {width,height,obstacles=[],selected=null}) {
  const HALF=14, MARGIN=15, SEPARATION=30, CLEARANCE=4, LIMIT=1024;
  const minX=Math.min(MARGIN,width/2),maxX=Math.max(minX,width-MARGIN);
  const minY=Math.min(MARGIN,height/2),maxY=Math.max(minY,height-MARGIN);
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  // Inflate obstacles once, then use point/rectangle tests for pin centers.
  const blocked=obstacles.map(rect=>({left:rect.left-HALF-CLEARANCE,right:rect.right+HALF+CLEARANCE,top:rect.top-HALF-CLEARANCE,bottom:rect.bottom+HALF+CLEARANCE}));
  const inBounds=(x,y)=>x>=minX&&x<=maxX&&y>=minY&&y<=maxY;
  const outsideObstacles=(x,y)=>!blocked.some(r=>x>r.left+1e-6&&x<r.right-1e-6&&y>r.top+1e-6&&y<r.bottom-1e-6);
  const placed=[],pending=[],byId=new Map(),unresolved=new Set();
  const clear=(x,y)=>inBounds(x,y)&&outsideObstacles(x,y)&&!placed.some(p=>(x-p.x)**2+(y-p.y)**2<SEPARATION**2-1e-6);
  const put=(point,x,y)=>{const result={x,y,ax:point.x,ay:point.y};placed.push(result);byId.set(point.id,result);};
  const ordered=points.filter(point=>point.id===selected).concat(points.filter(point=>point.id!==selected));
  // Selected wins any overlap at its original anchor. Reserve all other clear
  // anchors too, so a relocated neighbor cannot trigger a chain of displacement.
  for(const point of ordered) {
    if(clear(point.x,point.y))put(point,point.x,point.y);
    else pending.push(point);
  }
  for(const point of pending) {
    let best=null,bestDistance=Infinity,attempts=0;
    const candidate=(x,y)=>{
      if(attempts++>=LIMIT)return;
      x=clamp(x,minX,maxX);y=clamp(y,minY,maxY);
      const distance=(x-point.x)**2+(y-point.y)**2;
      if(distance>=bestDistance-1e-6||!clear(x,y))return;
      best={x,y};bestDistance=distance;
    };
    candidate(point.x,point.y);
    // Exact nearest exits from HUD/nameplate rectangles avoid coarse radial
    // jumps when a marker is only a few pixels inside an obstacle.
    for(const r of blocked) {
      candidate(clamp(point.x,r.left,r.right),r.top);
      candidate(clamp(point.x,r.left,r.right),r.bottom);
      candidate(r.left,clamp(point.y,r.top,r.bottom));
      candidate(r.right,clamp(point.y,r.top,r.bottom));
      candidate(r.left,r.top);candidate(r.right,r.top);
      candidate(r.left,r.bottom);candidate(r.right,r.bottom);
      if(attempts>=LIMIT/3)break;
    }
    // Exact pin-to-pin clearance, followed by a small fixed set of directions.
    // A duplicated anchor therefore moves by one marker spacing, not a cluster radius.
    for(const p of placed) {
      const dx=point.x-p.x,dy=point.y-p.y,length=Math.hypot(dx,dy);
      candidate(p.x+(length?dx/length:0)*SEPARATION,p.y+(length?dy/length:-1)*SEPARATION);
      for(const direction of PIN_DIRECTIONS)candidate(p.x+direction.x*SEPARATION,p.y+direction.y*SEPARATION);
      if(attempts>=LIMIT*2/3)break;
    }
    // Local search catches free pockets between several overlapping obstacles.
    for(let radius=12;radius<=180&&attempts<LIMIT-64;radius+=12) {
      if(radius*radius>bestDistance)break;
      for(const direction of PIN_DIRECTIONS)candidate(point.x+direction.x*radius,point.y+direction.y*radius);
    }
    if(!best) {
      // Last resort for broad HUD regions: a bounded viewport grid. This affects
      // only the unresolved marker, never the stable anchors reserved above.
      for(let row=0;row<8;row++)for(let column=0;column<8;column++)candidate(minX+(maxX-minX)*column/7,minY+(maxY-minY)*row/7);
    }
    if(best)put(point,best.x,best.y);
    else {put(point,clamp(point.x,minX,maxX),clamp(point.y,minY,maxY));unresolved.add(point.id);}
  }
  // Return insertion order identical to the caller's component order.
  return {placements:new Map(points.map(point=>[point.id,byId.get(point.id)])),unresolved};
}

// Printed hardware names and screen text are obstacles for numbered markers. Keep leaders
// tied to the original anchor while moving a marker to the nearest clear spot.
/** @param {Map<string,{x:number,y:number,ax:number,ay:number}>} placements
 * @param {{obstacles:{left:number,right:number,top:number,bottom:number}[],width:number,height:number,selected?:string|null}} options */
export function avoidPinObstacles(placements, { obstacles, width, height, selected = null }) {
  if(!obstacles.length)return placements;
  const result=new Map([...placements].map(([id,p])=>[id,{...p,x:Math.max(15,Math.min(width-15,p.x)),y:Math.max(15,Math.min(height-15,p.y))}]));
  const ids=[...result.keys()].sort((a,b)=>a===selected?-1:b===selected?1:0);
  for(const id of ids){
    const point=result.get(id);
    const clear=({x,y})=>x>=15&&x<=width-15&&y>=15&&y<=height-15
      &&!obstacles.some(r=>overlapsRect({left:x-14,right:x+14,top:y-14,bottom:y+14},r,4))
      &&![...result].some(([other,p])=>other!==id&&Math.hypot(p.x-x,p.y-y)<30);
    if(clear(point))continue;
    const candidates=[];
    for(const r of obstacles)candidates.push({x:point.x,y:r.top-19},{x:point.x,y:r.bottom+19},{x:r.left-19,y:point.y},{x:r.right+19,y:point.y});
    for(let radius=28;radius<=196;radius+=28)for(let i=0;i<16;i++)candidates.push({x:point.x+Math.cos(i*Math.PI/8)*radius,y:point.y+Math.sin(i*Math.PI/8)*radius});
    candidates.sort((a,b)=>Math.hypot(a.x-point.x,a.y-point.y)-Math.hypot(b.x-point.x,b.y-point.y));
    const next=candidates.find(clear);if(next)result.set(id,{...point,...next});
  }
  return result;
}

export function pinLabelBox(x, y, width, canvasWidth, canvasHeight, reserved, selected = false, height = 18) {
  const nearby = box => Math.hypot(Math.max(box.left, Math.min(box.right,x))-x, Math.max(box.top,Math.min(box.bottom,y))-y) <= 220;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const candidates = [[x + 18, y - 9], [x - 29 - width, y - 9]];
  if (selected) {
    candidates.push([x - width / 2, y + 18], [x - width / 2, y - height - 18]);
    for (const r of reserved) candidates.push([x - width / 2, r.bottom + 6], [x - width / 2, r.top - height - 6], [r.left - width - 6, y - 9], [r.right + 6, y - 9]);
  }
  for (let [left, top] of candidates) {
    if (selected) { left = clamp(left, 6, canvasWidth - width - 6); top = clamp(top, 6, canvasHeight - height - 6); }
    const box = { left, top, right: left + width, bottom: top + height };
    if (box.left < 6 || box.right > canvasWidth - 6 || box.top < 6 || box.bottom > canvasHeight - 6) continue;
    if (nearby(box) && !reserved.some(r => overlapsRect(box, r, 4))) return box;
  }
  if(selected){
    // A free rectangle can require both axes to move. Testing only above/below
    // the anchor misses open corners between staggered pins and nameplates.
    const xs=[6,canvasWidth-width-6,...reserved.flatMap(r=>[r.left-width-6,r.right+6])];
    const ys=[6,canvasHeight-height-6,...reserved.flatMap(r=>[r.top-height-6,r.bottom+6])];
    const corners=[];
    for(const left of new Set(xs.map(v=>clamp(v,6,canvasWidth-width-6))))for(const top of new Set(ys.map(v=>clamp(v,6,canvasHeight-height-6)))){
      const box={left,top,right:left+width,bottom:top+height};
      if(nearby(box)&&box.right<=canvasWidth-6&&box.bottom<=canvasHeight-6&&!reserved.some(r=>overlapsRect(box,r,4)))corners.push(box);
    }
    corners.sort((a,b)=>Math.hypot(a.left+width/2-x,a.top+height/2-y)-Math.hypot(b.left+width/2-x,b.top+height/2-y));
    if(corners.length)return corners[0];
  }
  return null;
}

// Small screens: numbered pins that land on top of each other are decluttered. Pins closer than `radius` px join one
// cluster. A cluster of 2..collapseAt-1 pins fans out on a ring round its centre (each pin keeps its own number), a
// bigger one folds into a single group badge, which fans out like the small ones once `expanded` holds any of its
// ids. Whatever results must not overlap: two clusters whose fans or badges would touch merge and are laid out again.
// points: [{ id, x, y }] in list order. Returns placements (id -> { x, y, ax, ay }, true point ax/ay),
// hidden ids, and groups ({ key, ids, x, y }) to draw as badges.
/** @param {{ id: string, x: number, y: number }[]} points @param {{ radius?: number, collapseAt?: number, expanded?: Set<string> | null }} [opts] */
export function declutterPins(points, { radius = 24, collapseAt = 5, expanded = null } = {}) {
  const PIN = 12, BADGE = 21;   // half-sizes: a 22 px pin with its ring, a "N +k" badge
  const order = new Map(points.map((p, i) => [p.id, i]));
  let clusters = points.map(p => [p]);
  const centre = m => ({ x: m.reduce((s, q) => s + q.x, 0) / m.length, y: m.reduce((s, q) => s + q.y, 0) / m.length });
  const merge = (i, j) => { clusters[i] = [...clusters[i], ...clusters[j]].sort((a, b) => order.get(a.id) - order.get(b.id)); clusters.splice(j, 1); };
  // single linkage: any two pins closer than radius share a cluster
  for (let again = true; again;) {
    again = false;
    outer: for (let i = 0; i < clusters.length; i++) for (let j = i + 1; j < clusters.length; j++)
      if (clusters[i].some(a => clusters[j].some(b => Math.hypot(a.x - b.x, a.y - b.y) < radius))) { merge(i, j); again = true; break outer; }
  }
  const layout = m => {
    const c = centre(m), k = m.length;
    if (k === 1) return { c, items: [{ id: m[0].id, x: m[0].x, y: m[0].y, r: PIN, p: m[0] }] };
    const open = expanded && m.some(p => expanded.has(p.id));
    if (k >= collapseAt && !open) return { c, group: true, items: [{ x: c.x, y: c.y, r: BADGE }] };
    // evenly spaced round the centre, in the order the pins already sit round it, so each keeps its side;
    // neighbours 34 px apart: 22 px badges with a clear gap
    const r = 17 / Math.sin(Math.PI / k);
    const ang = m.map(p => Math.hypot(p.x - c.x, p.y - c.y) < 1 ? null : Math.atan2(p.y - c.y, p.x - c.x));
    const start = ang.find(a => a !== null) ?? -Math.PI / 2;
    const rel = a => ((a - start) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const sorted = m.map((p, i) => ({ p, a: ang[i] ?? start + i * 1e-3 })).sort((u, v) => rel(u.a) - rel(v.a));
    return { c, items: sorted.map(({ p }, i) => { const a = start + i * 2 * Math.PI / k; return { id: p.id, x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a), r: PIN, p }; }) };
  };
  let laid;
  for (let again = true; again;) {
    again = false; laid = clusters.map(layout);
    outer: for (let i = 0; i < laid.length; i++) for (let j = i + 1; j < laid.length; j++)
      if (laid[i].items.some(a => laid[j].items.some(b => Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + 4))) { merge(i, j); again = true; break outer; }
  }
  const placements = new Map(), hidden = new Set(), groups = [];
  laid.forEach((l, i) => {
    if (l.group) { clusters[i].forEach(p => hidden.add(p.id)); groups.push({ key: clusters[i].map(p => p.id).join('|'), ids: clusters[i].map(p => p.id), x: l.c.x, y: l.c.y }); return; }
    for (const it of l.items) placements.set(it.id, { x: it.x, y: it.y, ax: it.p.x, ay: it.p.y });
  });
  return { placements, hidden, groups };
}
