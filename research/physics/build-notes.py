"""Phase 1 research ledger. Run only to reproduce the JSON and human review tables."""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ACCESS = "10/01/2026"
sources = {}
facts = []
LABELS = {"spec": "Spec", "vendor": "Vendor", "reported": "Reported", "derived": "Calc.", "assumed": "Assumed"}

def source(id, title, publisher, url, dated, section, quote, note="", local=None):
    entry = dict(id=id, title=title, publisher=publisher, url=url, dated=dated,
                 accessed=ACCESS, kind="primary", status="verified", marketing=False,
                 section=section, quote=quote, note=note)
    if local:
        path = ROOT / "physics" / local
        entry.update(local="research/physics/" + local, bytes=path.stat().st_size,
                     sha256=hashlib.sha256(path.read_bytes()).hexdigest())
    sources[id] = entry

def fact(id, levels, label, value, refs, section, scope, basis="spec"):
    basis = basis.lower()
    facts.append(dict(id=id, levels=levels, row=[label, value, basis, {"refs": [[ref, section] for ref in refs]}],
                      section=section, scope=scope))

source("goes-r-databook", "GOES-R Series Data Book, Revision A", "NASA GOES-R Series Program / NOAA OSPO",
       "https://www.ospo.noaa.gov/resources/documents/GOES-RSeriesDataBook.pdf", "05/2019",
       "Chapter 3, printed pp. 3-8, 3-11, 3-14; PDF pp. 36, 39, 42",
       "The LWIR and MWIR optics and FPMs are maintained at approximately 60K.",
       "Downloaded directly; all cited pages visually inspected. The seed aperture claim was not found. System raw and rebroadcast link rates are not ABI detector rates.",
       "GOES-RSeriesDataBook.pdf")
source("noaa-abi-page", "Advanced Baseline Imager (ABI)", "NOAA/NESDIS",
       "https://www.nesdis.noaa.gov/our-satellites/currently-flying/goes-east-west/advanced-baseline-imager-abi",
       "Undated live page", "Main instrument description",
       "It detects visible and infrared light using 16 spectral bands, with each band capturing a different set of data.")
source("landsat9-tirs2-nasa", "Thermal Infrared Sensor (TIRS)", "NASA Science",
       "https://science.nasa.gov/mission/landsat/tirs/", "Undated live page", "Design; Spectral Bands",
       "TIRS employs Quantum Well Infrared Photodetectors (QWIPs) to detect long wavelengths of light",
       "This shared page mixes Landsat 8 and 9, and its 640-detector image caption explicitly names Landsat 8. Dedicated TIRS-2 sources below corroborate L9 facts.")
source("nasa-tirs2-build", "TIRS-2 Testing: A Landsat 9 Instrument Takes Shape", "NASA Landsat Project Science Support",
       "https://science.nasa.gov/missions/landsat/tirs-2-testing-a-landsat-9-instrument-takes-shape/",
       "03/01/2018", "Instrument design paragraphs following test photographs",
       "A two-stage mechanical cryocooler will cool TIRS-2’s focal plane.",
       "Historical prelaunch design article; its anticipated launch date is not a current schedule claim.")
source("nasa-tirs2-spectral", "Landsat 9 Thermal Infrared Sensor 2 Subsystem-Level Spectral Test Results", "NASA NTRS / instrument team",
       "https://ntrs.nasa.gov/api/citations/20180004892/downloads/20180004892.pdf", "2018",
       "PDF p. 1, Introduction",
       "The three SCAs (SCA-A, B, and C) have 640 × 512 pixels each",
       "Science mode combines two rows per channel into one effective row; do not compute data rate from every physical array element. Source labels the second channel B12 inconsistently; use NASA's shared-page Bands 10 and 11 designation.",
       "nasa-tirs2-spectral-20180004892.pdf")
source("nasa-irdetectors-ntrs", "Infrared Detectors Overview in the Short Wave Infrared to Far Infrared for CLARREO Mission", "NASA Langley / NTRS",
       "https://ntrs.nasa.gov/api/citations/20100030592/downloads/20100030592.pdf", "2010 (PDF creation metadata; exact publication date unconfirmed)",
       "PDF pp. 3-7, sections A.1-A.3 and Table 1",
       "The dual band InSb/HgCdTe sandwich detector operates at 77°K",
       "Material names do not define universal operating temperatures. Values in this review are tied to specific civil instruments or laboratory devices. AIRS prose and Table 1 differ (60 K vs. 58 K); omit a single AIRS value. T2SL default remains unresolved.",
       "nasa-irdetectors-20100030592.pdf")
