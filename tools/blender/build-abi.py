"""ABI civil-instrument teaching asset, version 1.

Run: Blender 5.2 --background --python tools/blender/build-abi.py

GOES-R Series Data Book, printed 3-8 / PDF 36: four telescope mirrors form
images on three focal-plane modules. Those two counts are preserved. The
scan mirrors and complete aft optics are not reproduced. Bench layout, mirror
shapes, module packages, cooler/radiator shapes, spacing and thermal links are
representative. Coordinates are arbitrary drawing units, not dimensions.

No ray trace, spectral response, temperatures, detector format, or performance
is encoded. Runtime supplies labeled illustrative Light/Data/Heat overlays.
Only helper definitions are imported from the approved look builder; no render
or image-generation loop is executed. The GLB is exported Three.js Y-up.
"""
import ast
import math
from pathlib import Path
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
VERSION = 1
OUT.mkdir(parents=True, exist_ok=True)


def load_helpers():
    source = Path(__file__).with_name('build-hardware-look.py')
    tree = ast.parse(source.read_text(encoding='utf-8'), filename=str(source))
    definitions = [node for node in tree.body
                   if isinstance(node, (ast.Import, ast.ImportFrom, ast.FunctionDef))]
    namespace = {'__file__': str(source), '__name__': 'guardian_abi_geometry'}
    exec(compile(ast.Module(body=definitions, type_ignores=[]), str(source), 'exec'), namespace)
    return namespace


def group(name, parent=None, **metadata):
    obj = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    for key, value in metadata.items(): obj[key] = value
    return obj


def tagged(obj, role):
    obj['assetRole'] = role
    return obj


def box(role, name, pos, size, mat, bevel=.025):
    return tagged(helpers['box'](name, pos, size, mat, bevel), role)


def cylinder(role, name, pos, radius, depth, mat, axis='z', vertices=32, bevel=.008):
    return tagged(helpers['cylinder'](name, pos, radius, depth, mat, axis, vertices, bevel), role)


def link(role, name, points, radius, mat):
    obj = tagged(helpers['line'](name, points, radius, mat), role)
    obj.data.bevel_resolution = 2
    return obj


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'NONE'
helpers = load_helpers()
m = helpers['palette']()

# Open bench: enough separation to read the component roles from an oblique view.
box('OpticalBench', 'Representative ABI optical bench', (-.05, .20, .06), (7.5, 3.8, .24), m['dark'], .075)
for y in [-1.63, 2.03]:
    box('OpticalBench', 'Machined bench perimeter rail', (-.05, y, .225), (7.2, .095, .075), m['silver'], .016)
for x in [-3.66, 3.56]:
    box('OpticalBench', 'Bench end rail', (x, .20, .225), (.095, 3.56, .075), m['silver'], .016)
for x in [-3.28, -.95, 1.38, 3.22]:
    for y in [-1.36, 1.77]:
        box('OpticalBench', 'Representative mounting foot', (x, y, -.145), (.48, .36, .18), m['silver'], .027)
        cylinder('OpticalBench', 'Captive bench fastener', (x, y, .203), .045, .04, m['bright'], vertices=16, bevel=.004)

# Four separate polished surfaces, each on its own support. Curvatures and the
# alternating bench placement are chosen for legibility, not ABI prescriptions.
mirror_specs = [
    (-2.75, .55, 1.00, .60),
    (-1.60, -.68, .92, .36),
    (-.65, .72, 1.04, .44),
    (.28, -.65, .90, .30),
]
for number, (x, y, z, radius) in enumerate(mirror_specs, 1):
    box('TelescopeMirrors', f'Mirror {number} foot', (x, y+.095, .285), (radius*1.30, .36, .18), m['silver'], .021)
    box('TelescopeMirrors', f'Mirror {number} stalk', (x, y+.095, (z+.38)/2), (.10, .11, z-.38), m['dark'], .015)
    cylinder('TelescopeMirrors', f'Mirror {number} back support', (x, y+.120, z), radius*1.08, .09, m['dark'], 'y', 48)
    mirror = tagged(helpers['mirror'](f'Telescope reflective surface {number}', 0, radius, 0, .040, m['mirror']), 'TelescopeMirrors')
    mirror.location = (x, y, z)
    mirror['publishedTelescopeMirrorIndex'] = number
    mirror['shapeIsRepresentative'] = True
    # Retainer lies behind the reflective face, avoiding coincident surfaces.
    ring = tagged(helpers['ring_y'](f'Mirror {number} perimeter mount', y+.085, radius*1.13, radius*1.07, m['silver'], .045, center=(x, z)), 'TelescopeMirrors')

