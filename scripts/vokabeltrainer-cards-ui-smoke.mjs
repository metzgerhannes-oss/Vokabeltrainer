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
    rebuildWordIndexes();renderAll();startSession('cards',set.id,null,false);
  });

  await page.waitForSelector('#answerField');
  assert((await page.locator('#modePill').textContent())?.includes('Karteikarten · Beweisen'),'cards mode is available before first-contact and clearly labels the proof path');
  assert(await page.locator('.proof-notice').count()===1,'new vocabulary explains that a correct written proof can skip copying');
  assert((await page.locator('#answerBtn').textContent())==='Beweisen','new card uses the proof action');
  assert(await page.locator('.leitner-box').count()===5,'five Leitner boxes are visible');
  assert(await page.locator('.leitner-box.active').count()===1,'exactly one Leitner box is active');
  assert((await page.locator('.leitner-box.active').textContent())?.includes('Neu'),'new card starts in box 1');

  await page.fill('#answerField','cant');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  const wrong=await page.locator('.feedback').textContent();
  assert(/Noch nicht richtig/.test(wrong||''),'missing apostrophe is rejected in written cards mode');
  assert(/Box 1/.test(wrong||''),'wrong answer keeps a new card at the front');
  assert(await page.evaluate(()=>leitnerBox(currentWord()))===1,'wrong answer cannot advance the card');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===1,'wrong proof keeps the word in first-contact');
  await page.click('#continueStudyBtn');

  await page.waitForSelector('#answerField');
  await page.fill('#answerField',"can't");
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  const correct=await page.locator('.feedback').textContent();
  assert(/Richtig/.test(correct||'')&&/Box 1 → Box 2/.test(correct||''),'correct written proof moves one box back');
  assert(/Beweis geschafft/.test(correct||'')&&/nur noch wiederholt/.test(correct||''),'successful proof explains that copying is skipped and only review remains');
  assert(await page.evaluate(()=>leitnerBox(currentWord()))===2,'card state is now box 2');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===0,'successful proof releases the word from first-contact');
  assert(await page.evaluate(()=>schoolYearWords('english').length)===1,'proved word immediately joins the normal review pool');
  assert((await page.locator('.leitner-box.active').textContent())?.includes('Im Lernen'),'visual track moves with the card');
  await page.click('#continueStudyBtn');

  await page.waitForSelector('.session-finish-card');
  assert(await page.locator('#rewardBattleBtn').count()===1,'completed written cards session earns a battle attack');
  assert(await page.evaluate(()=>battleTickets('english'))===1,'cards session grants exactly one battle ticket');
  if(errors.length)throw new Error(errors.join(' | '));

  console.log('Vokabeltrainer written Leitner cards UI smoke: passed');
}finally{
  await browser.close();
}
