# Handoff: The Guardian Ring (for Codex)

You are starting a new project: **The Guardian Ring**, a public, cited 3D explainer of how missile-warning
(overhead persistent infrared) satellites watch the whole Earth for a launch, from the geosynchronous ring
down to a single detector pixel.

## Read first, in this order
1. `AGENTS.md`: the rules. They are binding.
2. `PLAN.md`: the full plan (premise, levels, layers, scenario engine, evidence plan, look, gates, phases).
3. `research/sources-seed.md`: the source log from 10/01/2026, marked verified / unverified / not public.

## The standard
The Intelligence Factory, `C:\Users\reedo\projects\intelligence_factory` (live at
https://reedos.dev/intelligence_factory/), is the reference implementation. Match its structure, evidence
model, gates, look and polish. PLAN.md §2 maps which IF files to study and copy. Bring files over into a
fresh repo; do not copy IF's git history. Do not modify the IF repo.

## Start with
- **Phase 0, scaffold** (PLAN.md §10): the IF scaffolding copied and renamed (`window.ifx` → `window.grx`),
  five pages, empty levels, the evidence model and `tools/claims.mjs`, the gates running against a
  placeholder scene, tests and typecheck green. Dev server on 127.0.0.1:47600.
- **Phase 1, sources**: open every source marked unverified in `research/sources-seed.md` directly
  (download the GOES-R Series Data Book, which is over 10 MB) and quote it into `research/`. Then build a
  verified-fact table per level. **Stop and report to Reed** before Phase 2.

## Hard lines
- Public, unclassified sources only. Explain physics and architecture. Never state or imply the
  classified performance of a real system, and write nothing about evading or defeating these sensors.
- Every figure is labeled Spec / Vendor / Reported / Calc. / Assumed with its evidence attached.
- No pushes, no GitHub repo, no deploys until Reed says so. Work on branches.
- If a permission check blocks an action, stop and report it. Do not retry with another tool or shell.

## Reed's decisions so far
- Name: The Guardian Ring. Slug `guardian_ring`; future URL https://reedos.dev/guardian_ring/ (noindex until launch).
- Centerpiece: the geosynchronous constellation over a turning Earth (PLAN.md level 1).
- Same signature look as IF (amber `#e6ba82`, Barlow Condensed / Manrope / IBM Plex Mono).
- Open questions for Reed are at the end of PLAN.md; don't decide them yourself.

## Report back with
What you built or verified, the gate results, anything you could not source, and the next phase's
proposal. Keep reports short; Reed reads them on his phone.
