"""Ground side-level GLB, version 2: representative ground-system equipment.

Run: Blender 5.2 --background --python tools/blender/build-ground.py

An authored teaching composition, not a real site, antenna design, operations
layout or hardware specification. All sizes, counts, finishes and spacing are
as drawn. No logos, part numbers, people, operational displays or location.
Three.js export is Y-up; the equipment fronts face +Z.
"""
import ast
import bpy
import math
from pathlib import Path
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public'/'models'
VERSION=2
OUT.mkdir(parents=True,exist_ok=True)


def load_helpers():
    source=Path(__file__).with_name('build-hardware-look.py')
    tree=ast.parse(source.read_text(encoding='utf-8'),filename=str(source))
    definitions=[node for node in tree.body if isinstance(node,(ast.Import,ast.ImportFrom,ast.FunctionDef))]
    ns={'__file__':str(source),'__name__':'guardian_hardware_geometry'}
    exec(compile(ast.Module(body=definitions,type_ignores=[]),str(source),'exec'),ns)
    return ns


def group(name,parent=None,**metadata):
    obj=bpy.data.objects.new(name,None);bpy.context.scene.collection.objects.link(obj);obj.parent=parent
    for key,value in metadata.items():obj[key]=value
    return obj


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system='NONE'
lib=load_helpers()
m=lib['palette']()
box,cylinder,line=lib['box'],lib['cylinder'],lib['line']
m['floor']=lib['material']('Satin graphite raised floor',(.035,.046,.059),.20,.65)
m['tile']=lib['material']('Raised-floor panels as drawn',(.085,.105,.125),.25,.58)
m['screen']=lib['material']('Blank illustrative monitor glass',(.023,.075,.10),.20,.32,.10)
m['indicator']=lib['material']('Illustrative equipment indicator',(.13,.49,.62),.12,.34,.65)
m['seat']=lib['material']('Graphite operator chair',(.025,.037,.047),.08,.71)


def section(name,build):
    before=set(bpy.context.scene.objects)
    build()
    for obj in set(bpy.context.scene.objects)-before:obj['assetRole']=name


def rod(name,start,end,radius,mat):
    a,b=Vector(start),Vector(end)
    obj=cylinder(name,(a+b)/2,radius,(b-a).length,mat,vertices=20,bevel=.004)
    obj.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler()
    return obj


def floor():
    box('Representative raised floor',(0,-1.25,-.13),(8.10,6.90,.24),m['floor'],.06)
    for ix in range(9):
        for iy in range(8):
            box('Separated floor tile',((ix-4)*.876,1.7-iy*.846,.014),(.852,.822,.035),m['tile'],.008)
    for x in [-4.02,4.02]:box('Floor edge cap',(x,-1.25,-.08),(.055,6.77,.10),m['silver'],.012)
    for y in [-4.67,2.17]:box('Floor edge cap',(0,y,-.08),(8.0,.055,.10),m['silver'],.012)
    # Low route covers suggest facility services without drawing signal flow.
    box('Floor service cover',(-.15,1.88,.075),(6.3,.17,.075),m['dark'],.012)


