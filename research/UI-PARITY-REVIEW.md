# Intelligence Factory interface parity review

Reviewed 10/01/2026 against the local Intelligence Factory working tree, read-only. The integrated revision harmonizes interaction, layout, navigation and reference pages while preserving Guardian Ring's sourced spacecraft content and domain controls.

| Surface | Before this revision | IF reference and required adaptation | After / verification |
|---|---|---|---|
| Component identity | The card displayed the function kicker above the component heading. Titles also mixed component names with descriptions. | `visualizer.html` and `stage.js` separate title/kicker. Reed's explicit requirement takes precedence over the reference's kicker-first order: actual component name first, function immediately below. | Canonical component names remain stable across all levels, layers and scenarios. Cards and anatomy articles put the name before the role, description and evidence. Browser assertions passed. |
| Persistent transport | Previous/Next and picker existed; Overview was only a picker option and a More item. | `campus-presentation.js` keeps transport available. Add an explicit Overview beside Previous/Next on desktop and phone, as requested. | Implemented: explicit Overview is in the same persistent group between Previous and Next on every size; the picker remains available. Browser assertion added. |
| View toolbar | A single cramped phone row attempted to fit the picker and every control. | IF separates persistent navigation from secondary view options, with meaningful view-specific tools. Keep Guardian's picker accessible, use a deliberate responsive toolbar, and preserve orbit controls. | Implemented: desktop picker / transport / cycle grouping; phone picker gets its own full-width line above persistent transport and cycle. Orbit controls remain functional in More. |
| More menu | Share, quality, Overview and presentation were an ungrouped list; orbit controls were prepended separately. | `visualizer.html`, `toprow.js`, `campus-presentation.js`: This view / tools groups, consistent `mm-select`, accessible current choice and close behavior. | Implemented: semantic This view and Tools sections; rendering uses IF mm-select; This view hides when the ring has no active controls. Publication note retained. |
| Level picker | Desktop-style steps were copied into the phone popup; side levels lacked a grouped hierarchy. | `stage.js` builds `lm-group` / `lm-item` rows with number, name, and scale; side levels follow a separate heading. | Implemented: grouped lm-item rows with level number, actual level title and existing scale description; related views are grouped separately. |
| Card actions | Drill button sat after all figures; no explicit Details affordance. | IF's `card-door` puts the entry into a component under its heading, with Details for a phone sheet. | Implemented: card-door follows the name/function; drill is available before prose and Details expands the phone sheet. |
| Inspector overflow | Long lists continued below the fold without a cue. | `more-cue.js` gives a separate More strip and the count of parts below the fold; no overlay blocks the content. | Implemented: IF moreCue module provides the below-fold count and separate scroll action; phone action expands the sheet first. |
| Phone/tablet sheet | Only a binary phone toggle; no drag handle or compact card view. | `visualizer.js` and `campus-presentation.css`: draggable sheet, accessible click toggle, compact name/key-figure/action peek, expanded reading state. | Implemented: draggable tablet/phone sheet, keyboard-click toggle, compact name/function/key-figure/actions and expanded details. Browser assertions cover Details and toggle. |
| Reference detours | Evidence/Method/Glossary replaced the explorer page despite inherited unused sheet CSS. | `page-sheet.js` opens reference pages over the viewer, preserves scenario/view, supports close, Escape, ordinary new-tab behavior, and links back to components. Include Parts. | Implemented: four reference pages open in a same-origin sheet with inert background, focus handling, iframe Escape, ordinary modified clicks, Open as a page and live component returns. Browser assertions added. |
| Site navigation | Story used Story/Explore; viewer used Visualizer/The story; reference pages used a different uncollapsed header with no Menu button. Parts was absent. | IF shares brand, chapter/reference navigation, mobile menu, and a persistent Open the visualizer CTA on public pages. | Shared page-shell helper, consistent labels/brand/Menu, Parts everywhere, chapter links and persistent visualizer CTA on public pages. The generated pages use the same integrated navigation. |
| Home page | Separate bespoke topbar and poster-style title; no persistent visualizer entry on phones. | `index.html`, `styles.css` hero/topbar/chapter sections: shared type hierarchy, full-image hero with coherent copy, visualizer CTA, numbered chapter navigation. Preserve Guardian story claims, illustrations and links. | Implemented: IF hero-img / hero-in layout, shared typography and fixed header, responsive visualizer CTA and existing six-level chapter navigation. Factual prose, evidence keys, illustrations and deep links retained. |
| Reference-page framing | Different colors/borders/type sizing and no shared brand mark or mobile navigation. | `pages/pages.css` and reference-page templates: shared page head, reference content width, section navigation, consistent footer and opening CTA. Preserve prerendered evidence. | Shared styles and page-head/page-t/page-wrap framing, mobile Menu and shared footer are integrated in all four generated reference pages. Prerendered claims and component descriptions remain readable without JavaScript. |
| Footer | Reference footer was a noindex badge plus statement; story footer had different navigation. | IF's shared project identity, reference links and publication note; noindex stays in metadata and the exact Guardian publication statement stays visible. | Implemented: shared identity, Visualizer/The story/reference navigation and verbatim publication statement; noindex remains metadata. Story retains its Earth texture attribution. |
| Keyboard/focus | Menu Escape worked; reference sheet and drag/Details behavior were missing. | Maintain native select navigation and tab semantics; add sheet focus handling and verified return focus. No hidden or dead reference options. | Native selector and tab behavior, popup focus, sheet focus return, inert background and iframe Escape/Tab boundary handling passed browser checks. Escape dismisses only the topmost source dialog before the enclosing reference sheet. |

