"""Furzipups: authored Blender 4.5 cutscenes, one animated GLB per chapter.
Run from adventskalender: blender -b -t 4 --python-exit-code 1 --python cinema/animate.py -- --all
"""
import bpy, math, json, sys, argparse, random, struct
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"renders"/"cinema-v2"
OUT.mkdir(parents=True,exist_ok=True)
FPS=24
parser=argparse.ArgumentParser()
parser.add_argument("--all",action="store_true")
parser.add_argument("--day",type=int,choices=range(1,25),default=3)
args=parser.parse_args(sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else [])
DAYS=list(range(1,25)) if args.all else [args.day]
def rad(x): return math.radians(x)
def parent(o,p):
    if p:o.parent=p
    return o
def group(name,loc=(0,0,0),p=None):
    o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);parent(o,p);o.location=loc;return o
def material(name, color, rough=.45, emission=0):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    b=m.node_tree.nodes.get("Principled BSDF");b.inputs["Base Color"].default_value=(*color,1);b.inputs["Roughness"].default_value=rough
    if emission:b.inputs["Emission Color"].default_value=(*color,1);b.inputs["Emission Strength"].default_value=emission
    return m
def setup_mats():
    global M
    M={k:material(k,c,r,e) for k,c,r,e in [
      ("snow",(.86,.93,1),.78,0),("ice",(.13,.57,.76),.20,0),("pine",(.035,.26,.17),.65,0),("mint",(.06,.48,.31),.6,0),
      ("red",(.69,.033,.055),.35,0),("gold",(1,.58,.08),.24,.25),("skin",(1,.58,.35),.56,0),("pink",(.9,.22,.20),.55,0),
      ("white",(.97,.94,.84),.5,0),("dark",(.025,.041,.07),.46,0),("wood",(.27,.105,.043),.62,0),("ginger",(.55,.24,.085),.55,0),
      ("blue",(.025,.25,.53),.4,0),("glass",(.16,.65,.95),.20,0),("warm",(1,.57,.13),.3,2.0),
      ("gas",(.38,.66,.13),.75,0),("carrot",(.95,.28,.015),.4,0),("brown",(.17,.065,.023),.75,0),("purple",(.25,.11,.5),.45,0),("cream",(.92,.72,.46),.68,0),("stone",(.31,.39,.49),.72,0)]}
def mesh(o,name,p,loc,scale,mat):
    o.name=name;parent(o,p);o.location=loc;o.scale=scale;o.data.materials.append(M[mat]);return o
def box(name,p,loc,dim,mat,bevel=.07):
    bpy.ops.mesh.primitive_cube_add(size=1);o=bpy.context.object;mesh(o,name,p,loc,(1,1,1),mat);o.dimensions=dim
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    if bevel:
        mod=o.modifiers.new("Rounded toy edges","BEVEL");mod.width=bevel;mod.segments=2
        mod=o.modifiers.new("Smooth normals","WEIGHTED_NORMAL")
    return o
def ball(name,p,loc,scale,mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10);o=mesh(bpy.context.object,name,p,loc,scale,mat)
    for f in o.data.polygons:f.use_smooth=True
    return o
def cyl(name,p,loc,r,depth,mat,rot=(0,0,0),r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=r,radius2=r if r2 is None else r2,depth=depth);o=mesh(bpy.context.object,name,p,loc,(1,1,1),mat);o.rotation_euler=rot
    for f in o.data.polygons:f.use_smooth=len(f.vertices)==4
    return o
def torus(name,p,loc,r,minor,mat,rot=(0,0,0)):
    bpy.ops.mesh.primitive_torus_add(major_segments=24,minor_segments=8,major_radius=r,minor_radius=minor)
    o=mesh(bpy.context.object,name,p,loc,(1,1,1),mat);o.rotation_euler=rot
    for f in o.data.polygons:f.use_smooth=True
    return o
def star(name,p,loc,r,mat="gold"):
    verts=[];faces=[]
    for y in [-.06,.06]:
        for i in range(10):
            a=math.pi/2+i*math.pi/5;rr=r*(.44 if i%2 else 1);verts.append((math.cos(a)*rr,y,math.sin(a)*rr))
    faces=[tuple(range(9,-1,-1)),tuple(range(10,20))]+[(i,(i+1)%10,(i+1)%10+10,i+10) for i in range(10)]
    me=bpy.data.meshes.new(name);me.from_pydata(verts,[],faces);me.update();o=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(o);parent(o,p);o.location=loc;me.materials.append(M[mat]);return o
def gift(p,x,y,z,s=.32,c="red"):
    g=group("Geschenk",(x,y,z),p);box("Paket",g,(0,0,s/2),(s,s,s),c,.035);box("Band",g,(0,0,s/2),(s*.18,s+.02,s+.02),"gold",.01);box("Band quer",g,(0,0,s/2),(s+.02,s*.18,s+.025),"gold",.01);return g
def tree(p,x,y,s=1):
    g=group("Tanne",(x,y,0),p);cyl("Stamm",g,(0,0,.4*s),.12*s,.8*s,"wood")
    for i in range(4):
        r=(.65-.11*i)*s;z=(.68+.36*i)*s
        cyl("Tannenzweig",g,(0,0,z),r,.95*s,"pine",r2=.04*s)
        cyl("Schnee",g,(0,0,z+.10*s),r*.86,.79*s,"snow",r2=.025*s)
    return g
def key(o,f,loc=None,rot=None,scale=None):
    if loc is not None:o.location=loc;o.keyframe_insert(data_path="location",frame=f,group="Movement")
    if rot is not None:o.rotation_euler=tuple(rad(x) for x in rot);o.keyframe_insert(data_path="rotation_euler",frame=f,group="Rotation")
    if scale is not None:o.scale=(scale,)*3 if isinstance(scale,(float,int)) else scale;o.keyframe_insert(data_path="scale",frame=f,group="Scale")
