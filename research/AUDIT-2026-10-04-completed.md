# UX and visual audit fixes — accepted 10/04/2026

All five requested groups passed acceptance against their unchanged production builds on 10/04/2026. This document records the tested implementation; merge and release status is reported separately. Reed subsequently authorized publishing the completed, validated work through the existing Pages workflow. Noindex remains on.

| Group | Implementation commits | Changes | Local comparison page |
|---|---|---|---|
| A | 29ae12f, 11ddc54 | Thin orbit guides; protected stage height; reset inspector scroll; constrained pin-label distance; readable titles; follow-camera clearance | glitches.html |
| B | e2b58ac, 74e10ad, 0b82755, fc2d659 | One-shot Next; orbit-family selection and scrubber; consolidated motion controls; compact responsive legend; reachable phone sheet | controls.html |
| C | ef5c98b, c6926b8 | Generic launch and alert chapters; roughly 90-second tour; concise captions; phase chips inside the explanation menu; complete alert text on each screen | story.html |
| D | c865e81, d084d94 | Larger rising plume; emissive ribbons; qualitative Data/Heat colors; responsive ring framing; moving antenna; explicit cold/warm thermal roles | visuals.html |
| F | 15766d2 | Try it inside Parts on ring/pixel/atmosphere; Side levels picker; duplicate controls removed; corrected Parts keyboard semantics | cuts.html |

| Group | Accepted implementation | Browser commands | Unit tests | Evidence report |
|---|---|---:|---:|---|
| A | `58d7509` | 30/30 | 251/251 | [Recorded gates](audit-2026-10-04-gates-A.md) |
| B | `002259f` | 32/32 | 255/255 | [Recorded gates](audit-2026-10-04-gates-B.md) |
| C | `5d7958a` | 34/34 | 258/258 | [Recorded gates](audit-2026-10-04-gates-C.md) |
| D | `573d39b` | 36/36 | 260/260 | [Recorded gates](audit-2026-10-04-gates-D.md) |
| F | `f47af17` | 38/38 | 260/260 | [Recorded gates](audit-2026-10-04-gates-F.md) |

All 170 browser gate commands passed on the recorded RTX 5090, using desktop 1440 × 900 and phone 390 × 844 viewports. These are phone-viewport tests on a PC, not physical-phone performance measurements. Typecheck passed for every group. The final build passes 260 unit tests and reports 0 problems across 941 site claims, 90,240 scenario instances, 96 scenarios, and 253 research facts.

The final interface has 20 first-load controls on desktop and 9 on phone. Its minimum tested canvas height is 69.9% of the desktop viewport and 45.2% of the phone viewport. Layout checks cover 238 states on each form. The story comparison includes desktop and phone opening, launch, and alert frames, plus every revised chapter. New chapters are explicitly compared with the original view of the same level where the audit contains no equivalent chapter.

Interpretations and boundaries:

- A1's large opaque-mesh check applies to the offending orbit guide. Earth and spacecraft may intentionally occupy more than 15% of the canvas.
- A3 explicitly permits hiding an unplaceable callout. The labels gate checks a visible named pin and matching inspector title in that case, and enforces the 220-pixel distance on visible callouts. All five groups pass 267 label states per form.
- D5's below-stage legend structure landed with B because the control/height budgets depend on it. D adds stable desktop legend height; phone legends scroll horizontally rather than consuming the reading pane.
- D2 keeps schematic optical connections dashed and without traveling photon heads where no optical prescription exists. Physical light routes receive luminous ribbons; arbitrary bends are not presented as traced rays.
- E3 keeps GEO ground patches Earth-fixed, as geostationary geometry requires. The LEO subpoint moves. Antenna motion, gas motion, alert graphics, colors, and presentation time are generic illustrations.
- F7 retains the background-animation preference in More so users can pause motion without introducing another transport.
- F8–F10 are unchanged and await Reed's decision. Other audit items outside the requested subset are not claimed as completed.
- Dedicated built previews on ports 47601/47604/47605/47606/47607 isolate the groups. Reports record the actual preview URL and reject stale or scoped results.
- The coplanar gate previously compared different vertices on tilted surfaces, incorrectly reporting separated surfaces as overlapping. It now compares actual planes at the same sample location without relaxing area or distance limits. Four regression fixtures cover real overlaps and separated tilted planes; all five builds pass the 30 scene/layer checks.
- Performance runs wait until the functional suites are quiet, then run one build at a time on the RTX 5090. Earlier corrected failures remain visible in raw logs; final acceptance validates the latest full-scope JSON results against the frozen build.

Independent usability, engineering, and visual reviews found and resolved clipped alert text, dimmed cooling hardware, a miscolored cold-head thermometer, phone navigation overlap, stale tab semantics, and nonrepresentative first-phase playback. Screenshot rereview confirms the alert and phone plume/payload framing corrections. A minor atmosphere-base overlap with the phone Back control remains a review observation; its pins and learning content remain accessible.

The comparison pages are saved under `.local/audit-1004/`, with `review.html` as the index. All 226 screenshot references resolve. They pair the original audit images with revised desktop and phone captures; source screenshots in `research/audit-2026-10-04/` were preserved.

Acceptance recovery retained completed reports after the interrupted process tree stopped. One Controls desktop performance attempt was rejected for a missing ABI heat-animation progress bin despite meeting the frame budget. Its JSON is retained locally as `perf-desktop-incomplete-coverage-1004.json`. The complete unchanged rerun passed; neither coverage requirements nor performance limits were relaxed.

The final tested build digest is `14c39f2a269217bfa2dcdbb34f1b923991b5d8b594bd54e1c138159090a3fc35`, tested at `http://127.0.0.1:47607/`. Runtime sources and assets must match that accepted implementation after integration.
