'use strict';

(() => {
  let applying=false;

  function applyBattleArt(){
    if(applying)return;
    const stage=document.querySelector('#battleStage');
    if(!stage)return;
    if(!stage.classList.contains('subject-english')){
      stage.classList.remove('battle-art-ready');
      stage.querySelector('[data-battle-scene-art]')?.remove();
      return;
    }
    const art=window.VTBattleArt;
    if(!art?.ready)return;

    let img=stage.querySelector('[data-battle-scene-art]');
    if(!img){
      applying=true;
      img=document.createElement('img');
      img.className='battle-scene-art';
      img.setAttribute('data-battle-scene-art','');
      img.alt='';
      img.setAttribute('aria-hidden','true');
      stage.prepend(img);
      applying=false;
    }
    if(img.dataset.battleArtBound)return;
    img.dataset.battleArtBound='1';
    img.addEventListener('load',()=>stage.classList.add('battle-art-ready'),{once:true});
    img.dataset.battleAsset='dedicated';
    img.src=art.sceneUrl;
    if(img.complete&&img.naturalWidth)stage.classList.add('battle-art-ready');
  }

  function boot(){
    const stage=document.querySelector('#battleStage');
    if(!stage)return;
    const observer=new MutationObserver(()=>queueMicrotask(applyBattleArt));
    observer.observe(stage,{childList:true});
    applyBattleArt();
    document.addEventListener('vt-battle-art-ready',applyBattleArt);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
