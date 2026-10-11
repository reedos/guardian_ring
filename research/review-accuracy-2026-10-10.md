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
