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
  assert(await page.evaluate(()=>learner().name)==='Lokales Kind','revocation does not delete local learning data');
  await page.evaluate(()=>renderFamilySync());
  assert((await page.locator('#familySyncStatus').textContent())?.includes('Lokale Daten bleiben erhalten'),'settings explain local data retention after revoke');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer family sync UI smoke: passed');
}finally{
  await browser.close();
}
