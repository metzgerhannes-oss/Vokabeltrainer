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
    rebuildWordIndexes();
    const words=schoolYearWords('english');
    words[0].leitnerBox=1;
    words[1].leitnerBox=4;
    renderAll();showView('practiceView');
  });

  assert(await page.locator('#practiceView.active #cardboxOverviewCard:not(.hidden)').count()===1,'Lernen shows the current card box overview');
  assert(await page.locator('#cardboxOverview [data-cardbox-box]').count()===5,'card box overview always shows all five boxes');
  assert((await page.locator('#cardboxTotalPill').textContent())?.includes('2 Karten'),'card box overview shows the current card total');
  assert((await page.locator('#cardboxDuePill').textContent())?.includes('2 heute fällig'),'card box overview shows currently due cards');
  assert((await page.locator('[data-cardbox-box="1"] .cardbox-stage-top strong').textContent())==='1','box 1 count reflects the current Leitner state');
  assert((await page.locator('[data-cardbox-box="4"] .cardbox-stage-top strong').textContent())==='1','box 4 count reflects the current Leitner state');
  assert((await page.locator('[data-cardbox-box="5"] .cardbox-stage-top strong').textContent())==='0','unused boxes remain visible with zero cards');
  assert(await page.locator('[data-cardbox-box="1"]').evaluate(el=>el.tagName)==='BUTTON','each card box is directly inspectable instead of being a static graphic');
  await page.click('[data-cardbox-box="1"]');
  await page.waitForSelector('.cardbox-word-list');
  const boxOneText=await page.locator('#modalContent').textContent();
  assert(boxOneText?.includes("can't")&&boxOneText?.includes('nicht können'),'box detail tells the child which vocabulary is in this learning stage');
  assert(!boxOneText?.includes('window'),'box detail does not mix vocabulary from another stage');
  assert((await page.locator('#practiceCardboxStageBtn').textContent())==='Diese Box üben','box detail offers focused voluntary practice');
  await page.click('#modal button[value="cancel"]');
  const overviewDistribution=await page.evaluate(()=>leitnerDistribution());
  assert(overviewDistribution[1]===1&&overviewDistribution[4]===1,'inspecting the overview does not change card boxes');
  await page.click('#cardboxPracticeBtn');
  await page.waitForSelector('#answerField');

  assert(await page.evaluate(()=>schoolYearWords('english').length)===2,'new verified vocabulary is immediately in the normal learning pool');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===2,'optional copy status remains independent');
  assert((await page.locator('#modePill').textContent())==='Karteikarten','learning area starts the existing cards mode');
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
  assert((await page.evaluate(()=>dailyPlanStatus(buildDailyPlan()).done))===0,'optional cards do not complete the fixed daily goal');

  assert(await page.locator('.session-result').count()===3,'result review lists every evaluated card attempt including retry');
  assert((await page.locator('.session-result').first().textContent())?.includes('cant'),'result review shows the child answer');
  assert((await page.locator('.session-result').first().textContent())?.includes("can't"),'result review shows the accepted target answer');
  assert((await page.locator('.session-result').first().textContent())?.includes('Bewertung'),'result review explains why an answer was marked wrong');
  assert(await page.locator('.session-result').first().getAttribute('data-session-result')==='review','wrong or orthography-sensitive answers are marked for review');
  assert((await page.locator('.session-result').first().locator('.session-box-move').textContent())?.includes('Box 1'),'result review shows Leitner box before and after');
  assert((await page.locator('#repeatErrorsBtn').textContent())?.includes('(1)'),'error repeat action deduplicates the failed vocabulary');
  assert((await page.locator('#repeatAllBtn').textContent())?.includes('(2)'),'repeat-all action deduplicates the whole session vocabulary');

  await page.click('#repeatErrorsBtn');
  await page.waitForSelector('#answerField');
  assert(await page.evaluate(()=>session?.queue?.length)===1,'error repeat starts a focused one-word retry session');
  assert(await page.evaluate(()=>session?.isDaily===false),'error repeat stays voluntary and cannot create another daily battle action');
  assert((await page.locator('.study-prompt').textContent())?.includes('nicht können'),'error repeat opens the failed vocabulary again');

  await page.evaluate(async()=>{await persistState()});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state!==null&&typeof firstContactStatus==='function');
  assert(await page.evaluate(()=>schoolYearWords('english').length)===2,'learning availability survives persistence');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').pending))===2,'optional copy status survives independently');
  assert((await page.evaluate(()=>firstContactStatus('cards_set').proved))===0,'cards create no legacy proof state');

  await page.evaluate(()=>{
    const word=schoolYearWords('english').find(w=>w.term==="can't");
    startSession('recall','cards_set',[word.id],false);
  });
  await page.waitForSelector('#answerField');
  await page.fill('#answerField',"can't");
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  await page.click('#continueStudyBtn');
  await page.waitForSelector('.session-finish-card');
  assert(await page.locator('.session-result').count()===1,'normal written recall also records its evaluated attempt');
  assert((await page.locator('.session-result').first().textContent())?.includes("can't"),'normal written recall shows the entered and accepted answer');
  assert(await page.locator('.session-result').first().locator('.session-box-move').count()===1,'normal written recall also shows the card-box transition');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer written Leitner cards UI smoke: passed');
}finally{
  await browser.close();
}
