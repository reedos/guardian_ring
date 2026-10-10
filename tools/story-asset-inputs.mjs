import fs from 'node:fs';
import {createHash} from 'node:crypto';
// Git may check text out with CRLF on Windows. Hash equivalent source text alike;
// binary GLBs and delivery images still use their exact bytes.
export const hash=file=>createHash('sha256').update(/\.(js|mjs|py)$/.test(file)?fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'):fs.readFileSync(file)).digest('hex');
// Everything that determines a story still besides the GLBs: the in-browser
// camera, lighting and cinematic renderer code (ring, plume), and the Blender
// lighting, camera fit and render recipe (satellite, payload, focal plane, pixel).
export const RENDER_INPUTS=[
  'src/app/scene-look.js','src/app/stage.js','src/app/camera-path.js','src/app/camera-clearance.js','src/explainer-kit/src/render-quality.js','src/app/view-controls.js',
  'src/app/cinematic-renderers.js','src/app/cinematic-drawing.js','src/app/cinematic-earth.js','src/app/cinematic-demo.js','src/visualizer.js',
  'tools/render-story-stills.mjs','tools/blender/render-authored.py','tools/blender/build-hardware-look.py',
];
// Conservative dependencies include shared scene helpers and every GLB/version reference.
export function assetInputs(){
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
  return Object.fromEntries([...walk('src/scenes').filter(f=>/\.(js|mjs)$/.test(f)),...walk('public/models').filter(f=>/\.glb$/.test(f)),...RENDER_INPUTS].sort().map(f=>[f,hash(f)]));
}
