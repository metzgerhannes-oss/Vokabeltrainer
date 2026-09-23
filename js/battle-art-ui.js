'use strict';

(() => {
  let applying=false;

  function removeBattleArt(stage){
    stage.classList.remove('battle-art-ready','battle-art-layered');
    stage.querySelector('[data-battle-art-stack]')?.remove();
  }

  function layer(name,className,src){
    const img=document.createElement('img');
    img.className=className;
    img.setAttribute('data-battle-layer',name);
    img.alt='';
    img.setAttribute('aria-hidden','true');
    img.src=src;
    return img;
  }

  function applyBattleArt(){
    if(applying)return;
    const stage=document.querySelector('#battleStage');
    if(!stage)return;
    if(!stage.classList.contains('subject-english')){
      removeBattleArt(stage);
      return;
    }
    const art=window.VTBattleArt;
    if(!art?.ready)return;

    let stack=stage.querySelector('[data-battle-art-stack]');
    if(!stack){
      applying=true;
      stack=document.createElement('div');
      stack.className='battle-art-stack';
      stack.setAttribute('data-battle-art-stack','');
      stack.setAttribute('aria-hidden','true');

      const background=layer('background','battle-art-layer battle-art-background',art.sceneUrl);
      background.setAttribute('data-battle-scene-art','');
      background.dataset.battleAsset='dedicated';
      const army=layer('army','battle-art-layer battle-art-army',art.sceneUrl);
      const fortress=layer('fortress','battle-art-layer battle-art-fortress',art.sceneUrl);
      const atmosphere=document.createElement('div');
      atmosphere.className='battle-art-atmosphere';
      atmosphere.setAttribute('data-battle-layer','atmosphere');

      stack.append(background,army,fortress,atmosphere);
      stage.prepend(stack);
      applying=false;

      let loaded=0;
      const markLoaded=()=>{
        loaded+=1;
        if(loaded>=3){
          stage.classList.add('battle-art-ready','battle-art-layered');
        }
      };
      [background,army,fortress].forEach(img=>{
        img.addEventListener('load',markLoaded,{once:true});
        if(img.complete&&img.naturalWidth)markLoaded();
      });
    }
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
