// What backs each figure the site shows, one claim at a time.
//
// A claim is a figure beside a basis chip, on a scene card or in the verified research table.
// Its basis says what kind of statement it is; its evidence says what supports it.
//
//   spec      Published spec. The maker or a standards body states it for the named product or standard.
//   vendor    Vendor claim. A vendor's own comparison or performance figure, attributed to it, with the baseline it
//             is compared against. Not checked independently here.
//   reported  Published report. Stated by a named party outside a formal specification: a government agency, a
//             researcher, an analyst, the trade press, or an operator in an informal statement such as a post.
//   derived   Calculated here. This site's model computes it from the scenario and cited inputs; CALCS says how.
//   assumed   Assumption. A value the model chooses where no single published figure applies; ASSUMPTIONS says why.
//
// Evidence rides with the claim: the last element of a [label, value, basis, ..., ev] row, or an `ev` field on an
// object row. Its forms:
//   spec, vendor, reported   { refs: [[sourceId, 'where in the source: section, table, page or figure'], ...] }
//                            a vendor claim also carries vs: 'what it is compared against'
//   derived                  { calc: 'calc-id' }       (optionally refs too, for the published inputs)
//   assumed                  { assume: 'assumption-id' }
// A spec must cite at least one primary source (the maker, the standards body, the agency that publishes the data).
// Sources live in src/sources.js with the date each was published (when it says) and the date it was checked.

import { MODEL_CALCS, MODEL_ASSUMPTIONS } from './model/evidence.js';
// The basis labels, STRICT, evOf, chip and the checking rules are the shared explainer kit's (src/explainer-kit).
// This site keeps its own calculations, assumptions and sources, and hands them to the kit's `problems`.
import { BASIS, CITED, STRICT, evOf, chip, problems as kitProblems } from './explainer-kit/src/evidence.js';
export { BASIS, CITED, STRICT, evOf, chip };

export const CALCS = { ...MODEL_CALCS };
export const ASSUMPTIONS = {
  ...MODEL_ASSUMPTIONS,
  'look-model': {
    title: 'Illustration geometry',
    value: 'Representative / not to scale',
    why: 'The prototype’s geometry, layout, satellite counts and positions, and ray paths are chosen to explain component roles. They do not describe a real constellation, sensor performance, or physical dimensions.',
  },
};

// what is wrong with one claim's evidence, as sentences (empty when it holds up)
export const problems = (claim, SOURCES, strict = STRICT) => kitProblems(claim, SOURCES, { CALCS, ASSUMPTIONS, strict });
