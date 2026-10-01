# Spacecraft engineering evidence review

Reviewed 10/01/2026. Scope: public spacecraft engineering and the explicitly named GOES-R/ABI civil example. The generic spacecraft and payload remain representative assemblies, not reconstructions of military hardware.

## Reference standard and content change

Read IF's `src/data.js` without changing the IF repository. Its useful pattern is a physical component with a concise account of what it receives, does, and passes onward, followed by the relevant specification or assumption. The new content follows that pattern instead of repeating a scope disclaimer on each card.

`src/spacecraft-content.js` supplies twelve satellite components and seven payload components across all three layers: 57 cards. The original satellite `instrument`, `structure`, and `links` IDs and payload `optics`, `detector`, and `thermal` IDs remain valid. Three ABI Data cards retain their existing IDs but now explain the documented electronics chain. Every new card has at least one cited engineering row plus the separate drawing assumption.

The machine-readable fact tuples are in `research/spacecraft-facts.json`; the runtime definitions are `SPACECRAFT_FACTS` in `src/spacecraft-content.js`. Geometry is not used as evidence for an engineering claim. No new spacecraft dimensions, masses, power ratings, detector performance, or military implementation details were inferred. The only new electrical numbers are explicitly labeled GOES-R public bus names and solar-circuit topology.

## Directly inspected sources

### GOES-R Series Data Book, Revision A

- Existing verified ID: `goes-r-databook`.
- Publisher: NASA GOES-R Series Program / NOAA OSPO. Dated 05/2019; reviewed 10/01/2026.
- URL: https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf
- Existing direct download: `research/physics/GOES-RSeriesDataBook.pdf`, 12,628,931 bytes.
- SHA-256 rechecked: `6483b6811606bc2cafea3a04eedfbe4b0809dce371be05e8fefb9da4486c546e`.
- No new remote attempt was needed. Inspected the complete extracted pages listed below, and rendered/visually checked the ABI electronics diagram and table, array topology page, drive/slip-ring page, and structure drawing. Those local review PNGs are ignored under `research/spacecraft-pdf/`.

| Engineering claim | Inspected location | Short exact excerpt |
|---|---|---|
| Spacecraft bus supports and aligns equipment | Printed 2-1 / PDF 23 | “provides mechanical support and alignment” |
| Bus construction | Printed 15-9–15-10 / PDF 169–170, Structures | “The core structure consists of honeycomb structural panels” |
| Solar circuit topology | Printed 11-3 / PDF 135, Solar Array | “Each circuit has 10 parallel strings of 42 cells wired in series.” |
| Electrical isolation | Printed 11-3 / PDF 135 | “String isolation diodes prevent a string short from affecting the rest of the circuit.” |
| Regulation | Printed 11-2 / PDF 134 | “The Battery Charger/Dischargers (BCDs) use buck/boost converters” |
| Power distribution | Printed 11-5–11-6 / PDF 137–138 | “power feed switches for the instruments and some spacecraft loads” |
| Battery use | Printed 11-4 / PDF 136 | “provide power when the load demand exceeds the solar array power” |
| Battery thermal hardware | Printed 11-4 / PDF 136 | “temperature sensors and heaters for thermal control” |
| Attitude determination | Printed 12-1 / PDF 141 | “using one Inertial Measurement Unit (IMU) and two Star Trackers” |
| Sun sensing | Printed 12-2–12-3 / PDF 142–143 | “coarse knowledge of the sun’s position” |
| Propulsion feed | Printed 13-2–13-3 / PDF 152–153 | “ensure gas-free propellants are supplied to all thrusters” |
| Command gateway | Printed 10-2 / PDF 126 | “primary gateway for all uplink commanding and downlink state of health telemetry” |
| Onboard computer | Printed 10-3 / PDF 127 | “gather and route spacecraft component and instrument commands and data” |
| Remote interfaces | Printed 10-4–10-6 / PDF 128–130 | “Providing heater control circuits” |
| Communications roles | Printed 9-1–9-3 / PDF 117–119 | “Transmission of instrument data”; “Reception of spacecraft commands” |
| Array hinge deployment | Printed 15-2–15-3 / PDF 162–163 | “hard stops and latches for stiff lockout” |
| Rotating electrical interface | Printed 15-4 / PDF 164 | “allows power to be transferred from the Solar Array back into the spacecraft” |
| Passive thermal control | Printed 14-2 / PDF 156 | “MLI blankets, low emissivity coatings, and low conductivity stand-offs” |
| Equipment thermal mounts | Printed 14-3 / PDF 157 | “wet mounted with a high thermally conductive adhesive bond” |
| Instrument isolation | Printed 14-5 / PDF 159 | “conductively isolated from the EPP via titanium mounting feet” |
| Optical baffle role | Printed 3-6–3-7 / PDF 34–35 | “Reduces stray light via series of baffles” |
| Aft-optics components | Printed 3-8 / PDF 36 | “windows and cold stops” |
| Analog detector output | Printed 3-9 / PDF 37 | “convert it into analog signals for the video processor” |
| FPA and ROIC | Printed 3-9 / PDF 37 | “a detector array and its associated Read-Out Integrated Circuit” |
| Digitization | Printed 3-15 / PDF 43 | “digitize the focal plane data” |
| Video-processing interface | Printed 3-16 / PDF 44 | “generate timing signals and bias voltages” |
| Digital packet formation | Table 3-6, printed 3-17 / PDF 45 | “Formats and packetizes detector data provided by the Video Processor” |
| Clock generation | Table 3-6, printed 3-17 / PDF 45 | “Generates system clocks and handles ABI telemetry” |
| Cooler feedback | Printed 3-17 / PDF 45 | “platinum resistance thermometer (PRT)” |
| Cooler rejection path | Printed 3-14 / PDF 42 | “to the loop heat pipes where it is transferred to the radiator” |