source("nist-cryocooler-2009", "Cryocoolers: the state of the art and recent developments", "NIST / Ray Radebaugh",
       "https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=901013", "03/31/2009",
       "PDF p. 4, section 4",
       "Efficiencies at 80 K can be as high as about 20% of Carnot for some of the best space cryocoolers",
       "A dated review, not a specification for ABI, TIRS-2, or any military instrument.", "nist-radebaugh-2009.pdf")
source("nist-refrigeration-2020", "Review of Refrigeration Methods (submitted chapter)", "NIST / Ray Radebaugh",
       "https://trc.nist.gov/cryogenics/Papers/Review/2020-Review_of_Refrigeration_Methods.pdf", "2020 (submitted version)",
       "PDF pp. 2-3, equation (1) and following paragraph",
       "The actual COP of a real refrigerator can be expressed as a percentage of the Carnot COP",
       "Equation (1): COP_Carnot = Tc / (Th - Tc). Any future heat lift, hot temperature, or efficiency selected for the schematic remains Assumed. No engine implementation in Phase 1.",
       "nist-refrigeration-review-2020.pdf")
source("nasa-combustion-bands", "Determination of primary-zone smoke concentrations from spectral radiance measurements in gas turbine combustors", "NASA Lewis / Carl T. Norgren",
       "https://ntrs.nasa.gov/api/citations/19710021767/downloads/19710021767.pdf", "07/1971",
       "Printed p. 5; PDF p. 7, gaseous combustion products paragraph",
       "they absorb and emit radiation only within discrete wavelengths.",
       "Use only general molecular-band physics. This civil gas-turbine source establishes H2O and CO2 emission bands, not a rocket intensity, temperature, atmospheric transmission model, or real sensor response.",
       "nasa-combustion-bands-19710021767.pdf")
source("nasa-atmospheric-windows", "Remote Sensing", "NASA Earth Observatory",
       "https://science.nasa.gov/earth/earth-observatory/remote-sensing/", "09/17/1999",
       "Absorption Bands and Atmospheric Windows",
       "The gases that comprise our atmosphere absorb radiation in certain wavelengths while allowing radiation with differing wavelengths to pass through.",
       "Use the qualitative definition only; no quantitative transmission or altitude-dependent claim was verified.")
source("nasa-orbit-catalog", "Catalog of Earth Satellite Orbits", "NASA Earth Observatory",
       "https://science.nasa.gov/earth/earth-observatory/catalog-of-earth-satellite-orbits/", "09/04/2009",
       "High Earth Orbit; Medium Earth Orbit",
       "A satellite in a circular geosynchronous orbit directly over the equator (eccentricity and inclination at zero) will have a geostationary orbit",
       "General orbit definitions only. Historical mission examples in this article are not current status. Molniya values describe a generic orbit, not actual warning-satellite elements.")
source("noaa-geo-definition", "Geostationary Earth Orbit Satellite (GEO)", "NOAA CoastWatch",
       "https://coastwatch.noaa.gov/cwn/platform-types/geostationary-earth-orbit-satellite-geo.html", "Undated live page",
       "Definition paragraph", "35,786 kilometers above the Equator, rotating with the Earth as both move through space.")

sources["bams-abi-paper"] = dict(id="bams-abi-paper", title="A Closer Look at the ABI on the GOES-R Series", publisher="AMS BAMS / Schmit et al.",
    url="https://journals.ametsoc.org/view/journals/bams/98/4/bams-d-15-00230.1.xml", dated="2017", accessed=ACCESS,
    kind="primary", status="unchecked", marketing=False,
    reason="Fresh direct web request returned HTTP 403 Forbidden. Stopped this source and reported it; no alternate tool or mirror retry. Not cited by any fact.")

aggregates = {
 "detector-operating-temps-aggregate": (["nasa-irdetectors-ntrs", "goes-r-databook", "nasa-tirs2-build"], "Original snippet mixture has no page URLs. Specific civil examples are verified separately; no universal HgCdTe/InSb/QWIP/T2SL default was established."),
 "plume-ir-emission-aggregate": (["nasa-combustion-bands"], "Original snippet mixture has no page URLs. Generic H2O/CO2 bands are supported by an opened NASA combustion paper; no rocket intensity or temperature was established."),
 "atmospheric-windows-aggregate": (["nasa-atmospheric-windows"], "Original snippet mixture has no page URLs. General absorption/window definitions are verified separately; numeric window boundaries and transmission remain unverified."),
 "cryocooler-aggregate": (["nist-cryocooler-2009", "nist-refrigeration-2020"], "Original snippet mixture has no page URLs. NIST review PDFs were resolved, opened, downloaded and quoted directly; original aggregate is not a citation."),
 "orbit-definitions-aggregate": (["nasa-orbit-catalog", "noaa-geo-definition"], "Original snippet mixture has no page URLs. Recommended NASA catalog opened directly, and NOAA confirms GEO altitude; original aggregate is not a citation.")
}
for id, (resolved, reason) in aggregates.items():
    sources[id] = dict(id=id, kind="secondary", status="unchecked", accessed=ACCESS, reason=reason, resolvedBy=resolved)

