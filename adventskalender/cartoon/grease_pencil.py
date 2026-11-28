"""Build a native editable Grease Pencil 4.5 animation from the original 2D drawings."""
import bpy,json
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"renders"/"cartoon"
drawings=json.loads((OUT/"work"/"drawings.json").read_text())
bpy.ops.object.select_all(action="SELECT");bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.render.engine="BLENDER_EEVEE_NEXT"
scene.render.resolution_x=960;scene.render.resolution_y=540;scene.render.resolution_percentage=100;scene.render.fps=24
scene.frame_start=1;scene.frame_end=216
scene.view_settings.view_transform="Standard"
gp=bpy.data.grease_pencils_v3.new("Furzipups - 108 hand-authored vector cels")
obj=bpy.data.objects.new("Furzipups Grease Pencil",gp);scene.collection.objects.link(obj)
bpy.context.view_layer.objects.active=obj;obj.select_set(True)
layer=gp.layers.new("2D Cartoon - Cels",set_active=True)
layer.use_lights=False
palette={}
def linear(c):return c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4
def rgba(s):
    if s=="none":return (0,0,0,0)
    s=s.lstrip("#")
    if len(s)==3:s="".join(c*2 for c in s)
    return tuple(linear(int(s[i:i+2],16)/255) for i in (0,2,4))+(1,)
def material(fill,line):
    key=(fill,line)
    if key in palette:return palette[key]
    m=bpy.data.materials.new("Ink "+line+" / "+fill)
    bpy.data.materials.create_gpencil_data(m)
    m.grease_pencil.show_stroke=line!="none"
    m.grease_pencil.show_fill=fill!="none"
    m.grease_pencil.color=rgba(line)
    m.grease_pencil.fill_color=rgba(fill)
    gp.materials.append(m)
    palette[key]=len(gp.materials)-1
    return palette[key]
# Build all frames. Native strokes, materials, fill and outline, no 3D models.
for cel in drawings:
    drawing=layer.frames.new(cel["frame"]).drawing
    shapes=[s for s in cel["shapes"] if len(s["p"])>=2]
    drawing.add_strokes([len(s["p"]) for s in shapes])
    for i,s in enumerate(shapes):
        stroke=drawing.strokes[i]
        stroke.cyclic=s["closed"]
        stroke.material_index=material(s["fill"],s["line"])
        for point,(x,y) in zip(stroke.points,s["p"]):
            point.position=((x-480)/100,(270-y)/100,0)
            point.radius=max(.0001,s["w"]/200)
            point.opacity=1
    drawing.tag_positions_changed()
bpy.ops.object.camera_add(location=(0,0,12));cam=bpy.context.object;cam.rotation_euler=(0,0,0);cam.data.type="ORTHO";cam.data.ortho_scale=9.6;scene.camera=cam
scene.frame_set(109)
scene.world.color=(.3,.3,.3)
bpy.context.view_layer.objects.active=obj
obj.select_set(True);cam.select_set(False)
assert len(layer.frames)==108 and obj.type=="GREASEPENCIL"
scene.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"chapter-03.blend"))
print("GREASE_PENCIL_VALIDATED",len(layer.frames),len(palette),flush=True)
