# Independent physics and optical-motion review

Reviewed and revised 10/03/2026. Scope: public engineering explanations, the
representative hardware drawings, local mechanism animation, and the separate
mathematical examples. No military sensor performance, operational trajectory,
coverage, or timing was inferred.

## Optical findings and correction

The previous ABI collection animation used a component-selection anchor between
its scan mirrors as a ray bend. It then sent traveling light through a sequence
of parallel telescope disks whose normals did not agree with the outgoing
segments. The representative payload had a similar mismatch at its tertiary
relay. These were geometric contradictions in the teaching drawing, regardless
of whether the drawing reproduced a flight instrument.

For the original ABI first telescope disk, the disagreement between its specular
reflection direction and its outgoing drawn segment was 163.3 degrees **Calc.**
The corresponding payload tertiary disagreement was 21.2 degrees **Calc.**
These are internal drawing audits, not instrument quantities. Basis: normalize
the incoming and outgoing vectors from the original scene coordinates; reflect
the incoming vector using `d_reflected = d - 2(d dot n)n`; compare its angle with
the outgoing segment. The normals came from `build-abi.py` and
`payload-expansion.py`, respectively. The source coordinates remain recoverable
from Git history; these invalid routes have been removed.

The revised full-instrument overlays connect named component-role anchors with
an explicit `optical-connection` type. They are dashed, static functional
connections, not traced rays. They have no traveling photon heads, arrowheads,
or trails. The lesson copy and legend distinguish them from the separate local
reflection demonstration. The collection and calibration routes in the ABI
lesson are selected separately. This corrects the teaching claim without
inventing an ABI or military optical prescription.

The moving scan-mirror demonstration remains a real local reflection calculation.
Its declared normal and interaction point now live in `optical-routing.js` beside
the functional route metadata. ABI previously reflected at the mechanical pivot,
inside its backing. Its exterior offset is now 0.0785 **Assumed, drawing units**,
derived from the existing authored placement, `0.061 + 0.035 / 2`. Payload keeps
its existing offset of 0.067 **Assumed, drawing units**, from
`0.059 + 0.016 / 2`. These values locate the drawn surfaces; they are not physical
dimensions or specifications. No GLB was regenerated, and model URL versions
were not changed.

## Verification

The new `optical-routing.test.ts` loads the actual ABI and payload GLBs. For every
declared scan-mirror demonstration, at rest and both motion extremes, it raycasts
the authored reflective mesh, checks that the declared interaction lies on the
exterior face, and checks reflection against the actual mesh surface normal.
The initial focused run passed both asset tests. This would have rejected the
old ABI pivot offset.

The same test file verifies that functional optical connections resolve to
authored anchors, never display moving heads or trails, and keep the ABI
collection and calibration selections separate. After integration of the shared
flow type, all 14 tests in `optical-routing.test.ts`, `teaching-programs.test.ts`,
`mirror-demo.test.ts`, and `mechanism-assets.test.ts` passed. TypeScript passed.
The claims audit reported zero problems across 941 site claims, 96 scenarios,
and 253 research facts. These results describe the focused revision at this
point; the integration pass owns full-suite and browser acceptance.

Data lessons for the plume and atmosphere now describe an isolated event-order
timeline instead of reusing their Light-layer propagation lesson. The timeline
does not depict a cable, real data link, trajectory, or physical event duration.
The atmosphere timeline has an explicitly contextual Overview focus. Its first
placement was partly hidden by the ground disk; it now lies outside that disk.
CPU raycasts of the actual GLB from both authored overview cameras found no
opaque obstruction at the sampled timeline points. This verifies geometry,
not browser layout or screen-space legibility.

The independent follow-up found that the first TIRS continuity correction joined
adjacent phases and the repeating boundary but jumped from inspection into its
first Earth phase. The completed correction holds the Earth pose at entry, holds
the space reference through readout and transfer, and adds an explicit
return-to-Earth phase. That return restores the initial pose before repeat. The
return phase has no optical propagation activity. Tests use the actual TIRS
teaching program to check adjacent boundaries, inspection entry, and repeated
playback, rather than a separate test-only phase list.

