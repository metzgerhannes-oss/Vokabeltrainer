import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Family sync UI smoke failed: '+m)};
const CONFIG_KEY='vokabeltrainer_family_sync_v1';
const familyConfig=(overrides={})=>({
  enabled:true,
  familyId:'family_test01',
  deviceId:'device_test_123456',
  deviceSecret:'a'.repeat(64),
  role:'parent',
  profileId:'',
  revisions:{shared:1},
  dirtyKeys:[],
  conflicts:{},
  lastSync:'2026-09-25T20:00:00.000Z',
  revoked:false,
  revokedAt:'',
  ...overrides
});

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&window.VTFamilySync&&typeof renderFamilySync==='function');

  await page.evaluate(({key,cfg})=>{
    state=defaultState();
    state.learners[0].name='Lokales Kind';
    localStorage.setItem(key,JSON.stringify(cfg));
    appRole='parent';applyRoleUi();renderAll();showView('settingsView');renderFamilySync();
  },{key:CONFIG_KEY,cfg:familyConfig({dirtyKeys:['shared'],conflicts:{shared:2}})});

  assert(await page.locator('#familySyncStatus').getByText('Synchronisationskonflikt').count()===1,'conflict is visible in settings');
  assert(await page.locator('#familyConflictResolveBtn').isVisible(),'conflict exposes an explicit resolution action');
  await page.locator('#familyConflictResolveBtn').click();
  await page.waitForSelector('#modal[open]');
  assert((await page.locator('#modalContent').textContent())?.includes('Gemeinsame Vokabel- und Lehrwerksdaten'),'resolver names the affected data area');
  assert(await page.locator('[data-sync-conflict-remote="shared"]').isVisible(),'resolver offers cloud state');
  assert(await page.locator('[data-sync-conflict-local="shared"]').isVisible(),'resolver offers local state');
  assert(await page.locator('#familyConflictBackupBtn').isVisible(),'resolver offers backup before overwrite');

  await page.route('https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/vt_pull_documents',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      ok:true,
      family_id:'family_test01',
      role:'parent',
      profile_id:null,
      documents:[{key:'shared',revision:2,payload:{schema:1,vocabulary:[],books:[],bookVocabulary:[]},updated_at:'2026-09-25T20:10:00.000Z'}]
    })});
  });
  await page.locator('[data-sync-conflict-remote="shared"]').click();
  await page.waitForFunction(()=>window.VTFamilySync.status().conflicts===0);
  assert(await page.evaluate(()=>learner().name)==='Lokales Kind','resolving shared conflict preserves local learner profile');
  assert(await page.evaluate(()=>VTFamilySync.status().dirty===0),'resolved conflict clears dirty document');
  await page.unroute('https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/vt_pull_documents');

  await page.evaluate(({key,cfg})=>{
    localStorage.setItem(key,JSON.stringify(cfg));
    renderFamilySync();
    openFamilySyncSwitch();
  },{key:CONFIG_KEY,cfg:familyConfig()});
  await page.waitForSelector('#modal[open] #familySwitchJoinBtn');
  await page.locator('#familySwitchJoinBtn').click();
  await page.waitForSelector('#modal[open] #familySyncJoinBtn');
  const preserved=await page.evaluate(()=>VTFamilySync.status());
  assert(preserved.enabled&&preserved.familyId==='family_test01','opening family switch keeps old connection until new join succeeds');
  assert(await page.locator('#familyParentJoinBackupBtn').isVisible(),'parent family join offers backup');
  await page.locator('#familySyncBackBtn').click();
  await page.evaluate(()=>closeModal());

  const joinUrl='https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/vt_join_parent';
  const pullUrl='https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/vt_pull_documents';
  await page.route(joinUrl,async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,family_id:'family_new01',role:'parent'})});
  });
  await page.route(pullUrl,async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      ok:true,family_id:'family_new01',role:'parent',profile_id:null,
      documents:[
        {key:'shared',revision:1,payload:{schema:1,vocabulary:[],books:[],bookVocabulary:[]}},
        {key:'profile/learner_new/setup',revision:1,payload:{schema:1,learner:{id:'learner_new',name:'Neue Familie',activeSubjects:['english']},sets:[],setVocabulary:[],learnerBooks:[],grades:[]}},
        {key:'profile/learner_new/progress',revision:1,payload:{schema:1,learner:{id:'learner_new'},learnerVocabulary:[],practiceTests:[],activity:[]}}
      ]
    })});
  });
  const rollback=await page.evaluate(async({key,cfg})=>{
    state=defaultState();state.learners[0].name='Rollback Kind';
    localStorage.setItem(key,JSON.stringify(cfg));
    await persistState();
    const original=persistState;let calls=0,error='';
    persistState=async()=>{calls++;return calls===1?false:original()};
    try{await VTFamilySync.joinParent('family_new01','123456','Rollback-Test')}catch(e){error=String(e?.message||e)}
    finally{persistState=original}
    const stored=JSON.parse(localStorage.getItem(key)||'{}');
    return {error,familyId:stored.familyId||'',learnerName:learner()?.name||'',calls};
  },{key:CONFIG_KEY,cfg:familyConfig()});
  assert(rollback.error.includes('nicht sicher gespeichert'),'failed takeover reports local persistence failure: '+JSON.stringify(rollback));
  assert(rollback.familyId==='family_test01','failed family switch restores previous sync configuration');
  assert(rollback.learnerName==='Rollback Kind','failed family switch restores previous learning state');
  assert(rollback.calls>=2,'failed family switch persists rollback state');
  await page.unroute(joinUrl);await page.unroute(pullUrl);

  const setupFields=await page.evaluate(()=>{
    state=defaultState();state.learners[0].avatarStyle='female';state.learners[0].autoSpeakCorrection=false;
    const learner=VTFamilySync.serializeDocuments()['profile/learner_demo/setup'].learner;
    return {avatarStyle:learner.avatarStyle,autoSpeakCorrection:learner.autoSpeakCorrection};
  });
  assert(setupFields.avatarStyle==='female'&&setupFields.autoSpeakCorrection===false,'profile appearance and speech correction serialize into setup');

  await page.evaluate(({key,cfg})=>{
    state=defaultState();
    state.learners.push({...state.learners[0],id:'learner_second',name:'Zweites Profil'});
    localStorage.setItem(key,JSON.stringify(cfg));
    appRole='parent';applyRoleUi();deleteProfile('learner_second');
  },{key:CONFIG_KEY,cfg:familyConfig()});
  await page.waitForSelector('#modal[open]');
  assert((await page.locator('#modalContent').textContent())?.includes('Deshalb wird hier nichts gelöscht'),'synced profile deletion is explicitly blocked');
  assert(await page.evaluate(()=>state.learners.some(l=>l.id==='learner_second')),'blocked profile deletion preserves learner');
  await page.evaluate(()=>closeModal());

  await page.evaluate(async({key,cfg})=>{
    VTFamilySync.disconnectLocal();
    state=defaultState();state.learners[0].name='Persist Alt';
    await persistState();
    localStorage.setItem(key,JSON.stringify({...cfg,revisions:{shared:1,'profile/learner_demo/setup':1,'profile/learner_demo/progress':1}}));
    VTFamilySync.markLocalChange();
  },{key:CONFIG_KEY,cfg:familyConfig()});
  await page.route('https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/vt_pull_documents',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({
      ok:true,family_id:'family_test01',role:'parent',profile_id:null,
      documents:[
        {key:'shared',revision:1,payload:{schema:1,vocabulary:[],books:[],bookVocabulary:[]}},
        {key:'profile/learner_demo/setup',revision:2,payload:{schema:1,learner:{id:'learner_demo',name:'Cloud Neu',activeSubjects:['english']},sets:[],setVocabulary:[],learnerBooks:[],grades:[]}},
        {key:'profile/learner_demo/progress',revision:1,payload:{schema:1,learner:{id:'learner_demo'},learnerVocabulary:[],practiceTests:[],activity:[]}}
      ]
    })});
  });
  const failedRemotePersist=await page.evaluate(async()=>{
    const original=persistState;persistState=async()=>false;let error='';
    try{await VTFamilySync.syncNow(true)}catch(e){error=String(e?.message||e)}
    finally{persistState=original}
    VTFamilySync.markLocalChange();
    return {error,name:learner()?.name||'',dirty:VTFamilySync.status().dirty};
  });
  assert(failedRemotePersist.error.includes('nicht sicher gespeichert'),'failed remote persistence is surfaced');
  assert(failedRemotePersist.name==='Persist Alt','failed remote persistence restores in-memory learner state');
  assert(failedRemotePersist.dirty===0,'failed remote persistence restores sync snapshots without false local conflict');
  await page.unroute('https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/vt_pull_documents');

  await page.evaluate(({key,cfg})=>{
    localStorage.setItem(key,JSON.stringify(cfg));
    renderFamilySync();
  },{key:CONFIG_KEY,cfg:familyConfig()});
  await page.route('https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/vt_pull_documents',async route=>{
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:false,error:'unauthorized'})});
  });
  const revokeMessage=await page.evaluate(async()=>{
    try{await VTFamilySync.syncNow(true);return ''}catch(e){return String(e?.message||e)}
  });
  assert(revokeMessage.includes('aus dem Familienverbund entfernt'),'revoked device receives clear message');
  const revoked=await page.evaluate(()=>VTFamilySync.status());
  assert(!revoked.enabled&&revoked.revoked,'revoked device disables sync locally');
  const revokedStored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)||'{}'),CONFIG_KEY);
  assert(!revokedStored.deviceId&&!revokedStored.deviceSecret,'revocation discards obsolete local device credentials');
  assert(await page.evaluate(()=>learner().name)==='Lokales Kind','revocation does not delete local learning data');
  await page.evaluate(()=>renderFamilySync());
  assert((await page.locator('#familySyncStatus').textContent())?.includes('Lokale Daten bleiben erhalten'),'settings explain local data retention after revoke');

  const directContext=await browser.newContext();
  const directPage=await directContext.newPage();
  directPage.setDefaultTimeout(10000);
  directPage.on('pageerror',e=>errors.push(String(e?.message||e)));
  directPage.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const directResponse=await directPage.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(directResponse?.ok(),'desktop direct-invite app loads');
  await directPage.waitForFunction(()=>window.__VT_APP_READY__===true&&window.VTFamilySync&&window.handleChildInviteFromUrl);
  await directPage.evaluate(()=>{
    localStorage.removeItem('vokabeltrainer_family_sync_v1');
    history.replaceState(null,'',location.pathname+location.search+'#childInvite='+('b'.repeat(48))+'&childName=Testkind');
    handleChildInviteFromUrl();
  });
  await directPage.waitForSelector('#modal[open] #claimChildInviteBtn');
  assert(await directPage.locator('#claimChildBackupBtn').isVisible(),'direct child QR/link takeover offers backup');
  assert((await directPage.locator('#claimChildInviteResult').textContent())?.includes('lokale Lerndaten werden ersetzt'),'direct child takeover warns about replacement');
  await directPage.evaluate(()=>{closeModal();history.replaceState(null,'',location.pathname+location.search+'#parentInvite='+('c'.repeat(48)));handleParentInviteFromUrl()});
  await directPage.waitForSelector('#modal[open] #claimParentInviteBtn');
  assert(await directPage.locator('#claimParentBackupBtn').isVisible(),'direct parent QR/link takeover offers backup');
  assert((await directPage.locator('#claimParentInviteResult').textContent())?.includes('lokale Daten können ersetzt werden'),'direct parent takeover warns about replacement');
  await directContext.close();

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer family sync UI smoke: passed');
}finally{
  await browser.close();
}
