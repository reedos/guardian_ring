# Spacecraft detail revision

10/01/2026. Reed's review identified missing spacecraft engineering and explorer controls. The earlier release had functioning scenes but only three selectable components per layer in the spacecraft, payload, and focal-plane views. Passing its gates did not establish sufficient content depth.

## Engineering and evidence

- Spacecraft: twelve components per layer, covering the instrument, structural bus, solar cells and strings, deployment/drive hardware, regulation/distribution, batteries, attitude sensors, reaction wheels, propulsion, flight computer, communications, and radiators.
- Payload: seven components per layer, covering optics, baffles, detector, readout/video electronics, digitization and packet handling, command/timing electronics, and cooling.
- Focal plane: six components per layer, distinguishing the detector/ROIC assembly, warm video board, cold stage, cold optical enclosure, interconnect, and carrier.
- ABI's Data cards now explain its electronics architecture. The story adds linked power, pointing, thermal, and signal-path diagrams; the glossary defines spacecraft services and electronics interfaces.

The engineering review adds 51 facts from the directly inspected GOES-R Data Book and three directly opened NASA references. The research ledger now contains 85 admitted facts. `spacecraft-review.md` records passages and scope; `verified-facts.json` is generated from all three research clusters. Published bus voltages and array-circuit numbers belong explicitly to GOES-R. Generic geometry does not inherit them.

Independent review checked the new prose against the cited passages and corrected FPA/FPM terminology, the separation between Sensor Unit Electronics and Electronics Unit packet processing, torque wording, and story destinations. The generic vehicle still has no inferred military performance, wiring specification, bus voltage, battery capacity, or propulsion rating.

## Geometry and interaction

The spacecraft and payload are rebuilt as open teaching assemblies with individually inspectable equipment, circuit boards, mechanisms, wiring, thermal links, and manufactured detail. The focal-plane model adds a cutaway cold enclosure, carrier standoffs, detector/ROIC edge, connector detail, and warm video electronics. Printed component-role labels use the same adapter as Intelligence Factory. All authored hardware is reproducible from Blender scripts; rebuilt GLBs have matching incremented runtime version keys.

Story stills for those three levels are rendered from the shipped GLBs, keeping the static and interactive drawings consistent. Shapes, repeated cell/component counts, layer spacing, and interconnects are representative.

The persistent parts selector includes Overview and follows the selected level/layer. Previous/next wrap through parts; direct selection reveals its card. Present and Hide/Show Details restore IF affordances. Manual navigation stops auto-cycle, while reading an evidence dialog holds its clock. Full introductory text is available with Read Overview.

Shared Overview links restore the unselected view and camera on reload. Scenario rebuilds release their printed-label textures while retaining shared imported maps; a unit regression and the full scenario sweep check this resource lifetime.

The denser spacecraft also exposed a gap in the camera planner: avoiding a camera collision did not prevent nearby panels from filling the view during a move. The revision brings over IF's distance-scaled movement and forward-view margins, checks the same constrained poses that OrbitControls plays, and improves the propulsion and array-drive closeup angles.

## Acceptance

The final production-build results are recorded separately in `gate-results.md`. Acceptance requires all existing browser gates on a real GPU, including every scenario, every part, and every ordered pair of camera destinations on desktop and phone. UI checks now exercise parts-selector synchronization, Overview, presentation restoration, evidence dwell, long part lists, and a narrow 320-pixel layout. Screenshots are inspected in addition to automated overlap checks.

Noindex remains enabled. The review link stays out of the public README, repository homepage field, portfolio, and sitemap.
