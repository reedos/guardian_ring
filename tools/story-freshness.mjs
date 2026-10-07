import fs from 'node:fs';
import {assetInputs,hash} from './story-asset-inputs.mjs';
const manifest=JSON.parse(fs.readFileSync('research/story-still-inputs.json','utf8'));
if(JSON.stringify(manifest.inputs)!==JSON.stringify(assetInputs()))throw Error('Story still inputs changed: rebuild and run tools/render-story-stills.mjs');
const expected=['ring','satellite','payload','focal-plane','pixel','plume'].flatMap(n=>[`public/look/${n}.webp`,`public/look/${n}-phone.webp`]);
for(const file of expected)if(!manifest.outputs[file]||manifest.outputs[file]!==hash(file))throw Error(`Missing or changed rendered output: ${file}`);
console.log(`PASS: ${expected.length} story stills match recorded render inputs and outputs.`);
