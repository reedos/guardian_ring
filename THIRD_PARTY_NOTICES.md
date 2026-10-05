# Third-party notices

The application scaffold and its camera, occupancy, rendering-quality and gate algorithms are adapted from Reed Cameron Osaki's The Intelligence Factory, under its MIT license. Its repository and Git history were not modified or copied wholesale.

Three.js is MIT licensed. Vite, Vitest and Playwright retain their upstream licenses. Barlow Condensed, Manrope and IBM Plex Mono are distributed under the SIL Open Font License and loaded from Google Fonts.

Research downloads are local reference copies, excluded from the website build and Git. Source notes identify their publishers and retain only short excerpts. Hardware and plume studies are original procedural Blender illustrations; no manufacturer logos or imported real-system hardware meshes are included.

## Earth imagery

Earth textures: **NASA Earth Observatory.** Blue Marble by Reto Stöckli; Black Marble images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC. Rendered and color-adjusted for this schematic.

- [Blue Marble Next Generation credits](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/).
- [Black Marble credits](https://science.nasa.gov/earth/earth-observatory/night-light-maps-open-up-new-applications-90008/).
- [NASA media usage guidance](https://www.nasa.gov/nasa-brand-center/images-and-media/).

The January 2004 surface composite and 2016 night-light composite are historical imagery, not current observations. Lighting, color and brightness have been adjusted. Source URLs, access dates, file hashes and usage review are recorded in `research/look-assets.md`. Raw textures stay outside the site build; 2K color-adjusted derivatives are embedded in the interactive Earth GLB. The page includes visible attribution. No NASA endorsement is implied.

## Shipped illustration inventory

The following files are original Blender-authored geometry or renders. The NASA-derived Earth textures described above are the only third-party image content embedded in these illustrations. Civil instrument counts admitted from NASA/NOAA publications are cited in the site's evidence records; those sources did not supply any mesh or CAD file. The plume's embedded color/alpha texture is generated procedurally by its builder.

| Interactive asset | Builder | Image/geometry provenance |
|---|---|---|
| `public/models/earth-orbits.glb` | `tools/blender/build-orbits.py` | Original globe/orbit/proxy geometry; embedded NASA image derivatives |
| `public/models/satellite.glb` | `tools/blender/build-satellite.py` | Original detailed spacecraft cutaway; shared procedural hardware helpers |
| `public/models/payload.glb` | `tools/blender/build-payload.py` | Original optical/electronics cutaway; shared procedural hardware helpers |
| `public/models/focal-plane.glb` | `tools/blender/build-focal-plane.py` | Original cold enclosure, detector/ROIC carrier, interconnect and video-board geometry |
| `public/models/pixel.glb` | `tools/blender/build-pixel.py` | Original exploded conceptual stack from the approved look builder |
| `public/models/plume.glb` | `tools/blender/build-plume.py` | Original surfaces, molecular symbols and procedural texture |
| `public/models/ground.glb` | `tools/blender/build-ground.py` | Original representative facility/equipment composition |
| `public/models/abi.glb` | `tools/blender/build-abi.py` | Original civil-instrument teaching assembly |
| `public/models/tirs2.glb` | `tools/blender/build-tirs2.py` | Original civil-instrument teaching assembly |
| `public/models/atmosphere.glb` | `tools/blender/build-atmosphere.py` | Original qualitative diagram; no geographic or transmission dataset |

| Story files under `public/look/` | Source builder | Image provenance |
|---|---|---|
| `ring.webp`, `ring-phone.webp` | `tools/blender/build-orbit-look.py` | Original render with NASA Earth textures |
| `satellite.webp`, `satellite-phone.webp` | `tools/blender/render-authored.py` | Original render of the shipped spacecraft GLB |
| `payload.webp`, `payload-phone.webp` | `tools/blender/render-authored.py` | Original render of the shipped payload GLB |
| `focal-plane.webp`, `focal-plane-phone.webp` | `tools/blender/render-authored.py` | Original render of the shipped focal-plane GLB |
| `pixel.webp`, `pixel-phone.webp` | `tools/blender/build-hardware-look.py` | Original procedural render |
| `plume.webp`, `plume-phone.webp` | `tools/render-plume-still.mjs` | Runtime plume illustration plus the credited historical NASA Earth texture above |

`tools/blender/encode-look.py` converts the Blender source stills to WebP; `tools/render-plume-still.mjs` captures and encodes the runtime plume stills. The source PNGs and downloaded NASA JPEGs remain local research material; the GLBs contain their required delivery textures. No remote model or image download is needed at runtime.