CIVIL_ABI = "GOES-R ABI civil twin only; never a military payload figure."
CIVIL_TIRS = "Landsat 9 TIRS-2 civil twin only; never a military payload figure."
fact("abi-bands", ["abi"], "ABI spectral channels", "16", ["noaa-abi-page"], "Instrument description", CIVIL_ABI)
fact("abi-full-disk", ["abi"], "ABI full-disk cadence", "10 min", ["noaa-abi-page"], "Instrument description", CIVIL_ABI)
fact("abi-conus", ["abi"], "ABI mainland U.S. cadence", "5 min", ["noaa-abi-page"], "Instrument description", CIVIL_ABI)
fact("abi-meso", ["abi"], "ABI mesoscale cadence", "30-60 s", ["noaa-abi-page"], "One or two smaller areas, instrument description", CIVIL_ABI)
fact("abi-optics", ["payload", "abi"], "ABI telescope", "Four mirrors; three focal-plane modules", ["goes-r-databook"], "Printed p. 3-8 / PDF p. 36", CIVIL_ABI)
fact("abi-detector-material", ["focal-plane", "pixel", "abi"], "ABI infrared channels", "HgCdTe", ["goes-r-databook"], "Table 3-5, printed p. 3-11 / PDF p. 39", CIVIL_ABI)
fact("abi-ir-temp", ["focal-plane", "abi"], "ABI MWIR/LWIR optics and focal planes", "Approximately 60 K", ["goes-r-databook"], "Printed p. 3-8 / PDF p. 36", CIVIL_ABI)
fact("abi-vnir-temp", ["focal-plane", "abi"], "ABI VNIR optics and focal plane", "Approximately 170 K; GOES-R FPM 180 K", ["goes-r-databook"], "Printed p. 3-8 / PDF p. 36", CIVIL_ABI)
fact("abi-cooling", ["focal-plane", "abi"], "ABI cryocooler design", "Two redundant two-stage pulse-tube coolers", ["goes-r-databook"], "Printed p. 3-14 / PDF p. 42", CIVIL_ABI)
fact("tirs2-detectors", ["focal-plane", "pixel", "tirs2"], "TIRS-2 detector assemblies", "Three QWIP arrays; 640 × 512 physical pixels each", ["nasa-tirs2-spectral"], "PDF p. 1, Introduction", CIVIL_TIRS)
fact("tirs2-effective", ["focal-plane", "tirs2"], "TIRS-2 effective science row", "1,850 cross-track pixels", ["nasa-tirs2-spectral"], "PDF p. 1; two physical rows combined per channel and inter-array overlap", CIVIL_TIRS)
fact("tirs2-swath", ["tirs2"], "TIRS-2 swath", "185 km", ["nasa-tirs2-build"], "Instrument design paragraphs", CIVIL_TIRS)
fact("tirs2-gsd", ["tirs2"], "TIRS-2 ground sampling", "100 m", ["nasa-tirs2-build"], "Instrument design paragraphs", CIVIL_TIRS)
fact("tirs2-optics", ["payload", "tirs2"], "TIRS-2 refractive telescope", "Four elements; f/1.64", ["nasa-tirs2-build"], "Instrument design paragraphs", CIVIL_TIRS)
fact("tirs2-fov", ["tirs2"], "TIRS-2 field of view", "15 degrees", ["nasa-tirs2-spectral"], "PDF p. 1, Introduction", CIVIL_TIRS)
fact("tirs2-cold", ["focal-plane", "tirs2"], "TIRS-2 focal-plane design temperature", "43 K", ["nasa-tirs2-build"], "Two-stage cryocooler paragraph", CIVIL_TIRS)
fact("tirs2-telescope-temp", ["payload", "tirs2"], "TIRS-2 telescope design temperature", "185 K", ["nasa-tirs2-build"], "Radiators paragraph", CIVIL_TIRS)
fact("tirs-bands", ["tirs2"], "TIRS thermal bands", "10.6-11.2 μm; 11.5-12.5 μm", ["landsat9-tirs2-nasa"], "Spectral Bands table, bands 10 and 11", "Shared NASA TIRS-family spectral-band description.")
fact("lab-insb-hgcdte", ["focal-plane"], "Reviewed dual-band InSb/HgCdTe device temperature", "77 K", ["nasa-irdetectors-ntrs"], "PDF p. 3, section A.1", "Specific reviewed device only, not a material-wide default.", "Reported")
fact("lab-qwip", ["focal-plane"], "Reviewed four-band laboratory QWIP array temperature", "45 K", ["nasa-irdetectors-ntrs"], "PDF p. 7, section A.3", "Specific NASA Earth-science research array only.", "Reported")
fact("nist-efficiency", ["focal-plane"], "Historical cryocooler review at 80 K", "Up to about 20% of Carnot for some space coolers", ["nist-cryocooler-2009"], "PDF p. 4, section 4", "Dated review context only; no selected scenario efficiency.", "Reported")
fact("co2-band", ["plume", "atmosphere"], "CO2 molecular emission band", "Near 4.3 μm", ["nasa-combustion-bands"], "Printed p. 5 / PDF p. 7", "General molecular spectroscopy in a civil combustion study; no system performance implication.", "Reported")
fact("h2o-band", ["plume", "atmosphere"], "H2O molecular emission band", "Near 2.7 μm", ["nasa-combustion-bands"], "Printed p. 5 / PDF p. 7", "General molecular spectroscopy in a civil combustion study; no system performance implication.", "Reported")
fact("geo-altitude", ["orbits"], "Geostationary altitude", "35,786 km", ["noaa-geo-definition"], "Definition paragraph", "General circular equatorial GEO definition; no slot positions.", "reported")
fact("geo-period", ["orbits"], "Geosynchronous period", "23 h 56 min 4 s", ["nasa-orbit-catalog"], "Introductory altitude-and-period example", "General orbital reference value.", "reported")
fact("molniya-inclination", ["orbits"], "Generic Molniya inclination", "63.4 degrees", ["nasa-orbit-catalog"], "Medium Earth Orbit", "Generic textbook orbit, not real constellation elements.", "reported")
fact("molniya-period", ["orbits"], "Generic Molniya period", "About 12 h", ["nasa-orbit-catalog"], "Medium Earth Orbit", "Generic textbook orbit, not real constellation elements.", "reported")
fact("atmospheric-absorption", ["atmosphere", "plume"], "Atmospheric absorption", "Gases absorb some wavelengths while transmitting others", ["nasa-atmospheric-windows"], "Absorption Bands and Atmospheric Windows, first two paragraphs", "Qualitative molecular physics only; not a quantitative transmission or altitude-dependent model.", "reported")
fact("carnot-reference", ["focal-plane"], "Published ideal refrigerator coefficient of performance", "COP_Carnot = Tc / (Th - Tc)", ["nist-refrigeration-2020"], "PDF pp. 2-3, equation (1) and temperature definitions", "Published thermodynamic identity; Tc and Th are absolute cold and hot temperatures. No calculated result or selected scenario efficiency.", "reported")

