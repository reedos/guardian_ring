# Independent review dispositions

10/03/2026. Reed requested separate usability, physics, and visual-impact
reviews before acceptance of the expanded mission and layer-activity work.
This ledger combines the reviewers' findings and root integration dispositions.
It is an implementation review, not current-build browser acceptance. The prior
`visualizer-DoRoxR9l` run stopped with eleven of twenty-six browser commands
complete and is recorded as superseded. Ollama was restored after the earlier
temporary diagnostic unload.

## Usability

| Independent finding | Disposition |
| --- | --- |
| Changing Light, Data, or Heat left the scene still until another Play action. | Level entry and layer changes offer repeating activity; explicit pause and reduced-motion choices remain effective. Ordered Play sequence remains a separate one-shot lesson. |
| Pausing the day and then choosing Follow could restart orbital motion. | Follow preserves requested motion intent, including changes made during the entry flight. |
| A reduced-motion mission lacked useful manual phase stepping. | The mission provides explicit phase steps and stationary explanatory snapshots. |
| The guided mission hid its step explanation, legend, and evidence. | The mission exposes an About disclosure with the current description, typed legend, and evidence chips. |
| The phone mission entry was hidden in More, and follow controls were difficult to find. | Watch the mission is visible on phones; compact scrolling controls improve access without removing the More entry. |
| Sharing a followed orbit lost the follow context. | Follow state is serialized and restored through Explorer URLs. |

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
| Orbital light, sunlight, radio, and thermal paths all attached to the spacecraft center despite magnified component geometry. | Earth-orbits v4 adds authored component ports and a shared proxy with 3,566 triangles per proxy across twelve instances. Bounds, transforms, and orbit guides remain unchanged. Independent CPU raycasts confirmed actual face normals and clear optical, radio, and radiator paths through sampled motion. Targeted follow samples were inspected; full browser acceptance remains pending. |
| The rebuilt solar connection can pass through the GEO bus near grazing sunlight. | An actual-triangle audit found self-occluded sunlight despite passing the front-face and Earth checks. The new finite-segment helper suppresses blocked connections; actual-asset regressions pass. Root owns runtime wiring and browser validation. |
| Molecular Data modes reused Light explanations; atmosphere had no Data route. | Both Data programs now use an isolated event-order timeline, not a fictional cable or operational data link. Atmosphere explicitly uses contextual Overview framing. |
| The first atmospheric timeline placement was hidden partly behind the ground disk; its first repair was geometrically clear but too low in the browser. | Raised and oriented it toward the overview camera. CPU raycasts found no obstruction and calculated desktop/phone projections remain inside the viewport. Final screen-space legibility still needs browser inspection. |
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

The final scan-mirror recheck on `visualizer-Vz3m3Uh3` reported no browser errors
and resolved the remaining annotation finding. No finding remains open within
that reviewer's sampled visual scope. A separate phone payload label check
passed 42 states, including independent projection of actual mesh vertices.

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

The latest completed CPU checks pass typecheck and 229 tests across 39 files.
The strict evidence audit reports zero problems across 941 site claims,
90,240 scenario instances, 96 scenarios, and 253 research facts. These checks
do not verify browser composition, responsive controls, GPU performance, or
camera motion across the complete application. Orbital attachments have received
an independent CPU geometry review, and root integrated the solar visibility
correction. Final CPU counts and build identity remain with root integration.

The approximately 2:15 a.m. Pacific partial activity attempt against
`visualizer-qrerZ5fz` failed a page-lifecycle check and is superseded by the
corrective build. Diagnosis showed Playwright's default target-session focus
emulation prevented Chrome from actually freezing the page. The activity gate
now uses an isolated headless Chrome connection without that override and
records real visibility, freeze, and resume events. Short and long suspensions
passed on desktop and phone in the `visualizer-BSVqp9gI` diagnostic build, with
zero lesson advancement while frozen. The application also handles explicit
freeze/resume events and resets its presentation clocks. These tests must pass
again against the final build; no timing tolerance or performance budget changed.
The failed attempt remains diagnostic history.

The integration owner must freeze a new built preview, run all twenty-eight serialized
real-GPU commands, inspect desktop and phone results, and refresh the gate record
against that exact build. Historical passes remain preserved and are not
substitutes for those checks. Reed's device review and separate launch decision
remain open.