def path(o,rows):
    for row in rows:key(o,*row)
def actor():
    root=group("Furzipups_Root",(-1.6,-.18,0));hips=group("Hips",(0,0,.50),root);torso=group("Torso",(0,0,.22),hips)
    ball("Samtjacke",torso,(0,0,.16),(.30,.21,.39),"mint");torus("Kragen",torso,(0,0,.41),.21,.055,"red")
    box("Gürtel",torso,(0,0,-.04),(.54,.43,.10),"dark",.045);box("Schnalle",torso,(0,-.23,-.04),(.16,.05,.14),"gold",.025)
    for z in [.09,.23,.34]:ball("Knopf",torso,(0,-.205,z),(.035,)*3,"gold")
    head=group("Head",(0,0,.59),torso);ball("Gesicht",head,(0,0,.04),(.29,.26,.30),"skin")
    for s in [-1,1]:
        ear=ball("Spitzohr",head,(s*.29,.01,.04),(.10,.07,.15),"skin");ear.rotation_euler.y=rad(s*28)
        ball("Wange",head,(s*.17,-.206,-.035),(.060,.032,.039),"pink")
    ball("Nase",head,(0,-.261,-.01),(.077,.07,.064),"skin")
    eyes=[];brows=[]
    for s in [-1,1]:
        e=group("Eye", (s*.113,-.214,.10),head);ball("Augapfel",e,(0,0,0),(.083,.05,.095),"white");ball("Pupille",e,(0,-.046,0),(.037,.018,.046),"dark");ball("Augenlicht",e,(-.011,-.061,.018),(.010,)*3,"white");eyes.append(e)
        b=group("Brow",(s*.12,-.232,.215),head);box("Braue",b,(0,0,0),(.14,.035,.033),"brown",.015);brows.append(b)
    mouth=group("Mouth",(0,-.239,-.13),head);ball("Mund",mouth,(0,0,0),(.105,.025,.052),"dark");box("Zahnreihe",mouth,(0,-.024,.022),(.11,.012,.03),"white",.008)
    hat=group("Hat",(0,0,.29),head);torus("Mützenrand",hat,(0,0,0),.273,.065,"white")
    c=cyl("Mütze",hat,(.035,0,.23),.26,.48,"red",r2=.025);c.rotation_euler.y=rad(14);ball("Bommel",hat,(.10,0,.47),(.09,)*3,"white")
    arms=[];elbows=[];legs=[];knees=[]
    for s in [-1,1]:
        arm=group("Shoulder_L" if s<0 else "Shoulder_R",(s*.29,0,.28),torso);ball("Oberarm",arm,(0,0,-.14),(.10,.10,.19),"mint")
        elbow=group("Elbow",(0,0,-.29),arm);ball("Unterarm",elbow,(0,0,-.10),(.084,.084,.145),"mint");torus("Manschette",elbow,(0,0,-.20),.081,.023,"white");ball("Handschuh",elbow,(0,-.01,-.27),(.10,.09,.11),"white");arms.append(arm);elbows.append(elbow)
        leg=group("Hip_L" if s<0 else "Hip_R",(s*.145,0,.0),hips);ball("Oberschenkel",leg,(0,0,-.13),(.10,.10,.17),"red");knee=group("Knee",(0,0,-.25),leg);ball("Unterschenkel",knee,(0,0,-.085),(.09,.09,.12),"mint");ball("Stiefel",knee,(0,-.07,-.19),(.12,.19,.085),"dark");legs.append(leg);knees.append(knee)
    return dict(root=root,hips=hips,torso=torso,head=head,eyes=eyes,brows=brows,mouth=mouth,hat=hat,arms=arms,elbows=elbows,legs=legs,knees=knees)
# Distinct anticipation, body balance, hand action and reaction poses. X-axis across the scene, -Y toward camera.
POSE={
 "idle":(0,0,0,0,(-14,14),(0,0),(0,0),0),
 "step":(0,0,-8,8,(-35,35),(15,25),(-27,27),0),
 "reach":(0,0,-19,12,(-28,65),(20,75),(9,-8),0),
 "pull":(0,0,21,-9,(-55,65),(70,80),(-18,16),1),
 "press":(0,0,-12,8,(-12,78),(10,35),(4,-4),0),
 "crouch":(0,-.16,-14,10,(-25,35),(35,60),(-33,-33),0),
 "surprise":(0,.10,18,-12,(-95,95),(25,25),(-20,20),2),
 "fall":(0,.04,75,18,(-115,100),(22,35),(-40,25),2),
 "nose":(0,0,7,-8,(-15,58),(10,135),(0,0),1),
 "jump":(0,.65,-6,0,(-145,145),(15,15),(-32,32),2),
 "joy":(0,0,0,0,(-145,145),(25,25),(0,0),1),
 "catch":(0,.10,-8,12,(-70,75),(90,100),(-14,14),2),
 "sit":(0,-.07,9,0,(-28,28),(70,70),(-65,-65),0),
 "look":(0,0,4,22,(-12,14),(10,25),(0,0),1)}
