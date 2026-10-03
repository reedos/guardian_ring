"""Detailed representative infrared payload and electronics, version 14.
Blender --background --python tools/blender/build-payload.py.
The opened telescope and integrated electronics units show subsystem
relationships with authored removable covers. No military optical prescription, electronics schematic,
dimensions, part count, detector format or performance is reconstructed.
"""
import ast,bpy,math,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('detail',Path(__file__).with_name('hardware-detail.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
bpy.ops.wm.read_factory_settings(use_empty=True);m=h.palette();VERSION=14

# Keep the approved reflective cutaway, then expose the rest of its signal chain.
source=Path(__file__).with_name('build-hardware-look.py');tree=ast.parse(source.read_text(encoding='utf-8'))
ns={'__file__':str(source),'__name__':'look_geometry'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef))],type_ignores=[]),str(source),'exec'),ns)
ns['payload'](ns['palette']())
for obj in list(bpy.context.scene.objects):
    name=obj.name.lower()
    if any(s in name for s in ['illustrative reflected light','detector housing','cold housing collar','readout cover']):
        bpy.data.objects.remove(obj,do_unlink=True);continue
    if obj.name.startswith(('Exposed baffle section','Machined rim edge')):
        cy=sum(v.co.y for v in obj.data.vertices)/len(obj.data.vertices)
        if abs(cy-1.18)<.001:obj.location.y-=.1
    obj.location.x-=1.45;obj.location.y-=.55
    obj['assetRole']='Optics' if 'reflective' in name or 'secondary' in name else 'Baffles' if 'baffle' in name else 'TelescopeStructure'
    for modifier in obj.modifiers:
        if modifier.type=='BEVEL':modifier.segments=1 if modifier.width<=.005 else 2

h.role('Bench')
h.box('Payload structural optical bench',(1.50,-1.60,.15),(11.40,.18,9.10),m['dark'],.055)
for x in [-4.08,7.08]:h.box('Machined bench edge',(x,-1.48,.15),(.095,.070,8.86),m['silver'],.014)
for z in [-4.28,4.58]:h.box('Machined bench edge',(1.50,-1.48,z),(11.16,.070,.095),m['silver'],.014)
for x in [-2.70,-.5,1.6,3.45,6.3]:
    for z in [-2.55,1.85]:
        h.cyl('Bench isolator mount',(x,-1.78,z),.12,.18,m['silver'],segments=20)
        h.screw((x,-1.435,z),m['edge'],r=.033)
for x in [-2.17,-.73]:
    for z in [-.67,1.90]:h.box('Telescope bench interface',(x,-1.455,z),(.43,.08,.34),m['silver'],.012)
h.box('Telescope identification bracket',(-.29,-.84,-.40),(.075,1.26,.18),m['silver'],.008)
h.box('Telescope identification stock',(-.24,-.20,-.40),(.032,.25,1.04),m['dark'],.005)

h.role('Detector')
h.box('Cold assembly support',(-1.10,-1.34,-1.97),(1.35,.16,1.20),m['silver'],.025)
for x in [-1.58,-.62]:h.box('Thermal isolation support', (x,-1.09,-1.97),(.09,.34,.78),m['dark'],.015)
h.box('Cold shield base',(-1.10,-.87,-1.97),(1.19,.10,1.06),m['black'],.018)
for x in [-1.68,-.52]:h.box('Cutaway cold shield wall',(x,-.57,-1.97),(.045,.56,1.06),m['black'],.012)
h.box('Cold shield rear wall',(-1.10,-.57,-2.48),(1.14,.56,.045),m['black'],.012)
h.box('Cold carrier plate',(-1.10,-.60,-1.97),(.98,.10,.87),m['cyan'],.026)
h.box('Detector package',(-1.10,-.49,-1.97),(.75,.090,.66),m['goldedge'],.015)
h.box('Blank representative focal plane',(-1.10,-.427,-1.97),(.64,.028,.54),m['solar'],.006)
for side in [-1,1]:
    for i in range(9):
        z=-2.19+i*.055
        h.line('Detector perimeter bond',[(-1.1+side*.315,-.405,z),(-1.1+side*.37,-.36,z),(-1.1+side*.43,-.53,z)],.004,m['goldedge'])
for x in [-1.53,-.67]:
    for z in [-2.33,-1.61]:h.screw((x,-.534,z),m['edge'],r=.023)
