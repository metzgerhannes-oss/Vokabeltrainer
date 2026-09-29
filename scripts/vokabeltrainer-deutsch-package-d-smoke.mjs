import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/storage.js','js/model.js','js/quiz-engine.js','js/learning.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const checks=vm.runInContext("(()=>{ const passed=[]; const assert=(v,n)=>{if(!v)throw new Error('Deutsch Paket D smoke failed: '+n);passed.push(n)}; assert(Object.keys(defaultLiteracyErrors()).join(',')==='capitalization,letterSequence,wordStructure,sentenceContext','German spelling error dimensions are explicit'); const v=makeVocabulary('german','Sonne','Himmelskörper',{syllables:['Son','ne'],wordStem:'Sonn',wordFamily:['Sonne','sonnig'],orthographyHint:'Doppel-n nach kurzem Vokal'}); assert(v.syllables.join('|')==='Son|ne'&&v.wordStem==='Sonn'&&v.wordFamily.includes('sonnig')&&v.orthographyHint.includes('Doppel-n'),'German spelling metadata persists on vocabulary'); const p=makeLearnerVocabulary('l','v','s',{literacyErrors:{capitalization:2}}); assert(p.literacyErrors.capitalization===2&&p.literacyErrors.letterSequence===0,'per-word spelling error profile persists separately'); const safe=safeLiteracyErrors({capitalization:999,letterSequence:-2,evil:9}); assert(safe.capitalization===100&&safe.letterSequence===0&&!('evil' in safe),'spelling error profile is bounded and allow-listed'); state=defaultState();state.learners[0].activeSubjects=['german'];state.activeSubject='german'; const w={subject:'german',term:'Sonne',syllables:['Son','ne'],chunks:[]}; assert(germanSpellingErrorKind(w,'sonne',['Sonne'],'spelling')==='capitalization','capitalization-only error is classified deterministically'); assert(germanSpellingErrorKind(w,'Son',['Sonne'],'spelling')==='wordStructure','explicit syllable loss maps to word structure'); assert(germanSpellingErrorKind(w,'Sone',['Sonne'],'spelling')==='letterSequence','other spelling difference maps to letter sequence'); assert(germanSpellingErrorKind(w,'Sone',['Sonne'],'context')==='sentenceContext','context error remains a separate dimension'); assert(learningChunksFor(w,'Sonne').join('|')==='Son|ne','explicit German syllables drive structure practice'); return passed; })()",context,{filename:'deutsch-package-d-smoke'});

const ui=fs.readFileSync('js/ui.js','utf8'),focus=fs.readFileSync('js/focus-ui.js','utf8');
const staticChecks=[
  [ui.includes('id="wordSyllables"')&&ui.includes('id="wordStem"')&&ui.includes('id="wordFamily"')&&ui.includes('id="wordOrthographyHint"'),'German word editor exposes spelling structure fields'],
  [ui.includes("title:native?'Silben & Wortstruktur':'Wortbausteine'"),'German practice hub exposes targeted structure practice'],
  [focus.includes('recordNativeLiteracyError(w,answer,q,skill,ok)'),'focused learning records differentiated spelling errors'],
  [focus.includes('answerReviewAttemptSnapshot(w)')&&focus.includes('flagAnswerForParentReview'),'parent-review rollback remains wired around spelling errors']
];
for(const [v,n] of staticChecks){if(!v)throw new Error('Deutsch Paket D smoke failed: '+n);checks.push(n)}
console.log('Vokabeltrainer Deutsch Paket D smoke: '+checks.length+' checks passed');
for(const n of checks)console.log('✓ '+n);