def pose(a,f,label,x,y=-.18,extra_z=0,turn=0):
    _,z,lean,tilt,arm,elbow,leg,expr=POSE[label];key(a["root"],f,(x,y,z+extra_z),(0,lean,turn));key(a["torso"],f,rot=(0,lean*.26,0));key(a["head"],f,rot=(tilt*.4,tilt,turn*-.15));key(a["hat"],f,rot=(0,-lean*.16,0))
    for i in range(2):
        key(a["arms"][i],f,rot=(-20-abs(arm[i])*.35,arm[i],0));key(a["elbows"][i],f,rot=(-elbow[i],0,0));key(a["legs"][i],f,rot=(leg[i],0,0));key(a["knees"][i],f,rot=(max(0,-leg[i]*.65),0,0));key(a["brows"][i],f,rot=(0,(1 if i==0 else -1)*expr*12,0));key(a["eyes"][i],f,scale=(1,1,1 if expr!=2 else 1.17))
    key(a["mouth"],f,scale=(1 if expr!=1 else .68,1,.5+expr*.8))
def animal(p,mouse=False):
    g=group("Maus" if mouse else "Rentier",(0,0,0),p);ball("Körper",g,(0,0,.38),(.38,.20,.25),"brown")
    head=group("Tierkopf",(.30,0,.66),g);ball("Kopf",head,(0,0,0),(.20,.17,.22),"ginger");ball("Schnauze",head,(.15,-.02,-.035),(.15,.12,.10),"brown");ball("Nase",head,(.26,-.03,-.02),(.07,)*3,"pink" if mouse else "red");ball("Auge",head,(.06,-.15,.045),(.047,)*3,"white");ball("Pupille",head,(.07,-.19,.045),(.021,)*3,"dark")
    for s in [-1,1]:
        if mouse:ball("Ohr",head,(-.05,s*.12,.17),(.10,.06,.12),"pink")
        else:
            box("Geweih",head,(-.02,s*.12,.31),(.05,.045,.30),"wood",.02);box("Geweihast",head,(.08,s*.12,.38),(.19,.05,.05),"wood",.02)
        for x in [-.23,.23]:box("Bein",g,(x,s*.12,.15),(.075,.075,.30),"brown",.025)
    tail=group("Tail",(-.33,0,.43),g);ball("Schwanz",tail,(-.09,0,.04),(.14,.08,.10),"ginger");return g,head,tail
def sled(p):
    g=group("Turboschlitten",(0,0,0),p)
    for y in [-.30,.30]:
        box("Kufe",g,(0,y,.09),(1.55,.085,.085),"gold",.04);torus("Kufenbogen",g,(.73,y,.22),.15,.042,"gold",(90,0,0))
    box("Schlittenwanne",g,(0,0,.28),(1.2,.63,.30),"red",.13);box("Sitz",g,(-.24,0,.48),(.43,.48,.12),"white",.04);box("Rückenlehne",g,(-.57,0,.57),(.14,.66,.42),"red",.07)
    gift(g,.23,0,.44,.30,"mint");return g
