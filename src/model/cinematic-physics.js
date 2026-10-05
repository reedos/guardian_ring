// Pure teaching models. Dimensionless inputs are diagram choices, never instrument ratings.
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const smooth = x => { const t=clamp01(x); return t*t*(3-2*t); };
export const between = (p,a,b) => clamp01((p-a)/(b-a));

/** Positive signal magnitude; actual readout polarity and circuit topology vary. */
export function chargeSample(photons, efficiency, capacitance, fullScale, levels) {
  if(!Number.isFinite(photons)||photons<0||!Number.isFinite(efficiency)||efficiency<0||efficiency>1||!Number.isFinite(capacitance)||capacitance<=0||!Number.isFinite(fullScale)||fullScale<=0||!Number.isInteger(levels)||levels<2)throw new RangeError('Invalid illustrative detector inputs');
  const charge=photons*efficiency,voltage=charge/capacitance;
  return {charge,voltage,code:Math.min(levels-1,Math.floor(clamp01(voltage/fullScale)*levels))};
}

/** A rest-to-rest single-axis slew. Wheel speed is relative to the bus.
 * H=(Ib+Iw)*wb+Iw*wr=0. Inertias and maneuver angle are dimensionless choices.
 */
export function wheelSlew(p,busInertia=12,wheelInertia=1,angle=1.2) {
  if(!(busInertia>0&&wheelInertia>0)||![p,busInertia,wheelInertia,angle].every(Number.isFinite))throw new RangeError('Invalid slew');
  const u=between(p,.12,.8),s=u*u*u*(10+u*(-15+6*u));
  const velocity=30*u*u*(1-u)*(1-u)/.68*angle;
  const busAngle=s*angle,wheelRelativeAngle=-(busInertia+wheelInertia)/wheelInertia*busAngle;
  return {busAngle,wheelRelativeAngle,busVelocity:velocity,wheelRelativeVelocity:-(busInertia+wheelInertia)/wheelInertia*velocity};
}

/** Energy over an illustrative cycle; powers and time use matching arbitrary units.
 * Sunlight before eclipse supplies only load; afterward the surplus recharges the battery.
 */
export function eclipsePower(p) {
  const t=clamp01(p),load=1,eclipse=t>=.25&&t<.55;
  const solar=t<.25?1:eclipse?0:t<.85?2:1;
  const battery=solar-load;
  const energy=.8-Math.min(Math.max(t-.25,0),.3)+Math.min(Math.max(t-.55,0),.3);
  return {solar,load,battery,energy,eclipse};
}

/** Non-scattering isothermal slab in LTE, at one wavelength; radiance units match. */
export function slabRadiance(incoming,source,tau) {
  if(![incoming,source,tau].every(Number.isFinite)||incoming<0||source<0||tau<0||tau>1)throw new RangeError('Invalid slab');
  return {transmitted:incoming*tau,emitted:source*(1-tau),outgoing:incoming*tau+source*(1-tau)};
}

/** Two references solve an ideal affine response. Real calibration has additional errors. */
export function calibrate(raw,lowSignal,highSignal,lowReading,highReading) {
  if(![raw,lowSignal,highSignal,lowReading,highReading].every(Number.isFinite)||highSignal===lowSignal||highReading===lowReading)throw new RangeError('Distinct finite references required');
  return lowSignal+(raw-lowReading)*(highSignal-lowSignal)/(highReading-lowReading);
}

export function syntheticTerrain(x,y) {
  const river=.46+.12*Math.sin(y*9)+.035*Math.sin(y*24);
  if(Math.abs(x-river)<.045)return .12;
  const field=(Math.floor(x*9)+Math.floor(y*12))%3;
  return .28+field*.17+.12*Math.sin(x*6+y*3)**2;
}

/** Complete rows only: the same synthetic samples drive source and received images. */
export function imageRows(p,rows=24) { return Math.floor(clamp01(p)*rows); }
