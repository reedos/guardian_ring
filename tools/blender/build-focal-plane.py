"""Level 4 focal-plane carrier GLB, version 6.

Run: Blender 5.2 --background --python tools/blender/build-focal-plane.py

Reuses the approved focal_plane() look geometry. The detector face is blank:
no pixel grid, format, dimensions, temperature or real-system performance is
implied. Package layout, bond/flex counts, colors and spacing are as drawn.
All coordinates are arbitrary drawing units; Three.js export is Y-up.
"""
import ast
import bpy
import importlib.util
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
VERSION = 6
OUT.mkdir(parents=True, exist_ok=True)


def load_look_builders():
    source = Path(__file__).with_name('build-hardware-look.py')
    tree = ast.parse(source.read_text(encoding='utf-8'), filename=str(source))
    definitions = [node for node in tree.body
                   if isinstance(node, (ast.Import, ast.ImportFrom, ast.FunctionDef))]
    namespace = {'__file__': str(source), '__name__': 'guardian_hardware_geometry'}
    exec(compile(ast.Module(body=definitions, type_ignores=[]), str(source), 'exec'), namespace)
    return namespace


def group(name, parent=None, **metadata):
    obj = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    for key, value in metadata.items(): obj[key] = value
    return obj


def role_for(obj):
    name = obj.name.lower()
    if 'shield' in name or 'cold stop' in name: return 'ColdShield'
    if 'flex' in name: return 'FlexConnection'
    if any(term in name for term in ['cooler', 'cold finger', 'thermal strap']): return 'CoolingAssembly'
    if any(term in name for term in ['warm', 'video', 'pcb gold']): return 'WarmReadout'
    if any(term in name for term in ['detector package', 'representative detector', 'package bond']):
        return 'DetectorPackage'
    if 'fastener' in name and obj.location.x > 1: return 'WarmReadout'
    return 'ColdCarrier'


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'NONE'
builders = load_look_builders()
m = builders['palette']()
builders['focal_plane'](m)
box, cylinder, line = builders['box'], builders['cylinder'], builders['line']
# Role correction: the cold ROIC belongs to the detector package. The external
# board contains representative warm video electronics, not the pixel ROIC.
for obj in list(bpy.context.scene.objects):
    if 'readout' in obj.name.lower(): obj.name = obj.name.replace('readout', 'video').replace('Readout', 'Video')
box('Detector package ROIC edge',(-.65,0,.325),(1.52,1.42,.032),m['ceramic'],.007)
# Open-sided cold enclosure. The missing front and right walls are deliberate
# cutaways so the optical surface, package perimeter and ribbon remain legible.
box('Cold shield back wall',(-.65,.83,.74),(1.88,.05,.91),m['cyan'],.014)
box('Cold shield left wall',(-1.565,.02,.74),(.05,1.57,.91),m['cyan'],.014)
for x in [-1.565,.265]:
    box('Cold stop top edge',(x,0,1.20),(.065,1.70,.05),m['dark'],.008)
for y in [-.825,.825]:
    box('Cold stop top edge',(-.65,y,1.20),(1.88,.065,.05),m['dark'],.008)
# Mounts are representative, with a clear gap below the carrier.
for x in [-1.58,.28]:
    for y in [-.82,.82]:
        cylinder('Carrier isolation standoff',(x,y,-.28),.065,.25,m['ceramic'],vertices=16)
        cylinder('Carrier mounting washer',(x,y,-.405),.115,.035,m['silver'],vertices=24)
box('Carrier structural base',(-.65,0,-.50),(2.48,2.25,.12),m['silver'],.025)
# Connector shells, strain relief and decoupling/passive packages make the
# external board legible as electronics, without a real circuit schematic.
for x in [1.47,2.66]:
    box('Warm video connector shell',(x,-.79,.16),(.18,.30,.16),m['silver'],.015)
    box('Warm video connector insert',(x,-.795,.248),(.12,.23,.023),m['dark'],.004)
    for j in range(5):
        cylinder('Warm video connector contact',(x,-.88+j*.041,.267),.012,.025,m['trace'],vertices=8,bevel=0)
for x in [1.74,2.38,2.54]:
    for j in range(6):
        y=-.53+j*.19
        box('Warm video passive body',(x,y,.105),(.075,.095,.034),m['ceramic'],.003)
        for dx in [-.043,.043]: box('Warm video passive termination',(x+dx,y,.105),(.018,.095,.034),m['silver'],.002)
for x in [.25,1.40]:
    box('Flex strain relief',(x,-.26,.345 if x<1 else .18),(.10,.74,.07),m['dark'],.009)
