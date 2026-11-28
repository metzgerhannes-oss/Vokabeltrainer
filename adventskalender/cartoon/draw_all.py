"""23 new original 2D films using the approved day-3 inked character and palette.
Each chapter has its own problem object, solution movement, reveal and comic payoff.
Render at 12 drawn cels/sec, encode H.264 at 24fps; no paid services.
"""
import argparse, math, json, shutil, subprocess, functools
from pathlib import Path
import cairosvg
import draw_klo as k
from draw_klo import Art,INK,clamp,smooth,ease,mix,track,elf as base_elf
OUT=k.OUT
# Cache identical path tessellations (painted backgrounds and character parts).
from svgpathtools import parse_path
k.parse_path=functools.lru_cache(maxsize=8192)(parse_path)
DURS={1:10,2:9,4:9,5:8,6:9,7:9,8:9,9:9,10:8,11:9,12:9,13:10,14:9,15:9,16:9,17:10,18:9,19:9,20:9,21:9,22:9,23:10,24:22}
GOLD="#ffd46e"; RED="#c94e59"; GREEN="#398e78"; BLUE="#609fb6"; CREAM="#fff1da"; WOOD="#955f50"; DARK="#5e424c"; SNOW="#e6f1eb"
def line(a,x,y,x2,y2,c=INK,w=3):a.line(f"M{x},{y} L{x2},{y2}",c,w)
def text(a,x,y,s,size=34,fill=INK):
    # Explicit vector glyphs; exact puzzle numbers and letters, not AI lettering.
    glyphs={"0":["111","101","101","101","111"],"1":["010","110","010","010","111"],"2":["111","001","111","100","111"],"3":["111","001","111","001","111"],"4":["101","101","111","001","001"],"5":["111","100","111","001","111"],"6":["111","100","111","101","111"],"7":["111","001","010","010","010"],"8":["111","101","111","101","111"],"9":["111","101","111","001","111"],"N":["1001","1101","1011","1001","1001"],"R":["1110","1001","1110","1010","1001"],"E":["111","100","110","100","111"],"T":["111","010","010","010","010"],"S":["111","100","111","001","111"],"H":["101","101","111","101","101"],"A":["010","101","111","101","101"],"U":["101","101","101","101","111"],"M":["10001","11011","10101","10001","10001"]," ":["00"]*5}
    unit=size/5;w=sum(len(glyphs.get(c,["00"])[0])+1 for c in s)*unit-unit;xx=x-w/2
    for c in s:
        g=glyphs.get(c,["00"]*5)
        for j,row in enumerate(g):
            for i,v in enumerate(row):
                if v=="1":a.rect(xx+i*unit,y+j*unit,unit+.2,unit+.2,fill,"none",0,0)
        xx+=(len(g[0])+1)*unit
def pine(a,x,y,s=1):
    a.push(x,y,0,s);a.rect(-8,-15,16,32,WOOD,INK,2,3)
    for j in range(3):
        z=-j*35;w=43-j*8;a.path(f"M0,{z-72} Q{-w*.45},{z-35} {-w},{z} Q0,{z+17} {w},{z} Q{w*.45},{z-35} 0,{z-72} Z","#3e777b",INK,2.5)
        a.path(f"M0,{z-72} Q{-w*.35},{z-42} {-w*.55},{z-25} Q0,{z-38} {w*.55},{z-25} Z",SNOW,"none",0)
    a.pop()
def cottage(a,x,y,s,lit=True):
    a.push(x,y,0,s)
    a.rect(-58,-93,116,94,"#d7a178",INK,3,6)
    a.poly([(-70,-92),(0,-149),(70,-92)],"#a44d55",INK,3)
    a.path("M-70,-92 L0,-149 L70,-92 L59,-98 L0,-137 L-59,-92 Z",SNOW,"none",0)
    a.rect(-13,-46,26,46,WOOD,INK,2,9)
    for xx in [-39,39]:
        a.rect(xx-13,-72,26,28,"#f8d77b" if lit else "#507388",INK,2,4);line(a,xx,-71,xx,-46,WOOD,2)
    a.pop()