def prop(n):
    g=group("ChapterProp",(1.05,0,0));parts={}
    if n==1:
        wheel=group("Gear",(0,0,.62),g);cyl("Zahnrad",wheel,(0,0,0),.36,.18,"gold",(90,0,0))
        for i in range(12):
            a=i*math.tau/12;o=box("Zahn",wheel,(math.sin(a)*.37,0,math.cos(a)*.37),(.13,.20,.18),"gold",.025);o.rotation_euler.y=a
        torus("Nabe",wheel,(0,-.12,0),.14,.045,"dark",(90,0,0));parts["wheel"]=wheel
    elif n==2:
        for z,r in [(.26,.26),(.67,.22),(1.0,.17)]:ball("Schnee",g,(0,0,z),(r,)*3,"snow")
        for x in [-.055,.055]:ball("Auge",g,(x,-.145,1.035),(.026,)*3,"dark")
        torus("Schal",g,(0,0,.84),.18,.045,"red");cyl("Hut",g,(0,0,1.20),.16,.16,"dark");parts["carrot"]=cyl("Karotte",g,(0,.21,.94),.065,.32,"carrot",(90,0,0),.006)
    elif n==3:
        box("Fuß",g,(0,0,.13),(.38,.42,.26),"white",.11);ball("Schüssel",g,(0,-.10,.42),(.40,.43,.25),"white");ball("Wasser",g,(0,-.10,.57),(.25,.30,.025),"glass")
        box("Spülkasten",g,(0,.36,.73),(.56,.30,.64),"white",.10);box("Taste",g,(.16,.35,1.075),(.12,.10,.035),"gold",.025)
        lid=group("Lid",(0,.24,.64),g);torus("Klobrille",lid,(0,-.33,0),.32,.07,"white");parts["lid"]=lid
    elif n in [4,6]:
        box("Strumpfschaft",g,(-.08,0,.49),(.34,.24,.60),"red",.11);ball("Fuß",g,(.13,-.015,.18),(.36,.16,.17),"red");torus("Bündchen",g,(-.08,0,.79),.175,.06,"white");parts["top"]=g
    elif n==5:
        torus("Spiegelrahmen",g,(0,0,.65),.42,.08,"gold",(90,0,0));cyl("Spiegel",g,(0,.01,.65),.39,.07,"glass",(90,0,0));star("Stern",g,(0,-.08,.65),.24)
    elif n in [7,16,21,22]:
        if n==7:
            ball("Spinnenkörper",g,(0,0,.25),(.31,.23,.18),"dark");ball("Kopf",g,(.23,0,.28),(.17,.16,.15),"brown")
            for s in [-1,1]:
                for i in range(4):
                    leg=group("Spinnenbein",(-.22+i*.14,s*.13,.23),g);box("Bein",leg,(0,s*.19,-.07),(.055,.35,.055),"dark",.025);leg.rotation_euler.x=rad(s*24);parts["leg"+str(s)+str(i)]=leg
            for y in [-.065,.065]:ball("Auge",g,(.36,y,.32),(.034,)*3,"white")
        else:
            pet,head,tail=animal(g,n==22);parts.update(pet=pet,head=head,tail=tail)
            if n==16:pet2,_,_=animal(g);pet2.location=(-1.25,.65,0);parts["pet2"]=pet2
            if n==21:torus("Glockenband",head,(0,0,-.13),.16,.035,"red");parts["bell"]=cyl("Glocke",head,(0,-.17,-.24),.12,.20,"gold",r2=.05)
    elif n==8:
        ball("Kessel",g,(0,0,.39),(.43,.43,.38),"dark");torus("Rand",g,(0,0,.62),.37,.075,"dark");cyl("Suppe",g,(0,0,.62),.33,.025,"mint")
        for i in range(5):parts["bubble"+str(i)]=ball("Blase",g,(math.cos(i*2)*.25,math.sin(i*2)*.25,.65),(.065,)*3,"mint")
    elif n==9:
        cyl("Wecker",g,(0,0,.58),.36,.21,"red",(90,0,0));cyl("Zifferblatt",g,(0,-.12,.58),.32,.055,"white",(90,0,0))
        hand=group("Zeiger",(0,-.16,.58),g);box("Zeiger",hand,(0,0,.12),(.04,.035,.26),"dark",.012);parts["hand"]=hand
        for x in [-.24,.24]:ball("Klingel",g,(x,0,.92),(.13,.12,.10),"gold")
    elif n==10:
        box("Pfosten",g,(0,0,.42),(.10,.10,.84),"dark");box("Ampel",g,(0,0,.88),(.38,.23,.74),"dark",.09)
        for i,m in enumerate(["red","gold","blue"]):parts["lamp"+str(i)]=ball("Signal",g,(0,-.13,1.12-i*.24),(.085,.045,.085),m)
    elif n==11:
        box("Kamm",g,(0,0,.64),(.73,.10,.15),"gold")
        for i in range(9):box("Zinken",g,(-.32+i*.08,0,.46),(.042,.08,.28),"gold",.012)
        pet,head,tail=animal(g);pet.location=(.25,.50,0);parts["tail"]=tail
    elif n==12:
        for i,c in enumerate(["red","mint","blue"]):parts["gift"+str(i)]=gift(g,(i-1)*.36,0,.08,.32,c)
    elif n==13:
        rocket=group("Rocket",(0,0,0),g);cyl("Rakete",rocket,(0,0,.65),.21,.92,"white");cyl("Spitze",rocket,(0,0,1.25),.21,.32,"red",r2=.01);ball("Bullauge",rocket,(0,-.20,.72),(.105,.035,.105),"blue")
        for x in [-.24,.24]:box("Flügel",rocket,(x,0,.24),(.15,.12,.35),"red",.035)
        flame=cyl("Flamme",rocket,(0,0,.02),.09,.24,"carrot",r2=.15);parts.update(rocket=rocket,flame=flame)
        for x in [-.12,.12]:torus("Unterhosenbein",rocket,(x,-.22,.40),.10,.035,"blue",(90,0,0))
        box("Unterhosenbund",rocket,(0,-.23,.53),(.43,.07,.09),"blue",.03)
    elif n==14:
        cyl("Käse",g,(0,0,.37),.40,.55,"gold",r2=.15)
        for i in range(5):ball("Käselöcher",g,(-.22+i*.10,-.26,.31+(i%2)*.16),(.055,.018,.055),"ginger")
    elif n==15:
        cyl("Klopapier",g,(0,0,.38),.30,.60,"white",(0,90,0));cyl("Papprolle",g,(.31,0,.38),.10,.025,"ginger",(0,90,0));parts["sheet"]=box("Papierstreifen",g,(.0,-.26,.22),(.58,.48,.018),"white",.01)
    elif n==17:parts["sled"]=sled(g)
    elif n==18:
        for i in range(4):
            cookie=group("Keks",(0,0,.10+i*.12),g);cyl("Keks",cookie,(0,0,0),.31,.105,"ginger")
            for j in range(5):ball("Schokostück",cookie,(math.cos(j*2)*.20,math.sin(j*2)*.20,.055),(.035,.035,.025),"brown")
            parts["cookie"+str(i)]=cookie
    elif n==19:parts["ice"]=box("Eiswürfel",g,(0,0,.36),(.68,.68,.68),"ice",.09);parts["water"]=ball("Pfütze",g,(0,0,.023),(.55,.42,.022),"glass")
    elif n==20:
        box("Tresor",g,(0,0,.46),(.88,.59,.88),"blue",.07);door=group("SafeDoor",(-.38,-.32,.45),g);box("Tür",door,(.38,0,0),(.75,.09,.74),"gold",.055);torus("Rad",door,(.38,-.07,0),.13,.035,"dark",(90,0,0));parts["door"]=door
    elif n==23:
        box("Motor",g,(0,0,.43),(.95,.72,.81),"wood",.10);box("Deckel",g,(0,0,.9),(1.05,.78,.15),"gold",.06);cyl("Einwurf",g,(0,0,1.04),.19,.14,"dark");parts["bean"]=ball("Goldene Bohne",g,(-.42,-.25,1.32),(.16,.11,.25),"gold")
    elif n==24:
        box("Weihnachtsmaschine",g,(0,0,.59),(1.25,.95,1.14),"wood",.14);box("Deckel",g,(0,0,1.23),(1.40,1.0,.16),"gold",.06)
        for i in range(24):ball("Motorlicht",g,(-.47+(i%6)*.19,-.49,.26+(i//6)*.19),(.055,)*3,"warm")
        parts["sled"]=sled(g);parts["sled"].location=(0,-1.2,0)
        deer,_,_=animal(parts["sled"]);deer.location=(1.16,0,0);parts["deer"]=deer
    return g,parts
# Authored per-day actions: approach, attempt, surprise, recovery, reward.
BEATS=[
 ("crouch","pull","surprise","nose","joy"),("look","reach","catch","look","joy"),("step","press","look","fall","catch"),("reach","pull","pull","fall","nose"),("look","reach","look","catch","joy"),("look","pull","reach","surprise","catch"),("crouch","look","surprise","reach","joy"),("reach","press","crouch","surprise","nose"),("step","press","look","surprise","joy"),("look","press","look","jump","joy"),("step","reach","pull","surprise","catch"),("crouch","pull","press","catch","joy"),("look","crouch","sit","fall","catch"),("look","reach","pull","surprise","joy"),("idle","pull","fall","jump","joy"),("step","nose","press","surprise","joy"),("look","sit","crouch","jump","catch"),("look","reach","press","surprise","joy"),("crouch","reach","look","catch","joy"),("step","press","look","surprise","catch"),("look","reach","surprise","nose","joy"),("look","crouch","step","catch","joy"),("look","reach","nose","press","joy"),("look","press","surprise","jump","joy")]
LENGTHS=[0,8,8,9,9,8,8,8,9,8,8,8,8,10,8,9,9,9,8,9,9,8,8,9,22]
def scene_base(n):
    bpy.ops.object.select_all(action="SELECT");bpy.ops.object.delete(use_global=False)
    for datablocks in [bpy.data.meshes,bpy.data.materials,bpy.data.actions,bpy.data.cameras,bpy.data.lights]:
        for d in list(datablocks):
            if d.users==0:datablocks.remove(d)
    setup_mats();s=bpy.context.scene;s.frame_start=1;s.frame_end=LENGTHS[n]*FPS+1;s.render.fps=FPS
    s.render.engine="BLENDER_EEVEE_NEXT";s.render.resolution_x=960;s.render.resolution_y=700;s.render.resolution_percentage=100
    s.world.color=(.12,.16,.24)
    env=group("Winter workshop courtyard")
    box("Schneeboden",env,(0,0,-.17),(18,15,.32),"snow",.10)
    # Wide, rounded gingerbread workshop with detailed window frames, snowy roof and lights.
    box("Werkstatt",env,(0,3.05,1.64),(8.6,1.0,3.28),"ginger",.12)
    for z in [.27,.72,1.17,1.62,2.07,2.52,2.97]:box("Holzfuge",env,(0,2.53,z),(8.35,.05,.035),"wood",.01)
    box("Schneegesims",env,(0,2.94,3.32),(8.9,1.35,.24),"snow",.11)
    for x in [-3.9,3.9]:box("Fachwerk",env,(x,2.48,1.65),(.18,.13,3.3),"wood",.04)
    for x in [-2.65,2.65]:
        box("Fensterrahmen",env,(x,2.45,1.86),(1.35,.18,1.46),"wood",.09);box("Warmes Fenster",env,(x,2.34,1.86),(1.15,.04,1.24),"warm",.045)
        box("Sprosse",env,(x,2.30,1.86),(.07,.05,1.23),"wood",.018);box("Sprosse quer",env,(x,2.30,1.86),(1.15,.05,.07),"wood",.018)
        box("Fensterbrett Schnee",env,(x,2.25,1.16),(1.52,.36,.13),"snow",.06)
        for j in range(4):cyl("Eiszapfen",env,(x-.47+j*.30,2.08,1.03),.012,.20,"snow",r2=.045)
    box("Türrahmen",env,(0,2.46,1.25),(1.52,.19,2.5),"wood",.08);box("Wichteltür",env,(0,2.34,1.23),(1.32,.13,2.35),"pine",.09)
    torus("Adventskranz",env,(0,2.22,1.76),.32,.065,"mint",(90,0,0))
    for j in range(7):a=j*math.tau/7;ball("Beere",env,(.32*math.cos(a),2.13,1.76+.32*math.sin(a)),(.052,)*3,"red")
    ball("Türgriff",env,(.49,2.19,1.06),(.06,)*3,"gold")
    for i in range(23):
        x=-4.15+i*.377;z=3.08-.19*math.cos(x*.7);ball("Lichterkette",env,(x,2.35,z),(.058,)*3,"warm" if i%3 else "red")
    for x,y,scale in [(-4.4,1.0,1.45),(4.4,1.1,1.60),(-5.1,2.7,1.8),(5.2,2.7,1.7)]:
        tree(env,x,y,scale);gift(env,x*.9,y-.45,0,.35,"red" if x<0 else "blue")
    for i in range(8):ball("Schneehaufen",env,(-4.6+i*1.3,1.95,.05),(.47,.34,.15),"snow")
    # Set design follows the actual riddle: four distinct places in the village.
    theme="workshop" if n in [1,5,9,10,12,13,17,20,23,24] else "market" if n in [4,6,14,18,22] else "stable" if n in [2,7,11,16,21] else "laboratory"
    for o in list(env.children):
        if o.name.startswith("Werkstatt"):
            o.data.materials.clear();o.data.materials.append(M[{"workshop":"ginger","market":"red","stable":"wood","laboratory":"blue"}[theme]])
        if o.name.startswith("Wichteltür"):
            o.data.materials.clear();o.data.materials.append(M[{"workshop":"pine","market":"cream","stable":"ginger","laboratory":"purple"}[theme]])
    def bench(x,y):
        box("Werkbank",env,(x,y,.70),(1.32,.55,.12),"wood",.06)
        for sign in [-1,1]:box("Werkbankbein",env,(x+sign*.50,y,.31),(.13,.32,.62),"wood",.04)
    def barrel(x,y):
        cyl("Fass",env,(x,y,.36),.31,.67,"ginger")
        for z in [.15,.53]:torus("Fassreifen",env,(x,y,z),.31,.035,"dark")
    if theme=="workshop":
        bench(-3.12,1.25);bench(3.05,1.38)
        for x in [-3.44,-3.08,-2.72]:box("Werkzeugkasten",env,(x,1.25,.89),(.23,.28,.24),"blue",.04)
        for x in [2.72,3.12,3.42]:cyl("Schraubendose",env,(x,1.38,.89),.12,.25,"gold")
    elif theme=="market":
        for x in [-3.25,3.25]:
            bench(x,1.25)
            for j in range(3):gift(env,x-.40+j*.37,1.22,.78,.24,["red","mint","blue"][j])
            for j in range(5):box("Markisenstreifen",env,(x-.56+j*.28,1.35,2.43),(.28,.90,.14),"red" if j%2==0 else "white",.035)
    elif theme=="stable":
        for x in [-3.1,3.1]:
            barrel(x,1.25)
            for j in range(3):box("Heuballen",env,(x-.5+j*.26,.65,.17),(.37,.48,.28),"cream",.10)
            box("Stallzaun",env,(x,1.55,.75),(1.30,.10,.11),"wood",.035)
    else:
        for x in [-3.10,3.10]:
            bench(x,1.35)
            for j,col in enumerate(["blue","mint","purple"]):
                xx=x-.34+j*.34;ball("Laborflasche",env,(xx,1.34,.91),(.11,.11,.13),col);cyl("Flaschenhals",env,(xx,1.34,1.07),.045,.16,col)
    # Camera is authored and exported from Blender along with the keyframes.
    bpy.ops.object.camera_add();camera=bpy.context.object;camera.name="FilmCamera";camera.data.lens=44;s.camera=camera
    def cam(f,pos,aim):
        camera.location=pos;camera.rotation_euler=(Vector(aim)-Vector(pos)).to_track_quat("-Z","Y").to_euler();camera.keyframe_insert(data_path="location",frame=f);camera.keyframe_insert(data_path="rotation_euler",frame=f)
    end=s.frame_end
    cam(1,(0,-8.8,3.45),(0,.0,1.20));cam(int(end*.39),(.12,-7.7,2.95),(0,.0,1.15));cam(int(end*.64),(.28,-8.2,3.1),(0,0,1.19));cam(end,(0,-8.45,3.25),(0,0,1.3))
    if n==24:
        # Follow the sleigh into the air, then return to the courtyard for the stars.
        cam(int(end*.31),(0,-8.3,3.4),(0,0,1.3))
        cam(int(end*.47),(2.9,-10.5,5.0),(3.0,-.9,2.0))
        cam(int(end*.60),(5.4,-11.7,7.0),(4.4,.1,3.0))
        cam(int(end*.76),(8.0,-13.5,9.0),(7.0,2.0,5.3))
        cam(int(end*.88),(0,-10.2,4.0),(0,.6,2.1))
        cam(end,(0,-9.3,3.7),(0,.6,2.15))
    # Export punctual lights; soft ambient fill also added by player.
    for name,loc,power,color in [("Warm key",(-4,-4,6),1400,(1,.74,.48)),("Cool fill",(4,-1,5),1000,(.58,.78,1)),("Rim",(0,3.5,5.4),1100,(1,.52,.22))]:
        bpy.ops.object.light_add(type="POINT",location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color;o.data.shadow_soft_size=1.2
    return s
def animate(n):
    s=scene_base(n);end=s.frame_end
    F=lambda v: max(1,round(1+(end-1)*v))
    a=actor();g,p=prop(n);seq=BEATS[n-1]
    # Walk in, settle, reach, hold, react and recover. Short asymmetric timings.
    for u,label,x,turn in [(0,"idle",-2.1,12),(.10,"step",-1.55,28),(.19,seq[0],-1.0,25),(.39,seq[1],-.60,30),(.49,seq[2],-.72,23),(.60,seq[3],-1.05,10),(.72,seq[3],-1.40,0),(.86,seq[4],-1.05,0),(1,seq[4],-1.05,0)]:
        pose(a,F(u),label,x,turn=turn)
    for o in a["eyes"]:
        for u,sc in [(.05,1),(.065,.10),(.085,1),(.38,1),(.395,.12),(.41,1)]:key(o,F(u),scale=(1,1,sc))
    # Every prop has its own animation, including pivots and physical reactions.
    key(g,1,loc=(1.05,0,0),rot=(0,0,0))
    if n==1:path(p["wheel"],[(1,None,(0,0,0)),(F(.39),None,(0,0,0)),(F(.58),(0,0,.95),(0,460,0)),(F(.78),(0,0,.62),(0,720,0))])
    elif n==2:path(p["carrot"],[(1,(0,.21,.94),(90,0,0)),(F(.39),(0,.21,.94),(90,0,0)),(F(.53),(-.48,-.05,1.35),(180,90,0)),(F(.72),(0,-.235,.94),(90,0,180))]);key(g,F(.50),rot=(0,0,180));key(g,F(.75),rot=(0,0,360))
    elif n==3:
        path(p["lid"],[(1,None,(0,0,0)),(F(.33),None,(-16,0,0)),(F(.44),None,(0,0,0)),(F(.53),None,(-110,0,0)),(F(.67),None,(-85,0,0)),(end,None,(-95,0,0))])
    elif n==4:path(g,[(F(.37),(0.78,0,0),(0,-12,0)),(F(.46),(0.72,0,.05),(0,-24,0)),(F(.56),(1.30,0,.68),(0,125,0)),(F(.74),(1.35,0,.02),(0,10,0))])
    elif n==5:path(g,[(F(.37),None,(0,0,0)),(F(.62),(1.05,0,.33),(0,0,360)),(F(.80),(1.05,0,0),(0,0,360))])
    elif n==6:path(g,[(F(.36),None,(0,-20,0)),(F(.57),(1.2,0,.62),(0,170,0)),(F(.75),(1.15,0,0),(0,350,0))])
    elif n==7:
        path(g,[(F(.36),(1.3,0,0)),(F(.46),(.85,-.12,0)),(F(.56),(.35,-.10,0)),(F(.72),(1.05,0,0))])
        for k,o in p.items():
            for u,angle in [(.36,18),(.43,-22),(.50,22),(.57,-22),(.72,18)]:key(o,F(u),rot=(angle,0,0))
    elif n==8:
        for i in range(5):
            o=p["bubble"+str(i)];loc=o.location.copy()
            path(o,[(1,None,None,.01),(F(.42+i*.018),loc,None,.4),(F(.56+i*.021),(loc.x,loc.y,1.3+i*.10),None,1.35),(F(.69+i*.012),None,None,.01)])
    elif n==9:path(p["hand"],[(1,None,(0,0,0)),(F(.43),None,(0,0,0)),(F(.59),None,(0,950,0)),(F(.75),None,(0,1080,0))])
    elif n==10:
        for i in range(3):
            o=p["lamp"+str(i)];base=o.scale.copy()
            for j,u in enumerate([0,.32,.42,.51,.60,.75,1]):key(o,F(u),scale=tuple(v*(1.45 if j%3==i else .73) for v in base))
    elif n==11:path(p["tail"],[(1,None,(0,0,0)),(F(.38),None,(0,15,0)),(F(.51),None,(0,-85,0)),(F(.60),None,(0,65,0)),(F(.79),None,(0,0,0))])
    elif n==12:
        for i in range(3):
            o=p["gift"+str(i)];x=(i-1)*.36;path(o,[(1,(x,0,.08)),(F(.39+i*.035),(x,0,.08)),(F(.54+i*.025),(x*1.4,-.22,1.05+i*.08),(0,120,0)),(F(.77),(x*1.6,-.20,.02),(0,360,0))])
    elif n==13:
        path(p["rocket"],[(1,(0,0,0),(0,0,0)),(F(.39),(0,0,0),(0,-8,0)),(F(.48),(0,0,.15),(0,8,0)),(F(.58),(.55,0,1.5),(0,-24,0)),(F(.67),(1.0,.1,3.25),(0,-55,0)),(F(.79),(3.5,.1,4.2),(0,-65,0)),(end,(3.5,.1,4.2))])
        key(p["flame"],1,scale=.01);key(p["flame"],F(.48),scale=.05);key(p["flame"],F(.53),scale=1.8);key(p["flame"],end,scale=1.8)
        pose(a,F(.43),"sit",.80,extra_z=.34);pose(a,F(.56),"surprise",.32,extra_z=.72);pose(a,F(.69),"fall",-1.25);pose(a,F(.86),"catch",-1.05)
    elif n==14:path(g,[(F(.40),None,(0,-12,0)),(F(.58),(1.15,0,.43),(0,180,0)),(F(.76),(1.05,0,0),(0,360,0))])
    elif n==15:path(g,[(F(.35),(.65,0,0),(0,0,0)),(F(.52),(1.1,0,0),(0,150,0)),(F(.68),(1.75,0,0),(0,390,0)),(F(.83),(1.85,0,0),(0,430,0))]);key(p["sheet"],F(.35),scale=(1,1,1));key(p["sheet"],F(.68),scale=(1,2.1,1))
    elif n==16:
        path(p["pet"],[(1,(0,0,0)),(F(.43),(0,0,0)),(F(.56),(.45,0,.45)),(F(.71),(.65,0,0))]);path(p["pet2"],[(1,(-1.25,.65,0)),(F(.43),(-1.25,.65,0)),(F(.56),(-1.65,.65,.38)),(F(.71),(-1.8,.65,0))])
    elif n==17:
        path(g,[(1,(.8,0,0)),(F(.44),(.8,0,0)),(F(.58),(1.85,0,.21),(0,-12,0)),(F(.73),(2.35,.2,0),(0,0,0))]);pose(a,F(.43),"sit",.65,extra_z=.38);pose(a,F(.55),"sit",1.55,extra_z=.50);pose(a,F(.72),"fall",-.65)
    elif n==18:
        for i in range(4):
            o=p["cookie"+str(i)];path(o,[(1,(0,0,.10+i*.12)),(F(.42),(0,0,.10+i*.12)),(F(.56),((i-1.5)*.17,0,.48+i*.14),(0,90*i,0)),(F(.75),((i-1.5)*.35,-.16,.065),(0,0,0))])
    elif n==19:
        key(p["water"],1,scale=.01);key(p["water"],F(.40),scale=.01);key(p["water"],F(.73),scale=(.55,.42,.022));key(p["ice"],F(.40),scale=1);key(p["ice"],F(.74),scale=(.12,.12,.025))
    elif n==20:path(p["door"],[(1,None,(0,0,0)),(F(.43),None,(0,0,0)),(F(.49),None,(0,0,9)),(F(.56),None,(0,0,-110)),(end,None,(0,0,-100))])
    elif n==21:
        path(p["tail"],[(F(.36),None,(0,0,0)),(F(.45),None,(0,0,45)),(F(.52),None,(0,0,-45)),(F(.59),None,(0,0,45)),(F(.76),None,(0,0,0))]);path(p["head"],[(F(.40),None,(0,0,0)),(F(.50),None,(0,20,0)),(F(.62),None,(0,-20,0)),(F(.76),None,(0,0,0))])
    elif n==22:path(g,[(1,(1.45,0,0)),(F(.37),(1.3,0,0)),(F(.45),(.88,-.10,.09)),(F(.54),(.38,-.20,0)),(F(.65),(.05,-.25,.09)),(F(.76),(.55,-.22,0))])
    elif n==23:path(p["bean"],[(1,(-.42,-.25,1.32)),(F(.39),(-.42,-.25,1.32)),(F(.53),(0,0,1.67),(0,110,0)),(F(.72),(0,0,1.05),(0,180,0),.08)])
    elif n==24:
        sl=p["sled"];path(sl,[(1,(0,-1.2,0)),(F(.30),(0,-1.2,0)),(F(.42),(1.2,-1.2,.4),(0,-12,0)),(F(.60),(3.1,.1,2.25),(0,-22,15)),(F(.76),(6,2,4.8),(0,-15,35)),(end,(9,4,6),(0,-8,45))])
        pose(a,F(.24),"press",-.6);pose(a,F(.34),"sit",.7,extra_z=.35);pose(a,F(.44),"sit",2.0,extra_z=.78);pose(a,F(.60),"sit",4.2,y=.1,extra_z=2.60);pose(a,F(.76),"sit",7.1,y=2,extra_z=5.15);pose(a,end,"sit",10.1,y=4,extra_z=6.35)
        for i in range(24):
            st=star("Finalstern",None,(0,0,0),.13);ang=i*math.tau/24;r=2.1+(i%3)*.35
            path(st,[(1,(0,0,1),None,.001),(F(.56),(0,.8,1.6),None,.001),(F(.72),(math.cos(ang)*r,.8,2.5+math.sin(ang)*1.1),(0,i*35,0),1.2),(end,(math.cos(ang)*r,1.1,2.8+math.sin(ang)*1.1),None,1)])
    # Real reward pieces emerge from the problem object before the final star. The
    # same golden star fragment is the collectible throughout all 24 chapters.
    if n!=24:
        token=star("Sternensplitter aus dem Gegenstand",None,(1.05,-.30,.65),.13)
        path(token,[(1,(1.05,-.30,.65),None,.001),(F(.54),(1.05,-.30,.65),None,.001),(F(.66),(.63,-.32,1.44),(0,130,0),1.4),(F(.79),(-.55,-.37,1.35),(0,270,0),1.0),(F(.83),(-.55,-.37,1.35),None,.001)])
    # Separate comic puff, from the relevant object. Never overlaps the actor.
    if n in [1,3,4,8,9,13,17,18,23,24]:
        for i in range(7):
            o=ball("Puff",None,(0,0,0),(.16,)*3,"gas");u0=.54+i*.012;u1=.64+i*.01;u2=.78+i*.006
            path(o,[(1,(1.35,-.13,.40),None,.001),(F(u0),(1.35,-.13,.40),None,.001),(F(u1),(1.6+i*.095,-.16,.65+i*.065),None,.16+i*.025),(F(u2),(2.1+i*.13,-.10,.92+i*.07),None,.001)])
    reward=star("Recovered motor star",None,(0,-.35,1.4),.23)
    path(reward,[(1,(1.05,-.35,.65),None,.001),(F(.72),(1.05,-.35,.65),None,.001),(F(.85),(.05,-.45,1.95),(0,180,0),1.3),(end,(.05,-.45,2.03),(0,360,0),1.0)])
    for i in range(8):
        st=star("Spark",None,(0,0,0),.055);a0=i*math.tau/8
        path(st,[(1,(0,-.45,1.8),None,.001),(F(.81),(0,-.45,1.8),None,.001),(F(.92),(math.cos(a0)*.7,-.45,1.95+math.sin(a0)*.55),(0,180,0),1),(end,(math.cos(a0)*.83,-.45,2.03+math.sin(a0)*.65),None,.7)])
    s.frame_set(1)
    dest=OUT/f"chapter-{n:02}.glb"
    bpy.ops.export_scene.gltf(filepath=str(dest),export_format="GLB",export_cameras=True,export_lights=True,export_animations=True,export_animation_mode="SCENE",export_frame_range=True,export_force_sampling=True,export_apply=True)
    raw=dest.read_bytes();length=struct.unpack_from("<I",raw,12)[0];doc=json.loads(raw[20:20+length]);assert raw[:4]==b"glTF" and doc.get("animations") and doc.get("cameras"),f"Invalid chapter {n}"
    channels=[c for clip in doc["animations"] for c in clip["channels"]]
    names={doc["nodes"][c["target"]["node"]].get("name","") for c in channels if "node" in c["target"]}
    print("EXPORT",n,len(raw),"clips",len(doc["animations"]),"channels",len(channels),"animated nodes",sorted(names),flush=True)
    assert len(channels)>=12 and len(raw)<12*1024*1024,(n,len(channels),len(raw))
    assert any("Furzipups_Root" in name for name in names) and any("FilmCamera" in name for name in names),(n,names)
    print("VALIDATED",n,len(raw),len(channels),flush=True)
    if n==3:bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"chapter-03.blend"))
    return dict(day=n,file=dest.name,seconds=LENGTHS[n],bytes=len(raw),channels=len(channels))
manifest=[]
for n in DAYS:manifest.append(animate(n))
(OUT/"manifest.json").write_text(json.dumps({"version":"blender-cinema-v2","chapters":manifest},ensure_ascii=False),encoding="utf-8")
