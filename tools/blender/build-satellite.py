"""Representative spacecraft engineering cutaway, v8.
Blender --background --python tools/blender/build-satellite.py.
Open decks, separated covers, equipment counts and arrangement are teaching
choices, not a military satellite reconstruction or bill of materials.
"""
import bpy, math, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('detail',Path(__file__).with_name('hardware-detail.py'))
h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
bpy.ops.wm.read_factory_settings(use_empty=True)
m=h.palette();VERSION=8
# Thin metallic foil catches the single Sun in irregular creases, not a flat
# yellow label panel. These finishes are drawing choices, not flight materials.
m['gold'].node_tree.nodes.get('Principled BSDF').inputs['Metallic'].default_value=.88
m['gold'].node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.25

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
h.foil('Rear MLI facets',(0,1.15,-1.082),(2.84,0,0),(0,1.82,0),(0,0,-1),m['gold'],27)
h.box('Removed front MLI panel',(-1.92,.93,1.68),(.78,1.55,.055),m['foilback'],.015)
h.foil('Removed outer thermal blanket',(-1.92,.93,1.714),(.74,0,0),(0,1.51,0),(0,0,1),m['gold'],13)
for x in [-2.28,-1.56]:h.box('Blanket edge binding',(x,.93,1.728),(.023,1.49,.018),m['goldedge'],.003)
for y in [.20,1.66]:h.box('Blanket edge binding',(-1.92,y,1.728),(.74,.023,.018),m['goldedge'],.003)
for y in [.3,1.55]:h.line('Detached-panel teaching bracket',[(-1.52,y,1.01),(-1.62,y,1.40),(-1.70,y,1.66)],.014,m['silver'])
for y in [.45,1.37]:
    h.box('Representative blanket bonding tab',(-1.61,y,1.742),(.14,.085,.016),m['silver'],.004)
    for dx in [-.014,0,.014]:h.line('Blanket bond strap strand',[(-1.61+dx,y,1.75),(-1.54+dx,y+.05,1.40),(-1.48+dx,y,1.06)],.005,m['copper'])

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
for x in [.29,1.04]:h.box('Processor chassis stiffener',(x,1.83,.05),(.055,.055,.68),m['silver'],.009)
h.line('Avionics signal harness',[(-.2,1.65,.5),(.02,1.86,.5),(.45,1.9,.42),(.74,1.88,.2)],.019,m['loom'])
# Recovery-function packages are representative physical vocabulary, not a
# named computer design or a reconstructed reset/boot circuit.
h.box('Representative recovery daughterboard',(-1.05,1.825,-.11),(.33,.030,.44),m['pcb'],.006)
h.box('Representative bootstrap memory package',(-1.06,1.882,-.24),(.21,.075,.17),m['chip'],.008)
h.box('Representative reset supervisor package',(-1.05,1.873,.005),(.16,.057,.12),m['chip'],.006)
for dx in [-.012,0,.012]:h.line('Computer housing bond strap',[(-1.26+dx,1.22,-.41),(-1.34+dx,1.13,-.49),(-1.34+dx,1.11,-.66)],.005,m['copper'])

h.role('Wheels')
h.box('Reaction-wheel mounting shelf',(-.06,.24,1.21),(.77,.085,.60),m['silver'],.014)
for at,axis in [((-.18,.48,1.19),'y'),((.18,.51,1.23),'x'),((-.13,.64,1.40),'z')]:
    h.cyl('Representative reaction-wheel housing',at,.18,.15,m['dark'],axis,32,.016)
    q=list(at);q[{'x':0,'y':1,'z':2}[axis]]+=.084
    h.cyl('Wheel housing service face',q,.143,.018,m['silver'],axis,32,.004)
h.line('Wheel drive harness',[(.28,.45,1.22),(.37,.37,1.0),(.42,.42,.97)],.018,m['loom'])

h.role('Propulsion')
h.sphere('Representative propellant tank',(.88,1.38,-.74),(.43,.50,.36),m['silver'])
for y in [1.08,1.68]:h.ring('Tank restraint band',(.88,y,-.74),.34,.31,.045,m['dark'],'y',32)
h.cyl('Tank service fitting',(.88,1.93,-.74),.064,.14,m['goldedge'],segments=16)
h.line('Propellant feed line',[(.88,.94,-.74),(1.23,.84,-.74),(1.35,.55,-.70),(1.35,.19,-.70)],.021,m['silver'])
for x in [-1.35,1.35]:
    for z in [-.86,.86]:
        h.line('Feed manifold branch',[(1.35,.19,-.70),(x,.19,-.70),(x,.19,z)],.014,m['silver'])
        h.cyl('Representative thruster body',(x,-.02,z),.085,.18,m['dark'],segments=20)
        h.ring('Thruster nozzle exit',(x,-.14,z),.11,.073,.08,m['silver'],'y',24)

h.role('Attitude')
h.enclosure('Attitude sensor mount',(-1.06,2.18,-.56),(.65,.20,.65),m)
h.cyl('Star-tracker housing',(-1.06,2.44,-.42),.20,.46,m['dark'],'z',32,.013)
h.ring('Star-tracker baffle',(-1.06,2.44,-.14),.24,.17,.16,m['black'],'z',32)
h.cyl('Star-tracker optical entrance',(-1.06,2.44,-.208),.157,.015,m['solar'],'z',32,.002)
h.box('Representative Sun-sensor base',(1.21,2.24,.65),(.29,.10,.25),m['silver'],.017)
h.box('Sun-sensor dark active face',(1.21,2.302,.65),(.20,.018,.16),m['solar'],.004)
h.line('Attitude sensor harness',[(-1.04,2.2,-.49),(-.96,1.98,-.35),(-.79,1.87,-.23)],.019,m['loom'])