def backdrop(a,kind,t):
    if kind in ("snow","market","track","final"):
        a.rect(0,0,960,540,"#476982","none",0,0)
        a.ellipse(781,80,46,46,"#ffe5ae","none",0)
        a.path("M0,235 Q90,115 185,218 Q285,87 410,222 Q550,100 695,215 Q827,101 960,212 V540 H0 Z","#7e9eb0","none",0)
        a.path("M0,258 Q170,211 335,272 Q520,208 700,259 T960,246 V540 H0 Z","#b7d0d6","none",0)
        for i in range(8):pine(a,40+i*131,286+(i%3)*17,.65+(i%3)*.13)
        for i in range(4):cottage(a,115+i*232,336,.65,kind!="final")
        a.path("M0,351 Q210,309 414,371 Q651,332 960,358 V540 H0 Z",SNOW,INK,2)
        a.path("M0,435 Q311,389 650,449 T960,432 V540 H0 Z","#c9e0e1","none",0)
        for i in range(13):
            x=(i*173+19)%960;y=44+(i*71+t*10)%315;a.ellipse(x,y,2+(i%2),2+(i%2),CREAM,"none",0)
        if kind=="market":
            a.push(702,105);a.rect(-197,50,394,232,"#b67c5b",INK,4,8)
            a.path("M-215,57 L-184,-7 H184 L215,57 Z",RED,INK,4)
            for i in range(7):a.poly([(-181+i*52,-7),(-155+i*52,-7),(-170+i*61,57),(-200+i*61,57)],CREAM,"none",0)
            a.rect(-208,217,416,19,WOOD,INK,3,4);a.pop()
        if kind=="track":
            a.path("M0,392 Q480,364 960,392 L960,456 Q480,417 0,455 Z","#a9c4cc","#799aa8",2)
            for i in range(10):line(a,35+i*100,425,80+i*100,425,CREAM,5)
            a.rect(824,215,7,209,DARK,INK,2,1)
            for row in range(3):
                for col in range(4):a.rect(831+col*19,215+row*19,19,19,CREAM if (row+col)%2 else DARK,INK,1,0)
    else:
        # A distinct warm, inked interior for each location, no reused toilet set.
        wall={"work":"#d4a274","lab":"#b9c6b5","stall":"#c3a17c"}[kind]
        a.rect(0,0,960,540,wall,"none",0,0)
        for i in range(11):
            y=12+i*35;a.line(f"M0,{y} Q480,{y+4} 960,{y-2}","#997561",1.8)
        a.path("M0,0 H960 V26 Q480,39 0,26 Z",DARK,INK,3)
        a.path("M0,382 Q480,352 960,382 V540 H0 Z","#a27664",INK,3)
        for x in range(-160,1180,118):line(a,480+(x-480)*.45,377,x,540,"#79534c",2)
        for y in (411,458,513):a.line(f"M0,{y} Q480,{y-10} 960,{y}","#79534c",2)
        a.rect(54,54,240,204,WOOD,INK,4,22);a.rect(66,66,216,180,"#446c8a",INK,3,17)
        a.ellipse(239,100,25,25,CREAM,"none",0)
        a.path("M68,203 Q110,151 153,203 Q200,169 280,201 V244 H68 Z",SNOW,"none",0)
        pine(a,124,231,.46);pine(a,238,240,.53)
        a.rect(171,66,8,180,WOOD,INK,2,2);a.rect(66,153,216,8,WOOD,INK,2,2)
        a.rect(42,247,264,15,DARK,INK,3,3)
        a.ellipse(495,460,306,39,"#855a55","none",0);a.ellipse(495,454,290,35,"#cf9b76","#6c4c50",3)
        a.rect(690,73,220,14,WOOD,INK,3,4);a.rect(690,161,220,14,WOOD,INK,3,4)
        if kind=="lab":
            for j in range(4):
                a.push(717+j*54,143);a.ellipse(0,-12,16,19,[BLUE,GREEN,RED,GOLD][j],INK,2);a.rect(-5,-37,10,21,CREAM,INK,2,3);a.pop()
            for j in range(3):a.rect(709+j*66,34,40,39,["#bd7359","#7fa59a","#d2b66b"][j],INK,2,5)
        elif kind=="stall":
            for j in range(3):
                a.rect(699+j*65,104,54,53,GOLD,"#9b6f4e",2,4)
                for i in range(4):line(a,704+j*65,110+i*11,748+j*65,115+i*10,"#bd8b51",2)
            for xx in [343,455,567,679,791,903]:a.rect(xx,273,10,101,WOOD,INK,2,2)
            a.rect(335,290,605,16,WOOD,INK,2,4)
        else:
            for j in range(4):
                a.rect(708+j*49,107,30,50,[RED,BLUE,GREEN,GOLD][j],INK,2,3)
                a.line(f"M{716+j*49},115 v28",CREAM,2)
            for j in range(3):a.ellipse(723+j*76,58,19,15,GOLD,INK,2)
        a.line("M549,0 V40",DARK,4);a.path("M526,40 Q549,26 572,40 L588,75 Q550,92 510,75 Z",GOLD,INK,3);a.ellipse(549,76,39,8,CREAM,INK,2)
