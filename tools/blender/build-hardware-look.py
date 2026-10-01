"""Phase 2 hardware stills: Blender-authored, representative educational geometry.

No dimensions, counts, optical prescription, detector format or materials here
describe a real military payload. Mesh coordinates are arbitrary drawing units.
The exploded spacing, surface detail and amber/cyan highlights are artistic
assumptions, not a calculation of optics, radiometry or thermal performance.

Run with Blender 5.2 --background --python tools/blender/build-hardware-look.py
Optional script arguments after --: satellite payload focal-plane pixel
Design basis: IF build-compute.py/build-cpo.py manufactured edges and restrained
finishes, and render-compute-studio.py dark product lighting. No IF assets copied.
"""
import bpy, math, sys, random
from pathlib import Path
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'research' / 'look' / 'renders'
OUT.mkdir(parents=True, exist_ok=True)
KINDS = ['satellite', 'payload', 'focal-plane', 'pixel']
requested = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
KINDS = [kind for kind in KINDS if not requested or kind in requested]


def material(name, color, metal=0, rough=.4, emission=0, texture=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    mat.diffuse_color = (*color, 1)
    nodes = mat.node_tree.nodes
    p = nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Metallic'].default_value = metal
    p.inputs['Roughness'].default_value = rough
    if emission:
        p.inputs['Emission Color'].default_value = (*color, 1)
        p.inputs['Emission Strength'].default_value = emission
    if texture:
        noise = nodes.new('ShaderNodeTexNoise')
        noise.inputs['Scale'].default_value = 42
        noise.inputs['Detail'].default_value = 3
        bump = nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .23
        bump.inputs['Distance'].default_value = .026
        mat.node_tree.links.new(noise.outputs['Fac'], bump.inputs['Height'])
        mat.node_tree.links.new(bump.outputs['Normal'], p.inputs['Normal'])
    return mat


def palette():
    return {
        'gold': material('Schematic thermal blanket — amber gold', (.62, .33, .085), .85, .31, texture=True),
        'goldedge': material('Folded blanket edging', (.75, .48, .14), .75, .29),
        'dark': material('Black anodized aluminum', (.022, .032, .045), .63, .34),
        'black': material('Optical baffle black', (.006, .009, .016), .2, .55),
        'silver': material('Machined aluminum', (.47, .56, .64), .85, .28),
        'bright': material('Polished fasteners', (.7, .77, .83), .9, .21),
        'white': material('Pale radiator finish', (.68, .73, .75), .18, .43),
        'solar': material('Representative blue photovoltaic face', (.014, .04, .11), .7, .22),
        'solar2': material('Subtle cell variation', (.022, .063, .155), .73, .23),
        'trace': material('Representative gold metallization', (.7, .4, .1), .8, .25),
        'mirror': material('Illustrative mirror', (.66, .76, .87), .97, .11),
        'cyan': material('False-color cold stage', (.20, .48, .65), .68, .29),
        'coldedge': material('Cold-stage highlight', (.30, .71, .91), .5, .28, .08),
        'silicon': material('Representative detector surface', (.025, .046, .095), .73, .24),
        'pcb': material('Warm electronics laminate', (.033, .059, .055), .15, .51),
        'ceramic': material('Ceramic contact carrier', (.12, .15, .2), .36, .43),
        'amber': material('Illustrative light path — not a ray trace', (.98, .52, .17), .08, .35, 2.4),
        'strap': material('Thermal braid schematic', (.55, .64, .7), .86, .26),
    }


def finish(obj, name, mat, bevel=0, smooth=True):
    obj.name = name
    obj.data.materials.append(mat)
    if bevel:
        modifier = obj.modifiers.new('Authored manufactured edge', 'BEVEL')
        modifier.width = bevel
        modifier.segments = 3
    if smooth:
        for face in obj.data.polygons:
            face.use_smooth = True
        obj.modifiers.new('Face weighted normals', 'WEIGHTED_NORMAL')
    obj['representative'] = True
    return obj


def box(name, pos, size, mat, bevel=.02):
    bpy.ops.mesh.primitive_cube_add(size=1, location=pos)
    obj = bpy.context.object
    obj.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish(obj, name, mat, bevel)


def cylinder(name, pos, radius, depth, mat, axis='z', vertices=48, bevel=.012):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=pos)
    obj = bpy.context.object
    if axis == 'x': obj.rotation_euler.y = math.pi / 2
    if axis == 'y': obj.rotation_euler.x = math.pi / 2
    return finish(obj, name, mat, bevel)


