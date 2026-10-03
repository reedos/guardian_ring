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
