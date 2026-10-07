import {describe, it, expect} from 'vitest';
import {compute, SCENARIO_OPTIONS} from './engine';
import {eccentricAnomalyRadians, orbitalPlanePosition, meanAnomalyRadians} from './orbits';
import {planckSpectralRadiance, carnotRefrigeratorCOP, coolerEnergyBalance} from './radiometry';
import {chargeSample, wheelSlew, eclipsePower, slabRadiance, calibrate} from './cinematic-physics.js';

// Relative errors remain meaningful for both photon energies and orbital distances.
function relative(actual:number, expected:number, tolerance=1e-10) {
  expect(Number.isFinite(actual)).toBe(true);
  expect(Math.abs((actual-expected)/expected)).toBeLessThan(tolerance);
}
const h=6.62607015e-34, c=299792458, k=1.380649e-23;

// Independent frequency-domain midpoint quadrature. The implementation uses
// wavelength-domain log/Simpson quadrature; neither kernel nor integrator is reused.
function frequencyBand(lo:number, hi:number, temperature:number) {
  const n=40000, start=c/hi, step=(c/lo-start)/n;
  let energy=0, photons=0;
  for(let i=0;i<n;i++) {
    const nu=start+(i+.5)*step;
    const occupancy=1/Math.expm1(h*nu/(k*temperature));
    const modes=2*nu*nu/(c*c)*occupancy;
    photons+=modes*step; energy+=modes*h*nu*step;
  }
  return {energy, photons};
}

