'use strict';

function learner(){ return state.learners.find(x=>x.id===state.activeLearnerId)||state.learners[0]; }
function gradeScaleFor(subject=state.activeSubject){const l=learner();l.gradeScales=l.gradeScales||defaultGradeScales();l.gradeScales[subject]={...defaultGradeScale(),...(l.gradeScales[subject]||{})};return l.gradeScales[subject];}
function suggestGradeFromScale(percent,scale){const s={...defaultGradeScale(),...(scale||{})};const p=Number(percent)||0;if(p>=s.n1)return '1';if(p>=s.n2)return '2';if(p>=s.n3)return '3';if(p>=s.n4)return '4';if(p>=s.n5)return '5';return '6';}
function gradeScaleText(scale=gradeScaleFor()){return `1 ab ${scale.n1}% · 2 ab ${scale.n2}% · 3 ab ${scale.n3}% · 4 ab ${scale.n4}% · 5 ab ${scale.n5}% · darunter 6`;}
function actualGradeForPractice(practiceId){return state.grades.find(g=>g.learnerId===state.activeLearnerId&&g.practiceTestId===practiceId)||null;}
function parseSchoolGrade(value){
  const raw=String(value??'').trim().replace(',', '.');
  if(!raw)return null;
  const signed=raw.match(/^([1-6])\s*([+-])$/);
  if(signed){
    const base=Number(signed[1]),adjust=signed[2]==='+'?-0.3:0.3;
    return clamp(base+adjust,1,6);
  }
  if(!/^\d(?:\.\d+)?$/.test(raw))return null;
  const n=Number(raw);
  return Number.isFinite(n)&&n>=1&&n<=6?n:null;
}
function testGradeReward(value){
  const grade=parseSchoolGrade(value);if(grade===null)return null;
  const baseXp=50,bonusXp=Math.round(clamp(6-grade,0,5)*2);
  return {grade,baseXp,bonusXp,totalXp:baseXp+bonusXp};
}
function testBadgeCount(subject=state.activeSubject,learnerId=state.activeLearnerId){
  return (state.grades||[]).filter(g=>g.learnerId===learnerId&&g.subject===subject&&parseSchoolGrade(g.grade)!==null).length;
}
function grantTestGradeReward(gradeRow){
  if(!gradeRow||gradeRow.rewardGrantedAt)return null;
  const reward=testGradeReward(gradeRow.grade);if(!reward)return null;
  const l=(state.learners||[]).find(x=>x.id===gradeRow.learnerId);if(!l)return null;
  l.xp=(Number(l.xp)||0)+reward.totalXp;
  gradeRow.rewardKind='completedTest';
  gradeRow.rewardGrantedAt=new Date().toISOString();
  gradeRow.rewardBaseXp=reward.baseXp;
  gradeRow.rewardBonusXp=reward.bonusXp;
  gradeRow.rewardXp=reward.totalXp;
  recordActivity('testGradeReward',{gradeId:gradeRow.id,subject:gradeRow.subject,testDate:gradeRow.date,rewardXp:reward.totalXp,bonusXp:reward.bonusXp});
  return reward;
}
function mySets(subject=state.activeSubject){ return state.sets.filter(s=>s.learnerId===state.activeLearnerId && s.subject===subject); }
function setHasPhotoImport(set,s=state){
  if(!set)return false;
  return (s?.setVocabulary||[]).some(link=>String(link?.setId||'')===String(set.id||'')&&link?.source==='photo-text-import');
}
function setNeedsPairReview(set){
  if(!set)return false;
  if(set.pairReviewRequired===true||pairReviewSignatureMismatch(set,state))return true;
  if(!setHasPhotoImport(set,state))return false;
  return !set.pairVerifiedAt||!set.pairVerifiedSignature;
}
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

