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
    navigator.serviceWorker.register('./sw.js?v=0.21.0')
      .then(reg=>reg.update().catch(()=>{}))
      .catch(console.warn);
  }
  try{
    await new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='./js/device-pairing.js?v='+VERSION;
      s.onload=resolve;
      s.onerror=()=>reject(new Error('Geräteverbindung konnte nicht geladen werden.'));
      document.head.appendChild(s);
    });
  }catch(e){console.warn(e)}
  bind();
  renderAll();
  const handledDeviceInvite=window.handleDeviceInviteFromUrl?.();
  if(!handledDeviceInvite)window.handleDuelInviteFromUrl?.();

  // Deterministic local bootstrap boundary for browser tests and diagnostics.
  // This deliberately does not wait for optional network sync.
  window.__VT_APP_READY__=true;
  window.dispatchEvent(new Event('vt-app-ready'));

  window.VTFamilySync?.bootstrap();
})();