# Low-power and load measurements

Produced by `node tools/perf-stress.mjs`. These sit beside the real-GPU budget runs (`perf.mjs`, worst p95 about 15 ms desktop and 7 ms phone on the development PC) and do not replace them: the budget gate holds the top tier on the development GPU, while these runs show what the render-quality governor does when the machine is slow. A software renderer and a throttled main thread stand in for a mid-range phone; they are not a phone, and no figure here is a measurement of one.

Frame interval is the time between animation frames. A 60 Hz phone display shows 16.7 ms when the page keeps up; the headless browser here is not locked to a display, so a fast machine shows shorter intervals (the budget gate reads the same way). The governor judges a level every two seconds from the median interval, and treats an interval over 20.5 ms as pressure. Tiers are the seven render-quality tiers in `src/explainer-kit/src/render-quality.js`: tier 0 is the full look and tier 6 renders at 0.75 pixel ratio with no mirror, ambient occlusion, depth of field, bloom, halo or live shadows.

## Real GPU (D3D11), 6x CPU throttle

Recorded 10/14/2026 against `127.0.0.1:47683`. Renderer: ANGLE (NVIDIA, NVIDIA GeForce RTX 5090 (0x00002B85) Direct3D11 vs_5_0 ps_5_0, D3D11). Window: phone 390x844 @3x. CPU throttle 6x.

### Each tier held (frame interval, ms)

| Level | Tier | Pixel ratio | Buffer | p50 | p95 | max | Frames |
|---|---|---|---|---|---|---|---|
| orbits | 0 | 3.00 | 1170 x 1176 | 5.9 | 12.0 | 17.5 | 90 |
| orbits | 1 | 3.00 | 1170 x 1176 | 6.0 | 11.9 | 17.4 | 90 |
| orbits | 2 | 3.00 | 1170 x 1176 | 5.9 | 11.5 | 12.1 | 90 |
| orbits | 3 | 3.00 | 1170 x 1176 | 5.9 | 6.6 | 11.0 | 90 |
| orbits | 4 | 1.25 | 487 x 490 | 5.9 | 6.6 | 11.8 | 90 |
| orbits | 5 | 1.00 | 390 x 392 | 6.0 | 15.8 | 18.0 | 90 |
| orbits | 6 | 0.75 | 292 x 294 | 5.8 | 11.5 | 12.0 | 90 |
| payload | 0 | 3.00 | 1170 x 1146 | 11.3 | 18.0 | 23.4 | 90 |
| payload | 1 | 3.00 | 1170 x 1146 | 6.2 | 12.7 | 17.1 | 90 |
| payload | 2 | 3.00 | 1170 x 1146 | 6.0 | 11.6 | 12.0 | 90 |
| payload | 3 | 3.00 | 1170 x 1146 | 6.0 | 11.9 | 22.6 | 90 |
| payload | 4 | 1.25 | 487 x 477 | 6.0 | 15.6 | 16.7 | 90 |
| payload | 5 | 1.00 | 390 x 382 | 5.8 | 10.9 | 11.9 | 90 |
| payload | 6 | 0.75 | 292 x 286 | 5.8 | 11.1 | 11.8 | 90 |
| plume | 0 | 3.00 | 1170 x 1146 | 11.9 | 20.6 | 23.1 | 90 |
| plume | 1 | 3.00 | 1170 x 1146 | 11.5 | 17.2 | 17.9 | 90 |
| plume | 2 | 3.00 | 1170 x 1146 | 6.5 | 12.1 | 16.9 | 90 |
| plume | 3 | 3.00 | 1170 x 1146 | 6.1 | 16.7 | 23.3 | 90 |
| plume | 4 | 1.25 | 487 x 477 | 6.0 | 12.5 | 22.3 | 90 |
| plume | 5 | 1.00 | 390 x 382 | 6.0 | 12.0 | 12.1 | 90 |
| plume | 6 | 0.75 | 292 x 286 | 6.0 | 11.9 | 12.2 | 90 |

