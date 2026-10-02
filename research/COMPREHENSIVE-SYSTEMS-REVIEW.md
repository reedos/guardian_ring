# Comprehensive spacecraft and payload component review

Reviewed 10/01/2026. This is research for the component catalog, not a claim that the representative vehicle reproduces GOES-R, ABI, or military hardware. The ledger contains **116 component facts**, each with a canonical name, concise scoped explanation, evidence tuple, exact locator, and short source passage. IDs use `comprehensive-*`; runtime keys use `comp-*`.

## Coverage and implementation boundary

The implemented hierarchy has thirteen payload parents, eight focal-plane parents, and twelve spacecraft parents. Individual components belong under those parents; a new pin is not required for every circuit card. All keys below are in `comprehensive-systems-facts.json`. Its `coverage` array provides the complete mapping.

| Parent | Named components supported by the sources | Status |
|---|---|---|
| Payload / optics | Optical Bench; four-mirror Telescope Assembly | Verified ABI roles and count |
| Payload / scan-system | NS/EW scan mirrors; SDA motors; optical encoders; support bearings; SIMD and Encoder Processor cards | Verified ABI |
| Payload / baffles | Optical Port Sunshield Assembly and entrance baffles | Verified ABI |
| Payload / mechanisms | Optical Port Cover; SMA pin-puller lock; spring hinges and stop; focus motor; Solar Calibration Cover | Verified ABI |
| Payload / calibration | Internal Calibration Target; Solar Calibration Target; space-look reference | Verified ABI; space look is a view, not hardware |
| Payload / aft-optics | VIS/IR beamsplitter; fold mirror; MW/LW beamsplitter; channel filters; windows; cold stops | Verified ABI names and arrangement roles |
| Payload / detector | FPM; one-channel FPA; detector array; associated ROIC | Verified ABI assembly hierarchy |
| Payload / readout | Sensor Unit Electronics; Video Processors; detector bias; readout timing; sample collection | Verified ABI |
| Payload / digitizer | Focal-plane digitization within SUE | Verified function; separate board packaging representative |
| Payload / controller | Electronics Unit; Instrument Controller; Peripheral and Thermal Control; peripheral command/telemetry | Verified ABI |
| Payload / data-interface | Data Processor; High Speed I/O; Telemetry and Timing | Verified ABI card functions |
| Payload / power | EU Power Supply; parent board; Side 1/Side 2 electronics | Verified ABI; drawn connectors/traces representative |
| Payload / thermal | Pulse-tube cooler; TDU; cold head; transfer line; CCE; PRT; power amplifiers; shrouds; heat pipes; radiator; heaters | Verified ABI functions; cooler internals not reconstructed |
| Focal plane / array | Detector array and ROIC within an FPA; multiple channel assemblies within an FPM | Verified ABI |
| Focal plane / readout | Separate SUE Video Processor interface | Verified ABI |
| Focal plane / cold-stage | Cold region and cooler heat-removal path | Verified role; stage geometry representative |
| Focal plane / shield | Windows/cold stops in controlled aft optics | Verified names; drawn enclosure and aperture geometry representative |
| Focal plane / flex | Detector-to-video electrical interface | Verified connection role; flexible cable construction representative |
| Focal plane / carrier | Structural support for the assembly | Representative package carrier, fasteners, and standoffs |
| Focal plane / bias-timing | VP-supplied bias and detector-readout timing | Verified ABI |
| Focal plane / thermal-feedback | Cold-head PRT; CCE; power-amplifier duty control | Verified ABI |
| Spacecraft / instrument | Earth Pointing Platform and instrument mounting | Verified GOES-R |
| Spacecraft / structure | Core panels; adapter ring; equipment panels; EPP locks and isolators | Verified GOES-R |
| Spacecraft / solar-array | Cells, strings, circuits, string/circuit isolation diodes | Verified GOES-R; published circuit counts never describe drawn cells |
| Spacecraft / array-drive | Shear ties; release devices; hinges/dampers; SADA; SRA; SADE; SEGA; TBA | Verified GOES-R |
| Spacecraft / power | PRU; CDA; SAS; BCD; LCM; LPM; PDM; FBA; PRA; CSU; TSU | Verified GOES-R |
| Spacecraft / battery | Cell banks; balancing circuits; bypass switches; thermal sensors/heaters/radiator | Verified GOES-R |
| Spacecraft / attitude | Star trackers; IMU gyros/accelerometers; GPS receiver; coarse/fine Sun sensors | Verified GOES-R |
| Spacecraft / wheels | Reaction Wheel Assemblies and wheel isolators | Verified GOES-R |
| Spacecraft / propulsion | Tanks; PMDs; pressurant; regulator; valves; filters; pressure sensors; named engine/thruster types | Verified GOES-R component roles only |
| Spacecraft / computer | CTP; RDC; RMC; OBC; SWRC; RIU/SIU; converter/control/backplane; housekeeping interfaces | Verified GOES-R; memory role separately general NASA guidance |
| Spacecraft / links | TT&C; RDL; CDAS; transponder; TWTA; reference oscillator; modulator/receivers; antennas/gimbal | Verified GOES-R |
| Spacecraft / radiator | MLI; isolating supports; OSRs; heat pipes; thermostats/thermistors; conductive mounts | Verified GOES-R |
| Cross-cutting / harness | Grounding architecture and cable shielding | Verified general NASA guidance; mission wiring representative |

