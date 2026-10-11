"""TIRS-2 civil assembly v6; nine groups. Public NASA architecture vocabulary.
Lens/array counts retained; packaging and dimensions as drawn. Fixed filters
and ground-set alignment shims, not an added on-orbit focus actuator.
v6 follows NASA's 2018 TIRS-2 design presentation (NTRS 20180005348): the two
stray-light baffles added near lenses 2 and 3 (PDF pp. 17, 20); two Main
Electronics Boxes and two cooler-control electronics units joined to one
thermomechanical unit through the redundancy switch (PDF p. 14). Parts now rest
on the bench. The presentation gives no package dimensions; sizes as drawn.
"""
import bpy,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('civil',Path(__file__).with_name('civil-detail.py'))
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c);h=c.load_h()
bpy.ops.wm.read_factory_settings(use_empty=True);m=h.palette();VERSION=6
m['lens']=h.material('Refractive element teaching blue',(.16,.38,.47),.25,.22)
c.bench(h,m,(.40,-.27,.10),(10.4,8.25))
h.role('Telescope')
for i,z in enumerate([1.30,.64,-.03,-.70],1):
    h.sphere('Refractive element '+str(i),(-2.35,1.10,z),(.79,.79,.055),m['lens'],segments=32,rings=16)
    h.ring('Lens cell '+str(i),(-2.35,1.10,z),.91,.81,.14,m['silver'],'z',48)
    c.riser(h,m,'Lens cell foot '+str(i),-2.35,z,(.53,.31),.20)
    for xx in [-3.22,-1.48]:h.screw((xx,1.1,z+.092),m['edge'],'z')
# PDF p. 20: "Add baffle behind lens 2 and in front of lens 3 for stray light
# mitigation." Annular stops between those cells; aperture and depth as drawn.
for n,z in enumerate([.45,.16],1):
    h.ring('Stray-light baffle '+str(n),(-2.35,1.10,z),.84,.52,.035,m['black'],'z',48)
    c.riser(h,m,'Stray-light baffle foot '+str(n),-2.35,z,(.30,.07),.275)
for x in [-3.26,-1.44]:c.riser(h,m,'Optical bench rail',x,.31,(.07,2.77),.25,'goldedge')
c.plaque(h,m,'Refractive telescope',(-2.36,-.055,1.98),2.42)
h.role('SceneSelect')
h.ring('Scene-select bearing housing',(-2.35,1.10,2.89),.70,.47,.23,m['silver'],'z',48)
rotor=h.ring('Scene-select rotor',(-2.35,1.10,3.03),.55,.44,.12,m['dark'],'z',48)
backing=c.plate(h,m,'Scene-select mirror backing',(-2.35,1.10,3.17),(.98,1.14),(.70,0,.71),'dark',.095)
face=c.plate(h,m,'Scene-select reflective surface',(-2.307,1.10,3.213),(.88,1.04),(.70,0,.71))
h.motion([rotor,backing,face],'TIRSSceneSelect',(-2.35,1.10,3.03),(0,0,1))
h.cyl('Scene-select drive motor',(-3.19,1.10,2.83),.22,.44,m['dark'],'z',32)
h.cyl('Scene-select encoder housing',(-2.35,1.10,2.65),.35,.09,m['edge'],'z',32)
for xx in [-2.92,-1.78]:c.riser(h,m,'Scene-select bearing support',xx,2.89,(.17,.27),1.07,'silver')
c.riser(h,m,'Mechanism support frame',-2.35,3.06,(2.18,1.20),.23)
c.plaque(h,m,'Scene-select mirror',(-2.35,-.03,3.92),2.35)
h.role('Blackbody')
c.blackbody(h,m,'Onboard blackbody',(.17,.74,3.0),.48)
h.box('Blackbody thermal isolator',(.17,.285,2.99),(.50,.04,.50),m['cyan'])
h.line('Blackbody thermometer harness',[(.72,.64,2.98),(.85,.25,2.69),(1.16,.18,1.66)],.024,m['loom'])
c.plaque(h,m,'Blackbody reference',(.20,-.035,3.87),1.79)
h.role('Arrays')
c.riser(h,m,'Cold focal-plane support',-2.38,-2.33,(2.84,1.28),.26)
for x in [-3.55,-1.21]:
    h.box('Representative alignment shim',(x,.270,-2.34),(.32,.021,.94),m['goldedge'],.003)
    h.box('Alignment interface bracket',(x,.322,-2.34),(.36,.08,.99),m['silver'])
