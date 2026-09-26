import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const CONFIG_KEY='vokabeltrainer_family_sync_v1';
const PROFILE_ID='learner_demo';
const FAMILY_ID='family_progress01';
const browser=await webkit.launch({headless:true});
const contextA=await browser.newContext(devices['iPhone 13']);
const contextB=await browser.newContext(devices['iPhone 13']);
const cloud=new Map();
const assert=(v,m)=>{if(!v)throw new Error('Family sync learning-progress smoke failed: '+m)};
const clone=x=>JSON.parse(JSON.stringify(x));

const installCloudMock=async context=>{
  await context.route('https://ilfblkqxbldkzmqczbgo.supabase.co/rest/v1/rpc/**',async route=>{
    const req=route.request(),name=new URL(req.url()).pathname.split('/').pop(),body=JSON.parse(req.postData()||'{}');
    if(name==='vt_pull_documents'){
      const documents=[...cloud.entries()].map(([key,row])=>({key,revision:row.revision,payload:clone(row.payload),updated_at:new Date().toISOString()}));
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,family_id:FAMILY_ID,role:'child',profile_id:PROFILE_ID,documents})});
      return;
    }
    if(name==='vt_push_document'){
      const key=String(body.p_doc_key||''),current=cloud.get(key);
      if(!current){await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:false,error:'missing_document'})});return}
      const baseRevision=Number(body.p_base_revision)||0;
      if(baseRevision!==current.revision){
        await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:false,conflict:true,revision:current.revision})});
        return;
      }
      const revision=current.revision+1;
      cloud.set(key,{revision,payload:clone(body.p_payload)});
      await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({ok:true,revision})});
      return;
    }
    await route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({ok:false,error:'unexpected_rpc_'+name})});
  });
};

const openApp=async context=>{
  const page=await context.newPage();
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&window.VTFamilySync&&typeof buildDailyPlan==='function');
  return page;
};

