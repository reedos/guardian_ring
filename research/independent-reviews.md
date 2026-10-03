# Independent review dispositions

10/03/2026. Reed requested separate usability, physics, and visual-impact
reviews before acceptance of the expanded mission and layer-activity work.
This ledger combines the reviewers' findings and root integration dispositions.
Its independent review scopes are distinct from the completed full-build browser acceptance recorded below. The prior
`visualizer-DoRoxR9l` run stopped with eleven of twenty-six browser commands
complete and is recorded as superseded. The idle local GPU model was restored
after the temporary diagnostic unload.

## Usability

| Independent finding | Disposition |
| --- | --- |
| Changing Light, Data, or Heat left the scene still until another Play action. | Level entry and layer changes offer repeating activity; explicit pause and reduced-motion choices remain effective. Ordered Play sequence remains a separate one-shot lesson. |
| Pausing the day and then choosing Follow could restart orbital motion. | Follow preserves requested motion intent, including changes made during the entry flight. |
| A reduced-motion mission lacked useful manual phase stepping. | The mission provides explicit phase steps and stationary explanatory snapshots. |
| The guided mission hid its step explanation, legend, and evidence. | The mission exposes an About disclosure with the current description, typed legend, and evidence chips. |
| The phone mission entry was hidden in More, and follow controls were difficult to find. | Watch the mission is visible in the initial Ring view; compact scrolling controls improve access without removing the More entry. Short hardware views retract the invitation only when their measured budget cannot fit it. |
| Sharing a followed orbit lost the follow context. | Follow state is serialized and restored through Explorer URLs. |
| The final desktop UI gate found that selecting the Ring's sunlight card could leave its marker hidden when the physically drawn sunlight path was blocked. | Selected sunlight and downlink markers now remain attached to their actual solar/radio component ports when the path is absent. Blocked streams remain absent; hidden GEO hardware still clears dependent selections. The independent usability reviewer checked the source correction, and an intermediate rebuilt desktop UI passed 264 checks. The frozen candidate separately passes both full UI gates. |
| The subsequent phone UI run recorded 172 failure instances involving nested scrolling and short-viewport controls. | Shared causes were an inherited 68 px anchor margin in nested scrollers and a retained 45 px mission-entry row/Follow disclosure budget in short viewports. Scoped scrolling and revised inspector budgets passed nine focused phone/landscape cases; the superseded `visualizer-c2UIQPxM` then passed 287 phone and 264 desktop UI states. Its later expanded default-running checks exposed further overflow, recorded below. The failed `visualizer-DIhjYqe1` report and c2 passes are preserved. |
| Fresh default-running Payload and ABI views overflowed short phones even with notes closed. | The live phase title now serves as the portrait disclosure summary, compact spacing removes unused gaps, and the mission invitation retracts according to measured space. Canvas/reading-pane minima and running motion remain intact. Coverage includes closed/open notes, Parts/Scenario, later wrapped phases, enclosure controls, 390×667, 320×667, 320×721, and landscape. Current `visualizer-r94RjGs4` UI phone passes all 323 states with zero problems. |
| Mission transport, explanation, Repeat, and evidence-chip targets were too short on phones and coarse-pointer landscape devices. | Their minimum touch height is now 44 px; evidence values and basis labels remain associated. Focused touch/layout checks and the expanded 323-state phone gate pass. The corrected-barrier desktop UI rerun also passes. No unresolved P1/P2 usability finding is confirmed in the completed review scope; the full local acceptance suite also passes. |
| Layer-click pin geometry needed investigation before sampling immediately after a UI change. | Twelve immediate and twelve two-animation-frame probes found no confirmed application pin defect. The layer-click tests now allow bounded render settling before geometry inspection. Visibility, containment, selection, and layout assertions are unchanged; no acceptance condition was removed. |

