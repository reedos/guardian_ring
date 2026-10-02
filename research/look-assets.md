# Illustration and diagram provenance

Reviewed 10/02/2026. The story illustrations accompany ten interactive Blender scenes and a sourced component catalog. All rendered constellation positions, representative hardware layouts, molecular icons, and plume shapes are schematic. No live positions, operational constellation count, coverage guarantee, plume intensity, dimensions, or sensor performance is represented.

## Rendered outputs

| Scene | Desktop | Phone | Builder |
|---|---|---|---|
| Schematic ring | `public/look/ring.webp` | `public/look/ring-phone.webp` | `tools/blender/build-orbit-look.py` |
| Spacecraft cutaway | `public/look/satellite.webp` | `public/look/satellite-phone.webp` | `tools/blender/render-authored.py`, shipped `satellite.glb` |
| Payload cutaway | `public/look/payload.webp` | `public/look/payload-phone.webp` | `tools/blender/render-authored.py`, shipped `payload.glb` v13 |
| Focal-plane cutaway | `public/look/focal-plane.webp` | `public/look/focal-plane-phone.webp` | `tools/blender/render-authored.py`, shipped `focal-plane.glb` v5 |
| Detector-element study | `public/look/pixel.webp` | `public/look/pixel-phone.webp` | `tools/blender/render-authored.py`, shipped `pixel.glb` |
| Molecular plume | `public/look/plume.webp` | `public/look/plume-phone.webp` | `tools/blender/render-authored.py`, shipped `plume.glb` |

Each study has separate desktop and phone cameras. Blender 5.2 renders the geometry, textures and lighting. The current authored stills use Cycles with denoising; the ring builder retains its own rendering configuration. `tools/blender/encode-look.py` creates the twelve WebP delivery files without resizing. The PNGs are reproducible source renders and do not ship.

The spacecraft, payload, focal-plane, detector-element, and plume stills import the actual shipped GLBs. Payload v13 groups sensor unit electronics (SUE), the common instrument electronics unit (EU), and cooler control electronics (CCE) into coherent enclosures with mounted boards, bulkhead connectors, harnesses, and conductive mounting paths. The Explorer retains thirteen stable learning selections for components and functions within the integrated instrument; this is not a count of thirteen separate physical assemblies. Focal-plane v5 exposes eight learning selections and distinguishes the detector/ROIC package, warm video electronics, bias/timing, and thermometer/cooler feedback. Public ABI names and functions guide the explanation; package dimensions, connector layouts, repeated parts, board traces, and wiring are original drawing choices. No manufacturer mesh or CAD model was used.

Both payload stills were rendered on 10/02/2026 from the shipped v13 GLB and are referenced by `look/payload.webp?v=6` and `look/payload-phone.webp?v=6`. They show the Explorer's Inside view: the renderer hides only objects with the exact `SensorElectronicsCover`, `InstrumentElectronicsCover`, or `CoolerElectronicsCover` role or cover-parent name, including their lid trim and fasteners. Internal boards, enclosure walls, mounting feet, connectors, harnesses, and thermal interfaces stay in place. The GLB version and story-image cache key are independent.

`THIRD_PARTY_NOTICES.md` lists all ten interactive assets and their builders. Their only third-party image content is the NASA Earth imagery documented below. The plume texture is procedural. The payload v13 revision completed all twenty full-scope built-preview browser gate commands on the real RTX 5090 on 10/02/2026. `gate-results.md` identifies the accepted build as SHA-256 `fd3463e001d9a178003bab65f1f226b87c0732f8160756f400fcb708cf77e01d` and records story, framing, label, camera-route, and performance checks. This is local acceptance, not remote CI or deployment status. Future asset changes require fresh acceptance; exporting a GLB or rendering a still alone is insufficient.

## System diagrams

`src/pages/system-diagrams.js` authors three responsive HTML/SVG diagrams: selected GOES-R spacecraft support paths, ABI instrument paths, and TIRS-2 interfaces. Component identities and evidence come from the same catalog as Explorer and Parts; no source diagrams, screenshots, manufacturer artwork, or logos are copied. The arrangement and arrows are explanatory choices, with distinct light, data/control, power, heat, and mechanical paths. These are selected functional connections, not complete wiring diagrams or circuit schematics.

