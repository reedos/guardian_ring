"""Detailed representative infrared payload and electronics, version 7.
Blender --background --python tools/blender/build-payload.py.
The opened telescope and displaced cold/electronics assemblies show subsystem
relationships only. No military optical prescription, electronics schematic,
dimensions, part count, detector format or performance is reconstructed.
"""
import ast,bpy,math,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('detail',Path(__file__).with_name('hardware-detail.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
bpy.ops.wm.read_factory_settings(use_empty=True);m=h.palette();VERSION=7

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
h.box('Payload structural optical bench',(.70,-1.60,.15),(9.80,.18,9.10),m['dark'],.055)
for x in [-4.08,5.48]:h.box('Machined bench edge',(x,-1.48,.15),(.095,.070,8.86),m['silver'],.014)
for z in [-4.28,4.58]:h.box('Machined bench edge',(.70,-1.48,z),(9.56,.070,.095),m['silver'],.014)
for x in [-2.70,-.5,1.6,3.45]:
    for z in [-2.55,1.85]:
        h.cyl('Bench isolator mount',(x,-1.78,z),.12,.18,m['silver'],segments=20)
        h.screw((x,-1.435,z),m['edge'],r=.033)
for x in [-2.17,-.73]:
    for z in [-.67,1.90]:h.box('Telescope bench interface',(x,-1.455,z),(.43,.08,.34),m['silver'],.012)
h.box('Telescope role plate',(-1.42,-1.34,2.15),(1.66,.20,.048),m['dark'],.008)

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

h.role('Readout')
h.enclosure('Front-end readout housing',(.56,-.98,.91),(1.23,.72,1.17),m,True)
h.board('Analog front-end board',(.56,-.60,.91),(1.09,1.01),m)
for x in [.20,.55,.89]:h.box('Readout channel package',(x,-.42,.61),(.21,.085,.21),m['chip'],.012)
h.connector('Low-level signal interface',(.55,-.93,1.56),.57,m)
for z in [.60,1.12]:h.box('Readout shield partition',(.57,-.43,z),(1.01,.20,.025),m['silver'],.005)
h.box('Readout role plate',(.55,-1.04,1.526),(.82,.17,.022),m['dark'],.005)
# Gold flex physically connects the separated cold package and front end.
h.ribbon('Detector flex',[(-.64,-.33,-3.07),(-.42,-.55,-2.92),(.76,-.81,-2.74),(.97,-.91,-.20),(.32,-.62,.41)],.30,m['goldedge'])
for dx in [-.09,-.045,0,.045,.09]:h.line('Flex signal conductor',[(-.64+dx,-.315,-3.07),(-.42+dx,-.535,-2.92),(.76+dx,-.795,-2.74),(.97+dx,-.895,-.20),(.32+dx,-.605,.41)],.004,m['copper'])

h.role('Digitizer')
h.enclosure('Digitization and processing housing',(2.12,-.98,.91),(1.37,.72,1.17),m,True)
h.board('Representative conversion board',(2.12,-.60,.91),(1.22,1.01),m)
h.box('Conversion circuit package',(2.10,-.42,.84),(.42,.12,.38),m['chip'],.015)
h.box('Conversion package lid',(2.10,-.350,.84),(.33,.015,.29),m['dark'],.005)
for z in [.52,1.28]:h.connector('Data board interface',(2.11,-.50,z),.39,m)
h.box('Digitizer role plate',(2.12,-1.04,1.526),(.94,.17,.022),m['dark'],.005)
for dz in [-.05,0,.05]:h.line('Readout to digitizer harness',[(1.14,-.55,.95+dz),(1.30,-.48,1.03+dz),(1.45,-.48,1.03+dz),(1.50,-.56,.94+dz)],.010,m['loom'])

h.role('Controller')
h.enclosure('Instrument controller chassis',(1.99,-.98,-.90),(1.56,.72,1.19),m,True)
h.board('Instrument control board',(1.99,-.60,-.90),(1.42,1.04),m)
for x in [1.51,1.98,2.44]:
    h.box('Control-board card guide',(x,-.43,-1.0),(.044,.28,.74),m['silver'],.007)
    h.box('Controller daughtercard',(x,-.37,-1.0),(.026,.35,.68),m['pcb'],.004)
h.connector('Spacecraft data connector',(2.04,-.95,-.237),.56,m)
h.box('Controller role plate',(1.98,-1.03,-.257),(.99,.17,.022),m['dark'],.005)
h.line('Digitizer output loom',[(2.54,-.5,.43),(2.73,-.37,.13),(2.73,-.37,-.25),(2.48,-.47,-.40)],.026,m['loom'])
h.line('Instrument control harness',[(1.50,-.54,-.45),(.84,-.52,-.46),(.43,-.56,-.70),(-.25,-.51,-1.06)],.020,m['loom'])

h.role('Thermal')
h.cyl('Representative cooler compressor',(2.19,-.86,-2.24),.23,1.13,m['silver'],'x',32,.015)
for x in [1.74,1.91,2.08,2.25,2.42,2.59]:h.ring('Compressor housing fin',(x,-.86,-2.24),.26,.232,.026,m['dark'],'x',32)
h.cyl('Cooler cold head',(1.45,-.86,-2.24),.125,.29,m['cyan'],'x',24,.012)
for i in range(6):h.line('Thermal braid leaf',[(-.57,-.54,-3.76),(-.16,-.76,-3.40),(.35,-.76,-2.73),(1.29,-.82,-2.27+i*.014)],.013,m['copper'])
h.line('Cooler control harness',[(2.54,-.83,-2.13),(2.88,-.76,-1.87),(2.60,-.62,-1.39)],.024,m['loom'])
h.box('Heat rejection radiator support',(3.45,-.49,-1.80),(.09,1.63,1.70),m['dark'],.030)
h.box('Representative radiator face',(3.515,-.49,-1.80),(.028,1.55,1.60),m['white'],.012)
for y in [-1.11,-.87,-.63,-.39,-.15,.09]:h.box('Radiator coating segment',(3.534,y,-1.80),(.008,.012,1.48),m['silver'],.002)
for z in [-2.40,-1.20]:h.line('Warm-side heat pipe',[(2.55,-1.07,-2.24),(2.94,-1.15,z),(3.39,-.75,z)],.028,m['silver'])
h.box('Cooling role plate',(2.20,-1.22,-1.93),(.84,.16,.03),m['dark'],.006)

spec=importlib.util.spec_from_file_location('payload_expansion',Path(__file__).with_name('payload-expansion.py'))
expansion=importlib.util.module_from_spec(spec);spec.loader.exec_module(expansion)
expanded_anchors=expansion.expand(h,m)

for mat in bpy.data.materials:
    if mat.use_nodes:
        for node in list(mat.node_tree.nodes):
            if node.type in {'TEX_NOISE','BUMP'}:mat.node_tree.nodes.remove(node)
anchors={
 'AnchorOptics':[-.97,.38,-.595],'AnchorBaffles':[-1.70,.93,1.80],
 'AnchorDetector':[-1.10,-.275,-3.47],'AnchorReadout':[.55,-.34,.90],
 'AnchorDigitizer':[2.10,-.32,.84],'AnchorController':[1.99,-.12,-.90],
 'AnchorThermal':[2.14,-.58,-2.24],
}
anchors.update(expanded_anchors)
h.export(ROOT/'public/models/payload.glb','GuardianPayload',VERSION,'payload',anchors,
 'Representative civil-derived payload teaching assembly: orthogonal scan drives, four reflective telescope surfaces, focus and deployable cover, calibration examples, stationary aft optics, cold detector, sensor electronics, instrument electronics and closed cooling/control paths. Component roles follow public ABI descriptions; layout, optical prescription, packaging and counts of electronic parts are as drawn, not military hardware.')
