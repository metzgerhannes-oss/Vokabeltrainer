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
      female:Object.freeze([])
    })
  });
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
    window.VTMenuAvatarArt={
      ready:true,
      readySubjects:Object.fromEntries(Object.keys(art).map(subject=>[subject,Object.values(art[subject]||{}).some(list=>list?.length===6)])),
      readyStyles:Object.fromEntries(Object.entries(art).flatMap(([subject,styles])=>Object.entries(styles).map(([style,list])=>[`${subject}:${style}`,list?.length===6]))),
      get(subject,style,stage){
        if(typeof style==='number'){stage=style;style='male'}
        const list=art[subject]?.[style==='female'?'female':'male'];
        const index=Math.max(0,Math.min(5,(Number(stage)||1)-1));
        return Array.isArray(list)?list[index]||'':'';
      }
    };
    document.dispatchEvent(new CustomEvent('vt-menu-avatar-art-ready'));
  }

  window.addEventListener('beforeunload',()=>urls.forEach(url=>URL.revokeObjectURL(url)),{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
