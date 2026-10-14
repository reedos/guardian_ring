// Story-registry rows (src/story-claims.js, src/sbirs-published.js) that the accuracy lane added for the story lane in
// rounds 4 to 6 but that the story page (index.html) does not yet cite. Teaching round 1 (10/11/2026) moved
// the MEO/LEO layer rows and the four SBIRS fact-sheet rows onto the story page. They stay in STORY_CLAIMS and appear on the
// Evidence page. tools/look.mjs requires every other story claim to be cited on the story page, requires these to
// stay registered and listed on the Evidence page, and fails once the story page cites one of them so the key is
// removed here. Whether the story should cite them is an editorial call for Reed. Imported only by gates, so the
// shipped bundle does not change.
import { STORY_CLAIMS } from './story-claims.js';
import { SBIRS_PUBLISHED_CLAIMS } from './sbirs-published.js';
// Teaching improvement round 1 (10/14/2026) cites the converted dimensions and mass of the real SBIRS GEO satellite.
const STORY_CITED_SBIRS_KEYS = new Set(['story:sbirs-geo-dimensions-si', 'story:sbirs-geo-weight-si']);
export const STORY_EVIDENCE_ONLY_KEYS = new Set([
  'story:rocket-plume-emitters', 'story:rocket-plume-co2-band', 'story:rocket-plume-h2o-band',
  ...SBIRS_PUBLISHED_CLAIMS.map(c => c.key).filter(key => !STORY_CITED_SBIRS_KEYS.has(key)),
]);
export const STORY_PAGE_CLAIMS = STORY_CLAIMS.filter(c => !STORY_EVIDENCE_ONLY_KEYS.has(c.key));
