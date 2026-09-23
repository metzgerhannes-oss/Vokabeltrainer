'use strict';

function learner(){ return state.learners.find(x=>x.id===state.activeLearnerId)||state.learners[0]; }
function gradeScaleFor(subject=state.activeSubject){const l=learner();l.gradeScales=l.gradeScales||defaultGradeScales();l.gradeScales[subject]={...defaultGradeScale(),...(l.gradeScales[subject]||{})};return l.gradeScales[subject];}
function suggestGradeFromScale(percent,scale){const s={...defaultGradeScale(),...(scale||{})};const p=Number(percent)||0;if(p>=s.n1)return '1';if(p>=s.n2)return '2';if(p>=s.n3)return '3';if(p>=s.n4)return '4';if(p>=s.n5)return '5';return '6';}
function gradeScaleText(scale=gradeScaleFor()){return `1 ab ${scale.n1}% · 2 ab ${scale.n2}% · 3 ab ${scale.n3}% · 4 ab ${scale.n4}% · 5 ab ${scale.n5}% · darunter 6`;}
function actualGradeForPractice(practiceId){return state.grades.find(g=>g.learnerId===state.activeLearnerId&&g.practiceTestId===practiceId)||null;}
function mySets(subject=state.activeSubject){ return state.sets.filter(s=>s.learnerId===state.activeLearnerId && s.subject===subject); }
function setNeedsPairReview(set){return !!set&&(set.pairReviewRequired===true||pairReviewSignatureMismatch(set))}
function firstContactStatus(setId){
  const links=(state?.setVocabulary||[]).filter(x=>x.setId===setId),total=links.length;
  const copied=links.filter(x=>x.firstContactCopiedAt).length,recalled=links.filter(x=>x.firstContactRecalledAt).length,proved=links.filter(x=>x.firstContactProvedAt).length,completed=links.filter(x=>x.firstContactCompletedAt).length;
  return {total,copied,recalled,proved,completed,pending:Math.max(0,total-completed),pct:total?Math.round(completed/total*100):0};
}
function vocabularyPairSignature(v){
  if(!v)return '';
  return JSON.stringify({term:String(v.term||''),termVariants:[...(v.termVariants||[])],senses:(v.senses||[]).map(s=>({id:String(s.id||''),translation:String(s.translation||''),translations:[...(s.translations||[])]}))});
}
function requirePairReviewForVocabulary(vocabId){
  const links=(state.setVocabulary||[]).filter(x=>x.vocabId===vocabId),setIds=new Set(links.map(x=>x.setId));let changed=0;
  for(const link of links){link.firstContactCopiedAt='';link.firstContactRecalledAt='';link.firstContactCompletedAt='';link.firstContactProvedAt='';}
  for(const set of (state.sets||[])){if(!setIds.has(set.id))continue;if(!set.pairReviewRequired||set.pairVerifiedAt||set.pairVerifiedSignature)changed++;set.pairReviewRequired=true;set.pairVerifiedAt='';set.pairVerifiedSignature='';}
  for(const row of (state.bookVocabulary||[])){if(row.vocabId!==vocabId)continue;row.verifiedAt='';}
  return changed;
}
function learningReadySets(subject=state.activeSubject){return mySets(subject).filter(s=>!setNeedsPairReview(s)&&setWords(s.id).length)}
function schoolYearSets(subject=state.activeSubject,schoolYear=currentSchoolYear()){ return mySets(subject).filter(s=>s.schoolYear===schoolYear); }
function myWords(subject=state.activeSubject){const ids=new Set(mySets(subject).filter(s=>!setNeedsPairReview(s)).map(s=>s.id));return uniqueWords(state.words.filter(w=>ids.has(w.setId)));}
function schoolYearVerifiedWords(subject=state.activeSubject,schoolYear=currentSchoolYear()){const ids=new Set(schoolYearSets(subject,schoolYear).filter(s=>!setNeedsPairReview(s)).map(s=>s.id));return uniqueWords(state.words.filter(w=>ids.has(w.setId)));}
function schoolYearWords(subject=state.activeSubject,schoolYear=currentSchoolYear()){return schoolYearVerifiedWords(subject,schoolYear);}
function setWords(setId){return (state.setVocabulary||[]).filter(x=>x.setId===setId).sort((a,b)=>(a.position||0)-(b.position||0)).map(x=>wordViewForLink(x)).filter(Boolean);}
function fortressWins(subject=state.activeSubject,schoolYear=currentSchoolYear()){const l=learner(),key=`${subject}:${schoolYear}`;l.fortressWinsByYear=l.fortressWinsByYear||{};return l.fortressWinsByYear[key]||(l.fortressWinsByYear[key]=[]);}

