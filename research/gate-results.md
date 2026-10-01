# Final built-preview acceptance

Recorded 10/01/2026. Built preview: `http://127.0.0.1:47601/`. All browser results below postdate this production build and include all 10 implemented levels. Scoped development runs and reserved scenes are rejected.

Build SHA-256 (sorted relative paths and bytes): `9217b29505e20abb559a84b8a518a98fa99db07e36793b274abba8ac67df3c9d`.

Recorded renderer: ANGLE (NVIDIA, NVIDIA GeForce RTX 5090 (0x00002B85) Direct3D11 vs_5_0 ps_5_0, D3D11). Software rendering rejected.

| Gate | Form | Checked states | Result |
|---|---|---:|---|
| cycle | desktop | 8640 | PASS |
| parts | desktop | 8640 | PASS |
| views | desktop | 90 | PASS |
| views | phone | 90 | PASS |
| ui | desktop | 78 | PASS |
| ui | phone | 80 | PASS |
| coplanar | desktop | 30 | PASS |
| flights | desktop | 270 | PASS |
| flights | phone | 270 | PASS |
| govern | desktop | 11 | PASS |
| govern | phone | 11 | PASS |
| links | desktop | 10 | PASS |
| perf | desktop | 30 | PASS; worst p95 0.80 ms |
| perf | phone | 30 | PASS; worst p95 0.70 ms |
| look: story | desktop | 21 evidence dialogs | PASS |
| look: story | phone | 21 evidence dialogs | PASS |
| pages: evidence | desktop | 186 evidence dialogs | PASS |
| pages: method | desktop | 0 evidence dialogs | PASS |
| pages: glossary | desktop | 0 evidence dialogs | PASS |
| pages: evidence | phone | 186 evidence dialogs | PASS |
| pages: method | phone | 0 evidence dialogs | PASS |
| pages: glossary | phone | 0 evidence dialogs | PASS |

16/16 browser gate commands passed: 14 geometry/UI runs plus story and reference-page checks on both forms. Typecheck passed. 69/69 unit tests passed. Strict evidence audit: 0 problems across 186 site claims (17760 scenario instances), 96 scenarios, and 34 research facts.

Cycle and parts cover every scenario × level × layer. UI includes open menus, visible keyboard focus, scenarios and sheet states. Quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance is held at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Flights cover the overview to each part and every ordered distinct part pair within each level/layer on both forms. Story and reference pages check their evidence dialogs, links, phone layout and noindex metadata.

These are local acceptance results. They do not assert remote CI status or replace Reed’s phone review or launch decision. Noindex remains on. Detailed JSON and screenshots are local under `.local/gates/`, `.local/look/`, `.local/pages/` and `shots/`.