h.box('Focal-plane carrier',(-2.38,.41,-2.33),(2.67,.11,1.18),m['cyan'])
for n,x in enumerate([-3.22,-2.38,-1.54],1):
    h.box('QWIP detector package '+str(n),(x,.523,-2.33),(.72,.12,1.02),m['chip'])
    h.box('Blank QWIP detector face '+str(n),(x,.598,-2.33),(.60,.035,.85),m['solar'],.004)
    for z in [-2.75,-1.90]:h.screw((x,.618,z),m['edge'],r=.023)
    h.ribbon('Detector readout flex '+str(n),[(x,.52,-1.79),(x,.23,-1.54),(-1.10,.14,-1.48),(-1.10,.14,.15),(.79,.28,.39)],.18,m['goldedge'])
c.plaque(h,m,'QWIP arrays',(-2.39,-.045,-3.48),2.33)
h.role('Filters')
c.riser(h,m,'Exploded fixed-filter assembly support',.08,-1.65,(1.99,1.88),.285)
for n,z in enumerate([-2.24,-1.65,-1.06],1):
    h.box('Filter carrier '+str(n),(.08,.34,z),(1.63,.12,.40),m['silver'])
    for x,material in [(-.30,'cyanedge'),(.46,'goldedge')]:h.box('Fixed interference filter',(x,.420,z),(.63,.045,.25),m[material],.004)
    for x in [-.65,.81]:h.screw((x,.405,z),m['edge'],r=.023)
c.plaque(h,m,'Fixed spectral filters',(.05,-.045,-.49),1.98)
h.role('Readout')
h.enclosure('Focal-plane electronics chassis',(1.27,.35,1.00),(1.66,.72,1.78),m,True)
c.seat(h,m,'Focal-plane electronics chassis',(1.27,.35,1.00),(1.66,.72,1.78))
c.card(h,m,'Focal Plane Electronics',(1.27,.29,.58),(1.35,.65),floor=.025)
c.card(h,m,'Focal Interface Board',(1.27,.32,1.42),(1.35,.65),floor=.025)
h.line('FPE to MEB data harness',[(2.06,.36,.49),(2.45,.26,.41),(2.74,.26,.20)],.03,m['loom'])
h.role('Electronics')
h.enclosure('Main Electronics Box A open chassis',(3.72,.50,.63),(2.16,1.03,3.40),m,True)
for name,z,kind in [('Command and Data Handling',-.62,'digital'),('Power Conversion',.14,'power'),('Mechanism and Temperature Control',.90,'drive'),('High-speed Interface',1.66,'digital')]:c.card(h,m,name,(3.72,.50,z),(1.85,.58),kind,floor=.02)
h.box('Main electronics backplane',(3.72,.465,-1.00),(1.92,.89,.05),m['pcb'])
# PDF p. 14: "fully redundant with two MEBs"; side B drawn closed, cross-strapped.
h.enclosure('Main Electronics Box B closed chassis',(3.72,.30,3.45),(2.0,.56,.80),m,False)
c.seat(h,m,'Main Electronics Box B closed chassis',(3.72,.30,3.45),(2.0,.56,.80))
h.line('MEB A to B cross-strap harness',[(2.95,.30,2.33),(2.85,.22,2.70),(2.95,.30,3.05)],.026,m['loom'])
c.plaque(h,m,'Main electronics box',(3.72,-.015,2.60),2.07)
h.role('Cooling')
h.cyl('Cryocooler thermomechanical body',(-.05,.52,-3.28),.28,1.48,m['silver'],'x',32)
for x in [-.63,.53]:
    h.ring('Cryocooler support clamp',(x,.52,-3.28),.31,.28,.12,m['dark'],'x',32)
    c.riser(h,m,'Cryocooler clamp saddle',x,-3.28,(.16,.42),.23)
