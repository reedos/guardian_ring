"""ABI civil assembly v6; nine inspectable groups, representative packaging.
GOES-R component vocabulary; four telescope mirrors and three focal modules.
Layout and optical angles as drawn, not a flight prescription. CPU export only.
v7 follows the GOES-R Series Data Book (printed pp. 3-5 to 3-17): scanner control
(SIMD) and the power supply are Electronics Unit cards; the SUE holds the video
processor and the Peripheral and Thermal Control card; one telescope mirror has
a focus motor; each of the two cryocoolers has its own CCE; each thermal dynamic
unit is an integral cooler, transfer line and remote cold head. Parts now rest on
the bench. The Data Book publishes no ABI dimensions, so sizes remain as drawn.
"""
import bpy, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('civil',Path(__file__).with_name('civil-detail.py'))
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c);h=c.load_h()
bpy.ops.wm.read_factory_settings(use_empty=True);m=h.palette();VERSION=7
c.bench(h,m,(.35,-.26,.10),(10.8,8.2))
h.role('Telescope')
mirrors=[(-3.40,1.05,.55,.59),(-2.40,.97,-.65,.37),(-1.43,1.08,.47,.44),(-.48,.94,-.65,.30)]
for i,(x,y,z,r) in enumerate(mirrors,1):
    h.box('Telescope mirror support '+str(i),(x,y/2-.04,z-.10),(.15,y,.16),m['dark'])
    h.box('Telescope mirror foot '+str(i),(x,.035,z-.1),(r*1.30,.13,.48),m['silver'])
    h.cyl('Telescope mirror backing '+str(i),(x,y,z-.03),r*1.07,.10,m['dark'],'z',40)
    h.cyl('Reflective telescope surface '+str(i),(x,y,z+.036),r,.022,m['mirror'],'z',48,.003)
    h.ring('Telescope mirror retaining ring '+str(i),(x,y,z+.040),r*1.13,r*1.045,.045,m['silver'],'z',48)
# Data Book p. 3-8: one of the four telescope mirrors is motor-driven for minor
# focus adjustment. Which mirror, and the actuator form, are as drawn.
fx,fy,fz,fr=mirrors[2]
h.box('Telescope focus motor bracket',(fx+.16,fy-.30,fz-.20),(.20,.10,.12),m['dark'])
h.cyl('Telescope focus motor',(fx+.30,fy-.30,fz-.20),.085,.20,m['edge'],'z',24)
h.rod('Telescope focus drive link',(fx+.30,fy-.30,fz-.10),(fx+.22,fy-.22,fz-.065),.022,m['silver'])
c.plaque(h,m,'Telescope',(-2.4,-.08,1.43),2.5)
h.role('ScanSystem')
c.scan(h,m,'North south scan',(-3.20,.87,3.0),(.64,.25,.72),scale=.85,motion='ABIScanNorthSouth')
c.scan(h,m,'East west scan',(-1.28,.86,2.78),(-.64,.45,.63),scale=.69,axis='y',motion='ABIScanEastWest')
c.plaque(h,m,'Scan mirrors',(-2.48,-.06,3.78),2.48)
h.role('Calibration')
c.blackbody(h,m,'Internal calibration target',(.20,.63,2.62),.34)
c.plate(h,m,'Solar calibration diffuser',(1.08,.74,2.75),(.57,.60),(0,.45,1),'white')
# v7: the post meets the diffuser's lower edge and the cover hinge sits on that
# edge; in v6 both hung free of the plate. Hinge placement is as drawn.
c.riser(h,m,'Solar target support',1.08,2.86,(.16,.13),.49,'silver')
h.cyl('Solar calibration cover hinge',(1.08,.47,2.875),.05,.62,m['dark'],'x',24)
c.plaque(h,m,'Calibration targets',(.61,-.06,3.63),1.72)
h.role('Bands')
for name,at,normal,mat in [('Visible infrared splitter',(.41,.99,-.43),(.71,0,.71),'cyanedge'),('Infrared splitter',(1.27,1.0,-.42),(-.71,0,.71),'goldedge'),('Aft fold mirror',(.68,.99,.49),(.71,0,-.71),'mirror')]:
    c.plate(h,m,name,at,(.47,.63),normal,mat)
    h.box(name+' support',(at[0],.47,at[2]),(.12,.90,.13),m['dark'])
    h.box(name+' foot',(at[0],.04,at[2]),(.42,.11,.38),m['silver'])
c.plaque(h,m,'Aft optics',(.67,-.06,1.34),1.5)
h.role('FocalPlanes')
for name,z in [('VNIR',-.83),('MWIR',.0),('LWIR',.83)]:
    x=2.70
    c.riser(h,m,name+' module base',x,z,(1.06,.69),.23)
    h.box(name+' carrier',(x,.29,z),(.94,.095,.61),m['silver'])
    h.box(name+' cold surround',(x,.37,z),(.78,.049,.49),m['cyan'])
    h.box(name+' blank module entrance',(x,.43,z),(.64,.035,.35),m['solar'],.006)
    for xx in [x-.42,x+.42]:h.screw((xx,.36,z),m['edge'])
    h.ribbon(name+' readout interface',[(x+.50,.31,z),(3.47,.006,z),(3.47,.006,1.78),(3.43,.14,1.93)],.17,m['goldedge'])
