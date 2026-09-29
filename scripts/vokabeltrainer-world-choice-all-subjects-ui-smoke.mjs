import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('All-subject world choice UI smoke failed: '+m)};

async function seedSubject(subject,term,translation){
  await page.evaluate(({subject,term,translation})=>{
    state=defaultState();
    learner().activeSubjects=[subject];
    learner().worldModeBySubject=normalizeWorldModeBySubject({[subject]:'battle'});
    state.activeSubject=subject;
    const set={id:'world_'+subject,learnerId:learner().id,subject,title:'Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(5),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term,translation,source:'all-world-smoke',verified:true,firstContactCopiedAt:'x',firstContactRecalledAt:'x',firstContactCompletedAt:'x'});
    set.pairVerifiedSignature=pairReviewSignatureForSet(set.id);
    rebuildWordIndexes();currentTestFortress(subject);unlockBattleToday('dailyGoal',subject);renderAll();showView('homeView');
  },{subject,term,translation});
}

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTArmyUi&&!!window.VTCampaignMap&&!!window.VTWorldStory);

  const avatarMatrix=await page.evaluate(()=>{
    state=defaultState();showView('homeView');
    const l=learner(),out={};
    for(const subject of ['english','latin','german','french']){
      state.activeSubject=subject;
      setLearnerWorldMode(l,subject,'battle');
      window.VTMenuUi.renderAvatarStage(38);window.VTMenuUi.applyAvatarArt();
      const battle=document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarRenderKey||'';
      setLearnerWorldMode(l,subject,'adventure');
      window.VTMenuUi.renderAvatarStage(38);window.VTMenuUi.applyAvatarArt();
      const adventure=document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarRenderKey||'';
      out[subject]={battle,adventure};
    }
    return out;
  });
  for(const subject of ['english','latin','german','french']){
    assert(avatarMatrix[subject].battle.includes(subject+'-battle-'),subject+' battle avatar key is world-specific');
    assert(avatarMatrix[subject].adventure.includes(subject+'-adventure-'),subject+' adventure avatar key is world-specific');
    assert(avatarMatrix[subject].battle!==avatarMatrix[subject].adventure,subject+' avatar is rebuilt when the story world changes');
  }

  await page.evaluate(()=>{state=defaultState();renderAll();showView('homeView');openProfileEditor()});
  await page.waitForSelector('#modal[open] #saveProfile');
  await page.locator('#profileName').fill('Welten Kind');
  assert(await page.locator('[data-profile-world-subject="english"]:not(.hidden)').count()===1,'English world choice is visible for the default active subject');
  assert(await page.locator('input[name="profileWorldMode-english"]:checked').count()===0,'new English profile has no silent world default');
  await page.locator('#saveProfile').click();
  assert((await page.locator('#profileError').textContent())?.includes('Englisch'),'missing English world choice blocks creation');
  await page.locator('input[name="profileWorldMode-english"][value="adventure"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learner()?.name==='Welten Kind');
  assert(await page.evaluate(()=>learnerWorldMode('english')==='adventure'),'explicit English adventure choice is saved');

  await seedSubject('english','house','Haus');
  const initialEnglish=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    const frame=document.querySelector('#projectMenuAvatarFrame');
    return {mastery:subjectProgress('english').pct,growth:campaignGrowthState('english').pct,avatarKey:frame?.dataset.avatarRenderKey||''};
  });
  assert(initialEnglish.avatarKey.includes('english-battle-'),'English battle has a battle-specific avatar render key');
  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('[data-profile-world-subject="english"]:not(.hidden)');
  await page.locator('input[name="profileWorldMode-english"][value="adventure"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learnerWorldMode('english')==='adventure');
  const englishAdventureAvatar=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    const frame=document.querySelector('#projectMenuAvatarFrame');
    return {key:frame?.dataset.avatarRenderKey||'',mode:frame?.dataset.worldMode||'',imgHidden:document.querySelector('#projectMenuAvatarArt')?.classList.contains('hidden')};
  });
  assert(englishAdventureAvatar.mode==='adventure'&&englishAdventureAvatar.key.includes('english-adventure-'),'English adventure rebuilds the avatar under its own render key');
  assert(englishAdventureAvatar.key!==initialEnglish.avatarKey&&englishAdventureAvatar.imgHidden,'English world switch cannot leave the battle art visible');
  await page.evaluate(()=>window.VTArmyUi.open());
  await page.waitForSelector('#armyView.active');
  let hub=await page.evaluate(()=>({mode:document.querySelector('#armyView')?.dataset.worldMode,title:document.querySelector('#armyViewTitle')?.textContent||'',route:document.querySelectorAll('.subject-adventure-route span').length,units:(document.querySelector('#armyUnitGrid')?.textContent||'').trim(),action:document.querySelector('#armyBattleBtn')?.textContent||'',story:document.querySelector('.subject-adventure-story strong')?.textContent||'',storyRead:document.querySelectorAll('.subject-adventure-story .read-aloud-btn').length}));
  assert(hub.mode==='adventure'&&hub.title==='Deine Expedition'&&hub.route===6,'English adventure has its own six-stage expedition hub');
  assert(!hub.units&&hub.action.includes('fortsetzen'),'English adventure hides combat units and exposes non-combat action');
  assert(hub.story.includes('Kapitel')&&hub.storyRead===1,'English adventure shows a readable canonical story chapter');
  await page.click('#armyBattleBtn');
  await page.waitForSelector('#campaignMapView.active');
  let mapState=await page.evaluate(()=>({theme:document.querySelector('#campaignMapView')?.dataset.visualTheme,mode:document.querySelector('#campaignMapView')?.dataset.worldMode,battle:document.querySelector('#battleView')?.classList.contains('active'),used:battleDayState('english',false)?.actionUsed===true,mastery:subjectProgress('english').pct,growth:campaignGrowthState('english').pct,story:document.querySelector('.campaign-map-story strong')?.textContent||'',storyRead:document.querySelectorAll('.campaign-map-story .read-aloud-btn').length}));
  assert(mapState.theme==='english-adventure'&&mapState.mode==='adventure'&&!mapState.battle,'English adventure stays outside battle screen');
  assert(mapState.used&&mapState.mastery===initialEnglish.mastery,'English adventure consumes same action without changing mastery');
  assert(mapState.story&&mapState.storyRead===1,'world map exposes the same readable story layer');

  await seedSubject('latin','porta','Tor');
  const latinKeys=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    const frame=document.querySelector('#projectMenuAvatarFrame'),battle=frame?.dataset.avatarRenderKey||'';
    setLearnerWorldMode(learner(),'latin','adventure');renderAll();window.VTMenuUi.render();
    const adventure=frame?.dataset.avatarRenderKey||'';
    return {battle,adventure,mode:frame?.dataset.worldMode||''};
  });
  assert(latinKeys.battle.includes('latin-battle-')&&latinKeys.adventure.includes('latin-adventure-')&&latinKeys.battle!==latinKeys.adventure,'Latin avatar renderer swaps cleanly between battle and adventure');
  await page.evaluate(()=>window.VTArmyUi.open());
  await page.waitForSelector('#armyView.active');
  hub=await page.evaluate(()=>({theme:document.querySelector('#armyView')?.dataset.visualTheme,title:document.querySelector('#armyViewTitle')?.textContent||'',route:document.querySelectorAll('.subject-adventure-route span').length}));
  assert(hub.theme==='latin-adventure'&&hub.title==='Iter Romanum'&&hub.route===6,'Latin adventure has a distinct civilian discovery route');
  await page.evaluate(()=>window.VTCampaignMap.open());
  await page.waitForSelector('#campaignMapView.active');
  assert(await page.evaluate(()=>document.querySelector('#campaignMapView')?.dataset.visualTheme)==='latin-adventure','Latin map uses adventure theme');

  const french=await page.evaluate(()=>{
    const l=learner();
    setLearnerWorldMode(l,'french','adventure');
    const adventureTheme=subjectVisualTheme('french',l),adventurePresentation=battlePresentation('french').theme;
    setLearnerWorldMode(l,'french','battle');
    const battleTheme=subjectVisualTheme('french',l),battlePresentationTheme=battlePresentation('french').theme;
    return {adventureTheme,adventurePresentation,battleTheme,battlePresentationTheme};
  });
  assert(french.adventureTheme==='voyage'&&french.adventurePresentation==='voyage','French adventure keeps Voyage Français');
  assert(french.battleTheme==='french-battle'&&french.battlePresentationTheme==='french-battle','French battle is a separate fictional fortress world');

  const stories=await page.evaluate(()=>({
    germanBattle:VTWorldStory.chapter('german','battle','outpost').title,
    englishBattle:VTWorldStory.chapter('english','battle','outpost').title,
    latinAdventure:VTWorldStory.get('latin','adventure').title,
    frenchBattleFinale:VTWorldStory.chapter('french','battle','final',{completed:true}).text
  }));
  assert(stories.germanBattle.includes('Holztor')&&!stories.germanBattle.includes('Nebelvorposten'),'German Wortreich never falls back to English battle story');
  assert(stories.englishBattle.includes('Nebelvorposten'),'English battle keeps Northstar story');
  assert(stories.latinAdventure.includes('Iter Romanum'),'Latin adventure exposes its own full story arc');
  assert(stories.frenchBattleFinale.includes('Lichtzeichen'),'French battle exposes its own finale');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer all-subject world choice UI smoke: passed');
}finally{
  await browser.close();
}
