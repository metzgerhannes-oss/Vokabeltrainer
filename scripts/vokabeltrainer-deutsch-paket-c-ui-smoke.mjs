import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Deutsch Paket C UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTGermanFoundation);

  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['german'];
    learner().gradeLevel='1';
    state.activeSubject='german';
    renderAll();
    showView('homeView');
  });

  assert(await page.locator('#quickLearnHeroBtn').isEnabled(),'German Klasse-1 path starts without a learning-word list');
  assert((await page.locator('#quickLearnHeroBtn').textContent())?.includes('Buchstaben'),'Today CTA points to foundations');
  const before=await page.evaluate(()=>({xp:learner().xp,tickets:JSON.stringify(learner().battleTickets),words:state.learnerVocabulary.length}));

  await page.click('#quickLearnHeroBtn');
  await page.waitForSelector('#learnView.active .german-foundation-task');
  assert((await page.locator('#modePill').textContent())?.includes('Buchstaben schreiben'),'foundation session starts with handwriting as the first lesson');
  await page.waitForSelector('#foundationTraceCanvas');
  let box=await page.locator('#foundationTraceCanvas').boundingBox();
  assert(!!box,'tracing canvas is visible');
  assert(await page.locator('.foundation-letter-pair').count()===1,'guided phase visibly shows Groß- und Kleinbuchstaben');
  await page.mouse.move(box.x+70,box.y+90);
  await page.mouse.down();
  await page.mouse.move(box.x+250,box.y+220,{steps:8});
  await page.mouse.up();
  assert(await page.locator('#foundationDrawDone').isEnabled(),'finger/stylus stroke enables tracing completion');
  await page.click('#foundationDrawDone');
  await page.waitForSelector('.german-foundation-task h3');
  assert((await page.locator('.german-foundation-task h3').textContent())?.includes('Gedächtnis'),'after tracing the lesson switches to free writing');
  assert(await page.locator('.foundation-letter-pair').count()===0,'free-writing phase hides the letter model');
  assert((await page.locator('#germanFoundationFeedback').textContent())?.includes('Nur der Laut'),'free-writing phase uses an audio-only cue');
  box=await page.locator('#foundationTraceCanvas').boundingBox();
  assert(!!box,'free-writing canvas stays available');
  await page.mouse.move(box.x+75,box.y+95);
  await page.mouse.down();
  await page.mouse.move(box.x+255,box.y+225,{steps:8});
  await page.mouse.up();
  assert(await page.locator('#foundationDrawDone').isEnabled(),'free-writing stroke enables completion');
  await page.click('#foundationDrawDone');
  await page.waitForTimeout(750);
  const handwritingEvidence=await page.evaluate(()=>window.VTGermanFoundation.progress().letters.M||{});
  assert((handwritingEvidence.traced||0)>0&&(handwritingEvidence.freeProduction||0)>0,'tracing and free production are stored as separate evidence');

  await page.evaluate(()=>window.VTGermanFoundation.open('letters'));
  await page.waitForSelector('#learnView .study-prompt strong');
  const target=await page.locator('#learnView .study-prompt strong').textContent();
  await page.click('[data-foundation-answer="'+target+'"]');
  await page.waitForTimeout(550);
  const letterEvidence=await page.evaluate(()=>window.VTGermanFoundation.progress().letters);
  assert(Object.values(letterEvidence).some(x=>(x.recognized||0)>0),'correct letter choice records recognition evidence');

  await page.evaluate(()=>window.VTGermanFoundation.open('sentences'));
  await page.waitForSelector('.german-sentence-prompt');
  await page.click('[data-sentence-picture="0"]');
  await page.waitForTimeout(550);
  assert(await page.locator('[data-sentence-token]').count()===3,'sentence-building task follows sentence comprehension');

  const after=await page.evaluate(()=>({xp:learner().xp,tickets:JSON.stringify(learner().battleTickets),words:state.learnerVocabulary.length,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  assert(before.xp===after.xp&&before.tickets===after.tickets&&before.words===after.words,'Paket C evidence does not mutate XP, battle tickets, or learning-word mastery');
  assert(after.scrollWidth<=after.clientWidth+1,'Paket C stays overflow-free on iPhone viewport');

  await page.evaluate(()=>{showView('practiceView');renderAll()});
  await page.waitForSelector('#germanFoundationCard:not(.hidden)');
  assert(await page.locator('[data-german-stage]').count()===5,'learning hub exposes all five Klasse-1 stations');
  assert(errors.length===0,'Paket C UI produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Deutsch Paket C UI smoke: passed');
}finally{
  await browser.close();
}
