import { describe, expect, it } from 'vitest';
import { overlapsRect, pinLabelBox, declutterPins, avoidPinObstacles, layoutAnchoredPins } from './pin-layout.js';

describe('anchored component markers', () => {
  const box=(p:{x:number;y:number})=>({left:p.x-14,right:p.x+14,top:p.y-14,bottom:p.y+14});
  const separated=(placements:Map<string,{x:number;y:number}>)=>{
    const points=[...placements.values()];
    for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)expect(Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y)).toBeGreaterThanOrEqual(30-1e-6);
  };

  it('leaves already readable anchors exactly in place, including the selected marker', () => {
    const points=[{id:'a',x:30,y:45},{id:'b',x:160,y:100},{id:'c',x:320,y:190}];
    const original=structuredClone(points);
    const result=layoutAnchoredPins(points,{width:390,height:250,selected:'b'});
    expect([...result.placements.keys()]).toEqual(['a','b','c']);
    expect(result.unresolved.size).toBe(0);
    for(const p of points)expect(result.placements.get(p.id)).toEqual({x:p.x,y:p.y,ax:p.x,ay:p.y});
    expect(points).toEqual(original);
  });

  it('moves a collided neighbor one spacing away while the selected anchor wins', () => {
    const points=[{id:'neighbor',x:190,y:145},{id:'selected',x:190,y:145},{id:'clear',x:235,y:145}];
    const result=layoutAnchoredPins(points,{width:390,height:300,selected:'selected'});
    expect(result.placements.get('selected')).toEqual({x:190,y:145,ax:190,ay:145});
    expect(result.placements.get('clear')).toEqual({x:235,y:145,ax:235,ay:145});
    const moved=result.placements.get('neighbor')!;
    expect(Math.hypot(moved.x-190,moved.y-145)).toBeCloseTo(30,8);
    expect(moved).toMatchObject({ax:190,ay:145});
    separated(result.placements);
  });

  it('does not propagate a collision into a global ring or move unrelated anchors', () => {
    const points=[{id:'a',x:100,y:160},{id:'b',x:102,y:160},{id:'c',x:136,y:160},{id:'d',x:172,y:160},{id:'e',x:208,y:160}];
    const result=layoutAnchoredPins(points,{width:390,height:300});
    for(const p of points.filter(point=>point.id!=='b'))expect(result.placements.get(p.id)).toMatchObject({x:p.x,y:p.y});
    expect(result.unresolved.size).toBe(0);
    separated(result.placements);
  });

  it('takes the nearby nameplate exit and respects both HUD bounds and viewport edges', () => {
    const obstacles=[{left:100,right:280,top:100,bottom:140},{left:0,right:390,top:0,bottom:42}];
    const points=[{id:'selected',x:190,y:152},{id:'edge',x:389,y:175},{id:'hud',x:35,y:25},{id:'clear',x:70,y:190}];
    const result=layoutAnchoredPins(points,{width:390,height:250,obstacles,selected:'selected'});
    expect(result.placements.get('selected')).toEqual({x:190,y:158,ax:190,ay:152});
    expect(result.placements.get('clear')).toMatchObject({x:70,y:190});
    expect(result.unresolved.size).toBe(0);
    for(const p of result.placements.values()) {
      expect(p.x).toBeGreaterThanOrEqual(15);expect(p.x).toBeLessThanOrEqual(375);
      expect(p.y).toBeGreaterThanOrEqual(15);expect(p.y).toBeLessThanOrEqual(235);
      for(const obstacle of obstacles)expect(overlapsRect(box(p),obstacle,4)).toBe(false);
    }
    separated(result.placements);
  });

  it('keeps all dense payload pins selectable in a short phone viewport, deterministically', () => {
    const obstacles=[{left:10,right:225,top:8,bottom:40},{left:16,right:282,top:240,bottom:277},{left:234,right:291,top:95,bottom:117}];
    for(const selected of ['p0','p6','p12']) {
      const points=Array.from({length:13},(_,i)=>({id:`p${i}`,x:148+(i%4)*4,y:137+Math.floor(i/4)*3}));
      const result=layoutAnchoredPins(points,{width:320,height:292,obstacles,selected});
      expect(result.placements.size).toBe(13);expect(result.unresolved.size).toBe(0);
      expect(layoutAnchoredPins(points,{width:320,height:292,obstacles,selected})).toEqual(result);
      const original=points.find(p=>p.id===selected)!;
      expect(result.placements.get(selected)).toMatchObject({x:original.x,y:original.y});
      for(const p of result.placements.values()) {
        expect(Math.hypot(p.x-p.ax,p.y-p.ay)).toBeLessThan(100);
        for(const obstacle of obstacles)expect(overlapsRect(box(p),obstacle,4)).toBe(false);
      }
      separated(result.placements);
    }
  });

  it('reports impossible placements while preserving every pin and geometry leader', () => {
    const points=[{id:'a',x:50,y:50},{id:'b',x:55,y:50}];
    const result=layoutAnchoredPins(points,{width:100,height:100,obstacles:[{left:0,right:100,top:0,bottom:100}],selected:'b'});
    expect([...result.placements.keys()]).toEqual(['a','b']);
    expect(result.unresolved).toEqual(new Set(['a','b']));
    for(const p of points)expect(result.placements.get(p.id)).toMatchObject({ax:p.x,ay:p.y});
  });
});

