# Guardian Ring review build

10/01/2026. This completes the implemented build scope through the polish phase. Reed's device review and publication decision remain open.

## What is included

- Six main Blender scenes: Earth and the geosynchronous ring, spacecraft, optical payload, focal plane, detector element, and molecular-emission plume.
- Four side scenes: representative ground segment, GOES-R ABI, Landsat 9 TIRS-2, and qualitative atmospheric absorption.
- Light, Data, and Heat cards at every level, with source-linked figures and explicit drawing assumptions.
- Independent orbit and radiation calculations, a Planck plot, and pinned/current comparisons whose evidence retains the saved scenario.
- Cited story links into the scenes, prerendered Evidence/Method/Glossary, scenario-preserving navigation, JSON-LD, and `llms.txt`.
- Ten versioned GLBs and twelve responsive story images. Builders and provenance are listed in `THIRD_PARTY_NOTICES.md`.

## Validation

The final checks pass: typecheck, 69 tests, and a strict audit of 186 claim keys across 96 scenarios (17,760 scenario-specific instances), plus 34 research facts. All 16 full-scope browser gate commands pass against the final production build. The definitive record and build hash are in `gate-results.md`.

The expanded browser suite covers 8,640 states each for scenario cycling and part interactions, 90 part views per screen size, and 270 camera routes per screen size. Source dialogs, quality controls, story destinations, reference-page scenarios, saved comparisons, and actual auto-cycle evidence changes pass. Worst frame p95 is 0.80 ms for desktop and 0.70 ms at the phone viewport, below the 15/7 ms budgets. The acceptance report rejects stale or single-level results. Real GPU tests use Chrome on Reed's RTX 5090; phone-sized browser tests do not replace a test on an actual phone.

## Supported scope and gaps

The model explains general physics and public architecture. Civil specifications stay attached to ABI or TIRS-2. Their drawn layouts preserve cited component counts but remain representative rather than dimensioned replicas.

ABI aperture and a standalone detector data rate were not verified. Material choice alone does not supply an operating temperature. No estimate fills these gaps. The model also does not supply received detector counts, real plume intensity, quantitative atmospheric transmission, military sensor parameters, operational coverage, cryocooler input power, or warning latency. These are narrower limits than some proposed outputs in the initial plan; the reasons and admitted sources are in `model-review.md` and `LEVELS-CONTENT-REVIEW.md`.

HBTSS inclusion, operational constellation positions, and hero attribution remain Reed's editorial decisions. The current constellation follows the plan's schematic baseline, and the ground level is a representative architecture.

## Publishing and the next step

Reed authorized GitHub Pages review. The repository was initially private, and GitHub rejected Pages enablement with HTTP 422: “Your current plan does not support GitHub Pages for this repository.” Publishing stopped at that check. Reed then explicitly authorized making the repository public while keeping the review link unlisted. The repository is now public and Pages is configured with HTTPS; deployment follows final acceptance.

Publish the tested review build and send its verified URL only in this chat. Noindex remains on. No portfolio or sitemap link is added. Reed's phone review comes before a separate launch call. Public Pages has no sign-in restriction; anyone who obtains the URL can access it.
