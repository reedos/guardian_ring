// Geometric gate algorithms adapted from IF (MIT).
export const checkView = () => {
  const T = grx.THREE, st = grx.state, B = grx.built[st.scene];
  const hs = ({ light: B.hotspots, data: B.dataHotspots, heat: B.heatHotspots })[st.mode][st.selected];
  if (!hs) return { err: 'no hotspot' };
  const cam = grx.camera, target = new T.Vector3(...hs.pos), dir = target.clone().sub(cam.position), dist = dir.length(); dir.normalize();
  const ray = new T.Raycaster(cam.position.clone(), dir, cam.near, dist * 1.02);
  const shown = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
  const solid = o => {
    if (!(o.isMesh || o.isInstancedMesh) || o.isSprite || !shown(o)) return false;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    return mats.some(m => m && m.depthWrite !== false && !(m.transparent && m.opacity < 0.6) && m.visible !== false);
  };
  const objs = []; B.scene.traverse(o => { if (solid(o)) objs.push(o); });
  const hits = ray.intersectObjects(objs, false);
  // anything hit before 85% of the way to the part is in front of it
  const block = hits.find(h => h.distance < dist * 0.85);
  const col = m => { const mm = Array.isArray(m) ? m[0] : m; return mm?.color ? '#' + mm.color.getHexString() : '?'; };
  // the pin on screen against the page's overlays
  const pin = document.querySelector(`.pin[data-id="${st.selected}"] .num`);
  const view = document.getElementById('view').getBoundingClientRect();
  const r = pin && !pin.closest('.pin').classList.contains('off') ? pin.getBoundingClientRect() : null;
  const over = (a, c) => a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top;
  const covers = [];
  if (!r) covers.push('pin off screen');
  else {
    if (r.left < view.left + 4 || r.right > view.right - 4 || r.top < view.top + 4 || r.bottom > view.bottom - 4) covers.push('pin at the view edge');
    for (const [name, sel] of [['title', '.hud.tl'], ['layer buttons', '.hud.tr .mode'], ['view buttons', '.hud-row'], ['legend', '.hud.br'], ['scale bar', '.hud.bl']]) {
      const el = document.querySelector(sel);
      if (!el || el.hidden || getComputedStyle(el).display === 'none') continue;
      const c = el.getBoundingClientRect();
      if (c.width && over(r, c)) covers.push(name);
    }
  }
  return { dist: +dist.toFixed(3), blocked: block ? `${block.object.type} ${col(block.object.material)} at ${Math.round(block.distance / dist * 100)}%` : null, covers };
};

