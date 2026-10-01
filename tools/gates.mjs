// Gates run sequentially so performance measurements do not compete for the GPU.
import { spawnSync } from 'node:child_process';
const gates=[['cycle'],['parts'],['views','desktop'],['views','phone'],['ui','desktop'],['ui','phone'],['coplanar'],['flights','desktop'],['flights','phone'],['govern','desktop'],['govern','phone'],['links'],['perf','desktop'],['perf','phone']];
let failures=0;for(const [name,...args]of gates){const result=spawnSync(process.execPath,[`tools/${name}.mjs`,...args],{stdio:'inherit'});if(result.status!==0)failures++;}
console.log(`${gates.length-failures}/${gates.length} gate runs passed.`);process.exitCode=failures?1:0;
