"""Level 6 illustrative molecular-emission plume GLB, version 1.

Run: Blender 5.2 --background --python tools/blender/build-plume.py

The approved plume look is translated into glTF-compatible layered surfaces.
This is an authored picture, not fluid dynamics, temperature, concentration,
radiance, spectral intensity, real plume geometry or any sensor response.
There is no vehicle or site. Molecule icons are enlarged symbolic diagrams.
Blended material opacity and embedded procedural texture alpha are real glTF
transparency; no invisible geometry or gate-specific visibility exceptions.
"""
import bpy
import math
import random
import numpy as np
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
VERSION = 1
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = 'NONE'
random.seed(37)


def group(name, parent=None, **metadata):
    obj = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    for key, value in metadata.items(): obj[key] = value
    return obj


root = group('GuardianPlume', version=VERSION, level='plume', representative=True,
    physicalScale=False, assumption='look-model', upAxis='Y',
    units='Arbitrary drawing units, not meters.',
    description='Illustrative molecular-emission plume; shape, color, glow, opacity and symbol sizes are not measurements.',
    sourceLook='tools/blender/build-plume-look.py',
    defaultCamera=[8.0, 5.8, 11.0], defaultTarget=[0.0, 3.2, 0.0])
source = group('SourceCore', root, role='Illustrative luminous source gas', physicalHardware=False)
envelope = group('GasEnvelope', root, role='Translucent illustrative gas', physicalHardware=False)
ribbons = group('TurbulentRibbons', root, role='Authored flow-shaped surfaces', physicalHardware=False)
wisps = group('DissipatingWisps', root, role='Faceted fading wisps', physicalHardware=False)
symbols = group('MolecularSymbols', root, role='Enlarged molecular diagrams', teachingOverlay=True,
    description='Symbol positions and sizes do not represent molecular distribution or abundance.')


def texture():
    width, height = 256, 512
    u, t = np.meshgrid(np.linspace(-1, 1, width), np.linspace(0, 1, height))
    # Deterministic graphic turbulence; no physical variables or noise units.
    warp = u + .13 * np.sin(t*24) + .05 * np.sin(t*57 + u*4)
    cloud = (.48 + .23*np.sin(warp*17 + t*38)*np.sin(t*29-u*11)
             + .13*np.sin(warp*47-t*71) + .07*np.sin(u*103+t*121))
    cloud = np.clip((cloud-.16)*1.65, 0, 1)
    edge = np.clip(1-u*u, 0, 1)**1.1
    fade = np.clip(t*18, 0, 1)*np.clip((1-t)*3.5, 0, 1)
    alpha = cloud*edge*fade
    stops = np.array([0, .15, .43, .75, 1])
    colors = np.array([[1,.85,.52], [1,.62,.22], [.91,.29,.055], [.36,.10,.025], [.09,.04,.023]])
    rgba = np.ones((height,width,4), dtype=np.float32)
    for channel in range(3): rgba[:,:,channel] = np.interp(t, stops, colors[:,channel])
    rgba[:,:,:3] *= (.65+.35*cloud[:,:,None])
    rgba[:,:,3] = alpha
    image = bpy.data.images.new('Authored plume color and soft alpha — not a measurement', width=width, height=height, alpha=True)
    image.pixels.foreach_set(rgba.ravel())
    image.update()
    image.pack()
    image['basis'] = 'Original Blender-generated graphic texture; no observed or simulated field.'
    return image


PLUME_TEXTURE = texture()


def gas_material(name, opacity, strength):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (1,.4,.1,opacity)
    mat.surface_render_method = 'DITHERED'
    mat.use_backface_culling = False
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    p = nodes.get('Principled BSDF')
    p.inputs['Metallic'].default_value = 0
    p.inputs['Roughness'].default_value = 1
    p.inputs['Emission Strength'].default_value = strength
    tex = nodes.new('ShaderNodeTexImage')
    tex.image = PLUME_TEXTURE
    links.new(tex.outputs['Color'], p.inputs['Base Color'])
    links.new(tex.outputs['Color'], p.inputs['Emission Color'])
    multiply = nodes.new('ShaderNodeMath')
    multiply.operation = 'MULTIPLY'
    multiply.inputs[1].default_value = opacity
    links.new(tex.outputs['Alpha'], multiply.inputs[0])
    links.new(multiply.outputs[0], p.inputs['Alpha'])
    mat['basis'] = 'Artistic false color, surface alpha and glow; no calibrated quantity.'
    return mat


