# Final built-preview acceptance

Recorded 10/02/2026. Built preview: `http://127.0.0.1:47601/`. All browser results below postdate this production build and include all 10 implemented levels. Scoped development runs and reserved scenes are rejected.

Build SHA-256 (sorted relative paths and bytes): `fd3463e001d9a178003bab65f1f226b87c0732f8160756f400fcb708cf77e01d`.

Recorded renderer: ANGLE (NVIDIA, NVIDIA GeForce RTX 5090 (0x00002B85) Direct3D11 vs_5_0 ps_5_0, D3D11). Software rendering rejected.

| Gate | Form | Checked states | Result |
|---|---|---:|---|
| cycle | desktop | 22752 | PASS |
| parts | desktop | 22752 | PASS |
| views | desktop | 237 | PASS |
| views | phone | 237 | PASS |
| ui | desktop | 264 | PASS |
| ui | phone | 287 | PASS |
| coplanar | desktop | 30 | PASS |
| flights | desktop | 2091 | PASS |
| flights | phone | 2091 | PASS |
| govern | desktop | 11 | PASS |
| govern | phone | 11 | PASS |
| links | desktop | 14 | PASS |
| perf | desktop | 169 | PASS; worst p95 3.60 ms |
| perf | phone | 169 | PASS; worst p95 6.80 ms |
| labels | desktop | 267 | PASS |
| labels | phone | 267 | PASS |
| learning | desktop | 354 | PASS |
| learning | phone | 362 | PASS |
| look: story | desktop | 28 evidence dialogs | PASS |
| look: story | phone | 28 evidence dialogs | PASS |
| pages: evidence | desktop | 936 evidence dialogs | PASS |
| pages: method | desktop | 0 evidence dialogs | PASS |
| pages: glossary | desktop | 0 evidence dialogs | PASS |
| pages: parts | desktop | 127 evidence dialogs | PASS |
| pages: evidence | phone | 936 evidence dialogs | PASS |
| pages: method | phone | 0 evidence dialogs | PASS |
| pages: glossary | phone | 0 evidence dialogs | PASS |
| pages: parts | phone | 127 evidence dialogs | PASS |

20/20 browser gate commands passed: 18 geometry/UI/label/learning runs plus story and reference-page checks on both forms. Typecheck passed. 156/156 unit tests passed. Strict evidence audit: 0 problems across 936 site claims (89760 scenario instances), 96 scenarios, and 253 research facts.

Cycle and parts cover every scenario × level × layer. UI includes open menus, visible keyboard focus, scenarios and sheet states. Learning checks cover sequence controls, source-reading suspension, reduced-motion stepping, context-preserving scenario changes and nested side visits. Quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance samples selected-part inspection, overview and each teaching-animation phase at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Samples that cross into another phase are discarded before the intended phase resumes. Printed-label checks reject partially obscured lettering and require a clear authored desktop view for every nameplate. Flights cover the overview to each part and every ordered distinct part pair within each level/layer on both forms. Story and reference pages check their evidence dialogs, links, phone layout and noindex metadata.

These are local acceptance results. They do not assert remote CI status or replace Reed’s phone review or launch decision. Noindex remains on. Detailed JSON and screenshots are local under `.local/gates/`, `.local/look/`, `.local/pages/` and `shots/`.

Performance setup follows the Intelligence Factory benchmark: a 300 ms rendered settling period, no active CSS transitions, then 24 warm-up frames. Each measured condition retains all valid frame intervals; complete teaching phases include at least 240 samples.
