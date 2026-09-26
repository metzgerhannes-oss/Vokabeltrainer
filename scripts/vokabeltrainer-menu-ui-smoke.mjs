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
  await page.waitForFunction(()=>window.VTMenuAvatarArt?.readySubjects?.english===true);
  await page.waitForFunction(()=>window.VTArmyArt?.ready===true);

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

  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('#modal:not(.hidden)');
  assert(await page.locator('input[name="profileAvatarStyle"][value="male"]').count()===1,'profile settings expose male avatar option');
  assert(await page.locator('input[name="profileAvatarStyle"][value="female"]').count()===1,'profile settings expose female avatar option');
  await page.locator('input[name="profileAvatarStyle"][value="female"]').check();
  await page.click('#saveProfile');
  await page.waitForFunction(()=>learner().avatarStyle==='female');
  assert((await page.locator('#projectMenuAvatarFrame').getAttribute('data-avatar-style'))==='female','saved profile avatar choice reaches the project menu');
  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('#modal:not(.hidden)');
  await page.locator('input[name="profileAvatarStyle"][value="male"]').check();
  await page.click('#saveProfile');
  await page.waitForFunction(()=>learner().avatarStyle==='male');

  assert(await page.locator('#homeView .project-menu-link').count()===0,'Today screen has no secondary game or progress route cards');
  assert(await page.locator('#homeView #campaignCard').count()===0,'Today screen contains no campaign card');
  assert(await page.locator('#homeView #cardboxOverviewCard').count()===0,'Today screen contains no cardbox');
  assert(await page.locator('#homeView #testCheckCard').count()===0,'Today screen contains no test check');
  const bottomNav=await page.locator('.bottom-nav .nav-btn').allTextContents();
  assert(JSON.stringify(bottomNav.map(x=>x.trim()))===JSON.stringify(['⌂Heute','▥Lernen','⚔Armee','★Erfolge']),'child navigation is exactly Heute, Lernen, Armee, Erfolge');
  const bottomNavGrid=await page.locator('.bottom-nav').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length);
  assert(bottomNavGrid===4,'child bottom navigation uses exactly four equal columns');
  assert(await page.locator('#quickLearnHeroBtn').isVisible(),'Jetzt lernen stays visible');
  assert((await page.locator('#quickLearnHeroBtn').textContent())?.includes('Jetzt lernen'),'primary CTA is Jetzt lernen');

  const stage=await page.locator('.project-menu-stage').boundingBox();
  assert(stage&&stage.width/stage.height>1.65&&stage.width/stage.height<1.9,'menu stage keeps a landscape 16:9-like frame');

  const metrics=await page.evaluate(()=>({
    pct:subjectProgress().pct,
    avatarStage:document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarStage,
    avatarKey:document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarVisualKey,
    avatarLabel:document.querySelector('#menuAvatarStageLabel')?.textContent,
    avatarPips:document.querySelectorAll('#menuAvatarStagePips i.filled').length,
    avatarArtKey:document.querySelector('#projectMenuAvatarArt')?.dataset.avatarArtKey,
    avatarFinal:document.querySelector('#projectMenuAvatarArt')?.dataset.avatarFinal,
    avatarSrc:document.querySelector('#projectMenuAvatarArt')?.src||'',
    avatarNaturalWidth:document.querySelector('#projectMenuAvatarArt')?.naturalWidth||0,
    avatarNaturalHeight:document.querySelector('#projectMenuAvatarArt')?.naturalHeight||0
  }));
  assert(metrics.pct===50,'seed creates deterministic 50 percent mastery');
  assert(metrics.avatarStage==='3','50 percent academic progress maps to avatar stage 3');
  assert(metrics.avatarKey==='english-male-stage-3','avatar exposes a stable profile-specific artwork key');
  assert(metrics.avatarLabel==='Avatar · Stufe 3/6','avatar stage label is visible');
  assert(metrics.avatarPips===3,'avatar stage pips match current stage');
  assert(metrics.avatarFinal==='true','English menu uses final stage-specific avatar artwork');
  assert(metrics.avatarArtKey==='english-male-stage-3','English male avatar artwork matches the computed stage');
  assert(metrics.avatarSrc.startsWith('blob:'),'stage artwork is reconstructed locally from offline assets');
  assert(metrics.avatarNaturalHeight>metrics.avatarNaturalWidth*1.25,'English avatar artwork must remain a full-body portrait asset');
  const styleIsolation=await page.evaluate(()=>{
    const before=subjectProgress('english').pct;
    learner().avatarStyle='female';
    window.VTMenuUi.render();
    const female={
      style:document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarStyle,
      key:document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarVisualKey,
      final:document.querySelector('#projectMenuAvatarArt')?.dataset.avatarFinal||''
    };
    const after=subjectProgress('english').pct;
    learner().avatarStyle='male';
    window.VTMenuUi.render();
    return {before,after,female};
  });
  assert(styleIsolation.female.style==='female','learner profile can select the female avatar track');
  assert(styleIsolation.female.key==='english-female-stage-3','female profile keeps the same academic stage with its own artwork namespace');
  assert(styleIsolation.female.final!=='true','female track uses fallback until its dedicated artwork files are added');
  assert(styleIsolation.before===styleIsolation.after,'avatar profile style never changes academic mastery');
  const boundaries=await page.evaluate(()=>[0,17,18,35,36,53,54,71,72,89,90,100].map(p=>[p,avatarStageFor(p,'english').level]));
  assert(JSON.stringify(boundaries)===JSON.stringify([[0,1],[17,1],[18,2],[35,2],[36,3],[53,3],[54,4],[71,4],[72,5],[89,5],[90,6],[100,6]]),'avatar stage thresholds stay deterministic');

  await page.click('.nav-btn[data-view="practiceView"]');
  await page.waitForSelector('#practiceView.active');
  assert(await page.locator('#practiceView #cardboxOverviewCard').isVisible(),'cardbox lives in Lernen');
  assert(await page.locator('#practiceView #campaignCard').count()===0,'Lernen contains no campaign UI');
  assert(await page.locator('#practiceView .practice-path').count()===4,'Lernen exposes the four learning routes');

  await page.click('.nav-btn[data-view="armyView"]');
  await page.waitForSelector('#armyView.active');
  assert(await page.locator('#armyView #campaignCard').isVisible(),'campaign lives in Armee');
  assert(await page.locator('#armyView #cardboxOverviewCard').count()===0,'Armee contains no cardbox');
  assert((await page.locator('.nav-btn[data-view="armyView"]').getAttribute('aria-current'))==='page','Armee navigation stays active in game hub');
  await page.click('#campaignMapBtn');
  await page.waitForSelector('#campaignMapView.active');
  assert((await page.locator('.nav-btn[data-view="armyView"]').getAttribute('aria-current'))==='page','Armee navigation stays active on campaign map');
  await page.click('#campaignMapBackBtn');
  await page.waitForSelector('#armyView.active');

  await page.click('.nav-btn[data-view="childProgressView"]');
  await page.waitForSelector('#childProgressView.active');
  assert(await page.locator('#progressOverviewCard').isVisible(),'Erfolge shows academic progress');
  assert(await page.locator('#childProgressView #campaignCard').count()===0,'Erfolge contains no campaign UI');
  assert(await page.locator('#childProgressView #cardboxOverviewCard').count()===0,'Erfolge contains no cardbox');
  await page.click('#progressMenuBtn');
  await page.waitForSelector('#homeView.active .project-menu-stage');

  await page.evaluate(()=>window.VTMenuUi.openHome());
  const beforeSwitch=await page.evaluate(()=>subjectProgress('english').pct);
  await page.click('[data-menu-subject="latin"]');
  await page.waitForFunction(()=>state.activeSubject==='latin');
  assert((await page.locator('#menuSubjectLabel').textContent())==='Latein','subject switch updates menu context');
  assert((await page.locator('#projectMenuAvatarFrame').getAttribute('data-avatar-visual-key'))==='latin-male-stage-1','avatar artwork key follows subject, profile style and its own academic progress');
  assert((await page.locator('#projectMenuAvatarArt').getAttribute('data-avatar-final'))==='false','Latin intentionally keeps the shared fallback until its own six final artworks are added');
  assert(await page.evaluate(()=>subjectProgress('english').pct)===beforeSwitch,'rendering and switching avatar context never changes academic mastery');

  assert(errors.length===0,'menu navigation must not produce browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Project Menu smoke: passed');
  console.log('✓ landscape menu shell and dominant learning CTA');
  console.log('✓ Today contains only avatar and daily learning action');
  console.log('✓ Lernen, Armee and Erfolge are structurally separated');
  console.log('✓ six avatar stages are deterministic and learning-derived');
  console.log('✓ male/female avatar style is learner-profile-specific and mastery-neutral');
  console.log('✓ English male uses matching full-body offline artwork for its computed stage');
  console.log('✓ subject switching stays synchronized without changing mastery');
}finally{
  await browser.close();
}
