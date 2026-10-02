"""Public civil-instrument component vocabulary, in a representative exploded layout.

ABI Data Book sections 3.2–3.3 establish the roles, not these dimensions, routing,
package counts or optical prescription. Native coordinates are Three.js Y-up.
"""
import bpy, math
from mathutils import Vector


def optic(h, name, center, size, normal, mat, depth=.045):
    """A manufactured optical plate with a deliberately schematic orientation."""
    n=Vector(normal).normalized();u=Vector((0,1,0)).cross(n)
    if u.length<.01:u=Vector((1,0,0))
    u.normalize();v=n.cross(u).normalized();c=Vector(center);verts=[]
    for z in [-1,1]:
        for y in [-1,1]:
            for x in [-1,1]:verts.append(h.p(c+u*x*size[0]/2+v*y*size[1]/2+n*z*depth/2))
    faces=[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)]
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(o);h.finish(o,name,mat,.006)
    return o


def scan_axis(h,m,name,at,axis,normal):
    x,y,z=at;h.role('ScanSystem')
    # Mirror, backing rib, trunnions, opposed support bearing and motor/encoder.
    optic(h,name+' mirror backing',at,(.94,.76),normal,m['dark'],.095)
    p=Vector(at)+Vector(normal).normalized()*.059
    optic(h,name+' reflective face',p,(.84,.66),normal,m['mirror'],.016)
    if axis=='x':
        for s in [-1,1]:
            h.cyl(name+' pivot shaft',(x+s*.64,y,z),.064,.46,m['edge'],'x',24)
            h.box(name+' bearing pedestal',(x+s*.72,y-.36,z),(.19,.65,.34),m['silver'])
            h.ring(name+' support bearing',(x+s*.72,y,z),.14,.070,.14,m['dark'],'x',32)
        drive=(x-.97,y,z);enc=(x-1.20,y,z)
    else:
        for s in [-1,1]:
            h.cyl(name+' pivot shaft',(x,y+s*.54,z),.055,.29,m['edge'],'y',24)
        for xx in [x-.60,x+.60]:h.box(name+' yoke side',(xx,y-.14,z),(.10,1.10,.19),m['silver'])
        for yy in [y-.65,y+.43]:h.box(name+' yoke crossmember',(x,yy,z),(1.27,.10,.19),m['silver'])
        h.ring(name+' support bearing',(x,y+.49,z),.13,.065,.12,m['dark'],'y',32)
        drive=(x,y-.80,z);enc=(x,y-1.04,z)
    h.cyl(name+' scan-drive motor',drive,.21,.32,m['dark'],axis,32,.013)
    h.cyl(name+' optical encoder housing',enc,.18,.075,m['silver'],axis,32,.008)
    # One exposed encoder service face, no count or resolution encoding.
    q=Vector(enc);q[0 if axis=='x' else 1]-=.048
    h.cyl(name+' encoder face',q,.13,.012,m['goldedge'],axis,32,.003)
    h.line(name+' drive and encoder harness',[drive,(drive[0],drive[1]-.30,drive[2]+.28),(x+.40,-1.19,z+.20)],.023,m['loom'])


def card(h,m,name,at,size,kind='digital'):
    """Open card on a supporting tray: role is visible, circuit is not asserted."""
    x,y,z=at;w,d=size
    h.box(name+' conductive tray',(x,y-.085,z),(w+.12,.08,d+.10),m['silver'],.016)
    h.board(name,(x,y,z),(w,d),m)
    for sx in [-1,1]:
        h.box(name+' card guide',(x+sx*(w/2+.047),y+.09,z),(.047,.23,d+.06),m['silver'],.007)
        for zz in [z-d/2+.11,z+d/2-.11]:h.screw((x+sx*(w/2-.065),y+.054,zz),m['edge'],r=.022)
    if kind=='power':
        for dx in [-.32,0,.32]:
            h.cyl(name+' conversion inductor',(x+dx,y+.16,z-.18),.093,.13,m['copper'],segments=20)
        for dx in [-.34,-.13,.08,.29]:h.cyl(name+' filter capacitor',(x+dx,y+.13,z+.23),.052,.16,m['dark'],segments=16)
    elif kind=='clock':
        h.box(name+' representative oscillator',(x-.27,y+.14,z),(.27,.11,.20),m['edge'],.012)
        for dz in [-.19,.19]:h.box(name+' timing distribution package',(x+.23,y+.11,z+dz),(.22,.085,.15),m['chip'],.008)
    elif kind=='drive':
        for dx in [-.30,0,.30]:
            h.box(name+' driver package',(x+dx,y+.13,z),(.19,.11,.24),m['chip'],.009)
            h.box(name+' driver heat spreader',(x+dx,y+.20,z),(.16,.025,.20),m['edge'],.004)
    h.connector(name+' external interface',(x,y+.055,z+d/2+.10),min(.60,w*.63),m)
    h.box(name+' role plate',(x,y-.135,z+d/2+.145),(w*.86,.14,.029),m['dark'],.005)


