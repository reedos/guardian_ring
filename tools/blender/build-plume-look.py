"""Phase 2 generic molecular-emission still, with no vehicle, place, or scale.

The shape, colors, glow and molecular icons are an artistic explanation, not a
combustion calculation, radiometric image, temperature field, or sensor response.
Blender --background --python tools/blender/build-plume-look.py [-- --draft]
"""
import bpy
import importlib.util
import math
import pathlib
import random
import sys
from mathutils import Vector

HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("orbit_look",HERE/"build-orbit-look.py")
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)


def plume_mesh(name, length, width, material, offset=(0,0,0)):
    vertices=[];faces=[];nr=84;ns=56
    for j in range(nr+1):
        t=j/nr
        r=(.035+.72*math.sin(math.pi*t)+.32*t)*math.sin(math.pi*t)**.3+.015
        for i in range(ns):
            a=i*math.tau/ns
            ripple=1+.10*math.sin(a*3+t*29)+.07*math.sin(a*7-t*42)
            x=.32*t+.18*t*math.sin(t*6)+width*r*ripple*math.cos(a)
            y=.11*t*math.sin(t*8)+width*r*ripple*math.sin(a)
            vertices.append((x+offset[0],y+offset[1],t*length+offset[2]))
    for j in range(nr):
        for i in range(ns):
            a=j*ns+i;b=j*ns+(i+1)%ns
            faces.append((a,b,b+ns,a+ns))
    faces.append(tuple(range(ns-1,-1,-1)));faces.append(tuple(nr*ns+i for i in range(ns)))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob);ob.data.materials.append(material)
    return ob


def volume_material(name, emission, density, scale, core=False):
    mat=bpy.data.materials.new(name);mat.use_nodes=True
    n=mat.node_tree.nodes;l=mat.node_tree.links;n.clear()
    out=n.new("ShaderNodeOutputMaterial")
    p=n.new("ShaderNodeVolumePrincipled")
    p.inputs["Color"].default_value=(.16,.07,.021,1)
    p.inputs["Anisotropy"].default_value=.12
    tc=n.new("ShaderNodeTexCoord")
    noise=n.new("ShaderNodeTexNoise");noise.inputs["Scale"].default_value=scale;noise.inputs["Detail"].default_value=4;noise.inputs["Roughness"].default_value=.7
    l.new(tc.outputs["Generated"],noise.inputs["Vector"])
    cut=n.new("ShaderNodeMapRange");cut.clamp=True;cut.inputs["From Min"].default_value=.40;cut.inputs["From Max"].default_value=.74;cut.inputs["To Min"].default_value=0;cut.inputs["To Max"].default_value=1;l.new(noise.outputs["Fac"],cut.inputs[0])
    xyz=n.new("ShaderNodeSeparateXYZ");l.new(tc.outputs["Generated"],xyz.inputs[0])
    fade=n.new("ShaderNodeValToRGB")
    fade.color_ramp.elements.remove(fade.color_ramp.elements[1])
    for pos,val in [(0,.1),(.08,1),(.3,.9),(.65,.35),(.92,0),(1,0)]:
        el=fade.color_ramp.elements[0] if pos==0 else fade.color_ramp.elements.new(pos);el.color=(val,val,val,1)
    l.new(xyz.outputs["Z"],fade.inputs[0])
    mask=n.new("ShaderNodeMath");mask.operation="MULTIPLY";l.new(cut.outputs[0],mask.inputs[0]);l.new(fade.outputs[0],mask.inputs[1])
    dens=n.new("ShaderNodeMath");dens.operation="MULTIPLY";dens.inputs[1].default_value=density;l.new(mask.outputs[0],dens.inputs[0]);l.new(dens.outputs[0],p.inputs["Density"])
    emit=n.new("ShaderNodeMath");emit.operation="MULTIPLY";emit.inputs[1].default_value=emission;l.new(mask.outputs[0],emit.inputs[0]);l.new(emit.outputs[0],p.inputs["Emission Strength"])
    colors=n.new("ShaderNodeValToRGB")
    colors.color_ramp.elements[0].position=0;colors.color_ramp.elements[0].color=(1,.87,.54,1) if core else (1,.45,.11,1)
    colors.color_ramp.elements[1].position=1;colors.color_ramp.elements[1].color=(.16,.014,.001,1)
    for pos,col in [(.18,(1,.64,.25,1)),(.42,(1,.26,.025,1)),(.7,(.4,.07,.004,1))]:
        e=colors.color_ramp.elements.new(pos);e.color=col
    l.new(xyz.outputs["Z"],colors.inputs[0]);l.new(colors.outputs[0],p.inputs["Emission Color"])
    l.new(p.outputs["Volume"],out.inputs["Volume"])
    return mat


