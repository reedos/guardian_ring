// Gates run sequentially so performance measurements do not compete for the GPU.
import { spawnSync } from 'node:child_process';
const gates=[['project-audit','desktop'],['project-audit','phone'],['mission','desktop'],['mission','phone'],['activity','desktop'],['activity','phone'],['navigation','desktop'],['navigation','phone'],['learning','desktop'],['learning','phone'],['cycle'],['parts'],['views','desktop'],['views','phone'],['labels','desktop'],['labels','phone'],['ui','desktop'],['ui','phone'],['coplanar'],['flights','desktop'],['flights','phone'],['govern','desktop'],['govern','phone'],['links'],['perf','desktop'],['perf','phone'],['look'],['pages']];
gates.unshift(['audit-layout','desktop'],['audit-layout','phone']);
gates.unshift(['controls-audit','desktop'],['controls-audit','phone']);
gates.unshift(['story-audit','desktop'],['story-audit','phone']);
// Surface interaction regressions before the exhaustive scenario matrices.
// All gates retain their full scope; performance remains at the end.
const slow=new Set(['cycle','parts','flights','perf']);
gates.sort((a,b)=>Number(slow.has(a[0]))-Number(slow.has(b[0])));
let failures=0;for(const [name,...args]of gates){const result=spawnSync(process.execPath,[`tools/${name}.mjs`,...args],{stdio:'inherit'});if(result.status!==0)failures++;}
console.log(`${gates.length-failures}/${gates.length} gate runs passed.`);process.exitCode=failures?1:0;
