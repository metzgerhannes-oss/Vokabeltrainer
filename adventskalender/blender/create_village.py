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
import json
import random
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

# Rounded terrain, paths and scenery are real geometry, not image planes.
cube("Snowy village ground",(0,1,-0.28),(39,36,0.52),snow,0.24)
rng=random.Random(202612)
cedar=mat("Blue spruce",(0.055,0.19,0.18))
fir=mat("Forest green",(0.06,0.29,0.20))
timber=mat("Dark chalet timber",(0.25,0.105,0.05))
red=mat("Festive crimson",(0.62,0.035,0.055))
stone=mat("Weathered granite",(0.36,0.40,0.43))
pavers=[mat("Path stone "+str(i),c) for i,c in enumerate([(0.57,0.65,0.69),(0.67,0.72,0.74),(0.47,0.56,0.62)])]
ice=mat("Blue ice",(0.16,0.47,0.64))
ice.node_tree.nodes.get("Principled BSDF").inputs["Roughness"].default_value=0.22
icewhite=mat("Ice scratches",(0.53,0.78,0.88))
mountain=mat("Mountain dusk",(0.26,0.36,0.47))
mountainlight=mat("Mountain snow",(0.70,0.82,0.92))
cream=mat("Ivory trim",(0.91,0.77,0.56))
# Batch small repeated scenery meshes by material to keep mobile draw calls low.
batches={}
def geo(name,material,verts,faces):
    key=(name,material.name)
    if key not in batches:batches[key]=[material,[],[]]
    m,v,f=batches[key];off=len(v);v.extend(verts);f.extend(tuple(off+i for i in face) for face in faces)
def box(name,mat,loc,dims,angle=0):
    x,y,z=loc;a,b,c=[d/2 for d in dims];co,si=math.cos(angle),math.sin(angle)
    v=[(x+u*co-w*si,y+u*si+w*co,z+t) for u,w,t in [(-a,-b,-c),(a,-b,-c),(a,b,-c),(-a,b,-c),(-a,-b,c),(a,-b,c),(a,b,c),(-a,b,c)]]
    geo(name,mat,v,[(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)])
def tapered(name,mat,x,y,z,r,h,top=0,N=12,irregular=0):
    phase=rng.random()*math.tau
    radii=[r*(1+rng.uniform(-irregular,irregular)) for _ in range(N)]
    v=[(x+rr*math.cos(phase+i*math.tau/N),y+rr*math.sin(phase+i*math.tau/N),z) for i,rr in enumerate(radii)]
    v += [(x+top*math.cos(phase+i*math.tau/N),y+top*math.sin(phase+i*math.tau/N),z+h) for i in range(N)]
    f=[tuple(reversed(range(N))),tuple(range(N,2*N))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
    geo(name,mat,v,f)
def mound(name,material,x,y,z,rx,ry,h,N=16):
    v=[(x+rx*math.cos(i*math.tau/N),y+ry*math.sin(i*math.tau/N),z) for i in range(N)]
    v += [(x+.67*rx*math.cos(i*math.tau/N),y+.67*ry*math.sin(i*math.tau/N),z+.69*h) for i in range(N)]
    v.append((x,y,z+h));f=[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]+[(i+N,(i+1)%N+N,2*N) for i in range(N)]
    geo(name,material,v,f)
def forest_tree(x,y,scale):
    tapered("Forest trunks",trunk,x,y,0,.14*scale,.8*scale,.10*scale,8)
    for j in range(4):
        z=(.42+j*.53)*scale;r=(.87-j*.15)*scale;h=1.18*scale
        tapered("Layered firs",fir if j%2 else cedar,x,y,z,r,h,.025*scale,12,.11)
        tapered("Snowy branches",snow,x,y,z+.18*scale,r*.76,h*.83,.018*scale,12,.09)
def street_lamp(x,y):
    box("Lantern posts",timber,(x,y,.76),(.10,.10,1.52))
    box("Lantern bases",stone,(x,y,.10),(.34,.34,.20))
    box("Lantern glow",gold,(x,y,1.66),(.23,.23,.32))
    box("Lantern tops",timber,(x,y,1.85),(.35,.35,.12))
    tapered("Lantern snow",snow,x,y,1.91,.24,.12,.07,4)
def fence(x,y,length,angle=0):
    co,si=math.cos(angle),math.sin(angle)
    for d in (0,length/2,length):
        px,py=x+d*co,y+d*si
        box("Fence posts",timber,(px,py,.34),(.13,.13,.68))
        box("Fence snow",snow,(px,py,.70),(.20,.20,.10))
    for h in (.24,.49):
        box("Fence rails",timber,(x+length/2*co,y+length/2*si,h),(length,.09,.11),angle)
    for j in range(5):
        d=length*j/4
        box("Fairy lights",gold,(x+d*co,y+d*si,.53),(.055,.055,.07))
def gift(x,y,size,mat):
    box("Wrapped gifts",mat,(x,y,size/2),(size,size,size))
    box("Gift ribbons",gold,(x,y,size+.015),(size+.02,.09,.03))
    box("Gift ribbons",gold,(x,y,size+.015),(.09,size+.02,.03))
def flush():
    for (name,_),(material,v,f) in batches.items():
        mesh=bpy.data.meshes.new(name);mesh.from_pydata(v,[],f);mesh.update()
        o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);mesh.materials.append(material)

