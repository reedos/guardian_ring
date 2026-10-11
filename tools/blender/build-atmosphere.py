"""Qualitative air-column illustration, v3. No physical altitude or transmission.
Colored sheets are diagram layers only, not measured atmospheric strata.
Molecular symbols and all proportions and colors are as drawn.
v3 spaces the four sheets as equal-mass levels of an exponential (isothermal)
atmosphere: each gap holds the same amount of air, so the sheets crowd toward
the ground and the top stays open. v2 spaced them evenly, which implied air of
uniform density. The scale height in drawing units is a composition choice.
v4 draws the column as a curved slab cut from above a gently curved ground:
the same equal-mass levels become curved sheets, the cut front face shows each
level as an outlined band, and the ground has thickness. The molecular symbols
stand in front of the slab with clearance and short leader lines; v3 let them
pass through the column wall. Curvature, depth and extent are as drawn; no
altitude scale, cloud, weather or transmission profile is implied.
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
land=mat('Schematic ground',(.10,.17,.15),.15,.6)
rim=mat('Atmospheric diagram outlines',(.18,.47,.65),.2,.5,.25)
oxygen=mat('Molecule warm symbol',(.67,.41,.17),.1,.4)
carbon=mat('Molecule cool symbol',(.14,.23,.29),.1,.4)
hydrogen=mat('Hydrogen pale symbol',(.72,.78,.80),.1,.4)

# Curved slab (v4): every surface follows one large drawing radius about a
# horizontal axis far below, so ground and levels are concentric arcs.
RADIUS,GROUND=12.0,.24
HALF,FRONT,BACK=2.15,-.55,.75   # slab half-width and its cut faces (Blender y)
CENTER_Z=GROUND-RADIUS
ARC=48
def arc_point(x,height):
    # x is the drawing position across the slab; height is above the ground arc.
    a=math.asin(x/RADIUS);r=RADIUS+height
    return (r*math.sin(a),r*math.cos(a)+CENTER_Z)
def curved_slab(name,h0,h1,y0,y1,material):
    verts=[];faces=[]
    for i in range(ARC+1):
        x=-HALF+2*HALF*i/ARC
        for hh in [h0,h1]:
            px,pz=arc_point(x,hh)
            for y in [y0,y1]:verts.append((px,y,pz))
    for i in range(ARC):
        b=4*i;n=b+4
        faces+=[(b+2,b+3,n+3,n+2),(b,n,n+1,b+1),(b,b+2,n+2,n),(b+1,n+1,n+3,b+3)]
    faces+=[(0,1,3,2),(4*ARC,4*ARC+2,4*ARC+3,4*ARC+1)]
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update()
    import bmesh
    bm=bmesh.new();bm.from_mesh(d);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(d);bm.free()
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);d.materials.append(material)
    for f in d.polygons:f.use_smooth=True
    return o
def arc_line(name,height,y,material,radius=.009,x0=-HALF,x1=HALF):
    pts=[]
    for i in range(ARC+1):
        x=x0+(x1-x0)*i/ARC;px,pz=arc_point(x,height);pts.append((px,y,pz))
    line(name,pts,radius,material)

crust=mat('Schematic ground cut face',(.06,.075,.08),.1,.8)
curved_slab('Schematic curved ground',-.30,0,FRONT,BACK,land)
curved_slab('Schematic ground cut face',-.30,-.02,FRONT-.002,FRONT+.002,crust)
arc_line('Ground surface edge',0,FRONT-.005,rim,.012)

# Equal-mass levels: height = H ln(5/(5-i)), i=1..4 (pressure falls as exp(-z/H)).
SCALE_HEIGHT=1.75
SHEETS=[round(SCALE_HEIGHT*math.log(5/(5-i)),3) for i in range(1,5)]
TOP=3.66
for hh in SHEETS:
    curved_slab('Transparent explanatory sheet',hh-.0175,hh+.0175,FRONT,BACK,air)
    arc_line('Sheet perimeter',hh,FRONT-.004,rim)
    arc_line('Sheet perimeter',hh,BACK+.004,rim)
# Cut-face outline of the slab: two vertical edges per face and a faint top arc.
for y in [FRONT-.004,BACK+.004]:
    for x in [-HALF,HALF]:
        (bx,bz),(tx,tz)=arc_point(x,0),arc_point(x,TOP)
        line('Air-slab cut edge',[(bx,y,bz),(tx,y,tz)],.009,rim)
arc_line('Drawn top of the illustrated air',TOP,FRONT-.004,rim,.006)
# A faint translucent back face gives the air volume a boundary to read against.
curved_slab('Transparent air-slab back face',0,TOP,BACK,BACK+.01,air)

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
# v4: symbols stand in front of the cut face with clearance (the nearest atom
# surface is about 0.27 in front of the slab), each tied to it by a leader.
MOLECULE_Y=-1.0
molecule((1.95,MOLECULE_Y,2.55))
molecule((-1.90,MOLECULE_Y,1.55),False)
for x,z,role in [(1.95,2.55,'CarbonDioxide'),(-1.90,1.55,'WaterVapor')]:
    before=set(bpy.context.scene.objects)
    line('Molecular symbol leader',[(x,MOLECULE_Y+.19,z),(x,FRONT-.01,z)],.006,rim)
    cyl('Leader foot on the slab face',(x,FRONT-.012,z),.03,.012,rim,axis='y',vertices=16,bevel=0)
    for obj in set(bpy.context.scene.objects)-before:
        obj['assetRole']=role;obj['teachingOverlay']=True;obj['physicalHardware']=False;obj['solidForCamera']=False

for material in bpy.data.materials:
    if material.use_nodes:
        for node in list(material.node_tree.nodes):
            if node.type in {'TEX_NOISE','BUMP'}:material.node_tree.nodes.remove(node)
geometry=[o for o in bpy.context.scene.objects if o.type in {'MESH','CURVE'}]
bpy.ops.object.select_all(action='DESELECT')
for o in geometry:o.select_set(True)
bpy.context.view_layer.objects.active=geometry[0];bpy.ops.object.convert(target='MESH')
root=bpy.data.objects.new('GuardianAtmosphere',None);bpy.context.collection.objects.link(root)
root['version']=4;root['sheetSpacing']='Equal-mass levels of an exponential atmosphere on a curved slab; each gap holds about one fifth of the column. Qualitative, no altitude scale.';root['physicalScale']=False;root['representative']=True;root['assumption']='look-model'
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
for name,p in {'AnchorAir':(-.9,-.62,3.1),'AnchorBands':(.4,-1.25,2.3),'AnchorContext':(.7,-.62,.25),
    'AnchorCO2':(1.95,-1.18,2.55),'AnchorH2O':(-1.9,-1.19,1.55)}.items():
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=root;o.location=p
out=ROOT/'public/models/atmosphere.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,export_extras=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
print('ATMOSPHERE_ASSET',out.stat().st_size,'bytes',len(batches),'material batches',flush=True)
