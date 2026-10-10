// The test-hook pattern: one global object per site (window.ifx, window.grx, window.p2p) that the browser gates
// drive. The kit does not define what is on it; it fixes the contract every gate relies on.
//   - exactly one global, named by the site, installed once;
//   - it carries at least the members the site's gates wait on (typically `state`, `settle`, `built`);
//   - it is the same object afterwards, so a site may keep attaching members (grx.mission = ...).
export function exposeHooks(name, api, { require = [], target = globalThis } = {}) {
  if (!/^[a-z][a-z0-9]*$/.test(name)) throw new Error(`hook name must be lowercase letters and digits: ${name}`);
  if (!api || typeof api !== 'object') throw new Error(`window.${name} needs an object`);
  const missing = require.filter(member => !(member in api));
  if (missing.length) throw new Error(`window.${name} is missing ${missing.join(', ')}`);
  if (Object.hasOwn(target, name)) throw new Error(`window.${name} is already installed`);
  target[name] = api;
  return api;
}
