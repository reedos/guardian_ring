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
  const header = (kicker, title) => `<header><p class="math-context-tag" hidden>Connected to this level</p><p class="math-kicker">${kicker}</p><h4>${title}</h4></header>`;
  const work = (id, body) => `<details data-math-work="${id}"><summary>Show the inputs and reasoning</summary>${body}</details>`;
  return `<section class="math-section" data-math-section="orbit" aria-label="Orbit and light travel time">${header('Orbit → travel time', 'Give light a distance')}${rows(model, ['lightTimeSeconds'], true)}<p class="math-boundary">One-way vacuum propagation to the point directly below the spacecraft. Processing and routing add separate delays.</p>${work('orbit', `<p class="math-context">${heo ? 'The teaching ellipse is evaluated at apogee. Its distance changes around the orbit.' : 'Use a circular teaching orbit and the surface point directly below it.'}</p>${rows(model, ['altitudeKm', 'orbitPeriodSeconds'])}<p class="math-choice-link"><a href="method.html#assume-model-orbits">Orbit geometry is a stated teaching choice.</a></p>${step('t = d / c', 'Divide the geometric distance to nadir by the speed of light.', 'vacuum-light-time')}${rows(model, ['slantRangeKm'])}`)}<button type="button" class="math-adjust" data-adjust="orbit">Try another orbit →</button></section>
  <section class="math-section" data-math-section="wavelength" aria-label="Wavelength, photon energy, and ideal optics">${header('Wavelength → photon and optics', 'Change the wavelength')}${rows(model, ['photonEnergyJ', 'diffractionRadians'], true)}<p class="math-boundary">A longer wavelength means less energy per photon. The diffraction angle belongs to an independent ideal laboratory aperture.</p>${work('wavelength', `<p class="math-context">The teaching wavelength sets photon energy. An independent ideal aperture adds a diffraction example.</p>${rows(model, ['wavelengthMicrometers'])}${step('E = hc / λ', 'Divide Planck’s constant times the speed of light by wavelength.', 'photon-energy')}${apertureAvailable ? `${rows(model, ['apertureDiameterM'])}${step('θ ≈ 1.22 λ / D', 'Use an ideal, unobstructed circular laboratory aperture.', 'ideal-diffraction')}<p class="math-boundary">The angle does not specify the drawn payload’s image resolution.</p>` : ''}`)}${apertureAvailable ? '' : `<div class="math-unavailable"><p class="math-kicker">Civil aperture unavailable</p><p>${esc(model.unavailable.aperture)}</p><a href="method.html#assume-model-lab-aperture">Read the aperture assumption →</a></div>`}<button type="button" class="math-adjust" data-adjust="band">Try another wavelength →</button></section>
  <section class="math-section" data-math-section="blackbody" aria-label="Ideal blackbody band radiance">${header('Ideal source → band radiance', 'Add up a slice of the spectrum')}${rows(model, ['bandRadianceWm2Sr'], true)}${spectrum(model)}<p class="math-boundary">This ideal source stays the same when orbit, aperture, or detector reference changes. No atmosphere or detector response is applied.</p>${work('blackbody', `<p class="math-context">Choose a wavelength interval, then integrate the uniform ideal blackbody spectrum across it.</p>${rows(model, ['blackbodyTemperatureK', 'bandMinMicrometers', 'bandMaxMicrometers'])}${step('Lband = ∫ Bλ(T) dλ', 'The integral gives radiance per area and solid angle.', 'planck-band-radiance')}${step('Nband = ∫ Bλ(T) / (hc/λ) dλ', 'Divide by photon energy at each wavelength, then integrate.', 'planck-band-photons')}${rows(model, ['bandPhotonRadiancePerSm2Sr'], true)}`)}<button type="button" class="math-adjust" data-adjust="band">Try another interval →</button></section>`;
}