## Sources inspected

The existing **GOES-R Series Data Book, Revision A (05/2019)** supplies 111 rows. Re-read the local extracted pages against the existing downloaded PDF record, focusing on printed 3-5–3-17 and 3-27; 9-1–9-8; 10-1–10-7; 11-1–11-6; 12-1–12-6; 13-1–13-3; 14-2–14-6; and 15-1–15-10. Figure locations are given where useful, but no new geometry or dimension was inferred from an illustration. The existing PDF SHA-256 remains `6483b6811606bc2cafea3a04eedfbe4b0809dce371be05e8fefb9da4486c546e`.

Each book excerpt was checked against its cited PDF page range, normalizing only extraction whitespace, Unicode, and hyphenation. All 111 matched. This checks quotation and locator integrity; it does not replace the prose review.

Two new sources were opened directly and admitted:

- [NASA-HDBK-4001A, Electrical Grounding Architecture for Uncrewed Spacecraft](https://standards.nasa.gov/system/files/tmp/NASA-HDBK-4001A_Final_07152025_0.pdf), Revision A, 07/2025; checked 10/01/2026. Read the foreword, scope, and cable-shielding discussion. Two qualitative rows explain system grounding and harness shielding. The cover and revision history disagree on the approval day, so metadata retains the verified month. No mission-specific wiring prescription is adopted.
- [GOES-16/17 pointing and isolation paper, AAS 19-133](https://ntrs.nasa.gov/api/citations/20190002517/downloads/20190002517.pdf), published 02/01/2019; checked 10/01/2026. Read PDF pp. 2–5 for passive platform and wheel isolation. Two rows identify these mechanisms; no pointing results, frequencies, control gains, or operating procedure is imported.

Previously verified NASA onboard-systems references supplement the star-tracker, inertial-reference, wheel, and general-memory explanations. The new general-memory row does not establish a GOES-R recorder type or capacity.

Additional direct opens were useful scope checks but are **not admitted to this ABI/bus catalog**:

- NASA's Webb cryocooler page, updated 08/12/2024: its compressor/control/cold-head architecture is a separate named instrument, not an ABI compressor specification.
- NASA's 04/27/2012 Landsat engineering article and the original TIRS thermal paper, NTRS `20130010968`: useful cooling, isolation, and mechanism examples, but they concern Landsat 8 TIRS. They cannot be relabeled TIRS-2. See the separate `tirs2-architecture-review.md` for the admitted TIRS-2 source.
- NASA's 05/17/2016 TIRS-2 cooler award: verified the stated shielding/focal-plane cooling roles and electronics deliverables; the component catalog uses the more complete TIRS-2 architecture source documented separately.

The direct request for NTRS `20180007426` returned **Internal Error**. It is recorded `unchecked`; the action stopped and was reported immediately. No alternate URL, tool, shell, or snippet was used to cite it. No new PDF download was required for the two admitted sources; their full documents were read through the web PDF tool.

## Distinctions that must survive integration

- Two scan mirrors precede the four-mirror telescope. Do not combine the counts or call every mirror a scanner.
- An FPA is one channel's detector array plus ROIC. An FPM groups channel assemblies. The warm Video Processor is separate from the ROIC.
- The SUE digitizes focal-plane data. The EU Data Processor packetizes it; HSIO communicates through SpaceWire. TNT generates system clocks. P&TC controls peripherals and thermal hardware except the scanners; SIMD and Encoder Processors handle the scanner interfaces.
- OPC is a one-time protective cover; SCC is a different motor-driven cover. Neither passage establishes a generic repeated imaging shutter or a filter wheel.
- ICT is a blackbody reference; SCT is a diffuse solar target; space is a reference view. Do not add a physical “deep-space target.”
- ABI cold-head feedback uses a PRT, while GOES-R spacecraft heater circuits use thermistors. CCE is separate from SUE P&TC.
- Current-sensor housekeeping digitization is not the detector-science digitization chain. Radio amplifiers, detector readout, and cooler power amplifiers are different devices.
- The public book names a science magnetometer; it does not justify inventing a magnetic attitude-control sensor or torque rods in the generic vehicle.

## Remaining gaps

No verified ABI analog-amplifier topology, gain, ADC precision, antialias-filter implementation, correlated-double-sampling circuit, standalone ADC package, compressor interior, or detailed cooler vibration-cancellation mechanism was established. The book supports the functions and named assemblies without supplying those internals.

Connector pinouts, harness termination patterns, specific EMI filters, board traces, bump bonds, flexible-cable construction, carrier details, and cold-shield dimensions remain drawing choices. General NASA grounding guidance is not evidence for a particular mission wiring scheme. Existing numeric solar-circuit topology belongs explicitly to GOES-R; repeated model cells do not become a count claim.

## Integration and checks

The 116-fact ledger is integrated into the shared component catalog, Explorer cards, Parts reference, system diagrams, glossary, and generated evidence register. All tuples pass the shared strict evidence validator with 0 problems; every coverage key resolves, and IDs/runtime keys are unique across the research clusters. All 111 Data Book excerpts match the text on their cited PDF pages after whitespace and hyphenation normalization. Each row retains its civil-system scope, and the unchecked source is excluded from citations. The separate TIRS-2 architecture review contributes nine more facts. Final integrated acceptance is recorded in `gate-results.md` after the complete built-preview suite.
