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

  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['german'];
    learner().worldModeBySubject=normalizeWorldModeBySubject({german:'battle'});
    state.activeSubject='german';
    renderAll();
    showView('homeView');
  });

  const initial=await page.evaluate(()=>({
    mode:learnerWorldMode('german'),
    mastery:subjectProgress('german').pct,
    growth:campaignGrowthState('german').pct
  }));
  assert(initial.mode==='battle','German legacy profile starts in battle mode');

  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('#profileGermanWorld:not(.hidden)');
  assert(await page.locator('input[name="profileGermanWorldMode"][value="battle"]').isChecked(),'battle choice is selected');
  assert(await page.locator('input[name="profileGermanWorldMode"][value="adventure"]').count()===1,'adventure choice exists');
  await page.locator('input[name="profileGermanWorldMode"][value="adventure"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learnerWorldMode('german')==='adventure');

  const home=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    const frame=document.querySelector('#projectMenuAvatarFrame');
    const nav=document.querySelector('.nav-btn[data-view="armyView"]');
    return {mode:learnerWorldMode('german'),fox:frame?.classList.contains('german-fox-avatar'),nav:nav?.textContent?.trim()||'',mastery:subjectProgress('german').pct,growth:campaignGrowthState('german').pct};
  });
  assert(home.mode==='adventure','profile saves adventure mode');
  assert(home.fox,'adventure mode uses the fox avatar');
  assert(home.nav.includes('Abenteuer'),'child navigation names the adventure world');

  await page.evaluate(()=>window.VTArmyUi.open());
  await page.waitForSelector('#armyView.active');
  const adventure=await page.evaluate(()=>({
    mode:document.querySelector('#armyView')?.dataset.worldMode,
    className:document.querySelector('#armyView')?.className||'',
    title:document.querySelector('#armyViewTitle')?.textContent||'',
    route:document.querySelectorAll('.german-adventure-route span').length,
    battleHidden:document.querySelector('#armyBattleBtn')?.classList.contains('hidden')
  }));
  assert(adventure.mode==='adventure'&&adventure.className.includes('german-adventure-mode'),'adventure hub is active');
  assert(adventure.title.includes('Fuchspfad'),'adventure hub uses Fuchspfad title');
  assert(adventure.route===6,'adventure hub shows six visual stages');
  assert(adventure.battleHidden===true,'battle entry is hidden in adventure mode');

  await page.evaluate(()=>window.VTCampaignMap.open());
  await page.waitForSelector('#campaignMapView.active');
  const route=await page.evaluate(()=>({
    theme:document.querySelector('#campaignMapView')?.dataset.visualTheme||'',
    mode:document.querySelector('#campaignMapView')?.dataset.worldMode||'',
    title:document.querySelector('#campaignMapViewTitle')?.textContent||'',
    battleHidden:document.querySelector('#campaignMapBattleBtn')?.classList.contains('hidden')
  }));
  assert(route.theme==='german-adventure'&&route.mode==='adventure','map uses German adventure theme');
  assert(route.title==='Meine Wortreise','map becomes the word journey');
  assert(route.battleHidden===true,'word journey exposes no battle action');

  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('#profileGermanWorld:not(.hidden)');
  await page.locator('input[name="profileGermanWorldMode"][value="battle"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learnerWorldMode('german')==='battle');

  const after=await page.evaluate(()=>{
    renderAll();showView('homeView');window.VTMenuUi.render();
    return {
      mastery:subjectProgress('german').pct,
      growth:campaignGrowthState('german').pct,
      fox:document.querySelector('#projectMenuAvatarFrame')?.classList.contains('german-fox-avatar'),
      nav:document.querySelector('.nav-btn[data-view="armyView"]')?.textContent?.trim()||''
    };
  });
  assert(after.mastery===initial.mastery&&after.growth===initial.growth,'world switching preserves mastery and year growth');
  assert(after.fox===false,'battle mode leaves the fox adventure avatar');
  assert(after.nav.includes('Wortreich'),'battle mode restores Wortreich navigation');

  await page.evaluate(()=>window.VTArmyUi.open());
  await page.waitForSelector('#armyView.active');
  const battle=await page.evaluate(()=>({
    mode:document.querySelector('#armyView')?.dataset.worldMode,
    title:document.querySelector('#armyViewTitle')?.textContent||'',
    adventureClass:document.querySelector('#armyView')?.classList.contains('german-adventure-mode'),
    battleHidden:document.querySelector('#armyBattleBtn')?.classList.contains('hidden')
  }));
  assert(battle.mode==='battle'&&!battle.adventureClass,'battle hub is restored');
  assert(battle.title==='Das Wortreich','battle mode restores Das Wortreich');
  assert(battle.battleHidden===false,'battle entry is visible again');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer German world choice UI smoke: passed');
}finally{
  await browser.close();
}
