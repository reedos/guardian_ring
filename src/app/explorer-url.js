// Keep URL parsing independent of DOM and scenes. Older links omit enclosure
// state; normal scene entry and part selection remain their source of defaults.
export function assemblyViewFromQuery(search) {
  const view = new URLSearchParams(search).get('assembly');
  return view === 'assembled' || view === 'inside' ? view : null;
}
export function followFromQuery(search) {
  const value=new URLSearchParams(search).get('follow');
  return value==='geo'||value==='leo'?value:null;
}

/**
 * @param {string | URLSearchParams} search
 * @param {{scene: number, mode: string, selected?: string | null, assemblyView?: string | null, follow?: string | null}} view
 */
export function explorerQuery(search, { scene, mode, selected = null, assemblyView = null, follow = null }) {
  const query = new URLSearchParams(search);
  query.set('view', [scene, mode, selected].filter(value => value !== null).join('.'));
  if (assemblyView === 'assembled' || assemblyView === 'inside') query.set('assembly', assemblyView);
  else query.delete('assembly');
  if(scene===0&&!selected&&['geo','leo'].includes(follow))query.set('follow',follow);
  else query.delete('follow');
  return query;
}

/**
 * A readable deep link: `#/payload`, `#/payload/detector`, `#/payload/heat` or
 * `#/payload/heat/detector`. A level is its id (`focal-plane`) or its name without
 * "the". A `?view=` query is the precise form and always wins over this one.
 * @param {string} hash
 * @param {string[]} sceneIds
 * @param {string[]} modes
 * @returns {{scene: number, mode: string|null, part: string|null} | null}
 */
export function viewFromHash(hash, sceneIds, modes = ['light', 'data', 'heat']) {
  const tokens = String(hash || '').replace(/^#\/?/, '').split('/').map(token => decodeURIComponent(token).trim().toLowerCase()).filter(Boolean);
  if (!tokens.length || tokens.length > 3) return null;
  const scene = sceneIds.indexOf(tokens[0].replace(/^the-/, '').replace(/_/g, '-'));
  if (scene < 0) return null;
  const rest = tokens.slice(1);
  const mode = modes.includes(rest[0]) ? rest.shift() : null;
  if (rest.length > 1) return null;
  return { scene, mode, part: rest[0] || null };
}