## Deliberate domain differences

Guardian uses Light / Data / Heat, its existing orbital playback and family toggles, and general-physics scenario controls. IF-only campus views, hardware covers, module variants, soft-focus rendering, tours, and token controls are not copied as inactive controls. The site remains noindex. All facts, evidence keys, and the publication statement remain under the existing evidence rules.

## Integrated catalog review

- CPU contracts now check all 96 scenarios, ten levels and three layers for stable component names and IDs; each displayed anatomy fact must equal a canonical research row and resolve through the actual source-dialog lookup with verified evidence.
- Parts renders every parent card, every layer and every component evidence key once. Its component links use numeric viewer-level indices; the 12 satellite, 13 payload and 8 focal-plane parent IDs match the scene view declarations and actual GLB anchors.
- Reference-sheet navigation from Parts to Evidence now updates the dialog heading, iframe title and Open as a page destination. A browser UI assertion follows that real link, including its claim anchor and scenario.
- Fifteen additional electronics/mechanism glossary definitions reuse canonical research locators. Parts is included in the built reference-page gate on both desktop and phone.

## Final review corrections

- An embedded source popover now consumes Escape when it is open. The first Escape closes that popover and retains the reference sheet; a subsequent Escape closes the sheet and returns focus to the explorer. Browser regressions verify the nested behavior.
- Parts chapter and system-diagram links now reveal targets excluded by the current search. The page clears the incompatible filter and its `q` URL parameter, opens any containing details, and scrolls to the requested component or level. Browser regressions verify navigation after filtering.

## Verified integrated browser results

The following checks passed against the same frozen production preview using real-GPU Chrome. Phone results use a phone-sized browser viewport, not a physical-device claim.

| Check | Desktop | Phone |
|---|---|---|
| Part framing | 162 states passed | 162 states passed |
| UI behavior, navigation and focus | 212 states passed | 217 states passed |
| Story page and evidence chips | Passed; 25 chips checked | Passed; 25 chips checked |
| Evidence, Method, Glossary and Parts pages | All four passed; 667 Evidence and 102 Parts source dialogs checked | All four passed; 667 Evidence and 102 Parts source dialogs checked |
| Quality governor | 11 checks passed | 11 checks passed |
| Rendering performance | 30 states passed; worst p95 0.90 ms | 30 states passed; worst p95 0.80 ms |

The scenario sweep and numbered-part coverage each passed 15,552 states. Coplanar checks passed 30 states, and the link/navigation gate passed 14 states. These checks cover the persistent transport, actual menu actions, component identity, source-dialog lookup, reference-sheet navigation, scenario preservation, mobile sheet behavior, search recovery and prerendered reference content.

The all-pairs camera-flight suite passed all 1,320 routes on each form. Full final acceptance is recorded in `gate-results.md`: 16/16 browser gate commands, clean typecheck, 81/81 unit tests, and 0 strict-evidence problems across 667 claims and 210 research facts. Noindex remains enabled for Reed's review.