function battleDayKey(subject=state.activeSubject){return `${today()}:${subject}`}
function battleDayState(subject=state.activeSubject,create=true){
  const l=learner();if(!l)return null;
  if(!l.battleDays||typeof l.battleDays!=='object'||Array.isArray(l.battleDays))l.battleDays={};
  const key=battleDayKey(subject);
  if(!l.battleDays[key]&&create)l.battleDays[key]={date:today(),subject,unlocked:false,rewardClaimed:false,attempts:0,wins:0};
  return l.battleDays[key]||null;
}
function battleUnlockedToday(subject=state.activeSubject){return !!battleDayState(subject,false)?.unlocked}
function unlockBattleToday(reason='dailyGoal',subject=state.activeSubject){
  const l=learner(),fortress=currentTestFortress(subject),day=battleDayState(subject,true);if(!l||!fortress||!day||day.unlocked)return false;
  day.unlocked=true;day.unlockedAt=new Date().toISOString();day.reason=reason;day.fortressKey=fortress.key;day.actionUsed=!!day.actionUsed;
  const cutoff=datePlusDays(-21);Object.keys(l.battleDays||{}).filter(k=>k.slice(0,10)<cutoff).forEach(k=>delete l.battleDays[k]);
  recordActivity('battleUnlock',{subject,reason,date:today()});return true;
}
function battleRewardAvailableToday(subject=state.activeSubject){return battleActionAvailableToday(subject)}
function claimBattleRewardToday(subject=state.activeSubject){
  const day=battleDayState(subject,false);if(!day?.unlocked||day.rewardClaimed)return false;
  day.rewardClaimed=true;day.rewardClaimedAt=new Date().toISOString();return true;
}
function registerBattleAttempt(result,subject=state.activeSubject,rewarded=false){
  const day=battleDayState(subject,false);if(!day?.unlocked)return false;
  day.attempts=(Number(day.attempts)||0)+1;if(result==='win')day.wins=(Number(day.wins)||0)+1;
  day.lastAttemptAt=new Date().toISOString();day.lastResult=result;day.lastRewarded=!!rewarded;return true;
}
function battleActionAvailableToday(subject=state.activeSubject){const day=battleDayState(subject,false);return !!(day?.unlocked&&!day.actionUsed)}
function battleTickets(subject=state.activeSubject){return battleActionAvailableToday(subject)?1:0}
function grantBattleTicket(reason='lesson',subject=state.activeSubject){return reason==='dailyGoal'?unlockBattleToday(reason,subject):false}
function spendBattleTicket(subject=state.activeSubject){const day=battleDayState(subject,false);if(!day?.unlocked||day.actionUsed)return false;day.actionUsed=true;day.actionUsedAt=new Date().toISOString();return true}

