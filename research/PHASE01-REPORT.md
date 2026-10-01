# Phase 0–1 review

10/01/2026. Branch: `codex/scaffold-sources`. Stop point: before Phase 2.

## Built

Five local pages and an IF-derived viewer with six main levels, four reserved side levels, Light/Data/Heat, cards/pins, scenario state, share links, quality controls, camera clearance and `window.grx`. Each scene contains the same neutral test object; no physical figure or system performance is displayed. All pages retain the required publication statement and noindex. IF was used read-only; its Git history was not copied.

Local dev: http://127.0.0.1:47600/. Built preview: http://127.0.0.1:47601/. No remote repository, push, merge to main, deployment or launch.

## Verified

All 27 seed entries have review outcomes. Fifteen sources support 34 strictly validated research facts. Every main and side level has a table in [verified-facts.md](verified-facts.md), including explicit gaps. The official GOES-R Data Book was downloaded locally (12,628,931 bytes); its hash and inspected pages are recorded in [physics-review.md](physics-review.md).

Key corrections: GAO's 39-satellite Tracking contract figure is not a Transport count; its $4.707 billion Tracking total spans multiple tranches. SDA's original 28-satellite award must remain dated 07/18/2022. The NASA TIRS overview mixes Landsat 8 and 9, so dedicated TIRS-2 sources support the Landsat 9 figures. ABI spacecraft link rates are not detector data rates. See [systems-review.md](systems-review.md) and [physics-review.md](physics-review.md) for exact basis labels and source locations.

## Gaps and stopped attempts

Fresh SBIRS/AF and AMS requests returned HTTP 403; CRS returned a restricted-URL error. MDA and SSC PDFs returned unspecified fetch errors. Those actions stopped without another retrieval method, and the records are unchecked. GAO-21 opened in the web reader, but an optional local PDF download was denied and stopped. No blocked document supports a verified fact.

ABI aperture and standalone detector data rate remain unverified. No universal detector-temperature table, T2SL default, plume intensity/temperature or quantitative atmospheric transmission is admitted. Military hardware details remain representative or omitted.

## Gate scope

Local typechecking, unit tests, build and claim checks substitute for remote CI at this stage; no remote workflow has run. The browser gates target the built preview in Chrome using the RTX 5090 through D3D11. Their results apply only to the placeholder scene. The scaffold retains IF's rendering tiers with direct rendering; hardware postprocessing and physical calculations are deferred.

Final measured gate results are recorded in `gate-results.md`. Machine-readable local reports remain under `.local/gates/`.

## Proposed Phase 2, after Reed's review

Create a static story-page mock and one 3D still per main level at desktop and 390 px, using IF's existing colors and typography. Show the GEO ring as the centerpiece; all military hardware stays schematic and civil figures stay explicitly named. No physical engine or finished scenes yet.

Reed's four open decisions remain unchanged: ground-segment depth; HBTSS inclusion; schematic versus real constellation positions; agency attribution in the hero versus footer. Before writing the story, revise or source the plan's “few pixels” and “warning in seconds” framing: neither is an approved real-system performance claim in this review.