def puff(a,x,y,u,large=False):
    if not 0<u<1:return
    fade=1-smooth((u-.72)/.28)
    for j in range(8 if large else 5):
        v=clamp(u*1.4-j*.075);r=(8+21*v)*fade
        if r<1:continue
        xx=x-j*13-v*(130 if large else 75);yy=y-32*math.sin(j*1.8)-35*v
        a.ellipse(xx,yy,r*1.25,r,"#a7ca73","#638b62",2.4);a.line(f"M{xx-r*.6},{yy-2} q{r*.4},-{r*.55} {r*.8},-1","#e0eab6",2)
def shadow(a,x,y=448,r=86):a.ellipse(x,y,r,11,"#9c9c91" if y>425 else "#8f7668","none",0)
def gear(a,x,y,r,ang):
    a.push(x,y,ang)
    pts=[]
    for j in range(48):
        an=j*math.tau/48;rr=r if j%4 in (1,2) else r*.78;pts.append((rr*math.cos(an),rr*math.sin(an)))
    a.poly(pts,GOLD,INK,3.5);a.ellipse(0,0,r*.49,r*.49,"#b9824c",INK,3);a.ellipse(0,0,r*.25,r*.25,DARK,INK,2);a.pop()
def snowman(a,x,y,carrot,lean=0):
    a.push(x,y,lean)
    a.ellipse(0,-49,72,52,SNOW,INK,3.5);a.ellipse(-12,-57,48,33,"#fff9e9","none",0)
    a.ellipse(0,-121,55,53,SNOW,INK,3.5);a.ellipse(-12,-132,34,37,"#fff9e9","none",0)
    for xx in (-18,18):a.ellipse(xx,-132,5.5,7,DARK,INK,1.5)
    a.line("M-16,-106 Q0,-96 18,-108",INK,3)
    for yy in (-78,-52,-26):a.ellipse(3,yy,6,6,DARK,INK,1.5)
    a.path("M-48,-162 H46 L50,-180 H-48 Z",DARK,INK,3);a.rect(-31,-213,64,37,DARK,INK,3,4);a.rect(-32,-184,65,8,RED,INK,1,0)
    a.line("M-48,-73 L-91,-111 l-17,-1 M-91,-111 l-3,-19",WOOD,5);a.line("M51,-79 L87,-104 l12,-2 M87,-104 l-1,-16",WOOD,5)
    # carrot starts at rear edge, arcs to front face.
    u=carrot;xx=mix(55,-1,u);yy=mix(-42,-120,u)-math.sin(math.pi*u)*75
    a.push(xx,yy,mix(160,0,u));a.poly([(0,-7),(39,0),(0,8)],"#ec9450",INK,2);a.line("M12,-4 l-2,6","#b86349",2);a.pop();a.pop()
def sock(a,x,y,ang):
    a.push(x,y,ang)
    a.path("M-27,-100 Q6,-105 33,-97 L24,-22 Q24,-9 52,4 Q76,12 65,30 Q59,46 29,40 L-25,26 Q-44,17 -40,-7 Z",RED,INK,4)
    a.path("M-38,-12 Q-16,-8 -12,22 L-25,26 Q-44,17 -40,-7 Z",CREAM,INK,2)
    a.path("M37,0 Q47,14 45,37 Q69,40 69,22 Q67,10 37,0 Z",CREAM,INK,2)
    a.rect(-32,-105,70,21,CREAM,INK,3,6)
    for y in [-75,-54]:a.line(f"M-25,{y} Q0,{y+9} 28,{y}",GOLD,6)
    a.pop()
def mirror(a,x,y,ang,done):
    a.push(x,y,0,max(.08,abs(math.cos(math.radians(ang)))),1)
    a.ellipse(0,0,91,126,WOOD,INK,4);a.ellipse(0,0,77,111,GOLD,INK,3);a.ellipse(0,0,64,98,"#8ab9c7",INK,3)
    a.path("M-50,-72 Q-36,-94 -16,-92 L-48,-20 Z","#cde4df","none",0)
    text(a,0,-12,"STERN" if done else "NRETS",18,INK);a.pop()
def boot(a,x,y,ang):
    a.push(x,y,ang)
    a.path("M-42,-109 H35 L31,-18 Q35,-3 65,4 Q89,18 74,39 Q52,49 -35,38 Q-50,30 -48,8 Z",RED,INK,4)
    a.path("M-43,24 Q6,43 75,28 L75,42 Q18,54 -42,42 Z",DARK,INK,3)
    a.rect(-48,-115,89,24,CREAM,INK,3,7);a.rect(-37,-52,70,13,GOLD,INK,2,3);a.pop()
