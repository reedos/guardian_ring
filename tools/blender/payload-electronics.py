"""Representative instrument packaging, not a reconstruction of military hardware.

The civil ABI division into sensor electronics, instrument electronics and cooler
electronics supplies the grouping. Board count, circuit layout, housing shape,
harness routes and all dimensions below are explicitly as drawn.
"""
import bpy


def port(h, m, name, at, width=.48, rear=False):
    x,y,z=at;s=-1 if rear else 1
    h.box(name+' bulkhead flange',(x,y,z),(width+.15,.22,.04),m['silver'],.007)
    h.box(name+' connector shell',(x,y,z+s*.065),(width,.14,.13),m['edge'],.009)
    h.box(name+' insulating insert',(x,y,z+s*.137),(width-.05,.085,.015),m['black'],.003)
    for dx in [-width/2-.035,width/2+.035]:h.screw((x+dx,y,z+s*.033),m['edge'],'z',.023)
    h.box(name+' cable backshell',(x,y,z+s*.20),(width*.78,.12,.115),m['dark'],.009)


def chassis(h,m,name,role,cover_role,at,size):
    x,y,z=at;w,hh,d=size;floor=y-hh/2;top=y+hh/2
    h.role(role)
    # A protruding base lip and recessed wall seat avoid doubled exterior faces
    # where separate manufactured pieces meet. Walls overlap the seat internally.
    h.box(name+' conductive base',(x,floor+.04,z),(w+.08,.08,d+.08),m['silver'],.022)
    for sx in [-1,1]:
        h.box(name+' sidewall',(x+sx*(w/2-.045),y+.0325,z),(.09,hh-.065,d),m['silver'],.019)
        for zz in [z-d*.34,z+d*.34]:
            h.box(name+' mounting foot',(x+sx*(w/2+.085),floor+.022,zz),(.30,.065,.36),m['silver'],.012)
            contact=floor-.0105
            h.cyl(name+' bench contact spacer',(x+sx*(w/2+.085),(-1.51+contact)/2,zz),.067,contact+1.51,m['silver'],segments=16,bevel=.003)
            h.screw((x+sx*(w/2+.15),floor+.061,zz),m['edge'],r=.030)
    for sz in [-1,1]:h.box(name+' endwall',(x,y+.0325,z+sz*(d/2-.035)),(w-.18,hh-.065,.07),m['dark'],.013)
    # A single machined cover closes the complete unit; cutaways hide this role.
    h.role(cover_role)
    h.box(name+' removable cover',(x,top+.035,z),(w+.025,.07,d+.025),m['dark'],.018)
    for sx in [-1,1]:
        h.box(name+' lid edge',(x+sx*(w/2-.055),top+.077,z),(.035,.014,d-.09),m['silver'],.003)
        for zz in [z-d*.42,z,z+d*.42]:h.screw((x+sx*(w/2-.10),top+.084,zz),m['edge'],r=.027)
    # Slight ribs make the common enclosure legible even before it is opened.
    for zz in [z-d*.27,z+d*.27]:h.box(name+' cover stiffener',(x,top+.087,zz),(w-.34,.033,.065),m['dark'],.008)
    h.role(role)
    return floor,top


def board(h,m,name,role,at,size,kind='digital'):
    x,y,z=at;w,d=size;h.role(role)
    h.box(name+' conductive carrier',(x,y-.064,z),(w+.06,.07,d+.06),m['silver'],.009)
    h.board(name,(x,y,z),size,m)
    for sx in [-1,1]:
        for sz in [-1,1]:
            at=(x+sx*(w/2-.06),z+sz*(d/2-.06))
            h.cyl(name+' fixed board standoff',(at[0],y-.145,at[1]),.035,.10,m['silver'],segments=12,bevel=.003)
            h.screw((at[0],y+.035,at[1]),m['edge'],r=.017)
    if kind=='power':
        for dx in [-.39,0,.39]:h.cyl(name+' power inductor',(x+dx,y+.19,z-.11),.075,.10,m['copper'],segments=16)
        for dx in [-.51,-.17,.17,.51]:h.cyl(name+' filter capacitor',(x+dx,y+.11,z+.24),.039,.17,m['dark'],segments=12)
    if kind=='drive':
        for dx in [-.33,0,.33]:h.box(name+' driver heat spreader',(x+dx,y+.17,z-.12),(.19,.022,.19),m['edge'],.005)
    if kind=='clock':h.box(name+' oscillator case',(x-.28,y+.17,z-.22),(.25,.09,.17),m['edge'],.007)
    # Board labels sit on dedicated blank stock above the component envelope.
    h.box(name+' identification stock',(x,y+.24,z+d*.31),(w*.91,.025,.21),m['dark'],.004)


