import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const gate=path.resolve('tools/story-freshness.mjs');
test('freshness gate rejects changed GLBs, version keys and delivered images',()=>{
  fs.mkdirSync('.local',{recursive:true});
  const root=fs.mkdtempSync(path.resolve('.local/freshness-fixture-'));
  const write=(file,text)=>{const dest=path.join(root,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);};
  const hash=text=>createHash('sha256').update(text).digest('hex');
  try{
    const inputs={'src/scenes/satellite.js':"url:'models/satellite.glb?v=7'\n",'public/models/satellite.glb':'synthetic model bytes','src/app/scene-look.js':'synthetic lighting','tools/render-story-stills.mjs':'synthetic render recipe'};
    const outputs=Object.fromEntries(['ring','satellite','payload','focal-plane','pixel','plume'].flatMap(n=>['','-phone'].map(s=>[`public/look/${n}${s}.webp`,'synthetic image bytes'])));
    Object.entries({...inputs,...outputs}).forEach(([file,text])=>write(file,text));
    write('research/story-still-inputs.json',JSON.stringify({inputs:Object.fromEntries(Object.entries(inputs).sort(([a],[b])=>a.localeCompare(b)).map(([f,t])=>[f,hash(t)])),outputs:Object.fromEntries(Object.entries(outputs).map(([f,t])=>[f,hash(t)]))}));
    // Match the gate's lexical path ordering, independent of OS directory order.
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'research/story-still-inputs.json')));
    manifest.inputs=Object.fromEntries(Object.keys(inputs).sort().map(f=>[f,hash(inputs[f])]));
    write('research/story-still-inputs.json',JSON.stringify(manifest));
    const run=()=>spawnSync(process.execPath,[gate],{cwd:root,encoding:'utf8'});
    assert.equal(run().status,0,'unchanged complete fixture must pass');
    write('src/scenes/satellite.js',inputs['src/scenes/satellite.js'].replace(/\n/g,'\r\n'));
    assert.equal(run().status,0,'Windows checkout line endings must not invalidate identical source');
    write('src/scenes/satellite.js',inputs['src/scenes/satellite.js']);
    for(const file of ['public/models/satellite.glb','src/scenes/satellite.js','public/look/satellite.webp']){
      const original=inputs[file]??outputs[file];write(file,original+' changed');
      assert.notEqual(run().status,0,`${file} change must invalidate stale images`);
      write(file,original);assert.equal(run().status,0,'restored fixture must pass');
    }
    fs.unlinkSync(path.join(root,'public/look/pixel-phone.webp'));
    assert.notEqual(run().status,0,'missing delivered still must fail');
  }finally{
    assert.ok(root.startsWith(path.resolve('.local')+path.sep),'fixture cleanup stays inside the workspace scratch directory');
    fs.rmSync(root,{recursive:true,force:true});
  }
});
