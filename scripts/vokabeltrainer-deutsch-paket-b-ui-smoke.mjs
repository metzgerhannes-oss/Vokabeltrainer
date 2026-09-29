import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Deutsch Paket B UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTMenuUi&&!!window.VTArmyUi&&!!window.VTCampaignMap);

  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['english','german'];
    learner().gradeLevel='1';
    state.activeSubject='german';
    const set={id:'de_b_set',learnerId:'learner_demo',subject:'german',title:'Lernwörter 1',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(5),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'dictation',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'Haus',translation:'Gebäude',source:'deutsch-paket-b-smoke',verified:true,firstContactCopiedAt:'x',firstContactRecalledAt:'x',firstContactCompletedAt:'x'});
    set.pairVerifiedSignature=pairReviewSignatureForSet(set.id);
    rebuildWordIndexes();
    renderAll();
    showView('homeView');
  });

  await page.waitForSelector('#homeView.active .project-menu-stage[data-visual-theme="wordrealm"]');
  assert(await page.locator('#projectMenuAvatarFrame').evaluate(el=>el.classList.contains('german-fox-avatar')),'German home uses the fox companion');
  assert(await page.locator('#projectMenuAvatarFallback').isVisible(),'fox fallback is visible on German home');
  assert(await page.locator('#projectMenuAvatarArt').isHidden(),'German home never reuses the English army avatar artwork');
  assert((await page.locator('.nav-btn[data-view="armyView"]').textContent())?.includes('Wortreich'),'German child navigation names the game area Wortreich');

  const mobileLayout=await page.evaluate(()=>{
    const fox=document.querySelector('#projectMenuAvatarFrame')?.getBoundingClientRect();
    const card=document.querySelector('.project-menu-learning-card')?.getBoundingClientRect();
    return {foxBottom:fox?.bottom||0,cardTop:card?.top||0,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth};
  });
  assert(mobileLayout.scrollWidth<=mobileLayout.clientWidth+1,'German home has no horizontal overflow at 390px');
  assert(mobileLayout.foxBottom<=mobileLayout.cardTop+8,'fox area does not cover the daily learning card on iPhone viewport');

  await page.click('.nav-btn[data-view="practiceView"]');
  await page.waitForSelector('#practiceView.active #germanLearningPath:not(.hidden)');
  assert(await page.locator('#germanLearningPath .german-fox').count()===2,'German learning path shows two calm fox markers');
  assert(await page.locator('#germanLearningPath .wood-sword').count()===5,'German learning stations use wooden-sword motifs');
  assert((await page.locator('#germanLearningPath').textContent())?.includes('Buchstaben'),'German path exposes letters');
  assert((await page.locator('#germanLearningPath').textContent())?.includes('Laute'),'German path exposes sound-letter work');
  assert((await page.locator('#germanLearningPath').textContent())?.includes('Schreiben'),'German path exposes writing');

  await page.evaluate(()=>{
    const w=setWords('de_b_set')[0];
    session={mode:'spelling',setId:'de_b_set',queue:[quizQueueRef(w)],index:0,correct:0,answered:0,currentSubmode:'spelling',locked:false,retryCounts:{},followupCounts:{},hintUsed:false,isDaily:false,scaffoldedWords:{},activeAttemptedWords:{},results:[],currentQuestion:null,currentQuestionIssues:[]};
    showView('learnView');
    renderStudy();
  });
  await page.waitForSelector('#learnView.active .german-literacy-card');
  assert((await page.locator('#learnView .german-literacy-card').textContent())?.includes('Groß- und Kleinschreibung'),'German spelling screen states the orthographic rule');
  const question=await page.evaluate(()=>session.currentQuestion&&({subject:session.currentQuestion.subject,caseSensitive:session.currentQuestion.caseSensitiveOrthography,prompt:session.currentQuestion.prompt,lang:subjectSpeechLang(state.activeSubject)}));
  assert(question?.subject==='german'&&question?.caseSensitive===true,'German spelling question is case-sensitive');
  assert(question?.lang==='de-DE','German speech locale is de-DE');

  await page.evaluate(()=>{session=null;showView('homeView');renderAll()});
  await page.click('.nav-btn[data-view="armyView"]');
  await page.waitForSelector('#armyView.active[data-visual-theme="wordrealm"]');
  assert((await page.locator('#armySubjectLabel').textContent())?.includes('Das Wortreich'),'game hub identifies the Wortreich');
  assert((await page.locator('#armyView').textContent())?.includes('Knappen'),'Ritterheer uses German-specific unit names');
  await page.click('#campaignMapBtn');
  await page.waitForSelector('#campaignMapView.active[data-visual-theme="wordrealm"]');
  assert((await page.locator('#campaignMapViewTitle').textContent())?.includes('Wortreich'),'campaign map uses the Wortreich title');

  await page.setViewportSize({width:1200,height:800});
  await page.evaluate(()=>{window.VTMenuUi.openHome();renderAll()});
  await page.waitForSelector('#homeView.active .project-menu-stage[data-visual-theme="wordrealm"]');
  const desktop=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,foxVisible:!!document.querySelector('#projectMenuAvatarFallback')?.getBoundingClientRect().width}));
  assert(desktop.scrollWidth<=desktop.clientWidth+1&&desktop.foxVisible,'German home remains visible and overflow-free on desktop');

  assert(errors.length===0,'German UI produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Deutsch Paket B UI smoke: passed');
  console.log('✓ Fuchs-Lernwelt and wooden-sword stations');
  console.log('✓ de-DE audio and case-sensitive German spelling question');
  console.log('✓ Wortreich Ritterheer and Burg campaign shell');
  console.log('✓ iPhone and desktop layout remain overflow-free');
}finally{
  await browser.close();
}