# Neutral, schematic aft-optics interfaces. No additional telescope mirrors or
# traced rays. Runtime may overlay VNIR/MWIR/LWIR paths on these interfaces.
for number, (x, y, angle) in enumerate([(1.04, -.23, -24), (1.29, .78, 27)], 1):
    box('BandSeparation', f'Aft-optics pedestal {number}', (x, y, .335), (.48, .44, .23), m['dark'], .034)
    frame = box('BandSeparation', f'Representative dichroic frame {number}', (x, y, .86), (.10, .59, .77), m['silver'], .022)
    plate = box('BandSeparation', f'Schematic band-separation interface {number}', (x-.065, y, .86), (.016, .47, .65), m['cyan'], .008)
    frame.rotation_euler.z = math.radians(angle)
    plate.rotation_euler.z = math.radians(angle)

# Three physically separated, blank module faces. The named modules are retained,
# but no array or pixel grid is drawn and no detector format is implied visually.
module_specs = [('VNIR', -1.03), ('MWIR', -.02), ('LWIR', .99)]
for band, y in module_specs:
    x = 2.60
    box('FocalPlaneModules', f'{band} representative module base', (x, y, .35), (1.04, .79, .28), m['dark'], .042)
    box('FocalPlaneModules', f'{band} focal-plane carrier', (x, y, .55), (.91, .67, .10), m['silver'], .023)
    box('FocalPlaneModules', f'{band} schematic cold surround', (x, y, .646), (.75, .53, .045), m['coldedge'], .017)
    face = box('FocalPlaneModules', f'{band} blank module entrance', (x, y, .705), (.63, .405, .045), m['silicon'], .011)
    face['publishedFocalPlaneModule'] = band
    face['noArrayFormat'] = True
    for offset in [-.39, .39]:
        cylinder('FocalPlaneModules', f'{band} package fastener', (x+offset, y, .615), .025, .021, m['silver'], vertices=16, bevel=.003)

# Two representative cooler bodies agree with the published redundant-cooler
# architecture, without reproducing hardware dimensions, internals or stages.
for number, x in enumerate([-2.45, -.78], 1):
    box('Cryocooler', f'Cooler {number} mounting shoe', (x, 1.53, .295), (.83, .55, .16), m['dark'], .031)
    cylinder('Cryocooler', f'Representative cooler {number}', (x, 1.53, .61), .235, .68, m['silver'], 'x', 40, .016)
    for offset in [-.245, .245]:
        cylinder('Cryocooler', f'Cooler {number} clamp', (x+offset, 1.53, .61), .254, .055, m['dark'], 'x', 32)
    cylinder('Cryocooler', f'Cooler {number} cold-head proxy', (x+.47, 1.53, .61), .125, .23, m['silver'], 'x', 32)
    link('Cryocooler', f'Cooler {number} representative transfer line', [(x+.61,1.53,.61),(x+.86,1.36,.51),(.96,1.37,.39)], .025, m['strap'])
link('Cryocooler', 'Shared representative thermal path', [(.96,1.37,.39),(1.84,1.29,.40)], .025, m['strap'])
for band, y in module_specs:
    link('Cryocooler', f'{band} schematic thermal connection', [(2.18,y,.49),(1.91,y,.49),(1.84,1.29,.40)], .022, m['strap'])

# The radiator is a recognizable rear panel; orientation, pattern and area are
# arbitrary. Separated layers avoid flush coplanar surfaces at material edges.
box('Radiator', 'Representative radiator backing', (2.22, 1.86, 1.07), (2.21, .105, 1.40), m['silver'], .044)
box('Radiator', 'Representative pale radiator face', (2.22, 1.788, 1.07), (2.06, .030, 1.25), m['white'], .020)
for x in [1.31, 1.77, 2.22, 2.67, 3.13]:
    box('Radiator', 'Schematic radiator surface division', (x, 1.761, 1.07), (.012, .009, 1.17), m['silver'], .002)
link('Cryocooler', 'Representative radiator thermal connection', [(1.84,1.29,.40),(1.45,1.56,.43),(1.45,1.79,.54)], .027, m['strap'])