def expand(h,m):
    # Keep the original primary/secondary as one possible reflective arrangement;
    # two displaced relay mirrors make the four telescope surfaces individually
    # visible. Their prescription and packaging are not reconstructed from ABI.
    h.role('Optics')
    optic(h,'Representative tertiary relay mirror',(-1.46,.05,-1.07),(.47,.50),(.7,0,.7),m['mirror'])
    optic(h,'Representative quaternary relay mirror',(-.42,.05,-1.43),(.40,.44),(-.7,0,.7),m['mirror'])
    for x,z in [(-1.46,-1.07),(-.42,-1.43)]:
        h.box('Relay mirror support',(x,-.63,z),(.18,1.1,.18),m['dark'],.012)
        h.box('Relay mirror pedestal',(x,-1.40,z),(.47,.10,.41),m['silver'],.014)

    h.role('ScanSystem')
    h.box('Scanning subsystem mounting deck',(-1.81,-1.24,3.38),(3.75,.12,2.26),m['silver'],.023)
    scan_axis(h,m,'First orthogonal scan axis',(-2.47,.01,3.94),'x',(.72,.22,.66))
    scan_axis(h,m,'Second orthogonal scan axis',(-1.14,.16,2.94),'y',(-.66,.10,.74))
    for z in [2.41,4.28]:h.box('Scan deck stiffener',(-1.81,-1.10,z),(3.53,.11,.07),m['dark'],.006)
    # Scan shroud is cut away. Its lower heat-pipe rail remains visible.
    h.box('Scan-shroud side panel',(-3.73,-.34,3.22),(.045,1.59,1.90),m['white'],.012)
    h.line('Scan-shroud heat pipe',[(-3.68,-1.00,4.12),(-3.68,-1.00,2.42),(-3.58,-1.09,.2)],.033,m['silver'])

    h.role('Mechanisms')
    # A deployed single cover on spring hinges, never a reusable iris.
    for y in [-.53,.53]:
        h.cyl('Optical port spring hinge',(-2.61,y,2.12),.095,.24,m['silver'],'y',24)
        h.ring('Hinge spring collar',(-2.61,y,2.12),.115,.096,.040,m['dark'],'y',24)
    optic(h,'Deployed optical port cover',(-3.05,0,1.55),(1.63,1.79),(.94,0,.34),m['foilback'],.065)
    optic(h,'Cover outer thermal blanket',(-3.08,0,1.539),(1.54,1.70),(-.94,0,-.34),m['gold'],.015)
    h.rod('Cover hinge link',(-2.61,.53,2.12),(-3.06,.53,1.64),.025,m['silver'])
    h.box('Cover launch lock body',(-2.48,-.68,2.15),(.23,.23,.20),m['dark'],.014)
    h.cyl('Representative lock pin',(-2.42,-.68,2.29),.039,.19,m['edge'],'z',20,.004)
    h.box('Focus carriage guide',(-2.67,-.14,-.37),(.17,.16,.98),m['silver'],.013)
    h.cyl('Focus actuator motor',(-2.67,-.14,-.96),.14,.36,m['dark'],'z',24,.012)
    h.cyl('Focus actuator lead shaft',(-2.67,-.14,-.38),.032,.67,m['edge'],'z',16,.003)
    h.box('Moving focus carriage',(-2.67,-.04,-.52),(.28,.17,.26),m['silver'],.013)
    h.rod('Focus carriage mirror interface',(-2.56,-.04,-.52),(-2.13,-.04,-.55),.029,m['silver'])
    h.line('Cover and focus motor loom',[(-2.50,-.77,2.17),(-2.87,-1.14,.55),(-2.83,-1.14,-.72),(-2.42,-1.08,-1.16)],.025,m['loom'])

    h.role('Calibration')
    h.box('Internal calibration target back block',(-3.29,-.23,-.505),(.89,.78,.10),m['dark'],.024)
    h.ring('Internal calibration target cavity shell',(-3.29,-.20,-.20),.43,.27,.50,m['dark'],'z',40)
    h.ring('Blackbody target cavity rim',(-3.29,-.20,.08),.35,.275,.070,m['silver'],'z',40)
    h.cyl('Blackbody cavity recess',(-3.29,-.20,-.429),.265,.013,m['black'],'z',40,.002)
    # Nested cavity surfaces express a recessed absorbing target, not emissivity.
    for z,r in [(-.31,.20),(-.18,.23),(-.05,.26)]:h.ring('Calibration cavity teaching contour',(-3.29,-.20,z),r,r-.020,.025,m['black'],'z',32)
    for y in [-.48,-.34,-.20,-.06]:h.line('Calibration target heater trace',[(-3.77,y,-.46),(-3.78,y,-.06),(-3.72,y+.03,.03)],.010,m['copper'])
    h.box('Calibration thermometer block',(-3.00,-.08,-.41),(.13,.09,.10),m['edge'],.004)
    h.line('Calibration control harness',[(-3.02,-.09,-.45),(-3.15,-.95,-.55),(-2.4,-1.1,-1.14)],.018,m['loom'])
    # Solar diffuser is only a labeled ABI civil example. Space is a view and
    # therefore has no pretend calibration object on the bench.
    h.box('ABI civil solar calibration mount',(-3.26,-.85,-1.89),(1.02,.14,.88),m['silver'],.018)
    optic(h,'ABI civil diffuse solar calibration target',(-3.26,-.22,-1.91),(.79,.68),(0,.42,.91),m['white'],.04)
    for x in [-3.65,-2.87]:h.rod('Solar calibration target support',(x,-.80,-1.90),(x,-.22,-1.94),.026,m['silver'])
    h.cyl('Solar-target protective cover hinge',(-3.26,-.61,-2.34),.070,.91,m['dark'],'x',24,.009)

    h.role('AftOptics')
    h.box('Aft-optics mounting deck',(-.20,-1.02,-2.27),(2.40,.12,1.47),m['silver'],.026)
    for name,at,normal,mat in [
        ('Visible infrared beamsplitter',(-.47,-.03,-2.04),(.71,0,.71),'cyanedge'),
        ('Midwave longwave beamsplitter',(.44,-.03,-2.31),(-.71,0,.71),'goldedge'),
        ('Aft-optics fold mirror',(-.78,-.03,-2.66),(.71,0,.71),'mirror')]:
        optic(h,name+' optical face',at,(.47,.56),normal,m[mat],.023)
        h.box(name+' mount',(at[0],-.55,at[2]),(.13,.84,.14),m['dark'],.009)
    for x,z in [(-.77,-3.04),(.36,-2.85),(.78,-1.84)]:
        h.ring('Stationary channel filter retainer',(x,-.06,z),.22,.172,.053,m['silver'],'z',32)
        h.cyl('Stationary channel filter optical surface',(x,-.06,z-.012),.17,.012,m['solar'],'z',32,.002)
        h.ring('Stationary cold stop',(x,-.06,z-.11),.21,.125,.025,m['black'],'z',32)
        h.box('Filter cassette foot',(x,-.64,z),(.28,.09,.23),m['dark'],.009)

    h.role('Thermal')
    h.box('Cold-head thermometer',(-.42,-.40,-3.51),(.12,.08,.12),m['edge'],.006)
    h.cyl('Remote cold head',(-.22,-.84,-3.29),.15,.55,m['cyan'],'x',28,.012)
    h.line('Cooler transfer line',[(3.81,-.86,-2.24),(3.42,-1.08,-2.70),(1.08,-1.10,-2.95),(.59,-.96,-3.18),(.08,-.84,-3.29)],.035,m['silver'])
    h.line('Cold-stage thermal strap',[(-.53,-.54,-3.44),(-.37,-.64,-3.4),(-.41,-.83,-3.29)],.054,m['copper'])

    return {
        'AnchorScanSystem':[-2.43,.30,3.99],
        'AnchorMechanisms':[-2.65,.04,-.48],
        'AnchorCalibration':[-3.29,-.17,.14],
        'AnchorAftOptics':[-.45,.21,-2.04],
    }
