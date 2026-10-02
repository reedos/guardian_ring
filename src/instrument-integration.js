// One instrument can span several housings. These teaching groups are not a
// contractor work breakdown or a claim about military payload packaging.
import ledger from '../research/instrument-integration-facts.json';

const facts = Object.fromEntries(ledger.facts.map(fact => [fact.runtimeKey, fact]));
export const integrationFact = id => {
  if (!facts[id]) throw new Error(`Unknown integration fact: ${id}`);
  return structuredClone(facts[id].row);
};
export const INTEGRATION_CLAIMS = ledger.facts.map(fact => ({
  key: `integration:${fact.runtimeKey}`, group: 'story', label: fact.row[0], value: fact.row[1],
  basis: fact.row[2], ev: fact.row[3], scope: fact.scope,
}));

export const INSTRUMENT_ASSEMBLIES = [
  {
    id: 'sensor', title: 'Sensor assembly', short: 'Sensor',
    body: 'Optics, mechanisms, detectors and sensor-side electronics work together. In ABI, the Sensor Unit contains the Video Processors and Peripheral and Thermal Control electronics, including detector digitization.',
    parts: ['optics', 'baffles', 'detector', 'readout', 'digitizer', 'scan-system', 'mechanisms', 'calibration', 'aft-optics'],
    evidence: 'integration:abi-sensor-packaging',
  },
  {
    id: 'electronics', title: 'Instrument electronics assembly', short: 'Electronics',
    body: 'A common electronics chassis houses coordinated controller, data, timing, power, scan-drive and encoder-processing cards. In ABI this is the Electronics Unit, the main electrical interface to the spacecraft.',
    parts: ['controller', 'data-interface', 'power'],
    evidence: 'integration:abi-eu-packaging',
  },
  {
    id: 'cooler', title: 'Cooler-control assembly', short: 'Cooler control',
    body: 'Cooler drive electronics form a separate assembly. In ABI they mount to the spacecraft and control cooler hardware inside the Sensor Unit. A cooler-control enclosure is an electrical unit, not the cold head or radiator.',
    parts: ['thermal'],
    evidence: 'integration:abi-cce-packaging',
  },
];
export const PAYLOAD_ASSEMBLY_FOR_PART = Object.fromEntries(INSTRUMENT_ASSEMBLIES.flatMap(assembly => assembly.parts.map(id => [id, assembly])));
export const PAYLOAD_ASSEMBLY_NOTES = {
  'scan-system': 'The scan mirrors, motors and encoders are in the sensor assembly; ABI’s scan-drive and encoder-processing cards are in the Electronics Unit.',
  controller: 'The main controller and timing cards are in ABI’s Electronics Unit. The related Peripheral and Thermal Control card is in the Sensor Unit Electronics.',
  thermal: 'This view spans the separately mounted cooler controls, the cooler in the sensor assembly, and the heat-transport and radiator hardware.',
};

export const INSTRUMENT_INTERFACES = [
  { id: 'mounting', title: 'Mounting and alignment', body: 'Mounting feet and an optical-bench reference join the sensor to the spacecraft. The interface carries loads and establishes alignment; it also conducts some heat.', fact: 'abi-mounting-interface' },
  { id: 'power', title: 'Electrical power', body: 'Spacecraft feeds supply the instrument. Its electronics then produce the supplies required internally. Power conversion and command handling remain different functions even when their cards share a chassis.', fact: 'abi-power-interface' },
  { id: 'command-time', title: 'Commands, telemetry and timing', body: 'The instrument’s command interface and local timing circuitry coordinate operation. Their relationship must be defined at integration. ABI’s timing card generates internal clocks; the cited description does not establish a spacecraft time-transfer protocol.', fact: 'abi-command-time-interface' },
  { id: 'data', title: 'Science data', body: 'Detector-side samples pass to instrument data processing and the spacecraft interface. The spacecraft receives an instrument data stream, rather than an individual wire from every detector.', fact: 'abi-data-interface' },
  { id: 'thermal', title: 'Thermal interfaces', body: 'Sensor cooling, electronics mounting and radiators have different heat paths. ABI’s Sensor Unit uses its dedicated rejection hardware; the Electronics Unit and cooler controls reject heat to spacecraft mounting panels.', fact: 'abi-thermal-interface' },
];

export function attachInstrumentIntegration(levels) {
  const order = new Map(INSTRUMENT_ASSEMBLIES.map((assembly, index) => [assembly.id, index]));
  for (const mode of ['light', 'data', 'heat']) {
    for (const part of levels.payload[mode]) {
      part.assembly = PAYLOAD_ASSEMBLY_FOR_PART[part.id];
      part.assemblyNote = PAYLOAD_ASSEMBLY_NOTES[part.id] || '';
    }
    levels.payload[mode].sort((a, b) => order.get(a.assembly.id) - order.get(b.assembly.id));
  }
  return levels;
}
