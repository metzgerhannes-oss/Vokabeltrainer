'use strict';

(async function bootstrap(){
  state = await loadState();
  try{
    const seeded=await installBuiltinLibraries();
    if(seeded?.changed||startupBuiltinOnlyResetApplied)await persistOnly();
    if(startupBuiltinOnlyResetApplied&&window.VTFamilySync?.replaceCloudWithCurrent){
      try{await window.VTFamilySync.replaceCloudWithCurrent()}catch(e){console.warn('Bereinigter Familienstand konnte noch nicht synchronisiert werden.',e)}
    }
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
    navigator.serviceWorker.register('./sw.js?v=0.18.13')
      .then(reg=>reg.update().catch(()=>{}))
      .catch(console.warn);
  }
  bind();
  renderAll();
  window.VTFamilySync?.bootstrap();
})();