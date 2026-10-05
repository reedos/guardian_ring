# The Guardian Ring: build plan

A public, cited 3D explainer of how an overhead persistent infrared (OPIR) satellite sees a
rocket launch from orbit, and how that detection becomes a warning on the ground. Built to the standard of
**The Intelligence Factory** (`C:\Users\reedo\projects\intelligence_factory`, live at
https://reedos.dev/intelligence_factory/), and published at `https://reedos.dev/guardian_ring/` when Reed says so.

Plan written 10/01/2026 for Codex to build from. Owner: Reed. Read `AGENTS.md` before any work.

---

## 1. Premise

One physical system you can zoom through, from the whole Earth down to a single detector pixel, with
three layers drawn through the same geometry and every number either cited to a public source or labeled as
this site's own calculation or assumption.

The story in one sentence: **a rocket plume's heat crosses tens of thousands of kilometers of space, lands
on a few pixels of a detector colder than the far side of the Moon, and becomes a warning in seconds.**

What the reader should leave knowing:

1. Why missile warning watches in the infrared, and in which bands (the CO2 and H2O plume bands, and the
   atmosphere that hides or reveals them).
2. Why the constellation uses several orbits (GEO for persistence, highly elliptical for the poles, and
   the newer MEO and LEO layers for resilience and tracking), and what each orbit trades.
3. How an IR payload works: telescope, scanning vs. staring sensors, a cooled focal plane, and why cooling
   is the hardest engineering problem on the satellite.
4. How a detection flows: frames → onboard processing → downlink → ground processing → a warning.
5. What is public and what is not. The site says so openly, and uses published civil sensors (GOES ABI,
   Landsat 9 TIRS-2) to show the same physics with real numbers.

## 2. The standard: The Intelligence Factory

The Intelligence Factory (IF) is the reference implementation. Match it in structure, rigor, polish and
code conventions. Copy its scaffolding, not its git history: start a fresh repo and bring files over
deliberately, renaming `ifx` to `grx` and IF-specific content out.

Study these first (paths relative to the IF repo):

| Area | IF files | Carry over |
|---|---|---|
| Page split | `index.html` (long-form story page), `visualizer.html` (full-screen explorer), `evidence.html`, `method.html`, `glossary.html`, `src/pages/*` | Same five pages, same roles |
| Evidence model | `src/evidence.js` (BASIS, CALCS, ASSUMPTIONS, `evOf`, `problems`, `STRICT = true`), `src/sources.js` (SOURCES, PART_SOURCES), `src/claims.js`, `tools/claims.mjs` | **Verbatim** shape and labels: Spec / Vendor / Reported / Calc. / Assumed. Spec rows are `[label, value, basis, {refs \| calc \| assume}]` |
| Scenario engine | `src/model/engine.ts` + `engine.test.ts` | Pure, DOM-free, unit-tested `compute(scenario)` that every card and scene reads |
| Cards | `src/data.js` (`PARTS[sceneId] = [{ id, title, kicker, body, specs, drill? }]`) | Same shape and voice |
| Scenes | `src/scenes/*.js` contract: `preload()`, `build({ quality, model })` → `{ scene, flows, camera, hotspots, dataHotspots, heatHotspots, look, update(t) }` | Same contract; layer names change (§4) |
| Viewer | `src/app/stage.js`, `store.js`, `render-quality.js` (quality governor, TIERS), `camera-path.js` + `occupancy.js` (flights that avoid geometry), `part-cycle.js`, `sources-ui.js`, `share.js` | Copy and adapt. Keep Max quality / Auto quality / Battery saver, part nav beside the auto-cycle, previous/next always in view |
| Test hook | `window.ifx` in `src/visualizer.js` (`show`, `settle`, `setTransitions`, `quality`, `built`, ...) | `window.grx` with the same members from day one |
| Gates | `tools/cycle.mjs`, `views.mjs`, `parts.mjs`, `ui.mjs`, `coplanar.mjs`, `perf.mjs`, `flights.mjs`, `links.mjs`, `govern.mjs`, `claims.mjs` | All of them, adapted; see §9 |
| 3D assets | `tools/blender/build-*.py` run headless, GLBs in `public/models/*.glb` loaded with `?v=N`, printed labels via `src/scenes/print-kit.js` (`userData.printed`) | Same pipeline. Nothing detailed is hand-modeled in JS |
| Design | `src/styles.css` tokens: `--ground #000`, `--surface #0b1015`, `--ink #f0f0fa`, `--muted #aab2b9`, **`--accent #e6ba82`**; Barlow Condensed (display), Manrope (body), IBM Plex Mono (eyebrows, kickers, labels) | **Same tokens and type.** Reed's explainers share one signature look; no per-site accent. Only the domain color classes change (§7) |
| Deploy | `.github/workflows/pages.yml` (manual dispatch: tsc, test, build, Pages), `preview.yml` (Cloudflare Pages branch previews) | Same two workflows; preview project name `guardian-ring` |
| Crawlers | canonical links, noindex until launch, prerendered text for Evidence/Method/Glossary, `llms.txt`, JSON-LD (being added to IF on branch `seo/static-text` as of 10/01/2026; copy once merged) | Same, but **noindex stays on until Reed launches** |

Things IF learned the hard way, so do them from the start:

- Give heavy scene tests explicit timeouts; CI runners are about 2× slower (`testTimeout: 30000` in `vite.config.ts`).
- Phone layouts: grid and flex children default to `min-content`; set `min-width: 0` / `min-height: 0` where panes share a track.
- Every GLB URL carries `?v=N`; bump it on every rebuild (Cloudflare caches `.glb` at the edge for a day).
- A part's camera view must never sit inside geometry; `flights.mjs` checks every move between parts.
- Real-GPU Playwright for gates: `chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] })`, then `grx.setTransitions('instant')`, `grx.show({ scene, mode, part })`, `grx.settle()`.

## 3. Scope rules (non-negotiable)

- **Public, unclassified sources only.** Government (Space Force / SSC, SDA, MDA, GAO, CRS, DoD budget
  justification books, NASA, NOAA), manufacturers' official pages, peer-reviewed or SPIE papers, standard
  textbooks. Trade press only as "Reported", attributed.
- **Explain physics and architecture.** Do not estimate or imply the classified performance of any real
  system: no sensitivity, detection threshold, minimum detectable plume, false-alarm rate, resolution or
  focal-plane format for SBIRS, Next-Gen OPIR, SDA Tracking Layer, HBTSS or MEO MW/MT unless a public
  source states it.
- **Nothing about defeating these systems**: no evasion, countermeasures, spoofing, blind spots or
  targeting. If a sentence would help someone hide a launch, it does not go on the site.
- **The civil twin carries the detail.** Where the military payload's specifics are not public, the site
  shows the published civil sensor (GOES-R ABI, Landsat 9 TIRS-2) with real figures, labeled as that
  sensor, and explains the physics that scales. Never present a civil figure as a military one.
- **Generic military hardware is drawn as representative.** Satellites, telescopes and focal planes are
  "as drawn", schematic, with no manufacturer logos and no invented part numbers or masses.
- **Publication statement** (in the hero note and footer of every page, verbatim unless Reed edits it):
  > Personal educational project based on cited public sources. Not an official publication of my employer
  > or of the agencies or companies discussed. Models are schematic; estimates and assumptions are identified.
- American English, month/day/year dates, plain prose. No unverified claim stated as certain.

## 4. Structure: levels, layers and parts

### Layers (the IF power/data/heat triplet, adapted)

| Layer | Shows | Color family |
|---|---|---|
| **Light** | Infrared photons from plume to pixel: emission bands, atmospheric absorption, optics, the image on the focal plane | IR false-color: SWIR, MWIR and LWIR band colors (§7) |
| **Data** | Frames, onboard processing, crosslinks, downlink, ground processing, the warning | IF's data colors |
| **Heat** | The thermal and power budget: sunlight in, solar array power, electronics heat, cryocooler, radiators, detector temperature | IF's heat colors plus a cryo blue |

Every level has parts in all three layers, like IF.

### Main levels (macro to micro, like IF's six)

Each entry lists scale, what is drawn, and starter parts per layer. Parts become numbered pins and cards.

**1. The ring (orbits), about 100,000 km.** The Earth with the constellation: GEO ring, two highly
elliptical (Molniya-type) orbits over the pole, the MEO epoch planes, the LEO tracking planes. Coverage
cones, the launch event (a generic plume rising from a generic site, never a real country's launch
complex), detection lines from satellites to the plume.
- Light: plume emission, the view from GEO (Earth disk), limb vs. see-to-ground viewing, LEO's
  above-the-horizon geometry.
- Data: crosslinks, downlinks to ground, latency budget (light-time GEO to ground is about 0.12 s).
- Heat: sun angle, eclipse seasons, why GEO sees the Sun almost all year.
- Sourced facts: SBIRS in GEO and highly elliptical orbits (`crs-nc3-primer`); Next-Gen OPIR GEO + polar
  + ground (`crs-nc3-primer`); SDA Tranche 1 Tracking: "28 satellites in four planes", wide-field-of-view
  IR sensors (`sda-tranche1-award`); GEO 35,786 km; Molniya 63.4° inclination, about 12 h period.
- Calcs: orbital period from altitude, visible Earth fraction and footprint per orbit, revisit, satellites
  needed for continuous coverage at a minimum elevation.
- **Centerpiece view: the geosynchronous constellation (Reed, 10/01/2026).** The opening shot of the
  visualizer and of the story page. Earth and the GEO spacecraft turn together in the inertial view,
  preserving their ground longitudes, so the reader sees "geosynchronous" instead of reading it. A day
  passes in seconds, the night side changes with respect to the Sun, and each satellite's footprint stays
  fixed on the ground. Satellites are spaced around the belt for worldwide coverage, with one footprint
  over the Americas so a US reader finds home first. The highly elliptical orbits loop over the North Pole
  to fill the gap GEO cannot see; the MEO and LEO layers fade in as a second beat ("the next
  architecture"). Overlap zones are where two satellites see the same launch. Slot longitudes are
  **schematic** unless an official public source gives them (amateur tracking does not count); say so on
  the card. Controls: play/pause the day, toggle each orbit family, tap a satellite to fly to level 2.

**2. The satellite, about 15 m.** A representative GEO OPIR spacecraft: bus, solar arrays, radiators,
sunshade, the payload, antennas.
- Light: where the payload looks, the sunshade, stray-light baffles.
- Data: onboard processor, downlink antennas, crosslink terminal (optical or RF, labeled representative).
- Heat: solar array power in, the heat budget, radiators on the anti-sun faces.
- Sourced: SBIRS scanning and staring sensors (from the Space Force fact sheet once it is opened; it is
  not verified yet, see §6); otherwise Assumed with reasons.

**3. The payload (telescope), about 2 m.** Telescope, scan mirror, filters, the cold region.
- Light: the optical path (draw a short Schmidt-type telescope only if the SBIRS fact sheet confirms it;
  otherwise a representative reflective telescope, "as drawn"), field of view, scanning vs. staring.
- Data: the focal plane readout to the processor.
- Heat: the cold stage, thermal straps, the cryocooler, the warm electronics.
- Calcs: diffraction-limited angular resolution (1.22 λ/D), ground spot at range, field of view vs.
  Earth disk.

**4. The focal plane, about 10 cm.** A cooled detector array on its cold finger: sensor chip assemblies,
filters, readout integrated circuits, the cryocooler head.
- Light: band filters (SWIR, MWIR, see-to-ground), how a pixel integrates photons.
- Data: readout, frame rate, data rate (Calc. from the scenario's array size, frame rate and bit depth,
  all labeled Assumed for the military case and Spec for the civil twin).
- Heat: why the detector must be cold (dark current), operating temperatures by detector type, cryocooler
  heat lift and input power (Calc. from a Carnot fraction, Assumed with a NIST source).

**5. The pixel, about 30 µm.** One detector element: absorber layer, indium bump, readout cell.
- Light: photons in, electrons out, quantum efficiency.
- Data: charge on the integration capacitor, digitization.
- Heat: thermal generation competing with the signal.
- Calcs: photons per second from a stated plume radiant intensity at range through the aperture (the
  intensity is an Assumed, illustrative value from open plume literature, explicitly "not any real
  missile" and "not any real sensor's threshold").

**6. The photon (the plume), meters to kilometers.** The source: a generic rocket plume's IR emission.
- Light: the CO2 band near 4.3 µm and the H2O band near 2.7 µm, why those bands are absorbed by the lower
  atmosphere and how the plume rises above it.
- Data: none beyond the event time; use this layer for the timeline (ignition, burnout).
- Heat: plume temperature, afterburning (general physics only).

### Side levels (drill-ins, like IF's module/CPO/coherent/copper)

- **Ground segment.** Mission control and processing as publicly described (SBIRS ground at Buckley SFB,
  FORGE, the OPIR Battlespace Awareness Center) drawn as a representative operations floor and antenna
  farm. Data layer: how a detection becomes a warning (generic, sourced stages only).
- **Civil twin: GOES-R ABI.** The published sensor in detail: 16 bands, scan cadence (full disk every
  10 min, CONUS every 5 min, mesoscale every 30 to 60 s), telescope, focal planes, cryocooler, with
  figures from the GOES-R Series Data Book.
- **Civil twin: Landsat 9 TIRS-2.** QWIP arrays of 640 detectors, 1,850 effective pixels across a 185 km
  swath at 100 m, bands 10.6 to 11.2 and 11.5 to 12.5 µm, a two-stage cryocooler holding 43 K, f/1.64
  refractive telescope with a 15° field of view (all from `landsat9-tirs2-nasa`).
- **The atmosphere.** A column of air with the absorption bands drawn as layers; why "see-to-ground"
  bands and "above-the-horizon" bands exist.

### Scenario engine (the four IF choices, adapted)

`compute(scenario)` in `src/model/engine.ts`, pure and unit-tested. Inputs:

| Choice | Options | Default |
|---|---|---|
| Orbit | GEO 35,786 km · HEO (Molniya-type) · MEO (altitude Assumed from the MEO MW/MT program once sourced) · LEO (about 1,000 km, `gao-26-107085`) | GEO |
| Aperture | a few diameters, labeled Assumed for military; ABI's published aperture for the civil twin | representative |
| Band | SWIR · MWIR (4.3 µm) · LWIR | MWIR |
| Detector | HgCdTe · InSb · T2SL · QWIP, each with an operating temperature from open literature | HgCdTe |

Outputs every card and scene reads: period, footprint, visible fraction of Earth, slant range, diffraction
spot on the ground, photon rate from the illustrative plume, background photon rate from a 288 K Earth in
band (Planck, Calc.), detector temperature, cryocooler input power, frame data rate, downlink latency.
All outputs are Calc. with a CALCS entry giving the formula. Tests pin known values (GEO period about
23 h 56 min; Molniya period about 11 h 58 min; GEO light-time to nadir about 0.119 s).

A "Show the math" panel like IF's token matrix: for the selected pixel, step through photons in →
electrons → counts, with each number's formula and label.

## 5. Story page

`index.html`, IF's structure: hero (`h1`, `.tagline` with accent spans, `.lede`, hero note with the
publication statement), then sections:

1. A launch, seen from 36,000 km (the headline numbers, all labeled).
2. Why infrared: the plume bands and the atmosphere.
3. Why several orbits: GEO, the poles, MEO and LEO.
4. Inside the payload: telescope, focal plane, cold.
5. From pixel to warning: the data path.
6. What's public and what isn't, and why the civil twins are here.
7. How it was made (IF's section, adapted: AI coding assistants, Reed's role, the evidence rule, the checks).
8. Sources and footer.

Every figure on the story page carries an evidence chip opening the same popover as the visualizer.

## 6. Evidence plan

`research/sources-seed.md` holds the source log from 10/01/2026, organized A to E with ids, URLs and quotes.
Its status is mixed, and the build must respect that:

**Verified (opened and quoted), usable now:**
- `crs-nc3-primer`: SBIRS GEO + highly elliptical orbits; Next-Gen OPIR composition; FY2026 funding.
- `sda-tranche1-award`: 28 satellites in four planes, wide-field-of-view IR, two performers.
- `noaa-abi-page`: 16 bands, cadence, 3.9 µm fire band.
- `landsat9-tirs2-nasa`: QWIP format, bands, 43 K, 185 K telescope, f/1.64, 15° FOV.
- `gao-26-107085`: WFOV vs. MFOV framing, about 1,000 km LEO, contract totals (re-check exact wording before quoting).

**Found but NOT verified (403, TLS errors, size limits, or search-snippet only). Open each directly
(curl or a browser) before citing; until then nothing from them goes on the site:**
- Space Force SBIRS fact sheet, DoD SBIRS fact sheet PDF (payload descriptions, masses, telescope type).
- MDA HBTSS fact sheet.
- **GOES-R Series Data Book** (`https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf`,
  over 10 MB; download it). It is the best single source for the civil twin's aperture, detectors,
  focal-plane temperatures and data rates.
- AMS BAMS "A Closer Look at the ABI" (Schmit et al. 2017).
- GAO-21-105249 (Next-Gen OPIR cost and schedule).
- SSC MEO MW/MT CDR release; SSC OBAC/FORGE release; NIST cryocooler papers; NASA NTRS IR detector overview.
- NASA Earth Observatory "Catalog of Earth Satellite Orbits" for orbit definitions.

**Not public (must be omitted or clearly Assumed and illustrative):** military sensor sensitivity,
thresholds, focal-plane formats and detector materials, operational satellite status, ground-software
internals, masses of newer satellites. Launch dates where sources conflict (Next-Gen OPIR GEO-1) are
attributed ranges, not fixed dates.

Rules carried from IF:
- `STRICT = true`; no legacy labels.
- A source records title, publisher, URL, published or dated, accessed, kind, and `marketing: true` for
  vendor pages. A fetch failure is recorded as `unchecked` with the reason.
- A claim citing a source carries the exact sentence or the page section it rests on.
- `tools/claims.mjs` walks every scenario combination and must report 0 problems.

## 7. Look

Prototype the look first and get Reed's sign-off before architecture (his standing rule): a single static
page plus one 3D still per main level, in IF's tokens.

- **Same signature look as IF**: black ground, `#0b1015` surfaces, amber `#e6ba82` accent, Barlow
  Condensed / Manrope / IBM Plex Mono, same eyebrow and kicker treatment, same chips, same pane.
- **Domain color classes** (new, in `:root` next to IF's): SWIR, MWIR and LWIR band colors, a plume color,
  cryo blue for the cold stage, and the data and heat colors carried from IF.
- **Scenes**: night-side Earth with city lights and a thin atmosphere limb; the plume as the one hot
  object; the satellite in hard sunlight against black; the payload interior in the restrained hardware
  style of IF's module and CPO levels; the focal plane at IF's tray/CPO PCB detail level.
- Spectacle where it teaches: the coverage cones sweeping the Earth, the photon stream narrowing through
  the telescope onto three pixels, frost-blue cold parts beside warm electronics.

### Blender asset list (generated by `tools/blender/build-*.py`, never hand-modeled)

1. `earth-orbits.glb`: Earth (or a procedural sphere with texture maps from a public-domain NASA source,
   credited in THIRD_PARTY_NOTICES.md), orbit rings, generic satellites as instanced proxies.
2. `opir-satellite.glb`: representative GEO bus, arrays, radiators, sunshade, payload housing, antennas.
3. `opir-payload.glb`: telescope, scan mirror, baffles, filter wheel or band filters, cold shield.
4. `focal-plane.glb`: sensor chip assemblies on a cold plate, flex leads, cryocooler head, thermal straps.
5. `pixel.glb`: one detector element cross-section (absorber, contact, indium bump, readout cell).
6. `ground-ops.glb`: representative operations floor and an antenna farm.
7. `abi-twin.glb` and `tirs2-twin.glb`: the civil sensors, dimensioned from their published documents.

## 8. Architecture

```
guardian_ring/
  index.html  visualizer.html  evidence.html  method.html  glossary.html
  src/
    app/        stage.js store.js render-quality.js camera-path.js occupancy.js part-cycle.js sources-ui.js share.js ...
    scenes/     orbits.js satellite.js payload.js focal-plane.js pixel.js plume.js
                side-ground.js side-abi.js side-tirs2.js side-atmosphere.js print-kit.js
    model/      engine.ts engine.test.ts orbits.ts radiometry.ts radiometry.test.ts
    pages/      evidence.js method.js glossary.js (+ data)
    data.js evidence.js sources.js claims.js kit.js fx.js styles.css
  public/models/*.glb
  tools/        claims.mjs cycle.mjs views.mjs parts.mjs ui.mjs coplanar.mjs perf.mjs flights.mjs govern.mjs links.mjs shot.mjs
  tools/blender/build-*.py
  research/     sources-seed.md + one note per source cluster
  .github/workflows/pages.yml preview.yml
  README.md THIRD_PARTY_NOTICES.md LICENSE AGENTS.md PLAN.md
```

- Vite + TypeScript + Three.js at IF's versions (`three@^0.183.2`, Vite 8, Vitest 5), `base: './'`.
- Dev server `127.0.0.1:47600`, preview `47601` (IF uses 47400/47401).
- `window.grx` mirrors IF's `window.ifx`.
- Physics in `src/model/radiometry.ts` (Planck in-band radiance, photon flux, diffraction) and
  `src/model/orbits.ts` (period, footprint, visibility, slant range), both pure and tested against
  textbook values.

## 9. Quality bar and gates

Same bar as IF: professionally designed on phone and desktop, dark-first, loading/empty/error states,
nothing overlapping, every part framed, no camera move through geometry, no page errors, and
performance inside IF's budgets (worst p95 frame time about 15 ms desktop and about 7 ms phone on Reed's
PC, real GPU).

| Gate | Passes when |
|---|---|
| `npx tsc --noEmit` | clean |
| `npx vitest run` | all pass, including engine, radiometry and orbit tests pinned to known values |
| `npx tsx tools/claims.mjs` | 0 problems across every scenario |
| `cycle.mjs` | every scenario × level × layer with no page errors |
| `views.mjs desktop` / `phone` | every part framed clear of overlays |
| `parts.mjs` | every numbered part has a pin and a card |
| `labels.mjs desktop` / `phone` | printed names are unobstructed when shown, every nameplate has a clear authored desktop view, selected component callouts stay readable |
| `ui.mjs` | controls don't collide, phone and desktop |
| `navigation.mjs desktop` / `phone` | Next inspects every part, manual animation steps focus their subjects, overview stays unselected, responsive framing and Back preserve the reader's view |
| `learning.mjs desktop` / `phone` | playback, source-reading hold, reduced-motion stepping, retained scenarios and nested side visits work |
| `mission.mjs desktop` / `phone` | guided chapters and orbital follow views stay clear and usable; pause, source-reading hold, reduced motion, interruption, and cancellation preserve the reader's choices |
| `activity.mjs desktop` / `phone` | every hardware scene and layer responds immediately with a meaningful activity pose; motion, repeat, explicit pause, reduced motion, source/lifecycle suspension, selected-part framing, orbital follow and shared follow preserve the reader's intent |
| `project-audit.mjs desktop` / `phone` | keyboard focus, repeated scenario links, hidden-family selections, and filtered or malformed reference fragments work in pages and embedded references |
| `coplanar.mjs` | no flush surfaces that flicker |
| `flights.mjs` | 0 camera moves through geometry, both forms |
| `perf.mjs desktop` / `phone` | inside budget |
| `links.mjs` | every story-page link lands on its part |

`npm run gates` runs 38 serialized browser commands. The activity runs cover all nine hardware scenes ×
three layers for running, deliberately paused, and reduced-motion states; they also cross natural repeat
boundaries in each atmosphere layer. `tools/gate-report.mjs` requires complete, current-build activity
inventories alongside the other full-scope results. Performance budgets remain unchanged.

The 10/04/2026 audit adds audit-layout (stage height, title contrast, guide geometry, callouts and follow clearance); controls-audit (visible control counts, orbit controls, Next and phone sheet gestures); story-audit (generic launch/alert chapters, tour duration and phase selection); visual-audit (plume, hardware layer colors, framing and mechanism motion); cuts-audit (Parts semantics, Try it placement, side-level navigation and removed duplicates). Desktop and phone runs are required. Stage height must remain at least 60% of the desktop viewport and 45% of the phone viewport, including open Parts and playback states. First load is limited to 20 visible controls on desktop and 12 on phone. Generate the final acceptance report with `npx tsx tools/gate-report.mjs`; set `GR_URL` to the matching built preview when using an isolated port.

## 10. Phases (stop for Reed at each ★)

0. **Scaffold.** Fresh repo, IF scaffolding copied and renamed, empty levels, `window.grx`, gates running
   on a placeholder scene, CI green. Private GitHub repo `reedos/guardian_ring` only if Reed asks; local first.
1. **Sources.** Open every unverified source in §6 directly and quote it into `research/`. Download the
   GOES-R Data Book. Produce a verified-fact table per level. ★ Reed reviews what is and isn't public.
2. **Look prototype.** Static story-page mock and one 3D still per main level in IF's look, shown at
   desktop and 390 px. ★ Reed signs off on the look.
3. **Engine.** `engine.ts`, `orbits.ts`, `radiometry.ts` with CALCS/ASSUMPTIONS entries and tests.
4. **Levels 1 to 6.** Scenes, cards and all three layers, one level at a time, each passing every gate
   before the next starts.
5. **Side levels.** Ground segment, ABI, TIRS-2, atmosphere.
6. **Story page, Evidence, Method, Glossary**, prerendered text, `llms.txt`, JSON-LD (noindex still on).
7. **Fidelity and polish pass**: Blender detail, camera flights, phone pass, performance. ★ Reed's phone check.
8. **Launch** only on Reed's go: public repo, Pages deploy to `reedos.dev/guardian_ring/`, noindex off,
   sitemap entry added to the root `reedos.dev/sitemap.xml` (portfolio repo), portfolio card.

## 11. Open questions for Reed

1. Depth of the ground segment: a full side level, or a short data-layer coda on level 1.
2. Include MDA's HBTSS (medium field of view, fire-control-quality tracking) or keep to warning.
3. Show real constellation positions (public orbital elements) or a schematic constellation only.
   The plan assumes schematic.
4. Whether to say which agencies' public documents the site leans on in the hero, or only in the footer.
