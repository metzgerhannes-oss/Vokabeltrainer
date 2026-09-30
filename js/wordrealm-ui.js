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

  let svgSerial=0;

  const ADVENTURE_STAGES=Object.freeze([
    {level:1,label:'Wegstarter'},
    {level:2,label:'Spurensucher'},
    {level:3,label:'Pfadfinder'},
    {level:4,label:'Wortentdecker'},
    {level:5,label:'Wissensreisender'},
    {level:6,label:'Meisterentdecker'}
  ]);

  function foxSvg(stage=1,opts={}){
    const level=Math.max(1,Math.min(6,Number(stage)||1));
    const mini=!!opts.mini;
    const leather=level>=2,apprentice=level>=3,knight=level>=4,crownKnight=level>=5,king=level>=6;
    const parts=[],svgKey='wr-'+level+'-'+(++svgSerial),furId=svgKey+'-fur',creamId=svgKey+'-cream';
    parts.push('<svg class="wordrealm-fox-svg '+(mini?'mini':'')+'" viewBox="0 0 220 255" role="img" aria-label="'+STAGES[level-1].label+'">');
    parts.push('<defs><linearGradient id="'+furId+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f58a2e"/><stop offset="1" stop-color="#c95722"/></linearGradient><linearGradient id="'+creamId+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff1cf"/><stop offset="1" stop-color="#e8cfa3"/></linearGradient></defs>');
    parts.push('<ellipse cx="109" cy="230" rx="66" ry="13" fill="rgba(56,39,25,.16)"/>');
    if(crownKnight)parts.push('<path d="M69 126q-19 33-24 88 30 20 48 0l4-75z" fill="'+(king?'#b62636':'#b93643')+'" stroke="#7a2330" stroke-width="4"/>');
    parts.push('<path d="M72 190q-37 5-47-28 14-21 38-5 18 12 24 31z" fill="url(#'+furId+')" stroke="#9c3f1d" stroke-width="4"/><path d="M31 163q13-11 31-3-8 13-24 18z" fill="url(#'+creamId+')"/>');
    parts.push('<path d="M78 181q-7 31 4 48h22l5-43zM137 181q7 31-4 48h-22l-5-43z" fill="#68432e" stroke="#493024" stroke-width="4"/>');
    parts.push('<path d="M76 113q31-22 63 0l2 78q-30 24-67 0z" fill="url(#'+furId+')" stroke="#a13f1b" stroke-width="4"/>');
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
    parts.push('<path d="M64 73L80 33l22 31zM118 64l22-31 13 42z" fill="url(#'+furId+')" stroke="#9c3f1d" stroke-width="4"/><path d="M74 64l8-20 12 17zM126 59l13-17 7 23z" fill="#f5c7a2"/>');
    parts.push('<path d="M67 69q42-31 84 2l-5 50q-38 31-77 0z" fill="url(#'+furId+')" stroke="#9c3f1d" stroke-width="4"/>');
    if(knight&&!king){
      parts.push('<path d="M78 76q30-31 60 0l-5 25H83z" fill="#9ca7ad" stroke="#59636a" stroke-width="4"/><path d="M84 79q24-18 48 0" fill="none" stroke="#cbd3d7" stroke-width="6"/>');
      if(crownKnight)parts.push('<path d="M94 68l13-10 13 10-2 13H96z" fill="#d8aa3f" stroke="#8a651f" stroke-width="3"/>');
    }
    parts.push('<path d="M76 98q13-21 31-4 16-17 32 4-2 27-31 31-29-4-32-31z" fill="url(#'+creamId+')"/><ellipse cx="92" cy="87" rx="8" ry="11" fill="#281d18"/><ellipse cx="125" cy="87" rx="8" ry="11" fill="#281d18"/><circle cx="95" cy="83" r="2.7" fill="#fff"/><circle cx="128" cy="83" r="2.7" fill="#fff"/><path d="M102 101q7-7 14 0-2 8-7 8t-7-8z" fill="#33231b"/><path d="M97 112q12 12 24 0" fill="none" stroke="#6f3827" stroke-width="3" stroke-linecap="round"/>');
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

  function adventureFoxSvg(stage=1,opts={}){
    const level=Math.max(1,Math.min(6,Number(stage)||1)),mini=!!opts.mini,parts=[];
    const key='adv-'+level+'-'+(++svgSerial);
    const fur=key+'-fur',furShade=key+'-fur-shade',cream=key+'-cream',cloth=key+'-cloth',paper=key+'-paper',gold=key+'-gold',shadow=key+'-shadow';
    parts.push('<svg class="wordrealm-fox-svg adventure '+(mini?'mini':'')+'" viewBox="0 0 260 300" role="img" aria-label="'+ADVENTURE_STAGES[level-1].label+'">');
    parts.push('<defs>'+
      '<linearGradient id="'+fur+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6a14c"/><stop offset=".42" stop-color="#df762e"/><stop offset="1" stop-color="#a94424"/></linearGradient>'+
      '<linearGradient id="'+furShade+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#c85d28"/><stop offset="1" stop-color="#7c3725"/></linearGradient>'+
      '<linearGradient id="'+cream+'" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff8e7"/><stop offset=".62" stop-color="#efdbba"/><stop offset="1" stop-color="#cfaa78"/></linearGradient>'+
      '<linearGradient id="'+cloth+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+(level>=5?'#738b6a':'#6d8275')+'"/><stop offset="1" stop-color="'+(level>=5?'#405e4d':'#405c55')+'"/></linearGradient>'+
      '<linearGradient id="'+paper+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff9e9"/><stop offset="1" stop-color="#dbcba8"/></linearGradient>'+
      '<linearGradient id="'+gold+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f6da7e"/><stop offset=".55" stop-color="#c79b3b"/><stop offset="1" stop-color="#846129"/></linearGradient>'+
      '<filter id="'+shadow+'" x="-35%" y="-35%" width="170%" height="190%"><feDropShadow dx="0" dy="9" stdDeviation="7" flood-color="#4c3d2f" flood-opacity=".19"/></filter>'+
      '</defs>');

    parts.push('<ellipse cx="124" cy="274" rx="76" ry="12" fill="rgba(72,73,48,.12)"/>');

    // Ruhige, natürlichere Silhouette: Schwanz und Körper ohne harte Comic-Outlines.
    parts.push('<path d="M79 220c-38 9-64-7-67-34-3-27 21-47 47-37 25 9 40 35 40 59-4 6-11 10-20 12z" fill="url(#'+fur+')" stroke="rgba(117,55,30,.34)" stroke-width="2.1" filter="url(#'+shadow+')"/>'+
      '<path d="M21 179c17-17 37-18 57-3-8 17-27 31-51 31-8-8-10-18-6-28z" fill="url(#'+cream+')" opacity=".96"/>');

    // Beine / Pfoten.
    parts.push('<path d="M91 213c-6 25-5 42 2 55h26l4-52zM151 213c7 25 6 42-1 55h-26l-3-52z" fill="url(#'+furShade+')" opacity=".92"/>'+
      '<path d="M86 262h34v11H88c-8 0-9-8-2-11zM146 262h31c8 3 7 11 0 11h-33z" fill="#55483a" opacity=".9"/>');

    // Körper und helles Brustfell; keine Uniform als Grundlook.
    parts.push('<path d="M84 132c27-18 57-18 84 1l-5 86c-23 19-53 22-84 3z" fill="url(#'+fur+')" stroke="rgba(117,55,30,.28)" stroke-width="2.2"/>'+
      '<path d="M101 142c13-10 36-10 49 0l-6 58c-12 14-27 18-43 7z" fill="url(#'+cream+')" opacity=".94"/>');

    // Ruhiger roter Schal als Wiedererkennungsmerkmal.
    parts.push('<path d="M80 137c28 15 61 15 91-1" fill="none" stroke="#a84043" stroke-width="12" stroke-linecap="round" opacity=".94"/>'+
      '<path d="M88 140c-10 13-14 25-16 40" fill="none" stroke="#c95050" stroke-width="9" stroke-linecap="round" opacity=".94"/>');

    // Kopf mit weicheren Proportionen und kleinerer, aufmerksamer Mimik.
    parts.push('<path d="M72 76l17-47 29 36zM139 64l29-35 13 49z" fill="url(#'+fur+')" stroke="rgba(117,55,30,.30)" stroke-width="2"/>'+
      '<path d="M83 63l7-21 15 20zM151 61l15-19 7 25z" fill="#e9aa90" opacity=".78"/>');
    parts.push('<path d="M72 77c27-23 76-23 105 1l-5 54c-27 29-72 31-101 1z" fill="url(#'+fur+')" stroke="rgba(117,55,30,.28)" stroke-width="2.2" filter="url(#'+shadow+')"/>'+
      '<path d="M85 103c10-18 25-21 39-10 14-11 30-8 40 11-4 23-20 37-40 39-20-1-36-15-39-40z" fill="url(#'+cream+')"/>');
    parts.push('<path d="M90 87c7-4 15-5 22-2M138 85c8-3 16-1 22 3" fill="none" stroke="rgba(92,49,31,.55)" stroke-width="2.6" stroke-linecap="round"/>'+
      '<ellipse cx="102" cy="94" rx="5.8" ry="8.2" fill="#2c2722"/><ellipse cx="149" cy="94" rx="5.8" ry="8.2" fill="#2c2722"/>'+
      '<circle cx="104" cy="91" r="2" fill="#fff"/><circle cx="151" cy="91" r="2" fill="#fff"/>'+
      '<path d="M118 111c4-4 9-4 13 0-1 6-4 8-6 8-3 0-6-2-7-8z" fill="#372a23"/>'+
      '<path d="M114 125c7 5 15 5 22 0" fill="none" stroke="rgba(91,55,38,.62)" stroke-width="2.2" stroke-linecap="round"/>');
    parts.push('<path d="M82 80c11-18 27-27 45-28 18 1 34 10 44 28" fill="none" stroke="rgba(255,205,130,.30)" stroke-width="5" stroke-linecap="round"/>'+
      '<path d="M78 112c-13 1-22 4-31 9M79 120c-14 4-22 9-29 15M169 112c13 1 22 4 31 9M168 120c14 4 22 9 29 15" fill="none" stroke="rgba(96,72,52,.28)" stroke-width="1.4" stroke-linecap="round"/>');

    // Lern-/Entdeckerausrüstung wächst ruhig mit, ohne Kampfmetapher.
    if(level>=2){
      parts.push('<path d="M95 147c17 22 38 42 61 62" fill="none" stroke="#7c5c3e" stroke-width="6" stroke-linecap="round" opacity=".86"/>'+
        '<rect x="150" y="193" width="40" height="36" rx="9" fill="#a47b4f" stroke="rgba(92,62,39,.48)" stroke-width="2"/>'+
        '<path d="M158 202h24M170 194v33" stroke="#d7b984" stroke-width="2" opacity=".8"/>');
      parts.push('<g transform="translate(62 186) rotate(-8)"><rect width="42" height="15" rx="7" fill="url(#'+paper+')" stroke="rgba(107,82,52,.42)" stroke-width="1.6"/><circle cx="5" cy="7.5" r="5.5" fill="#bd8758"/><circle cx="37" cy="7.5" r="5.5" fill="#bd8758"/></g>');
    }
    if(level>=3){
      parts.push('<circle cx="127" cy="183" r="15" fill="url(#'+gold+')" stroke="rgba(112,81,31,.55)" stroke-width="2"/>'+
        '<circle cx="127" cy="183" r="8.5" fill="#fff2c8" opacity=".92"/>'+
        '<path d="M127 176l4 7-4 8-4-8z" fill="#476b5b"/><circle cx="127" cy="183" r="2" fill="#fff"/>');
    }
    if(level>=4){
      parts.push('<g transform="translate(166 144) rotate(6)" filter="url(#'+shadow+')"><rect width="52" height="68" rx="7" fill="url(#'+paper+')" stroke="rgba(117,88,52,.45)" stroke-width="2"/>'+
        '<path d="M11 16h30M11 28h23M11 40h31M11 52h19" stroke="#81936d" stroke-width="2.4" opacity=".75"/>'+
        '<path d="M35 13c5 8 6 16 1 25" fill="none" stroke="#c77b51" stroke-width="2.2"/></g>');
    }
    if(level>=5){
      parts.push('<path d="M81 145c-17 36-20 77-13 104 20 13 37 7 50-8l3-77z" fill="url(#'+cloth+')" stroke="rgba(46,74,57,.35)" stroke-width="2.2" opacity=".94"/>'+
        '<path d="M86 151c13 6 24 7 35 4" fill="none" stroke="#d5bd78" stroke-width="3.2" opacity=".8"/>'+
        '<circle cx="128" cy="154" r="5.5" fill="#d7bd72" stroke="rgba(103,80,38,.46)" stroke-width="1.5"/>');
    }
    if(level>=6){
      parts.push('<g transform="translate(128 66)" filter="url(#'+shadow+')"><circle r="18" fill="url(#'+gold+')" stroke="rgba(108,79,26,.5)" stroke-width="2"/>'+
        '<path d="M0-10l4 7 8 1-6 5 2 8-8-4-7 4 2-8-6-5 8-1z" fill="#fff1b8"/>'+
        '<circle r="3.2" fill="#6f8c72"/></g>'+
        '<path d="M95 143c22-11 44-11 66 0" fill="none" stroke="#e1bf67" stroke-width="3" opacity=".72"/>');
    }

    parts.push('</svg>');
    return parts.join('');
  }

  function adventureScenerySvg(level=1){
    const active=Math.max(1,Math.min(6,Number(level)||1));
    const stations=[
      {x:455,y:362,label:'A'},
      {x:565,y:323,label:'M'},
      {x:670,y:281,label:'Aa'},
      {x:770,y:232,label:'Wort'}
    ];
    const stationMarkup=stations.map((s,i)=>{
      const reached=i<Math.min(4,active);
      return '<g transform="translate('+s.x+' '+s.y+')" opacity="'+(reached?'1':'.72')+'">'+
        '<rect x="-28" y="-29" width="56" height="42" rx="8" fill="'+(reached?'#f8edcf':'#eee7d7')+'" stroke="rgba(120,91,51,.35)" stroke-width="2"/>'+
        '<path d="M0 13v34" stroke="#88633d" stroke-width="6" stroke-linecap="round"/>'+
        '<path d="M-17 47h34" stroke="#6d5136" stroke-width="5" stroke-linecap="round"/>'+
        '<text x="0" y="-2" text-anchor="middle" font-family="Georgia,serif" font-size="'+(s.label.length>2?'13':'18')+'" font-weight="700" fill="'+(reached?'#536a49':'#858174')+'">'+s.label+'</text>'+
        '</g>';
    }).join('');
    return '<svg class="german-adventure-scenery-svg" viewBox="0 0 900 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+
      '<defs>'+
        '<linearGradient id="adv-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#eef5ec"/><stop offset=".64" stop-color="#f7efd9"/><stop offset="1" stop-color="#e6d3ae"/></linearGradient>'+
        '<linearGradient id="adv-hill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#9fb58a"/><stop offset="1" stop-color="#6f8e68"/></linearGradient>'+
        '<linearGradient id="adv-meadow" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a9bf8a"/><stop offset="1" stop-color="#7a996c"/></linearGradient>'+
        '<filter id="adv-soft"><feGaussianBlur stdDeviation="1.8"/></filter>'+
      '</defs>'+
      '<rect width="900" height="520" fill="url(#adv-sky)"/>'+
      '<circle cx="740" cy="92" r="76" fill="#fff4c6" opacity=".72" filter="url(#adv-soft)"/>'+
      '<path d="M0 300Q110 205 220 272T450 244T680 258T900 216V520H0Z" fill="#b8c7a3" opacity=".58"/>'+
      '<path d="M0 352Q132 274 282 329T540 315T900 286V520H0Z" fill="url(#adv-hill)"/>'+
      '<path d="M0 418Q145 350 294 403T567 389T900 354V520H0Z" fill="url(#adv-meadow)"/>'+
      '<path d="M264 520C320 468 372 445 430 427C529 396 608 370 674 327C734 288 788 253 862 228" fill="none" stroke="#f5e8c8" stroke-width="64" stroke-linecap="round" opacity=".94"/>'+
      '<path d="M264 520C320 468 372 445 430 427C529 396 608 370 674 327C734 288 788 253 862 228" fill="none" stroke="#c7b48e" stroke-width="3" stroke-dasharray="10 16" opacity=".52"/>'+
      '<g opacity=".52"><path d="M70 365l28-88 28 88zM112 372l25-74 25 74zM184 352l29-92 29 92zM234 372l24-72 24 72z" fill="#53765b"/><path d="M21 392l25-72 25 72zM302 364l23-67 23 67z" fill="#668867"/></g>'+
      stationMarkup+
      '<g transform="translate(790 154)" opacity=".92"><rect x="0" y="36" width="82" height="72" rx="10" fill="#d7bd8a" stroke="rgba(104,76,43,.38)" stroke-width="2"/><path d="M-9 37l50-36 51 36z" fill="#8b6651"/><rect x="17" y="57" width="48" height="34" rx="4" fill="#f8edcf"/><path d="M25 65h32M25 73h24M25 81h29" stroke="#7c936d" stroke-width="3"/><circle cx="73" cy="20" r="9" fill="#d48a45" opacity=".8"/></g>'+
      '<g opacity=".48"><circle cx="390" cy="442" r="4" fill="#fff4de"/><circle cx="409" cy="456" r="3" fill="#fff4de"/><circle cx="591" cy="405" r="4" fill="#fff4de"/><circle cx="620" cy="386" r="3" fill="#fff4de"/></g>'+
      '</svg>';
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
      frame.classList.add('wordrealm-rendered','wordrealm-approved-scene');
    }
    if(scenery){
      scenery.classList.add('wordrealm-approved-scenery');
      scenery.innerHTML='<img class="wordrealm-approved-home-scene" src="assets/wordrealm/home-approved-v1.webp" alt="">';
    }
    if(strip){strip.innerHTML=stageStrip(level);strip.classList.remove('hidden')}
    brand?.classList.add('hidden');
  }

  function renderAdventureHome(level=1){
    const frame=document.querySelector('#projectMenuAvatarFrame');
    const scenery=document.querySelector('#projectMenuScenery');
    const strip=document.querySelector('#wordrealmStageStrip');
    const brand=document.querySelector('#wordrealmHomeBrand');
    if(frame)frame.classList.add('adventure-rendered');
    if(scenery)scenery.innerHTML=adventureScenerySvg(level);
    if(strip){strip.innerHTML='';strip.classList.add('hidden')}
    brand?.classList.add('hidden');
  }

  function clearHome(){
    const frame=document.querySelector('#projectMenuAvatarFrame');
    const fallback=document.querySelector('#projectMenuAvatarFallback');
    const scenery=document.querySelector('#projectMenuScenery');
    const strip=document.querySelector('#wordrealmStageStrip');
    const brand=document.querySelector('#wordrealmHomeBrand');
    if(frame)frame.classList.remove('wordrealm-rendered','adventure-rendered','wordrealm-approved-scene');
    if(fallback){
      fallback.classList.remove('wordrealm-svg-avatar');
      fallback.innerHTML='<span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-shield">V</span>';
    }
    if(scenery){scenery.classList.remove('wordrealm-approved-scenery');scenery.innerHTML='<span class="project-menu-cloud cloud-a"></span><span class="project-menu-cloud cloud-b"></span><span class="project-menu-castle"><i></i><i></i><i></i></span>'}
    if(strip){strip.innerHTML='';strip.classList.add('hidden')}
    brand?.classList.add('hidden');
  }

  window.VTWordrealmUi={STAGES,ADVENTURE_STAGES,foxSvg,adventureFoxSvg,adventureScenerySvg,castleSvg,stageStrip,renderHome,renderAdventureHome,clearHome};
})();