# Inventory every seed entry in the assigned sections, including pointers whose
# verification is owned by the systems research ledger.
seed_coverage = []
seed_section = None
for line in (ROOT / "sources-seed.md").read_text(encoding="utf-8").splitlines():
    if line.startswith("## "):
        match = re.match(r"## ([A-E])\.", line)
        seed_section = match.group(1) if match else None
    match = re.match(r"### `([^`]+)`", line)
    if not match or seed_section not in ("B", "C", "E"):
        continue
    id = match.group(1)
    if id in sources:
        seed_coverage.append(dict(id=id, section=seed_section, status=sources[id]["status"], record=id))
    elif id == "sda-tracking-layer-leo-altitude":
        seed_coverage.append(dict(id=id, section=seed_section, status="pointer", canonicalSource="gao-26-107085",
            owner="research/systems-facts.json", evidence="research/systems/source-notes.md#gao-26-107085",
            note="Seed alias to GAO-26, not an independently citable source. Systems review identifies the approximate altitude as contractor-attributed narrative, not an authoritative orbital specification; no altitude fact imported into this ledger."))
    else:
        raise AssertionError(f"Unaccounted seed source: {id}")
assert len(seed_coverage) == 11, seed_coverage

gaps = [
 "ABI aperture: seed's approximately 0.313 m value was not located in the downloaded Data Book. Do not cite or implement as Spec.",
 "ABI standalone detector/output data rate: not established. Data Book spacecraft raw and GRB broadcast rates must not be relabeled as ABI rates.",
 "No universal detector operating-temperature table; T2SL remains unresolved, and device-specific evidence must remain device-specific.",
 "No rocket plume intensity, temperature, pixel photon budget, real-system threshold, or altitude-dependent atmospheric model has been established.",
 "The sources support qualitative atmospheric absorption, not a quantitative transmission curve.",
 "The current TIRS page is mixed L8/L9; dedicated L9 sources are required for array/design claims.",
 "NASA catalog treats generic Molniya as a medium Earth orbit example. Use highly elliptical as shape terminology; do not confuse HEO with its high Earth orbit altitude category.",
 "AMS blocked source and original search aggregates remain unchecked and uncited."
]
ledger = dict(accessed=ACCESS, phase=1, scope="Civil twins, physics, and general orbit references only", sources=sources, facts=facts, seedCoverage=seed_coverage, gaps=gaps)
(ROOT / "physics-facts.json").write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

