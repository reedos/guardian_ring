import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {assetInputs,hash} from './story-asset-inputs.mjs';
const manifest=JSON.parse(fs.readFileSync('research/story-still-inputs.json','utf8'));
if(JSON.stringify(manifest.inputs)!==JSON.stringify(assetInputs()))throw Error('Story still inputs changed: rebuild and run tools/render-story-stills.mjs');
const expected=['ring','satellite','payload','focal-plane','pixel','plume'].flatMap(n=>[`public/look/${n}.webp`,`public/look/${n}-phone.webp`]);
for(const file of expected)if(!manifest.outputs[file]||manifest.outputs[file]!==hash(file))throw Error(`Missing or changed rendered output: ${file}`);
// Fresh is not the same as good: a still rendered from the current scene can be a dim,
// small subject in a black void. Each still must stay lit and fill the frame, measured
// against the stills committed on main (research/story-still-reference.json).
const reference=JSON.parse(fs.readFileSync('research/story-still-reference.json','utf8'));
const run=spawnSync('python',[fileURLToPath(new URL('./story-still-metrics.py',import.meta.url)),...expected],{encoding:'utf8'});
if(run.status!==0)throw Error(`Could not measure story stills: ${run.stderr}`);
const measured=JSON.parse(run.stdout),weak=[];
for(const file of expected){
  const want=reference.stills[file],got=measured[file];
  if(!want)throw Error(`No reference measurement for ${file}`);
  const meanRatio=got.mean/want.mean,litRatio=got.lit/want.lit;
  if(meanRatio<reference.minRatio||litRatio<reference.minRatio)weak.push(`${file}: mean luma ${got.mean} (${Math.round(meanRatio*100)}% of ${want.mean}), lit fraction ${got.lit} (${Math.round(litRatio*100)}% of ${want.lit})`);
}
if(weak.length)throw Error(`Story stills are too dim or too small (need ${Math.round(reference.minRatio*100)}% of main's brightness and lit area):\n  ${weak.join('\n  ')}`);
console.log(`PASS: ${expected.length} story stills match recorded render inputs and outputs, and each is lit and fills the frame.`);