order=[7,19,2,14,1,11,23,4,17,9,21,6,13,3,20,10,5,22,16,8,12,18,15,24]
houses={}
for i,n in enumerate(order):
    row,col=divmod(i,8)
    x=[-15.0,-11.1,-7.2,-3.4,3.4,7.2,11.1,15.0][col]+rng.uniform(-.30,.30)
    y=8-row*7+rng.uniform(-.36,.36)
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
    # Timberwork, shutters, stone plinth, snowy ledges and festive trim.
    for dx in (-1.03,1.03):
        box(label+"_trim",timber,(x+dx,y-.951,.91),(.12,.085,1.70))
    for zz in (.20,1.73):
        box(label+"_trim",timber,(x,y-.954,zz),(2.19,.085,.12))
    for dx in (-.77,.77):
        for off in (-.31,.31):
            box(label+"_shutters",red if n%3==0 else timber,(x+dx+off,y-1.04,1.15),(.12,.055,.51))
        box(label+"_sill",cream,(x+dx,y-1.045,.87),(.62,.15,.11))
        box(label+"_snow",snow,(x+dx,y-1.05,.94),(.62,.16,.045))
    for i in range(6):
        box(label+"_stones",stone,(x-1.0+i*.39,y-.975,.12),(.36,.08,.17))
    for i in range(9):
        dx=-1.00+i*.25;zz=1.83+.53*(1-abs(dx))
        box(label+"_rooflights",gold,(x+dx,y-1.12,zz),(.065,.065,.065))
    box(label+"_plaque",timber,(x,y-1.016,1.51),(.48,.075,.43))
    text(label+"_number",str(n),(x,y-1.062,1.51),0.32,cream)
    for j in range(5):
        box(label+"_entry",stone,(x,y-1.19-j*.18,.035),(.87,.15,.07))
    if n%3==0:
        for dx in (-.99,.99):
            box(label+"_lantern",gold,(x+dx,y-1.09,.72),(.13,.13,.20))

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
# Mountains behind the village; faceted slopes and a distinct snow line.
for j in range(8):
    x=-34+j*9.5;y=24+rng.uniform(-2,3);h=rng.uniform(9,15);rad=rng.uniform(6,10)
    tapered("Alpine mountains",mountain,x,y,-1,rad,h,.18,9,.25)
    tapered("Snow-covered peaks",mountainlight,x,y,h*.49-1,rad*.49,h*.51,.12,9,.17)
# Soft snowbanks around the village, distant layered forests.
for j in range(35):
    x=rng.uniform(-20,20);y=rng.choice([rng.uniform(13,18),rng.uniform(-17,-14)])
    mound("Rolling snowdrifts",snow,x,y,-.05,rng.uniform(1,3),rng.uniform(.8,2),rng.uniform(.15,.8))
for j in range(67):
    x=rng.uniform(-22,22);y=rng.uniform(14,21)
    forest_tree(x,y,rng.uniform(.65,1.5))
for side in (-1,1):
    for j in range(12):
        forest_tree(side*rng.uniform(18,20),-14+j*2.4,rng.uniform(.7,1.25))
# Curving main lane and individual cobbled streets, leaving the plaza open.
for row in range(3):
    yy=8-row*7-2.05
    for i in range(72):
        x=-17.5+i*.49
        if abs(x)<1.1:continue
        for j in range(3):
            box("Cobbled lanes",pavers[(i+j)%3],(x,yy+(j-1)*.41+.13*math.sin(x*.4),.016),(.45,.37,.052),rng.uniform(-.08,.08))
    for x in (-16.8,-5.35,5.35,16.8):street_lamp(x,yy-.95)
for i in range(55):
    y=-15+i*.52;x=.48*math.sin(y*.31)
    for j in range(4):
        box("Winding main street",pavers[(i+j)%3],(x+(j-1.5)*.45,y,.02),(.41,.48,.06),rng.uniform(-.06,.06))
# Large Christmas tree on a circular snow-covered plaza.
tree(-4.4,-12.2,2.05,True)
for i in range(38):
    a=i*2.39996;z=.9+(i%17)*.21;r=1.48-(i%17)*.064
    box("Christmas tree baubles",red if i%2 else gold,(-4.4+math.cos(a)*r,-12.2+math.sin(a)*r,z),(.13,.13,.13))
for j in range(13):
    a=j*math.tau/13;gift(-4.4+1.8*math.cos(a),-12.2+1.8*math.sin(a),rng.uniform(.28,.53),[red,fir,cream][j%3])
