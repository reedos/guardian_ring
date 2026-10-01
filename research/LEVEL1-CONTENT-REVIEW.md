# Ring-level content review

Reviewed 10/01/2026. `src/level-content.js` exports `orbitsContent(model)` with an introduction, a nonnumeric scale label, and independent Light, Data, and Heat card arrays in the IF shape. It has no rendering or DOM dependencies.

| Layer | Card IDs | Scope |
|---|---|---|
| Light | `geo`, `earth`, `orbit-families` | General orbit definitions, reference frames, and publicly described orbit families |
| Data | `processing`, `downlink`, `ground` | Component roles, propagation as a separate physical quantity, and the high-level ground role |
| Heat | `sunlight`, `power`, `radiator` | Qualitative energy paths with representative geometry |

The cited rows preserve the reviewed tuples for geostationary altitude, geosynchronous period, SBIRS orbit families, public spacecraft components, and FORGE's planned role. All drawing rows use the existing `look-model` assumption. No new source fetches were needed. Previously blocked sources remain excluded.

## Motion correction required in the scene

PLAN.md's literal description of Earth rotating beneath motionless geostationary satellites would show the wrong relative motion if the camera frame is fixed relative to distant stars. In that frame, Earth and the geostationary satellites must rotate together, preserving their relative longitude. In an Earth-fixed frame, the geography and geostationary satellites both remain fixed. A changing day/night boundary must not be used as a substitute for the satellite's orbital motion. The `earth` card explains this distinction without assuming which camera frame the renderer chooses.

## Integration boundaries

- Attach scene hotspots to the listed IDs; the content module does not create or position them.
- Add computed period or light-time rows only when the model's named outputs and `CALCS` entries are available. There are currently no numerical calculations in these cards.
- A one-way vacuum light time is a link propagation lower bound. It must never be labeled processing time, warning time, or end-to-end system latency.
- GAO's processor description applies to the named PWSA architecture. The copy does not transfer its implementation to the representative GEO spacecraft.
- GEO/HEO names describe public architecture. Drawn slots, counts, footprints, and connections cannot become claims about current constellations or operational coverage.
- Heat cards set no power, radiator-area, eclipse, or temperature figures. Detailed civil-instrument temperatures belong to their named civil examples.

This module does not resolve the pending HBTSS or ground-depth presentation decisions. It supports the ring-level architecture story while leaving those choices separate.
