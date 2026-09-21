import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/learning.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const passed=vm.runInContext(`
(()=>{
  const ok=[];const assert=(v,n)=>{if(!v)throw new Error('Learning integrity smoke failed: '+n);ok.push(n)};
  const s=defaultState();delete s.spellingLeakRepairVersion;s.version='0.9.20';
  const v=makeVocabulary('english','write','schreiben');
  s.vocabulary.push(v);
  const sense=primarySense(v);
  const p=makeLearnerVocabulary('learner_demo',v.id,sense.id,{
    skills:{recognition:2,listening:1,retrieval:3,spelling:3,context:1},
    repetitions:8,successes:7,failures:1,independentSuccesses:6,
    activeSuccessDays:['2026-09-10','2026-09-14','2026-09-18'],
    coldRecallDays:['2026-09-14','2026-09-18'],maxActiveGapDays:4,intervalDays:14,
    dueDate:'2026-10-04',masteredAt:'2026-09-18T12:00:00.000Z'
  });
  s.learnerVocabulary.push(p);
  const repaired=migrate(s);
  const rp=repaired.learnerVocabulary[0];
  assert(repaired.spellingLeakRepairVersion===1,'migration marker is written');
  assert(rp.skills.spelling===0,'old spelling credit is reset');
  assert(rp.masteredAt===null,'mastery based on leaked spelling is revoked');
  assert(rp.lastMasteredAt==='2026-09-18T12:00:00.000Z','previous mastery timestamp is retained for history');
  assert(rp.dueDate===today(),'revalidation becomes due immediately');
  assert(!meetsMasteryCriteria(rp),'repaired progress cannot remain mastered');
  assert(answerMatches('cant',"can't")===true,'general recall stays punctuation tolerant');
  assert(answerMatches('schon','schön')===false,'general recall preserves meaning-changing umlauts');
  assert(closestTargetForm('schauen',['schauen; ansehen'])==='schauen; ansehen','feedback keeps semicolon target atomic');
  assert(closestTargetForm('to look at sb',['to look at sb/sth'])==='to look at sb/sth','feedback keeps slash target atomic');
  assert(spellingMatches('cant',"can't")===false,'spelling requires the apostrophe');
  assert(spellingMatches('cafe','café')===false&&spellingMatches('café','café')===true,'spelling preserves diacritics');
  session={currentSubmode:'recall'};assert(!skillCredits('retrieval',{orthographyOk:false}).includes('spelling'),'imprecise recall receives no spelling credit');

  state=defaultState();
  const set={id:'integrity_set',learnerId:'learner_demo',subject:'english',title:'Integrity',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  state.sets.push(set);
  const linked=attachVocabularyToSet(set.id,{term:"can't",translation:'nicht können',source:'integrity',verified:true});
  const w=linked.word;
  w.skills.spelling=2;w.intervalDays=7;w.dueDate=datePlusDays(7);
  session={mode:'recall',currentSubmode:'recall',hintUsed:false,activeAttemptedWords:{},scaffoldedWords:{},correct:0,answered:0};
  recordResult(w,true,'retrieval',null,{orthographyOk:false});
  assert((w.errorProfile.spelling||0)===1,'soft orthography error enters spelling error profile');
  assert(w.skills.spelling===1.5,'soft orthography error reduces spelling confidence');
  assert(w.dueDate===datePlusDays(1),'soft orthography error is due again tomorrow');
  assert(session.correct===1,'semantic retrieval success remains credited');

  state=defaultState();
  const localSet={id:'local_wording_set',learnerId:'learner_demo',subject:'english',title:'Unit Wortlaut',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};
  state.sets.push(localSet);
  const local=attachVocabularyToSet(localSet.id,{term:'look',translation:'schauen',source:'integrity',verified:true});
  local.word.translation='ansehen';
  rebuildWordIndexes();
  const localView=setWords(localSet.id)[0];
  assert(localView.translation==='ansehen','local textbook wording is shown as the prompt/primary wording');
  assert(translationTargets(localView).includes('ansehen'),'local textbook wording stays accepted');
  assert(translationTargets(localView).includes('schauen'),'canonical sense wording remains accepted beside the local wording');

  local.word.term='to look';
  rebuildWordIndexes();
  const localTermView=setWords(localSet.id)[0];
  assert(termTargets(localTermView).includes('to look'),'local term wording stays accepted');
  assert(termTargets(localTermView).includes('look'),'canonical term remains accepted beside the local wording');

  state=defaultState();
  const pacedSet={id:'paced_set',learnerId:'learner_demo',subject:'english',title:'Theme Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(4),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(pacedSet);
  for(let i=1;i<=15;i++)attachVocabularyToSet(pacedSet.id,{term:'paced'+i,translation:'bedeutung'+i,source:'paced-smoke',verified:true});
  const pacedLinks=state.setVocabulary.filter(x=>x.setId===pacedSet.id).sort((a,b)=>a.position-b.position);
  pacedLinks.slice(0,6).forEach(link=>{link.firstContactCopiedAt=new Date().toISOString();link.firstContactRecalledAt=link.firstContactCopiedAt;link.firstContactCompletedAt=link.firstContactCopiedAt});
  rebuildWordIndexes();
  const pacedPlan=buildDailyPlan('english'),pacedStatus=dailyPlanStatus(pacedPlan);
  assert(pacedPlan.introCount===5,'daily plan introduces five new words when the deadline allows it');
  assert(pacedPlan.reviewCount===6&&pacedStatus.total===11,'daily plan mixes available reviews to stay around ten to twelve words');
  pacedSet.testDate=datePlusDays(2);learner().dailyPlans={};
  const urgentPlan=buildDailyPlan('english');
  assert(urgentPlan.introCount===7&&urgentPlan.deadlineOverload===true&&urgentPlan.requiredNewPerDay>7,'deadline formula caps new words at seven and flags an impossible pace');
  return ok;
})()
`,context,{filename:'learning-integrity-runtime'});

const learning=fs.readFileSync('js/learning.js','utf8');
const start=learning.indexOf('function renderSpelling(');
const end=learning.indexOf('\nfunction ',start+20);
const block=learning.slice(start,end<0?learning.length:end);
if(block.includes('wordLearningCard('))throw new Error('Learning integrity smoke failed: spelling prompt reveals learning card before answer');
if(!block.includes('aria-label="Deine Antwort"'))throw new Error('Learning integrity smoke failed: spelling answer input lacks accessible name');

console.log('Vokabeltrainer learning integrity smoke: '+(passed.length+2)+' checks passed');
for(const name of passed)console.log('✓ '+name);
console.log('✓ spelling prompt does not reveal the answer');
console.log('✓ spelling answer field remains accessible');
