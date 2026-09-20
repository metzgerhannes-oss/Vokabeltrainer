
import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const passed=vm.runInContext(`
(()=>{
  const ok=[];const assert=(v,n)=>{if(!v)throw new Error('Library index smoke failed: '+n);ok.push(n)};
  state=defaultState();
  state.learners[0].name='Erstes Kind';
  const book=upsertBook('9780140449136','english',{title:'Camden Town Test',publisher:'Testverlag',edition:'2026'}).book;
  const set1={id:'set_u1',learnerId:'learner_demo',subject:'english',title:'Unit 1',schoolYear:currentSchoolYear(),bookId:book.id,bookSection:'Unit 1',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target'};
  const set2={id:'set_u2',learnerId:'learner_demo',subject:'english',title:'Unit 2',schoolYear:currentSchoolYear(),bookId:book.id,bookSection:'Unit 2',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target'};
  state.sets.push(set1,set2);rebuildWordIndexes();

  const a=attachVocabularyToSet(set1.id,{term:'look',translation:'schauen',source:'test',verified:true});
  attachVocabularyToSet(set1.id,{term:'look',translation:'ansehen',senseId:a.sense.id,source:'book-test',verified:true});
  const b=attachVocabularyToSet(set2.id,{term:'take',translation:'nehmen',source:'test',verified:true});
  b.vocab.termVariants.push('takes');rebuildWordIndexes();

  assert(globalLibraryIndex().version===1,'runtime library index has explicit version');
  assert(indexedBookByIsbn('9780140449136')?.id===book.id,'ISBN resolves through index');
  assert(indexedVocabularyMatch('english','takes')?.id===b.vocab.id,'term variants resolve to existing lexeme');
  assert(searchGlobalLibrary({subject:'english',query:'9780140449136'}).length===2,'ISBN search finds book vocabulary');
  assert(searchGlobalLibrary({subject:'english',query:'Unit 1'}).some(v=>v.id===a.vocab.id),'unit search finds matching vocabulary');
  assert(searchGlobalLibrary({subject:'english',query:'nehmen'}).some(v=>v.id===b.vocab.id),'meaning search finds vocabulary');
  assert(searchGlobalLibrary({subject:'english',bookId:book.id,section:'Unit 2'}).length===1,'book and unit filters use index');

  const local=libraryMatchForContext('english','look','','ansehen',book.id,'Unit 1');
  assert(local.sense?.id===a.sense.id&&local.matchedBy==='book','book-specific wording reuses the existing sense');
  const ambiguous=libraryMatchForContext('english','look','','betrachten',book.id,'Unit 1');
  assert(ambiguous.vocab?.id===a.vocab.id&&!ambiguous.sense&&ambiguous.senseOptions[0]?.id===a.sense.id,'unknown wording stays an explicit sense decision');

  state.learners.push({id:'learner_two',name:'Zweiter Nutzer',gradeLevel:'6',activeSubjects:['english'],xp:0,lrsMode:false,fontSize:17,letterSpacing:0,flashSpeed:1600,streakDays:[],milestones:{},fortressWins:defaultSubjectArrays(),fortressWinsByYear:{},campaignLog:[],dailyPlans:{},testSeries:defaultTestSeries(),gradeScales:defaultGradeScales(),createdAt:new Date().toISOString()});
  const before=state.vocabulary.length;cloneKnownBookToLearner(book.id,'learner_two');
  assert(state.vocabulary.length===before,'second learner reuses book vocabulary instead of duplicating it');
  assert(state.sets.some(s=>s.learnerId==='learner_two'&&s.bookId===book.id),'known book units clone to another learner');

  const doc=globalLibraryIndex().docs.get(a.vocab.id);
  assert(doc&&!('progress' in doc)&&!('learnerId' in doc),'global search document contains no learner progress');
  assert(!JSON.stringify(state).includes('_libraryIndex'),'runtime index is never persisted');

  return ok;
})()
`,context,{filename:'library-index-smoke'});

console.log('Vokabeltrainer library index smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