# Frozen pond with a snow-rim and skating traces.
mound("Pond snow bank",snow,7.4,-12.8,-.04,5.0,3.5,.16,48)
# Build the oval ice sheet using explicit geometry rather than a texture.
v=[(7.4,-12.8,.19)]+[(7.4+4.7*math.cos(i*math.tau/72),-12.8+3.15*math.sin(i*math.tau/72),.19) for i in range(72)]
geo("Oval skating rink",ice,v,[(0,i+1,(i+1)%72+1) for i in range(72)])
for j in range(4):
    for i in range(36):
        a=i*math.tau/36;r=1.1+j*.65
        px=7.4+r*math.cos(a);py=-12.8+r*.62*math.sin(a)
        box("Skating marks",icewhite,(px,py,.198),(.19,.014,.008),a+math.pi/2)
for i in range(16):
    a=i*math.tau/16
    mound("Snowy pond rocks",snow,7.4+4.85*math.cos(a),-12.8+3.24*math.sin(a),.03,.35,.25,.24,8)
# Small wooden footbridge, rails, seats and lanterns.
for i in range(12):
    yy=-11.35+i*.22;zz=.22+.34*math.sin(i*math.pi/11)
    box("Bridge boards",timber,(1.9,yy,zz),(1.42,.20,.11))
    for sign in (-1,1):
        if i%3==0:box("Bridge posts",timber,(1.9+sign*.69,yy,zz+.32),(.10,.10,.65))
        box("Bridge rails",timber,(1.9+sign*.69,yy,zz+.59),(.09,.23,.10))
for x,y in [(-7.6,-12.4),(3.2,-16.2),(12.6,-11.5),(-1.9,-15.0)]:
    street_lamp(x,y)
for x,y in [(-9.0,-14.5),(-1.8,-16.2),(12.7,-14.5)]:
    fence(x,y,2.3)
for x,y in [(-7,-10.8),(10.9,-9.6)]:
    for dx in (-.58,.58):box("Bench legs",timber,(x+dx,y,.27),(.11,.43,.54))
    box("Bench seats",timber,(x,y,.55),(1.53,.45,.12))
    box("Bench backs",timber,(x,y+.23,.83),(1.53,.10,.40))
    box("Snow on benches",snow,(x,y,.63),(1.53,.44,.06))
# Snowman and sleigh are individual real objects.
for z,rad in [(.46,.46),(1.03,.34),(1.49,.25)]:ball("Snowman",(-9.3,-11.8,z),rad,snow)
for dx in (-.09,.09):ball("Snowman eye",(-9.3+dx,-12.015,1.56),.037,dark)
ball("Snowman carrot",(-9.3,-12.07,1.48),.065,cream)
box("Snowman scarf",red,(-9.3,-11.8,1.27),(.53,.49,.12))
box("Snowman hat",red,(-9.3,-11.8,1.77),(.40,.40,.20))
for sign in (-1,1):
    box("Sleigh runners",red,(-12.0+sign*.36,-14.0,.10),(.08,1.5,.12))
    box("Sleigh supports",timber,(-12.0+sign*.30,-14.0,.27),(.09,.92,.32))
for i in range(7):box("Sleigh boards",timber,(-12,-14.55+i*.17,.48),(.78,.15,.08))
# Church and clock tower on the hill, kept clear of calendar houses.
box("Chapel stone walls",stone,(0,11.8,1.65),(2.4,2.6,3.3))
for sign in (-1,1):
    roof=cube("Chapel snowy roof",(sign*.66,11.8,3.65),(1.6,2.9,.22),snow)
    roof.rotation_euler.y=sign*math.radians(38)
box("Clock tower",stone,(0,12.5,3.65),(1.15,1.15,4.8))
tapered("Clock tower spire",cedar,0,12.5,6.05,.90,2.1,.02,8)
box("Clock face",cream,(0,11.89,5.13),(.68,.055,.68))
box("Clock hands",timber,(0,11.85,5.24),(.055,.04,.28))
box("Clock hands",timber,(.12,11.85,5.13),(.25,.04,.055))
box("Chapel golden window",gold,(0,10.46,2.04),(.58,.055,1.18))
flush()
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
cam.data.ortho_scale=48
def aim(loc,target):
    cam.location=loc
    cam.rotation_euler=(Vector(target)-Vector(loc)).to_track_quat("-Z","Y").to_euler()
aim((0,-41,33),(0,3,0))
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
    # Blender may append the frame range to animation filenames.
    prefix=f"tmp-door-{n:02}-"
    for stale in OUT.glob(prefix+"*.mp4"):
        stale.unlink()
    scene.render.filepath=str(OUT/prefix)
    bpy.ops.render.render(animation=True)
    clips=list(OUT.glob(prefix+"*.mp4"))
    if len(clips)!=1:
        raise RuntimeError(f"Expected one MP4 for day {n}, got {clips}")
    clips[0].replace(OUT/f"door-{n:02}.mp4")
    available=[d for d in range(1,25) if (OUT/f"door-{d:02}.mp4").is_file()]
    manifest=OUT/"manifest.json"
    tmp=OUT/"manifest.tmp"
    tmp.write_text(json.dumps(available),encoding="utf-8")
    tmp.replace(manifest)

if args.all:
    for n in range(1,25):
        render_day(n)
elif args.day:
    render_day(args.day)
