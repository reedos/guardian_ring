"""Level 3 payload GLB, version 2, from the approved Blender look cutaway.

Run: Blender 5.2 --background --python tools/blender/build-payload.py

Representative hardware, arbitrary drawing units, no real optical prescription
or sensor performance. The shell opening and spacing are explanatory choices.
The original amber teaching rays are omitted; runtime owns layer overlays.
Only definitions are loaded from the shared look builder, never its render loop.
Three.js Y-up: aperture faces +Z, cutaway opens toward +X and +Y.
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
    if any(term in name for term in ['reflective surface', 'secondary mount', 'secondary support']):
        return 'ReflectiveOptics'
    if any(term in name for term in ['detector housing', 'cold housing']): return 'DetectorHousing'
    if 'readout' in name: return 'ReadoutCover'
    if any(term in name for term in ['support rail', 'foot mount', 'fastener']): return 'SupportStructure'
    return 'TelescopeBarrel'


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'NONE'
builders = load_look_builders()
builders['payload'](builders['palette']())
for obj in list(bpy.context.scene.objects):
    if 'Illustrative reflected light path' in obj.name:
        bpy.data.objects.remove(obj, do_unlink=True)

# In the still geometry the rear baffle at y=1.18 has a front face at 1.15,
# exactly the mirror-mount front face (1.20 - .10/2), over radii .98..1.04.
# Place that baffle and its rim forward as a distinct assembly. Its new rear
# face is 1.11, leaving a genuine drawing-space gap before the mount at 1.15.
for obj in bpy.context.scene.objects:
    if not obj.name.startswith(('Exposed baffle section', 'Machined rim edge')): continue
    center_y = sum(vertex.co.y for vertex in obj.data.vertices) / len(obj.data.vertices)
    if abs(center_y - 1.18) < .001: obj.location.y -= .10

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

root = group('GuardianPayload', version=VERSION, level='payload',
    representative=True, physicalScale=False, assumption='look-model',
    units='Arbitrary drawing units, not meters.',
    description='Representative reflective payload cutaway; no optical prescription or operational sensor parameters.',
    sourceGeometry='tools/blender/build-hardware-look.py: payload()',
    upAxis='Y', apertureFacing='+Z', cutawayOpening='+X,+Y',
    teachingRays='Omitted; runtime owns illustrative layer overlays.',
    defaultCamera=[5.0, 5.0, 7.0], defaultTarget=[0.0, -.02, 0.0])
roles = {name: group(name, root, role=name, representative=True)
         for name in ['TelescopeBarrel', 'ReflectiveOptics', 'DetectorHousing', 'ReadoutCover', 'SupportStructure']}

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
    'AnchorOptics': ((.48, 1.145, .38), 'Exposed representative primary mirror'),
    'AnchorDetector': ((0, 1.70, .28), 'Representative detector housing'),
    'AnchorThermal': ((.47, 1.70, .10), 'Readout cover beside cold housing'),
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

path = OUT / 'payload.glb'
bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB',
    export_yup=True, export_extras=True, export_apply=True,
    export_animations=False, export_cameras=False, export_lights=False,
    export_materials='EXPORT', export_normals=True)
print('PAYLOAD_ASSET', path, 'version', VERSION, 'bytes', path.stat().st_size,
      'triangles', triangles, 'batches', len(batches), 'radius', radius,
      'bounds', low, high, flush=True)
