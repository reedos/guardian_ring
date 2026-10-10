# Open-item inventory — 10/07/2026

Baseline main: `3496fc4`. Candidate: `astra/gr-1`. This inventory reconciles all
required reviews with current code and real-GPU captures. Screenshots live under
`shots/astra-gr1/before/` and `after/`, at 1440×900 and 360×844. Before includes
live Intelligence Factory references; original and current story assets are also
retained there. Historical acceptance is not a substitute for the candidate's
fresh full-suite results in the sprint report.

## 10/03 priorities and wave 1

| Item | Baseline | Current state and evidence |
|---|---|---|
| 1. Acceptance | Done historically | Main records 44/44 browser commands. Candidate adds two commands and reruns the complete suite; see sprint report for actual results. |
| 2. Opening Earth, atmosphere, stars, GEO and HEO | Done | `orbits.js`, `orbit-presentation.js`, `orbit-motion.js`; desktop/phone orbit captures. GEO viewing patches remain ground-fixed, following wave 1's correction. They are not real sensor coverage or scanning footprints. |
| 3. Plume composition and rising event | Done | `plume.js`, `plume-illustration.js`; both plume captures. Generic rising emission, historical textured Earth and a separate enlarged molecule inset. No real launch. |
| 4. Narrowing photon ribbons | Done | `optical-routing.js`, `teaching-focus.js`, teaching programs and optics gate. The ideal mirror demonstration is separate from named flight hardware. |
| 5. Cited hook | Done | `index.html` lede connects GEO altitude and the named TIRS-2 cold temperature with evidence chips. No Moon comparison or military temperature. |
| 6. Scale and legend | Done | Persistent schematic/not-to-scale context and layer keys in `stage.js`, visible across all ten level captures. No invented metric scale on nonmetric geometry. |
| 7. First-visit mission | Done | Mission gate covers first bare visit, explicit destinations, returning visitors, reduced motion, storage failure and cancellation. |
| 8. Spacecraft realism | Partly done | **Closed in candidate:** existing thin structure, seams, foil and connectors retained; six obsolete black label mounting plates removed in Blender; foil finish refined. Satellite GLB rebuilt as v8 with matching runtime key. Large printed role names replaced by existing numbered pins/cards. One dominant Sun, restrained ambient and a bounded real shadow map; overlays and tiny details do not cast. Phone uses a smaller map. Satellite before/after captures and performance gates cover the result. |
| 9. De-hedge topic sentences | Done in current content | `spacecraft-content.js`, `focal-content.js`, `remaining-content.js` and story headings lead with function. Scope remains in drawing rows, notes, final sentences and persistent context. Publication statement unchanged; named-instrument distinctions are retained where necessary. |
| 10. Cryocooler calc in Heat card | Open | **Closed:** `model/civil-cooling.ts` feeds engine → focal Heat cold-stage card. Cited 43 K; assumed 300 K / 1 W; calculated reversible COP, minimum work and rejected heat. Tests check energy, reversible entropy and displayed rows. General `detectorTemperatureK` remains null. |
| 11. Real civil imagery | Partly done | NOAA Kenneth Fire product comparison now appears in ABI learning details and story, with its source and pre-operational notice. Explicitly a fire product, not raw band-7 imagery. Exact archival raw wildfire movie remains open; launch imagery remains reserved. |
| 12. Fresh story stills and gate | Open | **Closed:** all six scenes rerendered at desktop/portrait sizes. Renderer rebuilds and verifies preview HTML before recording source/GLB/version/lighting/recipe hashes and image hashes. Gate rejects changed inputs, changed images or missing images. Synthetic regression also covers Windows line endings. Cache keys updated. |
| 13. Earth loop | Open | **Story closed; portfolio open:** 240 virtual-day frames form an eight-second local GEO loop. Only GEO is shown so the orbital repeat closes. Ground patches rotate with Earth. Opt-in play/pause, reduced-motion startup, hidden-page pause and still fallback have desktop/phone regression checks. Portfolio is outside this repository boundary. |

## Remaining required reviews

