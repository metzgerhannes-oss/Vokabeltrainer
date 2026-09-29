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
  assert(await page.locator('.foundation-lineature-legend').count()===0,'guided handwriting has no extra l/m/g legend cards');
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
  const sentencePictureIndex=await page.evaluate(()=>window.VTGermanFoundation.stageTasks('sentences')[0].options.indexOf('👵🎨'));
  assert(sentencePictureIndex>=0,'correct sentence picture exists in the varied option order');
  await page.click('[data-sentence-picture="'+sentencePictureIndex+'"]');
  await page.waitForTimeout(550);
  assert(await page.locator('[data-sentence-token]').count()===3,'sentence-building task follows sentence comprehension');

  const after=await page.evaluate(()=>({xp:learner().xp,tickets:JSON.stringify(learner().battleTickets),words:state.learnerVocabulary.length,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  assert(before.xp===after.xp&&before.tickets===after.tickets&&before.words===after.words,'Paket C evidence does not mutate XP, battle tickets, or learning-word mastery');
  assert(after.scrollWidth<=after.clientWidth+1,'Paket C stays overflow-free on iPhone viewport');

  await page.evaluate(()=>{showView('practiceView');renderAll()});
  await page.waitForSelector('#germanFoundationCard:not(.hidden)');
  assert(await page.locator('[data-german-stage]').count()===5,'learning hub exposes all five Klasse-1 stations');

  const freeBefore=await page.evaluate(()=>({foundation:JSON.stringify(window.VTGermanFoundation.progress()),xp:learner().xp,tickets:JSON.stringify(learner().battleTickets),readiness:JSON.stringify(learner().readiness||{}),completed:JSON.stringify(learner().completedKeys||[])}));
  await page.click('#germanFreeWritingBtn');
  await page.waitForSelector('.free-writing-selector');
  await page.click('#freeWritingReset');
  await page.click('[data-free-form="m"]');
  assert((await page.locator('#freeWritingSelectionSummary').textContent())==='m','single lowercase letter can be selected');
  await page.click('[data-free-form="M"]');
  assert((await page.locator('[data-free-form][aria-pressed="true"]').count())===2,'uppercase and lowercase can be selected together');
  await page.click('[data-free-form="M"]');
  for(const form of ['a','e','s'])await page.click('[data-free-form="'+form+'"]');
  assert((await page.locator('#freeWritingSelectionSummary').textContent())==='a, e, m, s','multiple chosen lowercase letters form the free-practice set');
  await page.click('#freeWritingStart');
  await page.waitForSelector('#foundationFreeCanvas');
  const chosen=await page.evaluate(()=>window.VTGermanFoundation.freeWritingState());
  assert(JSON.stringify(chosen.forms)===JSON.stringify(['a','e','m','s']),'free-writing tasks contain only the manual selection');
  assert(await page.locator('.foundation-lineature-legend').count()===0,'no misleading l/m/g explanation cards appear below the selected letter');
  const freeCanvasLabel=await page.locator('#foundationFreeCanvas').getAttribute('aria-label');
  assert(freeCanvasLabel.includes('Dachgeschoss')&&freeCanvasLabel.includes('Erdgeschoss')&&freeCanvasLabel.includes('Keller'),'writing canvas keeps the three school-lineature zones');
  const phonemePath=await page.evaluate(()=>window.VTGermanFoundation.phonemeAudioPath('M'));
  assert(phonemePath==='assets/audio/phonemes/de/m.m4a','German letter sound resolves to local phoneme audio instead of TTS');
  const freeBox=await page.locator('#foundationFreeCanvas').boundingBox();
  assert(!!freeBox,'free-writing canvas is visible on iPhone viewport');
  await page.mouse.move(freeBox.x+60,freeBox.y+70);await page.mouse.down();await page.mouse.move(freeBox.x+180,freeBox.y+210,{steps:8});await page.mouse.up();
  assert(await page.locator('#foundationFreeNext').isEnabled(),'finger/stylus stroke enables the next selected letter');
  await page.click('#foundationFreeNext');
  const nextChosen=await page.evaluate(()=>window.VTGermanFoundation.freeWritingState());
  assert(['a','e','m','s'].includes(nextChosen.forms[nextChosen.index%nextChosen.forms.length]),'next free-writing task stays inside selection');
  await page.click('#foundationFreeSelection');
  assert((await page.locator('#freeWritingSelectionSummary').textContent())==='a, e, m, s','manual selection stays until changed or reset');
  const freeAfter=await page.evaluate(()=>({foundation:JSON.stringify(window.VTGermanFoundation.progress()),xp:learner().xp,tickets:JSON.stringify(learner().battleTickets),readiness:JSON.stringify(learner().readiness||{}),completed:JSON.stringify(learner().completedKeys||[]),scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  assert(freeBefore.foundation===freeAfter.foundation&&freeBefore.xp===freeAfter.xp&&freeBefore.tickets===freeAfter.tickets&&freeBefore.readiness===freeAfter.readiness&&freeBefore.completed===freeAfter.completed,'free writing creates no mastery, readiness, daily-goal, XP, ticket, or foundation evidence');
  assert(freeAfter.scrollWidth<=freeAfter.clientWidth+1,'B-018 stays overflow-free on iPhone viewport');
  assert(errors.length===0,'Paket C UI produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Deutsch Paket C UI smoke: passed');
}finally{
  await browser.close();
}
