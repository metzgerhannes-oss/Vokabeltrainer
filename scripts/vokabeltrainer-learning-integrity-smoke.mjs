import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/quiz-engine.js','js/learning.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const passed=vm.runInContext(`
(()=>{
  const ok=[];const assert=(v,n)=>{if(!v)throw new Error('Learning integrity smoke failed: '+n);ok.push(n)};
  const legacySupport=defaultState();legacySupport.learners[0].lrsMode=true;delete legacySupport.learners[0].literacySupport;delete legacySupport.learners[0].reducedLoad;
  const migratedSupport=migrate(legacySupport).learners[0],supportProfile=literacySupportFor(migratedSupport);
  assert(supportProfile.reading&&supportProfile.spelling&&supportProfile.reducedLoad,'legacy LRS migrates conservatively to reading, spelling and reduced load');
  const separateSupport=defaultState().learners[0];separateSupport.literacySupport={reading:true,spelling:false};separateSupport.reducedLoad=false;separateSupport.lrsMode=true;normalizeLiteracySupport(separateSupport);
  assert(readingSupportEnabled(separateSupport)&&!spellingSupportEnabled(separateSupport)&&!reducedLoadEnabled(separateSupport),'reading support is independent from spelling and reduced load');
  assert('reading' in defaultSkills(),'reading is tracked as a support skill without entering mastery weights');

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
  s.activity.push({id:'a_direction_legacy',learnerId:'learner_demo',wordId:p.id,date:'2026-09-18T12:00:00.000Z',type:'recall',correct:true,assisted:false,active:true});
  const repaired=migrate(s);
  const rp=repaired.learnerVocabulary[0];
  assert(repaired.spellingLeakRepairVersion===1,'migration marker is written');
  assert(rp.skills.spelling===0,'old spelling credit is reset');
  assert(rp.masteredAt===null,'mastery based on leaked spelling is revoked');
  assert(rp.lastMasteredAt==='2026-09-18T12:00:00.000Z','previous mastery timestamp is retained for history');
  assert(rp.dueDate===today(),'revalidation becomes due immediately');
  assert(!meetsMasteryCriteria(rp),'repaired progress cannot remain mastered');
  assert(repaired.directionalRecallVersion===1,'directional recall migration marker is written');
  assert(rp.directionalRecall.target.lastCorrect===true&&rp.directionalRecall.target.successDays.includes('2026-09-18'),'historical active recall activity backfills exact target-direction evidence');
  assert(rp.directionalRecall.source.successDays.length===0,'migration does not invent a source-direction recall that never occurred');
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
  learner().literacySupport={reading:false,spelling:true};learner().reducedLoad=false;normalizeLiteracySupport(learner());
  const spellingSet={id:'spelling_support_set',learnerId:'learner_demo',subject:'english',title:'Spelling Support',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(spellingSet);
  const spellingWord=attachVocabularyToSet(spellingSet.id,{term:'beautiful',translation:'schön',source:'spelling-support-smoke',verified:true}).word;
  const spellingPlan={date:today(),subject:'english',testFormat:'target',wordRefs:[{wordId:spellingWord.id,setLinkId:spellingWord.setLinkId||''}],introRefs:[],completedKeys:[],todaySecureKeys:[],securityEvidence:{},extraRefs:[],extraSources:{},extraLimit:3};
  const firstSecure=recordDailySecurityResult(spellingWord,{correct:true,active:true,assisted:false,orthographyOk:true,wasTestReady:true,skill:'retrieval'},spellingPlan);
  assert(!firstSecure.becameSecure&&firstSecure.needsSpelling,'spelling support does not declare today-safe without an actual spelling recall');
  const spellingSecure=recordDailySecurityResult(spellingWord,{correct:true,active:true,assisted:false,orthographyOk:true,wasTestReady:true,skill:'spelling'},spellingPlan);
  assert(spellingSecure.becameSecure&&!spellingSecure.needsSpelling,'spelling recall completes today-safe evidence for spelling support');
  session={mode:'adaptive',currentSubmode:'spelling',hintUsed:false,isDaily:false,activeAttemptedWords:{},scaffoldedWords:{},correct:0,answered:0};
  recordResult(spellingWord,true,'spelling',null,{orthographyOk:true});
  assert((spellingWord.spellingSuccessDays||[]).includes(today()),'successful independent spelling recall records a spelling success day');
  const masteryProbe={...spellingWord,skills:{recognition:4,listening:4,retrieval:2,spelling:2,reading:0,context:1},activeSuccessDays:[datePlusDays(-7),datePlusDays(-3),today()],coldRecallDays:[datePlusDays(-3),today()],maxActiveGapDays:4,independentSuccesses:5,intervalDays:7,errorProfile:{}};
  const beforeReading=meetsMasteryCriteria(masteryProbe);masteryProbe.skills.reading=4;
  assert(beforeReading===meetsMasteryCriteria(masteryProbe),'reading support skill does not alter vocabulary mastery criteria');
  session=null;

  state=defaultState();
  const dailyResetSet={id:'daily_release_reset_set',learnerId:'learner_demo',subject:'english',title:'Release Reset',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(1),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(dailyResetSet);
  for(let i=1;i<=3;i++)attachVocabularyToSet(dailyResetSet.id,{term:'release'+i,translation:'Freigabe'+i,source:'daily-release-smoke',verified:true});
  rebuildWordIndexes();
  const legacyDailyPlan=buildDailyPlan(),legacyRefs=dailyPlanRefs(legacyDailyPlan,false);
  assert(legacyRefs.length===3,'daily release regression fixture contains three required words');
  legacyDailyPlan.signature=legacyDailyPlan.signature.replace(/^daily4:/,'0.21.20:');
  legacyDailyPlan.completedKeys=[];
  state.activity.push({id:'daily_release_valid',learnerId:learner().id,date:new Date().toISOString(),type:'recall',wordId:legacyRefs[0].wordId,correct:true,active:true,assisted:false,orthographyOk:true});
  state.activity.push({id:'daily_release_support',learnerId:learner().id,date:new Date().toISOString(),type:'recognition',wordId:legacyRefs[1].wordId,correct:true,active:false,assisted:false,orthographyOk:true});
  state.activity.push({id:'daily_release_wrong',learnerId:learner().id,date:new Date().toISOString(),type:'recall',wordId:legacyRefs[2].wordId,correct:false,active:true,assisted:false,orthographyOk:true});
  const migratedDailyPlan=buildDailyPlan(),migratedDailyStatus=dailyPlanStatus(migratedDailyPlan);
  assert(migratedDailyPlan===legacyDailyPlan&&migratedDailyPlan.signature.startsWith('daily4:'),'app release migrates the existing same-day plan instead of replacing it');
  assert(migratedDailyStatus.done===1&&migratedDailyStatus.remaining===2,'same-day independent correct work is recovered after a release while support and wrong answers stay open');

  state=defaultState();
  const compactSet={id:'daily_compact_migration_set',learnerId:'learner_demo',subject:'english',title:'Compact Migration',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(3),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(compactSet);
  for(let i=1;i<=12;i++)attachVocabularyToSet(compactSet.id,{term:'compact'+i,translation:'kompakt'+i,source:'compact-migration-smoke',verified:true});
  rebuildWordIndexes();
  const compactWords=setWords(compactSet.id),oldRefs=compactWords.map(w=>({wordId:w.id,setLinkId:w.setLinkId||''}));
  const oldSignature='daily1:test:single:'+compactSet.testDate+':'+compactSet.id+':10:'+compactWords.map(w=>w.id).sort().join(',');
  const oldPlan={date:today(),subject:'english',signature:oldSignature,source:'single',testDate:compactSet.testDate,testFormat:'target',setIds:[compactSet.id],setTitle:compactSet.title,wordIds:compactWords.map(w=>w.id),wordRefs:oldRefs,introRefs:[],introCount:0,reviewCount:12,dailyTarget:12,sessionSize:10,completedKeys:[dailyPlanRefKey(oldRefs[0])],todaySecureKeys:[],securityEvidence:{},extraRefs:[],extraSources:{},extraLimit:3,createdAt:new Date().toISOString()};
  learner().dailyPlans={[today()+':english']:oldPlan};
  state.activity.push({id:'compact_done',learnerId:learner().id,date:new Date().toISOString(),type:'recall',wordId:oldRefs[0].wordId,correct:true,active:true,assisted:false,orthographyOk:true});
  compactWords[0].repetitions=1;compactWords[0].activePracticeDays=[today()];
  const compactPlan=buildDailyPlan('english'),compactStatus=dailyPlanStatus(compactPlan);
  assert(compactPlan!==oldPlan&&compactPlan.signature.startsWith('daily4:'),'daily1 policy plan is rebuilt under the short-core schema');
  assert(compactStatus.total<=6&&compactStatus.total>=3&&compactStatus.done===1,'12-word legacy core shrinks into the compact focus window without losing an already completed word');

  state=defaultState();
  const sameDaySet={id:'same_day_spacing_set',learnerId:'learner_demo',subject:'english',title:'Same Day Spacing',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(sameDaySet);
  const sameDayWord=attachVocabularyToSet(sameDaySet.id,{term:'spacing',translation:'Abstand',source:'spacing-smoke',verified:true}).word;
  session={mode:'adaptive',currentSubmode:'recall',hintUsed:false,isDaily:false,activeAttemptedWords:{},scaffoldedWords:{},correct:0,answered:0};
  recordResult(sameDayWord,true,'retrieval',null,{orthographyOk:true});
  assert(sameDayWord.intervalDays===1&&(sameDayWord.activeSuccessDays||[]).length===1,'first independent success creates one spacing day and a one-day interval');
  recordResult(sameDayWord,true,'retrieval',null,{orthographyOk:true});
  assert(sameDayWord.intervalDays===1&&(sameDayWord.activeSuccessDays||[]).length===1&&sameDayWord.independentSuccesses===2,'a second same-day success improves practice evidence but cannot lengthen the spacing interval');

  const nextDayWord=attachVocabularyToSet(sameDaySet.id,{term:'distributed',translation:'verteilt',source:'spacing-smoke',verified:true}).word;
  nextDayWord.independentSuccesses=1;nextDayWord.activeSuccessDays=[datePlusDays(-1)];nextDayWord.activePracticeDays=[datePlusDays(-1)];nextDayWord.lastActiveSuccessAt=datePlusDays(-1)+'T12:00:00.000Z';nextDayWord.intervalDays=1;nextDayWord.recentActiveResults=[true];
  session={mode:'adaptive',currentSubmode:'recall',hintUsed:false,isDaily:false,activeAttemptedWords:{},scaffoldedWords:{[nextDayWord.id]:true},correct:0,answered:0};
  recordResult(nextDayWord,true,'retrieval',null,{orthographyOk:true});
  assert(nextDayWord.intervalDays===3&&(nextDayWord.activeSuccessDays||[]).length===2,'a success on a distinct later day can advance the spacing interval');
  session=null;

  const passiveOnly=makeLearnerVocabulary('learner_demo','v_passive','sense_passive',{skills:{recognition:4,listening:4,retrieval:0,spelling:0,context:0}});
  assert(testReadinessScore(passiveOnly)===0,'recognition and listening support do not raise the readiness percentage on their own');

  const directionWord=makeLearnerVocabulary('learner_demo','v_direction','sense_direction',{
    skills:{recognition:4,listening:4,retrieval:3,spelling:3,context:1},
    independentSuccesses:4,activeSuccessDays:[datePlusDays(-2),today()],coldRecallDays:[today()],maxActiveGapDays:2,intervalDays:3
  });
  assert(!isTestReady(directionWord,'target')&&!isTestReady(directionWord,'source')&&!isTestReady(directionWord,'mixed'),'strong generic skills alone do not prove the configured translation direction');
  recordDirectionalRecallResult(directionWord,{mode:'recall',correct:true,assisted:false});
  assert(isTestReady(directionWord,'target')&&!isTestReady(directionWord,'source')&&!isTestReady(directionWord,'mixed'),'a productive target-direction recall proves target readiness but not source or mixed readiness');
  recordDirectionalRecallResult(directionWord,{mode:'reverseRecall',correct:true,assisted:false});
  assert(isTestReady(directionWord,'source')&&isTestReady(directionWord,'mixed'),'mixed readiness requires successful evidence in both translation directions');
  recordDirectionalRecallResult(directionWord,{mode:'recall',correct:false,assisted:false});
  assert(!isTestReady(directionWord,'target')&&!isTestReady(directionWord,'mixed'),'a later wrong target-direction attempt invalidates current target readiness');
  recordDirectionalRecallResult(directionWord,{mode:'recall',correct:true,assisted:true});
  assert(!isTestReady(directionWord,'target'),'an assisted correct answer cannot restore independent directional readiness');
  recordDirectionalRecallResult(directionWord,{mode:'recall',correct:true,assisted:false});
  assert(isTestReady(directionWord,'target')&&isTestReady(directionWord,'mixed'),'a later independent correct target recall restores direction-specific readiness');
  assert(isTestReady(directionWord,'dictation'),'dictation uses the productive spelling/retrieval base gate without a translation-direction gate');

  state=defaultState();
  const directionSet={id:'direction_record_set',learnerId:'learner_demo',subject:'english',title:'Direction Record',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(directionSet);
  const directionRecorded=attachVocabularyToSet(directionSet.id,{term:'answer',translation:'Antwort',source:'direction-smoke',verified:true}).word;
  session={mode:'adaptive',currentSubmode:'recall',hintUsed:false,isDaily:false,activeAttemptedWords:{},scaffoldedWords:{},correct:0,answered:0};
  recordResult(directionRecorded,true,'retrieval',null,{orthographyOk:true});
  assert(directionRecorded.directionalRecall.target.lastCorrect===true&&directionRecorded.directionalRecall.source.lastCorrect===null,'normal recordResult stores target-direction evidence for recall');
  session.currentSubmode='reverseRecall';
  recordResult(directionRecorded,true,'retrieval',null,{orthographyOk:true});
  assert(directionRecorded.directionalRecall.source.lastCorrect===true,'normal recordResult stores source-direction evidence for reverse recall');
  session=null;

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
  assert(pacedPlan.reviewCount===3&&pacedStatus.total===6,'normal daily core is capped at six distinct focus words');
  const dailyRef=[...(pacedPlan.wordRefs||[]),...(pacedPlan.introRefs||[])][0],dailyWord=dailyRef?.setLinkId?wordByLinkId(dailyRef.setLinkId):wordById(dailyRef?.wordId);
  dailyWord.activePracticeDays=[...new Set([...(dailyWord.activePracticeDays||[]),today()])];
  assert(dailyPlanStatus(pacedPlan).done===0,'optional practice does not complete the fixed daily goal');
  session={mode:'adaptive',currentSubmode:'recall',hintUsed:true,isDaily:true,activeAttemptedWords:{},scaffoldedWords:{},correct:0,answered:0,retryCounts:{},followupCounts:{},dailySecurityFollowups:{}};
  recordResult(dailyWord,true,'retrieval',null,{orthographyOk:true});
  assert(dailyPlanStatus(pacedPlan).done===0,'an assisted correct daily attempt does not complete the required word');
  session.hintUsed=false;
  recordResult(dailyWord,false,'retrieval','retrieval',{orthographyOk:true});
  assert(dailyPlanStatus(pacedPlan).done===0,'a wrong unassisted active daily attempt does not complete the required word');
  recordResult(dailyWord,true,'retrieval',null,{orthographyOk:true});
  assert(dailyPlanStatus(pacedPlan).done===1,'the required word completes only after a correct unassisted active daily recall');
  session=null;
  pacedPlan.todaySecureKeys=[];pacedPlan.securityEvidence={};pacedPlan.extraRefs=[];pacedPlan.extraSources={};
  const fixedTarget=pacedPlan.dailyTarget,fixedTotal=dailyPlanStatus(pacedPlan).total;
  let security=recordDailySecurityResult(dailyWord,{correct:true,active:true,assisted:false,orthographyOk:true,wasTestReady:false},pacedPlan);
  assert(!security.becameSecure&&security.required===2&&security.successStreak===1,'new or weak daily vocabulary needs two independent productive recalls before becoming today-safe');
  security=recordDailySecurityResult(dailyWord,{correct:false,active:true,assisted:false,orthographyOk:true,wasTestReady:false},pacedPlan);
  assert(!security.becameSecure&&security.successStreak===0,'an intervening error resets the today-safe success streak');
  security=recordDailySecurityResult(dailyWord,{correct:true,active:true,assisted:false,orthographyOk:true,wasTestReady:false},pacedPlan);
  assert(!security.becameSecure&&security.successStreak===1,'one correct recall after an error is still insufficient');
  security=recordDailySecurityResult(dailyWord,{correct:true,active:true,assisted:false,orthographyOk:true,wasTestReady:false},pacedPlan);
  assert(security.becameSecure&&security.replacementSource==='new','the second consecutive secure recall refills first with the next unseen test word');
  const refilledStatus=dailyPlanStatus(pacedPlan);
  assert(refilledStatus.total===fixedTotal&&pacedPlan.dailyTarget===fixedTarget&&refilledStatus.extraTotal===1,'adaptive refill never increases the official daily target');
  assert(refilledStatus.secureToday===1&&refilledStatus.extraRemaining===1,'today-safe state and optional refill are tracked separately from completedKeys');

  const knownRef=(pacedPlan.wordRefs||[]).find(r=>dailyPlanRefKey(r)!==dailyPlanRefKey(dailyRef));
  const knownWord=knownRef?.setLinkId?wordByLinkId(knownRef.setLinkId):wordById(knownRef?.wordId);
  const knownSecurity=recordDailySecurityResult(knownWord,{correct:true,active:true,assisted:false,orthographyOk:true,wasTestReady:true},pacedPlan);
  assert(knownSecurity.becameSecure&&knownSecurity.required===1,'already test-ready review vocabulary can become today-safe after one independent active recall');
  for(const ref of (pacedPlan.wordRefs||[])){
    if((pacedPlan.extraRefs||[]).length>=pacedPlan.extraLimit)break;
    const word=ref.setLinkId?wordByLinkId(ref.setLinkId):wordById(ref.wordId);
    if(!word||pacedPlan.todaySecureKeys.includes(dailyPlanRefKey(ref)))continue;
    recordDailySecurityResult(word,{correct:true,active:true,assisted:false,orthographyOk:true,wasTestReady:true},pacedPlan);
  }
  assert(pacedPlan.extraRefs.length===3&&pacedPlan.extraLimit===3,'same-day adaptive refill is capped at three extra words outside reduced-load mode');
  learner().literacySupport={reading:true,spelling:false};learner().reducedLoad=true;normalizeLiteracySupport(learner());pacedPlan.extraLimit=3;normalizeDailyAdaptivePlan(pacedPlan);
  assert(pacedPlan.extraLimit===2&&pacedPlan.extraRefs.length===2,'reduced-load mode caps same-day refill at two extra words even for an existing plan');
  learner().reducedLoad=false;normalizeLiteracySupport(learner());
  const sixNewPlan={...pacedPlan,introCount:6,extraRefs:[],extraSources:{},extraLimit:3,todaySecureKeys:[],securityEvidence:{}};
  const sixNewCandidate=dailyPlanReplacementCandidate(sixNewPlan);
  assert(sixNewCandidate?.source!=='new','adaptive refill never exceeds the six-new-word ceiling outside short-unit mode');

  session={isDaily:true,queue:[quizQueueRef(dailyWord)],index:0,dailySecurityFollowups:{},followupCounts:{}};
  assert(!scheduleDailySecurityFollowup(session,dailyWord)&&session.queue.length===1,'stricter today-safe evidence never silently lengthens the required daily core');
  assert(scheduleScaffoldFollowup(session,dailyWord)&&session.queue.length===2&&!scheduleScaffoldFollowup(session,dailyWord),'a daily scaffold gets exactly one productive followup, not an open-ended chain');
  session=null;

  pacedSet.testDate=datePlusDays(2);learner().dailyPlans={};
  const urgentPlan=buildDailyPlan('english');
  assert(urgentPlan.introCount===3&&urgentPlan.deadlineOverload===true&&urgentPlan.requiredNewPerDay===9,'deadline formula keeps new words inside the short core and flags the impossible pace');
  assert(urgentPlan.dailyTarget===6&&urgentPlan.recommendSecondRound===true,'clear backlog never inflates the required core beyond six focus words and recommends a second short round');
  const urgentUsed=new Set(dailyPlanRefs(urgentPlan,true).map(dailyPlanRefKey));
  const unplannedTestWord=pacedWords.find(w=>!urgentUsed.has(dailyPlanRefKey({wordId:w.id,setLinkId:w.setLinkId||''})));
  assert(!!unplannedTestWord,'near-test fixture leaves at least one test word outside the fixed daily window');
  unplannedTestWord.repetitions=1;unplannedTestWord.activePracticeDays=[datePlusDays(-1)];unplannedTestWord.practiceDays=[datePlusDays(-1)];unplannedTestWord.dueDate=today();
  rebuildWordIndexes();
  const urgentWeak=dailyPlanReplacementCandidate(urgentPlan),urgentWeakWord=urgentWeak?.ref?.setLinkId?wordByLinkId(urgentWeak.ref.setLinkId):wordById(urgentWeak?.ref?.wordId);
  assert(urgentWeak?.source==='weak-test'&&urgentWeakWord&&dailyPlanHasLearningContact(urgentWeakWord),'near a test, adaptive refill does not introduce another unseen word and prioritizes an already-seen weak test word');

  assert(daysUntil(datePlusDays(7))===7,'test date uses exact calendar-day distance without an off-by-one');
  const normalPace=dailyPacePlan(31,0,{days:7},false);
  assert(normalPace.acquisitionDays===6&&normalPace.reviewOnlyDays===1,'seven days to test reserves the final day for review and leaves six acquisition days');
  assert(normalPace.requiredPerDay===6&&normalPace.quota===3&&normalPace.dailyTarget===6&&normalPace.recommendSecondRound,'31 new words with seven days keeps the required core at six focus words and moves overload to an optional second round');
  const missedPace=dailyPacePlan(31,0,{days:6},false);
  assert(missedPace.requiredPerDay===7&&missedPace.quota===3&&missedPace.dailyTarget===6&&missedPace.recommendSecondRound,'missed learning cannot inflate the required core; it triggers a second-round recommendation');
  const aheadPace=dailyPacePlan(21,0,{days:6},false);
  assert(aheadPace.requiredPerDay===5&&aheadPace.quota===3&&aheadPace.dailyTarget===6,'moderate backlog still stays inside the six-word required core');
  const farAhead=dailyPacePlan(6,0,{days:7},false);
  assert(farAhead.requiredPerDay===1&&farAhead.quota===1&&farAhead.dailyTarget===5,'large headroom lowers the normal required core to five focus words');
  const tomorrow=dailyPacePlan(6,0,{days:1},false);
  assert(tomorrow.quota===3&&tomorrow.dailyTarget===6&&tomorrow.spacingRisk===true&&tomorrow.recommendSecondRound===true,'new vocabulary one day before the test stays capped and triggers a distributed-practice warning plus optional second round');
  const testToday=dailyPacePlan(5,0,{days:0},false);
  assert(testToday.quota===0&&testToday.overload===true&&testToday.spacingRisk===true,'test day never introduces new vocabulary and remains a spacing warning');
  const reducedPace=dailyPacePlan(31,0,{days:7},true);
  assert(reducedPace.quota===2&&reducedPace.dailyTarget===4&&reducedPace.coreMax===4&&reducedPace.recommendSecondRound===true,'short-unit mode caps the required core at four focus words with at most two new words');

  pacedSet.testDate=datePlusDays(1);pacedSet.testFormat='target';learner().dailyPlans={};
  const rescueCore=buildDailyPlan('english'),rescueBefore=t1RescuePlan(rescueCore);
  assert(rescueBefore.available&&rescueBefore.refs.length<=6&&rescueBefore.weakTotal>rescueBefore.refs.length,'day-before rescue uses a short prioritized block instead of drilling the full test scope');
  const rescueFirstRef=rescueBefore.refs[0],rescueFirst=rescueFirstRef.setLinkId?wordByLinkId(rescueFirstRef.setLinkId):wordById(rescueFirstRef.wordId),rescueKey=dailyPlanRefKey(rescueFirstRef);
  assert(rescueFirst&&!isTestReady(rescueFirst,'target'),'rescue excludes test-ready vocabulary');
  const coreDoneBefore=rescueCore.completedKeys.length;
  recordT1RescueResult(rescueFirst,{correct:false,active:true,assisted:false,orthographyOk:true},rescueCore);
  const rescueAfterError=t1RescuePlan(rescueCore);
  assert(dailyPlanRefKey(rescueAfterError.refs[0])===rescueKey,'a failed rescue word is first in the next short round');
  recordT1RescueResult(rescueFirst,{correct:true,active:true,assisted:false,orthographyOk:true},rescueCore);
  const rescueAfterCorrection=t1RescuePlan(rescueCore);
  assert(!rescueAfterCorrection.refs.some(r=>dailyPlanRefKey(r)===rescueKey),'a corrected rescue word yields to remaining unseen weak words');
  assert(rescueCore.completedKeys.length===coreDoneBefore,'rescue evidence stays separate from required daily-goal completion');
  assert(adaptiveProductiveMode(rescueFirst,{testFormat:'dictation'})==='spelling','T-1 rescue mirrors dictation with productive spelling');
  assert(adaptiveProductiveMode(rescueFirst,{testFormat:'target'})==='recall','T-1 rescue mirrors target-direction tests with productive recall');

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
  const completedTodaySet={id:'completed_today_set',learnerId:'learner_demo',subject:'english',title:'Test heute',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:today(),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  const nextTestSet={id:'next_test_set',learnerId:'learner_demo',subject:'english',title:'Nächster Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(5),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(completedTodaySet,nextTestSet);
  attachVocabularyToSet(completedTodaySet.id,{term:'todayword',translation:'heute',source:'test-completion-smoke',verified:true});
  attachVocabularyToSet(nextTestSet.id,{term:'nextword',translation:'nächstes',source:'test-completion-smoke',verified:true});
  rebuildWordIndexes();
  const dueContext=upcomingTestContext('english'),dueFortress=currentTestFortress('english');
  assert(dueContext?.date===today()&&dueContext.days===0,'test-day context stays active until explicitly completed');
  const completedRow=completeTestContext(dueContext,'english');
  assert(completedRow?.date===today()&&isTestCompleted(today(),'english'),'test can be explicitly completed from test day onward without a grade');
  assert(dueFortress.testCompletedAt,'test completion is written back to the historical fortress');
  const nextContext=upcomingTestContext('english');
  assert(nextContext?.date===datePlusDays(5),'after completion the next planned test becomes current immediately');
  assert(currentTestFortress('english')?.testDate===datePlusDays(5),'army target switches to the next test after completion');

  state=defaultState();
  const recurringSet={id:'recurring_complete_set',learnerId:'learner_demo',subject:'english',title:'Weekly Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(recurringSet);attachVocabularyToSet(recurringSet.id,{term:'weekly',translation:'wöchentlich',source:'test-completion-smoke',verified:true});rebuildWordIndexes();
  const weekday=localDateFromKey(today()).getDay();
  learner().testSeries.english={enabled:true,weekday,setId:recurringSet.id,scopeDate:today(),scopeMode:'set',from:1,to:0,selectedLinkIds:[],testFormat:'target'};
  const weeklyContext=upcomingTestContext('english');
  assert(weeklyContext?.date===today()&&weeklyContext.source==='series','prepared recurring test remains the active test on its test day');
  completeTestContext(weeklyContext,'english');
  const weeklyPending=seriesScopePending('english');
  assert(weeklyPending?.date===datePlusDays(7),'completing a recurring test advances directly to preparation for the next weekly occurrence');


  state=defaultState();
  const exactScopeSet={id:'exact_scope_set',learnerId:'learner_demo',subject:'english',title:'Exact Scope',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:today(),testScopeMode:'selected',testFrom:1,testTo:0,testFormat:'target',testSelectedLinkIds:[],from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(exactScopeSet);
  for(let i=1;i<=6;i++)attachVocabularyToSet(exactScopeSet.id,{term:'exact'+i,translation:'genau'+i,source:'exact-scope-smoke',verified:true});
  rebuildWordIndexes();
  const exactScopeWords=setWords(exactScopeSet.id);
  exactScopeSet.testSelectedLinkIds=exactScopeWords.slice(0,2).map(w=>w.setLinkId);
  learner().testSeries.english={enabled:true,weekday:localDateFromKey(today()).getDay(),setId:exactScopeSet.id,scopeDate:today(),scopeMode:'selected',from:1,to:6,selectedLinkIds:exactScopeWords.map(w=>w.setLinkId),testFormat:'target'};
  const exactScopeContext=upcomingTestContext('english');
  assert(exactScopeContext?.source==='single'&&exactScopeContext.words.length===2,'an explicit test scope wins over a same-day weekly series instead of merging old and new vocabulary');
  assert(exactScopeContext.words.every(w=>exactScopeSet.testSelectedLinkIds.includes(w.setLinkId)),'same-day series overlap cannot add words outside the explicitly selected test scope');

  state=defaultState();
  const oldMaintenanceSet={id:'old_maintenance_set',learnerId:'learner_demo',subject:'english',title:'Alter Stoff',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  const currentScopeSet={id:'current_scope_set',learnerId:'learner_demo',subject:'english',title:'Aktueller Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(5),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(oldMaintenanceSet,currentScopeSet);
  const oldMaintenanceWord=attachVocabularyToSet(oldMaintenanceSet.id,{term:'yesterday',translation:'gestern',source:'scope-maintenance-smoke',verified:true}).word;
  attachVocabularyToSet(currentScopeSet.id,{term:'todayone',translation:'heute eins',source:'scope-maintenance-smoke',verified:true});
  attachVocabularyToSet(currentScopeSet.id,{term:'todaytwo',translation:'heute zwei',source:'scope-maintenance-smoke',verified:true});
  rebuildWordIndexes();
  oldMaintenanceWord.repetitions=2;oldMaintenanceWord.activePracticeDays=[datePlusDays(-2)];oldMaintenanceWord.dueDate=today();
  const currentScopePlan=buildDailyPlan('english'),currentScopeStatus=dailyPlanStatus(currentScopePlan),currentScopeRefs=dailyPlanRefs(currentScopePlan,false);
  assert(currentScopePlan.maintenanceCount===0,'a concrete test plan never backfills its mandatory block with due vocabulary from older tests');
  assert(currentScopeStatus.total===1&&currentScopeStatus.total<currentScopePlan.dailyTarget,'the mandatory block may stay smaller than the nominal target instead of adding unrelated old vocabulary');
  assert(currentScopeRefs.every(ref=>(ref.setLinkId?wordByLinkId(ref.setLinkId):wordById(ref.wordId))?.setId===currentScopeSet.id),'every mandatory daily word stays inside the active test scope');
  assert(!currentScopeRefs.some(ref=>ref.wordId===oldMaintenanceWord.id),'old due vocabulary remains outside the mandatory current-test block');
  const currentScopeReplacement=dailyPlanReplacementCandidate(currentScopePlan);
  assert(!currentScopeReplacement||((currentScopeReplacement.ref.setLinkId?wordByLinkId(currentScopeReplacement.ref.setLinkId):wordById(currentScopeReplacement.ref.wordId))?.setId===currentScopeSet.id),'adaptive replacements stay inside the active test scope');
  assert(currentScopeReplacement?.ref?.wordId!==oldMaintenanceWord.id,'old due vocabulary cannot re-enter through adaptive replacement');

  state=defaultState();
  const finishedSet={id:'finished_test_set',learnerId:'learner_demo',subject:'english',title:'Abgeschlossener Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:today(),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(finishedSet);
  const finishedWord=attachVocabularyToSet(finishedSet.id,{term:'finishedold',translation:'alt abgeschlossen',source:'post-test-idle-smoke',verified:true}).word;
  rebuildWordIndexes();
  finishedWord.repetitions=3;finishedWord.activePracticeDays=[datePlusDays(-2)];finishedWord.dueDate=today();
  const finishedCtx=upcomingTestContext('english');
  assert(finishedCtx?.date===today()&&finishedCtx.words.some(w=>w.id===finishedWord.id),'post-test regression fixture exposes the due test vocabulary before completion');
  assert(!!completeTestContext(finishedCtx,'english'),'the written test can be completed in the regression fixture');
  assert(!upcomingTestContext('english'),'after completion no stale current test context remains');
  const postTestPlan=buildDailyPlan('english'),postTestStatus=dailyPlanStatus(postTestPlan),postTestRefs=dailyPlanRefs(postTestPlan,false);
  assert(postTestStatus.total===0,'after a completed test there is no mandatory fallback to the old annual vocabulary pool');
  assert(!postTestRefs.some(ref=>ref.wordId===finishedWord.id),'completed-test vocabulary stays out of mandatory learning until the next test is planned');
  assert(mandatoryDueWords('english').length===0,'completed-test vocabulary no longer contributes to the mandatory due counter');
  assert(dailyPlanReplacementCandidate(postTestPlan)===null,'after a completed test with no next test there is no adaptive mandatory replacement');

  const nextSet={id:'next_test_set',learnerId:'learner_demo',subject:'english',title:'Nächster Test',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(6),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(nextSet);
  const nextWord=attachVocabularyToSet(nextSet.id,{term:'nextnew',translation:'neu danach',source:'post-test-next-smoke',verified:true}).word;
  rebuildWordIndexes();
  const nextPlan=buildDailyPlan('english'),nextRefs=dailyPlanRefs(nextPlan,false);
  assert(upcomingTestContext('english')?.sets?.some(set=>set.id===nextSet.id),'planning the next test immediately activates its scope');
  assert(nextRefs.every(ref=>ref.wordId===nextWord.id),'after completion the mandatory path switches only to the next planned test vocabulary');
  assert(!nextRefs.some(ref=>ref.wordId===finishedWord.id),'the previous test vocabulary does not leak into the next mandatory plan');
  const nextReplacement=dailyPlanReplacementCandidate(nextPlan);
  assert(!nextReplacement||((nextReplacement.ref.setLinkId?wordByLinkId(nextReplacement.ref.setLinkId):wordById(nextReplacement.ref.wordId))?.setId===nextSet.id),'adaptive replacements for the next test remain inside its exact vocabulary scope');
  assert(nextReplacement?.ref?.wordId!==finishedWord.id,'completed-test vocabulary cannot return as an adaptive extra in the next test cycle');

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
if(learning.includes('appendDailyReplacementToSession'))throw new Error('Learning integrity smoke failed: optional refill must not be forced into the running required session');

console.log('Vokabeltrainer learning integrity smoke: '+(passed.length+3)+' checks passed');
for(const name of passed)console.log('✓ '+name);
console.log('✓ spelling prompt does not reveal the answer');
console.log('✓ spelling answer field remains accessible');
console.log('✓ optional refill does not extend the running required session automatically');