h.role('Payload')
for x in [-.40,.40]:h.box('Instrument support foot',(x,2.21,.12),(.15,.20,.82),m['silver'],.018)
h.cyl('Representative telescope housing',(0,2.78,.13),.52,1.45,m['silver'],'z',48,.025)
h.cyl('Recessed optical entrance',(0,2.78,.873),.39,.016,m['solar'],'z',48,.002)
for z in [.89,1.03,1.17]:h.ring('Stray-light baffle',(0,2.78,z),.59,.44,.072,m['black'],'z',48)
h.ring('Instrument sunshade lip',(0,2.78,1.31),.62,.47,.055,m['silver'],'z',48)
for z in [-.38,.37]:h.ring('Payload structural band',(0,2.78,z),.545,.515,.060,m['dark'],'z',48)
h.line('Payload readout harness',[(.40,2.48,-.22),(.67,2.20,-.18),(.75,1.93,.02)],.027,m['loom'])

h.role('Links')
h.rod('TT&C antenna support',(-.72,2.16,-.90),(-.52,3.02,-1.12),.026,m['silver'])
h.sphere('Representative TT&C reflector',(-.52,3.05,-1.07),(.37,.30,.072),m['white'])
h.rod('TT&C feed support',(-.77,2.91,-1.01),(-.52,3.05,-.80),.014,m['silver'])
h.cyl('Representative feed',(-.52,3.05,-.78),.036,.08,m['goldedge'],'z',16)
h.box('Mission-link terminal',(1.04,2.44,-.64),(.50,.31,.22),m['white'],.031)
h.box('Mission antenna aperture',(1.04,2.44,-.516),(.41,.22,.024),m['dark'],.010)
h.connector('Radio interface',(1.23,1.78,-.36),.23,m)
h.line('RF cable',[(1.04,2.29,-.64),(1.29,2.09,-.61),(1.28,1.82,-.44)],.017,m['loom'])

h.role('Radiator')
h.box('Separated radiator support panel',(1.93,1.28,1.48),(.76,1.48,.07),m['dark'],.023)
h.box('Representative radiator face',(1.93,1.28,1.527),(.70,1.42,.019),m['white'],.011)
for y in [.74,.94,1.14,1.34,1.54,1.74]:h.box('Radiator segment seam',(1.93,y,1.541),(.66,.006,.005),m['silver'],0)
for y in [.65,1.88]:
    for x in [1.66,2.20]:h.screw((x,y,1.55),m['edge'],'z',.024)
for y in [.93,1.63]:h.line('Heat-pipe connection',[(.75,y,.35),(1.33,y,.42),(1.60,y,.98),(1.82,y,1.43)],.035,m['silver'])

for side in [-1,1]:
    h.role('ArrayDriveLeft' if side<0 else 'ArrayDriveRight')
    for x,r,d,mat in [(1.66,.20,.21,'silver'),(1.87,.15,.17,'dark'),(2.04,.115,.16,'goldedge')]:h.cyl('Solar-array rotary drive',(side*x,1.10,-.13),r,d,m[mat],'x',32,.012)
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
                h.box('Photovoltaic cell coverglass',(x,y,-.120),(.279,.290,.009),m['solar2'] if (row+col)%7==0 else m['solar'],.003)
                for dx in [-.066,.066]:h.box('Cell collection busbar',(x+dx,y,-.112),(.005,.268,.003),m['silver'],0)
                for j in range(6):h.box('Fine cell finger',(x,y+(j-2.5)*.044,-.109),(.256,.0019,.002),m['silver'],0)
                if row<7:
                    for dx in [-.066,.066]:h.box('Intercell series tab',(x+dx,y+.155,-.109),(.018,.038,.004),m['goldedge'],0)
        for y in [-.16,2.36]:
            h.box('String collection strip',(cx,y,-.105),(1.41,.027,.008),m['goldedge'],.002)
            for dx in [-.74,.74]:h.screw((cx+dx,y,-.045),m['edge'],'z',.020)
        if panel==0:
            for y in [.2,1.1,2.0]:h.cyl('Panel deployment hinge',(side*3.82,y,-.12),.054,.22,m['silver'],'y',20,.005)

anchors={
 'AnchorPayload':[0,2.78,1.36],'AnchorBus':[-1.43,1.90,1.10],
 'AnchorSolarArray':[3.01,1.10,-.09],'AnchorArrayDrive':[-1.88,1.16,.07],
 'AnchorPower':[.80,.82,.62],'AnchorBattery':[-.85,.72,.55],
 'AnchorAttitude':[-1.06,2.44,-.045],'AnchorWheels':[-.08,.64,1.53],
 'AnchorPropulsion':[.88,1.59,-.38],'AnchorComputer':[-1.06,1.922,-.24],
 'AnchorAntenna':[-.52,3.05,-.72],'AnchorRadiator':[1.93,1.28,1.56],
}
h.export(ROOT/'public/models/satellite.glb','GuardianSatellite',VERSION,'satellite',anchors,
 'Representative spacecraft anatomy: open bus, displaced MLI/radiator, solar cells and strings, drive, batteries/PDU, avionics, attitude equipment, reaction wheels, propulsion, links and payload. Layout and counts are as drawn, not a military system.')
