'use strict';

(async function bootstrap(){
  state = await loadState();
  try{
    const seeded=await installBuiltinLibraries();
    if(seeded?.changed)await persistOnly();
  }catch(e){console.warn('Feste Lehrwerksbibliothek konnte nicht geladen werden.',e)}
  if('serviceWorker' in navigator){
    const hadController=!!navigator.serviceWorker.controller;
    let updateReloading=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(!hadController||updateReloading)return;
      const key='vokabeltrainer_sw_reload_'+VERSION;
      if(sessionStorage.getItem(key))return;
      updateReloading=true;sessionStorage.setItem(key,'1');location.reload();
    });
    navigator.serviceWorker.register('./sw.js?v=0.18.8')
      .then(reg=>reg.update().catch(()=>{}))
      .catch(console.warn);
  }
  bind();
  renderAll();
  window.VTFamilySync?.bootstrap();
})();