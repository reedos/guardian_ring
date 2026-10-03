# Ideal focusing demonstration — 10/03/2026

## Verified primary source

Opened directly on 10/03/2026: NASA, *Basics of Space Flight*, Chapter 6,
[Electromagnetics: Reflection](https://science.nasa.gov/learn/basics-of-space-flight/chapter6-5/),
page updated 01/16/2025.

Short exact excerpt: “This arrangement, called prime focus” and “It is also
used in optical telescopes.” The preceding paragraph specifies a paraboloid
and on-axis incident electromagnetic waves. The section explains equal
incidence and reflection angles.

## Calculation, separate from hardware

For an ideal surface z = (x² + y²)/(4f), the normal is proportional to
(-x/(2f), -y/(2f), 1). Reflect d = (0,0,-1) using d′ = d − 2(d·n)n.
The result points from the intersection to (0,0,f). The total path from an
entry plane z = h to this focus is h + f for every sampled radius. Unit tests
check the reflected direction, equal path lengths, equal incidence/reflection
angles and arc-distance sampling across the actual reflection vertex.

All coordinates, ray counts, widths, glow, pace and the enlarged detector-cell
diagram are Assumed presentation choices. This is geometric optics for one
on-axis direction. It does not compute diffraction, detector sampling,
throughput or a sensor response. Real diffraction prevents a literal point
image; the illustrated cells do not specify an array format or pixel pitch.
No real instrument is claimed to use this prescription. The representative
payload retains its explicitly functional, dashed optical connections.

The luminous strokes adapt IF's layered narrow-core / broad-halo visual idea.
Each stroke follows the calculated straight segments; it does not round or
cut the reflection vertex. A mathematical diagram is not newly modeled
hardware and requires no GLB rebuild.