def receive():
    cx,cy=-2.65,.25
    cylinder('Antenna platform',(cx,cy,.09),.94,.12,m['dark'],vertices=48,bevel=.018)
    cylinder('Pedestal footing',(cx,cy,.22),.39,.18,m['silver'],vertices=32,bevel=.022)
    cylinder('Representative antenna pedestal',(cx,cy,.77),.18,.95,m['white'],vertices=32,bevel=.025)
    box('Generic elevation mount',(cx,cy,1.30),(.44,.40,.38),m['dark'],.045)
    cylinder('Elevation pivot',(cx,cy,1.40),.19,.60,m['silver'],'x',vertices=32,bevel=.014)
    center=Vector((cx,cy,1.70))
    rotation=Vector((0,-.70,.714)).to_track_quat('Z','Y')
    transform=lambda p:center+rotation@Vector(p)
    verts=[tuple(transform((0,0,0)))];faces=[]
    rings,segments=11,48
    for j in range(1,rings+1):
        r=.86*j/rings
        for i in range(segments):
            a=i*math.tau/segments;verts.append(tuple(transform((r*math.cos(a),r*math.sin(a),.24*(r/.86)**2))))
    for i in range(segments):faces.append((0,1+i,1+(i+1)%segments))
    for j in range(rings-1):
        base=1+j*segments
        for i in range(segments):faces.append((base+i,base+(i+1)%segments,base+segments+(i+1)%segments,base+segments+i))
    data=bpy.data.meshes.new('Representative dish surface');data.from_pydata(verts,[],faces);data.update()
    obj=bpy.data.objects.new('Representative dish — no radiation pattern',data);bpy.context.scene.collection.objects.link(obj)
    data.materials.append(m['white'])
    for face in data.polygons:face.use_smooth=True
    thick=obj.modifiers.new('Dish surface thickness','SOLIDIFY');thick.thickness=.024
    rim=[tuple(transform((.86*math.cos(i*math.tau/64),.86*math.sin(i*math.tau/64),.24))) for i in range(65)]
    line('Antenna rim',rim,.018,m['silver'])
    for a in [math.pi/2,math.pi/2+math.tau/3,math.pi/2+2*math.tau/3]:
        rod('Feed support as drawn',transform((.72*math.cos(a),.72*math.sin(a),.17)),transform((0,0,.50)),.014,m['dark'])
    rod('Representative feed element',transform((0,0,.44)),transform((0,0,.62)),.055,m['goldedge'])
    rod('Back support',Vector((cx,cy,1.26)),transform((0,0,-.07)),.065,m['silver'])
    for x in [-.27,.27]:
        for y in [-.27,.27]:cylinder('Footing fastener',(cx+x,cy+y,.32),.035,.026,m['bright'],vertices=16,bevel=.004)


def process():
    cx,cy=-.35,.58
    box('Representative processing rack foot',(cx,cy,.12),(1.27,1.27,.18),m['dark'],.035)
    box('Rack rear panel',(cx,cy+.55,1.41),(1.17,.07,2.48),m['dark'],.018)
    for x in [-.565,.565]:
        box('Rack side panel',(cx+x,cy,1.41),(.065,1.12,2.48),m['dark'],.023)
        box('Rack front rail',(cx+x,cy-.58,1.41),(.046,.04,2.43),m['silver'],.008)
    for z in [.22,2.64]:box('Rack frame cap',(cx,cy,z),(1.20,1.19,.07),m['silver'],.017)
    for i in range(8):
        z=.39+i*.286
        box('Representative processing enclosure',(cx,cy-.03,z),(1.02,1.04,.25),m['dark'],.015)
        box('Equipment face',(cx,cy-.565,z),(.975,.045,.225),m['silver'] if i in [1,5] else m['dark'],.010)
        for x in [-.40,.40]:box('Equipment pull handle',(cx+x,cy-.610,z),(.04,.07,.14),m['silver'],.009)
        for vent in range(6):box('Equipment vent opening',(cx-.21+vent*.079,cy-.591,z),(.041,.009,.09),m['black'],.004)
        box('Small illustrative status indicator',(cx+.30,cy-.594,z+.038),(.022,.012,.025),m['indicator'],.003)
    box('Unlabeled service insert',(cx-.27,cy-.600,2.45),(.18,.018,.07),m['goldedge'],.005)
    # The short external service bend is mechanical context, not a network path.
    line('Rack rear service bend',[(cx+.42,cy+.62,.28),(cx+.65,cy+.70,.18),(cx+.68,1.86,.12)],.033,m['dark'])