def sphere(name, pos, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=20, radius=1, location=pos)
    obj = bpy.context.object
    obj.scale = scale
    return finish(obj, name, mat)


def line(name, pts, radius, mat):
    data = bpy.data.curves.new(name, 'CURVE')
    data.dimensions = '3D'
    data.resolution_u = 12
    data.bevel_depth = radius
    data.bevel_resolution = 3
    spline = data.splines.new('POLY')
    spline.points.add(len(pts) - 1)
    for point, coord in zip(spline.points, pts): point.co = (*coord, 1)
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(mat)
    obj['representative'] = True
    return obj


def fastener(pos, mat, axis='z', radius=.028):
    cylinder('Captive fastener — as drawn', pos, radius, radius * .44, mat, axis=axis, vertices=16, bevel=.003)


def ring_y(name, y, outer, inner, mat, depth=.045, start=0, end=math.tau, center=(0, 0)):
    count = max(24, round(72 * (end-start) / math.tau))
    verts, faces = [], []
    for yy in [y-depth/2, y+depth/2]:
        for rr in [inner, outer]:
            for i in range(count + 1):
                angle = start+(end-start)*i/count
                verts.append((center[0]+rr*math.cos(angle), yy, center[1]+rr*math.sin(angle)))
    stride = count + 1
    for i in range(count):
        faces.extend([(i, i+1, i+1+stride, i+stride), (i+2*stride, i+3*stride, i+1+3*stride, i+1+2*stride),
                      (i, i+2*stride, i+1+2*stride, i+1), (i+stride, i+1+stride, i+1+3*stride, i+3*stride)])
    faces.extend([(0,stride,3*stride,2*stride), (count,count+2*stride,count+3*stride,count+stride)])
    data=bpy.data.meshes.new(name);data.from_pydata(verts, [], faces);data.update()
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat,.005)


def foil_face(name, center, u, v, normal, mat, seed):
    rng=random.Random(seed); count=17; verts=[]
    for iy in range(count+1):
        for ix in range(count+1):
            x, y = ix/count-.5, iy/count-.5
            amplitude = .018*math.sin(math.pi*ix/count)*math.sin(math.pi*iy/count)
            p=Vector(center)+Vector(u)*x+Vector(v)*y+Vector(normal)*(rng.uniform(-1,1)*amplitude)
            verts.append(tuple(p))
    faces=[]
    for y in range(count):
        for x in range(count):
            i=y*(count+1)+x
            faces.extend([(i,i+1,i+count+2),(i,i+count+2,i+count+1)])
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    finish(obj,name,mat,smooth=False)


