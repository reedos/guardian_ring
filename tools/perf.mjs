import { run } from './browser-gates.mjs';
import {existsSync} from 'node:fs';
import {setTimeout as wait} from 'node:timers/promises';
// Optional local coordination: finish concurrent functional suites before
// measuring one build at a time. The benchmark and its budgets stay unchanged.
const hold='.local/performance-hold';
if(existsSync(hold))console.log('Performance ready: waiting for the local GPU hold to be released.');
while(existsSync(hold))await wait(1000);
await run('perf');
