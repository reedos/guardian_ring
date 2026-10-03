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
and telescope labels clear their subjects. A remaining compact-layout issue is
recorded: at 320×568, the fixed scene note and legend can still crowd the small
illustration, and the selected name may rely on the picker/card. This was not
established as a new regression and is not claimed fixed here.

Full PLAN section 9 acceptance remains required before merging this follow-up.