function semanticNormalize(s){return String(s||'').trim().toLowerCase().normalize('NFKC').replace(/[’‘`´]/g,"'").replace(/[….,;:!?()[\]{}"']/g,'').replace(/\s+/g,' ')}
function normalize(s){return semanticNormalize(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function orthographyNormalize(value){
  return String(value||'').normalize('NFKC').toLowerCase().replace(/[’‘`´]/g,"'").trim().replace(/\s+/g,' ');
}
function hasEllipsisPlaceholder(value){return /…|\.{2,}/.test(String(value||''))}
function orthographyNormalizeForTarget(value,target){
  let out=orthographyNormalize(value);
  if(hasEllipsisPlaceholder(target)){
    out=out.replace(/\s*(?:…|\.{2,})\s*/g,' ').replace(/\s+([?!])/g,'$1').replace(/\s+/g,' ').trim();
  }
  return out;
}
function spellingMatches(answer,target){
  if(typeof quizOrthographyMatches==='function')return quizOrthographyMatches(answer,target);
  const targets=[...(Array.isArray(target)?target:[target])].map(x=>String(x||'').trim()).filter(Boolean);
  if(!String(answer||'').trim())return false;
  return targets.some(t=>orthographyNormalizeForTarget(answer,t)===orthographyNormalizeForTarget(t,t));
}
function answerMatches(answer,target){
  if(typeof quizSemanticMatches==='function')return quizSemanticMatches(answer,target);
  const a=semanticNormalize(answer),targets=[...(Array.isArray(target)?target:[target])].map(x=>String(x||'').trim()).filter(Boolean);if(!a)return false;
  return targets.some(t=>a===semanticNormalize(t));
}
function termTargets(w){return [...new Set((w?.acceptedTerms?.length?w.acceptedTerms:[w?.term]).filter(Boolean))]}
function translationTargets(w){return [...new Set((w?.acceptedTranslations?.length?w.acceptedTranslations:[w?.translation]).filter(Boolean))]}
function levenshtein(a,b){a=normalize(a);b=normalize(b);const dp=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)dp[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return dp[a.length][b.length]}
function detectConfusions(word, pool){
  const scored=pool.filter(x=>x.id!==word.id).map(x=>({w:x,d:levenshtein(word.term,x.term)})).filter(x=>x.d<=Math.max(2,Math.floor(word.term.length*.34))).sort((a,b)=>a.d-b.d).slice(0,2);
  return scored.map(x=>x.w);
}
function termTokens(term){return String(term||'').trim().split(/\s+/).filter(Boolean)}
function isSentenceTerm(term){
  const t=String(term||'').trim(),words=termTokens(t);
  return words.length>=4||(words.length>=2&&/[.!?](?:["'”’])?$/.test(t));
}
function phraseLearningChunks(term){
  const words=termTokens(term);if(words.length<2||words.length>3)return [];
  if(words.length===2)return words;
  const particles=new Set(['after','away','back','down','for','from','in','into','of','off','on','out','over','to','up','with']);
  if(particles.has(words[1].toLowerCase()))return [words.slice(0,2).join(' '),words[2]];
  if(particles.has(words[2].toLowerCase()))return [words[0],words.slice(1).join(' ')];
  return [words[0],words.slice(1).join(' ')];
}
function balancedOrthographicChunks(word){
  const w=String(word||'');if(w.length<6)return [w];
  const lower=w.toLowerCase(),mid=w.length/2,protectedPatterns=['tion','sion','ough','eigh','igh','tch','dge','sh','ch','th','ph','qu','ee','ea','eo','oo','ou','ow','ai','ay','oa','oi','oy'];
  const splitInsideProtected=i=>protectedPatterns.some(p=>{let at=lower.indexOf(p);while(at>=0){if(i>at&&i<at+p.length)return true;at=lower.indexOf(p,at+1)}return false});
  const candidates=[];for(let i=2;i<=w.length-2;i++){const penalty=splitInsideProtected(i)?20:0;candidates.push({i,score:Math.abs(i-mid)+penalty})}
  candidates.sort((a,b)=>a.score-b.score||a.i-b.i);const cut=candidates[0]?.i||Math.floor(mid);
  return [w.slice(0,cut),w.slice(cut)].filter(Boolean);
}
function autoChunks(term){
  const t=String(term||'').trim();if(!t||isSentenceTerm(t))return [];
  const words=termTokens(t);if(words.length>1)return phraseLearningChunks(t);
  const prefixes=['under','inter','over','trans','super','mis','dis','pre','sub','non','un','re'];
  const suffixes=['ation','ition','tion','sion','ment','ness','less','fully','ful','able','ible','ous','ingly','ing','edly','ed','ly'];
  const compoundTails=['ground','room','house','work','book','ball','way','place','time','school','board','friend','thing','man','woman','day','light'];
  let rest=t,out=[];
  const pre=prefixes.find(x=>rest.toLowerCase().startsWith(x)&&rest.length>=x.length+4);if(pre){out.push(rest.slice(0,pre.length));rest=rest.slice(pre.length)}
  const tail=compoundTails.find(x=>rest.toLowerCase().endsWith(x)&&rest.length>=x.length+3);if(tail){out.push(rest.slice(0,-tail.length),rest.slice(-tail.length));return out.filter(Boolean)}
  const suf=suffixes.find(x=>rest.toLowerCase().endsWith(x)&&rest.length>=x.length+3);
  let suffix='';if(suf){suffix=rest.slice(-suf.length);rest=rest.slice(0,-suf.length)}
  const core=balancedOrthographicChunks(rest);out.push(...core);if(suffix)out.push(suffix);
  return out.filter(Boolean);
}
function learningChunksFor(w,term=w?.term){
  const t=String(term||'').trim();if(!t||isSentenceTerm(t))return [];
  const custom=Array.isArray(w?.chunks)?w.chunks.map(x=>String(x||'').trim()).filter(Boolean):[];
  return custom.length>1?custom:autoChunks(t);
}
function chunkEligibleWord(w,term=w?.term){return learningChunksFor(w,term).length>1}

function masteryScore(w){
  const s={...defaultSkills(),...(w.skills||{})};
  const skillCore=(s.retrieval*.35)+(s.spelling*.30)+(s.context*.15)+(s.recognition*.10)+(s.listening*.10);
  const activeDays=Math.min(4,(w.activeSuccessDays||[]).length);
  const delayed=w.maxActiveGapDays>=7?4:w.maxActiveGapDays>=3?3:w.maxActiveGapDays>=1?2:0;
  return (skillCore*.68)+(activeDays*.20)+(delayed*.12);
}
function meetsMasteryCriteria(w){
  const s={...defaultSkills(),...(w.skills||{})};
  const activeDays=(w.activeSuccessDays||[]).length;
  const contextOk=(w.errorProfile?.context||0)<2 || s.context>=1;
  return s.retrieval>=2 && s.spelling>=2 && contextOk && activeDays>=3 && (w.maxActiveGapDays||0)>=3 && (w.coldRecallDays||[]).length>=2 && (w.independentSuccesses||0)>=5 && w.intervalDays>=7;
}
function isMastered(w){ return meetsMasteryCriteria(w); }
function inferredLeitnerBox(w){
  if(isMastered(w))return 5;
  const days=(w.activeSuccessDays||[]).length,independent=Number(w.independentSuccesses)||0,interval=Number(w.intervalDays)||0,gap=Number(w.maxActiveGapDays)||0;
  if(days>=3&&independent>=4&&gap>=3&&interval>=7)return 4;
  if(days>=2&&independent>=2&&gap>=1&&interval>=3)return 3;
  if(independent>=1)return 2;
  return 1;
}
function leitnerBox(w){
  const stored=Math.round(Number(w?.leitnerBox)||0);
  return stored>=1&&stored<=5?stored:inferredLeitnerBox(w);
}
function leitnerMaxBox(w){return inferredLeitnerBox(w)}
function leitnerLabel(box){
  return ({1:'Neu',2:'Im Lernen',3:'Bekannt',4:'Sicher',5:'Nachhaltig gemeistert'})[clamp(Math.round(Number(box)||1),1,5)]||'Neu';
}
function updateLeitnerBox(w,ok,{assisted=false,active=true,orthographyOk=true,beforeBox=null}={}){
  const supplied=Math.round(Number(beforeBox)||0),before=supplied>=1&&supplied<=5?supplied:leitnerBox(w);let after=before,blockedBySpacing=false;
  if(!active)return {before,after,moved:false,blockedBySpacing:false};
  if(!ok)after=Math.max(1,before-1);
  else if(!assisted&&orthographyOk){
    const wanted=Math.min(5,before+1),allowed=leitnerMaxBox(w);after=Math.min(wanted,allowed);blockedBySpacing=after<wanted;
  }
  w.leitnerBox=after;w.leitnerUpdatedAt=new Date().toISOString();
  return {before,after,moved:after!==before,blockedBySpacing};
}
function leitnerDistribution(words=schoolYearVerifiedWords()){
  const counts={1:0,2:0,3:0,4:0,5:0};
  for(const w of words)counts[leitnerBox(w)]++;
  return counts;
}
function refreshMastery(w){
  const mastered=meetsMasteryCriteria(w);
  if(mastered && !w.masteredAt)w.masteredAt=new Date().toISOString();
  if(!mastered && w.masteredAt){w.lastMasteredAt=w.masteredAt;w.masteredAt=null;}
  w.level=mastered?4:Math.min(3,Math.max(0,Math.floor(masteryScore(w))));
}
function subjectProgress(subject=state.activeSubject,schoolYear=currentSchoolYear()){
  const words=schoolYearVerifiedWords(subject,schoolYear); const mastered=words.filter(isMastered).length; const stable=words.filter(w=>w.intervalDays>=7 && (w.independentSuccesses||0)>w.failures).length;
  return {schoolYear,total:words.length,mastered,stable,pct:words.length?Math.round(mastered/words.length*100):0};
}
function dueWords(subject=state.activeSubject,schoolYear=currentSchoolYear()){return schoolYearWords(subject,schoolYear).filter(w=>!w.dueDate||w.dueDate<=today()).sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));}
function armyStrength(subject=state.activeSubject,schoolYear=currentSchoolYear()){
  const p=subjectProgress(subject,schoolYear); const words=schoolYearVerifiedWords(subject,schoolYear);
  const avg=words.length?words.reduce((s,w)=>s+masteryScore(w),0)/(words.length*4):0;
  return Math.round(p.pct*10 + avg*100);
}
const fortresses=[
  {id:'outpost',name:'Vorposten',subtitle:'Holzpalisaden'},
  {id:'tower',name:'Wachturm',subtitle:'Steinerner Turm'},
  {id:'wall',name:'Grenzfestung',subtitle:'Doppelte Mauer'},
  {id:'citadel',name:'Zitadelle',subtitle:'Bergzitadelle'},
  {id:'capital',name:'Hauptfestung',subtitle:'Königsburg'},
  {id:'final',name:'Große Festung',subtitle:'Goldene Festung'}
];
function testFortressHash(value){
  let h=2166136261;for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36);
}
function testFortressKey(ctx,subject=state.activeSubject){
  if(!ctx?.date)return '';
  const setIds=(ctx.sets||[]).map(s=>s.id).sort().join(',');
  const words=(ctx.words||[]).map(w=>w.id).sort().join(',');
  return `${subject}:${ctx.date}:${testFortressHash(setIds+'|'+words)}`;
}
function fortressArchetypeFor(ctx,plannedDays){
  const score=Math.max(1,Number(plannedDays)||1)+Math.ceil((ctx?.words?.length||0)/15);
  const index=score<=3?0:score<=5?1:score<=7?2:score<=9?3:score<=12?4:5;
  return fortresses[index];
}
function testFortressHistory(subject=state.activeSubject){
  const l=learner();l.testFortresses=l.testFortresses&&typeof l.testFortresses==='object'?l.testFortresses:{};
  return Object.values(l.testFortresses).filter(f=>f?.subject===subject).sort((a,b)=>String(a.testDate||'').localeCompare(String(b.testDate||'')));
}
function currentTestFortress(subject=state.activeSubject){
  const ctx=upcomingTestContext(subject);if(!ctx?.words?.length)return null;
  const l=learner();l.testFortresses=l.testFortresses&&typeof l.testFortresses==='object'?l.testFortresses:{};
  const key=testFortressKey(ctx,subject);let f=l.testFortresses[key];
  if(!f){
    const plannedAttackDays=clamp(Math.max(1,Number(ctx.days)||1),1,14),archetype=fortressArchetypeFor(ctx,plannedAttackDays),maxDefense=plannedAttackDays*100;
    f={
      key,id:archetype.id,name:archetype.name,subtitle:archetype.subtitle,subject,testDate:ctx.date,
      scopeText:ctx.scopeText||ctx.sets.map(s=>s.title).join(' + '),setIds:ctx.sets.map(s=>s.id),wordCount:ctx.words.length,
      plannedAttackDays,maxDefense,defense:maxDefense,createdDate:today(),createdAt:new Date().toISOString(),
      capturedAt:'',securedDates:[],attacks:[]
    };
    l.testFortresses[key]=f;if(typeof persistOnly==='function')persistOnly();
  }
  return f;
}
function nextFortress(subject=state.activeSubject){return currentTestFortress(subject)}
function testFortressDamage(f=currentTestFortress(),subject=state.activeSubject){
  if(!f)return {damage:0,readiness:0,bonus:0};
  const ctx=upcomingTestContext(subject),readiness=ctx?testReadinessForContext(ctx).avg:0,bonus=Math.round(clamp(readiness,0,100)*.35);
  return {damage:100+bonus,readiness,bonus};
}
function testFortressGrade(f=currentTestFortress()){
  if(!f)return null;return (state.grades||[]).find(g=>g.learnerId===state.activeLearnerId&&g.subject===f.subject&&g.date===f.testDate)||null;
}
function resolveTestFortressAction(attack='charge',subject=state.activeSubject){
  const f=currentTestFortress(subject);if(!f)return null;
  const l=learner(),p=subjectProgress(subject),stamp=new Date().toISOString();
  f.securedDates=Array.isArray(f.securedDates)?f.securedDates:[];f.attacks=Array.isArray(f.attacks)?f.attacks:[];
  if(f.capturedAt){
    if(!f.securedDates.includes(today()))f.securedDates.push(today());
    const entry={date:stamp,subject,schoolYear:p.schoolYear,fortress:f.id,fortressKey:f.key,fortressName:f.name,testDate:f.testDate,result:'secure',progress:p.pct,attack,damage:0,defenseAfter:0,maxDefense:f.maxDefense,readiness:testFortressDamage(f,subject).readiness};
    l.campaignLog.push(entry);recordActivity('fortressSecure',{fortress:f.id,fortressKey:f.key,testDate:f.testDate,attack});return {entry,fortress:f,result:'secure',damage:0,remaining:0};
  }
  const hit=testFortressDamage(f,subject),before=Math.max(0,Number(f.defense)||0),after=Math.max(0,before-hit.damage),won=after===0;
  f.defense=after;f.attacks.push({date:stamp,day:today(),damage:hit.damage,readiness:hit.readiness,attack,defenseBefore:before,defenseAfter:after});
  if(won&&!f.capturedAt){f.capturedAt=stamp;l.xp+=20}
  const entry={date:stamp,subject,schoolYear:p.schoolYear,fortress:f.id,fortressKey:f.key,fortressName:f.name,testDate:f.testDate,result:won?'win':'damage',progress:p.pct,attack,damage:hit.damage,defenseAfter:after,maxDefense:f.maxDefense,readiness:hit.readiness};
  l.campaignLog.push(entry);recordActivity('fortress',{fortress:f.id,fortressKey:f.key,testDate:f.testDate,result:entry.result,damage:hit.damage,defenseAfter:after,attack});
  return {entry,fortress:f,result:entry.result,damage:hit.damage,remaining:after,readiness:hit.readiness};
}
function rankFor(pct,subject=state.activeSubject){
  const arr=subjectCampaign(subject).ranks||SUBJECT_META.english.campaign.ranks;const i=Math.min(arr.length-1,Math.floor(pct/20));return arr[i];
}
function gearTier(pct){return Math.min(6,1+Math.floor(clamp(Number(pct)||0,0,100)/18))}
function gearFor(pct){return ['I','II','III','IV','V','VI'][gearTier(pct)-1]}
function gearLabelFor(pct,subject=state.activeSubject){
  const tier=gearTier(pct);
  const english=['Grundausrüstung','Verstärkte Schilde','Bogenschützen-Set','Belagerungsausrüstung','Reiter-Ausrüstung','Eliteausrüstung'];
  const latin=['Scutum & Pilum','Verstärktes Scutum','Sagittarii','Belagerungsgerät','Equites','Praetorianer-Ausrüstung'];
  return (subject==='latin'?latin:english)[tier-1];
}
function soldiersFor(pct){return clamp(2+Math.floor(pct/9),2,13)}

