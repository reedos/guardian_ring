"""Level 1 authored GLB, version 4. No operational constellation is represented.

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
import bmesh
import math
from pathlib import Path
from mathutils import Vector
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
TEXTURES = ROOT / 'research' / 'look' / 'textures'
VERSION = 4
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


GOLD = material('Representative proxy thermal blanket', (.53, .32, .10), .68, .37)
DARK = material('Representative proxy bus', (.055, .078, .10), .24, .44)
SOLAR = material('Representative proxy solar surface', (.018, .060, .12), .32, .28)
TRIM = material('Representative proxy structure', (.40, .47, .53), .68, .30)


def proxy_mesh():
    """A closed representative vehicle, still one shared mesh/four materials.

    Native Blender bounds and every attachment/orbit transform stay identical
    to v3. Cell count, antenna, aperture, panel layout and materials are as drawn;
    this is not a particular military spacecraft or a physical solar-array model.
    """
    verts, faces, slots = [], [], []
    def add_box(pos, size, material_index, omit=()):
        start = len(verts)
        verts.extend([(pos[0]+x*size[0]/2, pos[1]+y*size[1]/2, pos[2]+z*size[2]/2)
                      for z in [-1, 1] for y in [-1, 1] for x in [-1, 1]])
        for index,face in enumerate([(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]):
            if index not in omit:faces.append(tuple(start+i for i in face));slots.append(material_index)
    def front(pos,width,height,material_index):
        x,y,z=pos;start=len(verts)
        verts.extend([(x-width/2,y,z-height/2),(x-width/2,y,z+height/2),
                      (x+width/2,y,z+height/2),(x+width/2,y,z-height/2)])
        faces.append(tuple(range(start,start+4)));slots.append(material_index)
    def bevel_box(pos,size,material_index,bevel=.001):
        # Bevels catch the fixed Sun without expanding the agreed envelope.
        # The parts are joined into the same shared material-batched mesh.
        bm=bmesh.new();bmesh.ops.create_cube(bm,size=1)
        bmesh.ops.scale(bm,vec=Vector(size),verts=list(bm.verts))
        bmesh.ops.bevel(bm,geom=list(bm.edges),offset=bevel,segments=1,affect='EDGES')
        bmesh.ops.translate(bm,vec=Vector(pos),verts=list(bm.verts))
        bm.verts.ensure_lookup_table();bm.verts.index_update()
        start=len(verts);verts.extend([tuple(v.co) for v in bm.verts])
        for f in bm.faces:faces.append(tuple(start+v.index for v in f.verts));slots.append(material_index)
        bm.free()
    def cylinder_y(pos,radius,depth,material_index,segments=12):
        x,y,z=pos;start=len(verts)
        for yy in [y-depth/2,y+depth/2]:
            verts.extend([(x+radius*math.cos(i*math.tau/segments),yy,z+radius*math.sin(i*math.tau/segments)) for i in range(segments)])
        faces.append(tuple(start+i for i in range(segments)));slots.append(material_index)
        faces.append(tuple(start+segments+i for i in reversed(range(segments))));slots.append(material_index)
        for i in range(segments):
            j=(i+1)%segments;faces.append((start+i,start+segments+i,start+segments+j,start+j));slots.append(material_index)
    def aperture_ring(pos,outer,inner,depth,segments=20):
        x,y,z=pos;start=len(verts)
        for yy in [y-depth/2,y+depth/2]:
            for radius in [outer,inner]:
                verts.extend([(x+radius*math.cos(i*math.tau/segments),yy,z+radius*math.sin(i*math.tau/segments)) for i in range(segments)])
        for i in range(segments):
            j=(i+1)%segments
            for face in [(i,j,segments+j,segments+i),(2*segments+i,3*segments+i,3*segments+j,2*segments+j),
                         (i,2*segments+i,2*segments+j,j),(segments+i,segments+j,3*segments+j,3*segments+i)]:
                faces.append(tuple(start+k for k in face));slots.append(3)
    # Recessed bus panels, a segmented MLI face, and a mounted radiator panel.
    # Contacting layers use opposed faces; no overlaid coplanar face decals.
    bevel_box((0,-.002,0),(.074,.064,.083),0,.0018)
    for x in [-.01875,.01875]:
        for z in [-.0195,.0195]:
            bevel_box((x,-.03865,z),(.0345,.0085,.036),1,.0009)
            # Shallow stitched blanket-edge strips; their repetition is as drawn.
            for dx in [-.014,.014]:add_box((x+dx,-.04305,z),(.00065,.0003,.030),3)
    for x in [-.038,.038]:add_box((x,-.002,0),(.002,.064,.079),3)
    for z in [-.0425,.0425]:add_box((0,-.002,z),(.074,.064,.002),3)
    bevel_box((0,.031,0),(.070,.002,.078),0,.0003)
    for x in [-.0255,-.015,-.0045,.006,.0165,.027]:
        bevel_box((x,.033,-.006),(.009,.002,.050),3,.0003)
    # A separate Earth-facing antenna patch, mounted within a recessed bezel.
    # The earlier proxy's outer bounds remain unchanged: this bezel supplies
    # the exact -Y extremity, and the payload housing supplies the +Z extremity.
    bevel_box((-.018,-.042,-.018),(.024,.003,.020),0,.0004)
    for x in [-.030,-.006]:bevel_box((x,-.044,-.018),(.001,.001,.020),3,.00015)
    for z in [-.028,-.008]:bevel_box((-.018,-.044,z),(.025,.001,.001),3,.00015)
    add_box((-.018,-.04375,-.018),(.020,.0005,.016),1)
    for x in [-.030,.030]:
        for z in [-.033,.033]:cylinder_y((x,-.04335,z),.0016,.0012,3,8)
    # Side access panels and narrow structural seams remain external vocabulary,
    # with no assigned electronics, masses, ratings, or military internals.
    for side in [-1,1]:
        bevel_box((side*.0385,-.003,.002),(.001,.045,.046),3,.0002)
        for z in [-.019,.019]:add_box((side*.039,-.002,z),(.0003,.035,.0008),0)
    for side in [-1,1]:
        bevel_box((side*.063, 0, 0), (.080, .010, .013), 3,.0007)
        bevel_box((side*.135, 0, 0), (.130, .012, .078), 0,.0010)
        # Edge extrusions and a visible panel seam, rather than a single slab.
        for z in [-.037,.037]:bevel_box((side*.135,.006,z),(.127,.002,.002),3,.0003)
        for x in [side*.072,side*.198]:bevel_box((x,.006,0),(.002,.002,.074),3,.0003)
        # Cell-side caps are partitioned into cell and busbar faces, rather
        # than putting a metal stripe on a coplanar complete cell face.
        cell_w,cell_h=.0232,.0226666667
        for column in range(5):
            for row in range(3):
                x=side*.135+(column-2)*(cell_w+.002);z=(row-1)*(cell_h+.002)
                add_box((x,.0065,z),(cell_w,.001,cell_h),2,omit=(3,))
                stripe=.0006;half=(cell_w-stripe)/2
                # Partition the full cell face into two coverglass rectangles
                # and a collector, retaining deliberate gaps between cells.
                front((x-(cell_w+stripe)/4,.007,z),half,cell_h,2)
                front((x,.007,z),stripe,cell_h,3)
                front((x+(cell_w+stripe)/4,.007,z),half,cell_h,2)
                # Raised tiny contact tabs belong to the physical cell drawing.
                for zz in [-cell_h/2+.001,cell_h/2-.001]:add_box((x,.00715,z+zz),(.002,.0003,.001),1)
        # Back faces carry structure instead of a second invented cell layer.
        for offset in [-.031, .031]:
            add_box((side*.135+offset, -.008, 0), (.002, .004, .075), 3)
        # A junction cover and hinge blocks explain how the wing attaches.
        bevel_box((side*.086,-.009,0),(.016,.005,.023),0,.0006)
        for z in [-.024,.024]:bevel_box((side*.071,-.001,z),(.005,.016,.008),3,.0006)
    bevel_box((0, -.006, .057), (.038, .040, .027), 3,.0012)
    aperture_ring((0,-.030,.057),.012,.0085,.008)
    aperture_ring((0,-.033,.057),.0127,.0095,.0018)
    # A recessed optical entrance, without reconstructing an optical train.
    start=len(verts);segments=12
    verts.extend([(.0085*math.cos(i*math.tau/segments),-.027,.057+.0085*math.sin(i*math.tau/segments)) for i in range(segments)])
    faces.append(tuple(range(start,start+segments)));slots.append(0)
    bounds=[tuple(min(v[axis] for v in verts) for axis in range(3)),tuple(max(v[axis] for v in verts) for axis in range(3))]
    expected=[(-.2,-.0445,-.0435),(.2,.034,.0705)]
    assert all(abs(a-b)<1e-8 for bound,target in zip(bounds,expected) for a,b in zip(bound,target)),bounds
    mesh = bpy.data.meshes.new('Shared schematic spacecraft proxy')
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for mat in [DARK, GOLD, SOLAR, TRIM]: mesh.materials.append(mat)
    for face, slot in zip(mesh.polygons, slots): face.material_index = slot
    mesh.calc_loop_triangles()
    assert len(mesh.loop_triangles)<3600,len(mesh.loop_triangles)
    mesh['detailIsIllustrative']=True
    mesh['triangleCount']=len(mesh.loop_triangles)
    mesh['description']='Beveled external bus, MLI seams, recessed antenna patch, radiator segments, optical-port baffles and one-sided cell grid with contacts, wing frames and junction covers. Shared geometry; unchanged v3 silhouette.'
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
    obj['hardwareIsIllustrative'] = 'Solar-cell grid, bus panels, radiator, antenna face and optical entrance are as drawn; no detailed instrument or operating performance is encoded.'
    for port,point,direction,role in [
        ('Optical',(0,-.0343,.057),(0,-1,0),'Representative optical entrance'),
        ('Radio',(-.018,-.0441,-.018),(0,-1,0),'Representative radio antenna patch'),
        ('Solar',(.135,.0074,0),(0,1,0),'Representative illuminated solar-array face'),
        ('Thermal',(.006,.0341,-.006),(0,1,0),'Representative radiator face'),
    ]:
        anchor=group(name+'_Port'+port,root,role='explanatory-port',port=port.lower(),
            componentRole=role,representative=True,solidForCamera=False,
            localDirection=[direction[0],direction[2],-direction[1]])
        anchor.location=point
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
