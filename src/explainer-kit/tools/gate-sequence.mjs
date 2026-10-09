// Gates run one after another, never together, so performance numbers do not compete for the GPU and one flaky
// gate cannot hide behind another. Each gate is [name, ...args] and runs as `node tools/<name>.mjs ...args`.
import { spawnSync } from 'node:child_process';

// Cheap interaction gates first, the exhaustive and timing-sensitive ones (`slow`) last, otherwise in given order.
export const orderGates = (gates, slow = []) => {
  const late = new Set(slow);
  return gates.map((gate, index) => ({ gate, index }))
    .sort((a, b) => Number(late.has(a.gate[0])) - Number(late.has(b.gate[0])) || a.index - b.index)
    .map(x => x.gate);
};

// Runs every gate; a failure never stops the rest. Returns { total, failures, failed: [[name, ...args]] }.
export function runGates(gates, { slow = [], dir = 'tools', run = (file, args) => spawnSync(process.execPath, [file, ...args], { stdio: 'inherit' }).status } = {}) {
  const ordered = orderGates(gates, slow), failed = [];
  for (const [name, ...args] of ordered) if (run(`${dir}/${name}.mjs`, args) !== 0) failed.push([name, ...args]);
  return { total: ordered.length, failures: failed.length, failed };
}
