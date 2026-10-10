// IF's strict claim walk, adapted to every Guardian Ring scenario combination.
import { compute, SCENARIO_OPTIONS } from '../src/model/engine.ts';
import { content } from '../src/data.js';
import { allClaims } from '../src/claims.js';
import { problems } from '../src/evidence.js';
import { SOURCES } from '../src/sources.js';
import { cartesian, walkClaims } from '../src/explainer-kit/src/claims-walk.js';
import fs from 'node:fs';
const scenarios = cartesian(SCENARIO_OPTIONS);
const { problems: found, keys: siteKeys, instances: count } = walkClaims({
  scenarios,
  claimsFor: scenario => { const M = compute(scenario), C = content(M); return allClaims(M, C); },
  problemsOf: claim => problems(claim, SOURCES, true),
});
const seen = new Set(found.values());
// Check canonical ledgers too: the generated combined table can lag behind them.
const researchDir=new URL('../research/',import.meta.url);
let researchCount=0;
const combined=JSON.parse(fs.readFileSync(new URL('verified-facts.json',researchDir),'utf8')).facts;
const canonical=new Map();
for(const file of fs.readdirSync(researchDir).filter(name=>name.endsWith('-facts.json'))){
  const research=JSON.parse(fs.readFileSync(new URL(file,researchDir),'utf8')).facts;
  for(const fact of research){
    researchCount++;
    const row=fact.row||fact.spec;
    if(!Array.isArray(row)){seen.add(`${file}:${fact.id}: missing claim tuple`);continue;}
    const [label,value,basis,ev]=row;
    for(const p of problems({label,value,basis,ev},SOURCES,true))seen.add(`${file}:${fact.id}: ${p}`);
    if(file!=='verified-facts.json'){
      if(canonical.has(fact.id))seen.add(`${file}:${fact.id}: duplicate canonical fact`);
      canonical.set(fact.id,row);
    }
  }
}
for(const fact of combined){
  if(JSON.stringify(canonical.get(fact.id))!==JSON.stringify(fact.row))seen.add(`verified-facts.json:${fact.id}: differs from canonical ledger`);
  canonical.delete(fact.id);
}
for(const id of canonical.keys())seen.add(`verified-facts.json:${id}: missing canonical fact`);
for(const problem of seen)console.error(problem);
console.log(`${seen.size} problems across ${siteKeys.size} site claims (${count} scenario instances), ${scenarios.length} scenarios, and ${researchCount} research rows (canonical and combined).`);
process.exitCode=seen.size?1:0;
