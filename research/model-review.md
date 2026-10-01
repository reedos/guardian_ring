# Phase 3: general science calculation review

Checked 10/01/2026. The scenario engine is a set of independent mathematical examples. It does not estimate any military sensor’s performance. The original scenario IDs and default choice are preserved.

## Delivered contract

`compute(scenario)` returns the normalized `scenario`, `status: 'educational'`, `scope`, `orbitPosition`, numerical `outputs`, evidence tuples keyed by output name in `claims`, the same tuples as `specs`, assumption IDs, and explicit `unavailable` explanations. Pure SI functions live in `src/model/orbits.ts` and `src/model/radiometry.ts`. `src/model/evidence.js` exports the source, calculation and assumption catalogs for the shared IF evidence registry.

- Orbit examples: period, instantaneous altitude, perigee, apogee, geometric distance to nadir, and one-way vacuum light time. The HEO example is evaluated at apogee and uses a half-sidereal-day period. There are no constellation or coverage calculations.
- Radiation examples: energy per photon, ideal circular-aperture diffraction angle, and energy/photon radiance of an ideal blackbody integrated over a teaching band. These results do not depend on orbit or detector choice. There is no received photon rate, plume intensity, throughput, solid angle, ground resolution, threshold, or SNR.
- The civil aperture choice returns `null` for aperture and diffraction because the ABI diameter was not verified. Every material selection returns `null` for detector temperature. The published TIRS-2 temperature remains a named civil fact, not a default for all QWIP devices.
- A separate pure function implements the ideal Carnot refrigerator limit; it assigns no cooler performance, temperature, heat load, or input power to a scenario.

## Directly opened primary references

Exact registry entries are in `src/model/evidence.js`. Source dates and access dates are distinct. The short excerpts below locate the verified material; formulas and facts are recorded in SI in the code.

| Source | Directly checked section | Verification and use |
|---|---|---|
| [NIST, 2022 CODATA complete listing](https://physics.nist.gov/cuu/Constants/Table/allascii.txt) | Rows for Planck constant, Boltzmann constant, speed of light and Stefan-Boltzmann constant | Header says “2022 CODATA adjustment.” Exact SI h, k and c; σ used for an independent integration test. Downloaded current table. |
| [NASA/JPL, Astrodynamic Parameters](https://ssd.jpl.nasa.gov/astro_par.html) | Planetary Masses, Earth; parameter table, mean sidereal day | Earth GM is 398600.435507 km³ s⁻², attributed to DE440; sidereal day is 86164.09054 s. No real satellite elements are used. |
| [NASA, Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) | Bulk parameters | “Equatorial radius (km) 6378.137.” Page updated 11/15/2024. Choosing that radius for a spherical teaching Earth is an explicit model assumption. |
| [NASA, Deriving Kepler’s Formula](https://imagine.gsfc.nasa.gov/features/yba/CygX1_mass/binary/equation_derive.html) | Equation 4 | P²/a³ = 4π²/[G(m1 + m2)]. Page updated 09/23/2020. Engine neglects the satellite mass and uses NASA/JPL’s Earth GM. |
| [NASA, How Orbital Motion is Calculated](https://pwg.gsfc.nasa.gov/stargaze/Smotion.htm) | Opening orbital-elements discussion | r = a(1 − e²)/(1 + e cos φ). Used only for generic ellipse geometry. |
| [NASA, Electromagnetic Math](https://science.nasa.gov/wp-content/uploads/2023/09/Electromagnetic_Math.pdf) | Activity 46, PDF p. 110; activity 47, PDF p. 112 | θ = 1.22 λ/D; E = hν; wavelength × frequency = c. Downloaded the PDF and visually inspected both pages. Formula constants in code use current NIST values, not rounded classroom values. |
| [NOAA NESDIS, Planck Function](https://ncc.nesdis.noaa.gov/planck.html) | First wavelength-form image and wavelength calculator | “blackbody radiance.” Opened the page and directly downloaded/viewed its linked formula image. Wavelength and radiance unit conventions checked. Historical rounded constants on the page are replaced by exact current SI h, c and k. |

Already verified Phase 1 references are also used: [NOAA’s GEO definition](https://coastwatch.noaa.gov/cwn/platform-types/geostationary-earth-orbit-satellite-geo.html) for the reference altitude; [NASA’s orbit catalog](https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/) for a generic elliptical-orbit teaching context; and [NIST’s refrigeration review](https://trc.nist.gov/cryogenics/Papers/Review/2020-Review_of_Refrigeration_Methods.pdf), PDF p. 2 Eq. 1 and p. 3 definitions, for Carnot COP. These sources describe general science, not warning-system performance.

## Assumptions and numerical method

All displayed chosen inputs carry Assumed evidence. The radius approximation and generic orbit geometry are documented by `model-orbits`; the point directly below the orbit by `model-nadir`. MEO at 20,000 km and LEO at 1,000 km are arbitrary teaching examples, not program parameters. HEO eccentricity 0.722 is chosen from NASA’s generic Molniya discussion, not an operational satellite.

The independent laboratory aperture is 0.30 m. Teaching wavelengths are 2.0, 4.3 and 10.0 μm; top-hat integration intervals are 1.5–2.5, 3.8–4.8 and 8–12 μm. These are not instrument bands or atmospheric transmission windows. The source is an ideal, emissivity-one blackbody at 288 K, not measured Earth radiance and not a plume.

The Planck function returns W m⁻² sr⁻¹ m⁻¹. A per-micrometer density is smaller by 10⁶. Integration uses composite Simpson quadrature with 512 even intervals in log wavelength and includes the wavelength Jacobian. Photon radiance is integrated after dividing each wavelength’s energy radiance by hc/λ. It is per area and solid angle, not a detector count. The logarithmic evaluation of the denominator preserves the long-wavelength limit and avoids overflow on the short-wavelength tail.

## Checks and unresolved sources

The model tests pin GEO to about 86,164 seconds and nadir light time to about 0.11937 seconds, test ellipse extrema and the range triangle, and verify Planck dimensions, Rayleigh-Jeans behavior, total Stefan-Boltzmann energy, quadrature convergence and photon energy conservation. All 96 scenario combinations have finite positive numeric outputs, evidence on each numeric output, and explicit nulls for unavailable quantities. A mutation test checks that one result cannot corrupt later result evidence.

The first NIST single-constant CGI URLs were rewritten by the web fetcher into malformed queries. They returned a normal “ill-formed request” page, not an access denial; the published complete table was independently opened and used instead. They are not cited.

`https://pmc.ncbi.nlm.nih.gov/articles/PMC5286974/` returned a reCAPTCHA challenge. Status: **unchecked**. No retry or alternate route was used for that paper, and it is not cited. The independently hosted NOAA teaching page supplies the Planck equation used here.

The ABI aperture and generic material operating temperatures remain unresolved as in Phase 1. No performance estimate fills those gaps. Downloaded source files and formula inspection images are retained locally under `research/model/downloads/`.
