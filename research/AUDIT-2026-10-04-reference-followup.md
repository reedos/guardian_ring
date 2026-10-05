# Reference browsing and photon-level Earth

Requested 10/04/2026. Both builds accepted 10/05/2026. No push or deployment is included in this change.

## F8–F10

Branch `codex/audit-1004-reference-browsing`; implementation commits `9fb8997`, `0d0aacf`, `0063c30`, and `e5b26c7`; gate updates `5e5a111`, `5292922`, `841ffb1`, `6e3c21d`, and `18301f4`.

- **F8:** Keep the complete Parts reference. Assemblies start collapsed, search opens matching assemblies, and component/diagram fragments reveal their enclosing sections. The level jump navigation and all evidence links remain available.
- **F9:** Keep every claim and source record. Evidence search precedes the register explanation. Claims are grouped into collapsed levels with jump links. Each group and the source register use pages of 12 results. Searching opens matching groups; citations reveal the correct results page even when a conflicting search previously hid it. The complete static reference remains present without JavaScript. A new search clears an obsolete, conflicting fragment so Back from a formula or evidence record preserves the search; desktop and phone regression checks cover both paths.
- **F10:** Use the audit's minimum option: hide Atmosphere's Light/Data/Heat switches, sequence explanation and activity caption; Next only inspects its components. Ambient motion retains the shared motion preference. Existing shared layer links and their technical content remain supported. ABI and TIRS-2 remain distinct civil instruments rather than being combined into a potentially misleading common instrument.

The reference gate checks initial disclosures, search, conflicting-search fragments, exhaustive pagination of the spacecraft evidence group, empty states, content retention, horizontal overflow, and Atmosphere's removed controls on desktop and phone. Activity coverage retains all historical Atmosphere modes through the scene API while explicitly checking that removed switches are absent; other levels still use real layer buttons.

The current reference build passes the control-count and stage-height checks: 20 initial desktop controls and 9 phone controls; the smallest measured stage is 69.90% of viewport height on desktop and 45.22% on phone. The phone minimum includes the open Parts sheet. The default Evidence page measures 4,924 px on desktop and 6,937 px on phone while retaining all 941 claims.

Typecheck, 260 unit tests, and strict claims passed before each implementation commit: 0 problems across 941 site claims, 90,240 scenario instances, 96 scenarios, and 253 research facts. All 40/40 current-build browser gate commands passed; see [reference acceptance](audit-2026-10-04-gates-reference.md). Both exhaustive scenario sweeps cover 22,752 selections, and desktop and phone camera checks cover 2,179 states each. Performance passed 179 conditions per form, with worst p95 of 1.60 ms desktop and 1.50 ms phone viewport. Initial checks caught obsolete expectations for removed Atmosphere captions and a camera helper that still clicked the old sequence buttons. These were updated to check the remaining legend and to measure the actual teaching-step camera route, without reducing geometry or timing coverage. A repeated phone new-tab test also needed to use the menu’s disclosure state rather than its transient visibility during CSS closing; both desktop and phone reruns passed.

## Photon-level Earth

Branch `codex/photon-earth`; implementation commits `7178104` and `224c1c8`, with the reference fixes carried forward through `d66cde0`.

Reuses the ring's Blender-authored Earth and credited historical NASA imagery beneath the rising plume. A thin atmospheric rim establishes the curved horizon. The enlarged molecular diagrams have a dark inset backing. Earth, plume, atmospheric thickness and molecules use separate illustrative scales; no event location is plotted. Updated story stills come from the same runtime scene.

No GLB was rebuilt: existing `plume.glb?v=3` and `earth-orbits.glb?v=4` are reused unchanged. The still-input manifest now includes the Earth asset hash. Earth surface imagery is identified as historical; it does not represent a current observation. The plume remains original procedural imagery.

Typecheck, 260 unit tests, and strict claims passed before the implementation commit. All 40/40 current-build browser gate commands passed; see [Earth acceptance](audit-2026-10-04-gates-photon-earth.md). The final report reran typecheck, all 260 unit tests, and the strict evidence audit (0 problems). Both performance forms passed all 179 conditions at 1.50 ms worst p95; budgets remain 15 ms desktop and 7 ms phone viewport. Performance ran one build at a time after all functional work finished.

## Visual comparisons

The before/after gallery is retained privately at `.local/audit-1004/reference-review.html`
and is not included in this public repository. It pairs 1440 × 900 desktop and 390 × 844 phone-viewport captures with the matching audit screenshots:

- `d-page-parts.png`, `p-page-parts.png`
- `d-page-evidence.png`, `p-page-evidence.png`
- `d-lvl9-atmosphere-light.png`, `p-lvl9-atmosphere-light.png`
- `d-lvl5-plume-light.png`, `p-lvl5-plume-light.png`

Phone captures use browser emulation on the workstation, not a physical phone performance measurement. The original audit screenshots remain unchanged. No push or deployment is authorized by this acceptance record.
