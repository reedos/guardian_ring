# Rules for any agent working in this repo

Read `PLAN.md` first. The Intelligence Factory (`C:\Users\reedo\projects\intelligence_factory`) is the
reference implementation: when unsure how something should be done, do it the way IF does it.

## Content
- Public, unclassified sources only. Every figure is Spec, Vendor, Reported, Calc. or Assumed, with the
  evidence attached (`[label, value, basis, {refs | calc | assume}]`). `npx tsx tools/claims.mjs` must report 0 problems.
- Never state or imply the classified performance of a real system (sensitivity, thresholds, resolution,
  focal-plane format, false-alarm rate). Never write anything about evading, spoofing or defeating these
  sensors, or about targeting. If in doubt, leave it out and ask Reed.
- A source you could not open is recorded `unchecked` with the reason and is not cited.
- No manufacturer logos, no invented part numbers or masses. Hardware is "as drawn" / representative.
- American English, month/day/year dates, plain prose.

## Code
- Match IF's file layout, naming, scene contract and test hook (`window.grx`).
- 3D hardware comes from `tools/blender/build-*.py`; bump the GLB `?v=N` key on every rebuild.
- Before a commit: `npx tsc --noEmit`, `npx vitest run`, `npx tsx tools/claims.mjs`; before a merge to
  main: the browser gates in PLAN.md §9 against a built preview, real GPU.

## Git and publishing
- Work on branches; main is what ships. No pushes, no new GitHub repo, no deploys until Reed says so.
- Nothing goes public before Reed's launch call; noindex stays on until then.
- If a permission check blocks an action, stop and report it. Do not retry it with another tool or shell.

## Private paths (never open, never copy from)
`~/.openclaw/workspace/memory/journal/`, `~/.openclaw/workspace/memory/audio/`,
`~/.openclaw/workspace/media/inbound/`, `~/projects/almanac/prototype/index.html`,
`~/OneDrive/Backups/openclaw-workspace/memory/`, `~/Private/`.
