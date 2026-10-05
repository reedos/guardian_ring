# Automatic visual lessons — 10/05/2026

Reed approved ten lessons based on “See light focus,” with Play as the only required
action. Implementation branch: `codex/cinematic-lessons`. No publication is authorized
by this change. Existing focus and scan-mirror demonstrations remain available.

## Product

Each standalone lesson has an Assumed 36-second presentation, five captioned beats,
optional pause/replay, and expandable evidence. Opening waits for deliberate Play.
Dragging or keyboard rotation preserves playback. Opening evidence pauses it. Escape
closes the dialog and restores the opener. Reduced motion removes the automatic camera
move; the user can still deliberately play the explanatory animation.

The new scenes are projected mathematical and functional diagrams, separate from the
Blender hardware. No physical GLB was rebuilt, and no GLB version was changed. Diagrams
reuse existing credited NASA Earth imagery where appropriate. They do not prescribe
real packaging, optics, detector formats, performance, or mission timing.

| Level | Lesson | Visible mechanism |
|---|---|---|
| Pixel | See light become data | Absorption, collection, integration capacitance, voltage trace, selected ADC bin, calculated sample in a synthetic image |
| Focal plane | See how the detector stays cold | Cold finger, work input, added warm-side rejection and radiating surface; energy balance |
| Satellite | See how the spacecraft turns | Counter-rotating wheel and body with consistent inertial momentum and rest-to-rest motion |
| TIRS-2 | See an image being built | Synthetic terrain, cross-track detector row and identical accumulating image samples |
| Ring | See why GEO stays overhead | Earth imagery, same-longitude marker, synchronized inertial and rotating views |
| Satellite | See power through an eclipse | Shadow context, array/load/battery flow and integrated stored-energy trace |
| Ground | See the image arrive on Earth | Source rows, packet symbols following the wiring, radio-link symbols, receiver and reconstructed square image |
| Photon | See heat as light | Fixed-scale Planck curves, assumed temperature change and a separate qualitative molecular-band reminder |
| Atmosphere | See the atmosphere change the light | Invented transmission plus a slab's thermal emission and labeled combined spectrum |
| TIRS-2 | See how calibration works | Reference selection, reference readings, affine response fit and corrected synthetic image |

Satellite eclipse and TIRS-2 calibration are directly available under “More lessons on
this level,” including in Light. Atmosphere keeps its simplified controls: its lesson
button lives beside the learning prompt rather than reinstating scene-sequence controls.

## Source verification

Primary pages opened directly on 10/05/2026:

- [NASA, Webb infrared detectors](https://science.nasa.gov/mission/webb/infrared-detectors/),
  “How Do Webb Detectors Work?”: “mobile electron hole pairs.” The existing verified
  registry entry `nasa-webb-hybrid-detectors` supports the named civil principle.
  Architecture section separates absorber, interconnects and readout. No Webb array
  size or performance is assigned to the generic diagram.
- [NASA, Basics of Space Flight, Onboard Systems](https://science.nasa.gov/learn/basics-of-space-flight/chapter11-2/),
  three-axis stabilization: “trade angular momentum back and forth.” Registered as
  `nasa-cinematic-wheel`. Distinguishes reaction wheels from inertial sensors.
- [NASA SVS, Landsat sensors: pushbroom vs whiskbroom](https://svs.gsfc.nasa.gov/12754/),
  Landsat 8 description: “collect data across the entire image swath at once.”
  Registered as `nasa-cinematic-pushbroom`. Used for the civil pushbroom principle,
  not TIRS-2 detector geometry, row count or sampling performance.
- [NASA, Landsat calibration and validation](https://science.nasa.gov/mission/landsat/calibration-validation/)
  opened for context. It is not used to support the scene-select mechanism; that claim
  uses the existing verified TIRS-2 architecture document below.

Existing opened sources retained, with their original locators:

- NOAA GOES-R Series Data Book, printed pp. 3-15–3-17 / PDF pp. 43–45: sensor-unit
  conversion, electronics-unit formatting and packetization. The generic drawing
  separates functions without assigning a converter to a particular real pixel circuit.
- NASA thermal-control chapter §7.2.1 and first-law educational page: conduction,
  radiation and cooler-cycle energy accounting.
- NASA/JPL parameters and existing orbital-period calculation: geostationary condition.
- NOAA Planck function and NIST constants: ideal spectral radiance.
- NASA civil combustion study, printed p. 5 / PDF p. 7: molecular bands. The small
  additional band motif has no wavelength scale or assigned real plume radiance.
- NASA TIRS-2 architecture presentation, PDF pp. 4 and 19: Earth, blackbody and space
  views. The lesson's solved plane reflection is an ideal geometric example, not its
  optical prescription or mechanical slew trajectory.

No new source access was blocked. The registry keeps previously unchecked sources
excluded. All new claim rows join the ordinary shared evidence audit, Evidence page
and Method registry. Actual temperatures in the Planck example are labeled Assumed;
dimensionless detector, inertia, power, cooling, transmission and calibration inputs
are explicitly listed in the assumptions.

## Independent review and corrections

Three independent read-only reviewers checked physics, usability and visual storytelling.
Their concrete findings were addressed:

- Pixel image cell now consumes the calculated ADC code; the bin is visibly selected.
- Wheel stars share its viewing transform, automatic camera drift is disabled there,
  and future momentum samples are omitted instead of drawing a false sudden stop.
- Eclipse captions use the same boundary times as the power model; the context shadow
  matches those boundaries. Future energy samples are not depicted as measurements.
- Cooling's arbitrary energy ratio is disclosed; the phone chart is no longer clipped.
- Calibration draws physically consistent ideal reflection, shows both measured
  references and the fit, and computes the corrected image with that same equation.
- Downlink symbols follow the drawn path through a receiver. Both images are square.
- Secondary lessons are discoverable without changing layers.
- The atmosphere legend identifies incoming, transmitted, emitted and total radiance.

Core equations have unit checks for charge/quantization limits, rest-to-rest momentum
conservation, battery energy integration, slab limits and thermal equilibrium, affine
calibration recovery and image-row bounds. The browser gate captures every beat at
1440×900 and 390×844, checks deliberate playback and camera interactions, verifies
evidence/pause/replay/focus, and exercises secondary entry points in Light.

Current acceptance results belong in `research/gate-results.md` only after the complete
current-build suite passes. Local storyboard galleries: `.local/cinematic-gates/desktop.html`
and `.local/cinematic-gates/phone.html`. Historical `.local/cinematic/` shots are early drafts.
