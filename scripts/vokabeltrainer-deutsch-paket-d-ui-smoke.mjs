import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Deutsch Paket D UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true);
  await page.evaluate(()=>{
    state=defaultState();learner().activeSubjects=['german'];state.activeSubject='german';
    const set={id:'de_d_set',learnerId:'learner_demo',subject:'german',title:'Lernwörter Rechtschreibung',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'dictation',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'Sonne',translation:'Himmelskörper',example:'Die Sonne scheint.',syllables:['Son','ne'],wordStem:'Sonn',wordFamily:['Sonne','sonnig'],orthographyHint:'Doppel-n nach kurzem Vokal',source:'deutsch-paket-d-smoke',verified:true,firstContactCopiedAt:'x',firstContactRecalledAt:'x',firstContactCompletedAt:'x'});
    set.pairVerifiedSignature=pairReviewSignatureForSet(set.id);rebuildWordIndexes();renderAll();
    const w=setWords(set.id)[0];
    session={mode:'spelling',setId:set.id,queue:[quizQueueRef(w)],index:0,correct:0,answered:0,currentSubmode:'spelling',locked:false,retryCounts:{},followupCounts:{},hintUsed:false,isDaily:false,scaffoldedWords:{},activeAttemptedWords:{},results:[],currentQuestion:null,currentQuestionIssues:[]};
    showView('learnView');renderStudy();
  });
  await page.waitForSelector('#learnView.active #answerField');
  await page.fill('#answerField','sonne');
  await page.click('#answerBtn');
  await page.waitForSelector('#answerReviewBtn');
  const afterWrong=await page.evaluate(()=>setWords('de_d_set')[0].literacyErrors);
  assert(afterWrong.capitalization===1,'capitalization error is stored separately');
  assert((await page.locator('.feedback').textContent())?.includes('Rechtschreibfokus'),'correction exposes spelling focus after the answer');
  await page.click('#answerReviewBtn');
  const afterReview=await page.evaluate(()=>({errors:setWords('de_d_set')[0].literacyErrors,pending:(state.answerReviews||[]).filter(x=>x.status==='pending').length}));
  assert((afterReview.errors.capitalization||0)===0&&afterReview.pending===1,'parent-review request rolls spelling error profile back to neutral');
  await page.evaluate(()=>{
    const w=setWords('de_d_set')[0];w.errorProfile.spelling=1;w.literacyErrors.wordStructure=1;w.modesSeen=[];showView('practiceView');renderRecommendations();
  });
  assert((await page.locator('#recommendations').textContent())?.includes('Silben & Wortstruktur'),'practice hub offers targeted German word-structure training');
  await page.evaluate(()=>{appRole='parent';openWordEditor(state.vocabulary.find(v=>v.term==='Sonne').id,'de_d_set')});
  await page.waitForSelector('#wordSyllables');
  assert(await page.locator('#wordStem').inputValue()==='Sonn','word stem is editable');
  assert((await page.locator('#wordFamily').inputValue()).includes('sonnig'),'word family is editable');
  assert((await page.locator('#wordOrthographyHint').inputValue()).includes('Doppel-n'),'spelling focus is editable');
  const layout=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
  assert(layout.scrollWidth<=layout.clientWidth+1,'Paket D remains overflow-free on iPhone viewport');
  assert(errors.length===0,'Paket D UI produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Deutsch Paket D UI smoke: passed');
}finally{
  await browser.close();
}