for mat in bpy.data.materials:
    if not mat.use_nodes: continue
    for node in list(mat.node_tree.nodes):
        if node.type in {'TEX_NOISE', 'BUMP'}: mat.node_tree.nodes.remove(node)
for obj in bpy.context.scene.objects:
    if obj.type not in {'MESH', 'CURVE'}: continue
    for modifier in obj.modifiers:
        if modifier.type == 'BEVEL': modifier.segments = 1 if modifier.width <= .008 else 2

geometry = [obj for obj in bpy.context.scene.objects if obj.type in {'MESH', 'CURVE'}]
bpy.ops.object.select_all(action='DESELECT')
for obj in geometry: obj.select_set(True)
bpy.context.view_layer.objects.active = geometry[0]
bpy.ops.object.convert(target='MESH')

root = group('GuardianABI', version=VERSION, level='abi', representative=True,
    physicalScale=False, assumption='look-model', upAxis='Y',
    units='Arbitrary drawing units, not meters.',
    source='GOES-R Series Data Book, printed 3-8 / PDF 36; thermal roles printed 3-13–3-14 / PDF 41–42.',
    publishedTelescopeMirrorCount=4, publishedFocalPlaneModuleCount=3,
    description='Four-mirror telescope and three focal-plane modules on a representative bench. Other geometry is schematic.',
    scope='Mirror count applies to the telescope. Full scan-mirror system and optical prescription are not reproduced.',
    sourceGeometry='Shared manufactured-edge helpers from build-hardware-look.py; authored ABI teaching layout.',
    teachingRays='Omitted; runtime owns labeled illustrative overlays.',
    defaultCamera=[8.0, 7.5, 11.0], defaultTarget=[0, .70, -.10])
roles = {role: group(role, root, role=role, representative=True) for role in
         ['OpticalBench', 'TelescopeMirrors', 'BandSeparation', 'FocalPlaneModules', 'Cryocooler', 'Radiator']}

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
    obj['assetRole'] = role
    obj['representative'] = True
    obj['solidForCamera'] = True

# Nonrendering role markers keep the independently verifiable civil counts even
# after geometry is batched. Their positions are not physical dimensions.
for number, (x, y, z, radius) in enumerate(mirror_specs, 1):
    marker = group(f'TelescopeMirror{number:02}', roles['TelescopeMirrors'],
                   role='Published telescope mirror count marker', mirrorIndex=number,
                   publishedCount=True, shapeIsRepresentative=True)
    marker.location = (x, y, z)
for band, y in module_specs:
    marker = group(f'FocalPlaneModule{band}', roles['FocalPlaneModules'],
                   role='Published focal-plane module count marker', bandRegion=band,
                   publishedCount=True, noArrayFormat=True, packageIsRepresentative=True)
    marker.location = (2.60, y, .73)

anchors = group('Anchors', root, role='Nonrendering interface anchors')
anchor_specs = {
    'AnchorTelescope': ((-2.38, .51, 1.31), 'Four-mirror telescope group'),
    'AnchorBands': ((1.04, -.20, 1.28), 'Representative band-separation region'),
    'AnchorFocalPlanes': ((2.60, -.02, .755), 'Three distinct focal-plane modules'),
    'AnchorCooler': ((-.78, 1.53, .88), 'Representative cryocooler group'),
    'AnchorRadiator': ((2.22, 1.75, 1.59), 'Representative radiator'),
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
assert triangles < 40000, f'ABI geometry exceeds triangle budget: {triangles}'
assert len(batches) <= 20, f'ABI geometry exceeds batch budget: {len(batches)}'
assert len(mirror_specs) == 4 and len(module_specs) == 3

path = OUT / 'abi.glb'
bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB',
    export_yup=True, export_extras=True, export_apply=True,
    export_animations=False, export_cameras=False, export_lights=False,
    export_materials='EXPORT', export_normals=True)
print('ABI_ASSET', path, 'version', VERSION, 'bytes', path.stat().st_size,
      'triangles', triangles, 'batches', len(batches), 'radius', radius,
      'bounds', low, high, flush=True)
print('ABI_ANCHORS_Y_UP', {name: [point[0], point[2], -point[1]]
      for name, (point, role) in anchor_specs.items()}, flush=True)