# v7: plate shifted left so the readout ribbons pass beside it, not over it.
c.plaque(h,m,'Focal modules',(2.45,-.06,1.38),1.77)
h.role('Readout')
# Data Book p. 3-16: the SUE holds the Video Processors and the Peripheral and
# Thermal Control (P&TC) card; scan-mirror control is the SIMD card in the EU.
h.enclosure('Sensor Unit Electronics chassis',(2.77,.34,2.72),(2.00,.63,1.70),m,True)
c.seat(h,m,'Sensor Unit Electronics chassis',(2.77,.34,2.72),(2.00,.63,1.70))
c.card(h,m,'Video Processor',(2.77,.31,2.34),(1.68,.62),floor=.06)
c.card(h,m,'Peripheral and Thermal Control',(2.77,.34,3.19),(1.68,.58),'drive',floor=.06)
c.plaque(h,m,'Sensor electronics',(2.78,.02,3.80),1.9)
h.role('Controller')
# Data Book Table 3-6 card names; the Telemetry and Timing and encoder cards are
# described in the text but not drawn as separate boards.
h.enclosure('Electronics Unit chassis',(4.44,.43,-.02),(1.48,.89,2.78),m,True)
for name,z,kind in [('Instrument Controller',-1.02,'digital'),('Data Processor',-.38,'digital'),('High Speed IO',.26,'digital'),('Scanner Interface and Motor Driver',.90,'drive')]:c.card(h,m,name,(4.44,.40,z),(1.18,.50),kind,floor=.02)
h.role('Power')
# Data Book p. 3-16: "The EU contains the ABI power supplies." The power card is
# drawn in its own bay of the same unit, joined to the EU by a parent-board link.
h.enclosure('Electronics Unit power-supply bay',(4.59,.38,2.82),(1.32,.78,1.55),m,True)
c.seat(h,m,'Electronics Unit power-supply bay',(4.59,.38,2.82),(1.32,.78,1.55))
c.riser(h,m,'Electronics Unit parent-board link',4.62,1.7075,(1.0,.70),.18,'silver')
c.card(h,m,'Power Supply',(4.59,.35,2.80),(1.04,1.23),'power',floor=.025)
h.line('Power supply output harness',[(4.2,.22,2.24),(3.91,.17,2.06),(3.92,.17,1.20)],.03,m['loom'])
c.plaque(h,m,'Power supply',(4.54,-.01,3.82),1.43)
h.role('Thermal')
# Data Book pp. 3-14 to 3-17: two redundant two-stage pulse-tube cryocoolers.
# Each thermal dynamic unit is an integral cooler, a transfer line and a remote
# cold head at the aft optics; each has its own CCE. Routing is as drawn.
heads=[(2.02,.30,-1.50),(2.42,.30,-1.50)]
routes=[[(-.12,.38,-2.39),(.00,.42,-2.00),(1.60,.36,-1.86),(2.02,.30,-1.62)],
        [(1.21,.38,-2.39),(1.70,.34,-2.05),(2.42,.30,-1.62)]]
for n,x in enumerate([-.58,.75],1):
    c.riser(h,m,'Cooler mount',x,-2.39,(1.10,.64),.14)
    h.cyl('Representative redundant cooler '+str(n),(x,.38,-2.39),.23,.91,m['silver'],'x',32)
    for xx in [x-.31,x+.31]:h.ring('Cooler mounting clamp',(xx,.38,-2.39),.252,.231,.075,m['dark'],'x',32)
    hx,hy,hz=heads[n-1]
    c.riser(h,m,'Remote cold head support',hx,hz,(.18,.16),hy-.09)
    h.cyl('Remote cold head '+str(n),heads[n-1],.10,.22,m['cyan'],'z',24)
    h.line('Cooler transfer line',routes[n-1],.03,m['silver'])
    h.line('Cold-head thermal strap',[(hx,hy,hz+.11),(hx+.20,.20,-1.15)],.025,m['cyan'])
    c.card(h,m,'Cryocooler Control Electronics '+str(n),(-2.60,.16,[-3.05,-2.25][n-1]),(2.07,.50),'drive')
c.radiator(h,m,'Heat rejection radiator',(3.48,.77,-2.69),(2.86,1.69))
h.line('Warm heat rejection path',[(.64,.14,-2.86),(1.59,.14,-3.24),(2.70,.56,-3.19)],.047,m['silver'])
c.plaque(h,m,'Cooling hardware',(-.04,-.02,-1.59),2.47)
anchors={'AnchorTelescope':[-2.4,1.43,-.61],'AnchorBands':[.73,1.43,-.16],'AnchorFocalPlanes':[2.70,.51,0],
 'AnchorScanSystem':[-2.16,1.43,2.97],'AnchorCalibration':[.20,1.06,2.75],'AnchorReadout':[2.77,.77,2.74],
 'AnchorController':[4.44,.95,-.02],'AnchorPower':[4.59,.93,2.82],'AnchorThermal':[.09,.68,-2.39],
 'AnchorCooler':[.75,.68,-2.39],'AnchorRadiator':[3.48,.91,-2.69]}
eyes={'AnchorTelescope':[.5,6.5,3.6],'AnchorBands':[2.6,4.7,3.7],'AnchorFocalPlanes':[6.4,4.8,3.1],
 'AnchorScanSystem':[-.6,4.8,7.0],'AnchorCalibration':[1.3,4.8,6.9],'AnchorReadout':[4.2,4.6,7.0],
 'AnchorController':[7.9,4.6,2.8],'AnchorPower':[7.4,4.7,6.1],'AnchorThermal':[.8,10,3.7]}
h.export(ROOT/'public/models/abi.glb','GuardianABI',VERSION,'abi',anchors,
 'Public ABI component roles: orthogonal scan mirrors, four-mirror telescope, calibration targets, aft spectral optics, three focal-plane modules, Sensor Unit Electronics, Electronics Unit, power supply and cooling. Layout and package internals as drawn.')
c.raycheck(h,anchors,eyes)