def operations():
    cx=2.20
    box('Operator console desktop',(cx,-.25,.91),(2.26,1.10,.12),m['silver'],.045)
    box('Desktop dark inset',(cx,-.29,.977),(2.10,.89,.015),m['dark'],.009)
    for x in [-.78,.78]:
        box('Console support',(cx+x,-.12,.48),(.10,.75,.80),m['dark'],.020)
        box('Console foot',(cx+x,-.12,.095),(.46,.95,.075),m['silver'],.014)
    for x in [-.53,.53]:
        box('Monitor stand base',(cx+x,-.035,1.010),(.40,.25,.035),m['dark'],.012)
        box('Monitor stand',(cx+x,.015,1.205),(.065,.075,.38),m['silver'],.009)
        box('Representative monitor bezel',(cx+x,-.075,1.52),(.94,.11,.66),m['dark'],.030)
        box('Blank illustrative display',(cx+x,-.135,1.52),(.85,.016,.56),m['screen'],.010)
    box('Console keyboard',(cx,-.51,1.014),(1.08,.25,.047),m['dark'],.014)
    for row in range(3):
        for col in range(12):box('Unlabeled key',(cx+(col-5.5)*.079,-.58+row*.067,1.044),(.066,.051,.016),m['ceramic'],.003)
    box('Pointer device',(cx+.73,-.53,1.025),(.13,.19,.06),m['dark'],.021)
    # A plain empty chair makes the operator scale legible without depicting people.
    box('Operator chair seat',(cx,-1.39,.55),(.61,.60,.12),m['seat'],.050)
    box('Operator chair back',(cx,-1.66,.94),(.59,.12,.68),m['seat'],.050)
    rod('Chair center stem',(cx,-1.39,.13),(cx,-1.39,.48),.045,m['silver'])
    for a in [0,math.tau/5,2*math.tau/5,3*math.tau/5,4*math.tau/5]:
        end=(cx+.36*math.cos(a),-1.39+.36*math.sin(a),.09)
        rod('Chair base spoke',(cx,-1.39,.15),end,.026,m['dark'])
        cylinder('Chair caster',end,.06,.055,m['dark'],'x',vertices=16,bevel=.007)


def cabinet(kind,cx,cy,height):
    width,depth=.96,.96
    box(kind+' equipment foot',(cx,cy,.12),(1.08,1.10,.16),m['dark'],.025)
    box(kind+' cabinet',(cx,cy,.19+height/2),(width,depth,height),m['dark'],.028)
    for dx in [-.45,.45]:
        box(kind+' front rail',(cx+dx,cy-.493,.19+height/2),(.038,.035,height-.05),m['silver'],.007)
    box(kind+' label stock',(cx,cy-.507,height+.035),(.79,.024,.16),m['silver'],.008)
    if kind=='Receiver':
        for j in range(4):
            z=.42+j*.23
            box('Receiver modular enclosure',(cx,cy-.495,z),(.84,.046,.19),m['silver'],.012)
            for dx in [-.30,-.10,.10]:
                cylinder('Representative RF connector',(cx+dx,cy-.543,z),.038,.042,m['goldedge'],'y',vertices=16,bevel=.003)
            box('Receiver blank status glass',(cx+.29,cy-.526,z),(.15,.015,.07),m['screen'],.004)
    elif kind=='Archive':
        for j in range(6):
            z=.39+j*.23
            box('Storage module face',(cx,cy-.504,z),(.82,.044,.185),m['silver'],.009)
            for dx in [-.31,.31]:
                box('Storage module pull handle',(cx+dx,cy-.543,z),(.038,.042,.115),m['dark'],.006)
            box('Storage status light',(cx+.19,cy-.531,z+.04),(.032,.01,.025),m['indicator'],.003)
    else:
        box('UPS power-module panel',(cx,cy-.508,.56),(.78,.04,.55),m['silver'],.016)
        for i in range(8):
            box('UPS panel cooling slot',(cx-.28+i*.08,cy-.533,.46),(.035,.009,.19),m['black'],.004)
        box('UPS blank status display',(cx,cy-.535,.72),(.29,.012,.07),m['screen'],.007)
        box('UPS module handle',(cx,cy-.58,.29),(.35,.07,.04),m['dark'],.009)
    # A rear cable relief is mechanical context; logical paths are runtime overlays.
    line(kind+' service cable',[(cx+.26,cy+.50,.38),(cx+.37,cy+.64,.21),(cx+.37,cy+.8,.14)],.023,m['dark'])


