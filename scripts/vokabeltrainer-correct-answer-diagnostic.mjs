import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
const assert=(v,m)=>{if(!v)throw new Error('Correct-answer diagnostic failed: '+m)};

async function seed(){
  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'diag_set',learnerId:'learner_demo',subject:'english',title:'Diag Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'look',translation:'schauen',source:'diag',verified:true});
    attachVocabularyToSet(set.id,{term:'write',translation:'schreiben',source:'diag',verified:true});
    const word=setWords(set.id)[0];
    word.translation='ansehen';
    rebuildWordIndexes();
    renderAll();
  });
}
async function runText(mode,answer){
  await page.evaluate(mode=>startSession(mode,'diag_set',null,false),mode);
  await page.waitForSelector('#answerField');
  await page.fill('#answerField',answer);
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  const result=await page.evaluate(()=>({
    feedback:document.querySelector('.feedback')?.textContent||'',
    result:session?.results?.at(-1)||null,
    targets:termTargets(currentWord()),
    translations:translationTargets(currentWord())
  }));
  assert(/Richtig/.test(result.feedback),'mode '+mode+' must show correct feedback for exact stored answer');
  assert(result.result?.correct===true,'mode '+mode+' must log correct=true');
  await page.click('#backHomeBtn');
  return result;
}

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof startSession==='function'&&typeof attachVocabularyToSet==='function');
  await seed();

  let r=await runText('recall','look');
  assert(r.targets.includes('look'),'recall target contains canonical foreign term');

  r=await runText('spelling','look');
  assert(r.targets.includes('look'),'spelling target contains canonical foreign term');

  await page.evaluate(()=>{
    const w=setWords('diag_set')[0];
    session={mode:'reverseRecall',setId:'diag_set',queue:[w.setLinkId],index:0,correct:0,answered:0,currentSubmode:null,locked:false,retryCounts:{},followupCounts:{},hintUsed:false,isDaily:false,scaffoldedWords:{},activeAttemptedWords:{},grammarIntroShown:false,results:[]};
    showView('learnView');renderStudy();
  });
  await page.waitForSelector('#answerField');
  await page.fill('#answerField','schauen');
  await page.click('#answerBtn');
  await page.waitForSelector('#continueStudyBtn');
  let rev=await page.evaluate(()=>({feedback:document.querySelector('.feedback')?.textContent||'',last:session.results.at(-1),targets:translationTargets(currentWord())}));
  assert(/Richtig/.test(rev.feedback)&&rev.last?.correct===true,'canonical German meaning must be accepted beside local wording');
  assert(rev.targets.includes('schauen')&&rev.targets.includes('ansehen'),'reverse targets contain canonical and local wording');
  await page.click('#backHomeBtn');

  await page.evaluate(()=>{
    startSession('recognition','diag_set',null,false);
  });
  await page.waitForSelector('[data-answer]');
  const correctTranslation=await page.evaluate(()=>translationTargets(currentWord())[0]);
  await page.locator('[data-answer]').filter({hasText:correctTranslation}).first().click();
  await page.waitForSelector('#continueStudyBtn');
  const choice=await page.evaluate(()=>({feedback:document.querySelector('.feedback')?.textContent||'',last:session.results.at(-1)}));
  assert(/Richtig/.test(choice.feedback)&&choice.last?.correct===true,'recognition exact stored choice is correct');

  await page.click('#backHomeBtn');
  await page.evaluate(()=>startSession('recognition','diag_set',null,false));
  await page.waitForSelector('[data-answer]');
  const wrongAnswer=await page.evaluate(()=>[...document.querySelectorAll('[data-answer]')].map(b=>b.dataset.answer).find(a=>!gradeQuizQuestion(session.currentQuestion,a).correct)||'');
  assert(!!wrongAnswer,'recognition exposes a distractor for wrong-answer diagnostic');
  await page.locator('[data-answer]').filter({hasText:wrongAnswer}).first().click();
  await page.waitForSelector('#continueStudyBtn');
  const wrongChoice=await page.evaluate(()=>({
    feedback:document.querySelector('.feedback')?.textContent||'',
    last:session.results.at(-1),
    correctMarked:[...document.querySelectorAll('[data-answer].correct')].some(b=>gradeQuizQuestion(session.currentQuestion,b.dataset.answer).correct)
  }));
  assert(wrongChoice.last?.correct===false,'wrong recognition answer is logged as false');
  assert(/Noch nicht richtig/.test(wrongChoice.feedback),'wrong recognition answer shows corrective feedback');
  assert(wrongChoice.correctMarked===true,'wrong recognition answer marks a valid solution without throwing');

  assert(errors.length===0,'no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer correct-answer diagnostic: passed');
  console.log('✓ exact stored answers are correct in recall/spelling/reverse recall/recognition');
  console.log('✓ canonical and local textbook wording are both accepted');
}finally{
  await browser.close();
}
