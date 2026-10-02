# Hardware asset pipeline

The Explorer loads ten versioned GLBs from `public/models/`. Their `build-*.py` scripts own the hardware geometry; JavaScript supplies lighting, role labels, teaching paths, camera interaction, and source-linked component anatomy. Civil references establish component identities and selected counts, not the drawings' dimensions or complete construction.

## Builders and assemblies

`hardware-detail.py` supplies shared structural decks, enclosures, circuit boards, connectors, mechanisms, thermal links, and solar-array geometry. `build-satellite.py` uses these to expose twelve parent assemblies with named internal equipment.

`build-payload.py` and `payload-expansion.py` produce payload v7 with thirteen parent anchors. They separate the two scan-mirror drives, encoder/bearing supports, telescope focus and port-cover hardware, calibration examples, stationary beamsplitters/filters/stops, cold detector package, SUE and EU electronics, data interface, power conversion, and cooling path. The port cover is spring-deployed after release; the solar-calibration cover is a separate motor-driven mechanism. No filter wheel or physical deep-space calibration target is implied.

`build-focal-plane.py` produces focal-plane v4 with eight parent anchors: array, readout, cold stage, shield, flex, carrier, bias/timing, and thermal feedback. It distinguishes the cold detector/ROIC package from warm video electronics and shows a separate thermometer-to-controller-to-cooler path. Board packages, repeated elements, traces, harnesses, and thermal supports are representative; no pixel format or ADC implementation is inferred.

The remaining builders produce the ring, detector element, plume, ground segment, ABI, TIRS-2, and atmospheric illustration. `THIRD_PARTY_NOTICES.md` lists the complete asset inventory. No manufacturer logos, invented part numbers, or assigned hardware masses are permitted.

## Export and story stills

Run builders with Blender 5.2 in background mode. GLBs export Y-up with named anchors and drawing metadata. Every rebuild requires a matching version increase in the builder/export metadata and the scene's `?v=N` URL; current expanded assets are `payload.glb?v=7` and `focal-plane.glb?v=4`. A successful export does not establish browser acceptance.

`render-authored.py -- satellite payload focal-plane` imports the shipped GLBs and renders separate desktop and phone story views. It reuses the approved lighting/fitting helpers without executing the old prototype geometry builders. Rerun the relevant stills after a GLB changes so the story and interactive cutaway agree.

`build-orbit-look.py`, `build-plume-look.py`, and the pixel study in `build-hardware-look.py` supply the other story renders. Source PNGs stay under ignored `research/look/renders/`; `encode-look.py` uses Python/Pillow to create the twelve WebPs in `public/look/`. The historical NASA Earth textures remain under `research/look/textures/`; the interactive globe embeds its delivery derivatives. Credits, hashes, and drawing assumptions are recorded in `research/look-assets.md`.

The responsive system diagrams are HTML/SVG authored in `src/pages/system-diagrams.js`, not Blender renders. They reuse the component catalog's evidence and illustrate selected functional connections. Final built-preview GPU gates and visual inspection remain required after model or camera changes; results belong in `research/gate-results.md`.
