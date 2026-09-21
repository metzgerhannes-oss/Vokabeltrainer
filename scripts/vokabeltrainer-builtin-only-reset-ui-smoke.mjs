import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const assert=(v,m)=>{if(!v)throw new Error('Builtin-only reset UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof persistState==='function'&&typeof attachVocabularyToSet==='function');

  await page.evaluate(async()=>{
    localStorage.removeItem(BUILTIN_ONLY_RESET_MARKER);
    localStorage.setItem(VOCABULARY_PURGE_MARKER,new Date().toISOString());
    state=defaultState();
    const l=state.learners[0];
    l.name='Charly';
    l.lrsMode=true;
    l.gradeLevel='5';
    l.xp=123;
    l.streakDays=[today()];
    l.dailyPlans={[today()]:{wordIds:['old']}};
    l.testSeries.english={enabled:true,weekday:4,setId:'old_set',scopeMode:'set',from:1,to:3,scopeDate:''};

    const set={id:'old_set',learnerId:l.id,subject:'english',title:'Alter Test',schoolYear:currentSchoolYear(),bookId:'book_old',bookSection:'Alt',testDate:datePlusDays(5),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    const result=attachVocabularyToSet(set.id,{term:'oldword',translation:'alt',source:'manual',verified:true});
    state.books.push({id:'book_old',isbn13:'9780000000002',subject:'english',title:'Altes Buch',publisher:'',edition:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
    state.bookVocabulary.push({id:'bv_old',bookId:'book_old',section:'Alt',position:1,vocabId:result.vocab.id,senseId:result.sense.id});
    state.learnerBooks.push({id:'lb_old',learnerId:l.id,subject:'english',bookId:'book_old',gradeLevel:'5',schoolYear:currentSchoolYear(),active:true,createdAt:new Date().toISOString()});
    state.practiceTests.push({id:'pt_old',learnerId:l.id,date:today(),subject:'english',percent:70,correct:7,total:10,answers:[],scopeText:'Alt'});
    state.activity.push({id:'a_old',learnerId:l.id,date:new Date().toISOString(),type:'adaptive',wordId:result.progress.id});
    state.grades.push({id:'g_old',learnerId:l.id,date:today(),subject:'english',grade:'3',note:'alt',practiceTestId:null});
    await persistState();
  });

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state!==null&&state.books.some(b=>b.id==='book_builtin_camden_town_1'));

  const cleaned=await page.evaluate(()=>({
    marker:!!localStorage.getItem(BUILTIN_ONLY_RESET_MARKER),
    profile:{name:state.learners[0]?.name,lrs:state.learners[0]?.lrsMode,gradeLevel:state.learners[0]?.gradeLevel,xp:state.learners[0]?.xp},
    sets:state.sets.length,setVocabulary:state.setVocabulary.length,learnerVocabulary:state.learnerVocabulary.length,
    practiceTests:state.practiceTests.length,activity:state.activity.length,grades:state.grades.length,learnerBooks:state.learnerBooks.length,
    books:state.books.map(b=>b.id),builtinRows:state.bookVocabulary.filter(r=>r.bookId==='book_builtin_camden_town_1').length,
    vocabCount:state.vocabulary.length,nonBuiltinVocabulary:state.vocabulary.filter(v=>!(v.sources||[]).some(src=>src.kind==='builtin-book')).map(v=>v.term),
    testSeries:state.learners[0]?.testSeries?.english,
    dailyPlanText:JSON.stringify(state.learners[0]?.dailyPlans||{})
  }));

  assert(cleaned.marker,'reset marker is written');
  assert(cleaned.profile.name==='Charly'&&cleaned.profile.lrs===true&&cleaned.profile.gradeLevel==='5','profile identity and learning settings are preserved');
  assert(cleaned.profile.xp===0&&cleaned.sets===0&&cleaned.setVocabulary===0&&cleaned.learnerVocabulary===0,'personal learning content and progress are cleared');
  assert(cleaned.practiceTests===0&&cleaned.activity===0&&cleaned.grades===0&&cleaned.learnerBooks===0,'old test, grade, activity and book-assignment data are cleared');
  assert(cleaned.books.length===1&&cleaned.books[0]==='book_builtin_camden_town_1','only the built-in book remains');
  assert(cleaned.builtinRows===202&&cleaned.vocabCount>0&&cleaned.nonBuiltinVocabulary.length===0,'only verified built-in vocabulary remains');
  assert(!cleaned.testSeries?.enabled&&!cleaned.dailyPlanText.includes('old_set')&&!cleaned.dailyPlanText.includes('"old"'),'old plans and test series are removed; a fresh empty-day plan may be regenerated');

  console.log('Vokabeltrainer built-in-only reset UI smoke: passed');
}finally{
  await browser.close();
}
