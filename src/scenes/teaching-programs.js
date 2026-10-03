// Public engineering roles; these are paced explanations, not real timing,
// radiometry, throughput, control gains, or an instrument performance model.
const s = (id, title, body, claimKeys=[]) => ({ id, title, body, claimKeys });
const observe = [
  s('collect', 'Light reaches the detector', 'Follow straight light segments through the representative optical route. Playback is slowed for explanation; bends identify optical interactions.'),
  s('absorb', 'Absorption changes the detector', 'Absorbed light can produce an electrical response. The highlight identifies the absorbing region; it does not count photons or imply an efficiency.'),
  s('integrate', 'The readout accumulates a signal', 'A detector signal is accumulated during an integration interval. The growing indicator is a teaching symbol, not a signal level, integration time, or transistor circuit.'),
  s('readout', 'Readout carries the measurement', 'The electrical signal passes through the detector interface to readout electronics. Light does not continue through the cable.'),
  s('digitize', 'Electronics create a sample', 'Digitization represents an analog measurement numerically. The drawing assigns no bit depth, sample rate, or sensor format.'),
  s('transfer', 'A data interface transfers the sample', 'Framed measurements move through processing and communications interfaces. Their motion is explanatory and carries no latency or data-rate claim.'),
];
const opticalConnections = s('collect', 'Follow the optical connections', 'The dashed amber lines connect the collecting optics, spectral optics, and detector by function. They are not traced rays or a reconstruction of the optical prescription. The separate moving-mirror view demonstrates reflection at the drawn faces.');
const data = [
  s('command', 'A controller sends a command', 'Command and timing signals travel toward the equipment they control. They are separate from the image-data stream.'),
  s('feedback', 'A measurement returns', 'Position or status information returns to the controller. A command by itself does not prove that a mechanism reached its requested state.'),
  ...observe.slice(3),
];
const heat = [
  s('power', 'Electrical work enters the system', 'Electrical supply operates the electronics and active cooler. Electrical work and transported heat are different parts of the energy balance.'),
  s('sense', 'Temperature feedback closes the loop', 'The thermometer sends information to the controller, which commands the power stage. This dashed route is a measurement, not heat flowing through a wire.'),
  s('lift', 'The cooler removes heat from the cold side', 'The cold assembly transfers heat to the cooler. These glyphs represent energy transfer, not a one-way circulation of cryocooler gas.'),
  s('reject', 'The warm side receives heat and work', 'Over a complete cooler cycle with no net stored energy, Q_hot = Q_cold + W_in. The warm side must reject the removed heat and supplied work. No rated powers, efficiency, or temperature response are assigned.',['learning:cooler-balance']),
  s('radiate', 'The radiator emits energy', 'Conducted heat reaches an emitting surface and leaves as electromagnetic radiation. Space is not a fluid that carries heat away by convection.',['learning:thermal-transfer']),
];
const abi = [
  s('command', 'ABI commands its scan mirrors', 'The published ABI architecture uses motor-driver circuitry to move its orthogonal scan mirrors. The illustrated angles and speed are drawing choices.'),
  s('slew', 'The optical faces turn on their axes', 'Only the mirror assemblies turn; motors, encoder housings, and structural supports stay mounted. Local amber ray segments obey the law of reflection as the mirror turns. They demonstrate steering, not the instrument optical prescription.'),
  s('feedback', 'Encoders report mirror position', 'Encoder information returns to scan-control electronics. Commanded motion and measured position form distinct directions in the control loop.'),
  s('collect', 'The telescope collects an Earth view', 'The scan system directs the observation before the telescope and aft optics distribute light to the focal-plane modules. Dashed amber connections identify these component roles; they are not traced rays through the drawn hardware.'),
  s('reference', 'Calibration selects a reference', 'ABI includes internal calibration and solar-reference hardware. The separate dashed reference connection identifies calibration roles, not traced rays or simultaneous Earth and target illumination.'),
  ...observe.slice(3),
];
const payload = [
  s('command', 'Scan-drive circuitry receives a command', 'The controller coordinates the scan through motor-driver circuitry. ABI supplies the public civil example; these representative mechanisms and electronics are not a military design.', ['component:payload:scan-system:comp-abi-scan-drive:0','component:payload:scan-system:comp-abi-simd:0']),
  s('slew', 'Scan mirrors turn about their shafts', 'The mirror faces, backings and shafts rotate while bearing supports, motor and encoder housings, and harnesses remain fixed. The local rays demonstrate the law of reflection at each moving face; they do not reconstruct a complete optical prescription. Angles and playback pace are drawing choices.', ['component:payload:scan-system:comp-abi-scan-mirrors:0']),
  s('feedback', 'Encoders report mirror position', 'Measured position returns through encoder-processing circuitry to the controller. The command and measured feedback are distinct signals. The optical bench, telescope and detector remain mounted throughout the motion.', ['component:payload:scan-system:comp-abi-scan-encoder:0','component:payload:scan-system:comp-abi-encoder-processors:0']),
  ...observe.map(step=>step.id==='collect'?opticalConnections:step),
];
const tirs = [
  s('earth', 'TIRS-2 selects the Earth view', 'The scene-select mechanism admits an Earth observation into the telescope. The demonstration keeps its static supports fixed.'),
  s('blackbody', 'The mirror selects the onboard blackbody', 'The internal blackbody supplies a thermal reference. It is a physical target within the instrument.'),
  s('space', 'The mirror selects a space view', 'Space provides another reference direction. It is not another installed target, and this selection is not ABI-style continuous Earth scanning.'),
  ...observe.slice(3),
  s('return', 'Return to the Earth view', 'After the reference measurements pass through the readout and data interface, the mirror returns to the Earth-view position. This separate, slowed motion completes the explanation; it does not assign a real instrument schedule or mechanism speed.'),
];
const ground = [
  s('receive', 'The antenna receives a radio signal', 'A radio wave reaches the antenna. RF reception is distinct from an infrared photon arriving at a detector.'),
  s('readout', 'Receiver equipment recovers data', 'The receive chain passes recovered information to processing equipment. Cabinet layouts and connections are representative.'),
  s('transfer', 'Processing, operations, and archiving', 'Data reaches processing, operator displays, and archival storage. The teaching sequence supplies no operational warning latency.'),
];
const thermalEquipment = [heat[0], s('reject', 'Mountings conduct electronics heat', 'Circuit boards, enclosures, and mounting interfaces carry dissipated energy toward thermal-control hardware.'), heat[4]];
const civilKeys={
  abi:{command:['card:light:abi:scan-system:0'],slew:['card:light:abi:scan-system:0','card:light:abi:scan-system:1'],feedback:['component:abi:scan-system:comp-abi-scan-encoder:0'],collect:['card:light:abi:telescope:0'],reference:['card:light:abi:calibration:0','card:light:abi:calibration:1'],readout:['card:light:abi:readout:0'],digitize:['card:light:abi:readout:1']},
  tirs2:{earth:['card:light:tirs2:scene-select:0'],blackbody:['card:light:tirs2:scene-select:0'],space:['card:light:tirs2:scene-select:0'],return:['card:light:tirs2:scene-select:0'],command:['card:light:tirs2:scene-select:1'],feedback:['card:light:tirs2:scene-select:1']},
};
const civil=(id,steps)=>steps.map(step=>({...step,claimKeys:civilKeys[id]?.[step.id]||step.claimKeys}));
export function teachingProgram(id, mode) {
  if (mode === 'data' && id==='plume') return [s('timeline', 'Record the order of an emission event', 'An event record can place emission in a sequence. The isolated timeline advances from earlier to later; it is an explanatory ordering cue, not a cable through the plume, a launch trajectory, or a prediction of event duration.')];
  if (mode === 'data' && id==='atmosphere') return [s('timeline', 'Record the order of an interaction', 'An interaction can be described as an ordered record: radiation arrives, then the selected example absorbs or transmits it. The isolated timeline shows that order; it is not a data link through the air or an operational propagation model.')];
  if (mode === 'heat' && id==='ground') return [s('power','Electrical power operates the ground equipment','The UPS and distribution equipment provide electrical power to the representative ground electronics. The illustration does not assign a UPS topology or capacity.'),s('reject','Ground equipment releases heat','Electrical equipment dissipates heat into its surroundings. Ground cooling can use air and other thermal-control systems; this is not spacecraft radiation into vacuum.')];
  if (mode === 'heat' && id==='pixel') return [s('lift','Energy leaves the detector assembly','A detector absorbs radiant energy and also exchanges heat through its package. These routes show heat transfer, not a sensor noise level.'),s('reject','The carrier provides a thermal interface','The detector and readout connect thermally to their supporting assembly. The complete cooler and radiator belong at the larger instrument and spacecraft levels.')];
  if (mode === 'heat' && id==='focal-plane') return heat.slice(0,4).map(step=>step.id==='reject'?{...step,title:'Heat continues to the larger thermal system',body:'Over a complete cooler cycle, Q_hot = Q_cold + W_in. The warm-side route continues beyond this close-up to the instrument and spacecraft heat-rejection system; its radiator is not drawn here.'}:step);
  if (mode === 'heat') return id==='satellite' ? thermalEquipment : ['plume', 'atmosphere'].includes(id) ? [s('emit', 'Matter exchanges energy with radiation', 'Emission and absorption transfer energy. The molecular symbols and moving glyphs are qualitative; they do not specify abundance, transmission, or visibility.')] : heat;
  if (id==='pixel') return [...observe.slice(0,4),s('transfer','The readout output crosses an interface','The readout passes its measurement onward. This representative package does not locate an analog-to-digital converter inside the pixel or invent a transistor circuit.')];
  if (mode==='data' && id==='satellite')return data.filter(step=>step.id!=='digitize').map(step=>step.id==='readout'?{...step,title:'The payload supplies measurements',body:'The payload passes already digitized image data to spacecraft processing. The bus-level drawing does not place a new analog-to-digital converter in this interface.'}:step);
  if (mode==='data' && id==='focal-plane')return data.filter(step=>step.id!=='feedback');
  if (mode==='data' && id==='payload')return data.map(step=>step.id==='transfer'?{...step,title:'The instrument delivers a data stream',body:'Sensor-side samples pass through data processing and the instrument interface, then cross the spacecraft connector. ABI provides the civil example: Video Processor to Data Processor to HSIO. Internal routes and motion remain illustrative.',claimKeys:['integration:abi-data-interface']}:step);
  if (id === 'plume') return [s('emit', 'Molecules emit infrared radiation', 'Excited molecular states can emit characteristic infrared bands. The enlarged molecular symbols do not show concentration or plume chemistry.'), s('timeline', 'Time orders an event', 'A timeline records event order. It is not a data cable through the plume or a prediction of any launch trajectory.')];
  if (id === 'atmosphere') return [s('arrive', 'Radiation encounters matter', 'Absorption depends on wavelength and molecular transitions. This is a qualitative molecular example.'), s('absorb', 'A molecule absorbs energy', 'An absorbed ray ends at the interaction. No transmission fraction or operational line of sight is computed.'), s('transmit', 'A different sample passes through', 'The separate transmitted sample illustrates another possible interaction history, not a transparent operational window or a probability.')];
  if (id === 'ground') return ground;
  if (mode === 'light' && id === 'payload') return payload;
  if (mode === 'light' && id === 'abi') return civil(id,abi);
  if (mode === 'light' && id === 'tirs2') return civil(id,tirs);
  if (id === 'satellite' && mode === 'light') return [observe[0], observe[3], observe[5]];
  return mode === 'data' ? civil(id,data) : observe;
}
