import { describe, it, expect } from 'vitest';
import { checkVendor } from './explainer-kit/tools/vendor.mjs';

describe('vendored explainer kit', () => {
  it('is exactly the kit commit recorded in kit.json (edit the kit, then npm run kit:sync)', () => {
    // vitest runs from the repository root
    expect(checkVendor({ dest: 'src/explainer-kit' })).toEqual([]);
  });
  it('reports a missing manifest', () => {
    expect(checkVendor({ dest: 'src/does-not-exist' })).toEqual(['kit.json is missing from src/does-not-exist']);
  });
});
