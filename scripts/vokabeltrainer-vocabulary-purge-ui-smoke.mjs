import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const assert=(v,m)=>{if(!v)throw new Error('Vocabulary purge UI smoke failed: '+m)};

try{
  let response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof persistState==='function'&&typeof attachVocabularyToSet==='function');

  await page.evaluate(async()=>{
    localStorage.removeItem(VOCABULARY_PURGE_MARKER);
    state=defaultState();
    const l=state.learners[0];
    l.name='Profil bleibt';
    l.lrsMode=true;
    l.fontSize=21;
    l.xp=77;
    l.streakDays=[today()];
    l.dailyPlans={[today()]:{wordIds:['old']}};
    l.testSeries.english={enabled:true,weekday:3,setId:'old_set',scopeMode:'set',from:1,to:2,scopeDate:''};
    const set={id:'old_set',learnerId:l.id,subject:'english',title:'Alte Vokabeln',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'oldword',translation:'alt',source:'manual',verified:true});
    state.bookVocabulary.push({id:'bv_old',bookId:'book_old',section:'Unit 1',position:1,vocabId:state.vocabulary[0].id,senseId:state.vocabulary[0].senses[0].id});
    state.practiceTests.push({id:'pt_old',learnerId:l.id,date:today(),subject:'english',percent:100,correct:1,total:1,answers:[],scopeText:'Alt'});
    state.activity.push({id:'a_old',learnerId:l.id,date:new Date().toISOString(),type:'adaptive',wordId:state.learnerVocabulary[0].id});
    state.grades.push({id:'g_manual',learnerId:l.id,date:today(),subject:'english',grade:'2',note:'bleibt',practiceTestId:null});
    state.grades.push({id:'g_linked',learnerId:l.id,date:today(),subject:'english',grade:'1',note:'Testcheck',practiceTestId:'pt_old'});
    await persistState();
  });

  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state!==null&&document.querySelector('#profileBtn')?.textContent==='Profil bleibt');

  const cleaned=await page.evaluate(()=>({
    marker:!!localStorage.getItem(VOCABULARY_PURGE_MARKER),
    sets:state.sets.length,vocabulary:state.vocabulary.length,setVocabulary:state.setVocabulary.length,
    learnerVocabulary:state.learnerVocabulary.length,bookVocabulary:state.bookVocabulary.length,
    practiceTests:state.practiceTests.length,activity:state.activity.length,grades:state.grades.map(g=>g.id),
    name:state.learners[0].name,lrs:state.learners[0].lrsMode,fontSize:state.learners[0].fontSize,
    xp:state.learners[0].xp,streak:state.learners[0].streakDays.length,
    dailyPlanRefs:Object.values(state.learners[0].dailyPlans||{}).flatMap(p=>[...(p?.wordIds||[]),...(p?.wordRefs||[]).map(r=>r?.wordId||'')]).filter(Boolean),
    series:state.learners[0].testSeries?.english
  }));
  assert(cleaned.marker,'one-time purge marker is written');
  assert(cleaned.sets===0&&cleaned.vocabulary===0&&cleaned.setVocabulary===0&&cleaned.learnerVocabulary===0,'all vocabulary and set data are removed');
  assert(cleaned.bookVocabulary===0&&cleaned.practiceTests===0&&cleaned.activity===0,'derived vocabulary/test data are removed');
  assert(cleaned.grades.length===1&&cleaned.grades[0]==='g_manual','manual grade is preserved while linked testcheck grade is removed');
  assert(cleaned.name==='Profil bleibt'&&cleaned.lrs===true&&cleaned.fontSize===21,'profile and LRS/display settings are preserved');
  assert(cleaned.xp===0&&cleaned.streak===0&&cleaned.dailyPlanRefs.length===0&&!cleaned.series?.enabled,'derived learning state is reset without old vocabulary references');

  await page.evaluate(async()=>{
    const l=state.learners[0];
    const set={id:'new_set',learnerId:l.id,subject:'english',title:'Neue Vokabeln',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'newword',translation:'neu',source:'manual',verified:true});
    await persistState();
  });
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>state!==null);
  const retained=await page.evaluate(()=>({sets:state.sets.length,vocabulary:state.vocabulary.length,term:state.vocabulary[0]?.term}));
  assert(retained.sets===1&&retained.vocabulary===1&&retained.term==='newword','purge runs only once; newly entered vocabulary survives later reloads');

  console.log('Vokabeltrainer one-time vocabulary purge UI smoke: passed');
}finally{
  await browser.close();
}
