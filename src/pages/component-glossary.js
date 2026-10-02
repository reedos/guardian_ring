// Additional engineering terms use the same reviewed locators as their component cards.
import { catalogFact } from '../component-catalog.js';
const refs = (...keys) => keys.flatMap(key => catalogFact(key)[3].refs);

export const COMPONENT_GLOSSARY = [
  ['simd', 'Scanner Interface & Motor Driver (SIMD)', 'The ABI Electronics Unit card that drives its scan-mirror motors. Optical encoders measure position through separate encoder-processor cards.', refs('comp-abi-simd', 'comp-abi-encoder-processors')],
  ['ptc', 'Peripheral and Thermal Control (P&TC)', 'ABI Sensor Unit electronics for thermal hardware, calibration targets, covers and focus control. Scan-mirror motion has its own drive electronics in the Electronics Unit.', refs('comp-abi-ptc', 'comp-abi-simd')],
  ['hsio', 'High Speed I/O (HSIO)', 'ABI’s SpaceWire interface to the spacecraft. This Electronics Unit card carries data downstream of the Data Processor’s formatting and packetization.', refs('comp-abi-hsio')],
  ['tnt', 'Telemetry and Timing (TNT)', 'The ABI Electronics Unit card that generates system clocks and handles instrument telemetry.', refs('comp-abi-tnt')],
  ['tdu', 'Thermal Dynamic Unit (TDU)', 'The thermomechanical portion of an ABI cryocooler: an integral cooler, a remote cold head and a transfer line. Its control electronics are a separate assembly.', refs('comp-abi-tdu', 'comp-abi-cce')],
  ['sada', 'Solar Array Drive Assembly (SADA)', 'GOES-R’s motor-driven mechanism for rotating its solar wing, with resolver circuits to measure its position. A separate slip-ring assembly transfers electrical power across the rotating joint.', refs('comp-bus-sada', 'comp-bus-slip-ring')],
  ['pru', 'Power Regulation Unit (PRU)', 'The GOES-R assembly that regulates power from the solar array and batteries to spacecraft loads. It contains modules for regulation, conversion, distribution and monitoring.', refs('comp-bus-pru')],
  ['ctp', 'Command and Telemetry Processor (CTP)', 'GOES-R’s gateway for validating received spacecraft commands and formatting health telemetry. It passes accepted commands onward to the flight-computer architecture.', refs('comp-bus-ctp')],
  ['riu', 'Remote Interface Unit (RIU)', 'A GOES-R interface between the flight computer’s data bus and distributed equipment. It routes commands and collects engineering measurements and status; the Sun Pointing Platform has a related interface unit.', refs('comp-bus-riu-siu')],
  ['csu', 'Current Sensor Unit (CSU)', 'GOES-R hardware that measures electrical feed current and produces an analog telemetry voltage. An RIU digitizes that voltage; this is a spacecraft-health measurement, separate from detector readout.', refs('comp-bus-csu')],
  ['tsu', 'Transient Suppression Unit (TSU)', 'A passive GOES-R harness interface that supplies a path for electrostatic discharge to protect susceptible circuitry. It has no command or telemetry functions of its own.', refs('comp-bus-tsu')],
  ['fpe', 'Focal Plane Electronics (FPE)', 'In TIRS-2, the electronics between the detector assemblies and their connection to the main electronics. The published design distinguishes the FPE from the focal-plane interface board.', refs('tirs-fpe')],
  ['fib', 'Focal-plane Interface Board (FIB)', 'A TIRS-2 board in the connection between the focal-plane electronics and main electronics. The published design uses selected cross-connections between redundant electronics.', refs('tirs-fpe', 'tirs-redundancy')],
  ['meb', 'Main Electronics Box (MEB)', 'The TIRS-2 assembly containing separate boards for command and data handling, power, thermal and mechanism control, and high-speed interfaces.', refs('tirs-meb')],
  ['rse', 'Redundancy Switch Electronics (RSE)', 'TIRS-2 electronics that connect the cooler-control electronics to its thermomechanical unit through the published redundant switching arrangement.', refs('tirs-cooler', 'tirs-redundancy')],
];
