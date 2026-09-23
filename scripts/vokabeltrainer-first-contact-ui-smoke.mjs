import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Optional copy UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof startCopyPractice==='function'&&typeof firstContactStatus==='function'&&state!==null&&document.querySelector('#profileBtn')?.textContent!=='Profil');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'intro_set',learnerId:'learner_demo',subject:'english',title:'Unit Abschreiben',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(2),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    const pairs=[['alpha','eins'],['bravo','zwei'],['charlie','drei'],['delta','vier'],['echo','fünf'],['foxtrot','sechs']];
    for(const [term,translation] of pairs)attachVocabularyToSet(set.id,{term,translation,source:'optional-copy-smoke',verified:true});
    rebuildWordIndexes();renderAll();showView('homeView');
  });

  const plan=await page.evaluate(()=>buildDailyPlan());
  assert(plan.introRefs.length===6&&plan.dailyTarget===11&&plan.acquisitionDays===1,'daily plan treats new verified words as direct learning material');
  assert(await page.evaluate(()=>schoolYearWords('english').length)===6,'all verified words are immediately available to normal learning');
  const before=await page.evaluate(()=>firstContactStatus('intro_set'));
  assert(before.pending===6&&before.completed===0,'copy practice starts untouched but does not gate learning');

  await page.click('#quickLearnHeroBtn');
  await page.waitForFunction(()=>document.querySelector('#modePill')?.textContent?.startsWith('Adaptiv'));
  assert(await page.locator('#firstContactCopiedBtn').count()===0,'daily learning does not force the copy exercise');
  assert(await page.locator('body.learning-focus').count()===1,'daily learning starts directly');
  await page.evaluate(()=>{session=null;showView('homeView');renderAll()});

  await page.click('.nav-btn[data-view="practiceView"]');
  await page.waitForSelector('#practiceView.active');
  assert(await page.locator('#practiceSpecialBtn').isVisible(),'voluntary special training remains directly reachable on mobile');
  await page.click('#practiceSpecialBtn');
  await page.waitForFunction(()=>!document.querySelector('#optionalLearningCard')?.classList.contains('hidden'));

  const copyButton=page.locator('#recommendations [data-mode="copy"]');
  assert(await copyButton.count()===1,'copying is offered as its own optional learning unit');
  assert((await copyButton.textContent())?.includes('freiwillig'),'copying is explicitly labelled optional');
  await copyButton.click();
  await page.waitForSelector('#firstContactCopiedBtn');
  assert((await page.locator('#modePill').textContent())==='Abschreiben','optional unit has a clear copy label');
  assert((await page.locator('#studyArea').textContent())?.includes('freiwillig'),'copy screen itself states that the unit is optional');

  const batchSize=await page.evaluate(()=>session.queue.length);
  for(let i=0;i<batchSize;i++){
    await page.waitForSelector('#firstContactCopiedBtn');
    await page.click('#firstContactCopiedBtn');
    await page.waitForSelector('#firstContactRevealBtn');
    await page.click('#firstContactRevealBtn');
    await page.waitForSelector('#firstContactCorrectBtn');
    await page.click('#firstContactCorrectBtn');
    if(i<batchSize-1)await page.waitForSelector('#firstContactCopiedBtn');
  }

  await page.waitForSelector('#firstContactDoneBtn');
  const after=await page.evaluate(()=>firstContactStatus('intro_set'));
  assert(after.completed===batchSize&&after.pending===6-batchSize,'copy completion is tracked independently from learning availability');
  assert((await page.locator('#studyArea').textContent())?.includes('zählt nicht zum Tagesziel'),'finish screen preserves optional semantics');
  assert(await page.evaluate(()=>schoolYearWords('english').length)===6,'copy status never changes which verified words can be learned');
  assert(await page.evaluate(()=>battleTickets('english'))===0,'completed optional copy unit cannot unlock the daily battle');
  assert((await page.evaluate(()=>dailyPlanStatus(buildDailyPlan()).done))===0,'optional copying does not complete the fixed daily goal');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer optional copy UI smoke: passed');
}finally{
  await browser.close();
}