def satellite(m):
    box('Representative spacecraft bus', (0,0,0), (1.65,1.5,1.65), m['gold'], .07)
    foil_face('Folded front thermal blanket',(0,-.758,0),(1.55,0,0),(0,0,1.56),(0,-1,0),m['gold'],11)
    foil_face('Folded bus side blanket',(-.834,0,0),(0,1.4,0),(0,0,1.56),(-1,0,0),m['gold'],29)
    for z in [-.72,.72]:
        box('Blanket seam', (0,-.784,z),(1.58,.028,.022),m['goldedge'],.005)
    for x in [-.74,.74]:
        box('Blanket corner binding',(x,-.784,0),(.026,.03,1.5),m['goldedge'],.007)
    # One pale radiator face, without implied area or thermal budget.
    box('Representative radiator',( .854,0,0),(.075,1.31,1.36),m['white'],.023)
    for z in [i*.14-.56 for i in range(9)]:
        box('Radiator surface channel',(.897,0,z),(.009,1.23,.013),m['silver'],.003)
    # Wings are drawing-scale composition, not a sourced panel count or area.
    for side in [-1,1]:
        cylinder('Array root hinge',(side*.97,0,.05),.13,.34,m['silver'],'x')
        for panel in range(2):
            cx=side*(1.82+panel*1.34)
            box('Array panel perimeter',(cx,.085,.07),(1.31,.10,2.16),m['silver'],.018)
            box('Array dark substrate',(cx,.024,.07),(1.25,.032,2.09),m['dark'],.005)
            for row in range(10):
                for col in range(6):
                    x=cx+(col-2.5)*.199;z=.07+(row-4.5)*.202
                    box('Schematic photovoltaic cell',(x,-.003,z),(.187,.012,.188),m['solar2'] if (row+col)%5==0 else m['solar'],.002)
                    for offset in [-.044,.044]:
                        box('Photovoltaic conductor',(x+offset,-.011,z),(.003,.002,.178),m['silver'],0)
            for z in [-1.05,1.19]: box('Array edge rail',(cx,.055,z),(1.34,.14,.024),m['dark'],.006)
            if panel==0: cylinder('Panel deployment hinge',(side*2.495,.06,.07),.062,.24,m['silver'],'z')
        line('Deployment brace',[(side*.77,.25,-.42),(side*1.38,.19,-.73),(side*2.35,.12,-.83)],.03,m['silver'])
    # Generic telescope housing tilted toward the viewer, no optical prescription.
    cylinder('Payload mounting pedestal',(0,.0,1.02),.5,.3,m['dark'])
    cylinder('Shaded payload housing',(0,.13,1.50),.57,1.30,m['silver'],'y')
    cylinder('Dark front aperture',(0,-.535,1.50),.47,.024,m['black'],'y')
    for y in [-.58,-.65,-.72]: ring_y('Sunshade aperture baffle',y,.63,.49,m['dark'],.09,center=(0,1.50))
    ring_y('Sunshade lip',-.81,.66,.51,m['silver'],.045,center=(0,1.50))
    cylinder('Recessed schematic optic',(0,-.565,1.50),.34,.02,m['silicon'],'y')
    for x in [-.52,.52]: box('Payload support',(x,.22,1.02),(.10,.8,.34),m['dark'],.015)
    # Antenna proxy and compact avionics external housing; no manufacturer identity.
    line('Antenna mast',[(-.45,.18,.80),(-.45,.18,1.58),(-.72,.2,1.85)],.026,m['silver'])
    sphere('Representative communications element',(-.77,.21,1.90),(.30,.07,.25),m['white'])
    box('External electronics cover',(-.54,-.83,-.18),(.40,.16,.34),m['dark'],.025)
    for x in [-.65,-.42]: fastener((x,-.92,-.17),m['bright'],'y')
    return (0,0,.30), (8,-13,8), (11,-14,11)


def mirror(name, y, radius, hole, sag, mat):
    vertices=[];faces=[];rings=12;segments=72
    for r in range(rings+1):
        rr=hole+(radius-hole)*r/rings
        for a in range(segments):
            angle=math.tau*a/segments
            vertices.append((rr*math.cos(angle),y+sag*(rr/radius)**2,rr*math.sin(angle)))
    for r in range(rings):
        for a in range(segments):
            b=(a+1)%segments; faces.append((r*segments+a,r*segments+b,(r+1)*segments+b,(r+1)*segments+a))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
    return finish(obj,name,mat)


