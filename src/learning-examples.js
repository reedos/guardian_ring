// Short civil application examples backed by the shared claim registry.
import { ENGINEERING_ROWS } from './engineering-evidence.js';

export const LEARNING_EXAMPLES = {
  abi: {
    title: 'Real-world application: wildfire monitoring',
    body: 'NOAA combines ABI’s visible and infrared observations into fire products that help forecasters follow changing wildfires. Instrument measurements become useful products through processing and validation.',
    href: 'https://www.star.nesdis.noaa.gov/goesr/product_land_fire.php',
    image: 'https://www.star.nesdis.noaa.gov/goesr/images/internal/Kenneth_2025009231117_w_big_legend.png',
    imageCaption: 'NOAA STAR: Kenneth Fire, January 2025. Fire products, not a raw single-band image. GOES-19 imagery is labeled pre-operational by NOAA.',
    specs: [ENGINEERING_ROWS.abiFire], claimKeys: ['learning:abi-fire'],
  },
  tirs2: {
    title: 'Real-world application: water use on farms',
    body: 'Evaporation from soil and transpiration from plants cool the land surface. Landsat thermal observations, optical data, and models help estimate evapotranspiration for water planning. TIRS-2 measures emitted radiation; the water-use estimate is a derived product.',
    href: 'https://www.nasa.gov/missions/landsat/new-landsat-infrared-instrument-ships-from-nasa/',
    specs: [ENGINEERING_ROWS.tirsWater], claimKeys: ['learning:tirs-water'],
  },
};
