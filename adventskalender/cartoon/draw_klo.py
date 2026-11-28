"""Original 2D cartoon: complete nine-second day 3 scene.
The same sampled vector artwork is saved for native Blender Grease Pencil drawings
and rendered as a lightweight MP4 for the mobile calendar. No paid generation API.
"""
import math, json, random, subprocess
from pathlib import Path
import cairosvg
from svgpathtools import parse_path
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/"renders"/"cartoon"
TMP=OUT/"work"
TMP.mkdir(parents=True,exist_ok=True)
W,H=960,540
FPS=24
N=216
INK="#302b42"
def clamp(x):return max(0,min(1,x))
def smooth(x):x=clamp(x);return x*x*(3-2*x)
def ease(t,a,b):return smooth((t-a)/(b-a))
def mix(a,b,u):return a+(b-a)*u
def track(t,keys):
    if t<=keys[0][0]:return keys[0][1]
    for (a,x),(b,y) in zip(keys,keys[1:]):
        if t<=b:return mix(x,y,ease(t,a,b))
    return keys[-1][1]
class Art:
    def __init__(self):self.shapes=[];self.stack=[(1,0,0,1,0,0)]
    def push(self,x=0,y=0,angle=0,sx=1,sy=None):
        sy=sx if sy is None else sy;an=math.radians(angle);c,s=math.cos(an),math.sin(an)
        a,b,d,e,f,g=self.stack[-1];self.stack.append((a*c*sx+d*s*sx,b*c*sx+e*s*sx,-a*s*sy+d*c*sy,-b*s*sy+e*c*sy,a*x+d*y+f,b*x+e*y+g))
    def pop(self):self.stack.pop()
    def pts(self,points):a,b,c,d,e,f=self.stack[-1];return [[round(a*x+c*y+e,2),round(b*x+d*y+f,2)] for x,y in points]
    def path(self,d,fill="none",line=INK,w=3.2,closed=True):
        p=parse_path(d)
        for sub in p.continuous_subpaths():
            pts=[]
            for seg in sub:
                count=max(2,min(36,int(seg.length(error=.5)/5)+2))
                pts.extend((seg.point(i/count).real,seg.point(i/count).imag) for i in range(count))
            pts.append((sub[-1].end.real,sub[-1].end.imag))
            self.shapes.append(dict(p=self.pts(pts),fill=fill,line=line,w=w,closed=closed))
    def poly(self,pts,fill,line=INK,w=3,closed=True):self.shapes.append(dict(p=self.pts(pts),fill=fill,line=line,w=w,closed=closed))
    def ellipse(self,x,y,rx,ry,fill,line=INK,w=3):
        self.poly([(x+rx*math.cos(i*math.tau/48),y+ry*math.sin(i*math.tau/48)) for i in range(48)],fill,line,w)
    def rect(self,x,y,w,h,fill,line=INK,stroke=3,r=7):
        r=min(r,w/2,h/2);self.path(f"M{x+r},{y} H{x+w-r} Q{x+w},{y} {x+w},{y+r} V{y+h-r} Q{x+w},{y+h} {x+w-r},{y+h} H{x+r} Q{x},{y+h} {x},{y+h-r} V{y+r} Q{x},{y} {x+r},{y} Z",fill,line,stroke)
    def line(self,d,col=INK,w=3):self.path(d,"none",col,w,False)
    def star(self,x,y,r,angle=0):
        pts=[(x+math.cos(math.radians(angle-90)+i*math.pi/5)*r*(1 if i%2==0 else .45),y+math.sin(math.radians(angle-90)+i*math.pi/5)*r*(1 if i%2==0 else .45)) for i in range(10)]
        self.poly(pts,"#ffdc68","#8c4b37",2.5)
        self.line(f"M{x-4},{y-6} L{x},{y-14} L{x+3},{y-6}","#fff7ba",2.6)
    def svg(self):
        out=[f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">']
        for s in self.shapes:
            tag="polygon" if s["closed"] else "polyline";points=" ".join(f"{x},{y}" for x,y in s["p"])
            out.append(f'<{tag} points="{points}" fill="{s["fill"]}" stroke="{s["line"]}" stroke-width="{s["w"]}" stroke-linejoin="round" stroke-linecap="round"/>')
        return "".join(out)+"</svg>"
def background(a):
    a.rect(0,0,W,H,"#496980","none",0,0)
    # Warm crooked wooden washroom, snowy courtyard through tall window.
    a.path("M0,0 H960 V392 Q520,365 0,393 Z","#e2ad7b","none",0)
    for i in range(11):
        y=i*36+8
        a.line(f"M0,{y} Q370,{y+5} 960,{y-5}","#ba815e",2)
        a.line(f"M0,{y+4} Q390,{y+8} 960,{y}","#f2c69b",1.3)
    for x,y in [(38,85),(176,266),(446,61),(860,227),(744,105)]:
        a.line(f"M{x-11},{y} q21,-8 37,0 q-15,10 -26,4","#b47a58",1.7)
    a.path("M0,0 H960 V22 Q560,35 0,22 Z","#5f3e42","#4a3240",3)
    a.path("M0,380 Q480,350 960,380 V540 H0 Z","#a06c58",INK,4)
    for x in range(-150,1200,110):
        a.line(f"M{480+(x-480)*.45},376 L{x},540","#744c48",2)
    for y in [405,451,512]:
        a.line(f"M0,{y} Q480,{y-12} 960,{y}","#744c48",2)
    a.path("M0,386 Q480,365 960,384 L960,403 Q480,383 0,405 Z","#694c4b",INK,3)
    # Window: dark blue snow scene, hand-painted-looking layered silhouettes.
    a.rect(71,47,244,243,"#69474b",INK,4,29)
    a.rect(86,61,214,211,"#304c70","#513b49",4,23)
    a.path("M89,184 Q126,148 164,184 T240,176 T297,182 V269 H89 Z","#a3cbd6","none",0)
    a.path("M89,218 Q147,177 194,221 T297,213 V269 H89 Z","#d9eef0","none",0)
    for x,y,s in [(104,224,.64),(256,235,.85),(207,208,.5)]:
        a.push(x,y,0,s)
        a.poly([(-17,0),(17,0),(0,-54)],"#3c7380","#35596b",2)
        a.poly([(-20,-18),(20,-18),(0,-70)],"#4f8590","#35596b",2)
        a.poly([(-10,-49),(0,-70),(13,-45),(1,-48)],"#e4f5f3","none",0);a.pop()
    a.ellipse(254,97,19,19,"#ffe8ac","none",0)
    for x,y in [(116,92),(177,118),(217,81),(282,146),(137,145),(233,160)]:
        a.ellipse(x,y,2.1,2.1,"#fff7d6","none",0)
    a.rect(185,62,10,209,"#754b46",INK,2,2);a.rect(87,155,212,10,"#754b46",INK,2,2)
    a.path("M63,275 Q188,269 322,275 L320,292 Q192,302 61,290 Z","#7e5448",INK,3)
    a.path("M60,274 Q96,264 123,271 T184,270 T244,269 T324,273 L319,280 Q185,284 60,280 Z","#fff1d7","none",0)
    # Framed picture and hooks with festive scarf.
    a.rect(372,52,106,96,"#8c5146",INK,3,8);a.rect(381,61,88,77,"#ffe4b2","#b47854",2,4)
    a.star(424,99,25);a.ellipse(394,124,3,3,"#b47854","none",0);a.ellipse(455,72,3,3,"#b47854","none",0)
    a.line("M530,57 Q598,83 669,57","#674942",4)
    for i in range(7):
        x=535+i*21;y=59+17*math.sin(i*math.pi/6)
        a.ellipse(x,y,7,9,"#f2c85d" if i%2==0 else "#d66559","#80504b",1.8)
    a.rect(790,83,125,12,"#69474b",INK,3,3)
    a.path("M808,95 Q823,88 842,96 L850,193 Q834,208 809,192 Z","#cc515d",INK,3)
    for y in [119,146,174]:a.line(f"M810,{y} L846,{y+1}","#f6dcad",7)
    # Tiled toilet area.
    a.path("M565,170 Q752,160 960,170 V384 L560,377 Z","#7aa9af","#426e79",3)
    for x in range(574,1000,53):a.line(f"M{x},171 L{x-4},380","#567e87",1.6)
    for y in [205,250,295,340]:a.line(f"M563,{y} Q753,{y-5} 960,{y}","#567e87",1.6)
    # Golden floor rug.
    a.ellipse(510,461,293,46,"#794b4e","none",0)
    a.ellipse(510,457,285,42,"#c16a5d","#70464c",3)
    a.ellipse(510,457,260,33,"#e7aa74","#f3cd99",3)
    for i in range(17):a.line(f"M{264+i*29},479 l-4,7","#8e4b50",2)
    a.path("M854,418 q45,-32 106,-21 V540 H818 q-4,-75 36,-122 Z","#dce8e6","#91b3b9",3)
    a.path("M875,435 q35,-22 85,-15 V540 H839 q-3,-70 36,-105 Z","#f4f3e7","none",0)
    # Warm lamp and paper roll.
    a.line("M704,0 V45","#614247",4)
    a.path("M678,44 Q704,29 730,44 L744,81 Q704,100 664,81 Z","#f5ca7b",INK,3)
    a.ellipse(704,81,39,9,"#fff0ab","#a36e51",2)
    a.rect(878,235,40,54,"#e6e5d3",INK,3,9);a.ellipse(898,236,20,8,"#fdf9e8",INK,2);a.ellipse(898,236,7,3,"#8f7462",INK,1.5)
    a.path("M907,245 L929,250 L928,296 Q918,287 907,295 Z","#faf3dc","#8a9c9b",2)
def toilet(a,t):
    x,y=660,388
    a.ellipse(x+3,426,100,21,"#90665d","none",0)
    a.push(x,y)
    a.path("M-42,-8 Q-37,19 -47,36 L-69,48 Q-76,58 -58,64 L67,64 Q80,60 67,48 L40,37 Q32,12 37,-8 Z","#bbd5d7",INK,4)
    a.path("M-31,3 Q-27,29 -38,42 L-52,50 Q-20,57 52,51 L28,35 Q20,18 26,1 Z","#f8f3df","none",0)
    a.rect(30,-190,97,115,"#b3d0d1",INK,4,15)
    a.rect(34,-185,84,100,"#e9ece0","none",0,12)
    a.rect(22,-197,113,21,"#fff5dc",INK,3.5,9)
    a.rect(77,-178,30,12,"#d4a76d","#86604a",2,5)
    a.path("M-99,-81 Q-98,-21 -56,-5 Q-12,20 49,-5 Q85,-23 92,-73 Z","#b7d5d7",INK,4)
    a.path("M-92,-74 Q-78,-25 -47,-13 Q-4,5 38,-11 Q67,-28 76,-71 Z","#eff4e5","none",0)
    a.ellipse(-4,-78,95,33,"#fff9e9",INK,4)
    a.ellipse(-3,-79,72,20,"#688d9c","#3c6172",3)
    a.ellipse(-3,-77,59,14,"#6fc0cc","none",0)
    a.line("M-36,-78 Q-4,-85 25,-77","#b3e6e6",2)
    # Lid hinge opens with deliberate anticipation, fast snap and overshoot.
    angle=track(t,[(0,0),(2.6,0),(3.0,-20),(3.5,-20),(4.02,0),(4.34,-104),(4.60,-85),(5.1,-93),(9,-90)])
    a.push(58,-91,angle)
    a.path("M0,0 Q-36,-31 -108,-26 Q-163,-24 -164,0 Q-161,23 -108,25 Q-34,29 0,6 Z","#fcf5df",INK,4)
    a.path("M-16,-2 Q-46,-20 -109,-17 Q-145,-17 -149,0","#d2e2de","none",0)
    a.line("M-135,-10 Q-101,-20 -50,-13","#ffffff",3)
    a.pop()
    a.ellipse(59,-89,9,7,"#c7a77b",INK,2)
    a.pop()
def elf(a,t):
    # Whole-body pose with distinct lean, walk cycle, shock, fall, recovery.
    x=track(t,[(0,205),(1.4,341),(2.25,402),(3.7,426),(4.1,444),(4.40,380),(4.90,250),(5.3,220),(6.3,267),(7.2,340),(9,340)])
    y=track(t,[(0,430),(2.4,430),(4.14,432),(4.43,368),(4.93,454),(5.7,454),(6.7,430),(9,430)])
    tilt=track(t,[(0,0),(1.3,7),(2.4,12),(3.7,17),(4.08,22),(4.42,-33),(4.97,-70),(5.45,-52),(6.6,0),(9,0)])
    squash=track(t,[(0,1),(2.8,1),(4.02,.92),(4.32,1.1),(4.95,.82),(5.4,.9),(6.6,1),(9,1)])
    step=math.sin(t*13)*(.85 if t<1.6 else 0)
    a.ellipse(x,448,68 if t<4.4 or t>6.6 else 95,13,"#8c5b54","none",0)
    a.push(x,y,tilt,1.05/squash,1.05*squash)
    # boots, stockings and coat silhouette.
    for sign in [-1,1]:
        a.push(sign*23,-12,sign*step*20)
        a.path("M-12,-29 H13 L14,8 H-12 Z","#ce5c5c",INK,3)
        a.line("M-11,-12 L12,-12","#ffe1a2",5)
        a.path("M-13,4 Q-16,15 -24,18 Q-27,28 -13,29 L22,28 Q31,24 20,17 L13,3 Z","#523c46",INK,3.5)
        a.line("M-15,23 L18,23","#9b7467",2)
        a.pop()
    # Coat and scarf.
    a.path("M-30,-137 Q-55,-129 -57,-84 L-63,-29 Q-38,-8 0,-8 Q45,-8 62,-30 L55,-86 Q50,-126 27,-136 Z","#328a75",INK,4)
    a.path("M-29,-129 Q-48,-112 -44,-79 L-49,-34 Q-36,-28 -24,-27 L-24,-124 Z","#5bb59a","none",0)
    a.path("M24,-126 Q52,-105 54,-60 L60,-30 Q42,-17 18,-16 L24,-126 Z","#267461","none",0)
    a.path("M-57,-44 Q0,-30 57,-44 L60,-25 Q0,-11 -61,-27 Z","#4b3d47",INK,3)
    a.rect(-11,-43,25,20,"#ffc967",INK,2.5,4);a.rect(-4,-38,11,10,"#71474b","none",0,2)
    for yy in [-107,-79,-58]:a.ellipse(2,yy,4.4,4.4,"#f8c960","#684e45",1.5)
    a.path("M-37,-141 Q-4,-128 32,-141 L39,-121 Q2,-105 -41,-121 Z","#c84b56",INK,3)
    a.path("M25,-126 Q44,-115 46,-81 L30,-77 Q18,-111 12,-120 Z","#c84b56",INK,3)
    a.line("M31,-83 l10,-3","#f6ceaa",2)
    # Articulated arms with white mittens; far arm first.
    reach=track(t,[(0,0),(1.8,12),(2.7,70),(3.4,58),(4.03,82),(4.45,-70),(5.1,-42),(6.3,15),(7.4,45),(9,45)])
    for side in [-1,1]:
        angle=(side*18+step*side*20) if side<0 else reach
        if t>4.35 and t<6:angle=side*70
        if t>7:angle=side*80
        a.push(side*47,-114,-side*angle)
        a.path("M-12,-8 Q0,-17 13,-7 L15,36 Q0,47 -15,36 Z","#398e78",INK,3)
        a.path("M-11,4 L-8,29 L0,31 L-1,4 Z","#62b89e","none",0)
        a.rect(-15,30,30,13,"#f4e8d4",INK,2.5,5)
        a.path("M-12,40 Q-20,41 -17,53 Q-15,65 -3,67 Q11,67 16,57 Q23,49 16,44 Q13,40 9,45 Q3,37 -12,40 Z","#fff4df",INK,3)
        a.line("M-3,58 Q0,61 5,59","#bcae9a",1.7)
        a.pop()
    # Head with independent eye and mouth changes.
    a.push(0,-162,track(t,[(0,0),(2,6),(4,-4),(4.4,-15),(5,12),(6.7,0),(9,0)]))
    for side in [-1,1]:
        a.path(f"M{side*49},-13 Q{side*79},-36 {side*78},-10 Q{side*72},12 {side*49},15 Z","#f0ad83",INK,3)
        a.line(f"M{side*60},-7 Q{side*70},-16 {side*69},1","#b76e65",2)
    a.path("M-49,-42 Q-30,-73 4,-69 Q43,-68 55,-37 L58,0 Q54,37 16,48 Q-17,55 -42,35 Q-62,15 -55,-16 Z","#f6bc90",INK,4)
    a.path("M-42,-29 Q-53,6 -38,24 Q-24,39 -6,40 Q-33,48 -44,29 Q-58,13 -52,-12 Z","#dc9078","none",0)
    a.path("M-46,-36 Q-31,-48 -18,-51 Q-24,-31 -39,-19 Z","#8d554b",INK,2)
    a.path("M37,-51 Q55,-40 56,-21 L43,-24 Z","#8d554b",INK,2)
    shocked=4.18<t<5.6;blink=abs(t-1.85)<.08 or abs(t-6.35)<.08
    for xx in [-19,20]:
        a.ellipse(xx,-8,15,20 if shocked else (2 if blink else 16),"#fff9ea",INK,2.7)
        if not blink:
            a.ellipse(xx+(5 if t<4.15 else 0),-6,7,10,"#6a463b",INK,1.3)
            a.ellipse(xx+(5 if t<4.15 else 0),-7,3.4,6,"#302b42","none",0)
            a.ellipse(xx+(3 if t<4.15 else -2),-10,2.2,3,"#fff","none",0)
        a.line(f"M{xx-12},{-34 if shocked else -30} Q{xx},{-40 if shocked else -36} {xx+12},{-33 if shocked else -30}","#7a4945",4)
    a.ellipse(3,8,11,9,"#eea483","#a76b62",2)
    a.ellipse(-36,17,10,6,"#e98e82","none",0);a.ellipse(38,17,10,6,"#e98e82","none",0)
    for xx in [-36,-31,-26,27,32,37]:a.ellipse(xx,14+(xx%3),1.3,1.3,"#b97662","none",0)
    if shocked:a.ellipse(4,29,12,16,"#703e4b",INK,2.7);a.ellipse(4,36,6,4,"#d77a77","none",0)
    elif t>6.6:a.path("M-17,22 Q4,33 24,17 Q22,38 4,38 Q-10,38 -17,22 Z","#803f4b",INK,2.5);a.path("M-12,24 Q4,30 19,22 L15,29 Q2,32 -8,29 Z","#fff3dd","none",0)
    else:a.line("M-12,27 Q4,32 17,23","#713f49",2.8)
    # Red floppy hat, cream fur brim, stitched fabric and pompom.
    a.path("M-59,-51 Q-64,-101 -15,-131 Q18,-154 34,-197 Q69,-172 65,-129 Q63,-98 54,-52 Z","#c84b58",INK,4)
    a.path("M-48,-56 Q-53,-95 -18,-118 Q9,-136 24,-161 Q14,-118 -5,-99 Q-24,-79 -24,-52 Z","#ea7880","none",0)
    a.line("M44,-155 Q55,-122 43,-91","#913d4d",3)
    a.path("M-58,-64 Q-39,-73 -16,-69 Q11,-75 36,-69 Q60,-72 62,-56 Q64,-39 47,-36 Q0,-43 -47,-36 Q-67,-38 -66,-52 Q-66,-60 -58,-64 Z","#fff2dc",INK,3.5)
    a.line("M-51,-48 Q-20,-56 9,-50 T48,-49","#d4c8b5",2)
    a.ellipse(35,-194,18,17,"#fff2dc",INK,3);a.ellipse(29,-199,6,4,"#ffffff","none",0)
    a.pop();a.pop()
def effect(a,t):
    if 4.31<t<6.18:
        u=(t-4.31)/1.87
        for i in range(8):
            v=clamp(u*1.55-i*.07)
            if v<=0:continue
            x=605-i*15-112*v;y=294-37*math.sin(i*1.6)-50*v;r=(12+18*v)*(1-ease(t,5.75,6.18))
            if r<1:continue
            a.ellipse(x,y,r*1.2,r,"#a0c66b","#688b58",2.8)
            a.line(f"M{x-r*.60},{y-2} q{r*.4},-{r*.6} {r*.9},-{r*.2}","#d3e5a0",2)
        for j in range(4):
            x=580-j*20-75*u;y=260-j*9
            a.line(f"M{x},{y} q-12,-12 -26,-7","#719a67",2)
    if 4.30<t<5.1:
        for i in range(6):
            ang=i*math.pi/5;v=ease(t,4.3,5.0);x=625+math.cos(ang)*80*v;y=312-math.sin(ang)*65*v
            a.line(f"M{x},{y} l{math.cos(ang)*17},{-math.sin(ang)*17}","#fff1ba",3.5)
    if 4.78<t<5.5:
        u=ease(t,4.78,5.5)
        for i in range(6):
            x=224+(i-2.5)*21*u;y=448-math.sin(u*math.pi)*(23+(i%3)*11)
            a.ellipse(x,y,7*(1-u)+1,4*(1-u)+1,"#f6f2e4","#acc7c7",1.3)
    if t>=5.35:
        u=ease(t,5.35,7.0);x=mix(620,402,u);y=mix(313,175,u)-math.sin(u*math.pi)*74
        if t>7:x=402;y=175+3*math.sin((t-7)*5)
        r=18+8*u
        a.star(x,y,r,270*u)
        for i in range(7):
            an=i*math.tau/7+t*.75;rr=36+7*math.sin(t*5+i);xx=x+math.cos(an)*rr;yy=y+math.sin(an)*rr
            a.line(f"M{xx-4},{yy} h8 M{xx},{yy-4} v8","#fff4b8",2.3)
def frame(t):
    a=Art();background(a);toilet(a,t);elf(a,t);effect(a,t)
    # foreground atmospheric snow at the open threshold, understated.
    for i in range(7):
        x=884+(i*31)%74;y=397+(i*29+t*7)%100;a.ellipse(x,y,2,2,"#ffffff","none",0)
    return a
def main():
    # Animate on twos: 108 individually drawn poses at 24 fps.
    drawings=[]
    for f in range(0,N,2):
        a=frame(f/FPS);name=TMP/f"f{f//2:04}.png"
        cairosvg.svg2png(bytestring=a.svg().encode(),write_to=str(name))
        drawings.append({"frame":f+1,"shapes":a.shapes})
    (TMP/"drawings.json").write_text(json.dumps(drawings,separators=(",",":")))
    (OUT/"chapter-03-style.svg").write_text(frame(4.5).svg())
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-framerate","12","-i",str(TMP/"f%04d.png"),"-c:v","libx264","-vf","fps=24,format=yuv420p","-crf","19","-movflags","+faststart",str(OUT/"chapter-03.mp4")],check=True)
    file=OUT/"chapter-03.mp4"
    assert 10000<file.stat().st_size<12*1024*1024
    (OUT/"manifest.json").write_text(json.dumps({"version":"cartoon-v1","chapters":[{"day":3,"file":file.name,"audio":"app","approved":True,"preview":True,"seconds":9,"bytes":file.stat().st_size}]},indent=2))
    print("CARTOON_RENDERED",file.stat().st_size,len(drawings),flush=True)
if __name__=="__main__":main()
