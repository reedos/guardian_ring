"""Level 1 authored GLB, version 2. No operational constellation is represented.

Run: Blender 5.2 --background --python tools/blender/build-orbits.py

This follows IF's Blender geometry/export pipeline. All drawing coordinates,
family counts, inclinations, slots, proxy sizes and atmospheric thickness are
illustrative, not orbit-engine outputs or real-system specifications. Distances
are compressed to keep the nested architecture legible. NASA historical texture
provenance is in research/look-assets.md and THIRD_PARTY_NOTICES.md.

glTF/Three.js hierarchy (Y-up): GuardianRingAsset / EarthSpin / earth,
Atmosphere, GEOFamily / geo-orbit and GEO_Satellite_01 ... . EarthSpin is the
only rotation needed for an inertial-view day: Earth and GEO satellites rotate
together, preserving every drawn sub-satellite longitude. HEOFamily, MEOFamily,
and LEOFamily are independent root children for visibility toggles.

No lights, cameras, runtime animation, coverage cones or physical calculations
are exported. Reload every rebuild with a bumped earth-orbits.glb?v=N key.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
TEXTURES = ROOT / 'research' / 'look' / 'textures'
VERSION = 2
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
SCENE = bpy.context.scene
SCENE.unit_settings.system = 'NONE'


def group(name, parent=None, **metadata):
    obj = bpy.data.objects.new(name, None)
    SCENE.collection.objects.link(obj)
    if parent: obj.parent = parent
    for key, value in metadata.items(): obj[key] = value
    return obj


ROOT_NODE = group('GuardianRingAsset', version=VERSION, level='orbits',
    representative=True, physicalScale=False, earthDrawingRadius=1.0,
    geoDrawingRadius=2.5, maximumDrawingRadius=3.5,
    assumption='look-model',
    description='Schematic orbit architecture; distances compressed, proxies enlarged; count and slots are as drawn.',
    credits='NASA Earth Observatory; Blue Marble: Reto Stockli. Black Marble: Joshua Stevens, using Suomi NPP VIIRS data from Miguel Roman, NASA GSFC.')
EARTH_SPIN = group('EarthSpin', ROOT_NODE, role='shared-earth-and-geo-motion',
    runtimeAxis='Y', motion='Rotate this group for inertial-view days; do not rotate earth separately.',
    period='No period encoded; runtime chooses illustrative playback speed.')
GEO = group('GEOFamily', EARTH_SPIN, orbitFamily='geo', representative=True,
    relationship='All GEO proxies share EarthSpin, keeping drawn ground longitudes fixed.',
    countIsIllustrative=True, radiusIsCompressed=True)
HEO = group('HEOFamily', ROOT_NODE, orbitFamily='heo', representative=True,
    countIsIllustrative=True, curveIsCompressed=True)
MEO = group('MEOFamily', ROOT_NODE, orbitFamily='meo', representative=True,
    countIsIllustrative=True, radiusIsCompressed=True)
LEO = group('LEOFamily', ROOT_NODE, orbitFamily='leo', representative=True,
    countIsIllustrative=True, radiusIsCompressed=True)


def material(name, color, metal=0, rough=.45, emission=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*color, 1)
    p = mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    if emission:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = emission
    return mat


def derivative(filename, name, night=False):
    """CPU resampling/color adjustment; the original research images are untouched."""
    image = bpy.data.images.load(str(TEXTURES / filename), check_existing=False)
    image.name = name
    image.scale(2048, 1024)
    pixels = np.empty(2048 * 1024 * 4, dtype=np.float32)
    image.pixels.foreach_get(pixels)
    rgba = pixels.reshape((-1, 4))
    if night:
        # Isolate the warm light highlights from the source's blue background.
        # This color-based art adjustment is explicitly not radiometry.
        luminance = rgba[:, 0] * .2126 + rgba[:, 1] * .7152 + rgba[:, 2] * .0722
        warm = np.minimum(rgba[:, 0], rgba[:, 1]) - rgba[:, 2]
        lights = np.clip(np.maximum((warm - .002) * 3, (luminance - .35) * 1.5), 0, 1)
        rgba[:, 0] = lights
        rgba[:, 1] = lights * .64
        rgba[:, 2] = lights * .25
    else:
        rgba[:, :3] *= np.array([.54, .68, .82], dtype=np.float32)
    rgba[:, 3] = 1
    image.pixels.foreach_set(pixels)
    image.update()
    image.pack()
    image['source'] = 'NASA Earth Observatory'
    image['historicalComposite'] = '2016' if night else '01/2004'
    image['adjustment'] = '2K resampling; stylized emission' if night else '2K resampling; blue-gray color adjustment'
    return image


def earth_material():
    mat = material('NASA historical Earth — color-adjusted', (1, 1, 1), 0, .86)
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    p = nodes.get('Principled BSDF')
    p.inputs['Specular IOR Level'].default_value = .14
    day = nodes.new('ShaderNodeTexImage')
    day.image = derivative('nasa-blue-marble-january-2004.jpg', 'NASA_BlueMarble_2004_2K')
    night = nodes.new('ShaderNodeTexImage')
    night.image = derivative('nasa-black-marble-2016.jpg', 'NASA_BlackMarble_2016_2K', night=True)
    links.new(day.outputs['Color'], p.inputs['Base Color'])
    links.new(night.outputs['Color'], p.inputs['Emission Color'])
    p.inputs['Emission Strength'].default_value = 2.0
    mat['nightMap'] = 'Stylized historical city-light emission. Runtime may apply a sun-normal mask.'
    return mat


def sphere(name, radius, mat, parent, segments=128, rings=64, inverted=False):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius)
    obj = bpy.context.object
    obj.name = name
    obj.parent = parent
    obj.data.materials.append(mat)
    for face in obj.data.polygons: face.use_smooth = True
    if inverted:
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.mesh.flip_normals()
        bpy.ops.object.mode_set(mode='OBJECT')
        mat.use_backface_culling = True
    return obj


earth = sphere('earth', 1.0, earth_material(), EARTH_SPIN)
earth['role'] = 'earth'
earth['drawingRadius'] = 1.0
earth['solidForCamera'] = True
earth['sourceImages'] = 'NASA Blue Marble 01/2004 and Black Marble 2016; historical, color-adjusted'
earth['motion'] = 'Inherit EarthSpin; no independent rotation.'
atmosphere = sphere('Atmosphere', 1.012,
    material('Atmospheric limb — thickness exaggerated', (.014, .10, .25), 0, 1, 1.5),
    EARTH_SPIN, segments=96, rings=48, inverted=True)
atmosphere['role'] = 'schematic-atmospheric-limb'
atmosphere['solidForCamera'] = False
atmosphere['physicalThickness'] = False


def curve(name, points, mat, parent, radius=.0022):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 1
    data.bevel_depth = radius
    data.bevel_resolution = 1
    spline = data.splines.new('POLY')
    spline.points.add(len(points)-1)
    for point, position in zip(spline.points, points): point.co = (*position, 1)
    spline.use_cyclic_u = True
    obj = bpy.data.objects.new(name, data)
    SCENE.collection.objects.link(obj)
    obj.parent = parent
    data.materials.append(mat)
    obj['role'] = 'schematic-orbit-guide'
    obj['solidForCamera'] = False
    return obj


GOLD = material('Representative proxy thermal blanket', (.53, .32, .10), .38, .39)
DARK = material('Representative proxy bus', (.055, .078, .10), .38, .40)
SOLAR = material('Representative proxy solar surface', (.018, .060, .12), .25, .36)
TRIM = material('Representative proxy structure', (.28, .38, .47), .55, .36)


def proxy_mesh():
    """One shared mesh with four material slots; all proxies link the same data."""
    verts, faces, slots = [], [], []
    def add_box(pos, size, material_index):
        start = len(verts)
        verts.extend([(pos[0]+x*size[0]/2, pos[1]+y*size[1]/2, pos[2]+z*size[2]/2)
                      for z in [-1, 1] for y in [-1, 1] for x in [-1, 1]])
        faces.extend([tuple(start+i for i in face) for face in
            [(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]])
        slots.extend([material_index]*6)
    add_box((0, 0, 0), (.078, .068, .087), 0)
    add_box((0, -.039, 0), (.072, .011, .075), 1)
    for side in [-1,1]:
        add_box((side*.063, 0, 0), (.080, .010, .013), 3)
        add_box((side*.135, 0, 0), (.130, .012, .078), 2)
        for offset in [-.031, .031]:
            add_box((side*.135+offset, -.007, 0), (.002, .002, .075), 3)
    add_box((0, -.006, .057), (.038, .040, .027), 3)
    mesh = bpy.data.meshes.new('Shared schematic spacecraft proxy')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for mat in [DARK, GOLD, SOLAR, TRIM]: mesh.materials.append(mat)
    for face, slot in zip(mesh.polygons, slots): face.material_index = slot
    return mesh


PROXY = proxy_mesh()


def satellite(name, position, parent, scale=1):
    root = group(name, parent, role='representative-satellite', orbitFamily=parent['orbitFamily'],
        solidForCamera=False, realSlot=False, enlarged=True)
    root.location = position
    # Drawing proxy points toward Earth; the array orientation is illustrative.
    root.rotation_euler = (-Vector(position)).to_track_quat('-Y', 'Z').to_euler()
    root.scale = (scale, scale, scale)
    obj = bpy.data.objects.new(name + '_hardware', PROXY)
    SCENE.collection.objects.link(obj)
    obj.parent = root
    obj['solidForCamera'] = False
    return root


def circle(radius, inclination=0, longitude=0):
    points = []
    for i in range(240):
        phase = i*math.tau/240
        x, y, z = radius*math.cos(phase), radius*math.sin(phase)*math.cos(inclination), radius*math.sin(phase)*math.sin(inclination)
        points.append((x*math.cos(longitude)-y*math.sin(longitude), x*math.sin(longitude)+y*math.cos(longitude), z))
    return points


geo_path = circle(2.5)
curve('geo-orbit', geo_path, material('GEO guide amber', (.78, .45, .19), 0, .85, 1.25), GEO, radius=.003)
for i, degrees in enumerate([16, 88, 160, 232, 304]):
    angle = math.radians(degrees)
    node = satellite(f'GEO_Satellite_{i+1:02d}', (2.5*math.cos(angle), 2.5*math.sin(angle), 0), GEO)
    node['groundLongitudeIsIllustrative'] = True


heo_mat = material('HEO guide slate blue', (.15, .31, .43), 0, 1, .55)
for i, angle in enumerate([-.52, .90]):
    points = []
    # Compressed ellipse with Earth at one focus. Perigee stays outside Earth.
    # These arbitrary drawing units do not encode Molniya parameters.
    a, eccentricity = 2.2, .5
    b, focal_offset = a*math.sqrt(1-eccentricity**2), a*eccentricity
    for j in range(240):
        phase = j*math.tau/240
        lateral, height = b*math.cos(phase), a*math.sin(phase)+focal_offset
        points.append((lateral*math.cos(angle), lateral*math.sin(angle), height))
    curve(f'heo-orbit-{i+1:02d}', points, heo_mat, HEO)
    satellite(f'HEO_Satellite_{i+1:02d}', points[51+i*7], HEO, scale=.65)


meo_mat = material('MEO guide muted green', (.18, .33, .26), 0, 1, .5)
for i, longitude in enumerate([-.40, 1.12]):
    points = circle(1.83, math.radians(51), longitude)
    curve(f'meo-orbit-{i+1:02d}', points, meo_mat, MEO)
    satellite(f'MEO_Satellite_{i+1:02d}', points[21+i*87], MEO, scale=.50)


leo_mat = material('LEO guide pale blue', (.14, .28, .37), 0, 1, .55)
for i, longitude in enumerate([-.48, .64, 1.75]):
    points = circle(1.20, math.radians(74), longitude)
    curve(f'leo-orbit-{i+1:02d}', points, leo_mat, LEO, radius=.0018)
    satellite(f'LEO_Satellite_{i+1:02d}', points[15+i*64], LEO, scale=.33)


# Convert all orbit curves into authored GLB mesh geometry, as in IF's pipeline.
for obj in list(SCENE.objects):
    if obj.type != 'CURVE': continue
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target='MESH')
    for face in obj.data.polygons: face.use_smooth = True

bpy.context.view_layer.update()
maximum_radius = 0
triangles = 0
for obj in SCENE.objects:
    if obj.type != 'MESH': continue
    for vertex in obj.data.vertices:
        maximum_radius = max(maximum_radius, (obj.matrix_world @ vertex.co).length)
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
assert maximum_radius <= 3.5, f'Drawing exceeds agreed radius: {maximum_radius}'
ROOT_NODE['actualMaximumDrawingRadius'] = round(maximum_radius, 6)
ROOT_NODE['triangleCountIncludingProxyInstances'] = triangles
ROOT_NODE['embeddedTextureSize'] = '2048 x 1024 each; sRGB JPEG derivatives of credited historical NASA maps'

destination = OUT / 'earth-orbits.glb'
bpy.ops.export_scene.gltf(filepath=str(destination), export_format='GLB',
    export_extras=True, export_yup=True, export_animations=False,
    export_cameras=False, export_lights=False, export_image_format='JPEG',
    export_jpeg_quality=88, export_texcoords=True, export_normals=True,
    export_materials='EXPORT')
print('ORBIT_ASSET', destination, 'version', VERSION, 'radius', maximum_radius,
      'triangles', triangles, 'bytes', destination.stat().st_size, flush=True)