for name,build in [('Floor',floor),('Receive',receive),('Process',process),('Operations',operations),
    ('Receiver',lambda:cabinet('Receiver',-2.65,-2.75,1.32)),
    ('Archive',lambda:cabinet('Archive',-.35,-2.75,1.70)),
    ('Power',lambda:cabinet('Power',2.20,-3.35,1.03))]:section(name,build)
for mat in bpy.data.materials:
    if mat.use_nodes:
        for node in list(mat.node_tree.nodes):
            if node.type in {'TEX_NOISE','BUMP'}:mat.node_tree.nodes.remove(node)
for obj in bpy.context.scene.objects:
    for modifier in obj.modifiers:
        if modifier.type=='BEVEL':modifier.segments=1 if modifier.width<=.005 else 2
    if obj.type=='CURVE':obj.data.bevel_resolution=1
geometry=[o for o in bpy.context.scene.objects if o.type in {'MESH','CURVE'}]
bpy.ops.object.select_all(action='DESELECT')
for obj in geometry:obj.select_set(True)
bpy.context.view_layer.objects.active=geometry[0];bpy.ops.object.convert(target='MESH')

root=group('GuardianGround',version=VERSION,level='ground',representative=True,
    physicalScale=False,assumption='look-model',units='Arbitrary drawing units, not meters.',upAxis='Y',
    description='Representative antenna, RF/baseband receiver, processing rack, archive, operations console and UPS; not an actual facility.',
    defaultCamera=[8.0,6.5,10.0],defaultTarget=[0.0,.8,0.0])
roles={name:group(name,root,role=name,representative=True) for name in ['Floor','Receive','Process','Operations','Receiver','Archive','Power']}
batches={}
for obj in list(bpy.context.scene.objects):
    if obj.type=='MESH':batches.setdefault((obj['assetRole'],tuple(m.name for m in obj.data.materials)),[]).append(obj)
for (role,names),objects in batches.items():
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects:obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    if len(objects)>1:bpy.ops.object.join()
    obj=bpy.context.object;obj.name=role+' — '+names[0];obj.parent=roles[role]
    obj['representative']=True;obj['solidForCamera']=True;obj['assetRole']=role

anchors=group('Anchors',root,role='Nonrendering interface anchors')
for name,point,role in [
    ('AnchorReceive',(-2.65,-.15,1.95),'Representative receive antenna'),
    ('AnchorProcess',(-.35,-.13,1.45),'Representative processing equipment'),
    ('AnchorOperations',(2.20,-.22,1.38),'Representative operator console'),
    ('AnchorReceiver',(-2.65,-3.30,1.355),'Representative RF and baseband receiver cabinet'),
    ('AnchorArchive',(-.35,-3.30,1.735),'Representative mission-data archive cabinet'),
    ('AnchorPower',(2.20,-3.90,1.065),'Representative UPS and facility distribution'),
]:
    obj=group(name,anchors,role=role,representative=True,threePosition=[point[0],point[2],-point[1]])
    obj.location=point

bpy.context.view_layer.update();points=[];triangles=0
for obj in bpy.context.scene.objects:
    if obj.type!='MESH':continue
    obj.data.calc_loop_triangles();triangles+=len(obj.data.loop_triangles)
    points.extend(obj.matrix_world@v.co for v in obj.data.vertices)
converted=[Vector((p.x,p.z,-p.y)) for p in points]
low=[min(p[i] for p in converted) for i in range(3)]
high=[max(p[i] for p in converted) for i in range(3)]
root['boundingBoxMin']=low;root['boundingBoxMax']=high
root['triangleCount']=triangles;root['materialRoleBatches']=len(batches)
root['maximumDrawingRadius']=max(p.length for p in points)
assert triangles<=45000,'Ground asset triangle budget exceeded'
path=OUT/'ground.glb'
bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,export_extras=True,
    export_apply=True,export_animations=False,export_cameras=False,export_lights=False,
    export_materials='EXPORT',export_normals=True)
print('GROUND_ASSET',path,'version',VERSION,'bytes',path.stat().st_size,'triangles',triangles,
    'batches',len(batches),'bounds',low,high,flush=True)
