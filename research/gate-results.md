# Phase 0 gate results

Recorded 10/01/2026. Built preview: `http://127.0.0.1:47601/`. Chrome, NVIDIA GeForce RTX 5090, ANGLE D3D11. Software rendering rejected. All results below postdate this build.

Build SHA-256 (sorted relative paths and bytes): `f527e9eb861a88a0079b29a73d84741dc2241eed61cf074666d8664694a96ad0`.

| Gate | Form | Checked states | Result |
|---|---|---:|---|
| cycle | desktop | 2880 | PASS |
| parts | desktop | 2880 | PASS |
| views | desktop | 30 | PASS |
| views | phone | 30 | PASS |
| ui | desktop | 36 | PASS |
| ui | phone | 38 | PASS |
| coplanar | desktop | 30 | PASS |
| flights | desktop | 30 | PASS |
| flights | phone | 30 | PASS |
| govern | desktop | 11 | PASS |
| govern | phone | 11 | PASS |
| links | desktop | 10 | PASS |
| perf | desktop | 30 | PASS; worst p95 0.60 ms |
| perf | phone | 30 | PASS; worst p95 0.50 ms |

Typecheck and production build passed; 37 unit tests passed. Strict evidence audit: 0 problems across 96 scenario combinations and 34 research facts. Site physical claims remain empty by design. Remote CI has not run.

Cycle and parts each cover every scenario × level × layer. UI includes open menus, scenarios and sheet states; quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance is held at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Camera flights and surface checks test the placeholder only. A deliberately unreachable startup test separately confirmed a fresh FAIL report, nonzero exit and browser cleanup.

These are scaffold results, not approval of future scenes, physical calculations or visual design. Re-run all gates after adding real geometry. Detailed JSON and screenshots are local under `.local/gates/` and `shots/`.
