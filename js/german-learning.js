'use strict';

(() => {
  const FOUNDATION_TASKS=Object.freeze([
    Object.freeze({id:'letter-m',kind:'choice',skill:'letterRecognition',eyebrow:'Buchstaben erkennen',prompt:'Finde den Buchstaben M.',choices:['M','N','W'],answer:'M',letter:'M'}),
    Object.freeze({id:'sound-maus',kind:'choice',skill:'graphemePhoneme',eyebrow:'Laute und Buchstaben',prompt:'Welcher Buchstabe steht am Anfang von „Maus“?',choices:['A','M','S'],answer:'M',audio:'Maus',letter:'M'}),
    Object.freeze({id:'word-mama',kind:'choice',skill:'wordReading',eyebrow:'Erste Wörter',prompt:'Welches geschriebene Wort hörst du?',choices:['Mama','Maus','Oma'],answer:'Mama',audio:'Mama'}),
    Object.freeze({id:'write-maus',kind:'input',skill:'wordWriting',eyebrow:'Wörter schreiben',prompt:'Höre das Wort und schreibe es.',answer:'Maus',audio:'Maus'}),
    Object.freeze({id:'sentence-mia',kind:'choice',skill:'sentenceReading',eyebrow:'Einfache Sätze',prompt:'Mia malt. Was macht Mia?',choices:['malt','liest','rennt'],answer:'malt'})
  ]);
  let run=null;

  function active(){
    return typeof state==='object'&&state?.activeSubject==='german'&&typeof subjectHasCapability==='function'&&subjectHasCapability('german','nativeLiteracy');
  }
  function progress(){
    const l=typeof learner==='function'?learner():null;
    if(!l)return defaultGermanLiteracyProgress();
    l.germanLiteracy=normalizeGermanLiteracyProgress(l.germanLiteracy);
    return l.germanLiteracy;
  }
  function progressSnapshot(){
    const p=progress(),skills=GERMAN_LITERACY_SKILLS.map(key=>p.skills[key]),started=skills.filter(x=>x.attempts>0).length,secure=skills.filter(x=>x.correct>=2&&x.successDays.length>=2).length;
    return {sessions:p.sessions,practiceDays:p.practiceDays.length,practicedToday:p.practiceDays.includes(today()),skillsStarted:started,skillsSecure:secure,totalSkills:GERMAN_LITERACY_SKILLS.length,lastPracticedAt:p.lastPracticedAt};
  }
  function speak(text){
    if(!('speechSynthesis' in window)||!text)return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(String(text));u.lang='de-DE';u.rate=typeof readingSupportEnabled==='function'&&readingSupportEnabled()?0.76:0.9;speechSynthesis.speak(u);
  }
  function normalizedWritten(value){return String(value??'').normalize('NFC').trim().replace(/\s+/g,' ')}
  function record(task,correct){
    const p=progress(),node=p.skills[task.skill],stamp=new Date().toISOString();
    node.attempts+=1;if(correct){node.correct+=1;node.successDays=[...new Set([...node.successDays,today()])]}node.lastAt=stamp;
    if(task.letter){
      const lnode=p.letters[task.letter]||{attempts:0,correct:0,lastAt:null};
      lnode.attempts+=1;if(correct)lnode.correct+=1;lnode.lastAt=stamp;p.letters[task.letter]=lnode;
    }
    p.lastPracticedAt=stamp;
    if(typeof recordActivity==='function')recordActivity('germanFoundation',{taskId:task.id,skill:task.skill,correct,active:true,assisted:false});
    if(typeof persistOnly==='function')persistOnly();
  }
  function taskAnswerCorrect(task,answer){
    return normalizedWritten(answer)===normalizedWritten(task.answer);
  }
  function choicesHtml(task){
    return '<div class="answer-grid">'+task.choices.map(choice=>'<button type="button" class="answer-option" data-german-answer="'+esc(choice)+'">'+esc(choice)+'</button>').join('')+'</div>';
  }
  function inputHtml(){
    return '<input id="germanAnswerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off" autocapitalize="sentences" spellcheck="false"><div class="top-space"><button id="germanAnswerBtn" class="primary" type="button">Prüfen</button></div>';
  }
  function renderTask(){
    if(!run||run.index>=run.tasks.length){finish();return}
    const task=run.tasks[run.index];run.locked=false;
    const audio=task.audio?'<button id="germanSpeakBtn" class="secondary" type="button">🔊 Anhören</button>':'';
    $('#modePill').textContent='Deutsch · Klasse 1';
    $('#sessionPill').textContent=(run.index+1)+' / '+run.tasks.length;
    $('#studyArea').innerHTML='<div class="study-card german-foundation-card"><div class="eyebrow">'+esc(task.eyebrow)+'</div><div class="study-prompt">'+esc(task.prompt)+'</div>'+audio+(task.kind==='choice'?choicesHtml(task):inputHtml())+'<p class="study-sub">Ruhig arbeiten. Fehler sind eine Lerngelegenheit und verändern keine Fremdsprachen-Vokabelwerte.</p></div>';
    $('#germanSpeakBtn')?.addEventListener('click',()=>speak(task.audio));
    if(task.kind==='choice'){
      $$('[data-german-answer]').forEach(button=>button.onclick=()=>submit(button.dataset.germanAnswer));
    }else{
      const submitInput=()=>submit($('#germanAnswerField')?.value||'');
      $('#germanAnswerBtn').onclick=submitInput;
      $('#germanAnswerField').onkeydown=e=>{if(e.key==='Enter')submitInput()};
      setTimeout(()=>$('#germanAnswerField')?.focus(),40);
    }
    if(task.audio)setTimeout(()=>{if(run&&!run.locked)speak(task.audio)},160);
  }
  function submit(answer){
    if(!run||run.locked)return;
    const task=run.tasks[run.index],correct=taskAnswerCorrect(task,answer),retryCount=run.retries[task.id]||0;
    run.locked=true;record(task,correct);run.results.push({taskId:task.id,skill:task.skill,answer:String(answer||''),correct,at:new Date().toISOString()});
    if(correct)run.correct+=1;
    const canRetry=!correct&&retryCount<1;
    if(canRetry)run.retries[task.id]=retryCount+1;
    const card=$('#studyArea .study-card');
    card?.insertAdjacentHTML('beforeend','<div class="feedback notice '+(correct?'good':'bad')+'"><strong>'+(correct?'Richtig.':'Noch nicht richtig.')+'</strong>'+(correct?'':'<br>Richtig ist: <strong>'+esc(task.answer)+'</strong>')+'</div><div class="top-space"><button id="germanContinueBtn" class="primary" type="button">'+(canRetry?'Noch einmal versuchen':'Weiter')+'</button></div>');
    $('#germanContinueBtn').onclick=()=>{
      if(canRetry){run.locked=false;renderTask();return}
      run.index+=1;renderTask();
    };
  }
  function finish(){
    if(!run)return;
    const finished=run,p=progress(),stamp=new Date().toISOString();p.sessions+=1;p.practiceDays=[...new Set([...p.practiceDays,today()])];p.lastPracticedAt=stamp;
    if(typeof persistOnly==='function')persistOnly();
    const snap=progressSnapshot(),accuracy=finished.results.length?Math.round(finished.results.filter(x=>x.correct).length/finished.results.length*100):0;
    $('#modePill').textContent='Deutsch · Grundlagen';
    $('#sessionPill').textContent='Fertig';
    $('#studyArea').innerHTML='<div class="study-card"><div class="eyebrow">Deutsch · Klasse 1</div><div class="study-prompt">Grundlagenrunde geschafft</div><p><strong>'+finished.correct+' von '+finished.tasks.length+'</strong> Aufgaben spätestens beim zweiten Versuch gelöst · '+accuracy+'% richtige Versuche.</p><div class="notice subtle">'+snap.skillsStarted+' von '+snap.totalSkills+' Grundlagenbereichen wurden bereits geübt. Dieser Stand ist eigenständig und keine Vokabel-Mastery.</div><div class="row gap center-actions wrap top-space"><button id="germanRepeatBtn" class="secondary" type="button">Noch eine Runde</button><button id="germanDoneBtn" class="primary" type="button">Zur Übersicht</button></div></div>';
    $('#germanRepeatBtn').onclick=()=>startFoundation();
    $('#germanDoneBtn').onclick=()=>{run=null;showView('homeView');renderAll?.()};
    renderHub();
  }
  function startFoundation(){
    if(!active())return false;
    run={tasks:[...FOUNDATION_TASKS],index:0,correct:0,retries:{},results:[],locked:false,startedAt:new Date().toISOString()};
    showView('learnView');renderTask();return true;
  }
  function renderHub(){
    const card=document.querySelector('#germanFoundationCard');if(!card)return;
    card.classList.toggle('hidden',!active());if(!active())return;
    const snap=progressSnapshot(),progressEl=document.querySelector('#germanFoundationProgress'),detail=document.querySelector('#germanFoundationDetail'),btn=document.querySelector('#germanFoundationStartBtn');
    if(progressEl){progressEl.max=snap.totalSkills;progressEl.value=snap.skillsStarted;progressEl.setAttribute('aria-valuetext',snap.skillsStarted+' von '+snap.totalSkills+' Grundlagenbereichen begonnen')}
    if(detail)detail.textContent=snap.sessions?(snap.skillsStarted+' von '+snap.totalSkills+' Bereichen begonnen · '+snap.sessions+' Grundlagenrunde'+(snap.sessions===1?'':'n')+' abgeschlossen'):'Start mit Buchstaben, Lauten und ersten Wörtern.';
    if(btn){btn.textContent=snap.practicedToday?'Weiter Deutsch üben':'Grundlagenrunde starten';btn.onclick=startFoundation}
  }
  function openWortreichPreview(){
    if(typeof modal!=='function')return;
    modal('<div class="eyebrow">Deutsch · Das Wortreich</div><h2>Das Wortreich wird aufgebaut</h2><p>Dein Deutsch-Lernstand ist bereits ein eigener Fachbereich. Die Ritter-, Burg- und Belagerungswelt wird im nächsten Umsetzungspaket angeschlossen.</p><div class="notice subtle"><strong>Wichtig:</strong> Bis dahin wird für Deutsch keine englische Armee als Platzhalter angezeigt.</div><div class="modal-actions"><button value="ok" class="primary">Zurück zum Lernen</button></div>');
  }

  window.VTGermanLearning={active,startFoundation,renderHub,progressSnapshot,openWortreichPreview,tasks:()=>FOUNDATION_TASKS.map(x=>({...x}))};
})();
