import fs from 'node:fs';
import {createHash} from 'node:crypto';
// Git may check text out with CRLF on Windows. Hash equivalent source text alike;
// binary GLBs and delivery images still use their exact bytes.
export const hash=file=>createHash('sha256').update(/\.(js|mjs)$/.test(file)?fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'):fs.readFileSync(file)).digest('hex');
// Conservative dependencies include shared scene helpers and every GLB/version reference.
export function assetInputs(){
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);
  return Object.fromEntries([...walk('src/scenes'),...walk('public/models'),'src/app/scene-look.js','tools/render-story-stills.mjs'].filter(f=>/\.(js|mjs|glb)$/.test(f)).sort().map(f=>[f,hash(f)]));
}
