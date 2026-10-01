# The Guardian Ring

A cited, interactive 3D explainer of infrared satellite architecture—from the geosynchronous ring around Earth to a single detector element.

Follow three connected stories: **Light** reaches an instrument, **Data** moves through the architecture, and **Heat** shapes the hardware. Public sources explain the physics. Named civil instruments provide detailed specifications.

## Explore the system

The main journey moves through six scenes: the ring, spacecraft, optical payload, focal plane, detector pixel, and emitting gas. Four side views examine the ground segment, GOES-R's Advanced Baseline Imager, Landsat 9's Thermal Infrared Sensor 2, and atmospheric absorption.

The explainer includes a visual story, an interactive explorer, an Evidence register, a Method page, and a Glossary. Independent calculation examples cover orbit geometry, vacuum light travel, photon energy, ideal diffraction, and blackbody radiation. Pin a scenario to compare its values and evidence with another.

This edition is under review. The site is unlisted and retains noindex; its review link is shared directly with the reviewer.

## Follow the evidence

Every figure carries a **Spec**, **Vendor**, **Reported**, **Calc.**, or **Assumed** label that opens its source, formula, or assumption. Unchecked sources support no claim.

Hardware, orbit positions, plume shapes, and animated paths are schematic. Published ABI and TIRS-2 figures belong to those civil instruments. The project does not estimate military sensor performance or operational coverage.

- [Verified facts and source gaps](research/verified-facts.md)
- [Physics model and assumptions](research/model-review.md)
- [Build review and supported scope](research/BUILD-REVIEW.md)
- [Browser and unit-test acceptance record](research/gate-results.md)
- [Asset provenance and credits](THIRD_PARTY_NOTICES.md)

## Development

Built with TypeScript, Three.js, and Vite. Reproducible Blender scripts generate the 3D assets; their runtime version keys change with each rebuild. Requires Node 24 and npm.

```sh
npm ci
npm run dev
```

Before committing, run `npm run typecheck`, `npm test`, and `npm run claims`. For browser acceptance, build the site, start `npm run preview`, then run `npm run gates` in another terminal. The suite requires Chrome and a real GPU and checks desktop and phone layouts. `node tools/gate-report.mjs` records full-build acceptance.

Contributors should read [AGENTS.md](AGENTS.md) and [PLAN.md](PLAN.md). The verified research records supersede unchecked statements in the original source seed and initial plan.

## About this project

Reed directs the project and reviews its scope and sources. AI coding assistants help build and check it. The Intelligence Factory supplies the design and engineering reference.

Personal educational project based on cited public sources. Not an official publication of my employer or of the agencies or companies discussed. Models are schematic; estimates and assumptions are identified.
