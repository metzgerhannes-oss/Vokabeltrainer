'use strict';

function focusedInputMode(){
  if(session?.mode==='practiceTest')return 'practiceTest';
  return session?.currentSubmode||session?.mode||'';
}
function focusedAppleTouchDevice(){
  const ua=String(navigator.userAgent||'');
  return /iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
function focusedSupportsWritingSuggestionsControl(){
  const probe=document.createElement('input');
  return 'writingSuggestions' in probe;
}
function focusedNeedsFallbackKeyboard(){
  if(window.__VT_FORCE_SECURE_KEYBOARD__===true)return true;
  if(focusedInputMode()!=='practiceTest')return false;
  return focusedAppleTouchDevice()&&!focusedSupportsWritingSuggestionsControl();
}
function focusedAnswerName(){
  const q=session?.currentQuestion?.id||session?.currentSubmode||session?.mode||'answer';
  return 'vt-answer-'+String(q).replace(/[^a-z0-9_-]/gi,'-')+'-'+String(session?.index??0);
}
function focusedSetInputValue(input,value,caret=value.length){
  input.value=value;
  input.dispatchEvent(new Event('input',{bubbles:true}));
  input.focus({preventScroll:true});
  try{input.setSelectionRange(caret,caret)}catch(_e){}
}
function focusedInsertAtSelection(input,text){
  const start=Number.isInteger(input.selectionStart)?input.selectionStart:input.value.length;
  const end=Number.isInteger(input.selectionEnd)?input.selectionEnd:start;
  const next=input.value.slice(0,start)+text+input.value.slice(end);
  focusedSetInputValue(input,next,start+text.length);
}
function focusedBackspaceAtSelection(input){
  const start=Number.isInteger(input.selectionStart)?input.selectionStart:input.value.length;
  const end=Number.isInteger(input.selectionEnd)?input.selectionEnd:start;
  if(start!==end){
    const next=input.value.slice(0,start)+input.value.slice(end);
    focusedSetInputValue(input,next,start);
    return;
  }
  if(start<=0)return;
  const next=input.value.slice(0,start-1)+input.value.slice(start);
  focusedSetInputValue(input,next,start-1);
}
function focusedSecureKeyboardRows(subject=state?.activeSubject||'english'){
  const rows=[
    ['a','b','c','d','e','f'],
    ['g','h','i','j','k','l'],
    ['m','n','o','p','q','r'],
    ['s','t','u','v','w','x'],
    ['y','z','ä','ö','ü','ß'],
    ["'",'-','.',',','?','!']
  ];
  if(subject==='french')rows.push(['à','â','ç','é','è','ê'],['ë','î','ï','ô','ù','û'],['ÿ','œ','æ','/','(',')']);
  else rows.push(['/','(',')',':',';','…']);
  return rows;
}
function focusedSecureKeyboardMarkup(){
  const rows=focusedSecureKeyboardRows();
  const keys=rows.flat().map(key=>'<button type="button" class="secure-key" data-secure-key="'+esc(key)+'" aria-label="Zeichen '+esc(key)+'">'+esc(key)+'</button>').join('');
  return '<div class="secure-input-panel" data-secure-keyboard><div class="secure-input-note"><strong>Prüfungsfeste Eingabe</strong><span>Systemvorschläge sind auf diesem Gerät ausgeschaltet.</span></div><div class="secure-key-grid" aria-label="Bildschirmtastatur">'+keys+'</div><div class="secure-key-actions"><button type="button" class="secure-key secure-key-wide" data-secure-action="space">Leerzeichen</button><button type="button" class="secure-key" data-secure-action="backspace" aria-label="Zeichen löschen">⌫</button><button type="button" class="secure-key" data-secure-action="clear">Leeren</button></div></div>';
}
function focusedMountSecureKeyboard(input){
  if(!input||document.querySelector('[data-secure-keyboard]'))return;
  input.readOnly=true;
  input.setAttribute('inputmode','none');
  input.dataset.integrityMode='secure-keyboard';
  input.insertAdjacentHTML('afterend',focusedSecureKeyboardMarkup());
  const panel=document.querySelector('[data-secure-keyboard]');
  panel?.addEventListener('pointerdown',e=>{if(e.target.closest('button'))e.preventDefault()});
  panel?.addEventListener('click',e=>{
    const key=e.target.closest('[data-secure-key]')?.dataset.secureKey;
    const action=e.target.closest('[data-secure-action]')?.dataset.secureAction;
    if(key!=null){focusedInsertAtSelection(input,key);return}
    if(action==='space'){focusedInsertAtSelection(input,' ');return}
    if(action==='backspace'){focusedBackspaceAtSelection(input);return}
    if(action==='clear'){focusedSetInputValue(input,'',0)}
  });
  input.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.key==='Enter'){e.preventDefault();e.stopImmediatePropagation();document.querySelector('#answerBtn')?.click();return}
    if(e.key==='Backspace'){e.preventDefault();e.stopImmediatePropagation();focusedBackspaceAtSelection(input);return}
    if(e.key==='Delete'){e.preventDefault();e.stopImmediatePropagation();return}
    if(e.key.length===1){e.preventDefault();e.stopImmediatePropagation();focusedInsertAtSelection(input,e.key)}
  },true);
  input.addEventListener('paste',e=>e.preventDefault());
  input.addEventListener('drop',e=>e.preventDefault());
}
function focusedApplyInputIntegrity(){
  const input=document.querySelector('#answerField');
  if(!input)return;
  input.setAttribute('autocomplete','off');
  input.setAttribute('autocorrect','off');
  input.setAttribute('autocapitalize','none');
  input.setAttribute('spellcheck','false');
  input.setAttribute('writingsuggestions','false');
  input.setAttribute('aria-autocomplete','none');
  input.setAttribute('name',focusedAnswerName());
  input.dataset.integrityMode='browser-suppressed';
  if('writingSuggestions' in input)input.writingSuggestions='false';
  if(focusedNeedsFallbackKeyboard())focusedMountSecureKeyboard(input);
}

