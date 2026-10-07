# Phase 2 look review

10/01/2026. Branch: `codex/look-prototype`. Reed authorized continuing after the source/scaffold review. Stop point: look approval before Phase 3.

## Review

[Private mobile preview](/guardian_ring/). Tailscale must be connected. The running preview serves the current built page through the existing private HTTP proxy.

The story page now has the IF typography, black surfaces and amber signature; an Earth-and-ring hero; six Blender studies with separate desktop and portrait compositions; Light/Data/Heat cues; named civil instruments; and source popovers. The six studies are the ring, satellite, telescope, focal plane, pixel and molecular emission. The explorer remains the tested placeholder scaffold. The Earth is a still at this review stage.

Twelve WebP delivery images total 749,526 bytes. Raw textures and PNG renders stay outside the website. All hardware is procedural, representative and labeled as drawn. NASA Earth Observatory texture credits appear on the page and in `THIRD_PARTY_NOTICES.md`; full provenance is in `look-assets.md`. No GLBs were exported, so no GLB cache key changed.

## Evidence

Six cited figures are drawn unchanged from the reviewed fact ledger: geostationary altitude, geosynchronous period, ABI channel count, Landsat 9 TIRS-2 focal-plane design temperature, and the CO2/H2O molecular bands. The seventh claim is an explicit illustration assumption. The shared registry backs both the story chips and the prerendered Evidence page; Method records the drawing assumption. No new operational-performance figures or physics outputs are presented.

Phase 1 source gaps remain unresolved and are not cited: ABI aperture/data rate, military payload specifics, universal detector temperatures, plume radiometry and quantitative atmospheric transmission. The new NASA imagery pages and direct texture downloads were opened and credited; they provide artwork, not sensor-performance evidence.

## Checks

- Typecheck: pass.
- Vitest: 37 tests pass.
- Strict claim audit: 0 problems; 7 site claims across 96 scenarios, plus 34 research facts.
- Build: pass.
- Story look gate through the actual Tailscale URL: pass at 1440 px and 390 px. Six correct responsive images, twelve working source buttons, in-viewport source dialogs, mobile menu, no overflow/page errors, internal links and retained noindex.
- Real-GPU link gates through the Tailscale URL: desktop and phone pass, ten navigation states each, NVIDIA RTX 5090 / D3D11.
- Desktop hero, phone hero, satellite phone and focal-plane desktop screenshots inspected, plus the Blender asset reviews. Local screenshots and machine-readable reports are in `.local/look/` and `.local/gates/`.

The interactive geometry and engine did not change. Earlier full scene/performance gates remain Phase 0 results; these checks do not imply validation of unbuilt physical scenes. No merge to main, remote repository, push, public deployment or launch occurred.

## Next, after look approval

Phase 3 adds the pure, tested orbital and radiometric engine with traced formulas and inputs. Start with approved general orbital quantities and named civil references. Unverified detector defaults, plume assumptions and any calculation that could imply a real system's performance stay withheld until explicitly resolved.

Ground depth and HBTSS inclusion remain open. The prototype uses a provisional schematic constellation and footer/evidence attribution while Reed's position policy and hero-attribution choices remain pending; the artwork does not settle those decisions.
