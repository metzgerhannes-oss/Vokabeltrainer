"""Winterdorf — Blender 4.2 LTS/4.5 LTS.
Run: blender -b -t 4 --python blender/create_village.py -- --scene-only
Run: blender -b -t 4 --python blender/create_village.py -- --day 1
Run: blender -b -t 4 --python blender/create_village.py -- --all
The script creates the editable .blend and optionally renders MP4 door clips.
"""
import bpy
import math
import sys
import argparse
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "renders"
OUT.mkdir(exist_ok=True)
argv = sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
parser = argparse.ArgumentParser()
parser.add_argument("--day", type=int, choices=range(1,25))
parser.add_argument("--all", action="store_true")
parser.add_argument("--scene-only", action="store_true")
args = parser.parse_args(argv)

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE_NEXT"
scene.render.resolution_x = 720
scene.render.resolution_y = 480
scene.render.resolution_percentage = 100
scene.render.fps = 24
scene.frame_start = 1
scene.frame_end = 72
scene.world.color = (0.08, 0.12, 0.19)

def mat(name, rgb, emission=0):
    m = bpy.data.materials.new(name)
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*rgb, 1)
    bsdf.inputs["Roughness"].default_value = 0.75
    if emission:
        bsdf.inputs["Emission Color"].default_value = (*rgb, 1)
        bsdf.inputs["Emission Strength"].default_value = emission
    return m

snow = mat("Snow", (0.85, 0.95, 1))
wood = mat("Door blue", (0.11, 0.24, 0.30))
pine = mat("Pine", (0.05, 0.24, 0.17))
trunk = mat("Wood", (0.25, 0.12, 0.06))
gold = mat("Warm light", (1, 0.62, 0.19), 1.7)
glass = mat("Cold window", (0.22, 0.38, 0.48))
dark = mat("Dark doorway", (0.055, 0.08, 0.12))
pathmat = mat("Snow path", (0.60, 0.74, 0.80))
brick = mat("Chimney", (0.40, 0.13, 0.10))
walls = [mat("Wall "+str(i), rgb) for i,rgb in enumerate([
    (0.57,0.23,0.18),(0.16,0.39,0.35),(0.65,0.40,0.18),
    (0.31,0.36,0.57),(0.53,0.30,0.30),(0.33,0.43,0.20)])]

def cube(name, loc, dims, material, bevel=0.04):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = dims
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    o.data.materials.append(material)
    if bevel:
        mod = o.modifiers.new("Soft edges", "BEVEL")
        mod.width = bevel
        mod.segments = 2
        o.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
    return o

def cone(name, loc, r, h, material):
    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=r, radius2=0, depth=h, location=loc)
    o=bpy.context.object
    o.name=name
    o.data.materials.append(material)
    return o

def ball(name, loc, r, material):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=r, location=loc)
    o=bpy.context.object
    o.name=name
    o.data.materials.append(material)
    return o

def text(name, body, loc, size, material):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body
    cu.align_x = "CENTER"
    cu.align_y = "CENTER"
    cu.size = size
    cu.extrude = 0.008
    o = bpy.data.objects.new(name, cu)
    scene.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = (math.pi/2,0,0)
    cu.materials.append(material)
    return o

def tree(x,y,scale=1, festive=False):
    cube("Tree trunk",(x,y,0.5*scale),(0.26*scale,0.26*scale,1*scale),trunk)
    for z,r,h in [(0.95,0.85,1.45),(1.55,0.67,1.35),(2.05,0.48,1.20)]:
        cone("Evergreen",(x,y,z*scale),r*scale,h*scale,pine)
        cone("Snow cap",(x,y,(z+0.20)*scale),r*0.76*scale,h*0.76*scale,snow)
    if festive:
        ball("Christmas star",(x,y,2.83*scale),0.16*scale,gold)
        for i in range(16):
            a=i*2.39996
            z=(0.8+i*0.095)*scale
            r=(0.72-i*0.029)*scale
            ball("Tree light",(x+math.cos(a)*r,y+math.sin(a)*r,z),0.065*scale,gold)

cube("Snowy village ground",(0,0,-0.25),(30,22,0.5),snow,0.18)
for y in (-7.0,-1.0,5.0):
    cube("Walkway",(0,y,-0.015),(29,1.1,0.05),pathmat,0.02)
