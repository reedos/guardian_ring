# The Guardian Ring

A cited, interactive 3D explainer of infrared satellite architecture—from the geosynchronous ring around Earth to a single detector element.

Follow three connected stories: **Light** reaches an instrument, **Data** moves through the architecture, and **Heat** shapes the hardware. Public sources explain the physics. Named civil instruments provide detailed specifications.

## Explore the system

The main journey moves through six scenes: the ring, spacecraft, optical payload, focal plane, detector pixel, and emitting gas. Four side views examine the ground segment, GOES-R's Advanced Baseline Imager, Landsat 9's Thermal Infrared Sensor 2, and atmospheric absorption.

The explainer includes a visual story, an interactive explorer, an Evidence register, a Method page, a Glossary, and a searchable Parts reference. Independent calculation examples cover orbit geometry, vacuum light travel, photon energy, ideal diffraction, and blackbody radiation. Pin a scenario to compare its values and evidence with another.

The spacecraft cutaway exposes solar cells and deployment hardware, power regulation, batteries, attitude sensors and reaction wheels, propulsion, onboard computers, communications, and heat rejection. The payload and focal-plane views expose scan drives and encoders, cover and focus mechanisms, calibration targets, spectral optics, detector readout, video electronics, digitization, timing, data interfaces, power conversion and cooling. A sourced component catalog and three responsive system diagrams explain the supporting assemblies and their connections. Component names lead every card, with the function below. A persistent part selector, Overview beside Previous/Next, and presentation controls make these assemblies navigable on desktop and phone.

The civil instruments expose their optical, calibration, detector, electronic and thermal assemblies as separate selections. The smaller levels distinguish detector interconnects and packaging, ground reception and storage, and molecular species. Component callouts remain readable as the camera moves; surface nameplates appear only when their text is clear.

This edition is under review. The site is unlisted and retains noindex; its review link is shared directly with the reviewer.

## Follow the evidence

Every figure carries a **Spec**, **Vendor**, **Reported**, **Calc.**, or **Assumed** label that opens its source, formula, or assumption. Unchecked sources support no claim.

Hardware, orbit positions, plume shapes, and animated paths are schematic. Published ABI and TIRS-2 figures belong to those civil instruments. The project does not estimate military sensor performance or operational coverage.

- [Verified facts and source gaps](research/verified-facts.md)
- [Physics model and assumptions](research/model-review.md)
- [Spacecraft and payload engineering sources](research/spacecraft-review.md)
- [Comprehensive component review](research/COMPREHENSIVE-SYSTEMS-REVIEW.md)
- [TIRS-2 architecture review](research/tirs2-architecture-review.md)
- [Public design-practice additions and completeness review](research/PUBLIC-DESIGN-GAP-REVIEW.md)
- [Intelligence Factory UI parity review](research/UI-PARITY-REVIEW.md)
- [Build review and supported scope](research/BUILD-REVIEW.md)
- [Browser and unit-test acceptance record](research/gate-results.md)
- [Asset provenance and credits](THIRD_PARTY_NOTICES.md)

## Development

Built with TypeScript, Three.js, and Vite. Reproducible Blender scripts generate the 3D assets; their runtime version keys change with each rebuild. Requires Node 24 and npm.

```sh
npm ci
npm run dev
```

Before committing, run `npm run typecheck`, `npm test`, and `npm run claims`. For browser acceptance, build the site, start `npm run preview`, then run `npm run gates` in another terminal. The suite requires Chrome and a real GPU and checks desktop and phone layouts. `npx tsx tools/gate-report.mjs` records full-build acceptance using the same JSON-aware loader as the claims audit.

Contributors should read [AGENTS.md](AGENTS.md) and [PLAN.md](PLAN.md). The verified research records supersede unchecked statements in the original source seed and initial plan.

## About this project

Reed directs the project and reviews its scope and sources. AI coding assistants help build and check it. The Intelligence Factory supplies the design and engineering reference.

Personal educational project based on cited public sources. Not an official publication of my employer or of the agencies or companies discussed. Models are schematic; estimates and assumptions are identified.
