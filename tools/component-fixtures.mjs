// CPU-only fixture reads for catalog/geometry contract tests. This module keeps
// Node file APIs out of the browser project's TypeScript declaration surface.
import { readFileSync } from 'node:fs';

export const componentLedgers = ['spacecraft-facts', 'comprehensive-systems-facts', 'tirs2-architecture-facts', 'design-practices-facts'].map(name =>
  JSON.parse(readFileSync(new URL(`../research/${name}.json`, import.meta.url), 'utf8')));

export function modelDocument(url) {
  const bytes = readFileSync(new URL(`../public/${url.split('?')[0]}`, import.meta.url));
  if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(4) !== 2 || bytes.readUInt32LE(16) !== 0x4e4f534a) throw new Error(`Invalid GLB v2 JSON chunk: ${url}`);
  return JSON.parse(bytes.subarray(20, 20 + bytes.readUInt32LE(12)).toString('utf8'));
}
