'use strict';

(function(){
  const CONFIG_KEY='vokabeltrainer_family_sync_v1';
  const SUPABASE_URL='https://ilfblkqxbldkzmqczbgo.supabase.co';
  const SUPABASE_KEY='sb_publishable_zkzIhxq7Xby65AbNnAkiyQ_0ZfAAU4V';
  const PROFILE_PROGRESS_FIELDS=['xp','streakDays','milestones','fortressWins','fortressWinsByYear','battleTickets','battleDays','testFortresses','campaignLog','dailyPlans'];
  const PROFILE_SETUP_FIELDS=['id','name','gradeLevel','activeSubjects','lrsMode','fontSize','letterSpacing','flashSpeed','testSeries','gradeScales','createdAt'];
  const runtime={applying:false,busy:false,timer:null,poll:null,snapshots:new Map()};

  function clone(value){return value==null?value:JSON.parse(JSON.stringify(value))}
  function loadConfig(){
    try{
      const raw=localStorage.getItem(CONFIG_KEY),x=raw?JSON.parse(raw):{};
      return {
        enabled:x.enabled===true,
        familyId:String(x.familyId||''),
        deviceId:String(x.deviceId||''),
        deviceSecret:String(x.deviceSecret||''),
        role:x.role==='child'?'child':'parent',
        profileId:String(x.profileId||''),
        revisions:x.revisions&&typeof x.revisions==='object'?x.revisions:{},
        dirtyKeys:Array.isArray(x.dirtyKeys)?x.dirtyKeys:[],
        conflicts:x.conflicts&&typeof x.conflicts==='object'?x.conflicts:{},
        lastSync:String(x.lastSync||''),
        revoked:x.revoked===true,
        revokedAt:String(x.revokedAt||'')
      };
    }catch(e){console.warn('Family sync config',e);return {enabled:false,familyId:'',deviceId:'',deviceSecret:'',role:'parent',profileId:'',revisions:{},dirtyKeys:[],conflicts:{},lastSync:'',revoked:false,revokedAt:''}}
  }
  function saveConfig(cfg){localStorage.setItem(CONFIG_KEY,JSON.stringify(cfg))}
  function bytesHex(size=24){const a=new Uint8Array(size);crypto.getRandomValues(a);return Array.from(a,x=>x.toString(16).padStart(2,'0')).join('')}
  function randomId(prefix){return prefix+'_'+bytesHex(10)}
  function randomFamilyId(){return 'family_'+bytesHex(6)}
  async function sha256Hex(text){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
  function learnerSetup(l){const out={};PROFILE_SETUP_FIELDS.forEach(k=>{if(l?.[k]!==undefined)out[k]=clone(l[k])});return out}
  function learnerProgress(l){const out={id:l?.id||''};PROFILE_PROGRESS_FIELDS.forEach(k=>{if(l?.[k]!==undefined)out[k]=clone(l[k])});return out}

  function serializeDocuments(s=state){
    const docs={
      shared:{
        schema:1,
        vocabulary:clone(s.vocabulary||[]),
        books:clone(s.books||[]),
        bookVocabulary:clone(s.bookVocabulary||[])
      }
    };
    for(const learner of (s.learners||[])){
      const setIds=new Set((s.sets||[]).filter(x=>x.learnerId===learner.id).map(x=>x.id));
      docs['profile/'+learner.id+'/setup']={
        schema:1,
        learner:learnerSetup(learner),
        sets:clone((s.sets||[]).filter(x=>x.learnerId===learner.id)),
        setVocabulary:clone((s.setVocabulary||[]).filter(x=>setIds.has(x.setId))),
        learnerBooks:clone((s.learnerBooks||[]).filter(x=>x.learnerId===learner.id)),
        grades:clone((s.grades||[]).filter(x=>x.learnerId===learner.id))
      };
      docs['profile/'+learner.id+'/progress']={
        schema:1,
        learner:learnerProgress(learner),
        learnerVocabulary:clone((s.learnerVocabulary||[]).filter(x=>x.learnerId===learner.id)),
        practiceTests:clone((s.practiceTests||[]).filter(x=>x.learnerId===learner.id)),
        activity:clone((s.activity||[]).filter(x=>x.learnerId===learner.id))
      };
    }
    return docs;
  }

  function docProfileId(key){
    const m=String(key||'').match(/^profile\/([A-Za-z0-9_-]{3,120})\/(setup|progress)$/);
    return m?m[1]:'';
  }
  function documentRank(key){
    const k=String(key||'');
    return k==='shared'?0:k.endsWith('/setup')?1:k.endsWith('/progress')?2:3;
  }
  function learnerById(id){return (state.learners||[]).find(x=>x.id===id)||null}
  function ensureLearner(id,seed={}){
    let l=learnerById(id);
    if(l)return l;
    const base=defaultState().learners[0];
    l={...base,...clone(seed),id,name:seed.name||'Profil'};
    state.learners.push(l);return l;
  }
  function applyShared(payload){
    state.vocabulary=clone(payload?.vocabulary||[]);
    state.books=clone(payload?.books||[]);
    state.bookVocabulary=clone(payload?.bookVocabulary||[]);
  }
  function applySetup(key,payload){
    const id=docProfileId(key),incoming=payload?.learner||{};if(!id)return;
    const l=ensureLearner(id,incoming);PROFILE_SETUP_FIELDS.forEach(k=>{if(incoming[k]!==undefined)l[k]=clone(incoming[k])});l.id=id;
    const oldSetIds=new Set((state.sets||[]).filter(x=>x.learnerId===id).map(x=>x.id));
    state.setVocabulary=(state.setVocabulary||[]).filter(x=>!oldSetIds.has(x.setId));
    state.sets=(state.sets||[]).filter(x=>x.learnerId!==id).concat(clone(payload?.sets||[]));
    state.setVocabulary=(state.setVocabulary||[]).concat(clone(payload?.setVocabulary||[]));
    state.learnerBooks=(state.learnerBooks||[]).filter(x=>x.learnerId!==id).concat(clone(payload?.learnerBooks||[]));
    state.grades=(state.grades||[]).filter(x=>x.learnerId!==id).concat(clone(payload?.grades||[]));
  }
  function applyProgress(key,payload){
    const id=docProfileId(key),incoming=payload?.learner||{};if(!id)return;
    const l=ensureLearner(id,{id});PROFILE_PROGRESS_FIELDS.forEach(k=>{if(incoming[k]!==undefined)l[k]=clone(incoming[k])});
    state.learnerVocabulary=(state.learnerVocabulary||[]).filter(x=>x.learnerId!==id).concat(clone(payload?.learnerVocabulary||[]));
    state.practiceTests=(state.practiceTests||[]).filter(x=>x.learnerId!==id).concat(clone(payload?.practiceTests||[]));
    state.activity=(state.activity||[]).filter(x=>x.learnerId!==id).concat(clone(payload?.activity||[]));
  }
  function applyDocument(key,payload){
    runtime.applying=true;
    try{
      if(key==='shared')applyShared(payload);
      else if(key.endsWith('/setup'))applySetup(key,payload);
      else if(key.endsWith('/progress'))applyProgress(key,payload);
      rebuildWordIndexes();
      if(typeof backfillPairReviewSignatures==='function')backfillPairReviewSignatures(state);
    }finally{runtime.applying=false}
  }

  async function rpc(name,args){
    const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
    try{
      const res=await fetch(SUPABASE_URL+'/rest/v1/rpc/'+name,{
        method:'POST',
        headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},
        body:JSON.stringify(args||{}),
        signal:ctrl.signal
      });
      const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch(_){data=text}
      if(!res.ok)throw new Error(data?.message||('HTTP '+res.status));
      if(Array.isArray(data)&&data.length===1)data=data[0];
      return data;
    }catch(e){if(e?.name==='AbortError')throw new Error('Zeitüberschreitung bei der Synchronisierung.');throw e}
    finally{clearTimeout(timer)}
  }
  function docString(value){return JSON.stringify(value)}
  function initSnapshots(){
    runtime.snapshots.clear();
    const docs=serializeDocuments();
    Object.entries(docs).forEach(([k,v])=>runtime.snapshots.set(k,docString(v)));
  }
  function canWrite(cfg,key){
    if(cfg.role==='parent')return true;
    return key==='profile/'+cfg.profileId+'/progress';
  }
  function persistCfg(cfg){cfg.dirtyKeys=[...new Set(cfg.dirtyKeys||[])];saveConfig(cfg)}
  function markRevoked(cfg){
    cfg.enabled=false;cfg.revoked=true;cfg.revokedAt=new Date().toISOString();cfg.dirtyKeys=[];cfg.conflicts={};
    persistCfg(cfg);clearTimeout(runtime.timer);clearInterval(runtime.poll);runtime.snapshots.clear();
    queueMicrotask(()=>{try{renderAll?.()}catch(_e){}});
  }
  function remoteFailure(cfg,result,fallback){
    const code=String(result?.error||'');
    if(code==='unauthorized'){markRevoked(cfg);throw new Error('Dieses Gerät wurde aus dem Familienverbund entfernt. Lokale Daten bleiben erhalten.')}
    throw new Error(code||fallback);
  }

  function markLocalChange(){
    const cfg=loadConfig();if(!cfg.enabled||runtime.applying)return;
    if(!runtime.snapshots.size){initSnapshots();return}
    const docs=serializeDocuments(),dirty=new Set(cfg.dirtyKeys||[]);
    for(const [key,payload] of Object.entries(docs)){
      if(!canWrite(cfg,key))continue;
      const now=docString(payload),before=runtime.snapshots.get(key);
      if(before===undefined){runtime.snapshots.set(key,now);dirty.add(key)}
      else if(now!==before)dirty.add(key);
    }
    cfg.dirtyKeys=[...dirty];persistCfg(cfg);scheduleSync();
  }
  function scheduleSync(){
    clearTimeout(runtime.timer);runtime.timer=setTimeout(()=>syncNow(false).catch(e=>console.warn('Family sync',e)),1400);
  }

  async function createFamily(pin,label='Eltern-Gerät'){
    if(!crypto?.subtle)throw new Error('Für die Synchronisierung ist HTTPS erforderlich.');
    if(String(pin||'').length<6)throw new Error('Die Familien-PIN muss mindestens 6 Zeichen lang sein.');
    const familyId=randomFamilyId(),deviceId=randomId('device'),deviceSecret=bytesHex(32);
    const familySecretHash=await sha256Hex(familyId+'|'+String(pin));
    const documents=serializeDocuments();
    const result=await rpc('vt_create_family',{
      p_family_id:familyId,
      p_family_secret_hash:familySecretHash,
      p_device_id:deviceId,
      p_device_secret:deviceSecret,
      p_label:String(label||'Eltern-Gerät').slice(0,120),
      p_documents:documents
    });
    if(!result?.ok)throw new Error(result?.error||'Familie konnte nicht angelegt werden.');
    const revisions={};Object.keys(documents).forEach(k=>revisions[k]=1);
    const cfg={enabled:true,familyId,deviceId,deviceSecret,role:'parent',profileId:'',revisions,dirtyKeys:[],conflicts:{},lastSync:new Date().toISOString()};
    saveConfig(cfg);initSnapshots();return status();
  }

  async function joinParent(familyId,pin,label='Eltern-Gerät'){
    if(!crypto?.subtle)throw new Error('Für die Synchronisierung ist HTTPS erforderlich.');
    const id=String(familyId||'').trim().toLowerCase();if(!id)throw new Error('Familien-ID fehlt.');
    if(String(pin||'').length<6)throw new Error('Familien-PIN fehlt.');
    const deviceId=randomId('device'),deviceSecret=bytesHex(32),familySecretHash=await sha256Hex(id+'|'+String(pin));
    const result=await rpc('vt_join_parent',{p_family_id:id,p_family_secret_hash:familySecretHash,p_device_id:deviceId,p_device_secret:deviceSecret,p_label:String(label||'Eltern-Gerät').slice(0,120)});
    if(!result?.ok)throw new Error(result?.error||'Eltern-Gerät konnte nicht verbunden werden.');
    const cfg={enabled:true,familyId:id,deviceId,deviceSecret,role:'parent',profileId:'',revisions:{},dirtyKeys:[],conflicts:{},lastSync:''};
    saveConfig(cfg);initSnapshots();await syncNow(true);return status();
  }

  async function createParentInvite(){
    const cfg=loadConfig();if(!cfg.enabled||cfg.role!=='parent')throw new Error('Nur ein verbundenes Eltern-Gerät kann weitere Eltern-Geräte hinzufügen.');
    const result=await rpc('vt_create_parent_invite',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret});
    if(!result?.ok)throw new Error(result?.error||'Eltern-Gerät-Code konnte nicht erzeugt werden.');
    return result;
  }

  async function claimParentInvite(token,label='Eltern-Gerät'){
    const deviceId=randomId('device'),deviceSecret=bytesHex(32);
    const result=await rpc('vt_claim_parent_invite',{p_invite_token:String(token||'').trim(),p_device_id:deviceId,p_device_secret:deviceSecret,p_label:String(label||'Eltern-Gerät').slice(0,120)});
    if(!result?.ok)throw new Error(result?.error||'Gerätecode ist ungültig oder abgelaufen.');
    const revisions={};
    runtime.applying=true;
    try{
      state.learners=[];state.sets=[];state.setVocabulary=[];state.learnerBooks=[];state.learnerVocabulary=[];state.grades=[];state.practiceTests=[];state.activity=[];
      for(const d of (result.documents||[]).sort((a,b)=>documentRank(a.key)-documentRank(b.key)||String(a.key).localeCompare(String(b.key)))){applyDocument(d.key,d.payload);revisions[d.key]=Number(d.revision)||0}
      if(!state.learners.some(l=>l.id===state.activeLearnerId))state.activeLearnerId=state.learners[0]?.id||'';
      ensureActiveSubject();await persistState();
    }finally{runtime.applying=false}
    const cfg={enabled:true,familyId:result.family_id,deviceId,deviceSecret,role:'parent',profileId:'',revisions,dirtyKeys:[],conflicts:{},lastSync:new Date().toISOString()};
    saveConfig(cfg);initSnapshots();renderAll();return status();
  }

  async function createChildInvite(profileId){
    const cfg=loadConfig();if(!cfg.enabled||cfg.role!=='parent')throw new Error('Nur ein verbundenes Eltern-Gerät kann Kindergeräte hinzufügen.');
    const result=await rpc('vt_create_child_invite',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret,p_profile_id:profileId});
    if(!result?.ok)throw new Error(result?.error||'Kindergerät-Code konnte nicht erzeugt werden.');
    return result;
  }

  async function claimChildInvite(token,label='Kindergerät'){
    const deviceId=randomId('device'),deviceSecret=bytesHex(32);
    const result=await rpc('vt_claim_child_invite',{p_invite_token:String(token||'').trim(),p_device_id:deviceId,p_device_secret:deviceSecret,p_label:String(label||'Kindergerät').slice(0,120)});
    if(!result?.ok)throw new Error(result?.error||'Gerätecode ist ungültig oder abgelaufen.');
    const revisions={};
    runtime.applying=true;
    try{
      state.learners=[];state.sets=[];state.setVocabulary=[];state.learnerBooks=[];state.learnerVocabulary=[];state.grades=[];state.practiceTests=[];state.activity=[];
      for(const d of (result.documents||[]).sort((a,b)=>documentRank(a.key)-documentRank(b.key)||String(a.key).localeCompare(String(b.key)))){applyDocument(d.key,d.payload);revisions[d.key]=Number(d.revision)||0}
      state.activeLearnerId=result.profile_id;ensureActiveSubject();await persistState();
    }finally{runtime.applying=false}
    const cfg={enabled:true,familyId:result.family_id,deviceId,deviceSecret,role:'child',profileId:result.profile_id,revisions,dirtyKeys:[],conflicts:{},lastSync:new Date().toISOString()};
    saveConfig(cfg);initSnapshots();renderAll();return status();
  }

  async function syncNow(force=false){
    const cfg=loadConfig();if(!cfg.enabled||runtime.busy)return status();
    if(navigator.onLine===false&&!force)return status();
    runtime.busy=true;
    try{
      const pulled=await rpc('vt_pull_documents',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret});
      if(!pulled?.ok)remoteFailure(cfg,pulled,'Cloud-Stand nicht erreichbar.');
      cfg.role=pulled.role==='child'?'child':'parent';cfg.profileId=String(pulled.profile_id||cfg.profileId||'');
      const dirty=new Set(cfg.dirtyKeys||[]),conflicts={...cfg.conflicts};let changed=false;
      const remoteDocs=(pulled.documents||[]).sort((a,b)=>documentRank(a.key)-documentRank(b.key)||String(a.key).localeCompare(String(b.key)));
      for(const d of remoteDocs){
        const key=String(d.key||''),remoteRev=Number(d.revision)||0,localRev=Number(cfg.revisions[key])||0;
        if(remoteRev>localRev){
          if(dirty.has(key)){conflicts[key]=remoteRev;continue}
          applyDocument(key,d.payload);cfg.revisions[key]=remoteRev;runtime.snapshots.set(key,docString(d.payload));delete conflicts[key];changed=true;
        }else if(!runtime.snapshots.has(key))runtime.snapshots.set(key,docString(serializeDocuments()[key]||d.payload));
      }
      if(changed){ensureActiveSubject();await persistState();renderAll()}

      const current=serializeDocuments();
      for(const key of [...dirty]){
        if(!canWrite(cfg,key)){dirty.delete(key);continue}
        if(conflicts[key])continue;
        const payload=current[key];if(payload===undefined)continue;
        const pushed=await rpc('vt_push_document',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret,p_doc_key:key,p_payload:payload,p_base_revision:Number(cfg.revisions[key])||0});
        if(pushed?.ok){
          cfg.revisions[key]=Number(pushed.revision)||cfg.revisions[key]||1;
          runtime.snapshots.set(key,docString(payload));dirty.delete(key);delete conflicts[key];
        }else if(pushed?.conflict)conflicts[key]=Number(pushed.revision)||1;
        else throw new Error(pushed?.error||('Upload fehlgeschlagen: '+key));
      }
      cfg.dirtyKeys=[...dirty];cfg.conflicts=conflicts;cfg.lastSync=new Date().toISOString();persistCfg(cfg);return status();
    }finally{runtime.busy=false}
  }

  async function resolveConflict(key,strategy='remote'){
    const cfg=loadConfig(),docKey=String(key||''),mode=strategy==='local'?'local':'remote';
    if(!cfg.enabled)throw new Error('Familiensync ist auf diesem Gerät nicht verbunden.');
    if(!cfg.conflicts?.[docKey])return status();
    if(runtime.busy)throw new Error('Synchronisierung läuft bereits.');
    runtime.busy=true;
    try{
      const pulled=await rpc('vt_pull_documents',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret});
      if(!pulled?.ok)throw new Error(pulled?.error||'Cloud-Stand nicht erreichbar.');
      const remote=(pulled.documents||[]).find(d=>String(d.key||'')===docKey);
      if(!remote)throw new Error('Der Konfliktstand ist in der Cloud nicht mehr vorhanden.');
      const remoteRev=Number(remote.revision)||0,dirty=new Set(cfg.dirtyKeys||[]),conflicts={...cfg.conflicts};
      if(mode==='remote'){
        applyDocument(docKey,remote.payload);
        ensureActiveSubject();
        if(!(await persistState()))throw new Error('Cloud-Stand konnte lokal nicht sicher gespeichert werden.');
        cfg.revisions[docKey]=remoteRev;runtime.snapshots.set(docKey,docString(remote.payload));
      }else{
        if(!canWrite(cfg,docKey))throw new Error('Dieses Gerät darf diesen Datenbereich nicht überschreiben.');
        const payload=serializeDocuments()[docKey];
        if(payload===undefined)throw new Error('Lokaler Konfliktstand ist nicht mehr vorhanden.');
        const pushed=await rpc('vt_push_document',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret,p_doc_key:docKey,p_payload:payload,p_base_revision:remoteRev});
        if(!pushed?.ok){
          if(pushed?.conflict){conflicts[docKey]=Number(pushed.revision)||remoteRev||1;cfg.conflicts=conflicts;persistCfg(cfg);throw new Error('Der Cloud-Stand wurde erneut geändert. Bitte Konflikt nochmals prüfen.')}
          throw new Error(pushed?.error||'Konflikt konnte nicht aufgelöst werden.');
        }
        cfg.revisions[docKey]=Number(pushed.revision)||remoteRev+1;runtime.snapshots.set(docKey,docString(payload));
      }
      dirty.delete(docKey);delete conflicts[docKey];cfg.dirtyKeys=[...dirty];cfg.conflicts=conflicts;cfg.lastSync=new Date().toISOString();persistCfg(cfg);
      renderAll?.();return status();
    }finally{runtime.busy=false}
  }

  async function replaceCloudWithCurrent(){
    const cfg=loadConfig();
    if(!cfg.enabled)return {ok:true,localOnly:true};
    if(cfg.role!=='parent')return {ok:false,skipped:true,reason:'parent-required'};
    if(runtime.busy)return {ok:false,skipped:true,reason:'busy'};
    runtime.busy=true;
    try{
      const pulled=await rpc('vt_pull_documents',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret});
      if(!pulled?.ok)throw new Error(pulled?.error||'Cloud-Stand nicht erreichbar.');
      const remoteRev=new Map((pulled.documents||[]).map(d=>[String(d.key||''),Number(d.revision)||0]));
      const docs=serializeDocuments();
      const revisions={...cfg.revisions};
      for(const [key,payload] of Object.entries(docs)){
        if(!canWrite(cfg,key))continue;
        const base=remoteRev.has(key)?remoteRev.get(key):(Number(revisions[key])||0);
        const pushed=await rpc('vt_push_document',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret,p_doc_key:key,p_payload:payload,p_base_revision:base});
        if(!pushed?.ok)throw new Error(pushed?.error||('Bereinigter Stand konnte nicht hochgeladen werden: '+key));
        revisions[key]=Number(pushed.revision)||base+1;
      }
      cfg.revisions=revisions;cfg.dirtyKeys=[];cfg.conflicts={};cfg.lastSync=new Date().toISOString();persistCfg(cfg);initSnapshots();
      return {ok:true,localOnly:false};
    }finally{runtime.busy=false}
  }

  async function listDevices(){
    const cfg=loadConfig();if(!cfg.enabled||cfg.role!=='parent')return [];
    const r=await rpc('vt_list_devices',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret});
    if(!r?.ok)remoteFailure(cfg,r,'Geräteliste konnte nicht geladen werden.');return r.devices||[];
  }
  async function revokeDevice(deviceId){
    const cfg=loadConfig();if(!cfg.enabled||cfg.role!=='parent')throw new Error('Nur Eltern-Geräte können Geräte entfernen.');
    const r=await rpc('vt_revoke_device',{p_family_id:cfg.familyId,p_device_id:cfg.deviceId,p_device_secret:cfg.deviceSecret,p_target_device_id:deviceId});
    if(!r?.ok)remoteFailure(cfg,r,'Gerät konnte nicht entfernt werden.');return true;
  }
  function disconnectLocal(){
    localStorage.removeItem(CONFIG_KEY);clearTimeout(runtime.timer);clearInterval(runtime.poll);runtime.snapshots.clear();
  }
  function status(){
    const cfg=loadConfig(),conflictKeys=Object.keys(cfg.conflicts||{});return {
      enabled:cfg.enabled,familyId:cfg.familyId,role:cfg.role,profileId:cfg.profileId,
      lastSync:cfg.lastSync,dirty:(cfg.dirtyKeys||[]).length,conflicts:conflictKeys.length,conflictKeys,busy:runtime.busy,
      revoked:cfg.revoked===true,revokedAt:cfg.revokedAt||''
    };
  }
  function bootstrap(){
    const cfg=loadConfig();clearInterval(runtime.poll);if(!cfg.enabled)return;
    initSnapshots();setTimeout(()=>syncNow(false).catch(e=>console.warn('Family sync bootstrap',e)),800);
    runtime.poll=setInterval(()=>{if(!document.hidden)syncNow(false).catch(e=>console.warn('Family sync poll',e))},30000);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncNow(false).catch(e=>console.warn('Family sync resume',e))});
  }

  window.VTFamilySync={serializeDocuments,status,createFamily,joinParent,createParentInvite,claimParentInvite,createChildInvite,claimChildInvite,syncNow,resolveConflict,replaceCloudWithCurrent,markLocalChange,listDevices,revokeDevice,disconnectLocal,bootstrap};
})();
