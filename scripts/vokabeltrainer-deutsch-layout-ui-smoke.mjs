import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Deutsch Wortreich layout UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&window.VTWordrealmUi&&window.VTReadAloud&&window.VTMenuAvatarArt?.atlasReady===true);
  await page.evaluate(()=>{
    state=defaultState();
    learner().name='Olli';
    learner().activeSubjects=['german'];
    state.activeSubject='german';
    rebuildWordIndexes();
    renderAll();
    showView('homeView');
    window.VTMenuUi?.render?.();
  });
  await page.waitForSelector('#homeView.active .project-menu-stage[data-subject="german"][data-visual-theme="wordrealm"]');
  await page.waitForSelector('#projectMenuScenery .wordrealm-approved-home-scene');

  const home=await page.evaluate(()=>({
    label:document.querySelector('#menuAvatarStageLabel')?.textContent||'',
    next:document.querySelector('#menuAvatarNextStage')?.textContent||'',
    stages:[...document.querySelectorAll('#wordrealmStageStrip .wordrealm-stage-tile span')].map(x=>x.textContent),
    foxes:document.querySelectorAll('#wordrealmStageStrip .wordrealm-fox-svg').length,
    hero:document.querySelectorAll('#projectMenuScenery .wordrealm-approved-home-scene').length,
    heroLoaded:document.querySelector('#projectMenuScenery .wordrealm-approved-home-scene')?.complete===true,
    heroSource:document.querySelector('#projectMenuAvatarFrame')?.dataset.avatarArtSource||'',
    quickActions:document.querySelectorAll('#wordrealmHomeActions .wordrealm-home-action').length,
    speakers:[...document.querySelectorAll('#homeView .read-aloud-btn')].filter(el=>getComputedStyle(el).display!=='none').length,
    pageReadVisible:getComputedStyle(document.querySelector('#germanPageReadBtn')).display!=='none',
    scrollWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth
  }));
  assert(home.label==='Olli · Stufe 1/6','profile name and current stage are visible');
  assert(home.next.includes('Grundausrüstung')&&home.next.includes('18%'),'current stage and next threshold are visible');
  assert(JSON.stringify(home.stages)===JSON.stringify(['Grundausrüstung','Lederzeug','Ritterlehrling','Ritter','Kronritter','König']),'all six approved stages render in order');
  assert(home.foxes===6,'stage strip keeps all six approved fox progression previews');
  assert(home.hero===1&&home.heroLoaded&&home.heroSource==='wordrealm-approved-scene','home uses the exact approved painterly Wortreich scene instead of the atlas tile or technical SVG hero');
  assert(home.quickActions===2,'approved Lernwörter and Wortreich quick actions are visible');
  assert(home.speakers>=5&&home.pageReadVisible,'first-grade home exposes visible read-aloud controls');
  assert(home.scrollWidth<=home.clientWidth+1,'approved German home has no horizontal iPhone overflow');

  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('input[name="profileAvatarStyle"][value="neutral"]');
  assert(await page.locator('input[name="profileAvatarStyle"][value="neutral"]').count()===1,'profile editor exposes Neutral / Divers');
  await page.locator('input[name="profileAvatarStyle"][value="neutral"]').check();
  await page.locator('#saveProfile').click();
  await page.waitForFunction(()=>learner()?.avatarStyle==='neutral');
  await page.evaluate(()=>{renderAll();showView('homeView');window.VTMenuUi?.render?.()});
  assert(await page.locator('#projectMenuAvatarFrame').getAttribute('data-avatar-style')==='neutral','home keeps the neutral avatar style');
  await page.evaluate(()=>openProfileEditor(learner().id));
  await page.waitForSelector('input[name="profileAvatarStyle"][value="neutral"]');
  assert(await page.locator('input[name="profileAvatarStyle"][value="neutral"]').isChecked(),'neutral avatar choice survives save and reopen');
  await page.locator('#modal button[value="cancel"]').click();
  await page.waitForFunction(()=>!document.querySelector('#modal')?.open);

  const targets=await page.locator('#homeView .read-aloud-btn:visible').evaluateAll(nodes=>nodes.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));
  assert(targets.every(x=>x.w>=43&&x.h>=43),'visible read-aloud controls keep touch-safe dimensions');

  await page.click('#wordrealmLearningWordsBtn');
  await page.waitForSelector('#practiceView.active');
  assert(await page.locator('#germanFoundationCard').isVisible(),'Lernwörter route reaches German learning area');

  await page.evaluate(()=>window.VTMenuUi.openHome());
  await page.waitForSelector('#homeView.active');
  await page.click('#wordrealmEnterBtn');
  await page.waitForSelector('#armyView.active');
  assert((await page.locator('#armyView').textContent())?.includes('Wortreich'),'Wortreich action reaches German game area');

  await page.evaluate(()=>{state.activeSubject='german';window.VTGermanFoundation.open('sentences')});
  await page.waitForSelector('#learnView.active .german-foundation-task');
  assert(await page.locator('#germanPageReadBtn').isHidden(),'global page read-aloud is hidden during assessed learning');
  const safeRead=await page.locator('#learnView .foundation-read').first().getAttribute('data-read-text');
  assert(safeRead&&safeRead.includes('Welches Bild passt zum ganzen Satz')&&!safeRead.includes('Oma malt'),'sentence task reads only the instruction, never the tested sentence');

  assert(errors.length===0,'layout produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Deutsch Wortreich layout UI smoke: passed');
}finally{
  await browser.close();
}