describe('pin labels respect visible UI reservations',()=>{
  it('hides a label when the only free rectangle is detached from its marker',()=>{
    expect(pinLabelBox(700,400,120,1000,800,[{left:200,right:1000,top:0,bottom:800}],true)).toBeNull();
  });
  const hud={left:600,right:1050,top:20,bottom:140};
  it('rejects an unselected label underneath HUD instructions',()=>{
    expect(pinLabelBox(815,100,95,1100,750,[hud])).toBeNull();
    expect(overlapsRect({left:802,right:828,top:87,bottom:113},hud,4)).toBe(true);
  });
  it('places a selected label beside the reservation without moving its anchor',()=>{
    const box=pinLabelBox(815,100,95,1100,750,[hud],true);
    expect(box).not.toBeNull();expect(overlapsRect(box!,hud,4)).toBe(false);
    expect(box!.bottom).toBeLessThan(750);expect(box!.left).toBeGreaterThanOrEqual(6);
  });
  it('flips to the clear side instead of hiding a label whose marker remains clear',()=>{
    const right={left:230,right:390,top:10,bottom:100};
    const box=pinLabelBox(210,65,90,390,445,[right]);
    expect(box!.right).toBeLessThan(210);expect(overlapsRect(box!,right,4)).toBe(false);
  });
  it('does not treat mobile controls below the canvas as a label obstruction',()=>{
    const box=pinLabelBox(180,110,90,390,140,[{left:0,right:390,top:150,bottom:200}]);
    expect(box).not.toBeNull();
  });
  it('finds an open phone corner between staggered pins and printed nameplates',()=>{
    const obstacles=[{left:181,right:207,top:116,bottom:142},{left:32,right:54,top:92,bottom:114},{left:27,right:49,top:168,bottom:190},{left:304,right:326,top:158,bottom:180},{left:14,right:239,top:250,bottom:282},{left:123,right:220,top:155,bottom:196},{left:136,right:235,top:36,bottom:70},{left:12,right:79,top:205,bottom:241}];
    const box=pinLabelBox(194,129,140,390,292,obstacles,true,56);
    expect(box).not.toBeNull();
    for(const obstacle of obstacles)expect(overlapsRect(box!,obstacle,4)).toBe(false);
    expect(box!.left).toBeGreaterThanOrEqual(6);expect(box!.right).toBeLessThanOrEqual(384);
    expect(box!.top).toBeGreaterThanOrEqual(6);expect(box!.bottom).toBeLessThanOrEqual(286);
  });
});