The GOES-R Data Book and the TIRS-2 design presentation support the named civil components. Original Landsat 8 TIRS and Webb cooler details are not substituted for ABI or TIRS-2. Component gaps and exact source locators are documented in `COMPREHENSIVE-SYSTEMS-REVIEW.md` and `tirs2-architecture-review.md`.

Ring caption: **Schematic constellation. Orbital distances compressed; satellites and atmospheric limb enlarged. Positions and count are illustrative.** Earth geography uses historical NASA composites. Lighting and colors are adjusted for the artwork; this is neither a current Earth observation nor a quantitative map.

Plume caption: **Illustrative molecular emission. Shape, colors, flow lines, and molecule sizes are schematic; no physical scale or radiometric performance is implied.** The illustration contains no real vehicle, launch site, country, or operational sensor. Everything in this render is original procedural geometry/shading; no external plume photo or simulation was used.

## NASA Blue Marble surface texture

- Local source: `research/look/textures/nasa-blue-marble-january-2004.jpg` (outside `public/`).
- [Official download page](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography-bathymetry/), January / Global / JPEG, opened 10/01/2026.
- [Direct JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography-bathymetry/january/world.topo.bathy.200401.3x5400x2700.jpg), downloaded successfully 10/01/2026.
- Subject date: January 2004. File dimensions: 5400 by 2700 pixels. File size: 2,571,926 bytes.
- SHA-256: `1684c4f8f51970dcb4a7451302bf3be17bed657aed9fece6f80d7b191e8afa3d`.
- [Credit source](https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/), Credits section, opened 10/01/2026. Producer: Reto Stöckli, NASA Earth Observatory (NASA Goddard Space Flight Center).
- Required credit text: **NASA Earth Observatory.**

Used as a color texture on the Blender globe; darkened and tinted in the shader. The downloaded JPEG is unchanged. It is not a topographic elevation model in this artwork.

## NASA Black Marble night-light texture

- Local source: `research/look/textures/nasa-black-marble-2016.jpg` (outside `public/`).
- [Official download page](https://science.nasa.gov/earth/earth-observatory/earth-at-night/maps/), 2016 Color / Global / JPEG, opened 10/01/2026.
- [Direct JPEG](https://assets.science.nasa.gov/content/dam/science/esd/eo/images/imagerecords/144000/144898/BlackMarble_2016_01deg.jpg), downloaded successfully 10/01/2026.
- Subject date: 2016 composite. File dimensions: 3600 by 1800 pixels. File size: 779,638 bytes.
- SHA-256: `d87de751a264e4f8ff69c68de5dab9606daee87a6f15ae743c93200743bd7ec1`.
- [Credit source](https://science.nasa.gov/earth/earth-observatory/night-light-maps-open-up-new-applications-90008/), image credit following References & Resources, opened 10/01/2026.
- Exact credit: **NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC.**

Used as a stylized night-light emission texture on the Blender globe. Brightness, warmth, and illustrative day/night masking are changed in the shader. The downloaded JPEG is unchanged. This artwork does not preserve the source's radiometric values and must not be used to infer present lighting or sensor performance.

## Usage and delivery

[NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) were opened 10/01/2026. The educational/informational section permits NASA media in computer graphical simulations and personal web pages, requests attribution, and disallows implying endorsement. The texture sources above do not identify a third-party copyright holder. No NASA or manufacturer logos are included in the generated artwork.

Suggested combined credit for the site: **Earth textures: NASA Earth Observatory. Blue Marble by Reto Stöckli; Black Marble images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC. Rendered and color-adjusted for this schematic.** Link the two credit-source pages above.

Only rendered WebPs should be delivered with the site. Preserve the source textures and PNGs under `research/look/` for reproducibility, outside the Vite public tree. The raw textures were moved there individually with native PowerShell commands. The initial guessed Earth Observatory image-policy URL returned an unspecified fetch error; it is unchecked and is not relied on. The separately opened NASA Brand Center guidelines above are the usage reference.

Rebuild with Blender's background mode and the builders listed above, then run the encoder with Python/Pillow. After any GLB change, bump its scene URL version and rerender the affected authored stills. Keep noindex enabled until Reed's launch call; model export or image rendering alone does not establish release acceptance.
