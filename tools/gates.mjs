// Gates run sequentially so performance measurements do not compete for the GPU.
import { runGates } from '../src/explainer-kit/tools/gate-sequence.mjs';
const gates=[['project-audit','desktop'],['project-audit','phone'],['mission','desktop'],['mission','phone'],['activity','desktop'],['activity','phone'],['navigation','desktop'],['navigation','phone'],['learning','desktop'],['learning','phone'],['cycle'],['parts'],['views','desktop'],['views','phone'],['labels','desktop'],['labels','phone'],['ui','desktop'],['ui','phone'],['coplanar'],['flights','desktop'],['flights','phone'],['govern','desktop'],['govern','phone'],['links'],['perf','desktop'],['perf','phone'],['look'],['pages']];
gates.unshift(['story-freshness']);
gates.unshift(['story-loop']);
gates.unshift(['audit-layout','desktop'],['audit-layout','phone']);
gates.unshift(['controls-audit','desktop'],['controls-audit','phone']);
gates.unshift(['story-audit','desktop'],['story-audit','phone']);
gates.unshift(['visual-audit','desktop'],['visual-audit','phone']);
gates.unshift(['cuts-audit','desktop'],['cuts-audit','phone']);
gates.unshift(['reference-audit','desktop'],['reference-audit','phone']);
gates.unshift(['optics','desktop'],['optics','phone']);
gates.unshift(['cinematics','desktop'],['cinematics','phone']);
// Surface interaction regressions before the exhaustive scenario matrices.
// All gates retain their full scope; performance remains at the end.
const { total, failures } = runGates(gates, { slow: ['cycle', 'parts', 'flights', 'perf'] });
console.log(`${total - failures}/${total} gate runs passed.`);process.exitCode = failures ? 1 : 0;
