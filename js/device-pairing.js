'use strict';

(function(){
  function inviteParams(){
    return new URLSearchParams(String(location.hash||'').replace(/^#/,''));
  }

  function childInviteLink(token,profileName=''){
    const url=new URL(location.href);
    url.hash='';
    const params=new URLSearchParams();
    params.set('childInvite',String(token||''));
    if(profileName)params.set('childName',String(profileName).slice(0,80));
    url.hash=params.toString();
    return url.toString();
  }

  async function copyChildInviteLink(link){
    try{
      await navigator.clipboard.writeText(link);
      toast('Verbindungslink kopiert.','good');
      return true;
    }catch(_e){
      const ta=document.createElement('textarea');
      ta.value=link;
      ta.setAttribute('readonly','');
      ta.style.position='fixed';
      ta.style.opacity='0';
      document.body.appendChild(ta);
      ta.select();
      const ok=document.execCommand?.('copy');
      ta.remove();
      toast(ok?'Verbindungslink kopiert.':'Kopieren nicht möglich.','subtle');
      return !!ok;
    }
  }

  async function shareChildInviteLink(link,profileName){
    if(navigator.share){
      try{
        await navigator.share({
          title:'Vokabeltrainer verbinden',
          text:`Kindergerät für ${profileName||'das Kind'} verbinden`,
          url:link
        });
        return true;
      }catch(e){
        if(e?.name==='AbortError')return false;
      }
    }
    return copyChildInviteLink(link);
  }

  function clearChildInviteHash(){
    const params=inviteParams();
    if(!params.has('childInvite'))return;
    params.delete('childInvite');
    params.delete('childName');
    history.replaceState(null,'',location.pathname+location.search+(params.toString()?'#'+params.toString():''));
  }

  window.handleChildInviteFromUrl=function(){
    if(!window.VTFamilySync)return false;
    const params=inviteParams();
    const token=String(params.get('childInvite')||'').trim();
    if(!token)return false;

    const profileName=String(params.get('childName')||'Kind').trim().slice(0,80)||'Kind';
    const current=VTFamilySync.status();

    if(current.enabled){
      clearChildInviteHash();
      modal(`<div class="eyebrow">Kindergerät</div><h2>Dieses Gerät ist bereits verbunden</h2><p>Der Link für <strong>${esc(profileName)}</strong> muss auf einem noch nicht verbundenen Kindergerät geöffnet werden.</p><div class="notice subtle">Öffne den Link dort erneut oder sende ihn vom Eltern-Gerät direkt an das Kindergerät.</div><div class="modal-actions"><button value="cancel" class="primary">Verstanden</button></div>`);
      return true;
    }

    modal(`<div class="eyebrow">Kindergerät</div><h2>${esc(profileName)} verbinden</h2><p>Dieses Gerät wird dem Profil <strong>${esc(profileName)}</strong> zugeordnet. Danach öffnet sich direkt die Kinderansicht.</p><div id="claimChildInviteResult" class="notice subtle">Der Verbindungslink ist einmalig und nur 15 Minuten gültig.</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="claimChildInviteBtn" class="primary">Dieses Gerät verbinden</button></div>`);

    $('#claimChildInviteBtn').onclick=async()=>{
      const btn=$('#claimChildInviteBtn');
      const out=$('#claimChildInviteResult');
      btn.disabled=true;
      btn.textContent='Wird verbunden …';
      try{
        await VTFamilySync.claimChildInvite(token,`${profileName} · Kindergerät`);
        clearChildInviteHash();
        closeModal();
        renderAll();
        VTFamilySync.bootstrap();
        toast(`${profileName} ist auf diesem Gerät eingerichtet.`,'good');
      }catch(e){
        out.className='notice bad';
        out.textContent=(e.message||'Verbindung fehlgeschlagen.')+' Falls der Link abgelaufen ist, auf dem Eltern-Gerät einen neuen Verbindungslink erstellen.';
        btn.disabled=false;
        btn.textContent='Erneut versuchen';
      }
    };
    return true;
  };

  window.openChildDeviceInvite=function(){
    if(!window.VTFamilySync)return;
    const learners=state.learners||[];
    if(!learners.length){
      toast('Zuerst ein Kinderprofil anlegen.','subtle');
      return;
    }

    modal(`<div class="eyebrow">Kindergerät</div><h2>Kindergerät verbinden</h2><p>Wähle das Kind. Danach kannst du einen sicheren Verbindungslink direkt an das Kindergerät senden.</p><label>Profil<select id="familyChildProfile">${learners.map(l=>`<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></label><div id="familyChildInviteResult" class="notice subtle">Auf dem Kindergerät genügt anschließend ein Tippen auf den Link und einmal „Dieses Gerät verbinden“.</div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button><button type="button" id="familyChildInviteBtn" class="primary">Verbindungslink erstellen</button></div>`);

    $('#familyChildInviteBtn').onclick=async()=>{
      const btn=$('#familyChildInviteBtn');
      const out=$('#familyChildInviteResult');
      const profileId=$('#familyChildProfile').value;
      const learner=learners.find(l=>l.id===profileId);
      const profileName=learner?.name||'Kind';

      btn.disabled=true;
      btn.textContent='Link wird erstellt …';
      try{
        const r=await VTFamilySync.createChildInvite(profileId);
        const link=childInviteLink(r.token,profileName);
        out.className='notice good';
        out.innerHTML=`<strong>Link für ${esc(profileName)} ist bereit.</strong><br>Öffne ihn innerhalb von 15 Minuten auf dem Kindergerät.<div class="row gap wrap" style="margin-top:.75rem"><button type="button" id="familyChildShareBtn" class="primary">Link teilen</button><button type="button" id="familyChildCopyBtn" class="secondary">Link kopieren</button></div><small>Der technische Sicherheitsschlüssel bleibt verborgen und wird automatisch übergeben.</small>`;
        $('#familyChildShareBtn').onclick=()=>shareChildInviteLink(link,profileName);
        $('#familyChildCopyBtn').onclick=()=>copyChildInviteLink(link);
        btn.textContent='Neuen Link erstellen';
      }catch(e){
        out.className='notice bad';
        out.textContent=e.message||'Verbindungslink konnte nicht erzeugt werden.';
        btn.textContent='Erneut versuchen';
      }finally{
        btn.disabled=false;
      }
    };
  };
})();