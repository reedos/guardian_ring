# Final built-preview acceptance

Recorded 10/08/2026. Built preview: `http://127.0.0.1:41637/`. All browser results below postdate this production build and include all 10 implemented levels. Scoped development runs and reserved scenes are rejected.

Build SHA-256 (sorted relative paths and bytes): `1d38823fb93ca9b458ba82e5d21b503d0434f92e88615d898038fb64e9ffecd1`.

Recorded renderer: ANGLE (NVIDIA, NVIDIA GeForce RTX 5090 (0x00002B85) Direct3D11 vs_5_0 ps_5_0, D3D11). Software rendering rejected.

| Gate | Form | Checked states | Result |
|---|---|---:|---|
| cycle | desktop | 22752 | PASS |
| parts | desktop | 22752 | PASS |
| views | desktop | 237 | PASS |
| views | phone | 237 | PASS |
| ui | desktop | 234 | PASS |
| ui | phone | 278 | PASS |
| coplanar | desktop | 30 | PASS |
| flights | desktop | 2179 | PASS |
| flights | phone | 2179 | PASS |
| govern | desktop | 11 | PASS |
| govern | phone | 11 | PASS |
| links | desktop | 15 | PASS |
| perf | desktop | 179 | PASS; worst p95 6.30 ms |
| perf | phone | 179 | PASS; worst p95 1.70 ms |
| labels | desktop | 267 | PASS |
| labels | phone | 267 | PASS |
| learning | desktop | 359 | PASS |
| learning | phone | 367 | PASS |
| navigation | desktop | 937 | PASS |
| navigation | phone | 941 | PASS |
| mission | desktop | 193 | PASS |
| mission | phone | 196 | PASS |
| activity | desktop | 885 | PASS |
| activity | phone | 885 | PASS |
| project-audit | desktop | 160 | PASS |
| project-audit | phone | 165 | PASS |
| audit-layout | desktop | 238 | PASS |
| audit-layout | phone | 238 | PASS |
| controls-audit | desktop | 9 | PASS |
| controls-audit | phone | 13 | PASS |
| story-audit | desktop | 383 | PASS |
| story-audit | phone | 373 | PASS |
| visual-audit | desktop | 20 | PASS |
| visual-audit | phone | 20 | PASS |
| cuts-audit | desktop | 10 | PASS |
| cuts-audit | phone | 10 | PASS |
| reference-audit | desktop | 32 | PASS |
| reference-audit | phone | 32 | PASS |
| optics | desktop | 305 | PASS |
| optics | phone | 224 | PASS |
| cinematics | desktop | 252 | PASS |
| cinematics | phone | 252 | PASS |
| look: story | desktop | 30 evidence dialogs | PASS |
| look: story | phone | 30 evidence dialogs | PASS |
| pages: evidence | desktop | 962 evidence dialogs | PASS |
| pages: method | desktop | 0 evidence dialogs | PASS |
| pages: glossary | desktop | 0 evidence dialogs | PASS |
| pages: parts | desktop | 127 evidence dialogs | PASS |
| pages: evidence | phone | 962 evidence dialogs | PASS |
| pages: method | phone | 0 evidence dialogs | PASS |
| pages: glossary | phone | 0 evidence dialogs | PASS |
| pages: parts | phone | 127 evidence dialogs | PASS |

44/44 browser gate commands passed: 42 geometry/UI/label/learning runs plus story and reference-page checks on both forms. Typecheck passed. 274/274 unit tests passed. Strict evidence audit: 0 problems across 962 site claims (92256 scenario instances), 96 scenarios, and 253 research facts.

Cycle and parts cover every scenario × level × layer. UI includes open menus, visible keyboard focus, scenarios and sheet states. Learning checks cover sequence controls, source-reading suspension, reduced-motion stepping, context-preserving scenario changes and nested side visits. Quality checks compare reported resolution with the renderer, canvas and actual WebGL drawing buffer. Performance samples selected-part inspection, overview and each teaching-animation phase at tier 0; budgets are 15 ms desktop / 7 ms phone p95. Samples that cross into another phase are discarded before the intended phase resumes. Printed-label checks reject partially obscured lettering and require a clear authored desktop view for every nameplate. Flights cover the overview to each part and every ordered distinct part pair within each level/layer on both forms. Story and reference pages check their evidence dialogs, links, phone layout and noindex metadata.

These are local acceptance results. They do not assert remote CI status or replace Reed’s phone review or launch decision. Noindex remains on. Detailed JSON and screenshots are local under `.local/gates/`, `.local/look/`, `.local/pages/` and `shots/`.

Navigation checks press Next through every part, inspect each manual animation step, and verify overview selection, completed camera movement, mechanism-step routes, useful projected component size, Back restoration, and preservation of deliberate camera adjustments.

Mission checks cover the guided chapters, orbital follow views, source-reading suspension, pause, reduced-motion entry, manual interruption, and canceled pending navigation. Project-audit checks cover keyboard tab and menu focus, presentation exit, current scenarios in repeated new-tab links, hidden orbit-family selections, and filtered or malformed reference-page fragments, including embedded reference pages. Both run on desktop and phone.

Activity checks exercise real layer buttons across hardware scenes and layers; Atmosphere legacy shared modes use the scene API and separately assert that its removed layer toggles stay hidden with ordinary playback, an explicit pause, and reduced motion. They require meaningful visible poses, rendered geometry changes while playing, stationary geometry while paused, and stable compatible-part selection and cameras. Each layer crosses a natural rendered cycle boundary in the atmosphere example; all scene/layer states independently assert repeat intent. Source reading and Chrome lifecycle freeze/resume hold the lesson without catch-up, orbital follow retains pause/play intent, and the real Share handler preserves the followed spacecraft. Desktop and phone use the same checks.

Performance setup follows the Intelligence Factory benchmark: a 300 ms rendered settling period, no active CSS transitions, then 24 warm-up frames. Each measured condition retains all valid frame intervals; complete teaching phases include at least 240 samples.
