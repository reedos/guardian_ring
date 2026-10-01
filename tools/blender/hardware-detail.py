"""Shared manufactured-detail helpers. Native coordinates are Three.js Y-up.
All values are arbitrary drawing units and all counts/layouts are as drawn.
No manufacturer CAD, logos, part numbers or real-system dimensions.
"""
import bpy, math, random
from mathutils import Vector

ROLE='Structure'
def role(name):
    global ROLE
    ROLE=name
def p(v):return (v[0],-v[2],v[1])
def material(name,color,metal=0,rough=.4,emit=0):
    m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=(*color,1)
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1)
    bs.inputs['Metallic'].default_value=metal;bs.inputs['Roughness'].default_value=rough
    bs.inputs['Emission Color'].default_value=(*color,1);bs.inputs['Emission Strength'].default_value=emit
    return m
def palette():
    return {k:material(n,c,me,ro,em) for k,n,c,me,ro,em in [
        ('silver','Machined satin aluminum',(.43,.52,.61),.66,.32,0),
        ('edge','Polished hardware edges',(.67,.73,.79),.75,.25,0),
        ('dark','Anodized chassis',(.029,.043,.056),.42,.42,0),
        ('black','Optical and connector recess',(.006,.012,.02),.08,.58,0),
        ('gold','Representative MLI outer layer',(.56,.31,.09),.66,.34,0),
        ('goldedge','MLI seams and gold contacts',(.75,.48,.16),.68,.29,0),
        ('foilback','MLI inner layer',(.28,.34,.39),.58,.48,0),
        ('white','Radiator coating',(.67,.72,.74),.12,.52,0),
        ('solar','Blue photovoltaic cells',(.013,.042,.11),.39,.31,0),
        ('solar2','Photovoltaic cell variation',(.023,.075,.16),.44,.30,0),
        ('pcb','Midnight circuit laminate',(.025,.083,.070),.14,.54,0),
        ('chip','Ceramic circuit packages',(.055,.077,.098),.23,.42,0),
        ('copper','Copper routing and thermal braid',(.52,.29,.12),.57,.32,0),
        ('cyan','Cold-stage false color',(.15,.40,.53),.48,.32,0),
        ('cyanedge','Cold-stage edge',(.29,.68,.83),.4,.33,.03),
        ('battery','Representative battery module sleeve',(.15,.20,.24),.30,.46,0),
        ('loom','Harness protective sleeve',(.028,.035,.047),.04,.68,0),
        ('mirror','Reflective optical surface',(.58,.69,.79),.92,.12,0),
        ('status','Uncalibrated status indicator',(.12,.44,.53),.15,.35,.3),
    ]}
def finish(o,name,mat,bevel=0,smooth=True):
    o.name=name;o.data.materials.append(mat);o['assetRole']=ROLE;o['representative']=True;o['solidForCamera']=True
    if bevel:
        b=o.modifiers.new('Manufactured chamfer','BEVEL');b.width=bevel;b.segments=1 if bevel<=.007 else 2
    if smooth:
        for f in o.data.polygons:f.use_smooth=True
        o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL')
    return o
def box(name,at,size,mat,bevel=.012):
    verts=[p((x*size[0]/2,y*size[1]/2,z*size[2]/2)) for z in [-1,1] for y in [-1,1] for x in [-1,1]]
    faces=[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]
    data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update()
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);o.location=p(at)
    return finish(o,name,mat,bevel)
def cyl(name,at,radius,depth,mat,axis='y',segments=24,bevel=.008):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segments,radius=radius,depth=depth,location=p(at));o=bpy.context.object
    if axis=='x':o.rotation_euler.y=math.pi/2
    if axis=='z':o.rotation_euler.x=math.pi/2
    return finish(o,name,mat,bevel)
def sphere(name,at,size,mat,segments=24,rings=14):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1,location=p(at));o=bpy.context.object;o.scale=(size[0],size[2],size[1]);return finish(o,name,mat)
def line(name,points,radius,mat):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=1
    s=c.splines.new('POLY');s.points.add(len(points)-1)
    for v,q in zip(s.points,points):v.co=(*p(q),1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);c.materials.append(mat);o['assetRole']=ROLE;o['representative']=True;o['solidForCamera']=True;return o
def rod(name,a,b,r,mat):
    av,bv=Vector(p(a)),Vector(p(b));o=cyl(name,((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),r,(bv-av).length,mat,segments=16,bevel=.004)
    o.rotation_euler=(bv-av).to_track_quat('Z','Y').to_euler();return o
def ring(name,at,outer,inner,depth,mat,axis='z',segments=48):
    verts=[];faces=[]
    for d in [-depth/2,depth/2]:
        for r in [inner,outer]:
            for i in range(segments):
                a=i*math.tau/segments;q=(r*math.cos(a),r*math.sin(a),d)
                if axis=='y':q=(q[0],q[2],q[1])
                if axis=='x':q=(q[2],q[0],q[1])
                verts.append(p(tuple(at[j]+q[j] for j in range(3))))
    for i in range(segments):
        n=(i+1)%segments;faces.extend([(i,n,n+segments,i+segments),(i+2*segments,i+3*segments,n+3*segments,n+2*segments),(i,i+2*segments,n+2*segments,n),(i+segments,n+segments,n+3*segments,i+3*segments)])
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);return finish(o,name,mat,.003)
def screw(at,mat,axis='y',r=.027):
    cyl('Captive fastener as drawn',at,r,r*.55,mat,axis,12,.003)
