# Systems source notes

Accessed 10/01/2026. Quotes are deliberately short. A section locator identifies the remaining supporting text. `systems-facts.json` is the claim and status ledger. Unchecked sources are never claim references.

## Directly opened primary sources

### gao-21-105249

Title: Missile Warning Satellites: Comprehensive Cost and Schedule Information Would Enhance Congressional Oversight. Publisher: Government Accountability Office. Published 09/22/2021. Kind: government audit. [Original PDF](https://www.gao.gov/assets/gao-21-105249.pdf).

Exact quote, printed page 4 (PDF page 8): “satellites in geosynchronous earth orbits (GEO) and highly elliptical orbits (HEO).”

Exact quote, printed page 1 (PDF page 5), FORGE description: “to operate the satellites and process the mission data they collect.”

Additional locator: printed page 8 (PDF page 12), paragraph beginning with the 05/2018 acquisition strategy, describes data processing/dissemination, spacecraft control, and relay ground stations. Historical plan only. Web PDF opened; local download denied by GAO server. No local PDF or SHA256.

### gao-26-107085

Title: Missile Warning Satellites: Space Development Agency Should Be More Realistic and Transparent About Risks to Capability Delivery. Publisher: Government Accountability Office. Published 01/28/2026, revised 02/02/2026. Kind: government audit. [Opened HTML report](https://files.gao.gov/reports/GAO-26-107085/index.html).

Exact quote, Table 3 note: “SDA ultimately launched 27 Tranche 0 satellites and removed seven Raytheon satellites from Tranche 1 (Tracking).”

Locators: Table 1 (orbit-family composition); Table 3 (original contract quantities/costs, dated 07/2025); “PWSA-Enabling Technologies and Processes” (bus, payload, processor, communications); “SDA Is Overestimating Technology Maturity” (contractor-attributed approximate altitude). Avoid treating these dated plans as operational status. The HTML's PDF-download link separately returned an internal fetch error; no PDF was downloaded.

### sda-tranche1-award

Title: Space Development Agency Makes Awards for 28 Satellites to Build Tranche 1 Tracking Layer. Publisher: SDA. Published 07/18/2022. Kind: official award release. [Opened release](https://www.sda.mil/space-development-agency-makes-awards-for-28-satellites-to-build-tranche-1-tracking-layer/).

Exact quotes: “28 satellites in four planes” (award paragraph); “wide-field-of-view infrared sensors” (director quotation).

The announcement assigns two seven-vehicle planes to each of two performers. It describes LEO but supplies no numerical orbital altitude. This is an award-date description only, with no assertion of current deployment or coverage performance.

## Directly opened pointers; excluded from publication claims

### nga-rmmwt-pe

Publisher shown inside document: Department of the Air Force. PB2024 RDT&E exhibit, PE 1206447SF, 03/2023. [Third-party mirror](https://velosteam.com/wp-content/uploads/2023/04/Line-39_1206447SF_Resilient-Missile-Warning-Missile-Tracking-Medium-Earth-Orbit-MEO.pdf).

Exact quote, exhibit page 2 (printed Volume 1 page 480): “Delivery of nine (9) total space vehicles”. This is the historical budget excerpt, not evidence of the current constellation. The official book candidate timed out, so mirror fidelity was not verified and no fact cites this pointer.

### ngopir-wikipedia

[Opened Wikipedia pointer](https://en.wikipedia.org/wiki/Next-Generation_Overhead_Persistent_Infrared). Section locator: “Program” and “Launch history.” Short exact fragment: “First launch is expected in May 2026.” No primary confirmation was obtained; no launch date is adopted.

### mda-hbtss-wikipedia

[Opened Wikipedia pointer](https://en.wikipedia.org/wiki/Hypersonic_and_Ballistic_Tracking_Space_Sensor). Locator: introductory paragraphs and References. Exact title: “Hypersonic and Ballistic Tracking Space Sensor”. No technical claims adopted. HBTSS remains pending Reed's scope decision.

### sda-tranche1-status-fall2026

Publisher: National Defense / NDIA. Author: Laura Heckmann. Published 09/15/2026. [Opened article](https://www.nationaldefensemagazine.org/articles/2026/9/15/space-development-agency-nearing-tranche-1-completion-of-proliferated-warfighter-space-architecture).

Exact short fragment, paragraph discussing the director's statement: “six launches remain in Tranche 1”. This is trade reporting, not an approved technical citation. The seed's specific 09/30 and 12/31 launch dates were not found in the opened article; no current launch-status claim is adopted.

## Unchecked: attempted directly, not cited

| ID | Outcome on 10/01/2026 |
|---|---|
| crs-nc3-primer | Web tool: “Failed to fetch restricted URL.” Seed's former verified status is not enough for this pass. |
| ssc-sbirs-factsheet | HTTP 403 Forbidden. Stopped; no alternate tool/path. |
| af-sbirs-factsheet-pdf | HTTP 403 Forbidden. Stopped; no alternate tool/path. |
| af-sbirs-article | HTTP 403 Forbidden. Stopped; no alternate tool/path. |
| mda-hbtss-factsheet | Web tool Internal Error; no diagnostic detail returned. No alternate retrieval. |
| resilient-meo-mwt-ssc | Web tool Internal Error; no diagnostic detail returned. No alternate retrieval. |
| ssc-obac-forge-release | Web tool Internal Error; no diagnostic detail returned. No alternate retrieval. |
| official-fy2024-space-force-rdte | HTTP 400 Timeout fetching. No alternate retrieval. |
| sda-tracking-layer-overview-search | Seed gives no concrete source URL. Aggregated snippets are not evidence. GAO-26 supplies separately opened architecture context. |
| forge-overview-aggregate | Seed gives no concrete source URL. Aggregated snippets are not evidence. GAO-21 supplies separately opened high-level FORGE context. |

Exact attempted URLs and source metadata are in the JSON ledger. The permission and HTTP denials were reported to the coordinating agent immediately. No failed source content is quoted or referenced by a verified fact.
