# The Guardian Ring: hands-on UX and visual audit (10/04/2026)

Instruction set for Codex. `PLAN.md` and `AGENTS.md` still govern, especially the §3 scope rules. Nothing below asks
for classified performance, evasion, countermeasures or targeting, and nothing should be read as permission to add them.

## Header

- **Build audited:** `main` at 66ce5ba ("Record full Wave 1 and compact-phone release acceptance"), built with
  `npx vite build` into a scratch folder (the repo's `dist/` was not touched), served on 127.0.0.1:47691 and shut down
  afterward. All six pages built (story, visualizer, evidence, method, glossary, parts).
- **Method:** Playwright with real-GPU Chrome (d3d11), desktop 1440x900 and phone 390x844 at deviceScaleFactor 2.
  Fresh visit (no storage) and returning visit (`grx-mission-visited-v1` set). Clicked through: story page top to
  bottom; every level in Light on both form factors and Light/Data/Heat on desktop; the full mission played to the end
  (autoplay for about 100 s, then Chapter-skip through all 10 steps); Pause/Chapter/Explore this view; Play the day;
  GEO/HEO/MEO/LEO; Follow a spacecraft; Assembled/Inside; Play sequence/Step/Reset; Auto-cycle; Previous/Overview/Next;
  Parts and Scenario tabs; the "..." menu; the phone Menu, level picker and bottom sheet; the four reference pages.
- **Screenshots:** `research/audit-2026-10-04/`. Prefix `d-` is desktop, `p-` is phone. Yesterday's are in
  `research/review-2026-10-03/`.
- **Load and speed:** the visualizer's first scene was built in about 0.9 s on both form factors; every level switch
  was under 0.2 s plus the 1.5 s I waited; nothing took more than 5 s. Frame rate in the visualizer was about 240 fps
  uncapped (no performance work needed). Evidence and Parts pages take 2 to 3 s to load because they are enormous (see Cuts).
- **Console:** no page errors, no failed requests, in any flow. One repeated WebGL shader warning (X4122, "sum of 0.996
  and ... cannot be represented accurately in double precision") from a THREE program on every load; harmless but noisy.
- **Could not check:** a physical phone (touch inertia, address-bar resize), the IF live site side by side this
  session (I compared against yesterday's IF shots), Safari/Firefox, Battery-saver/Auto quality tiers, and the
  Share/Present items in the "..." menu beyond opening them.

## Summary

The site is more finished than yesterday's review implies, and it is fast. The story hero is the best frame on the
site and now has a number-led lede. The visualizer opens straight into "Watch the mission" for a first-time
visitor, the plume level's composition defect is fixed, and the glitch count is low. The remaining weakness is not
bugs but **density and staging**. The 3D stage is only about half the window on desktop (450 of 900 px while the mission
bar is up) and a third of a phone (289 of 844 px), shrinking to 140 px on a phone the moment the Parts sheet is open or a sequence
plays. A first visitor faces about 44 visible controls on desktop and 22 on phone, with four overlapping "play
something" mechanisms (Watch the mission, Play the day, Play sequence, Auto-cycle). Hardware levels still look like a
toy kit with text printed on boxes, and Data/Heat barely change the hardware, so the three-layer promise is
mostly carried by thin path lines and the side-panel text. The mission never shows a launch or a payoff: it goes
from "infrared light" to "ground station" with the sentence "supplies no operational warning timeline". The one hard
visual glitch is a giant opaque orange band that fills the frame in mission step 2. Prose is accurate and
over-hedged, especially in the Play-sequence captions.

## Status of yesterday's wave list (REVIEW-2026-10-03-vs-IF.md)

| # | Item | Status |
|---|---|---|
| 1 | Finish acceptance on the current branch | Fixed (66ce5ba records it; merged to main) |
| 2 | Opening frame | Partly. Fresh visit now opens in the mission with a bigger Earth (`d-v-first-6s.png`); a returning visit shows a large lit Earth with GEO patches (`d-ret-load.png`). Missing: footprints do not sweep (they stay "Earth-fixed"), no atmosphere-limb haze beyond a thin blue line, HEO loops not dramatic. Opening a level via the tab bar still gives a smaller Earth (`d-lvl0-orbits-light.png`) |
| 3 | Plume level | Partly. Composition fixed: planet limb underneath, no clipped pin or title crossing (`d-lvl5-plume-light.png`). Still not dramatic: the plume is a small dull orange smudge in a big black stage, no rise through the atmosphere, no MWIR glow. In Heat mode the "HOT EMITTING GAS" label detaches and sits in the top-left corner (`d-lvl5-plume-heat.png`) |
| 4 | Photon stream | Not yet. No ribbons from plume to pixel on the Light layer |
| 5 | Hook lede | Fixed in content (35,786 km, 43 K, cited chips, `d-story-00.png`). New problems: it mixes GEO and Landsat in one paragraph, and inline chips break the line spacing |
| 6 | Scale bar and legend | Legends: yes, on every level. Scale bars: not yet (`.scalebar` is defined in `styles.css` but used nowhere in `src/`) |
| 7 | Mission as first-visit default | Fixed |
| 8 | Spacecraft realism | Not yet. "FLIGHT COMPUTER", "PAYLOAD PROCESSOR", "MLI BLANKET" are still printed on boxes (`d-lvl1-satellite-heat.png`) |
| 9 | De-hedge pass | Not yet (see Story 3) |
| 10 | Wire the cryocooler calc | Not yet (`carnotRefrigeratorCOP` and `coolerEnergyBalance` are only referenced in `radiometry.ts` and its test; `engine.ts` still returns `detectorTemperatureK: null`) |
| 11 | Real civil imagery | Not yet (still needs Reed's call) |
| 12, 13 | Stills gate, cinematic loop | Stills look current on the story page; loop not built |

## Instructions

Effort: S under a day, M a few days, L a week or more.

### A. Glitches (fix first)

**A1. Opaque orange band fills the frame in mission step 2 "A faster view of Earth" (S).**
What: a LEO ground-track or orbit ribbon is drawn as a thick opaque tube, and the follow camera sits inside or next to
it, so it covers about 12% of the stage height edge to edge. Fix the ribbon in `src/scenes/orbit-streams.js` /
`orbit-motion.js` (whichever builds the LEO trace): make it a thin additive line scaled by camera distance, and add the
LEO follow camera to the `occupancy.js` / `camera-clearance.js` checks so the camera cannot sit within the tube radius.
Why: `d-mission-02.png`. How to verify: Chapter to step 2 in the mission at 1440x900 and 390x844, screenshot, and
assert that no single mesh covers more than 15% of the canvas; add the LEO follow view to `tools/flights.mjs`.

**A2. The 3D stage collapses when controls open (M).**
What: desktop stage is 450 px tall of 900 with the mission bar up, 385 px with "Follow a spacecraft" open
(`d-ret-load.png` for the closed state), about 400 px during Play sequence
(`d-payload-seq2.png`). Phone: 289 px in the mission, 272 px after choosing a level, 140 px with the Parts sheet open
or a sequence playing (`p-sheet-open.png`, `p-seq.png`). Fix in `src/app/inspector-layout.js`, `toprow.js` and the
`#viewer` grid rows in `styles.css`: the stage gets a floor of 60% of the viewport height on desktop and 45% on phone;
everything else (mission text, sequence caption, Follow description) becomes an overlay card over the lower part of the
stage or moves into the right panel. Never let a control row push the stage smaller; let it scroll or collapse instead.
Why: the 3D is the product; yesterday's "Earth is small in a black frame" is now "everything is small". How to verify:
a gate that reads `#gl` height on every level, mission step, sequence state and sheet state and fails below the floor.

**A3. Heat-mode plume label detaches to the top-left corner (S).**
What: in Heat on the photon level the pin label "HOT EMITTING GAS" renders at the canvas corner while the pin is mid-stage
(`d-lvl5-plume-heat.png`). Check the Heat hotspot list in `src/scenes/plume.js` against `pin-layout.js`; the label
should anchor to its pin or be hidden. How to verify: for each level and mode, assert every visible `.pin` label's
box is within 220 px of its pin.

**A4. HUD title overlaps bright geometry (S).**
What: "THE PAYLOAD" and its kicker print over the model in mission steps 5, 7 and 8
(seen live at mission steps 5, 7 and 8; `d-mission-06.png` is the clean case for comparison). Add a short dark gradient behind
`#hud-title` / `#hud-sub` and keep camera framing out of the top-left 360x120 px region. The same applies to the ring
level where the dashed beam crosses "SCHEMATIC SCALE" (`d-v-first-6s.png`). How to verify: pixel-sample luminance behind
the title box in every level screenshot; fail above a threshold.

**A5. Parts list keeps a stale scroll position across levels (S).**
What: after switching levels the right panel opens already scrolled down (the photon level shows
"Water-vapor molecules" first, the payload level shows items 10 to 12; see `d-lvl5-plume-light.png`,
`d-payload-inside.png`). Reset `#pane-parts` scrollTop to 0 on every level change and on part reset.
How to verify: `grx.show` to a level, assert `scrollTop === 0`.

**A6. One-step "sequences" (S).** Data and Heat on the photon level show "1 / 1" next to Play sequence
(`d-lvl5-plume-heat.png`). Hide Play sequence/Step/Reset when a sequence has fewer than 3 steps.

**A7. Shader warning on every load (S).** Find the material that triggers X4122 (a smoothstep/fract on a double-width
constant, likely in the Earth or atmosphere shader in `orbit-presentation.js`) and clamp the constants so the console
is clean, so real warnings stand out in gate logs.

**A8. Verify lazy story images (S).** On the story page a first scroll sometimes showed an empty framed box for the
photon section before the still painted (`d-story-12.png`). Add `width`/`height` and a placeholder background to the
still containers and confirm the layout does not jump. How to verify: scroll the page at 1 s intervals and assert no
`img` with `naturalWidth === 0` is in the viewport after 2 s.

### B. Simplify navigation and controls

**B1. Collapse four "play" mechanisms into two (L).**
What: today a visitor sees Watch the mission, Play the day (orbits level only), Play sequence/Step/Reset (every
hardware level), Auto-cycle and the mission's own Pause/Chapter/Explore (`d-ret-load.png`, `p-levelpick.png`).
Proposed: (1) **Watch the mission** is the only transport on the page (Play/Pause, Back, Next). (2) Inside a level the
parts navigation (Previous/Overview/Next) is the only manual control. Fold "Play sequence" into Next: pressing Next
on a part with a built-in animation plays it once. Fold "Auto-cycle" into the mission (it is the mission, minus
captions). Make "Play the day" autoplay with a single small time-scrubber and no button, and remove "Pause the day".
Where: `src/app/animation-controls.js`, `part-cycle.js`, `mission-tour.js`, `visualizer.html` (`#part-play`,
`#animation-controls`). Why: first visit shows 44 controls on desktop and 22 on phone; a newcomer cannot tell which
button "plays". How to verify: count visible interactive elements on first load, target 20 or fewer desktop and 12 or fewer phone; run `tools/ui.mjs`.

**B2. Move the orbit-family toggles and "Follow a spacecraft" into one segmented control on the stage (M).**
What: GEO/HEO/MEO/LEO, Play the day and the Follow details sit in a dock below the controls and push the stage
smaller (`d-ret-load.png`). Put GEO/HEO/MEO/LEO as chips along the bottom edge inside the stage, make them
exclusive-by-default with an "All" chip, and replace the "Follow a spacecraft - Motion details" disclosure with three
chips (Free view, Follow GEO, Follow LEO) beside them. Move the paragraph of explanation ("Amber streaks show...")
into the right panel under a "How to read this view" section. Where: `src/scenes/orbit-controls`-related code in
`orbits.js` and `src/app/orbit-controls.js`. How to verify: no layout change in `#gl` height when toggling chips.

**B3. Phone: one bottom bar, one sheet (M).** The phone bottom stack is Watch the mission, Play sequence row, Part
select, Previous/Overview/Next/Auto-cycle, then the Parts sheet handle (`p-lvl2-payload-light.png`). Reduce to:
a floating Previous / Overview / Next bar over the stage, a single "Parts" handle that opens the sheet, and the part
dropdown inside the sheet. Remove Auto-cycle on phone (B1). Keep the level picker and Light/Data/Heat in the top
row (those are good). How to verify: on 390x844 the stage is at least 45% of the viewport with the sheet closed.

**B4. Make the Light/Data/Heat toggle explain itself (S).** Add a one-line caption under the toggle for each layer
("Light: how the photons travel", "Data: how the signal moves", "Heat: where the energy goes"), shown once per level
until used. Why: visitors cannot tell what the three buttons do and the hardware barely changes (see D3).

**B5. "Explore this view" and "Repeat" (S).** Rename to "Take control" and drop "Repeat" behind the "..." menu; keep
the mission bar to Pause, Back, Next, and a progress dots row. Where: `src/app/mission-tour.js`.

**B6. Show the mission progress as dots with step titles on hover (S).** "1 / 10" is not navigable. Ten clickable
dots, current title above them.

**B7. Right panel hierarchy (M).** On the ring level the first thing in the panel is a question, a link, a "Next
level" button, a paragraph and a six-item list (`d-ret-load.png`). Show the question and "Next level" only; push the
paragraph into the card and make the six parts the primary content. Where: `learning-journey.js`, `#intro`.

### C. Story

**C1. Give the mission a launch and a payoff (M).**
What: the 10 steps go from "Start with the whole Earth" to "Receive, process, and distribute", and step 3 says
"not a particular launch or its brightness". A first-time viewer never sees the event the whole site is about.
Add a step 3 (generic launch) and a final step (a generic alert appearing on the ground-station screen), both
labeled "illustrative event" and with no real site, vehicle, timeline or threshold. Reuse the plume scene and the
ground scene; keep the existing scope wording in a footnote chip, not in the topic sentence. Where:
`src/app/mission-tour.js`, `src/scenes/plume.js`, `side-ground.js`. How to verify: the mission has a step whose scene is
`plume` with the plume visibly rising, and the last step ends on a screen state change (the antenna and a lit display).

**C2. Cut the mission from about 3 minutes to about 90 seconds on autoplay (S).** Step 5 (payload) lasted about 40 s
in autoplay (`Chapter 5 / 10` held from 48 s to 88 s). Cap each step at 8 s of autoplay; the sub-steps (Step 1/3 and so on)
should be skippable chips, not an extra minute. Where: step durations in `mission-tour.js`.

**C3. De-hedge the visible prose (M).** Examples to rewrite:
- Play-sequence captions repeat "not a traced ray" three times per step and "Dashed amber lines connect optical
  component roles; they are not traced rays. The separate scan-mirror demonstration shows local reflection.
  Packaging, angles, and playback time are illustrative." under every step (`d-payload-seq2.png`).
  Show that note once as a legend chip on the first step of a sequence and then not again.
- "Physical circular-orbit example; drawing and playback scales are illustrative." under every mission step.
  Keep one standing "Illustrative scale" chip on the stage.
- Footer sentence on every step: "Presentation time is compressed. Hardware, routes, and activity are representative; the
  ordered explanation separates tasks that may overlap." Move to the "..." menu under "About this view".
Keep the publication statement as is and keep every figure's evidence chip. How to verify: no sentence containing
"illustrative" or "representative" appears in the primary mission or sequence caption; word count of the visible mission
bar under 40 words.

**C4. Story lede: one idea at a time (S).** The hero paragraph runs GEO altitude, then Landsat 9's TIRS-2, then "Follow
infrared light from hot gas" in three sentences with two chips inline (`d-story-00.png`). Use three short lines or a
three-number strip under the buttons: 35,786 km (GEO), about 0.12 s (light-time, Calc.), 43 K (TIRS-2, civil). Keep the
headline. The "separate civil example" qualifier belongs on the chip.

**C5. Add pictures to the two text-only story sections (M).** "A measurement needs a path" (ground and data path) and
"Every number has a way back" have no image on desktop (`d-story-16.png`); the data-path section is the one that
answers "so what happens next". Use the existing ground-segment still and the mission's Data-mode frame.

**C6. A "why it matters" line per level (S).** Each level has a guiding question but not a stakes line. Add one plain
sentence above the question, for example for the focal plane: "The detector is kept cold so its own heat does not drown
the signal." Use only claims already in the evidence files.

### D. Visuals

**D1. The plume is the hero moment and is the weakest frame (M to L).** Fill the stage: camera low and close, the
plume 4x larger, lit from within in the MWIR band color, a visible thin atmosphere layer it climbs through, and the
molecules arranged as a small inset rather than floating around it (`d-lvl5-plume-light.png`). Stay generic: no
vehicle, no site, no values. Where: `src/scenes/plume.js`, `plume-illustration.js`.

**D2. Photon stream (M)** (carried from yesterday). Glowing band-colored ribbons from plume to pixel on Light, built
with the IF flow-ribbon technique. Start with the ring-to-satellite and telescope-to-detector legs.

**D3. Make Data and Heat visibly different on hardware levels (M).** Satellite, payload and focal-plane levels look
nearly the same in all three modes (`d-lvl1-satellite-light.png` versus `d-lvl1-satellite-heat.png`); only a few
thin lines and the legend change. In Heat: tint parts by relative temperature on a cool-to-warm ramp (labeled
"illustrative, not measured") and fade the non-thermal parts to 30%. In Data: dim the structure and let bus and
frame paths glow. Where: `src/scenes/scene-look.js`/`teaching-flows.js` and the per-scene `look` objects.

**D4. Remove printed text from hardware (L)** (carried). "FLIGHT COMPUTER", "PAYLOAD PROCESSOR", "MLI BLANKET" on
boxes (`d-lvl1-satellite-heat.png`) read as a toy kit. Replace with pins and callouts; MLI should be crinkled gold,
not a flat tan board. Bump GLB `?v=N`.

**D5. Legend and note overlays cover the model (S).** The bottom legend and "Representative geometry / not to
scale" box sit on the geometry in the satellite, payload and ground levels (`d-lvl1-satellite-heat.png`, `d-lvl6-ground-light.png`).
Make them one compact strip below the stage, or fade to 40% opacity while the camera moves.

**D6. Ring level opened from the tab bar is small again (S).** `d-lvl0-orbits-light.png`: Earth about 35% of the stage with
big empty corners. Use the same camera as the returning-visit opening frame. Where: camera defaults in `orbits.js`.

**D7. Add a scale bar to every level (S)** (carried). `.scalebar` exists in `styles.css`; use it with representative
dimensions only where a published figure exists, otherwise "not to scale" stays.

**D8. Light-time for the ring (S).** The cited 0.12 s is only in the Scenario tab. Put it on the stage as a
pulse from the GEO satellite to the ground with the "0.12 s" label (Calc. chip). It is the easiest wow that is already sourced.

### E. Animation

**E1. What wows now:** the story hero Earth with the orbit lines; the mission's GEO ride; the payload "Inside" cutaway with
the scan mirrors; the focal-plane exploded stack; the camera flights between parts. Keep them.

**E2. Weak or too slow:** the mission autoplay (C2); the Play-sequence steps (about 4 s each over 9 steps with a
camera that does not move, `d-payload-seq2.png`: the model stays small while captions change below it). Fix: each
sequence step must frame the part it describes (camera flight with `camera-path.js`) and highlight it.

**E3. Static things that should move:** footprints on the ring level should sweep (yesterday's #2); the plume should rise
and pulse; the focal-plane cold finger and radiator should show a slow glowing heat flow in Heat mode; the ground
level's antenna should track and the screen should flash a generic alert at the end of the mission.

**E4. Add an ease-in intro on level change (S).** Level switches are instant cuts in tab clicks; a 600 ms camera
push-in from a farther start makes every level feel like a "zoom in" which is the site's premise.

### F. Cuts (bold but justified)

1. **Cut Auto-cycle.** The mission does the same thing with captions. One fewer duplicate control (B1).
2. **Cut Play the day / Pause the day as a button.** Make the day always run; keep a scrubber if needed.
3. **Merge Play sequence / Step / Reset into Next.** Three controls plus a counter for a feature most visitors will
   not find. If kept, show only when the part has an animation and fold Step/Reset into one menu.
4. **Hide "Follow a spacecraft - Motion details" behind chips (B2).** Its explanation paragraph is dense and sits under the stage.
5. **Merge Scenario into the Parts panel as a "Try it" section on the three levels that have a real calculation
   (ring, pixel, atmosphere).** On the other levels Scenario repeats the same three examples (travel time, wavelength,
   blackbody) with a "Connected to this level" label, which is the same content the learning question already links to
   (`d-scenario.png`). Two tabs for one feature costs a decision on every level.
6. **Cut the "Related views" button list on every level** (Ground segment, Civil twin ABI, TIRS-2, Atmosphere repeated
   on each of ten levels, `d-lvl5-plume-light.png`). Keep one "Side levels" row in the top level picker; the phone already does this.
7. **Cut the "..." menu's duplicate "Watch the mission" and "Present/Hide details".** Keep Share, Rendering, Controls
   and shortcuts.
8. **Consider cutting the separate Parts page** (87,000 px on desktop, 145,000 on phone, about 20,500 words). It duplicates the in-visualizer cards
   and the Glossary. If Reed wants it for SEO, add anchor navigation and collapse each assembly by default.
9. **Evidence page is 167,000 px tall on desktop and 369,000 px on phone (44,900 words).** Do not cut the content (it is the
   site's rigor), but paginate or virtualize: search box first, group collapsed by level, and a "jump to level" row.
   A phone cannot scroll that.
10. **Fold the civil-twin side levels (ABI, TIRS-2) and the Atmosphere side level into one "Real instruments" level** if time
    is short; they look and behave like the payload level and each add 7 to 9 parts. At minimum, remove the sequences
    and Light/Data/Heat toggles from the Atmosphere level, which is a single static column with five parts
    (`d-lvl9-atmosphere-light.png`).

## Suggested order for Codex

1. A1, A2, A5, A3, A4, A6 (glitches, mostly S).
2. B1 to B3 (controls), then C1, C2, C3 (story), verifying with the control-count and stage-height gates.
3. D1, D3, D6, D5, then D2 and E3.
4. Cuts F5 to F7 once B is done; F8 to F10 are Reed's call.

## Rules that still apply

- `AGENTS.md`: public sources only, evidence labels, `claims.mjs` at 0, gates before merging; branch per item; no
  pushes or deploys until Reed says so. If a permission check blocks something, stop and report it.
- Any new on-stage event (launch, alert) is a generic illustration: no real vehicle, site, timeline, threshold, or
  detection performance.
