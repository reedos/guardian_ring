// A reading path through existing, audited model claims. No hardware values are inferred here.
import { chip } from '../evidence.js';
import { planckSpectralRadiance } from '../model/radiometry.ts';

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const rows = (model, ids, result = false) => `<dl class="specs math-values${result ? ' math-result' : ''}">${ids.map(id => {
  const row = model.claims?.[id];
  return row ? `<div data-math-claim="${esc(id)}"><dt>${esc(row[0])}</dt><dd>${esc(row[1])}</dd>${chip(row[2], `model:${id}`, row[0])}</div>` : '';
}).join('')}</dl>`;
const step = (formula, explanation, anchor) => `<div class="math-step"><span class="math-step-arrow" aria-hidden="true">↓</span><p><a href="method.html#calc-${anchor}" class="math-formula">${esc(formula)}</a><span>${esc(explanation)}</span></p></div>`;

function spectrum(model) {
  const { blackbodyTemperatureK: temperature, bandMinMicrometers: low, bandMaxMicrometers: high } = model.outputs;
  // Plot bounds are axis choices only. This is the same ideal Planck formula as the audited band integral.
  const min = 1, max = 20, left = 36, right = 338, top = 12, bottom = 126;
  const samples = Array.from({ length: 193 }, (_, i) => {
    const wavelength = min + (max - min) * i / 192;
    return { wavelength, radiance: planckSpectralRadiance(wavelength * 1e-6, temperature) * 1e-6 };
  });
  const ceiling = Math.ceil(Math.max(...samples.map(point => point.radiance)) / 2) * 2;
  const x = wavelength => left + (wavelength - min) / (max - min) * (right - left);
  const y = radiance => bottom - radiance / ceiling * (bottom - top);
  const path = samples.map((point, i) => `${i ? 'L' : 'M'}${x(point.wavelength).toFixed(2)},${y(point.radiance).toFixed(2)}`).join(' ');
  const xTicks = [1, 5, 10, 15, 20].map(value => `<text x="${x(value)}" y="145" text-anchor="middle">${value}</text>`).join('');
  const yTicks = [0, ceiling / 2, ceiling].map(value => `<g><line x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}" class="math-gridline"/><text x="27" y="${y(value) + 3}" text-anchor="end">${value}</text></g>`).join('');
  return `<figure class="math-spectrum"><p class="math-plot-unit">Spectral radiance · W m⁻² sr⁻¹ μm⁻¹</p><svg viewBox="0 0 360 174" role="img" aria-labelledby="math-spectrum-title math-spectrum-desc"><title id="math-spectrum-title">Ideal blackbody spectrum</title><desc id="math-spectrum-desc">The Planck curve for the assumed temperature. The amber strip marks the selected teaching wavelength interval. The axes describe spectral radiance, not a detector measurement.</desc><defs><clipPath id="math-spectrum-band"><rect x="${x(low)}" y="${top}" width="${x(high) - x(low)}" height="${bottom - top}"/></clipPath></defs><rect x="${x(low)}" y="${top}" width="${x(high) - x(low)}" height="${bottom - top}" class="math-band-shade"/>${yTicks}<path d="${path}" class="math-spectrum-line"/><path d="${path}" class="math-spectrum-selected" clip-path="url(#math-spectrum-band)"/>${xTicks}<text x="187" y="167" text-anchor="middle">Wavelength · μm</text></svg><figcaption><span>Ideal spectrum; amber marks the teaching interval.</span><span class="math-plot-evidence">${chip('derived', 'model:bandRadianceWm2Sr', 'Planck curve and band integral')}${chip('assumed', 'model:blackbodyTemperatureK', 'ideal blackbody temperature')}${chip('assumed', 'model:bandMinMicrometers', 'teaching wavelength interval')}</span></figcaption></figure>`;
}

export function renderMath(model) {
  const heo = model.scenario.orbit === 'heo';
  const apertureAvailable = model.outputs.apertureDiameterM !== null;
  return `<section class="math-section" data-math-section="orbit" aria-labelledby="math-orbit-heading"><header><p class="math-kicker">Orbit → travel time</p><h4 id="math-orbit-heading">Give light a distance</h4></header><p class="math-context">${heo ? 'The teaching ellipse is evaluated at apogee. Its distance changes around the orbit.' : 'Use a circular teaching orbit and the surface point directly below it.'}</p>${rows(model, ['altitudeKm', 'orbitPeriodSeconds'])}<p class="math-choice-link"><a href="method.html#assume-model-orbits">Orbit geometry is a stated teaching choice.</a></p>${step('t = d / c', 'Divide the geometric distance to nadir by the speed of light.', 'vacuum-light-time')}${rows(model, ['slantRangeKm', 'lightTimeSeconds'], true)}<p class="math-boundary">This is one-way vacuum propagation. Processing and routing add separate delays.</p></section>
  <section class="math-section" data-math-section="wavelength" aria-labelledby="math-wavelength-heading"><header><p class="math-kicker">Wavelength → photon and optics</p><h4 id="math-wavelength-heading">Change the wavelength</h4></header><p class="math-context">The teaching wavelength sets photon energy. An independent ideal aperture adds a diffraction example.</p>${rows(model, ['wavelengthMicrometers'])}${step('E = hc / λ', 'A longer wavelength means less energy per photon.', 'photon-energy')}${rows(model, ['photonEnergyJ'], true)}${apertureAvailable ? `${rows(model, ['apertureDiameterM'])}${step('θ ≈ 1.22 λ / D', 'Use an ideal, unobstructed circular laboratory aperture.', 'ideal-diffraction')}${rows(model, ['diffractionRadians'], true)}<p class="math-boundary">The angle belongs to this ideal example. It does not specify the drawn payload’s image resolution.</p>` : `<div class="math-unavailable"><p class="math-kicker">Civil aperture unavailable</p><p>${esc(model.unavailable.aperture)}</p><a href="method.html#assume-model-lab-aperture">Read the aperture assumption →</a></div>`}</section>
  <section class="math-section" data-math-section="blackbody" aria-labelledby="math-blackbody-heading"><header><p class="math-kicker">Ideal source → band radiance</p><h4 id="math-blackbody-heading">Add up a slice of the spectrum</h4></header><p class="math-context">Start with a uniform ideal blackbody. Choose a wavelength interval, then integrate its Planck spectrum across that interval.</p>${rows(model, ['blackbodyTemperatureK', 'bandMinMicrometers', 'bandMaxMicrometers'])}${spectrum(model)}${step('Lband = ∫ Bλ(T) dλ', 'The integral gives radiance per area and solid angle.', 'planck-band-radiance')}${rows(model, ['bandRadianceWm2Sr'], true)}${step('Nband = ∫ Bλ(T) / (hc/λ) dλ', 'Divide by photon energy at each wavelength, then integrate.', 'planck-band-photons')}${rows(model, ['bandPhotonRadiancePerSm2Sr'], true)}<p class="math-boundary">Source radiance stays the same when orbit, aperture, or detector choice changes. No atmosphere or detector response is applied.</p></section>`;
}
