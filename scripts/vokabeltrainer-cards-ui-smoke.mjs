import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Cards UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof startSession==='function'&&typeof leitnerBox==='function');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'cards_set',learnerId:'learner_demo',subject:'english',title:'Cards Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:"can't",translation:'nicht können',source:'cards-smoke',verified:true});
    attachVocabularyToSet(set.id,{term:'window',translation:'Fenster',source:'cards-smoke',verified:true});
    rebuildWordIndexes();renderAll();showView('homeView');
  });

  assert(!(await page.locator('#quickCardsBtn').isDisabled()),'cards quick action is enabled while vocabulary is still new');
  await page.click('#quickCardsBtn');
  await page.waitForSelector('#answerField');
  assert((await page.locator('#modePill').textContent())?.includes('Karteikarten · Beweisen'),'cards mode is available before first-contact');
  assert(await page.locator('.proof-notice').count()===1,'new vocabulary explains the proof path');
  assert((await page.locator('#answerBtn').textContent())==='Beweisen','new card uses the proof action');
  assert(await page.locator('.leitner-box').count()===5,'five Leitner boxes are visible');

  // First word: fail once. The later retry must no longer count as proof,
  // because the correct answer was already shown in the feedback.
  await page.fill('#answerField','cant');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  let feedback=await page.locator('.feedback').textContent();
  assert(/Noch nicht richtig/.test(feedback||''),'missing apostrophe is rejected');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===2,'failed proof releases no new word');
  await page.click('#continueStudyBtn');

  // Second word: correct on the first untouched attempt -> valid prior-knowledge proof.
  await page.waitForSelector('#answerField');
  assert((await page.locator('.study-prompt').textContent())?.includes('Fenster'),'second untouched card is shown');
  await page.fill('#answerField','window');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  feedback=await page.locator('.feedback').textContent();
  assert(/Beweis geschafft/.test(feedback||'')&&/nur noch wiederholt/.test(feedback||''),'first-attempt correct answer skips copying');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===1,'one successfully proved word leaves first-contact');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').proved))===1,'successful proof is tracked separately');
  await page.click('#continueStudyBtn');

  // Retry of the first word: correct now, but no proof because feedback was seen before.
  await page.waitForSelector('#answerField');
  assert((await page.locator('.study-prompt').textContent())?.includes('nicht können'),'failed word returns for retry');
  assert((await page.locator('#answerBtn').textContent())==='Prüfen','retry is no longer presented as a prior-knowledge proof');
  assert((await page.locator('#studyArea').textContent())?.includes('ersetzt für dieses Wort aber nicht mehr den Kennenlernblock'),'retry explains that first-contact is still required');
  await page.fill('#answerField',"can't");
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  feedback=await page.locator('.feedback').textContent();
  assert(/Richtig/.test(feedback||'')&&!/Beweis geschafft/.test(feedback||''),'retry can be correct without falsely proving prior knowledge');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===1,'retry-correct word still requires normal first-contact');
  assert(await page.evaluate(()=>schoolYearWords('english').length)===1,'only the genuinely proved word joins the normal review pool');
  await page.click('#continueStudyBtn');

  await page.waitForSelector('.session-finish-card');
  assert(await page.locator('#rewardBattleBtn').count()===1,'completed cards session earns a battle attack');
  assert(await page.evaluate(()=>battleTickets('english'))===1,'cards session grants exactly one battle ticket');

  await page.evaluate(async()=>{await persistState()});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state!==null&&typeof firstContactStatus==='function');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===1,'proof state survives persistence without releasing failed words');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').proved))===1,'proof is stored separately from handwritten first-contact');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer written Leitner cards UI smoke: passed');
}finally{
  await browser.close();
}
