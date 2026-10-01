# Civil sensors, physics, and orbit source review

Accessed 10/01/2026. Phase 1 only; ready for Reed's evidence review.

The Data Book is downloaded and its ABI optical, detector, and cooler pages were visually inspected. NASA TIRS-2 material independently confirms the civil detector format, optical design, and design temperatures. Generic molecular-band and orbit facts are supported by opened primary sources. No military performance model was derived.

## Source notes

### goes-r-databook

- [GOES-R Series Data Book, Revision A](https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf) — NASA GOES-R Series Program / NOAA OSPO; dated 05/2019; accessed 10/01/2026; Primary; verified.
- Locator: Chapter 3, printed pp. 3-8, 3-11, 3-14; PDF pp. 36, 39, 42
> The LWIR and MWIR optics and FPMs are maintained at approximately 60K.

Downloaded directly; all cited pages visually inspected. The seed aperture claim was not found. System raw and rebroadcast link rates are not ABI detector rates.

Local copy: `research/physics/GOES-RSeriesDataBook.pdf`; 12,628,931 bytes. SHA-256: `6483b6811606bc2cafea3a04eedfbe4b0809dce371be05e8fefb9da4486c546e`.

### noaa-abi-page

- [Advanced Baseline Imager (ABI)](https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi) — NOAA/NESDIS; dated Undated live page; accessed 10/01/2026; Primary; verified.
- Locator: Main instrument description
> It detects visible and infrared light using 16 spectral bands, with each band capturing a different set of data.

### landsat9-tirs2-nasa

