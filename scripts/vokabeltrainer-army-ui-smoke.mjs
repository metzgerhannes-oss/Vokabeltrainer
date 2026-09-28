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
    const set={id:'army_set',learnerId:'learner_demo',subject:'english',title:'Army Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(7),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'shield',translation:'Schild',source:'army-smoke',verified:true});
    for(const link of state.setVocabulary){link.firstContactCopiedAt=link.firstContactRecalledAt=link.firstContactCompletedAt=new Date().toISOString()}
    const p=state.learnerVocabulary[0];
    p.skills={recognition:4,listening:4,retrieval:4,spelling:4,context:4};p.independentSuccesses=8;p.activeSuccessDays=['2026-09-10','2026-09-14','2026-09-18'];p.activePracticeDays=[...p.activeSuccessDays];p.maxActiveGapDays=7;p.coldRecallDays=['2026-09-14','2026-09-18'];p.coldRecallSuccesses=2;p.intervalDays=14;p.errorProfile={meaning:0,retrieval:0,spelling:0,listening:0,context:0,grammar:0};refreshMastery(p);
    state.learners[0].streakDays=['2026-09-19','2026-09-20','2026-09-21','2026-09-22','2026-09-23'];
    state.learners[0].milestones[`hundred_english_${currentSchoolYear()}`]=new Date().toISOString();
    state.learners[0].testFortresses={
      stale_superseded:{key:'stale_superseded',id:'tower',name:'Alter Test',subject:'english',testDate:datePlusDays(1),setIds:['superseded_test'],defense:100,maxDefense:100,attacks:[]}
    };
    const xpBefore=state.learners[0].xp;
    const gradeRow={id:'grade_six',learnerId:'learner_demo',subject:'english',date:'2026-09-23',grade:'6',note:'',practiceTestId:null};
    state.grades.push(gradeRow);
    const lowReward=grantTestGradeReward(gradeRow);
    const repeatedReward=grantTestGradeReward(gradeRow);
    window.__testGradeRewardSmoke={xpBefore,lowReward,repeatedReward,xpAfter:state.learners[0].xp,topReward:testGradeReward('1'),badges:testBadgeCount('english')};
    rebuildWordIndexes();renderAll();showView('homeView');
  });

  const rewardSmoke=await page.evaluate(()=>window.__testGradeRewardSmoke);
  assert(rewardSmoke.lowReward?.totalXp===50,'grade 6 still receives the full 50 XP completion reward');
  assert(rewardSmoke.topReward?.totalXp===60,'grade 1 differs only by a small 10 XP bonus');
  assert(rewardSmoke.xpAfter-rewardSmoke.xpBefore===50,'test reward is added exactly once');
  assert(rewardSmoke.repeatedReward===null,'saving the same rewarded grade cannot duplicate XP');
  assert(rewardSmoke.badges===1,'every valid entered test grade creates one test badge');
  const before=await page.evaluate(()=>subjectProgress().pct);
  await page.click('.nav-btn[data-view="armyView"]');
  await page.waitForSelector('#armyView.active');
  assert(await page.locator('#armyView #campaignCard').isVisible(),'game hub contains the campaign card');
  assert(await page.locator('#campaignCard .game-loop-step').count()===3,'game hub exposes the three-step learn attack capture loop');
  assert(await page.locator('#gameLoopLearn.current').count()===1,'learning is the current step before the daily attack reward');
  assert(await page.locator('#gameLoopAttack.locked').count()===1,'attack stays locked until the learning reward exists');
  assert(await page.locator('#gameLoopCapture.locked').count()===1,'capture stays locked before an attack');
  assert((await page.locator('#gameMissionTitle').textContent())?.length>0,'game hub names the current fortress mission');
  assert((await page.locator('#gameMissionStatus').textContent())?.includes('ANGRIFF'),'game hub exposes the current attack state');
  assert((await page.locator('#attackBtn').textContent())?.includes('FESTUNG'),'primary game action clearly points to the fortress');
  assert((await page.locator('.frontline-own').textContent())?.trim()==='Mein Profil','frontline banner identifies the player side with the active profile name');
  assert((await page.locator('.frontline-target').textContent())?.trim()==='Test 1','frontline target banner uses Test plus the school-year sequence number');
  assert(await page.evaluate(()=>testSequenceNumber(currentTestFortress().testDate,'english'))===1,'superseded fortress history cannot increment the visible test number');
  await page.evaluate(()=>{delete state.learners[0].testFortresses.stale_superseded;});
  assert(await page.locator('#battlefield .battle-fortress').count()===1,'CSS fortress remains available only as a technical fallback');
  assert(await page.locator('#battlefield .fortress:not(.battle-fortress)').count()===0,'legacy mini fortress is absent from the army command scene');
  const commandVisual=await page.evaluate(()=>({
    loopColumns:getComputedStyle(document.querySelector('#campaignCard .game-loop')).gridTemplateColumns,
    missionBackground:getComputedStyle(document.querySelector('#campaignCard .game-mission-panel')).backgroundColor,
    cardRadius:getComputedStyle(document.querySelector('#campaignCard')).borderRadius
  }));
  assert(commandVisual.loopColumns.split(' ').length===3,'mobile learn/attack/capture loop stays compact and horizontal');
  assert(commandVisual.cardRadius!=='0px','army command card keeps a composed card silhouette on mobile');
  assert((await page.locator('.nav-btn[data-view="armyView"]').getAttribute('aria-current'))==='page','Armee is the active primary navigation area');
  await page.waitForFunction(()=>window.VTArmyArt?.ready===true);
  await page.waitForFunction(()=>document.querySelector('#battlefield.progress-army-artwork .progress-army-art')?.naturalWidth>0);
  await page.waitForFunction(()=>document.querySelector('#battlefield')?.classList.contains('integrated-campaign-artwork'));
  const commandVisualScene=await page.evaluate(()=>({
    opacity:parseFloat(getComputedStyle(document.querySelector('#battlefield .progress-army-art')).opacity||'0'),
    fortressDisplay:getComputedStyle(document.querySelector('#battlefield .battle-fortress')).display,
    armyDisplay:getComputedStyle(document.querySelector('#battlefield .army')).display,
    artSrc:document.querySelector('#battlefield .progress-army-art')?.src||'',
    targetSrc:window.VTBattleArt?.sceneUrl||''
  }));
  assert(commandVisualScene.opacity>=0.95,'integrated campaign artwork is fully visible');
  assert(commandVisualScene.fortressDisplay==='none'&&commandVisualScene.armyDisplay==='none','painted army and fortress replace pasted-on CSS geometry');
  assert(commandVisualScene.artSrc===commandVisualScene.targetSrc,'army overview reuses the cohesive battle campaign scene instead of a separate camp background');
  const commandComposition=await page.evaluate(()=>{
    const stageEl=document.querySelector('#armyView .game-frontline-stage');
    const stage=stageEl?.getBoundingClientRect();
    const panel=document.querySelector('#armyView .game-mission-panel')?.getBoundingClientRect();
    const own=document.querySelector('#armyView .frontline-own');
    const target=document.querySelector('#armyView .frontline-target');
    const ownRect=own?.getBoundingClientRect(),targetRect=target?.getBoundingClientRect();
    return {
      gap:stage&&panel?Math.round(panel.top-stage.bottom):null,
      ownRadius:own?parseFloat(getComputedStyle(own).borderTopLeftRadius||'0'):null,
      targetRadius:target?parseFloat(getComputedStyle(target).borderTopLeftRadius||'0'):null,
      ownFont:own?getComputedStyle(own).fontFamily:'',
      ownBackground:own?getComputedStyle(own).backgroundImage:'',
      ownWidth:ownRect?.width||0,
      ownHeight:ownRect?.height||0,
      targetWidth:targetRect?.width||0,
      targetHeight:targetRect?.height||0,
      ownRelativeTop:stage&&ownRect?(ownRect.top-stage.top)/stage.height:null,
      targetRelativeTop:stage&&targetRect?(targetRect.top-stage.top)/stage.height:null,
      ownShieldWidth:own?parseFloat(getComputedStyle(own,'::before').width||'0'):0,
      targetShieldWidth:target?parseFloat(getComputedStyle(target,'::before').width||'0'):0,
      ownShieldHeight:own?parseFloat(getComputedStyle(own,'::before').height||'0'):0,
      targetShieldHeight:target?parseFloat(getComputedStyle(target,'::before').height||'0'):0,
      ownRodWidth:own?parseFloat(getComputedStyle(own,'::after').width||'0'):0,
      targetRodWidth:target?parseFloat(getComputedStyle(target,'::after').width||'0'):0,
      ownScrollCapWidth:own?.querySelector('span')?parseFloat(getComputedStyle(own.querySelector('span'),'::before').width||'0'):0,
      targetScrollCapWidth:target?.querySelector('span')?parseFloat(getComputedStyle(target.querySelector('span'),'::after').width||'0'):0,
      ownOverflow:own?getComputedStyle(own).overflow:'',
      ownHasTextSpan:!!own?.querySelector('span'),
      targetHasTextSpan:!!target?.querySelector('span')
    };
  });
  assert(commandComposition.gap!==null&&commandComposition.gap>=8,'mobile mission card stays clearly below the campaign image without overlap');
  assert(commandComposition.ownRadius!==null&&commandComposition.ownRadius<=8&&commandComposition.targetRadius<=8,'campaign identity labels render as banners instead of pill badges');
  assert(commandComposition.ownFont.includes('Georgia')&&commandComposition.ownBackground.includes('linear-gradient'),'campaign identity labels use the approved parchment-scroll treatment');
  assert(commandComposition.ownWidth>commandComposition.ownHeight*2.5&&commandComposition.targetWidth>commandComposition.targetHeight*2.5,'campaign identity banners are horizontal scroll banners');
  assert(commandComposition.ownRelativeTop<0.15&&commandComposition.targetRelativeTop<0.15,'approved heraldic banners stay near the top edge of the campaign artwork');
  assert(commandComposition.ownShieldWidth>=36&&commandComposition.targetShieldWidth>=36,'each banner carries the large hanging heraldic crest from the reference');
  assert(commandComposition.ownShieldHeight>commandComposition.ownHeight&&commandComposition.targetShieldHeight>commandComposition.targetHeight,'heraldic crests hang below the parchment like the approved reference');
  assert(commandComposition.ownRodWidth>commandComposition.ownWidth+50&&commandComposition.targetRodWidth>commandComposition.targetWidth+50,'each banner has a spear-ended ceremonial rod extending well beyond the parchment');
  assert(commandComposition.ownScrollCapWidth>=7&&commandComposition.targetScrollCapWidth>=7,'parchment scroll ends are visibly rolled instead of flat modern cards');
  assert(commandComposition.ownOverflow==='visible'&&commandComposition.ownHasTextSpan&&commandComposition.targetHasTextSpan,'profile and test text remain inside the parchment while heraldic details remain visible');
  await page.waitForFunction(()=>document.querySelector('[data-army-hero-art]')?.naturalWidth>0);
  await page.waitForFunction(()=>document.querySelectorAll('#armyUnitGrid .army-unit-art.art-loaded').length===6);
  await page.waitForFunction(()=>document.querySelectorAll('#armyFormationField .army-formation-art.art-loaded').length===6);
  assert(await page.locator('[data-army-hero-art]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'illustrated camp artwork loads');
  const yearArmyVisual=await page.evaluate(()=>({
    growth:campaignGrowthState().pct,
    stage:document.querySelector('#armyHero')?.dataset.growthStage||'',
    fullArmyOpacity:parseFloat(getComputedStyle(document.querySelector('[data-army-hero-art]')).opacity||'0'),
    visibleGrowthUnits:[...document.querySelectorAll('#armyHero .army-camp-growth-unit')].filter(el=>getComputedStyle(el).display!=='none').length
  }));
  assert(yearArmyVisual.growth===0&&yearArmyVisual.stage==='1','one mastered word remains an early school-year army stage');
  assert(yearArmyVisual.fullArmyOpacity===0,'the fully equipped hero army is hidden before the final development stage');
  assert(yearArmyVisual.visibleGrowthUnits===2,'the hero composition contains only currently unlocked unit groups at the early stage');

  assert(await page.locator('#armyUnitGrid .army-unit-art.art-loaded').count()===6,'six illustrated unit artworks load');
  assert(await page.locator('#armyFormationField .army-formation-unit').count()===6,'heerlager shows all six units in one formation');
  assert(await page.locator('#armyFormationField .army-formation-art.art-loaded').count()===6,'heerlager reuses all six local illustrated unit artworks');
  assert((await page.locator('#armyFormationField').textContent())?.includes('Fernkampf'),'heerlager exposes tactical roles directly in the formation');
  assert((await page.locator('#armyFormationField [data-army-unit="infantry"]').textContent())?.includes('Rekrut'),'early-year formation starts visibly small instead of showing a veteran army');
  assert(await page.locator('#armyUnitGrid .army-unit-card').count()===6,'six unit cards are shown');
  assert(await page.locator('#armyUnitGrid .army-stage-badge').count()===6,'every unit card shows its visible development stage');
  assert(await page.locator('#armyUnitGrid .army-stage-pips i').count()===30,'all unit cards expose the full five-stage ladder');
  assert(await page.locator('#armyUnitGrid [data-army-unit="infantry"]').getAttribute('data-unit-stage')==='1','one mastered word does not create a fully equipped army');
  assert((await page.locator('#armyUnitGrid [data-army-unit="infantry"] .army-unit-level').textContent())?.includes('Rekrut'),'the first visible infantry stage is clearly labelled recruit');
  assert(await page.locator('#armyUnitGrid [data-army-unit="support"]').getAttribute('data-unit-stage')==='1','five learning days render support at stage one');
  assert((await page.locator('#armyUnitGrid [data-army-unit="support"] .army-unit-level').textContent())?.includes('Rekrut'),'stage one has a visible recruit label');
  assert((await page.locator('#armyViewTitle').textContent())?.includes('Armee'),'game area has a clear army title');
  await page.click('#armyBattleBtn');
  await page.waitForSelector('#battleView.active');
  assert((await page.locator('#battleBackBtn').textContent())?.includes('Meine Armee'),'fortress opened from the army returns to the army instead of progress');
  assert((await page.locator('#battleReturnBtn').textContent())?.includes('meiner Armee'),'bottom battle return action matches the army origin');
  await page.click('#battleBackBtn');
  await page.waitForSelector('#armyView.active');
  assert((await page.locator('#armyRank').textContent())?.length>0,'rank is visible in the campaign game hub');
  assert((await page.locator('#armySummary').textContent())?.includes('Prüfungsabzeichen'),'army summary shows completed-test badges');
  assert(await page.locator('#armyRoleGrid .army-role-card').count()===6,'six distinct army roles are shown');
  const roleText=await page.locator('#armyRoleGrid').textContent();
  for(const role of ['Front','Fernkampf','Mobilität','Belagerung','Schutz','Versorgung'])assert(roleText?.includes(role),'army role is visible: '+role);
  assert(await page.locator('#armyRoleGrid progress').count()===6,'every role exposes a visible strength value');
  assert(await page.locator('#armyBonusGrid .army-bonus').count()===4,'four presentation bonuses are shown');
  assert(await page.locator('#armyUnitGrid .army-unit-card.unlocked').count()===2,'early-year state exposes only the basic infantry plus earned support instead of a full army');
  await page.click('#armyFormationField [data-army-unit="archers"]');
  await page.waitForSelector('#armyUnitView.active');
  assert((await page.locator('#armyUnitViewTitle').textContent())?.includes('Bogenschützen'),'formation unit opens the same dedicated detail view');
  await page.click('#armyUnitBackBtn');
  await page.waitForSelector('#armyView.active');
  await page.click('#armyUnitGrid [data-army-unit="support"]');
  await page.waitForSelector('#armyUnitView.active');
  assert((await page.locator('#armyUnitViewTitle').textContent())?.includes('Sanitäter'),'unit selection opens a dedicated detail view');
  assert((await page.locator('#armyUnitDetail .army-detail-role').textContent())?.includes('Versorgung'),'detail view explains the unit role');
  assert((await page.locator('#armyUnitDetail .army-detail-role').textContent())?.includes('/ 100'),'detail view exposes the role strength');
  assert((await page.locator('#armyUnitDetail .army-detail-level-badge').textContent())?.includes('Stufe 1 · Rekrut'),'detail artwork shows the exact current stage');
  assert(await page.locator('#armyUnitDetail .army-stage-pips i.filled').count()===1,'detail stage marker matches the current level');
  assert((await page.locator('#armyUnitDetail .army-upgrade-step').nth(4).textContent())?.includes('Stufe 5 · Veteran'),'upgrade road names the fifth visual stage');
  assert(await page.locator('#armyUnitDetail .army-upgrade-step').count()===5,'detail view shows a five-step upgrade path');
  assert((await page.locator('#armyUnitDetail').textContent())?.includes('Nächste sichtbare Verbesserung'),'detail view names the next visible improvement');
  assert((await page.locator('#armyUnitDetail').textContent())?.includes('Lerne an 7 verschiedenen Tagen.'),'detail view states the exact next learning condition');
  await page.waitForFunction(()=>document.querySelector('#armyUnitDetail .army-detail-art')?.classList.contains('art-loaded'));
  assert(await page.locator('#armyUnitDetail .army-detail-art.art-loaded').count()===1,'detail view reuses the illustrated unit artwork');
  await page.click('#armyUnitBackBtn');
  await page.waitForSelector('#armyView.active');
  const after=await page.evaluate(()=>subjectProgress().pct);
  assert(before===after,'opening and inspecting the army does not alter academic mastery');
  const rect=await page.locator('#armyView').boundingBox();
  assert(rect&&rect.width<=page.viewportSize().width+1,'army view does not overflow iPhone viewport');

  await page.click('#armyBackBtn');
  await page.waitForSelector('#homeView.active');
  await page.click('.nav-btn[data-view="armyView"]');
  await page.waitForSelector('#armyView.active');
  await page.click('#campaignMapBtn');
  await page.waitForSelector('#campaignMapView.active');
  assert((await page.locator('.nav-btn[data-view="armyView"]').getAttribute('aria-current'))==='page','campaign map remains inside the Armee primary area');
  assert(await page.locator('#campaignMapBoard .campaign-war-header').count()===1,'campaign map exposes a route status header');
  assert((await page.locator('#campaignMapBoard .campaign-war-header').textContent())?.includes('KAMPAGNENPFAD'),'English map uses the campaign route language');
  assert((await page.locator('#campaignMapView').getAttribute('data-visual-theme'))==='campaign','English map uses the campaign visual theme');
  assert(await page.locator('#campaignMapBoard .campaign-map-station').count()===3,'campaign map shows two known test stations plus the year fortress');
  assert(await page.locator('#campaignMapBoard .campaign-map-unknown').count()===1,'unknown future remains visible instead of assuming a fixed test count');
  assert((await page.locator('#campaignMapBoard .campaign-map-unknown').textContent())?.includes('UNERKUNDETES GEBIET'),'unknown future stays exploratory instead of using aggressive war language');
  assert((await page.locator('#campaignMapBoard .campaign-map-unknown').textContent())?.includes('Neue Tests erscheinen automatisch'),'map explains dynamic future growth');
  assert(await page.locator('#campaignMapBoard .status-active').count()===1,'nearest planned test is the active map target');
  assert((await page.locator('#campaignMapDetail').textContent())?.includes('Aktuelles Testziel'),'active target opens its real test detail');
  assert(!(await page.locator('#campaignMapDetail').isHidden()),'campaign detail is visible for the selected target');

  await page.click('#campaignMapBoard .campaign-map-station.selected');
  assert(await page.locator('#campaignMapDetail').isHidden(),'second click on the selected target closes the detail completely');
  await page.evaluate(()=>VTCampaignMap.render());
  assert(await page.locator('#campaignMapDetail').isHidden(),'a deliberate close survives a campaign rerender');

  await page.click('#campaignMapBoard .status-active .campaign-map-station');
  assert(!(await page.locator('#campaignMapDetail').isHidden()),'target can be selected again after dismissal');
  await page.keyboard.press('Escape');
  assert(await page.locator('#campaignMapDetail').isHidden(),'Escape closes campaign detail');

  await page.click('#campaignMapBoard .status-active .campaign-map-station');
  await page.evaluate(()=>{
    const route=document.querySelector('.campaign-map-route');
    route?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
    route?.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  });
  assert(await page.locator('#campaignMapDetail').isHidden(),'clicking the free route or connection path closes campaign detail');

  await page.click('#campaignMapBoard .status-active .campaign-map-station');
  await page.click('#campaignMapDetail [data-campaign-detail-close]');
  assert(await page.locator('#campaignMapDetail').isHidden(),'explicit close button hides campaign detail');
  const mapBefore=await page.evaluate(()=>VTCampaignMap.stations().map(x=>x.key));
  await page.evaluate(()=>{
    state.sets.push({id:'army_future_set',learnerId:'learner_demo',subject:'english',title:'Later Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(21),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()});
    VTCampaignMap.render();
  });
  const mapAfter=await page.evaluate(()=>VTCampaignMap.stations().map(x=>x.key));
  assert(mapAfter.length===mapBefore.length+1,'adding a newly planned test grows the campaign map by exactly one station');
  assert(mapBefore.every((key,i)=>mapAfter[i]===key),'existing earlier campaign stations keep their order when a later test is added');
  assert(await page.locator('#campaignMapBoard .campaign-map-station').count()===4,'newly planned test appears before the year fortress without a hard-coded total');
  const yearGoalDate=await page.evaluate(()=>{
    const target=datePlusDays(35),saved=setYearFortressDate(target,'english',currentSchoolYear());
    if(!saved.ok)throw new Error(saved.error);
    VTCampaignMap.render();return target;
  });
  assert((await page.locator('#campaignMapBoard .campaign-map-year-fortress').textContent())?.includes(await page.evaluate(d=>formatDateShort(d),yearGoalDate)),'annual fortress shows its real date once that date is known');
  await page.click('#campaignMapBoard .campaign-map-year-fortress');
  assert((await page.locator('#campaignMapDetail').textContent())?.includes('Nur vorwärts'),'annual-fortress detail explains monotonic year progression');
  assert((await page.locator('#campaignMapDetail').textContent())?.includes(await page.evaluate(d=>formatDateShort(d),yearGoalDate)),'annual-fortress detail shows the stored real date');
  const rejectedYearGoal=await page.evaluate(()=>{
    const before=yearFortressState('english',currentSchoolYear()).date;
    const result=setYearFortressDate(datePlusDays(10),'english',currentSchoolYear());
    return {ok:result.ok,before,after:yearFortressState('english',currentSchoolYear()).date};
  });
  assert(rejectedYearGoal.ok===false&&rejectedYearGoal.after===rejectedYearGoal.before,'annual fortress cannot be dated before an already planned later test');

  const mapRect=await page.locator('#campaignMapView').boundingBox();
  assert(mapRect&&mapRect.width<=page.viewportSize().width+1,'campaign map view does not overflow iPhone viewport');

  const monotonicGrowth=await page.evaluate(()=>{
    const l=learner();
    for(let i=1;i<=12;i++){const d=datePlusDays(-i);l.completedTests[`english:${d}`]={subject:'english',date:d,completedAt:new Date().toISOString(),scopeText:'Smoke',wordCount:1}}
    const beforeGrowth=campaignGrowthState('english',currentSchoolYear()),beforeAcademic=subjectProgress('english').pct;
    const set={id:'growth_denominator_set',learnerId:l.id,subject:'english',title:'New future material',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    for(let i=0;i<12;i++)attachVocabularyToSet(set.id,{term:`future-${i}`,translation:`neu-${i}`,source:'growth-smoke',verified:true});
    rebuildWordIndexes();
    const afterGrowth=campaignGrowthState('english',currentSchoolYear()),afterAcademic=subjectProgress('english').pct;
    return {beforeGrowth,afterGrowth,beforeAcademic,afterAcademic};
  });
  assert(monotonicGrowth.afterAcademic<monotonicGrowth.beforeAcademic,'newly introduced future vocabulary may lower the current academic known-word percentage');
  assert(monotonicGrowth.afterGrowth.points===monotonicGrowth.beforeGrowth.points&&monotonicGrowth.afterGrowth.level===monotonicGrowth.beforeGrowth.level,'new future vocabulary never downgrades accumulated avatar or army development');

  await page.evaluate(()=>{
    state.activeSubject='latin';
    VTCampaignMap.render();
  });
  assert((await page.locator('#campaignMapView').getAttribute('data-visual-theme'))==='roman','Latin map switches to the Roman visual theme');
  assert((await page.locator('#campaignMapViewTitle').textContent())?.includes('Marschroute'),'Latin map uses a Roman route title');
  assert((await page.locator('#campaignMapBoard .campaign-war-header').textContent())?.includes('RÖMISCHE MARSCHROUTE'),'Latin map uses Roman route language');
  assert((await page.locator('#campaignMapBoard .campaign-map-unknown').textContent())?.includes('UNBEKANNTE PROVINZ'),'Latin unknown future is a province rather than generic fog of war');
  await page.evaluate(()=>{
    state.activeSubject='english';
    VTCampaignMap.render();
  });
  assert(await page.evaluate(()=>subjectProgress().pct)===before,'campaign map never changes academic mastery');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer army UI smoke: passed');
}finally{
  await browser.close();
}
