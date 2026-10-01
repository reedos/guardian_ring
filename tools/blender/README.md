# Hardware asset pipeline

The explorer loads versioned GLBs from `public/models/`. Each `build-*.py` is the source of its hardware geometry; JavaScript supplies lighting, printed role labels, teaching paths, and interaction.

The Phase 2 look prototype adds six static Blender studies. Run `build-orbit-look.py`, `build-hardware-look.py`, and `build-plume-look.py` in Blender background mode, then `encode-look.py` with Python and Pillow. PNGs are saved under ignored `research/look/renders/`; twelve landscape/portrait WebPs go into `public/look/`. The orbit builder uses the NASA textures documented in `research/look-assets.md`, stored locally under `research/look/textures/`.

The detailed spacecraft and payload builders share `hardware-detail.py`: open structural decks, equipment enclosures, circuit boards, connectors, mechanisms, thermal links, and solar-array construction. The focal-plane builder separates the detector/ROIC package, cold enclosure, carrier, flex, and warm video electronics. Generic part counts, positions, proportions, colors, and wires are drawing choices.

Run a builder with Blender 5.2 in background mode. Every rebuilt GLB must receive a new `?v=N` key at its load site, matching its exported version metadata. Geometry is representative/as drawn unless an opened public source dimensions it. No manufacturer logos or invented part numbers or masses.

`render-authored.py -- satellite payload focal-plane` renders desktop and phone story images from the actual shipped GLBs. It uses the original lighting/fitting helpers without running their prototype geometry builders. `encode-look.py` converts the resulting local PNGs to WebP. This keeps the story imagery aligned with the interactive cutaways.
