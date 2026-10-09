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
const research=JSON.parse(fs.readFileSync(new URL('../research/verified-facts.json',import.meta.url),'utf8')).facts;
for(const fact of research){const [label,value,basis,ev]=fact.row;for(const p of problems({label,value,basis,ev},SOURCES,true))seen.add(`research:${fact.id}: ${p}`);}
for(const problem of seen)console.error(problem);
console.log(`${seen.size} problems across ${siteKeys.size} site claims (${count} scenario instances), ${scenarios.length} scenarios, and ${research.length} research facts.`);
process.exitCode=seen.size?1:0;
