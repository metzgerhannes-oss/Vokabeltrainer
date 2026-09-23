import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Army UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof subjectProgress==='function'&&window.VTArmyUi);

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'army_set',learnerId:'learner_demo',subject:'english',title:'Army Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'shield',translation:'Schild',source:'army-smoke',verified:true});
    for(const link of state.setVocabulary){link.firstContactCopiedAt=link.firstContactRecalledAt=link.firstContactCompletedAt=new Date().toISOString()}
    const p=state.learnerVocabulary[0];
    p.skills={recognition:4,listening:4,retrieval:4,spelling:4,context:4};p.independentSuccesses=8;p.activeSuccessDays=['2026-09-10','2026-09-14','2026-09-18'];p.activePracticeDays=[...p.activeSuccessDays];p.maxActiveGapDays=7;p.coldRecallDays=['2026-09-14','2026-09-18'];p.coldRecallSuccesses=2;p.intervalDays=14;p.errorProfile={meaning:0,retrieval:0,spelling:0,listening:0,context:0,grammar:0};refreshMastery(p);
    state.learners[0].streakDays=['2026-09-19','2026-09-20','2026-09-21','2026-09-22','2026-09-23'];
    state.learners[0].milestones[`hundred_english_${currentSchoolYear()}`]=new Date().toISOString();
    rebuildWordIndexes();renderAll();showView('childProgressView');
  });

  const before=await page.evaluate(()=>subjectProgress().pct);
  await page.click('#armyBtn');
  await page.waitForSelector('#armyView.active');
  await page.waitForFunction(()=>window.VTArmyArt?.ready===true);
  await page.waitForFunction(()=>document.querySelector('[data-army-hero-art]')?.naturalWidth>0);
  await page.waitForFunction(()=>document.querySelectorAll('#armyUnitGrid .army-unit-art.art-loaded').length===6);
  assert(await page.locator('[data-army-hero-art]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'illustrated camp artwork loads');
  assert(await page.locator('#armyUnitGrid .army-unit-art.art-loaded').count()===6,'six illustrated unit artworks load');
  assert(await page.locator('#armyUnitGrid .army-unit-card').count()===6,'six unit cards are shown');
  assert((await page.locator('#armyViewTitle').textContent())?.includes('Meine Armee'),'army view has a clear title');
  assert((await page.locator('#armyRankLabel').textContent())?.length>0,'rank is visible');
  assert(await page.locator('#armyBonusGrid .army-bonus').count()===4,'four presentation bonuses are shown');
  assert(await page.locator('#armyUnitGrid .army-unit-card.unlocked').count()>=4,'high learning progress visibly unlocks units');
  await page.click('[data-army-unit="archers"]');
  assert((await page.locator('#armyUnitPreview').textContent())?.includes('Bogenschützen'),'unit selection opens the unit preview');
  assert((await page.locator('#armyUnitPreview').textContent())?.includes('Aufwertungen entstehen automatisch'),'upgrade panel states learning-derived behavior');
  const after=await page.evaluate(()=>subjectProgress().pct);
  assert(before===after,'opening and inspecting the army does not alter academic mastery');
  const rect=await page.locator('#armyView').boundingBox();
  assert(rect&&rect.width<=page.viewportSize().width+1,'army view does not overflow iPhone viewport');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer army UI smoke: passed');
}finally{
  await browser.close();
}