def spider(a,x,y,u):
    a.push(x,y)
    for sign in [-1,1]:
        for j in range(4):
            z=-24+j*14;dy=math.sin(u*18+j)*8
            a.line(f"M{sign*15},{z} Q{sign*(42+j%2*7)},{z-20} {sign*55},{z+dy+16}",INK,4.5)
    a.ellipse(0,-5,29,35,"#74566a",INK,3);a.ellipse(0,18,22,19,"#b18690",INK,3)
    for xx in (-8,8):a.ellipse(xx,14,6,7,CREAM,INK,1.5);a.ellipse(xx+1,15,2,3,INK,"none",0)
    a.line("M-7,24 Q0,29 8,24",INK,2);a.pop()
def pot(a,x,y,u,t):
    a.push(x,y)
    a.path("M-103,-20 Q-111,65 -61,77 Q0,96 61,77 Q111,65 103,-20 Z","#635469",INK,4)
    a.ellipse(0,-20,107,35,DARK,INK,4);a.ellipse(0,-20,90,24,BLUE if u<.3 else "#9fc66c",INK,2)
    for xx in (-113,113):a.ellipse(xx,8,18,14,GOLD,INK,3)
    for xx in (-55,55):a.rect(xx-12,65,24,18,DARK,INK,2,5)
    for j in range(5):
        v=(t*.85+j*.22)%1;r=(5+7*v)*smooth(u);a.ellipse(-65+j*29,-20-v*65,r,r,"#c2df95","#648f68",2)
    a.pop()
def bottle(a,x,y,c,angle):
    a.push(x,y,angle);a.ellipse(0,4,24,34,c,INK,3);a.rect(-8,-39,16,27,CREAM,INK,2,3);a.rect(-12,-43,24,8,WOOD,INK,2,2);a.line("M-13,-9 q-8,17 2,24",CREAM,3);a.pop()
def clock(a,x,y,u):
    a.push(x,y)
    for xx in (-44,44):a.ellipse(xx,-82,27,14,GOLD,INK,3)
    a.ellipse(0,0,85,85,RED,INK,4);a.ellipse(0,0,69,69,CREAM,INK,3)
    for j in range(12):
        an=j*math.tau/12;line(a,math.sin(an)*56,-math.cos(an)*56,math.sin(an)*63,-math.cos(an)*63,INK,3)
    line(a,0,0,29,17,INK,6);an=u*math.tau;line(a,0,0,math.sin(an)*53,-math.cos(an)*53,INK,4);a.ellipse(0,0,5,5,RED,INK,2)
    for xx in (-48,48):a.rect(xx-10,70,20,18,DARK,INK,2,4)
    a.pop()
def signal(a,x,y,which):
    a.rect(x-9,y+84,18,79,WOOD,INK,3,3);a.rect(x-57,y-96,114,195,DARK,INK,4,17)
    for i,c in enumerate([RED,GOLD,BLUE]):
        a.ellipse(x,y-61+i*58,23,23,c if which==i else "#9a8c85",INK,3)
        if which==i:a.ellipse(x-7,y-68+i*58,7,6,CREAM,"none",0)
def deer(a,x,y,s=1,turn=1,tail=0,head=0):
    a.push(x,y,0,s*turn,s)
    for xx in (-47,38):
        a.path(f"M{xx-9},-53 h17 l6,52 h-20 Z","#96684f",INK,3);a.rect(xx-10,-7,23,10,DARK,INK,2,2)
    a.ellipse(0,-61,73,41,"#b88460",INK,3.5);a.ellipse(-12,-66,43,23,"#d3a478","none",0)
    a.push(-65,-76,tail);a.path("M0,0 Q-37,-41 -46,-13 Q-32,11 0,5 Z","#d6b386",INK,3);a.pop()
    a.push(52,-92,head)
    a.path("M-24,24 Q-32,-30 -11,-66 Q15,-82 33,-56 L42,20 Z","#b88460",INK,3)
    a.ellipse(15,-58,39,37,"#bd8b64",INK,3.5);a.ellipse(36,-39,26,18,"#e5c29b",INK,3);a.ellipse(55,-44,12,10,RED,INK,2)
    a.path("M-17,-72 Q-50,-105 -41,-78 Q-38,-59 -15,-54 Z","#c99673",INK,2.5)
    a.line("M-5,-86 l-10,-30 l-18,-10 M-15,-116 l8,-17 M21,-90 l12,-29 l20,-9 M33,-119 l-4,-16",DARK,5)
    a.ellipse(23,-67,9,12,CREAM,INK,2);a.ellipse(26,-65,3,5,INK,"none",0);a.line("M30,-33 Q41,-28 48,-36",INK,2)
    a.path("M-24,4 Q8,17 36,3 L36,13 Q8,29 -24,14 Z",RED,INK,3)
    a.ellipse(10,24,12,12,GOLD,INK,2);a.line("M3,27 h14",INK,2)
    a.pop();a.pop()
