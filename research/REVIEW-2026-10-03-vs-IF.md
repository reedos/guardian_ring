# The Guardian Ring vs. The Intelligence Factory: review and upgrade list (10/03/2026)

Reed asked for this site to reach or pass The Intelligence Factory (IF, `C:\Users\reedo\projects\intelligence_factory`,
live at https://reedos.dev/intelligence_factory/) on sourcing, rigor, visual fidelity, story, broad interest,
dramatic animation and teaching. This file is the review and the ranked work list. `PLAN.md` and `AGENTS.md` still
govern, especially §3's scope rules. Nothing below asks for classified performance, evasion or targeting.

Screenshots are in `research/review-2026-10-03/`. They were taken with real-GPU Chrome at 1440×900 and 390×844 against
the `dist` build of 10/03/2026 (branch `codex/part-focus-navigation`), on every main and side level in the Light
layer, plus the Data layer on desktop. IF reference shots are in `research/review-2026-10-03/if/`.

## Scorecard

| Dimension | IF | Guardian Ring |
|---|---|---|
| Sourcing and documentation | 385 sources, about 750 labeled figures, 82 calcs, 141 assumptions | At IF. 74 sources with per-source verified/unchecked status, which is better bookkeeping than IF has. The build review records 941 claims with 0 audit problems |
| Technical rigor | One engine drives everything; conservation tested | At or above IF. Kepler period, vis-viva, GEO light-time, Planck band integration and 1.22 λ/D are correct and tested. Gap: the cryocooler functions in `src/model/radiometry.ts` are not used by any card |
| Visual fidelity | Dusk-lit campus, glowing flows, legends, scale bars (`if/campus-overview-desktop.png`, `if/chip-heat-desktop.png`) | Below. The story hero is strong (`desk-story.png`). The visualizer opens on a small Earth in a black frame (`desk-open.png`, `phone-0-orbits-light.png`). The satellite and payload read as a toy kit, with chunky bevels and labels printed on boxes (`desk-1-satellite-light.png`, `desk-2-payload-light.png`). The plume level has a composition defect (`desk-5-plume-light.png`) |
| Story | One throughline per tour, a 10-section story page with numbers that land | Below. Accurate, but nearly every sentence carries a qualifier. The PLAN's hook was rightly pulled for scope and never replaced with an equally vivid one |
| Broad interest | Named real campuses, real anchors | Below. "Watch the mission" is the most shareable feature, but nothing in it is a stop-and-stare frame yet |
| Animation and spectacle | Glowing ribbons on real paths, rising heat embers | Mixed. There is a lot of motion (orbit clock, scan mirrors, typed streams). The PLAN §7 photon stream narrowing onto a few pixels is not built, and nothing matches IF's ember frame |
| Teaching | Plain intro per level, glossary linked to 3D | At or above IF: guiding question, takeaway and next step per level |

In short: the rigor and teaching are already at IF level. The work is in the first frame, the hardware
look, one spectacle moment per layer, and prose that reads as a story.

## Upgrade list, ranked

Effort: S under a day, M a few days, L a week or more.

### Wave 1

1. **Finish acceptance on the current branch first (M).** The last record shows 9 of 26 browser gates passed on the
   frozen build, with phone performance still running. Get the branch green and merged before starting the visual
   work below.
2. **The opening frame (M).** Make the visualizer's first view as strong as the story hero. Today the Earth fills
   roughly 15% of a black viewport. Target:
   - a close, terminator-lit Earth filling most of the frame, with an atmosphere limb glow, a subtle starfield,
     city lights on the night side and a clear Sun direction;
   - the GEO satellites with **glowing coverage footprints that sweep across the ground as the day plays**, as
     PLAN §4 asks;
   - the HEO loops arcing over the pole.

   Pointers: `src/scenes/orbits.js`, `src/scenes/orbit-presentation.js`, `src/scenes/orbit-motion.js`. Keep the
   "schematic positions" chip.
3. **The plume level (M).**
   - Fix the composition: the molecule models overlap the top edge, pin 4 is clipped, and pin 5's leader line
     crosses the level title.
   - Then make it the dramatic frame it should be: a generic launch climbing out of the lower atmosphere, seen from
     orbit, glowing in the MWIR band color, with the plume breaking above the absorbing layer. That is the
     physics point of the level, shown instead of told.
   - It must stay a generic plume, never a real vehicle or site, with no radiant intensity beyond the
     illustrative, labeled value.

   Pointer: `src/scenes/plume.js`.
4. **The photon stream (M)** (PLAN §7). On the Light layer, IR photons from the plume narrow through the telescope
   onto a few pixels. Draw them as glowing, band-colored ribbons using IF's `src/flow-ribbons.js` technique, not
   typed glyphs. This is the Light layer's signature moment. Pointers: `src/scenes/payload.js`,
   `src/scenes/teaching-programs.js`, `src/scenes/optical-routing.js`.
5. **A hook lede from cited numbers (S).** Rewrite `index.html`'s `.lede` around figures already in the evidence
   files, for example:
   - the GEO altitude, 35,786 km;
   - light from there reaching the ground in about 0.12 s (Calc.);
   - the CO2 band near 4.3 µm;
   - TIRS-2's focal plane held at 43 K, colder than the night side of the Moon (verify the Moon comparison
     before using it).

   It needs to be vivid and stay inside scope.