def plain_material(name, color, opacity=1, emission=0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*color,opacity)
    p = mat.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color,1)
    p.inputs['Roughness'].default_value = .7
    p.inputs['Alpha'].default_value = opacity
    p.inputs['Emission Color'].default_value = (*color,1)
    p.inputs['Emission Strength'].default_value = emission
    if opacity < 1: mat.surface_render_method = 'DITHERED'
    return mat


def mesh(name, verts, faces, mat, parent, uvs=None):
    data = bpy.data.meshes.new(name)
    data.from_pydata(verts, [], faces)
    data.update()
    obj = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(obj)
    obj.parent = parent
    data.materials.append(mat)
    if uvs:
        uv = data.uv_layers.new(name='Authored plume UV')
        for face in data.polygons:
            for loop in face.loop_indices: uv.data[loop].uv = uvs[data.loops[loop].vertex_index]
    obj['representative'] = True
    obj['physicalHardware'] = False
    obj['solidForCamera'] = False
    return obj


def profile(t):
    return (.035+.72*math.sin(math.pi*t)+.32*t)*max(math.sin(math.pi*t),0)**.3+.015


def shell(name, length, width, mat, parent, phase=0):
    # Same billowing silhouette as the approved still, lower surface resolution.
    verts, faces, uv = [], [], []
    nr, ns = 48, 28
    for j in range(nr+1):
        t = j/nr
        for i in range(ns+1):
            a = i*math.tau/ns
            ripple = 1+.13*math.sin(a*3+t*29+phase)+.085*math.sin(a*7-t*42)
            r = width*profile(t)*ripple
            verts.append((.32*t+.18*t*math.sin(t*6)+r*math.cos(a),
                          .11*t*math.sin(t*8)+r*math.sin(a), t*length))
            uv.append((i/ns,t))
    for j in range(nr):
        for i in range(ns):
            a = j*(ns+1)+i
            faces.append((a,a+1,a+ns+2,a+ns+1))
    obj = mesh(name,verts,faces,mat,parent,uv)
    for face in obj.data.polygons: face.use_smooth = True


shell('Soft outer gas surface',6.8,1.10,gas_material('Fading envelope — illustrative opacity',.16,.35),envelope,.7)
shell('Warm billowing gas surface',6.25,.79,gas_material('Amber gas — illustrative opacity',.29,.95),envelope)
shell('Luminous source surface',2.35,.18,gas_material('Source glow — illustrative opacity',.50,2.0),source,.3)

ribbon_mat = gas_material('Folded luminous wisps — illustrative opacity',.26,1.35)
for k in range(6):
    verts, faces, uv = [], [], []
    nr, across = 42, 6
    phase = k*math.tau/6
    length = 4.4 + .25*(k%3)
    for j in range(nr+1):
        t = j/nr
        angle = phase + .55*math.sin(t*8+phase) + t*1.3
        radius = .58*profile(t)
        center = Vector((.25*t+radius*math.cos(angle),radius*math.sin(angle),.08+t*length))
        tangent = Vector((-math.sin(angle),math.cos(angle),.15*math.sin(t*19+phase)))
        width = (.045+.13*math.sin(math.pi*t))*(1+.25*math.sin(t*33+phase))
        for i in range(across+1):
            u = i/across
            point = center+tangent*((u-.5)*width*2)
            verts.append(tuple(point));uv.append((u,t))
    for j in range(nr):
        for i in range(across):
            a=j*(across+1)+i;faces.append((a,a+1,a+across+2,a+across+1))
    mesh('Luminous ribbon '+str(k+1),verts,faces,ribbon_mat,ribbons,uv)

wisp_materials = [plain_material('Dissipating gas facet '+str(i+1),(.29,.11,.045),.035+i*.015,.30) for i in range(3)]
for i in range(18):
    t = .50+random.random()*.43
    angle = random.random()*math.tau
    r = .78*profile(t)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,
        location=(.22*t+r*math.cos(angle),r*math.sin(angle),t*6.8))
    obj=bpy.context.object;obj.name='Low-poly fading gas wisp'
    obj.scale=(.12+random.random()*.13,.10+random.random()*.14,.25+random.random()*.24)
    obj.data.materials.append(wisp_materials[i%3]);obj.parent=wisps
    obj['representative']=True;obj['physicalHardware']=False;obj['solidForCamera']=False

