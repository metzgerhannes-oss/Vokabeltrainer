import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);

const pageErrors=[];
page.on('pageerror',err=>pageErrors.push(String(err?.message||err)));
page.on('console',msg=>{if(msg.type()==='error')pageErrors.push(msg.text())});
const assert=(value,message)=>{if(!value)throw new Error('Focused learning smoke failed: '+message)};
async function waitForContinue(){
  try{return await page.waitForSelector('#continueStudyBtn',{timeout:3000})}
  catch(error){
    const debug=await page.evaluate(()=>({html:document.querySelector('#studyArea')?.innerHTML||'',index:session?.index,locked:session?.locked}));
    throw new Error('Focused learning continue missing. Browser errors: '+pageErrors.join(' | ')+' DOM: '+JSON.stringify(debug));
  }
}

async function seed(term,translation,mode='recall'){
  await page.evaluate(({term,translation,mode})=>{
    state=defaultState();
    const set={id:'focus_set',learnerId:'learner_demo',subject:'english',title:'Unit Fokus',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term,translation,source:'focus-smoke',verified:true,firstContactCopiedAt:'test',firstContactRecalledAt:'test',firstContactCompletedAt:'test'});
    rebuildWordIndexes();
    renderAll();
    startSession(mode,set.id,null,false);
  },{term,translation,mode});
  await page.waitForSelector('#answerField');
}

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app must load');
  await page.waitForFunction(()=>typeof startSession==='function'&&typeof attachVocabularyToSet==='function'&&typeof renderAll==='function');

  await seed('write','schreiben','recall');

  const initial=await page.evaluate(()=>({
    focus:document.body.classList.contains('learning-focus'),
    top:getComputedStyle(document.querySelector('.topbar')).display,
    nav:getComputedStyle(document.querySelector('.bottom-nav')).display,
    inputLabel:document.querySelector('#answerField')?.getAttribute('aria-label')||'',
    extras:document.querySelectorAll('#studyArea .skill-strip,#studyArea .confusion-box').length,
    progress:!!document.querySelector('#sessionProgress'),
    sessionLabel:document.querySelector('#sessionPill')?.textContent||'',
    prompt:document.querySelector('.study-prompt')?.textContent||''
  }));
  assert(initial.focus,'learning-focus body mode must be active');
  assert(initial.top==='none'&&initial.nav==='none','global chrome must be hidden during retrieval');
  assert(initial.inputLabel.length>0,'answer input must keep an accessible name');
  assert(initial.extras===0,'diagnostics must not distract before the answer');
  assert(!initial.progress,'dynamic progress bar must stay out of retrieval');
  assert(initial.sessionLabel==='Aufgabe 1','quiet task orientation must remain visible');
  assert(initial.prompt.includes('schreiben'),'retrieval prompt must remain visible');

  await page.fill('#answerField','wrong');
  await page.click('#answerBtn');
  await waitForContinue();

  const afterAnswer=await page.evaluate(()=>({
    index:session.index,
    feedback:document.querySelector('.feedback')?.textContent||'',
    active:document.activeElement?.id||'',
    answerDisabled:!!document.querySelector('#answerField')?.disabled,
    audioButtons:document.querySelectorAll('.feedback [data-speak]').length
  }));
  assert(afterAnswer.index===0,'feedback must not auto-advance');
  assert(/Noch nicht richtig/.test(afterAnswer.feedback),'corrective feedback must be immediate');
  assert(afterAnswer.answerDisabled,'answered input must be locked');
  assert(afterAnswer.audioButtons>=1,'corrective feedback must expose pronunciation on demand');
  await page.waitForTimeout(1000);
  assert((await page.evaluate(()=>session.index))===0,'feedback must remain until learner continues');
  assert((await page.evaluate(()=>document.activeElement?.id||''))==='continueStudyBtn','continue control should receive focus');

  await page.click('#continueStudyBtn');
  const afterContinue=await page.evaluate(()=>({index:session?.index??-1,queueLength:session?.queue?.length||0}));
  assert(afterContinue.index>0,'explicit continue must advance the learning session');
  assert(pageErrors.length===0,'focused recall must not produce browser errors: '+pageErrors.join(' | '));
  await page.click('#backHomeBtn');

  const afterExit=await page.evaluate(()=>({
    focus:document.body.classList.contains('learning-focus'),
    top:getComputedStyle(document.querySelector('.topbar')).display,
    nav:getComputedStyle(document.querySelector('.bottom-nav')).display
  }));
  assert(!afterExit.focus,'focus mode must end when leaving the session');
  assert(afterExit.top!=='none'&&afterExit.nav!=='none','normal navigation must return after learning');

  await seed("can't",'nicht können','spelling');
  await page.fill('#answerField','cant');
  await page.click('#answerBtn');
  await waitForContinue();
  const strictSpelling=await page.evaluate(()=>({
    feedback:document.querySelector('.feedback')?.textContent||'',
    correct:session.correct,
    failures:currentWord()?.failures||0
  }));
  assert(/Noch nicht richtig/.test(strictSpelling.feedback),'direct spelling must reject a missing apostrophe');
  assert(strictSpelling.correct===0&&strictSpelling.failures>=1,'strict spelling error must not count as success');
  await page.click('#backHomeBtn');

  await seed("can't",'nicht können','recall');
  const beforeSoft=await page.evaluate(()=>({
    spelling:currentWord().skills.spelling||0,
    errors:currentWord().errorProfile.spelling||0
  }));
  await page.fill('#answerField','cant');
  await page.click('#answerBtn');
  await waitForContinue();
  const softRecall=await page.evaluate(()=>({
    feedback:document.querySelector('.feedback')?.textContent||'',
    correct:session.correct,
    spelling:currentWord().skills.spelling||0,
    errors:currentWord().errorProfile.spelling||0,
    dueDate:currentWord().dueDate
  }));
  assert(/Richtig erinnert/.test(softRecall.feedback)&&/Schreibweise beachten/.test(softRecall.feedback),'semantic recall may pass while spelling feedback stays explicit');
  assert(softRecall.correct===1,'semantic recall remains a retrieval success');
  assert(softRecall.spelling<=beforeSoft.spelling,'orthographic error must not add spelling credit');
  assert(softRecall.errors===beforeSoft.errors+1,'orthographic error must enter the spelling error profile');
  assert(softRecall.dueDate===await page.evaluate(()=>datePlusDays(1)),'orthographic error must become due again tomorrow');
  await page.click('#continueStudyBtn');
  await page.waitForSelector('.session-review');
  const review=await page.locator('.session-review').textContent();
  assert(review?.includes('Alle Abfragen dieser Einheit'),'session finish must expose a detailed result overview');
  assert(review?.includes('nicht können')&&review?.includes('cant')&&review?.includes("can't"),'result overview shows question, learner answer and expected answer');
  assert(review?.includes('Richtig erinnert · Schreibweise'),'result overview distinguishes semantic recall from spelling accuracy');
  assert(await page.locator('#copySessionResultsBtn').count()===1,'result overview offers a copyable diagnostic');
  assert(await page.locator('.session-review [data-speak]').count()>=1,'result overview keeps pronunciation available for the foreign word');

  console.log('Vokabeltrainer focused learning WebKit smoke: passed');
  console.log('✓ retrieval hides navigation and diagnostics');
  console.log('✓ feedback is immediate, persistent and learner-paced');
  console.log('✓ task orientation stays stable without a moving progress bar');
  console.log('✓ spelling is strict while semantic recall remains separately credited');
  console.log('✓ orthographic errors are scheduled for early review');
}finally{
  await browser.close();
}
