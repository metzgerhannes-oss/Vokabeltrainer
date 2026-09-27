import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{matchMedia:()=>({matches:false}),scrollTo:()=>{}},
  navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/quiz-engine.js','js/learning.js','js/ui.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const passed=vm.runInContext(`
(()=>{
  const ok=[];const assert=(v,n)=>{if(!v)throw new Error('Set repair smoke failed: '+n);ok.push(n)};
  state=defaultState();
  const book=upsertBook('9780140449136','english',{title:'Testbuch'}).book;
  const bad={id:'bad_set',learnerId:'learner_demo',subject:'english',title:'Unit kaputt',schoolYear:currentSchoolYear(),bookId:book.id,bookSection:'Unit 1',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  const good={id:'good_set',learnerId:'learner_demo',subject:'english',title:'Unit gut',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  state.sets.push(bad,good);rebuildWordIndexes();
  const wrong=attachVocabularyToSet(bad.id,{term:'look',translation:'gehen',source:'photo-text-import',verified:true});
  wrong.word.repetitions=5;wrong.word.failures=5;
  const keep=attachVocabularyToSet(good.id,{term:'write',translation:'schreiben',source:'manual',verified:true});
  keep.word.repetitions=3;
  const legacy=deepClone(state);legacy.pairAuditVersion=0;legacy.sets.forEach(s=>{delete s.pairReviewRequired;delete s.pairVerifiedAt});
  const migrated=migrate(legacy),migratedBad=migrated.sets.find(s=>s.id==='bad_set'),migratedGood=migrated.sets.find(s=>s.id==='good_set');
  assert(migratedBad?.pairReviewRequired===true,'legacy photo-import set is forced into pair review');
  assert(migratedGood?.pairReviewRequired===false,'manual legacy set stays learning-ready');

  // v0.21.17 could clear an earlier future test when a later test was saved.
  state=defaultState();
  const recoveryBook=upsertBook('9780140449136','english',{title:'Recovery-Buch'}).book;
  const earlier={id:'earlier_test',learnerId:'learner_demo',subject:'english',title:'Erster Test',schoolYear:currentSchoolYear(),bookId:recoveryBook.id,bookSection:'Unit 1',testDate:'',testScopeMode:'selected',testSelectedLinkIds:[],testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  const later={id:'later_test',learnerId:'learner_demo',subject:'english',title:'Zweiter Test',schoolYear:currentSchoolYear(),bookId:recoveryBook.id,bookSection:'Unit 2',testDate:datePlusDays(8),testScopeMode:'selected',testSelectedLinkIds:[],testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(earlier,later);rebuildWordIndexes();
  const earlierWord=attachVocabularyToSet(earlier.id,{term:'tomorrow',translation:'morgen',source:'manual',verified:true});
  const laterWord=attachVocabularyToSet(later.id,{term:'later',translation:'später',source:'manual',verified:true});
  earlier.testSelectedLinkIds=[earlierWord.word.setLinkId];later.testSelectedLinkIds=[laterWord.word.setLinkId];
  state.learners[0].dailyPlans={'legacy:english':{wordIds:[earlierWord.word.id]}};
  state.learners[0].testFortresses={legacy_first:{key:'legacy_first',id:'tower',name:'Erster Test',subject:'english',testDate:datePlusDays(1),setIds:[earlier.id],defense:100,maxDefense:100,attacks:[]}};
  const replaced=deepClone(state);replaced.version='0.21.17';
  const recovered=migrate(replaced),recoveredEarlier=recovered.sets.find(s=>s.id===earlier.id);
  assert(recoveredEarlier?.testDate===datePlusDays(1),'migration restores the earlier future test date from its existing fortress evidence');
  assert(Object.keys(recovered.learners[0].dailyPlans||{}).length===0,'restoring an earlier future test invalidates the stale daily plan');
  assert(recovered.learners[0].futureTestRecoveryVersion===1,'future-test recovery is marked as one-time');

  state=recovered;rebuildWordIndexes();
  const recoveredCtx=upcomingTestContext('english');
  assert(recoveredCtx?.date===datePlusDays(1)&&recoveredCtx?.sets?.[0]?.id===earlier.id,'recovered earlier test becomes the active upcoming test ahead of the later plan');

  state=defaultState();
  const book2=upsertBook('9780140449136','english',{title:'Testbuch'}).book;
  const bad2={id:'bad_set',learnerId:'learner_demo',subject:'english',title:'Unit kaputt',schoolYear:currentSchoolYear(),bookId:book2.id,bookSection:'Unit 1',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  const good2={id:'good_set',learnerId:'learner_demo',subject:'english',title:'Unit gut',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  state.sets.push(bad2,good2);rebuildWordIndexes();
  const wrong2=attachVocabularyToSet(bad2.id,{term:'look',translation:'gehen',source:'photo-text-import',verified:true});
  wrong2.word.repetitions=5;wrong2.word.failures=5;
  const keep2=attachVocabularyToSet(good2.id,{term:'write',translation:'schreiben',source:'manual',verified:true});
  keep2.word.repetitions=3;

  const beforeProfile=state.learners.length,beforeSets=state.sets.length;
  assert((state.bookVocabulary||[]).some(x=>x.bookId===book2.id&&x.section==='Unit 1'),'bad set created book-section rows');
  assert(resetSetForReimport(bad2.id)===true,'repair reset succeeds');
  assert(state.sets.find(x=>x.id===bad2.id)?.pairReviewRequired===true,'reimported set is blocked until pair confirmation');
  assert(state.learners.length===beforeProfile,'profile survives repair');
  assert(state.sets.length===beforeSets&&state.sets.some(x=>x.id===bad2.id),'set metadata survives repair');
  assert(!(state.setVocabulary||[]).some(x=>x.setId===bad2.id),'bad set links are cleared');
  assert((state.setVocabulary||[]).some(x=>x.setId===good2.id),'other set links survive');
  assert(!(state.learnerVocabulary||[]).some(x=>x.senseId===wrong2.sense.id&&x.learnerId==='learner_demo'),'exclusive bad progress is cleared');
  assert((state.learnerVocabulary||[]).some(x=>x.senseId===keep2.sense.id&&x.learnerId==='learner_demo'),'other progress survives');
  assert(!(state.bookVocabulary||[]).some(x=>x.bookId===book2.id&&x.section==='Unit 1'),'unshared bad book-section rows are cleared');
  return ok;
})()
`,context,{filename:'set-repair-runtime'});
console.log('Vokabeltrainer set repair smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
