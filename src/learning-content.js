// Questions guide exploration; numerical answers remain in the audited model/cards.
export const LEARNING = {
  orbits: { question: 'How does an orbit shape the view of Earth?', takeaway: 'Separate the orbit geometry from the spacecraft and its instrument.', try: 'Compare the time light takes to cross different distances.', experiment: 'orbit', next: 'satellite' },
  satellite: { question: 'What keeps an infrared instrument working in space?', takeaway: 'Trace the support equipment as well as the instrument: power, pointing, communications, and heat paths.', try: 'Compare an orbital distance with its vacuum light time.', experiment: 'orbit', next: 'payload' },
  payload: { question: 'How does a complete instrument turn light into data?', takeaway: 'Start with the assembled instrument, open its enclosures, then follow the boards and interfaces. A function, a housing and a supplier responsibility are different things.', try: 'Change wavelength in an independent ideal optics example.', experiment: 'wavelength', next: 'focal-plane' },
  'focal-plane': { question: 'How do light, electrical signals, and heat meet at the detector?', takeaway: 'Compare the optical, electrical, and thermal connections to the same assembly.', try: 'Inspect the spectrum of an ideal warm source.', experiment: 'blackbody', next: 'pixel' },
  pixel: { question: 'What connects the absorber to its readout?', takeaway: 'Identify each physical layer before following the electrical response through the readout.', try: 'Compare the energy carried by photons of different wavelengths.', experiment: 'wavelength', next: 'plume' },
  plume: { question: 'Where does the infrared light begin?', takeaway: 'Distinguish molecular emission from the independent ideal blackbody example.', try: 'Move the teaching interval across an ideal spectrum.', experiment: 'blackbody', next: 'ground' },
  ground: { question: 'What happens after a spacecraft sends data?', takeaway: 'Follow receiving, processing, archiving, and operations as separate responsibilities.', try: 'Compare light travel time with the wider data-processing path.', experiment: 'orbit' },
  abi: { question: 'What can a published weather instrument teach us?', takeaway: 'Use ABI’s named assemblies and specifications to connect instrument design with Earth observation.', try: 'Explore wavelength using the separate laboratory optics example.', experiment: 'wavelength' },
  tirs2: { question: 'How does a thermal instrument measure Earth’s emitted light?', takeaway: 'Trace the scene-selection, detector, electronics, and cooling assemblies of this named civil instrument.', try: 'Explore an ideal thermal spectrum before reading the instrument specifications.', experiment: 'blackbody' },
  atmosphere: { question: 'What changes between emitted light and light that reaches a sensor?', takeaway: 'Keep the source spectrum, atmospheric absorption, and instrument response separate.', try: 'Explore source radiance before any atmosphere or detector is applied.', experiment: 'blackbody' },
};

export function learningFor(sceneId, mode = 'light') {
  const lesson = LEARNING[sceneId];
  if (!lesson) return null;
  return mode === 'heat' ? { ...lesson, try: 'Move the teaching interval across an ideal thermal spectrum.', experiment: 'blackbody' } : { ...lesson };
}
