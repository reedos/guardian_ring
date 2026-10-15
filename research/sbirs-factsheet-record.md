# U.S. Space Force SBIRS fact sheet: line-by-line record

Source id: `ssc-sbirs-factsheet`
URL: https://www.spaceforce.mil/about-us/fact-sheets/article/2197746/space-based-infrared-system/
Page footer: "Current as of March 2023"
Publisher: U.S. Space Force (a U.S. government work)

## Why this record exists

spaceforce.mil returns HTTP 403 Forbidden to scripted fetches, and the reviewers' browser pane refused it
(10/14/2026, accuracy fixer, round 1: WebFetch got 403, the built-in browser navigation was denied; no workaround was
tried). The page therefore cannot be reopened automatically. Each figure the site cites to it is listed here so that a
person with an ordinary browser can check the numbers in a minute, and so that a changed page is noticed.

## Provenance, stated plainly

- Read in a real browser by the review coordinator on 10/11/2026 and transcribed into
  `research/review-accuracy-2026-10-10.md` (Rounds 5 and 6). Reed approved citing the dimensions and weights as Spec on
  10/11/2026 (same file).
- Not independently reopened since by any automated reviewer. This file does not add a second reading; it makes the
  existing one checkable line by line.
- Only the two short phrases in quotation marks below were recorded verbatim by the earlier review. Every other row
  records the figure as transcribed, not a quoted sentence.

## What the site cites, by claim key (defined in `src/story-claims.js` and `src/sbirs-published.js`)

| Claim key | Fact-sheet line | What the site states | Form of the record |
|---|---|---|---|
| `story:sbirs-scanning-staring` | Payload paragraph | A scanner and a step-starer | Verbatim phrase: "The infrared payload consists of two sensors; a scanner and a step-starer." |
| `story:sbirs-ir-bands` | Mission paragraph | Short-wave and mid-wave infrared | Verbatim phrase: "detect short-wave and mid-wave infrared signals" |
| `story:sbirs-program-segments` | Program composition paragraph | GEO satellites, HEO sensors on host satellites, legacy DSP satellites, ground systems | Transcribed, not quoted |
| `story:sbirs-data-downlink` | Data paragraph | Raw unprocessed data down-linked, plus detected events from on-board signal processing | Transcribed, not quoted |
| `story:sbirs-sensor-dimensions` | Features: Dimension, Sensor line | Approximately 7 ft x 4 ft x 3 ft | Figure as transcribed |
| `story:sbirs-sensor-weight` | Features: Weight (all weights approximate), Sensor line | Approximately 530 lb | Figure as transcribed |
| `story:sbirs-geo-dimensions` | Features: Dimension, Satellite line | Approximately 49 ft x 22 ft x 20 ft, all appendages deployed on orbit | Figure as transcribed |
| `story:sbirs-geo-weight` | Features: Weight (all weights approximate), Satellite line | Approximately 5,525 lb on orbit, including a 1,100 lb two-sensor payload and 430 lb of fuel | Figures as transcribed |
| `story:sbirs-power-source` | Features: Power source line | Sun-tracking solar arrays | Transcribed |
| `story:sbirs-geo-launches` | Launch list | 05/07/2011, 03/19/2013, 01/20/2017, 01/19/2018, 05/18/2021, 08/04/2022 (sixth and final) | Dates as transcribed |

The metric rows (`story:sbirs-*-si`) are Calc. conversions with exact factors (0.3048 m per ft, 0.45359237 kg per lb)
and need no separate source reading.

## Independent corroboration the site already carries (secondary)

- Scanner plus step-starer: two Lockheed Martin documents, `lm-sbirs-geo2-payload-2009` and
  `lm-sbirs-product-card-2016`, are cited as secondary refs on `story:sbirs-scanning-staring`.
- Geostationary and highly elliptical orbit families: GAO-21-105249, printed p. 4 (PDF p. 8), first paragraph, is the
  primary ref on the card row "SBIRS orbit families"; the fact sheet is a second ref. The story's opening sentence about
  GAO cites that GAO row, not the fact sheet and not the unchecked CRS NC3 primer.

## Still needed (cannot be done by an automated reader)

1. An archive snapshot of the page (for example an archive.org capture) with its capture date, added to this file and
   to the `access` note of `ssc-sbirs-factsheet` in `src/sources.js`.
2. A second human reading of the table rows above, dated and initialed here.

Re-check these figures against the live page whenever the footer date changes from "Current as of March 2023".
