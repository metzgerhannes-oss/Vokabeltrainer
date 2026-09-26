import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13']});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(value,message)=>{if(!value)throw new Error('Backup/restore smoke failed: '+message)};

async function toastText(){
  return (await page.locator('#toastRegion').textContent())||'';
}

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&state!==null&&typeof backup==='function'&&typeof restore==='function'&&typeof inspectBackup==='function');

  await page.evaluate(async()=>{
    state=defaultState();
    state.learners[0].name='Restore Kind';
    state.learners[0].gradeLevel='5';
    state.activeLearnerId=state.learners[0].id;
    state.activeSubject='english';
    const set={
      id:'restore_set',
      learnerId:state.activeLearnerId,
      subject:'english',
      title:'Restore Test',
      schoolYear:currentSchoolYear(),
      bookId:'',
      bookSection:'Unit Restore',
      testDate:datePlusDays(5),
      testScopeMode:'set',
      testFrom:1,
      testTo:0,
      testFormat:'target',
      testSelectedLinkIds:[],
      from:'',
      to:'',
      pairReviewRequired:false,
      pairVerifiedAt:new Date().toISOString()
    };
    state.sets.push(set);
    const attached=attachVocabularyToSet(set.id,{
      term:'reliable',
      translation:'zuverlässig',
      source:'backup-smoke',
      verified:true
    });
    const progress=(state.learnerVocabulary||[]).find(x=>x.vocabId===attached.vocab.id);
    progress.skills={recognition:3,listening:2,retrieval:4,spelling:3,context:2};
    progress.independentSuccesses=5;
    progress.intervalDays=7;
    progress.dueDate=datePlusDays(4);
    state.grades.push({
      id:'restore_grade',
      learnerId:state.activeLearnerId,
      date:today(),
      subject:'english',
      grade:'2',
      note:'Backup Test'
    });
    state.learners[0].testSeries.english={
      setId:set.id,
      scopeMode:'set',
      selectedLinkIds:[],
      weekday:5,
      nextDate:set.testDate
    };
    await persistState();
    renderAll();
    enterParentMode('settingsView');
  });

  assert(await page.locator('#settingsView.active').count()===1,'parent settings view is active');
  await page.evaluate(()=>{
    window.__backupCapture={name:'',blob:null};
    const originalCreate=URL.createObjectURL.bind(URL);
    window.__backupOriginalCreateObjectURL=originalCreate;
    URL.createObjectURL=blob=>{
      window.__backupCapture.blob=blob;
      return originalCreate(blob);
    };
    window.__backupOriginalAnchorClick=HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click=function(){
      window.__backupCapture.name=this.download||'';
    };
  });
  await page.locator('#backupBtn').click();
  const captured=await page.evaluate(async()=>({
    name:window.__backupCapture?.name||'',
    text:window.__backupCapture?.blob?await window.__backupCapture.blob.text():''
  }));
  await page.evaluate(()=>{
    if(window.__backupOriginalCreateObjectURL)URL.createObjectURL=window.__backupOriginalCreateObjectURL;
    if(window.__backupOriginalAnchorClick)HTMLAnchorElement.prototype.click=window.__backupOriginalAnchorClick;
  });
  assert(/^vokabeltrainer_backup_\d{4}-\d{2}-\d{2}\.json$/.test(captured.name),'backup filename is recognizable');
  assert(captured.text.length>100,'backup produces non-empty JSON content');
  const exportedText=captured.text;
  const exported=JSON.parse(exportedText);
  assert(exported.backupMeta?.appVersion,'backup contains app version metadata');
  assert(exported.backupMeta?.exportedAt,'backup contains export timestamp');
  assert(exported.learners?.some(x=>x.name==='Restore Kind'),'backup contains learner profile');
  assert(exported.sets?.some(x=>x.id==='restore_set'),'backup contains vocabulary set');
  assert(exported.grades?.some(x=>x.id==='restore_grade'),'backup contains grade history');
  assert(exported.learnerVocabulary?.some(x=>Number(x.intervalDays)===7),'backup contains learning progress');

  await page.evaluate(async()=>{
    const replacement=defaultState();
    replacement.learners[0].name='Aktueller Gerätestand';
    replacement.sets=[];
    replacement.vocabulary=[];
    replacement.setVocabulary=[];
    replacement.learnerVocabulary=[];
    replacement.grades=[];
    state=replacement;
    await persistState();
    renderAll();
    enterParentMode('settingsView');
  });
  assert(await page.evaluate(()=>learner().name)==='Aktueller Gerätestand','current state differs before restore');

  const input=page.locator('#fileInput');
  await input.evaluate(el=>{el.dataset.mode='restore'});
  await input.setInputFiles({name:'valid-backup.json',mimeType:'application/json',buffer:Buffer.from(exportedText)});
  await page.waitForSelector('#confirmRestore');
  const modalText=(await page.locator('#modal').textContent())||'';
  assert(modalText.includes('Aktuelle Daten ersetzen?'),'restore requires explicit replacement confirmation');
  assert(modalText.includes('Vorher sichern'),'restore offers a pre-restore backup');
  await page.locator('#confirmRestore').click();
  await page.waitForFunction(()=>document.querySelector('#toastRegion')?.textContent?.includes('Backup vollständig geprüft und eingespielt.'));
  assert(await page.evaluate(()=>learner().name)==='Restore Kind','learner profile is restored');
  assert(await page.evaluate(()=>state.sets.some(x=>x.id==='restore_set')),'vocabulary set is restored');
  assert(await page.evaluate(()=>state.grades.some(x=>x.id==='restore_grade')),'grade history is restored');
  assert(await page.evaluate(()=>state.learners[0].testSeries?.english?.setId)==='restore_set','test planning is restored');
  assert(await page.evaluate(()=>state.learnerVocabulary.some(x=>Number(x.intervalDays)===7)),'learning progress is restored');
  const persistedSummary=await page.evaluate(async()=>{
    const persisted=persistenceMode==='indexeddb'?await idbGet():JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    return persisted?backupSummary(persisted):null;
  });
  const liveSummary=await page.evaluate(()=>backupSummary(state));
  assert(JSON.stringify(persistedSummary)===JSON.stringify(liveSummary),'restored state is persisted and read back identically');

  const CONFIG_KEY='vokabeltrainer_family_sync_v1';
  await page.evaluate(async key=>{
    state.learners.push({...state.learners[0],id:'learner_sync_second',name:'Sync Zweitprofil',dailyPlans:{},streakDays:[],milestones:{},fortressWinsByYear:{},campaignLog:[]});
    await persistState();
    localStorage.setItem(key,JSON.stringify({
      enabled:true,familyId:'family_restore01',deviceId:'device_restore_123456',deviceSecret:'d'.repeat(64),
      role:'parent',profileId:'',revisions:{shared:1,'profile/learner_demo/setup':1,'profile/learner_demo/progress':1,'profile/learner_sync_second/setup':1,'profile/learner_sync_second/progress':1},
      dirtyKeys:[],conflicts:{},lastSync:'2026-09-26T04:00:00.000Z',revoked:false,revokedAt:''
    }));
  },CONFIG_KEY);
  await page.evaluate(text=>restore(text),exportedText);
  await page.waitForSelector('#modal[open]');
  const blockedRestoreText=(await page.locator('#modalContent').textContent())||'';
  assert(blockedRestoreText.includes('Restore im Familiensync gestoppt'),'synced restore blocks implicit profile deletion');
  assert(await page.locator('#confirmRestore').count()===0,'blocked synced restore has no destructive confirm action');
  assert(await page.evaluate(()=>state.learners.some(l=>l.id==='learner_sync_second')),'blocked synced restore preserves missing family profile');
  await page.evaluate(()=>closeModal());

  await page.evaluate(async()=>{
    state.learners=state.learners.filter(l=>l.id!=='learner_sync_second');
    await persistState();
    window.__restoreOriginalMarkAll=VTFamilySync.markAllLocalDocumentsDirty;
    window.__restoreSyncMarked=false;
    VTFamilySync.markAllLocalDocumentsDirty=()=>{window.__restoreSyncMarked=true;return VTFamilySync.status()};
  });
  await page.evaluate(text=>restore(text),exportedText);
  await page.waitForSelector('#confirmRestore');
  assert(((await page.locator('#modalContent').textContent())||'').includes('zur Synchronisierung vorgemerkt'),'allowed synced restore explains cloud follow-up');
  await page.locator('#confirmRestore').click();
  await page.waitForFunction(()=>window.__restoreSyncMarked===true);
  assert(await page.evaluate(()=>window.__restoreSyncMarked===true),'successful synced restore marks all local documents for upload');

  const beforeBlockedReset=await page.evaluate(()=>JSON.stringify(backupSummary(state)));
  await page.evaluate(()=>resetAppData());
  await page.waitForSelector('#modal[open]');
  assert(((await page.locator('#modalContent').textContent())||'').includes('Gesamtlöschung im Familiensync gesperrt'),'global reset is blocked while family sync is active');
  assert(await page.locator('#confirmReset').count()===0,'blocked synced reset cannot be confirmed');
  assert(await page.evaluate(()=>JSON.stringify(backupSummary(state)))===beforeBlockedReset,'blocked synced reset preserves current state');
  await page.evaluate(key=>{
    closeModal();
    if(window.__restoreOriginalMarkAll)VTFamilySync.markAllLocalDocumentsDirty=window.__restoreOriginalMarkAll;
    localStorage.removeItem(key);
  },CONFIG_KEY);

  const beforeInvalid=await page.evaluate(()=>JSON.stringify(backupSummary(state)));
  await input.evaluate(el=>{el.dataset.mode='restore'});
  await input.setInputFiles({
    name:'manipulated.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify({learners:[],sets:[],vocabulary:[],setVocabulary:[],learnerVocabulary:[]}))
  });
  await page.waitForFunction(()=>document.querySelector('#toastRegion')?.textContent?.includes('kein Lernprofil'));
  assert(await page.evaluate(()=>JSON.stringify(backupSummary(state)))===beforeInvalid,'invalid backup does not change current state');

  await input.evaluate(el=>{el.dataset.mode='restore'});
  const huge=Buffer.alloc(25*1024*1024+1,32);
  await input.setInputFiles({name:'oversize.json',mimeType:'application/json',buffer:huge});
  await page.waitForFunction(()=>document.querySelector('#toastRegion')?.textContent?.includes('Backup ist zu groß'));
  assert(await page.evaluate(()=>JSON.stringify(backupSummary(state)))===beforeInvalid,'oversized backup is rejected before state mutation');

  const rollbackResult=await page.evaluate(async text=>{
    const before=JSON.stringify(backupSummary(state));
    const originalPersist=persistState;
    persistState=async()=>false;
    restore(text);
    return {before,canPatch:persistState!==originalPersist};
  },exportedText);
  assert(rollbackResult.canPatch,'persistence failure can be simulated');
  await page.waitForSelector('#confirmRestore');
  await page.locator('#confirmRestore').click();
  await page.waitForFunction(()=>document.querySelector('#toastRegion')?.textContent?.includes('Aktuelle Daten wurden beibehalten.'));
  assert(await page.evaluate(()=>JSON.stringify(backupSummary(state)))===rollbackResult.before,'failed persistence rolls back to previous in-memory state');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&state!==null);
  assert(await page.evaluate(()=>learner().name)==='Restore Kind','rollback also preserves previously persisted state');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer backup/restore UI smoke: passed');
}finally{
  await browser.close();
}