export const fly = async ({ id = '', assemblyView = '', animationStep = null }) => {
  const T = grx.THREE, st = grx.state, B = grx.built[st.scene], cam = grx.camera;
  if (typeof grx.flightProgress !== 'function') throw new Error('Missing rendered flight-progress hook');
  let observedProgress = 0;
  const readProgress = () => {
    const u = grx.flightProgress();
    if (typeof u !== 'number' || !Number.isFinite(u) || u < 0 || u > 1) throw new Error(`Invalid rendered flight progress: ${String(u)}`);
    if (u < observedProgress) throw new Error(`Nonmonotonic rendered flight progress: ${observedProgress} → ${u}`);
    observedProgress = u; return u;
  };
  const frames = [cam.position.clone()], aims = [grx.controls.target.clone()], progress = [0];
  const spot = assemblyView?{view:B.camera}:({light:B.hotspots,data:B.dataHotspots,heat:B.heatHotspots})[st.mode]?.[id];
  const motionRequired = !!spot?.view && (cam.position.distanceTo(new T.Vector3(...spot.view.pos)) > 1e-7 || grx.controls.target.distanceTo(new T.Vector3(...spot.view.target)) > 1e-7);
  const t0 = performance.now(), cs = grx.clearance ? { ...grx.clearance } : null;
  // The duplicate sequence buttons were removed in B1. Probe the same public
  // teaching-step API used by the retained gate actions, without settling away
  // the camera flight whose intermediate clearance this helper measures.
  if(animationStep!==null){grx.setSceneActivity(false);grx.stepTeaching(animationStep<0?-1:1);}
  else if (assemblyView) grx.setAssemblyView(assemblyView);
  else if (id) grx.select(id, true);
  if (readProgress() !== 0) throw new Error('Flight did not begin at rendered progress 0');
  const selectMs = performance.now() - t0, ce = grx.clearance;
  const plan = cs && { standIn: ce.standIn > cs.standIn, unplanned: ce.unplanned > cs.unplanned, planned: ce.plans > cs.plans ? ce.planMs : null, ready: ce.hits > cs.hits, clear: ce.clear, chosen: ce.chosen, costs: ce.costs };
  await new Promise((res, reject) => {
    let still = 0, n = 0;
    const tick = () => {
      try {
        const q = cam.position, last = frames[frames.length - 1], u = readProgress();
        if (q.distanceTo(last) > 1e-7 || grx.controls.target.distanceTo(aims[aims.length - 1]) > 1e-7 || (u === 1 && progress[progress.length - 1] < 1)) { frames.push(q.clone()); aims.push(grx.controls.target.clone()); progress.push(u); still = 0; } else still++;
        // Finish only after the actual endpoint has been played and recorded.
        // Forcing settle after a timeout would conceal an incomplete flight.
        if (++n > 900) throw new Error('Flight did not finish within 900 rendered frames');
        if (!grx.isCameraMoving() && still >= 2) {
          if (u !== 1) throw new Error(`Flight stopped before completion at rendered progress ${u}`);
          res();
        } else requestAnimationFrame(tick);
      } catch (error) { reject(error); }
    };
    requestAnimationFrame(tick);
  });
  grx.settle();
  const shown = o => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
  const solid = o => {
    if (!(o.isMesh || o.isInstancedMesh) || o.isSprite || o.isLine2 || o.isLineSegments2 || o.userData.printed || !shown(o)) return false;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    return mats.some(m => m && m.visible !== false && !m.isLineMaterial && m.side !== T.BackSide && m.blending !== T.AdditiveBlending && !(m.transparent && m.opacity < 0.6));
  };
  const all = []; B.scene.traverse(o => { if (solid(o)) all.push(o); });
  // the surroundings: flat and as wide as the level (terrain, ridgeline, studio floor), with the camera above them
  const span = new T.Box3(); all.forEach(o => span.expandByObject(o));
  const wide = Math.max(span.max.x - span.min.x, span.max.z - span.min.z);
  const lowest = Math.min(...frames.map(f => f.y));
  const box = new T.Box3(), size = new T.Vector3();
  const objs = all.filter(o => {
    box.setFromObject(o); box.getSize(size);
    const across = Math.max(size.x, size.z);
    return !(size.y < 0.02 * across && across >= 0.9 * wide && box.max.y <= lowest);
  });
  const ray = new T.Raycaster(), d = new T.Vector3(), side = new T.Vector3(), hits = [], n = frames.length - 1;
  ray.camera = cam;
  const name = o => o.name || o.parent?.name || o.type;
  // the end framings, the reach that belongs to each, and its distance from its aim point
  const home = [0, n].map(i => { const d = frames[i].distanceTo(aims[i]); return [frames[i], 0.03 * d, d]; });
  const sameHome = (a, b) => home.some(([f, r]) => a.distanceTo(f) <= r && b.distanceTo(f) <= r);
  let blockedRun = 0;
  for (let k = 1; k <= n; k++) {
    // Exempt only motion within one endpoint region. A skipped-frame jump
    // from the start region to the destination still needs its segment checked.
    if (sameHome(frames[k - 1], frames[k])) continue;
    d.subVectors(frames[k], frames[k - 1]); const len = d.length(); if (len < 1e-9) continue;
    ray.set(frames[k - 1], d.normalize()); ray.near = 0; ray.far = len;
    let h = ray.intersectObjects(objs, false)[0];
    if (h) { hits.push({ frame: k, kind: 'through', what: name(h.object) }); continue; }
    // Frame count is not elapsed progress: dropped/uneven rendered frames must
    // not reparameterize the planner's taper or endpoint-distance envelope.
    const taper = Math.max(0, Math.min(Math.sin(Math.PI * progress[k - 1]), Math.sin(Math.PI * progress[k]))), D = Math.max(frames[k].distanceTo(aims[k]), home[0][2] + (home[1][2] - home[0][2]) * progress[k]);
    const r = 0.06 * D * taper;
    if (r <= 1e-6) continue;
    // nine probes around the camera: below, above, either side, the four diagonals between, and ahead-down
    side.set(-d.z, 0, d.x); if (side.lengthSq() < 1e-12) side.set(1, 0, 0); side.normalize();
    const dn = new T.Vector3(0, -1, 0), up = new T.Vector3(0, 1, 0), l = side.clone(), rt = side.clone().negate();
    const mix = (x, y) => x.clone().add(y).normalize();
    for (const dir of [dn, up, l, rt, mix(l, dn), mix(rt, dn), mix(l, up), mix(rt, up), mix(d, dn)]) {
      ray.set(frames[k], dir); ray.near = 0; ray.far = r;
      h = ray.intersectObjects(objs, false)[0];
      if (h) { hits.push({ frame: k, kind: `skims (${h.distance.toFixed(2)} of ${r.toFixed(2)} clear)`, what: name(h.object) }); break; }
    }
    if (h) { blockedRun = 0; continue; }
    // the view ahead, toward the aim point: blocked for three frames running (a thin pipe flicking past in one frame
    // is not a facade filling the view)
    const sight = 0.45 * D * taper;
    ray.set(frames[k], aims[k].clone().sub(frames[k]).normalize()); ray.near = 0; ray.far = sight;
    h = ray.intersectObjects(objs, false)[0];
    blockedRun = h ? blockedRun + 1 : 0;
    if (blockedRun === 3) hits.push({ frame: k, kind: `view blocked (${h.distance.toFixed(2)} ahead, of ${sight.toFixed(2)} clear)`, what: name(h.object) });
  }
  return { frames: frames.length, motionRequired, hits: hits.length, first: hits[0] || null, selectMs, plan, progress: { source:'rendered-flight-progress', start:progress[0], end:progress[progress.length - 1], samples:progress.length } };
};

