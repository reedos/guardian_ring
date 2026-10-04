// Final acceptance requires full-scope runs against the current production build.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { SCENES } from '../src/data.js';

export const FULL_SCOPE = 'all implemented and reserved levels';
export const PREVIEW = 'http://127.0.0.1:47601/';
export const FLIGHT_COVERAGE = 'overview-to-each plus every ordered distinct part pair within each level/layer; active LEO follow';
export const ACTIVITY_COVERAGE = 'all hardware scenes and layers: running, explicit pause, reduced motion; natural rendered repeat boundaries; evidence and lifecycle holds; orbit follow and shared follow';
export const GEOMETRY_RUNS = ['cycle-desktop','parts-desktop','views-desktop','views-phone','ui-desktop','ui-phone','coplanar-desktop','flights-desktop','flights-phone','govern-desktop','govern-phone','links-desktop','perf-desktop','perf-phone','labels-desktop','labels-phone','learning-desktop','learning-phone','navigation-desktop','navigation-phone','mission-desktop','mission-phone','activity-desktop','activity-phone','project-audit-desktop','project-audit-phone'];

GEOMETRY_RUNS.push('audit-layout-desktop','audit-layout-phone');
GEOMETRY_RUNS.push('controls-audit-desktop','controls-audit-phone');
GEOMETRY_RUNS.push('story-audit-desktop','story-audit-phone');

export function validateGeometryReport(report, { name, builtAt, sceneIds, base = PREVIEW }) {
  const reject = why => { throw new Error(`${name}: ${why}`); };
  if (report.status !== 'PASS' || !Array.isArray(report.failures) || report.failures.length) reject('failed or missing failure record');
  if (report.url !== base) reject('not the built preview');
  if (!Number.isFinite(Date.parse(report.date)) || Date.parse(report.date) < builtAt) reject('stale or undated result');
  if (report.scope !== FULL_SCOPE) reject(`scoped result (${report.scope ?? 'missing'}); rerun without GR_LEVELS`);
  if (!Array.isArray(report.scenes) || report.scenes.length !== sceneIds.length || sceneIds.some(id => report.scenes.filter(s => s.id === id).length !== 1)) reject('incomplete scene inventory');
  if (report.scenes.some(s => !s.ready)) reject('reserved scenes remain; final acceptance requires all levels');
  if (!report.gpu || /swiftshader|software|basic render|unknown|unavailable/i.test(report.gpu)) reject('real GPU was not recorded');
  if (!Number.isInteger(report.states) || report.states < 1) reject('no checked states');
  if (name.startsWith('flights-') && report.flightCoverage !== FLIGHT_COVERAGE) reject('missing all-pairs flight coverage');
  if (name.startsWith('activity-')) {
    if(report.activityCoverage!==ACTIVITY_COVERAGE)reject('missing immediate activity coverage');
    const phone=report.form==='phone', expectedEnvironment={innerWidth:phone?390:1440,innerHeight:phone?844:900,devicePixelRatio:phone?3:1,coarse:phone,maxTouchPoints:phone?1:0};
    const matchesEnvironment=value=>value&&Object.entries(expectedEnvironment).every(([key,expected])=>value[key]===expected);
    if(!matchesEnvironment(report.environment))reject('incorrect activity device emulation');
    const phases=['startup',...['payload','follow','reduced'].map(view=>`capture:.local/activity-${report.form}-${view}.png`),'finish'];
    if(report.environmentChecks?.length!==phases.length||phases.some(phase=>report.environmentChecks.filter(value=>value.phase===phase&&matchesEnvironment(value)).length!==1))reject('device emulation changed during capture or navigation');
    const expected=sceneIds.filter(id=>id!=='orbits').flatMap(id=>['light','data','heat'].map(mode=>`${id}/${mode}`));
    for(const intent of ['running','paused','reduced']){
      const cases=report.activityCases?.[intent];
      if(!Array.isArray(cases)||cases.length!==expected.length||expected.some(key=>cases.filter(item=>item===key).length!==1))reject(`incomplete ${intent} scene/layer activity coverage`);
    }
    const cycles=['light','data','heat'].map(mode=>`atmosphere/${mode}`);
    if(!Array.isArray(report.repeatCases)||report.repeatCases.length!==cycles.length||cycles.some(key=>report.repeatCases.filter(item=>item===key).length!==1))reject('missing natural repeat-boundary coverage');
    for(const freezeMs of [250,1250]){
      const cases=report.lifecycleCases?.filter(item=>item.freezeMs===freezeMs);
      if(cases?.length!==1)reject(`missing ${freezeMs}ms real lifecycle suspension`);
      const result=cases[0];
      if(result.frozen?.event!=='freeze'||result.resumed?.event!=='resume'||result.resumed.at<result.frozen.at)reject('missing ordered browser lifecycle events');
      for(const elapsed of [result.suspendedElapsed,result.totalElapsed])if(!Number.isFinite(elapsed)||elapsed<0||elapsed>=.35)reject('lifecycle motion advanced while suspended');
      if(result.thawed?.hidden!==false||result.thawed?.suspended!==false||result.thawed?.playing!==true)reject('lifecycle return did not restore visible activity');
    }
  }
  return report;
}