const _focusedBaseRenderStudy=renderStudy;
renderStudy=function(){
  const result=_focusedBaseRenderStudy();
  if(session&&session.index<(session.queue?.length||0)){
    const pill=$('#sessionPill');
    if(pill){
      if(session.isDaily&&!session.rescueMode&&!session.bonusMode){
        const status=dailyPlanStatus(buildDailyPlan());
        pill.textContent=status.done+' / '+status.total+' geschafft';
      }else pill.textContent='Aufgabe '+(session.index+1);
    }
  }
  focusedApplyInputIntegrity();
  return result;
};

const _focusedBaseShowView=showView;
showView=function(id){
  document.body.classList.toggle('learning-focus',id==='learnView');
  if(id==='learnView'){
    const view=document.querySelector('#learnView');
    const theme=typeof subjectVisualTheme==='function'?subjectVisualTheme(state?.activeSubject):'campaign';
    if(view){
      view.dataset.visualTheme=theme;
      view.dataset.subject=state?.activeSubject||'english';
    }
  }
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

function focusedReviewActionHtml(ok){
  return ok?'':'<div class="focused-review-action"><button type="button" id="answerReviewBtn" class="ghost">Bewertung prüfen lassen</button><small>Wenn die Lösung oder Bewertung des Systems falsch sein könnte.</small></div>';
}
function bindFocusedAnswerReview(w,answer,q,skill,errorType,snapshot){
  const btn=$('#answerReviewBtn');if(!btn)return;
  const result=session?.results?.at(-1)||null;
  btn.onclick=()=>{
    if(btn.disabled)return;
    const saved=flagAnswerForParentReview(w,{answer,question:q,skill,errorType,snapshot,result});
    if(!saved.ok){toast(saved.error||'Prüffall konnte nicht gespeichert werden.','bad');return}
    btn.disabled=true;btn.textContent='Zur Prüfung vorgemerkt';
    const feedback=btn.closest('.feedback');if(feedback){feedback.classList.remove('bad');feedback.classList.add('subtle');feedback.insertAdjacentHTML('beforeend','<div class="notice subtle top-space"><strong>Kein Lernnachteil.</strong><br>Ein Elternaccount prüft diese Antwort. Bis dahin zählt sie weder als richtig noch als falsch.</div>')}
    const next=$('#continueStudyBtn');if(next)next.onclick=()=>nextStudy(null,w);
    toast('Zur Prüfung durch einen Elternaccount vorgemerkt.','good');
  };
}

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
  $('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}" role="status"><strong>${ok?(assisted?'Richtig mit Hilfe.':'Richtig.'):'Noch nicht richtig.'}</strong><br>${ok?'':`Deine Antwort: ${esc(answer||'–')}<br>`}Richtig: <strong>${esc(g.target)}</strong><div class="focused-answer-audio"><strong>${esc(w.term)}</strong>${audioButtonHtml(w.term,'Anhören')}</div>${w.example?`<br><small>Im Kontext: ${esc(w.example)}</small>`:''}</div>`);
  if(!ok)maybeSpeakCorrection(w);
  logSessionResult(w,{answer,target:[g.target],correct:ok,skill:'latinGrammar',orthographyOk:ok,assisted,prompt:g.prompt});
  recordGrammarResult(w,g.key,ok,assisted);
  focusedContinue(ok,w);
};

gradeChoice=function(btn,w,answer,target,skill,nonEvaluative=false,questionSnapshot=null){
  if(session.locked)return;session.locked=true;
  const q=questionSnapshot||currentQuizQuestion(w,session.currentSubmode||skill),grade=gradeQuizQuestion(q,answer),ok=grade.correct,reviewSnapshot=!ok&&!nonEvaluative?answerReviewAttemptSnapshot(w):null;
  if(!nonEvaluative)recordNativeLiteracyEvidence(w,skill,ok,{orthographyOk:grade.orthographyOk,assisted:false});
  btn.classList.add(ok?'correct':'wrong');
  if(!ok)$$('[data-answer]').find(b=>gradeQuizQuestion(q,b.dataset.answer).correct)?.classList.add('correct');
  focusedDisableAnswerControls();
  if(['recognition','listening'].includes(skill))session.scaffoldedWords[w.id]=true;
  logSessionResult(w,{answer,target:q.targets,correct:ok,skill:q.mode,orthographyOk:grade.orthographyOk,assisted:false,prompt:q.prompt});
  if(nonEvaluative)recordNonEvaluative(w,'flash',ok,skill);else recordResult(w,ok,skill,ok?null:skill,{orthographyOk:grade.orthographyOk});
  const correct=focusedCorrectTarget(q.targets);
  $('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}" role="status"><strong>${ok?'Richtig.':'Noch nicht richtig.'}</strong>${!ok&&correct?`<br>Richtig: <strong>${esc(correct)}</strong>`:''}<div class="focused-answer-audio"><strong>${esc(w.term)}</strong>${audioButtonHtml(w.term,'Anhören')}</div>${!ok?focusedConfusionHtml(w)+focusedReviewActionHtml(ok):''}</div>`);
  if(!ok)maybeSpeakCorrection(w);
  focusedContinue(ok,w);if(!ok&&!nonEvaluative)bindFocusedAnswerReview(w,answer,q,skill,skill,reviewSnapshot);
};

gradeText=function(w,answer,target,errorType,skill){
  if(session.locked)return;session.locked=true;
  const q=currentQuizQuestion(w,session.currentSubmode||skill),grade=gradeQuizQuestion(q,answer),ok=grade.correct,orthographyOk=grade.orthographyOk,reviewSnapshot=!ok?answerReviewAttemptSnapshot(w):null;
  recordNativeLiteracyEvidence(w,skill,ok,{orthographyOk,assisted:!!session.hintUsed});
  recordNativeLiteracyError(w,answer,q,skill,ok);
  const softSpelling=ok&&q.trackOrthography&&!orthographyOk;
  const detail=softSpelling?(session.hintUsed?'Richtig erinnert mit Hinweis. Schreibweise beachten.':'Richtig erinnert. Schreibweise beachten.'):(ok?(session.hintUsed?'Richtig mit Hinweis.':'Richtig.'):'');
  focusedDisableAnswerControls();
  const spellingNote=softSpelling?`<br>Schreibweise: <strong>${esc(focusedCorrectTarget(q.targets))}</strong>`:'';
  $('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}" role="status">${ok?`<strong>${detail}</strong>${spellingNote}`:errorFeedbackHtml(answer,q.targets)}<div class="focused-answer-audio"><strong>${esc(w.term)}</strong>${audioButtonHtml(w.term,'Anhören')}</div>${!ok?wordLearningCard(w)+focusedConfusionHtml(w)+focusedReviewActionHtml(ok):''}</div>`);
  if(!ok||softSpelling)maybeSpeakCorrection(w);
  logSessionResult(w,{answer,target:q.targets,correct:ok,skill:q.mode,orthographyOk,assisted:!!session.hintUsed,prompt:q.prompt});
  recordResult(w,ok,skill,ok?null:errorType,{orthographyOk});
  focusedContinue(ok,w);if(!ok)bindFocusedAnswerReview(w,answer,q,skill,errorType,reviewSnapshot);
};