const SENTENCE_PLACEHOLDER_TOKEN='vtplaceholdertoken';
const SENTENCE_PLACEHOLDER_RE=/(?:…|\.{2,}|_{2,}|\[\s*(?:_+\s*)?\])/g;
function normalizeEnglishContractionSpacing(value){
  return String(value||'')
    .replace(/\b([a-z]+)\s+n\s*'\s*t\b/gi,"$1n't")
    .replace(/\b([a-z]+)\s*'\s*(s|re|ve|ll|d|m|t)\b/gi,"$1'$2");
}
function semanticNormalize(s){
  return normalizeEnglishContractionSpacing(String(s||'').trim().toLowerCase().normalize('NFKC').replace(/[’‘`´]/g,"'"))
    .replace(SENTENCE_PLACEHOLDER_RE,' ')
    .replace(/[….,;:!?()[\]{}"']/g,'')
    .replace(/\s+/g,' ')
    .trim();
}
function normalize(s){return semanticNormalize(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function orthographyNormalize(value){
  return String(value||'').normalize('NFKC').toLowerCase().replace(/[’‘`´]/g,"'").trim().replace(/\s+/g,' ');
}
function hasSentencePlaceholder(value){
  SENTENCE_PLACEHOLDER_RE.lastIndex=0;
  return SENTENCE_PLACEHOLDER_RE.test(String(value||''));
}
function hasEllipsisPlaceholder(value){return hasSentencePlaceholder(value)}
function sentencePlaceholderNormalize(value,{semantic=false}={}){
  let out=orthographyNormalize(value);
  out=normalizeEnglishContractionSpacing(out);
  SENTENCE_PLACEHOLDER_RE.lastIndex=0;
  out=out.replace(SENTENCE_PLACEHOLDER_RE,' '+SENTENCE_PLACEHOLDER_TOKEN+' ');
  if(semantic)out=out.replace(/[….,;:!?()[\]{}"']/g,'');
  else out=out.replace(/\s+([?!.,;:])/g,'$1');
  return out.replace(/\s+/g,' ').trim();
}
function sentenceMatchRegexEscape(value){return String(value||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function sentencePlaceholderAnchorsMatch(answer,target,{semantic=false}={}){
  if(!hasSentencePlaceholder(target)||!String(answer||'').trim())return false;
  const normalizedTarget=sentencePlaceholderNormalize(target,{semantic});
  const normalizedAnswer=sentencePlaceholderNormalize(answer,{semantic});
  const anchors=normalizedTarget.split(SENTENCE_PLACEHOLDER_TOKEN).map(x=>x.trim());
  if(!anchors.some(Boolean))return false;
  const pattern=anchors.map(sentenceMatchRegexEscape).join('(?:\\s*.*?\\s*)');
  return new RegExp('^'+pattern+'$','i').test(normalizedAnswer);
}
function orthographyMatchKindForTarget(answer,target){
  const directAnswer=orthographyNormalize(answer),directTarget=orthographyNormalize(target);
  if(!directAnswer||!directTarget)return 'wrong';
  if(directAnswer===directTarget)return 'exact';
  const normalizedAnswer=sentencePlaceholderNormalize(answer);
  const normalizedTarget=sentencePlaceholderNormalize(target);
  if(normalizedAnswer===normalizedTarget)return 'normalized';
  if(sentencePlaceholderAnchorsMatch(answer,target))return 'normalized';
  return 'wrong';
}
function orthographyNormalizeForTarget(value,target){
  const normalized=sentencePlaceholderNormalize(value);
  if(!hasSentencePlaceholder(target))return normalized;
  return normalized.replace(new RegExp('\\s*'+SENTENCE_PLACEHOLDER_TOKEN+'\\s*','g'),' ').replace(/\s+([?!.,;:])/g,'$1').replace(/\s+/g,' ').trim();
}
function spellingMatches(answer,target){
  if(typeof quizOrthographyMatches==='function')return quizOrthographyMatches(answer,target);
  const targets=[...(Array.isArray(target)?target:[target])].map(x=>String(x||'').trim()).filter(Boolean);
  if(!String(answer||'').trim())return false;
  return targets.some(t=>orthographyMatchKindForTarget(answer,t)!=='wrong');
}
function answerMatches(answer,target){
  if(typeof quizSemanticMatches==='function')return quizSemanticMatches(answer,target);
  const targets=[...(Array.isArray(target)?target:[target])].map(x=>String(x||'').trim()).filter(Boolean);
  if(!String(answer||'').trim())return false;
  return targets.some(t=>semanticNormalize(answer)===semanticNormalize(t)||sentencePlaceholderAnchorsMatch(answer,t,{semantic:true}));
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
  if(custom.length>1)return custom;
  const syllables=subjectHasCapability(w?.subject||state?.activeSubject,'nativeLiteracy')&&Array.isArray(w?.syllables)?w.syllables.map(x=>String(x||'').trim()).filter(Boolean):[];
  return syllables.length>1?syllables:autoChunks(t);
}
function chunkEligibleWord(w,term=w?.term){return learningChunksFor(w,term).length>1}

function nativeLiteracyWordSecure(w){
  const e={...defaultLiteracySkills(),...(w?.literacySkills||{})},activeDays=(w?.activeSuccessDays||[]).length;
  const sentenceOk=!String(w?.example||'').trim()||e.sentenceUse>=1;
  return e.recognized>=1&&e.orthographicSpelling>=2&&e.dictation>=2&&sentenceOk&&activeDays>=3&&(w?.maxActiveGapDays||0)>=3&&(w?.independentSuccesses||0)>=4&&(w?.intervalDays||0)>=7;
}
function masteryScore(w){
  if(subjectHasCapability(w?.subject,'nativeLiteracy')){
    const e={...defaultLiteracySkills(),...(w?.literacySkills||{})},activeDays=Math.min(4,(w.activeSuccessDays||[]).length),delayed=w.maxActiveGapDays>=7?4:w.maxActiveGapDays>=3?3:w.maxActiveGapDays>=1?2:0;
    const sentenceWeight=String(w?.example||'').trim()?.12:0,core=(Math.min(4,e.recognized)*.18)+(Math.min(4,e.orthographicSpelling)*.32)+(Math.min(4,e.dictation)*.28)+(Math.min(4,e.phonologicalSpelling)*.10)+(Math.min(4,e.sentenceUse)*sentenceWeight);
    return (core*(sentenceWeight?.80:.90))+(activeDays*.07)+(delayed*.03);
  }
  const s={...defaultSkills(),...(w.skills||{})};
  const productiveCore=(s.retrieval*.45)+(s.spelling*.35)+(s.context*.20);
  const activeDays=Math.min(4,(w.activeSuccessDays||[]).length);
  const delayed=w.maxActiveGapDays>=7?4:w.maxActiveGapDays>=3?3:w.maxActiveGapDays>=1?2:0;
  return (productiveCore*.68)+(activeDays*.20)+(delayed*.12);
}
function meetsMasteryCriteria(w){
  if(subjectHasCapability(w?.subject,'nativeLiteracy'))return nativeLiteracyWordSecure(w);
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
const CAMPAIGN_GROWTH_MAX_POINTS=320;
const CAMPAIGN_GROWTH_STAGE_POINTS=Object.freeze([0,25,70,130,210,320]);
function schoolYearDateBounds(schoolYear=currentSchoolYear()){
  const startYear=Number(String(schoolYear||'').split('/')[0]);
  return Number.isFinite(startYear)?{start:`${startYear}-08-01`,end:`${startYear+1}-07-31`}:{start:'0000-01-01',end:'9999-12-31'};
}
function dateInSchoolYear(date,schoolYear=currentSchoolYear()){const b=schoolYearDateBounds(schoolYear),d=String(date||'');return !!d&&d>=b.start&&d<=b.end}
function campaignGrowthState(subject=state.activeSubject,schoolYear=currentSchoolYear()){
  const words=schoolYearVerifiedWords(subject,schoolYear);
  const masteredEver=words.filter(w=>isMastered(w)||!!w.masteredAt||!!w.lastMasteredAt).length;
  const completedTests=typeof completedTestsForSubject==='function'?completedTestsForSubject(subject).filter(x=>dateInSchoolYear(x.date,schoolYear)).length:0;
  const capturedFortresses=typeof testFortressHistory==='function'?testFortressHistory(subject).filter(f=>dateInSchoolYear(f.testDate,schoolYear)&&!!f.capturedAt).length:0;
  const learningDays=new Set((learner()?.streakDays||[]).filter(date=>dateInSchoolYear(date,schoolYear))).size;
  const points=masteredEver+(completedTests*8)+(capturedFortresses*5);
  const pct=points?clamp(Math.max(1,Math.round(points/CAMPAIGN_GROWTH_MAX_POINTS*100)),1,100):0;
  const level=Math.max(1,Math.min(CAMPAIGN_GROWTH_STAGE_POINTS.length,CAMPAIGN_GROWTH_STAGE_POINTS.filter(t=>points>=t).length));
  const nextPoints=level<CAMPAIGN_GROWTH_STAGE_POINTS.length?CAMPAIGN_GROWTH_STAGE_POINTS[level]:null;
  return {subject,schoolYear,points,pct,level,maxLevel:CAMPAIGN_GROWTH_STAGE_POINTS.length,nextPoints,masteredEver,completedTests,capturedFortresses,learningDays};
}
function yearFortressKey(subject=state.activeSubject,schoolYear=currentSchoolYear()){return `${subject}:${schoolYear}`}
function yearFortressState(subject=state.activeSubject,schoolYear=currentSchoolYear(),l=learner()){
  const key=yearFortressKey(subject,schoolYear),store=l?.yearFortresses&&typeof l.yearFortresses==='object'?l.yearFortresses:{},row=store[key];
  return row&&typeof row==='object'?{key,subject,schoolYear,date:String(row.date||''),updatedAt:String(row.updatedAt||'')}:{key,subject,schoolYear,date:'',updatedAt:''};
}
function setYearFortressDate(date='',subject=state.activeSubject,schoolYear=currentSchoolYear(),l=learner()){
  if(!l)return {ok:false,error:'Kein Lernprofil aktiv.'};
  const value=String(date||'').trim(),bounds=schoolYearDateBounds(schoolYear);
  if(value&&!dateInSchoolYear(value,schoolYear))return {ok:false,error:`Das Datum muss im Schuljahr ${schoolYear} liegen.`};
  const cfg=l.testSeries?.[subject]?.enabled?l.testSeries[subject]:null,knownTests=(state.sets||[]).filter(s=>s.learnerId===l.id&&s.subject===subject&&s.schoolYear===schoolYear).map(s=>String(s.testDate||'')).filter(Boolean);
  if(cfg?.scopeDate&&dateInSchoolYear(cfg.scopeDate,schoolYear))knownTests.push(String(cfg.scopeDate));
  knownTests.sort();
  const latest=knownTests[knownTests.length-1]||'';
  if(value&&latest&&value<latest)return {ok:false,error:`Die Jahresfestung kann nicht vor dem bereits geplanten Test am ${formatDateShort(latest)} liegen.`};
  l.yearFortresses=l.yearFortresses&&typeof l.yearFortresses==='object'&&!Array.isArray(l.yearFortresses)?l.yearFortresses:{};
  const key=yearFortressKey(subject,schoolYear);
  if(!value){delete l.yearFortresses[key];return {ok:true,row:{key,subject,schoolYear,date:'',updatedAt:''},bounds}}
  const row={subject,schoolYear,date:value,updatedAt:new Date().toISOString()};l.yearFortresses[key]=row;
  return {ok:true,row:{key,...row},bounds};
}
function dueWords(subject=state.activeSubject,schoolYear=currentSchoolYear()){return schoolYearWords(subject,schoolYear).filter(w=>!w.dueDate||w.dueDate<=today()).sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||''));}
function armyStrength(subject=state.activeSubject,schoolYear=currentSchoolYear()){
  return Math.round(campaignGrowthState(subject,schoolYear).pct*11);
}
const ARMY_UNIT_THRESHOLDS=Object.freeze({
  infantry:Object.freeze([0,20,40,65,85]),
  archers:Object.freeze([20,35,55,75,90]),
  cavalry:Object.freeze([55,65,75,85,95]),
  ram:Object.freeze([35,50,70,85,100]),
  shield:Object.freeze([15,35,55,75,90]),
  support:Object.freeze([3,7,14,30,60])
});
const BATTLE_ATTACK_UNITS=Object.freeze({charge:'infantry',volley:'archers',ram:'ram',cavalry:'cavalry'});
function armyUnitMetricValue(unitId,subject=state.activeSubject,schoolYear=currentSchoolYear()){
  if(unitId==='support')return campaignGrowthState(subject,schoolYear).learningDays;
  return campaignGrowthState(subject,schoolYear).pct;
}
function armyUnitProgressFromValue(unitId,value){
  const thresholds=ARMY_UNIT_THRESHOLDS[unitId]||[];
  const metric=Math.max(0,Number(value)||0);
  let level=Math.min(5,thresholds.filter(t=>metric>=t).length);
  const next=level<5?thresholds[level]:null,previous=level?thresholds[level-1]:0;
  const span=next===null?1:Math.max(1,next-previous);
  const progress=next===null?100:clamp(Math.round(((metric-previous)/span)*100),0,100);
  return {value:metric,level,unlocked:level>0,next,previous,progress};
}
function armyUnitPowerFromValue(unitId,value){
  const s=armyUnitProgressFromValue(unitId,value);
  if(!s.unlocked)return 0;
  if(s.level>=5)return 100;
  return clamp(Math.round(((s.level-1)+(s.progress/100))/5*100),1,99);
}
function armyUnitPower(unitId,subject=state.activeSubject,schoolYear=currentSchoolYear()){
  return armyUnitPowerFromValue(unitId,armyUnitMetricValue(unitId,subject,schoolYear));
}
function battleTacticalBonusForAttack(attack='charge',subject=state.activeSubject,schoolYear=currentSchoolYear()){
  if(attack==='special'){
    const ids=['infantry','archers','cavalry','ram'];
    const powers=ids.map(id=>armyUnitPower(id,subject,schoolYear));
    const power=Math.round(powers.reduce((sum,v)=>sum+v,0)/powers.length);
    return {unitId:'combined',power,bonus:Math.round(clamp(power,0,100)*.10)};
  }
  const unitId=BATTLE_ATTACK_UNITS[attack]||'infantry',power=armyUnitPower(unitId,subject,schoolYear);
  return {unitId,power,bonus:Math.round(clamp(power,0,100)*.10)};
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
function retargetTestFortress(learnerRow,subject,oldDate,oldSetIds,newCtx){
  if(!learnerRow||!oldDate||!newCtx?.date)return null;
  learnerRow.testFortresses=learnerRow.testFortresses&&typeof learnerRow.testFortresses==='object'&&!Array.isArray(learnerRow.testFortresses)?learnerRow.testFortresses:{};
  const ids=new Set((oldSetIds||[]).map(String));
  const entry=Object.entries(learnerRow.testFortresses).find(([,f])=>f&&f.subject===subject&&f.testDate===oldDate&&!f.testCompletedAt&&(!ids.size||(f.setIds||[]).some(id=>ids.has(String(id)))));
  if(!entry)return null;
  const [storedKey,fortress]=entry,key=testFortressKey(newCtx,subject);if(!key)return null;
  const collision=learnerRow.testFortresses[key];if(collision&&collision!==fortress)return collision;
  if(storedKey!==key)delete learnerRow.testFortresses[storedKey];
  fortress.key=key;fortress.testDate=newCtx.date;fortress.scopeText=newCtx.scopeText||newCtx.sets?.map(s=>s.title).join(' + ')||'';
  fortress.setIds=(newCtx.sets||[]).map(s=>s.id);fortress.wordCount=(newCtx.words||[]).length;
  learnerRow.testFortresses[key]=fortress;return fortress;
}
function testSequenceNumber(testDate,subject=state.activeSubject,schoolYear=currentSchoolYear()){
  if(!testDate)return 1;
  const startYear=Number(String(schoolYear||'').split('/')[0]),start=Number.isFinite(startYear)?`${startYear}-08-01`:'0000-01-01',end=Number.isFinite(startYear)?`${startYear+1}-07-31`:'9999-12-31';
  const inYear=date=>!!date&&String(date)>=start&&String(date)<=end,dates=new Set(),sets=schoolYearSets(subject,schoolYear);
  for(const set of sets)if(inYear(set.testDate))dates.add(set.testDate);
  const series=activeSeries(subject),seriesSetId=series?.setId||'';
  if(seriesSetId){
    for(const fortress of testFortressHistory(subject)){
      if(inYear(fortress.testDate)&&String(fortress.testDate)<=String(testDate)&&(fortress.setIds||[]).includes(seriesSetId))dates.add(fortress.testDate);
    }
  }
  if(inYear(testDate))dates.add(testDate);
  const ordered=[...dates].sort(),index=ordered.indexOf(testDate);
  return index>=0?index+1:1;
}
function testFortressLabel(f,subject=state.activeSubject){return f?.testDate?`Test ${testSequenceNumber(f.testDate,subject)}`:'Test'}
function currentTestFortress(subject=state.activeSubject){
  const ctx=upcomingTestContext(subject);if(!ctx?.words?.length)return null;
  const l=learner();l.testFortresses=l.testFortresses&&typeof l.testFortresses==='object'?l.testFortresses:{};
  const key=testFortressKey(ctx,subject);let f=l.testFortresses[key];
  if(!f){
    const wanted=new Set((ctx.sets||[]).map(s=>s.id)),legacy=Object.entries(l.testFortresses).find(([,row])=>row&&row.subject===subject&&row.testDate===ctx.date&&!row.testCompletedAt&&(row.setIds||[]).some(id=>wanted.has(id)));
    if(legacy){
      const [oldKey,row]=legacy;if(oldKey!==key)delete l.testFortresses[oldKey];
      row.key=key;row.scopeText=ctx.scopeText||ctx.sets.map(s=>s.title).join(' + ');row.setIds=ctx.sets.map(s=>s.id);row.wordCount=ctx.words.length;l.testFortresses[key]=row;f=row;
      if(typeof persistOnly==='function')persistOnly();
    }
  }
  if(!f){
    const plannedAttackDays=clamp(Math.max(1,Number(ctx.days)||1),1,14),archetype=fortressArchetypeFor(ctx,plannedAttackDays),maxDefense=plannedAttackDays*100;
    f={
      key,id:archetype.id,name:archetype.name,subtitle:archetype.subtitle,subject,testDate:ctx.date,
      scopeText:ctx.scopeText||ctx.sets.map(s=>s.title).join(' + '),setIds:ctx.sets.map(s=>s.id),wordCount:ctx.words.length,
      plannedAttackDays,maxDefense,defense:maxDefense,createdDate:today(),createdAt:new Date().toISOString(),revealedAt:'',
      capturedAt:'',securedDates:[],attacks:[]
    };
    l.testFortresses[key]=f;if(typeof persistOnly==='function')persistOnly();
  }
  return f;
}
function nextFortress(subject=state.activeSubject){return currentTestFortress(subject)}
function testFortressDamage(f=currentTestFortress(),subject=state.activeSubject,attack='charge'){
  if(!f)return {damage:0,readiness:0,bonus:0,tacticalBonus:0,tacticalPower:0};
  const ctx=upcomingTestContext(subject),readiness=ctx?testReadinessForContext(ctx).avg:0,bonus=Math.round(clamp(readiness,0,100)*.35);
  const tactical=battleTacticalBonusForAttack(attack,subject);
  return {damage:100+bonus+tactical.bonus,readiness,bonus,tacticalBonus:tactical.bonus,tacticalPower:tactical.power,tacticalUnit:tactical.unitId};
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
    const entry={date:stamp,subject,schoolYear:p.schoolYear,fortress:f.id,fortressKey:f.key,fortressName:f.name,testDate:f.testDate,result:'secure',progress:p.pct,attack,damage:0,defenseAfter:0,maxDefense:f.maxDefense,readiness:testFortressDamage(f,subject,'charge').readiness,tacticalBonus:0};
    l.campaignLog.push(entry);recordActivity('fortressSecure',{fortress:f.id,fortressKey:f.key,testDate:f.testDate,attack});return {entry,fortress:f,result:'secure',damage:0,remaining:0};
  }
  const hit=testFortressDamage(f,subject,attack),before=Math.max(0,Number(f.defense)||0),after=Math.max(0,before-hit.damage),won=after===0;
  f.defense=after;f.attacks.push({date:stamp,day:today(),damage:hit.damage,readiness:hit.readiness,readinessBonus:hit.bonus,tacticalBonus:hit.tacticalBonus,tacticalPower:hit.tacticalPower,tacticalUnit:hit.tacticalUnit,attack,defenseBefore:before,defenseAfter:after});
  if(won&&!f.capturedAt){f.capturedAt=stamp;l.xp+=20}
  const entry={date:stamp,subject,schoolYear:p.schoolYear,fortress:f.id,fortressKey:f.key,fortressName:f.name,testDate:f.testDate,result:won?'win':'damage',progress:p.pct,attack,damage:hit.damage,defenseAfter:after,maxDefense:f.maxDefense,readiness:hit.readiness,readinessBonus:hit.bonus,tacticalBonus:hit.tacticalBonus,tacticalPower:hit.tacticalPower,tacticalUnit:hit.tacticalUnit};
  l.campaignLog.push(entry);recordActivity('fortress',{fortress:f.id,fortressKey:f.key,testDate:f.testDate,result:entry.result,damage:hit.damage,defenseAfter:after,attack,tacticalBonus:hit.tacticalBonus});
  return {entry,fortress:f,result:entry.result,damage:hit.damage,remaining:after,readiness:hit.readiness,readinessBonus:hit.bonus,tacticalBonus:hit.tacticalBonus,tacticalPower:hit.tacticalPower};
}
function rankFor(pct,subject=state.activeSubject){
  const arr=subjectCampaign(subject).ranks||SUBJECT_META.english.campaign.ranks;
  if(subject==='german')return arr[Math.max(0,Math.min(arr.length-1,gearTier(pct)-1))];
  const i=Math.min(arr.length-1,Math.floor(pct/20));return arr[i];
}
function gearTier(pct){return Math.min(6,1+Math.floor(clamp(Number(pct)||0,0,100)/18))}
function gearFor(pct){return ['I','II','III','IV','V','VI'][gearTier(pct)-1]}
function gearLabelFor(pct,subject=state.activeSubject){
  const tier=gearTier(pct);
  const english=['Grundausrüstung','Verstärkte Schilde','Bogenschützen-Set','Belagerungsausrüstung','Reiter-Ausrüstung','Eliteausrüstung'];
  const latin=['Tiro','Legionär','Optio','Centurio','Tribun','Legat'];
  const german=['Grundausrüstung','Lederzeug','Ritterlehrling','Ritter','Kronritter','König'];
  return (subject==='latin'?latin:subject==='german'?german:english)[tier-1];
}
const AVATAR_STAGE_THRESHOLDS=Object.freeze([0,18,36,54,72,90]);
function avatarStageFor(pct,subject=state.activeSubject){
  const value=clamp(Number(pct)||0,0,100);
  const level=gearTier(value);
  const start=AVATAR_STAGE_THRESHOLDS[level-1]||0;
  const nextAt=level<AVATAR_STAGE_THRESHOLDS.length?AVATAR_STAGE_THRESHOLDS[level]:null;
  const progress=nextAt===null?100:clamp(Math.round((value-start)/Math.max(1,nextAt-start)*100),0,100);
  return {
    level,
    maxLevel:AVATAR_STAGE_THRESHOLDS.length,
    label:gearLabelFor(value,subject),
    rank:rankFor(value,subject),
    nextAt,
    progress,
    visualKey:`${subject}-stage-${level}`
  };
}
function soldiersFor(pct){return clamp(2+Math.floor(pct/9),2,13)}

const streakActivityTypes=new Set(['adaptive','recognition','recall','spelling','listening','context','chunks','flash','shower','latinGrammar','handwriting','cards','firstContact','practiceTest']);
function recordActivity(type,meta={}){ const l=learner(); if(streakActivityTypes.has(type)&&!l.streakDays.includes(today())) l.streakDays.push(today()); state.activity.push({id:uid('a'),learnerId:l.id,date:new Date().toISOString(),type,...meta}); }

function answerReviewsForLearner(learnerId=state.activeLearnerId,status=''){
  return (state.answerReviews||[]).filter(x=>x.learnerId===learnerId&&(!status||x.status===status)).sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
}
function pendingAnswerReviews(learnerId=state.activeLearnerId){return answerReviewsForLearner(learnerId,'pending')}
function answerReviewById(id){return (state.answerReviews||[]).find(x=>x.id===id)||null}
function answerReviewProgress(req){return (state.learnerVocabulary||[]).find(x=>x.id===req?.wordId)||progressForSense(req?.senseId,req?.learnerId)}
function answerReviewSkill(req){
  const mode=String(req?.mode||req?.skill||'');
  if(mode==='spelling')return {active:true,credits:['spelling','listening'],error:'spelling'};
  if(mode==='context')return {active:true,credits:['context','retrieval','spelling'],error:'context'};
  if(['recall','retrieval','reverseRecall','cards'].includes(mode))return {active:true,credits:mode==='reverseRecall'?['retrieval']:['retrieval','spelling'],error:'retrieval'};
  return {active:false,credits:[],error:mode||'retrieval'};
}
function answerReviewActivity(req,type,meta={}){
  state.activity=state.activity||[];
  state.activity.push({id:uid('a'),learnerId:req.learnerId,date:new Date().toISOString(),type,answerReviewId:req.id,wordId:req.wordId,...meta});
}
function answerReviewAttemptTime(req){
  const raw=String(req?.createdAt||'');return /^\d{4}-\d{2}-\d{2}T/.test(raw)?raw:new Date().toISOString();
}
function applyAnswerReviewDirection(w,req,correct){
  const direction=recallDirectionForMode(req?.mode||req?.skill||'');if(!w||!direction)return '';
  const all=normalizeDirectionalRecall(w.directionalRecall),node=all[direction],at=answerReviewAttemptTime(req),day=/^\d{4}-\d{2}-\d{2}$/.test(String(req?.attemptDate||''))?req.attemptDate:at.slice(0,10);
  if(correct)node.successDays=[...new Set([...(node.successDays||[]),day])].slice(-1000);
  if(!node.lastAt||String(node.lastAt)<=at){node.lastCorrect=!!correct;node.lastAt=at}
  w.directionalRecall=all;return direction;
}
function applyAcceptedAnswerReview(req){
  const w=answerReviewProgress(req),l=(state.learners||[]).find(x=>x.id===req.learnerId);if(!w||!l)return;
  const cfg=answerReviewSkill(req),attemptDay=/^\d{4}-\d{2}-\d{2}$/.test(String(req.attemptDate||''))?req.attemptDate:today(),attemptAt=answerReviewAttemptTime(req);
  w.repetitions=(w.repetitions||0)+1;w.lastReviewedAt=!w.lastReviewedAt||String(w.lastReviewedAt)<attemptAt?attemptAt:w.lastReviewedAt;w.practiceDays=[...new Set([...(w.practiceDays||[]),attemptDay])];w.modesSeen=[...new Set([...(w.modesSeen||[]),req.mode||req.skill].filter(Boolean))];
  if(cfg.active){
    w.successes=(w.successes||0)+1;w.independentSuccesses=(w.independentSuccesses||0)+1;w.activePracticeDays=[...new Set([...(w.activePracticeDays||[]),attemptDay])];w.activeSuccessDays=[...new Set([...(w.activeSuccessDays||[]),attemptDay])];w.recentActiveResults=[...(w.recentActiveResults||[]),true].slice(-8);
    cfg.credits.forEach((key,i)=>{w.skills[key]=clamp((w.skills[key]||0)+(i===0?1:.55),0,4)});
    if(req.mode==='spelling')w.spellingSuccessDays=[...new Set([...(w.spellingSuccessDays||[]),attemptDay])];
    w.lastSuccessAt=!w.lastSuccessAt||String(w.lastSuccessAt)<attemptAt?attemptAt:w.lastSuccessAt;w.lastActiveSuccessAt=!w.lastActiveSuccessAt||String(w.lastActiveSuccessAt)<attemptAt?attemptAt:w.lastActiveSuccessAt;l.xp=(l.xp||0)+3;
    applyAnswerReviewDirection(w,req,true);refreshMastery(w);updateLeitnerBox(w,true,{assisted:false,active:true,orthographyOk:true});
    if(req.dailyAttempt&&attemptDay===today()&&req.learnerId===state.activeLearnerId&&req.subject===state.activeSubject)markDailyPlanWordDone(w);
  }
}
function applyRejectedAnswerReview(req){
  const w=answerReviewProgress(req);if(!w)return;
  const cfg=answerReviewSkill(req),attemptAt=answerReviewAttemptTime(req),attemptDay=/^\d{4}-\d{2}-\d{2}$/.test(String(req.attemptDate||''))?req.attemptDate:today();
  w.repetitions=(w.repetitions||0)+1;w.lastReviewedAt=!w.lastReviewedAt||String(w.lastReviewedAt)<attemptAt?attemptAt:w.lastReviewedAt;w.practiceDays=[...new Set([...(w.practiceDays||[]),attemptDay])];w.modesSeen=[...new Set([...(w.modesSeen||[]),req.mode||req.skill].filter(Boolean))];
  if(cfg.active){
    w.failures=(w.failures||0)+1;cfg.credits.forEach((key,i)=>{w.skills[key]=clamp((w.skills[key]||0)-(i===0?1:.35),0,4)});w.errorProfile[cfg.error]=(w.errorProfile[cfg.error]||0)+1;w.intervalDays=0;w.dueDate=today();w.recentActiveResults=[...(w.recentActiveResults||[]),false].slice(-8);applyAnswerReviewDirection(w,req,false);refreshMastery(w);updateLeitnerBox(w,false,{assisted:false,active:true,orthographyOk:true});
  }
}
function answerReviewDailyPlan(req){
  const l=(state.learners||[]).find(x=>x.id===req?.learnerId);return l?.dailyPlans?.[req?.dailyPlanKey||'']||null;
}
function resolveAnswerReviewDailyPlan(req,accepted){
  const plan=answerReviewDailyPlan(req),key=String(req?.dailyRefKey||'');if(!plan||!key)return;
  plan.reviewPendingKeys=(plan.reviewPendingKeys||[]).filter(x=>x!==key);
  if(accepted)plan.completedKeys=[...new Set([...(plan.completedKeys||[]),key])];
}
function acceptAnswerReview(id){
  const req=answerReviewById(id);if(!req||req.status!=='pending')return {ok:false,error:'Prüffall nicht mehr offen.'};
  const answer=String(req.answer||'').trim(),link=(state.setVocabulary||[]).find(x=>x.id===req.setLinkId),set=(state.sets||[]).find(x=>x.id===req.setId);
  if(!answer||!link)return {ok:false,error:'Antwort oder Lernset-Zuordnung fehlt.'};
  const existingPairReview=!!(set&&setNeedsPairReview(set)),key=req.answerSide==='translation'?'acceptedTranslationOverrides':'acceptedTermOverrides',limit=req.answerSide==='translation'?700:300;
  if(answer.length>limit)return {ok:false,error:'Die Antwort ist für eine automatische Variante zu lang.'};
  link[key]=[...new Set([...(link[key]||[]),answer])];
  if(set&&existingPairReview){set.pairReviewRequired=true;set.pairVerifiedAt='';set.pairVerifiedSignature=''}
  else if(set){set.pairReviewRequired=false;set.pairVerifiedAt=set.pairVerifiedAt||new Date().toISOString();set.pairVerifiedSignature=pairReviewSignatureForSet(set.id)}
  applyAcceptedAnswerReview(req);resolveAnswerReviewDailyPlan(req,true);req.status='accepted';req.resolution='accepted-variant';req.resolvedAt=new Date().toISOString();answerReviewActivity(req,'answerReviewAccepted',{answerSide:req.answerSide,answer});rebuildWordIndexes();return {ok:true,request:req};
}
function rejectAnswerReview(id){
  const req=answerReviewById(id);if(!req||req.status!=='pending')return {ok:false,error:'Prüffall nicht mehr offen.'};
  applyRejectedAnswerReview(req);resolveAnswerReviewDailyPlan(req,false);req.status='rejected';req.resolution='system-correct';req.resolvedAt=new Date().toISOString();answerReviewActivity(req,'answerReviewRejected');return {ok:true,request:req};
}
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
function testPlanIdentityForSet(set){return String(set?.testPlanId||set?.id||'')}
function testCompletionKey(subject,date,testPlanId=''){return testPlanId?`${subject}:${date}:${testPlanId}`:`${subject}:${date}`}
function testCompletions(l=learner()){if(!l)return{};if(!l.completedTests||typeof l.completedTests!=='object'||Array.isArray(l.completedTests))l.completedTests={};return l.completedTests}
function testCompletionForDate(date,subject=state.activeSubject){
  if(!date)return null;
  return testCompletions()[testCompletionKey(subject,date)]||Object.values(testCompletions()).find(x=>x?.subject===subject&&x?.date===date)||null;
}
function isTestCompletedForLearner(l,date,subject=state.activeSubject){
  if(!l||!date)return false;
  if(Object.values(testCompletions(l)).some(x=>x?.subject===subject&&x?.date===date))return true;
  return (state.grades||[]).some(g=>g.learnerId===l.id&&g.subject===subject&&g.date===date&&parseSchoolGrade(g.grade)!==null);
}
function isExplicitTestSetCompletedForLearner(l,set,subject=state.activeSubject){
  if(!l||!set?.testDate)return false;
  const id=testPlanIdentityForSet(set),rows=Object.values(testCompletions(l)).filter(x=>x?.subject===subject&&x?.date===set.testDate);
  if(rows.some(row=>row.testPlanId?row.testPlanId===id:!(row.setIds||[]).length||(row.setIds||[]).includes(set.id)))return true;
  return (state.grades||[]).some(g=>g.learnerId===l.id&&g.subject===subject&&g.date===set.testDate&&parseSchoolGrade(g.grade)!==null);
}
function isTestCompleted(date,subject=state.activeSubject){return isTestCompletedForLearner(learner(),date,subject)}
function completedTestsForSubject(subject=state.activeSubject){return Object.values(testCompletions()).filter(x=>x?.subject===subject&&x?.date).sort((a,b)=>String(a.date).localeCompare(String(b.date)))}
function latestTestCompletion(subject=state.activeSubject){const rows=completedTestsForSubject(subject);return rows[rows.length-1]||null}
function seriesOccurrenceDate(subject=state.activeSubject){
  const cfg=activeSeries(subject);if(!cfg)return '';
  const scoped=String(cfg.scopeDate||'');
  if(scoped&&scoped<=today()&&!isTestCompleted(scoped,subject))return scoped;
  let date=nextWeeklyDate(cfg.weekday);
  if(isTestCompleted(date,subject))date=nextWeeklyDate(cfg.weekday,datePlusDays(1));
  const finalDate=yearFortressState(subject,currentSchoolYear()).date;
  return finalDate&&date>finalDate?'':date;
}
function seriesScopePending(subject=state.activeSubject){const cfg=activeSeries(subject);if(!cfg)return null;const date=seriesOccurrenceDate(subject);return !date||cfg.scopeDate===date?null:{date,days:daysUntil(date),series:cfg}}
function normalizedRange(count,from,to){if(!count)return {from:1,to:0};let a=clamp(Math.max(1,Number(from)||1),1,count),b=clamp(Math.max(1,Number(to)||count),1,count);if(a>b)[a,b]=[b,a];return {from:a,to:b}}
function scopedWordsForSet(set,scopeMode='set',from=1,to=null,selectedLinkIds=null){if(!set||setNeedsPairReview(set))return [];const words=setWords(set.id);if(scopeMode==='selected'){const ids=new Set((selectedLinkIds||set.testSelectedLinkIds||[]).filter(Boolean));return ids.size?words.filter(w=>ids.has(w.setLinkId)):[]}if(scopeMode!=='range'||!words.length)return words;const r=normalizedRange(words.length,from,to);return words.slice(r.from-1,r.to)}
function scopeTextForSet(set,scopeMode='set',from=1,to=null,selectedLinkIds=null){if(!set)return '';if(scopeMode==='selected'){const count=scopedWordsForSet(set,'selected',from,to,selectedLinkIds).length;return `${set.title} · ${count} ausgewählt`}if(scopeMode!=='range')return set.title;const count=setWords(set.id).length;if(!count)return set.title;const r=normalizedRange(count,from,to);return `${set.title} · Vokabeln ${r.from}–${r.to}`}
function scopedWordsForSeries(cfg,subject=state.activeSubject){if(!cfg||!cfg.setId)return [];const set=state.sets.find(s=>s.id===cfg.setId&&s.learnerId===state.activeLearnerId&&s.subject===subject);return scopedWordsForSet(set,cfg.scopeMode,cfg.from,cfg.to,cfg.selectedLinkIds)}
function seriesScopeText(cfg){if(!cfg)return '';const set=state.sets.find(s=>s.id===cfg.setId);return scopeTextForSet(set,cfg.scopeMode,cfg.from,cfg.to,cfg.selectedLinkIds)}
function recallDirectionForMode(mode=''){
  const key=String(mode||'');
  if(key==='recall'||key==='cards')return 'target';
  if(key==='reverseRecall')return 'source';
  return '';
}
function recordDirectionalRecallResult(w,{mode='',correct=false,assisted=false}={}){
  const direction=recallDirectionForMode(mode);if(!w||!direction||assisted)return '';
  const all=normalizeDirectionalRecall(w.directionalRecall),node=all[direction],now=new Date().toISOString();
  node.lastCorrect=!!correct;node.lastAt=now;
  if(correct)node.successDays=[...new Set([...(node.successDays||[]),today()])].slice(-1000);
  w.directionalRecall=all;return direction;
}
function directionalRecallReady(w,direction){
  const node=normalizeDirectionalRecall(w?.directionalRecall)[direction];
  return !!(node&&node.lastCorrect===true&&(node.successDays||[]).length>0);
}
function testFormatDirectionReady(w,testFormat='target'){
  const format=['target','source','mixed','dictation'].includes(testFormat)?testFormat:'target';
  if(format==='dictation')return true;
  if(format==='source')return directionalRecallReady(w,'source');
  if(format==='mixed')return directionalRecallReady(w,'target')&&directionalRecallReady(w,'source');
  return directionalRecallReady(w,'target');
}
function testReadinessScore(w){
  const s={...defaultSkills(),...(w.skills||{})};
  const activeCore=((s.retrieval||0)*.52+(s.spelling||0)*.40+(s.context||0)*.08)/4;
  const activeDays=Math.min(1,(w.activeSuccessDays||[]).length/2); const delayed=Math.min(1,(w.maxActiveGapDays||0)/3);
  return Math.round((activeCore*.72+activeDays*.18+delayed*.10)*100);
}
function isTestReady(w,testFormat='target'){
  const s={...defaultSkills(),...(w.skills||{})};
  const base=isMastered(w)||(testReadinessScore(w)>=65&&(s.retrieval||0)>=2&&(s.spelling||0)>=2&&(w.activeSuccessDays||[]).length>=2&&(w.coldRecallDays||[]).length>=1&&(w.maxActiveGapDays||0)>=1);
  return !!(base&&testFormatDirectionReady(w,testFormat));
}
function testReadinessForContext(ctx){
  const words=ctx?.words||[]; if(!words.length)return {total:0,ready:0,pct:0,avg:0,weak:[]};
  const testFormat=ctx?.testFormat||'target';
  const ready=words.filter(w=>isTestReady(w,testFormat)).length; const avg=Math.round(words.reduce((sum,w)=>sum+testReadinessScore(w),0)/words.length);
  const weak=[...words].sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b));
  return {total:words.length,ready,pct:Math.round(ready/words.length*100),avg,weak};
}
function testContextPriority(a,b){
  if(!a)return b;if(!b)return a;
  const ad=Number(a.days),bd=Number(b.days),aDue=ad<=0,bDue=bd<=0;
  if(aDue!==bDue)return aDue?a:b;
  if(aDue&&bDue)return a.date>=b.date?a:b;
  return a.date<=b.date?a:b;
}
function upcomingTestContext(subject=state.activeSubject){
  const l=learner(),explicit=mySets(subject).filter(s=>!setNeedsPairReview(s)&&s.testDate&&!isExplicitTestSetCompletedForLearner(l,s,subject)&&setWords(s.id).length);
  const overdue=explicit.filter(s=>daysUntil(s.testDate)<=0).sort((a,b)=>b.testDate.localeCompare(a.testDate)),future=explicit.filter(s=>daysUntil(s.testDate)>0).sort((a,b)=>a.testDate.localeCompare(b.testDate));
  const lead=overdue[0]||future[0]||null;let single=null;
  if(lead){
    const date=lead.testDate,planId=testPlanIdentityForSet(lead),sets=explicit.filter(s=>s.testDate===date&&testPlanIdentityForSet(s)===planId),words=uniqueWords(sets.flatMap(set=>scopedWordsForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds)));
    single={date,days:daysUntil(date),sets,words,source:'single',planId,testFormat:sets[0]?.testFormat||'target',scopeText:sets.map(set=>scopeTextForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds)).join(' + ')};
  }
  const cfg=activeSeries(subject); let recurring=null;
  if(cfg){const date=seriesOccurrenceDate(subject),set=state.sets.find(s=>s.id===cfg.setId&&s.learnerId===state.activeLearnerId&&s.subject===subject),words=scopedWordsForSeries(cfg,subject);if(date&&cfg.scopeDate===date&&!isTestCompleted(date,subject)&&set&&words.length)recurring={date,days:daysUntil(date),sets:[set],words,source:'series',planId:`series:${set.id}:${date}`,series:cfg,testFormat:cfg.testFormat||'target',scopeText:seriesScopeText(cfg)}}
  if(single&&recurring&&single.date===recurring.date&&single.sets.some(s=>s.id===recurring.sets[0]?.id))return {...single,series:cfg};
  return testContextPriority(single,recurring);
}
function completeTestContext(ctx=upcomingTestContext(),subject=state.activeSubject){
  if(!ctx?.date||daysUntil(ctx.date)>0)return null;
  const l=learner(),planId=String(ctx.planId||ctx.sets?.map(s=>testPlanIdentityForSet(s)).sort().join('+')||ctx.source||'test'),key=testCompletionKey(subject,ctx.date,planId),existing=testCompletions(l)[key];if(existing)return existing;
  const wanted=new Set((ctx.sets||[]).map(s=>s.id)),fortress=testFortressHistory(subject).find(f=>f.testDate===ctx.date&&(!wanted.size||(f.setIds||[]).some(id=>wanted.has(id))))||null,stamp=new Date().toISOString();
  const row={subject,date:ctx.date,testPlanId:planId,completedAt:stamp,scopeText:ctx.scopeText||ctx.sets?.map(s=>s.title).join(' + ')||'',setIds:(ctx.sets||[]).map(s=>s.id),wordCount:(ctx.words||[]).length,source:ctx.source||'single',testFormat:ctx.testFormat||'target',fortressKey:fortress?.key||''};
  testCompletions(l)[key]=row;
  if(fortress)fortress.testCompletedAt=stamp;
  if(l.dailyPlans)delete l.dailyPlans[`${today()}:${subject}`];
  recordActivity('testCompleted',{subject,testDate:ctx.date,source:row.source,wordCount:row.wordCount,fortressKey:row.fortressKey});
  if(typeof persistOnly==='function')persistOnly();
  return row;
}
function uniqueById(list){const seen=new Set();return list.filter(x=>x&&!seen.has(x.id)&&seen.add(x.id))}
function testContextLabel(ctx,subject=state.activeSubject){if(!ctx)return '';const subjectName=subjectLabel(subject);const when=ctx.days===0?'heute':ctx.days===1?'morgen':ctx.days<0?`vor ${Math.abs(ctx.days)} Tag${Math.abs(ctx.days)===1?'':'en'}`:`in ${ctx.days} Tagen`;const recurrence=ctx.source==='series'||ctx.source==='mixed'?` · wöchentlich ${WEEKDAYS_SHORT[Number(ctx.series?.weekday)||0]}`:'';return `${subjectName}-Test ${when}${recurrence} · ${ctx.scopeText||ctx.sets.map(s=>s.title).join(' + ')}`}
const DAILY_PLAN_SCHEMA='daily3';
function dailyPlanSignature(ctx,subject,sessionSize){
  const words=(ctx?ctx.words:schoolYearVerifiedWords(subject)).map(w=>w.id).sort().join(',');
  return `${DAILY_PLAN_SCHEMA}:${ctx?`test:${ctx.source||'single'}:${ctx.date}:${ctx.sets.map(s=>s.id).sort().join(',')}`:`general:${currentSchoolYear()}`}:${sessionSize}:${words}`;
}
function dailyPlanSignatureCompatible(stored,current){
  const legacy=String(stored||'').replace(/^v?\d+\.\d+\.\d+:/,`${DAILY_PLAN_SCHEMA}:`);
  return legacy===String(current||'');
}
function recoverLegacyDailyPlanCompletion(plan,l=learner()){
  if(!plan||plan.date!==today()||!l)return plan;
  normalizeDailyAdaptivePlan(plan,l);
  const eligible=new Set((state.activity||[]).filter(a=>{
    if(a?.learnerId!==l.id||a?.correct!==true||a?.active!==true||a?.assisted===true||a?.orthographyOk===false||!a?.wordId)return false;
    const d=new Date(a.date||'');return !Number.isNaN(d.getTime())&&dateKey(d)===today();
  }).map(a=>String(a.wordId)));
  if(!eligible.size)return plan;
  const done=new Set(plan.completedKeys||[]);
  for(const ref of dailyPlanRefs(plan,false)){
    if(!eligible.has(String(ref.wordId||'')))continue;
    const key=dailyPlanRefKey(ref);if(key)done.add(key);
  }
  plan.completedKeys=[...done];
  return plan;
}
function uniqueWords(list){const seen=new Set();return list.filter(w=>w&&!seen.has(w.id)&&seen.add(w.id))}
function testLearningWindow(ctx){
  const days=Math.max(0,Number(ctx?.days)||0);
  const studyDaysBeforeTest=days;
  const reviewOnlyDays=days>=2?1:0;
  const acquisitionDays=days===0?0:(days===1?1:Math.max(1,days-reviewOnlyDays));
  return {daysToTest:days,studyDaysBeforeTest,reviewOnlyDays,acquisitionDays};
}
function dailyPacePlan(pendingCount,weakCount,ctx,reducedLoad=false){
  pendingCount=Math.max(0,Number(pendingCount)||0);weakCount=Math.max(0,Number(weakCount)||0);
  const coreMax=reducedLoad?4:6,coreMin=reducedLoad?3:5,maxNew=reducedLoad?2:3;
  if(!ctx){
    const quota=Math.min(pendingCount,maxNew),dailyTarget=(pendingCount+weakCount)<=coreMin?coreMin:coreMax;
    return {quota,requiredPerDay:pendingCount?maxNew:0,requiredReviewPerDay:0,overload:false,spacingRisk:false,recommendSecondRound:false,dailyTarget,coreMax,coreMin,maxNew,pace:dailyTarget===coreMin?'ahead':'normal',...testLearningWindow(null)};
  }
  const window=testLearningWindow(ctx);
  let requiredPerDay=0,quota=0;
  if(pendingCount){
    if(window.acquisitionDays<1)requiredPerDay=pendingCount;
    else{
      requiredPerDay=Math.ceil(pendingCount/window.acquisitionDays);
      quota=Math.min(pendingCount,maxNew,Math.max(1,requiredPerDay));
    }
  }
  const spacingRisk=!!(pendingCount&&window.daysToTest<=1);
  const reviewDays=Math.max(1,window.studyDaysBeforeTest),requiredReviewPerDay=weakCount?Math.ceil(weakCount/reviewDays):0;
  const reviewCapacity=Math.max(0,coreMax-quota);
  const overload=requiredPerDay>maxNew||requiredReviewPerDay>reviewCapacity||(window.acquisitionDays<1&&pendingCount>0);
  const light=!overload&&!spacingRisk&&requiredPerDay<=1&&requiredReviewPerDay<=Math.max(0,coreMin-quota);
  const dailyTarget=light?coreMin:coreMax;
  const recommendSecondRound=overload||spacingRisk;
  const pace=overload?'overload':spacingRisk?'catchup':light?'ahead':'normal';
  return {quota,requiredPerDay,requiredReviewPerDay,overload,spacingRisk,recommendSecondRound,dailyTarget,coreMax,coreMin,maxNew,pace,...window};
}
function dailyIntroQuota(pendingCount,ctx,weakCount=0,reducedLoad=false){return dailyPacePlan(pendingCount,weakCount,ctx,reducedLoad)}
function normalizeDailyAdaptivePlan(plan,l=learner()){
  if(!plan||typeof plan!=='object')return plan;
  plan.completedKeys=Array.isArray(plan.completedKeys)?plan.completedKeys:[];
  plan.todaySecureKeys=Array.isArray(plan.todaySecureKeys)?plan.todaySecureKeys:[];
  plan.securityEvidence=plan.securityEvidence&&typeof plan.securityEvidence==='object'&&!Array.isArray(plan.securityEvidence)?plan.securityEvidence:{};
  plan.extraRefs=Array.isArray(plan.extraRefs)?plan.extraRefs:[];
  plan.extraSources=plan.extraSources&&typeof plan.extraSources==='object'&&!Array.isArray(plan.extraSources)?plan.extraSources:{};
  plan.rescueSeenKeys=Array.isArray(plan.rescueSeenKeys)?plan.rescueSeenKeys:[];
  plan.rescueCorrectKeys=Array.isArray(plan.rescueCorrectKeys)?plan.rescueCorrectKeys:[];
  plan.rescueWrongKeys=Array.isArray(plan.rescueWrongKeys)?plan.rescueWrongKeys:[];
  plan.rescueRounds=Math.max(0,Number(plan.rescueRounds)||0);
  const modeLimit=reducedLoadEnabled(l)?2:3,storedLimit=Number.isFinite(Number(plan.extraLimit))?Number(plan.extraLimit):modeLimit;
  plan.extraLimit=Math.max(0,Math.min(modeLimit,storedLimit));
  if(plan.extraRefs.length>plan.extraLimit)plan.extraRefs=plan.extraRefs.slice(0,plan.extraLimit);
  return plan;
}
function buildDailyPlan(subject=state.activeSubject){
  const l=learner();l.dailyPlans=l.dailyPlans||{};
  const reducedLoad=reducedLoadEnabled(l),sessionSize=reducedLoad?4:6,ctx=upcomingTestContext(subject),key=`${today()}:${subject}`,signature=dailyPlanSignature(ctx,subject,sessionSize);
  const existing=l.dailyPlans[key];
  if(existing&&dailyPlanSignatureCompatible(existing.signature,signature)){
    normalizeDailyAdaptivePlan(existing,l);
    const refs=[...(existing.wordRefs||[]),...(existing.introRefs||[])];
    if(refs.every(r=>r.setLinkId?!!wordByLinkId(r.setLinkId):!!wordById(r.wordId))){
      if(existing.signature!==signature){
        recoverLegacyDailyPlanCompletion(existing,l);
        existing.signature=signature;
        persistOnly();
      }
      return existing;
    }
  }

  if(existing){normalizeDailyAdaptivePlan(existing,l);recoverLegacyDailyPlanCompletion(existing,l)}
  const pool=ctx?ctx.words:schoolYearVerifiedWords(subject),poolIds=new Set(pool.map(w=>w.id));
  const previousCompleted=new Set(Array.isArray(existing?.completedKeys)?existing.completedKeys:[]);
  const preservedDoneWords=existing?dailyPlanRefs(existing,false)
    .filter(ref=>previousCompleted.has(dailyPlanRefKey(ref)))
    .map(ref=>ref.setLinkId?wordByLinkId(ref.setLinkId):wordById(ref.wordId))
    .filter(w=>w&&poolIds.has(w.id)):[];
  const hasLearningContact=w=>Number(w?.repetitions||0)>0||(w?.activePracticeDays||[]).length>0;
  const pending=pool.filter(w=>!hasLearningContact(w)),ready=pool.filter(hasLearningContact);
  const testFormat=ctx?.testFormat||'target',weakReady=ready.filter(w=>!isTestReady(w,testFormat)),introPlan=dailyIntroQuota(pending.length,ctx,weakReady.length,reducedLoad),dailyTarget=introPlan.dailyTarget;
  const firstPending=pending[0],introSetId=firstPending?.setId||'';
  const introWords=introSetId?pending.filter(w=>w.setId===introSetId).slice(0,introPlan.quota):[];
  const reviewTarget=Math.max(0,dailyTarget-introWords.length);
  const due=ready.filter(w=>!w.dueDate||w.dueDate<=today()).sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b));
  const seenWeak=ready.filter(w=>!isTestReady(w,testFormat)).sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b));
  let selected=uniqueWords([...preservedDoneWords,...due,...seenWeak,...ready]).slice(0,reviewTarget),maintenanceCount=0;

  if(!ctx&&selected.length<reviewTarget){
    const maintenance=dueWords(subject).filter(w=>!poolIds.has(w.id)).slice(0,reviewTarget-selected.length);
    const before=selected.length;selected=uniqueWords([...selected,...maintenance]).slice(0,reviewTarget);maintenanceCount=selected.length-before;
  }

  const phase=ctx?(ctx.days<=1?'rehearse':ctx.days<=3?'consolidate':'acquire'):'general';
  const urgent=!!(introPlan.overload||(ctx&&ctx.days<=1&&pending.length));
  const plan={
    date:today(),subject,signature,source:ctx?(ctx.source||'test'):'general',testDate:ctx?.date||'',testFormat,
    setIds:ctx?.sets.map(s=>s.id)||[],setTitle:ctx?.scopeText||ctx?.sets.map(s=>s.title).join(' + ')||'',
    wordIds:selected.map(w=>w.id),wordRefs:selected.map(w=>({wordId:w.id,setLinkId:w.setLinkId||''})),
    introRefs:introWords.map(w=>({wordId:w.id,setLinkId:w.setLinkId||''})),introSetId,
    introCount:introWords.length,reviewCount:selected.length,dailyTarget,requiredNewPerDay:introPlan.requiredPerDay,requiredReviewPerDay:introPlan.requiredReviewPerDay,
    deadlineOverload:introPlan.overload,spacingRisk:introPlan.spacingRisk,recommendSecondRound:!!introPlan.recommendSecondRound,coreMax:introPlan.coreMax,maxNew:introPlan.maxNew,pace:introPlan.pace,studyDaysBeforeTest:introPlan.studyDaysBeforeTest,acquisitionDays:introPlan.acquisitionDays,reviewOnlyDays:introPlan.reviewOnlyDays,
    sessionSize,urgent,phase,maintenanceCount,completedKeys:[],todaySecureKeys:[],securityEvidence:{},extraRefs:[],extraSources:{},extraLimit:reducedLoad?2:3,
    rescueSeenKeys:[],rescueCorrectKeys:[],rescueWrongKeys:[],rescueRounds:0,createdAt:new Date().toISOString()
  };
  normalizeDailyAdaptivePlan(plan,l);
  if(existing){
    const allowed=new Set(dailyPlanRefs(plan,true).map(dailyPlanRefKey).filter(Boolean));
    plan.completedKeys=[...new Set(existing.completedKeys||[])].filter(k=>allowed.has(k));
    plan.todaySecureKeys=[...new Set(existing.todaySecureKeys||[])].filter(k=>allowed.has(k));
    plan.securityEvidence=Object.fromEntries(Object.entries(existing.securityEvidence||{}).filter(([k])=>allowed.has(k)));
    plan.rescueSeenKeys=[...new Set(existing.rescueSeenKeys||[])];
    plan.rescueCorrectKeys=[...new Set(existing.rescueCorrectKeys||[])];
    plan.rescueWrongKeys=[...new Set(existing.rescueWrongKeys||[])];
    plan.rescueRounds=Math.max(0,Number(existing.rescueRounds)||0);
    recoverLegacyDailyPlanCompletion(plan,l);
  }
  l.dailyPlans[key]=plan;Object.keys(l.dailyPlans).filter(k=>k<`${datePlusDays(-21)}:`).forEach(k=>delete l.dailyPlans[k]);persistOnly();return plan;
}
function wordPracticedToday(w){return !!(w?.activePracticeDays||[]).includes(today())}
function dailyPlanRefKey(ref){return ref?.setLinkId?`link:${ref.setLinkId}`:ref?.wordId?`word:${ref.wordId}`:''}
function dailyPlanRefs(plan=buildDailyPlan(),includeExtra=true){
  if(!plan)return [];
  const review=Array.isArray(plan.wordRefs)&&plan.wordRefs.length?plan.wordRefs:(plan.wordIds||[]).map(id=>({wordId:id,setLinkId:''}));
  const intro=Array.isArray(plan.introRefs)?plan.introRefs:[];
  const extra=includeExtra&&Array.isArray(plan.extraRefs)?plan.extraRefs:[];
  return [...review,...intro,...extra];
}
function dailyPlanHasLearningContact(w){return Number(w?.repetitions||0)>0||(w?.activePracticeDays||[]).length>0}
function t1RescuePlan(plan=buildDailyPlan()){
  if(!plan||plan.date!==today())return {available:false,recommended:false,urgent:false,refs:[],weakTotal:0,unseenTotal:0,wrongTotal:0,roundSize:0};
  normalizeDailyAdaptivePlan(plan);
  const ctx=upcomingTestContext(plan.subject);
  if(!ctx||Number(ctx.days)!==1||!ctx.words?.length)return {available:false,recommended:false,urgent:false,refs:[],weakTotal:0,unseenTotal:0,wrongTotal:0,roundSize:0};
  const format=ctx.testFormat||plan.testFormat||'target',roundSize=reducedLoadEnabled()?4:6;
  const weak=ctx.words.filter(w=>!isTestReady(w,format));
  if(!weak.length)return {available:false,recommended:false,urgent:false,refs:[],weakTotal:0,unseenTotal:0,wrongTotal:0,roundSize};
  const seen=new Set(plan.rescueSeenKeys||[]),correct=new Set(plan.rescueCorrectKeys||[]),wrong=new Set(plan.rescueWrongKeys||[]);
  const refFor=w=>({wordId:w.id,setLinkId:w.setLinkId||''}),keyFor=w=>dailyPlanRefKey(refFor(w));
  const wrongWords=weak.filter(w=>wrong.has(keyFor(w))).sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b));
  const unseenWords=weak.filter(w=>!seen.has(keyFor(w))&&!wrong.has(keyFor(w))).sort((a,b)=>{
    const au=dailyPlanHasLearningContact(a)?1:0,bu=dailyPlanHasLearningContact(b)?1:0;
    return au-bu||testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b);
  });
  const candidates=uniqueWords([...wrongWords,...unseenWords]);
  const refs=candidates.slice(0,roundSize).map(refFor);
  const recommended=weak.length>0,urgent=weak.length>roundSize;
  return {available:refs.length>0,recommended,urgent,refs,weakTotal:weak.length,unseenTotal:unseenWords.length,wrongTotal:wrongWords.length,roundSize,allSeen:weak.every(w=>seen.has(keyFor(w))),allRescuedToday:weak.every(w=>correct.has(keyFor(w))||isTestReady(w,format))};
}
function recordT1RescueResult(w,{correct=false,active=false,assisted=false,orthographyOk=true}={},plan=buildDailyPlan()){
  if(!w||!plan||!active)return false;
  const ctx=upcomingTestContext(plan.subject);if(!ctx||Number(ctx.days)!==1)return false;
  normalizeDailyAdaptivePlan(plan);
  const key=dailyPlanRefKey({wordId:w.id,setLinkId:w.setLinkId||''});if(!key)return false;
  plan.rescueSeenKeys=[...new Set([...plan.rescueSeenKeys,key])];
  const good=!!(correct&&!assisted&&orthographyOk!==false);
  const correctSet=new Set(plan.rescueCorrectKeys),wrongSet=new Set(plan.rescueWrongKeys);
  if(good){correctSet.add(key);wrongSet.delete(key)}else{correctSet.delete(key);wrongSet.add(key)}
  plan.rescueCorrectKeys=[...correctSet];plan.rescueWrongKeys=[...wrongSet];persistOnly();return true;
}
function markT1RescueRoundStarted(plan=buildDailyPlan()){
  if(!plan)return 0;normalizeDailyAdaptivePlan(plan);plan.rescueRounds=(Number(plan.rescueRounds)||0)+1;persistOnly();return plan.rescueRounds;
}
function dailyPlanReplacementCandidate(plan=buildDailyPlan()){
  if(!plan||plan.date!==today()||plan.subject!==state.activeSubject)return null;
  normalizeDailyAdaptivePlan(plan);
  if(plan.extraRefs.length>=plan.extraLimit)return null;
  const used=new Set(dailyPlanRefs(plan,true).map(dailyPlanRefKey).filter(Boolean));
  const available=w=>{const key=dailyPlanRefKey({wordId:w?.id,setLinkId:w?.setLinkId||''});return !!key&&!used.has(key)};
  const ctx=upcomingTestContext(plan.subject),testFormat=ctx?.testFormat||plan.testFormat||'target',scope=ctx?.words?.length?ctx.words:schoolYearVerifiedWords(plan.subject);
  const extraNewCount=Object.values(plan.extraSources||{}).filter(source=>source==='new').length;
  const introducedNewCount=Math.max(0,Number(plan.introCount)||0)+extraNewCount,newDailyLimit=reducedLoadEnabled()?4:6;
  const allowNew=(!ctx||Number(ctx.days)>3)&&introducedNewCount<newDailyLimit;
  if(allowNew){
    const unknown=scope.find(w=>available(w)&&!dailyPlanHasLearningContact(w));
    if(unknown)return {ref:{wordId:unknown.id,setLinkId:unknown.setLinkId||''},source:'new'};
  }
  if(ctx){
    const weak=ctx.words.filter(w=>available(w)&&dailyPlanHasLearningContact(w)&&!isTestReady(w,testFormat))
      .sort((a,b)=>testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b))[0];
    if(weak)return {ref:{wordId:weak.id,setLinkId:weak.setLinkId||''},source:'weak-test'};
  }
  const due=dueWords(plan.subject).filter(w=>available(w)&&dailyPlanHasLearningContact(w))
    .sort((a,b)=>String(a.dueDate||'').localeCompare(String(b.dueDate||''))||testReadinessScore(a)-testReadinessScore(b)||masteryScore(a)-masteryScore(b))[0];
  return due?{ref:{wordId:due.id,setLinkId:due.setLinkId||''},source:'due'}:null;
}
function recordDailySecurityResult(w,{correct=false,active=false,assisted=false,orthographyOk=true,wasTestReady=null,skill=''}={},plan=buildDailyPlan()){
  if(!w||!plan||plan.date!==today()||plan.subject!==state.activeSubject||!active)return {becameSecure:false,replacementRef:null,replacementSource:''};
  normalizeDailyAdaptivePlan(plan);
  const key=dailyPlanRefKey({wordId:w.id,setLinkId:w.setLinkId||''});if(!key)return {becameSecure:false,replacementRef:null,replacementSource:''};
  const allowed=new Set(dailyPlanRefs(plan,true).map(dailyPlanRefKey).filter(Boolean));
  if(!allowed.has(key))return {becameSecure:false,replacementRef:null,replacementSource:''};
  const secure=new Set(plan.todaySecureKeys);
  if(secure.has(key))return {becameSecure:false,replacementRef:null,replacementSource:'',required:Number(plan.securityEvidence?.[key]?.required)||1};
  const evidence=plan.securityEvidence[key]&&typeof plan.securityEvidence[key]==='object'?plan.securityEvidence[key]:{};
  if(!Number.isFinite(Number(evidence.required))||Number(evidence.required)<1)evidence.required=(wasTestReady===true||(wasTestReady==null&&isTestReady(w,plan.testFormat||'target')))?1:2;
  evidence.required=Math.max(1,Math.min(2,Number(evidence.required)||2));
  evidence.attempts=(Number(evidence.attempts)||0)+1;
  evidence.lastAt=new Date().toISOString();
  if(correct&&!assisted&&orthographyOk!==false){
    evidence.successStreak=(Number(evidence.successStreak)||0)+1;
    if(skill==='spelling')evidence.spellingConfirmed=true;
    evidence.lastOutcome='independent-correct';
  }else if(!correct||orthographyOk===false){
    evidence.successStreak=0;
    evidence.lastOutcome=orthographyOk===false?'orthography-error':'wrong';
  }else{
    evidence.lastOutcome='assisted';
  }
  plan.securityEvidence[key]=evidence;
  const needsSpelling=spellingSupportEnabled()&&!evidence.spellingConfirmed;
  if(evidence.successStreak<evidence.required||needsSpelling)return {becameSecure:false,replacementRef:null,replacementSource:'',required:evidence.required,successStreak:evidence.successStreak,needsSpelling};
  plan.todaySecureKeys=[...new Set([...plan.todaySecureKeys,key])];
  evidence.secureAt=evidence.secureAt||new Date().toISOString();
  const ctx=upcomingTestContext(plan.subject),replacement=Number(ctx?.days)===1?null:dailyPlanReplacementCandidate(plan);
  if(replacement?.ref){
    plan.extraRefs=[...plan.extraRefs,replacement.ref];
    const replacementKey=dailyPlanRefKey(replacement.ref);if(replacementKey)plan.extraSources[replacementKey]=replacement.source||'';
  }
  return {becameSecure:true,replacementRef:replacement?.ref||null,replacementSource:replacement?.source||'',required:evidence.required,successStreak:evidence.successStreak,needsSpelling:false};
}
function ensureDailyRecommendedRound(plan=buildDailyPlan()){
  if(!plan?.recommendSecondRound)return false;
  normalizeDailyAdaptivePlan(plan);
  if(Number(upcomingTestContext(plan.subject)?.days)===1)return false;
  const required=new Set(dailyPlanRefs(plan,false).map(dailyPlanRefKey).filter(Boolean)),done=new Set(plan.completedKeys||[]);
  if([...required].some(k=>!done.has(k)))return false;
  let changed=false;
  while(plan.extraRefs.length<plan.extraLimit){
    const candidate=dailyPlanReplacementCandidate(plan);if(!candidate?.ref)break;
    plan.extraRefs.push(candidate.ref);
    const k=dailyPlanRefKey(candidate.ref);if(k)plan.extraSources[k]=candidate.source||'';
    changed=true;
  }
  if(changed)persistOnly();
  return changed;
}
function markDailyPlanWordDone(w,plan=buildDailyPlan()){
  if(!w||!plan||plan.date!==today()||plan.subject!==state.activeSubject)return false;
  const key=dailyPlanRefKey({wordId:w.id,setLinkId:w.setLinkId||''});if(!key)return false;
  plan.completedKeys=[...new Set([...(Array.isArray(plan.completedKeys)?plan.completedKeys:[]),key])];
  ensureDailyRecommendedRound(plan);
  return true;
}
function dailyPlanStatus(plan=buildDailyPlan()){
  normalizeDailyAdaptivePlan(plan);
  const reviewRefs=Array.isArray(plan.wordRefs)&&plan.wordRefs.length?plan.wordRefs:(plan.wordIds||[]).map(id=>({wordId:id,setLinkId:''}));
  const introRefs=Array.isArray(plan.introRefs)?plan.introRefs:[];
  const extraRefs=Array.isArray(plan.extraRefs)?plan.extraRefs:[];
  const reviewPairs=reviewRefs.map(r=>({ref:r,word:r.setLinkId?wordByLinkId(r.setLinkId):wordById(r.wordId)})).filter(x=>x.word);
  const introPairs=introRefs.map(r=>({ref:r,word:r.setLinkId?wordByLinkId(r.setLinkId):wordById(r.wordId)})).filter(x=>x.word);
  const extraPairs=extraRefs.map(r=>({ref:r,word:r.setLinkId?wordByLinkId(r.setLinkId):wordById(r.wordId)})).filter(x=>x.word);
  const completed=new Set([...(Array.isArray(plan.completedKeys)?plan.completedKeys:[]),...(Array.isArray(plan.reviewPendingKeys)?plan.reviewPendingKeys:[])]);
  const secure=new Set(Array.isArray(plan.todaySecureKeys)?plan.todaySecureKeys:[]);
  const reviewDone=reviewPairs.filter(x=>completed.has(dailyPlanRefKey(x.ref))),reviewRemaining=reviewPairs.filter(x=>!completed.has(dailyPlanRefKey(x.ref)));
  const introDone=introPairs.filter(x=>completed.has(dailyPlanRefKey(x.ref))),introRemaining=introPairs.filter(x=>!completed.has(dailyPlanRefKey(x.ref)));
  const extraDone=extraPairs.filter(x=>secure.has(dailyPlanRefKey(x.ref))),extraRemaining=extraPairs.filter(x=>!secure.has(dailyPlanRefKey(x.ref)));
  const total=reviewPairs.length+introPairs.length,done=reviewDone.length+introDone.length,remaining=reviewRemaining.length+introRemaining.length;
  return {
    total,done,remaining,
    introTotal:introPairs.length,introDone:introDone.length,introRemaining:introRemaining.length,
    reviewTotal:reviewPairs.length,reviewDone:reviewDone.length,reviewRemaining:reviewRemaining.length,
    extraTotal:extraPairs.length,extraDone:extraDone.length,extraRemaining:extraRemaining.length,extraLimit:plan.extraLimit,secureToday:secure.size,
    remainingIntroRefs:introRemaining.map(x=>x.ref),remainingReviewRefs:reviewRemaining.map(x=>x.ref),remainingExtraRefs:extraRemaining.map(x=>x.ref),
    remainingIds:reviewRemaining.map(x=>x.word.id),remainingRefs:reviewRemaining.map(x=>x.ref),
    units:remaining?Math.ceil(remaining/Math.max(1,Number(plan.sessionSize)||6)):0
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
  if(status.remaining){
    const refs=[...(status.remainingIntroRefs||[]),...(status.remainingReviewRefs||status.remainingRefs||status.remainingIds||[])];
    startSession('adaptive',null,refs.slice(0,plan.sessionSize),true);return;
  }
  const rescue=t1RescuePlan(plan);
  if(rescue.available){startT1RescueRound();return}
  if(status.extraRemaining){
    startSession('adaptive',null,(status.remainingExtraRefs||[]).slice(0,plan.sessionSize),true,{bonusMode:true});return;
  }
  toast(rescue.recommended?'Rettungsrunde für jetzt abgeschlossen. Eine Pause ist sinnvoll.':'Tagesziel erledigt. Weitere Übungen sind optional.',rescue.recommended?'subtle':'good');
}