### Governor free, starting at tier 0 for 40 s (frame interval, ms)

| Level | Highest tier reached | Final tier | First step after | First 6 s p50 / p95 | Last 8 s p50 / p95 |
|---|---|---|---|---|---|
| orbits | 0 | 0 | never | 5.9 / 11.6 | 6.0 / 12.4 |
| payload | 0 | 0 | never | 6.0 / 16.2 | 6.0 / 12.1 |
| plume | 0 | 0 | never | 6.1 / 17.6 | 11.0 / 17.1 |

## Software GL (SwiftShader), 4x CPU throttle

Recorded 10/14/2026 against `127.0.0.1:47683`. Renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver). Window: phone 390x844 @3x. CPU throttle 4x.

### Each tier held (frame interval, ms)

| Level | Tier | Pixel ratio | Buffer | p50 | p95 | max | Frames |
|---|---|---|---|---|---|---|---|
| orbits | 0 | 3.00 | 1170 x 1176 | 62.5 | 66.8 | 125.1 | 90 |
| orbits | 1 | 3.00 | 1170 x 1176 | 62.5 | 66.7 | 70.9 | 90 |
| orbits | 2 | 3.00 | 1170 x 1176 | 62.5 | 66.8 | 66.8 | 90 |
| orbits | 3 | 3.00 | 1170 x 1176 | 62.5 | 66.7 | 70.9 | 90 |
| orbits | 4 | 1.25 | 487 x 490 | 37.4 | 37.6 | 37.6 | 90 |
| orbits | 5 | 1.00 | 390 x 392 | 33.3 | 33.4 | 37.5 | 90 |
| orbits | 6 | 0.75 | 292 x 294 | 29.2 | 33.4 | 58.3 | 90 |
| payload | 0 | 3.00 | 1170 x 1146 | 312.6 | 320.8 | 320.9 | 38 |
| payload | 1 | 3.00 | 1170 x 1146 | 316.6 | 317.2 | 320.7 | 37 |
| payload | 2 | 3.00 | 1170 x 1146 | 312.7 | 320.8 | 320.8 | 37 |
| payload | 3 | 3.00 | 1170 x 1146 | 316.7 | 320.9 | 320.9 | 37 |
| payload | 4 | 1.25 | 487 x 477 | 87.5 | 91.7 | 141.6 | 90 |
| payload | 5 | 1.00 | 390 x 382 | 70.8 | 70.9 | 71.1 | 90 |
| payload | 6 | 0.75 | 292 x 286 | 50.0 | 54.2 | 100.0 | 90 |
| plume | 0 | 3.00 | 1170 x 1146 | 116.6 | 120.9 | 129.2 | 90 |
| plume | 1 | 3.00 | 1170 x 1146 | 116.6 | 116.8 | 120.9 | 90 |
| plume | 2 | 3.00 | 1170 x 1146 | 116.7 | 120.9 | 120.9 | 90 |
| plume | 3 | 3.00 | 1170 x 1146 | 116.6 | 120.8 | 120.9 | 90 |
| plume | 4 | 1.25 | 487 x 477 | 41.7 | 45.9 | 50.0 | 90 |
| plume | 5 | 1.00 | 390 x 382 | 37.5 | 37.6 | 37.7 | 90 |
| plume | 6 | 0.75 | 292 x 286 | 29.2 | 33.4 | 33.4 | 90 |

### Governor free, starting at tier 0 for 40 s (frame interval, ms)

| Level | Highest tier reached | Final tier | First step after | First 6 s p50 / p95 | Last 8 s p50 / p95 |
|---|---|---|---|---|---|
| orbits | 6 | 6 | 2 s | 37.5 / 66.8 | 33.3 / 33.4 |
| payload | 6 | 6 | 3 s | 320.8 / 433.2 | 54.1 / 54.2 |
| plume | 6 | 6 | 2 s | 116.7 / 141.7 | 29.2 / 33.4 |
