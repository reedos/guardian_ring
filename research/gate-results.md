# Final built-preview acceptance

Recorded 10/01/2026. Built preview: `http://127.0.0.1:47601/`. All browser results below postdate this production build and include all 10 implemented levels. Scoped development runs and reserved scenes are rejected.

Build SHA-256 (sorted relative paths and bytes): `1f3558fac97ae5ed0d13ea98e3336597f9b55226e7a8b29ed05c5b62fb6e9285`.

Recorded renderer: ANGLE (NVIDIA, NVIDIA GeForce RTX 5090 (0x00002B85) Direct3D11 vs_5_0 ps_5_0, D3D11). Software rendering rejected.

| Gate | Form | Checked states | Result |
|---|---|---:|---|
| cycle | desktop | 15552 | PASS |
| parts | desktop | 15552 | PASS |
| views | desktop | 162 | PASS |
| views | phone | 162 | PASS |
| ui | desktop | 212 | PASS |
| ui | phone | 217 | PASS |
| coplanar | desktop | 30 | PASS |
| flights | desktop | 1320 | PASS |
| flights | phone | 1320 | PASS |
| govern | desktop | 11 | PASS |
| govern | phone | 11 | PASS |
| links | desktop | 14 | PASS |
| perf | desktop | 30 | PASS; worst p95 0.90 ms |
| perf | phone | 30 | PASS; worst p95 0.80 ms |
| look: story | desktop | 25 evidence dialogs | PASS |
| look: story | phone | 25 evidence dialogs | PASS |
| pages: evidence | desktop | 667 evidence dialogs | PASS |
| pages: method | desktop | 0 evidence dialogs | PASS |
| pages: glossary | desktop | 0 evidence dialogs | PASS |
| pages: parts | desktop | 102 evidence dialogs | PASS |
| pages: evidence | phone | 667 evidence dialogs | PASS |
| pages: method | phone | 0 evidence dialogs | PASS |
| pages: glossary | phone | 0 evidence dialogs | PASS |
| pages: parts | phone | 102 evidence dialogs | PASS |

16/16 browser gate commands passed: 14 geometry/UI runs plus story and reference-page checks on both forms. Typecheck passed. 81/81 unit tests passed. Strict evidence audit: 0 problems across 667 site claims (63936 scenario instances), 96 scenarios, and 210 research facts.

Cycle and parts cover every scenario × level × layer. UI includes open menus, visible keyboard focus, scenarios and sheet states. Quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance is held at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Flights cover the overview to each part and every ordered distinct part pair within each level/layer on both forms. Story and reference pages check their evidence dialogs, links, phone layout and noindex metadata.

These are local acceptance results. They do not assert remote CI status or replace Reed’s phone review or launch decision. Noindex remains on. Detailed JSON and screenshots are local under `.local/gates/`, `.local/look/`, `.local/pages/` and `shots/`.