lines = ["# Civil sensors, physics, and orbit source review", "", "Accessed 10/01/2026. Phase 1 only; ready for Reed's evidence review.", "",
 "The Data Book is downloaded and its ABI optical, detector, and cooler pages were visually inspected. NASA TIRS-2 material independently confirms the civil detector format, optical design, and design temperatures. Generic molecular-band and orbit facts are supported by opened primary sources. No military performance model was derived.", "",
 "## Source notes", ""]
for s in sources.values():
    lines.extend([f"### {s['id']}", ""])
    if s["status"] == "verified":
        lines.extend([f"- [{s['title']}]({s['url']}) — {s['publisher']}; dated {s['dated']}; accessed {ACCESS}; Primary; verified.",
                      f"- Locator: {s['section']}", f"> {s['quote']}", ""])
        if s["note"]: lines.extend([s["note"], ""])
        if s.get("local"): lines.extend([f"Local copy: `{s['local']}`; {s['bytes']:,} bytes. SHA-256: `{s['sha256']}`.", ""])
    else:
        lines.extend([f"**unchecked** — {s['reason']}", ""])
        if s.get("url"): lines.extend([f"Attempted URL: {s['url']}", ""])
        if s.get("resolvedBy"): lines.extend(["Replacement primary sources: " + ", ".join(s["resolvedBy"]) + ".", ""])
lines.extend(["## Seed inventory coverage", "", "All eleven source IDs in seed sections B, C, and E are accounted for. Unchecked aggregates are not citations; their independently opened replacements have separate source IDs.", "", "| Seed ID | Section | Disposition |", "|---|---|---|"])
for entry in seed_coverage:
    disposition = entry["status"]
    if disposition == "pointer": disposition += "; see systems ledger `gao-26-107085`. Contractor-attributed approximate altitude is not an orbital specification."
    elif disposition == "unchecked" and sources[entry["id"]].get("resolvedBy"):
        disposition += "; replacements: " + ", ".join(sources[entry["id"]]["resolvedBy"])
    lines.append(f"| {entry['id']} | {entry['section']} | {disposition} |")
lines.extend(["", "## Verified facts by level", "", "Rows in `physics-facts.json` use IF's `[label, value, basis, {refs: [[sourceId, locator]]}]` shape. Basis keys are lowercase; visible labels follow IF. Civil facts stay explicitly tied to their instrument.", ""])
for level in ["orbits", "payload", "focal-plane", "pixel", "plume", "abi", "tirs2", "atmosphere"]:
    lines.extend([f"### {level}", "", "| Fact | Value | Basis | Source and locator |", "|---|---|---|---|"])
    for f in facts:
        if level in f["levels"]:
            label, value, basis, ev = f["row"]
            lines.append(f"| {label} | {value} | {LABELS[basis]} | {'; '.join(ref + ': ' + locator for ref, locator in ev['refs'])} |")
    lines.append("")
lines.extend(["## Unresolved and bounded", ""] + ["- " + g for g in gaps] + ["", "## Next phase proposal", "", "After Reed's Phase 1 review, use the verified civil anatomy and generic orbit definitions to prepare the static story mock and schematic stills. Keep unsourced dimensions as drawn. Obtain look approval before engine or detailed scene implementation; preserve the open decisions in PLAN.md.", ""])
(ROOT / "physics-review.md").write_text("\n".join(lines), encoding="utf-8")

for f in facts:
    assert f["row"][2] in LABELS
    assert all(sources[r]["status"] == "verified" and locator for r, locator in f["row"][3]["refs"])
assert all(s["kind"] in ("primary", "secondary") for s in sources.values())
print(f"Wrote {len(sources)} source records, {len(facts)} facts; all fact references verified; {len(seed_coverage)} seed entries covered.")
