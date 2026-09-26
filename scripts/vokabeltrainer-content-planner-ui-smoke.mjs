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
  assert(preview?.includes('3 neue Wörter')&&preview?.includes('8 Kontakte'),'preview uses the same adaptive pacing formula as the daily plan');
  await page.click('#saveTestPlan');
  await page.waitForSelector('#parentView.active');

  const saved=await page.evaluate(()=>{
    const ctx=upcomingTestContext('english');
    const set=ctx?.sets?.[0];
    const plan=buildDailyPlan('english');
    return {count:ctx?.words?.length||0,days:ctx?.days,mode:set?.testScopeMode||'',selected:set?.testSelectedLinkIds?.length||0,title:set?.title||'',links:set?setWords(set.id).length:0,intro:plan.introCount,target:plan.dailyTarget,acquisitionDays:plan.acquisitionDays};
  });
  assert(saved.count===6&&saved.days===7&&saved.mode==='selected'&&saved.selected===6&&saved.links>=6,'test plan keeps exact vocabulary count and exact test-day distance');
  assert(saved.intro===3&&saved.target===8&&saved.acquisitionDays===6,'saved daily plan matches the preview and adapts workload to the available time');

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
  const manualFinal=await page.evaluate(id=>{
    const set=state.sets.find(s=>s.id===id),word=setWords(id)[0],ctx=upcomingTestContext('english');
    return {testDate:set?.testDate||'',pending:!!set?.pendingTestPlan,selected:set?.testSelectedLinkIds?.length||0,needsReview:setNeedsPairReview(set),verified:!!(state.vocabulary||[]).find(v=>v.id===word?.vocabId)?.verifiedAt,activeTestId:ctx?.sets?.[0]?.id||'',count:ctx?.words?.length||0};
  },manualDraftBefore.id);
  assert(manualFinal.testDate===manualDate&&!manualFinal.pending&&manualFinal.selected===1&&!manualFinal.needsReview&&manualFinal.verified,'manual pair approval finalizes date, scope and verification atomically');
  assert(manualFinal.activeTestId===manualDraftBefore.id&&manualFinal.count===1,'approved manual capture becomes the active exact test scope');

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
  const ocrFinal=await page.evaluate(id=>{
    const set=state.sets.find(s=>s.id===id),ctx=upcomingTestContext('english');
    return {testDate:set?.testDate||'',pending:!!set?.pendingTestPlan,selected:set?.testSelectedLinkIds?.length||0,needsReview:setNeedsPairReview(set),activeTestId:ctx?.sets?.[0]?.id||'',count:ctx?.words?.length||0};
  },ocrPending.id);
  assert(ocrFinal.testDate===ocrDate&&!ocrFinal.pending&&ocrFinal.selected===1&&!ocrFinal.needsReview,'OCR pair approval finalizes the pending test plan');
  assert(ocrFinal.activeTestId===ocrPending.id&&ocrFinal.count===1,'approved OCR capture becomes the active exact test scope');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer unified content planner UI smoke: passed');
}finally{
  await browser.close();
}
