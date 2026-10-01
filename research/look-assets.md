# Phase 2 ring and plume assets

Reviewed 10/01/2026. This is a static look prototype. All rendered constellations, spacecraft proxies, molecular icons, and plume shapes are provisional illustrations. No live positions, constellation count, coverage guarantee, plume intensity, temperature, dimensions, or sensor performance is represented.

## Rendered outputs

| Scene | Desktop | Phone | Builder |
|---|---|---|---|
| Schematic ring | `public/look/ring.webp` | `public/look/ring-phone.webp` | `tools/blender/build-orbit-look.py` |
| Molecular plume | `public/look/plume.webp` | `public/look/plume-phone.webp` | `tools/blender/build-plume-look.py` |

Both desktop images are 2000 by 1250 pixels. Both phone images are 780 by 960 pixels, rendered with separate cameras. These are output-image dimensions, not physical figures. Blender 5.2 EEVEE renders the geometry, textures, volume, lights, and optical bloom. `tools/blender/encode-look.py` creates the WebP delivery files without resizing; it also handles the other four levels' PNGs. The PNGs are editable/reproducible source renders and need not ship.

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

Rebuild with Blender's background mode and the builders listed above, then run the encoder with the bundled Python. Look approval is required before implementation of the engine or interactive levels.
