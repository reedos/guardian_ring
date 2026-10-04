# Phone composition follow-up — 10/03/2026

Development branch: `codex/phone-composition-polish`, based on the frozen Wave 1
candidate. These changes are separate from that candidate and have not been
merged or deployed.

The atmosphere now fits the column, enlarged molecules and incident paths in
its overview. Selecting the air column moves to a distinct, tighter view.
Molecule markers move outside their diagrams while leaders retain the physical
anchor. Ground-context inspection also leaves room for its component name.

The detector and TIRS-2 telescope views protect their hardware from component
callouts. Authored camera presets can reserve a label lane across resizes.
TIRS-2 electronics and radiator views have clearer framing; the electronics
nameplate has a verified readable desktop view.

No hardware GLB was rebuilt. Bounds and camera positions are drawing coordinates,
not physical specifications. Evidence, optical behavior and mission timing are
unchanged.

## Development verification

Built preview: `http://127.0.0.1:47603/`, real NVIDIA GPU. These are scoped checks
of atmosphere, focal plane and TIRS-2, not full release acceptance.

| Gate | Desktop states | Phone states | Result |
| --- | ---: | ---: | --- |
| Views | 66 | 66 | Pass |
| Labels | 75 | 75 | Pass |
| Navigation | 311 | 315 | Pass |

All six commands pass, covering 908 checked states. Typecheck is clean, 244 unit
tests pass, and the evidence audit reports zero problems across 941 site claims,
96 scenarios and 253 research facts. The framing regression checks both explicit
safe-region overrides and authored label lanes at four canvas shapes.

Desktop, phone, compact portrait and landscape screenshots are retained in
`.local/composition/`; `comparison.html` pairs the principal views with the
frozen Wave 1 captures and links the original Opus references.

Independent usability review found no confirmed new major regression in the
390×844 phone or 844×390 landscape captures. The column fits and the detector
and telescope labels clear their subjects.

The compact follow-up moves the scale note and visual key out of the canvas.
Short landscape layouts put playback first and retain touch-sized controls.
On compact portrait screens, expanding Parts or Scenario gives the text a
reading sheet while retaining Previous / Overview / Next and the part picker.
In short landscape, expanding uses the right column for reading. Hide details
and Present restore the canvas. The ordinary 390×844 layout is unchanged.

The reviewer identified hidden playback in the first short-landscape revision,
then found expanded-sheet conflicts with Hide details and Present. These were
corrected before release acceptance. Local interaction checks now include those
actions, the Scenario tab, actual panel bounds, and usable reading height;
positive scroll height alone is not accepted as evidence that a sheet fits.
The final local compact checks pass 155 level/layer/rotation states and 87
playback/reading/presentation interaction states. Typecheck, all 244 unit tests,
and the strict evidence audit pass after these changes. The independent source
review found no further confirmed major issue; it did not rerun the browser.

Release-gate follow-up corrected the UI gate's stale fixed-camera expectation:
responsive overview scenes are checked against their authored frame at the
current canvas size, including target and completed flight. Desktop plume and
atmosphere checks pass 68 scoped states. The phone run found that the initial
compact landscape breakpoint also captured 667×375; it is now limited to
640px width and 360px height. Four focused rotation/playback/Scenario checks
pass at 844×390 and 667×375, preserving their 140px canvas and 150px reading
pane minima. The 87 compact interaction cases still pass. Full acceptance must
run again against the final candidate; these are development results only.

Full PLAN section 9 acceptance is complete: all 28 built-preview gate commands
passed on the combined candidate. See `gate-results.md` for the immutable build
fingerprint, renderer, counts and performance results. The final test-only
commit corrects the expected availability of the Light-only focus action;
its complete phone learning rerun passed. No application code changed after
the accepted build.
