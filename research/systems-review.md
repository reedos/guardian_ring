# Systems and ground research review

Reviewed 10/01/2026. This review supersedes search summaries in Sections A and D of `sources-seed.md`. Source-by-source status, exact short quotations, and claim tuples are in `systems-facts.json` and `systems/source-notes.md`.

- GAO-21, GAO-26, and SDA's 07/18/2022 award opened directly. These support public orbit families, a generic satellite bus/payload distinction, and a high-level ground processing story.
- The SBIRS fact sheets and Air Force ground article returned HTTP 403. CRS returned a restricted-URL error. MDA and both SSC PDF attempts returned an unspecified internal fetch error. No blocked source was retried through another path or tool.
- The MEO budget excerpt opened at the third-party mirror. The official FY2024 book timed out; the mirror is retained as a pointer, with no publication claims admitted.
- Both Wikipedia pointers and the National Defense article opened. They are research pointers, not approved technical citations. HBTSS inclusion still awaits Reed.
- The GAO-21 web reader opened the PDF, but its optional local download was denied by the server. No local PDF was created and no alternate download was attempted. There are no downloaded source files or hashes in this cluster.

## Corrections to carry forward

**Reported:** The seed's GAO-26 cost statement confuses a layer total with a tranche total. Table 3's $4,707 million is Tracking across the table's tranches; $6,505 million is the complete Tranche 2 total. The original Tracking quantities are 8 / 39 / 54 for Tranches 0 / 1 / 2. The note removes seven Raytheon Tranche 1 satellites. Thus 39 is not a Transport count. [GAO-26, Table 3 and notes](https://files.gao.gov/reports/GAO-26-107085/index.html).

**Reported:** Keep SDA's 28-satellite award explicitly dated 07/18/2022. The exact reconciliation to later categories remains a research gap; do not label either source's award/planned total as today's operational count. [SDA award release](https://www.sda.mil/space-development-agency-makes-awards-for-28-satellites-to-build-tranche-1-tracking-layer/).

The seed's GAO-26 approximate altitude belongs to a contractor-attributed narrative containing a rough period, not an authoritative orbit specification. Use an illustrative LEO input or a separately verified orbital parameter for later calculations. Do not use the narrative period to test the engine.

GAO-21 describes a plan as it stood in 2021; its first-launch year and constellation count are not current status. The seed's supposed FY2027 CRS quote still has no independently opened source. Omit it.

The requested detailed SBIRS optical prescription, payload masses, and scanning/staring descriptions remain unchecked. No actual military sensor geometry, performance, detector format, or timing is admitted. A representative telescope must remain explicitly schematic until another approved source is available.

## Fact-table coverage and next step

Level 1 has verified public orbit-family and dated award facts. Level 2 has a public architectural components fact. Level 3 has no verified system-specific optical facts. Ground has a verified high-level FORGE role, while Buckley/OBAC details from the unopened releases remain excluded.

Before Phase 2, Reed should review these exclusions and retain the existing decisions about HBTSS, ground depth, constellation positions, and hero attribution. No scope decision was made here.
