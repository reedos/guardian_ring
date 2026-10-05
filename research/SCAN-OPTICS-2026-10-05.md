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
