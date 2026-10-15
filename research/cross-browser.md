# Other-engine smoke run

Produced by `node tools/cross-browser.mjs` on 10/14/2026. The budget, layout and interaction gates run in Chrome on one GPU. This run loads every page in WebKit (the iOS and Safari engine) and Firefox, reaches all ten explorer levels, checks that each canvas is drawn, and loses then restores the WebGL context. Frame intervals are recorded, not budgeted: headless WebKit and Firefox on this machine do not report a real device, and the figures say nothing about a phone.

| Profile | Engine | WebGL | Renderer string | Pages without errors | Levels drawn | Frame p50 / p95 (ms) | Context loss and restore | Result |
|---|---|---|---|---|---|---|---|---|
| WebKit, iPhone 13 profile | 26.6 | WebGL 2.0 | Apple GPU | 6 of 6 | 10 of 10 | 31.0 / 32.0 | message shown, then recovered | PASS |
| WebKit, desktop 1440 x 900 | 26.6 | WebGL 2.0 | Apple GPU | 6 of 6 | 10 of 10 | 30.0 / 32.0 | message shown, then recovered | PASS |
| Firefox, desktop 1440 x 900 | 155.0 | WebGL 2.0 | ANGLE (NVIDIA, NVIDIA GeForce GTX 980 Direct3D11 vs_5_0 ps_5_0), or similar | 6 of 6 | 10 of 10 | 4.5 / 5.0 | message shown, then recovered | PASS |
