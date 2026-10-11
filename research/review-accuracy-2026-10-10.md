# Accuracy review, 10/10/2026

Reviewer: Claude (closed-loop accuracy lane), branch `claude/review-accuracy`. Scope: physics, every Calc., every
Spec/Vendor/Reported figure against its cited source, glossary definitions, and page prose (index, visualizer, method,
evidence, glossary, parts, `src/pages/*`, card and lesson text in `src/*.js`). Public sources only. Nothing here states
or implies classified performance of a real system.

Method: all 964 site claims were deduplicated to 318 unique rows (219 Spec, 56 Reported, 1 Vendor, 30 Calc., 12
Assumed). Every Calc. was re-derived outside the engine (own constants, own 200,000-step trapezoid Planck integral,
own Kepler/vis-viva). Each numeric Spec/Reported row was checked against the source text: web pages were re-opened;
PDFs were re-opened and their text extracted page by page (NTRS TIRS-2 spectral paper, NASA combustion study, GAO-21-105249,
NIST cryocooler 2009, NIST refrigeration 2020, NASA Electromagnetic Math, NASA IR detector overview, and the local copy
of the GOES-R Series Data Book at `research/physics/GOES-RSeriesDataBook.pdf`). About 204 Data Book rows and their card
prose were checked page by page in a parallel pass.

Verdicts: correct · wrong · unsupported · overstated · wrong locator · stale source · classified-line risk.

## Round 1 ledger

### Calculations (re-derived independently)

| Claim | Location | Verdict | Evidence |
|---|---|---|---|
| GEO period 23.934 h, speed 3.075 km/s, nadir 35,786 km, light time 0.1194 s | engine.ts, model claims | correct | a = 42,164.137 km; T = 86,164.0 s; v = √(μ/a) = 3.07466 km/s; t = 35,786 km / c = 0.119369 s |
| HEO apogee 39,361 km, perigee 1,006 km, apogee speed 1.556 km/s, period 11.967 h, light time 0.1313 s | engine.ts | correct | a = 26,561.76 km from half the JPL sidereal day; e = 0.722; vis-viva at r = a(1+e) |
| MEO 11.843 h, 3.887 km/s, 0.0667 s; LEO 1.752 h, 7.350 km/s, 0.0033 s | engine.ts | correct | Same formulas |
| Photon energy 9.932e-20 / 4.620e-20 / 1.986e-20 J at 2.0 / 4.3 / 10 μm | engine.ts | correct | hc/λ with exact SI h, c |
| 288 K band radiance 0.0003730 / 0.7708 / 31.39 W m⁻² sr⁻¹ (1.5–2.5, 3.8–4.8, 8–12 μm) | engine.ts | correct | Independent trapezoid integral agrees to 4 significant figures |
| Photon radiance 4.449e15 / 1.715e19 / 1.583e21 s⁻¹ m⁻² sr⁻¹ | engine.ts | correct | Same integral divided by hc/λ |
| Diffraction 8.13 / 17.49 / 40.67 μrad for D = 0.30 m | engine.ts | correct | 1.22 λ/D |
| Carnot COP 0.1673, minimum work 5.977 W, rejected heat 6.977 W (43 K / 300 K / 1 W) | civil-cooling.ts, focal-content.js | correct | 43/257; 257/43; 1 + 257/43 |
| Wheel slew, eclipse energy, charge/ADC, two-point calibration, slab radiance | cinematic-physics.js | correct | Quintic smoothstep derivative 30u²(1−u)²; momentum (Ib+Iw)ωb + Iw ωrel = 0; energy 0.8 → 0.5 → 0.8 closes; τL + (1−τ)B |
| Parabolic focus: path length entry + f | ideal-focus.js, method | correct | √(4fz + (f−z)²) = f + z |
| Scan mirror angular doubling | scan-optics.js, method | correct | d′ = d − 2(d·n)n |
| Planck plots 400→800 K, 500 K source / 280 K slab, 1–20 μm | cinematic-renderers.js vs method text | correct | Code matches the stated inputs |
| Slab calc text called τ an “invented optical depth” | cinematic-evidence.js `cinematic-slab` | wrong (terminology) | In the formula and code τ is transmittance (0 ≤ τ ≤ 1), not optical depth. **Fixed**: τ = exp(−optical depth), “invented transmittance curve” |
| `ideal-cooling-work` missing from the audit’s calculation test map | tools/claim-audit-report.mjs | process gap | The report threw before certifying. **Fixed**: map entry added; new engine test pins 43/257, 5.977 W, 6.977 W |

