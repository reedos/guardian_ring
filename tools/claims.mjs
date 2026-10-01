// IF's strict claim walk, adapted to every Guardian Ring scenario combination.
import { compute, SCENARIO_OPTIONS } from '../src/model/engine.ts';
import { content } from '../src/data.js';
import { allClaims } from '../src/claims.js';
import { problems } from '../src/evidence.js';
import { SOURCES } from '../src/sources.js';
import fs from 'node:fs';
const scenarios = Object.entries(SCENARIO_OPTIONS).reduce((rows,[key,values]) => rows.flatMap(row=>values.map(v=>({...row,[key]:v.id}))),[{}]);
const seen=new Set(),siteKeys=new Set(); let count=0;
for(const scenario of scenarios){const M=compute(scenario),C=content(M);for(const c of allClaims(M,C)){count++;siteKeys.add(c.key);for(const p of problems(c,SOURCES,true))seen.add(`${c.key}: ${p}`);}}
const research=JSON.parse(fs.readFileSync(new URL('../research/verified-facts.json',import.meta.url),'utf8')).facts;
for(const fact of research){const [label,value,basis,ev]=fact.row;for(const p of problems({label,value,basis,ev},SOURCES,true))seen.add(`research:${fact.id}: ${p}`);}
for(const problem of seen)console.error(problem);
console.log(`${seen.size} problems across ${siteKeys.size} site claims (${count} scenario instances), ${scenarios.length} scenarios, and ${research.length} research facts (Phase 2: cited story figures and schematic illustrations; no physics engine).`);
process.exitCode=seen.size?1:0;