def molecule(center, angle, bent=False):
    light=lib.material("Molecular schematic pale amber",(.36,.20,.085),.45,.32,.08)
    dark=lib.material("Molecular schematic graphite",(.12,.16,.19),.55,.2,.08)
    rod=lib.material("Molecular schematic bond",(.31,.26,.21),.4,.35,.2)
    ctr=Vector(center)
    direction=Vector((math.cos(angle),0,math.sin(angle)))
    ends=[ctr+direction*.39,ctr-direction*.39]
    if bent: ends=[ctr+Vector((-.34,0,-.23)),ctr+Vector((.34,0,-.23))]
    lib.sphere("Schematic molecular center",ctr,.14,dark,32,16)
    for end in ends:
        lib.sphere("Schematic molecular atom",end,.105 if bent else .17,light,32,16)
        lib.curve("Schematic molecular bond",[ctr,end],rod,.022)


def build():
    lib.reset();random.seed(37)
    eevee=bpy.context.scene.eevee
    eevee.volumetric_tile_size="2"
    eevee.volumetric_samples=128
    eevee.use_volume_custom_range=True
    eevee.volumetric_start=10
    eevee.volumetric_end=26
    plume_mesh("Illustrative luminous gas envelope",6.5,.95,volume_material("Amber turbulent gas",3,.6,11))
    plume_mesh("Illustrative white-hot core",2.4,.20,volume_material("Bright source core",70,.06,8,True))
    plume_mesh("Outer fading wisps",7.2,1.3,volume_material("Dim warm molecular envelope",.36,.2,12))
    for i in range(24):
        a=random.uniform(0,math.tau);length=random.uniform(1.2,4.8)
        spread=random.uniform(.07,.85)
        points=[]
        for j in range(70):
            t=j/69;z=.12+t*length
            r=spread*(.025+t*.7)
            phase=a+t*random.uniform(.1,.13)
            points.append((.03+.25*t+r*math.cos(phase)+.035*t*math.sin(t*21+a),r*math.sin(phase),z))
        col=(1,.31+.3*random.random(),.06)
        mat=lib.material("Luminous flow thread",col,0,.9,random.uniform(.10,.35))
        lib.curve("Schematic radiant flow",points,mat,random.uniform(.0014,.0032))
    # Peripheral molecule icons suggest spectral origin; not a diagram of actual
    # gas concentration, molecule size, or a real plume's composition.
    molecule((1.65,.1,3.85),.20)
    molecule((-1.40,.2,2.75),-.7,True)
    lib.area("Molecule key",(2,-4,5),280,(1,.64,.28),4)
    lib.area("Molecule fill",(-4,-2,4),110,(.34,.52,.68),3)
    cam=lib.camera((6,-16,5.7),(0,0,3),9.5)
    lib.compositor()
    if "--draft" in sys.argv:
        lib.render("plume-draft",cam,(6,-16,5.7),(0,0,3.0),10.6,(1200,750),55)
    else:
        lib.render("plume",cam,(6,-16,5.7),(0,0,3.0),10.6,(2000,1250),55)
        lib.render("plume-phone",cam,(4,-16,5.5),(0,0,3.0),8.0,(780,960),17)


if __name__=="__main__":build()