atom_light = plain_material('Molecular symbol pale amber',(.49,.30,.12),1,.12)
atom_dark = plain_material('Molecular symbol graphite',(.12,.16,.19),1,.08)
bond_mat = plain_material('Molecular symbol bond',(.31,.26,.21),1,.15)


def atom(name, center, radius, mat, parent):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,radius=radius,location=center)
    obj=bpy.context.object;obj.name=name;obj.parent=parent;obj.data.materials.append(mat)
    for face in obj.data.polygons: face.use_smooth=True
    obj['representative']=True;obj['teachingOverlay']=True;obj['physicalHardware']=False


def molecule(name, center, bent=False):
    node=group(name,symbols,teachingOverlay=True,representative=True,
        physicalHardware=False,description='Symbolic molecule; geometry and scale are illustrative.')
    ctr=Vector(center)
    ends=[ctr+Vector((-.34,0,-.23)),ctr+Vector((.34,0,-.23))] if bent else [ctr+Vector((-.38,0,-.077)),ctr+Vector((.38,0,.077))]
    atom('Molecular symbol central atom',ctr,.14,atom_dark,node)
    for end in ends:
        atom('Molecular symbol outer atom',end,.105 if bent else .17,atom_light,node)
        direction=end-ctr
        bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.022,depth=direction.length,location=(ctr+end)/2)
        obj=bpy.context.object;obj.name='Molecular symbol bond';obj.rotation_euler=direction.to_track_quat('Z','Y').to_euler()
        obj.parent=node;obj.data.materials.append(bond_mat);obj['teachingOverlay']=True;obj['physicalHardware']=False


molecule('LinearMoleculeSymbol',(1.65,.1,3.85))
molecule('BentMoleculeSymbol',(-1.40,.2,2.75),True)

# Batch only matching material and semantic parent; retain optional symbol group.
for parent in [source,envelope,ribbons,wisps,*symbols.children]:
    batches={}
    for obj in list(parent.children):
        if obj.type=='MESH': batches.setdefault(tuple(m.name for m in obj.data.materials),[]).append(obj)
    for objects in batches.values():
        if len(objects)<2: continue
        bpy.ops.object.select_all(action='DESELECT')
        for obj in objects:obj.select_set(True)
        bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()

anchors=group('Anchors',root,role='Nonrendering interface anchors')
for name, point, role in [
    ('AnchorSource',(.04,-.12,.55),'Illustrative source gas'),
    ('AnchorBands',(1.65,.10,3.85),'Symbolic molecular origin of emission bands'),
    ('AnchorTimeline',(-.75,-.15,5.65),'Upper dispersing plume; qualitative event sequence'),
]:
    obj=group(name,anchors,role=role,representative=True,threePosition=[point[0],point[2],-point[1]])
    obj.location=point

bpy.context.view_layer.update()
points=[];triangles=0;meshes=0
for obj in bpy.context.scene.objects:
    if obj.type!='MESH':continue
    meshes+=1;obj.data.calc_loop_triangles();triangles+=len(obj.data.loop_triangles)
    points.extend(obj.matrix_world@v.co for v in obj.data.vertices)
converted=[Vector((p.x,p.z,-p.y)) for p in points]
low=[min(p[i] for p in converted) for i in range(3)]
high=[max(p[i] for p in converted) for i in range(3)]
root['boundingBoxMin']=low;root['boundingBoxMax']=high
root['triangleCount']=triangles;root['materialRoleBatches']=meshes
root['maximumDrawingRadius']=max(p.length for p in points)
assert triangles<=25000, 'Plume triangle budget exceeded'
path=OUT/'plume.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,
    export_extras=True,export_apply=True,export_animations=False,export_cameras=False,
    export_lights=False,export_materials='EXPORT',export_normals=True,export_image_format='AUTO')
print('PLUME_ASSET',path,'version',VERSION,'bytes',path.stat().st_size,
    'triangles',triangles,'meshes',meshes,'bounds',low,high,flush=True)
