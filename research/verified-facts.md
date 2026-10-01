# Verified facts by level

Reviewed 10/01/2026. Civil figures remain attached to the named instrument or spacecraft. The machine-readable tuples are in `verified-facts.json`; source quotes and access outcomes are in `systems/source-notes.md`, `physics-review.md`, and `spacecraft-review.md`. Geometry is representative unless explicitly supported otherwise.

## The ring

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| SBIRS orbit families | GEO and HEO | Reported | [gao-21-105249](https://www.gao.gov/assets/gao-21-105249.pdf), Printed p. 4 (PDF p. 8), first paragraph; corroborated in GAO-26 Table 1. | Public system architecture; no specific orbital slots, operational count, or visibility performance. |
| Tracking award, 07/18/2022 | 28 satellites / four planes | Reported | [sda-tranche1-award](https://www.sda.mil/space-development-agency-makes-awards-for-28-satellites-to-build-tranche-1-tracking-layer/), Award paragraph describing space segment. | Historical award scope, not current inventory. |
| Award sensor class | Wide-field-of-view infrared | Reported | [sda-tranche1-award](https://www.sda.mil/space-development-agency-makes-awards-for-28-satellites-to-build-tranche-1-tracking-layer/), Director quotation following award paragraphs. | No numerical field of view, resolution, or performance implied. |
| Geostationary altitude | 35,786 km | Reported | [noaa-geo-definition](https://coastwatch.noaa.gov/cwn/platform-types/geostationary-earth-orbit-satellite-geo.html), Definition paragraph | General circular equatorial GEO definition; no slot positions. |
| Geosynchronous period | 23 h 56 min 4 s | Reported | [nasa-orbit-catalog](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/), Introductory altitude-and-period example | General orbital reference value. |
| Generic Molniya inclination | 63.4 degrees | Reported | [nasa-orbit-catalog](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/), Medium Earth Orbit | Generic textbook orbit, not real constellation elements. |
| Generic Molniya period | About 12 h | Reported | [nasa-orbit-catalog](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/), Medium Earth Orbit | Generic textbook orbit, not real constellation elements. |

## The satellite

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| Award sensor class | Wide-field-of-view infrared | Reported | [sda-tranche1-award](https://www.sda.mil/space-development-agency-makes-awards-for-28-satellites-to-build-tranche-1-tracking-layer/), Director quotation following award paragraphs. | No numerical field of view, resolution, or performance implied. |
| Public architecture | Bus, infrared payload, mission processor, communications | Reported | [gao-26-107085](https://files.gao.gov/reports/GAO-26-107085/index.html), PWSA-Enabling Technologies and Processes, opening description. | Explains component roles; representative GEO artwork must not masquerade as SDA hardware. |
| GOES-R structure | Honeycomb core panels, equipment panels and instrument platforms | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Structures, printed pp. 15-9–15-10 / PDF pp. 169–170; Figures 15-15 and 15-16 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R Earth-pointing platform | Supports ABI, GLM, star trackers and inertial reference units | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 2-1 / PDF p. 23; Structures, printed p. 15-10 / PDF p. 170 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| Photovoltaic cells | Semiconductors convert light into electrical current | Reported | [nasa-spacecraft-power](https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/), Section 3.2.1 Solar Cells, opening paragraphs; incidence and multi-junction cells | General spacecraft engineering principle. |
| GOES-R array circuit | 42 cells in series × 10 parallel strings; 16 circuits | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Solar Array, printed p. 11-3 / PDF p. 135, paragraph above Figure 11-3 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R array protection | String and circuit isolation diodes | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Solar Array, printed p. 11-3 / PDF p. 135 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R rotating interface | Motor drive and resolver; slip rings carry array power | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Solar Array Drive/Slip Ring Assembly, printed p. 15-4 / PDF p. 164 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R deployment hardware | Release devices, spring hinges, dampers, hard stops and latches | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Restraint Mechanisms and Hinges, printed pp. 15-1–15-3 / PDF pp. 161–163 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R named power buses | 70 V and 28 V | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Electrical Power Subsystem, printed pp. 11-1–11-2 / PDF pp. 133–134; nominal bus names, not generic spacecraft voltages | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R power regulation | Array shunts, battery buck/boost converters and low-voltage buck converters | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 11-2 / PDF p. 134; PRU module list, printed p. 11-5 / PDF p. 137 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R load distribution | Power-feed switches, current sensing and overcurrent fuses | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Power Regulation Unit and Fuse Board Assemblies, printed pp. 11-5–11-6 / PDF pp. 137–138 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R power telemetry | Module temperature/status; array, battery and load currents | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Power Regulation Unit, printed p. 11-5 / PDF p. 137, final paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R battery role | Supplies eclipse and peak-load demand; recharges from excess array power | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed pp. 11-2–11-4 / PDF pp. 134–136, Batteries and EPS operation | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R battery charge control | Cell-bank voltage monitoring, current taper and balancing | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Batteries, printed p. 11-4 / PDF p. 136, charge-control paragraphs | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R battery thermal hardware | Temperature sensors, heaters and dedicated radiators | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Batteries, printed p. 11-4 / PDF p. 136; printed p. 14-3 / PDF p. 157, final paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R attitude measurement | Star trackers and an inertial measurement unit | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Guidance Navigation & Control, printed p. 12-1 / PDF p. 141, attitude-determination paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R Sun sensors | Coarse analog sensors for Sun acquisition; fine sensor on the Sun-pointing platform | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Sun Sensors, printed pp. 12-2–12-3 / PDF pp. 142–143 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| Reaction-wheel principle | Exchange angular momentum between wheel and spacecraft | Reported | [nasa-onboard-attitude](https://science.nasa.gov/learn/basics-of-space-flight/chapter11-2/), Attitude and Articulation Control, 3-Axis paragraphs; momentum desaturation | General spacecraft engineering principle. |
| GOES-R attitude actuators | Reaction wheels, with propulsion for momentum management | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 12-1 / PDF p. 141; Propulsion Subsystem, printed p. 13-1 / PDF p. 151 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R propellant feed | Tanks, pressurant, management devices, valves, filters and pressure sensors | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Propulsion Subsystem, printed pp. 13-2–13-3 / PDF pp. 152–153; tank and feed-system paragraphs | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R propulsion functions | Orbit changes, attitude control and reaction-wheel momentum management | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Propulsion Subsystem, printed p. 13-1 / PDF p. 151, opening paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R command gateway | Validates commands and formats spacecraft health telemetry | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Command and Telemetry Processor, printed p. 10-2 / PDF p. 126 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R onboard computer | Runs flight software; routes commands, telemetry and instrument data | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), On Board Computer, printed p. 10-3 / PDF p. 127 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R remote interfaces | Gather telemetry and drive relays, heaters, motors and thruster interfaces | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), RIU/SIU, printed pp. 10-4–10-6 / PDF pp. 128–130; common functions and operational features | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| Spacecraft data handling | Command sequences and data records can be stored in onboard memory | Reported | [nasa-onboard-data](https://science.nasa.gov/learn/basics-of-space-flight/chapter11-1/), Sequence Storage; Spacecraft Clock; Telemetry Packaging and Coding; Data Storage | General spacecraft engineering principle. |
| GOES-R communications roles | Instrument data; tracking, telemetry and command; relay services | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Communications Subsystem, printed pp. 9-1–9-3 / PDF pp. 117–119; distinct service functions | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R electronics mounting | Equipment panels conduct and radiate heat toward spacecraft radiators | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 14-3 / PDF p. 157, equipment-panel radiators and wet/dry mounting paragraphs | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R heat-flow control | MLI, low-emissivity coatings and low-conductivity stand-offs reduce heat transfer | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Passive thermal control, printed p. 14-2 / PDF p. 156 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R radiator panels | Heat pipes spread heat; optical solar reflectors limit solar absorption and emit heat | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Passive thermal control, printed p. 14-2 / PDF p. 156 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R heater control | Thermostatic circuits and computer-controlled circuits with thermistor feedback | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed pp. 14-2–14-3 / PDF pp. 156–157 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R instrument thermal interfaces | Titanium mounting feet, thermal blankets and dedicated heat-rejection paths | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Earth Pointing Platform, printed p. 14-5 / PDF p. 159 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R gimbal thermal control | MLI around the gimbals and heaters; rotation interfaces remain clear | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Solar Array Wing Assembly, printed p. 14-6 / PDF p. 160 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| GOES-R propulsion thermal interfaces | Blanketed spacecraft cavity; heat shield around the apogee engine | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 14-3 / PDF p. 157, MLI and LAE paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI detector output | Filtered scene image becomes analog electrical signals | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Focal Plane Modules, printed p. 3-9 / PDF p. 37, first paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI digitization | Sensor Unit Electronics digitizes focal-plane data | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Electronics, printed p. 3-15 / PDF p. 43; analog input described on printed p. 3-9 / PDF p. 37 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI digital data path | Data Processor formats and packetizes; HSIO interfaces with SpaceWire | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-6, printed p. 3-17 / PDF p. 45, Data Processor and High Speed I/O rows | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |

## The payload

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| ABI telescope | Four mirrors; three focal-plane modules | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-8 / PDF p. 36 | GOES-R ABI civil twin only; never a military payload figure. |
| TIRS-2 refractive telescope | Four elements; f/1.64 | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Instrument design paragraphs | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 telescope design temperature | 185 K | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Radiators paragraph | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| GOES-R electronics mounting | Equipment panels conduct and radiate heat toward spacecraft radiators | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 14-3 / PDF p. 157, equipment-panel radiators and wet/dry mounting paragraphs | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI optical bench | Supports the sensor subsystems | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-4, printed p. 3-6 / PDF p. 34, Optical Bench row | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI image formation | Four-mirror telescope forms images on three focal-plane modules | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Optical System, printed p. 3-8 / PDF p. 36 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI optical-port assembly | Baffles reduce stray light; deployable cover protects against contamination | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-4, printed p. 3-6 / PDF p. 34; Optical Port Sunshield Assembly, printed p. 3-7 / PDF p. 35 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI aft optics | Beamsplitters, channel filters, windows and cold stops | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Optical System, printed p. 3-8 / PDF p. 36, Aft Optics paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI detector output | Filtered scene image becomes analog electrical signals | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Focal Plane Modules, printed p. 3-9 / PDF p. 37, first paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI focal-plane array | Detector array plus its readout integrated circuit | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Focal Plane Modules, printed p. 3-9 / PDF p. 37, second paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI video processors | Supply readout timing and bias; collect and format detector samples | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Sensor Unit Electronics, printed p. 3-16 / PDF p. 44 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI digitization | Sensor Unit Electronics digitizes focal-plane data | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Electronics, printed p. 3-15 / PDF p. 43; analog input described on printed p. 3-9 / PDF p. 37 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI digital data path | Data Processor formats and packetizes; HSIO interfaces with SpaceWire | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-6, printed p. 3-17 / PDF p. 45, Data Processor and High Speed I/O rows | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI timing | Telemetry and Timing card generates system clocks and handles telemetry | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-6, printed p. 3-17 / PDF p. 45, Telemetry and Timing row | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI instrument controller | A single-board computer operates the instrument | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-6, printed p. 3-17 / PDF p. 45, Instrument Controller row | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI peripheral controls | Calibration target, heaters, covers and telescope focus motor | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Sensor Unit Electronics, printed p. 3-16 / PDF p. 44, P&TC paragraph | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI scan controls | Motor-driver circuitry moves mirrors; encoder circuitry reports position | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Optical System, printed p. 3-7 / PDF p. 35; Table 3-6, printed p. 3-17 / PDF p. 45 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI electronics power | Power supply converts spacecraft input to instrument rails | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-6, printed p. 3-17 / PDF p. 45, Power Supply row | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI cryocooler feedback | Cold-head thermometer feeds power-amplifier duty-cycle control | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Cryocooler Control Electronics, printed p. 3-17 / PDF p. 45 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI cooler heat path | Focal planes → cooler → loop heat pipes → radiator | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Cryocooler, printed p. 3-14 / PDF p. 42 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI scan-shroud heat path | Shields collect solar heat; constant-conductance heat pipes carry it away | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Scan Shroud Assembly, printed p. 3-14 / PDF p. 42 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |
| ABI heater functions | Survival, operational and outgas heating | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Heaters, printed p. 3-15 / PDF p. 43 | Named GOES-R/ABI civil design. Representative geometry does not inherit these specifications. |

## The focal plane

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| ABI infrared channels | HgCdTe | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-5, printed p. 3-11 / PDF p. 39 | GOES-R ABI civil twin only; never a military payload figure. |
| ABI MWIR/LWIR optics and focal planes | Approximately 60 K | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-8 / PDF p. 36 | GOES-R ABI civil twin only; never a military payload figure. |
| ABI VNIR optics and focal plane | Approximately 170 K; GOES-R FPM 180 K | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-8 / PDF p. 36 | GOES-R ABI civil twin only; never a military payload figure. |
| ABI cryocooler design | Two redundant two-stage pulse-tube coolers | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-14 / PDF p. 42 | GOES-R ABI civil twin only; never a military payload figure. |
| TIRS-2 detector assemblies | Three QWIP arrays; 640 × 512 physical pixels each | Spec | [nasa-tirs2-spectral](https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf), PDF p. 1, Introduction | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 effective science row | 1,850 cross-track pixels | Spec | [nasa-tirs2-spectral](https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf), PDF p. 1; two physical rows combined per channel and inter-array overlap | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 focal-plane design temperature | 43 K | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Two-stage cryocooler paragraph | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| Reviewed dual-band InSb/HgCdTe device temperature | 77 K | Reported | [nasa-irdetectors-ntrs](https://ntrs.nasa.gov/api/citations/20100030592/downloads/20100030592.pdf), PDF p. 3, section A.1 | Specific reviewed device only, not a material-wide default. |
| Reviewed four-band laboratory QWIP array temperature | 45 K | Reported | [nasa-irdetectors-ntrs](https://ntrs.nasa.gov/api/citations/20100030592/downloads/20100030592.pdf), PDF p. 7, section A.3 | Specific NASA Earth-science research array only. |
| Historical cryocooler review at 80 K | Up to about 20% of Carnot for some space coolers | Reported | [nist-cryocooler-2009](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=901013), PDF p. 4, section 4 | Dated review context only; no selected scenario efficiency. |
| Published ideal refrigerator coefficient of performance | COP_Carnot = Tc / (Th - Tc) | Reported | [nist-refrigeration-2020](https://trc.nist.gov/cryogenics/Papers/Review/2020-Review_of_Refrigeration_Methods.pdf), PDF pp. 2-3, equation (1) and temperature definitions | Published thermodynamic identity; Tc and Th are absolute cold and hot temperatures. No calculated result or selected scenario efficiency. |

## The pixel

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| ABI infrared channels | HgCdTe | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-5, printed p. 3-11 / PDF p. 39 | GOES-R ABI civil twin only; never a military payload figure. |
| TIRS-2 detector assemblies | Three QWIP arrays; 640 × 512 physical pixels each | Spec | [nasa-tirs2-spectral](https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf), PDF p. 1, Introduction | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |

## The photon / molecular emission

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| CO2 molecular emission band | Near 4.3 μm | Reported | [nasa-combustion-bands](https://ntrs.nasa.gov/api/citations/19710021767/downloads/19710021767.pdf), Printed p. 5 / PDF p. 7 | General molecular spectroscopy in a civil combustion study; no system performance implication. |
| H2O molecular emission band | Near 2.7 μm | Reported | [nasa-combustion-bands](https://ntrs.nasa.gov/api/citations/19710021767/downloads/19710021767.pdf), Printed p. 5 / PDF p. 7 | General molecular spectroscopy in a civil combustion study; no system performance implication. |
| Atmospheric absorption | Gases absorb some wavelengths while transmitting others | Reported | [nasa-atmospheric-windows](https://science.nasa.gov/earth/earth-observatory/remote-sensing/), Absorption Bands and Atmospheric Windows, first two paragraphs | Qualitative molecular physics only; not a quantitative transmission or altitude-dependent model. |

## Ground segment

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| FORGE role | Spacecraft operations and mission-data processing | Reported | [gao-21-105249](https://www.gao.gov/assets/gao-21-105249.pdf), Printed p. 1 (PDF p. 5), opening paragraph; printed p. 8 (PDF p. 12), acquisition-strategy paragraph. | Historical public high-level description; no software internals, processing latency, or current OBAC location claim. |

## Civil twin: GOES-R ABI

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| ABI spectral channels | 16 | Spec | [noaa-abi-page](https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi), Instrument description | GOES-R ABI civil twin only; never a military payload figure. |
| ABI full-disk cadence | 10 min | Spec | [noaa-abi-page](https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi), Instrument description | GOES-R ABI civil twin only; never a military payload figure. |
| ABI mainland U.S. cadence | 5 min | Spec | [noaa-abi-page](https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi), Instrument description | GOES-R ABI civil twin only; never a military payload figure. |
| ABI mesoscale cadence | 30-60 s | Spec | [noaa-abi-page](https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi), One or two smaller areas, instrument description | GOES-R ABI civil twin only; never a military payload figure. |
| ABI telescope | Four mirrors; three focal-plane modules | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-8 / PDF p. 36 | GOES-R ABI civil twin only; never a military payload figure. |
| ABI infrared channels | HgCdTe | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Table 3-5, printed p. 3-11 / PDF p. 39 | GOES-R ABI civil twin only; never a military payload figure. |
| ABI MWIR/LWIR optics and focal planes | Approximately 60 K | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-8 / PDF p. 36 | GOES-R ABI civil twin only; never a military payload figure. |
| ABI VNIR optics and focal plane | Approximately 170 K; GOES-R FPM 180 K | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-8 / PDF p. 36 | GOES-R ABI civil twin only; never a military payload figure. |
| ABI cryocooler design | Two redundant two-stage pulse-tube coolers | Spec | [goes-r-databook](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf), Printed p. 3-14 / PDF p. 42 | GOES-R ABI civil twin only; never a military payload figure. |

## Civil twin: Landsat 9 TIRS-2

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| TIRS-2 detector assemblies | Three QWIP arrays; 640 × 512 physical pixels each | Spec | [nasa-tirs2-spectral](https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf), PDF p. 1, Introduction | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 effective science row | 1,850 cross-track pixels | Spec | [nasa-tirs2-spectral](https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf), PDF p. 1; two physical rows combined per channel and inter-array overlap | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 swath | 185 km | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Instrument design paragraphs | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 ground sampling | 100 m | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Instrument design paragraphs | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 refractive telescope | Four elements; f/1.64 | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Instrument design paragraphs | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 field of view | 15 degrees | Spec | [nasa-tirs2-spectral](https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf), PDF p. 1, Introduction | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 focal-plane design temperature | 43 K | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Two-stage cryocooler paragraph | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS-2 telescope design temperature | 185 K | Spec | [nasa-tirs2-build](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/), Radiators paragraph | Landsat 9 TIRS-2 civil twin only; never a military payload figure. |
| TIRS thermal bands | 10.6-11.2 μm; 11.5-12.5 μm | Spec | [landsat9-tirs2-nasa](https://science.nasa.gov/mission/landsat/tirs/), Spectral Bands table, bands 10 and 11 | Shared NASA TIRS-family spectral-band description. |

## The atmosphere

| Figure or fact | Value | Basis | Evidence / exact location | Scope |
|---|---|---|---|---|
| CO2 molecular emission band | Near 4.3 μm | Reported | [nasa-combustion-bands](https://ntrs.nasa.gov/api/citations/19710021767/downloads/19710021767.pdf), Printed p. 5 / PDF p. 7 | General molecular spectroscopy in a civil combustion study; no system performance implication. |
| H2O molecular emission band | Near 2.7 μm | Reported | [nasa-combustion-bands](https://ntrs.nasa.gov/api/citations/19710021767/downloads/19710021767.pdf), Printed p. 5 / PDF p. 7 | General molecular spectroscopy in a civil combustion study; no system performance implication. |
| Atmospheric absorption | Gases absorb some wavelengths while transmitting others | Reported | [nasa-atmospheric-windows](https://science.nasa.gov/earth/earth-observatory/remote-sensing/), Absorption Bands and Atmospheric Windows, first two paragraphs | Qualitative molecular physics only; not a quantitative transmission or altitude-dependent model. |

## Open gaps

- ABI aperture and standalone detector data rate have not been verified; spacecraft links are not detector data rates.
- Military hardware dimensions, masses, optical prescription and detector specifics are withheld.
- No universal detector temperature follows from its material name. T2SL default remains unresolved.
- No plume intensity, temperature, quantitative atmospheric transmission, or sensor detection-performance model is admitted.
- Ground depth, HBTSS scope, constellation-position policy, and hero attribution remain Reed’s decisions.

## Seed source audit

Every named seed record is represented below. Unchecked and pointer records are excluded from all fact references. Historical seed quotations remain preserved as the original handoff, not approved evidence.

| Source ID | Result | Reason if excluded |
|---|---|---|
| crs-nc3-primer | unchecked | Direct web open returned Failed to fetch restricted URL. Stopped; no alternate retrieval. |
| ssc-sbirs-factsheet | unchecked | Direct web open returned HTTP 403 Forbidden. Stopped; no alternate retrieval. |
| af-sbirs-factsheet-pdf | unchecked | Direct web open returned HTTP 403 Forbidden. URL date is not verified document publication date. Stopped; no alternate retrieval. |
| af-sbirs-article | unchecked | Direct web open returned HTTP 403 Forbidden. Stopped; no alternate retrieval. |
| ngopir-wikipedia | pointer | Opened directly. Not an approved primary technical citation; launch chronology remains unverified. |
| gao-21-105249 | verified |  |
| gao-26-107085 | verified |  |
| sda-tranche1-award | verified |  |
| sda-tranche1-status-fall2026 | pointer | Opened directly. No technical or operational claims admitted. Seed's specific launch dates not present in opened article. |
| mda-hbtss-wikipedia | pointer | Opened directly. HBTSS scope remains pending Reed; no technical citation admitted. |
| mda-hbtss-factsheet | unchecked | Direct web open returned Internal Error with no diagnostic detail. No alternate retrieval. HBTSS scope pending Reed. |
| sda-tracking-layer-overview-search | unchecked | No concrete source URL in seed; snippets cannot be opened as a source or cited. GAO-26 supplies separately verified architecture context. |
| resilient-meo-mwt-ssc | unchecked | Direct web open returned Internal Error with no diagnostic detail. No alternate retrieval. |
| nga-rmmwt-pe | pointer | Opened directly; historical document. Official source candidate timed out; mirror fidelity not confirmed, no published claim admitted. |
| noaa-abi-page | verified |  |
| goes-r-databook | verified |  |
| bams-abi-paper | unchecked | Fresh direct web request returned HTTP 403 Forbidden. Stopped this source and reported it; no alternate tool or mirror retry. Not cited by any fact. |
| landsat9-tirs2-nasa | verified |  |
| nasa-irdetectors-ntrs | verified |  |
| detector-operating-temps-aggregate | unchecked | Original snippet mixture has no page URLs. Specific civil examples are verified separately; no universal HgCdTe/InSb/QWIP/T2SL default was established. |
| plume-ir-emission-aggregate | unchecked | Original snippet mixture has no page URLs. Generic H2O/CO2 bands are supported by an opened NASA combustion paper; no rocket intensity or temperature was established. |
| atmospheric-windows-aggregate | unchecked | Original snippet mixture has no page URLs. General absorption/window definitions are verified separately; numeric window boundaries and transmission remain unverified. |
| cryocooler-aggregate | unchecked | Original snippet mixture has no page URLs. NIST review PDFs were resolved, opened, downloaded and quoted directly; original aggregate is not a citation. |
| forge-overview-aggregate | unchecked | No concrete source URL in seed; snippets cannot be opened as a source or cited. GAO-21 supplies separately verified high-level FORGE role. |
| ssc-obac-forge-release | unchecked | Direct web open returned Internal Error with no diagnostic detail. No alternate retrieval. |
| orbit-definitions-aggregate | unchecked | Original snippet mixture has no page URLs. Recommended NASA catalog opened directly, and NOAA confirms GEO altitude; original aggregate is not a citation. |
| sda-tracking-layer-leo-altitude | unchecked | Alias to a contractor-attributed approximate narrative in GAO-26; not adopted as a system orbital specification. |
