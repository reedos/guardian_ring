"""Phase 2 static design study; no live model and no operational constellation.

Blender 5.2 --background --python tools/blender/build-orbit-look.py
Use -- --draft for a quick landscape inspection. Distances are compressed,
satellite proxies enlarged, and every position is an artistic schematic.
NASA texture provenance: research/look-assets.md.
"""
import bpy
import math
import pathlib
import random
import sys
from mathutils import Vector

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "look"
TEX = ROOT / "research" / "look" / "textures"
PNG_OUT = ROOT / "research" / "look" / "renders"
AMBER = (0.78, 0.45, 0.19)


def reset():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.render.engine = "CYCLES" if "--cycles" in sys.argv else "BLENDER_EEVEE"
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    scene.render.film_transparent = False
    scene.world.color = (0, 0, 0)
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0, 0, 0, 1)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.image_settings.color_depth = "8"
    scene.render.resolution_percentage = 100
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = 64
    OUT.mkdir(parents=True, exist_ok=True)
    PNG_OUT.mkdir(parents=True, exist_ok=True)
    return scene


def material(name, color, metal=0, rough=.4, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*color, 1)
    m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = rough
    p.inputs["Emission Color"].default_value = (*color, 1)
    p.inputs["Emission Strength"].default_value = emission
    return m


def sphere(name, location, radius, mat, segments=64, rings=32):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings, radius=radius, location=location)
    o = bpy.context.object
    o.name = name
    o.data.materials.append(mat)
    for p in o.data.polygons: p.use_smooth = True
    return o


def box(name, position, size, mat, parent=None, bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1, location=position)
    o = bpy.context.object
    o.name = name
    o.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(mat)
    if bevel:
        mod = o.modifiers.new("Soft manufactured edges", "BEVEL")
        mod.width = bevel
        mod.segments = 3
    if parent: o.parent = parent
    return o


def curve(name, points, mat, radius=.008, close=False):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.resolution_u = 2
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    sp = cu.splines.new("POLY")
    sp.points.add(len(points)-1)
    for p, co in zip(sp.points, points): p.co = (*co, 1)
    sp.use_cyclic_u = close
    ob = bpy.data.objects.new(name, cu)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(mat)
    return ob


def area(name, position, energy, color, size=5):
    bpy.ops.object.light_add(type="AREA", location=position)
    ob = bpy.context.object
    ob.name = name
    ob.data.energy = energy
    ob.data.color = color
    ob.data.shape = "DISK"
    ob.data.size = size
    ob.rotation_euler = (-ob.location).to_track_quat("-Z", "Y").to_euler()
    return ob


