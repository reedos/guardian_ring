import { describe, expect, it } from 'vitest';
import { FLIGHT_COVERAGE, FULL_SCOPE, PREVIEW, validateGeometryReport, validatePageReports } from '../../tools/gate-report.mjs';

const options = { name: 'flights-desktop', builtAt: 1000, sceneIds: ['orbits', 'pixel'] };
const geometry = () => ({ status: 'PASS', failures: [], url: PREVIEW, date: new Date(2000).toISOString(), scope: FULL_SCOPE,
  scenes: [{ id: 'orbits', ready: true }, { id: 'pixel', ready: true }], gpu: 'ANGLE NVIDIA Direct3D11', states: 18, flightCoverage: FLIGHT_COVERAGE });

describe('final acceptance report', () => {
  it('accepts a current complete run with all-pairs flight coverage', () => {
    expect(validateGeometryReport(geometry(), options).states).toBe(18);
  });
  it('rejects a fresh scoped PASS that overwrote the main report', () => {
    expect(() => validateGeometryReport({ ...geometry(), scope: 'pixel' }, options)).toThrow('scoped result');
  });
  it('rejects missing, duplicate and reserved scenes', () => {
    for (const scenes of [[{ id: 'pixel', ready: true }], [{ id: 'pixel', ready: true }, { id: 'pixel', ready: true }], [{ id: 'orbits', ready: true }, { id: 'pixel', ready: false }]]) {
      expect(() => validateGeometryReport({ ...geometry(), scenes }, options)).toThrow();
    }
  });
  it('rejects stale, unmeasured, failed and old traversal reports', () => {
    for (const patch of [{ date: new Date(500).toISOString() }, { date: 'invalid' }, { states: 0 }, { failures: ['collision'] }, { flightCoverage: 'list order' }, { gpu: 'SwiftShader' }]) {
      expect(() => validateGeometryReport({ ...geometry(), ...patch }, options)).toThrow();
    }
  });
  it('requires every reference page in both forms from the built preview', () => {
    const pages = ['evidence', 'method', 'glossary', 'parts'].flatMap(page => ['desktop', 'phone'].map(form => ({ page, form, status: 'PASS', failures: [], url: `${PREVIEW}${page}.html?orbit=leo` })));
    const opts = { name: 'pages', modifiedAt: 2000, builtAt: 1000 };
    expect(validatePageReports(pages, opts)).toHaveLength(8);
    expect(() => validatePageReports(pages.slice(1), opts)).toThrow('incomplete');
    expect(() => validatePageReports(pages.filter(page => page.page !== 'parts'), opts)).toThrow('incomplete');
    for (const form of ['desktop', 'phone']) {
      const index = pages.findIndex(page => page.page === 'parts' && page.form === form);
      expect(() => validatePageReports(pages.filter((_, i) => i !== index), opts)).toThrow('incomplete');
      expect(() => validatePageReports(pages.map((page, i) => i === index ? { ...page, status: 'FAIL', failures: ['catalog overflow'] } : page), opts)).toThrow(`parts/${form} failed`);
    }
    expect(() => validatePageReports(pages, { ...opts, modifiedAt: 500 })).toThrow('stale');
    expect(() => validatePageReports(pages.map((p, i) => i ? p : { ...p, url: p.url.replace('47601', '47600') }), opts)).toThrow('built preview');
  });
});
