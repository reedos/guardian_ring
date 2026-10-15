# Page and model weight

Produced by `node tools/page-weight.mjs` on 10/14/2026 against the production build (`npm run build`, served by vite preview). Each response body is compressed here with brotli (quality 11) and gzip (level 9), because vite preview sends it uncompressed. The live host, Cloudflare, was checked on 10/14/2026: pages and scripts come back `Content-Encoding: br`, and the GLBs come back `gzip` (`curl -sI -H "Accept-Encoding: br, gzip" https://reedos.dev/guardian_ring/`).

## Whole page load

Same-origin responses only; the two Google Fonts hosts add the font CSS and files on top (see THIRD_PARTY_NOTICES.md). The explorer row includes the first level's model.

| Page | Requests | Raw | Gzip | Brotli | Budget (brotli) |
|---|---|---|---|---|---|
| Story | 15 | 677 kB | 208 kB | 176 kB | 250 kB |
| Explorer, first level | 16 | 2349 kB | 845 kB | 739 kB | 850 kB |
| Evidence | 15 | 2002 kB | 448 kB | 377 kB | 420 kB |
| Parts | 15 | 1415 kB | 321 kB | 266 kB | 320 kB |
| Method | 12 | 259 kB | 96 kB | 89 kB | 130 kB |
| Glossary | 11 | 305 kB | 152 kB | 145 kB | 180 kB |

The story page's Earth loop (`look/ring-loop.mp4`) is opt-in: the video starts hidden with `preload="none"` and is requested only when a visitor presses Play Earth loop, so it is not part of the page load above.

## Models

The viewer fetches a level's model when the level opens, and the ring (`earth-orbits.glb`) first.

| Model | Raw | Gzip | Brotli |
|---|---|---|---|
| abi.glb | 680 kB | 240 kB | 200 kB |
| atmosphere.glb | 210 kB | 67 kB | 60 kB |
| earth-orbits.glb | 763 kB | 418 kB | 394 kB |
| focal-plane.glb | 477 kB | 171 kB | 141 kB |
| ground.glb | 492 kB | 160 kB | 133 kB |
| payload.glb | 1221 kB | 376 kB | 294 kB |
| pixel.glb | 163 kB | 49 kB | 43 kB |
| plume.glb | 585 kB | 483 kB | 473 kB |
| satellite.glb | 924 kB | 268 kB | 221 kB |
| tirs2.glb | 592 kB | 191 kB | 156 kB |
| **All ten** | **5.96 MB** | **2.37 MB** | **2.07 MB** |

The GLBs are meshopt-compressed (`npm run models:compress`); before that step they were 12.06 MB raw and 4.4 MB gzipped.
