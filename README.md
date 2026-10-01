# The Guardian Ring

A public-source educational explainer of infrared satellite architecture. The scaffold, source review, look studies, and general physics engine are complete. Interactive Blender scenes are being completed and gated in sequence.

Read `AGENTS.md`, `PLAN.md`, then `research/sources-seed.md`. The seed is the original handoff, not a set of approved claims. `research/verified-facts.md` and the cluster reviews supersede its unchecked summaries.

## Local use

Requires Node 24 and npm. Dependencies and lockfile follow The Intelligence Factory's versions.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:47600/. Vite binds only to loopback. The five pages are Story, Explore, Evidence, Method and Glossary. `window.grx` exposes the IF viewer test contract. Completed levels have Light, Data and Heat cards and source-linked evidence. The geometry is schematic. The scenario panel contains independent teaching examples of orbit geometry, light time, diffraction, photon energy and ideal blackbody radiance; no real sensor performance is calculated.

For mobile review with Tailscale connected, open [the private preview](https://reeds-pc.tailf68402.ts.net/guardian_ring/). It serves the last build through the loopback preview on port 47601; keep that process running. After changing the site, run `npm run build`. The trailing slash in the review URL is required for relative assets.

The route uses Tailscale Serve's HTTP proxy (no administrator-only folder serving). To restore this route while preserving the other services:

```powershell
tailscale serve --bg --https=443 --set-path=/guardian_ring http://127.0.0.1:47601
```

The exact Tailscale hostname is allowed in `preview.allowedHosts`; the preview still binds only to loopback.

## Checks

```powershell
node tools/research.mjs
npx tsc --noEmit
npx vitest run
npx tsx tools/claims.mjs
npm run build
npm run preview
```

In another terminal, `npm run gates` runs all browser gates against the **built preview** at http://127.0.0.1:47601/. Chrome and a real Windows GPU are required; software renderers are rejected. Reports go into `.local/gates/`, screenshots into `shots/`. `GR_URL` can override the preview URL. Each gate is also callable as `node tools/views.mjs phone`, for example. Desktop and phone performance limits are 15 and 7 ms p95, with frame-rate limiting disabled, held at maximum quality.

The strict claim audit covers every scenario combination and the separate research tuples. A passing placeholder gate is not validation of later hardware. To gate a newly integrated level, set `$env:GR_LEVELS='satellite'` (or another scene ID); omit it for the complete suite. Per-level reports are retained in `.local/gates/levels/`. Rendering uses the IF quality governor with direct lighting and illustrative flow markers.

`node tools/pages.mjs` checks Evidence, Method and Glossary at desktop and phone sizes. `node tools/scene-shot.mjs satellite phone` captures each layer at its home framing. All browser checks use the built preview unless `GR_URL` explicitly selects another server.

## Research

- `research/verified-facts.md`: consolidated tables for every main and side level, including gaps and a complete seed-source audit.
- `research/verified-facts.json`: IF-shaped claim tuples with exact source locations.
- `research/systems/source-notes.md`: systems and ground excerpts/access outcomes.
- `research/physics-review.md`: civil sensors, molecular physics, orbital definitions, source excerpts and download hashes.
- `research/physics/GOES-RSeriesDataBook.pdf`: locally downloaded official Data Book, excluded from Git and the website build.

Run `node tools/research.mjs` after editing either cluster's fact ledger. It validates every fact, checks seed coverage and regenerates the source registry and consolidated review. Never mark a blocked source verified based on search snippets. No unchecked or pointer source may back a claim.

## Publication

Reed authorized a GitHub Pages review and continued buildout on 10/01/2026. The reviewed look prototype was pushed to the private `reedos/guardian_ring` repository. GitHub rejected Pages for that private repository because the account plan does not support it. Publishing stopped at that check; a public-repository choice or GitHub plan change remains pending. No Pages review URL exists yet.

All pages retain `noindex, nofollow`; `robots.txt` disallows crawling. Pages requires manual dispatch and the repository variable `GUARDIAN_RING_PUBLISH=enabled` (enabled for this authorized review). The prepared Cloudflare workflow is unused. Review authorization does not remove noindex or add portfolio/sitemap promotion.

The story uses separate desktop and phone renders at all six main levels. `node tools/look.mjs` checks images, mobile navigation, evidence popovers and links against the built preview; set `GR_URL` to test through Tailscale. Source geometry comes from `tools/blender/build-*.py`; `encode-look.py` produces the delivery WebPs. Interactive GLBs ship with versioned cache keys. NASA imagery provenance is in `research/look-assets.md`.

`index.html` is authored directly. `npx tsx tools/write-pages.mjs` refreshes Evidence, Method and Glossary from the shared records without overwriting the story. Run it when cards, model evidence or story claims change. HBTSS inclusion, real positions and hero attribution remain Reed's decisions. The displayed constellation uses the plan's provisional schematic composition. Source gaps are recorded in the research reviews and are not filled with real-system estimates.