def camera(position, target=(0,0,0), scale=11.2):
    bpy.ops.object.camera_add(location=position)
    cam = bpy.context.object
    cam.name = "Look study camera"
    cam.rotation_euler = (Vector(target)-cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = scale
    cam.data.lens = 45
    bpy.context.scene.camera = cam
    return cam


def compositor():
    scene = bpy.context.scene
    if hasattr(scene, "node_tree"):
        scene.use_nodes = True
        nt = scene.node_tree
    else:
        nt = bpy.data.node_groups.new("Gentle optical bloom", "CompositorNodeTree")
        scene.compositing_node_group = nt
    nt.nodes.clear()
    rl = nt.nodes.new("CompositorNodeRLayers")
    glare = nt.nodes.new("CompositorNodeGlare")
    if hasattr(glare, "glare_type"):
        glare.glare_type = "FOG_GLOW"
        glare.quality = "HIGH"
        glare.threshold = 1.6
        glare.size = 8
        glare.mix = -.85
    else:
        glare.inputs["Type"].default_value = "Fog Glow"
        glare.inputs["Quality"].default_value = "High"
        glare.inputs["Threshold"].default_value = 1.6
        glare.inputs["Size"].default_value = .4
        glare.inputs["Strength"].default_value = .15
    if hasattr(scene, "node_tree"):
        out = nt.nodes.new("CompositorNodeComposite")
    else:
        nt.interface.new_socket(name="Image", in_out="OUTPUT", socket_type="NodeSocketColor")
        out = nt.nodes.new("NodeGroupOutput")
    nt.links.new(rl.outputs["Image"], glare.inputs["Image"])
    nt.links.new(glare.outputs["Image"], out.inputs["Image"])


def render(name, cam, position, target, scale, size, roll=0):
    scene = bpy.context.scene
    cam.location = position
    cam.rotation_euler = (Vector(target)-cam.location).to_track_quat("-Z", "Y").to_euler()
    cam.rotation_euler.rotate_axis("Z",math.radians(roll))
    cam.data.ortho_scale = scale
    scene.render.resolution_x, scene.render.resolution_y = size
    scene.render.filepath = str(PNG_OUT / (name + ".png"))
    bpy.ops.render.render(write_still=True)


def earth_material():
    m = bpy.data.materials.new("NASA Earth composites - credited in research/look-assets.md")
    m.use_nodes = True
    nt=m.node_tree; n=nt.nodes; l=nt.links
    p=n.get("Principled BSDF")
    p.inputs["Roughness"].default_value=.78
    p.inputs["Specular IOR Level"].default_value=.16
    day=n.new("ShaderNodeTexImage"); day.image=bpy.data.images.load(str(TEX / "nasa-blue-marble-january-2004.jpg"))
    night=n.new("ShaderNodeTexImage"); night.image=bpy.data.images.load(str(TEX / "nasa-black-marble-2016.jpg"))
    tint=n.new("ShaderNodeMixRGB"); tint.blend_type="MULTIPLY"; tint.inputs[0].default_value=1
    tint.inputs[2].default_value=(.38,.54,.68,1)
    l.new(day.outputs["Color"],tint.inputs[1]);l.new(tint.outputs[0],p.inputs["Base Color"])
    # City-light image is radiometrically stylized for this design study.
    bw=n.new("ShaderNodeRGBToBW");l.new(night.outputs["Color"],bw.inputs[0])
    sub=n.new("ShaderNodeMath");sub.operation="SUBTRACT";sub.inputs[1].default_value=.014;l.new(bw.outputs[0],sub.inputs[0])
    clamp=n.new("ShaderNodeMath");clamp.operation="MAXIMUM";clamp.inputs[1].default_value=0;l.new(sub.outputs[0],clamp.inputs[0])
    geo=n.new("ShaderNodeNewGeometry")
    dot=n.new("ShaderNodeVectorMath");dot.operation="DOT_PRODUCT";dot.inputs[1].default_value=Vector((-6,-1,5)).normalized();l.new(geo.outputs["Normal"],dot.inputs[0])
    nightmask=n.new("ShaderNodeMapRange");nightmask.clamp=True;nightmask.inputs["From Min"].default_value=-.25;nightmask.inputs["From Max"].default_value=.35;nightmask.inputs["To Min"].default_value=1;nightmask.inputs["To Max"].default_value=.05;l.new(dot.outputs["Value"],nightmask.inputs["Value"])
    gate=n.new("ShaderNodeMath");gate.operation="MULTIPLY";l.new(clamp.outputs[0],gate.inputs[0]);l.new(nightmask.outputs[0],gate.inputs[1])
    mult=n.new("ShaderNodeMath");mult.operation="MULTIPLY";mult.inputs[1].default_value=8;l.new(gate.outputs[0],mult.inputs[0])
    p.inputs["Emission Color"].default_value=(1,.63,.24,1)
    l.new(mult.outputs[0],p.inputs["Emission Strength"])
    return m


def atmosphere():
    # Back-facing shells draw a clean, narrow illuminated limb without transparent
    # surface dithering. Thickness and brightness are design exaggerations.
    for radius,color,strength in [(2.434,(.018,.065,.16),.65),(2.418,(.055,.25,.64),1.7)]:
        m=material("Schematic blue atmospheric limb",color,0,1,strength)
        m.use_backface_culling=True
        ob=sphere("Atmospheric edge - thickness exaggerated",(0,0,0),radius,m,192,96)
        bpy.context.view_layer.objects.active=ob
        bpy.ops.object.mode_set(mode="EDIT");bpy.ops.mesh.select_all(action="SELECT");bpy.ops.mesh.flip_normals();bpy.ops.object.mode_set(mode="OBJECT")


def satellite(position, angle, num):
    body=material("Schematic bus charcoal",(.12,.16,.19),.75,.3)
    gold=material("Schematic insulation amber",(.52,.31,.095),.7,.28)
    panel=material("Schematic solar cells",(.028,.075,.11),.48,.25)
    lines=material("Solar array segmentation",(.14,.23,.28),.5,.32)
    root=bpy.data.objects.new(f"Enlarged schematic satellite {num}",None);bpy.context.collection.objects.link(root)
    box("Representative bus",(0,0,0),(.20,.18,.22),body,root,.018)
    box("Representative thermal blanket",(0,-.099,0),(.18,.035,.20),gold,root,.01)
    for side in [-1,1]:
        box("Array mast",(side*.25,0,0),(.34,.018,.02),body,root,.004)
        box("Representative array",(side*.46,0,0),(.46,.027,.19),panel,root,.008)
        for dx in [-.12,0,.12]:
            box("Solar segmentation",(side*.46+dx,-.018,0),(.006,.006,.18),lines,root,.001)
    root.location=position
    root.rotation_euler=(math.radians(15),0,angle+math.pi/2)
    return root


def build_ring():
    reset()
    earth=sphere("Earth - NASA historical texture composites",(0,0,0),2.4,earth_material(),192,96)
    earth.rotation_euler[2]=math.radians(5)
    atmosphere()
    amber=material("Amber equatorial guide",AMBER,0,.8,1.4)
    faint=material("Faint orbital plane guides",(.012,.023,.035),0,.85,.12)
    radius=4.8
    curve("Schematic geostationary belt - distance compressed",[(radius*math.cos(a),radius*math.sin(a),0) for a in [i*math.tau/720 for i in range(720)]],amber,.008,True)
    # A restrained second hairline lends the belt depth without implying thickness.
    curve("Quiet outer construction guide",[(4.91*math.cos(a),4.91*math.sin(a),0) for a in [i*math.tau/720 for i in range(720)]],faint,.003,True)
    for i, degrees in enumerate([16,88,160,232,304]):
        a=math.radians(degrees)
        satellite((radius*math.cos(a),radius*math.sin(a),0),a,i+1)
    # No live positions, real slots, coverage cones, or sensor performance shown.
    area("Cool sunlight rim",(-6,-1,5),650,(.63,.77,1),4)
    area("Very soft reflected fill",(4,-6,3),150,(.32,.48,.65),7)
    area("Warm hardware edge",(1,3,4),750,(1,.69,.35),4)
    cam=camera((8,-14,8.5),scale=11.4)
    compositor()
    if "--draft" in sys.argv:
        render("ring-draft",cam,(8,-14,8.5),(0,0,0),11.4,(1200,750),-8)
    else:
        render("ring",cam,(8,-14,8.5),(0,0,0),11.4,(2000,1250),-8)
        # A genuine portrait framing, with the orbital plane rolled into a diagonal.
        render("ring-phone",cam,(9,-13,10),(0,0,0),11.0,(780,960),-48)


if __name__ == "__main__": build_ring()