The satellite and ground component-emphasis bindings were checked against their
current Light, Data, and Heat programs. Shared Light/Data phase names describe
the same radio or data operation. Heat phases use electrical, heat, or radiation
colors and restore other components to their original materials. The helper
currently keys bindings by phase rather than by mode; future reuse of a phase
name for a different operation needs an explicit scope or a distinct phase ID.
The review also flagged legacy string bindings that used a generic
detector-signal highlight color for command, feedback, and digitization. Root
integration now derives the default highlight kind from the explanatory phase.

The follow-up focused run passed all 30 tests in `mechanism-pose.test.ts`,
`teaching-flows.test.ts`, `teaching-focus.test.ts`, `optical-routing.test.ts`, and
`teaching-programs.test.ts`. TypeScript passed. The static-connection regression
checks playback, inspection, phase changes, and layer changes for unchanged
geometry with no photon heads, arrowheads, or trails.

## Independent orbital-asset follow-up

The rebuilt orbital v4 GLB was decoded on the CPU into its actual triangle
geometry, without a browser, texture decoding, or GPU. Inward raycasts from
each authored port reached the intended optical entrance, antenna patch,
array face, or radiator segment. All declared outward normals agreed
with the actual surface normals. The optical port is deliberately at the
open entrance plane ahead of its recessed face, rather than on a solid disk.
The solar port lands over a narrow drawn collector stripe; it still identifies
the array face, but a future asset revision can place it on adjacent coverglass.

The audit sampled the runtime's actual attitudes, Earth rotation, orbit
positions, port transforms, and follow magnifications over one illustrative
day. Every shown optical, radio, crosslink, and radiator backbone cleared the
active spacecraft at the sampled states. Straight paths and outward radiator
direction are consistent with their schematic meanings. These are drawing
checks, not physical dimensions, exposure, antenna patterns, or link analysis.

The incoming solar backbone did pass through the GEO spacecraft body at
near-grazing angles. Its original predicate tested the array's front hemisphere
and Earth clearance, but not spacecraft self-shadowing. The CPU calculation
sampled 721 times in each view; 27 of 360 shown sunlight samples intersected the
body in both overview and GEO follow. The first occurred at illustrative elapsed
time 42.29067 seconds, at spacecraft-local point
`[0.039, 0.0376545, -0.00771849]` on the structure. These are Calc. drawing
values from the actual GLB and runtime transforms, not real spacecraft
coordinates or timing.

The correction is `createSurfacePathClear` in `surface-path.js`: a cached,
finite-segment raycast against actual spacecraft hardware, excluding teaching
overlays. It omits the first and last millionth of a drawing unit to allow
surface endpoint contact; this is a numerical drawing tolerance, not a physical
clearance. Its three passing regressions check actual GLB surface normals and
port offsets, finite segments and endpoint contact, and suppression of the
grazing-sun obstruction through both GEO magnifications. Root owns runtime
wiring and final browser validation.

The atmosphere timeline was subsequently raised and turned toward the overview
camera because the earlier geometrically clear route lay below the browser's
visible region. The latest route again passed actual-geometry raycasts. Its
calculated projections also lie inside desktop and phone viewports at the
tested aspect ratios. These checks do not replace inspection of the actual
canvas layout and overlays.

No browser or GPU verification was performed by this reviewer. The numerical
orbit and radiometry implementation was inspected separately and did not show
an analogous defect: its physical examples remain independent of compressed
scene coordinates and real sensor performance.

**Current review status:** these corrections are verified at the source and
CPU-test level. Current-build real-GPU browser acceptance remains pending. Prior
build passes do not validate the expanded independent-review revision.

## Source check

**Verified, opened 10/03/2026:** [NASA, Basics of Space Flight, Chapter 6:
Electromagnetics, Reflection](https://science.nasa.gov/learn/basics-of-space-flight/chapter6-5/).
The section supports straight propagation in the relevant elementary model and
equal incidence/reflection angles. The correction uses this general physical
principle, not a real instrument's prescription.

**Unchecked recheck, unused:**
`https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf` returned
403 Forbidden on this review's open attempt. No retry or alternative fetch was
made after that response. This attempt does not revoke an earlier independently
verified local source record, but supplies no new evidence here.

**Unchecked recheck, unused:**
`https://www.goes-r.gov/downloads/resources/documents/GOES-U%20DataBook.pdf`
redirected to NOAA's general Geostationary Satellites page rather than opening
the requested document. Search-extracted text from that PDF was not admitted
as evidence.
