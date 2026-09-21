import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{matchMedia:()=>({matches:false}),scrollTo:()=>{}},
  navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/quiz-engine.js','js/learning.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const passed=vm.runInContext(`
(()=>{
  const ok=[];const assert=(v,n)=>{if(!v)throw new Error('Quiz engine smoke failed: '+n);ok.push(n)};
  state=defaultState();
  const setA={id:'set_a',learnerId:'learner_demo',subject:'english',title:'Unit A',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  const setB={id:'set_b',learnerId:'learner_demo',subject:'english',title:'Unit B',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  state.sets.push(setA,setB);rebuildWordIndexes();

  const a=attachVocabularyToSet(setA.id,{term:'look',translation:'schauen',source:'test',verified:true});
  const b=attachVocabularyToSet(setB.id,{term:'look',translation:'ansehen',senseId:a.sense.id,source:'test',verified:true});
  rebuildWordIndexes();
  const wordA=setWords(setA.id)[0],wordB=setWords(setB.id)[0];

  assert(wordA.setLinkId!==wordB.setLinkId,'same sense keeps distinct set links');
  assert(translationTargets(wordB).includes('ansehen')&&translationTargets(wordB).includes('schauen'),'local and canonical meanings coexist');

  session={mode:'reverseRecall',setId:setB.id,queue:[quizQueueRef(wordB)],index:0,currentSubmode:'reverseRecall',locked:false};
  const q=makeQuizQuestion(wordB,'reverseRecall');
  assert(q.setLinkId===wordB.setLinkId&&q.setId===setB.id,'question snapshot is bound to exact set link');
  assert(q.targets.includes('ansehen')&&q.targets.includes('schauen'),'snapshot contains all valid meanings');
  assert(gradeQuizQuestion(q,'schauen').correct===true,'canonical meaning is correct');
  assert(gradeQuizQuestion(q,'ansehen').correct===true,'local textbook wording is correct');

  wordB.translation='betrachten';
  rebuildWordIndexes();
  assert(q.targets.includes('ansehen')&&!q.targets.includes('betrachten'),'shown question does not mutate after state changes');
  assert(gradeQuizQuestion(q,'ansehen').correct===true,'snapshot grades against what was shown, not later state');

  const ref=quizQueueRef(wordB),resolved=resolveQuizQueueRef(ref);
  assert(resolved?.setLinkId===wordB.setLinkId,'queue reference resolves exact original link');
  assert(resolved?.setId===setB.id,'queue reference cannot drift to another set');

  const badRef={...ref,senseId:'wrong_sense'};
  assert(resolveQuizQueueRef(badRef)===null,'mismatched queue identity is rejected');

  const qRecall=makeQuizQuestion(wordA,'recall');
  assert(gradeQuizQuestion(qRecall,'look').correct===true,'exact foreign answer is correct');
  assert(gradeQuizQuestion(qRecall,'wrong').correct===false,'wrong foreign answer is rejected');

  const punctuationTarget=['to look at sb/sth'];
  assert(quizSemanticMatches('to look at sb/sth',punctuationTarget)===true,'slash inside one schoolbook answer stays intact');
  assert(quizSemanticMatches('to look at sb',punctuationTarget)===false,'slash no longer creates accidental partial answers');
  assert(quizSemanticMatches('schauen',['schauen; ansehen'])===false,'semicolon no longer silently invents alternatives');
  assert(quizSemanticMatches('schon',['schön'])===false,'semantic grading preserves German umlaut distinctions');
  assert(quizSemanticMatches('wurde',['würde'])===false,'semantic grading does not collapse meaning-changing diacritics');

  const strict=makeQuizQuestion(wordA,'spelling',{targets:["can't"]});
  assert(gradeQuizQuestion(strict,"can't").correct===true,'strict spelling accepts exact apostrophe');
  assert(gradeQuizQuestion(strict,'cant').correct===false,'strict spelling rejects missing apostrophe');
  const ellipsisStrict=makeQuizQuestion(wordA,'spelling',{targets:['Where is ...?']});
  assert(gradeQuizQuestion(ellipsisStrict,'Where is…?').correct===true,'ellipsis glyph variant is accepted in sentence spelling');
  assert(gradeQuizQuestion(ellipsisStrict,'Where is ..... ?').correct===true,'ellipsis length and spacing are ignored in sentence spelling');
  assert(gradeQuizQuestion(ellipsisStrict,'Where is?').correct===true,'ellipsis placeholder itself is optional in sentence spelling');
  assert(quizSemanticMatches('How many …?',['How many ...?'])===true,'semantic grading ignores unicode ellipsis variants');

  const issues=validateQuizQuestion(qRecall);
  assert(issues.length===0,'valid question passes integrity gate');
  const corrupt=Object.freeze({...qRecall,setId:'missing_set'});
  assert(validateQuizQuestion(corrupt).includes('set-mismatch')||validateQuizQuestion(corrupt).includes('set-not-found'),'corrupt question is stopped instead of graded');

  const retrySession={index:0,queue:[quizQueueRef(wordB)],retryCounts:{},followupCounts:{}};
  assert(scheduleRetry(retrySession,wordB)===true,'retry can be scheduled');
  assert(typeof retrySession.queue[1]==='object'&&retrySession.queue[1].setLinkId===wordB.setLinkId,'retry preserves exact set link');

  return ok;
})()
`,context,{filename:'quiz-engine-runtime'});

console.log('Vokabeltrainer quiz engine smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
