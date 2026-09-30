'use strict';

(function(){
  const COURSE=[
    {id:'handwriting',label:'Buchstaben schreiben',short:'groß und klein: nachfahren, hören, selbst schreiben'},
    {id:'letters',label:'Buchstaben erkennen',short:'Groß- und Kleinbuchstaben sicher unterscheiden'},
    {id:'sounds',label:'Laute',short:'Laut und Buchstabe verbinden'},
    {id:'words',label:'Erste Wörter',short:'lesen und aus dem Hören schreiben'},
    {id:'sentences',label:'Einfache Sätze',short:'verstehen und bilden'}
  ];
  const LETTERS=[
    {letter:'M',lower:'m',sound:'mmmm',word:'Maus'},{letter:'A',lower:'a',sound:'aaaa',word:'Apfel'},{letter:'O',lower:'o',sound:'oooo',word:'Oma'},
    {letter:'L',lower:'l',sound:'llll',word:'Lampe'},{letter:'S',lower:'s',sound:'ssss',word:'Sonne'},{letter:'E',lower:'e',sound:'eeee',word:'Ente'},
    {letter:'N',lower:'n',sound:'nnnn',word:'Nase'},{letter:'I',lower:'i',sound:'iiii',word:'Igel'},{letter:'R',lower:'r',sound:'rrrr',word:'Rose'},{letter:'T',lower:'t',sound:'ttt',word:'Tisch'}
  ];
  const FREE_WRITING_LETTERS=[
    {letter:'A',lower:'a',sound:'aaaa'},{letter:'B',lower:'b',sound:'b b b'},{letter:'C',lower:'c',sound:'k'},{letter:'D',lower:'d',sound:'d d d'},
    {letter:'E',lower:'e',sound:'eeee'},{letter:'F',lower:'f',sound:'ffff'},{letter:'G',lower:'g',sound:'g g g'},{letter:'H',lower:'h',sound:'hhhh'},
    {letter:'I',lower:'i',sound:'iiii'},{letter:'J',lower:'j',sound:'j j j'},{letter:'K',lower:'k',sound:'k k k'},{letter:'L',lower:'l',sound:'llll'},
    {letter:'M',lower:'m',sound:'mmmm'},{letter:'N',lower:'n',sound:'nnnn'},{letter:'O',lower:'o',sound:'oooo'},{letter:'P',lower:'p',sound:'p p p'},
    {letter:'Q',lower:'q',sound:'kw'},{letter:'R',lower:'r',sound:'rrrr'},{letter:'S',lower:'s',sound:'ssss'},{letter:'T',lower:'t',sound:'ttt'},
    {letter:'U',lower:'u',sound:'uuuu'},{letter:'V',lower:'v',sound:'ffff'},{letter:'W',lower:'w',sound:'w w w'},{letter:'X',lower:'x',sound:'ks'},
    {letter:'Y',lower:'y',sound:'üüü'},{letter:'Z',lower:'z',sound:'tsss'},{letter:'Ä',lower:'ä',sound:'ääää'},{letter:'Ö',lower:'ö',sound:'öööö'},
    {letter:'Ü',lower:'ü',sound:'üüüü'}
  ];
  const PHONEME_FILES={
    A:'a',B:'b',C:'c',D:'d',E:'e',F:'f',G:'g',H:'h',I:'i',J:'j',K:'k',L:'l',M:'m',N:'n',O:'o',
    P:'p',Q:'q',R:'r',S:'s',T:'t',U:'u',V:'v',W:'w',X:'x',Y:'y',Z:'z','Ä':'ae','Ö':'oe','Ü':'ue'
  };
  let phonemeAudio=null;
  let phonemeLast={state:'idle',letter:null,error:null,duration:0,path:null};
  function phonemeStatus(){return {...phonemeLast}}
  function phonemeAudioPath(letter){
    const key=String(letter||'').trim().toUpperCase(),slug=PHONEME_FILES[key];
    return slug?'assets/audio/phonemes/de/generated/'+slug+'.wav':'';
  }
  function stopPhoneme(){
    try{
      if(phonemeAudio){
        phonemeAudio.pause();
        phonemeAudio.currentTime=0;
      }
    }catch(_e){}
    phonemeAudio=null;
  }
  function playPhoneme(letter){
    const key=String(letter||'').trim().toUpperCase(),path=phonemeAudioPath(key);
    if(!path){
      phonemeLast={state:'error',letter:key||null,error:'missing phoneme file',duration:0,path:null};
      if(typeof toast==='function')toast('Für diesen Buchstaben ist noch kein Laut hinterlegt.','subtle');
      return false;
    }
    try{
      stopPhoneme();
      const audio=new Audio(path);
      audio.preload='auto';
      audio.volume=1;
      audio.playsInline=true;
      phonemeAudio=audio;
      phonemeLast={state:'loading',letter:key,error:null,duration:0,path};
      audio.addEventListener('playing',()=>{
        if(phonemeAudio===audio)phonemeLast={state:'started',letter:key,error:null,duration:Number.isFinite(audio.duration)?audio.duration:0,path};
      },{once:true});
      audio.addEventListener('ended',()=>{
        if(phonemeAudio===audio)phonemeLast={state:'ended',letter:key,error:null,duration:Number.isFinite(audio.duration)?audio.duration:0,path};
      },{once:true});
      audio.addEventListener('error',()=>{
        if(phonemeAudio!==audio)return;
        const mediaError=audio.error;
        const message=mediaError?('media error '+mediaError.code):'media element error';
        phonemeLast={state:'error',letter:key,error:message,duration:0,path};
        if(typeof toast==='function')toast('Der Buchstabenlaut konnte nicht abgespielt werden.','bad');
      },{once:true});
      const started=audio.play();
      if(started?.catch)started.catch(error=>{
        if(phonemeAudio!==audio)return;
        const message=String(error?.message||error);
        phonemeLast={state:'error',letter:key,error:message,duration:0,path};
        console.warn('Buchstabenlaut konnte nicht abgespielt werden.',error);
        if(typeof toast==='function')toast('Der Buchstabenlaut konnte nicht abgespielt werden.','bad');
      });
      return true;
    }catch(error){
      const message=String(error?.message||error);
      phonemeLast={state:'error',letter:key,error:message,duration:0,path};
      console.warn('Buchstabenlaut konnte nicht abgespielt werden.',error);
      if(typeof toast==='function')toast('Der Buchstabenlaut konnte nicht abgespielt werden.','bad');
      return false;
    }
  }
  const WORDS=[
    {id:'oma',word:'Oma',icon:'👵',label:'Großmutter'},
    {id:'nase',word:'Nase',icon:'👃',label:'Nase'},
    {id:'rose',word:'Rose',icon:'🌹',label:'Rose'}
  ];
  const SENTENCES=[
    {id:'oma_malt',sentence:'Oma malt.',icon:'👵🎨',distractors:['👃🌹','🦙🍎']},
    {id:'mama_malt',sentence:'Mama malt.',tokens:['Mama','malt','.']}
  ];
  let run=null,drawState=null,previewTimer=null,freeWritingSelection=new Set();
  function readButton(text,label='Anweisung vorlesen'){
    return window.VTReadAloud?.button?.(text,label,'foundation-read')||'';
  }

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
  function freeWritingMeta(form){
    return FREE_WRITING_LETTERS.find(x=>x.letter===form||x.lower===form)||null;
  }
  function selectedFreeWritingForms(){
    const ordered=[];
    FREE_WRITING_LETTERS.forEach(x=>{if(freeWritingSelection.has(x.letter))ordered.push(x.letter);if(freeWritingSelection.has(x.lower))ordered.push(x.lower)});
    return ordered;
  }
  function freeWritingState(){
    return {selected:selectedFreeWritingForms(),forms:[...(run?.freePractice?run.forms||[]:[])],index:run?.freePractice?(Number(run.index)||0):null};
  }
  function drawSchoolLineature(ctx,canvas){
    const top=18,roof=108,ground=214,bottom=302;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='rgba(231,220,196,.28)';ctx.fillRect(0,top,canvas.width,roof-top);
    ctx.fillStyle='rgba(255,255,255,.62)';ctx.fillRect(0,roof,canvas.width,ground-roof);
    ctx.fillStyle='rgba(225,234,215,.32)';ctx.fillRect(0,ground,canvas.width,bottom-ground);
    ctx.save();
    ctx.strokeStyle='rgba(117,85,47,.48)';ctx.lineWidth=2;
    [top,roof,ground,bottom].forEach(y=>{ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()});
    ctx.setLineDash([8,8]);ctx.strokeStyle='rgba(117,85,47,.24)';ctx.lineWidth=1.5;
    [63,161,258].forEach(y=>{ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(canvas.width,y);ctx.stroke()});
    ctx.setLineDash([]);ctx.fillStyle='rgba(83,68,48,.52)';ctx.font='600 16px system-ui, sans-serif';ctx.textAlign='right';
    ctx.fillText('Dachgeschoss',canvas.width-12,48);
    ctx.fillText('Erdgeschoss',canvas.width-12,142);
    ctx.fillText('Keller',canvas.width-12,244);
    ctx.restore();
  }
  function drawFreeWritingReference(canvas,form){
    const ctx=canvas.getContext('2d'),upper=form===String(form).toUpperCase()&&form!==String(form).toLowerCase();
    ctx.save();
    ctx.font=(upper?245:190)+'px "Chalkboard SE","Comic Sans MS","Marker Felt",system-ui,sans-serif';
    ctx.textAlign='center';
    ctx.textBaseline='alphabetic';
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.setLineDash([14,10]);
    ctx.lineWidth=8;
    ctx.strokeStyle='rgba(47,111,151,.52)';
    ctx.strokeText(form,canvas.width/2,214);
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(47,111,151,.10)';
    ctx.fillText(form,canvas.width/2,214);
    ctx.restore();
  }
  function mixOptions(values,key=''){
    const arr=[...values];if(arr.length<2)return arr;
    const hash=[...String(key)].reduce((sum,ch)=>sum+ch.charCodeAt(0),0),offset=hash%arr.length;
    return arr.slice(offset).concat(arr.slice(0,offset));
  }
  function stageTasks(stage){
    if(stage==='handwriting')return LETTERS.map(x=>({kind:'drawPair',id:x.letter,upper:x.letter,lower:x.lower,sound:x.sound,word:x.word}));
    if(stage==='letters')return LETTERS.map((x,i)=>{
      const lower=(i%2)===1,target=lower?x.lower:x.letter;
      const raw=[target,lower?LETTERS[(i+2)%LETTERS.length].lower:LETTERS[(i+2)%LETTERS.length].letter,lower?LETTERS[(i+5)%LETTERS.length].lower:LETTERS[(i+5)%LETTERS.length].letter];
      return {kind:'letterChoice',id:x.letter,target,options:mixOptions(raw,'letter-'+x.letter)};
    });
    if(stage==='sounds')return LETTERS.slice(0,6).map((x,i)=>{
      const pair=v=>v.letter+' '+v.lower,target=pair(x),raw=[target,pair(LETTERS[(i+3)%LETTERS.length]),pair(LETTERS[(i+6)%LETTERS.length])];
      return {kind:'soundChoice',id:x.letter,target,sound:x.sound,word:x.word,options:mixOptions(raw,'sound-'+x.letter)};
    });
    if(stage==='words')return [
      {kind:'wordPicture',id:'oma',word:'Oma',icon:'👵',options:mixOptions(WORDS,'word-oma')},
      {kind:'wordPicture',id:'nase',word:'Nase',icon:'👃',options:mixOptions(WORDS,'word-nase')},
      {kind:'wordWrite',id:'rose',word:'Rose'}
    ];
    if(stage==='sentences')return [
      {kind:'sentencePicture',id:'oma_malt',sentence:'Oma malt.',icon:'👵🎨',options:mixOptions(['👵🎨','👃🌹','🦙🍎'],'sentence-oma-malt')},
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
    root.innerHTML='<div class="german-foundation-head"><div><div class="eyebrow">Klasse 1 · Grundlagen</div><div class="row gap align-center"><h3>Buchstaben, Laute und erste Sätze</h3>'+readButton('Buchstaben, Laute und erste Sätze. Ruhig lernen, ohne Battle-Wertung.','Grundlagen vorlesen')+'</div><p>Ruhig lernen – ohne Battle-Wertung. Schreibübungen werden nicht automatisch als richtig oder falsch beurteilt.</p></div><div class="german-foundation-progress"><strong>'+c.done+' / '+c.total+'</strong><span>Stationen</span></div></div><progress max="'+c.total+'" value="'+c.done+'" aria-label="'+c.done+' von '+c.total+' Grundlagenstationen abgeschlossen"></progress><div class="german-foundation-stages">'+stageHtml+'</div><div class="german-free-writing-launch"><div><strong>Freies Schreiben</strong><small>Buchstaben selbst auswählen · mit Dach, Erdgeschoss und Keller · ohne Testfortschritt</small></div><button id="germanFreeWritingBtn" type="button" class="secondary">Freies Schreiben</button></div><div class="row end top-space"><button id="germanFoundationStartBtn" type="button" class="primary">'+(c.done?'Weiterlernen':'Grundlagen starten')+'</button></div>';
    root.querySelectorAll('[data-german-stage]').forEach(b=>b.addEventListener('click',()=>open(b.dataset.germanStage)));
    root.querySelector('#germanFoundationStartBtn')?.addEventListener('click',()=>open(c.next));
    root.querySelector('#germanFreeWritingBtn')?.addEventListener('click',openFreeWriting);
  }
  function open(stage=''){
    if(!available())return;
    const selected=COURSE.some(x=>x.id===stage)?stage:completion().next;
    run={stage:selected,index:0,tasks:stageTasks(selected),wrong:0,assembled:[],drawPhase:'trace'};
    if(typeof session!=='undefined')session=null;
    showView('learnView');
    const meta=COURSE.find(x=>x.id===selected);document.querySelector('#modePill').textContent='Deutsch · '+meta.label;
    renderTask();
  }
  function openFreeWriting(){
    if(!available())return;
    if(typeof session!=='undefined')session=null;
    run={stage:'freeWriting',freePractice:true,index:0,forms:[]};
    showView('learnView');
    document.querySelector('#modePill').textContent='Deutsch · Freies Schreiben';
    document.querySelector('#sessionPill').textContent='freie Übung';
    renderFreeWritingSelector();
  }
  function renderFreeWritingSelector(){
    const area=document.querySelector('#studyArea');if(!area)return;
    const selected=selectedFreeWritingForms();
    const groups=FREE_WRITING_LETTERS.map(x=>{
      const upper=freeWritingSelection.has(x.letter),lower=freeWritingSelection.has(x.lower);
      return '<div class="free-letter-group"><button type="button" class="free-letter-choice '+(upper?'selected':'')+'" data-free-form="'+x.letter+'" aria-pressed="'+upper+'">'+x.letter+'</button><button type="button" class="free-letter-choice '+(lower?'selected':'')+'" data-free-form="'+x.lower+'" aria-pressed="'+lower+'">'+x.lower+'</button></div>';
    }).join('');
    const summary=selected.length?selected.join(', '):'Noch nichts ausgewählt';
    area.innerHTML='<div class="study-card german-literacy-card german-foundation-task free-writing-selector"><div class="eyebrow">Freies Lernen · Buchstaben selbst wählen</div><div class="row gap align-center"><h3>Was möchtest du schreiben?</h3>'+readButton('Wähle einen Buchstaben oder mehrere Buchstaben aus. Du kannst Groß- und Kleinbuchstaben einzeln auswählen.','Auswahl erklären')+'</div><p>Tippe zum Beispiel nur <strong>m</strong>, beide Formen <strong>M und m</strong> oder mehrere Buchstaben wie <strong>a, e, m, s</strong>.</p><div class="free-letter-grid">'+groups+'</div><div class="free-writing-selection-summary" aria-live="polite"><span>Ausgewählt</span><strong id="freeWritingSelectionSummary">'+summary+'</strong></div><div class="row gap wrap center-actions top-space"><button id="freeWritingReset" class="ghost" type="button">Auswahl löschen</button><button id="freeWritingStart" class="primary" type="button" '+(selected.length?'':'disabled')+'>Schreiben starten</button></div><div class="notice subtle">Freie Wiederholungen sind Übung. Sie verändern weder Mastery noch Testbereitschaft oder Tagesfortschritt.</div></div>';
    const sync=()=>{
      const now=selectedFreeWritingForms(),summaryEl=area.querySelector('#freeWritingSelectionSummary'),start=area.querySelector('#freeWritingStart');
      if(summaryEl)summaryEl.textContent=now.length?now.join(', '):'Noch nichts ausgewählt';
      if(start)start.disabled=!now.length;
    };
    area.querySelectorAll('[data-free-form]').forEach(btn=>btn.onclick=()=>{
      const form=btn.dataset.freeForm;
      if(freeWritingSelection.has(form))freeWritingSelection.delete(form);else freeWritingSelection.add(form);
      const on=freeWritingSelection.has(form);btn.classList.toggle('selected',on);btn.setAttribute('aria-pressed',String(on));sync();
    });
    area.querySelector('#freeWritingReset').onclick=()=>{freeWritingSelection.clear();renderFreeWritingSelector()};
    area.querySelector('#freeWritingStart').onclick=startFreeWriting;
  }
  function startFreeWriting(){
    const forms=selectedFreeWritingForms();if(!forms.length){renderFreeWritingSelector();return}
    run={stage:'freeWriting',freePractice:true,index:0,forms:[...forms]};
    renderFreeWritingTask();
  }
  function bindWritingCanvas(canvas,{onReady}={}){
    const ctx=canvas.getContext('2d');drawState={drawing:false,last:null,length:0};drawSchoolLineature(ctx,canvas);
    const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
    canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);drawState.drawing=true;drawState.last=point(e)});
    canvas.addEventListener('pointermove',e=>{if(!drawState?.drawing)return;const p=point(e),q=drawState.last;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#4f5d3a';ctx.lineWidth=12;ctx.stroke();drawState.length+=Math.hypot(p.x-q.x,p.y-q.y);drawState.last=p;if(drawState.length>80)onReady?.()});
    const stop=()=>{if(drawState){drawState.drawing=false;drawState.last=null}};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
    return ()=>{drawState={drawing:false,last:null,length:0};drawSchoolLineature(ctx,canvas)};
  }
  function renderFreeWritingTask(){
    const area=document.querySelector('#studyArea');if(!area||!run?.freePractice)return;
    const forms=run.forms||[],form=forms[(Number(run.index)||0)%forms.length],meta=freeWritingMeta(form);if(!form||!meta){renderFreeWritingSelector();return}
    document.querySelector('#sessionPill').textContent=((Number(run.index)||0)%forms.length+1)+' / '+forms.length+' · frei';
    const instruction='Schreibe den ausgewählten Buchstaben in die Lineatur. Du kannst den Laut so oft anhören, wie du möchtest.';
    const neutralFeedback='Deine Wiederholung wird nicht als Test- oder Mastery-Fortschritt gespeichert.';
    area.innerHTML='<div class="study-card german-literacy-card german-foundation-task free-writing-task"><div class="eyebrow">Freies Schreiben · ohne Bewertung</div><div class="free-writing-target"><span>Dein Buchstabe</span><strong>'+form+'</strong></div>'+readButton(instruction)+'<button id="foundationFreeSoundBtn" class="secondary" type="button">🔊 Laut hören</button><div class="study-sub">'+instruction+'</div><canvas id="foundationFreeCanvas" class="foundation-trace-canvas foundation-school-lineature" width="640" height="320" aria-label="Freie Schreibfläche mit Dachgeschoss, Erdgeschoss und Keller für '+form+'"></canvas><div id="foundationFreeCompareLegend" class="free-writing-compare-legend hidden" aria-hidden="true"><span class="own">Deine Spur</span><span class="model">Sollform</span></div><div id="foundationFreeWriteActions" class="row gap wrap center-actions top-space"><button id="foundationFreeClear" class="ghost" type="button">Neu schreiben</button><button id="foundationFreeSelection" class="ghost" type="button">Auswahl ändern</button><button id="foundationFreeCheck" class="primary" type="button" disabled>Kontrollieren</button></div><div id="foundationFreeReviewActions" class="row gap wrap center-actions top-space hidden"><button id="foundationFreeRetry" class="ghost" type="button">Nochmal schreiben</button><button id="foundationFreeAccept" class="primary" type="button">Passt für mich</button></div><div id="germanFoundationFeedback" class="notice subtle">'+neutralFeedback+'</div></div>';
    const canvas=area.querySelector('#foundationFreeCanvas'),check=area.querySelector('#foundationFreeCheck');
    const writeActions=area.querySelector('#foundationFreeWriteActions'),reviewActions=area.querySelector('#foundationFreeReviewActions'),legend=area.querySelector('#foundationFreeCompareLegend'),feedback=area.querySelector('#germanFoundationFeedback');
    const clear=bindWritingCanvas(canvas,{onReady:()=>{check.disabled=false}});
    const resetWriting=()=>{
      clear();check.disabled=true;canvas.style.pointerEvents='';canvas.classList.remove('self-check');
      writeActions.classList.remove('hidden');reviewActions.classList.add('hidden');legend.classList.add('hidden');legend.setAttribute('aria-hidden','true');
      canvas.setAttribute('aria-label','Freie Schreibfläche mit Dachgeschoss, Erdgeschoss und Keller für '+form);
      feedback.className='notice subtle';feedback.textContent=neutralFeedback;
    };
    area.querySelector('#foundationFreeSoundBtn').onclick=()=>playPhoneme(meta.letter);
    area.querySelector('#foundationFreeClear').onclick=resetWriting;
    area.querySelector('#foundationFreeSelection').onclick=renderFreeWritingSelector;
    check.onclick=()=>{
      canvas.style.pointerEvents='none';canvas.classList.add('self-check');drawFreeWritingReference(canvas,form);
      writeActions.classList.add('hidden');reviewActions.classList.remove('hidden');legend.classList.remove('hidden');legend.setAttribute('aria-hidden','false');
      canvas.setAttribute('aria-label','Selbstkontrolle für '+form+': eigene Schreibspur mit eingeblendeter Sollform');
      feedback.className='notice subtle';feedback.innerHTML='<strong>Vergleiche selbst.</strong> Die blaue gestrichelte Form zeigt die Sollform. Stimmen Form, Höhe und Dach/Erdgeschoss/Keller ungefähr?';
    };
    area.querySelector('#foundationFreeRetry').onclick=resetWriting;
    area.querySelector('#foundationFreeAccept').onclick=()=>{run.index=(Number(run.index)||0)+1;renderFreeWritingTask()};
  }

  function task(){return run?.tasks?.[run.index]||null}
  function setFeedback(html,kind='subtle'){
    const el=document.querySelector('#germanFoundationFeedback');if(!el)return;el.className='notice '+kind;el.innerHTML=html;
  }
  function advance(){
    if(!run)return;run.index++;run.drawPhase='trace';
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
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Buchstaben erkennen</div><div class="study-prompt">Finde den Buchstaben <strong>'+t.target+'</strong>.</div>'+readButton('Finde den Buchstaben '+t.target+'.')+choiceButtons(t.options,t.target,'letters',t.id,'recognized')+'<div id="germanFoundationFeedback" class="notice subtle">Schau genau auf die Form.</div></div>';
      area.querySelectorAll('[data-foundation-answer]').forEach(b=>b.onclick=()=>b.dataset.foundationAnswer===t.target?correct('letters',t.id,'recognized'):wrong());return;
    }
    if(t.kind==='soundChoice'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Laut ↔ Buchstabe</div><div class="study-prompt">Welcher Groß- und Kleinbuchstabe passt zu diesem Laut?</div>'+readButton('Höre den Laut. Wähle danach den passenden Groß- und Kleinbuchstaben.')+'<button id="foundationSpeakBtn" class="secondary" type="button">🔊 Laut hören</button><div class="study-sub">Höre auf den Laut, nicht auf den Buchstabennamen.</div>'+choiceButtons(t.options,t.target,'letters',t.id,'phonemeGrapheme')+'<div id="germanFoundationFeedback" class="notice subtle">Du kannst den Laut so oft anhören, wie du möchtest.</div></div>';
      area.querySelector('#foundationSpeakBtn').onclick=()=>playPhoneme(t.id);
      area.querySelectorAll('[data-foundation-answer]').forEach(b=>b.onclick=()=>b.dataset.foundationAnswer===t.target?correct('letters',t.id,'phonemeGrapheme'):wrong());return;
    }
    if(t.kind==='drawPair'){renderDraw(t);return}
    if(t.kind==='wordPicture'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Erstes Wort lesen</div><div class="study-prompt">'+t.word+'</div>'+readButton('Welches Bild passt zum Wort? Lies das Wort erst selbst.')+'<div class="study-sub">Welches Bild passt zum Wort?</div><div class="german-picture-options">'+t.options.map(x=>'<button type="button" data-word-picture="'+x.id+'" aria-label="'+x.label+'">'+x.icon+'</button>').join('')+'</div><div id="germanFoundationFeedback" class="notice subtle">Lies das Wort erst selbst. Audio gibt es nach der Lösung.</div></div>';
      area.querySelectorAll('[data-word-picture]').forEach(b=>b.onclick=()=>{if(b.dataset.wordPicture!==t.id)return wrong();bump('words',t.id,'decoded');bump('words',t.id,'meaning');saveProgress();setFeedback('<strong>Richtig.</strong> '+t.word+' '+t.icon+' <button type="button" id="foundationAfterSpeak" class="ghost">🔊 Wort hören</button>','good');area.querySelector('#foundationAfterSpeak').onclick=()=>speak(t.word);setTimeout(advance,800)});return;
    }
    if(t.kind==='wordWrite'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Erstes Wort schreiben</div><button id="foundationSpeakBtn" class="secondary" type="button">🔊 Wort anhören</button>'+readButton('Schreibe das gehörte Wort richtig. Großschreibung gehört dazu.')+'<div class="study-sub">Schreibe das gehörte Wort richtig. Großschreibung gehört dazu.</div><input id="foundationWordInput" class="answer-input" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Gehörtes Wort schreiben"><div class="top-space"><button id="foundationWordCheck" class="primary" type="button">Prüfen</button></div><div id="germanFoundationFeedback" class="notice subtle">Das Wort wird vor der Antwort nicht angezeigt.</div></div>';
      area.querySelector('#foundationSpeakBtn').onclick=()=>speak(t.word);
      area.querySelector('#foundationWordCheck').onclick=()=>{const a=String(area.querySelector('#foundationWordInput').value||'').normalize('NFKC').trim();a===t.word?correct('words',t.id,'written'):wrong()};return;
    }
    if(t.kind==='sentencePicture'){
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Satz verstehen</div><div class="study-prompt german-sentence-prompt">'+t.sentence+'</div>'+readButton('Welches Bild passt zum ganzen Satz? Lies den Satz ohne Zeitdruck.')+'<div class="study-sub">Welches Bild passt zum ganzen Satz?</div><div class="german-picture-options">'+t.options.map((x,i)=>'<button type="button" data-sentence-picture="'+i+'" aria-label="Bild '+(i+1)+'">'+x+'</button>').join('')+'</div><div id="germanFoundationFeedback" class="notice subtle">Lies den Satz ohne Zeitdruck.</div></div>';
      area.querySelectorAll('[data-sentence-picture]').forEach(b=>b.onclick=()=>t.options[Number(b.dataset.sentencePicture)]===t.icon?correct('sentences',t.id,'comprehension'):wrong());return;
    }
    if(t.kind==='sentenceBuild'){
      run.assembled=[];
      area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Satz bilden</div><div class="study-prompt">Baue einen einfachen Satz.</div>'+readButton('Baue einen einfachen Satz. Tippe die Wörter in der richtigen Reihenfolge.')+'<div id="foundationSentence" class="assembled" aria-live="polite">Tippe die Wörter in der richtigen Reihenfolge.</div><div class="word-chunks">'+t.tokens.map((x,i)=>'<button type="button" class="chunk" data-sentence-token="'+i+'">'+x+'</button>').join('')+'</div><div class="row gap center-actions"><button id="foundationSentenceReset" class="ghost" type="button">Neu</button><button id="foundationSentenceCheck" class="primary" type="button">Prüfen</button></div><div id="germanFoundationFeedback" class="notice subtle">Ein Satz beginnt groß und endet mit einem Satzzeichen.</div></div>';
      const sync=()=>{area.querySelector('#foundationSentence').textContent=run.assembled.map(x=>x.value).join(' ').replace(/\s+([.!?])/g,'$1')||'Tippe die Wörter in der richtigen Reihenfolge.'};
      area.querySelectorAll('[data-sentence-token]').forEach(b=>b.onclick=()=>{if(b.disabled)return;run.assembled.push({index:Number(b.dataset.sentenceToken),value:b.textContent});b.disabled=true;b.classList.add('used');sync()});
      area.querySelector('#foundationSentenceReset').onclick=()=>{run.assembled=[];area.querySelectorAll('[data-sentence-token]').forEach(b=>{b.disabled=false;b.classList.remove('used')});sync()};
      area.querySelector('#foundationSentenceCheck').onclick=()=>{const answer=run.assembled.map(x=>x.value).join(' ').replace(/\s+([.!?])/g,'$1');answer===t.sentence?correct('sentences',t.id,'formation'):wrong()};return;
    }
  }
  function renderDraw(t){
    const area=document.querySelector('#studyArea'),phase=run?.drawPhase==='free'?'free':'trace',free=phase==='free',pair=t.upper+' '+t.lower;
    const instruction=free?'Höre den Laut. Schreibe danach den Groß- und Kleinbuchstaben selbst.':'Höre den Laut. Fahre danach Groß- und Kleinbuchstaben mit dem Finger oder Stift nach.';
    area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Buchstaben schreiben · '+(free?'selbst schreiben':'nachfahren')+'</div><h3>'+(free?'Jetzt aus dem Gedächtnis':'Groß und klein zusammen lernen')+'</h3>'+readButton(instruction)+(free?'':'<div class="foundation-letter-pair" aria-hidden="true">'+t.upper+' '+t.lower+'</div>')+'<button id="foundationLetterSoundBtn" class="secondary" type="button">🔊 Laut hören</button><div class="study-sub">'+instruction+'</div><canvas id="foundationTraceCanvas" class="foundation-trace-canvas" width="640" height="320" aria-label="'+(free?'Schreibfläche mit Dachgeschoss, Erdgeschoss und Keller für Groß- und Kleinbuchstaben':'Nachfahrfläche mit Dachgeschoss, Erdgeschoss und Keller für '+pair)+'"></canvas><div class="row gap center-actions top-space"><button id="foundationClearCanvas" class="ghost" type="button">Neu zeichnen</button><button id="foundationDrawDone" class="primary" type="button" disabled>'+(free?'Fertig geschrieben':'Nachfahren fertig')+'</button></div><div id="germanFoundationFeedback" class="notice subtle">'+(free?'Die Lösung bleibt jetzt verborgen. Nur der Laut hilft dir.':'Beim Nachfahren ist die Form absichtlich sichtbar. Danach verschwindet sie beim freien Schreiben.')+'</div></div>';
    const canvas=area.querySelector('#foundationTraceCanvas'),ctx=canvas.getContext('2d');
    drawState={drawing:false,last:null,length:0};
    const background=()=>{
      drawSchoolLineature(ctx,canvas);
      if(!free){ctx.save();ctx.font='190px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineWidth=8;ctx.strokeStyle='rgba(117,85,47,.25)';ctx.setLineDash([14,12]);ctx.strokeText(pair,canvas.width/2,214);ctx.restore()}
    };
    background();
    const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
    canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture?.(e.pointerId);drawState.drawing=true;drawState.last=point(e)});
    canvas.addEventListener('pointermove',e=>{if(!drawState?.drawing)return;const p=point(e),q=drawState.last;ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#4f5d3a';ctx.lineWidth=12;ctx.stroke();drawState.length+=Math.hypot(p.x-q.x,p.y-q.y);drawState.last=p;if(drawState.length>120)area.querySelector('#foundationDrawDone').disabled=false});
    const stop=()=>{if(drawState){drawState.drawing=false;drawState.last=null}};canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);
    area.querySelector('#foundationClearCanvas').onclick=()=>{drawState={drawing:false,last:null,length:0};area.querySelector('#foundationDrawDone').disabled=true;background()};
    area.querySelector('#foundationLetterSoundBtn').onclick=()=>playPhoneme(t.id);
    area.querySelector('#foundationDrawDone').onclick=()=>{
      if(!free){bump('letters',t.id,'traced');saveProgress();run.drawPhase='free';renderDraw(t);playPhoneme(t.id);return}
      bump('letters',t.id,'freeProduction');saveProgress();setFeedback('<strong>Schreibübung gespeichert.</strong> Die Handschrift wird bewusst nicht automatisch benotet.','good');setTimeout(advance,650)
    };
  }
  function renderFinish(){
    clearTimeout(previewTimer);const area=document.querySelector('#studyArea'),meta=COURSE.find(x=>x.id===run?.stage);document.querySelector('#sessionPill').textContent='Fertig';
    area.innerHTML='<div class="study-card german-literacy-card german-foundation-task"><div class="eyebrow">Deutsch · Klasse 1</div><div class="study-prompt">Station geschafft</div>'+readButton('Station geschafft. '+meta.label+' wurde für diesen Lernweg abgeschlossen.')+'<p>'+meta.label+' wurde für diesen Lernweg abgeschlossen.</p>'+(run.stage==='handwriting'?'<div class="notice subtle"><strong>Auch auf Papier üben:</strong> Groß- und Kleinbuchstaben dürfen zusätzlich mit einem Stift wiederholt werden. Diese Papierübung wird nicht automatisch bewertet.</div>':'')+'<div class="row gap center-actions top-space"><button id="foundationRepeat" class="ghost" type="button">Noch einmal</button><button id="foundationNext" class="primary" type="button">Nächste Station</button></div></div>';
    area.querySelector('#foundationRepeat').onclick=()=>open(run.stage);
    area.querySelector('#foundationNext').onclick=()=>open(completion().next);
  }

  window.VTGermanFoundation={available,progress,completion,renderHub,open,openFreeWriting,freeWritingState,playPhoneme,phonemeStatus,phonemeAudioPath,drawFreeWritingReference,course:COURSE,stageTasks,freeWritingLetters:FREE_WRITING_LETTERS};
})();
