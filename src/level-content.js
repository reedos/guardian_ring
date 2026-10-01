// Level 1 cards. Orbit values and architecture statements come from the reviewed
// fact ledger. Calculated outputs are added only after the model contract is set.
const asDrawn = () => ['Drawing', 'Representative / not to scale', 'assumed', { assume: 'look-model' }];

export function orbitsContent(model) {
  return {
    intro: 'A geostationary orbit keeps a satellite above the same longitude. Follow the light, data, and heat paths through a schematic view of Earth and its orbit families.',
    scale: 'Earth and orbit families · schematic scale',
    light: [
      {
        id: 'geo', title: 'Stay with Earth’s rotation', kicker: 'Geostationary orbit', drill: 1,
        body: 'A geostationary satellite follows a circular orbit over the equator, moving in the same direction and with the same period as Earth’s rotation. It stays above the same point on the ground. The satellite markers are representative.',
        specs: [
          ['Geostationary altitude', '35,786 km', 'reported', { refs: [['noaa-geo-definition', 'Definition paragraph']] }],
          ['Geosynchronous period', '23 h 56 min 4 s', 'reported', { refs: [['nasa-orbit-catalog', 'Introductory altitude-and-period example']] }],
          asDrawn(),
        ],
      },
      {
        id: 'earth', title: 'Choose the frame of reference', kicker: 'Earth and orbit together',
        body: 'In a view fixed relative to distant stars, Earth and a geostationary satellite turn together. In an Earth-fixed view, both hold their positions. The Earth, spacecraft, and orbit spacing are drawn at different scales to keep the relationships legible.',
        specs: [asDrawn()],
      },
      {
        id: 'orbit-families', title: 'Read the orbit families', kicker: 'Public architecture',
        body: 'The public description of SBIRS includes geosynchronous and highly elliptical orbits. The drawn orbit families introduce their different shapes. Spacecraft counts and positions are illustrative, with no operational coverage represented.',
        specs: [
          ['SBIRS orbit families', 'GEO and HEO', 'reported', { refs: [['gao-21-105249', 'Printed p. 4 (PDF p. 8), first paragraph; corroborated in GAO-26 Table 1.']] }],
          asDrawn(),
        ],
      },
    ],
    data: [
      {
        id: 'processing', title: 'From observation to data', kicker: 'Separate component roles',
        body: 'Architectures differ in where processing happens. GAO’s public PWSA description identifies an infrared payload, an on-board mission processor, and communications equipment. The drawing distinguishes these roles without describing their internal algorithms.',
        specs: [
          ['Public architecture', 'Bus, infrared payload, mission processor, communications', 'reported', { refs: [['gao-26-107085', 'PWSA-Enabling Technologies and Processes, opening description.']] }],
          asDrawn(),
        ],
      },
      {
        id: 'downlink', title: 'Let the signal travel', kicker: 'Propagation is one part of the path',
        body: 'One-way travel time through vacuum is distance divided by the speed of light. It is a propagation lower bound for a link. Processing, routing, and other delays are separate, so a light-time calculation is not a system’s warning latency.',
        specs: [model.claims.lightTimeSeconds, model.claims.slantRangeKm, asDrawn()],
      },
      {
        id: 'ground', title: 'Bring the data to the ground', kicker: 'A public architectural role', drill: 6,
        body: 'GAO’s public description of the planned FORGE ground system assigns it spacecraft-operations and mission-data-processing roles. This ground marker stands for the receiving and processing segment, with no facility layout or operational algorithms represented.',
        specs: [
          ['FORGE role', 'Spacecraft operations and mission-data processing', 'reported', { refs: [['gao-21-105249', 'Printed p. 1 (PDF p. 5), opening paragraph; printed p. 8 (PDF p. 12), acquisition-strategy paragraph.']] }],
          asDrawn(),
        ],
      },
    ],
    heat: [
      {
        id: 'sunlight', title: 'Start with sunlight', kicker: 'An external energy input',
        body: 'Sunlight brings energy to the spacecraft. The lit side and the incoming rays establish that relationship in the drawing. They are orientation cues rather than a calculation of illumination, eclipse timing, or heating.',
        specs: [asDrawn()],
      },
      {
        id: 'power', title: 'Turn light into electrical power', kicker: 'The solar-array role',
        body: 'Solar arrays convert sunlight into electrical power for the spacecraft and its instruments. Electronics also produce heat during operation. The displayed paths separate electrical supply from heat flow without assigning an operating power budget.',
        specs: [asDrawn()],
      },
      {
        id: 'radiator', title: 'Radiate heat to space', kicker: 'The thermal path',
        body: 'A radiator releases heat as thermal radiation. The outgoing paths represent heat leaving the spacecraft. Their appearance does not specify radiator area, heat-rejection power, or instrument temperature.',
        specs: [asDrawn()],
      },
    ],
  };
}
