// Final acceptance requires full-scope runs against the current production build.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { SCENES } from '../src/data.js';

export const FULL_SCOPE = 'all implemented and reserved levels';
export const PREVIEW = 'http://127.0.0.1:47601/';
export const FLIGHT_COVERAGE = 'overview-to-each plus every ordered distinct part pair within each level/layer';
export const GEOMETRY_RUNS = ['cycle-desktop','parts-desktop','views-desktop','views-phone','ui-desktop','ui-phone','coplanar-desktop','flights-desktop','flights-phone','govern-desktop','govern-phone','links-desktop','perf-desktop','perf-phone','labels-desktop','labels-phone'];

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
  md += `\n${GEOMETRY_RUNS.length + pageRuns.length}/${GEOMETRY_RUNS.length + pageRuns.length} browser gate commands passed: 16 geometry/UI/label runs plus story and reference-page checks on both forms. Typecheck passed. ${tests.numPassedTests}/${tests.numTotalTests} unit tests passed${tests.numPendingTests ? `; ${tests.numPendingTests} pending` : ''}. Strict evidence audit: ${counts[1]} problems across ${counts[2]} site claims (${counts[3]} scenario instances), ${counts[4]} scenarios, and ${counts[5]} research facts.\n\nCycle and parts cover every scenario × level × layer. UI includes open menus, visible keyboard focus, scenarios and sheet states. Quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance is held at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Printed-label checks reject partially obscured lettering and require a clear authored desktop view for every nameplate. Flights cover the overview to each part and every ordered distinct part pair within each level/layer on both forms. Story and reference pages check their evidence dialogs, links, phone layout and noindex metadata.\n\nThese are local acceptance results. They do not assert remote CI status or replace Reed’s phone review or launch decision. Noindex remains on. Detailed JSON and screenshots are local under \`.local/gates/\`, \`.local/look/\`, \`.local/pages/\` and \`shots/\`.\n`;
  fs.writeFileSync('research/gate-results.md', md);
  console.log(`18/18 current full-scope browser gate commands passed; ${tests.numPassedTests} unit tests; ${counts[2]} claims. Build ${digest}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
