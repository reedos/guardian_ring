# Continuous activity and scan optics — 10/05/2026

## Interaction change

Camera rotation, pan, wheel zoom, and touch gestures preserve the reader's playback choice. A gesture releases a guided camera and mission navigation; an already running activity continues. Explicit Pause, reduced motion, source-reading holds, and lifecycle suspension remain in effect. Manual Next retains its existing once-through activity.

## Demonstrations

The existing ideal parabolic focus demonstration now includes optional surface normals. Four additional mathematical diagrams explain reflection at one scan mirror, one-axis steering, two-mirror steering, and command/position-feedback roles. These are separate projected diagrams, not physical hardware meshes or a real payload optical prescription. No GLB changed.

Calc. geometry uses normalized vectors and d′ = d − 2(d·n)n. A ray is intersected with the second mirror plane and a direction screen. Reversing the solved vertices shows incoming scene light entering a fixed telescope entrance. In one plane, rotating a mirror by θ changes the reflected direction by 2θ: the normal rotates by θ and the two angles about it remain equal. This scalar relationship is not applied independently to a two-axis system; that diagram calculates both reflections.

Assumed drawing choices include mirror spacing, finite apertures, angular excursions, colors, trails, packet count, and playback pace. The two-axis excursion stays within the drawn second mirror aperture throughout its loop. Animated light follows instantaneous quasi-static paths; its pace is not physical transit time. The direction screen is neither a ground footprint nor an image plane. The feedback diagram communicates roles only: it does not calculate servo error, lag, settling, or a scan schedule.

## Public evidence

- [NASA, Basics of Space Flight: Electromagnetic Techniques](https://science.nasa.gov/learn/basics-of-space-flight/chapter6-5/), opened 10/05/2026. Short excerpt: “The reflectance angle of RF waves equals their incidence angle.” The same section explains parabolic prime focus and optical telescope applications. Supports the ideal reflection/focus geometry, not a specific instrument layout.
- [NOAA GOES-R Series Data Book, Table 3-6, printed 3-17 / PDF page 45](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf#page=45), previously verified in `verified-facts.md` and `COMPREHENSIVE-SYSTEMS-REVIEW.md`. Public civil ABI electronics include scan-mirror drive and optical encoder processing functions. This existing verified evidence supports the roles shown; the book was not reopened for this change. No ABI dimensions, performance, or optical prescription are inferred.

## Verification

Unit tests check reflection and reciprocity, plane intersections, finite aperture clearance over the full animation loop, loop continuity, one-plane angle doubling, and path endpoints. The `optics` browser gate covers all nine hardware scenes and three layers, real camera gestures, explicit pause, mission-camera release, every optical demonstration, and reduced motion on desktop and phone. Full acceptance results are recorded separately after the final build.

## Acceptance — 10/05/2026

- Implementation commits: `b2e7e05` (continuous activity and optics lessons), `266a435` (annotation order and diagram-control checks).
- Typecheck passed; 264 unit tests passed; claims checker reported 0 problems across 941 claims, 90,240 scenario instances, and 253 research facts.
- All 42 current-build, full-scope browser runs passed on the RTX 5090. The new optics checks covered 305 desktop and 224 phone states. Each exhaustive scenario/part sweep checked 22,752 selections; each flight sweep checked 2,180 states.
- Performance: desktop worst p95 11.4 ms; phone worst p95 2.0 ms. Both passed the unchanged budgets. See [the full acceptance record](gate-results.md).
- Build SHA-256: `ba429eac3bfd9411fc7da05ba15abbc0ddb448365265f6f087b3897af18c287c`.
- Desktop (1440 × 900) and phone (390 × 844) screenshots of all five demonstrations are in `.local/optics/`; the local gallery is `.local/optics/review.html`. Visual review caught and corrected a ray drawing over the Mirror B label. Annotations now draw above the light.

The first full phone performance run exceeded budget in eight payload Data/Heat conditions (worst p95 13.7 ms). Its report is retained at `.local/optics-phone-perf-failure.json`. An equivalent targeted comparison measured 1.9 ms on the previously accepted build and 1.8 ms on the unchanged candidate. The subsequent full, unscoped phone run passed all 179 conditions at 2.0 ms. No runtime code, rendering quality, or performance budget was changed to obtain the passing recheck. The cause of the initial variability was not established.

No GLB was rebuilt. No push or deployment was made for this change.
