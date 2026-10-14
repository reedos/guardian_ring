"""Representative spacecraft engineering cutaway, v13.
Blender --background --python tools/blender/build-satellite.py.
Open decks, separated covers, equipment counts and arrangement are teaching
choices, not a military satellite reconstruction or bill of materials.
v12 closes the -X face with a blanketed closeout panel (cut around the array
drive and its harness), leaves only the viewer-facing +Z closeout cut back to
a narrow flange with marked section edges, removes the detached blanket that
hung on brackets beside the array yoke, and gives the antenna and terminal
their own white finish name instead of the radiator coating. As drawn.
v13 (blender round 1): the sunshade is a flared hood with a blanketed exterior and
a black baffled interior, so it reads as a light shield rather than a longer
barrel; the telescope sits in a saddle-and-rail mount tied into the deck beams;
the TT&C dish stands off the rear on a hinged boom; the array yokes are heavier
and show a cross-member; and the chassis finish is lifted a step. The cutaway
stays on the viewer-facing +Z face only; every other face is closed or
blanketed. Form is a generic representative spacecraft: the GOES-R references
in the story are for named systems, not this drawing's silhouette.
"""
import bpy, math, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('detail',Path(__file__).with_name('hardware-detail.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
bpy.ops.wm.read_factory_settings(use_empty=True)
m=h.palette();VERSION=13
# Thin metallic foil catches the single Sun in irregular creases, not a flat
# yellow label panel. These finishes are drawing choices, not flight materials.
m['gold'].node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.88
m['gold'].node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.25
from mathutils import Vector
def aim(o,center,direction,source=(0,0,1)):
    # Orient a part built about its own origin along a Three.js direction.
    o.rotation_mode='QUATERNION';o.rotation_quaternion=Vector(source).rotation_difference(Vector(h.p(direction)).normalized());o.location=h.p(center);return o
def dish(name,center,radius,depth,mat,rings=10,segments=40):
    # Concave paraboloid shell opening toward +Z; vertex at center. Shape only.
    verts=[(0,0,0)];faces=[]
    for r in range(1,rings+1):
        rr=radius*r/rings
        for a in range(segments):
            t=a*math.tau/segments;verts.append(h.p((rr*math.cos(t),rr*math.sin(t),depth*(rr/radius)**2)))
    for a in range(segments):faces.append((0,1+(a+1)%segments,1+a))
    for r in range(rings-1):
        for a in range(segments):
            i=1+r*segments;b=(a+1)%segments;faces.append((i+a,i+b,i+segments+b,i+segments+a))
    d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o)
    o.location=h.p(center);s=o.modifiers.new('Shell thickness','SOLIDIFY');s.thickness=.014;s.offset=-1
    return h.finish(o,name,mat)

h.role('Structure')
h.box('Lower structural sandwich deck',(0,.08,0),(3.10,.16,2.25),m['silver'],.035)
h.box('Open upper equipment deck',(0,1.05,-.45),(2.95,.11,1.20),m['silver'],.025)
for x in [-1.48,1.48]:
    for z in [-1.03,1.03]:
        h.box('Corner load-path longeron',(x,1.12,z),(.10,2.13,.10),m['silver'],.016)
        for y in [.25,.94,1.85,2.12]:h.screw((x,y,z+.058),m['edge'],'z')
for y in [.22,2.12]:
    for z in [-1.03,1.03]:h.box('Deck perimeter beam',(0,y,z),(3.02,.085,.085),m['silver'],.012)
    for x in [-1.48,1.48]:h.box('Side perimeter beam',(x,y,0),(.085,.085,2.06),m['silver'],.012)
for x in [-1.3,1.3]:h.rod('Rear structural diagonal',(x,.24,-1.00),(-x,2.08,-1.00),.027,m['dark'])
h.box('Rear blanket substrate',(0,1.15,-1.06),(2.86,1.84,.027),m['foilback'],.004)
h.foil('Rear MLI facets',(0,1.15,-1.092),(2.84,0,0),(0,1.82,0),(0,0,-1),m['gold'],27)
# v12: -X closeout panel, blanketed outside, cut around the array drive and the
# harness that passes into the bus. Opening size and panel split are as drawn.
OPEN_Y,OPEN_Z=(.80,1.60),(-.45,.40)
for name,(y0,y1),(z0,z1) in [('lower',(.18,OPEN_Y[0]),(-1.06,1.06)),('upper',(OPEN_Y[1],2.16),(-1.06,1.06)),
                             ('aft',OPEN_Y,(-1.06,OPEN_Z[0])),('forward',OPEN_Y,(OPEN_Z[1],1.06))]:
    h.box('Side closeout panel ('+name+')',(-1.543,(y0+y1)/2,(z0+z1)/2),(.027,y1-y0,z1-z0),m['foilback'],.004)
    h.foil('Side closeout MLI ('+name+')',(-1.575,(y0+y1)/2,(z0+z1)/2),(0,0,z1-z0-.03),(0,y1-y0-.03,0),(-1,0,0),m['gold'],31+len(name))
for y in OPEN_Y:h.box('Drive cutout edge binding',(-1.578,y,sum(OPEN_Z)/2),(.018,.023,OPEN_Z[1]-OPEN_Z[0]+.02),m['goldedge'],.003)
for z in OPEN_Z:h.box('Drive cutout edge binding',(-1.578,sum(OPEN_Y)/2,z),(.018,OPEN_Y[1]-OPEN_Y[0]+.02,.023),m['goldedge'],.003)
# Viewer-facing +Z closeout cut back to a flange; the section color marks every
# cut edge, the drawing convention for removed material. The bottom flange is
# interrupted where the reaction-wheel shelf projects through the face.
CUT=h.material('Cutaway section edge',(.62,.17,.07),.1,.5)
FZ=1.084
for x in [-1.47,1.47]:
    h.box('Front closeout flange',(x,1.17,FZ),(.12,1.98,.012),m['foilback'],0)
    h.box('Front closeout section edge',(x-math.copysign(.064,x),1.17,FZ+.002),(.012,1.86,.014),CUT,0)
h.box('Front closeout flange',(0,2.10,FZ),(2.82,.12,.012),m['foilback'],0)
h.box('Front closeout section edge',(0,2.036,FZ+.002),(2.70,.012,.014),CUT,0)
for x0,x1 in [(-1.41,-.52),(.40,1.41)]:
    h.box('Front closeout flange',((x0+x1)/2,.24,FZ),(x1-x0,.12,.012),m['foilback'],0)
    h.box('Front closeout section edge',((x0+x1)/2,.304,FZ+.002),(x1-x0,.012,.014),CUT,0)
    for x in [x0,x1]:
        if abs(x)<1:h.box('Front closeout section edge',(x,.24,FZ+.002),(.012,.12,.014),CUT,0)

h.role('Battery')
h.enclosure('Battery module tray',(-.85,.39,.52),(1.04,.43,.75),m,True)
for x in [-1.17,-.85,-.53]:
    for z in [.32,.65]:
        h.cyl('Representative battery cell',(x,.43,z),.11,.43,m['battery'],segments=20)
        h.cyl('Cell end contact',(x,.65,z),.066,.022,m['edge'],segments=16,bevel=.003)
for z in [.32,.65]:h.box('Battery bus strap',(-.85,.681,z),(.77,.018,.044),m['copper'],.003)
h.line('Battery insulated lead',[(-.49,.69,.60),(-.32,.73,.60),(-.25,.73,.36),(.28,.72,.36)],.023,m['loom'])
h.connector('Battery service connector',(-.86,.35,.927),.28,m)

h.role('Power')
h.enclosure('Open power distribution unit',(.80,.41,.56),(1.01,.47,.80),m,True)
h.board('Power conditioning board',(.80,.66,.56),(.90,.68),m)
for x in [.53,.76,1.00]:h.cyl('Representative power inductor',(x,.79,.34),.072,.10,m['copper'],segments=16,bevel=.004)
h.connector('PDU output connector',(.82,.42,.99),.42,m)
for i in range(3):h.line('Power harness branch',[(.43+i*.12,.76,.9),(.38+i*.12,.85,1.0),(.1+i*.15,1.02,.9),(.1+i*.15,1.18,.25)],.012,m['loom'])

h.role('Computer')
h.enclosure('Flight computer card cage',(-.69,1.43,-.18),(1.15,.66,.93),m,True)
for i in range(3):
    y=1.25+i*.20;z=-.12+i*.10
    h.board('Flight computer card',(-.69,y,z),(.97,.69),m,i)
    h.box('Card extraction lip',(-.69,y,.40+i*.10),(1.02,.055,.055),m['silver'],.008)
    h.connector('Card edge interface',(-.70,y+.055,.434+i*.10),.43,m)
h.enclosure('Payload processor chassis',(.67,1.44,.05),(1.05,.53,.87),m,True)
h.board('Representative payload processing board',(.67,1.70,.05),(.92,.72),m)
for x in [.29,1.04]:h.box('Processor chassis stiffener',(x,1.746,.05),(.055,.055,.68),m['silver'],.009)
h.line('Avionics signal harness',[(-.2,1.65,.5),(.02,1.86,.5),(.45,1.9,.42),(.74,1.88,.2)],.019,m['loom'])
# Recovery-function packages are representative physical vocabulary, not a
# named computer design or a reconstructed reset/boot circuit.
h.box('Representative recovery daughterboard',(-1.05,1.825,-.11),(.33,.030,.44),m['pcb'],.006)
h.box('Representative bootstrap memory package',(-1.06,1.882,-.24),(.21,.075,.17),m['chip'],.008)
h.box('Representative reset supervisor package',(-1.05,1.873,.005),(.16,.057,.12),m['chip'],.006)
for dx in [-.012,0,.012]:h.line('Computer housing bond strap',[(-1.26+dx,1.22,-.41),(-1.34+dx,1.13,-.49),(-1.34+dx,1.11,-.66)],.005,m['copper'])

h.role('Wheels')
# Shelf rests on the lower deck and is braced where it overhangs. Three
# orthogonal wheels stand on it without touching one another (as drawn).
h.box('Reaction-wheel mounting shelf',(-.06,.2025,1.21),(.77,.085,.60),m['silver'],.014)
for x in [-.40,.28]:h.rod('Wheel shelf brace',(x,.17,1.48),(x,.02,1.12),.016,m['silver'])
for at,axis,cradle in [((-.22,.32,1.12),'y',None),((.17,.425,1.12),'x',(.11,.06,.16)),((-.05,.425,1.40),'z',(.16,.06,.13))]:
    h.cyl('Representative reaction-wheel housing',at,.18,.15,m['dark'],axis,32,.016)
    q=list(at);q[{'x':0,'y':1,'z':2}[axis]]+=.084
    h.cyl('Wheel housing service face',q,.143,.018,m['silver'],axis,32,.004)
    if cradle:h.box('Wheel mounting cradle',(at[0],.275,at[2]),cradle,m['silver'],.006)
h.line('Wheel drive harness',[(.25,.42,1.12),(.37,.37,1.0),(.52,.42,.99),(.61,.42,.99)],.018,m['loom'])

h.role('Propulsion')
# v12: tank depth and center keep it clear of the rear blanket (v11 passed
# through it) and of the payload processor chassis; bands follow its ellipse.
TANK,TANK_R=(.88,1.38,-.72),(.43,.50,.32)
h.sphere('Representative propellant tank',TANK,TANK_R,m['silver'])
def tank_band(y):
    f=math.sqrt(1-((y-TANK[1])/TANK_R[1])**2);rx,rz=TANK_R[0]*f+.002,TANK_R[2]*f+.002;verts=[];faces=[];n=40
    for dy in [-.0225,.0225]:
        for t in [0,.03]:
            for i in range(n):
                a=i*math.tau/n;verts.append(h.p((TANK[0]+(rx+t)*math.cos(a),y+dy,TANK[2]+(rz+t)*math.sin(a))))
    for i in range(n):
        j=(i+1)%n;faces+=[(i,j,j+n,i+n),(i+2*n,i+3*n,j+3*n,j+2*n),(i,i+2*n,j+2*n,j),(i+n,j+n,j+3*n,i+3*n)]
    d=bpy.data.meshes.new('Tank restraint band');d.from_pydata(verts,[],faces);d.update()
    o=bpy.data.objects.new('Tank restraint band',d);bpy.context.collection.objects.link(o);h.finish(o,'Tank restraint band',m['dark'],.003)
for y in [1.08,1.68]:tank_band(y)
h.cyl('Tank service fitting',(.88,1.93,-.72),.064,.14,m['goldedge'],segments=16)
h.line('Propellant feed line',[(.88,.90,-.72),(1.23,.84,-.74),(1.35,.55,-.70),(1.35,.19,-.70)],.021,m['silver'])
for x in [-1.35,1.35]:
    for z in [-.86,.86]:
        h.line('Feed manifold branch',[(1.35,.19,-.70),(x,.19,-.70),(x,.19,z)],.014,m['silver'])
        h.cyl('Representative thruster body',(x,-.02,z),.085,.18,m['dark'],segments=20)
        h.ring('Thruster nozzle exit',(x,-.14,z),.11,.073,.08,m['silver'],'y',24)

h.role('Attitude')
h.enclosure('Attitude sensor mount',(-1.06,2.18,-.56),(.65,.20,.65),m)
# Boresight turned 30 degrees above anti-nadir, away from the Earth-facing
# telescope aperture (+Z). Direction is a drawing choice, not a flight layout.
ST=(-1.06,2.47,-.50);SD=(0,.5,-math.sqrt(3)/2)
def along(t):return tuple(ST[i]+SD[i]*t for i in range(3))
aim(h.cyl('Star-tracker housing',(0,0,0),.20,.46,m['dark'],'z',32,.013),ST,SD)
aim(h.ring('Star-tracker baffle',(0,0,0),.24,.17,.16,m['black'],'z',32),along(.31),SD,(0,-1,0))
aim(h.cyl('Star-tracker optical entrance',(0,0,0),.157,.015,m['solar'],'z',32,.002),along(.212),SD)
h.box('Representative Sun-sensor base',(1.21,2.24,.65),(.29,.10,.25),m['silver'],.017)
h.box('Sun-sensor dark active face',(1.21,2.302,.65),(.20,.018,.16),m['solar'],.004)
h.line('Attitude sensor harness',[(-1.04,2.2,-.49),(-.96,1.98,-.35),(-.79,1.87,-.23)],.019,m['loom'])

h.role('Payload')
# v13 mount: two rails under the feet tie into the deck perimeter beams, and a
# saddle clamp under each structural band carries the barrel. As drawn.
for x in [-.40,.40]:
    h.box('Instrument support foot',(x,2.21,.12),(.15,.20,.82),m['silver'],.018)
    h.box('Instrument mount rail',(x,2.075,0),(.14,.075,2.06),m['silver'],.012)
for z in [-.38,.37]:
    h.box('Telescope saddle clamp',(0,2.30,z),(.80,.24,.085),m['dark'],.012)
    for x in [-.30,.30]:h.screw((x,2.25,z+.0475),m['edge'],'z',.026)
h.cyl('Representative telescope housing',(0,2.78,.13),.52,1.45,m['silver'],'z',48,.025)
h.cyl('Recessed optical entrance',(0,2.78,.873),.39,.016,m['solar'],'z',48,.002)
# A flared sunshade hood extends the barrel: a blanketed exterior shell and a
# black baffled interior shell with a visible rim, so it reads as a shade and
# not as a longer barrel. Stray-light vanes sit inside it.
SH0,SH1=.855,1.42
SR=lambda z:.545+(.74-.545)*(z-SH0)/(SH1-SH0)
h.frustum('Instrument sunshade hood',(0,2.78,0),SH0,SH1,.545,.74,.014,m['gold'])
h.frustum('Sunshade black interior',(0,2.78,0),SH0+.004,SH1-.006,SR(SH0+.004)-.016,SR(SH1-.006)-.016,.012,m['black'])
for z in [.99,1.13,1.27]:h.ring('Stray-light baffle vane',(0,2.78,z),SR(z)-.03,SR(z)-.115,.016,m['black'],'z',48)
h.ring('Sunshade rim ring',(0,2.78,SH1-.012),.757,.725,.034,m['edge'],'z',48)
for z in [-.38,.37]:h.ring('Payload structural band',(0,2.78,z),.545,.515,.060,m['dark'],'z',48)
h.line('Payload readout harness',[(.40,2.48,-.22),(.67,2.20,-.18),(.75,1.93,.02)],.027,m['loom'])

h.role('Links')
# v13: the reflector stands off the aft face on a hinged boom with a gimbal
# bracket, not on a short stick at the corner. Boom form is as drawn.
h.cyl('TT&C boom hinge',(-.72,2.20,-.92),.062,.10,m['dark'],'x',20,.006)
h.rod('TT&C boom',(-.72,2.20,-.92),(-.55,2.98,-1.12),.032,m['silver'])
h.box('TT&C gimbal bracket',(-.52,3.02,-1.12),(.11,.11,.09),m['dark'],.012)
ANTENNA_WHITE=h.material('White antenna and terminal finish',(.67,.72,.74),.12,.52)
dish('Representative TT&C reflector',(-.52,3.05,-1.12),.34,.085,ANTENNA_WHITE)
h.ring('TT&C reflector rim',(-.52,3.05,-1.035),.352,.335,.016,m['silver'],'z',40)
h.rod('TT&C feed support',(-.77,2.91,-1.01),(-.52,3.05,-.80),.014,m['silver'])
h.cyl('Representative feed',(-.52,3.05,-.78),.036,.08,m['goldedge'],'z',16)
h.box('Mission-link terminal',(1.04,2.44,-.64),(.50,.31,.22),ANTENNA_WHITE,.031)
h.box('Mission antenna aperture',(1.04,2.44,-.516),(.41,.22,.024),m['dark'],.010)
h.connector('Radio interface',(1.23,1.78,-.36),.23,m)
h.line('RF cable',[(1.04,2.29,-.64),(1.29,2.09,-.61),(1.28,1.82,-.44)],.017,m['loom'])

h.role('Radiator')
# Radiator stands off the +X (north/south, array-axis) face, the side a
# geostationary bus keeps out of direct sunlight and pointed away from Earth,
# rather than the Earth-facing +Z side. Separated for the cutaway, as drawn.
h.box('Separated radiator support panel',(1.72,1.28,.62),(.07,1.48,.76),m['dark'],.023)
h.box('Representative radiator face',(1.767,1.28,.62),(.019,1.42,.70),m['white'],.011)
for y in [.74,.94,1.14,1.34,1.54,1.74]:h.box('Radiator segment seam',(1.781,y,.62),(.005,.006,.66),m['silver'],0)
for y in [.65,1.88]:
    for z in [.35,.89]:h.screw((1.79,y,z),m['edge'],'x',.024)
for y in [.93,1.63]:h.line('Heat-pipe connection',[(.75,y,.35),(1.20,y,.45),(1.50,y,.55),(1.69,y,.60)],.035,m['silver'])

for side in [-1,1]:
    h.role('ArrayDriveLeft' if side<0 else 'ArrayDriveRight')
    for x,r,d,mat in [(1.66,.20,.21,'silver'),(1.87,.15,.17,'dark'),(2.04,.115,.16,'goldedge')]:h.cyl('Solar-array rotary drive',(side*x,1.10,-.13),r,d,m[mat],'x',32,.012)
    for y in [.38,1.82]:h.rod('Array yoke arm',(side*2.10,1.10,-.13),(side*2.15,y,-.15),.042,m['silver'])
    for y in [.38,1.82]:h.box('Yoke root fitting',(side*2.135,y,-.15),(.12,.13,.11),m['edge'],.008)
    h.box('Array yoke cross-member',(side*2.075,1.10,-.17),(.07,.30,.10),m['dark'],.010)
    h.line('Array power harness',[(side*2.09,1.10,-.08),(side*1.98,1.33,-.02),(side*1.67,1.39,.01),(side*1.42,1.27,.28)],.019,m['loom'])
    h.box('Representative deployment-position sensor',(side*1.74,1.38,-.05),(.17,.10,.15),m['dark'],.010)
    h.box('Position-sensor actuating tab',(side*1.90,1.39,-.05),(.15,.033,.065),m['goldedge'],.004)
    h.line('Deployment-state sensor lead',[(side*1.74,1.37,-.13),(side*1.62,1.48,-.16),(side*1.42,1.33,.08)],.010,m['loom'])
    h.role('SolarArrayLeft' if side<0 else 'SolarArrayRight')
    for panel in range(2):
        cx=side*(2.96+panel*1.72)
        h.box('Solar panel sandwich core',(cx,1.1,-.18),(1.62,2.66,.08),m['dark'],.008)
        for dx in [-.81,.81]:h.box('Array perimeter extrusion',(cx+dx,1.1,-.11),(.045,2.71,.105),m['silver'],.006)
        for y in [-.24,2.44]:h.box('Array perimeter extrusion',(cx,y,-.11),(1.65,.045,.105),m['silver'],.006)
        h.rod('Rear array stiffener',(cx-.70,-.10,-.25),(cx+.70,2.30,-.25),.017,m['silver'])
        h.box('Array rear junction box',(cx,1.1,-.285),(.34,.42,.13),m['dark'],.012)
        for row in range(8):
            for col in range(5):
                x=cx+(col-2)*.302;y=1.10+(row-3.5)*.316
                h.box('Photovoltaic cell coverglass',(x,y,-.1355),(.279,.290,.009),m['solar2'] if (row+col)%7==0 else m['solar'],.003)
                for dx in [-.066,.066]:h.box('Cell collection busbar',(x+dx,y,-.1305),(.005,.268,.003),m['silver'],0)
                for j in range(6):h.box('Fine cell finger',(x,y+(j-2.5)*.044,-.1305),(.256,.0019,.002),m['silver'],0)
                if row<7:
                    for dx in [-.066,.066]:h.box('Intercell series tab',(x+dx,y+.155,-.1295),(.018,.038,.004),m['goldedge'],0)
        for y in [-.16,2.36]:
            h.box('String collection strip',(cx,y,-.136),(1.41,.027,.008),m['goldedge'],.002)
            for dx in [-.74,.74]:h.screw((cx+dx,y,-.1265),m['edge'],'z',.020)
        if panel==0:
            for y in [.2,1.1,2.0]:h.cyl('Panel deployment hinge',(side*3.82,y,-.12),.054,.22,m['silver'],'y',20,.005)

anchors={
 'AnchorPayload':[0,2.78,1.36],'AnchorBus':[-1.43,1.90,1.10],
 'AnchorSolarArray':[3.01,1.10,-.09],'AnchorArrayDrive':[-1.88,1.16,.07],
 'AnchorPower':[.80,.82,.62],'AnchorBattery':[-.85,.72,.55],
 'AnchorAttitude':[-1.06,2.665,-.838],'AnchorWheels':[-.05,.45,1.53],
 'AnchorPropulsion':[.88,1.59,-.36],'AnchorComputer':[-1.06,1.922,-.24],
 'AnchorAntenna':[-.52,3.05,-.72],'AnchorRadiator':[1.80,1.28,.62],
}
h.export(ROOT/'public/models/satellite.glb','GuardianSatellite',VERSION,'satellite',anchors,
 'Representative spacecraft anatomy: cutaway bus with blanketed closeouts, separated radiator, solar cells and strings, drive, batteries/PDU, avionics, attitude equipment, reaction wheels, propulsion, links and payload. Layout and counts are as drawn, not a military system.')
