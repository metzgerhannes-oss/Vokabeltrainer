'use strict';

(function(){
  const COURSE=[
    {id:'letters',label:'Buchstaben',short:'Buchstaben erkennen'},
    {id:'sounds',label:'Laute',short:'Laut und Buchstabe verbinden'},
    {id:'handwriting',label:'Nachspuren',short:'vom Nachspuren zum freien Schreiben'},
    {id:'words',label:'Erste Wörter',short:'lesen und schreiben'},
    {id:'sentences',label:'Einfache Sätze',short:'verstehen und bilden'}
  ];
  const LETTERS=[
    {letter:'M',word:'Maus'},{letter:'A',word:'Apfel'},{letter:'O',word:'Oma'},
    {letter:'L',word:'Lampe'},{letter:'S',word:'Sonne'},{letter:'E',word:'Ente'},
    {letter:'N',word:'Nase'},{letter:'I',word:'Igel'},{letter:'R',word:'Rose'},{letter:'T',word:'Tisch'}
  ];
  const WORDS=[
    {id:'oma',word:'Oma',icon:'👵',label:'Großmutter'},
    {id:'nase',word:'Nase',icon:'👃',label:'Nase'},
    {id:'rose',word:'Rose',icon:'🌹',label:'Rose'}
  ];
  const SENTENCES=[
    {id:'oma_malt',sentence:'Oma malt.',icon:'👵🎨',distractors:['👃🌹','🦙🍎']},
    {id:'mama_malt',sentence:'Mama malt.',tokens:['Mama','malt','.']}
  ];
  let run=null,drawState=null,previewTimer=null;

  function blankProgress(){return {version:1,letters:{},words:{},sentences:{},completedStages:{},updatedAt:null}}
  function progress(){
    const l=typeof learner==='function'?learner():null;if(!l)return blankProgress();
    const raw=l.germanFoundation&&typeof l.germanFoundation==='object'&&!Array.isArray(l.germanFoundation)?l.germanFoundation:{};
    l.germanFoundation={
      version:1,
      letters:raw.letters&&typeof raw.letters==='object'&&!Array.isArray(raw.letters)?raw.letters:{},
      words:raw.words&&typeof raw.words==='object'&&!Array.isArray(raw.words)?raw.words:{},
      sentences:raw.sentences&&typeof raw.sentences==='object'&&!Array.isArray(raw.sentences)?raw.sentences:{},
      completedStages:raw.completedStages&&typeof raw.completedStages==='object'&&!Array.isArray(raw.completedStages)?raw.completedStages:{},
      updatedAt:raw.updatedAt||null
    };
    return l.germanFoundation;
  }
  function bump(section,id,key,amount=1){
    const p=progress();p[section][id]=p[section][id]&&typeof p[section][id]==='object'?p[section][id]:{};
    p[section][id][key]=Math.min(4,Math.max(0,(Number(p[section][id][key])||0)+amount));p.updatedAt=new Date().toISOString();
  }
  function saveProgress(){const p=progress();p.updatedAt=new Date().toISOString();if(typeof save==='function')save()}
  function stageDone(id){return !!progress().completedStages[id]}
  function completion(){
    const done=COURSE.filter(x=>stageDone(x.id)).length;
    return {done,total:COURSE.length,pct:Math.round(done/COURSE.length*100),next:(COURSE.find(x=>!stageDone(x.id))||COURSE[0]).id};
  }
  function available(){return state?.activeSubject==='german'}
  function stageTasks(stage){
    if(stage==='letters')return LETTERS.map((x,i)=>({kind:'letterChoice',id:x.letter,target:x.letter,options:[x.letter,LETTERS[(i+2)%LETTERS.length].letter,LETTERS[(i+5)%LETTERS.length].letter]}));
    if(stage==='sounds')return LETTERS.slice(0,6).map((x,i)=>({kind:'soundChoice',id:x.letter,target:x.letter,word:x.word,options:[x.letter,LETTERS[(i+3)%LETTERS.length].letter,LETTERS[(i+6)%LETTERS.length].letter]}));
    if(stage==='handwriting')return [
      {kind:'draw',id:'M',target:'M',guide:'full',skill:'traced',title:'Bewegungsrichtung sehen und nachspuren'},
      {kind:'draw',id:'A',target:'A',guide:'faded',skill:'guided',title:'Mit weniger Führung schreiben'},
      {kind:'draw',id:'O',target:'O',guide:'none',skill:'freeProduction',title:'Aus dem Gedächtnis schreiben'}
    ];
    if(stage==='words')return [
      {kind:'wordPicture',id:'oma',word:'Oma',icon:'👵',options:WORDS},
      {kind:'wordPicture',id:'nase',word:'Nase',icon:'👃',options:WORDS},
      {kind:'wordWrite',id:'rose',word:'Rose'}
    ];
    if(stage==='sentences')return [
      {kind:'sentencePicture',id:'oma_malt',sentence:'Oma malt.',icon:'👵🎨',options:['👵🎨','👃🌹','🦙🍎']},
      {kind:'sentenceBuild',id:'mama_malt',sentence:'Mama malt.',tokens:['malt','Mama','.']}
    ];
    return [];
  }
  function renderHub(){
    const root=document.querySelector('#germanFoundationCard');if(!root)return;
    const active=available();root.classList.toggle('hidden',!active);if(!active)return;
    const c=completion();const stageHtml=COURSE.map((s,i)=>{
      const done=stageDone(s.id),current=s.id===c.next;
      return '<button type="button" class="german-foundation-stage '+(done?'done ':'')+(current?'current':'')+'" data-german-stage="'+s.id+'"><span>'+(done?'✓':(i+1))+'</span><strong>'+s.label+'</strong><small>'+s.short+'</small></button>';
    }).join('');
    root.innerHTML='<div class="german-foundation-head"><div><div class="eyebrow">Klasse 1 · Grundlagen</div><h3>Buchstaben, Laute und erste Sätze</h3><p>Ruhig lernen – ohne Battle-Wertung. Schreibübungen werden nicht automatisch als richtig oder falsch beurteilt.</p></div><div class="german-foundation-progress"><strong>'+c.done+' / '+c.total+'</strong><span>Stationen</span></div></div><progress max="'+c.total+'" value="'+c.done+'" aria-label="'+c.done+' von '+c.total+' Grundlagenstationen abgeschlossen"></progress><div class="german-foundation-stages">'+stageHtml+'</div><div class="row end top-space"><button id="germanFoundationStartBtn" type="button" class="primary">'+(c.done?'Weiterlernen':'Grundlagen starten')+'</button></div>';
    root.querySelectorAll('[data-german-stage]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.germanStage)));
    root.querySelector('#germanFoundationStartBtn')?.addEventListener('click',()=>open(c.next));
  }
  function open(stage=''){
    if(!available())return;
    const selected=COURSE.some(x=>x.id===stage)?stage:completion().next;
    run={stage:selected,index:0,tasks:stageTasks(selected),wrong:0,assembled:[]};
    if(typeof session!=='undefined')session=null;
    showView('learnView');
    const meta=COURSE.find(x=>x.id===selected);document.querySelector('#modePill').textContent='Deutsch · '+meta.label;
    renderTask();
  }
  function task(){return run?.tasks?.[run.index]||null}
  function setFeedback(html,kind='subtle'){
    const el=document.querySelector('#germanFoundationFeedback');if(!el)return;el.className='notice '+kind;el.innerHTML=html;
  }
  function advance(){
    if(!run)return;run.index++;
    if(run.index>=run.tasks.length){
      progress().completedStages[run.stage]=new Date().toISOString();saveProgress();renderFinish();return;
    }
    renderTask();
  }
  function correct(section,id,key){
    bump(section,id,key);saveProgress();setFeedback('<strong>Richtig.</strong> Weiter geht es.','good');setTimeout(advance,450);
  }
  function wrong(){
    run.wrong++;setFeedback('<strong>Noch nicht.</strong> Versuch es noch einmal.','bad');
  }
  function choiceButtons(values,target,section,id,key,labeler){
    return '<div class="answer-grid german-foundation-options">'+values.map(v=>'<button type="button" class="answer-option" data-foundation-answer="'+String(v)+'">'+(labeler?labeler(v):String(v))+'</button>').join('')+'</div>';
  }
  function renderTask(){
    clearTimeout(previewTimer);drawState=null;
    const t=task(),area=document.querySelector('#studyArea');if(!t||!area)return;
    document.querySelector('#sessionPill').textContent=(run.index+1)+' / '+run.tasks.length;
    if(t.kind==='letterChoice'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Buchstaben erkennen</div><div class="study-prompt">Finde den Buchstaben <strong>'+t.target+'</strong>.</div>'+choiceButtons(t.options,t.target,'letters',t.id,'recognized')+'<div id="germanFoundationFeedback" class="notice subtle">Schau genau auf die Form.</div></div>';
      area.querySelectorAll('[data-foundation-answer]').forEach(b=>b.onclick=()=>b.dataset.foundationAnswer===t.target?correct('letters',t.id,'recognized'):wrong());return;
    }
    if(t.kind==='soundChoice'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Laut ↔ Buchstabe</div><div class="study-prompt">Welcher Buchstabe steht am Anfang?</div><button id="foundationSpeakBtn" class="secondary" type="button">🔊 '+t.word+' hören</button><div class="study-sub">Höre auf den ersten Laut.</div>'+choiceButtons(t.options,t.target,'letters',t.id,'phonemeGrapheme')+'<div id="germanFoundationFeedback" class="notice subtle">Du kannst das Wort so oft anhören, wie du möchtest.</div></div>';
      area.querySelector('#foundationSpeakBtn').onclick=()=>speak(t.word);
      area.querySelectorAll('[data-foundation-answer]').forEach(b=>b.onclick=()=>b.dataset.foundationAnswer===t.target?correct('letters',t.id,'phonemeGrapheme'):wrong());return;
    }
    if(t.kind==='draw'){renderDraw(t);return}
    if(t.kind==='wordPicture'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Erstes Wort lesen</div><div class="study-prompt">'+t.word+'</div><div class="study-sub">Welches Bild passt zum Wort?</div><div class="german-picture-options">'+t.options.map(x=>'<button type="button" data-word-picture="'+x.id+'" aria-label="'+x.label+'">'+x.icon+'</button>').join('')+'</div><div id="germanFoundationFeedback" class="notice subtle">Lies das Wort erst selbst. Audio gibt es nach der Lösung.</div></div>';
      area.querySelectorAll('[data-word-picture]').forEach(b=>b.onclick=()=>{if(b.dataset.wordPicture!==t.id)return wrong();bump('words',t.id,'decoded');bump('words',t.id,'meaning');saveProgress();setFeedback('<strong>Richtig.</strong> '+t.word+' '+t.icon+' <button type="button" id="foundationAfterSpeak" class="ghost">🔊 Wort hören</button>','good');area.querySelector('#foundationAfterSpeak').onclick=()=>speak(t.word);setTimeout(advance,800)});return;
    }
    if(t.kind==='wordWrite'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Erstes Wort schreiben</div><button id="foundationSpeakBtn" class="secondary" type="button">🔊 Wort anhören</button><div class="study-sub">Schreibe das gehörte Wort richtig. Großschreibung gehört dazu.</div><input id="foundationWordInput" class="answer-input" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Gehörtes Wort schreiben"><div class="top-space"><button id="foundationWordCheck" class="primary" type="button">Prüfen</button></div><div id="germanFoundationFeedback" class="notice subtle">Das Wort wird vor der Antwort nicht angezeigt.</div></div>';
      area.querySelector('#foundationSpeakBtn').onclick=()=>speak(t.word);
      area.querySelector('#foundationWordCheck').onclick=()=>{const a=String(area.querySelector('#foundationWordInput').value||'').normalize('NFKC').trim();a===t.word?correct('words',t.id,'written'):wrong()};return;
    }
    if(t.kind==='sentencePicture'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Satz verstehen</div><div class="study-prompt german-sentence-prompt">'+t.sentence+'</div><div class="study-sub">Welches Bild passt zum ganzen Satz?</div><div class="german-picture-options">'+t.options.map((x,i)=>'<button type="button" data-sentence-picture="'+i+'" aria-label="Bild '+(i+1)+'">'+x+'</button>').join('')+'</div><div id="germanFoundationFeedback" class="notice subtle">Lies den Satz ohne Zeitdruck.</div></div>';
      area.querySelectorAll('[data-sentence-picture]').forEach(b=>b.onclick=()=>t.options[Number(b.dataset.sentencePicture)]===t.icon?correct('sentences',t.id,'comprehension'):wrong());return;
    }
    if(t.kind==='sentenceBuild'){
      run.assembled=[];
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Satz bilden</div><div class="study-prompt">Baue einen einfachen Satz.</div><div id="foundationSentence" class="assembled" aria-live="polite">Tippe die Wörter in der richtigen Reihenfolge.</div><div class="word-chunks">'+t.tokens.map((x,i)=>'<button type="button" class="chunk" data-sentence-token="'+i+'">'+x+'</button>').join('')+'</div><div class="row gap center-actions"><button id="foundationSentenceReset" class="ghost" type="button">Neu</button><button id="foundationSentenceCheck" class="primary" type="button">Prüfen</button></div><div id="germanFoundationFeedback" class="notice subtle">Ein Satz beginnt groß und endet mit einem Satzzeichen.</div></div>';
      const sync=()=>{area.querySelector('#foundationSentence').textContent=run.assembled.map(x=>x.value).join(' ').replace(/\s+([.!?])/g,'$1')||'Tippe die Wörter in der richtigen Reihenfolge.'};
      area.querySelectorAll('[data-sentence-token]').forEach(b=>b.onclick=()=>{if(b.disabled)return;run.assembled.push({index:Number(b.dataset.sentenceToken),value:b.textContent});b.disabled=true;b.classList.add('used');sync()});
      area.querySelector('#foundationSentenceReset').onclick=()=>{run.assembled=[];area.querySelectorAll('[data-sentence-token]').forEach(b=>{b.disabled=false;b.classList.remove('used')});sync()};
      area.querySelector('#foundationSentenceCheck').onclick=()=>{const answer=run.assembled.map(x=>x.value).join(' ').replace(/\s+([.!?])/g,'$1');answer===t.sentence?correct('sentences',t.id,'formation'):wrong()};return;
    }
  }
  function renderDraw(t){
    const area=document.querySelector('#studyArea'),memory=t.guide==='none';
    area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Handschrift · Schreibpraxis</div><h3>'+t.title+'</h3>'+(memory?'<div id="foundationMemoryLetter" class="foundation-memory-letter">'+t.target+'</div><div class="study-sub">Merke dir den Buchstaben. Er verschwindet gleich.</div>':'<div class="study-sub">Fahre die helle Form mit dem Finger oder Stift nach.</div>')+'<canvas id="foundationTraceCanvas" class="foundation-trace-canvas" width="640" height="320" aria-label="Schreibfläche für Buchstabe '+t.target+'"></canvas><div class="row gap center-actions top-space"><button id="foundationClearCanvas" class="ghost" type="button">Neu zeichnen</button><button id="foundationDrawDone" class="primary" type="button" disabled>Schreibübung abschließen</button></div><div id="germanFoundationFeedback" class="notice subtle">Die App bewertet deine Handschrift hier bewusst nicht automatisch als richtig oder falsch.</div></div>';
    const canvas=area.querySelector('#foundationTraceCanvas'),ctx=canvas.getContext('2d');
    drawState={drawing:false,last:null,length:0};
    const background=()=>{
      ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,canvas.width,canvas.height);
      if(t.guide!=='none'){ctx.save();ctx.font='220px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineWidth=t.guide==='full'?10:5;ctx.strokeStyle=t.guide==='full'?'rgba(117,85,47,.28)':'rgba(117,85,47,.14)';ctx.setLineDash(t.guide==='full'?[14,12]:[8,18]);ctx.strokeText(t.target,canvas.width/2,canvas.height/2+8);ctx.restore()}
    };
    background();
    const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
    canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);drawState.drawing=true;drawState.last=point(e)});
    canvas.addEventListener('pointermove',e=>{if(!drawState?.drawing)return;const p=point(e),q=drawState.last;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#4f5d3a';ctx.lineWidth=12;ctx.stroke();drawState.length+=Math.hypot(p.x-q.x,p.y-q.y);drawState.last=p;if(drawState.length>120)area.querySelector('#foundationDrawDone').disabled=false});
    const stop=()=>{if(drawState){drawState.drawing=false;drawState.last=null}};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
    area.querySelector('#foundationClearCanvas').onclick=()=>{drawState={drawing:false,last:null,length:0};area.querySelector('#foundationDrawDone').disabled=true;background()};
    area.querySelector('#foundationDrawDone').onclick=()=>{bump('letters',t.id,t.skill);saveProgress();setFeedback('<strong>Schreibübung gespeichert.</strong> Die Form wurde nicht automatisch benotet.','good');setTimeout(advance,650)};
    if(memory)previewTimer=setTimeout(()=>{const el=area.querySelector('#foundationMemoryLetter');if(el){el.textContent='?';el.classList.add('hidden-letter')}},1800);
  }
  function renderFinish(){
    clearTimeout(previewTimer);const area=document.querySelector('#studyArea'),meta=COURSE.find(x=>x.id===run?.stage);document.querySelector('#sessionPill').textContent='Fertig';
    area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Deutsch · Klasse 1</div><div class="study-prompt">Station geschafft</div><p>'+meta.label+' wurde für diesen Lernweg abgeschlossen.</p>'+(run.stage==='handwriting'?'<div class="notice subtle"><strong>Jetzt auf Papier:</strong> Schreibe M, A und O je einmal mit einem Stift. Diese Papierübung wird nicht automatisch bewertet.</div>':'')+'<div class="row gap center-actions top-space"><button id="foundationRepeat" class="ghost" type="button">Noch einmal</button><button id="foundationNext" class="primary" type="button">Nächste Station</button></div></div>';
    area.querySelector('#foundationRepeat').onclick=()=>open(run.stage);
    area.querySelector('#foundationNext').onclick=()=>open(completion().next);
  }

  window.VTGermanFoundation={available,progress,completion,renderHub,open,course:COURSE,stageTasks};
})();