order=[7,19,2,14,1,11,23,4,17,9,21,6,13,3,20,10,5,22,16,8,12,18,15,24]
houses={}
for i,n in enumerate(order):
    row,col=divmod(i,8)
    x=(col-3.5)*3.55
    y=6-row*6
    label=f"House_{n:02}"
    cube(label+"_body",(x,y,0.90),(2.25,1.85,1.8),walls[(n-1)%len(walls)])
    # Gabled roof, two snow-covered sloping slabs.
    for sign in (-1,1):
        r=cube(label+"_roof",(x+sign*0.64,y,2.15),(1.72,2.16,0.18),snow)
        r.rotation_euler.y=sign*math.radians(34)
    # triangular gable between wall and roof
    verts=[(-1.12,-0.92,0),(1.12,-0.92,0),(0,-0.92,0.74),(-1.12,0.92,0),(1.12,0.92,0),(0,0.92,0.74)]
    mesh=bpy.data.meshes.new(label+"_gable")
    mesh.from_pydata(verts,[],[(0,2,1),(3,4,5),(0,3,5,2),(1,2,5,4),(0,1,4,3)])
    mesh.update()
    o=bpy.data.objects.new(label+"_gable",mesh)
    scene.collection.objects.link(o)
    o.location=(x,y,1.8)
    mesh.materials.append(walls[(n-1)%len(walls)])
    cube(label+"_chimney",(x+0.65,y+0.44,2.55),(0.31,0.36,0.85),brick)
    cube(label+"_chimney_snow",(x+0.65,y+0.44,2.99),(0.41,0.44,0.12),snow)
    cube(label+"_step",(x,y-1.03,0.065),(1.0,0.43,0.13),snow)
    # Door pivots around a true hinge, not its center.
    cube(label+"_opening",(x,y-0.944,0.48),(0.73,0.035,0.95),dark,0.015)
    hinge=bpy.data.objects.new(label+"_hinge",None)
    scene.collection.objects.link(hinge)
    hinge.location=(x-0.35,y-0.99,0.0)
    door=cube(label+"_door",(0,0,0),(0.70,0.085,0.94),wood,0.025)
    door.parent=hinge
    door.location=(0.35,0,0.48)
    handle=ball(label+"_handle",(0,0,0),0.045,gold)
    handle.parent=hinge
    handle.location=(0.60,-0.075,0.48)
    windows=[]
    for dx in (-0.77,0.77):
        cube(label+"_frame",(x+dx,y-0.95,1.15),(0.51,0.075,0.58),snow)
        w=cube(label+"_window",(x+dx,y-1.0,1.15),(0.41,0.035,0.47),glass,0.015)
        windows.append(w)
        cube(label+"_cross_v",(x+dx,y-1.026,1.15),(0.037,0.02,0.48),snow,0)
        cube(label+"_cross_h",(x+dx,y-1.026,1.15),(0.42,0.02,0.037),snow,0)
    text(label+"_number",str(n),(x,y-0.97,1.51),0.33,snow)
    lampdata=bpy.data.lights.new(label+"_light","POINT")
    lampdata.color=(1,0.62,0.24)
    lampdata.energy=0
    lampdata.shadow_soft_size=0.5
    lamp=bpy.data.objects.new(label+"_light",lampdata)
    scene.collection.objects.link(lamp)
    lamp.location=(x,y-1.35,0.65)
    houses[n]=(x,y,hinge,lampdata,windows)
for x,y,s in [(-14,-8,1.2),(14,-8,1.3),(-14,2,1),(14,2,1),(-14,8,1.2),(14,8,1.2),(-8,9,1),(8,9,1)]:
    tree(x,y,s)
tree(0,-9,1.5,True)
# A gentle fill and a warm directional light.
bpy.ops.object.light_add(type="AREA",location=(0,-8,16))
bpy.context.object.data.energy=2800
bpy.context.object.data.shape="DISK"
bpy.context.object.data.size=18
bpy.ops.object.light_add(type="SUN",location=(0,0,10))
bpy.context.object.rotation_euler=(math.radians(27),math.radians(-24),math.radians(-30))
bpy.context.object.data.energy=1.7
bpy.ops.object.camera_add()
cam=bpy.context.object
scene.camera=cam
cam.data.type="ORTHO"
cam.data.ortho_scale=34
def aim(loc,target):
    cam.location=loc
    cam.rotation_euler=(Vector(target)-Vector(loc)).to_track_quat("-Z","Y").to_euler()
aim((17,-28,28),(0,0,0))
# Save editable source scene before per-door rendering.
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"winterdorf.blend"))

def render_day(n):
    # Reset all animation channels before creating a new shot.
    cam.animation_data_clear()
    for hnum,(x,y,hinge,light,windows) in houses.items():
        hinge.animation_data_clear()
        hinge.rotation_euler.z=-math.radians(100) if hnum<n else 0
        light.animation_data_clear()
        light.energy=45 if hnum<n else 0
        for w in windows:
            w.data.materials[0]=gold if hnum<n else glass
    x,y,hinge,light,windows=houses[n]
    cam.data.animation_data_clear()
    for frame,loc,scale in [
        (1,(x+5,y-9,6),8.0),
        (24,(x+3,y-6,3.8),5.0),
        (72,(x+3,y-6,3.8),5.0)]:
        scene.frame_set(frame)
        aim(loc,(x,y-0.25,1.1))
        cam.keyframe_insert(data_path="location",frame=frame)
        cam.keyframe_insert(data_path="rotation_euler",frame=frame)
        cam.data.ortho_scale=scale
        cam.data.keyframe_insert(data_path="ortho_scale",frame=frame)
    for f,angle,power in [(1,0,0),(24,0,0),(48,-100,55),(72,-100,55)]:
        hinge.rotation_euler.z=math.radians(angle)
        hinge.keyframe_insert(data_path="rotation_euler",frame=f)
        light.energy=power
        light.keyframe_insert(data_path="energy",frame=f)
    scene.frame_set(1)
    scene.render.image_settings.file_format="FFMPEG"
    scene.render.ffmpeg.format="MPEG4"
    scene.render.ffmpeg.codec="H264"
    scene.render.ffmpeg.constant_rate_factor="MEDIUM"
    scene.render.filepath=str(OUT/f"door-{n:02}.mp4")
    bpy.ops.render.render(animation=True)

if args.all:
    for n in range(1,25):
        render_day(n)
elif args.day:
    render_day(args.day)
