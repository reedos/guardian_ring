# Guardian Ring review build

10/01/2026. The component-anatomy revision passed full built-preview acceptance. Reed's device review and separate launch decision remain open.

## Current scope

Six pages connect the story, Explorer, Evidence, Method, Glossary, and searchable Parts reference. Ten Blender-authored scenes cover the ring, spacecraft, payload, focal plane, detector element, molecular emission, ground segment, ABI, TIRS-2, and atmosphere. Each has Light, Data, and Heat views with evidence and drawing assumptions.

The spacecraft has twelve selectable parent assemblies, the payload thirteen, and the focal plane eight. Together with the other levels, that is 162 parent states across the three layers. Nested anatomy names the actual components within each assembly, explains their functions, and attaches evidence. The Explorer and Parts page use the same catalog; repeated appearances are not additional hardware counts.

Payload v7 exposes scan mirrors, motors, encoders and bearings; port-cover and focus mechanisms; calibration references; stationary aft optics; and separate sensor, instrument, interface, power, and cooling electronics. Focal-plane v4 separates the detector/ROIC package, warm video electronics, bias/timing interface, cold-head thermometer, and cooler feedback. Shapes, package layouts, wiring, and dimensions remain representative. The spacecraft, payload, and focal-plane story stills are rendered from their shipped GLBs.

Three cited system diagrams explain selected GOES-R support paths, ABI instrument paths, and TIRS-2 interfaces. Their component names and evidence come from the same catalog. They distinguish light, data/control, electrical power, heat, and mechanical motion without presenting circuit schematics or complete wiring diagrams.

The admitted research ledger contains 210 facts, including the comprehensive component review and the separate TIRS-2 architecture review. The GOES-R Data Book supplies named civil hardware; additional NASA sources support grounding, mechanical isolation, and the TIRS-2 design. See `COMPREHENSIVE-SYSTEMS-REVIEW.md` and `tirs2-architecture-review.md` for exact scope and access outcomes.

## Validation status

Final typecheck passed, all 81 unit tests passed, and the strict evidence audit found 0 problems across 667 site claims, 96 scenarios, and 210 research facts. All 16 browser gate commands passed against the same production build. `gate-results.md` records the build hash and detailed results, including 1,320 camera routes on each form and 15,552 states in each exhaustive scenario/parts sweep.

The completed checks cover every scenario, parent part, and ordered camera route, plus evidence dialogs, component anatomy, Parts search/navigation, responsive diagrams, saved comparisons, renderer quality, and performance. Real GPU checks used Chrome on Reed's RTX 5090. Worst p95 frame time at maximum quality was 0.90 ms desktop and 0.80 ms phone. Phone-sized browser checks do not replace testing on an actual phone.

## Supported scope and gaps

Public civil specifications stay attached to GOES-R, ABI, or TIRS-2. The TIRS-2 architecture source describes a 2018 design, not an as-built bill of materials. General calculations cover orbital geometry, vacuum propagation, ideal diffraction, and ideal blackbody radiation; they do not estimate detector counts or warning latency.

The reviewed sources do not establish ABI aperture, a standalone detector data rate, analog-amplifier topology or gain, ADC precision or package layout, cooler compressor internals, detailed vibration cancellation, connector pinouts, or mission-specific shielding and harness construction. These gaps are not filled with invented specifications. Generic bus voltage, array power, battery capacity, propulsion rating, recorder capacity, and instrument temperature are also unassigned.

Real plume intensity, quantitative atmospheric transmission, military hardware detail, operational coverage, and sensor detection performance remain outside the model. HBTSS and operational constellation positions are excluded. Sources that could not be opened remain unchecked and support no claims.

## Publication

Reed authorized a public repository and GitHub Pages review; launch requires a separate call. Keep noindex/nofollow and the crawler block. Share a verified review URL only in this chat, not in the public README, repository homepage field, portfolio, or sitemap. Public Pages has no sign-in restriction.
