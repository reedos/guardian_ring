# Instrument integration review

Reviewed 10/02/2026. Public architecture and engineering responsibilities only. This change does not infer military electronics internals, performance, contractor design practices, or proprietary circuit designs.

## Supplier responsibility

Directly opened [Lockheed Martin’s 10/08/2014 delivery announcement](https://news.lockheedmartin.com/2014-10-08-Lockheed-Martin-And-Northrop-Grumman-Deliver-Payload-For-Fourth-SBIRS-Missile-Defense-Early-Warning-Satellite) on 10/02/2026. Brief quotation: “Prime contractor Lockheed Martin” and “payload provider Northrop Grumman.” The next paragraph says the delivered payload proceeds to integration with the satellite bus. Only these historical organizational and delivery roles are admitted, as Vendor. No claims about sensor internals or relative performance are used. One example does not establish a universal prime/subcontractor count.

## Spacecraft integration

Directly opened [NASA, Landsat 9: The Pieces Come Together](https://science.nasa.gov/missions/landsat/landsat-9-the-pieces-come-together/), published 01/09/2020, on 10/02/2026. Opening paragraph places mechanical integration of OLI-2 and TIRS-2 at Northrop Grumman. Brief quotation from the subsequent electrical-integration paragraph: “getting power to the instruments and incorporating the satellite’s data-handling hardware.” This supports an instrument-to-spacecraft integration boundary; it does not make every electronics enclosure one delivered instrument.

## Interface control

Directly opened [NASA Systems Engineering Handbook, 6.3 Interface Management](https://www.nasa.gov/reference/6-3-interface-management/) on 10/02/2026. Brief quotation: “Interface requirements verification is a critical aspect of the overall system verification.” The opening tasks cover physical/electrical/mechanical interfaces, §6.3.1.1 distinguishes system boundaries and organizational structure, §6.3.1.2.3 connects interface documentation with verification, and §6.3.1.3 lists controlled interface documents. The site explains the responsibility split, hardware grouping and functional path as different views.

## Physical grouping from the ABI civil example

The historically verified OSPO Data Book remains the source: `research/physics/GOES-RSeriesDataBook.pdf`, SHA-256 `6483b6811606bc2cafea3a04eedfbe4b0809dce371be05e8fefb9da4486c546e`; its page-index text was reread directly. The later redirecting program URL is a separate unchecked record, not replacement provenance.

- Printed p. 3-5 / PDF p. 33: Sensor Unit (SU), Electronics Unit (EU), and Cryocooler Control Electronics (CCE) have separate mounting locations. The optical bench supports sensor subsystems and establishes the mechanical reference.
- Printed pp. 3-15–3-16 / PDF pp. 43–44: SUE is in the SU. It includes Video Processors and Peripheral and Thermal Control (P&TC). SUE digitizes focal-plane data. The text does not establish a standalone ADC card or enclosure.
- Printed pp. 3-16–3-17 / PDF pp. 44–45: EU has a chassis, parent board, and circuit-card assemblies. Table 3-6 places power supply, instrument controller, HSIO, Data Processor, TNT, scanner driver and encoder processors inside that EU grouping.
- Printed p. 3-17 / PDF p. 45: P&TC remains sensor-side; scanner electronics are EU cards. CCE mounts to the spacecraft and drives cooler thermomechanical hardware in the SU. The controller electronics’ waste-heat path is separate from the detector-to-cooler-to-radiator path.
- Printed p. 14-3 / PDF p. 157: mounting and spacecraft equipment panels support controlled thermal paths. This does not establish a generic contact conductance or assign EU heat paths to SUE converter circuitry.

The named TIRS-2 2018 design provides a distinct comparison: [NASA design presentation](https://ntrs.nasa.gov/api/citations/20180005348/downloads/20180005348.pdf), already directly reopened in the prior research check. PDF p. 19 groups command/data, power, thermal, mechanism and high-speed functions within MEB-A/B, alongside separate FPE/FIB and cooler-control/switching assemblies. Its redundancy and names stay attached to TIRS-2. ABI and TIRS-2 are not combined into an asserted flight instrument.

## Product correction

The payload’s stable component IDs remain deep links and learning stops, not an assertion that every selectable function has its own physical box. The assembled instrument comes first; opening it reveals sensor electronics, a common EU chassis, and separate cooler controls. Controller/data/timing/power/scan/encoder cards share the EU. Readout and digitization remain within SUE, with P&TC sensor-side. Labels identify the physical item first, then describe its role. Cross-assembly paths retain both ends in their explanations.

The spacecraft boundary exposes mounting/alignment, power, command/timing responsibilities, science data and thermal interfaces. Timing precision and protocol, detailed schematics, redundancy of the generic model, housing count, masses, and supplier-specific military implementation remain unspecified. All generic layout and reveal behavior remain Assumed under `look-model`.

## Access gaps

The prior direct opens of `https://www.goes-r.gov/resources/faqs.html` and the program’s alternate Data Book PDF URL redirected to general NESDIS pages. They are recorded unchecked in `instrument-integration-facts.json` and are not cited. No blocked source was retried through another tool or shell.
