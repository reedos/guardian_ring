// Carry the reader's scenario across page links. Each site names its own scenario keys (IF: the campus, Guardian
// Ring: orbit, aperture, band, detector); the logic is the same. Pure: no document, no location.
//
//   const { SCENARIO_KEYS, withScenario } = createScenarioLinks(['orbit', 'aperture']);
//   withScenario(location.search, 'method.html#calc-x')   // 'method.html?orbit=geo#calc-x' when the page URL has orbit=geo
//
// withScenario copies whichever scenario keys `search` carries onto `href`, keeps href's own path and hash,
// overwrites only those keys if href already carries a stale scenario, and returns href unchanged when `search`
// carries no scenario at all.
export function createScenarioLinks(keys) {
  const SCENARIO_KEYS = [...keys];
  function withScenario(search, href) {
    const here = new URLSearchParams(search), carry = SCENARIO_KEYS.filter(key => here.has(key));
    if (!carry.length) return href;
    const hashAt = href.indexOf('#'), path = hashAt === -1 ? href : href.slice(0, hashAt), hash = hashAt === -1 ? '' : href.slice(hashAt);
    const [base, existingQuery] = path.split('?'), query = new URLSearchParams(existingQuery || '');
    for (const key of carry) query.set(key, here.get(key));
    return `${base}?${query}${hash}`;
  }
  return { SCENARIO_KEYS, withScenario };
}