def payload(m):
    start,end=math.radians(104),math.radians(338)
    # Open drawing shell lets the public reflective-optics concept be visible.
    ring_y('Cutaway telescope barrel',0,1.075,1.015,m['dark'],2.65,start,end)
    for y in [-1.48,-1.25,-.78,-.25,.35,1.18]:
        ring_y('Exposed baffle section',y,1.08,.85 if y<0 else .98,m['black'],.060,start,end)
        ring_y('Machined rim edge',y,1.105,1.075,m['silver'],.031,start,end)
    ring_y('Front aperture rim',-1.62,1.13,1.005,m['silver'],.11,start,end)
    ring_y('Rear mirror mount',1.20,1.04,.85,m['silver'],.10)
    mirror('Representative primary reflective surface',1.10,.91,.16,.11,m['mirror'])
    ring_y('Mirror retaining ring',1.30,.955,.91,m['dark'],.052)
    cylinder('Representative secondary mount',(0,-.72,0),.23,.12,m['dark'],'y')
    mirror('Representative secondary reflective surface',-.79,.21,0,-.028,m['mirror'])
    for angle in [0,2*math.pi/3,4*math.pi/3]:
        line('Secondary support vane',[(.21*math.cos(angle),-.73,.21*math.sin(angle)),(.99*math.cos(angle),-.73,.99*math.sin(angle))],.014,m['silver'])
    cylinder('Schematic detector housing',(0,1.68,0),.28,.42,m['cyan'],'y')
    ring_y('Cold housing collar',1.52,.31,.24,m['silver'],.06)
    box('Representative readout cover',(.47,1.7,-.12),(.46,.47,.38),m['dark'],.023)
    for x in [-.73,.73]:
        box('Instrument support rail',(x,-.1,-1.19),(.13,3.05,.16),m['silver'],.015)
        for y in [-1.35,1.22]:
            box('Foot mount',(x,y,-1.33),(.40,.32,.13),m['dark'],.012)
            fastener((x,y,-1.255),m['bright'],radius=.045)
    # Teaching lines illustrate reflection only; deliberately not an optical prescription.
    for x,z in [(-.48,.32),(.45,.32),(-.35,-.44)]:
        line('Illustrative reflected light path',[(x,-2.02,z),(x,1.12,z),(x*.20,-.80,z*.20),(0,1.82,0)],.008,m['amber'])
    return (0,0,-.02), (5,-7,5), (5,-7.5,7.3)


