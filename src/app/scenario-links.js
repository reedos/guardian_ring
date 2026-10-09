// The pure cross-page scenario URL helper, with this site's scenario keys (logic: src/explainer-kit).
import { createScenarioLinks } from '../explainer-kit/src/scenario-links.js';
export const { SCENARIO_KEYS, withScenario } = createScenarioLinks(['orbit', 'aperture', 'band', 'detector']);
