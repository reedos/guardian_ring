# Public spacecraft-design gap review

Reviewed 10/01/2026. This review supports an educational model, not a flight bill of materials or a reconstruction of an operational warning spacecraft.

The selected additions are recorded in [design-practices-facts.json](design-practices-facts.json). Its 31 evidence rows add 28 component-detail definitions and three system-practice explanations. The complete generated ledger now contains 241 facts and 40 verified sources, up from 210 facts and 21 sources. Nineteen sources are new; one selected source was already registered.

## What changed and why

- Recovery memory, memory-protection logic, reset circuitry and the spacecraft time counter clarify the computer's responsibilities. A counter or circuit function is not necessarily a separate chip. Safe states, fault containment and radiation assurance remain system explanations rather than additional hardware boxes. See [avionics audit](gap-audit-avionics.json).
- Position feedback, moving harnesses, vent passages, lubrication boundaries, separation interfaces and passivation interfaces fill mechanical and lifecycle gaps. See [mechanical audit](gap-audit-mechanical-lifecycle.json).
- Purge connections, material selection, fixed detector-alignment shims and interference filters clarify interfaces previously hidden inside larger assemblies. Ground purge equipment and optical test equipment are not drawn as flight components. See [optical audit](gap-audit-optical-environment.json).
- Coverglass, blanket bonding tabs, structural straps, enclosure/shield interfaces and an explicitly optional dissipative coating explain protective surfaces and electrical continuity. See [charging audit](gap-audit-charging-surfaces.json).
- Receiver processing, archives and backup power complete the representative ground path. The conceptual pixel now separates contact pad, indium joint, support and output route, with named civil examples and no inferred military fabrication stack.

ABI and TIRS-2 now expose their existing documented assemblies as separate selections. This improves navigation without inventing additional flight hardware. The inherited cooler, scan, packet and filter descriptions were reassigned to their matching physical assemblies; lens baffles are no longer labeled as a second filter assembly.

## Inventory comparison

Counts refer to the previous committed content and the revised runtime content. Each number below is the number of selections in each of the Light, Data and Heat views.

| Level | Before | Revised |
|---|---:|---:|
| Orbits | 3 | 6 |
| Satellite | 12 | 12 |
| Payload | 13 | 13 |
| Focal plane | 8 | 8 |
| Pixel | 3 | 6 |
| Plume | 3 | 5 |
| Ground | 3 | 6 |
| ABI | 3 | 9 |
| TIRS-2 | 3 | 9 |
| Atmosphere | 3 | 5 |

Across all views: 162 → 237 layer states and 60 → 85 distinct level/parent entries. Component detail displays increase from 200 → 240, representing 132 → 160 distinct detail IDs. Shared ABI/payload entries are counted once in the latter total. These are application inventory counts, not counts of physical flight parts. The orbit views retain different original parent identities across layers.

## Covered, optional or deferred

The existing redundancy-management controller/watchdog, power distribution, detector readout, cooler controls and redundant civil interfaces already cover major functions; they were not duplicated. A latch-current-limiter comparison remains optional. A radiation vault, plasma contactor, filter wheel, dedicated decontamination heater, onboard purge supply and additional mission-specific boxes are not universal requirements. The GOES-R command/data acquisition unit remains deferred pending admissible verification for a new claim. No new material thickness, dose rating, circuit topology or operational performance was inferred.

## Evidence and access review

Every selected new row has an exact section/page locator and an opened primary source. Fresh GOES-R Data Book and TIRS thermal-paper requests returned 403; those actions stopped. LLIS returned no text; RHESSI and the NASA facility page timed out; the LCL handbook and ESA PCDU page could not be read. The EMC standard was readable only through its scope. These outcomes are retained separately under `accessAttempts` in the selected ledger; none supplies candidate evidence. A fresh access failure does not overwrite earlier verified GOES-R provenance.

The NASA orbit catalog directly supports the Molniya and MEO descriptions; its LEO section uses Terra, not a Landsat example. Source locators were checked and malformed Unicode repaired. New selected ledger prose remains concise (at most 148 words per source across component names, bodies and evidence labels/values). This content review does not substitute for the separate automated and GPU browser gates.
