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
  assert(await page.locator('#skipVocabularyBtn').isDisabled(),'when deferred vocabulary is last, skip is disabled instead of removing it');
  assert((await page.locator('.skip-vocabulary-action').textContent())?.includes('bereits am Ende'),'UI explains that the word remains in the session');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer skip vocabulary UI smoke: passed');
  console.log('✓ skip moves current vocabulary to session end');
  console.log('✓ skip is neutral for grading, XP and results');
  console.log('✓ deferred vocabulary returns as the final item');
}finally{
  await browser.close();
}