describe('numbered pins avoid printed component names',()=>{
  it('keeps a short landscape canvas caption readable without losing the pin anchor',()=>{
    const caption={left:14,right:310,top:133,bottom:166};
    const original=new Map([['6',{x:235,y:145,ax:235,ay:145}],['9',{x:275,y:117,ax:275,ay:117}]]);
    const moved=avoidPinObstacles(original,{obstacles:[caption],width:473,height:176});
    for(const p of moved.values())expect(overlapsRect({left:p.x-14,right:p.x+14,top:p.y-14,bottom:p.y+14},caption,4)).toBe(false);
    expect(moved.get('6')).toMatchObject({ax:235,ay:145});
  });
  it('moves a marker off a nameplate while preserving the geometry leader',()=>{
    const plate={left:100,right:280,top:120,bottom:175};
    const original=new Map([['a',{x:190,y:145,ax:190,ay:145}],['b',{x:310,y:150,ax:310,ay:150}]]);
    const moved=avoidPinObstacles(original,{obstacles:[plate],width:390,height:400,selected:'a'});
    for(const p of moved.values())expect(overlapsRect({left:p.x-14,right:p.x+14,top:p.y-14,bottom:p.y+14},plate,4)).toBe(false);
    expect(moved.get('a')).toMatchObject({ax:190,ay:145});
    expect(Math.hypot(moved.get('a')!.x-moved.get('b')!.x,moved.get('a')!.y-moved.get('b')!.y)).toBeGreaterThanOrEqual(30);
    expect(original.get('a')!.y).toBe(145);
  });
});

describe('small-screen pin declutter', () => {
  it('fans a coincident pair apart and keeps each true point as a leader anchor', () => {
    const { placements, hidden, groups } = declutterPins([{ id: 'a', x: 100, y: 100 }, { id: 'b', x: 104, y: 101 }, { id: 'c', x: 300, y: 300 }]);
    expect(hidden.size).toBe(0); expect(groups).toHaveLength(0);
    const a = placements.get('a')!, b = placements.get('b')!;
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(26);
    expect([a.ax, a.ay]).toEqual([100, 100]);
    expect(placements.get('c')).toEqual({ x: 300, y: 300, ax: 300, ay: 300 });
  });
  it('collapses a pile of five into one group, and fans it out once opened', () => {
    const pile = [1, 2, 3, 4, 5].map(i => ({ id: `p${i}`, x: 200 + i * 3, y: 200 - i * 2 }));
    const closed = declutterPins(pile);
    expect(closed.groups).toHaveLength(1); expect(closed.groups[0].ids).toEqual(['p1', 'p2', 'p3', 'p4', 'p5']);
    expect(closed.hidden.size).toBe(5);
    const open = declutterPins(pile, { expanded: new Set(['p3']) });
    expect(open.groups).toHaveLength(0); expect(open.hidden.size).toBe(0);
    const spots = [...open.placements.values()];
    for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++) expect(Math.hypot(spots[i].x - spots[j].x, spots[i].y - spots[j].y)).toBeGreaterThanOrEqual(25.9);
  });
  it('never leaves two fans or badges touching, however dense the pile', () => {
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let trial = 0; trial < 20; trial++) {
      const pts = Array.from({ length: 13 }, (_, i) => ({ id: `q${i}`, x: 150 + rnd() * 120, y: 300 + rnd() * 70 }));
      const { placements, groups } = declutterPins(pts);
      const spots = [...[...placements.values()].map(p => ({ x: p.x, y: p.y, r: 12 })), ...groups.map(g => ({ x: g.x, y: g.y, r: 21 }))];
      for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++)
        expect(Math.hypot(spots[i].x - spots[j].x, spots[i].y - spots[j].y)).toBeGreaterThanOrEqual(spots[i].r + spots[j].r + 4 - 1e-6);
    }
  });
});