def comb(a,x,y,ang):
    a.push(x,y,ang);a.rect(-53,-11,106,18,RED,INK,2.5,4)
    for j in range(12):a.rect(-48+j*8,4,4,25,GOLD,INK,1.3,1)
    a.pop()
def gift(a,x,y,s,c,ang=0):
    a.push(x,y,ang,s);a.rect(-27,-24,54,51,c,INK,3,4);a.rect(-32,-31,64,15,c,INK,3,3);a.rect(-5,-31,10,58,GOLD,"none",0,0);a.path("M0,-32 Q-40,-56 -28,-35 Q-19,-20 0,-32 Q38,-57 28,-34 Q16,-22 0,-32 Z",GOLD,INK,2);a.pop()
def machine(a,x,y,door=0):
    a.push(x,y);a.rect(-128,-153,256,176,"#789d9c",INK,4,15);a.rect(-115,-140,230,148,"#a7c2b5",INK,2,12)
    a.rect(-93,-108,115,87,DARK,INK,3,9);a.rect(-83,-98,95,67,"#3c5360",INK,2,6)
    for j in range(3):a.ellipse(53+j*26,-117,8,8,[RED,GOLD,GREEN][j],INK,2)
    a.rect(50,-82,60,45,CREAM,INK,3,5);a.line("M60,-60 h40",INK,3);a.rect(-144,3,288,18,WOOD,INK,3,4)
    a.pop()
def rocket(a,x,y,ang,flame):
    a.push(x,y,ang)
    if flame>0:
        a.path(f"M-15,45 Q-27,{70+flame*35} 0,{99+flame*65} Q27,{70+flame*35} 15,45 Z",GOLD,INK,3)
        a.path(f"M-7,48 Q-8,{80+flame*30} 0,{80+flame*40} Q8,{80+flame*30} 7,48 Z",RED,"none",0)
    a.path("M-31,48 Q-42,-19 0,-108 Q42,-19 31,48 Z","#d5e3dc",INK,4);a.path("M-23,-45 Q-15,-82 0,-108 Q15,-82 23,-45 Z",RED,INK,3)
    a.ellipse(0,-21,21,23,BLUE,INK,3);a.ellipse(-7,-28,6,8,CREAM,"none",0)
    for sign in [-1,1]:a.poly([(sign*26,4),(sign*51,56),(sign*16,44)],RED,INK,3)
    a.rect(-31,43,62,13,GOLD,INK,2,3);a.pop()
def cheese(a,x,y,ang,checked):
    a.push(x,y,ang);a.poly([(-95,45),(-70,-47),(66,-75),(100,44)],GOLD,INK,4);a.poly([(-95,45),(100,44),(75,66),(-87,68)],"#d99d54",INK,3)
    for j,(xx,yy,r) in enumerate([(-44,-8,12),(5,-37,15),(45,10,11),(-43,29,10),(55,-37,8)]):
        a.ellipse(xx,yy,r,r*.74,"#b57c44",INK,2)
        if j<checked:a.line(f"M{xx-7},{yy} l5,6 l10,-12",GREEN,4)
    a.pop()
def roll(a,x,y,ang,stretch):
    a.path(f"M{x},{y+37} Q{x-70*stretch},{y+44} {x-220*stretch},{y+58} L{x-220*stretch},{y+97} Q{x-100*stretch},{y+91} {x},{y+39} Z",CREAM,INK,2.5)
    for j in range(4):line(a,x-j*53*stretch,y+43+j*5,x-j*53*stretch,y+73+j*5,"#d5cbb9",1.7)
    a.push(x,y,ang);a.rect(-52,-42,104,84,CREAM,INK,3,15);a.ellipse(52,0,19,42,SNOW,INK,3);a.ellipse(52,0,8,17,WOOD,INK,2);a.line("M-38,-25 H29","#d9cbb7",3);a.pop()
def sled(a,x,y,s=1):
    a.push(x,y,0,s);a.path("M-92,12 Q-25,28 59,20 Q90,18 98,-12", "none",DARK,6,False)
    for xx in (-54,48):line(a,xx,-15,xx,20,DARK,5)
    a.path("M-99,-28 Q-40,-14 60,-17 Q84,-27 84,-47 L98,-36 Q96,-10 67,2 H-94 Z",RED,INK,3.5)
    a.line("M-85,-14 Q0,0 65,-6",GOLD,4);a.pop()
def cookie(a,x,y,r=27,ang=0):
    a.push(x,y,ang);a.ellipse(0,0,r,r*.75,"#d5a16c",INK,3)
    for xx,yy in [(-.4,-.12),(.23,-.42),(.42,.24),(-.16,.4)]:a.ellipse(xx*r,yy*r,r*.11,r*.1,"#785046",INK,1)
    a.pop()