### Sourced figures

| Claim | Location | Verdict | Evidence (re-opened 10/10/2026) |
|---|---|---|---|
| Geostationary altitude 35,786 km | story, orbits cards | correct | NOAA CoastWatch: “a fixed perspective 35,786 kilometers above the Equator” |
| Geosynchronous period 23 h 56 min 4 s | story, orbits cards | correct | NASA orbit catalog: “23 hours, 56 minutes, and 4 seconds” |
| Earth GM 398,600.435507 km³ s⁻²; mean sidereal day 86,164.09054 s | orbits.ts | correct | JPL Astrodynamic Parameters |
| Molniya e = 0.722 locator “Highly Elliptical Orbits” | engine.ts ORBIT_REFS (shown on method and evidence), glossary HEO | wrong locator | The catalog has no such heading; Molniya (63.4°, 0.722, 12 h) is in the Medium Earth Orbit section and is called “highly eccentric.” **Fixed** in engine.ts and write-pages.mjs |
| ABI 16 bands; full disk 10 min; U.S. 5 min; mesoscale 30–60 s | story, ABI cards | correct | NOAA NESDIS ABI page |
| ABI 4-mirror telescope, 3 FPMs; ~60 K MWIR/LWIR; ~170 K VNIR (180 K GOES-R FPM) | ABI cards | correct | Data Book PDF p. 36 |
| ABI two redundant two-stage pulse-tube coolers | ABI cards | correct | Data Book PDF p. 42 |
| “ABI infrared channels = HgCdTe” | remaining-content.js, physics-facts.json | overstated | Table 3-5 (PDF p. 39): 0.86 μm near-IR channel is silicon; HgCdTe covers 1.378–13.3 μm. **Fixed**: label “ABI detector material, 1.378–13.3 μm channels”; card body names the silicon channels |
| “ABI aft optics = beamsplitters, channel filters, windows and cold stops” | spacecraft-content.js, spacecraft-facts.json | overstated | PDF p. 36: BS1 belongs to the Telescope Assembly and filters are integrated into the FPMs. **Fixed**: “MW/LW beamsplitter, windows and cold stops; channel filters integrated into the FPMs” |
| “Equipment panels conduct and radiate heat toward spacecraft radiators” | spacecraft-content.js | wrong (attribution) | PDF p. 157: the equipment panels *are* the radiators; boxes are wet or dry mounted to them. **Fixed** value and two card sentences |
| “ABI’s cold-finger …” | focal-content.js heat card | unsupported term | Data Book describes a TDU with a remote cold head and transfer line. **Fixed** |
| GOES-R array 42 cells × 10 strings × 16 circuits; 70 V and 28 V buses | satellite cards | correct | PDF pp. 133–135 (6,720 cells = 16 × 10 × 42) |
| ~200 other Data Book role rows (EPS, GN&C, C&DH, comms, thermal, ABI electronics, cryocooler control) | spacecraft-content, component-catalog, instrument-integration | correct | Page-by-page check; all locators matched |
| TIRS-2: 3 QWIP SCAs 640 × 512; 1,850 detectors; 15° (≈185 km); four-element f/1.64 | TIRS-2 cards | correct | NTRS 20180004892 p. 1 |
| TIRS-2 43 K focal plane; 185 K telescope; 185 km; 100 m; bands 10.6–11.2 and 11.5–12.5 μm | TIRS-2 cards, story | correct | NASA TIRS page. `nasa-tirs2-build` returned HTTP 403 today; it was verified 10/01/2026 and the TIRS page corroborates every figure (see Reed items) |
| CO₂ near 4.3 μm; H₂O near 2.7 μm | plume, atmosphere, story | correct | NASA combustion study printed p. 5: water bands 1.38, 1.87, 2.7, 3.2, 5.7 μm; CO₂ 2.0, 2.7, 4.3, 4.8, 5.2 μm |
| Atmospheric gases absorb some wavelengths and transmit others | atmosphere, story | correct | NASA Earth Observatory remote-sensing page |
| Cryogenic cooling can reduce thermal noise | focal plane, pixel, story | correct | NIST 2009 Table 1 “Low thermal noise” |
| Up to about 20% of Carnot at 80 K for some space coolers | research facts | correct | NIST 2009 p. 4 |
| Lab InSb/HgCdTe 77 K; four-band QWIP 45 K | research facts | correct | NASA IR detector overview |
| 1.22 λ/D; E = hν; λν = c | glossary, method | correct | NASA Electromagnetic Math pp. 110, 112 |
| Carnot COP = Tc/(Th − Tc) | method | correct | NIST 2020 Eq. (1) |
| SBIRS in GEO and HEO; FORGE operates satellites and processes mission data | orbits, ground cards, glossary | correct | GAO-21-105249 pp. 1, 4, 8 |
| PWSA bus, IR sensors, mission data processors, communications | story, glossary | correct | GAO-26-107085 |
| Webb: photon makes electron-hole pairs; indium joins absorber to ROIC; many pixels to few outputs | pixel cards | correct | NASA Webb detectors page |
| Reaction wheels trade angular momentum; desaturation | satellite cards, lesson | correct | NASA Basics of Space Flight ch. 11 |

