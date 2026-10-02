# Guardian Ring review build

10/02/2026. The expanded anatomy, readable labels, guided exploration, and engineering-animation revision is undergoing combined built-preview acceptance. Reed's device review and separate launch decision remain open.

## Current scope

Six pages connect the story, Explorer, Evidence, Method, Glossary, and searchable Parts reference. Ten Blender-authored scenes cover the ring, spacecraft, payload, focal plane, detector element, molecular emission, ground segment, ABI, TIRS-2, and atmosphere. Each has Light, Data, and Heat views with evidence and drawing assumptions.

The spacecraft has twelve selectable parent assemblies, the payload thirteen, and the focal plane eight. The smaller levels now offer five to nine selections per view: six for orbits, pixel and ground; five for plume and atmosphere; and nine each for ABI and TIRS-2. Together, the ten levels provide 237 layer states and 85 distinct level/parent entries. Nested anatomy names the actual components within each assembly, explains their functions, and attaches evidence. The Explorer and Parts page use the same catalog; the 240 component-detail displays represent 160 distinct detail IDs, not additional hardware counts.

Payload v10 exposes scan mirrors, motors, encoders and bearings; port-cover and focus mechanisms; calibration references; stationary aft optics; and separate sensor, instrument, interface, power, and cooling electronics. Focal-plane v5 separates the detector/ROIC package, warm video electronics, bias/timing interface, cold-head thermometer, and cooler feedback. The expanded civil instruments expose their calibration, readout, control, power and thermal assemblies as separate selections. Shapes, package layouts, wiring, and dimensions remain representative. All five revised story-still pairs—spacecraft, payload, focal plane, pixel and plume—include updated desktop and phone images rendered from their shipped GLBs.

Physical nameplates use a visibility guard that hides covered, edge-on or unreadably small print while preserving the full component identity in the selector and card. The selected numbered pin has a screen-space callout whose placement accounts for the viewport, interface overlays and other pins. Component names remain consistent across Light, Data and Heat; their functions appear beneath the names.

Three cited system diagrams explain selected GOES-R support paths, ABI instrument paths, and TIRS-2 interfaces. Their component names and evidence come from the same catalog. They distinguish light, data/control, electrical power, heat, and mechanical motion without presenting circuit schematics or complete wiring diagrams.

Each level now provides a guiding question, a takeaway, a contextual physics link, and a separate next-level action. Side visits restore the originating component, layer, camera, panel and keyboard focus. Changing a teaching input retains the scene and selection, including Overview, while updating calculated results and evidence. The physics panel leads with the result and lets the reader expand inputs and derivations. Detector material choices are explicitly a reference catalog, with no quantitative response inferred from the material name. ABI wildfire monitoring and Landsat water-use applications connect observations to validated derived products.

Replayable sequences distinguish light, detector signals, analog measurements, image data, commands, measured feedback, electrical power, conducted heat and radiation. The clock supports pause, reset and deliberate stepping; reading evidence suspends playback without overriding the user's pause choice. Reduced-motion preferences start with a stable scene. Component inspection restores the validated stationary pose before camera navigation. ABI v6 and TIRS-2 v5 isolate moving mirror assemblies from their fixed supports. Their paths show representative optical connections rather than a complete instrument prescription. Orbit markers remain on their drawing guides, with uniform mean-anomaly advance and nonuniform motion around an ellipse; Earth and GEO co-rotate.

The first-principles review checked energy conservation, optical and electrical interface meanings, warm and cold boundaries, mechanism supports, and the relation between drawing coordinates and physical calculations. It corrected a power route that ended at a cold strap, moved radiated heat to the actual radiator face, separated command and encoder directions, and kept calibration reference views sequential. The cooler equation explicitly assumes no net stored energy over a complete cycle. General design practices and these demonstrations do not establish flight qualification, a complete bill of materials, or real instrument performance.

The admitted research ledger contains 241 facts, including 31 new rows from the public spacecraft-design gap review. It contains 40 verified research sources; the runtime registry also includes seven existing model sources. The additions cover computer support functions, mechanical interfaces, contamination control, protective surfaces, ground equipment and detector packaging. The historically verified GOES-R Data Book supplies named civil hardware; newly opened NASA, ESA and ECSS sources support general design practices and explicitly named civil examples. See `PUBLIC-DESIGN-GAP-REVIEW.md`, `design-practices-facts.json`, `COMPREHENSIVE-SYSTEMS-REVIEW.md` and `tirs2-architecture-review.md` for scope, exact locators and access outcomes. Fresh failed access attempts are recorded separately and supply no new claims.

The engineering-learning review adds six directly verified primary sources for civil applications, thermal accounting, and Kepler coordinates, bringing the runtime registry to 53 verified sources. The registry also retains unsuccessful and pointer records, which support no claims. Its five additional claims attach to the same evidence system. Two unsuccessful USGS opens remain unchecked and uncited. Exact locators and boundaries are recorded in `engineering-review.json`.

## Validation status

Current full acceptance is in progress; the generated `gate-results.md` will record the results and build hash. Earlier revision totals are not acceptance evidence for this build.

The acceptance suite covers scenarios, parent parts, ordered camera routes, evidence dialogs, component anatomy, Parts search/navigation, responsive diagrams, saved comparisons, renderer quality, physical labels, selected callouts and performance. Phone-sized browser checks do not replace testing on an actual phone.

## Supported scope and gaps

Public civil specifications stay attached to GOES-R, ABI, or TIRS-2. The TIRS-2 architecture source describes a 2018 design, not an as-built bill of materials. General calculations cover orbital geometry, vacuum propagation, ideal diffraction, and ideal blackbody radiation; they do not estimate detector counts or warning latency.

The reviewed sources do not establish ABI aperture, a standalone detector data rate, analog-amplifier topology or gain, ADC precision or package layout, cooler compressor internals, detailed vibration cancellation, connector pinouts, or mission-specific shielding and harness construction. These gaps are not filled with invented specifications. Generic bus voltage, array power, battery capacity, propulsion rating, recorder capacity, and instrument temperature are also unassigned.

Real plume intensity, quantitative atmospheric transmission, military hardware detail, operational coverage, and sensor detection performance remain outside the model. HBTSS and operational constellation positions are excluded. Sources that could not be opened remain unchecked and support no claims.

## Publication

Reed authorized a public repository and GitHub Pages review; launch requires a separate call. Keep noindex/nofollow and the crawler block. Share a verified review URL only in this chat, not in the public README, repository homepage field, portfolio, or sitemap. Public Pages has no sign-in restriction.