def ice(a,x,y,u):
    a.ellipse(x,y+62,86*u+10,13*u+2,"#8cc8d0","#598f9d",2)
    if u>.98:return
    a.push(x,y+61*(u),0,1-u*.62,1-u)
    a.poly([(-64,-63),(28,-80),(67,-44),(67,53),(-22,67),(-64,30)],"#a4dbe0","#4c8ca0",3.5)
    a.poly([(-64,-63),(28,-80),(67,-44),(-22,-30)],"#d6f2e9","#6da7b1",3)
    a.poly([(-22,-30),(67,-44),(67,53),(-22,67)],"#80c1d3","#5b9bac",3)
    a.line("M-51,-50 l17,13",CREAM,4);a.pop()
def safe(a,x,y,u):
    a.push(x,y);a.rect(-119,-141,238,177,"#77949e",INK,4,14);a.rect(-103,-126,206,148,DARK,INK,3,10)
    a.rect(-80,-104,155,105,"#344b55",INK,3,6)
    a.push(-100,-52,0,max(.06,1-u),1)
    a.rect(0,-74,201,148,"#a0babd",INK,4,9);a.rect(18,-57,165,114,"#7f9da5",INK,2,6)
    a.ellipse(62,4,23,23,GOLD,INK,3);line(a,62,-10,62,18,INK,3);line(a,48,4,76,4,INK,3)
    a.rect(108,-40,59,37,DARK,INK,2,4);text(a,138,-32,"37" if u>0 else "00",20,CREAM)
    a.pop();a.pop()
def mouse(a,x,y,s=1):
    a.push(x,y,0,s)
    a.line("M-24,6 Q-70,-4 -68,26 Q-62,36 -50,30","#bd8990",4)
    a.ellipse(0,0,36,24,"#a998ad",INK,3);a.ellipse(23,-12,21,21,"#b9a7b6",INK,3);a.ellipse(16,-29,12,14,"#dfaaa9",INK,2);a.ellipse(35,-18,9,11,CREAM,INK,2);a.ellipse(38,-17,3,4,INK,"none",0);a.ellipse(44,-6,7,6,RED,INK,2)
    for yy in [-10,0,9]:line(a,40,-4,57,yy,INK,1.5)
    a.pop()
def bean(a,x,y,ang,s=1):
    a.push(x,y,ang,s);a.path("M-32,-29 Q-4,-52 24,-32 Q49,-8 18,20 Q-4,40 -25,24 Q-48,4 -26,-7 Q-9,-14 -19,-22 Z",GOLD,INK,3.5);a.line("M-18,-28 Q8,-40 23,-23",CREAM,4);a.pop()
def reward(a,x,y,t,start=.66,end=.83):
    if t<start:return
    u=ease(t,start,end);xx=mix(x,399,u);yy=mix(y,148,u)-math.sin(math.pi*u)*55
    a.star(xx,yy,18+8*u,180*u)
    for j in range(7):
        an=j*math.tau/7+t*7;r=33+5*math.sin(t*15+j);cx=xx+math.cos(an)*r;cy=yy+math.sin(an)*r
        a.line(f"M{cx-4},{cy} h8 M{cx},{cy-4} v8",CREAM,2.4)
def elf(a,t,pose,scale=.85):
    # Keep the entire expressive character, including hat, inside the frame.
    # Scale around the foot anchor; the pose and timing remain unchanged.
    x,y=pose[:2]
    a.push(x*(1-scale),y*(1-scale),0,scale)
    base_elf(a,t,pose)
    a.pop()

def actor(a,t,kind="reach",x=320):
    approach=ease(t,0,.27);act=ease(t,.39,.53);react=ease(t,.53,.64);recover=ease(t,.65,.78)
    xx=mix(x-110,x,approach);yy=431;tilt=7*approach;stretch=1;left=-16;right=65*ease(t,.28,.43);shocked=False
    if kind=="blast":
        xx-=105*react*(1-recover);yy-=67*math.sin(math.pi*react)*(1-recover);tilt-=50*react*(1-recover);stretch=1+.12*math.sin(math.pi*react);shocked=.52<t<.72
        left=-70*react*(1-recover);right+=60*react*(1-recover)
    elif kind=="lift":right=70*act;left=-45*act;tilt=9*math.sin(math.pi*act);yy-=8*math.sin(math.pi*act)
    elif kind=="shake":right=65+20*math.sin(t*65)*act*(1-recover);tilt+=6*math.sin(t*45)*act*(1-recover)
    else:tilt+=8*math.sin(math.pi*act);shocked=.54<t<.63
    if t>.78:left=-68*recover;right=76*recover;tilt*=1-recover
    elf(a,t*9,(xx,yy,tilt,stretch,math.sin(t*90)*(.7 if t<.27 else 0),left,right,shocked,abs(t-.22)<.009 or abs(t-.73)<.009,t>.74))