### Prose and glossary

| Claim | Location | Verdict | Note |
|---|---|---|---|
| Index story text (hero, levels 01–06, data path, civil twins, evidence rule) | index.html | correct | Every figure carries a chip and matches its row |
| Method text (scope, 21 formulas, 10 assumptions, checks) | method.html | correct except slab wording and locator above | |
| Cinematic lessons, 10 lessons × 5 beats | cinematic-lessons.js | correct | Wien shift, frame-dependence of GEO, momentum exchange, eclipse budget, two-point calibration |
| Mission tour chapters | mission-tour.js | correct | Generic; no system performance |
| Glossary, 76 definitions | glossary.html | correct except two | |
| “Sidereal day … relative to the distant celestial reference frame” | glossary | overstated | JPL’s mean sidereal day is referenced to the precessing equinox (the stellar day differs by about 8 ms). **Fixed**: “measured against the stars rather than the Sun … JPL’s tabulated mean value is referenced to the equinox” |
| HEO definition and locator | glossary | wrong locator | **Fixed** (see Molniya row) |
| Classified-line check | all of the above | no risk found | No sensitivity, threshold, resolution, focal-plane format or false-alarm figure for a military system appears; civil formats stay with ABI/TIRS-2 |

### Round 1 verification

`npx tsc --noEmit` clean · `npx vitest run` 52 files, 293 tests passed · `npx tsx tools/claims.mjs` 0 problems ·
`npm run build` ok · links gate PASS (0 problems, 15 states) · pages gate PASS (8 of 8) · `test-claim-page-policy.mjs`
PASS · `claim-audit-report.mjs` certified (0 unreviewed; 46 new page rows reviewed, including civil-cooling rows that
were unreviewed before this branch). Preview on port 47631.

## Round 2 ledger (re-audit of round 1 fixes plus a fresh sample)

