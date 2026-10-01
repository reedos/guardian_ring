"""TIRS-2 teaching assembly, v1. Four lens elements and three array packages.
Counts are from the verified NASA instrument descriptions. All geometry,
mounts, pixel pattern, spacing and colors are representative, not dimensioned.
No optical prescription is reconstructed. Blender coordinates become Y-up.
"""
import ast
import bpy
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
source=Path(__file__).with_name('build-hardware-look.py')
tree=ast.parse(source.read_text(encoding='utf-8'))
ns={'__file__':str(source),'__name__':'hardware_helpers'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,(ast.Import,ast.ImportFrom,ast.FunctionDef))],type_ignores=[]),str(source),'exec'),ns)
bpy.ops.wm.read_factory_settings(use_empty=True)
m=ns['palette']()
box,cyl,sphere,line,ring,fastener=[ns[k] for k in ['box','cylinder','sphere','line','ring_y','fastener']]
lens=ns['material']('Illustrative refractive element',(.20,.49,.63),.15,.16)
lens.node_tree.nodes.get('Principled BSDF').inputs['Alpha'].default_value=.48
lens.diffuse_color=(.20,.49,.63,.48)
lens.surface_render_method='DITHERED'

box('Instrument bench',(.35,.15,-.4),(4.4,3.85,.23),m['dark'])
for x in [-1.55,2.25]:
    for y in [-1.45,1.7]:
        cyl('Bench mount',(x,y,-.57),.12,.16,m['silver'],vertices=20)
        fastener((x,y,-.265),m['bright'])

# The four separate surfaces carry the published element count only.
for i,y in enumerate([-1.22,-.55,.12,.79]):
    sphere('Refractive element '+str(i+1),(-.55,y,.76),(.87,.06,.87),lens)
    ring('Lens retaining rim '+str(i+1),y,.99,.91,m['silver'],depth=.10,center=(-.55,.76))
    box('Lens cell support',(-.55,y,-.2),(.38,.19,.19),m['dark'])
    for x in [-1.40,.30]: fastener((x,y-.073,.76),m['bright'],axis='y')
for x in [-1.53,.43]:
    box('Open telescope rail',(x,-.25,.12),(.08,2.55,.12),m['goldedge'],.01)

# Three civil array packages, shown in an exploded row with symbolic pixels.
box('Cold focal-plane carrier',(-.55,1.69,.76),(2.42,.16,1.10),m['cyan'])
for i,x in enumerate([-1.28,-.55,.18]):
    box('QWIP array package '+str(i+1),(x,1.53,.76),(.65,.12,.85),m['ceramic'],.018)
    box('Array active face '+str(i+1),(x,1.445,.76),(.53,.025,.67),m['silicon'],.006)
    for col in range(5):
        for row in range(6):
            box('Symbolic detector element',(x+(col-2)*.093,1.426,.76+(row-2.5)*.099),(.081,.006,.087),m['solar2'],0)
    line('Readout flex',[(x,1.65,.30),(x,1.96,.12),(x,2.04,-.12)],.025,m['trace'])

box('Warm electronics case',(1.63,-.75,.15),(1.05,1.02,.85),m['silver'])
box('Readout lid',(1.63,-.75,.60),(.96,.93,.035),m['dark'],.006)
for x in [1.24,2.02]:
    for y in [-1.12,-.38]: fastener((x,y,.632),m['bright'])
cyl('Representative cooler',(1.62,1.14,.2),.30,.78,m['silver'],axis='y')
cyl('Cooler cold head',(1.62,.69,.2),.19,.09,m['coldedge'],axis='y')
line('Thermal connection',[(.70,1.67,.70),(1.28,1.67,.70),(1.62,1.36,.45)],.057,m['strap'])
box('Heat rejection surface',(2.35,1.04,.9),(.16,1.42,1.49),m['white'],.03)
for z in [.32,.55,.78,1.01,1.24,1.47]:
    box('Radiator channel',(2.445,1.04,z),(.015,1.32,.025),m['silver'],.004)

for mat in bpy.data.materials:
    if mat.use_nodes:
        for n in list(mat.node_tree.nodes):
            if n.type in {'TEX_NOISE','BUMP'}:mat.node_tree.nodes.remove(n)
geometry=[o for o in bpy.context.scene.objects if o.type in {'MESH','CURVE'}]
for o in geometry:
    for modifier in o.modifiers:
        if modifier.type=='BEVEL':modifier.segments=2
bpy.ops.object.select_all(action='DESELECT')
for o in geometry:o.select_set(True)
bpy.context.view_layer.objects.active=geometry[0]
bpy.ops.object.convert(target='MESH')
root=bpy.data.objects.new('GuardianTIRS2',None);bpy.context.collection.objects.link(root)
root['version']=1;root['representative']=True;root['physicalScale']=False;root['assumption']='look-model'
root['publishedCounts']='Four refractive elements; three QWIP detector assemblies. All shapes, spacing and symbolic pixels as drawn.'
batches={}
for o in list(bpy.context.scene.objects):
    if o.type=='MESH':batches.setdefault(tuple(mat.name for mat in o.data.materials),[]).append(o)
for names,objects in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:o.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    o=bpy.context.object;o.name='TIRS2 — '+names[0];o.parent=root;o['representative']=True
for name,p in {'AnchorTelescope':(-.2,-1.25,1.20),'AnchorArrays':(-.55,1.42,.78),'AnchorCooling':(1.62,.62,.4)}.items():
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=root;o.location=p
bpy.context.view_layer.update()
points=[o.matrix_world@v.co for o in bpy.context.scene.objects if o.type=='MESH' for v in o.data.vertices]
converted=[Vector((p.x,p.z,-p.y)) for p in points]
low=[min(p[i] for p in converted) for i in range(3)];high=[max(p[i] for p in converted) for i in range(3)]
triangles=0
for o in bpy.context.scene.objects:
    if o.type=='MESH':o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
out=ROOT/'public/models/tirs2.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_yup=True,export_extras=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
print('TIRS2_ASSET',out.stat().st_size,'bytes',triangles,'triangles',len(batches),'batches','bounds',low,high,flush=True)
