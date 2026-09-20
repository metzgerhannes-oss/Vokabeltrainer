'use strict';

/*
  Quiz Engine
  ----------
  A learning question is an immutable snapshot. Rendering, grading and the
  result review all use exactly the same snapshot. No answer is re-derived
  from mutable library/state data after the question was shown.
*/

function quizUnique(values){
  const out=[];
  for(const value of (Array.isArray(values)?values:[values])){
    const clean=String(value??'').trim();
    if(clean&&!out.includes(clean))out.push(clean);
  }
  return out;
}
function quizSemanticMatches(answer,targets){
  const a=normalize(answer);if(!a)return false;
  return quizUnique(targets).some(t=>a===normalize(t));
}
function quizOrthographyMatches(answer,targets){
  const a=orthographyNormalize(answer);if(!a)return false;
  return quizUnique(targets).some(t=>a===orthographyNormalize(t));
}
function quizQueueRef(w){
  return Object.freeze({
    setLinkId:String(w?.setLinkId||''),
    progressId:String(w?.id||''),
    setId:String(w?.setId||''),
    vocabId:String(w?.vocabId||''),
    senseId:String(w?.senseId||'')
  });
}
function resolveQuizQueueRef(ref,preferredSetId=''){
  if(!ref)return null;
  if(typeof ref==='string')return wordByLinkId(ref)||wordById(ref,preferredSetId||'');
  if(typeof ref!=='object')return null;
  const w=ref.setLinkId?wordByLinkId(ref.setLinkId):wordById(ref.progressId||ref.wordId,ref.setId||preferredSetId||'');
  if(!w)return null;
  if(ref.setId&&w.setId!==ref.setId)return null;
  if(ref.vocabId&&w.vocabId!==ref.vocabId)return null;
  if(ref.senseId&&w.senseId!==ref.senseId)return null;
  if(ref.progressId&&w.id!==ref.progressId)return null;
  return w;
}
function quizQuestionMode(mode,w){
  if(mode==='reverseRecall'&&!meaningRecallHasCue(w))return 'recall';
  return mode||'recall';
}
function quizContextPrompt(w){
  const ex=w?.example||`${w?.term||''} — ${w?.translation||''}`;
  const term=String(w?.term||'');
  if(!term)return ex;
  const rx=new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');
  return ex.replace(rx,'________');
}
function makeQuizQuestion(w,mode,opts={}){
  const actualMode=quizQuestionMode(mode,w);
  const terms=quizUnique(termTargets(w));
  const translations=quizUnique(translationTargets(w));
  const base={
    id:uid('q'),
    setLinkId:String(w?.setLinkId||''),
    progressId:String(w?.id||''),
    setId:String(w?.setId||''),
    vocabId:String(w?.vocabId||''),
    senseId:String(w?.senseId||''),
    subject:String(w?.subject||state?.activeSubject||''),
    mode:actualMode,
    term:String(w?.term||''),
    translation:String(w?.translation||''),
    acceptedTerms:terms,
    acceptedTranslations:translations,
    prompt:'',
    targets:[],
    answerSide:'',
    strictOrthography:false,
    trackOrthography:false,
    audio:false,
    createdAt:new Date().toISOString()
  };
  if(actualMode==='reverseRecall'){
    base.prompt=base.term;base.targets=translations;base.answerSide='translation';
  }else if(actualMode==='listening'){
    base.prompt='🔊 Wort anhören';base.targets=terms;base.answerSide='term';base.trackOrthography=false;base.audio=true;
  }else if(actualMode==='recognition'){
    const reverse=ambiguousSenseWord(w)&&!meaningRecallHasCue(w);
    base.prompt=reverse?base.translation:base.term;
    base.targets=reverse?terms:translations;
    base.answerSide=reverse?'term':'translation';
  }else if(actualMode==='spelling'){
    base.prompt=base.translation;base.targets=terms;base.answerSide='term';base.strictOrthography=true;base.trackOrthography=true;base.audio=true;
  }else if(actualMode==='context'){
    base.prompt=quizContextPrompt(w);base.targets=terms;base.answerSide='term';base.trackOrthography=true;
  }else{
    base.prompt=base.translation;base.targets=terms;base.answerSide='term';base.trackOrthography=true;
  }
  if(opts.prompt!=null)base.prompt=String(opts.prompt);
  if(opts.targets)base.targets=quizUnique(opts.targets);
  if(opts.strictOrthography!=null)base.strictOrthography=!!opts.strictOrthography;
  return Object.freeze({...base,targets:Object.freeze([...base.targets]),acceptedTerms:Object.freeze([...terms]),acceptedTranslations:Object.freeze([...translations])});
}
function validateQuizQuestion(q){
  const issues=[];
  if(!q)issues.push('question-missing');
  if(!q?.prompt?.trim())issues.push('prompt-missing');
  if(!q?.targets?.length)issues.push('targets-missing');
  if(!q?.setLinkId)issues.push('set-link-missing');
  if(q?.setLinkId){
    const link=(state?.setVocabulary||[]).find(x=>x.id===q.setLinkId);
    if(!link)issues.push('set-link-not-found');
    else{
      if(q.setId&&link.setId!==q.setId)issues.push('set-mismatch');
      if(q.vocabId&&link.vocabId!==q.vocabId)issues.push('vocab-mismatch');
      if(q.senseId&&link.senseId!==q.senseId)issues.push('sense-mismatch');
    }
  }
  const set=(state?.sets||[]).find(x=>x.id===q?.setId);
  if(q?.setId&&!set)issues.push('set-not-found');
  if(set&&set.learnerId!==state?.activeLearnerId)issues.push('learner-mismatch');
  return issues;
}
function gradeQuizQuestion(q,answer){
  const semanticCorrect=quizSemanticMatches(answer,q?.targets||[]);
  const orthographyCorrect=quizOrthographyMatches(answer,q?.targets||[]);
  const correct=q?.strictOrthography?orthographyCorrect:semanticCorrect;
  const matchedTarget=quizUnique(q?.targets||[]).find(t=>(q?.strictOrthography?quizOrthographyMatches(answer,[t]):quizSemanticMatches(answer,[t])))||'';
  return Object.freeze({
    correct,
    semanticCorrect,
    orthographyCorrect,
    orthographyOk:q?.trackOrthography?orthographyCorrect:true,
    matchedTarget,
    answer:String(answer??'').trim(),
    targets:Object.freeze([...quizUnique(q?.targets||[])])
  });
}
function setCurrentQuizQuestion(w,mode,opts={}){
  const q=makeQuizQuestion(w,mode,opts);
  const issues=validateQuizQuestion(q);
  session.currentQuestion=q;
  session.currentQuestionIssues=issues;
  return {question:q,issues};
}
function currentQuizQuestion(w=null,mode=''){
  const q=session?.currentQuestion;
  if(q&&(!w||q.setLinkId===w.setLinkId)&&(!mode||q.mode===quizQuestionMode(mode,w)))return q;
  return w?setCurrentQuizQuestion(w,mode||session?.currentSubmode||session?.mode||'recall').question:null;
}
function renderQuizIntegrityStop(w,issues=[]){
  if(!session)return;
  session.locked=true;
  const set=state.sets.find(s=>s.id===w?.setId);
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Abfrage gestoppt</div><h2>Diese Vokabel ist intern nicht eindeutig zugeordnet.</h2><p>Sie wird deshalb <strong>nicht als falsch gewertet</strong>. Bitte die gespeicherten Wort↔Bedeutung-Paare prüfen.</p><div class="notice warn"><strong>Lernset:</strong> ${esc(set?.title||'unbekannt')}<br><small>Diagnose: ${esc(issues.join(', ')||'unbekannt')}</small></div><div class="row gap center-actions wrap top-space"><button id="quizAuditPairsBtn" class="secondary">Paare prüfen</button><button id="quizStopBtn" class="ghost">Zur Übersicht</button></div></div>`;
  $('#quizAuditPairsBtn').onclick=()=>{session=null;showView('setsView');renderAll();setTimeout(()=>openSetPairAudit?.(w?.setId),0)};
  $('#quizStopBtn').onclick=()=>{session=null;showView('homeView');renderAll()};
}
