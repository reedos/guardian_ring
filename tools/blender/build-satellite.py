"""Level 2 satellite GLB, version 2, reusing the approved Blender look geometry.

Run: Blender 5.2 --background --python tools/blender/build-satellite.py

All geometry is representative and in arbitrary drawing units. No dimensions,
panel/cell counts, optical prescription, materials or layout describe a real
military spacecraft. Detailed geometry comes from build-hardware-look.py;
only its imports and function definitions are loaded, never its render loop.

The exported coordinate system is Three.js Y-up, with the payload opening
facing +Z. Named empty anchors have role and coordinate metadata. There are no
lights, cameras, logos, animations, operational parameters or image textures.
Material/role batches follow IF's authored-geometry-to-GLB pipeline.
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
    if 'radiator' in name: return 'Radiator'
    if 'antenna' in name or 'communications' in name: return 'Antenna'
    if any(term in name for term in ['array', 'photovoltaic', 'deployment', 'panel deployment']):
        # Curves have world-authored points and an origin at zero.
        x = obj.location.x
        if obj.type == 'CURVE':
            points = [obj.matrix_world @ point.co.to_3d()
                      for spline in obj.data.splines for point in spline.points]
            x = sum(point.x for point in points) / len(points)
        return 'SolarArrayRight' if x >= 0 else 'SolarArrayLeft'
    if any(term in name for term in ['payload', 'aperture', 'sunshade', 'recessed schematic optic']):
        return 'Payload'
    return 'Bus'


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'NONE'
builders = load_look_builders()
builders['satellite'](builders['palette']())

# Reduce only subpixel edge tessellation; large manufactured edges retain the
# approved look. Remove unsupported procedural bumps; foil wrinkles are mesh.
for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    for node in list(mat.node_tree.nodes):
        if node.type in {'TEX_NOISE', 'BUMP'}: mat.node_tree.nodes.remove(node)
for obj in bpy.context.scene.objects:
    if obj.type not in {'MESH', 'CURVE'}: continue
    obj['assetRole'] = role_for(obj)
    for modifier in obj.modifiers:
        if modifier.type == 'BEVEL' and modifier.width <= .004:
            modifier.segments = 1

# Bake authored modifiers before batching so normals and bevels survive joins.
geometry = [obj for obj in bpy.context.scene.objects if obj.type in {'MESH', 'CURVE'}]
bpy.ops.object.select_all(action='DESELECT')
for obj in geometry: obj.select_set(True)
bpy.context.view_layer.objects.active = geometry[0]
bpy.ops.object.convert(target='MESH')

root = group('GuardianSatellite', version=VERSION, level='satellite',
    representative=True, physicalScale=False, assumption='look-model',
    units='Arbitrary drawing units, not meters.',
    description='Representative bus, deployable array, radiator, communications element and shaded payload.',
    sourceGeometry='tools/blender/build-hardware-look.py: satellite()',
    upAxis='Y', payloadFacing='+Z',
    defaultCamera=[8.0, 8.0, 13.0], defaultTarget=[0.0, .30, 0.0])
roles = {name: group(name, root, role=name, representative=True)
         for name in ['Bus', 'Payload', 'SolarArrayLeft', 'SolarArrayRight', 'Antenna', 'Radiator']}

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
    'AnchorPayload': ((0, -.86, 1.50), 'Instrument opening'),
    'AnchorBus': ((0, -.81, -.10), 'Spacecraft bus'),
    'AnchorPower': ((2.65, -.035, .07), 'Representative solar array'),
    'AnchorAntenna': ((-.77, .21, 1.90), 'Representative communications element'),
    'AnchorRadiator': ((.91, 0, 0), 'Representative radiator'),
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
radius = max(point.length for point in points)
converted = [Vector((p.x, p.z, -p.y)) for p in points]
low = [min(point[i] for point in converted) for i in range(3)]
high = [max(point[i] for point in converted) for i in range(3)]
root['boundingBoxMin'] = low
root['boundingBoxMax'] = high
root['maximumDrawingRadius'] = radius
root['triangleCount'] = triangles
root['materialRoleBatches'] = len(batches)

path = OUT / 'satellite.glb'
bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB',
    export_yup=True, export_extras=True, export_apply=True,
    export_animations=False, export_cameras=False, export_lights=False,
    export_materials='EXPORT', export_normals=True)
print('SATELLITE_ASSET', path, 'version', VERSION, 'bytes', path.stat().st_size,
      'triangles', triangles, 'batches', len(batches), 'radius', radius,
      'bounds', low, high, flush=True)
