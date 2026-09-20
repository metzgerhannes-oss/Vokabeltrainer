import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);

const assert=(value,message)=>{if(!value)throw new Error('Focused learning smoke failed: '+message)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app must load');
  await page.waitForFunction(()=>typeof startSession==='function'&&typeof attachVocabularyToSet==='function'&&typeof renderAll==='function');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'focus_set',learnerId:'learner_demo',subject:'english',title:'Unit Fokus',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'write',translation:'schreiben',source:'focus-smoke',verified:true});
    rebuildWordIndexes();
    renderAll();
    startSession('recall',set.id,null,false);
  });

  await page.waitForSelector('#answerField');
  const initial=await page.evaluate(()=>({
    focus:document.body.classList.contains('learning-focus'),
    top:getComputedStyle(document.querySelector('.topbar')).display,
    nav:getComputedStyle(document.querySelector('.bottom-nav')).display,
    inputLabel:document.querySelector('#answerField')?.getAttribute('aria-label')||'',
    extras:document.querySelectorAll('#studyArea .skill-strip,#studyArea .confusion-box').length,
    progress:!!document.querySelector('#sessionProgress'),
    prompt:document.querySelector('.study-prompt')?.textContent||''
  }));
  assert(initial.focus,'learning-focus body mode must be active');
  assert(initial.top==='none'&&initial.nav==='none','global chrome must be hidden during retrieval');
  assert(initial.inputLabel.length>0,'answer input must keep an accessible name');
  assert(initial.extras===0,'diagnostics must not distract before the answer');
  assert(initial.progress,'quiet session progress must be present');
  assert(initial.prompt.includes('schreiben'),'retrieval prompt must remain visible');

  await page.fill('#answerField','wrong');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');

  const afterAnswer=await page.evaluate(()=>({
    index:session.index,
    feedback:document.querySelector('.feedback')?.textContent||'',
    active:document.activeElement?.id||'',
    answerDisabled:!!document.querySelector('#answerField')?.disabled
  }));
  assert(afterAnswer.index===0,'feedback must not auto-advance');
  assert(/Noch nicht richtig/.test(afterAnswer.feedback),'corrective feedback must be immediate');
  assert(afterAnswer.answerDisabled,'answered input must be locked');
  await page.waitForTimeout(1000);
  assert((await page.evaluate(()=>session.index))===0,'feedback must remain until learner continues');
  assert((await page.evaluate(()=>document.activeElement?.id||''))==='continueStudyBtn','continue control should receive focus');

  await page.click('#continueStudyBtn');
  await page.waitForFunction(()=>session.index===1);
  await page.click('#backHomeBtn');
  const afterExit=await page.evaluate(()=>({
    focus:document.body.classList.contains('learning-focus'),
    top:getComputedStyle(document.querySelector('.topbar')).display,
    nav:getComputedStyle(document.querySelector('.bottom-nav')).display
  }));
  assert(!afterExit.focus,'focus mode must end when leaving the session');
  assert(afterExit.top!=='none'&&afterExit.nav!=='none','normal navigation must return after learning');

  console.log('Vokabeltrainer focused learning WebKit smoke: passed');
  console.log('✓ retrieval hides navigation and diagnostics');
  console.log('✓ corrective feedback is immediate and learner-paced');
  console.log('✓ iPhone focus mode exits cleanly');
}finally{
  await browser.close();
}