try{
  await installCloudMock(contextA);
  await installCloudMock(contextB);
  const pageA=await openApp(contextA);
  const pageB=await openApp(contextB);

  const baseState=await pageA.evaluate(async()=>{
    state=defaultState();
    const l=learner(),set={
      id:'sync_progress_set',learnerId:l.id,subject:'english',title:'Sync Lernstand',
      schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',
      testSelectedLinkIds:[],testFrom:1,testTo:0,testFormat:'target',from:'',to:'',
      pairReviewRequired:false,pairVerifiedAt:'',pairVerifiedSignature:''
    };
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'remember',translation:'sich erinnern',source:'manual',verified:true});
    rebuildWordIndexes();
    await persistState();
    renderAll();
    if(schoolYearVerifiedWords('english').length!==1)throw new Error('fixture word is not learning-ready');
    return structuredClone(state);
  });

  await pageB.evaluate(async seed=>{
    state=typeof hardenState==='function'?hardenState(structuredClone(seed)):structuredClone(seed);
    ensureActiveSubject();rebuildWordIndexes();await persistState();renderAll();
  },baseState);

  const docs=await pageA.evaluate(()=>VTFamilySync.serializeDocuments());
  for(const [key,payload] of Object.entries(docs))cloud.set(key,{revision:1,payload:clone(payload)});
  const revisions=Object.fromEntries([...cloud.keys()].map(k=>[k,1]));
  const config=deviceId=>({
    enabled:true,familyId:FAMILY_ID,deviceId,deviceSecret:'a'.repeat(64),role:'child',profileId:PROFILE_ID,
    revisions:{...revisions},dirtyKeys:[],conflicts:{},lastSync:'2026-09-26T10:00:00.000Z',revoked:false,revokedAt:''
  });

  for(const [page,id] of [[pageA,'device_learning_a'],[pageB,'device_learning_b']]){
    await page.evaluate(({key,cfg})=>{
      localStorage.setItem(key,JSON.stringify(cfg));
      VTFamilySync.markLocalChange();
    },{key:CONFIG_KEY,cfg:config(id)});
    assert((await page.evaluate(()=>VTFamilySync.status().dirty))===0,'initial sync snapshot is clean');
  }

  const completed=await pageA.evaluate(async()=>{
    const plan=buildDailyPlan('english'),before=dailyPlanStatus(plan),word=schoolYearVerifiedWords('english')[0];
    const progress=state.learnerVocabulary.find(p=>p.id===word.id)||state.learnerVocabulary.find(p=>p.senseId===word.senseId);
    if(!progress)throw new Error('progress record missing');
    const marked=markDailyPlanWordDone(word,plan),stamp=new Date().toISOString(),day=today();
    progress.successes=(Number(progress.successes)||0)+1;
    progress.independentSuccesses=(Number(progress.independentSuccesses)||0)+1;
    progress.activePracticeDays=[...new Set([...(progress.activePracticeDays||[]),day])];
    progress.activeSuccessDays=[...new Set([...(progress.activeSuccessDays||[]),day])];
    progress.lastSuccessAt=stamp;progress.lastActiveSuccessAt=stamp;progress.intervalDays=1;progress.dueDate=datePlusDays(1);
    progress.skills={...(progress.skills||{}),retrieval:Math.max(1,Number(progress.skills?.retrieval)||0)};
    learner().xp=(Number(learner().xp)||0)+3;
    recordActivity('adaptive',{wordId:word.id,correct:true,active:true,syncAcceptance:true});
    await persistState();VTFamilySync.markLocalChange();
    const after=dailyPlanStatus(plan);
    return {
      marked,day,planKey:day+':english',completedKey:plan.completedKeys?.[0]||'',
      beforeTotal:before.total,afterDone:after.done,successes:progress.successes,dueDate:progress.dueDate,xp:learner().xp
    };
  });
  assert(completed.marked&&completed.beforeTotal>=1&&completed.afterDone>=1&&completed.completedKey,'device A records a completed daily-learning item');
  assert((await pageA.evaluate(()=>VTFamilySync.status().dirty))===1,'completed lesson marks only the child progress document dirty');

  await pageA.evaluate(()=>VTFamilySync.syncNow(true));
  assert(cloud.get('profile/'+PROFILE_ID+'/progress')?.revision===2,'device A uploads the progress document');

  await pageB.evaluate(()=>VTFamilySync.syncNow(true));
  const received=await pageB.evaluate(({planKey,completedKey})=>{
    const plan=learner().dailyPlans?.[planKey],status=plan?dailyPlanStatus(plan):null;
    const progress=state.learnerVocabulary[0];
    return {
      hasPlan:!!plan,hasCompletion:!!plan?.completedKeys?.includes(completedKey),done:status?.done||0,
      successes:Number(progress?.successes)||0,dueDate:progress?.dueDate||'',xp:Number(learner().xp)||0,
      activePracticeDays:[...(progress?.activePracticeDays||[])],
      activity:(state.activity||[]).filter(a=>a.syncAcceptance).map(a=>({type:a.type,date:a.date}))
    };
  },completed);
  assert(received.hasPlan&&received.hasCompletion&&received.done>=1,'device B receives the exact completed daily-plan item');
  assert(received.successes===completed.successes&&received.dueDate===completed.dueDate,'device B receives the vocabulary learning progress');
  assert(received.xp===completed.xp&&received.activePracticeDays.includes(completed.day),'device B receives XP and active practice day');
  assert(received.activity.some(a=>a.type==='adaptive'),'device B receives the matching learning activity');

  await pageB.reload({waitUntil:'domcontentloaded'});
  await pageB.waitForFunction(()=>window.__VT_APP_READY__===true);
  const afterReload=await pageB.evaluate(({planKey,completedKey})=>{
    const plan=learner().dailyPlans?.[planKey],progress=state.learnerVocabulary[0];
    return {completion:!!plan?.completedKeys?.includes(completedKey),successes:Number(progress?.successes)||0,activity:(state.activity||[]).some(a=>a.syncAcceptance)};
  },completed);
  assert(afterReload.completion&&afterReload.successes===completed.successes&&afterReload.activity,'synced completion survives an app reload on device B');

  await pageB.close();
  await contextB.addInitScript("(()=>{const RealDate=Date,offset=24*60*60*1000;globalThis.Date=class extends RealDate{constructor(...args){super(...(args.length?args:[RealDate.now()+offset]))}static now(){return RealDate.now()+offset}static parse(v){return RealDate.parse(v)}static UTC(...args){return RealDate.UTC(...args)}}})()");
  const tomorrowPage=await openApp(contextB);
  const nextDay=await tomorrowPage.evaluate(({planKey,completedKey,day,successes})=>{
    const oldPlan=learner().dailyPlans?.[planKey],progress=state.learnerVocabulary[0];
    const tomorrowPlan=buildDailyPlan('english');
    return {
      today:today(),oldCompletion:!!oldPlan?.completedKeys?.includes(completedKey),
      oldDone:oldPlan?dailyPlanStatus(oldPlan).done:0,
      successes:Number(progress?.successes)||0,
      activePracticeDays:[...(progress?.activePracticeDays||[])],
      activity:(state.activity||[]).some(a=>a.syncAcceptance),
      tomorrowPlanDate:tomorrowPlan?.date||''
    };
  },completed);
  assert(nextDay.today!==completed.day&&nextDay.tomorrowPlanDate===nextDay.today,'test is running on the simulated following day');
  assert(nextDay.oldCompletion&&nextDay.oldDone>=1,'yesterday completed lesson remains stored on the following day');
  assert(nextDay.successes===completed.successes&&nextDay.activePracticeDays.includes(completed.day)&&nextDay.activity,'learned progress remains intact across the day boundary');

  console.log('Vokabeltrainer family sync learning-progress UI smoke: passed');
  console.log('✓ completed daily-plan state synced from device A to device B');
  console.log('✓ vocabulary progress, activity and XP synced with the completion');
  console.log('✓ synced completion survives reload and the following day');
}finally{
  await contextA.close().catch(()=>{});
  await contextB.close().catch(()=>{});
  await browser.close();
}
