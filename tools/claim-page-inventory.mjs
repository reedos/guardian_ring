// Collect text from the built pages, including text in expandable sections.
// Only the explicitly supplied local preview is visited.
import {chromium} from 'playwright';
import fs from 'node:fs';
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
      const snapshot=await page.evaluate(()=>{
        const selector='p,li,dt,dd,td,th,h1,h2,h3,h4,figcaption,button,label';
        const rows=[...document.querySelectorAll(selector)].filter(el=>!el.querySelector(selector)).map(el=>{
          const text=el.textContent.replace(/\s+/g,' ').trim();
          const owner=el.closest('tr,article,section,li')||el.parentElement;
          return {text,keys:[...owner.querySelectorAll('[data-src]')].map(e=>e.dataset.src)};
        }).filter(row=>/\d|\bbecause\b/i.test(row.text));
        return {rows,overflow:document.documentElement.scrollWidth>innerWidth+1};
      });
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
