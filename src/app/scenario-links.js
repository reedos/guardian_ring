// IF's pure cross-page scenario URL helper.
export const SCENARIO_KEYS = ['orbit', 'aperture', 'band', 'detector'];
export function withScenario(search, href) {
  const here = new URLSearchParams(search), carry = SCENARIO_KEYS.filter(key => here.has(key));
  if (!carry.length) return href;
  const hashAt = href.indexOf('#'), path = hashAt === -1 ? href : href.slice(0, hashAt), hash = hashAt === -1 ? '' : href.slice(hashAt);
  const [base, existingQuery] = path.split('?'), query = new URLSearchParams(existingQuery || '');
  for (const key of carry) query.set(key, here.get(key));
  return `${base}?${query}${hash}`;
}