const streakActivityTypes=new Set(['adaptive','recognition','recall','spelling','listening','context','chunks','flash','shower','latinGrammar','handwriting','cards','firstContact','practiceTest']);
function recordActivity(type,meta={}){ const l=learner(); if(streakActivityTypes.has(type)&&!l.streakDays.includes(today())) l.streakDays.push(today()); state.activity.push({id:uid('a'),learnerId:l.id,date:new Date().toISOString(),type,...meta}); }
function streak(){
  const days=new Set(learner().streakDays); let n=0,d=new Date(); d.setHours(12,0,0,0); for(;;){const k=dateKey(d); if(days.has(k)){n++;d.setDate(d.getDate()-1)}else break} return n;
}

function seasonInfo(){const m=new Date().getMonth()+1; if([12,1,2].includes(m))return {class:'winter',festive:m===12}; if([3,4,5].includes(m))return {class:'spring'}; if([9,10,11].includes(m))return {class:'autumn'}; return {class:'summer'}}
function dayNumber(key){const [y,m,d]=String(key||'').split('-').map(Number);return y&&m&&d?Math.floor(Date.UTC(y,m-1,d)/864e5):NaN}
function daysUntil(key){const n=dayNumber(key),t=dayNumber(today());return Number.isFinite(n)&&Number.isFinite(t)?n-t:null}
function formatDateShort(key){const [y,m,d]=String(key||'').split('-').map(Number);if(!y||!m||!d)return '';return new Date(y,m-1,d).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit'})}
const WEEKDAYS=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const WEEKDAYS_SHORT=['So','Mo','Di','Mi','Do','Fr','Sa'];
function localDateFromKey(key){const [y,m,d]=String(key||'').split('-').map(Number);if(!y||!m||!d)return null;const out=new Date(y,m-1,d,12,0,0,0);return Number.isNaN(out.getTime())?null:out}
function nextWeeklyDate(weekday,fromKey=today()){const base=localDateFromKey(fromKey)||new Date();const wanted=clamp(Number(weekday)||0,0,6);const delta=(wanted-base.getDay()+7)%7;base.setDate(base.getDate()+delta);return dateKey(base)}
function activeSeries(subject=state.activeSubject){const cfg=learner()?.testSeries?.[subject];return cfg&&cfg.enabled?cfg:null}
function seriesScopePending(subject=state.activeSubject){const cfg=activeSeries(subject);if(!cfg)return null;const date=nextWeeklyDate(cfg.weekday);return cfg.scopeDate===date?null:{date,days:daysUntil(date),series:cfg}}
function normalizedRange(count,from,to){if(!count)return {from:1,to:0};let a=clamp(Math.max(1,Number(from)||1),1,count),b=clamp(Math.max(1,Number(to)||count),1,count);if(a>b)[a,b]=[b,a];return {from:a,to:b}}
function scopedWordsForSet(set,scopeMode='set',from=1,to=null,selectedLinkIds=null){if(!set||setNeedsPairReview(set))return [];const words=setWords(set.id);if(scopeMode==='selected'){const ids=new Set((selectedLinkIds||set.testSelectedLinkIds||[]).filter(Boolean));return ids.size?words.filter(w=>ids.has(w.setLinkId)):[]}if(scopeMode!=='range'||!words.length)return words;const r=normalizedRange(words.length,from,to);return words.slice(r.from-1,r.to)}
function scopeTextForSet(set,scopeMode='set',from=1,to=null,selectedLinkIds=null){if(!set)return '';if(scopeMode==='selected'){const count=scopedWordsForSet(set,'selected',from,to,selectedLinkIds).length;return `${set.title} · ${count} ausgewählt`}if(scopeMode!=='range')return set.title;const count=setWords(set.id).length;if(!count)return set.title;const r=normalizedRange(count,from,to);return `${set.title} · Vokabeln ${r.from}–${r.to}`}
function scopedWordsForSeries(cfg,subject=state.activeSubject){if(!cfg||!cfg.setId)return [];const set=state.sets.find(s=>s.id===cfg.setId&&s.learnerId===state.activeLearnerId&&s.subject===subject);return scopedWordsForSet(set,cfg.scopeMode,cfg.from,cfg.to,cfg.selectedLinkIds)}
function seriesScopeText(cfg){if(!cfg)return '';const set=state.sets.find(s=>s.id===cfg.setId);return scopeTextForSet(set,cfg.scopeMode,cfg.from,cfg.to,cfg.selectedLinkIds)}
function testReadinessScore(w){
  const s={...defaultSkills(),...(w.skills||{})};
  const activeCore=((s.retrieval||0)*.48+(s.spelling||0)*.38+(s.context||0)*.08+(s.recognition||0)*.03+(s.listening||0)*.03)/4;
  const activeDays=Math.min(1,(w.activeSuccessDays||[]).length/2); const delayed=Math.min(1,(w.maxActiveGapDays||0)/3);
  return Math.round((activeCore*.72+activeDays*.18+delayed*.10)*100);
}
function isTestReady(w){const s={...defaultSkills(),...(w.skills||{})};return isMastered(w)||(testReadinessScore(w)>=65&&(s.retrieval||0)>=2&&(s.spelling||0)>=2&&(w.activeSuccessDays||[]).length>=2&&(w.coldRecallDays||[]).length>=1&&(w.maxActiveGapDays||0)>=1)}
function testReadinessForContext(ctx){
  const words=ctx?.words||[]; if(!words.length)return {total:0,ready:0,pct:0,avg:0,weak:[]};
  const ready=words.filter(isTestReady).length; const avg=Math.round(words.reduce((sum,w)=>sum+testReadinessScore(w),0)/words.length);
  const weak=[...words].sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b));
  return {total:words.length,ready,pct:Math.round(ready/words.length*100),avg,weak};
}
function upcomingTestContext(subject=state.activeSubject){
  const explicit=mySets(subject).filter(s=>!setNeedsPairReview(s)&&s.testDate&&daysUntil(s.testDate)>=0&&setWords(s.id).length).sort((a,b)=>a.testDate.localeCompare(b.testDate));
  let single=null;
  if(explicit.length){const date=explicit[0].testDate,sets=explicit.filter(s=>s.testDate===date),words=uniqueWords(sets.flatMap(set=>scopedWordsForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds)));single={date,days:daysUntil(date),sets,words,source:'single',testFormat:sets[0]?.testFormat||'target',scopeText:sets.map(set=>scopeTextForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds)).join(' + ')}}
  const cfg=activeSeries(subject); let recurring=null;
  if(cfg){const date=nextWeeklyDate(cfg.weekday),set=state.sets.find(s=>s.id===cfg.setId&&s.learnerId===state.activeLearnerId&&s.subject===subject),words=scopedWordsForSeries(cfg,subject);if(cfg.scopeDate===date&&set&&words.length)recurring={date,days:daysUntil(date),sets:[set],words,source:'series',series:cfg,testFormat:cfg.testFormat||'target',scopeText:seriesScopeText(cfg)}}
  if(single&&recurring&&single.date===recurring.date){const sets=uniqueById([...single.sets,...recurring.sets]);const words=uniqueWords([...single.words,...recurring.words]);return {date:single.date,days:single.days,sets,words,source:'mixed',series:cfg,testFormat:single.testFormat||recurring.testFormat||'target',scopeText:[single.scopeText,recurring.scopeText].filter(Boolean).join(' + ')}}
  if(!single)return recurring; if(!recurring)return single; return single.date<=recurring.date?single:recurring;
}
function uniqueById(list){const seen=new Set();return list.filter(x=>x&&!seen.has(x.id)&&seen.add(x.id))}
function testContextLabel(ctx,subject=state.activeSubject){if(!ctx)return '';const subjectName=subjectLabel(subject);const when=ctx.days===0?'heute':ctx.days===1?'morgen':`in ${ctx.days} Tagen`;const recurrence=ctx.source==='series'||ctx.source==='mixed'?` · wöchentlich ${WEEKDAYS_SHORT[Number(ctx.series?.weekday)||0]}`:'';return `${subjectName}-Test ${when}${recurrence} · ${ctx.scopeText||ctx.sets.map(s=>s.title).join(' + ')}`}
function dailyPlanSignature(ctx,subject,sessionSize){
  const words=(ctx?ctx.words:schoolYearVerifiedWords(subject)).map(w=>w.id).sort().join(',');
  return `${VERSION}:${ctx?`test:${ctx.source||'single'}:${ctx.date}:${ctx.sets.map(s=>s.id).sort().join(',')}`:`general:${currentSchoolYear()}`}:${sessionSize}:${words}`;
}
function uniqueWords(list){const seen=new Set();return list.filter(w=>w&&!seen.has(w.id)&&seen.add(w.id))}
function testLearningWindow(ctx){
  const days=Math.max(0,Number(ctx?.days)||0);
  const studyDaysBeforeTest=days;
  const reviewOnlyDays=days>=2?1:0;
  const acquisitionDays=days===0?0:(days===1?1:Math.max(1,days-reviewOnlyDays));
  return {daysToTest:days,studyDaysBeforeTest,reviewOnlyDays,acquisitionDays};
}
function dailyPacePlan(pendingCount,weakCount,ctx,lrsMode=false){
  pendingCount=Math.max(0,Number(pendingCount)||0);weakCount=Math.max(0,Number(weakCount)||0);
  if(!ctx){
    const quota=Math.min(pendingCount,5),dailyTarget=lrsMode?10:12;
    return {quota,requiredPerDay:pendingCount?5:0,requiredReviewPerDay:0,overload:false,dailyTarget,pace:'normal',...testLearningWindow(null)};
  }
  const window=testLearningWindow(ctx);
  let requiredPerDay=0,quota=0,overload=false;
  if(pendingCount){
    if(window.acquisitionDays<1){requiredPerDay=pendingCount;overload=true}
    else{
      requiredPerDay=Math.ceil(pendingCount/window.acquisitionDays);
      quota=Math.min(pendingCount,requiredPerDay<=3?3:Math.min(7,requiredPerDay));
      overload=requiredPerDay>7;
    }
  }
  const spacingRisk=!!(pendingCount&&window.daysToTest<=1);
  const reviewDays=Math.max(1,window.studyDaysBeforeTest),requiredReviewPerDay=weakCount?Math.ceil(weakCount/reviewDays):0;
  let dailyTarget=quota?quota+5:8;
  dailyTarget=Math.max(dailyTarget,quota+requiredReviewPerDay);
  if(overload)dailyTarget+=Math.min(2,Math.max(1,requiredPerDay-7));
  if(window.daysToTest<=3&&weakCount>0)dailyTarget+=1;
  const cap=lrsMode?12:14;
  dailyTarget=clamp(dailyTarget,Math.min(8,cap),cap);
  const pace=overload?'overload':spacingRisk?'catchup':dailyTarget<10?'ahead':dailyTarget>12?'catchup':'normal';
  return {quota,requiredPerDay,requiredReviewPerDay,overload,spacingRisk,dailyTarget,pace,...window};
}
function dailyIntroQuota(pendingCount,ctx,weakCount=0,lrsMode=false){return dailyPacePlan(pendingCount,weakCount,ctx,lrsMode)}
function buildDailyPlan(subject=state.activeSubject){
  const l=learner();l.dailyPlans=l.dailyPlans||{};
  const sessionSize=l.lrsMode?6:10,ctx=upcomingTestContext(subject),key=`${today()}:${subject}`,signature=dailyPlanSignature(ctx,subject,sessionSize);
  const existing=l.dailyPlans[key];
  if(existing&&existing.signature===signature){
    const refs=[...(existing.wordRefs||[]),...(existing.introRefs||[])];
    if(refs.every(r=>r.setLinkId?!!wordByLinkId(r.setLinkId):!!wordById(r.wordId)))return existing;
  }

  const pool=ctx?ctx.words:schoolYearVerifiedWords(subject);
  const hasLearningContact=w=>Number(w?.repetitions||0)>0||(w?.activePracticeDays||[]).length>0;
  const pending=pool.filter(w=>!hasLearningContact(w)),ready=pool.filter(hasLearningContact);
  const weakReady=ready.filter(w=>!isTestReady(w)),introPlan=dailyIntroQuota(pending.length,ctx,weakReady.length,!!l.lrsMode),dailyTarget=introPlan.dailyTarget;
  const firstPending=pending[0],introSetId=firstPending?.setId||'';
  const introWords=introSetId?pending.filter(w=>w.setId===introSetId).slice(0,introPlan.quota):[];
  const reviewTarget=Math.max(0,dailyTarget-introWords.length);
  const due=ready.filter(w=>!w.dueDate||w.dueDate<=today()).sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b));
  const seenWeak=ready.filter(w=>!isTestReady(w)).sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b));
  let selected=uniqueWords([...due,...seenWeak,...ready]).slice(0,reviewTarget),maintenanceCount=0;

  if(selected.length<reviewTarget){
    const poolIds=new Set(pool.map(w=>w.id)),maintenance=dueWords(subject).filter(w=>!poolIds.has(w.id)).slice(0,reviewTarget-selected.length);
    const before=selected.length;selected=uniqueWords([...selected,...maintenance]).slice(0,reviewTarget);maintenanceCount=selected.length-before;
  }

  const phase=ctx?(ctx.days<=1?'rehearse':ctx.days<=3?'consolidate':'acquire'):'general';
  const urgent=!!(introPlan.overload||(ctx&&ctx.days<=1&&pending.length));
  const plan={
    date:today(),subject,signature,source:ctx?(ctx.source||'test'):'general',testDate:ctx?.date||'',
    setIds:ctx?.sets.map(s=>s.id)||[],setTitle:ctx?.scopeText||ctx?.sets.map(s=>s.title).join(' + ')||'',
    wordIds:selected.map(w=>w.id),wordRefs:selected.map(w=>({wordId:w.id,setLinkId:w.setLinkId||''})),
    introRefs:introWords.map(w=>({wordId:w.id,setLinkId:w.setLinkId||''})),introSetId,
    introCount:introWords.length,reviewCount:selected.length,dailyTarget,requiredNewPerDay:introPlan.requiredPerDay,requiredReviewPerDay:introPlan.requiredReviewPerDay,
    deadlineOverload:introPlan.overload,spacingRisk:introPlan.spacingRisk,pace:introPlan.pace,studyDaysBeforeTest:introPlan.studyDaysBeforeTest,acquisitionDays:introPlan.acquisitionDays,reviewOnlyDays:introPlan.reviewOnlyDays,
    sessionSize,urgent,phase,maintenanceCount,completedKeys:[],createdAt:new Date().toISOString()
  };
  l.dailyPlans[key]=plan;Object.keys(l.dailyPlans).filter(k=>k<`${datePlusDays(-21)}:`).forEach(k=>delete l.dailyPlans[k]);persistOnly();return plan;
}
function wordPracticedToday(w){return !!(w?.activePracticeDays||[]).includes(today())}
function dailyPlanRefKey(ref){return ref?.setLinkId?`link:${ref.setLinkId}`:ref?.wordId?`word:${ref.wordId}`:''}
function markDailyPlanWordDone(w,plan=buildDailyPlan()){
  if(!w||!plan||plan.date!==today()||plan.subject!==state.activeSubject)return false;
  const key=dailyPlanRefKey({wordId:w.id,setLinkId:w.setLinkId||''});if(!key)return false;
  plan.completedKeys=[...new Set([...(Array.isArray(plan.completedKeys)?plan.completedKeys:[]),key])];return true;
}
function dailyPlanStatus(plan=buildDailyPlan()){
  const reviewRefs=Array.isArray(plan.wordRefs)&&plan.wordRefs.length?plan.wordRefs:(plan.wordIds||[]).map(id=>({wordId:id,setLinkId:''}));
  const introRefs=Array.isArray(plan.introRefs)?plan.introRefs:[];
  const reviewPairs=reviewRefs.map(r=>({ref:r,word:r.setLinkId?wordByLinkId(r.setLinkId):wordById(r.wordId)})).filter(x=>x.word);
  const introPairs=introRefs.map(r=>({ref:r,word:r.setLinkId?wordByLinkId(r.setLinkId):wordById(r.wordId)})).filter(x=>x.word);
  const completed=new Set(Array.isArray(plan.completedKeys)?plan.completedKeys:[]);
  const reviewDone=reviewPairs.filter(x=>completed.has(dailyPlanRefKey(x.ref))),reviewRemaining=reviewPairs.filter(x=>!completed.has(dailyPlanRefKey(x.ref)));
  const introDone=introPairs.filter(x=>completed.has(dailyPlanRefKey(x.ref))),introRemaining=introPairs.filter(x=>!completed.has(dailyPlanRefKey(x.ref)));
  const total=reviewPairs.length+introPairs.length,done=reviewDone.length+introDone.length,remaining=reviewRemaining.length+introRemaining.length;
  return {
    total,done,remaining,
    introTotal:introPairs.length,introDone:introDone.length,introRemaining:introRemaining.length,
    reviewTotal:reviewPairs.length,reviewDone:reviewDone.length,reviewRemaining:reviewRemaining.length,
    remainingIntroRefs:introRemaining.map(x=>x.ref),remainingReviewRefs:reviewRemaining.map(x=>x.ref),
    remainingIds:reviewRemaining.map(x=>x.word.id),remainingRefs:reviewRemaining.map(x=>x.ref),
    units:(introRemaining.length?1:0)+(reviewRemaining.length?Math.ceil(reviewRemaining.length/plan.sessionSize):0)
  };
}
function startDailyTodo(){
  const parent=typeof isParentMode==='function'&&isParentMode();
  const reviewSet=mySets().find(setNeedsPairReview);
  if(reviewSet){
    if(parent){showView('parentView');renderAll();setTimeout(()=>openSetPairAudit?.(reviewSet.id),40)}
    else{toast('Die neuen Wörter werden noch von einem Erwachsenen geprüft.','subtle');showView('homeView');renderAll()}
    return;
  }
  const pending=seriesScopePending(),ctx=upcomingTestContext();
  if(pending&&(!ctx||pending.date<=ctx.date)){
    if(parent)openTestDatePlanner();else{toast('Der nächste Test wird noch von einem Erwachsenen vorbereitet.','subtle');showView('homeView');renderAll()}
    return;
  }
  const plan=buildDailyPlan(),status=dailyPlanStatus(plan),prepared=schoolYearVerifiedWords().length>0;
  if(!prepared){
    if(parent){if(!mySets().length)openLearningContentPlanner();else openFirstWordsChooser()}
    else{toast('Heute ist noch nichts vorbereitet. Bitte einen Erwachsenen um Hilfe.','subtle');showView('homeView');renderAll()}
    return;
  }
  if(status.introRemaining){
    const refs=status.remainingIntroRefs||[];
    startSession('adaptive',null,refs.slice(0,plan.sessionSize),true);return;
  }
  if(!status.reviewRemaining){toast('Tagesziel erledigt. Weitere Übungen sind optional.','good');return}
  startSession('adaptive',null,(status.remainingReviewRefs||status.remainingRefs||status.remainingIds).slice(0,plan.sessionSize),true);
}