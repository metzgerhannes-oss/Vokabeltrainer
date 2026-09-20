import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});

for(const file of ['js/core.js','js/storage.js','js/model.js','js/learning.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}

const result=vm.runInContext(`
(()=>{
  const passed=[];const assert=(value,name)=>{if(!value)throw new Error('Sense smoke failed: '+name);passed.push(name)};
  assert(meaningKey('schön')!==meaningKey('schon'),'meaningKey preserves diacritics');

  const legacy=defaultState();delete legacy.senseModelVersion;
  legacy.vocabulary=[{id:'v_legacy',subject:'english',term:'nice',translation:'nett',translations:['freundlich'],examples:['She is nice.'],termVariants:[],extra:'',mnemonic:'',chunks:[],sources:[],createdAt:'2026-01-01T00:00:00.000Z',updatedAt:'2026-01-01T00:00:00.000Z'}];
  legacy.setVocabulary=[];legacy.learnerVocabulary=[];
  migrateSenseModel(legacy);
  assert(legacy.vocabulary[0].senses.length===1,'legacy aliases stay one sense');
  assert(legacy.vocabulary[0].senses[0].translations.includes('freundlich'),'legacy alias preserved');

  state=defaultState();
  const mkSet=id=>({id,learnerId:'learner_demo',subject:'english',title:id,schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''});
  state.sets.push(mkSet('s1'),mkSet('s2'),mkSet('s3'));
  const a=attachVocabularyToSet('s1',{term:'bank',translation:'Bank',source:'test',verified:true});
  const b=attachVocabularyToSet('s2',{term:'bank',translation:'Ufer',source:'test',verified:true});
  assert(state.vocabulary.length===1&&state.vocabulary[0].senses.length===2,'two meanings share one lexeme');
  assert(a.progress.id!==b.progress.id&&a.sense.id!==b.sense.id,'two meanings have separate progress');

  const c=attachVocabularyToSet('s3',{term:'bank',translation:'Geldinstitut',senseId:a.sense.id,source:'test',verified:true});
  assert(state.vocabulary[0].senses.length===2,'explicit sense reuse creates no new sense');
  assert(c.progress.id===a.progress.id,'explicit sense reuse keeps progress');
  assert(c.word.translation==='Geldinstitut','schoolbook wording stays set-specific');
  assert(!a.sense.translations.includes('Geldinstitut'),'set wording is not silently globalized');

  assert(ambiguousSenseWord(a.word)===true,'ambiguity detected');
  assert(meaningRecallHasCue(a.word)===false,'ambiguous recall without cue rejected');
  session={practiceContext:{testFormat:'source'},index:0};const pd=practiceDirection(a.word);
  assert(pd.ambiguity===true&&pd.targets.some(x=>meaningKey(x)===meaningKey('Bank'))&&pd.targets.some(x=>meaningKey(x)===meaningKey('Ufer')),'practice test accepts all valid meanings when context is missing');
  a.sense.examples=['I put my money in the bank.'];
  assert(meaningRecallHasCue(a.word)===true,'context disambiguates sense');

  const corrupt=defaultState();
  const corruptSet=mkSet('corrupt_set');corrupt.sets.push(corruptSet);
  const corruptV=makeVocabulary('english','spring','Frühling',{id:'v_corrupt'});
  corruptV.senses.push(makeVocabularySense('Quelle',{id:'sense_source'}));
  corrupt.vocabulary=[corruptV];
  corrupt.setVocabulary=[makeSetVocabulary('corrupt_set','v_corrupt','missing_sense',{id:'corrupt_link',position:1})];
  corrupt.learnerVocabulary=[makeLearnerVocabulary('learner_demo','v_corrupt',primarySense(corruptV).id,{id:'corrupt_progress'})];
  migrateSenseModel(corrupt);
  assert(corrupt.sets[0].pairReviewRequired===true,'ambiguous invalid sense mapping is blocked for pair review');


  const repair=defaultState();delete repair.senseModelVersion;const stamp='2026-09-20T12:00:00.000Z';
  const p1=makeVocabularySense('nett',{id:'sense_a',createdAt:stamp,updatedAt:stamp});
  const p2=makeVocabularySense('freundlich',{id:'sense_b',createdAt:stamp,updatedAt:stamp});
  repair.vocabulary=[makeVocabulary('english','nice','nett',{id:'v_repair',senses:[p1,p2]})];
  repair.sets=[mkSet('repair_set')];repair.setVocabulary=[makeSetVocabulary('repair_set','v_repair','sense_b',{id:'repair_link',position:1})];
  repair.learnerVocabulary=[makeLearnerVocabulary('learner_demo','v_repair','sense_b',{id:'repair_progress'})];
  repairV0912AliasSplit(repair,'0.9.12');
  assert(repair.vocabulary[0].senses.length===1,'v0.9.12 untouched alias split repaired');
  assert(repair.setVocabulary[0].senseId==='sense_a','repaired link points to primary sense');
  assert(repair.setVocabulary[0].translationOverride==='freundlich','repaired schoolbook wording preserved');

  return passed;
})()
`,context,{filename:'sense-smoke'});

console.log('Vokabeltrainer sense smoke: '+result.length+' checks passed');
for(const name of result)console.log('✓ '+name);