| Review item | State and current evidence |
|---|---|
| Public-design: avionics recovery, protection, reset and timing | Done: canonical admitted avionics ledger and component cards. No duplicated function boxes. |
| Public-design: mechanical feedback, harnesses, vents, lubrication, separation/passivation | Done: mechanical/lifecycle ledger and current component selections. |
| Public-design: optical alignment, purge, filters and material interfaces | Done: optical/environment ledger; ground equipment distinguished from flight equipment. |
| Public-design: charging/bonding, coverglass, shielding | Done: charging/surface ledger; optional coating remains optional. |
| Public-design: ground receiver, archive, backup power and conceptual pixel interfaces | Done: current ground/pixel cards and screenshots. |
| Public-design: separate ABI/TIRS assemblies | Done: nine parent selections per civil level; no invented duplicate filter assembly. |
| Public-design: latch limiter, vault, plasma contactor, filter wheel, decontamination heater, onboard purge and mission-specific boxes | Optional, not missing universal requirements. No scope expansion. |
| Public-design: GOES-R CDAU | Open/deferred: prior admissible-source gap remains. No new claim admitted. |
| UI parity: scene/layer navigation, persistent selector/transport, Overview, Present, Details, menus | Done: current controls and controls/UI/navigation/learning gates. |
| UI parity: scenario retention, component identity, catalogs, glossary, diagrams and all reference pages | Done: canonical rows and generated Parts/Evidence/Method/Glossary; page gates exercise actual links/dialogs. |
| UI parity: reference sheet, nested source dialogs, Escape/focus and search/hash recovery | Done: current reference/UI regression cases. |
| UI parity: footer, publication statement, responsive sheet and keyboard access | Done: existing contracts retained; narrow captures and full acceptance recheck. |
| Spacecraft detail: 12 spacecraft, 13 payload and 8 focal-plane selections, mechanisms and services | Done: later public-design work supersedes the earlier smaller counts. Scene/card/anchor contracts remain gated. |
| Spacecraft detail: manufactured geometry, mounted role labels, scenario resource handling and safe camera framing | Done, including realism follow-up above. Later payload/civil mounted labels serve the detailed assembly review and were not indiscriminately removed. |
| Cinematic lessons: all ten lessons, independent equations, controls, evidence and focus | Done baseline; complete cinematic gate rerun. Molecular motif remains explicitly qualitative. |
| Cinematic lessons: tiny phone calibration image and label crossing plotted line | **Closed:** result fills the phone canvas after references are explained. Reference labels sit in opposite empty plot corners with edge leaders. Calibration before/after reference and comparison captures inspected. |

## Source and visual verification

NIST's 2020 refrigeration review, PDF pp. 2–3 equation (1), was opened again for
the reversible COP. Existing NASA TIRS-2 provenance supplies only the named cold
temperature. The other inputs are assumptions. NOAA's fire page and linked image
were opened on 10/07/2026; publisher caption and pre-operational qualification stay
with the image. Network failure preserves its caption and source link.

IF comparison: existing condensed type, dark surfaces, amber signature, numbered
navigation and evidence controls already align. The spacecraft loses its large
invented nameplates and gains directional shadows. Calibration uses the available
phone diagram area. Story stills now match the current scenes; portrait hardware
framing was pulled back after visual inspection caught an edge crop.

Blender was found through the installed-application registry after initial PATH
and directory checks missed it. Existing Blender 5.2.1 LTS exported satellite v8:
67,948 triangles, 80 batches, 1,719,332 bytes. No software installed. These are
asset statistics, not physical spacecraft properties.

## Needs Reed

- Exact archival raw band-7 wildfire movie: CIRA's Texas Panhandle wildfire page
  returned HTTP 403; that action stopped without another route or tool. NOAA's
  Alaska fire movie was readable but explicitly combines a fire-temperature
  product with GeoColor, so it was not mislabeled as raw band-7. The admitted NOAA
  product still remains the illustration. Real launch imagery remains reserved.
- Portfolio integration requires work outside this brief's repository boundary;
  `public/look/ring-loop.mp4` is available for that later integration.
- Reserved PLAN scope questions and deferred CDAU evidence remain untouched.
