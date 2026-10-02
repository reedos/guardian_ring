# TIRS-2 architecture review

Reviewed 10/01/2026. NASA's *Landsat 9 TIRS-2 Architecture and Design* (IGARSS 2018, NTRS 20180005348) was opened directly and downloaded to `research/comprehensive/TIRS2-architecture-2018.pdf`. PDF pages 15 and 19 were rendered with Poppler and visually inspected; text was also read for pages 4, 6, 14, 17, 20 and 23.

Source: https://ntrs.nasa.gov/api/citations/20180005348/downloads/20180005348.pdf

The design presentation describes “block redundancy with selective cross strapping” (PDF p. 15). The diagram on PDF p. 19 separates power, discrete commands, analog telemetry, digital command/telemetry, science data, temperature control and motor control. Those distinct interfaces are the main reason to include the document: a single generic electronics box conceals the actual engineering responsibilities.

Admitted architecture is recorded in `tirs2-architecture-facts.json`. It includes the scene-select mirror and its motor/encoders, telescope and lens baffles, blackbody reference, focal-plane electronics, interface board, main-electronics boards, cooler electronics and redundancy-switch electronics, heater circuits, thermal isolation and launch restraint. The component descriptions are paraphrases of the diagram and adjacent design descriptions, not a reconstruction of circuit schematics.

This is a 2018 design presentation, not an as-built bill of materials. Its approximate design temperatures differ from the current NASA mission summary already used on this site. No new temperature, pointing, sensitivity, sampling, lifetime or other performance values are admitted from this document. Published civil architecture remains attached to TIRS-2. The representative payload drawing does not inherit TIRS-2's optical layout, component counts, redundancy scheme or electronics implementation.

The mission summary remains https://science.nasa.gov/mission/landsat/tirs/ (opened directly 10/01/2026). The earlier TIRS source NTRS 20130010968 is about the original Landsat 8 instrument and is not evidence for a TIRS-2-specific implementation.
