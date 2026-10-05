// Each lesson tells one story without a required setting or manual step.
const beat=(title,body)=>({title,body});
export const CINEMATIC_LESSONS = {
  pixel:{scene:'pixel',title:'See light become data',eyebrow:'The pixel · from light to a number',duration:36,evidence:['detector','charge','conversion'],beats:[
    beat('A photon reaches the absorber','An absorbed photon can create mobile charge carriers. Some incoming light does not produce collected charge.'),
    beat('The electric field collects charge','Electron and hole motion creates a measurable electrical response. The enlarged dots represent carriers, not data packets.'),
    beat('Charge becomes a voltage','An ideal integration capacitance accumulates the signal. More collected charge changes the voltage; the graph shows its magnitude.'),
    beat('The converter makes a digital sample','Later analog-to-digital conversion assigns the measured voltage to a numerical bin. The enlarged bins are only a teaching example.'),
    beat('A sample takes its place in an image','Many spatial samples form an image. The highlighted cell follows this one signal; the surrounding image is synthetic.'),
  ]},
  cooling:{scene:'focal-plane',title:'See how the detector stays cold',eyebrow:'The focal plane · heat has to go somewhere',duration:36,evidence:['cooling','radiator'],beats:[
    beat('The detector is a heat load','The cold assembly receives heat from its surroundings and its own electronics. Cold does not mean no heat is flowing.'),
    beat('The cold finger carries heat away','A conductive connection carries heat from the detector toward the cold end of the cooler.'),
    beat('Electrical work drives the cooler','The cooler moves heat toward a warmer rejection interface. Electricity and heat are different flows.'),
    beat('The warm side rejects more heat','Heat leaving the cooler equals the heat it removed plus the electrical work it consumed, over a steady cycle.'),
    beat('The radiator emits to space','Conduction brings heat to a radiating surface. Thermal radiation carries energy away; there is no outside cooling airflow in vacuum.'),
  ]},
  wheel:{scene:'satellite',title:'See how the spacecraft turns',eyebrow:'The satellite · trade angular momentum',duration:36,evidence:['wheel'],beats:[
    beat('Start with a fixed star reference','The starfield stays fixed while the schematic body and its internal wheel turn. This is attitude change, not a change in orbital path.'),
    beat('The motor accelerates the wheel','A torque on the wheel produces an opposite torque on the spacecraft. Both motions follow the same momentum calculation.'),
    beat('The body turns in the other direction','The smaller wheel spins through a larger angle. Its motion relative to the body differs from its motion relative to the stars.'),
    beat('Reverse the torque to brake','Slowing the wheel brings this ideal spacecraft to rest at its new orientation. The body does not turn backward to stop.'),
    beat('Hold the new pointing direction','Both start and finish at rest in this example. Real spacecraft also manage external torques and periodically unload accumulated momentum.'),
  ]},
  pushbroom:{scene:'tirs2',title:'See an image being built',eyebrow:'Civil instruments · the pushbroom principle',duration:36,evidence:['pushbroom'],beats:[
    beat('A landscape passes beneath the sensor','This invented river and fields give you features to follow. The drawing explains the Landsat pushbroom principle, not an actual overpass.'),
    beat('One line spans the image swath','A row of detectors samples across the direction of travel. Spacecraft motion brings successive strips into view.'),
    beat('Successive lines build the image','The moving sample line and the growing image use exactly the same synthetic landscape values.'),
    beat('The river appears in the assembled data','Across-track position comes from the detector row; along-track position comes from successive observations.'),
    beat('Many lines become one spatial picture','The drawing uses an enlarged sampling grid. Real products also need calibration and geometric processing.'),
  ]},
  geo:{scene:'orbits',title:'See why GEO stays overhead',eyebrow:'The ring · two views of the same motion',duration:36,evidence:['geo'],beats:[
    beat('Watch Earth and satellite from space','An ideal geostationary satellite circles in the equatorial plane, in the same direction and with the same period as Earth rotates.'),
    beat('Follow one longitude','The highlighted ground marker turns with Earth. The satellite remains aligned with it while both move against the stars.'),
    beat('Change to the rotating frame','The main view now turns with Earth. The inset keeps the original space-fixed view so the two descriptions stay connected.'),
    beat('The satellite stays over one place','In the Earth-rotating view, both marker and satellite are fixed. Geosynchronous orbits with inclination or eccentricity need not stay overhead.'),
    beat('Stillness depends on your viewpoint','The orbit has not stopped. Only the reference frame changed. Sizes and spacing are compressed for this diagram.'),
  ]},
  eclipse:{scene:'satellite',mode:'heat',title:'See power through an eclipse',eyebrow:'The satellite · a battery bridges the shadow',duration:36,starts:[0,.25,.37,.55,.85],evidence:['power'],beats:[
    beat('Sunlight supplies the load','The solar array supplies electrical power. The battery begins charged; all chart values are normalized teaching quantities.'),
    beat('The spacecraft enters Earth’s shadow','Solar input disappears during the illustrated eclipse. The battery begins supplying the same electrical load.'),
    beat('Stored energy falls as the load runs','Battery energy falls by the energy delivered. This ideal balance omits losses and does not represent a mission eclipse duration.'),
    beat('Sunlight returns and recharges the battery','The array supplies the load and a charging surplus. Energy flows into the battery, and the stored-energy trace rises.'),
    beat('The energy budget closes','The teaching cycle restores the starting charge. Real sizing must account for efficiency, degradation, thermal limits and the actual orbit.'),
  ]},
  downlink:{scene:'ground',title:'See the image arrive on Earth',eyebrow:'Ground segment · keep the picture intact',duration:36,evidence:['conversion'],beats:[
    beat('Begin with an already digital image','A synthetic river image is held in memory. Digitization happened earlier in the payload electronics.'),
    beat('Group the samples into packets','The highlighted image rows become labeled data groups. Packet size and ordering here are drawing choices.'),
    beat('Transmit the encoded data','A radio link carries a modulated electromagnetic signal. Moving packet symbols track information, not physical boxes flying through space.'),
    beat('Receive and reconstruct the image','The receiver recovers data; successive rows appear in the same positions as the source image. No link rate or error performance is implied.'),
    beat('The same river reaches the ground','Recognizable features survive the complete path. Reception, image processing and any later interpretation are separate jobs.'),
  ]},
  thermal:{scene:'plume',title:'See heat as light',eyebrow:'The photon · an ideal thermal emitter',duration:36,evidence:['spectrum','molecular'],beats:[
    beat('A warm object radiates','This ideal blackbody is a teaching source. The colors reveal infrared radiation that a human eye cannot see.'),
    beat('Raise the temperature','Increasing the assumed temperature raises the emitted spectral radiance. The curve is calculated with Planck’s law.'),
    beat('The peak shifts toward shorter wavelengths','The axis is wavelength, increasing to the right. The same fixed vertical scale is used throughout the comparison.'),
    beat('Compare two thermal spectra','The original curve remains as a dim reference. The brighter curve shows the hotter ideal source.'),
    beat('A real plume has additional spectral structure','Molecular gases add wavelength-dependent emission. This smooth blackbody example is not a plume spectrum or a detection model.'),
  ]},
  atmosphere:{scene:'atmosphere',title:'See the atmosphere change the light',eyebrow:'The atmosphere · transmission and emission',duration:36,evidence:['atmosphere'],beats:[
    beat('Light enters a layer of air','Start with an ideal thermal spectrum. The slab and its smooth absorption features are invented teaching inputs.'),
    beat('Some wavelengths transmit more readily','The transmission curve changes the shape of the incoming spectrum. This diagram gives no real atmospheric window or observation condition.'),
    beat('The atmosphere also emits','A warm medium contributes its own radiation. Emission is not a packet of absorbed light immediately continuing down the same path.'),
    beat('Add the two contributions','Outgoing radiance combines transmitted source light with the slab’s thermal emission. The colored curves use the same radiance scale.'),
    beat('What arrives includes the path itself','A measurement depends on the source and the intervening medium. This ideal non-scattering, isothermal model is a first-principles example.'),
  ]},
  calibration:{scene:'tirs2',mode:'data',title:'See how calibration works',eyebrow:'Civil instruments · references make readings useful',duration:36,evidence:['references','calibration'],beats:[
    beat('A detector reading has an offset and gain','The synthetic image contains an intentionally injected brightness error. The scene itself has not changed.'),
    beat('The mirror selects a reference view','TIRS-2 can select Earth, an onboard blackbody and space. The moving mirror here indicates selection, not its optical prescription.'),
    beat('Measure distinct reference signals','Two known teaching references reveal an ideal linear response. In a real instrument, reference radiance and thermal conditions must be characterized.'),
    beat('Apply the fitted correction','The same two-point equation corrects the synthetic data. The split image shows the injected error and the corrected result.'),
    beat('Return to Earth with a calibrated response','This example removes only its own gain and offset. Noise, nonlinearity and other errors require more than this demonstration.'),
  ]},
};

// One prominent entry per scene/layer. Secondary lessons remain directly available
// in a short list; choosing parameters is never required inside a lesson.
export function cinematicFor(scene,mode) {
  const entries=Object.entries(CINEMATIC_LESSONS).filter(([,v])=>v.scene===scene);
  return entries.find(([,v])=>v.mode===mode)?.[0]||entries.find(([,v])=>!v.mode)?.[0]||null;
}
