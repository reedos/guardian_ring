// Collect text from the built pages, including text in expandable sections.
// Only the explicitly supplied local preview is visited.
import {chromium} from 'playwright';
import fs from 'node:fs';
import {collectPageClaims} from './claim-page-policy.mjs';
const base=process.env.GR_URL;
if(!base || new URL(base).hostname!=='127.0.0.1')throw new Error('Set GR_URL to the isolated local preview');
fs.mkdirSync('.local/claims-audit',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=d3d11','--enable-gpu','--ignore-gpu-blocklist']});
const rows=[];const failures=[];
try {
  for(const width of [360,1440]) {
    const page=await browser.newPage({viewport:{width,height:900}});
    for(const file of ['index','visualizer','evidence','method','glossary','parts']) {
      await page.goto(new URL(file==='index'?'index.html':`${file}.html`,base).href);
      if(file==='visualizer')await page.waitForFunction(()=>window.grx?.built[window.grx.state.scene],null,{timeout:90000});
      const snapshot=await page.evaluate(source=>{
        const collect=Function(`return (${source})`)();
        return {rows:collect(document),overflow:document.documentElement.scrollWidth>innerWidth+1};
      },collectPageClaims.toString());
      if(snapshot.overflow)failures.push(`${file}: horizontal overflow at ${width}px`);
      if(width===360)rows.push(...snapshot.rows.map(row=>({page:file,...row})));
      await page.screenshot({path:`.local/claims-audit/${file}-${width}.png`,fullPage:false});
    }
    await page.close();
  }
} finally {await browser.close();}
fs.writeFileSync('.local/claims-audit/pages.json',JSON.stringify({rows,failures},null,2));
console.log(`${rows.length} numeric/because text nodes; ${failures.length} layout findings`,failures);
process.exitCode=failures.length?1:0;