h.ring('Cold shield optical interface',(-1.10,-.47,-1.42),.38,.29,.055,m['silver'],'z',40)
# The cold module is displaced behind the stationary aft-optics deck for the
# cutaway. This separation is diagram spacing rather than a dimensional claim.
for obj in bpy.context.scene.objects:
    if obj.get('assetRole')=='Detector':obj.location.y+=1.50;obj.location.z+=.12

h.role('Thermal')
h.cyl('Representative cooler compressor',(4.70,-.86,-2.24),.23,1.13,m['silver'],'x',32,.015)
for x in [4.25,4.42,4.59,4.76,4.93,5.10]:h.ring('Compressor housing fin',(x,-.86,-2.24),.26,.232,.026,m['dark'],'x',32)
for x in [4.31,5.06]:
    h.box('Compressor conductive saddle',(x,-1.20,-2.24),(.20,.30,.55),m['silver'],.016)
    h.box('Compressor mounting foot',(x,-1.41,-2.24),(.39,.10,.72),m['silver'],.012)
h.cyl('Compressor transfer interface',(3.96,-.86,-2.24),.125,.29,m['silver'],'x',24,.012)
h.box('Heat rejection radiator support',(6.55,-.49,-2.13),(.09,1.63,1.72),m['dark'],.030)
h.box('Representative radiator face',(6.615,-.49,-2.13),(.028,1.55,1.62),m['white'],.012)
for y in [-1.11,-.87,-.63,-.39,-.15,.09]:h.box('Radiator coating segment',(6.634,y,-2.13),(.008,.012,1.50),m['silver'],.002)
for z in [-2.72,-1.55]:h.line('Warm-side heat pipe',[(5.06,-1.20,-2.24),(5.56,-1.40,z),(6.49,-.75,z)],.028,m['silver'])
h.box('Cooling role plate',(4.70,-.57,-2.24),(.94,.03,.24),m['dark'],.006)
# Continuous structural/thermal interfaces to the bench and radiator. These
# routes identify conductance paths, not temperature, conductance or capacity.
h.line('Instrument chassis heat pipe',[(6.36,-1.43,1.05),(6.76,-1.43,1.05),(6.76,-1.42,-1.32),(6.49,-.75,-1.55)],.025,m['silver'])
h.line('Sensor baseplate heat pipe',[(1.65,-1.43,-.30),(3.13,-1.44,-.30),(3.13,-1.43,-1.62),(5.56,-1.40,-1.55)],.025,m['silver'])
h.line('Cooler controller baseplate heat pipe',[(4.80,-1.43,-3.53),(6.22,-1.44,-3.53),(6.22,-1.42,-2.72),(6.49,-.75,-2.72)],.025,m['silver'])

spec=importlib.util.spec_from_file_location('payload_expansion',Path(__file__).with_name('payload-expansion.py'))
expansion=importlib.util.module_from_spec(spec);spec.loader.exec_module(expansion)
expanded_anchors=expansion.expand(h,m)

spec=importlib.util.spec_from_file_location('payload_electronics',Path(__file__).with_name('payload-electronics.py'))
electronics=importlib.util.module_from_spec(spec);spec.loader.exec_module(electronics)
electronics_anchors=electronics.build(h,m)
h.role('Calibration')
h.box('Calibration target left identification stock',(-3.795,-.24,-.24),(.034,.28,.82),m['dark'],.005)

for mat in bpy.data.materials:
    if mat.use_nodes:
        for node in list(mat.node_tree.nodes):
            if node.type in {'TEX_NOISE','BUMP'}:mat.node_tree.nodes.remove(node)
anchors={
 'AnchorOptics':[-.97,.38,-.595],'AnchorBaffles':[-1.70,.93,1.80],
 'AnchorDetector':[-1.10,-.275,-3.47],
 'AnchorThermal':[4.70,-.58,-2.24], 'AnchorRadiator':[6.64,-.49,-2.13],
}
anchors.update(expanded_anchors)
anchors.update(electronics_anchors)
h.export(ROOT/'public/models/payload.glb','GuardianPayload',VERSION,'payload',anchors,
 'Representative civil-derived payload teaching assembly: authored orthogonal scan-mirror pivots with fixed supports, motor and encoder housings; four reflective telescope surfaces; focus and deployable cover; calibration examples; stationary aft optics; cold detector; one closed sensor electronics enclosure; one closed common instrument electronics chassis; separate coordinated cooler-control electronics; defined bulkhead connectors; common mounting interfaces and closed cooling/control paths. Component roles follow public ABI descriptions; layout, optical prescription, packaging, motion ranges and counts of electronic parts are as drawn, not military hardware.')