export const checkCoplanar = () => {
    const w = window.grx, B = w.built[w.state.scene], cam = B.camera;
    const d = Math.hypot(cam.pos[0] - cam.target[0], cam.pos[1] - cam.target[1], cam.pos[2] - cam.target[2]);
    const tol = 2.5e-5 * d;                               // below this separation, 24-bit depth cannot separate faces at the default view
    const faces = [];                                     // {axis, sign, c, u0,u1,v0,v1 tris, tag}
    const M = w.camera.matrixWorld.constructor, V = w.camera.position.constructor;
    const m = new M(), va = new V(), vb = new V(), vc = new V(), e1 = new V(), e2 = new V(), n = new V();
    let meshId = 0;
    B.scene.updateMatrixWorld(true);
    B.scene.traverse(o => {
      if (!o.isMesh || !o.visible) return;
      let vis = true; for (let q = o; q; q = q.parent) if (!q.visible) vis = false; if (!vis) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      if (mats.every(mt => mt.transparent && !mt.depthWrite) || mats.every(mt => mt.isMeshBasicMaterial && mt.transparent)) return;
      const g = o.geometry, pos = g.attributes.position, idx = g.index;
      const count = o.isInstancedMesh ? o.count : 1;
      const groups = g.groups.length ? g.groups : [{ start: 0, count: idx ? idx.count : pos.count, materialIndex: 0 }];
      for (let k = 0; k < count; k++) {
        const tag = meshId++;
        if (o.isInstancedMesh) { o.getMatrixAt(k, m); m.premultiply(o.matrixWorld); } else m.copy(o.matrixWorld);
        for (const gr of groups) {
          const mt = mats[gr.materialIndex] || mats[0];
          if (mt.transparent && !mt.depthWrite) continue;
          const col = mt.color ? '#' + mt.color.getHexString() : '?';
          for (let t = gr.start; t < gr.start + gr.count; t += 3) {
            const i0 = idx ? idx.getX(t) : t, i1 = idx ? idx.getX(t + 1) : t + 1, i2 = idx ? idx.getX(t + 2) : t + 2;
            va.fromBufferAttribute(pos, i0).applyMatrix4(m); vb.fromBufferAttribute(pos, i1).applyMatrix4(m); vc.fromBufferAttribute(pos, i2).applyMatrix4(m);
            n.crossVectors(e1.subVectors(vb, va), e2.subVectors(vc, va)); const L = n.length(); if (L < 1e-12) continue; n.divideScalar(L);
            let axis = -1; if (Math.abs(n.y) > 0.9999) axis = 1; else if (Math.abs(n.x) > 0.9999) axis = 0; else if (Math.abs(n.z) > 0.9999) axis = 2; if (axis < 0) continue;
            if (axis === 1 && n.y < 0) continue;
            const sign = Math.sign(n.getComponent(axis)), [a1, a2] = axis === 1 ? [0, 2] : axis === 0 ? [1, 2] : [0, 1];
            const coordinates=[va.getComponent(axis),vb.getComponent(axis),vc.getComponent(axis)];
            faces.push({ axis, sign, c: coordinates[0], lo:Math.min(...coordinates), hi:Math.max(...coordinates), normal:n.toArray(), plane:n.dot(va), na:n.getComponent(axis), nu:n.getComponent(a1), nv:n.getComponent(a2), tri: [[va.getComponent(a1), va.getComponent(a2)], [vb.getComponent(a1), vb.getComponent(a2)], [vc.getComponent(a1), vc.getComponent(a2)]], tag, col, name: o.name || o.parent?.name || `mesh-${tag}`, dbl: mt.side === 2 });
          }
        }
      }
    });
    // Broad phase uses each triangle's axis interval: a slightly tilted face
    // has no single axis coordinate. The narrow phase compares its actual plane.
    const byKey = new Map();
    for (const f of faces) { const k = f.axis * 2 + (f.sign > 0 ? 1 : 0); if (!byKey.has(k)) byKey.set(k, []); byKey.get(k).push(f); }
    const hits = [];
    const inTri = (px, py, t) => { const [[x0, y0], [x1, y1], [x2, y2]] = t; const d1 = (px - x1) * (y0 - y1) - (x0 - x1) * (py - y1), d2 = (px - x2) * (y1 - y2) - (x1 - x2) * (py - y2), d3 = (px - x0) * (y2 - y0) - (x2 - x0) * (py - y0); return !(((d1 < 0) || (d2 < 0) || (d3 < 0)) && ((d1 > 0) || (d2 > 0) || (d3 > 0))); };
    for (const [k, list] of byKey) {
      list.sort((a, c) => a.lo - c.lo);
      let s = 0;
      while (s < list.length) {
        let e = s + 1, high=list[s].hi;
        while (e < list.length && list[e].lo-high < tol) {high=Math.max(high,list[e].hi);e++;}
        const cl = list.slice(s, e); s = e;
        if (new Set(cl.map(f => f.tag)).size < 2) continue;
        // rasterize each triangle onto a jittered grid, per tag; count cells covered by 2+ tags
        let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
        for (const f of cl) for (const [x, y] of f.tri) { mnx = Math.min(mnx, x); mxx = Math.max(mxx, x); mny = Math.min(mny, y); mxy = Math.max(mxy, y); }
        const cell = Math.max((mxx - mnx) / 700, (mxy - mny) / 700, tol * 4, 1e-6);
        const cells = new Map();
        for (const f of cl) {
          let a0 = Infinity, a1 = -Infinity, b0 = Infinity, b1 = -Infinity; for (const [x, y] of f.tri) { a0 = Math.min(a0, x); a1 = Math.max(a1, x); b0 = Math.min(b0, y); b1 = Math.max(b1, y); }
          for (let i = Math.floor((a0 - mnx) / cell); i <= Math.floor((a1 - mnx) / cell); i++) for (let j = Math.floor((b0 - mny) / cell); j <= Math.floor((b1 - mny) / cell); j++) {
            const px = mnx + (i + 0.3719) * cell, py = mny + (j + 0.6143) * cell;
            if (!inTri(px, py, f.tri)) continue;
            const key = i * 100003 + j; let set = cells.get(key); if (!set) cells.set(key, set = new Map()); set.set(f.tag, f);
          }
        }
        const pairs = new Map();
        for (const [key, set] of cells) if (set.size > 1) {
          const all = [...set.values()];
          const i=Math.floor(key/100003),j=key-i*100003;
          const px=mnx+(i+.3719)*cell,py=mny+(j+.6143)*cell;
          const depth=f=>(f.plane-f.nu*px-f.nv*py)/f.na;
          const fs = all.filter(f => all.some(o => {
            if(o.tag===f.tag||f.normal.reduce((sum,n,k)=>sum+n*o.normal[k],0)<=.9999)return false;
            const separation=Math.abs(depth(o)-depth(f));
            // Convert the same-point axis gap to perpendicular plane distances.
            return separation*Math.max(Math.abs(f.na),Math.abs(o.na))<tol;
          }));
          if (fs.length < 2) continue;
          const label = [...new Set(fs.map(f => f.col))].sort().join(' + ');
          const pr = pairs.get(label) || { n: 0, at: null, c: fs[0].c, names: new Set() }; fs.forEach(f => pr.names.add(f.name)); pr.n++; if (!pr.at) { const i = Math.floor(key / 100003), j = key - i * 100003; pr.at = [mnx + i * cell, mny + j * cell]; } pairs.set(label, pr);
        }
        for (const [label, pr] of pairs) {
          const area = pr.n * cell * cell;
          if (area < (d * 0.004) ** 2) continue;
          hits.push({ axis: 'xyz'[Math.floor(k / 2)] + (k % 2 ? '+' : '-'), plane: +pr.c.toFixed(4), area: +area.toPrecision(3), at: pr.at.map(v => +v.toFixed(3)), mats: label, names: [...pr.names] });
        }
      }
    }
    hits.sort((a, c) => c.area - a.area);
    return { d: +d.toFixed(2), tol: +tol.toExponential(1), faces: faces.length, hits: hits.slice(0, 25) };
  };
