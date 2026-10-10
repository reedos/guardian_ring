// Vendoring: a site copies the kit into its own tree (no package dependency, so a site's CI and its GitHub Pages
// build never need this repo), and this module proves the copy is exactly the kit at one commit.
//
//   syncVendor({ kitDir, dest })   copy css/, src/ and the two tools a site runs (vendor.mjs, gate-sequence.mjs) from the kit's committed state and write
//                                  dest/kit.json: { name, commit, files: { path: sha256 } }. Refuses a dirty kit tree,
//                                  so the recorded commit always describes what was copied.
//   checkVendor({ dest, kitDir? }) problems (strings) if a vendored file was edited, added or removed since the sync;
//                                  with kitDir also if the recorded commit is missing from the kit or any recorded
//                                  hash differs from that file at that commit.
//
// Hashes are of the LF-normalized text, so a Windows checkout with CRLF line endings still matches.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const SHIPPED = ['css', 'src', 'tools/vendor.mjs', 'tools/gate-sequence.mjs'];
export const MANIFEST = 'kit.json';
const git = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const digest = buffer => createHash('sha256').update(Buffer.from(buffer.toString('latin1').replace(/\r\n/g, '\n'), 'latin1')).digest('hex');
const posix = p => p.split(path.sep).join('/');

function walk(root, rel) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) return [];
  if (fs.statSync(full).isFile()) return [posix(rel)];
  return fs.readdirSync(full).sort().flatMap(name => walk(root, path.join(rel, name)));
}

export function syncVendor({ kitDir, dest }) {
  if (git(kitDir, 'status', '--porcelain').trim()) throw new Error('the kit has uncommitted changes; commit them first so the copy names a real commit');
  const commit = git(kitDir, 'rev-parse', 'HEAD').trim(), tracked = new Set(git(kitDir, 'ls-files').split('\n').filter(Boolean));
  const files = SHIPPED.flatMap(entry => walk(kitDir, entry)).filter(file => tracked.has(file));
  fs.rmSync(dest, { recursive: true, force: true });
  const hashes = {};
  for (const file of files) {
    const bytes = fs.readFileSync(path.join(kitDir, file));
    fs.mkdirSync(path.dirname(path.join(dest, file)), { recursive: true });
    fs.writeFileSync(path.join(dest, file), bytes);
    hashes[file] = digest(bytes);
  }
  const manifest = { name: 'explainer-kit', commit, files: hashes };
  fs.writeFileSync(path.join(dest, MANIFEST), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export function checkVendor({ dest, kitDir = null }) {
  const out = [], manifestPath = path.join(dest, MANIFEST);
  if (!fs.existsSync(manifestPath)) return [`${MANIFEST} is missing from ${dest}`];
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const present = SHIPPED.flatMap(entry => walk(dest, entry));
  for (const file of Object.keys(manifest.files)) {
    if (!present.includes(file)) { out.push(`${file}: removed since the sync`); continue; }
    if (digest(fs.readFileSync(path.join(dest, file))) !== manifest.files[file]) out.push(`${file}: edited since the sync (change the kit, then sync)`);
  }
  for (const file of present) if (!(file in manifest.files)) out.push(`${file}: not in the kit at ${manifest.commit.slice(0, 7)}`);
  if (kitDir) {
    try { git(kitDir, 'cat-file', '-e', `${manifest.commit}^{commit}`); } catch { return [...out, `kit commit ${manifest.commit.slice(0, 7)} not found in ${kitDir}`]; }
    for (const [file, hash] of Object.entries(manifest.files)) {
      let bytes;
      try { bytes = execFileSync('git', ['-C', kitDir, 'show', `${manifest.commit}:${file}`], { stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 26 }); } catch { out.push(`${file}: not in the kit at ${manifest.commit.slice(0, 7)}`); continue; }
      if (digest(bytes) !== hash) out.push(`${file}: differs from the kit at ${manifest.commit.slice(0, 7)}`);
    }
  }
  return out;
}
