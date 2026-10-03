export const MISSION_VISIT_KEY='grx-mission-visited-v1';

// A shared link, scenario choice, pane choice, hash destination, or explicit
// opt-out is more specific than the first-visit default. Storage failure falls
// back to the visible Watch button instead of replaying an intro on every visit.
export function missionEntry(href,storage) {
  const url=new URL(href),explicit=url.searchParams.get('mission')==='1';
  let seen=true;
  try {seen=storage.getItem(MISSION_VISIT_KEY)==='1';}catch{/* optional browser storage */}
  const automatic=!seen&&!url.search&&!url.hash;
  return {requested:explicit||automatic,automatic,
    remember(){try{storage.setItem(MISSION_VISIT_KEY,'1');}catch{/* optional browser storage */}},
  };
}
