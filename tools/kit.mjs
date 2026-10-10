// node tools/kit.mjs sync    copy ../explainer-kit (committed state, clean tree) into src/explainer-kit
// node tools/kit.mjs check   prove src/explainer-kit is exactly one kit commit; with ../explainer-kit present, also
//                            prove it against that commit's content in the kit's history
// The kit is vendored, not a package dependency: Pages and CI never see ../explainer-kit.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { syncVendor, checkVendor } from '../src/explainer-kit/tools/vendor.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = path.join(root, 'src/explainer-kit'), kitDir = path.resolve(root, '../explainer-kit');
const command = process.argv[2];
if (command === 'sync') {
  const manifest = syncVendor({ kitDir, dest });
  console.log(`vendored ${Object.keys(manifest.files).length} files from explainer-kit ${manifest.commit.slice(0, 7)}`);
} else if (command === 'check') {
  const against = fs.existsSync(path.join(kitDir, '.git')) ? kitDir : null;
  const found = checkVendor({ dest, kitDir: against });
  for (const line of found) console.error(line);
  console.log(found.length ? `${found.length} problems` : `vendored kit matches${against ? ' its commit in ../explainer-kit' : ' kit.json (kit repo not present)'}`);
  process.exitCode = found.length ? 1 : 0;
} else { console.error('usage: node tools/kit.mjs sync|check'); process.exitCode = 2; }
