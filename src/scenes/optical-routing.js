// The complete instrument drawings explain component roles; they are not
// optical prescriptions. These connections intentionally have no traveling
// light heads. Only the separate local mirror demonstrations trace rays.
export const OPTICAL_CONNECTION_NOTE = 'Dashed amber lines connect optical component roles; they are not traced rays. The separate scan-mirror demonstration shows local reflection. Packaging, angles, and playback time are illustrative.';

// Normals use each authored pivot's resting local frame. Surface offsets put
// the interaction on the exterior face, ahead of the shaft: payload-expansion.py
// uses .059 + .016 / 2; civil-detail.py uses .061 + .035 / 2. These are drawing
// coordinates, not instrument dimensions or specifications.
export const MIRROR_DEMONSTRATIONS = {
  payload: [
    {node:'PayloadScanFirst',axis:[1,0,0],normal:[.72,.22,.66],surfaceOffset:.067,range:.28,motion:'scan'},
    {node:'PayloadScanSecond',axis:[0,1,0],normal:[-.66,.10,.74],surfaceOffset:.067,range:.24,motion:'scan'},
  ],
  abi: [
    {node:'ABIScanNorthSouth',axis:[1,0,0],normal:[.64,.25,.72],surfaceOffset:.0785,range:.19,motion:'scan'},
    {node:'ABIScanEastWest',axis:[0,1,0],normal:[-.64,.45,.63],surfaceOffset:.0785,range:.17,motion:'scan'},
  ],
};

// Endpoints name reference directions in the schematic. They are not physical
// targets, observation vectors, or ray intersections on the scene-select face.
export const TIRS_REFERENCE_DIRECTIONS = {
  earth: [-4.50,1.72,3.05],
  space: [-2.35,3.75,3.05],
};

export const OPTICAL_CONNECTIONS = {
  payload: [
    {kind:'optical-connection',name:'Optical component connections',phases:['collect'],points:['AnchorScanSystem','AnchorOptics','AnchorAftOptics','AnchorDetector']},
  ],
  abi: [
    {kind:'optical-connection',name:'Earth-view component connections',phases:['collect'],exclusive:true,points:['AnchorScanSystem','AnchorTelescope','AnchorBands','AnchorFocalPlanes']},
    {kind:'optical-connection',name:'Calibration component connections',phases:['reference'],exclusive:true,points:['AnchorCalibration','AnchorScanSystem','AnchorTelescope','AnchorBands','AnchorFocalPlanes']},
  ],
  tirs2: [
    {kind:'optical-connection',name:'Earth reference direction and optical component connections',phases:['earth'],exclusive:true,start:0,points:[TIRS_REFERENCE_DIRECTIONS.earth,'AnchorSceneSelect','AnchorTelescope','AnchorFilters','AnchorArrays']},
    {kind:'optical-connection',name:'Onboard blackbody and optical component connections',phases:['blackbody'],exclusive:true,start:.28,points:['AnchorBlackbody','AnchorSceneSelect','AnchorTelescope','AnchorFilters','AnchorArrays']},
    {kind:'optical-connection',name:'Space reference direction and optical component connections',phases:['space'],exclusive:true,start:.28,points:[TIRS_REFERENCE_DIRECTIONS.space,'AnchorSceneSelect','AnchorTelescope','AnchorFilters','AnchorArrays']},
  ],
};
