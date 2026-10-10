import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {RENDER_INPUTS} from './story-asset-inputs.mjs';
const gate=path.resolve('tools/story-freshness.mjs');
const STILLS=['ring','satellite','payload','focal-plane','pixel','plume'].flatMap(n=>['','-phone'].map(s=>`public/look/${n}${s}.webp`));
// A real, decodable image: a bright rectangle filling `fill` of a 100x100 frame on black.
const picture=(file,level,fill)=>{
  const run=spawnSync('python',['-c','from PIL import Image,ImageDraw; import sys; im=Image.new("RGB",(100,100)); w=int(100*float(sys.argv[3])**.5); ImageDraw.Draw(im).rectangle([0,0,w-1,w-1],fill=(int(sys.argv[2]),)*3); im.save(sys.argv[1],"WEBP",lossless=True)',file,String(level),String(fill)],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
};
test('freshness gate rejects changed GLBs, version keys, render code, delivered images and dim stills',()=>{
  fs.mkdirSync('.local',{recursive:true});
  const root=fs.mkdtempSync(path.resolve('.local/freshness-fixture-'));
  const write=(file,text)=>{const dest=path.join(root,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);};
  const hash=data=>createHash('sha256').update(data).digest('hex');
  try{
    const inputs={'src/scenes/satellite.js':"url:'models/satellite.glb?v=7'\n",'public/models/satellite.glb':'synthetic model bytes',...Object.fromEntries(RENDER_INPUTS.map(f=>[f,`synthetic ${f}`]))};
    Object.entries(inputs).forEach(([file,text])=>write(file,text));
    for(const file of STILLS){fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});picture(path.join(root,file),200,.5);}
    const outputs=Object.fromEntries(STILLS.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))]));
    // Match the gate's lexical path ordering, independent of OS directory order.
    write('research/story-still-inputs.json',JSON.stringify({inputs:Object.fromEntries(Object.keys(inputs).sort().map(f=>[f,hash(inputs[f])])),outputs}));
    const measured=JSON.parse(spawnSync('python',[path.resolve('tools/story-still-metrics.py'),...STILLS.map(f=>path.join(root,f))],{encoding:'utf8'}).stdout);
    write('research/story-still-reference.json',JSON.stringify({minRatio:.8,stills:Object.fromEntries(STILLS.map(f=>[f,measured[path.join(root,f)]]))}));
    const run=()=>spawnSync(process.execPath,[gate],{cwd:root,encoding:'utf8'});
    assert.equal(run().status,0,'unchanged complete fixture must pass');
    write('src/scenes/satellite.js',inputs['src/scenes/satellite.js'].replace(/\n/g,'\r\n'));
    assert.equal(run().status,0,'Windows checkout line endings must not invalidate identical source');
    write('src/scenes/satellite.js',inputs['src/scenes/satellite.js']);
    // Every file that decides the picture (camera, lighting, renderer, Blender recipe) must mark stills stale.
    for(const file of ['public/models/satellite.glb','src/scenes/satellite.js',...RENDER_INPUTS]){
      write(file,inputs[file]+' changed');
      assert.notEqual(run().status,0,`${file} change must invalidate stale images`);
      write(file,inputs[file]);assert.equal(run().status,0,'restored fixture must pass');
    }
    const still=path.join(root,'public/look/satellite.webp'),good=fs.readFileSync(still);
    fs.writeFileSync(still,good.subarray(0,good.length-1).toString('binary')+'x','binary');
    assert.notEqual(run().status,0,'changed delivered still must fail');
    // A dim, small still passes the hash record yet must fail the quality gate.
    picture(still,30,.08);
    const manifest=JSON.parse(fs.readFileSync(path.join(root,'research/story-still-inputs.json')));
    manifest.outputs['public/look/satellite.webp']=hash(fs.readFileSync(still));
    write('research/story-still-inputs.json',JSON.stringify(manifest));
    const dim=run();
    assert.notEqual(dim.status,0,'a dim still that fills a fraction of the frame must fail');
    assert.match(dim.stderr,/public\/look\/satellite\.webp/,'the dim still is named');
    manifest.outputs['public/look/satellite.webp']=outputs['public/look/satellite.webp'];
    write('research/story-still-inputs.json',JSON.stringify(manifest));
    fs.writeFileSync(still,good);
    assert.equal(run().status,0,'restored fixture must pass');
    fs.unlinkSync(path.join(root,'public/look/pixel-phone.webp'));
    assert.notEqual(run().status,0,'missing delivered still must fail');
  }finally{
    assert.ok(root.startsWith(path.resolve('.local')+path.sep),'fixture cleanup stays inside the workspace scratch directory');
    fs.rmSync(root,{recursive:true,force:true});
  }
});
