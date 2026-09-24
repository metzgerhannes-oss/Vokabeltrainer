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
  const isbnBase='978000000000',approvalBook=makeBook(isbnBase+isbn13Checksum(isbnBase),'english',{id:'approval_book',title:'Approval Book'});
  state.books.push(approvalBook);
  const approvalSet={id:'approval_set',learnerId:'learner_demo',subject:'english',title:'Approval Unit',schoolYear:currentSchoolYear(),bookId:approvalBook.id,bookSection:'Approval Unit',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:'2026-09-22T05:00:00.000Z',pairVerifiedSignature:''};
  state.sets.push(approvalSet);
  const approvalLinked=attachVocabularyToSet(approvalSet.id,{term:'write',translation:'schreiben',source:'book-library',verified:false});
  ensureBookVocabulary(approvalBook.id,approvalLinked.vocab.id,{senseId:approvalLinked.sense.id,section:'Approval Unit',position:1});
  approvalSet.pairVerifiedSignature=pairReviewSignatureForSet(approvalSet.id);
  const restarted=migrate(JSON.parse(JSON.stringify(state)));state=restarted;
  const restartedSet=state.sets.find(x=>x.id==='approval_set');
  assert(!setNeedsPairReview(restartedSet),'confirmed vocabulary pairs stay approved after startup migration');
  assert(!!state.bookVocabulary.find(x=>x.bookId==='approval_book')?.verifiedAt,'startup repairs missing library verification from the existing parent approval');
  state.setVocabulary.find(x=>x.setId==='approval_set').translationOverride='anders';
  assert(setNeedsPairReview(restartedSet),'a real word↔meaning content change invalidates the stored approval');

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
  rebuildWordIndexes();
  const pacedWords=setWords(pacedSet.id);
  pacedWords.slice(0,6).forEach(w=>{w.repetitions=1;w.activePracticeDays=[datePlusDays(-1)];w.practiceDays=[datePlusDays(-1)]});
  const pacedPlan=buildDailyPlan('english'),pacedStatus=dailyPlanStatus(pacedPlan);
  assert(pacedPlan.introCount===3&&pacedPlan.acquisitionDays===3,'daily plan spreads remaining new words across the real pre-test acquisition window');
  assert(pacedPlan.reviewCount===5&&pacedStatus.total===8,'ahead-of-plan learning reduces the daily contact target instead of forcing ten to twelve');
  const dailyRef=[...(pacedPlan.wordRefs||[]),...(pacedPlan.introRefs||[])][0],dailyWord=dailyRef?.setLinkId?wordByLinkId(dailyRef.setLinkId):wordById(dailyRef?.wordId);
  dailyWord.activePracticeDays=[...new Set([...(dailyWord.activePracticeDays||[]),today()])];
  assert(dailyPlanStatus(pacedPlan).done===0,'optional practice does not complete the fixed daily goal');
  markDailyPlanWordDone(dailyWord,pacedPlan);
  assert(dailyPlanStatus(pacedPlan).done===1,'daily goal advances only through the explicit daily session');
  pacedSet.testDate=datePlusDays(2);learner().dailyPlans={};
  const urgentPlan=buildDailyPlan('english');
  assert(urgentPlan.introCount===7&&urgentPlan.deadlineOverload===true&&urgentPlan.requiredNewPerDay===9,'deadline formula caps new words at seven and flags an impossible pace');
  assert(urgentPlan.dailyTarget===14,'clear backlog raises the total daily contact target within the safety cap');

  assert(daysUntil(datePlusDays(7))===7,'test date uses exact calendar-day distance without an off-by-one');
  const normalPace=dailyPacePlan(31,0,{days:7},false);
  assert(normalPace.acquisitionDays===6&&normalPace.reviewOnlyDays===1,'seven days to test reserves the final day for review and leaves six acquisition days');
  assert(normalPace.requiredPerDay===6&&normalPace.quota===6&&normalPace.dailyTarget===11,'31 new words with seven days yields six new words and eleven contacts today');
  const missedPace=dailyPacePlan(31,0,{days:6},false);
  assert(missedPace.requiredPerDay===7&&missedPace.quota===7&&missedPace.dailyTarget===12,'missed learning automatically raises the next daily target');
  const aheadPace=dailyPacePlan(21,0,{days:6},false);
  assert(aheadPace.requiredPerDay===5&&aheadPace.quota===5&&aheadPace.dailyTarget===10,'extra learning automatically reduces the next daily target');
  const farAhead=dailyPacePlan(6,0,{days:7},false);
  assert(farAhead.requiredPerDay===1&&farAhead.quota===3&&farAhead.dailyTarget===8,'large headroom keeps a small three-word block and lowers daily contacts');
  const tomorrow=dailyPacePlan(6,0,{days:1},false);
  assert(tomorrow.quota===6&&tomorrow.spacingRisk===true,'new vocabulary one day before the test is flagged as too late for distributed practice');
  const testToday=dailyPacePlan(5,0,{days:0},false);
  assert(testToday.quota===0&&testToday.overload===true&&testToday.spacingRisk===true,'test day never introduces new vocabulary and remains a spacing warning');

  const card=makeLearnerVocabulary('learner_demo','v_card','sense_card');
  assert(leitnerBox(card)===1,'new vocabulary starts in Leitner box 1');
  card.independentSuccesses=1;card.activeSuccessDays=[today()];card.intervalDays=1;
  let move=updateLeitnerBox(card,true,{active:true,assisted:false,orthographyOk:true,beforeBox:1});
  assert(move.before===1&&move.after===2,'one correct written recall moves exactly one box back');
  move=updateLeitnerBox(card,true,{active:true,assisted:false,orthographyOk:true});
  assert(move.after===2&&move.blockedBySpacing===true,'same-day repetition cannot fake distributed mastery');
  card.independentSuccesses=2;card.activeSuccessDays=[datePlusDays(-1),today()];card.maxActiveGapDays=1;card.intervalDays=3;
  move=updateLeitnerBox(card,true,{active:true,assisted:false,orthographyOk:true});
  assert(move.before===2&&move.after===3,'distributed correct recall unlocks box 3');
  move=updateLeitnerBox(card,false,{active:true,assisted:false,orthographyOk:true});
  assert(move.before===3&&move.after===2,'wrong answer moves exactly one box forward');
  card.leitnerBox=4;card.skills={...defaultSkills(),retrieval:2,spelling:2};card.independentSuccesses=5;card.activeSuccessDays=[datePlusDays(-7),datePlusDays(-3),today()];card.maxActiveGapDays=4;card.coldRecallDays=[datePlusDays(-3),today()];card.intervalDays=7;
  move=updateLeitnerBox(card,true,{active:true,assisted:false,orthographyOk:true});
  assert(move.after===5&&isMastered(card),'box 5 requires the existing sustainable mastery criteria');

  assert(autoChunks('unhelpful').join('|')==='un|help|ful','word chunks prefer meaningful prefix and suffix structure');
  assert(autoChunks('playground').join('|')==='play|ground','word chunks preserve a recognizable compound boundary');
  assert(isSentenceTerm('What can you see?'),'a complete sentence is recognized as a sentence');
  assert(learningChunksFor({term:'What can you see?',chunks:['What','can','you','see?']}).length===0,'complete sentences never enter word-chunk practice');
  assert(learningChunksFor({term:'look after someone',chunks:[]}).join('|')==='look after|someone','short phrases may use meaningful phrase chunks');

  state=defaultState();
  assert(battleTickets('english')===0&&!battleUnlockedToday('english'),'battle action starts locked for the day');
  assert(grantBattleTicket('dailyGoal','english')===false,'without a planned test there is no fortress action to unlock');
  const fortressSet={id:'fortress_set',learnerId:'learner_demo',subject:'english',title:'Fortress Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(2),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(fortressSet);
  const fortressLinked=attachVocabularyToSet(fortressSet.id,{term:'castle',translation:'Burg',source:'fortress-smoke',verified:true});
  rebuildWordIndexes();
  const shortFortress=currentTestFortress('english');
  assert(shortFortress.maxDefense===200&&shortFortress.plannedAttackDays===2,'test in two days creates a two-day fortress');
  fortressSet.testDate=datePlusDays(5);
  const longFortress=currentTestFortress('english');
  assert(longFortress.maxDefense===500&&longFortress.plannedAttackDays===5,'longer test interval creates proportionally stronger fortress defense');
  const fw=fortressLinked.word;fw.skills={recognition:4,listening:4,retrieval:4,spelling:4,context:4};fw.independentSuccesses=8;fw.activeSuccessDays=[datePlusDays(-7),datePlusDays(-3),today()];fw.maxActiveGapDays=4;fw.coldRecallDays=[datePlusDays(-3),today()];fw.intervalDays=7;refreshMastery(fw);
  const hit=testFortressDamage(longFortress,'english','charge');
  assert(hit.bonus>=0&&hit.bonus<=35,'test readiness bonus remains bounded to 35 damage');
  assert(hit.tacticalBonus>=0&&hit.tacticalBonus<=10,'unit-role tactical bonus remains bounded to 10 damage');
  assert(hit.damage===100+hit.bonus+hit.tacticalBonus,'daily damage is transparent base plus readiness plus tactical bonus');
  assert(grantBattleTicket('cards','english')===false&&battleTickets('english')===0,'optional cards cannot unlock the test-fortress action');
  assert(grantBattleTicket('dailyGoal','english')===true&&battleTickets('english')===1,'completed daily goal unlocks exactly one fortress action');
  assert(spendBattleTicket('english')===true&&battleTickets('english')===0,'using the action consumes it for the rest of the day');
  assert(spendBattleTicket('english')===false,'a second same-day attack is blocked');
  const academicBefore=subjectProgress('english').pct,resolved=resolveTestFortressAction('charge','english');
  assert(resolved.damage===hit.damage&&resolved.remaining===longFortress.maxDefense-hit.damage,'daily attack persistently reduces the same test fortress');
  assert(subjectProgress('english').pct===academicBefore,'battle damage never changes academic mastery');

  state=defaultState();
  const allSet={id:'all_words_set',learnerId:'learner_demo',subject:'english',title:'All Words',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(allSet);
  for(let i=1;i<=14;i++)attachVocabularyToSet(allSet.id,{term:'allword'+i,translation:'alle'+i,source:'all-words-smoke',verified:true});
  rebuildWordIndexes();
  assert(buildQueue('adaptive',allSet.id).length<=10,'adaptive practice keeps its deliberately small session size');
  const allQueue=buildQueue('allWords',allSet.id);
  assert(allQueue.length===14&&new Set(allQueue.map(w=>w.setLinkId||w.id)).size===14,'all-vocabulary practice includes the complete selected set exactly once per pass');

  const adaptiveWord=allQueue[0];
  adaptiveWord.skills={...defaultSkills()};adaptiveWord.modesSeen=[];adaptiveWord.independentSuccesses=0;adaptiveWord.recentActiveResults=[];adaptiveWord.repetitions=0;adaptiveWord.lastActiveSuccessAt='';adaptiveWord.dueDate='';
  session={mode:'adaptive',isDaily:false,index:0,scaffoldedWords:{},currentSubmode:null};
  assert(chooseAdaptiveMode(adaptiveWord)==='recognition','a new word gets one light recognition scaffold before productive recall');
  adaptiveWord.modesSeen=['recognition'];session.scaffoldedWords[adaptiveWord.id]=true;
  assert(chooseAdaptiveMode(adaptiveWord)==='recall','a scaffolded word is followed by productive recall in the same session');

  adaptiveWord.independentSuccesses=2;adaptiveWord.repetitions=5;adaptiveWord.recentActiveResults=[false,true,false];adaptiveWord.lastActiveSuccessAt=datePlusDays(-4)+'T12:00:00.000Z';adaptiveWord.dueDate=datePlusDays(-1);session.scaffoldedWords={};
  assert(chooseAdaptiveMode(adaptiveWord)==='recall','an overdue word after a long gap is tested productively before more scaffolding');

  const chunkLinked=attachVocabularyToSet(allSet.id,{term:'unhelpful',translation:'nicht hilfreich',source:'scheduler-smoke',verified:true});
  rebuildWordIndexes();const chunkWord=chunkLinked.word;
  chunkWord.skills={...defaultSkills(),retrieval:2,spelling:0};chunkWord.independentSuccesses=1;chunkWord.repetitions=2;chunkWord.recentActiveResults=[true];chunkWord.errorProfile.spelling=2;chunkWord.modesSeen=['recognition'];
  session={mode:'adaptive',isDaily:false,index:0,scaffoldedWords:{},currentSubmode:null};
  assert(chooseAdaptiveMode(chunkWord)==='chunks','word chunks are triggered by a real spelling error pattern');
  const chunkQueue=buildQueue('chunks',allSet.id);
  assert(chunkQueue.length===1&&chunkQueue[0].term==='unhelpful','manual word-chunk practice contains only spelling-error words');
  session.scaffoldedWords[chunkWord.id]=true;
  assert(chooseAdaptiveMode(chunkWord)==='recall','word-chunk scaffolding returns to productive recall instead of looping');

  allSet.testDate=datePlusDays(1);allSet.testFormat='source';chunkWord.repetitions=3;session={mode:'adaptive',isDaily:true,index:1,scaffoldedWords:{},currentSubmode:null};
  assert(chooseAdaptiveMode(chunkWord)==='reverseRecall','near-test practice follows a configured source-direction test format');
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
