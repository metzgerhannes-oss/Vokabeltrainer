import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{matchMedia:()=>({matches:false}),scrollTo:()=>{}},
  navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/learning.js','js/ui.js']){
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
  const beforeProfile=state.learners.length,beforeSets=state.sets.length;
  assert((state.bookVocabulary||[]).some(x=>x.bookId===book.id&&x.section==='Unit 1'),'bad set created book-section rows');
  assert(resetSetForReimport(bad.id)===true,'repair reset succeeds');
  assert(state.learners.length===beforeProfile,'profile survives repair');
  assert(state.sets.length===beforeSets&&state.sets.some(x=>x.id===bad.id),'set metadata survives repair');
  assert(!(state.setVocabulary||[]).some(x=>x.setId===bad.id),'bad set links are cleared');
  assert((state.setVocabulary||[]).some(x=>x.setId===good.id),'other set links survive');
  assert(!(state.learnerVocabulary||[]).some(x=>x.senseId===wrong.sense.id&&x.learnerId==='learner_demo'),'exclusive bad progress is cleared');
  assert((state.learnerVocabulary||[]).some(x=>x.senseId===keep.sense.id&&x.learnerId==='learner_demo'),'other progress survives');
  assert(!(state.bookVocabulary||[]).some(x=>x.bookId===book.id&&x.section==='Unit 1'),'unshared bad book-section rows are cleared');
  return ok;
})()
`,context,{filename:'set-repair-runtime'});
console.log('Vokabeltrainer set repair smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
