'use strict';

(() => {
  const HERO_PARTS=[
    'assets/army/hero/part-01.b64',
    'assets/army/hero/part-02.b64',
    'assets/army/hero/part-03.b64',
    'assets/army/hero/part-04.b64',
    'assets/army/hero/part-05.b64',
    'assets/army/hero/part-06.b64'
  ];
  const UNIT_PARTS=[
    'assets/army/units/part-01.b64',
    'assets/army/units/part-02.b64',
    'assets/army/units/part-03.b64',
    'assets/army/units/part-04.b64',
    'assets/army/units/part-05.b64'
  ];
  const urls=[];

  async function loadParts(paths){
    const responses=await Promise.all(paths.map(path=>fetch(path,{cache:'force-cache'})));
    if(responses.some(response=>!response.ok))throw new Error('Army artwork resource missing');
    return (await Promise.all(responses.map(response=>response.text()))).join('');
  }

  function objectUrlFromBase64(base64){
    const raw=window.atob(base64.trim());
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
    urls.push(url);
    return url;
  }

  async function boot(){
    try{
      const [hero64,units64]=await Promise.all([loadParts(HERO_PARTS),loadParts(UNIT_PARTS)]);
      window.VTArmyArt={
        ready:true,
        heroUrl:objectUrlFromBase64(hero64),
        unitsUrl:objectUrlFromBase64(units64)
      };
      document.dispatchEvent(new CustomEvent('vt-army-art-ready'));
    }catch(error){
      window.VTArmyArt={ready:false};
      console.warn('Army artwork unavailable; CSS fallback stays active.',error);
    }
  }

  window.addEventListener('beforeunload',()=>urls.forEach(url=>URL.revokeObjectURL(url)),{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
