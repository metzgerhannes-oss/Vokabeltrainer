import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('German foundation UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&typeof SUBJECT_META==='object'&&!!window.VTGermanLearning);

  await page.evaluate(()=>{
    state=defaultState();
    state.learners[0].activeSubjects=['english','german'];
    state.activeSubject='german';
    ensureActiveSubject();
    renderAll();
  });

  assert((await page.locator('#menuSubjectLabel').textContent())==='Deutsch','German subject is visible');
  assert((await page.locator('#todaySummary').textContent())==='Deutsch · Klasse 1','Today routes to German grade-one foundation');
  assert(await page.locator('#germanFoundationCard').evaluate(el=>!el.classList.contains('hidden')),'German foundation card is enabled for the active subject');
  await page.evaluate(()=>showView('practiceView'));
  assert(await page.locator('#germanFoundationCard').isVisible(),'German foundation card is visible in Lernen');
  await page.evaluate(()=>showView('homeView'));
  assert((await page.locator('#quickLearnHeroBtn').textContent())?.includes('Deutsch'),'German CTA is primary');

  await page.click('#quickLearnHeroBtn');
  await page.waitForSelector('.german-foundation-card');

  for(const answer of ['M','M','Mama']){
    await page.click('[data-german-answer="'+answer+'"]');
    await page.click('#germanContinueBtn');
  }
  await page.fill('#germanAnswerField','Maus');
  await page.click('#germanAnswerBtn');
  await page.click('#germanContinueBtn');
  await page.click('[data-german-answer="malt"]');
  await page.click('#germanContinueBtn');

  await page.waitForFunction(()=>document.querySelector('#sessionPill')?.textContent==='Fertig');
  const learned=await page.evaluate(()=>({
    progress:learner().germanLiteracy,
    vocab:state.learnerVocabulary.length,
    xp:learner().xp,
    tickets:learner().battleTickets.german,
    activeSubject:state.activeSubject
  }));
  assert(learned.activeSubject==='german','German remains active');
  assert(learned.progress.sessions===1,'foundation session is stored');
  assert(learned.progress.practiceDays.length===1,'practice day is stored');
  assert(Object.values(learned.progress.skills).every(x=>x.attempts>=1&&x.correct>=1),'all five German competence dimensions receive evidence');
  assert(learned.vocab===0,'foundation evidence does not create vocabulary mastery rows');
  assert(learned.xp===0,'foundation package does not invent XP');
  assert((learned.tickets||0)===0,'foundation package does not unlock battle tickets before Wortreich');

  await page.click('#germanDoneBtn');
  assert((await page.locator('#todayProgressText').textContent())?.includes('Heute geübt'),'Today reflects German practice');
  await page.click('#menuArmyBtn');
  await page.waitForSelector('dialog[open]');
  assert((await page.locator('dialog[open]').textContent())?.includes('Wortreich wird aufgebaut'),'German never falls through to English army');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer German foundation UI smoke: passed');
  console.log('✓ German is selectable and routes to a dedicated grade-one path');
  console.log('✓ five native-literacy competencies persist without vocabulary mastery');
  console.log('✓ German battle remains explicitly gated instead of using English assets');
}finally{
  await browser.close();
}
