// The strict claim walk behind each site's `npm run claims`: build every scenario the site can show, collect every
// claim the page shows beside a basis chip, and gather what is wrong with each one's evidence.
// The site supplies what only it knows: its scenarios, how it builds claims, and its problems function.

// Every combination of the option lists:
//   cartesian({ a: [{ id: 1 }, { id: 2 }], b: [{ id: 'x' }] })  ->  [{ a: 1, b: 'x' }, { a: 2, b: 'x' }]
export const cartesian = (options, pick = value => value.id) =>
  Object.entries(options).reduce((rows, [key, values]) => rows.flatMap(row => values.map(value => ({ ...row, [key]: pick(value) }))), [{}]);

// walkClaims({ scenarios, claimsFor, problemsOf, prefixes?, label? })
//   claimsFor(scenario)   iterable of claims ({ key, label, ... })
//   problemsOf(claim)     array of sentences
//   prefixes              keep only claims whose key starts with one of these (none given: all)
//   label(claim, problem, scenario)  returns [dedupeKey, message]; the default is one line per `${key}: ${problem}`
// Returns { problems: Map(dedupeKey -> message), keys: Set of claim keys, instances: number }.
export function walkClaims({ scenarios, claimsFor, problemsOf, prefixes = [], label = (claim, problem) => { const m = `${claim.key}: ${problem}`; return [m, m]; } }) {
  const found = new Map(), keys = new Set();
  let instances = 0;
  for (const scenario of scenarios) {
    for (const claim of claimsFor(scenario)) {
      if (prefixes.length && !prefixes.some(prefix => claim.key.startsWith(prefix))) continue;
      instances++; keys.add(claim.key);
      for (const problem of problemsOf(claim)) {
        const [dedupe, message] = label(claim, problem, scenario);
        if (!found.has(dedupe)) found.set(dedupe, message);
      }
    }
  }
  return { problems: found, keys, instances };
}
