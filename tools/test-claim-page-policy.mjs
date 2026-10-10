import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {collectPageClaims,classifyPageRow} from './claim-page-policy.mjs';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 await page.setContent('<section><p>At 35,786 km above Earth, a geostationary satellite keeps pace with Earth. <button data-src="orbit:altitude">Calc.</button></p><p>Cooling matters because noise changes. <button data-src="detector:noise">Reported</button></p><ul><li><p>8 channels <button data-src="channels">Spec.</button></p></li></ul></section>');
 const rows=await page.evaluate(source=>Function(`return (${source})`)()(document),collectPageClaims.toString());
 assert.equal(rows.length,3);
 assert.equal(rows[0].text,'At 35,786 km above Earth, a geostationary satellite keeps pace with Earth.');
 assert.deepEqual(rows[0].keys,['orbit:altitude']);
 assert.equal(rows[1].text,'Cooling matters because noise changes.');
 assert.equal(rows[2].text,'8 channels');
} finally {await browser.close();}
const unsupported={page:'index',text:'This teaching sphere has radius 12345 m because its arbitrary color is amber',keys:[]};
assert.equal(classifyPageRow(unsupported,[]).status,'unreviewed');
assert.equal(classifyPageRow({...unsupported,keys:['known-registry-key']},[]).status,'unreviewed');
const label={page:'index',text:'01 / 10',keys:[]};
const reviews=[{...label,status:'ui-label',basis:'Navigation counter: level one of ten; not a physical quantity'}];
assert.equal(classifyPageRow(label,reviews).status,'ui-label');
assert.equal(classifyPageRow({...label,text:'01 / 100'},reviews).status,'unreviewed');
assert.equal(classifyPageRow({...label,contextId:'other-section'},reviews).status,'unreviewed');
assert.equal(classifyPageRow({...label,links:['https://example.invalid/changed']},reviews).status,'unreviewed');
assert.equal(classifyPageRow(label,[{...label,status:'confirmed',basis:''}]).status,'unreviewed');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gr-claim-policy-'));
try {
 const pages=path.join(dir,'pages.json'),output=path.join(dir,'audit.md');
 fs.writeFileSync(pages,JSON.stringify({rows:[unsupported]}));
 const result=spawnSync(process.execPath,['--import','tsx','tools/claim-audit-report.mjs','--pages',pages,'--output',output],{encoding:'utf8'});
 assert.equal(result.status,1,result.stdout+result.stderr);
 assert.match(result.stderr,/1 page rows remain unreviewed/);
 assert.match(fs.readFileSync(output,'utf8'),/unreviewed: No exact reviewed text\/evidence match/);
} finally {
 // Only this test's freshly created directory and known files are removed.
 for(const name of ['pages.json','audit.md'])fs.rmSync(path.join(dir,name),{force:true});
 fs.rmdirSync(dir);
}
console.log('PASS inline evidence sentences, nested prose, changed text/context/links, unknown facts and actual report exit 1');
