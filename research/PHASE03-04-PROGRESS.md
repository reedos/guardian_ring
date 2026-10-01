# Engine and interactive build review

10/01/2026. Branch: `codex/engine-and-scenes`. Reed authorized all remaining build phases and a GitHub Pages review.

## Completed at this checkpoint

- Pure general-science engine, with 60 passing tests across the project. Orbit geometry, vacuum light time, photon energy, ideal diffraction and ideal blackbody radiance have attached formulas, inputs and assumptions. See `model-review.md` for direct source review and numerical validation.
- Main levels 1–4: rotating Earth/GEO ring, representative spacecraft, reflective-payload cutaway and cooled detector assembly. All detailed geometry comes from Blender scripts. Each level has three selectable parts in each of Light, Data and Heat.
- Earth and its GEO markers turn together. Orbit guides, object sizes, positions, flow markers and playback are illustrative. The Earth uses attributed historical NASA imagery.
- Responsive source dialogs; a stepwise math panel and ideal Planck plot; prerendered Evidence/Method/Glossary; retained scenario choices in Evidence; story prose and sources; JSON-LD and `llms.txt`. Later story destinations remain inactive until their scene gates pass.

## Validation

Each of the four integrated levels passed all 14 browser gate runs against a built preview on the NVIDIA RTX 5090 / D3D11. This includes 96 scenario combinations, cards/pins, desktop and phone framing/controls, real camera flights, coplanar surfaces, rendering quality, links and performance. Reports are retained locally in `.local/gates/levels/`.

The per-level worst reported frame p95 was 0.60 ms for the ring, 0.40 ms for the satellite, 0.40 ms for the payload, and 0.50 ms for the focal plane. These are desktop-PC GPU measurements at the gate's desktop and emulated-phone viewports, not measurements on Reed's phone. Full-site gates will run again after integration and polish.

The strict audit currently covers 87 site claims across all 96 scenarios, plus 34 research facts, with zero problems. Numerical rows remain Spec, Vendor, Reported, Calc. or Assumed. Geometry screenshots were inspected at phone size. The payload gate found and prompted repair of two coplanar rear-baffle faces; the rebuild is version 2.

## Boundaries and outstanding work

The narrowed supported model is explicit: no received sensor counts, real plume intensity, military sensor parameters, coverage/revisit, ground resolution, cryocooler power estimate or warning latency. Civil aperture and universal material temperatures remain unavailable. These source gaps are not replaced by assumptions about real hardware. The original PLAN premise and several proposed outputs are broader than the verified material; see `LEVELS-CONTENT-REVIEW.md`.

Pixel, plume and the four side levels follow next, then final cross-level navigation and polish. The planned full ground side level remains a representative architecture. HBTSS is absent because its proposed material remains unchecked. No operational constellation positions are used.

## Publishing

The phase-2 look prototype was uploaded to the new private `reedos/guardian_ring` repository on Reed's authorization. GitHub rejected enabling Pages with HTTP 422: “Your current plan does not support GitHub Pages for this repository.” Publishing stopped. Reed has been asked to choose a public repository or a GitHub plan upgrade; no choice has been received at this checkpoint. No Pages site or non-Tailscale review URL exists. Noindex remains enabled and no portfolio or sitemap promotion occurred.
