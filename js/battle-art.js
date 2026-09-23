'use strict';

(() => {
  const SCENE_PARTS=[
    'assets/battle/scene-v2/part-01.b64',
    'assets/battle/scene-v2/part-02.b64',
    'assets/battle/scene-v2/part-03.b64',
    'assets/battle/scene-v2/part-04.b64',
    'assets/battle/scene-v2/part-05a.b64',
    'assets/battle/scene-v2/part-05b.b64',
    'assets/battle/scene-v2/part-06.b64',
    'assets/battle/scene-v2/part-07.b64',
    'assets/battle/scene-v2/part-08.b64',
    'assets/battle/scene-v2/part-09.b64',
    'assets/battle/scene-v2/part-10.b64',
    'assets/battle/scene-v2/part-11.b64'
  ];

  let sceneUrl='';

  async function loadParts(paths){
    const responses=await Promise.all(paths.map(path=>fetch(path,{cache:'force-cache'})));
    if(responses.some(response=>!response.ok))throw new Error('Battle artwork resource missing');
    return (await Promise.all(responses.map(response=>response.text()))).join('');
  }

  function objectUrlFromBase64(base64){
    const raw=window.atob(base64.trim());
    const bytes=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
    sceneUrl=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
    return sceneUrl;
  }

  async function boot(){
    try{
      const scene64=await loadParts(SCENE_PARTS);
      window.VTBattleArt={
        ready:true,
        sceneUrl:objectUrlFromBase64(scene64),
        width:800,
        height:365,
        source:'dedicated-battlefield'
      };
      document.dispatchEvent(new CustomEvent('vt-battle-art-ready'));
    }catch(error){
      window.VTBattleArt={ready:false};
      console.warn('Battle artwork unavailable; CSS fallback stays active.',error);
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  window.addEventListener('beforeunload',()=>{
    if(sceneUrl)URL.revokeObjectURL(sceneUrl);
  },{once:true});
})();
