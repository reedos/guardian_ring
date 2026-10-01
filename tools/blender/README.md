# Hardware asset pipeline

Phase 0 includes only a neutral test cube with no physical scale. It is not a hardware asset.

The Phase 2 look prototype adds six static Blender studies. Run `build-orbit-look.py`, `build-hardware-look.py`, and `build-plume-look.py` in Blender background mode, then `encode-look.py` with Python and Pillow. PNGs are saved under ignored `research/look/renders/`; twelve landscape/portrait WebPs go into `public/look/`. The orbit builder uses the NASA textures documented in `research/look-assets.md`, stored locally under `research/look/textures/`.

After look approval, generate detailed interactive hardware using `build-*.py` here and save GLBs under `public/models/`. Every rebuilt GLB must receive a new `?v=N` key at its load site. Phase 2 exports no GLBs and adds no interactive scenes. Geometry is representative/as drawn unless an opened public source dimensions it. No manufacturer logos or invented part numbers or masses.