def frame(n,t):
    a=Art();u=ease(t,.40,.61);v=ease(t,.52,.72);w=ease(t,.26,.45)
    kind="snow" if n in (1,2,7,13,19) else "market" if n in (4,6,14,18,22) else "stall" if n in (11,16,21) else "track" if n==17 else "lab" if n in (8,15) else "work"
    if n==24:return finale(t)
    backdrop(a,kind,t*9);shadow(a,660)
    rx,ry=660,315;act="reach"
    if n==1:
        machine(a,710,405);gear(a,mix(660,625,u),mix(420,275,u)-30*math.sin(math.pi*u),48,280*u);puff(a,490,390,(t-.54)/.22,True);act="blast";rx,ry=625,275
        for j in range(3):gear(a,555+j*24,433,10,0)
    elif n==2:
        snowman(a,672,433,u,8*math.sin(math.pi*v));rx,ry=658,320;act="lift"
    elif n==4:
        sock(a,660,310-35*w,180*u+12*math.sin(t*52)*v*(1-ease(t,.65,.75)));puff(a,665,330,(t-.54)/.23);rx,ry=662,348;act="shake"
    elif n==5:
        mirror(a,660,290,360*u,u>.5);rx,ry=660,280
    elif n==6:
        boot(a,657,315,180*u);act="shake"
        for j in range(5):
            q=ease(t,.52+j*.012,.76);a.ellipse(650+(j-2)*23*q,330+q*107-50*math.sin(q*math.pi),10,7,WOOD,INK,2)
        rx,ry=657,349
    elif n==7:
        for j in range(4):a.ellipse(537+j*51,426+(j%2)*7,10,7,WOOD,INK,2)
        a.line("M730,125 Q659,172 659,227",CREAM,2)
        spider(a,mix(760,640,u),mix(225,366,u),t);rx,ry=640,363
    elif n==8:
        pot(a,657,343,u,t*9);act="lift"
        for j,c in enumerate([BLUE,GOLD]):
            xx=565+j*183;yy=212-36*w;bottle(a,xx,yy,c,(-1 if j else 1)*55*u)
            if .40<t<.62:
                for i in range(5):
                    q=(t*8+i*.21)%1;a.ellipse(mix(xx,657,q),yy+q*115,5,8,c,INK,1)
        puff(a,670,300,(t-.51)/.23);rx,ry=657,313
    elif n==9:
        clock(a,660,310,u);puff(a,660,232,(t-.54)/.19);act="blast";rx,ry=660,310
    elif n==10:
        which=int(t*9)%3 if t<.47 else 0;signal(a,690,276,which)
        a.push(609,369,-85*u);a.rect(-8,-7,147,16,RED,INK,3,4)
        for j in range(4):a.rect(5+j*34,-7,16,16,CREAM,"none",0,0)
        a.pop();rx,ry=690,379
    elif n==11:
        deer(a,704,431,1.12,-1,35*math.sin(t*48)*u,12*v);comb(a,mix(558,810,w),mix(305,347,w)+12*math.sin(t*55)*v,12*math.sin(t*52)*u);act="shake";rx,ry=792,348
    elif n==12:
        machine(a,700,406)
        for j,c in enumerate([RED,GREEN,BLUE]):
            q=ease(t,.44+j*.065,.66+j*.06);gift(a,690+(j-1)*76*q,330+q*91-55*math.sin(math.pi*q),.87,c,170*q if j==2 else 0)
        rx,ry=700,342
    elif n==13:
        rocket(a,660,320-390*v,-32*(1-u),1 if .53<t<.83 else 0);puff(a,665,386,(t-.52)/.23,True);act="blast";rx,ry=660,320
    elif n==14:
        cheese(a,663,317,360*u,min(5,2+int(3*ease(t,.3,.57))));rx,ry=660,318
    elif n==15:
        roll(a,660+125*u,356,430*u,u);act="shake";rx,ry=687,358
        if t<.62:
            for j in range(3):a.rect(263,340+j*19,112,13,CREAM,INK,1.5,3)
    elif n==16:
        deer(a,584-100*u,434,.84,-1,15*v);deer(a,735+100*u,434,.84,1,-15*v)
        puff(a,748,393,(t-.50)/.18);rx,ry=659,396
    elif n==17:
        pos=mix(240,849,u);sled(a,pos,427,1.1);puff(a,pos-60,409,(t-.46)/.27,True)
        elf(a,t*9,(pos-15,395-25*math.sin(math.pi*u),-10,1,0,-50,70,.48<t<.68,False,t>.7));reward(a,849,402,t);return a
    elif n==18:
        for j in range(4):
            q=ease(t,.43+j*.025,.74);cookie(a,660+(j-1.5)*48*q,365-j*24+q*(60+j*24)-65*math.sin(math.pi*q),33,180*q)
        puff(a,680,369,(t-.57)/.17);rx,ry=660,405
    elif n==19:
        a.ellipse(829,430,47,12,"#dfcf82","#bdab6c",2);ice(a,660,349,u);a.push(774,247,-22);a.path("M-40,-16 H40 L64,35 H-64 Z",GOLD,INK,3);a.pop()
        for j in range(4):line(a,714+j*18,278,675+j*11,314,"#e8ba6c",3)
        rx,ry=660,390
    elif n==20:
        safe(a,667,394,u);rx,ry=667,344
    elif n==21:
        deer(a,660,434,1.22,1,40*math.sin(t*55)*u*(1-v),20*math.sin(t*55)*u*(1-v));rx,ry=733,334
        if .45<t<.70:
            for j in range(3):a.line(f"M{764+j*9},301 q14,12 0,24",GOLD,3)
    elif n==22:
        xx=mix(820,570,u);mouse(a,xx,425,1.1);a.star(xx-5,390,14,0);rx,ry=570,390
    elif n==23:
        machine(a,701,410);bean(a,700,200+136*u,170*u,1.1-.45*u);puff(a,700,290,(t-.61)/.19);act="lift";rx,ry=700,333
    actor(a,t,act,315 if n!=16 else 268);reward(a,rx,ry,t)
    return a
