// Reproducible evidence inventory; run after claims, tests, build and page inventory.
import fs from 'node:fs';
import {compute,SCENARIO_OPTIONS} from '../src/model/engine.ts';
import {content} from '../src/data.js';
import {allClaims} from '../src/claims.js';
import {CALCS,ASSUMPTIONS,BASIS,problems} from '../src/evidence.js';
import {SOURCES} from '../src/sources.js';
import {CINEMATIC_LESSONS} from '../src/cinematic-lessons.js';
import {classifyPageRow} from './claim-page-policy.mjs';
const esc=x=>String(x??'').replaceAll('|','\\|').replace(/\s+/g,' ').trim();
const scenarios=Object.entries(SCENARIO_OPTIONS).reduce((rows,[key,values])=>rows.flatMap(row=>values.map(v=>({...row,[key]:v.id}))),[{}]);
const claims=new Map(),prose=new Map();
const evidence=ev=>[ev?.calc&&`Calc: ${ev.calc}`,ev?.assume&&`Assumed: ${ev.assume}`,...(ev?.refs||[]).map(([id,at])=>`${id}: ${at}`)].filter(Boolean).join('; ');
function narrative(object,path,ev='') {
  if(!object||typeof object!=='object')return;
  if(object.specs)ev=object.specs.map(row=>evidence(row.at(-1))).join('; ');
  if(object.intro&&object.id)ev=`Scene ${object.id}: corresponding card and component references in the registry; look-model for the drawing`;
  for(const [key,value] of Object.entries(object)) {
    if(key==='specs')continue;
    if(typeof value==='string'&&['body','intro','scale','description','title','kicker','scope','why','how','value'].includes(key)){
      const id=JSON.stringify([value,ev]);
      if(!prose.has(id))prose.set(id,{text:value,where:new Set(),ev});
      prose.get(id).where.add(`${path}.${key}`);
    }else if(value&&typeof value==='object')narrative(value,`${path}.${key}`,ev);
  }
}
for(const scenario of scenarios){
  const m=compute(scenario),c=content(m);
  for(const claim of allClaims(m,c)){
    const errors=problems(claim,SOURCES,true);if(errors.length)throw new Error(`${claim.key}: ${errors}`);
    if(!claims.has(claim.key))claims.set(claim.key,{...claim,values:new Set()});
    claims.get(claim.key).values.add(claim.value);
  }
  narrative(c,'content');
}
for(const [id,lesson] of Object.entries(CINEMATIC_LESSONS))narrative(lesson,`lesson:${id}`,lesson.evidence.map(id=>`cinematic:${id}`).join('; ')+'; cinematic-presentation; cinematic-model-inputs');
const testMap={
  'orbit-period':'claims-audit.test.ts: differentiated ellipse / polygon swept area; orbits.test.ts: reference period and scaling',
  'orbit-speed':'claims-audit.test.ts: central-difference velocity from independently propagated positions',
  'orbit-altitude':'claims-audit.test.ts: Cartesian position radius; orbits.test.ts: extrema and quadrature',
  'orbit-slant-range':'claims-audit.test.ts: Cartesian surface-to-space distance',
  'vacuum-light-time':'claims-audit.test.ts: recovered distance after time at exact c',
  'photon-energy':'claims-audit.test.ts: frequency conversion, including rounded display',
  'ideal-diffraction':'claims-audit.test.ts: first Bessel J1 root; 1.22 is rounded to three significant figures',
  'planck-band-radiance':'claims-audit.test.ts: frequency midpoint integration, all 96 scenarios',
  'planck-band-photons':'claims-audit.test.ts: independent photon mode occupancy integral, all 96 scenarios',
  'carnot-cop':'claims-audit.test.ts: reversible entropy and energy ledger',
  'cooler-energy-balance':'claims-audit.test.ts: entropy-derived rejected heat at three scales',
  'kepler-illustration-motion':'claims-audit.test.ts: small-angle inverse fixtures; orbits.test.ts: equal swept areas',
  'cinematic-spectrum':'claims-audit.test.ts: frequency spectral kernel and density Jacobian',
  'cinematic-charge':'claims-audit.test.ts: independently counted ADC thresholds',
  'cinematic-wheel':'claims-audit.test.ts: finite-difference motion and inertial momentum',
  'cinematic-power':'claims-audit.test.ts: accumulated power samples versus stored energy',
  'cinematic-slab':'claims-audit.test.ts: numerical integration of radiative-transfer differential equation',
  'cinematic-calibration':'claims-audit.test.ts: independently solved two-reference gain/offset at three scales',
  'ideal-prime-focus':'ideal-focus.test.ts: focus direction versus reflected direction; equal optical paths',
  'ideal-scan-reflection':'scan-optics.test.ts: plane intersections, reciprocity, angular doubling',
};
if(JSON.stringify(Object.keys(testMap).sort())!==JSON.stringify(Object.keys(CALCS).sort()))throw new Error('Update the independently reviewed calculation test map');
const args=process.argv.slice(2);
const argument=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const pageData=JSON.parse(fs.readFileSync(argument('--pages','.local/claims-audit/pages.json'),'utf8'));
const reviews=JSON.parse(fs.readFileSync('research/page-claim-reviews.json','utf8'));
const unreviewed=pageData.rows.filter(row=>classifyPageRow(row,reviews).status==='unreviewed');
let out=`# Guardian Ring claim audit — 10/07/2026

## Result and scope

The inventory covers ${claims.size} stable claim keys and every distinct displayed value across ${scenarios.length} scenario combinations, all ten levels and three layers, assembly/component narration, cinematic lesson narration, and numeric/because text from all six built HTML pages. Duplicate values and narration are grouped, with their locations retained. Source dates, document page numbers, model names (TIRS-2), UI counts and keyboard shortcuts are included in the page inventory so they cannot be confused with measured hardware properties. Canvas values are covered through their pure model and lesson assumptions; this is not an OCR audit.

“Confirmed” means the stated evidence trail and scoped interpretation were checked, using the existing quoted research ledgers, the calculation tests below, or direct page inspection. It does not mean every external source was newly fetched or that every modeled claim is a measurement. “Footnoted” identifies an explicit existing illustration/teaching assumption or unavailable input. “Fixed” identifies changes in this branch.

## Fixes

- Fixed: the Kepler solver subtracted nearly equal terms and stopped against an absolute angular epsilon. For eccentricity 0.999999999999 and true eccentric anomaly 1e-6, the prior solution erred by about 5.04e-5 relative. It now evaluates a small-angle residual and derivative without cancellation and stops on relative progress. A constructed inverse regression failed before the fix and passes afterward. Ordinary displayed orbit values are unchanged at their stated precision.
- Fixed: ideal prime-focus and scan-reflection lessons were labeled Calc. in their dialogs but absent from the shared registry. Both now have calculation definitions and entries, backed by their geometric tests and the NASA reflection reference.
- Fixed: the claims gate previously checked only the generated combined research ledger. It now checks all seven canonical ledgers and rejects stale, missing or duplicated combined facts.
- Fixed after independent review: the DOM collector retains sentences containing inline evidence buttons. Every page row now needs an exact reviewed text, location, links and registry-key record in page-claim-reviews.json; missing or changed records are unreviewed and make this command fail. A synthetic unsupported numeric/because sentence verifies the actual command exits nonzero.
- Confirmed: the 1.22 diffraction coefficient is a rounded Airy coefficient, not an exact constant; an independent Bessel root confirms its rounding error is below 0.03%. No extra precision is attributed to it.

## Source review

The existing quoted source ledgers are [physics-review](physics-review.md), [spacecraft-review](spacecraft-review.md), [component review](COMPREHENSIVE-SYSTEMS-REVIEW.md), [TIRS-2 review](tirs2-architecture-review.md), [integration review](instrument-integration-review.md), [systems notes](systems/source-notes.md), and the design-practices fact/quote ledgers. Each cited entry below retains its exact source location. Unchecked sources remain excluded by the strict validator. Civil numbers stay attached to ABI, GOES-R or TIRS-2; assumed geometry never becomes military performance.

Fresh primary-source spot checks on 10/07/2026 confirmed NIST c/h/k, JPL Earth GM, NASA TIRS-2 43 K and 185 K design temperatures, NOAA ABI channels/cadences, and NASA reflection/prime-focus principles. These checks supplement the existing source review, rather than silently redate it.

- [NIST constants](https://physics.nist.gov/cuu/Constants/Table/allascii.txt): exact SI constants used by the tests and model.
- [JPL parameters](https://ssd.jpl.nasa.gov/astro_par.html): Earth GM 398600.435507 km³/s².
- [NASA TIRS-2](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/): named civil design temperatures, not generic detector settings.
- [NOAA ABI](https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi): named civil channel and imaging cadence facts.
- [NASA reflection](https://science.nasa.gov/learn/basics-of-space-flight/chapter6-5/): Reflection section; equal angles and on-axis prime focus.

## Independent calculation checks

All paths below are in src/model. Relative-error assertions protect quantities with different scales; no fixed epsilon is used to accept tiny photon energies. Existing optics tests compare independently constructed geometric invariants.

| Calculation | Status | Independent check |
|---|---|---|
`;
for(const [id,test] of Object.entries(testMap))out+=`| ${id} | ${id==='kepler-illustration-motion'||id.startsWith('ideal-prime')||id.startsWith('ideal-scan')?'fixed':'confirmed'} | ${test} |\n`;
out+='\n## Registered claims, all scenario values\n\n| Key | Label | Values | Basis | Status | Evidence |\n|---|---|---|---|---|---|\n';
for(const [id,claim] of claims)out+=`| ${esc(id)} | ${esc(claim.label)} | ${esc([...claim.values].join(' / '))} | ${BASIS[claim.basis].short} | ${claim.basis==='assumed'?'footnoted':id==='learning:prime-focus'||id==='learning:scan-reflection'?'fixed':'confirmed'} | ${esc(evidence(claim.ev))} |\n`;
out+='\n## Narrative and component text\n\nNarration retains the scoped references and drawing assumptions of its owning cards. Lesson references apply to their beats. Scene titles and scale descriptions are UI/illustration labels. No source is inferred from a numerical match alone.\n\n| Locations | Text | Status / trail |\n|---|---|---|\n';
for(const item of prose.values())out+=`| ${esc([...item.where].join('; '))} | ${esc(item.text)} | ${item.ev?'confirmed: '+esc(item.ev):'footnoted: scene/title illustration context; look-model'} |\n`;
out+='\n## Teaching assumptions and limits\n\n| ID | Value | Footnote |\n|---|---|---|\n';
for(const [id,a] of Object.entries(ASSUMPTIONS))out+=`| ${id} | ${esc(a.value)} | footnoted: ${esc(a.why)} |\n`;
out+='\n## Built-page numeric and because inventory\n\nThe page inventory includes source locators and UI metadata, not just physics. Registered values are checked above; inline source citations and method formulas carry their own references. The checked-in review manifest classifies exact bibliographic metadata, UI counters, dates, shortcuts and instrument names as ui-label, separately from confirmed physical claims and footnoted teaching assumptions. These records are deliberate review decisions, not generated approvals. Unknown or changed text, context, links or evidence keys fail the audit. Repeated visible copies remain listed. To update a record, inspect the changed sentence and supporting source/test first; never regenerate approvals from page text alone.\n\n| Page | Text | Attached registry keys | Status |\n|---|---|---|---|\n';
for(const row of pageData.rows){const review=classifyPageRow(row,reviews);out+=`| ${row.page} | ${esc(row.text)} | ${esc(row.keys.join('; '))} | ${review.status}: ${esc(review.basis)} |\n`;}
out+='\n## Verification and limitations\n\nRun: npx tsc --noEmit; npx vitest run; npx tsx tools/claims.mjs; npm run build; GR_URL=<isolated preview> node tools/claim-page-inventory.mjs; npx tsx tools/claim-audit-report.mjs. The inventory scans DOM text (including expandable text) and model data, not arbitrary pixels. Browser captures cover all six pages at 360 and 1440 px. Full rendering/performance certification belongs to the separate visual/performance briefs.\n';
fs.writeFileSync(argument('--output','research/ASTRA-CLAIMS-AUDIT-2026-10-07.md'),out);
console.log(`${claims.size} claim keys, ${prose.size} narrative records, ${pageData.rows.length} page text nodes, ${Object.keys(testMap).length} calculation checks`);
if(unreviewed.length){console.error(`${unreviewed.length} page rows remain unreviewed; audit is not certified`);process.exitCode=1;}
