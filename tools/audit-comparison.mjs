import fs from 'node:fs';
import path from 'node:path';
const group=process.argv[2]||'glitches',root=`.local/audit-1004/${group}`;
const originals='research/audit-2026-10-04';
const pairs=fs.readdirSync(root).filter(name=>name.endsWith('.png')&&fs.existsSync(path.join(originals,name)));
const cards=pairs.map(name=>`<section><h2>${name}</h2><div class="pair"><figure><figcaption>Audit · 10/04/2026</figcaption><img loading="lazy" src="../../../${originals}/${name}"></figure><figure><figcaption>${group} branch · revised</figcaption><img loading="lazy" src="${group}/${name}"></figure></div></section>`).join('');
// The comparison lives one directory above the images; original sources are
// referenced directly so the audited baseline is never overwritten.
fs.writeFileSync(`.local/audit-1004/${group}.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Guardian Ring · ${group} comparison</title><style>body{margin:24px;background:#080b10;color:#eee;font:16px system-ui}h1,h2{color:#e6ba82}h2{font-size:16px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;min-width:0}img{width:100%;height:auto;border:1px solid #48515a}figcaption{padding:12px 0}section{margin:40px 0}a{color:#e6ba82}</style><h1>${group}: audit and revised screenshots</h1><p>Desktop 1440 × 900; phone 390 × 844. Screenshot review supplements the recorded gates.</p>${cards}</html>` .replaceAll('../../../research/','../../research/'));
console.log(`Compared ${pairs.length} matching shots: .local/audit-1004/${group}.html`);
