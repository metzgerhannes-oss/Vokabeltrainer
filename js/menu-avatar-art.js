'use strict';

(() => {
  const ART_PATHS=Object.freeze({
    english:Object.freeze({
      male:Object.freeze([
        'assets/menu-avatar/english/stage-1.webp.b64',
        'assets/menu-avatar/english/stage-2.webp.b64',
        'assets/menu-avatar/english/stage-3.webp.b64',
        'assets/menu-avatar/english/stage-4.webp.b64',
        'assets/menu-avatar/english/stage-5.webp.b64',
        'assets/menu-avatar/english/stage-6.webp.b64'
      ]),
      female:Object.freeze([]),
      neutral:Object.freeze([])
    })
  });
  const ATLAS_PATH='assets/menu-avatar/approved-atlas-v1.webp.b64';
  const ATLAS_ROWS=Object.freeze({
    english:Object.freeze({female:0,neutral:1}),
    latin:Object.freeze({male:2,female:3,neutral:4}),
    french:Object.freeze({male:5,female:6,neutral:7}),
    german:Object.freeze({male:8,female:8,neutral:8})
  });
  const ATLAS_COLUMNS=6,ATLAS_ROWS_COUNT=9;
  const urls=[];

  async function objectUrl(path){
    const response=await fetch(path,{cache:'force-cache'});
    if(!response.ok)throw new Error('Avatar artwork resource missing: '+path);
    const base64=(await response.text()).trim();
    const raw=window.atob(base64);
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
    urls.push(url);
    return url;
  }

  function safeStyle(style){return ['male','female','neutral'].includes(style)?style:'male'}
  function stageIndex(stage){return Math.max(0,Math.min(5,(Number(stage)||1)-1))}

  async function boot(){
    const art={};
    for(const [subject,styles] of Object.entries(ART_PATHS)){
      art[subject]={};
      for(const [style,paths] of Object.entries(styles)){
        if(!paths.length)continue;
        try{art[subject][style]=await Promise.all(paths.map(objectUrl))}
        catch(error){console.warn('Menu avatar artwork unavailable for '+subject+'/'+style+'; fallback stays active.',error)}
      }
    }

    let atlasUrl='';
    try{atlasUrl=await objectUrl(ATLAS_PATH)}
    catch(error){console.warn('Approved avatar atlas unavailable; technical fallback stays active.',error)}

    const hasAtlas=(subject,style)=>!!(atlasUrl&&Number.isInteger(ATLAS_ROWS[subject]?.[safeStyle(style)]));
    const allSubjects=['english','latin','german','french'];
    const allStyles=['male','female','neutral'];
    window.VTMenuAvatarArt={
      ready:true,
      atlasReady:!!atlasUrl,
      readySubjects:Object.fromEntries(allSubjects.map(subject=>[
        subject,
        allStyles.every(style=>!!art[subject]?.[style]?.length||hasAtlas(subject,style))
      ])),
      readyStyles:Object.fromEntries(allSubjects.flatMap(subject=>allStyles.map(style=>[
        `${subject}:${style}`,
        !!art[subject]?.[style]?.length||hasAtlas(subject,style)
      ]))),
      get(subject,style,stage){
        if(typeof style==='number'){stage=style;style='male'}
        const list=art[subject]?.[safeStyle(style)];
        return Array.isArray(list)?list[stageIndex(stage)]||'':'';
      },
      getSprite(subject,style,stage){
        if(!atlasUrl)return null;
        const row=ATLAS_ROWS[subject]?.[safeStyle(style)];
        if(!Number.isInteger(row))return null;
        return {url:atlasUrl,col:stageIndex(stage),row,cols:ATLAS_COLUMNS,rows:ATLAS_ROWS_COUNT};
      }
    };
    document.dispatchEvent(new CustomEvent('vt-menu-avatar-art-ready'));
  }

  window.addEventListener('beforeunload',()=>urls.forEach(url=>URL.revokeObjectURL(url)),{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