export function validatePageReports(reports, { name, modifiedAt, builtAt, base = PREVIEW }) {
  const reject = why => { throw new Error(`${name}: ${why}`); };
  if (!Number.isFinite(modifiedAt) || modifiedAt < builtAt) reject('stale or undated result');
  const pages = name === 'look' ? ['story'] : ['evidence', 'method', 'glossary', 'parts'];
  const expected = pages.flatMap(page => ['desktop', 'phone'].map(form => ({ page, form })));
  if (!Array.isArray(reports) || reports.length !== expected.length) reject('incomplete page/form inventory');
  for (const { page, form } of expected) {
    const rows = reports.filter(r => (r.page || 'story') === page && r.form === form);
    if (rows.length !== 1) reject(`missing or duplicate ${page}/${form}`);
    const r = rows[0];
    if (r.status !== 'PASS' || !Array.isArray(r.failures) || r.failures.length) reject(`${page}/${form} failed`);
    const url = new URL(r.url), wanted = new URL(page === 'story' ? './' : `${page}.html`, base);
    if (url.origin !== wanted.origin || url.pathname !== wanted.pathname) reject(`${page}/${form} not the built preview`);
  }
  return reports;
}

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
function cpuCheck(label, args) {
  const run = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (run.error || run.status !== 0) throw new Error(`${label} failed: ${run.error?.message || run.stderr || run.stdout}`);
  return run.stdout;
}

