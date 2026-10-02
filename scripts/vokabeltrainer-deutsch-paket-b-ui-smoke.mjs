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
    learner().worldModeBySubject=normalizeWorldModeBySubject({german:'adventure'});
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

  await page.waitForSelector('#homeView.active .project-menu-stage[data-visual-theme="german-adventure"]');
  assert(await page.locator('#projectMenuAvatarFrame').evaluate(el=>el.classList.contains('german-fox-avatar')),'German home uses the fox companion');
  assert(await page.locator('#projectMenuAvatarFallback').isHidden(),'German Start/Heute does not show a separate fox/avatar tile');
  assert(await page.locator('#projectMenuAvatarArt').isHidden(),'German home never reuses the English army avatar artwork');
  assert(await page.locator('#projectMenuScenery .wordrealm-approved-home-scene').count()===1,'German adventure uses the approved integrated fox landscape');
  assert((await page.locator('.nav-btn[data-view="armyView"]').textContent())?.includes('Abenteuer'),'German child navigation names the selected adventure world');

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

  const foundationModel=await page.evaluate(()=>({
    first:window.VTGermanFoundation.course[0]?.id,
    firstTask:window.VTGermanFoundation.stageTasks('handwriting')[0],
    letterPositions:window.VTGermanFoundation.stageTasks('letters').map(t=>t.options.indexOf(t.target))
  }));
  assert(foundationModel.first==='handwriting','first German foundation stage is handwriting');
  assert(foundationModel.firstTask?.upper==='M'&&foundationModel.firstTask?.lower==='m'&&foundationModel.firstTask?.sound==='mmmm','first handwriting task teaches uppercase, lowercase and phoneme together');
  assert(new Set(foundationModel.letterPositions).size>1,'foundation answer position varies instead of always being first');

  await page.evaluate(()=>window.VTGermanFoundation.open('handwriting'));
  await page.waitForSelector('#learnView.active #foundationTraceCanvas');
  assert((await page.locator('.foundation-letter-pair').textContent())?.includes('M m'),'trace phase visibly shows uppercase and lowercase pair');
  assert(await page.locator('#foundationLetterSoundBtn').count()===1,'trace phase has a phoneme audio button');
  await page.evaluate(()=>{const b=document.querySelector('#foundationDrawDone');b.disabled=false;b.click()});
  await page.waitForFunction(()=>document.querySelector('#germanFoundationFeedback')?.textContent?.includes('Nur der Laut'));
  assert(await page.locator('.foundation-letter-pair').count()===0,'free-writing phase removes the visible letter pair');
  assert(!(await page.locator('#studyArea').textContent()).includes('M m'),'free-writing phase cannot be copied from a visible solution');

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

  assert(!(await page.locator('#studyArea').textContent()).includes('Haus'),'German spelling assessment does not expose the target word before the answer');

  await page.evaluate(()=>{session=null;startSession('handwriting','de_b_set',null,false);session.handwritingPhase='memory';renderStudy()});
  await page.waitForSelector('#learnView.active .handwriting-card');
  assert(!(await page.locator('#studyArea').textContent()).includes('Haus'),'German free handwriting hides the target word');
  assert((await page.locator('#studyArea').textContent()).includes('Lernwort hören'),'German free handwriting offers audio instead of a visible solution');

  await page.evaluate(()=>{session=null;setLearnerWorldMode(learner(),'german','battle');showView('homeView');renderAll()});
  await page.click('.nav-btn[data-view="armyView"]');
  await page.waitForSelector('#armyView.active[data-visual-theme="wordrealm"]');
  assert((await page.locator('#armySubjectLabel').textContent())?.includes('Das Wortreich'),'game hub identifies the Wortreich');
  assert((await page.locator('#armyView').textContent())?.includes('Knappen'),'Ritterheer uses German-specific unit names');
  await page.click('#campaignMapBtn');
  await page.waitForSelector('#campaignMapView.active[data-visual-theme="wordrealm"]');
  assert((await page.locator('#campaignMapViewTitle').textContent())?.includes('Wortreich'),'campaign map uses the Wortreich title');

  await page.setViewportSize({width:1200,height:800});
  await page.evaluate(()=>{setLearnerWorldMode(learner(),'german','adventure');window.VTMenuUi.openHome();renderAll()});
  await page.waitForSelector('#homeView.active .project-menu-stage[data-visual-theme="german-adventure"]');
  const desktop=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,sceneVisible:!!document.querySelector('#projectMenuScenery .wordrealm-approved-home-scene')?.getBoundingClientRect().width,avatarTileVisible:!!document.querySelector('#projectMenuAvatarFallback')?.getBoundingClientRect().width}));
  assert(desktop.scrollWidth<=desktop.clientWidth+1&&desktop.sceneVisible&&!desktop.avatarTileVisible,'German approved home scene remains visible and overflow-free on desktop without a separate avatar tile');

  assert(errors.length===0,'German UI produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer Deutsch Paket B UI smoke: passed');
  console.log('✓ approved integrated German Start/Heute scene and wooden-sword learning stations');
  console.log('✓ de-DE audio and case-sensitive German spelling question');
  console.log('✓ Wortreich Ritterheer and Burg campaign shell');
  console.log('✓ iPhone and desktop layout remain overflow-free');
}finally{
  await browser.close();
}
