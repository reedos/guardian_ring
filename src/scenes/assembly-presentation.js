// A cutaway removes authored covers only. Internal hardware, harnesses and
// thermal contacts remain mounted; camera solids keep their original geometry.
/**
 * @param {{asset: import('three').Object3D, assemblies: Array<{
 *   id: string, title: string, coverRole: string, partIds: string[],
 *   roles?: string[], anchor?: string | number[]
 * }>, onChange?: (state: object) => void}} options
 */
export function createAssemblyPresentation({ asset, assemblies, onChange = () => {} }) {
  if (!asset?.traverse || !Array.isArray(assemblies) || !assemblies.length) {
    throw new TypeError('Assembly presentation requires an asset and assembly definitions');
  }
  const definitions = structuredClone(assemblies), ids = new Set(), internalParts = new Set(), candidates = new Set();
  for (const assembly of definitions) {
    if (!assembly.id || ids.has(assembly.id) || !assembly.title || !assembly.coverRole ||
        !Array.isArray(assembly.partIds) || assembly.partIds.some(id => typeof id !== 'string' || !id)) {
      throw new TypeError('Assembly definitions require unique IDs, titles, cover roles and part IDs');
    }
    ids.add(assembly.id);
    assembly.partIds.forEach(id => internalParts.add(id));
    const matches = [];
    asset.traverse(object => {
      // Blender may export a role as several material-batched meshes, or as
      // their named parent. Prefix matching could remove adjacent hardware.
      if (object.isMesh && object.userData.assetRole === assembly.coverRole) matches.push(object);
      else if (object.name === assembly.coverRole) {
        let physical = false;
        object.traverse(child => { if (child.isMesh) physical = true; });
        if (physical) matches.push(object);
      }
    });
    if (!matches.length) throw new Error(`Missing assembly cover role: ${assembly.coverRole}`);
    matches.forEach(object => candidates.add(object));
  }
  // A named cover parent owns its children. Leave their individual visibility
  // and material properties intact instead of toggling the same surface twice.
  const covers = [...candidates].filter(object => {
    for (let parent = object.parent; parent; parent = parent.parent) if (candidates.has(parent)) return false;
    return true;
  });
  let view = 'assembled';
  for (const cover of covers) cover.visible = true;
  const state = () => ({ view, assemblies: structuredClone(definitions) });
  function setView(next) {
    if (next !== 'assembled' && next !== 'inside') throw new RangeError(`Unknown assembly view: ${String(next)}`);
    if (next === view) return false;
    view = next;
    for (const cover of covers) cover.visible = view === 'assembled';
    onChange(state());
    return true;
  }
  return {
    state,
    setView,
    revealPart(id) { return internalParts.has(id) ? setView('inside') : false; },
    preparePlayback() { return setView('inside'); },
    capture: () => ({ view }),
    restore(snapshot) { return setView(snapshot?.view); },
    isPartVisible: id => view === 'inside' || !internalParts.has(id),
  };
}
