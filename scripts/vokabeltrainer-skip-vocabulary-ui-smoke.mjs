import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Skip vocabulary UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof startSession==='function'&&typeof skipCurrentVocabulary==='function');
  await page.waitForFunction(()=>state!==null&&document.querySelector('#profileBtn')?.textContent!=='Profil');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'skip_set',learnerId:'learner_demo',subject:'english',title:'Skip Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'source',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    for(const [term,tr] of [['apple','Apfel'],['house','Haus']])attachVocabularyToSet(set.id,{term,translation:tr,source:'skip-test',verified:true,firstContactCopiedAt:'x',firstContactRecalledAt:'x',firstContactCompletedAt:'x'});
    set.pairVerifiedSignature=pairReviewSignatureForSet(set.id);
    rebuildWordIndexes();
    const words=setWords(set.id);
    startSession('reverseRecall',set.id,words.map(quizQueueRef),false);
  });

  await page.waitForSelector('#skipVocabularyBtn');
  const before=await page.evaluate(()=>{
    const w=currentWord(),p=state.learnerVocabulary.find(x=>x.id===w.id);
    return {term:w.term,id:w.id,queue:session.queue.map(x=>typeof x==='string'?x:(x.setLinkId||x.wordId||'')),index:session.index,answered:session.answered,correct:session.correct,failures:p.failures,repetitions:p.repetitions,xp:learner().xp,results:session.results.length};
  });
  assert(before.queue.length===2&&before.index===0,'two-word session starts at first item');
  await page.click('#skipVocabularyBtn');
  const afterSkip=await page.evaluate(()=>({
    term:currentWord().term,queue:session.queue.map(x=>typeof x==='string'?x:(x.setLinkId||x.wordId||'')),index:session.index,answered:session.answered,correct:session.correct,xp:learner().xp,results:session.results.length
  }));
  assert(afterSkip.term!==before.term,'skip immediately shows the next vocabulary');
  assert(afterSkip.index===0&&afterSkip.answered===before.answered&&afterSkip.correct===before.correct&&afterSkip.xp===before.xp&&afterSkip.results===before.results,'skip creates no grade, xp or session result');
  assert(afterSkip.queue.at(-1)===before.queue[0],'skipped vocabulary is moved to the end of the same queue');

  const answer=await page.evaluate(()=>translationTargets(currentWord())[0]);
  await page.fill('#answerField',answer);
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  await page.click('#continueStudyBtn');
  await page.waitForFunction(term=>currentWord()?.term===term,before.term);
  assert(await page.locator('#skipVocabularyBtn').isDisabled(),'when deferred vocabulary is the only remaining non-daily item, skip is disabled instead of removing it');
  assert((await page.locator('.skip-vocabulary-action').textContent())?.includes('Nur noch diese Vokabel offen'),'UI explains that no later position exists in this session');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'daily_skip_set',learnerId:'learner_demo',subject:'english',title:'Daily Skip Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(5),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    for(const [term,tr] of [['river','Fluss'],['forest','Wald'],['bridge','Brücke']])attachVocabularyToSet(set.id,{term,translation:tr,source:'daily-skip-test',verified:true,firstContactCopiedAt:'x',firstContactRecalledAt:'x',firstContactCompletedAt:'x'});
    set.pairVerifiedSignature=pairReviewSignatureForSet(set.id);
    rebuildWordIndexes();
    for(const w of setWords(set.id)){w.repetitions=1;w.activePracticeDays=[datePlusDays(-1)];w.dueDate=today()}
    const plan=buildDailyPlan('english'),refs=dailyPlanRefs(plan,false);
    window.__dailySkipRef=refs[0];
    startSession('adaptive',null,[refs[0]],true);
  });
  await page.waitForSelector('#skipVocabularyBtn');
  const dailyBefore=await page.evaluate(()=>{
    const w=currentWord(),status=dailyPlanStatus(buildDailyPlan());
    return {key:dailyPlanRefKey({wordId:w.id,setLinkId:w.setLinkId||''}),remaining:status.remaining,queue:session.queue.map(dailyPlanRefKey),index:session.index,answered:session.answered,correct:session.correct,xp:learner().xp,results:session.results.length};
  });
  assert(dailyBefore.queue.length===1&&dailyBefore.index===0&&dailyBefore.remaining>=2,'daily regression fixture is at the end of its current round while later focus words remain');
  assert(!(await page.locator('#skipVocabularyBtn').isDisabled()),'daily last-item skip stays available while another focus word can move ahead');
  assert((await page.locator('.skip-vocabulary-action').textContent())?.includes('nächsten Durchgang'),'UI explains that the word is deferred across the round boundary');
  await page.click('#skipVocabularyBtn');
  await page.waitForFunction(()=>session?.roomRound>=2);
  const dailyAfter=await page.evaluate(()=>({
    current:dailyPlanRefKey(quizQueueRef(currentWord())),
    queue:session.queue.map(dailyPlanRefKey),
    answered:session.answered,correct:session.correct,xp:learner().xp,results:session.results.length
  }));
  assert(dailyAfter.current!==dailyBefore.key,'daily skip advances to another unresolved focus word');
  assert(dailyAfter.queue.at(-1)===dailyBefore.key,'daily skip moves the word to the end of the next unresolved round');
  assert(dailyAfter.answered===dailyBefore.answered&&dailyAfter.correct===dailyBefore.correct&&dailyAfter.xp===dailyBefore.xp&&dailyAfter.results===dailyBefore.results,'daily round-boundary skip remains neutral for grading, XP and results');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer skip vocabulary UI smoke: passed');
  console.log('✓ skip moves current vocabulary to session end');
  console.log('✓ skip is neutral for grading, XP and results');
  console.log('✓ deferred vocabulary returns as the final item');
  console.log('✓ daily skip remains available across a round boundary while other focus words are still open');
}finally{
  await browser.close();
}