def ribbon(name, centers, width, mat):
    verts=[]
    for x,y,z in centers: verts.extend([(x,y-width/2,z),(x,y+width/2,z)])
    faces=[(i*2,i*2+1,i*2+3,i*2+2) for i in range(len(centers)-1)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(mat)
    solid=obj.modifiers.new('Flex thickness','SOLIDIFY');solid.thickness=.016
    bevel=obj.modifiers.new('Fold finish','BEVEL');bevel.width=.009;bevel.segments=3
    obj['representative']=True
    return obj


def focal_plane(m):
    box('Detector carrier plinth',(-.65,0,-.07),(2.30,2.1,.20),m['dark'],.065)
    box('False-color cold plate',(-.65,0,.10),(2.07,1.88,.19),m['cyan'],.055)
    box('Machined inner cold carrier',(-.65,0,.26),(1.68,1.57,.15),m['silver'],.03)
    box('Detector package rim',(-.65,0,.38),(1.41,1.32,.10),m['trace'],.018)
    box('Representative detector — no array format',(-.65,0,.445),(1.18,1.09,.070),m['silicon'],.013)
    # Bond fingers suggest a package perimeter, without depicting a pixel count.
    for side in [-1,1]:
        for i in range(18):
            yy=-.51+i*.06
            line('Gold package bond',[( -.65+side*.58,yy,.485),(-.65+side*.64,yy,.53),(-.65+side*.74,yy,.34)],.0045,m['trace'])
    for x in [-1.50,.20]:
        for y in [-.76,.76]: fastener((x,y,.22),m['bright'],radius=.05)
    for y in [-.79,.79]:
        box('Cold-stage chamfer accent',(-.65,y,.203),(1.52,.018,.018),m['coldedge'],.004)
    # Warm readout electronics, spatially separate from the cold carrier.
    box('Warm electronics support',(2.04,.10,-.06),(1.43,2.06,.12),m['silver'],.035)
    box('Warm readout board',(2.04,.1,.035),(1.32,1.94,.075),m['pcb'],.020)
    for x,y,sx,sy in [(2.11,.29,.65,.60),(2.10,-.50,.48,.42),(1.65,.73,.20,.23)]:
        box('Representative readout component',(x,y,.15),(sx,sy,.16),m['dark'],.025)
        box('Readout cover accent',(x,y,.238),(sx*.78,sy*.78,.013),m['ceramic'],.006)
    for i in range(12):
        y=-.76+i*.13
        line('PCB gold routing',[(1.50,y,.077),(1.67,y,.077),(1.78,y+.045,.077)],.006,m['trace'])
    for y in [-.69,.69]:
        for x in [1.54,2.55]: fastener((x,y,.10),m['bright'])
    # Gold flex stays visually legible between cold and warm regions.
    centers=[(.18,-.26,.32),(.45,-.26,.30),(.68,-.26,.12),(.93,-.26,.035),(1.17,-.26,.04),(1.40,-.26,.13),(1.55,-.26,.14)]
    ribbon('Representative flex connection',centers,.67,m['goldedge'])
    for j in range(9):
        line('Flex conductor',[(x,y+(j-4)*.059,z+.014) for x,y,z in centers],.006,m['trace'])
    # Representative cold finger and cooler form; no temperature or power claim.
    cylinder('Cooler body',(.54,1.36,.10),.29,1.42,m['silver'],'x')
    for x in [.1,.3,.5,.7,.9]: cylinder('Cooler housing fin',(x,1.36,.10),.315,.040,m['dark'],'x')
    cylinder('Cold finger',(-.46,1.36,.10),.13,.61,m['cyan'],'x')
    for j in range(6):
        ribbon('Thermal strap leaf',[(-.63,1.30,.1),(-.74,1.10,.14),(-.77,.90,.18),(-.77,.78,.22)],.12,m['strap']).location.x=j*.025
    line('Warm harness',[(2.50,.76,.10),(2.70,.93,.12),(2.65,1.21,.12),(1.28,1.37,.12)],.04,m['dark'])
    return (.48,.25,.05), (6,-8,7.0), (6,-8,9.8)


def pixel(m):
    # Separated drawing layers are exaggerated for teaching, not to scale.
    box('Representative readout carrier',(0,0,-.03),(2.35,1.96,.18),m['pcb'],.050)
    box('Readout integrated circuit',(0,0,.16),(2.08,1.72,.19),m['ceramic'],.035)
    box('Readout active face',(0,0,.265),(1.89,1.55,.024),m['silicon'],.012)
    for side in [-1,1]:
        for i in range(12):
            x=-.86+i*.156
            box('Readout bonding pad',(x,side*.90,.075),(.075,.11,.025),m['trace'],.004)
    for j in range(7):
        y=-.55+j*.14
        line('Schematic readout routing',[(-.82,y,.283),(-.40,y,.283),(-.24,y*.64,.283),(.58,y*.64,.283)],.008,m['trace'])
    for x,y,sx,sy in [(.44,.21,.39,.29),(-.48,-.27,.27,.35)]:
        box('Illustrative circuit region',(x,y,.302),(sx,sy,.044),m['dark'],.007)
    # A single connection is shown because this is one pixel, not an array.
    cylinder('Lower indium contact',(0,0,.67),.24,.055,m['trace'])
    sphere('Schematic indium bump',(0,0,1.10),(.24,.24,.29),m['bright'])
    cylinder('Upper indium contact',(0,0,1.52),.24,.055,m['trace'])
    box('Contact metallization',(0,0,1.82),(1.68,1.39,.070),m['trace'],.018)
    box('Representative absorber layer',(0,0,2.30),(1.75,1.46,.18),m['silicon'],.025)
    box('Absorber entrance surface',(0,0,2.40),(1.64,1.36,.014),m['cyan'],.005)
    for side in [-1,1]:
        box('Absorber edge highlight',(side*.828,0,2.415),(.018,1.35,.014),m['coldedge'],.004)
    # Fine alignment guides are visually distinct from hardware.
    for x,y in [(-.84,-.70),(.84,.70)]:
        for j in range(13):
            z=.4+j*.145
            line('Exploded alignment guide',[(x,y,z),(x,y,z+.050)],.003,m['silver'])
    for x,y in [(-.4,-.14),(.10,.10),(.50,.3)]:
        line('Illustrative incident light',[(x-.15,y,3.09),(x,y,2.42)],.009,m['amber'])
        sphere('Light-path marker',(x-.12,y,2.96),(.024,.024,.044),m['amber'])
    return (0,0,1.38), (5,-7,5.9), (5,-7,5.5)


def point(obj, target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()


def area(name, pos, power, size, color, target):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    obj=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(obj);obj.location=pos;point(obj,target)


def setup_render(kind, target):
    scene=bpy.context.scene
    scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
    scene.cycles.max_bounces=6;scene.cycles.transparent_max_bounces=4
    # Prefer the installed GPU; retain an ordinary Cycles CPU fallback.
    try:
        prefs=bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type='OPTIX';prefs.get_devices()
        enabled=False
        for device in prefs.devices:
            device.use=device.type!='CPU';enabled|=device.use
        if enabled:scene.cycles.device='GPU'
    except Exception as exc:
        print('CPU_RENDER_FALLBACK',str(exc),flush=True)
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.color_depth='8'
    scene.render.resolution_percentage=100
    scene.render.film_transparent=False
    scene.view_settings.view_transform='AgX';scene.view_settings.look='AgX - Medium High Contrast'
    scene.world=bpy.data.worlds.new('Black space — no location implied');scene.world.use_nodes=True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value=(0,0,0,1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value=0
    # Warm sunlight and blue fill repeat the reference site's restrained studio.
    if kind=='satellite':
        area('Hard amber sunlight',(-3,-6,8),1800,1.6,(1,.79,.53),target)
        area('Cool solar-panel fill',(6,-4,5),1500,5.0,(.40,.63,1),target)
        area('Pale radiator rim',(3,5,6),1600,3.3,(.75,.88,1),target)
        area('Front instrument fill',(-5,-6,1),370,3.5,(.55,.70,1),target)
    else:
        area('Neutral broad key',(-4,-4,7),950,4.0,(.83,.90,1),target)
        area('Amber machined edge',(5,-3,4),720,2.0,(1,.70,.39),target)
        area('Cold rear rim',(-2,5,4),1050,2.2,(.32,.60,1),target)
        area('Subtle face lift',(1,-5,2),150,4.0,(.65,.78,1),target)


def render(kind, target, location, phone=False):
    scene=bpy.context.scene
    bpy.ops.object.camera_add(location=location)
    camera=bpy.context.object;camera.name='Portrait still camera' if phone else 'Landscape still camera'
    point(camera,target);camera.data.type='ORTHO';camera.data.lens=52;scene.camera=camera
    if phone and kind in ['satellite','focal-plane']:
        # Turn the wide assembly along the tall frame instead of shrinking it.
        camera.rotation_euler=(camera.rotation_euler.to_matrix() @ Matrix.Rotation(math.radians(24),3,'Z')).to_euler()
    width,height=(780,960) if phone else (1600,1000)
    scene.render.resolution_x=width;scene.render.resolution_y=height
    bpy.context.view_layer.update()
    # Fit all mesh/curve geometry, keeping a safe margin in both authored frames.
    inverse=camera.matrix_world.inverted();points=[]
    for obj in scene.objects:
        if obj.type in ['MESH','CURVE'] and not obj.hide_render:
            points.extend(inverse@(obj.matrix_world@Vector(corner)) for corner in obj.bound_box)
    low=[min(p[i] for p in points) for i in range(2)];high=[max(p[i] for p in points) for i in range(2)]
    # Blender AUTO sensor fit uses the longer frame dimension for ortho_scale.
    # Landscape therefore needs its width, while portrait needs its height.
    aspect=width/height
    span=max(high[0]-low[0],(high[1]-low[1])*aspect) if aspect>=1 else max(high[1]-low[1],(high[0]-low[0])/aspect)
    camera.data.ortho_scale=span*(1.17 if phone else 1.15)
    # Center visible bounds rather than the arbitrary modeling origin.
    offset=camera.rotation_euler.to_matrix()@Vector(((low[0]+high[0])/2,(low[1]+high[1])/2,0))
    camera.location+=offset
    suffix='-phone' if phone else ''
    scene.render.filepath=str(OUT/f'{kind}{suffix}.png')
    bpy.ops.render.render(write_still=True)
    print('LOOK_STILL',kind+suffix,width,height,scene.render.filepath,flush=True)
    bpy.data.objects.remove(camera,do_unlink=True)


for kind in KINDS:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    m=palette();target,landscape,portrait=globals()[kind.replace('-','_')](m)
    setup_render(kind,target)
    render(kind,target,landscape)
    render(kind,target,portrait,phone=True)
print('HARDWARE_LOOK_COMPLETE',','.join(KINDS),flush=True)