h.cyl('Cryocooler cold-head interface',(-.92,.52,-3.28),.15,.26,m['cyan'],'x',24)
h.line('Cold thermal link',[(-1.10,.51,-3.28),(-1.50,.44,-3.12),(-1.68,.43,-2.88)],.045,m['silver'])
# PDF p. 14: two CCEs, and the RSE connects either CCE to the single TMU.
c.card(h,m,'Cooler Control Electronics A',(1.48,.30,-3.12),(1.08,.97),'drive')
c.card(h,m,'Cooler Control Electronics B',(1.62,.30,-1.45),(.90,.55),'drive')
h.enclosure('Redundancy Switch Electronics',(1.50,.25,-2.16),(1.10,.38,.50),m,False)
c.seat(h,m,'Redundancy Switch Electronics',(1.50,.25,-2.16),(1.10,.38,.50))
h.line('CCE A to RSE harness',[(1.48,.36,-2.55),(1.49,.33,-2.47),(1.50,.30,-2.40)],.024,m['loom'])
h.line('CCE B to RSE harness',[(1.62,.36,-1.81),(1.58,.33,-1.87),(1.55,.30,-1.92)],.024,m['loom'])
h.line('RSE to TMU electrical harness',[(1.07,.25,-2.21),(.96,.20,-2.74),(.44,.24,-2.96)],.028,m['loom'])
c.plaque(h,m,'Cryocooler and controls',(.18,-.065,-3.92),2.56)
h.role('Radiator')
c.radiator(h,m,'Cryocooler radiator',(3.57,1.05,-2.71),(2.84,1.72))
# Routed low along the bench edge; through v6 it passed through the CCE A tray.
h.line('Warm heat pipe',[(-.07,.25,-3.48),(.30,.06,-3.75),(2.30,.06,-3.75),(2.54,.95,-3.25)],.047,m['silver'])
c.riser(h,m,'Representative Earth-shield rim',4.94,-2.73,(.07,1.90),1.115,'goldedge')
h.foil('Earth-shield cutaway outer blanket',(4.985,.57,-2.73),(0,1.05,0),(0,0,1.74),(1,0,0),m['gold'])
c.plaque(h,m,'Radiator and shield',(3.62,1.144,-2.07),2.45)
anchors={'AnchorTelescope':[-2.35,1.92,.70],'AnchorArrays':[-2.38,.74,-2.33],'AnchorCooling':[-.05,.91,-3.28],
 'AnchorSceneSelect':[-2.35,1.72,3.05],'AnchorBlackbody':[.17,1.26,3.0],'AnchorReadout':[1.27,.83,1.00],
 'AnchorElectronics':[3.72,1.11,.64],'AnchorRadiator':[3.57,1.15,-2.71],'AnchorFilters':[.08,.56,-1.65]}
eyes={'AnchorTelescope':[-.3,6.9,3.6],'AnchorArrays':[-5.3,10,-5.5],'AnchorCooling':[-.5,10,-6.9],
 'AnchorSceneSelect':[-.5,4.9,7.1],'AnchorBlackbody':[1.8,4.7,7.0],'AnchorReadout':[3.1,4.7,4.2],
 'AnchorElectronics':[7.9,5.1,4.2],'AnchorRadiator':[6.3,10,-4.6],'AnchorFilters':[.9,5,1]}
h.export(ROOT/'public/models/tirs2.glb','GuardianTIRS2',VERSION,'tirs2',anchors,
 'Public TIRS-2 architecture: four lenses, scene-select mechanism, blackbody, three QWIP assemblies with fixed shims, displaced fixed filters, FPE/FIB, Main Electronics Box, cooler/switching electronics and radiator/Earth shield. Packaging and layout as drawn.')
c.raycheck(h,anchors,eyes)
