# Engine and level content review

Reviewed 10/01/2026. Scope: `PLAN.md`, the pure model and its evidence catalog, Level 1 cards, detached `remaining-content.js`, the current story, and the viewer's share-link parser. No network request, blocked-source retry, or runtime edit was made. The only content changes in this pass are the detached component-role rows and accompanying copy described below.

## Findings

1. **The delivered engine keeps the necessary boundaries.** Orbit geometry, vacuum propagation, ideal diffraction, and ideal blackbody radiance are independent teaching examples. The 288 K source is not labeled Earth or plume radiance. Photon radiance is not a detector count. The arbitrary aperture is separate from the drawn payload; civil aperture and material-based detector temperatures are unavailable. No unsupported real-system performance claim was found in the reviewed engine or cards.
2. **The plan is broader than the implemented, supported model.** PLAN lines 18–19 combine unsupported pixel count, detector-temperature comparison, and warning time. Its claim that cooling is the hardest spacecraft engineering problem is also unsupported. Do not reuse these phrases as public copy. Its coverage/revisit, received-photon, ground-spot, cooler-power, and end-to-end pixel-count proposals are not implemented by the current engine and must not be described as delivered calculations. Keep the present narrowed scope explicit.
3. **The frame-of-reference correction is satisfied in the present Level 1 implementation.** The Earth and GEO markers share `EarthSpin`; the card explains inertial and Earth-fixed views correctly. PLAN's literal Earth moving under inertially fixed GEO satellites remains incorrect. Other orbit guides, artificial light paths, and playback speed remain illustration choices, not ephemerides or physical illumination calculations.
4. **Drawing assumptions do not substantiate physical facts.** Generic conversion, readout, cooling, and thermal-path prose previously had only a drawing row. This pass adds separately named ABI examples and a general NIST cooling benefit. No source row establishes the generic geometry, a military implementation, or any detector performance.
5. **Story status text is stale.** `index.html:114` still says the physics engine comes later; `index.html:32` calls the entire explorer a scaffold. At the current integration stage, use “Open the explorer” and “The explorer includes general orbit and radiation calculations. Interactive levels are being completed and checked in sequence.” Update that latter sentence again only as levels actually pass.
6. **ABI's four-mirror count needs a precise noun.** The Data Book count is the telescope's four mirrors. The instrument also has scan mirrors, a fold mirror, and other optics (printed 3-7–3-8 / PDF 35–36). The detached ABI card now states the telescope scope; a later model must not claim that four is the instrument's total optical-surface count.

HBTSS, current constellation inventory, military detector parameters, actual ground algorithms, and quantitative atmospheric transmission remain absent. Generic semiconductor, radiation, and heat-transfer statements are not assigned military values. No source gap was filled by assuming a real system's properties.

## Added component-role evidence

These are new qualitative rows in the detached module, not additions to `research/verified-facts.json`. The preexisting numerical rows are unchanged. Source IDs already exist with verified status. The passages were inspected from the retained download and its page-index text; no retrieval was performed.

| Row key | Named scope and supporting passage | Use |
|---|---|---|
| `abi-support-role` | `goes-r-databook`, Table 3-4, printed 3-6 / PDF 34, Optical Bench row | A named example of structural support; the generic spacecraft bus is not asserted to be ABI's bench. |
| `abi-image-role` | Same table, Telescope row | A named example of forming a scene image at focal-plane detectors. |
| `abi-detector-role` | Same table, Focal Plane Modules and Aft Optics row | ABI's photon-to-electrical conversion role; no efficiency or generic pixel stack is inferred. |
| `abi-readout-role` | Same table, Sensor Unit Electronics row | Reading detector arrays; no generic timing, precision, or data rate. |
| `abi-cooler-role` | `goes-r-databook`, Cryocooler, printed 3-14 / PDF 42 | Named path from focal planes through the cooler toward loop heat pipes and radiator. |
| `abi-radiator-role` | `goes-r-databook`, Radiator/Loop Heat Pipe Assembly, printed 3-13 / PDF 41 | Named example of rejecting instrument thermal energy to space. |
| `cryogenic-noise-role` | `nist-cryocooler-2009`, PDF 2, Table 1 | The review lists low thermal noise as a cryogenic-temperature benefit. General principle only; no detector-material temperature or noise magnitude. |

