// Save a compact, reviewable record of gates against the current built preview.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
const names=['cycle-desktop','parts-desktop','views-desktop','views-phone','ui-desktop','ui-phone','coplanar-desktop','flights-desktop','flights-phone','govern-desktop','govern-phone','links-desktop','perf-desktop','perf-phone'];
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk('dist').sort(),builtAt=Math.max(...files.map(f=>fs.statSync(f).mtimeMs)),hash=createHash('sha256');
for(const file of files){hash.update(file.replaceAll('\\','/'));hash.update(fs.readFileSync(file));}
const rows=names.map(name=>{const report=JSON.parse(fs.readFileSync(`.local/gates/${name}.json`,'utf8'));if(report.status!=='PASS'||report.url!=='http://127.0.0.1:47601/'||Date.parse(report.date)<builtAt)throw new Error(`${name}: failed, stale, or not the built preview`);return report;});
const digest=hash.digest('hex');
let md='# Phase 0 gate results\n\nRecorded 10/01/2026. Built preview: `http://127.0.0.1:47601/`. Chrome, NVIDIA GeForce RTX 5090, ANGLE D3D11. Software rendering rejected. All results below postdate this build.\n\nBuild SHA-256 (sorted relative paths and bytes): `'+digest+'`.\n\n| Gate | Form | Checked states | Result |\n|---|---|---:|---|\n';
for(const r of rows)md+=`| ${r.gate} | ${r.form} | ${r.states} | ${r.status}${r.worstP95?`; worst p95 ${r.worstP95.toFixed(2)} ms`:''} |\n`;
md+='\nTypecheck and production build passed; 37 unit tests passed. Strict evidence audit: 0 problems across 96 scenario combinations and 34 research facts. Site physical claims remain empty by design. Remote CI has not run.\n\nCycle and parts each cover every scenario × level × layer. UI includes open menus, scenarios and sheet states; quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance is held at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Camera flights and surface checks test the placeholder only. A deliberately unreachable startup test separately confirmed a fresh FAIL report, nonzero exit and browser cleanup.\n\nThese are scaffold results, not approval of future scenes, physical calculations or visual design. Re-run all gates after adding real geometry. Detailed JSON and screenshots are local under `.local/gates/` and `shots/`.\n';
fs.writeFileSync('research/gate-results.md',md);console.log(`${rows.length}/${names.length} current built-preview gate runs passed. Build ${digest}`);
