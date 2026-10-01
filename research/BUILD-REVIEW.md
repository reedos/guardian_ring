# Guardian Ring review build

10/01/2026. The spacecraft-detail revision passed final acceptance against its production build. Reed's device review and separate launch decision remain open.

## What is included

- Six main Blender scenes: Earth and the geosynchronous ring, spacecraft, optical payload, focal plane, detector element, and molecular-emission plume.
- Four side scenes: representative ground segment, GOES-R ABI, Landsat 9 TIRS-2, and qualitative atmospheric absorption.
- Light, Data, and Heat cards at every level, with source-linked figures and explicit drawing assumptions.
- Independent orbit and radiation calculations, a Planck plot, and pinned/current comparisons whose evidence retains the saved scenario.
- Cited story links into the scenes, prerendered Evidence/Method/Glossary, scenario-preserving navigation, JSON-LD, and `llms.txt`.
- Ten versioned GLBs and twelve responsive story images. Builders and provenance are listed in `THIRD_PARTY_NOTICES.md`.

The revision expands the spacecraft to twelve selectable components per layer, the payload to seven, and the focal plane to six: 138 part states across the ten levels and three layers. Rebuilt open assemblies expose power hardware, mechanisms, avionics, readout electronics, and thermal paths. Their story stills are rendered from the shipped GLBs. The persistent parts selector, Overview, Present, and Hide/Show Details controls restore the reference implementation's navigation affordances.

The content adds 51 engineering facts from the inspected GOES-R Data Book and three NASA references, bringing the admitted research ledger to 85 facts. Revised ABI cards, linked story service maps, and nineteen new glossary definitions explain the engineering chain. See `SPACECRAFT-DETAIL-REVIEW.md` for the revision and `spacecraft-review.md` for source passages.

## Validation

Typecheck, all 75 unit tests, and the strict evidence audit passed: 0 problems across 365 claim keys, 34,944 scenario-specific instances, 96 scenarios, and 85 research facts. Independent code and source review found no remaining actionable issue. New regressions cover texture disposal and camera movement/view clearance.

All 16 full-scope browser gate commands passed on the production build. Each layout passed 138 component views and 876 camera routes. Both the scenario and visible-part sweeps passed 13,248 states; texture use remained at 19 across all 96 scenario rebuilds. The generated `gate-results.md` records the build hash and detailed results. Final screenshots were also inspected.

Acceptance covers every scenario, part, and ordered camera route on desktop and phone, plus evidence dialogs, saved comparisons, navigation, renderer quality, and performance. New UI checks cover parts-selector synchronization, Overview, presentation restoration, evidence dwell, long part lists, and a 320-pixel layout. Real GPU checks use Chrome on Reed's RTX 5090; phone-sized browser checks do not replace a test on an actual phone.

## Supported scope and gaps

The model explains general physics and public architecture. Civil specifications stay attached to ABI or TIRS-2. Their drawn layouts preserve cited component counts but remain representative rather than dimensioned replicas.

ABI aperture and a standalone detector data rate were not verified. Material choice alone does not supply an operating temperature. No estimate fills these gaps. The model also does not supply received detector counts, real plume intensity, quantitative atmospheric transmission, military sensor parameters, operational coverage, cryocooler input power, or warning latency. These are narrower limits than some proposed outputs in the initial plan; the reasons and admitted sources are in `model-review.md` and `LEVELS-CONTENT-REVIEW.md`.

The generic spacecraft has no assigned bus voltage, array power, battery capacity, propulsion rating, ADC precision, or recorder capacity. Published electrical figures are explicitly GOES-R specifications. Internal layouts, repeated model components, wiring, and dimensions remain representative. HBTSS and operational constellation positions are excluded; the ring and ground level remain schematic architecture.

## Publishing and the next step

Reed authorized a public repository and GitHub Pages review. A separate launch call is still required.

Send the verified review URL only in this chat. Noindex remains on, and the link stays out of the public README, repository homepage field, portfolio, and sitemap. Reed's phone review comes before a separate launch call. Public Pages has no sign-in restriction; anyone who obtains the URL can access it.
