import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('German world choice UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTMenuUi&&!!window.VTArmyUi&&!!window.VTCampaignMap);

  await page.evaluate(()=>{state=defaultState();renderAll();showView('homeView');openProfileEditor()});
  await page.waitForSelector('#modal[open] #saveProfile');
  await page.locator('#profileName').fill('Weltwahl Kind');
  await page.locator('[data-profile-subject="german"]').check();
  await page.locator('input[name="profileAvatarStyle"][value="neutral"]').check();
  await page.locator('input[name="profileWorldMode-english"][value="battle"]').check();
  assert(await page.locator('[data-profile-world-subject="german"] .read-aloud-btn').count()>=1,'German world choice is readable in the profile dialog');
  assert(await page.locator('.profile-choice-legend .read-aloud-btn').count()>=2,'avatar and world choices both expose read-aloud controls');
  await page.locator('#saveProfile').click();
  assert((await page.locator('#profileError').textContent())?.includes('Abenteuer oder Kampf'),'new German profile cannot silently accept a default world');
  await page.locator('input[name="profileWorldMode-german"][value="adventure"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learner()?.name==='Weltwahl Kind');
  const created=await page.evaluate(()=>({avatar:learner().avatarStyle,mode:learnerWorldMode('german'),subjects:[...learner().activeSubjects]}));
  assert(created.avatar==='neutral'&&created.mode==='adventure'&&created.subjects.includes('german'),'new profile persists neutral avatar and explicit adventure choice');

  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['german'];
    learner().worldModeBySubject=normalizeWorldModeBySubject({german:'battle'});
    learner().gradeLevel='1';
    state.activeSubject='german';
    const set={id:'world_choice_set',learnerId:learner().id,subject:'german',title:'Lernwörter',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(5),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'dictation',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'Haus',translation:'Gebäude',source:'world-choice-smoke',verified:true,firstContactCopiedAt:'x',firstContactRecalledAt:'x',firstContactCompletedAt:'x'});
    set.pairVerifiedSignature=pairReviewSignatureForSet(set.id);
    rebuildWordIndexes();
    currentTestFortress('german');
    unlockBattleToday('dailyGoal','german');
    renderAll();
    showView('homeView');
  });

  const initial=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    const frame=document.querySelector('#projectMenuAvatarFrame'),fallback=document.querySelector('#projectMenuAvatarFallback');
    return {
      mode:learnerWorldMode('german'),
      mastery:subjectProgress('german').pct,
      growth:campaignGrowthState('german').pct,
      renderKey:frame?.dataset.avatarRenderKey||'',
      battleFox:fallback?.querySelector('.wordrealm-fox-svg:not(.adventure)')?.getAttribute('aria-label')||'',
      adventureFox:!!fallback?.querySelector('.wordrealm-fox-svg.adventure')
    };
  });
  assert(initial.mode==='battle','German legacy profile starts in battle mode');
  assert(initial.renderKey.includes('german-battle-')&&initial.battleFox&&!initial.adventureFox,'battle mode renders a fresh Wortreich fox surface');

  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('[data-profile-world-subject="german"]:not(.hidden)');
  assert(await page.locator('input[name="profileWorldMode-german"][value="battle"]').isChecked(),'battle choice is selected');
  assert(await page.locator('input[name="profileWorldMode-german"][value="adventure"]').count()===1,'adventure choice exists');
  await page.locator('input[name="profileWorldMode-german"][value="adventure"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learnerWorldMode('german')==='adventure');

  const home=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    const frame=document.querySelector('#projectMenuAvatarFrame');
    const nav=document.querySelector('.nav-btn[data-view="armyView"]');
    const fallback=document.querySelector('#projectMenuAvatarFallback');
    return {
      mode:learnerWorldMode('german'),
      fox:frame?.classList.contains('german-fox-avatar'),
      nav:nav?.textContent?.trim()||'',
      mastery:subjectProgress('german').pct,
      growth:campaignGrowthState('german').pct,
      renderKey:frame?.dataset.avatarRenderKey||'',
      adventureFox:fallback?.querySelector('.wordrealm-fox-svg.adventure')?.getAttribute('aria-label')||'',
      battleFox:!!fallback?.querySelector('.wordrealm-fox-svg:not(.adventure)'),
      premium:!!fallback?.classList.contains('adventure-svg-avatar')
    };
  });
  assert(home.mode==='adventure','profile saves adventure mode');
  assert(home.fox,'adventure mode uses the fox avatar');
  assert(home.renderKey.includes('german-adventure-')&&home.renderKey!==initial.renderKey,'world switch creates a distinct adventure avatar render key');
  assert(home.adventureFox&&!home.battleFox&&home.premium,'adventure switch replaces the Wortreich surface with the premium explorer fox');
  assert(home.nav.includes('Abenteuer'),'child navigation names the adventure world');
  assert(home.mastery===initial.mastery&&home.growth===initial.growth,'switching to adventure preserves academic and yearly progress');

  await page.evaluate(()=>window.VTArmyUi.open());
  await page.waitForSelector('#armyView.active');
  const adventure=await page.evaluate(()=>({
    mode:document.querySelector('#armyView')?.dataset.worldMode,
    className:document.querySelector('#armyView')?.className||'',
    title:document.querySelector('#armyViewTitle')?.textContent||'',
    route:document.querySelectorAll('.subject-adventure-route span').length,
    actionHidden:document.querySelector('#armyBattleBtn')?.classList.contains('hidden'),
    actionText:document.querySelector('#armyBattleBtn')?.textContent||'',
    vectorFox:document.querySelectorAll('.subject-adventure-figure .wordrealm-fox-svg.adventure').length
  }));
  assert(adventure.mode==='adventure'&&adventure.className.includes('adventure-mode'),'adventure hub is active');
  assert(adventure.title==='Fuchspfad & Wortreise','adventure hub uses the approved Fuchspfad title');
  assert(adventure.route===6,'adventure hub shows six visual stages');
  assert(adventure.vectorFox===1,'adventure hub renders the dedicated vector fox instead of an emoji placeholder');
  assert(adventure.actionHidden===false&&adventure.actionText.includes('Abenteuer fortsetzen'),'adventure exposes an equivalent non-combat daily action');

  await page.click('#armyBattleBtn');
  await page.waitForSelector('#campaignMapView.active');
  const route=await page.evaluate(()=>({
    theme:document.querySelector('#campaignMapView')?.dataset.visualTheme||'',
    mode:document.querySelector('#campaignMapView')?.dataset.worldMode||'',
    title:document.querySelector('#campaignMapViewTitle')?.textContent||'',
    battleHidden:document.querySelector('#campaignMapBattleBtn')?.classList.contains('hidden'),
    battleViewActive:document.querySelector('#battleView')?.classList.contains('active'),
    actionUsed:battleDayState('german',false)?.actionUsed===true,
    mastery:subjectProgress('german').pct,
    growth:campaignGrowthState('german').pct
  }));
  assert(route.theme==='german-adventure'&&route.mode==='adventure','map uses German adventure theme');
  assert(route.title==='Meine Wortreise','map becomes the word journey');
  assert(route.battleHidden===true&&!route.battleViewActive,'adventure action never opens the battle screen');
  assert(route.actionUsed===true,'adventure action consumes the same daily action entitlement');

  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('[data-profile-world-subject="german"]:not(.hidden)');
  await page.locator('input[name="profileWorldMode-german"][value="battle"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learnerWorldMode('german')==='battle');

  const after=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    return {
      mastery:subjectProgress('german').pct,
      growth:campaignGrowthState('german').pct,
      fox:document.querySelector('#projectMenuAvatarFrame')?.classList.contains('german-fox-avatar'),
      knight:document.querySelector('#projectMenuAvatarFrame')?.classList.contains('german-knight-avatar'),
      nav:document.querySelector('.nav-btn[data-view="armyView"]')?.textContent?.trim()||'',
      renderKey:document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarRenderKey||'',
      battleFox:document.querySelector('#projectMenuAvatarFallback .wordrealm-fox-svg:not(.adventure)')?.getAttribute('aria-label')||'',
      adventureFox:!!document.querySelector('#projectMenuAvatarFallback .wordrealm-fox-svg.adventure')
    };
  });
  assert(after.mastery===route.mastery&&after.growth===route.growth,'switching back preserves the post-action academic and yearly state');
  assert(after.fox===false&&after.knight===true,'battle mode uses the Wordrealm avatar treatment');
  assert(after.renderKey.includes('german-battle-')&&after.renderKey!==home.renderKey,'switching back rebuilds the battle avatar under a battle render key');
  assert(after.battleFox&&!after.adventureFox,'switching back removes the explorer fox and restores the Wortreich fox');
  assert(after.nav.includes('Wortreich'),'battle mode restores Wortreich navigation');

  await page.evaluate(()=>window.VTArmyUi.open());
  await page.waitForSelector('#armyView.active');
  const battle=await page.evaluate(()=>({
    mode:document.querySelector('#armyView')?.dataset.worldMode,
    title:document.querySelector('#armyViewTitle')?.textContent||'',
    adventureClass:document.querySelector('#armyView')?.classList.contains('adventure-mode'),
    actionHidden:document.querySelector('#armyBattleBtn')?.classList.contains('hidden')
  }));
  assert(battle.mode==='battle'&&!battle.adventureClass,'battle hub is restored');
  assert(battle.title==='Das Wortreich','battle mode restores Das Wortreich');
  assert(battle.actionHidden===false,'battle entry is visible again');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer German world choice UI smoke: passed');
}finally{
  await browser.close();
}