def build(h,m):
    chassis(h,m,'Sensor unit electronics','SensorElectronics','SensorElectronicsCover',(1.65,-.98,-.29),(2.70,.88,2.69))
    board(h,m,'Video readout board','Readout',(.99,-1.20,-.65),(1.10,1.42))
    board(h,m,'Digitization board','Digitizer',(2.28,-1.20,-.65),(1.10,1.42))
    board(h,m,'Peripheral and thermal-control board','Peripheral',(1.65,-1.20,.66),(2.36,.51),'drive')
    h.role('SensorElectronics')
    h.box('Analog digital partition',(1.64,-1.08,-.65),(.035,.56,1.52),m['silver'],.005)
    for x,z in [(1.65,-1.14),(1.65,-.40),(1.10,.29),(2.28,.29)]:
        h.box('Internal board-to-board interconnect',(x,-1.13,z),(.13,.065,.10),m['dark'],.004)
    port(h,m,'Detector interface',(.74,-1.10,-1.635),.49,True)
    port(h,m,'Sensor data interface',(2.28,-1.08,1.06),.55)
    port(h,m,'Sensor power and peripheral interface',(1.02,-1.08,1.06),.46)
    h.box('Sensor electronics identification stock',(1.65,-.72,1.071),(2.26,.24,.028),m['dark'],.005)
    # Signal cable terminates on the unit bulkhead; internal traces stay inside.
    h.ribbon('Detector interface flex',[(-.64,-.33,-3.47),(-.33,-.66,-3.29),(.32,-1.22,-3.23),(.74,-1.15,-2.39),(.74,-1.10,-1.87)],.25,m['goldedge'])
    for dx in [-.08,-.04,0,.04,.08]:h.line('Flex signal conductor',[(-.64+dx,-.317,-3.47),(-.33+dx,-.647,-3.29),(.32+dx,-1.207,-3.23),(.74+dx,-1.137,-2.39),(.74+dx,-1.087,-1.87)],.0035,m['copper'])

    chassis(h,m,'Instrument electronics unit','InstrumentElectronics','InstrumentElectronicsCover',(4.95,-.92,1.24),(3.25,1.00,4.65))
    # Boards are fixed within one enclosure and conduct to one baseplate. The
    # chosen side-by-side service layout is diagrammatic, not a flight PCB count.
    board(h,m,'Instrument controller board','Controller',(4.13,-1.18,-.43),(1.30,.84))
    board(h,m,'Data-processing board','DataInterface',(5.76,-1.18,-.43),(1.30,.84))
    board(h,m,'Telemetry and timing board','DataInterface',(4.13,-1.18,.63),(1.30,.84),'clock')
    board(h,m,'High-speed interface board','DataInterface',(5.76,-1.18,.63),(1.30,.84))
    board(h,m,'Scan motor drive board','ScanDrive',(4.13,-1.18,1.69),(1.30,.84),'drive')
    board(h,m,'Encoder-processing board','EncoderProcessing',(5.76,-1.18,1.69),(1.30,.84))
    board(h,m,'Instrument power board','PowerSupply',(4.95,-1.18,2.75),(2.92,.84),'power')
    h.role('InstrumentElectronics')
    # Rails support carrier undersides from within their footprint; their side
    # faces do not coincide with the exposed edges of the removable carriers.
    for x in [3.56,4.95,6.34]:h.box('Common card carrier rail',(x,-1.335,1.21),(.06,.13,4.35),m['silver'],.005)
    # Internal shared interconnect runs through the clear channel between cards.
    h.box('Internal instrument interconnect',(4.95,-1.18,.55),(.15,.06,3.49),m['pcb'],.004)
    for z in [-.43,.63,1.69]:
        for x in [4.83,5.08]:h.box('Internal interconnect socket',(x,-1.115,z),(.10,.08,.17),m['dark'],.004)
    for x,name in [(3.86,'Spacecraft regulated power'),(4.95,'Spacecraft command telemetry and timing'),(6.00,'Spacecraft science data')]:port(h,m,name,(x,-.97,3.57),.57)
    for x,name in [(3.95,'Sensor electronics interface'),(5.02,'Mechanism motor and encoder interface'),(6.01,'Cooler control interface')]:port(h,m,name,(x,-1.02,-1.09),.53,True)
    h.box('Instrument unit identification stock',(4.95,-.59,3.585),(2.95,.24,.028),m['dark'],.005)
    # Defined unit-to-unit harnesses, clamped to the common support. These
    # interfaces remain visible with the lids installed.
    h.line('Sensor-to-instrument data harness',[(2.28,-1.08,1.30),(2.28,-1.23,1.61),(3.15,-1.23,1.61),(3.15,-1.23,-1.45),(3.95,-1.02,-1.33)],.026,m['loom'])
    h.line('Sensor power and peripheral harness',[(1.02,-1.08,1.30),(1.02,-1.23,1.91),(3.01,-1.23,1.91),(3.01,-1.23,-1.65),(3.95,-1.08,-1.33)],.023,m['loom'])
    h.line('Instrument scan drive and encoder harness',[(5.02,-1.02,-1.33),(5.02,-1.26,-1.59),(3.10,-1.26,-1.77),(3.10,-1.26,3.98),(-.31,-1.26,3.98),(-.40,-1.14,3.66)],.033,m['loom'])
    for z in [-.91,.42,1.78,3.05]:h.box('Harness mounting clamp',(3.15,-1.23,z),(.17,.08,.12),m['silver'],.004)
    # Spacecraft boundaries terminate at restrained bulkhead connectors mounted
    # on the perimeter of this instrument support, rather than floating arrows.
    h.role('SpacecraftInterface')
    h.box('Spacecraft interface bracket',(4.94,-1.08,4.37),(3.46,.70,.08),m['silver'],.014)
    for x,name in [(3.86,'Spacecraft power boundary'),(4.95,'Spacecraft command boundary'),(6.00,'Spacecraft data boundary')]:
        port(h,m,name,(x,-.97,4.30),.57,True)
        h.line(name+' instrument harness',[(x,-.97,3.81),(x,-1.16,4.00),(x,-.97,4.06)],.026,m['loom'])

    chassis(h,m,'Cooler control electronics','CoolerElectronics','CoolerElectronicsCover',(4.80,-1.04,-3.53),(2.62,.75,1.20))
    board(h,m,'Cooler power amplifier board','CoolerControl',(4.8,-1.20,-3.53),(2.35,.92),'drive')
    h.role('CoolerElectronics')
    port(h,m,'Cooler power drive',(5.50,-1.02,-2.93),.43)
    port(h,m,'Cooler command and temperature interface',(4.16,-1.02,-2.93),.43)
    h.box('Cooler electronics identification stock',(4.8,-.79,-2.909),(2.26,.20,.028),m['dark'],.005)
    h.line('Instrument-to-cooler control harness',[(6.01,-1.02,-1.33),(6.26,-1.21,-1.76),(6.26,-1.21,-2.70),(4.16,-1.02,-2.69)],.024,m['loom'])
    h.line('Cooler drive output harness',[(5.50,-1.02,-2.69),(5.57,-.94,-2.48),(5.22,-.87,-2.24)],.033,m['loom'])
    h.line('Cold-head thermometer feedback',[(-.42,-.40,-3.51),(-.12,-.87,-3.68),(.72,-1.23,-4.03),(3.10,-1.23,-4.03),(3.29,-1.23,-2.69),(4.16,-1.02,-2.69)],.015,m['loom'])

    return {
        'AnchorReadout':[.99,-.86,-.65], 'AnchorDigitizer':[2.28,-.86,-.65],
        'AnchorController':[4.13,-.85,-.43], 'AnchorDataInterface':[5.76,-.85,.63],
        'AnchorPower':[4.95,-.85,2.75], 'AnchorScanDrive':[4.13,-.85,1.69],
        'AnchorEncoder':[5.76,-.85,1.69], 'AnchorPeripheral':[1.65,-.85,.66],
        'AnchorSensorElectronics':[1.65,-.48,-.29],
        'AnchorInstrumentElectronics':[4.95,-.35,1.24],
        'AnchorCoolerElectronics':[4.80,-.605,-3.53],
        'AnchorSpacecraftInterface':[4.95,-.70,4.37],
    }
