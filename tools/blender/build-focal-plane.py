"""Level 4 focal-plane carrier GLB, version 1.

Run: Blender 5.2 --background --python tools/blender/build-focal-plane.py

Reuses the approved focal_plane() look geometry. The detector face is blank:
no pixel grid, format, dimensions, temperature or real-system performance is
implied. Package layout, bond/flex counts, colors and spacing are as drawn.
All coordinates are arbitrary drawing units; Three.js export is Y-up.
"""
import ast
import bpy
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
VERSION = 1
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
    if 'flex' in name: return 'FlexConnection'
    if any(term in name for term in ['cooler', 'cold finger', 'thermal strap']): return 'CoolingAssembly'
    if any(term in name for term in ['warm', 'readout', 'pcb gold']): return 'WarmReadout'
    if any(term in name for term in ['detector package', 'representative detector', 'package bond']):
        return 'DetectorPackage'
    if 'fastener' in name and obj.location.x > 1: return 'WarmReadout'
    return 'ColdCarrier'


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'NONE'
builders = load_look_builders()
builders['focal_plane'](builders['palette']())
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

root = group('GuardianFocalPlane', version=VERSION, level='focal-plane',
    representative=True, physicalScale=False, assumption='look-model',
    units='Arbitrary drawing units, not meters.',
    description='Representative blank detector package, cold carrier, thermal strap, cooler, flex and warm readout.',
    sourceGeometry='tools/blender/build-hardware-look.py: focal_plane()',
    upAxis='Y', detectorFacing='+Y', noPixelFormat=True,
    defaultCamera=[6.0, 6.0, 8.0], defaultTarget=[.48, .25, -.25])
roles = {name: group(name, root, role=name, representative=True)
         for name in ['DetectorPackage', 'ColdCarrier', 'WarmReadout', 'CoolingAssembly', 'FlexConnection']}

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
    obj['solidForCamera'] = True
    obj['assetRole'] = role

anchors = group('Anchors', root, role='Nonrendering interface anchors')
anchor_specs = {
    'AnchorArray': ((-.65, 0, .49), 'Blank representative detector entrance face'),
    'AnchorReadout': ((2.11, .29, .247), 'Warm readout cover'),
    'AnchorColdStage': ((-.65, 1.08, .18), 'Thermal strap near cold finger'),
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
