"""ABI civil assembly v5; nine inspectable groups, representative packaging.
GOES-R component vocabulary; four telescope mirrors and three focal modules.
Layout and optical angles as drawn, not a flight prescription. CPU export only.
"""
import bpy, importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('civil',Path(__file__).with_name('civil-detail.py'))
c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c);h=c.load_h()
bpy.ops.wm.read_factory_settings(use_empty=True);m=h.palette();VERSION=5
c.bench(h,m,(.35,-.26,.10),(10.8,8.2))
h.role('Telescope')
mirrors=[(-3.40,1.05,.55,.59),(-2.40,.97,-.65,.37),(-1.43,1.08,.47,.44),(-.48,.94,-.65,.30)]
for i,(x,y,z,r) in enumerate(mirrors,1):
    h.box('Telescope mirror support '+str(i),(x,y/2-.04,z-.10),(.15,y,.16),m['dark'])
    h.box('Telescope mirror foot '+str(i),(x,.035,z-.1),(r*1.30,.13,.48),m['silver'])
    h.cyl('Telescope mirror backing '+str(i),(x,y,z-.03),r*1.07,.10,m['dark'],'z',40)
    h.cyl('Reflective telescope surface '+str(i),(x,y,z+.036),r,.022,m['mirror'],'z',48,.003)
    h.ring('Telescope mirror retaining ring '+str(i),(x,y,z+.040),r*1.13,r*1.045,.045,m['silver'],'z',48)
c.plaque(h,m,'Telescope',(-2.4,-.08,1.43),2.5)
h.role('ScanSystem')
c.scan(h,m,'North south scan',(-3.20,.87,3.0),(.64,.25,.72),scale=.85)
c.scan(h,m,'East west scan',(-1.28,.86,2.78),(-.64,.45,.63),scale=.69,axis='y')
c.plaque(h,m,'Scan mirrors',(-2.48,-.06,3.78),2.48)
h.role('Calibration')
c.blackbody(h,m,'Internal calibration target',(.20,.63,2.62),.34)
c.plate(h,m,'Solar calibration diffuser',(1.08,.74,2.75),(.57,.60),(0,.45,1),'white')
h.box('Solar target support',(1.08,.36,2.58),(.16,.61,.15),m['silver'])
h.cyl('Solar cover hinge',(1.08,.45,2.40),.06,.70,m['dark'],'x',24)
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
    h.box(name+' module base',(x,.12,z),(1.06,.22,.69),m['dark'])
    h.box(name+' carrier',(x,.29,z),(.94,.095,.61),m['silver'])
    h.box(name+' cold surround',(x,.37,z),(.78,.049,.49),m['cyan'])
    h.box(name+' blank module entrance',(x,.43,z),(.64,.035,.35),m['solar'],.006)
    for xx in [x-.42,x+.42]:h.screw((xx,.36,z),m['edge'])
    h.ribbon(name+' readout interface',[(x+.50,.31,z),(3.47,-.09,z),(3.47,-.09,1.78),(3.43,.14,1.93)],.17,m['goldedge'])
c.plaque(h,m,'Focal modules',(2.73,-.06,1.38),1.77)
h.role('Readout')
h.enclosure('Sensor Unit Electronics chassis',(2.77,.34,2.72),(2.00,.63,1.70),m,True)
c.card(h,m,'Video Processor',(2.77,.31,2.34),(1.68,.62))
c.card(h,m,'Scan interface',(2.77,.34,3.19),(1.68,.58),'drive')
c.plaque(h,m,'Sensor electronics',(2.78,.02,3.80),1.9)
h.role('Controller')
h.enclosure('Electronics Unit chassis',(4.44,.43,-.02),(1.48,.89,2.78),m,True)
for name,z in [('Instrument Control',-.93),('Data Processor',-.09),('High-speed Interface',.74)]:c.card(h,m,name,(4.44,.40,z),(1.18,.63))
h.role('Power')
h.enclosure('Power supply enclosure',(4.59,.38,2.82),(1.32,.78,1.55),m,True)
c.card(h,m,'Power Supply',(4.59,.35,2.80),(1.04,1.23),'power')
h.line('Power supply output harness',[(4.2,.22,2.24),(3.91,.17,2.06),(3.92,.17,1.20)],.03,m['loom'])
c.plaque(h,m,'Power supply',(4.54,-.01,3.82),1.43)
h.role('Thermal')
for n,x in enumerate([-.58,.75],1):
    h.box('Cooler mount',(x,.00,-2.39),(1.10,.14,.64),m['dark'])
    h.cyl('Representative redundant cooler '+str(n),(x,.38,-2.39),.23,.91,m['silver'],'x',32)
    for xx in [x-.31,x+.31]:h.ring('Cooler mounting clamp',(xx,.38,-2.39),.252,.231,.075,m['dark'],'x',32)
    h.cyl('Cooler cold head',(x+.57,.38,-2.39),.118,.20,m['cyan'],'x',24)
    h.line('Cooler transfer line',[(x+.70,.38,-2.39),(1.76,.28,-2.17),(2.29,.24,-1.10)],.03,m['silver'])
c.card(h,m,'Cryocooler Control Electronics',(-2.60,.16,-2.63),(2.07,1.22),'drive')
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