export function main() {
  if (process.env.GR_LEVELS) throw new Error('Final acceptance cannot run with GR_LEVELS; use the archived per-level reports during development.');
  const files = walk('dist').sort(), builtAt = Math.max(...files.map(f => fs.statSync(f).mtimeMs)), hash = createHash('sha256');
  if (!files.length) throw new Error('No production build found.');
  for (const file of files) { hash.update(file.replaceAll('\\', '/')); hash.update(fs.readFileSync(file)); }
  const sceneIds = SCENES.map(s => s.id);
  const rows = GEOMETRY_RUNS.map(name => validateGeometryReport(read(`.local/gates/${name}.json`), { name, builtAt, sceneIds }));
  const pageRuns = ['look', 'pages'].map(name => {
    const file = `.local/${name}/results.json`;
    return { name, rows: validatePageReports(read(file), { name, builtAt, modifiedAt: fs.statSync(file).mtimeMs }) };
  });

  // These are current checks, not remembered counts from an earlier phase.
  cpuCheck('Typecheck', ['node_modules/typescript/bin/tsc', '--noEmit']);
  cpuCheck('Unit tests', ['node_modules/vitest/vitest.mjs', 'run', '--reporter=json', '--outputFile=.local/gates/unit-tests.json']);
  const tests = read('.local/gates/unit-tests.json');
  if (tests.success !== true || tests.numFailedTests || !tests.numTotalTests) throw new Error('Unit-test report is incomplete or failed.');
  const claimsText = cpuCheck('Strict evidence audit', ['node_modules/tsx/dist/cli.mjs', 'tools/claims.mjs']).trim();
  const counts = claimsText.match(/(\d+) problems across (\d+) site claims \((\d+) scenario instances\), (\d+) scenarios, and (\d+) research facts\./);
  if (!counts || Number(counts[1]) !== 0) throw new Error(`Unrecognized or failed claim audit: ${claimsText}`);

  const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  const digest = hash.digest('hex'), gpus = [...new Set(rows.map(r => r.gpu))];
  let md = `# Final built-preview acceptance\n\nRecorded ${date}. Built preview: \`${PREVIEW}\`. All browser results below postdate this production build and include all ${sceneIds.length} implemented levels. Scoped development runs and reserved scenes are rejected.\n\nBuild SHA-256 (sorted relative paths and bytes): \`${digest}\`.\n\nRecorded renderer: ${gpus.join('; ')}. Software rendering rejected.\n\n| Gate | Form | Checked states | Result |\n|---|---|---:|---|\n`;
  for (const r of rows) md += `| ${r.gate} | ${r.form} | ${r.states} | ${r.status}${r.worstP95 ? `; worst p95 ${r.worstP95.toFixed(2)} ms` : ''} |\n`;
  for (const run of pageRuns) for (const r of run.rows) md += `| ${run.name}: ${r.page || 'story'} | ${r.form} | ${r.chips ?? '—'} evidence dialogs | ${r.status} |\n`;
  md += `\n${GEOMETRY_RUNS.length + pageRuns.length}/${GEOMETRY_RUNS.length + pageRuns.length} browser gate commands passed: ${GEOMETRY_RUNS.length} geometry/UI/label/learning runs plus story and reference-page checks on both forms. Typecheck passed. ${tests.numPassedTests}/${tests.numTotalTests} unit tests passed${tests.numPendingTests ? `; ${tests.numPendingTests} pending` : ''}. Strict evidence audit: ${counts[1]} problems across ${counts[2]} site claims (${counts[3]} scenario instances), ${counts[4]} scenarios, and ${counts[5]} research facts.\n\nCycle and parts cover every scenario × level × layer. UI includes open menus, visible keyboard focus, scenarios and sheet states. Learning checks cover sequence controls, source-reading suspension, reduced-motion stepping, context-preserving scenario changes and nested side visits. Quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance samples selected-part inspection, overview and each teaching-animation phase at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Samples that cross into another phase are discarded before the intended phase resumes. Printed-label checks reject partially obscured lettering and require a clear authored desktop view for every nameplate. Flights cover the overview to each part and every ordered distinct part pair within each level/layer on both forms. Story and reference pages check their evidence dialogs, links, phone layout and noindex metadata.\n\nThese are local acceptance results. They do not assert remote CI status or replace Reed’s phone review or launch decision. Noindex remains on. Detailed JSON and screenshots are local under \`.local/gates/\`, \`.local/look/\`, \`.local/pages/\` and \`shots/\`.\n`;
  md += '\nNavigation checks press Next through every part, inspect each manual animation step, and verify overview selection, completed camera movement, mechanism-step routes, useful projected component size, Back restoration, and preservation of deliberate camera adjustments.\n';
  md += '\nMission checks cover the guided chapters, orbital follow views, source-reading suspension, pause, reduced-motion entry, manual interruption, and canceled pending navigation. Project-audit checks cover keyboard tab and menu focus, presentation exit, current scenarios in repeated new-tab links, hidden orbit-family selections, and filtered or malformed reference-page fragments, including embedded reference pages. Both run on desktop and phone.\n';
  md += '\nActivity checks exercise real layer buttons across every hardware scene and layer with ordinary playback, an explicit pause, and reduced motion. They require meaningful visible poses, rendered geometry changes while playing, stationary geometry while paused, and stable compatible-part selection and cameras. Each layer crosses a natural rendered cycle boundary in the atmosphere example; all scene/layer states independently assert repeat intent. Source reading and Chrome lifecycle freeze/resume hold the lesson without catch-up, orbital follow retains pause/play intent, and the real Share handler preserves the followed spacecraft. Desktop and phone use the same checks.\n';
  md += '\nPerformance setup follows the Intelligence Factory benchmark: a 300 ms rendered settling period, no active CSS transitions, then 24 warm-up frames. Each measured condition retains all valid frame intervals; complete teaching phases include at least 240 samples.\n';
  fs.writeFileSync('research/gate-results.md', md);
  const runCount = GEOMETRY_RUNS.length + pageRuns.length;
  console.log(`${runCount}/${runCount} current full-scope browser gate commands passed; ${tests.numPassedTests} unit tests; ${counts[2]} claims. Build ${digest}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