Relevant implementation: `src/app/stage.js`, `animation-controls.js`,
`mission-tour.js`, `orbit-controls.js`, `explorer-url.js`, and `src/styles.css`.
The usability reviewer supplied these findings and implementation dispositions;
root owns their final browser validation.

## Physics and engineering meaning

| Independent finding | Disposition |
| --- | --- |
| ABI collection paths bypassed its scan faces and crossed telescope disks with inconsistent reflection directions; the representative payload also had inconsistent relay bends. | Full routes are now static dashed component connections with an explicit non-ray label. Local moving-mirror demonstrations retain actual specular reflection. No flight optical prescription was invented. |
| ABI's local reflection interaction sat at its pivot inside the backing. | Corrected the exterior face offset. CPU tests raycast the actual loaded reflective mesh at rest and both motion extremes, then compare the displayed reflection with the mesh normal. |
| TIRS-2 returned instantly from its space reference during readout. An initial repair also jumped when playback began from inspection. | Reference poses now hold through readout and transfer. An explicit return-to-Earth phase restores the rest pose before repeat. Tests use the real lesson list and cover initial entry, all phase boundaries, and repeated playback. |
| Fresh independent review found that TIRS-2's traveling light marks retained the same outgoing bend while the scene-select mirror changed orientation. | Full TIRS-2 routes now use functional optical connections without traveling heads or marks. Explicit Earth/space direction endpoints and the onboard-blackbody anchor lead through the scene selector, telescope, filters, and arrays. Only the selected reference appears; blackbody/space connections wait for the mechanism to settle. Ten targeted optical-routing and mechanism tests passed. The targeted desktop/phone visual recheck confirmed the connections and legend. |
| Orbital light, sunlight, radio, and thermal paths all attached to the spacecraft center despite magnified component geometry. | Earth-orbits v4 adds authored component ports and a shared proxy with 3,566 triangles per proxy across twelve instances. Bounds, transforms, and orbit guides remain unchanged. Independent CPU raycasts confirmed actual face normals and clear optical, radio, and radiator paths through sampled motion. Targeted follow samples were inspected; the full current-build browser suite now passes. |
| The rebuilt solar connection can pass through the GEO bus near grazing sunlight. | An actual-triangle audit found self-occluded sunlight despite passing the front-face and Earth checks. The integrated finite-segment helper suppresses blocked connections; actual-asset regressions pass. Root owns the final browser validation record. |
| Molecular Data modes reused Light explanations; atmosphere had no Data route. | Both Data programs now use an isolated event-order timeline, not a fictional cable or operational data link. Atmosphere explicitly uses contextual Overview framing. |
| The first atmospheric timeline placement was hidden partly behind the ground disk; its first repair was geometrically clear but too low in the browser. | Raised and oriented it toward the overview camera. CPU raycasts found no obstruction and calculated desktop/phone projections remain inside the viewport. Those independent checks establish geometry and projection; the completed full-build browser gates are recorded separately below. |
| Legacy component highlights colored commands, feedback, and digitization as generic detector signals. | Root now derives legacy highlight kinds from their explanatory phase; new spacecraft/ground bindings explicitly name their kinds. Current shared Light/Data phases describe the same operation. Future phase-name reuse for a different meaning needs explicit scope. |

Details, source access outcomes, geometric calculations, and focused verification
are in [the physics review](independent-review-physics.md). No military sensor
performance, operational coverage, or real mechanism timing was inferred.

## Visual communication and hardware activity

