// Transfer weight of every public page and model, as the visitor's browser receives it.
// The host compresses text and models (Cloudflare serves brotli for pages and scripts, gzip for the GLBs); vite preview
// does not, so this tool compresses each response body itself (brotli q11 and gzip 9) and reports both beside raw bytes.
// It fails when a page or model grows past its budget, when the story page fetches the opt-in Earth loop, or when a page
// requests any host other than the two Google Fonts hosts (documented in THIRD_PARTY_NOTICES.md).
//   node tools/page-weight.mjs        (GR_URL selects the preview; default http://127.0.0.1:47601/)
// Writes research/page-weight.md and .local/gates/page-weight.json.
import { chromium } from 'playwright';
import fs from 'node:fs';
import zlib from 'node:zlib';
import { BASE } from './gate-common.mjs';

const kb = n => `${(n / 1024).toFixed(0)} kB`, mb = n => `${(n / 1048576).toFixed(2)} MB`;
const brotli = b => zlib.brotliCompressSync(b, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: b.length } }).length;
const gzip = b => zlib.gzipSync(b, { level: 9 }).length;
const ALLOWED_THIRD_PARTY = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
// Budgets are brotli bytes for the whole page load (HTML, CSS, scripts, images, and any model fetched), set a little above what each page weighs now.
const PAGES = [
  { file: '', name: 'Story', budget: 250 * 1024 },
  { file: 'visualizer.html', name: 'Explorer, first level', budget: 850 * 1024 },
  { file: 'evidence.html', name: 'Evidence', budget: 420 * 1024 },
  { file: 'parts.html', name: 'Parts', budget: 320 * 1024 },
  { file: 'method.html', name: 'Method', budget: 130 * 1024 },
  { file: 'glossary.html', name: 'Glossary', budget: 180 * 1024 },
];
const MODEL_GZIP_BUDGET = 600 * 1024;     // any single GLB, gzip
const MODELS_GZIP_TOTAL_BUDGET = 2.6 * 1048576; // all ten GLBs, gzip

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
const fail = [], rows = [];
try {
  for (const { file, name, budget } of PAGES) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.addInitScript(() => localStorage.setItem('grx-mission-visited-v1', '1'));
    const seen = new Map(), pending = [];
    page.on('response', response => pending.push(response.body().then(body => seen.set(response.url(), body)).catch(() => {})));
    await page.goto(new URL(file, BASE).href, { waitUntil: 'load' });
    if (file === 'visualizer.html') await page.waitForFunction(() => window.grx?.built[window.grx.state.scene], null, { timeout: 90000 });
    await page.waitForTimeout(1200);
    await Promise.all(pending);
    let raw = 0, br = 0, gz = 0;
    const hosts = new Set(), models = [];
    for (const [url, body] of seen) {
      const u = new URL(url);
      if (u.origin !== new URL(BASE).origin) hosts.add(u.host);
      if (u.protocol === 'data:' || u.origin !== new URL(BASE).origin) continue;
      raw += body.length; br += brotli(body); gz += gzip(body);
      if (/\.glb$/.test(u.pathname)) models.push(u.pathname.split('/').pop());
      if (/\.mp4$/.test(u.pathname)) fail.push(`${name}: fetched ${u.pathname} on load; the Earth loop must stay opt-in`);
    }
    for (const host of hosts) if (!ALLOWED_THIRD_PARTY.has(host)) fail.push(`${name}: unexpected third-party host ${host}`);
    if (br > budget) fail.push(`${name}: ${kb(br)} brotli exceeds the ${kb(budget)} budget`);
    rows.push({ name, requests: seen.size, raw, gzip: gz, brotli: br, models, thirdParty: [...hosts] });
    await page.close();
  }
} finally { await browser.close(); }

// Every model on its own, as served.
const models = fs.readdirSync('dist/models').filter(f => f.endsWith('.glb')).sort().map(f => {
  const body = fs.readFileSync(`dist/models/${f}`);
  return { file: f, raw: body.length, gzip: gzip(body), brotli: brotli(body) };
});
for (const m of models) if (m.gzip > MODEL_GZIP_BUDGET) fail.push(`${m.file}: ${kb(m.gzip)} gzip exceeds the ${kb(MODEL_GZIP_BUDGET)} per-model budget`);
const total = models.reduce((a, m) => ({ raw: a.raw + m.raw, gzip: a.gzip + m.gzip, brotli: a.brotli + m.brotli }), { raw: 0, gzip: 0, brotli: 0 });
if (total.gzip > MODELS_GZIP_TOTAL_BUDGET) fail.push(`models: ${mb(total.gzip)} gzip exceeds the ${mb(MODELS_GZIP_TOTAL_BUDGET)} budget`);

const date = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
let md = `# Page and model weight\n\nProduced by \`node tools/page-weight.mjs\` on ${date} against the production build (\`npm run build\`, served by vite preview). Each response body is compressed here with brotli (quality 11) and gzip (level 9), because vite preview sends it uncompressed. The live host, Cloudflare, was checked on ${date}: pages and scripts come back \`Content-Encoding: br\`, and the GLBs come back \`gzip\` (\`curl -sI -H "Accept-Encoding: br, gzip" https://reedos.dev/guardian_ring/\`).\n\n`;
md += `## Whole page load\n\nSame-origin responses only; the two Google Fonts hosts add the font CSS and files on top (see THIRD_PARTY_NOTICES.md). The explorer row includes the first level's model.\n\n| Page | Requests | Raw | Gzip | Brotli | Budget (brotli) |\n|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${r.name} | ${r.requests} | ${kb(r.raw)} | ${kb(r.gzip)} | ${kb(r.brotli)} | ${kb(PAGES.find(p => p.name === r.name).budget)} |\n`;
md += `\nThe story page's Earth loop (\`look/ring-loop.mp4\`) is opt-in: the video starts hidden with \`preload="none"\` and is requested only when a visitor presses Play Earth loop, so it is not part of the page load above.\n\n## Models\n\nThe viewer fetches a level's model when the level opens, and the ring (\`earth-orbits.glb\`) first.\n\n| Model | Raw | Gzip | Brotli |\n|---|---|---|---|\n`;
for (const m of models) md += `| ${m.file} | ${kb(m.raw)} | ${kb(m.gzip)} | ${kb(m.brotli)} |\n`;
md += `| **All ten** | **${mb(total.raw)}** | **${mb(total.gzip)}** | **${mb(total.brotli)}** |\n\nThe GLBs are meshopt-compressed (\`npm run models:compress\`); before that step they were 12.06 MB raw and 4.4 MB gzipped.\n`;
fs.writeFileSync('research/page-weight.md', md);
fs.mkdirSync('.local/gates', { recursive: true });
fs.writeFileSync('.local/gates/page-weight.json', JSON.stringify({ gate: 'page-weight', status: fail.length ? 'FAIL' : 'PASS', date: new Date().toISOString(), url: BASE, rows, models, failures: fail }, null, 2));
for (const r of rows) console.log(`${r.name.padEnd(24)} ${String(r.requests).padStart(3)} requests  raw ${kb(r.raw).padStart(8)}  gzip ${kb(r.gzip).padStart(8)}  brotli ${kb(r.brotli).padStart(8)}`);
console.log(`Models: raw ${mb(total.raw)}, gzip ${mb(total.gzip)}, brotli ${mb(total.brotli)}`);
console.log(`${fail.length ? 'FAIL' : 'PASS'}: ${fail.length} problems`);
for (const f of fail) console.error(f);
process.exitCode = fail.length ? 1 : 0;