for y in [-.55,.03]:
    builders['fastener']((.25,y,.395),m['bright'],radius=.033)
for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    for node in list(mat.node_tree.nodes):
        if node.type in {'TEX_NOISE', 'BUMP'}: mat.node_tree.nodes.remove(node)
for obj in bpy.context.scene.objects:
    if obj.type not in {'MESH', 'CURVE'}: continue
    obj['assetRole'] = role_for(obj)
    for modifier in obj.modifiers:
        if modifier.type == 'BEVEL' and modifier.width <= .004: modifier.segments = 1

# Explicit warm timing/bias and cryocooler-control assemblies complete the
# interfaces around the detector. Public ABI roles support these names; the
# card arrangement, component packages, harness construction and counts remain
# representative. This is not an electrical schematic or ABI hardware replica.
spec=importlib.util.spec_from_file_location('detail',Path(__file__).with_name('hardware-detail.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
hm=h.palette()
spec=importlib.util.spec_from_file_location('payload_expansion',Path(__file__).with_name('payload-expansion.py'))
expansion=importlib.util.module_from_spec(spec);spec.loader.exec_module(expansion)
h.role('BiasTiming')
h.enclosure('Warm bias and timing tray',(2.04,.03,1.78),(1.80,.29,1.16),hm,True)
expansion.card(h,hm,'Readout bias and timing',(2.04,.195,1.78),(1.62,.94),'clock')
for x in [1.47,1.72,1.97,2.22]:
    h.box('Representative bias regulator',(x,.28,1.45),(.14,.070,.12),hm['chip'],.006)
    h.line('Bias routing',[(x,.219,1.38),(x,.219,1.26),(x+.11,.219,1.26)],.004,hm['copper'])
h.connector('Bias and timing output',(1.44,.25,1.83),.32,hm)
h.line('Timing to video harness',[(2.61,.26,1.30),(2.84,.26,1.15),(2.82,.25,.47),(2.67,.21,.33)],.023,hm['loom'])
h.line('Bias and timing to detector flex',[(1.44,.25,1.91),(1.20,.35,1.80),(.84,.35,1.07),(.83,.30,.59)],.020,hm['loom'])

h.role('ThermalFeedback')
h.enclosure('Cryocooler control electronics tray',(2.13,.07,-2.62),(1.90,.33,1.21),hm,True)
expansion.card(h,hm,'Cold-head control electronics',(2.13,.27,-2.62),(1.70,1.01),'drive')
h.box('Cold-head resistance thermometer',(-.64,.263,-1.00),(.17,.035,.11),hm['edge'],.004)
for dx in [-.034,.034]:h.line('Thermometer lead',[(-.64+dx,.285,-1.0),(-.50+dx,.30,-1.17),(-.13+dx,.28,-1.66),(.41+dx,.28,-1.91),(1.40+dx,.34,-2.33)],.008,hm['copper'])
h.line('Cooler power-amplifier cable',[(1.42,.31,-2.80),(1.08,.25,-2.45),(.95,.21,-1.89),(.97,.20,-1.38)],.031,hm['loom'])
h.line('Warm control heat path',[(2.86,.07,-2.63),(3.16,.06,-2.63),(3.18,.06,-1.90)],.030,hm['silver'])
h.box('Control-board heat-rejection interface',(3.20,.03,-1.92),(.17,.25,.43),hm['silver'],.015)
h.box('Cooler controller rear identification stock',(2.13,.12,-3.26),(1.65,.23,.025),hm['dark'],.005)

h.role('WarmReadout')
# Distinct package leads, service connectors and a shield frame make the warm
# video board legible without inventing a signal-chain specification.
for side in [-1,1]:
    for i in range(8):
        h.box('Video package terminal',(2.11+side*.35,.137,-.29+(i-3.5)*.068),(.058,.022,.019),hm['goldedge'],.002)
for x in [1.38,2.69]:h.box('Warm video shield rail',(x,.29,-.1),(.04,.23,1.66),hm['silver'],.008)
for z in [-.92,.72]:h.box('Warm video shield end',(2.04,.28,z),(1.23,.20,.038),hm['silver'],.008)
for x in [1.43,2.66]:
    for z in [-.94,.74]:h.screw((x,.42,z),hm['edge'],r=.027)

geometry = [obj for obj in bpy.context.scene.objects if obj.type in {'MESH', 'CURVE'}]
# Keep cold-end thermal hardware distinct from warm housings/controllers in
# teaching colors. Parent component roles, geometry and anchors stay unchanged.
for obj in geometry:
    name = obj.name.lower()
    if 'cold finger' in name or 'thermal strap' in name:
        obj['thermalSubrole'] = 'ColdFingerAndStrap'
    elif 'cold-head resistance thermometer' in name:
        obj['thermalSubrole'] = 'ColdHeadThermometer'
bpy.ops.object.select_all(action='DESELECT')
for obj in geometry: obj.select_set(True)
bpy.context.view_layer.objects.active = geometry[0]
bpy.ops.object.convert(target='MESH')

root = group('GuardianFocalPlane', version=VERSION, level='focal-plane',
    representative=True, physicalScale=False, assumption='look-model',
    units='Arbitrary drawing units, not meters.',
    description='Open cold shield, detector/ROIC package, isolated carrier, thermal strap, cooler, flex, warm video electronics, bias/timing board and separate cold-head thermometer feedback to cryocooler control electronics. Civil ABI component roles; packaging and layout as drawn.',
    sourceGeometry='tools/blender/build-focal-plane.py and build-hardware-look.py: focal_plane()',
    upAxis='Y', detectorFacing='+Y', noPixelFormat=True,
    defaultCamera=[6.0, 6.0, 8.0], defaultTarget=[.48, .25, -.25])
roles = {name: group(name, root, role=name, representative=True)
         for name in ['DetectorPackage', 'ColdCarrier', 'ColdShield', 'WarmReadout', 'CoolingAssembly', 'FlexConnection', 'BiasTiming', 'ThermalFeedback']}
thermal_roles = {
    'ColdFingerAndStrap': group('ColdFingerAndStrap', roles['CoolingAssembly'], representative=True),
    'ColdHeadThermometer': group('ColdHeadThermometer', roles['ThermalFeedback'], representative=True),
}

batches = {}
for obj in list(bpy.context.scene.objects):
    if obj.type != 'MESH': continue
    key = (obj['assetRole'], tuple(mat.name for mat in obj.data.materials), obj.get('thermalSubrole', ''))
    batches.setdefault(key, []).append(obj)
for (role, names, thermal_role), objects in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1: bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = role + ' — ' + names[0]
    obj.parent = thermal_roles[thermal_role] if thermal_role else roles[role]
    obj['representative'] = True
    obj['solidForCamera'] = True
    obj['assetRole'] = role

anchors = group('Anchors', root, role='Nonrendering interface anchors')
anchor_specs = {
    'AnchorArray': ((-.65, 0, .49), 'Blank representative detector entrance face'),
    'AnchorReadout': ((2.11, .29, .247), 'Warm readout cover'),
    'AnchorColdStage': ((-.65, 1.08, .18), 'Thermal strap near cold finger'),
    'AnchorShield': ((-.65, .805, .88), 'Cutaway cold optical enclosure'),
    'AnchorFlex': ((.84, -.26, .07), 'Representative package ribbon interconnect'),
    'AnchorCarrier': ((-.65, -.96, -.43), 'Carrier and supporting standoffs'),
    'AnchorBiasTiming': ((2.04,-1.78,.42), 'Separate warm bias and timing electronics'),
    'AnchorThermalFeedback': ((2.13,2.62,.49), 'Cold-head thermometer feedback to separate cryocooler control electronics'),
}
for name, (point, role) in anchor_specs.items():
    anchor = group(name, anchors, role=role, representative=True,
                   threePosition=[point[0], point[2], -point[1]])
    anchor.location = point

bpy.context.view_layer.update()
points = [obj.matrix_world @ vertex.co for obj in bpy.context.scene.objects
          if obj.type == 'MESH' for vertex in obj.data.vertices]
triangles = 0
for obj in bpy.context.scene.objects:
    if obj.type != 'MESH': continue
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
converted = [Vector((p.x, p.z, -p.y)) for p in points]
low = [min(point[i] for point in converted) for i in range(3)]
high = [max(point[i] for point in converted) for i in range(3)]
radius = max(point.length for point in points)
root['boundingBoxMin'] = low
root['boundingBoxMax'] = high
root['maximumDrawingRadius'] = radius
root['triangleCount'] = triangles
root['materialRoleBatches'] = len(batches)

path = OUT / 'focal-plane.glb'
bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB',
    export_yup=True, export_extras=True, export_apply=True,
    export_animations=False, export_cameras=False, export_lights=False,
    export_materials='EXPORT', export_normals=True)
print('FOCAL_PLANE_ASSET', path, 'version', VERSION, 'bytes', path.stat().st_size,
      'triangles', triangles, 'batches', len(batches), 'radius', radius,
      'bounds', low, high, flush=True)
