'use strict';

(() => {
  const STAGES=Object.freeze([
    {level:1,label:'Grundausrüstung'},
    {level:2,label:'Lederzeug'},
    {level:3,label:'Ritterlehrling'},
    {level:4,label:'Ritter'},
    {level:5,label:'Kronritter'},
    {level:6,label:'König'}
  ]);

  function foxSvg(stage=1,opts={}){
    const level=Math.max(1,Math.min(6,Number(stage)||1));
    const mini=!!opts.mini;
    const leather=level>=2,apprentice=level>=3,knight=level>=4,crownKnight=level>=5,king=level>=6;
    const parts=[];
    parts.push('<svg class="wordrealm-fox-svg '+(mini?'mini':'')+'" viewBox="0 0 220 255" role="img" aria-label="'+STAGES[level-1].label+'">');
    parts.push('<defs><linearGradient id="fur-'+level+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f58a2e"/><stop offset="1" stop-color="#c95722"/></linearGradient><linearGradient id="cream-'+level+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff1cf"/><stop offset="1" stop-color="#e8cfa3"/></linearGradient></defs>');
    parts.push('<ellipse cx="109" cy="230" rx="66" ry="13" fill="rgba(56,39,25,.16)"/>');
    if(crownKnight)parts.push('<path d="M69 126q-19 33-24 88 30 20 48 0l4-75z" fill="'+(king?'#b62636':'#b93643')+'" stroke="#7a2330" stroke-width="4"/>');
    parts.push('<path d="M72 190q-37 5-47-28 14-21 38-5 18 12 24 31z" fill="url(#fur-'+level+')" stroke="#9c3f1d" stroke-width="4"/><path d="M31 163q13-11 31-3-8 13-24 18z" fill="url(#cream-'+level+')"/>');
    parts.push('<path d="M78 181q-7 31 4 48h22l5-43zM137 181q7 31-4 48h-22l-5-43z" fill="#68432e" stroke="#493024" stroke-width="4"/>');
    parts.push('<path d="M76 113q31-22 63 0l2 78q-30 24-67 0z" fill="url(#fur-'+level+')" stroke="#a13f1b" stroke-width="4"/>');
    if(knight){
      parts.push('<path d="M74 120q34-24 68 0l-5 74H78z" fill="'+(crownKnight?'#88613a':'#9aa4aa')+'" stroke="'+(crownKnight?'#d7a63a':'#59636a')+'" stroke-width="4"/>');
      parts.push('<path d="M80 132h56M83 151h50M86 170h44" stroke="'+(crownKnight?'#d9b45e':'#69747a')+'" stroke-width="5" opacity=".8"/>');
      parts.push('<path d="M77 124l-18 15 14 20 14-17zM139 124l18 15-14 20-14-17z" fill="'+(crownKnight?'#c18b31':'#7f8a90')+'" stroke="#59636a" stroke-width="3"/>');
    }else if(apprentice){
      parts.push('<path d="M76 119q32-18 64 0l-5 72H80z" fill="#315b95" stroke="#213d66" stroke-width="4"/><path d="M107 125l6 10 11 2-8 8 2 11-11-5-10 5 2-11-8-8 11-2z" fill="#f0c24d"/>');
    }else if(leather){
      parts.push('<path d="M78 121q30-17 60 0l-5 67H82z" fill="#7e5434" stroke="#4d3525" stroke-width="4"/><path d="M84 131l48 45M132 131l-48 45" stroke="#b98452" stroke-width="7"/>');
    }
    if(king){
      parts.push('<path d="M62 127q47-30 92 0l-6 91q-42 25-82 0z" fill="#b72b3b" stroke="#7e1d29" stroke-width="4"/><path d="M64 127q44-20 88 0l-8 18q-36-13-72 0z" fill="#f4ead8" stroke="#bda98b" stroke-width="3"/><circle cx="78" cy="134" r="3" fill="#2b2731"/><circle cx="93" cy="131" r="3" fill="#2b2731"/><circle cx="123" cy="131" r="3" fill="#2b2731"/><circle cx="139" cy="135" r="3" fill="#2b2731"/>');
    }
    parts.push('<path d="M72 118q35 17 70 0" fill="none" stroke="#a41f29" stroke-width="14" stroke-linecap="round"/><path d="M77 119q-10 12-16 30" fill="none" stroke="#d33a46" stroke-width="11" stroke-linecap="round"/>');
    parts.push('<path d="M64 73L80 33l22 31zM118 64l22-31 13 42z" fill="url(#fur-'+level+')" stroke="#9c3f1d" stroke-width="4"/><path d="M74 64l8-20 12 17zM126 59l13-17 7 23z" fill="#f5c7a2"/>');
    parts.push('<path d="M67 69q42-31 84 2l-5 50q-38 31-77 0z" fill="url(#fur-'+level+')" stroke="#9c3f1d" stroke-width="4"/>');
    if(knight&&!king){
      parts.push('<path d="M78 76q30-31 60 0l-5 25H83z" fill="#9ca7ad" stroke="#59636a" stroke-width="4"/><path d="M84 79q24-18 48 0" fill="none" stroke="#cbd3d7" stroke-width="6"/>');
      if(crownKnight)parts.push('<path d="M94 68l13-10 13 10-2 13H96z" fill="#d8aa3f" stroke="#8a651f" stroke-width="3"/>');
    }
    parts.push('<path d="M76 98q13-21 31-4 16-17 32 4-2 27-31 31-29-4-32-31z" fill="url(#cream-'+level+')"/><ellipse cx="92" cy="87" rx="8" ry="11" fill="#281d18"/><ellipse cx="125" cy="87" rx="8" ry="11" fill="#281d18"/><circle cx="95" cy="83" r="2.7" fill="#fff"/><circle cx="128" cy="83" r="2.7" fill="#fff"/><path d="M102 101q7-7 14 0-2 8-7 8t-7-8z" fill="#33231b"/><path d="M97 112q12 12 24 0" fill="none" stroke="#6f3827" stroke-width="3" stroke-linecap="round"/>');
    if(leather){
      parts.push('<g transform="translate('+(apprentice?'141':'145')+' 141) scale('+(apprentice?'.78':'.68')+')"><path d="M0 0c18 4 34 4 52 0v39c0 31-22 48-26 50C22 87 0 70 0 39z" fill="'+(apprentice?'#375f9b':'#8b6741')+'" stroke="'+(apprentice?'#e8b84f':'#5f4329')+'" stroke-width="5"/>');
      if(apprentice)parts.push('<path d="M12 21h28l-5 13 5 15H12l5-15z" fill="#f4c84e"/><circle cx="26" cy="36" r="6" fill="#f6d86f"/>');
      else parts.push('<circle cx="26" cy="38" r="11" fill="#b9a17d" stroke="#5f4329" stroke-width="3"/>');
      parts.push('</g>');
    }
    const swordColor=apprentice?'#c7d0d5':'#b98348',swordEdge=apprentice?'#66737a':'#7a4f2e';
    parts.push('<g transform="rotate('+(king?'-7':knight?'-3':'8')+' 151 142)"><rect x="149" y="83" width="8" height="96" rx="4" fill="'+swordColor+'" stroke="'+swordEdge+'" stroke-width="3"/><path d="M153 61l9 25h-18z" fill="'+(apprentice?'#e8eef1':'#c99657')+'" stroke="'+swordEdge+'" stroke-width="3"/><rect x="136" y="164" width="35" height="7" rx="4" fill="'+(king?'#d7a73b':'#704a2d')+'"/><rect x="148" y="170" width="10" height="26" rx="4" fill="#5c3c28"/></g>');
    if(king){
      parts.push('<g transform="translate(0 -4)"><path d="M84 39l11 11 13-21 14 21 12-11 6 30H78z" fill="#f6c84b" stroke="#8a5b16" stroke-width="3"/><circle cx="95" cy="49" r="3" fill="#8b5cf6"/><circle cx="121" cy="49" r="3" fill="#c43f5e"/></g>');
    }
    parts.push('</svg>');
    return parts.join('');
  }

  function castleSvg(){
    const trees=[];
    for(let i=0;i<14;i+=1){
      const x=28+i*58,y=388+(i%3)*16,h=58+(i%4)*9;
      trees.push('<path d="M'+x+' '+y+'l18 -'+h+' 18 '+h+'z" fill="'+(i%2?'#365e40':'#486f48')+'"/><path d="M'+(x+4)+' '+(y-18)+'l14 -'+(h*.72)+' 14 '+(h*.72)+'z" fill="#5b8151"/>');
    }
    return '<svg class="wordrealm-scenery-svg" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="wordrealm-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#bfe1f2"/><stop offset="1" stop-color="#f7e6b9"/></linearGradient><linearGradient id="wordrealm-hill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6f8d59"/><stop offset="1" stop-color="#466b48"/></linearGradient></defs><rect width="900" height="520" fill="url(#wordrealm-sky)"/><path d="M0 270L120 155l78 60 115-112 98 114 120-96 115 110 116-79 138 124v244H0z" fill="#8ca79d" opacity=".55"/><path d="M0 335q160-90 330-12t570-18v215H0z" fill="#7fa060"/><path d="M0 393q180-62 363-3t537-10v140H0z" fill="url(#wordrealm-hill)"/><path d="M357 520q75-119 185-127t206 127z" fill="#cfb887" opacity=".7"/><g transform="translate(555 128)"><rect x="45" y="104" width="190" height="147" rx="8" fill="#c9c0a8" stroke="#807865" stroke-width="6"/><rect x="74" y="52" width="48" height="199" fill="#d7ceb8" stroke="#807865" stroke-width="6"/><rect x="163" y="31" width="49" height="220" fill="#d7ceb8" stroke="#807865" stroke-width="6"/><path d="M69 52l29-47 29 47zM158 31l30-49 30 49z" fill="#6b5aa7" stroke="#493a78" stroke-width="5"/><rect x="128" y="128" width="34" height="123" fill="#d7ceb8" stroke="#807865" stroke-width="6"/><path d="M123 128l22-36 22 36z" fill="#6b5aa7" stroke="#493a78" stroke-width="5"/><path d="M132 176h26v75h-26z" fill="#5c483a"/><path d="M87 87h22v37H87zM176 70h22v37h-22z" fill="#53616e"/><path d="M90 123h18l-3 30H93zM179 106h18l-3 30h-12z" fill="#6f45b8"/><path d="M94 129l5 6 5-6v14H94zM183 112l5 6 5-6v14h-10z" fill="#f1c64c"/><path d="M190 0v-27" stroke="#805b2e" stroke-width="5"/><path d="M190-27l35 10-35 11z" fill="#f6a429"/></g><path d="M0 460q145-54 269-22t244 7q85-17 183-2t204-5v82H0z" fill="#55794d"/><path d="M316 446q42 16 81 0t76-5q38 14 82 0" fill="none" stroke="#8fd2e6" stroke-width="18" opacity=".8"/>'+trees.join('')+'</svg>';
  }

  function stageStrip(activeLevel=1){
    const level=Math.max(1,Math.min(6,Number(activeLevel)||1));
    return STAGES.map(stage=>'<div class="wordrealm-stage-tile '+(stage.level===level?'active ':'')+(stage.level<level?'done':'')+'" data-wordrealm-stage="'+stage.level+'" aria-current="'+(stage.level===level?'step':'false')+'"><div class="wordrealm-stage-fox">'+foxSvg(stage.level,{mini:true})+'</div><b>'+stage.level+'</b><span>'+stage.label+'</span></div>').join('');
  }

  function renderHome(level=1){
    const frame=document.querySelector('#projectMenuAvatarFrame');
    const fallback=document.querySelector('#projectMenuAvatarFallback');
    const scenery=document.querySelector('#projectMenuScenery');
    const strip=document.querySelector('#wordrealmStageStrip');
    const brand=document.querySelector('#wordrealmHomeBrand');
    if(frame&&fallback){
      fallback.innerHTML=foxSvg(level);
      fallback.classList.add('wordrealm-svg-avatar');
      frame.classList.add('wordrealm-rendered');
    }
    if(scenery)scenery.innerHTML=castleSvg()+'<span class="wordrealm-sun"></span><span class="wordrealm-cloud cloud-one"></span><span class="wordrealm-cloud cloud-two"></span>';
    if(strip){strip.innerHTML=stageStrip(level);strip.classList.remove('hidden')}
    brand?.classList.remove('hidden');
  }

  function clearHome(){
    const frame=document.querySelector('#projectMenuAvatarFrame');
    const fallback=document.querySelector('#projectMenuAvatarFallback');
    const scenery=document.querySelector('#projectMenuScenery');
    const strip=document.querySelector('#wordrealmStageStrip');
    const brand=document.querySelector('#wordrealmHomeBrand');
    if(frame)frame.classList.remove('wordrealm-rendered');
    if(fallback){
      fallback.classList.remove('wordrealm-svg-avatar');
      fallback.innerHTML='<span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-shield">V</span>';
    }
    if(scenery)scenery.innerHTML='<span class="project-menu-cloud cloud-a"></span><span class="project-menu-cloud cloud-b"></span><span class="project-menu-castle"><i></i><i></i><i></i></span>';
    if(strip){strip.innerHTML='';strip.classList.add('hidden')}
    brand?.classList.add('hidden');
  }

  window.VTWordrealmUi={STAGES,foxSvg,castleSvg,stageStrip,renderHome,clearHome};
})();