Important distinctions retained in the content:

- An ABI **focal-plane array** comprises one channel's detector array plus its ROIC; a **focal-plane module** contains the filtered spectral-channel assemblies. These are not interchangeable names.
- Sensor Unit Electronics digitizes the focal-plane data. The Electronics Unit's Data Processor then formats and packetizes it. The source establishes those functional stages, not a standalone ADC-board package, converter architecture, bit depth, gain, or sample rate.
- ABI's cryocooler feedback sensor is a platinum resistance thermometer. It is not described here as a thermistor. Spacecraft heater feedback is separately documented as using thermistors.
- Raw instrument data, spacecraft health telemetry, command handling, and rebroadcast are distinct functions. The new cards do not transfer GOES-R link rates to a detector or another mission.
- GOES-R's battery charge management and its generic storage illustration are separate. The Data Book does not establish a GOES-R science recorder capacity; the general NASA storage discussion supplies only the role of onboard memory.
- The Data Book describes different stages of solar deployment with slightly different approximate times. No deployment-time number was admitted.
- The new text uses no propulsion thrust levels, pointing performance, current operational states, or internal ground algorithms.

### NASA spacecraft power overview

- ID: `nasa-spacecraft-power`.
- Title: State-of-the-Art of Small Spacecraft Technology: 3.0 Power.
- URL: https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/
- Publisher: NASA Small Spacecraft Systems Virtual Institute. Page date 05/07/2026; opened directly 10/01/2026. Primary; verified.
- Inspected Sections 3.2.1 and 3.2.2 for general photovoltaic conversion, incidence, multi-junction cells, and series/parallel arrangement. Manufacturer tables and advertised efficiencies were not adopted.
- Short excerpt: “produce an electric current when exposed to light.”

### NASA general structure and data handling

- ID: `nasa-onboard-data`.
- Title: Basics of Space Flight, Chapter 11: Onboard Systems, page one.
- URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter11-1/
- Publisher: NASA Science / JPL. Page last updated 01/16/2025; opened directly 10/01/2026. Primary; verified.
- Inspected Structure Subsystem; Data Handling Subsystems; Sequence Storage; Spacecraft Clock; Telemetry Packaging and Coding; Data Storage.
- Short excerpt: “telemetry may be written to a mass storage device until transmission is feasible.”
- Used only for the general distinction between command-sequence memory and stored observation records. No storage capacity, retention interval, compression ratio, or GOES-R recorder was inferred.

### NASA attitude-control principles

- ID: `nasa-onboard-attitude`.
- Title: Basics of Space Flight, Chapter 11: Onboard Systems, page two.
- URL: https://science.nasa.gov/learn/basics-of-space-flight/chapter11-2/
- Publisher: NASA Science / JPL. Page last updated 01/16/2025; opened directly 10/01/2026. Primary; verified.
- Inspected 3-Axis, momentum desaturation, Celestial Reference, and Inertial Reference.
- Short excerpt: “trade angular momentum back and forth between spacecraft and wheels.”
- Used for wheel/body momentum exchange and the distinction between a sensor and an actuator, without spacecraft pointing specifications.

## Gaps kept explicit

The generic drawing has no adopted bus voltage, array power, battery capacity, propulsion rating, control accuracy, ADC precision, storage size, or military electronics architecture. Those omissions do not prevent explaining the engineering chain. Standalone ADC packaging, connector pinouts, exact harness routing, component counts in the model, and mechanical proportions are drawing choices. No blocked source was retried, and no new source attempt was denied.

## Validation

The content is pure data with the IF card and evidence tuple shapes. Typecheck and the full scenario claim audit passed after integration. The root task owns scene integration, geometric checks, generated pages, and the final build; this content pass ran no GPU or build commands.
