"""Civil teaching helpers; arbitrary Three.js Y-up units. Geometry as drawn."""
import importlib.util, math, bpy
from pathlib import Path
from mathutils import Vector

def load_h():
    spec=importlib.util.spec_from_file_location('civil_hardware',Path(__file__).with_name('hardware-detail.py'))
    h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h);return h

def plate(h,m,name,center,size,normal,material='mirror',depth=.035):
    n=Vector(normal).normalized();u=Vector((0,1,0)).cross(n)
    if u.length<.01:u=Vector((1,0,0))
    u.normalize();v=n.cross(u).normalized();c=Vector(center);verts=[]
    for zz in [-1,1]:
        for yy in [-1,1]:
            for xx in [-1,1]:verts.append(h.p(c+u*xx*size[0]/2+v*yy*size[1]/2+n*zz*depth/2))
    faces=[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update()
    o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);return h.finish(o,name,m[material],.007)

def bench(h,m,at,size):
    h.role('Structure');x,y,z=at;w,d=size
    h.box('Open instrument bench',at,(w,.22,d),m['dark'],.045)
    for sx in [-1,1]:h.box('Machined edge rail',(x+sx*(w/2-.10),y+.15,z),(.085,.075,d-.22),m['silver'])
    for sz in [-1,1]:h.box('Machined edge rail',(x,y+.15,z+sz*(d/2-.10)),(w-.22,.075,.085),m['silver'])
    for xx in [x-w*.40,x,x+w*.40]:
        for zz in [z-d*.40,z+d*.40]:
            h.box('Instrument mounting shoe',(xx,y-.20,zz),(.55,.16,.42),m['silver'])
            h.screw((xx,y+.16,zz),m['edge'],r=.043)

def plaque(h,m,name,at,width=1.7):
    h.box(name+' role plate',at,(width,.035,.25),m['black'],.005)

def card(h,m,name,at,size=(1.4,.82),kind='digital'):
    x,y,z=at;w,d=size
    h.box(name+' conductive tray',(x,y-.07,z),(w+.12,.07,d+.10),m['silver'])
    h.board(name,at,size,m)
    for sx in [-1,1]:h.box(name+' guide',(x+sx*(w/2+.045),y+.07,z),(.04,.19,d+.06),m['edge'],.005)
    if kind=='power':
        for dx in [-.38,0,.38]:h.cyl(name+' representative inductor',(x+dx,y+.19,z-.18),.095,.13,m['copper'],segments=20)
        for dx in [-.32,-.10,.12,.34]:h.cyl(name+' representative capacitor',(x+dx,y+.12,z+.23),.05,.16,m['dark'],segments=16)
    elif kind=='drive':
        for dx in [-.35,0,.35]:h.box(name+' driver heat spreader',(x+dx,y+.23,z),(.22,.035,.27),m['edge'],.004)
    h.connector(name+' schematic electrical interface',(x,y+.05,z+d/2+.09),min(.66,w*.7),m)

def scan(h,m,name,at,normal,scale=1,axis='x'):
    x,y,z=at;s=scale
    h.box(name+' deck',(x,.08,z),(1.95*s,.12,1.15*s),m['silver'])
    plate(h,m,name+' mirror backing',at,(.94*s,.81*s),normal,'dark',.09)
    n=Vector(normal).normalized();plate(h,m,name+' optical face',Vector(at)+n*.061,(.84*s,.71*s),normal)
    if axis=='x':
        for sign in [-1,1]:
            xx=x+sign*.58*s
            h.box(name+' bearing support',(xx,y-.32,z),(.14*s,.66*s,.29*s),m['silver'])
            h.cyl(name+' bearing',(xx,y,z),.12*s,.16*s,m['dark'],'x',24)
            h.cyl(name+' shaft',(xx,y,z),.052*s,.36*s,m['edge'],'x',20)
        h.cyl(name+' motor',(x-.87*s,y,z),.20*s,.34*s,m['dark'],'x',24)
        h.cyl(name+' encoder',(x-1.095*s,y,z),.17*s,.075*s,m['silver'],'x',24)
    else:
        for xx in [x-.64*s,x+.64*s]:h.box(name+' yoke side',(xx,y,z),(.09*s,1.20*s,.21*s),m['silver'])
        for sign in [-1,1]:
            yy=y+sign*.58*s
            h.box(name+' yoke crossmember',(x,yy,z),(1.36*s,.09*s,.21*s),m['silver'])
            h.cyl(name+' bearing',(x,yy,z),.12*s,.12*s,m['dark'],'y',24)
            h.cyl(name+' shaft',(x,yy,z),.05*s,.28*s,m['edge'],'y',20)
        h.cyl(name+' motor',(x,y+.86*s,z),.20*s,.34*s,m['dark'],'y',24)
        h.cyl(name+' encoder',(x,y+1.075*s,z),.17*s,.065*s,m['silver'],'y',24)
    h.line(name+' drive harness',[(x-.88*s,y-.10,z),(x-.96*s,.20,z+.35*s),(x+.20,.20,z+.5*s)],.022,m['loom'])

