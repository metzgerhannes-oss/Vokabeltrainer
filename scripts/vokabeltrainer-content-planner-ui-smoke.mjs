import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Unified content planner UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof openLearningContentPlanner==='function'&&typeof assignBookRowsToLearner==='function'&&state.books.some(b=>b.builtinSource));

  await page.click('#parentAreaBtn');
  await page.waitForSelector('#modal[open] #confirmParentMode');
  await page.click('#confirmParentMode');
  await page.waitForSelector('#parentView.active');

  assert((await page.locator('#parentTestPlanBtn').textContent())?.includes('Test vorbereiten'),'test planning is the primary path when a test exists');
  assert((await page.locator('#parentLibraryBtn').textContent())?.includes('Vokabeln vorbereiten')&&(await page.locator('#parentLibraryBtn').textContent())?.includes('Ohne festen Testtermin'),'separate no-test path is explicitly labeled');
  assert(!(await page.locator('#parentManageDisclosure').getAttribute('open')),'parent administration stays collapsed on entry');
  assert(!(await page.locator('#parentLearningDisclosure').getAttribute('open')),'full learning-set management stays collapsed on entry');
  assert(await page.locator('#parentTestPlanBtn').isVisible()&&await page.locator('#parentLibraryBtn').isVisible(),'only the two preparation actions remain immediately visible');
  const order=await page.evaluate(()=>Array.from(document.querySelectorAll('.parent-primary-actions .parent-primary-action')).map(x=>x.id));
  assert(order.indexOf('parentTestPlanBtn')<order.indexOf('parentLibraryBtn'),'test planning is shown before no-test learning');
  await page.click('#parentLibraryBtn');
  await page.waitForSelector('#modal[open] #contentWordPicker');
  assert((await page.locator('#modalContent').textContent())?.includes('ohne Testtermin'),'no-test flow states its purpose explicitly');
  assert(await page.locator('#contentWordPicker [data-book-row]').count()>0,'known book words are directly selectable');
  await page.locator('#modal').evaluate(el=>el.close());

  await page.click('#parentTestPlanBtn');
  await page.waitForSelector('#modal[open] #planWordPicker');
  assert((await page.locator('#modalContent').textContent())?.includes('automatisch als Lernstoff'),'test planner explains that selected words become learning content automatically');
  assert(await page.locator('#planSourceLibrary').count()===1&&await page.locator('#planSourceManual').count()===1&&await page.locator('#planSourceOcr').count()===1,'test planner offers library, manual and photo/OCR as explicit vocabulary sources');
  assert((await page.locator('#modalContent').textContent())?.includes('Wähle zuerst die Quelle'),'test preparation presents date then vocabulary source as a guided flow');
  const total=await page.locator('#planWordPicker [data-plan-row]').count();
  assert(total>6,'test planner exposes individual vocabulary choices');
  await page.locator('#planRangeFrom').fill('3');
  await page.locator('#planRangeTo').fill('8');
  await page.click('#planSelectRange');
  const boxes=page.locator('#planWordPicker [data-plan-row]');
  assert(await boxes.nth(1).isChecked()===false&&await boxes.nth(2).isChecked()&&await boxes.nth(7).isChecked()&&await boxes.nth(8).isChecked()===false,'von-bis selection checks exactly the requested inclusive range');
  await page.locator('#testPlanDate').fill(await page.evaluate(()=>datePlusDays(7)));
  assert((await page.locator('#planSelectionCount').textContent())?.startsWith('6 '),'selection counter follows the range selection');
  const preview=await page.locator('#planDailyPreview').textContent();
  assert(preview?.includes('6 ausgewählt')&&preview?.includes('Test in 7 Tagen'),'preview shows the exact selected vocabulary count and calendar distance to the test');
  assert(preview?.includes('1 neues Wort')&&preview?.includes('5 Fokuswörtern'),'preview uses the same compact pacing formula as the daily plan');
  await page.click('#saveTestPlan');
  await page.waitForSelector('#parentView.active');

  const saved=await page.evaluate(()=>{
    const ctx=upcomingTestContext('english');
    const set=ctx?.sets?.[0];
    const plan=buildDailyPlan('english');
    return {id:set?.id||'',date:ctx?.date||'',count:ctx?.words?.length||0,days:ctx?.days,mode:set?.testScopeMode||'',selected:set?.testSelectedLinkIds?.length||0,title:set?.title||'',links:set?setWords(set.id).length:0,intro:plan.introCount,target:plan.dailyTarget,acquisitionDays:plan.acquisitionDays};
  });
  assert(saved.id&&saved.count===6&&saved.days===7&&saved.mode==='selected'&&saved.selected===6&&saved.links>=6,'test plan keeps exact vocabulary count and exact test-day distance');
  assert(saved.intro===1&&saved.target===5&&saved.acquisitionDays===6,'saved daily plan matches the compact preview and adapts workload to the available time');

  // A later library-backed test must queue behind the earlier test instead of replacing it.
  await page.click('#parentTestPlanBtn');
  await page.waitForSelector('#modal[open] #planWordPicker');
  const secondLibraryDate=await page.evaluate(()=>datePlusDays(8));
  await page.locator('#testPlanDate').fill(secondLibraryDate);
  await page.locator('#planRangeFrom').fill('1');
  await page.locator('#planRangeTo').fill('4');
  await page.click('#planSelectRange');
  await page.click('#saveTestPlan');
  await page.waitForSelector('#parentView.active');
  const queuedLibrary=await page.evaluate(()=>{
    const ctx=upcomingTestContext('english');
    const future=(state.sets||[]).filter(s=>s.learnerId===state.activeLearnerId&&s.subject==='english'&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate));
    const second=future.find(s=>s.testDate===datePlusDays(8));
    return {activeId:ctx?.sets?.[0]?.id||'',days:ctx?.days,futureDates:future.map(s=>s.testDate),secondId:second?.id||'',secondCount:second?.testSelectedLinkIds?.length||0};
  });
  assert(queuedLibrary.activeId===saved.id&&queuedLibrary.days===7,'adding a later library test keeps the earlier test as the active learning target');
  assert(queuedLibrary.futureDates.includes(saved.date)&&queuedLibrary.futureDates.includes(secondLibraryDate)&&queuedLibrary.secondId&&queuedLibrary.secondId!==saved.id,'earlier and later library tests coexist as separate dated plans');
  assert(queuedLibrary.secondCount===4,'later library test keeps its own selected vocabulary scope');

  // Manual source: capture remains a draft until the exact pairs are approved.
  await page.click('#parentTestPlanBtn');
  await page.waitForSelector('#modal[open] #planSourceManual');
  const manualDate=await page.evaluate(()=>datePlusDays(9));
  await page.locator('#testPlanDate').fill(manualDate);
  await page.click('#planSourceManual');
  await page.waitForSelector('#modal[open] #wordSet');
  assert(await page.locator('#wordSet').isDisabled(),'manual test capture is locked to its draft set');
  const manualDraftBefore=await page.evaluate(()=>{
    const set=state.sets.find(s=>s.pendingTestPlan?.mode==='single'&&s.captureSource==='manual');
    const ctx=upcomingTestContext('english');
    return {id:set?.id||'',testDate:set?.testDate||'',pendingDate:set?.pendingTestPlan?.testDate||'',activeTestId:ctx?.sets?.[0]?.id||''};
  });
  assert(manualDraftBefore.id&&manualDraftBefore.testDate===''&&manualDraftBefore.pendingDate===manualDate,'manual source stores the intended date only as pending metadata');
  assert(manualDraftBefore.activeTestId!==manualDraftBefore.id,'unfinished manual capture does not replace the active test plan');
  await page.locator('#modal').evaluate(el=>el.close());
  await page.waitForFunction(()=>!document.querySelector('#modal')?.open);
  await page.evaluate(()=>{showView('parentView');renderAll()});
  await page.waitForSelector('#parentView.active [data-parent-draft]');
  assert((await page.locator('[data-parent-draft]').textContent())?.includes('Fortsetzen'),'unfinished test capture is surfaced as the first parent task');
  await page.click('[data-parent-draft]');
  await page.waitForSelector('#modal[open] #finishTestCaptureBtn');
  await page.locator('#wordTerm').fill('manualtesttoken');
  await page.locator('#wordTrans').fill('manuelles Prüfwort');
  await page.click('#finishTestCaptureBtn');
  await page.waitForSelector('#modal[open] #confirmSetPairsBtn');
  assert((await page.locator('#modalContent').textContent())?.includes('Testplan ist noch nicht aktiv'),'manual capture shows a final approval gate');
  assert((await page.locator('#confirmSetPairsBtn').textContent())?.includes('Test speichern'),'manual capture confirmation activates the test rather than merely closing the audit');
  const manualPending=await page.evaluate(id=>{
    const set=state.sets.find(s=>s.id===id),word=setWords(id)[0];
    return {testDate:set?.testDate||'',pending:!!set?.pendingTestPlan,needsReview:setNeedsPairReview(set),verified:!!(state.vocabulary||[]).find(v=>v.id===word?.vocabId)?.verifiedAt};
  },manualDraftBefore.id);
  assert(manualPending.testDate===''&&manualPending.pending&&manualPending.needsReview&&!manualPending.verified,'manual word remains unverified and the test remains inactive before approval');
  await page.click('#confirmSetPairsBtn');
  await page.waitForSelector('#parentView.active');
  const manualFinal=await page.evaluate(()=>{
    const set=state.sets.find(s=>s.captureSource==='manual'&&s.testDate===datePlusDays(9)),word=set&&setWords(set.id)[0],ctx=upcomingTestContext('english');
    const future=(state.sets||[]).filter(s=>s.learnerId===state.activeLearnerId&&s.subject==='english'&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate));
    return {testDate:set?.testDate||'',pending:!!set?.pendingTestPlan,selected:set?.testSelectedLinkIds?.length||0,needsReview:set?setNeedsPairReview(set):false,verified:!!(state.vocabulary||[]).find(v=>v.id===word?.vocabId)?.verifiedAt,activeTestId:ctx?.sets?.[0]?.id||'',activeDays:ctx?.days,futureDates:future.map(s=>s.testDate)};
  });
  assert(manualFinal.testDate===manualDate&&!manualFinal.pending&&manualFinal.selected===1&&!manualFinal.needsReview&&manualFinal.verified,'manual pair approval finalizes date, scope and verification atomically');
  assert(manualFinal.activeTestId===saved.id&&manualFinal.activeDays===7,'approved later manual test is queued and does not replace the earlier test');
  assert(manualFinal.futureDates.includes(manualDate),'approved manual test remains stored for its later date');

  // OCR source: import feeds the same pending-test approval gate.
  await page.click('#parentTestPlanBtn');
  await page.waitForSelector('#modal[open] #planSourceOcr');
  const ocrDate=await page.evaluate(()=>datePlusDays(11));
  await page.locator('#testPlanDate').fill(ocrDate);
  await page.click('#planSourceOcr');
  await page.waitForSelector('#modal[open] #scanSetSelect');
  assert(await page.locator('#scanSetSelect').isDisabled(),'OCR test capture is locked to its draft set');
  await page.evaluate(()=>{
    scanImportState.rows=[makeImportRow('ocrtesttoken','OCR-Prüfwort','','','good')];
    renderScanReview();
  });
  await page.waitForSelector('#scanReview #scanUse_0');
  await page.click('#scanImportSave');
  await page.waitForSelector('#modal[open] #confirmSetPairsBtn');
  const ocrPending=await page.evaluate(()=>{
    const set=state.sets.find(s=>s.captureSource==='ocr'&&s.pendingTestPlan),word=set&&setWords(set.id)[0];
    return {id:set?.id||'',testDate:set?.testDate||'',pendingDate:set?.pendingTestPlan?.testDate||'',needsReview:set?setNeedsPairReview(set):false,verified:!!(state.vocabulary||[]).find(v=>v.id===word?.vocabId)?.verifiedAt};
  });
  assert(ocrPending.id&&ocrPending.testDate===''&&ocrPending.pendingDate===ocrDate&&ocrPending.needsReview&&!ocrPending.verified,'OCR import stays an inactive unverified test draft until pair approval');
  await page.click('#confirmSetPairsBtn');
  await page.waitForSelector('#parentView.active');
  const ocrFinal=await page.evaluate(()=>{
    const set=state.sets.find(s=>s.captureSource==='ocr'&&s.testDate===datePlusDays(11)),ctx=upcomingTestContext('english');
    const future=(state.sets||[]).filter(s=>s.learnerId===state.activeLearnerId&&s.subject==='english'&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate));
    return {testDate:set?.testDate||'',pending:!!set?.pendingTestPlan,selected:set?.testSelectedLinkIds?.length||0,needsReview:set?setNeedsPairReview(set):false,activeTestId:ctx?.sets?.[0]?.id||'',activeDays:ctx?.days,futureDates:future.map(s=>s.testDate)};
  });
  assert(ocrFinal.testDate===ocrDate&&!ocrFinal.pending&&ocrFinal.selected===1&&!ocrFinal.needsReview,'OCR pair approval finalizes the pending test plan');
  assert(ocrFinal.activeTestId===saved.id&&ocrFinal.activeDays===7,'approved later OCR test is queued and does not replace the earlier test');
  assert(ocrFinal.futureDates.includes(ocrDate),'approved OCR test remains stored for its later date');

  // A test that is due today remains editable: date and scope change in place,
  // while vocabulary learning progress and the already-started fortress are preserved.
  const editFixture=await page.evaluate(setId=>{
    const set=state.sets.find(s=>s.id===setId),links=(state.setVocabulary||[]).filter(x=>x.setId===setId);
    if(!set||links.length<6)throw new Error('missing edit fixture');
    set.testDate=today();set.testScopeMode='selected';set.testSelectedLinkIds=links.slice(0,6).map(x=>x.id);set.testFrom=1;set.testTo=6;
    learner().dailyPlans={};
    const removed=links[5],progress=ensureLearnerVocabulary(state.activeLearnerId,removed.vocabId,removed.senseId);progress.successes=17;
    const fortress=currentTestFortress('english');fortress.defense=Math.max(0,fortress.maxDefense-37);fortress.attacks=[...(fortress.attacks||[]),{date:new Date().toISOString(),damage:37}];
    persistOnly();showView('parentView');renderAll();
    return {setId,removedProgressId:progress.id,fortressCreatedAt:fortress.createdAt,fortressDefense:fortress.defense};
  },saved.id);
  assert(await page.locator('#parentView').isVisible(),'parent area remains the editing surface for test administration');
  assert((await page.locator('#parentTestPlanBtn').textContent())?.includes('Aktuellen Test bearbeiten'),'parent area makes current-test editing explicit on test day');
  await page.click('#parentTestPlanBtn');
  await page.waitForSelector('#modal[open] #planWordPicker');
  assert((await page.locator('#modalContent h2').textContent())?.includes('bearbeiten'),'current-test editor is explicitly labeled as editing');
  assert(await page.locator('#testPlanDate').inputValue()===await page.evaluate(()=>today()),'editor opens with the current test date');
  assert((await page.locator('#planSelectionCount').textContent())?.startsWith('6 '),'editor restores the current vocabulary selection');
  const postponedDate=secondLibraryDate;
  await page.locator('#testPlanDate').fill(postponedDate);
  await page.locator('#planRangeFrom').fill('1');
  await page.locator('#planRangeTo').fill('4');
  await page.click('#planSelectRange');
  await page.click('#saveTestPlan');
  await page.waitForSelector('#parentView.active');
  const edited=await page.evaluate(fixture=>{
    const ctx=upcomingTestContext('english'),set=state.sets.find(s=>s.id===fixture.setId),progress=(state.learnerVocabulary||[]).find(p=>p.id===fixture.removedProgressId),fortress=currentTestFortress('english');
    const sameDay=(state.sets||[]).filter(s=>s.learnerId===state.activeLearnerId&&s.subject==='english'&&s.testDate===datePlusDays(8)),oldDateStillActive=(state.sets||[]).some(s=>s.learnerId===state.activeLearnerId&&s.subject==='english'&&s.testDate===today());
    return {date:ctx?.date||'',setId:ctx?.sets?.[0]?.id||'',ctxSetCount:ctx?.sets?.length||0,count:ctx?.words?.length||0,selected:set?.testSelectedLinkIds?.length||0,totalLinks:set?setWords(set.id).length:0,removedSuccesses:progress?.successes||0,fortressDate:fortress?.testDate||'',fortressWordCount:fortress?.wordCount||0,fortressCreatedAt:fortress?.createdAt||'',fortressDefense:fortress?.defense,oldDateStillActive,sameDayIds:sameDay.map(s=>s.id)};
  },editFixture);
  assert(edited.date===postponedDate&&edited.setId===saved.id&&edited.ctxSetCount===1&&edited.count===4&&edited.selected===4,'postponed current test keeps its identity and exact new vocabulary scope even when another test already has the target date');
  assert(edited.sameDayIds.includes(saved.id)&&edited.sameDayIds.includes(queuedLibrary.secondId),'same-day planned tests remain separate instead of merging their vocabulary scopes');
  assert((await page.locator('#parentTestPlanBtn').textContent())?.includes('Aktuellen Test bearbeiten'),'future current test stays editable after postponing');
  assert(edited.totalLinks>=6&&edited.removedSuccesses===17,'removed test words keep their links and learning history outside the test scope');
  assert(edited.fortressDate===postponedDate&&edited.fortressWordCount===4&&edited.fortressCreatedAt===editFixture.fortressCreatedAt&&edited.fortressDefense===editFixture.fortressDefense,'existing fortress progress follows the edited test instead of resetting');
  assert(!edited.oldDateStillActive,'old test date no longer remains active after postponing');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer unified content planner UI smoke: passed');
}finally{
  await browser.close();
}