| Claim | Location | Verdict | Evidence |
|---|---|---|---|
| Round 1 label “ABI detector material, 1.378–13.3 μm channels” | remaining-content.js, physics-facts.json, verified-facts | correct | Table 3-5 re-read; regenerated ledgers match canonical rows (claims.mjs 0 problems) |
| Same label in the generator and review notes | research/physics/build-notes.py, physics-review.md | stale | The generator would have restored the old label on its next run. **Fixed** in both |
| HEO glossary text and Molniya locator | glossary.html, method.html, evidence.html | correct | Catalog: Molniya under Medium Earth Orbit, “highly eccentric,” 0.722, 12 h |
| Sidereal-day glossary text | glossary.html | correct | Mean sidereal day 86,164.09054 s vs 86,400 s solar day: about 3 min 56 s shorter |
| ABI SUE releases OPC and SCC launch locks; P&TC drives SCC and focus motor | expanded-content.js | correct | Data Book PDF p. 44 |
| Expanded ABI scan, calibration, aft-optics, data-interface, power, cryocooler-feedback cards (22 bodies) | expanded-content.js | correct | Data Book pp. 35–45, 157 |
| System-diagram and instrument-integration prose (25 strings) | src/pages/system-diagrams.js, instrument-integration.js | correct | Data Book; NTRS 20180005348 |
| Component glossary (15 definitions) | src/pages/component-glossary.js | correct | Data Book pp. 42–45, 126–131, 137, 164; TIRS-2 architecture paper |
| Scenario, scan-diagram and focus-demo control text | src/app/*.js | correct | Angular doubling and reciprocity match the scan-optics tests |
| Polar orbit equation locator “Opening discussion” | engine.ts, method | correct | Formula first appears before any heading: “The equation of the orbit is” |
| Lockheed Martin 2014 release (Vendor) | index, payload | correct | Names prime and payload provider; payload delivered 09/30 for GEO-4 bus integration; the site repeats no performance wording |
| Landsat 8 pushbroom description | TIRS-2 lesson | correct | NASA SVS: linear arrays “collect data across the entire image swath at once” |
| GAO-26 “about 90 minutes … at an altitude of 1,000 kilometers” | research/sources-seed.md (not on the site) | wrong in source | A circular 1,000 km orbit takes about 105 min (site LEO example 1.752 h). The sentence is attributed to unnamed contractors, not GAO analysis. **Fixed** the seed notes so the figure is not adopted |
| Seed note “civil twins’ CMOS/HgCdTe/QWIP” | research/sources-seed.md | unsupported | The Data Book says silicon, not CMOS. **Fixed** |

Round 2 verification: `npx tsc --noEmit` clean · `npx vitest run` 52 files, 293 tests passed · `npx tsx tools/claims.mjs` 0 problems. No rendered prose changed in round 2, so the
build, links and pages gates from round 1 still apply.

## Round 3 (fresh sample; nothing material found, loop stopped)

| Claim | Location | Verdict | Evidence |
|---|---|---|---|
| ESA battery passivation: discharge and prevent renewed charging | satellite power card | correct | ESA: discharge “as much as possible”; disconnect “from the solar arrays to avoid any further charge” |
| Heat transfer in vacuum by conduction and radiation | cooling lesson, thermal cards | correct | NASA SST-SoA 7.2.1: “only by radiation and conduction with no convection” |
| TIRS-2 views Earth, onboard blackbody and space | calibration lesson | correct | NTRS 20180005348: scene select mirror selects “nadir view, onboard variable temperature blackbody and space view” |

## Totals

About 560 claims checked: 318 unique site claim rows (all 30 Calc. rows re-derived; every numeric Spec/Reported row
re-opened; about 204 Data Book rows checked page by page), 76 glossary definitions, method formulas and assumptions,
index story text, 50 lesson beats, 10 mission chapters and about 75 card and diagram bodies. Errors fixed: 11 (2 overstated
ABI rows, 1 misattributed GOES-R thermal row, 1 unsupported “cold finger”, 2 wrong locators shown on three pages, 1 slab
terminology error, 1 glossary imprecision, 1 stale generator label, 2 research-note errors), plus 1 audit-tool gap.

## Items for Reed

1. `nasa-tirs2-build` (science.nasa.gov TIRS-2 article) returned HTTP 403 on 10/10/2026. It was verified on 10/01/2026 and
   every figure it supports (43 K, 185 K, 185 km, 100 m, f/1.64) also appears on the NASA TIRS page (`landsat9-tirs2-nasa`).
   Keep it as verified, or add the TIRS page as a second reference? Left unchanged.
2. GAO-26-107085 Table 3 lists 39 Tranche 1 Tracking satellites as originally planned (as of July 2025), with seven
   Raytheon satellites later removed. The research ledger’s `t1-original-award` row (“28 satellites / four planes,”
   07/18/2022 award) is historically correct and not shown on the site; no change made.
3. 46 page rows were newly recorded as reviewed in `research/page-claim-reviews.json` so the claim audit certifies. Some of
   them (the civil-cooling rows and the Kenneth Fire caption) were already unreviewed before this branch. I checked each,
   but a second reviewer may want to confirm them.

## Round 4 (coordinator request, 10/11/2026): sourcing gaps found by the story reviewer

| Item | Verdict | Evidence and action |
|---|---|---|
| CO₂ 4.3 μm / H₂O 2.7 μm cited only to a 1971 gas-turbine combustor study | gap closed | Opened NASA NTRS 20040013438, Tejwani, “Transmittance and Radiance Computations for Rocket Engine Plume Environments” (ASME HT2003-47406, NASA Stennis). PDF p. 1 names water vapor, carbon dioxide and carbon monoxide as the main IR emitters in rocket-engine plumes and says emission and absorption share line positions; PDF p. 4 gives CO₂ ν3 at 4.26 μm and H₂O ν3/ν1 at 2.66/2.74 μm. The paper states the band centers in its absorption discussion, so the new rows say “band center” rather than claiming a measured plume emission spectrum. Added as source `nasa-rocket-plume-transmittance-2003`; existing CO₂/H₂O rows now cite both studies. `plume-ir-emission-aggregate` stays unchecked |
| MEO missile warning/tracking source unchecked | gap closed with a different source | The SSC CDR release PDF still returns HTTP 403 (stays unchecked). The verified GAO-26-107085 Table 1 lists “Resilient Missile Warning/Missile Tracking – Medium Earth Orbit” (planned) and says DOD is prioritizing missile warning and tracking in LEO and MEO. No count or launch year adopted |
| LEO Tracking Layer verified but unused | row added | SDA 07/18/2022 award (re-opened): 28 satellites in four planes for missile warning and tracking from LEO; director: “wide-field-of-view infrared sensors.” Corroborated by GAO-26 Table 1 PWSA row |
| SBIRS scanning and staring sensors | Vendor only | Space Force (spaceforce.mil and losangeles.spaceforce.mil) fact sheets and the media.defense.gov PDF all return HTTP 403; recorded unchecked. Two opened Lockheed Martin documents say it: 04/20/2009 GEO-2 payload release and the 2016 SBIRS product card (“scanning sensors for wide-area surveillance and staring sensors to focus on smaller regions of interest”). Labeled Vendor. Payload masses, sensor-chip-assembly colors, detector counts and “sensitivity/revisit” wording in those documents were deliberately not adopted |

New claim keys (in `src/story-claims.js`, mirrored in `research/accuracy-2026-10-10-facts.json`):
`story:rocket-plume-emitters`, `story:rocket-plume-co2-band`, `story:rocket-plume-h2o-band`, `story:meo-mwmt-layer`,
`story:leo-tracking-layer`, `story:sbirs-scanning-staring`.

Not changed (story lane owns it): the index sentence “A civil combustion study supplies the band examples here” should
now mention the rocket-engine plume study if the story uses the new keys.

Round 4 verification: `npx tsc --noEmit` clean · `npx vitest run` 52 files, 293 tests passed · `npx tsx tools/claims.mjs`
0 problems (970 claims, 518 research rows) · build ok · links PASS (0 problems) · pages PASS (8 of 8) ·
test-claim-page-policy PASS · claim-audit-report certified (48 new page rows reviewed).

## Round 5

Coordinator request, 10/11/2026. The Space Force SBIRS fact sheet
(https://www.spaceforce.mil/about-us/fact-sheets/article/2197746/space-based-infrared-system/, footer “Current as of
March 2023”) was opened in a real browser by the review coordinator on 10/11/2026; this reviewer’s fetch tool still gets
HTTP 403, so the quotes are the coordinator’s verbatim transcription. Recorded as `ssc-sbirs-factsheet`, verified.

| Item | Action |
|---|---|
| Official sensor wording | “The infrared payload consists of two sensors; a scanner and a step-starer.” `story:sbirs-scanning-staring` relabeled Vendor → **Spec**, value “A scanner and a step-starer (scanning and step-staring sensors)”, fact sheet cited first, the two Lockheed Martin documents kept as secondary |
| HEO hosted payloads | New `story:sbirs-program-segments` (Spec): GEO satellites, HEO sensors on host satellites, legacy DSP satellites and ground systems. Fact sheet added as a second ref to the orbits card row “SBIRS orbit families” (and its canonical row in systems-facts.json) and to the SBIRS glossary entry |
| Onboard processing and raw downlink | New `story:sbirs-data-downlink` (Spec): raw unprocessed data plus on-board detected events. No algorithm, rate or latency |
| SWIR/MWIR | New `story:sbirs-ir-bands` (Spec): “detect short-wave and mid-wave infrared signals.” Broad categories only. No existing site claim needed it |
| Not adopted | Sensitivity and revisit wording; sensor/satellite dimensions and weights (the site assigns no masses; AGENTS.md rules out invented masses and PLAN §6 lists masses as not public, so these are left for Reed) |
| Dead and download-only URLs | Los Angeles AFB fact sheet (…/Article/734550/…) redirects to the newcomers page: recorded dead, cited nowhere. media.defense.gov SBIRS PDF and SSC MEO release PDF serve as file downloads, not downloaded: stay unchecked with that reason |

Round 5 verification: `npx tsc --noEmit` clean · `npx vitest run` 52 files, 293 tests passed · `npx tsx tools/claims.mjs`
0 problems (973 claims, 524 research rows) · build ok · links PASS (0 problems) · pages PASS (8 of 8) ·
test-claim-page-policy PASS · claim-audit-report certified (9 new page rows reviewed).
