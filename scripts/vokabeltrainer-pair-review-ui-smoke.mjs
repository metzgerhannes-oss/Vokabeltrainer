import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Pair review UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof attachVocabularyToSet==='function'&&typeof openSetPairAudit==='function'&&typeof startSession==='function');
  // The app bootstrap loads IndexedDB asynchronously. Wait until it has assigned state
  // and rendered the profile before replacing state with the isolated test fixture.
  await page.waitForFunction(()=>state!==null&&document.querySelector('#profileBtn')?.textContent!=='Profil');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'ocr_set',learnerId:'learner_demo',subject:'english',title:'OCR Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:true,pairVerifiedAt:''};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'write',translation:'schreiben',source:'photo-text-import',verified:false});
    rebuildWordIndexes();renderAll();showView('homeView');
  });

  const study=page.locator('[data-set-study="ocr_set"]');
  assert(await study.isDisabled(),'learning is blocked for unreviewed OCR set');
  assert(await page.evaluate(()=>!state.vocabulary[0]?.verifiedAt),'OCR vocabulary is not verified before pair confirmation');
  const audit=page.locator('[data-set-audit="ocr_set"]');
  assert((await audit.textContent())?.includes('Paare prüfen'),'pair review action is visible');

  await audit.click();
  await page.waitForSelector('#modal[open] #confirmSetPairsBtn');
  const modal=await page.locator('#modalContent').textContent();
  assert(modal?.includes('write')&&modal?.includes('schreiben'),'review shows exact word↔meaning pair used by quiz');
  await page.click('#confirmSetPairsBtn');
  await page.waitForFunction(()=>!document.querySelector('#modal')?.open);

  await page.evaluate(()=>showView('homeView'));
  assert(await page.locator('[data-set-study="ocr_set"]').isDisabled(),'ordinary learning stays blocked until first contact is complete');
  assert(await page.locator('[data-set-intro="ocr_set"]').count()===1,'first-contact action is visible after pair confirmation');
  assert(await page.evaluate(()=>!!state.vocabulary[0]?.verifiedAt),'pair confirmation marks vocabulary as verified');

  await page.waitForSelector('#firstContactCopiedBtn');
  await page.click('#firstContactCopiedBtn');
  await page.waitForSelector('#firstContactRevealBtn');
  await page.click('#firstContactRevealBtn');
  await page.waitForSelector('#firstContactCorrectBtn');
  const compare=await page.locator('#studyArea').textContent();
  assert(compare?.includes('write')&&compare?.includes('schreiben'),'first contact compares against the exact confirmed pair');
  await page.click('#firstContactCorrectBtn');
  await page.waitForSelector('#firstContactDoneBtn');
  assert(await page.evaluate(()=>!!state.setVocabulary[0]?.firstContactCompletedAt),'first contact completion is persisted on the set link');
  await page.click('#firstContactDoneBtn');
  assert(!(await page.locator('[data-set-study="ocr_set"]').isDisabled()),'ordinary learning unlocks only after first contact');

  await page.evaluate(()=>startSession('recall','ocr_set',null,false));
  await page.waitForSelector('#answerField');
  const snapshot=await page.evaluate(()=>({prompt:session.currentQuestion?.prompt,targets:[...(session.currentQuestion?.targets||[])],link:session.currentQuestion?.setLinkId}));
  assert(snapshot.prompt==='schreiben','shown prompt comes from confirmed pair');
  assert(snapshot.targets.includes('write'),'question snapshot contains confirmed target');
  await page.fill('#answerField','write');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  const result=await page.evaluate(()=>({correct:session.results.at(-1)?.correct,questionId:session.results.at(-1)?.questionId,feedback:document.querySelector('.feedback')?.textContent||''}));
  assert(result.correct===true&&/Richtig/.test(result.feedback),'exact answer is graded correct after pair confirmation');
  assert(!!result.questionId,'result is traceable to immutable question snapshot');

  assert(errors.length===0,'no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer pair review WebKit smoke: passed');
  console.log('✓ unreviewed OCR set cannot be learned');
  console.log('✓ exact pairs are visible before confirmation');
  console.log('✓ pair confirmation starts the required first-contact phase');
  console.log('✓ first contact unlocks learning and the confirmed exact answer is graded correct');
}finally{
  await browser.close();
}
