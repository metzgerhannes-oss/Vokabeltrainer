import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
const assert=(condition,msg)=>{if(!condition)throw new Error('School letter UI smoke failed: '+msg)};
try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTGermanFoundation);
  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['german'];
    learner().gradeLevel='1';
    state.activeSubject='german';
    renderAll();showView('practiceView');
  });
  await page.waitForSelector('#germanFoundationCard:not(.hidden) #germanSchoolNext');
  assert((await page.locator('.german-letter-plan h3').textContent()).includes('schon gelernt'),'first-step question is visible');
  assert(await page.locator('.german-school-letter').count()===29,'all letters and umlauts are selectable');
  await page.locator('[data-school-letter="M"]').click();
  await page.locator('[data-school-letter="A"]').click();
  await page.locator('#germanSchoolNext').click();
  assert((await page.locator('.german-letter-plan h3').textContent()).includes('gerade gelernt'),'second-step question is visible');
  assert(await page.locator('[data-school-letter="M"]').isDisabled(),'learned letters cannot be selected as new twice');
  await page.locator('[data-school-letter="O"]').click();
  await page.locator('#germanSchoolNext').click();
  await page.waitForSelector('#germanSchoolEdit');
  const saved=await page.evaluate(()=>({
    plan:window.VTGermanFoundation.letterPlan(),
    queue:window.VTGermanFoundation.stageTasks('handwriting').map(x=>x.id),
    words:window.VTGermanFoundation.stageTasks('words').map(x=>x.word),
    sentences:window.VTGermanFoundation.stageTasks('sentences').length
  }));
  assert(saved.plan.configured===true,'school letter level is saved');
  assert(saved.plan.learned.join(',')==='A,M'&&saved.plan.current.join(',')==='O','learned and current letters are saved separately');
  assert(saved.queue.join(',')==='O,A,M','current letters are exercised before revision');
  assert(saved.words.join(',')==='Oma'&&saved.sentences===0,'only readable first words and sentences are available');
  assert(await page.locator('[data-german-stage="sentences"]').isDisabled(),'not-yet-readable sentence station stays locked');
  const before=await page.evaluate(()=>({xp:learner().xp,tickets:JSON.stringify(learner().battleTickets),progress:JSON.stringify(learner().germanFoundation.letters)}));
  await page.locator('#germanSchoolEdit').click();
  await page.locator('#germanSchoolNext').click();
  await page.locator('[data-school-letter="L"]').click();
  await page.locator('[data-school-letter="T"]').click();
  await page.locator('#germanSchoolNext').click();
  assert(await page.locator('[data-german-stage="sentences"]').isEnabled(),'known characters unlock appropriate first sentences');
  const after=await page.evaluate(()=>({xp:learner().xp,tickets:JSON.stringify(learner().battleTickets),progress:JSON.stringify(learner().germanFoundation.letters)}));
  assert(JSON.stringify(before)===JSON.stringify(after),'changing school level never grants mastery, XP or battle rewards');
  await page.evaluate(()=>{
    const first=learner(),second={...structuredClone(first),id:'second-child',name:'Zweites Kind',germanFoundation:defaultGermanFoundation()};
    state.learners.push(second);state.activeLearnerId=second.id;renderAll();showView('practiceView');
  });
  assert(await page.locator('#germanSchoolNext').count()===1,'second profile is asked independently');
  await page.evaluate(()=>{state.activeLearnerId='learner_demo';renderAll();showView('practiceView')});
  assert(await page.locator('#germanSchoolEdit').count()===1,'first profile keeps its own letter level');
  assert(errors.length===0,'no JavaScript errors');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),'no iPhone horizontal overflow');
  console.log('Vokabeltrainer German school letters UI smoke: passed');
}finally{await browser.close()}
