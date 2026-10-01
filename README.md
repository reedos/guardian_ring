# The Guardian Ring

A local, public-source educational explainer of infrared satellite architecture. The scaffold and source review are complete. Phase 2 adds a static story-page look prototype with six Blender studies for Reed's review before the physics engine and interactive levels.

Read `AGENTS.md`, `PLAN.md`, then `research/sources-seed.md`. The seed is the original handoff, not a set of approved claims. `research/verified-facts.md` and the cluster reviews supersede its unchecked summaries.

## Local use

Requires Node 24 and npm. Dependencies and lockfile follow The Intelligence Factory's versions.

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:47600/. Vite binds only to loopback. The five pages are Story, Explore, Evidence, Method and Glossary. `window.grx` exposes the IF viewer test contract. Light, Data and Heat each contain one placeholder card/pin at every level. The geometry has no physical scale. Scenario choices produce no physical outputs.

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

The strict claim audit covers every scenario combination and the separate research tuples. The scaffold intentionally has no physical site claims. A passing placeholder gate is not a validation of future hardware, physics or visual design. GPU postprocessing and particle flows are deferred; the scaffold retains the IF tier/governor interface with direct rendering.

## Research

- `research/verified-facts.md`: consolidated tables for every main and side level, including gaps and a complete seed-source audit.
- `research/verified-facts.json`: IF-shaped claim tuples with exact source locations.
- `research/systems/source-notes.md`: systems and ground excerpts/access outcomes.
- `research/physics-review.md`: civil sensors, molecular physics, orbital definitions, source excerpts and download hashes.
- `research/physics/GOES-RSeriesDataBook.pdf`: locally downloaded official Data Book, excluded from Git and the website build.

Run `node tools/research.mjs` after editing either cluster's fact ledger. It validates every fact, checks seed coverage and regenerates the source registry and consolidated review. Never mark a blocked source verified based on search snippets. No unchecked or pointer source may back a claim.

## Publication

No remote, push, deployment or public repository is created by this work. All pages retain `noindex, nofollow`; `robots.txt` disallows crawling. GitHub checks are prepared but not run remotely. Pages and Cloudflare preview workflows require manual dispatch and a disabled-by-default repository variable, in addition to Reed's authorization. Cloudflare project name: `guardian-ring`.

The look prototype uses separate desktop and phone renders at all six main levels. `node tools/look.mjs` checks images, mobile navigation, evidence popovers and links against the built preview; set `GR_URL` to test through Tailscale. Source geometry comes from `tools/blender/build-*-look.py`; `encode-look.py` produces the delivery WebPs. Only the rendered WebPs ship. NASA imagery provenance is in `research/look-assets.md`.

`index.html` is authored directly. `node tools/write-pages.mjs` refreshes the supporting Evidence and Method pages from the shared records without overwriting the story. Ground depth, HBTSS, real versus schematic positions and hero attribution remain Reed's decisions. The displayed constellation is a provisional schematic composition, not an adopted real-position policy. The next phase after look approval is the tested physics engine.
