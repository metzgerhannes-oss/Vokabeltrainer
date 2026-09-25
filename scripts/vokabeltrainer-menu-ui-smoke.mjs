import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:1000,height:720},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Project Menu smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTMenuUi);

  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['english','latin'];
    state.activeSubject='english';
    const set={id:'menu_set',learnerId:'learner_demo',subject:'english',title:'Menu Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    const mastered=attachVocabularyToSet(set.id,{term:'castle',translation:'Burg',source:'menu-smoke',verified:true,firstContactCopiedAt:'test',firstContactRecalledAt:'test',firstContactCompletedAt:'test'}).word;
    attachVocabularyToSet(set.id,{term:'learn',translation:'lernen',source:'menu-smoke',verified:true,firstContactCopiedAt:'test',firstContactRecalledAt:'test',firstContactCompletedAt:'test'});
    mastered.skills={...defaultSkills(),retrieval:3,spelling:3,context:1};
    mastered.independentSuccesses=6;
    mastered.activeSuccessDays=[datePlusDays(-8),datePlusDays(-4),today()];
    mastered.maxActiveGapDays=4;
    mastered.coldRecallDays=[datePlusDays(-4),today()];
    mastered.intervalDays=7;
    refreshMastery(mastered);
    learner().testFortresses={menu_fortress:{subject:'english',capturedAt:new Date().toISOString()}};
    rebuildWordIndexes();
    renderAll();
    showView('homeView');
  });

  await page.waitForSelector('#homeView.active .project-menu-stage');
  assert(await page.locator('.project-menu-link').count()===4,'menu exposes exactly four secondary routes');
  assert(await page.locator('#quickLearnHeroBtn').isVisible(),'Jetzt lernen stays visible');
  assert((await page.locator('#quickLearnHeroBtn').textContent())?.includes('Jetzt lernen'),'primary CTA is Jetzt lernen');

  const stage=await page.locator('.project-menu-stage').boundingBox();
  assert(stage&&stage.width/stage.height>1.65&&stage.width/stage.height<1.9,'menu stage keeps a landscape 16:9-like frame');

  const metrics=await page.evaluate(()=>({
    learned:document.querySelector('#menuLearnedCount')?.textContent,
    expected:String(subjectProgress().mastered),
    castles:document.querySelector('#menuFortressCount')?.textContent,
    rank:document.querySelector('#menuRankLabel')?.textContent
  }));
  assert(metrics.learned===metrics.expected,'learned KPI comes from academic progress');
  assert(metrics.castles==='1','captured fortress KPI reflects actual captured test fortresses');
  assert(!!metrics.rank,'rank is rendered');

  await page.click('#menuArmyBtn');
  await page.waitForSelector('#armyView.active');
  await page.click('#armyBackBtn');
  await page.waitForSelector('#homeView.active');

  await page.click('#menuCampaignBtn');
  await page.waitForSelector('#campaignMapView.active');
  await page.click('#campaignMapBackBtn');
  await page.waitForSelector('#homeView.active');

  await page.click('#menuCardboxBtn');
  await page.waitForSelector('#childProgressView.active');
  await page.waitForFunction(()=>document.activeElement?.id==='cardboxOverviewCard');

  await page.evaluate(()=>window.VTMenuUi.openHome());
  await page.waitForSelector('#homeView.active');
  await page.click('#menuAchievementsBtn');
  await page.waitForSelector('#childProgressView.active');
  await page.waitForFunction(()=>document.activeElement?.id==='progressOverviewCard');

  await page.evaluate(()=>window.VTMenuUi.openHome());
  await page.click('[data-menu-subject="latin"]');
  await page.waitForFunction(()=>state.activeSubject==='latin');
  assert((await page.locator('#menuSubjectLabel').textContent())==='Latein','subject switch updates menu context');

  assert(errors.length===0,'menu navigation must not produce browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Project Menu smoke: passed');
  console.log('✓ landscape menu shell and dominant learning CTA');
  console.log('✓ KPI banner uses existing academic/campaign data');
  console.log('✓ army, campaign, cardbox and achievements routes');
  console.log('✓ subject switching stays synchronized');
}finally{
  await browser.close();
}