def finale(t):
    a=Art()
    if t<.35:
        u=t/.35;backdrop(a,"work",t*22);machine(a,665,407)
        for j in range(23):
            an=j*math.tau/24;a.star(660+88*math.cos(an),293+65*math.sin(an),8,0)
        a.star(mix(399,660,ease(u,.35,.8)),mix(170,293,ease(u,.35,.8)),22,180*u)
        actor(a,u,"lift",325)
    elif t<.71:
        u=(t-.35)/.36;backdrop(a,"snow",t*22)
        x=mix(135,700,smooth(u));y=410-190*smooth(u)
        sled(a,x,y,1.12);deer(a,x+144,y-4,.68,1,15*math.sin(u*35),5*math.sin(u*42))
        elf(a,u*9,(x-15,y-29,-10,1,0,-65,60,False,False,True),scale=.48)
        puff(a,x-70,y-5,(u-.10)/.62,True)
        for j in range(9):
            q=clamp(u*1.5-j*.08);a.star(x-j*48,y+25+math.sin(j)*19,9+6*q,j*20)
    else:
        u=(t-.71)/.29;backdrop(a,"final",t*22)
        for j in range(24):
            row=j//8;col=j%8;cottage(a,70+col*117,315+row*57,.68,j<math.ceil(u*32))
        for j in range(24):
            q=clamp(u*1.5-j*.021)
            if q>0:
                an=j*2.39996;a.star(480+math.cos(an)*(90+q*340),112+math.sin(an)*(26+q*57),8+8*q,180*q)
        a.star(480,70,31+5*math.sin(u*10),0)
    return a
def render(n,work):
    secs=DURS[n];dest=OUT/f"chapter-{n:02}.mp4";p=work/f"{n:02}";p.mkdir(parents=True,exist_ok=True)
    frames=secs*12
    for i in range(frames):
        a=frame(n,i/(frames-1));cairosvg.svg2png(bytestring=a.svg().encode(),write_to=str(p/f"f{i:04}.png"))
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-framerate","12","-i",str(p/"f%04d.png"),"-c:v","libx264","-threads","2","-vf","fps=24,format=yuv420p","-crf","19","-movflags","+faststart",str(dest)],check=True)
    probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration:stream=codec_name,width,height","-of","json",str(dest)]))
    assert abs(float(probe["format"]["duration"])-secs)<.1 and probe["streams"][0]["codec_name"]=="h264"
    assert 10000<dest.stat().st_size<12*1024*1024
    (OUT/f"chapter-{n:02}-style.svg").write_text(frame(n,.58).svg())
    print("VALIDATED_CARTOON",n,secs,dest.stat().st_size,flush=True)
    shutil.rmtree(p)
    return {"day":n,"file":dest.name,"audio":"app","approved":True,"seconds":secs,"bytes":dest.stat().st_size}
if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--days",required=True);parser.add_argument("--check",action="store_true");args=parser.parse_args();days=[int(x) for x in args.days.split(",")]
    if args.check:
        for n in days:
            for t in (0,.45,.58,.85,1):assert len(frame(n,t).shapes)>40
        print("ALL DRAWINGS CHECKED",days)
    else:
        results=[render(n,OUT/"work") for n in days];(OUT/"batch.json").write_text(json.dumps(results))