describe('claim audit: independent calculations',()=>{
  it('resolves tiny Kepler angles using relative accuracy, including near-parabolic ellipses',()=>{
    // Construct M from a known E using the convergent Taylor series, without
    // subtracting E and e*sin(E). This catches cancellation and absolute stops.
    for(const e of [.722, .999999999999]) for(const angle of [1e-3,1e-6,1e-9,1e-14]) {
      const mean=(1-e)*angle+e*(angle**3/6-angle**5/120+angle**7/5040-angle**9/362880);
      relative(eccentricAnomalyRadians(mean,e),angle);
      relative(eccentricAnomalyRadians(-mean,e),-angle);
    }
  });
  it('checks every scenario radiance through frequency space and photon energies through frequency',()=>{
    for(const orbit of SCENARIO_OPTIONS.orbit) for(const aperture of SCENARIO_OPTIONS.aperture)
    for(const band of SCENARIO_OPTIONS.band) for(const detector of SCENARIO_OPTIONS.detector) {
      const {outputs:o,claims}=compute({orbit:orbit.id,aperture:aperture.id,band:band.id,detector:detector.id});
      const reference=frequencyBand(o.bandMinMicrometers*1e-6,o.bandMaxMicrometers*1e-6,288);
      relative(o.bandRadianceWm2Sr,reference.energy,2e-8);
      relative(o.bandPhotonRadiancePerSm2Sr,reference.photons,2e-8);
      const frequency=c/(o.wavelengthMicrometers*1e-6);
      relative(o.photonEnergyJ,h*frequency);
      // One photon over one oscillation has E/f = h; display units must agree.
      relative(Number(claims.photonEnergyJ?.[1].split(' ')[0]),h*frequency,5e-4);
    }
  });
  it('checks displayed orbit quantities against differentiated ellipse positions and polygon area',()=>{
    for(const orbit of SCENARIO_OPTIONS.orbit) {
      const o=compute({orbit:orbit.id}).outputs, e=orbit.id==='heo'?.722:0;
      const a=(o.perigeeAltitudeKm+o.apogeeAltitudeKm+2*6378.137)*500;
      const at=(t:number)=>orbitalPlanePosition(a,e,meanAnomalyRadians(t,o.orbitPeriodSeconds));
      const t=orbit.id==='heo'?o.orbitPeriodSeconds/2:0, dt=.1;
      const p=at(t), before=at(t-dt), after=at(t+dt);
      relative(Math.hypot(after.x-before.x,after.y-before.y)/(2*dt),o.orbitSpeedKmS*1000,2e-8);
      relative(p.radius-6378137,o.altitudeKm*1000);
      relative(Math.hypot(p.x-6378137*p.x/p.radius,p.y-6378137*p.y/p.radius),o.slantRangeKm*1000);
      relative(o.lightTimeSeconds*c,o.slantRangeKm*1000);
      let twiceArea=0; const n=10000;
      for(let i=0;i<n;i++){const p=at(i*o.orbitPeriodSeconds/n),q=at((i+1)*o.orbitPeriodSeconds/n);twiceArea+=p.x*q.y-q.x*p.y;}
      const momentum=p.radius*o.orbitSpeedKmS*1000;
      relative(twiceArea/momentum,o.orbitPeriodSeconds,1e-6);
    }
  });
  it('checks Airy first minimum using a Bessel-series root, allowing the documented 1.22 rounding',()=>{
    const j1=(x:number)=>{let term=x/2,sum=term;for(let i=1;i<30;i++){term*=-(x*x/4)/(i*(i+1));sum+=term;}return sum;};
    let lo=3,hi=4;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(j1(mid)>0)lo=mid;else hi=mid;}
    for(const band of SCENARIO_OPTIONS.band){const o=compute({band:band.id}).outputs;relative(o.diffractionRadians!,((lo+hi)/2)/Math.PI*o.wavelengthMicrometers*1e-6/.30,3e-4);}
  });
  it('checks spectral lessons with a frequency kernel and its density Jacobian',()=>{
    for(const temperature of [280,400,500,800]) for(const micrometers of [1,4.3,10,20]) {
      const wavelength=micrometers*1e-6,nu=c/wavelength;
      const perHz=2*h*nu**3/c**2/Math.expm1(h*nu/(k*temperature));
      relative(planckSpectralRadiance(wavelength,temperature),perHz*c/wavelength**2);
    }
  });
  it('checks refrigeration against reversible entropy and a closed energy ledger at different scales',()=>{
    for(const scale of [1e-20,1,1e20]) {
      const cold=43,hot=288,absorbed=scale,rejected=absorbed*hot/cold,work=rejected-absorbed;
      relative(carnotRefrigeratorCOP(cold,hot),absorbed/work);
      relative(coolerEnergyBalance(absorbed,work),rejected);
    }
  });
  it('checks charge bins by counting thresholds and calibration by solving the reference linear system',()=>{
    for(const n of [0,.1,.7,1,4]) {
      const sample=chargeSample(n,.65,1,1,8);
      let code=0;for(let threshold=1;threshold<8;threshold++)if(n*.65>=threshold/8)code++;
      expect(sample.code).toBe(code);
      if(n)relative(sample.voltage/.65,n);
    }
    for(const scale of [1e-20,1,1e20]){
      const x0=.2*scale,x1=.8*scale,d0=1.15*x0+.15*scale,d1=1.15*x1+.15*scale;
      const gain=(d1-d0)/(x1-x0),offset=d0-gain*x0;
      relative(calibrate(.6*scale,x0,x1,d0,d1),(.6*scale-offset)/gain);
    }
  });
  it('checks wheel motion, power storage and slab transport by numerical differentiation/integration',()=>{
    const step=1e-5;
    for(const p of [.2,.4,.7]) {
      const before=wheelSlew(p-step),after=wheelSlew(p+step),s=wheelSlew(p);
      relative((after.busAngle-before.busAngle)/(2*step),s.busVelocity,1e-7);
      relative((after.wheelRelativeAngle-before.wheelRelativeAngle)/(2*step),s.wheelRelativeVelocity,1e-7);
      relative(-s.wheelRelativeVelocity/13,s.busVelocity);
    }
    let stored=eclipsePower(0).energy;const n=10000;
    for(let i=0;i<n;i++){const s=eclipsePower((i+.5)/n);stored+=(s.solar-s.load)/n;}
    relative(stored,eclipsePower(1).energy);
    // Forward-Euler transfer equation dL/d(optical depth) = source - L.
    for(const scale of [1e-20,1,1e20]) {
      let radiance=10*scale; const depth=1.2,n=100000;
      for(let i=0;i<n;i++)radiance+=(2*scale-radiance)*depth/n;
      relative(slabRadiance(10*scale,2*scale,Math.exp(-depth)).outgoing,radiance,5e-6);
    }
  });
});