- [Thermal Infrared Sensor (TIRS)](https://science.nasa.gov/mission/landsat/tirs/) — NASA Science; dated Undated live page; accessed 10/01/2026; Primary; verified.
- Locator: Design; Spectral Bands
> TIRS employs Quantum Well Infrared Photodetectors (QWIPs) to detect long wavelengths of light

This shared page mixes Landsat 8 and 9, and its 640-detector image caption explicitly names Landsat 8. Dedicated TIRS-2 sources below corroborate L9 facts.

### nasa-tirs2-build

- [TIRS-2 Testing: A Landsat 9 Instrument Takes Shape](https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/) — NASA Landsat Project Science Support; dated 03/01/2018; accessed 10/01/2026; Primary; verified.
- Locator: Instrument design paragraphs following test photographs
> A two-stage mechanical cryocooler will cool TIRS-2’s focal plane.

Historical prelaunch design article; its anticipated launch date is not a current schedule claim.

### nasa-tirs2-spectral

- [Landsat 9 Thermal Infrared Sensor 2 Subsystem-Level Spectral Test Results](https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf) — NASA NTRS / instrument team; dated 2018; accessed 10/01/2026; Primary; verified.
- Locator: PDF p. 1, Introduction
> The three SCAs (SCA-A, B, and C) have 640 × 512 pixels each

Science mode combines two rows per channel into one effective row; do not compute data rate from every physical array element. Source labels the second channel B12 inconsistently; use NASA's shared-page Bands 10 and 11 designation.

Local copy: `research/physics/nasa-tirs2-spectral-20180004892.pdf`; 323,275 bytes. SHA-256: `7309e05070bcd8994ca6b45601a48d10c0996e029446263d332ca6879f283d99`.

### nasa-irdetectors-ntrs

- [Infrared Detectors Overview in the Short Wave Infrared to Far Infrared for CLARREO Mission](https://ntrs.nasa.gov/api/citations/20100030592/downloads/20100030592.pdf) — NASA Langley / NTRS; dated 2010 (PDF creation metadata; exact publication date unconfirmed); accessed 10/01/2026; Primary; verified.
- Locator: PDF pp. 3-7, sections A.1-A.3 and Table 1
> The dual band InSb/HgCdTe sandwich detector operates at 77°K

Material names do not define universal operating temperatures. Values in this review are tied to specific civil instruments or laboratory devices. AIRS prose and Table 1 differ (60 K vs. 58 K); omit a single AIRS value. T2SL default remains unresolved.

Local copy: `research/physics/nasa-irdetectors-20100030592.pdf`; 379,381 bytes. SHA-256: `6975d74bba6ed572c49cf68667327c286ff818bf49e4837165f82da98d0c395a`.

### nist-cryocooler-2009

- [Cryocoolers: the state of the art and recent developments](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=901013) — NIST / Ray Radebaugh; dated 03/31/2009; accessed 10/01/2026; Primary; verified.
- Locator: PDF p. 4, section 4
> Efficiencies at 80 K can be as high as about 20% of Carnot for some of the best space cryocoolers

A dated review, not a specification for ABI, TIRS-2, or any military instrument.

Local copy: `research/physics/nist-radebaugh-2009.pdf`; 794,026 bytes. SHA-256: `f76b520526750e3ee5f94fd35ef3388c0a0b74d94c97952e788b0db372c76dc0`.

### nist-refrigeration-2020

- [Review of Refrigeration Methods (submitted chapter)](https://trc.nist.gov/cryogenics/Papers/Review/2020-Review_of_Refrigeration_Methods.pdf) — NIST / Ray Radebaugh; dated 2020 (submitted version); accessed 10/01/2026; Primary; verified.
- Locator: PDF pp. 2-3, equation (1) and following paragraph
> The actual COP of a real refrigerator can be expressed as a percentage of the Carnot COP

Equation (1): COP_Carnot = Tc / (Th - Tc). Any future heat lift, hot temperature, or efficiency selected for the schematic remains Assumed. No engine implementation in Phase 1.

Local copy: `research/physics/nist-refrigeration-review-2020.pdf`; 2,891,338 bytes. SHA-256: `a094b119b30f998b4c2dad36c84b568d81e2eb7e353018d598c41ae877275265`.

### nasa-combustion-bands

- [Determination of primary-zone smoke concentrations from spectral radiance measurements in gas turbine combustors](https://ntrs.nasa.gov/api/citations/19710021767/downloads/19710021767.pdf) — NASA Lewis / Carl T. Norgren; dated 07/1971; accessed 10/01/2026; Primary; verified.
- Locator: Printed p. 5; PDF p. 7, gaseous combustion products paragraph
> they absorb and emit radiation only within discrete wavelengths.

Use only general molecular-band physics. This civil gas-turbine source establishes H2O and CO2 emission bands, not a rocket intensity, temperature, atmospheric transmission model, or real sensor response.

Local copy: `research/physics/nasa-combustion-bands-19710021767.pdf`; 2,705,447 bytes. SHA-256: `46b7543f7f91e421556d9c0aa4c4b7c5233679b688aafda7336d660ac87f5a3f`.

### nasa-atmospheric-windows

- [Remote Sensing](https://science.nasa.gov/earth/earth-observatory/remote-sensing/) — NASA Earth Observatory; dated 09/17/1999; accessed 10/01/2026; Primary; verified.
- Locator: Absorption Bands and Atmospheric Windows
> The gases that comprise our atmosphere absorb radiation in certain wavelengths while allowing radiation with differing wavelengths to pass through.

Use the qualitative definition only; no quantitative transmission or altitude-dependent claim was verified.

### nasa-orbit-catalog

- [Catalog of Earth Satellite Orbits](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/) — NASA Earth Observatory; dated 09/04/2009; accessed 10/01/2026; Primary; verified.
- Locator: High Earth Orbit; Medium Earth Orbit
> A satellite in a circular geosynchronous orbit directly over the equator (eccentricity and inclination at zero) will have a geostationary orbit

General orbit definitions only. Historical mission examples in this article are not current status. Molniya values describe a generic orbit, not actual warning-satellite elements.

### noaa-geo-definition

- [Geostationary Earth Orbit Satellite (GEO)](https://coastwatch.noaa.gov/cwn/platform-types/geostationary-earth-orbit-satellite-geo.html) — NOAA CoastWatch; dated Undated live page; accessed 10/01/2026; Primary; verified.
- Locator: Definition paragraph
> 35,786 kilometers above the Equator, rotating with the Earth as both move through space.

### bams-abi-paper

**unchecked** — Fresh direct web request returned HTTP 403 Forbidden. Stopped this source and reported it; no alternate tool or mirror retry. Not cited by any fact.

Attempted URL: https://journals.ametsoc.org/view/journals/bams/98/4/bams-d-15-00230.1.xml

### detector-operating-temps-aggregate

**unchecked** — Original snippet mixture has no page URLs. Specific civil examples are verified separately; no universal HgCdTe/InSb/QWIP/T2SL default was established.

Replacement primary sources: nasa-irdetectors-ntrs, goes-r-databook, nasa-tirs2-build.

### plume-ir-emission-aggregate

**unchecked** — Original snippet mixture has no page URLs. Generic H2O/CO2 bands are supported by an opened NASA combustion paper; no rocket intensity or temperature was established.

Replacement primary sources: nasa-combustion-bands.

### atmospheric-windows-aggregate

**unchecked** — Original snippet mixture has no page URLs. General absorption/window definitions are verified separately; numeric window boundaries and transmission remain unverified.

Replacement primary sources: nasa-atmospheric-windows.

### cryocooler-aggregate

**unchecked** — Original snippet mixture has no page URLs. NIST review PDFs were resolved, opened, downloaded and quoted directly; original aggregate is not a citation.

Replacement primary sources: nist-cryocooler-2009, nist-refrigeration-2020.

### orbit-definitions-aggregate

**unchecked** — Original snippet mixture has no page URLs. Recommended NASA catalog opened directly, and NOAA confirms GEO altitude; original aggregate is not a citation.

Replacement primary sources: nasa-orbit-catalog, noaa-geo-definition.

## Seed inventory coverage

All eleven source IDs in seed sections B, C, and E are accounted for. Unchecked aggregates are not citations; their independently opened replacements have separate source IDs.

| Seed ID | Section | Disposition |
|---|---|---|
| noaa-abi-page | B | verified |
| goes-r-databook | B | verified |
| bams-abi-paper | B | unchecked |
| landsat9-tirs2-nasa | B | verified |
| nasa-irdetectors-ntrs | C | verified |
| detector-operating-temps-aggregate | C | unchecked; replacements: nasa-irdetectors-ntrs, goes-r-databook, nasa-tirs2-build |
| plume-ir-emission-aggregate | C | unchecked; replacements: nasa-combustion-bands |
| atmospheric-windows-aggregate | C | unchecked; replacements: nasa-atmospheric-windows |
| cryocooler-aggregate | C | unchecked; replacements: nist-cryocooler-2009, nist-refrigeration-2020 |
| orbit-definitions-aggregate | E | unchecked; replacements: nasa-orbit-catalog, noaa-geo-definition |
| sda-tracking-layer-leo-altitude | E | pointer; see systems ledger `gao-26-107085`. Contractor-attributed approximate altitude is not an orbital specification. |

## Verified facts by level

Rows in `physics-facts.json` use IF's `[label, value, basis, {refs: [[sourceId, locator]]}]` shape. Basis keys are lowercase; visible labels follow IF. Civil facts stay explicitly tied to their instrument.

### orbits

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| Geostationary altitude | 35,786 km | Reported | noaa-geo-definition: Definition paragraph |
| Geosynchronous period | 23 h 56 min 4 s | Reported | nasa-orbit-catalog: Introductory altitude-and-period example |
| Generic Molniya inclination | 63.4 degrees | Reported | nasa-orbit-catalog: Medium Earth Orbit |
| Generic Molniya period | About 12 h | Reported | nasa-orbit-catalog: Medium Earth Orbit |

### payload

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| ABI telescope | Four mirrors; three focal-plane modules | Spec | goes-r-databook: Printed p. 3-8 / PDF p. 36 |
| TIRS-2 refractive telescope | Four elements; f/1.64 | Spec | nasa-tirs2-build: Instrument design paragraphs |
| TIRS-2 telescope design temperature | 185 K | Spec | nasa-tirs2-build: Radiators paragraph |

### focal-plane

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| ABI infrared channels | HgCdTe | Spec | goes-r-databook: Table 3-5, printed p. 3-11 / PDF p. 39 |
| ABI MWIR/LWIR optics and focal planes | Approximately 60 K | Spec | goes-r-databook: Printed p. 3-8 / PDF p. 36 |
| ABI VNIR optics and focal plane | Approximately 170 K; GOES-R FPM 180 K | Spec | goes-r-databook: Printed p. 3-8 / PDF p. 36 |
| ABI cryocooler design | Two redundant two-stage pulse-tube coolers | Spec | goes-r-databook: Printed p. 3-14 / PDF p. 42 |
| TIRS-2 detector assemblies | Three QWIP arrays; 640 × 512 physical pixels each | Spec | nasa-tirs2-spectral: PDF p. 1, Introduction |
| TIRS-2 effective science row | 1,850 cross-track pixels | Spec | nasa-tirs2-spectral: PDF p. 1; two physical rows combined per channel and inter-array overlap |
| TIRS-2 focal-plane design temperature | 43 K | Spec | nasa-tirs2-build: Two-stage cryocooler paragraph |
| Reviewed dual-band InSb/HgCdTe device temperature | 77 K | Reported | nasa-irdetectors-ntrs: PDF p. 3, section A.1 |
| Reviewed four-band laboratory QWIP array temperature | 45 K | Reported | nasa-irdetectors-ntrs: PDF p. 7, section A.3 |
| Historical cryocooler review at 80 K | Up to about 20% of Carnot for some space coolers | Reported | nist-cryocooler-2009: PDF p. 4, section 4 |
| Published ideal refrigerator coefficient of performance | COP_Carnot = Tc / (Th - Tc) | Reported | nist-refrigeration-2020: PDF pp. 2-3, equation (1) and temperature definitions |

### pixel

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| ABI infrared channels | HgCdTe | Spec | goes-r-databook: Table 3-5, printed p. 3-11 / PDF p. 39 |
| TIRS-2 detector assemblies | Three QWIP arrays; 640 × 512 physical pixels each | Spec | nasa-tirs2-spectral: PDF p. 1, Introduction |

### plume

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| CO2 molecular emission band | Near 4.3 μm | Reported | nasa-combustion-bands: Printed p. 5 / PDF p. 7 |
| H2O molecular emission band | Near 2.7 μm | Reported | nasa-combustion-bands: Printed p. 5 / PDF p. 7 |
| Atmospheric absorption | Gases absorb some wavelengths while transmitting others | Reported | nasa-atmospheric-windows: Absorption Bands and Atmospheric Windows, first two paragraphs |

### abi

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| ABI spectral channels | 16 | Spec | noaa-abi-page: Instrument description |
| ABI full-disk cadence | 10 min | Spec | noaa-abi-page: Instrument description |
| ABI mainland U.S. cadence | 5 min | Spec | noaa-abi-page: Instrument description |
| ABI mesoscale cadence | 30-60 s | Spec | noaa-abi-page: One or two smaller areas, instrument description |
| ABI telescope | Four mirrors; three focal-plane modules | Spec | goes-r-databook: Printed p. 3-8 / PDF p. 36 |
| ABI infrared channels | HgCdTe | Spec | goes-r-databook: Table 3-5, printed p. 3-11 / PDF p. 39 |
| ABI MWIR/LWIR optics and focal planes | Approximately 60 K | Spec | goes-r-databook: Printed p. 3-8 / PDF p. 36 |
| ABI VNIR optics and focal plane | Approximately 170 K; GOES-R FPM 180 K | Spec | goes-r-databook: Printed p. 3-8 / PDF p. 36 |
| ABI cryocooler design | Two redundant two-stage pulse-tube coolers | Spec | goes-r-databook: Printed p. 3-14 / PDF p. 42 |

### tirs2

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| TIRS-2 detector assemblies | Three QWIP arrays; 640 × 512 physical pixels each | Spec | nasa-tirs2-spectral: PDF p. 1, Introduction |
| TIRS-2 effective science row | 1,850 cross-track pixels | Spec | nasa-tirs2-spectral: PDF p. 1; two physical rows combined per channel and inter-array overlap |
| TIRS-2 swath | 185 km | Spec | nasa-tirs2-build: Instrument design paragraphs |
| TIRS-2 ground sampling | 100 m | Spec | nasa-tirs2-build: Instrument design paragraphs |
| TIRS-2 refractive telescope | Four elements; f/1.64 | Spec | nasa-tirs2-build: Instrument design paragraphs |
| TIRS-2 field of view | 15 degrees | Spec | nasa-tirs2-spectral: PDF p. 1, Introduction |
| TIRS-2 focal-plane design temperature | 43 K | Spec | nasa-tirs2-build: Two-stage cryocooler paragraph |
| TIRS-2 telescope design temperature | 185 K | Spec | nasa-tirs2-build: Radiators paragraph |
| TIRS thermal bands | 10.6-11.2 μm; 11.5-12.5 μm | Spec | landsat9-tirs2-nasa: Spectral Bands table, bands 10 and 11 |

### atmosphere

| Fact | Value | Basis | Source and locator |
|---|---|---|---|
| CO2 molecular emission band | Near 4.3 μm | Reported | nasa-combustion-bands: Printed p. 5 / PDF p. 7 |
| H2O molecular emission band | Near 2.7 μm | Reported | nasa-combustion-bands: Printed p. 5 / PDF p. 7 |
| Atmospheric absorption | Gases absorb some wavelengths while transmitting others | Reported | nasa-atmospheric-windows: Absorption Bands and Atmospheric Windows, first two paragraphs |

## Unresolved and bounded

- ABI aperture: seed's approximately 0.313 m value was not located in the downloaded Data Book. Do not cite or implement as Spec.
- ABI standalone detector/output data rate: not established. Data Book spacecraft raw and GRB broadcast rates must not be relabeled as ABI rates.
- No universal detector operating-temperature table; T2SL remains unresolved, and device-specific evidence must remain device-specific.
- No rocket plume intensity, temperature, pixel photon budget, real-system threshold, or altitude-dependent atmospheric model has been established.
- The sources support qualitative atmospheric absorption, not a quantitative transmission curve.
- The current TIRS page is mixed L8/L9; dedicated L9 sources are required for array/design claims.
- NASA catalog treats generic Molniya as a medium Earth orbit example. Use highly elliptical as shape terminology; do not confuse HEO with its high Earth orbit altitude category.
- AMS blocked source and original search aggregates remain unchecked and uncited.

## Next phase proposal

After Reed's Phase 1 review, use the verified civil anatomy and generic orbit definitions to prepare the static story mock and schematic stills. Keep unsourced dimensions as drawn. Obtain look approval before engine or detailed scene implementation; preserve the open decisions in PLAN.md.