def foil(name,center,u,v,normal,mat,seed=19):
    rng=random.Random(seed);n=16;verts=[];faces=[]
    for j in range(n+1):
        for i in range(n+1):
            a,b=i/n-.5,j/n-.5;wave=.015*math.sin(math.pi*i/n)*math.sin(math.pi*j/n)*rng.uniform(-1,1)
            q=Vector(center)+Vector(u)*a+Vector(v)*b+Vector(normal)*wave;verts.append(p(q))
    for j in range(n):
        for i in range(n):
            k=j*(n+1)+i;faces.extend([(k,k+1,k+n+2),(k,k+n+2,k+n+1)])
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);return finish(o,name,mat,smooth=False)
def enclosure(name,at,size,m,open_top=False):
    x,y,z=at;w,h,d=size;t=.035
    box(name+' base',(x,y-h/2+t/2,z),(w,t,d),m['silver'])
    for sx in [-1,1]:box(name+' side wall',(x+sx*(w-t)/2,y+t/2,z),(t,h-t,d),m['silver'])
    for sz in [-1,1]:box(name+' end wall',(x,y+t/2,z+sz*(d-t)/2),(w-2*t,h-t,t),m['dark'])
    if not open_top:box(name+' cover',(x,y+h/2+.012,z),(w+.015,.024,d+.015),m['dark'],.008)
    for sx in [-1,1]:
        for sz in [-1,1]:screw((x+sx*(w/2-.07),y+h/2+.031,z+sz*(d/2-.07)),m['edge'],r=.024)
def board(name,at,size,m,variant=0):
    x,y,z=at;w,d=size
    box(name+' laminate',(x,y,z),(w,.037,d),m['pcb'],.005)
    for xoff,zoff,sw,sd in [(-.20*w,-.12*d,.29*w,.30*d),(.23*w,.18*d,.26*w,.23*d)]:
        box(name+' circuit package',(x+xoff,y+.074,z+zoff),(sw,.09,sd),m['chip'],.007)
        box(name+' package cap',(x+xoff,y+.122,z+zoff),(sw*.75,.013,sd*.72),m['dark'],.003)
        for s in [-1,1]:
            for i in range(5):box(name+' package lead',(x+xoff+s*(sw/2+.018),y+.055,z+zoff+(i-2)*sd/6),(.045,.018,.014),m['goldedge'],0)
    for i in range(7):
        zz=z-d*.40+i*d*.13
        line(name+' representative routing',[(x-w*.44,y+.024,zz),(x-w*.29,y+.024,zz),(x-w*.22,y+.024,zz+.04)],.004,m['copper'])
    for i in range(4):box(name+' discrete package',(x+w*.37,y+.054,z+(i-1.5)*d*.18),(.08,.060,.05),m['chip'],.004)
def connector(name,at,width,m,axis='z'):
    x,y,z=at
    box(name+' shell',(x,y,z),(width,.12,.12),m['silver'],.01)
    box(name+' insert',(x,y,z+.067),(width-.045,.075,.016),m['black'],.004)
    for i in range(6):cyl(name+' contact',(x+(i-2.5)*(width-.08)/6,y,z+.080),.010,.018,m['goldedge'],'z',8,0)
def ribbon(name,points,width,mat):
    verts=[]
    for q in points:
        for dx in [-width/2,width/2]:verts.append(p((q[0]+dx,q[1],q[2])))
    faces=[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(points)-1)]
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);finish(o,name,mat,.005)
    s=o.modifiers.new('Ribbon thickness','SOLIDIFY');s.thickness=.015;return o
def export(path,rootname,version,level,anchors,description):
    for o in bpy.context.scene.objects:
        if o.type=='CURVE':o.data.resolution_u=1
    geometry=[o for o in bpy.context.scene.objects if o.type in {'MESH','CURVE'}]
    bpy.ops.object.select_all(action='DESELECT')
    for o in geometry:o.select_set(True)
    bpy.context.view_layer.objects.active=geometry[0];bpy.ops.object.convert(target='MESH')
    root=bpy.data.objects.new(rootname,None);bpy.context.collection.objects.link(root)
    for k,v in dict(version=version,level=level,representative=True,physicalScale=False,assumption='look-model',description=description,units='Arbitrary drawing units; component counts and layout as drawn.',upAxis='Y').items():root[k]=v
    batches={};groups={}
    for o in list(bpy.context.scene.objects):
        if o.type=='MESH':batches.setdefault((o.get('assetRole','Structure'),tuple(mt.name for mt in o.data.materials)),[]).append(o)
    for (r,names),objects in batches.items():
        if r not in groups:
            g=bpy.data.objects.new(r,None);bpy.context.collection.objects.link(g);g.parent=root;g['representative']=True;groups[r]=g
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects:o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]
        if len(objects)>1:bpy.ops.object.join()
        o=bpy.context.object;o.name=r+' — '+names[0];o.parent=groups[r];o['representative']=True;o['solidForCamera']=True
    for name,q in anchors.items():
        o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);o.parent=root;o.location=p(q);o['threePosition']=q;o['representative']=True
    bpy.context.view_layer.update();verts=[];tris=0
    for o in bpy.context.scene.objects:
        if o.type!='MESH':continue
        o.data.calc_loop_triangles();tris+=len(o.data.loop_triangles)
        verts.extend(o.matrix_world@v.co for v in o.data.vertices)
    points=[Vector((v.x,v.z,-v.y)) for v in verts]
    lo=[min(q[i] for q in points) for i in range(3)];hi=[max(q[i] for q in points) for i in range(3)]
    root['boundingBoxMin']=lo;root['boundingBoxMax']=hi;root['triangleCount']=tris;root['materialRoleBatches']=len(batches)
    path.parent.mkdir(parents=True,exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',export_yup=True,export_extras=True,export_apply=True,export_animations=False,export_cameras=False,export_lights=False)
    print('DETAILED_ASSET',path.name,'v',version,'bytes',path.stat().st_size,'triangles',tris,'batches',len(batches),'bounds',lo,hi,flush=True)
