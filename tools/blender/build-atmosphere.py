"""Qualitative air-column illustration, v2. No physical altitude or transmission.
Colored sheets are diagram layers only, not measured atmospheric strata.
Molecular symbols and all spacing, proportions and colors are as drawn.
"""
import ast
import math
import bpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
source=Path(__file__).with_name('build-hardware-look.py')
tree=ast.parse(source.read_text(encoding='utf-8'))
ns={'__file__':str(source),'__name__':'hardware_helpers'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef))],type_ignores=[]),str(source),'exec'),ns)
bpy.ops.wm.read_factory_settings(use_empty=True)
m=ns['palette']()
mat,box,cyl,sphere,line=[ns[k] for k in ['material','box','cylinder','sphere','line']]
air=mat('Diagram air layers',(.16,.38,.55),.05,.5,.10)
air.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.17
air.diffuse_color=(.16,.38,.55,.17);air.surface_render_method='DITHERED'
land=mat('Schematic ground',(.055,.10,.105),.2,.65)
rim=mat('Atmospheric diagram outlines',(.18,.47,.65),.2,.5,.25)
oxygen=mat('Molecule warm symbol',(.67,.41,.17),.1,.4)
carbon=mat('Molecule cool symbol',(.14,.23,.29),.1,.4)
hydrogen=mat('Hydrogen pale symbol',(.72,.78,.80),.1,.4)

# A shallow spherical cap gives a curved reference surface without geographic data.
segments,rings=64,12
verts=[(0,0,.24)];faces=[]
for j in range(1,rings+1):
    r=1.7*j/rings
    for i in range(segments):
        a=math.tau*i/segments;verts.append((r*math.cos(a),r*math.sin(a),.24-.20*(r/1.7)**2))
for i in range(segments):faces.append((0,1+i,1+(i+1)%segments))
for j in range(rings-1):
    a=1+j*segments;b=a+segments
    for i in range(segments):n=(i+1)%segments;faces.append((a+i,b+i,b+n,a+n))
mesh=bpy.data.meshes.new('Curved reference surface');mesh.from_pydata(verts,[],faces);mesh.update()
ground=bpy.data.objects.new('Schematic curved ground',mesh);bpy.context.collection.objects.link(ground);mesh.materials.append(land)
cyl('Reference surface rim',(0,0,-.02),1.73,.10,m['dark'],vertices=64,bevel=.01)

for z in [.85,1.70,2.55,3.40]:
    cyl('Transparent explanatory sheet',(0,0,z),1.55,.035,air,vertices=64,bevel=0)
    pts=[(1.57*math.cos(math.tau*i/64),1.57*math.sin(math.tau*i/64),z) for i in range(65)]
    line('Sheet perimeter',pts,.009,rim)
# A faint side boundary connects the sheets, with genuine transparency.
verts=[];faces=[]
for z in [.32,3.9]:
    for i in range(65):a=math.tau*i/64;verts.append((1.54*math.cos(a),1.54*math.sin(a),z))
for i in range(64):faces.append((i,i+1,i+66,i+65))
mesh=bpy.data.meshes.new('Transparent air-column surface');mesh.from_pydata(verts,[],faces);mesh.update();mesh.materials.append(air)
o=bpy.data.objects.new('Air-column boundary',mesh);bpy.context.collection.objects.link(o)

def molecule(center,linear=True):
    before=set(bpy.context.scene.objects)
    x,y,z=center
    points=[(x-.4,y,z),(x,y,z),(x+.4,y,z)] if linear else [(x-.3,y,z-.20),(x,y,z),(x+.3,y,z-.20)]
    line('Symbolic molecular bond',points,.033,m['silver'])
    for i,p in enumerate(points):
        if linear:
            material=carbon if i==1 else oxygen
            radius=.16 if i==1 else .18
        else:
            material=oxygen if i==1 else hydrogen
            radius=.18 if i==1 else .11
        sphere('Carbon dioxide atom symbol' if linear else 'Water-vapor atom symbol',p,(radius,radius,radius),material)
    for obj in set(bpy.context.scene.objects)-before:
        obj['assetRole']='CarbonDioxide' if linear else 'WaterVapor'
        obj['teachingOverlay']=True
        obj['physicalHardware']=False
        obj['solidForCamera']=False
molecule((1.95,-.25,2.55))
molecule((-1.90,-.15,1.55),False)

for material in bpy.data.materials:
    if material.use_nodes:
        for node in list(material.node_tree.nodes):
            if node.type in {'TEX_NOISE','BUMP'}:material.node_tree.nodes.remove(node)
geometry=[o for o in bpy.context.scene.objects if o.type in {'MESH','CURVE'}]
bpy.ops.object.select_all(action='DESELECT')
for o in geometry:o.select_set(True)
bpy.context.view_layer.objects.active=geometry[0];bpy.ops.object.convert(target='MESH')
root=bpy.data.objects.new('GuardianAtmosphere',None);bpy.context.collection.objects.link(root)
root['version']=2;root['physicalScale']=False;root['representative']=True;root['assumption']='look-model'
root['description']='Qualitative atmospheric absorption diagram. No altitude, weather, humidity, temperature, transmission or detection model.'
batches={}
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':batches.setdefault((o.get('assetRole','AirColumn'),tuple(mat.name for mat in o.data.materials)),[]).append(o)
for (role,names),objects in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    o=bpy.context.object;o.name=role+' — '+names[0];o.parent=root;o['representative']=True;o['assetRole']=role
for name,p in {'AnchorAir':(-.9,-.6,3.1),'AnchorBands':(.4,-1.25,2.3),'AnchorContext':(.7,-.6,.25),
    'AnchorCO2':(1.95,-.43,2.55),'AnchorH2O':(-1.9,-.34,1.55)}.items():
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=root;o.location=p
out=ROOT/'public/models/atmosphere.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,export_extras=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
print('ATMOSPHERE_ASSET',out.stat().st_size,'bytes',len(batches),'material batches',flush=True)
