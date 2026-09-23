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

  assert(await page.evaluate(()=>schoolYearWords('english').length)===2,'new verified vocabulary is immediately in the normal learning pool');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===2,'optional copy status remains independent');
  assert(!(await page.locator('#quickCardsBtn').isDisabled()),'cards quick action is enabled for new verified vocabulary');
  await page.click('#quickCardsBtn');
  await page.waitForSelector('#answerField');
  assert((await page.locator('#modePill').textContent())==='Karteikarten','cards mode keeps only the compact mode label');
  assert(await page.locator('.leitner-box').count()===0,'Leitner diagnostics stay out of the retrieval moment');
  assert((await page.locator('#answerBtn').textContent())==='Prüfen','card uses one neutral submit action');
  assert((await page.locator('#answerField').getAttribute('placeholder'))==='Vokabel eingeben','input is the visible action focus');
  await page.waitForFunction(()=>document.activeElement?.id==='answerField',{timeout:1000});

  await page.fill('#answerField','cant');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  let feedback=await page.locator('.feedback').textContent();
  assert(/Noch nicht richtig/.test(feedback||''),'missing apostrophe is rejected');
  assert(!/Beweis geschafft/.test(feedback||''),'cards no longer contain a copy-bypass proof concept');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===2,'card answers do not mark optional copying complete');
  await page.click('#continueStudyBtn');

  await page.waitForSelector('#answerField');
  assert((await page.locator('.study-prompt').textContent())?.includes('Fenster'),'second card is shown');
  await page.fill('#answerField','window');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  feedback=await page.locator('.feedback').textContent();
  assert(/Richtig/.test(feedback||'')&&!/Beweis geschafft/.test(feedback||''),'correct card stays normal Leitner learning');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===2,'correct cards remain independent from optional copying');
  await page.click('#continueStudyBtn');

  await page.waitForSelector('#answerField');
  assert((await page.locator('.study-prompt').textContent())?.includes('nicht können'),'failed word returns for retry');
  await page.fill('#answerField',"can't");
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  feedback=await page.locator('.feedback').textContent();
  assert(/Richtig/.test(feedback||''),'retry can be answered correctly');
  await page.click('#continueStudyBtn');

  await page.waitForSelector('.session-finish-card');
  assert(await page.locator('#rewardBattleBtn').count()===0,'optional cards session does not present a battle reward');
  assert(await page.evaluate(()=>battleTickets('english'))===0,'optional cards session cannot unlock the daily battle');

  await page.evaluate(async()=>{await persistState()});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state!==null&&typeof firstContactStatus==='function');
  assert(await page.evaluate(()=>schoolYearWords('english').length)===2,'learning availability survives persistence');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===2,'optional copy status survives independently');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').proved))===0,'cards create no legacy proof state');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer written Leitner cards UI smoke: passed');
}finally{
  await browser.close();
}