def blackbody(h,m,name,at,r=.43):
    x,y,z=at
    h.box(name+' mount',(x,.04,z),(.98,.13,.92),m['silver'])
    h.ring(name+' recessed cavity',at,r,r*.65,.52,m['black'],'z',40)
    h.ring(name+' cavity rim',(x,y,z+.29),r*.99,r*.67,.05,m['silver'],'z',40)
    h.cyl(name+' cavity back',(x,y,z-.25),r*.64,.02,m['black'],'z',32,.002)
    for zz,rr in [(z-.12,r*.46),(z+.06,r*.55),(z+.20,r*.62)]:h.ring(name+' cavity contour',(x,y,zz),rr,rr-.018,.022,m['black'],'z',32)
    h.box(name+' temperature sensor',(x+r+.05,y-.10,z),(.14,.09,.13),m['edge'],.004)
    for yy in [y-.21,y,y+.21]:h.line(name+' heater schematic',[(x-r-.035,yy,z-.22),(x-r-.04,yy,z+.18)],.010,m['copper'])

def radiator(h,m,name,at,size=(2.0,1.5)):
    x,y,z=at;w,hh=size
    h.box(name+' backing',at,(w,.075,hh),m['silver'],.018)
    h.box(name+' emitting face',(x,y+.055,z),(w-.10,.024,hh-.10),m['white'],.012)
    for xx in [x-w*.33,x,x+w*.33]:h.box(name+' surface seam',(xx,y+.071,z),(.012,.008,hh-.18),m['silver'],.002)
    for zz in [z-hh*.30,z+hh*.30]:h.line(name+' heat pipe',[(x-w*.46,y-.066,zz),(x+w*.46,y-.066,zz)],.038,m['silver'])
    for xx in [x-w*.38,x+w*.38]:h.box(name+' support',(xx,y/2,z),(.08,max(.15,y),.20),m['dark'])

def raycheck(h,anchors,views):
    """CPU line-of-sight audit after geometry export has applied modifiers."""
    bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get();fail=[]
    for name,point in anchors.items():
        if name not in views:continue
        eye=Vector(h.p(views[name]));target=Vector(h.p(point));v=target-eye
        hit,loc,norm,idx,obj,matrix=bpy.context.scene.ray_cast(deps,eye,v.normalized(),distance=v.length-.025)
        if hit:fail.append((name,obj.name,round((target-loc).length,3)))
    print('CIVIL_CPU_ANCHOR_RAYS',len(views)-len(fail),'clear of',len(views),'failures',fail,flush=True)
    assert not fail, str(fail)

if __name__=='__main__':
    # A CPU-only check can be run independently without rebuilding the GLB:
    # blender --background --python civil-detail.py -- abi
    import sys,re,json
    kind=sys.argv[sys.argv.index('--')+1]
    root=Path(__file__).resolve().parents[2];h=load_h()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(root/'public/models'/f'{kind}.glb'))
    text=(root/'src/scenes'/f'side-{kind}.js').read_text(encoding='utf8')
    views=text.split('views:{',1)[1].split('labels:',1)[0]
    vector=lambda v:[float(n) for n in v.split(',')]
    eyes={a or b:vector(v) for a,b,v in re.findall(r"(?:'([^']+)'|([\w-]+)):\{pos:\[([^]]+)\]",views)}
    pattern=r"text:'([^']+)',p:\[([^]]+)\],size:\[([^]]+)\],([^}]*?)partIds:\['([^']+)'\]"
    deps=bpy.context.evaluated_depsgraph_get();fail=[]
    for label,pos,size,options,part in re.findall(pattern,text):
        at=vector(pos);wh=vector(size);eye=Vector(h.p(eyes[part]));hits=[]
        for sx in [-.48,-.24,0,.24,.48]:
            for sz in [-.48,-.24,0,.24,.48]:
                point=(at[0]+sx*wh[0],at[1]+sz*wh[1],at[2]+.006) if "face:'front'" in options else (at[0]+sx*wh[0],at[1]+.006,at[2]+sz*wh[1])
                q=Vector(h.p(point));d=q-eye
                hit,loc,n,idx,obj,matrix=bpy.context.scene.ray_cast(deps,eye,d.normalized(),distance=d.length-.002)
                if hit:hits.append(obj.name)
        if hits:fail.append((part,label,sorted(set(hits))))
    print('CIVIL_CPU_LABEL_RAYS',kind,'failures',fail,flush=True)
    assert not fail,str(fail)