6. **Scale bar and legend on every level (S).** `.scalebar` already exists in `src/styles.css`. IF shows one on every
   level, plus a legend wherever color carries meaning.
7. **"Watch the mission" as the first-visit default (S)** in the visualizer, not a secondary button.

### Wave 2

8. **Spacecraft realism pass (L).** Crinkled gold and silver MLI, black anodized and white-painted radiators, thin
   truss members, realistic proportions, and hard single-sun lighting with deep shadows. Replace text printed on
   component boxes ("FLIGHT COMPUTER", "PAYLOAD PROCESSOR") with pins and callouts, as IF's tray and CPO levels do.
   Everything stays "representative, as drawn" (PLAN §3). Pointers: `tools/blender/build-*.py`,
   `src/scenes/print-kit.js`; bump every GLB `?v=N`.
9. **De-hedge pass (M).** Move qualifiers ("does not reproduce an ABI pixel", "does not specify a single connected
   system") out of topic sentences and into evidence chips, card notes and the footer. Keep the publication
   statement as is.
10. **Wire the cryocooler calc (M).** Use `carnotRefrigeratorCOP` and `coolerEnergyBalance` from
    `src/model/radiometry.ts` in the focal-plane Heat cards, starting from verified civil-twin temperatures
    (TIRS-2 at 43 K). `engine.ts` currently returns `detectorTemperatureK: null`.
11. **Real public imagery from the civil twin (M).** NOAA/CIRA GOES ABI band 7 (3.9 µm) loops of wildfire hot spots
    are public domain and show the same physics on a real sensor; they belong on the ABI side level and the story
    page. If NOAA or CIRA has published a GOES loop of a civil space launch, it could be the site's most shareable
    image. **Ask Reed before using one**: it is public civil imagery, but it sits close to the scope line.

### Wave 3

12. **Re-render story stills on every GLB version bump (S)**, enforced by a gate rather than by checking by eye.
13. **Cinematic loop (M).** A short rendered loop of the footprints sweeping the night Earth for the story hero and a
    portfolio card, using the virtual-clock render toolkit Reed's other sites used.

## Rules that still apply

- `AGENTS.md`: public sources only, the evidence labels, `claims.mjs` at 0, and the gates before a merge.
- Branch per item. No pushes, new GitHub repo or deploys until Reed says so.
- If a permission check blocks something, stop and report it. Do not retry it through another tool or shell.
