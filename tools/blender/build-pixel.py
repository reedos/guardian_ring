"""Level 5 single-pixel conceptual stack GLB, version 2.

Run: Blender 5.2 --background --python tools/blender/build-pixel.py

Reuses the approved pixel() look geometry. The exploded spacing, relative layer
thicknesses, colors and circuit regions are explanatory, not a device design or
real-sensor specification. No detector format or operational performance.
Incident-light lines and markers are omitted; runtime owns layer overlays.
Dashed alignment guides remain a separate optional teachingOverlay group.
"""
import ast
import bpy
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
VERSION = 2
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
    if 'alignment guide' in name: return 'AlignmentGuides'
    if 'output' in name: return 'OutputInterface'
    if 'carrier' in name: return 'Support'
    if 'absorber' in name: return 'Absorber'
    if 'contact metallization' in name: return 'Metallization'
    if 'indium' in name: return 'IndiumContact'
    return 'Readout'


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'NONE'
builders = load_look_builders()
builders['pixel'](builders['palette']())
m = builders['palette']()
# An abstract package interface makes the distinction between a bump connection,
# readout circuitry and the outgoing connection visible. It is not a pinout.
builders['box']('Output interface carrier',(1.53,0,.14),(.56,1.12,.13),m['pcb'],.025)
builders['box']('Output interface housing',(1.74,0,.27),(.25,.94,.15),m['dark'],.022)
for i in range(6):
    y=-.37+i*.148
    builders['box']('Output interface pad',(1.50,y,.219),(.23,.072,.012),m['trace'],.003)
    builders['line']('Output package interconnect',[(.96,y,.287),(1.18,y,.29),(1.39,y,.224)],.008,m['trace'])
for obj in list(bpy.context.scene.objects):
    if obj.name.startswith(('Illustrative incident light', 'Light-path marker')):
        bpy.data.objects.remove(obj, do_unlink=True)

for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    for node in list(mat.node_tree.nodes):
        if node.type in {'TEX_NOISE', 'BUMP'}: mat.node_tree.nodes.remove(node)
for obj in bpy.context.scene.objects:
    if obj.type not in {'MESH', 'CURVE'}: continue
    obj['assetRole'] = role_for(obj)
    for modifier in obj.modifiers:
        if modifier.type == 'BEVEL' and modifier.width <= .004: modifier.segments = 1

geometry = [obj for obj in bpy.context.scene.objects if obj.type in {'MESH', 'CURVE'}]
bpy.ops.object.select_all(action='DESELECT')
for obj in geometry: obj.select_set(True)
bpy.context.view_layer.objects.active = geometry[0]
bpy.ops.object.convert(target='MESH')

root = group('GuardianPixel', version=VERSION, level='pixel',
    representative=True, physicalScale=False, assumption='look-model',
    units='Arbitrary drawing units, not meters.',
    description='Exploded absorber, metallization, bump, readout, support and output interface; not a transistor circuit or physical dimensions.',
    sourceGeometry='tools/blender/build-hardware-look.py: pixel()',
    upAxis='Y', absorberFacing='+Y', explodedSpacing=True,
    incidentRays='Omitted; runtime owns illustrative layer overlays.',
    defaultCamera=[5.0, 5.9, 7.0], defaultTarget=[0.0, 1.38, 0.0])
roles = {name: group(name, root, role=name, representative=True,
                    physicalHardware=name != 'AlignmentGuides',
                    teachingOverlay=name == 'AlignmentGuides')
         for name in ['Absorber', 'Metallization', 'IndiumContact', 'Readout', 'Support', 'OutputInterface', 'AlignmentGuides']}
roles['AlignmentGuides']['optionalVisibility'] = True

batches = {}
for obj in list(bpy.context.scene.objects):
    if obj.type != 'MESH': continue
    key = (obj['assetRole'], tuple(mat.name for mat in obj.data.materials))
    batches.setdefault(key, []).append(obj)
for (role, names), objects in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    if len(objects) > 1: bpy.ops.object.join()
    obj = bpy.context.object
    obj.name = role + ' — ' + names[0]
    obj.parent = roles[role]
    obj['representative'] = True
    obj['solidForCamera'] = role != 'AlignmentGuides'
    obj['physicalHardware'] = role != 'AlignmentGuides'
    obj['teachingOverlay'] = role == 'AlignmentGuides'
    obj['assetRole'] = role

anchors = group('Anchors', root, role='Nonrendering interface anchors')
anchor_specs = {
    'AnchorAbsorber': ((0, 0, 2.42), 'Representative entrance face'),
    'AnchorContact': ((0, -.708, 1.82), 'Contact metallization'),
    'AnchorReadout': ((.44, .21, .326), 'Representative readout circuit region'),
    'AnchorBump': ((0, -.254, 1.10), 'Representative hybrid bump interconnect'),
    'AnchorSupport': ((0, -1.001, -.03), 'Readout substrate carrier'),
    'AnchorOutput': ((1.747, -.486, .27), 'Representative package output interface'),
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

path = OUT / 'pixel.glb'
bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB',
    export_yup=True, export_extras=True, export_apply=True,
    export_animations=False, export_cameras=False, export_lights=False,
    export_materials='EXPORT', export_normals=True)
print('PIXEL_ASSET', path, 'version', VERSION, 'bytes', path.stat().st_size,
      'triangles', triangles, 'batches', len(batches), 'radius', radius,
      'bounds', low, high, flush=True)
