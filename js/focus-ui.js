'use strict';

const _focusedBaseRenderStudy=renderStudy;
renderStudy=function(){
  const result=_focusedBaseRenderStudy();
  if(session&&session.index<(session.queue?.length||0)){
    const pill=$('#sessionPill');
    if(pill)pill.textContent='Aufgabe '+(session.index+1);
  }
  return result;
};

const _focusedBaseShowView=showView;
showView=function(id){
  document.body.classList.toggle('learning-focus',id==='learnView');
  _focusedBaseShowView(id);
};

function focusedConfusionHtml(w){
  const conf=detectConfusions(w,myWords()).slice(0,2);
  if(!conf.length)return '';
  return `<div class="focused-feedback-support"><strong>Leicht zu verwechseln</strong>${conf.map(x=>`<span>${esc(x.term)} · ${esc(x.translation)}</span>`).join('')}</div>`;
}
function focusedDisableAnswerControls(){
  const input=$('#answerField');if(input)input.disabled=true;
  for(const id of ['answerBtn','hintBtn','grammarHintBtn','chunkCheck','chunkReset']){const el=$('#'+id);if(el)el.disabled=true}
  $$('[data-answer],.chunk').forEach(b=>b.disabled=true);
}
function focusedContinue(ok,w){
  const card=$('#studyArea .study-card');if(!card||$('#continueStudyBtn'))return;
  card.insertAdjacentHTML('beforeend','<div class="focused-feedback-actions"><button id="continueStudyBtn" class="primary">Weiter</button></div>');
  const btn=$('#continueStudyBtn');
  btn.onclick=()=>nextStudy(ok,w);
  setTimeout(()=>btn?.focus(),0);
}
function focusedCorrectTarget(target){return quizUnique(target)[0]||''}

/* During retrieval, progress diagnostics and confusion warnings stay out of sight.
   Relevant support is shown only after an answer. */
cardExtras=function(){return ''};

renderLatinGrammar=function(w){
  const g=grammarTarget(w);session.currentSubmode='latinGrammar';
  $('#modePill').textContent=`Latein · ${g.label}`;
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Latein Formen · ${esc(g.label)}</div><div class="study-prompt compact-prompt">${esc(g.prompt)}</div><div class="study-sub">Antworte zuerst aus dem Gedächtnis. Die Regelhilfe ist optional und zählt als Hilfe.</div><div id="grammarRuleHelp" class="notice subtle hidden"><strong>Regelhilfe</strong><br>${esc(g.rule)}</div><input id="answerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off" autocapitalize="none" spellcheck="false"><div class="row gap center-actions top-space"><button id="answerBtn" class="primary">Prüfen</button><button id="grammarHintBtn" class="ghost">Regelhilfe</button></div></div>`;
  const submit=()=>gradeGrammar(w,g,$('#answerField').value);
  $('#answerBtn').onclick=submit;
  $('#answerField').onkeydown=e=>{if(e.key==='Enter')submit()};
  $('#grammarHintBtn').onclick=()=>{session.hintUsed=true;$('#grammarRuleHelp').classList.remove('hidden');$('#grammarHintBtn').disabled=true;$('#answerField')?.focus()};
  setTimeout(()=>$('#answerField')?.focus(),40);
};

gradeGrammar=function(w,g,answer){
  if(session.locked)return;session.locked=true;
  const ok=grammarMatches(answer,g.target,g.key),assisted=!!session.hintUsed;
  focusedDisableAnswerControls();
  $('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}" role="status"><strong>${ok?(assisted?'Richtig mit Hilfe.':'Richtig.'):'Noch nicht richtig.'}</strong><br>${ok?'':`Deine Antwort: ${esc(answer||'–')}<br>`}Richtig: <strong>${esc(g.target)}</strong>${w.example?`<br><small>Im Kontext: ${esc(w.example)}</small>`:''}</div>`);
  logSessionResult(w,{answer,target:[g.target],correct:ok,skill:'latinGrammar',orthographyOk:ok,assisted,prompt:g.prompt});
  recordGrammarResult(w,g.key,ok,assisted);
  focusedContinue(ok,w);
};

gradeChoice=function(btn,w,answer,target,skill,nonEvaluative=false,questionSnapshot=null){
  if(session.locked)return;session.locked=true;
  const q=questionSnapshot||currentQuizQuestion(w,session.currentSubmode||skill),grade=gradeQuizQuestion(q,answer),ok=grade.correct;
  btn.classList.add(ok?'correct':'wrong');
  if(!ok)$$('[data-answer]').find(b=>gradeQuizQuestion(q,b.dataset.answer).correct)?.classList.add('correct');
  focusedDisableAnswerControls();
  if(['recognition','listening'].includes(skill))session.scaffoldedWords[w.id]=true;
  logSessionResult(w,{answer,target:q.targets,correct:ok,skill:q.mode,orthographyOk:grade.orthographyOk,assisted:false,prompt:q.prompt});
  if(nonEvaluative)recordNonEvaluative(w,'flash',ok,skill);else recordResult(w,ok,skill,ok?null:skill,{orthographyOk:grade.orthographyOk});
  const correct=focusedCorrectTarget(q.targets);
  $('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}" role="status"><strong>${ok?'Richtig.':'Noch nicht richtig.'}</strong>${!ok&&correct?`<br>Richtig: <strong>${esc(correct)}</strong>`:''}${!ok?focusedConfusionHtml(w):''}</div>`);
  focusedContinue(ok,w);
};

gradeText=function(w,answer,target,errorType,skill){
  if(session.locked)return;session.locked=true;
  const q=currentQuizQuestion(w,session.currentSubmode||skill),grade=gradeQuizQuestion(q,answer),ok=grade.correct,orthographyOk=grade.orthographyOk;
  const softSpelling=ok&&q.trackOrthography&&!orthographyOk;
  const detail=softSpelling?(session.hintUsed?'Richtig erinnert mit Hinweis. Schreibweise beachten.':'Richtig erinnert. Schreibweise beachten.'):(ok?(session.hintUsed?'Richtig mit Hinweis.':'Richtig.'):'');
  focusedDisableAnswerControls();
  const spellingNote=softSpelling?`<br>Schreibweise: <strong>${esc(focusedCorrectTarget(q.targets))}</strong>`:'';
  $('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}" role="status">${ok?`<strong>${detail}</strong>${spellingNote}`:errorFeedbackHtml(answer,q.targets)}${!ok?wordLearningCard(w)+focusedConfusionHtml(w):''}</div>`);
  logSessionResult(w,{answer,target:q.targets,correct:ok,skill:q.mode,orthographyOk,assisted:!!session.hintUsed,prompt:q.prompt});
  recordResult(w,ok,skill,ok?null:errorType,{orthographyOk});
  focusedContinue(ok,w);
};