| Independent finding | Disposition |
| --- | --- |
| Hardware ignored its requested look and runtime capped authored metalness, flattening material distinctions. | Root integrated cached IF-style studio reflection lighting and preserved authored material values. |
| Ground paths were too faint and small, with routes buried against equipment. | Root lifted the authored teaching routes and added typed emphasis on their receiving component roles. These effects identify activity, not telemetry or equipment health. |
| Orbital follow views magnified a blocky proxy that lacked useful component attachment points. | A more detailed shared orbital v4 asset and component ports are integrated; its hardware remains representative and explicitly magnified. CPU validation preserves the prior bounds and checks actual attachment surfaces. |
| Fresh visual review found the followed LEO spacecraft too small beside the moving Earth. | Closer follow framing makes the spacecraft legible while retaining Earth, the nadir reference, and the light stream. The `visualizer-qrerZ5fz` desktop/phone recheck resolved this finding. |
| Natural payload activity competed with thirteen pins, a small phone canvas, and a lower note. | Closer desktop/phone payload presets, a smaller closed phone inspector, and suppression of unselected pins during activity expose the scan assembly and boards. The targeted recheck confirmed visible phase advancement and clearer composition; no additional overview enlargement was requested. |
| Selected phone callouts obscured useful component detail. | Authored component exclusion regions resolved the focal-plane readout case. The final phone scan-mirror recheck on `visualizer-Vz3m3Uh3` confirmed the name remains visible above both mirrors and clears the hardware and reflection strokes. Placement now reserves the actual moving assemblies without changing the camera. The cooler-controller case was inspected and was not a separate blocking finding. |
| Motion was limited and difficult to notice in normal exploration. | Repeating layer activity exposes the existing payload/ABI scan mechanisms and TIRS reference selection. Only supported mechanism groups move; enclosures, fixed supports, and harnesses do not acquire fictional motion. |
| Excess pins competed with the guided subject. | Inactive pins are hidden during the mission while deliberate exploration remains available. |
| Layers had similar visual grammar despite representing different processes. | Typed streams, functional optical connections, and phase-appropriate material emphasis distinguish optics, command/feedback, image data, electrical power, heat, and radiation. |
| Atmospheric Data appeared empty. | Added the separate event-order timeline, checked for geometric visibility as described above. |

Relevant implementation: `src/scenes/model-scene.js`, `teaching-flows.js`, the
scene configuration files, mission pin handling, and the orbital Blender asset.
The visual reviewer supplied these findings and root integrated the dispositions.

## Fresh independent review record

The fresh visual review inspected `visualizer-CW9rvaCq` from 2:04 a.m. Pacific on
10/03/2026, then performed a targeted recheck of `visualizer-qrerZ5fz`, built at
2:14:56 a.m. Pacific. The recheck reported no console/page errors and released
its browser/GPU lease. Its screenshots and state metadata remain in
`.local/final-cinematic/review.md` and the accompanying capture folders. This is
sampled visual evidence, not the complete acceptance inventory.

The fresh usability reviewer completed first-time desktop and phone journeys
through the story, guided mission, pause and chapter controls, sources, orbital
follow, layer switching, detail inspection, side visits and Back, embedded
references, and pinned scenario comparison. That sampled walkthrough found no
new confirmed P1/P2 defect; subsequent automated UI gates exposed the
sunlight-marker and phone scrolling/layout issues recorded above. Minor discovery costs remain: the phone
story's mission call to action sits below its initial fold, Follow is inside the
motion disclosure on phone, and expanded mission explanations can require
scrolling to transport controls. The top-level Explorer entry stays visible.
The review artifacts remain in `.local/reviews/final-usability/review.md`.

The final scan-mirror recheck on `visualizer-Vz3m3Uh3` reported no browser errors
and resolved the remaining annotation finding. No finding remains open within
that reviewer's sampled visual scope. A separate phone payload label check
passed 42 states, including independent projection of actual mesh vertices.

The cinematic reviewer then inspected ten saved desktop and phone frames from
the frozen `visualizer-r94RjGs4` build and found no new P1/P2 visual regression.
These cover payload activity, orbital follow, ground processing, and reduced
motion. This was a saved-frame review, not a new timing or lifecycle test; it
does not add a new selected scan-system or sunlight-marker closeup check.

