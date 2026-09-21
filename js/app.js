'use strict';

(async function bootstrap(){
  state = await loadState();
  if('serviceWorker' in navigator){
    const hadController=!!navigator.serviceWorker.controller;
    let updateReloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(!hadController||updateReloading)return;
      const key='vokabeltrainer_sw_reload_'+VERSION;
      if(sessionStorage.getItem(key))return;
      updateReloading=true;sessionStorage.setItem(key,'1');location.reload();
    });
    navigator.serviceWorker.register('./sw.js?v=0.16.0')
      .then(reg=>reg.update().catch(()=>{}))
      .catch(console.warn);
  }
  bind();
  renderAll();
})();