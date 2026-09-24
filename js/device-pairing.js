'use strict';

(function(){
  function inviteParams(){
    return new URLSearchParams(String(location.hash||'').replace(/^#/,''));
  }

  function inviteLink(kind,token,profileName=''){
    const url=new URL(location.href);
    url.hash='';
    const params=new URLSearchParams();
    params.set(kind,String(token||''));
    if(kind==='childInvite'&&profileName)params.set('childName',String(profileName).slice(0,80));
    url.hash=params.toString();
    return url.toString();
  }

  const childInviteLink=(token,profileName='')=>inviteLink('childInvite',token,profileName);
  const parentInviteLink=token=>inviteLink('parentInvite',token);

  async function copyInviteLink(link){
    if(window.VTQr?.copyText)return VTQr.copyText(link,'Verbindungslink kopiert.');
    try{await navigator.clipboard.writeText(link);toast('Verbindungslink kopiert.','good');return true}catch(_e){return false}
  }

  async function shareInviteLink(link,title,text){
    if(window.VTQr?.shareUrl)return VTQr.shareUrl(link,title,text);
    return copyInviteLink(link);
  }

  function renderInviteQr(selector,link,label){
    window.VTQr?.render?.(selector,link,label);
  }

  function isIOSBrowserOutsideStandalone(){
    const ua=String(navigator.userAgent||'');
    const ios=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
    const standalone=window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true;
    return ios&&!standalone;
  }

  function clearInviteHash(kind){
    const params=inviteParams();
    if(!params.has(kind))return;
    params.delete(kind);
    if(kind==='childInvite')params.delete('childName');
    history.replaceState(null,'',location.pathname+location.search+(params.toString()?'#'+params.toString():''));
  }

  function showIosHomeHandoff(kind,token,profileName=''){
    const child=kind==='childInvite';
    const link=child?childInviteLink(token,profileName):parentInviteLink(token);
    const label=child?'Kindergerät':'Eltern-Gerät';
    modal(`<div class="eyebrow">iPhone / iPad</div><h2>Für den Home-Bildschirm vorbereiten</h2><p>Dieser ${label}-Link wurde in Safari geöffnet. Auf iOS 15 speichert die Home-Bildschirm-Web-App ihre Geräteverbindung getrennt.</p><div class="notice warn"><strong>Den Link nicht in Safari verbrauchen.</strong><br>1. Verbindungslink kopieren.<br>2. Vokabeltrainer über <strong>Teilen → Zum Home-Bildschirm</strong> hinzufügen.<br>3. Das neue App-Symbol öffnen.<br>4. Dort den Verbindungslink einfügen bzw. erneut öffnen.</div><div class="modal-actions stack-mobile"><button value="cancel" class="ghost">Später</button><button type="button" id="copyIosHomeInviteBtn" class="primary">Verbindungslink kopieren</button></div>`);
    $('#copyIosHomeInviteBtn').onclick=()=>copyInviteLink(link);
    return true;
  }

  window.handleChildInviteFromUrl=function(){
    if(!window.VTFamilySync)return false;
    const params=inviteParams(),token=String(params.get('childInvite')||'').trim();
    if(!token)return false;
    const profileName=String(params.get('childName')||'Kind').trim().slice(0,80)||'Kind';
    const current=VTFamilySync.status();

    if(isIOSBrowserOutsideStandalone())return showIosHomeHandoff('childInvite',token,profileName);

    if(current.enabled){
      clearInviteHash('childInvite');
      modal(`<div class="eyebrow">Kindergerät</div><h2>Dieses Gerät ist bereits verbunden</h2><p>Der Link für <strong>${esc(profileName)}</strong> muss auf einem noch nicht verbundenen Kindergerät geöffnet werden.</p><div class="notice subtle">Öffne den Link dort erneut oder sende ihn vom Eltern-Gerät direkt an das Kindergerät.</div><div class="modal-actions"><button value="cancel" class="primary">Verstanden</button></div>`);
      return true;
    }

    modal(`<div class="eyebrow">Kindergerät</div><h2>${esc(profileName)} verbinden</h2><p>Dieses Gerät wird dem Profil <strong>${esc(profileName)}</strong> zugeordnet. Danach öffnet sich direkt die Kinderansicht.</p><div id="claimChildInviteResult" class="notice subtle">Der Verbindungslink ist einmalig und nur 15 Minuten gültig.</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="claimChildInviteBtn" class="primary">Dieses Gerät verbinden</button></div>`);
    $('#claimChildInviteBtn').onclick=async()=>{
      const btn=$('#claimChildInviteBtn'),out=$('#claimChildInviteResult');
      btn.disabled=true;btn.textContent='Wird verbunden …';
      try{
        await VTFamilySync.claimChildInvite(token,`${profileName} · Kindergerät`);
        clearInviteHash('childInvite');closeModal();renderAll();VTFamilySync.bootstrap();
        toast(`${profileName} ist auf diesem Gerät eingerichtet.`,'good');
      }catch(e){
        out.className='notice bad';
        out.textContent=(e.message||'Verbindung fehlgeschlagen.')+' Falls der Link abgelaufen ist, auf dem Eltern-Gerät einen neuen Verbindungslink erstellen.';
        btn.disabled=false;btn.textContent='Erneut versuchen';
      }
    };
    return true;
  };

  window.handleParentInviteFromUrl=function(){
    if(!window.VTFamilySync)return false;
    const token=String(inviteParams().get('parentInvite')||'').trim();
    if(!token)return false;
    const current=VTFamilySync.status();

    if(isIOSBrowserOutsideStandalone())return showIosHomeHandoff('parentInvite',token);

    if(current.enabled){
      clearInviteHash('parentInvite');
      modal('<div class="eyebrow">Eltern-Gerät</div><h2>Dieses Gerät ist bereits verbunden</h2><p>Der QR-/Verbindungslink ist für ein zusätzliches, noch nicht verbundenes Eltern-Gerät gedacht.</p><div class="modal-actions"><button value="cancel" class="primary">Verstanden</button></div>');
      return true;
    }

    modal('<div class="eyebrow">Eltern-Gerät</div><h2>Mit Familie verbinden</h2><p>Dieser einmalige QR-/Verbindungslink fügt dieses Gerät als Eltern-Gerät hinzu. Die Familien-PIN muss nicht übertragen werden.</p><div id="claimParentInviteResult" class="notice subtle">Der Link ist einmalig und nur 15 Minuten gültig.</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="claimParentInviteBtn" class="primary">Eltern-Gerät verbinden</button></div>');
    $('#claimParentInviteBtn').onclick=async()=>{
      const btn=$('#claimParentInviteBtn'),out=$('#claimParentInviteResult');
      btn.disabled=true;btn.textContent='Wird verbunden …';
      try{
        await VTFamilySync.claimParentInvite(token,'Eltern-Gerät');
        clearInviteHash('parentInvite');closeModal();appRole='parent';applyRoleUi();renderAll();VTFamilySync.bootstrap();
        toast('Eltern-Gerät ist verbunden.','good');
      }catch(e){
        out.className='notice bad';
        out.textContent=(e.message||'Verbindung fehlgeschlagen.')+' Falls der Link abgelaufen ist, auf dem verbundenen Eltern-Gerät einen neuen QR-Code erstellen.';
        btn.disabled=false;btn.textContent='Erneut versuchen';
      }
    };
    return true;
  };

  window.handleDeviceInviteFromUrl=function(){
    return window.handleParentInviteFromUrl?.()||window.handleChildInviteFromUrl?.()||false;
  };

  window.openChildDeviceInvite=function(){
    if(!window.VTFamilySync)return;
    const learners=state.learners||[];
    if(!learners.length){toast('Zuerst ein Kinderprofil anlegen.','subtle');return}

    modal(`<div class="eyebrow">Kindergerät</div><h2>Kindergerät verbinden</h2><p>Wähle das Kind. Danach erscheint ein QR-Code für das Kindergerät; Teilen oder Kopieren bleibt als Alternative verfügbar.</p><label>Profil<select id="familyChildProfile">${learners.map(l=>`<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></label><div id="familyChildInviteResult" class="notice subtle">QR-Code und Link sind einmalig und 15 Minuten gültig.</div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button><button type="button" id="familyChildInviteBtn" class="primary">QR-Code erstellen</button></div>`);

    $('#familyChildInviteBtn').onclick=async()=>{
      const btn=$('#familyChildInviteBtn'),out=$('#familyChildInviteResult'),profileId=$('#familyChildProfile').value;
      const learner=learners.find(l=>l.id===profileId),profileName=learner?.name||'Kind';
      btn.disabled=true;btn.textContent='QR-Code wird erstellt …';
      try{
        const r=await VTFamilySync.createChildInvite(profileId),link=childInviteLink(r.token,profileName);
        out.className='notice good pairing-invite-result';
        out.innerHTML=`<strong>QR-Code für ${esc(profileName)}</strong><div class="pairing-qr-wrap"><div id="familyChildQr" class="pairing-qr"></div><small>Mit der Kamera des Kindergeräts scannen.</small></div><div class="row gap wrap pairing-share-actions"><button type="button" id="familyChildShareBtn" class="primary">Link teilen</button><button type="button" id="familyChildCopyBtn" class="secondary">Link kopieren</button></div><small>Einmalig · 15 Minuten gültig. Der technische Sicherheitsschlüssel bleibt verborgen.</small>`;
        renderInviteQr('#familyChildQr',link,`QR-Code zum Verbinden des Kindergeräts ${profileName}`);
        $('#familyChildShareBtn').onclick=()=>shareInviteLink(link,'Vokabeltrainer verbinden',`Kindergerät für ${profileName} verbinden`);
        $('#familyChildCopyBtn').onclick=()=>copyInviteLink(link);
        btn.textContent='Neuen QR-Code erstellen';
      }catch(e){
        out.className='notice bad';out.textContent=e.message||'QR-Code konnte nicht erzeugt werden.';btn.textContent='Erneut versuchen';
      }finally{btn.disabled=false}
    };
  };

  window.openParentDeviceInvite=function(){
    if(!window.VTFamilySync||VTFamilySync.status().role!=='parent'){toast('Nur ein verbundenes Eltern-Gerät kann weitere Eltern-Geräte hinzufügen.','subtle');return}
    modal('<div class="eyebrow">Eltern-Gerät</div><h2>Weiteres Eltern-Gerät verbinden</h2><p>Erstelle einen einmaligen QR-Code. Die Familien-PIN wird dabei nicht angezeigt oder übertragen.</p><div id="familyParentInviteResult" class="notice subtle">Der QR-Code ist einmalig und 15 Minuten gültig.</div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button><button type="button" id="familyParentInviteBtn" class="primary">QR-Code erstellen</button></div>');
    $('#familyParentInviteBtn').onclick=async()=>{
      const btn=$('#familyParentInviteBtn'),out=$('#familyParentInviteResult');
      btn.disabled=true;btn.textContent='QR-Code wird erstellt …';
      try{
        const r=await VTFamilySync.createParentInvite(),link=parentInviteLink(r.token);
        out.className='notice good pairing-invite-result';
        out.innerHTML='<strong>QR-Code für das weitere Eltern-Gerät</strong><div class="pairing-qr-wrap"><div id="familyParentQr" class="pairing-qr"></div><small>Mit der Kamera des neuen Eltern-Geräts scannen.</small></div><div class="row gap wrap pairing-share-actions"><button type="button" id="familyParentShareBtn" class="primary">Link teilen</button><button type="button" id="familyParentCopyBtn" class="secondary">Link kopieren</button></div><small>Einmalig · 15 Minuten gültig. Die dauerhafte Familien-PIN bleibt geheim.</small>';
        renderInviteQr('#familyParentQr',link,'QR-Code zum Verbinden eines weiteren Eltern-Geräts');
        $('#familyParentShareBtn').onclick=()=>shareInviteLink(link,'Vokabeltrainer verbinden','Weiteres Eltern-Gerät mit der Familie verbinden');
        $('#familyParentCopyBtn').onclick=()=>copyInviteLink(link);
        btn.textContent='Neuen QR-Code erstellen';
      }catch(e){
        out.className='notice bad';out.textContent=e.message||'QR-Code konnte nicht erzeugt werden.';btn.textContent='Erneut versuchen';
      }finally{btn.disabled=false}
    };
  };
})();