Further traceability improvements available from inspected material:

- Story focal-plane prose can say “Cooling can reduce thermal noise,” backed by `nist-cryocooler-2009`, PDF 2, Table 1. This passage does not establish a material-specific dark-current law; avoid making one from it.
- Story image formation, detector conversion, and readout can use the same named ABI role evidence above. Keep a separate drawing assumption on the figure.
- Level 1 `earth` can cite `noaa-geo-definition`, Definition paragraph, for the co-rotation relationship; `downlink` can expose the model's existing `vacuum-light-time` row when desired.
- A civil power-role example is available in `goes-r-databook`, Electrical Power Subsystem, printed 11-1 / PDF 133: the solar array supplies primary spacecraft power. This supports that named GOES-R role, without adopting its power budget for the generic drawing. No new power row was added in this pass.
- The already-verified NIST refrigeration review, PDF 2–3, equation (1) and definitions, supports the separate cold-side/hot-side/work quantities. The generic card does not assign their values.

## Exact story destinations

The current parser accepts `visualizer.html?view=<scene index>.<mode>.<card id>`. Shared IDs across layers in detached content do not remove the need for the mode. Keep in-page journey anchors for story navigation. Add the per-study explorer links below only when the destination level is integrated and has passed its gate; otherwise they would land on a placeholder. Keep existing Evidence source links as source links.

| Story location / proposed link text | Exact destination |
|---|---|
| Hero secondary action: Open the explorer | `visualizer.html?view=0.light.geo` |
| Ring: Explore the ring | `visualizer.html?view=0.light.geo` |
| Satellite: Explore the spacecraft | `visualizer.html?view=1.light.instrument` |
| Satellite Data note: Follow the data | `visualizer.html?view=1.data.links` |
| Payload: Follow the optical path | `visualizer.html?view=2.light.optics` |
| Focal plane: Explore the detector assembly | `visualizer.html?view=3.light.array` |
| Focal plane Heat note: Follow the thermal path | `visualizer.html?view=3.heat.cold-stage` |
| Pixel: Explore the detector element | `visualizer.html?view=4.light.absorber` |
| Photon: Explore the molecular bands | `visualizer.html?view=5.light.bands` |
| ABI article: Explore ABI | `visualizer.html?view=7.light.bands` |
| TIRS-2 article: Explore TIRS-2's cold stage | `visualizer.html?view=8.heat.arrays` |
| Optional ground coda: Explore the ground role | `visualizer.html?view=6.data.process` |
| Optional atmosphere coda: Explore atmospheric absorption | `visualizer.html?view=9.light.air` |

The existing bare `visualizer.html` navigation item may remain a general page link. Do not substitute `#satellite`, `#photon`, or a scene name for the numeric `view` contract; the story section `photon` corresponds to scene `plume` at index 5.

## Validation

The module remains detached from `data.js`. Its direct validation checks every card and evidence row using the production `problems()` function, exact preservation of reviewed numerical tuples, and numeric drill destinations. The normal site claims count therefore does not yet include these detached rows. No renderer, scene geometry, story HTML, source registry, or evidence validator was changed by this pass.

Results: typecheck passed; direct validation passed for nine levels, 81 cards, and 139 rows (39 existing reviewed tuple instances, 19 instances of the seven new qualitative role rows, and 81 drawing rows). The normal site audit reported zero problems across 50 site claims and 96 scenarios at review time. Card IDs and scene indexes are unchanged. The payload Heat `thermal` drill now points to ABI (7), matching the newly cited ABI cooler example.