The independent education and engineering review found no P1 issue. Its one
confirmed P2 was the TIRS-2 optical-path inconsistency corrected above. The
review checked authored geometry, signal meanings, energy accounting, physical
calculation boundaries, and lesson order. Useful learning outcomes remain GEO
co-rotation; separate commands and measured feedback; the detector's optical,
electrical, and thermal interfaces; readout before digitization and packet
transport; cooler heat rejection including input work; and the distinction
between molecular emission and atmospheric transmission. None establishes
military sensor performance or operational timing.

## Acceptance boundary

The latest completed CPU checks pass typecheck and 232 tests across 39 files.
The strict evidence audit reports zero problems across 941 site claims,
90,240 scenario instances, 96 scenarios, and 253 research facts. These checks
do not verify browser composition, responsive controls, GPU performance, or
camera motion across the complete application. Orbital attachments have received
an independent CPU geometry review, and root integrated the solar visibility
correction. The accepted frozen build is `visualizer-r94RjGs4.js` with
`visualizer-D8YZzmoH.css`, built at 3:19:02 a.m. Pacific on 10/03/2026 from local
branch commit `301e677`. `BUILD-REVIEW.md` records its build hash. Full UI phone
passes 323 states with zero problems, and desktop UI passes 264. All 28
full-scope browser commands pass, including 2,091 flights on each form. Cycle
and Parts each pass 22,752 states across 96 scenarios; cycle textures stay at
57 through all 96 rebuilds. The generated [acceptance record](gate-results.md)
validates the frozen build with fresh typecheck, tests, and evidence audit.
Remote deployment remains pending.

Current-build Activity passes 861 states on each form. Learning passes 359
desktop and 367 phone states; Performance passes 179 on each, with worst p95
frame times of 9.7 ms desktop and 1.2 ms phone. The phone performance pass used
a controlled run with an idle local GPU model temporarily offloaded and then
restored. The original tail-stall failure remains in review history. No
performance tolerance was relaxed, and this is not an application optimization
claim.

The approximately 2:15 a.m. Pacific partial activity attempt against
`visualizer-qrerZ5fz` failed a page-lifecycle check and is superseded by the
corrective build. Diagnosis showed Playwright's default target-session focus
emulation prevented Chrome from actually freezing the page. The activity gate
now uses an isolated headless Chrome connection without that override and
records real visibility, freeze, and resume events. Short and long suspensions
passed on desktop and phone in the `visualizer-BSVqp9gI` diagnostic build, with
zero lesson advancement while frozen. The later `visualizer-Vz3m3Uh3` checks
confirmed real 250 ms and 1,250 ms freezes on both forms, zero elapsed lesson
time while suspended, and normal motion after thaw. Device checks retained
phone DPR 3 with matching screenshot dimensions. The application also handles
explicit freeze/resume events and resets its presentation clocks. These tests
also pass in the frozen candidate's desktop and phone Activity gates; no timing
tolerance or performance budget changed.
The failed attempt remains diagnostic history.

The first current-candidate desktop UI attempt failed its five-second layout
barrier before any audited state. Root's animation capture identified the
authored `hint-out` animation's ten-second delay and 800 ms fade. The helper now
waits at most fifteen seconds, retaining every finite animation and all existing
assertions. This correction changes neither the app nor the build. The failure
and capture remain in `.local/reviews/final-usability/ui-desktop-r94-layout-wait-failure.json`
and `.local/layout-wait-diagnostic.json`; the desktop UI rerun now passes. The
Learning fixture also now matches the intended default live activity instead
of expecting paused entry. Its existing assertions pass on both forms without
an app change. The updated reviewer record is `.local/reviews/final-usability/review.md`.

The integration owner completed all twenty-eight serialized real-GPU commands
against `visualizer-r94RjGs4` and regenerated the acceptance record against its
unchanged build hash. Historical passes and failures remain preserved separately.
Reed's device review, remote deployment, and separate launch decision remain
open; noindex stays enabled.
