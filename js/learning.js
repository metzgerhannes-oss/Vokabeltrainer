'use strict';

function recentActiveAccuracy(w){const arr=(w.recentActiveResults||[]).slice(-6);return arr.length?arr.filter(Boolean).length/arr.length:null}
function latinMeta(w){
  const extra=String(w.extra||'').trim(), term=String(w.term||'').trim();
  const out={kind:'other',genitive:'',gender:'',principalParts:'',other:''};
  const gender=(extra.match(/(?:^|[,;\s])([mfn])\.?\s*$/i)||[])[1]; if(gender)out.gender=gender.toLowerCase();
  const parts=extra.split(',').map(x=>x.trim()).filter(Boolean);
  if(gender && parts.length){out.kind='noun';out.genitive=parts[0].replace(/\s+[mfn]\.?$/i,'').trim();return out;}
  if(/(?:o|or|io|eo)\b/i.test(parts[0]||'') || parts.length>=3 || /\b(?:sum|fui|esse|fero|tuli|latum)\b/i.test(extra)){out.kind='verb';out.principalParts=extra;return out;}
  if(extra){out.kind='form';out.other=extra;}
  return out;
}
function latinGrammarEligible(w){if(!subjectHasCapability(state.activeSubject,'latinGrammar'))return false;const m=latinMeta(w);return !!(m.genitive||m.gender||m.principalParts||m.other)}
function grammarKeys(w){const m=latinMeta(w);if(m.kind==='noun')return [m.genitive?'genitive':null,m.gender?'gender':null].filter(Boolean);if(m.kind==='verb')return ['principalParts'];return m.other?['form']:[]}
function grammarReady(w){const keys=grammarKeys(w),skills=w.grammarSkills||{};return !!keys.length&&keys.every(k=>(skills[k]||0)>=2)&&(w.grammarSuccessDays||[]).length>=2}
function grammarTarget(w){
  const m=latinMeta(w), skills=w.grammarSkills||{genitive:0,gender:0,principalParts:0,form:0};
  if(m.kind==='noun')return (m.genitive && skills.genitive<=skills.gender)?{key:'genitive',label:'Genitiv',prompt:`${w.term} – Genitiv?`,target:m.genitive,rule:'Substantive immer als Nominativ + Genitiv + Genus zusammen lernen.'}:{key:'gender',label:'Genus',prompt:`${w.term}, ${m.genitive||'…'} – Genus?`,target:m.gender,rule:'Das Genus gehört fest zur Vokabel. Antworte m, f oder n.'};
  if(m.kind==='verb')return {key:'principalParts',label:'Stammformen',prompt:`${w.term} – Stamm-/Grundformen?`,target:m.principalParts,rule:'Stammformen produktiv abrufen; sie helfen, gebeugte Verbformen später wiederzuerkennen.'};
  return {key:'form',label:'Zusatzform',prompt:`${w.term} – ergänzende Form?`,target:m.other,rule:'Form und Grundbedeutung zusammen verknüpfen; danach im Beispielsatz wiedererkennen.'};
}
function senseRecordForWord(w){const v=(state.vocabulary||[]).find(x=>x.id===w?.vocabId);return {v,sense:v?senseById(v,w?.senseId):null}}
function ambiguousSenseWord(w){const {v}=senseRecordForWord(w);return (v?.senses||[]).length>1}
function senseCueText(w){
  const {v,sense}=senseRecordForWord(w);if(!v||!sense||(v.senses||[]).length<2)return '';
  const parts=[],pos=String(sense.partOfSpeech||'').trim(),others=(v.senses||[]).filter(s=>s.id!==sense.id);if(pos&&others.some(s=>String(s.partOfSpeech||'').trim()!==pos))parts.push(pos);
  const example=String(w.example||'').trim();if(example){const rx=new RegExp(String(w.term||'').replace(/[.*+?^$()|[\]{}\\]/g,'\\$&'),'i');parts.push(example.replace(rx,'_____'))}
  return parts.join(' · ');
}
function meaningRecallHasCue(w){return !ambiguousSenseWord(w)||!!senseCueText(w)}
function meaningPromptText(w){const cue=senseCueText(w);return cue?`${w.term} · ${cue}`:w.term}
function meaningCueHtml(w){const cue=senseCueText(w);return cue?`<div class="study-sub">Kontext: ${esc(cue)}</div>`:''}
function allSenseTranslationTargets(w){const {v}=senseRecordForWord(w);return [...new Set([...(translationTargets(w)||[]),...(v?.senses||[]).flatMap(s=>[s.translation,...(s.translations||[])])].filter(Boolean))]}
function practiceMeaningDirection(w){const ambiguity=ambiguousSenseWord(w)&&!meaningRecallHasCue(w);return {prompt:meaningPromptText(w),target:w.translation,targets:ambiguity?allSenseTranslationTargets(w):translationTargets(w),label:'Deutsch',ambiguity}}

function adaptiveDaysSince(value){
  if(!value)return null;
  const key=String(value).slice(0,10),then=dayNumber(key),now=dayNumber(today());
  return Number.isFinite(then)&&Number.isFinite(now)?Math.max(0,now-then):null;
}
function adaptiveProductiveMode(w,testCtx=null){
  const fmt=testCtx?.testFormat||'target';
  if(fmt==='dictation')return 'spelling';
  if(fmt==='source')return meaningRecallHasCue(w)?'reverseRecall':'recall';
  if(fmt==='mixed'&&meaningRecallHasCue(w))return (session?.index||0)%2?'reverseRecall':'recall';
  return 'recall';
}
function chooseAdaptiveMode(w){
  const s={...defaultSkills(),...(w.skills||{})},lrs=!!learner().lrsMode,modes=new Set(w.modesSeen||[]),acc=recentActiveAccuracy(w),chunksOk=chunkEligibleWord(w);
  const testCtx=session?.isDaily?upcomingTestContext():null,scaffoldedNow=!!session?.scaffoldedWords?.[w.id];
  const independent=Number(w.independentSuccesses)||0,spellingErrors=Number(w.errorProfile?.spelling)||0,contextErrors=Number(w.errorProfile?.context)||0;
  const newWord=independent===0&&!(w.recentActiveResults||[]).length,lastGap=adaptiveDaysSince(w.lastActiveSuccessAt),dueGap=w.dueDate?Math.max(0,dayNumber(today())-dayNumber(w.dueDate)):0;
  const productive=adaptiveProductiveMode(w,testCtx),basicKnown=s.retrieval>=1||independent>=1;

  if(testCtx&&testCtx.days<=1&&(w.repetitions||0)>0)return productive;
  if(scaffoldedNow)return productive;
  if((w.repetitions||0)>0&&((lastGap!==null&&lastGap>=3)||dueGap>=1))return productive;

  if(acc!==null&&acc<.7){
    if(spellingErrors>0&&chunksOk&&!modes.has('chunks'))return 'chunks';
    if(lrs&&!modes.has('listening'))return 'listening';
    return 'recognition';
  }

  if(newWord){
    if(lrs&&!modes.has('listening'))return 'listening';
    if(!modes.has('recognition'))return 'recognition';
    return 'recall';
  }

  if(spellingErrors>0){
    if(chunksOk&&!modes.has('chunks'))return 'chunks';
    if(s.spelling<3)return 'spelling';
  }
  if(s.retrieval<2)return 'recall';

  if((!testCtx||['source','mixed'].includes(testCtx.testFormat||''))&&meaningRecallHasCue(w)&&!modes.has('reverseRecall')&&independent>=2)return 'reverseRecall';

  if(s.spelling<2)return 'spelling';
  if(basicKnown&&w.example&&(contextErrors>0||(s.context<1&&independent>=2)))return 'context';
  if(s.retrieval<3)return 'recall';
  if(s.spelling<3)return 'spelling';
  if(basicKnown&&w.example&&contextErrors>0&&s.context<2)return 'context';
  return s.retrieval<=s.spelling?'recall':'spelling';
}
function buildQueue(mode,setId=null,wordIds=null){
  const chosen=Array.isArray(wordIds)?wordIds.map(ref=>{if(ref&&typeof ref==='object')return ref.setLinkId?wordByLinkId(ref.setLinkId):wordById(ref.wordId||ref.progressId,setId||ref.setId||'');return wordById(ref,setId||'')}).filter(Boolean):null;
  const defaultPool=mode==='cards'?schoolYearVerifiedWords():schoolYearWords();let pool=chosen||(setId?setWords(setId):defaultPool);
  if(mode==='chunks')pool=pool.filter(w=>chunkEligibleWord(w)&&(w.errorProfile?.spelling||0)>0);
  if(chosen)return ['allWords','weakWords'].includes(mode)?shuffle(pool):pool;
  if(mode==='allWords')return shuffle(pool.filter(Boolean));
  if(mode==='weakWords')return shuffle(pool.filter(w=>!isMastered(w)));
  if(mode==='shower'||mode==='flash')return pool.filter(Boolean);
  if(mode==='latinGrammar'){const all=pool.filter(latinGrammarEligible),need=all.filter(w=>!grammarReady(w)),src=need.length?need:all;return src.sort((a,b)=>(a.grammarSuccessDays||[]).length-(b.grammarSuccessDays||[]).length||Math.min(...grammarKeys(a).map(k=>(a.grammarSkills||{})[k]||0))-Math.min(...grammarKeys(b).map(k=>(b.grammarSkills||{})[k]||0))).slice(0,learner().lrsMode?6:10);}
  if(mode==='handwriting'){const src=[...pool].filter(Boolean).sort((a,b)=>((b.errorProfile?.spelling||0)-(a.errorProfile?.spelling||0))||((a.skills?.spelling||0)-(b.skills?.spelling||0))||masteryScore(a)-masteryScore(b));return src.slice(0,learner().lrsMode?4:6);}
  if(mode==='cards'){let src=pool.filter(w=>!isMastered(w));if(!src.length)src=pool;const due=src.filter(w=>!w.dueDate||w.dueDate<=today());if(due.length)src=due;return [...src].sort((a,b)=>leitnerBox(a)-leitnerBox(b)||(a.dueDate||'').localeCompare(b.dueDate||'')||masteryScore(a)-masteryScore(b)).slice(0,learner().lrsMode?6:10);}
  let q=pool.filter(w=>!isMastered(w));if(!q.length)q=pool;const due=q.filter(w=>!w.dueDate||w.dueDate<=today()),src=due.length?due:q;
  return src.sort((a,b)=>masteryScore(a)-masteryScore(b)).slice(0,learner().lrsMode?6:10);
}
function openAllWordsPracticeChooser(){
  const sets=learningReadySets().filter(s=>setWords(s.id).length),all=schoolYearVerifiedWords(),ctx=upcomingTestContext();
  if(!all.length){toast('Noch keine geprüften Vokabeln vorhanden.','warn');return}
  const testOption=ctx?.words?.length?`<button type="button" class="option-card" data-all-practice="__test__"><strong>Aktueller Testumfang</strong><small>${esc(ctx.scopeText||ctx.sets.map(s=>s.title).join(' + '))} · ${ctx.words.length} Vokabeln</small></button>`:'';
  modal(`<div class="eyebrow">Alle Vokabeln üben</div><h2>Welchen Bereich möchtest du komplett üben?</h2><p>Jede Vokabel kommt in diesem Durchgang einmal vor. Beim nächsten Durchgang wird neu gemischt.</p><div class="chooser-list">${testOption}<button type="button" class="option-card" data-all-practice="__year__"><strong>Alle in ${esc(subjectLabel(state.activeSubject))}</strong><small>${all.length} Vokabeln im aktuellen Schuljahr</small></button>${sets.map(s=>`<button type="button" class="option-card" data-all-practice="${esc(s.id)}"><strong>${esc(s.title)}</strong><small>${setWords(s.id).length} Vokabeln</small></button>`).join('')}</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button></div>`);
  $$('[data-all-practice]').forEach(b=>b.onclick=()=>{const id=b.dataset.allPractice;closeModal();if(id==='__test__')startSession('allWords',null,ctx.words.map(quizQueueRef),false);else if(id==='__year__')startSession('allWords');else startSession('allWords',id)});
}
function startWeakWordsPractice(){
  const weak=schoolYearVerifiedWords().filter(w=>!isMastered(w)).sort((a,b)=>masteryScore(a)-masteryScore(b));
  if(!weak.length){toast('Aktuell sind keine unsicheren Vokabeln offen.','good');return}
  startSession('weakWords',null,weak.map(quizQueueRef),false);
}

function openPracticeTestChooser(){
  const ctx=upcomingTestContext(); if(!ctx||!ctx.words.length){toast('Lege zuerst einen Testplan mit Vokabelumfang fest.','warn');return}
  const r=testReadinessForContext(ctx); const shortCount=Math.min(10,ctx.words.length);
  modal(`<div class="eyebrow">Prüfungssimulation</div><h2>Testcheck starten</h2><p>${esc(testContextLabel(ctx))}</p><div class="notice subtle"><strong>${r.pct}% testbereit</strong><br>${r.ready} von ${r.total} Wörtern erfüllen aktuell die Testbereitschaft.</div><p>Die Simulation verändert weder Lernstufen noch Wiederholungsintervalle und vergibt keine XP.</p><div class="modal-actions wrap"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="practiceShortBtn" class="secondary">Kurzcheck (${shortCount})</button><button type="button" id="practiceFullBtn" class="primary">Kompletter Test (${ctx.words.length})</button></div>`);
  $('#practiceShortBtn').onclick=()=>{closeModal();startPracticeTest(false)}; $('#practiceFullBtn').onclick=()=>{closeModal();startPracticeTest(true)};
}
function startPracticeTest(full=false){
  const ctx=upcomingTestContext(); if(!ctx||!ctx.words.length){toast('Kein Testumfang festgelegt.','warn');return}
  const pool=full?[...ctx.words]:testReadinessForContext(ctx).weak.slice(0,Math.min(10,ctx.words.length));
  session={mode:'practiceTest',setId:null,queue:pool.map(quizQueueRef),index:0,correct:0,answered:0,currentSubmode:'practiceTest',locked:false,retryCounts:{},followupCounts:{},hintUsed:false,isDaily:false,testAnswers:[],practiceContext:{date:ctx.date,scopeText:ctx.scopeText||ctx.sets.map(s=>s.title).join(' + '),source:ctx.source,testFormat:ctx.testFormat||'target'},practiceFull:full,currentQuestion:null,currentQuestionIssues:[]};
  showView('learnView'); $('#modePill').textContent=full?'Prüfung · komplett':'Prüfung · Kurzcheck'; renderStudy();
}
function practiceDirection(w){const f=session?.practiceContext?.testFormat||'target';if(f==='source')return {...practiceMeaningDirection(w),strictOrthography:false};if(f==='dictation')return {prompt:'🔊 Diktat',target:w.term,targets:termTargets(w),label:subjectLabel(state.activeSubject),audio:true,strictOrthography:true};if(f==='mixed'){const flip=(session.index%2)===1;return flip?{...practiceMeaningDirection(w),strictOrthography:false}:{prompt:w.translation,target:w.term,targets:termTargets(w),label:subjectLabel(state.activeSubject),strictOrthography:true};}return {prompt:w.translation,target:w.term,targets:termTargets(w),label:subjectLabel(state.activeSubject),strictOrthography:true};}
function practiceAnswerMatches(answer,d){return d?.strictOrthography?spellingMatches(answer,d.targets||d.target):answerMatches(answer,d.targets||d.target)}
function renderPracticeTest(w){
  const d=practiceDirection(w),q=makeQuizQuestion(w,'practiceTest',{prompt:d.prompt,targets:d.targets||[d.target],strictOrthography:!!d.strictOrthography}),issues=validateQuizQuestion(q);
  session.currentQuestion=q;session.currentQuestionIssues=issues;
  if(issues.length){renderQuizIntegrityStop(w,issues);return}
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Prüfungssimulation</div><div class="study-prompt">${esc(q.prompt)}</div>${d.ambiguity?'<div class="notice subtle">Mehrdeutig ohne Kontext: Alle bekannten Bedeutungen werden als richtig akzeptiert.</div>':''}<div class="study-sub">Schreibe die passende Antwort auf ${esc(d.label)}. Keine Hinweise, Auswertung erst am Ende.</div>${d.audio?'<button id="practiceSpeakBtn" class="secondary">🔊 Anhören</button>':''}<input id="answerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off" autocapitalize="none" spellcheck="false"><div class="top-space"><button id="answerBtn" class="primary">Antwort speichern</button></div></div>`;
  if(d.audio){$('#practiceSpeakBtn').onclick=()=>speak(q.term);setTimeout(()=>speak(q.term),150)}
  const submit=()=>{if(session.locked)return;session.locked=true;const answer=$('#answerField').value.trim(),grade=gradeQuizQuestion(q,answer),ok=grade.correct;session.testAnswers.push({questionId:q.id,wordId:q.progressId,setLinkId:q.setLinkId,vocabId:q.vocabId,senseId:q.senseId,answer,correct:ok,target:q.targets[0]||'',acceptedTargets:[...q.targets],prompt:q.prompt,strictOrthography:!!q.strictOrthography});session.answered++;if(ok)session.correct++;session.index++;renderStudy()};
  $('#answerBtn').onclick=submit; $('#answerField').onkeydown=e=>{if(e.key==='Enter')submit()}; setTimeout(()=>$('#answerField')?.focus(),40);
}
function finishPracticeTest(){
  const answers=session?.testAnswers||[],total=answers.length,correct=answers.filter(a=>a.correct).length,pct=total?Math.round(correct/total*100):0,wrong=answers.filter(a=>!a.correct);
  const scale={...gradeScaleFor(state.activeSubject)},suggestedGrade=suggestGradeFromScale(pct,scale);
  const result={id:uid('pt'),learnerId:learner().id,subject:state.activeSubject,date:today(),testDate:session?.practiceContext?.date||'',scopeText:session?.practiceContext?.scopeText||'',full:!!session?.practiceFull,total,correct,percent:pct,suggestedGrade,gradeScaleSnapshot:scale,answers};
  state.practiceTests.push(result); recordActivity('practiceTest',{practiceTestId:result.id,percent:pct,total,correct}); persistOnly();
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Testcheck beendet</div><div class="study-prompt">${pct}%</div><p><strong>${correct} von ${total}</strong> richtig.</p><div class="notice subtle"><strong>Notenvorschlag: ${esc(suggestedGrade)}</strong><br><small>${esc(gradeScaleText(scale))}</small><br><small>Nur Orientierung – der tatsächliche Notenschlüssel der Lehrkraft kann abweichen.</small></div>${wrong.length?`<div class="practice-errors"><h3>Noch unsicher</h3>${wrong.map(a=>`<div><span>${esc(a.prompt)}</span><span>${esc(a.answer||'–')} → <strong>${esc((a.acceptedTargets?.length?a.acceptedTargets:[a.target]).join(' · '))}</strong></span></div>`).join('')}</div>`:'<div class="notice good">Alle Antworten waren richtig.</div>'}<div class="row gap center-actions wrap top-space">${wrong.length?'<button id="practiceWrongBtn" class="secondary">Unsichere Wörter üben</button>':''}${typeof isParentMode==='function'&&isParentMode()?'<button id="practiceScaleBtn" class="ghost">Notenschlüssel</button>':''}<button id="doneBtn" class="primary">Zur Übersicht</button></div><p class="microcopy">Dieser Testcheck verändert den Lernstand nicht. Ergebnis und damaliger Notenschlüssel werden gespeichert.</p></div>`;
  $('#sessionPill').textContent='Fertig'; $('#practiceWrongBtn')?.addEventListener('click',()=>{const ids=wrong.map(a=>({wordId:a.wordId,setLinkId:a.setLinkId||''}));session=null;startSession('adaptive',null,ids,false)}); $('#practiceScaleBtn')?.addEventListener('click',()=>openGradeScaleSettings(state.activeSubject)); $('#doneBtn').onclick=()=>{session=null;showView(typeof isParentMode==='function'&&isParentMode()?'dashboardView':'childProgressView');renderAll()};
}

function firstContactBlockSize(){return learner()?.lrsMode?4:5}
function firstContactLink(linkId){return (state.setVocabulary||[]).find(x=>x.id===linkId)||null}
function firstContactPendingWords(setId){return setWords(setId).filter(w=>!w.firstContactCompletedAt)}
function startCopyPractice(){
  const sets=mySets().filter(s=>!setNeedsPairReview(s)&&setWords(s.id).length);
  if(!sets.length){toast('Noch keine geprüften Vokabeln vorhanden.','warn');return}
  if(sets.length===1){startCopyPracticeSet(sets[0].id);return}
  modal(`<div class="eyebrow">Freiwillige Lerneinheit</div><h2>Welche Vokabeln abschreiben?</h2><p>Abschreiben ist optional. Du kannst jederzeit direkt lernen.</p><div class="chooser-list">${sets.map(s=>{const open=firstContactPendingWords(s.id).length;return `<button type="button" class="option-card" data-copy-set="${s.id}"><strong>${esc(s.title)}</strong><small>${open?open+' noch nicht abgeschrieben':'bereits erledigt · Wiederholung möglich'}</small></button>`}).join('')}</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button></div>`);
  $$('[data-copy-set]').forEach(b=>b.onclick=()=>{const id=b.dataset.copySet;closeModal();startCopyPracticeSet(id)});
}
function startCopyPracticeSet(setId){
  const all=setWords(setId);if(!all.length){toast('In diesem Lernbereich sind keine Vokabeln.','warn');return}
  const pending=all.filter(w=>!w.firstContactCompletedAt),repeat=!pending.length;
  const source=repeat?[...all].sort((a,b)=>masteryScore(a)-masteryScore(b)):pending;
  const picked=source.slice(0,firstContactBlockSize());
  startFirstContact(setId,picked.map(w=>w.setLinkId),{optional:true,forceRepeat:repeat});
}
function startFirstContact(setId,linkIds=null,opts={}){
  const set=state.sets.find(x=>x.id===setId&&x.learnerId===state.activeLearnerId);if(!set)return;
  if(setNeedsPairReview(set)){if(typeof isParentMode==='function'&&isParentMode()){toast('Bitte zuerst die Vokabelpaare prüfen.','warn');setTimeout(()=>openSetPairAudit?.(set.id),80)}else{toast('Diese Wörter werden noch von einem Erwachsenen geprüft.','subtle');showView('homeView');renderAll()}return}
  const all=setWords(setId),requested=Array.isArray(linkIds)&&linkIds.length?new Set(linkIds):null,requestedWords=requested?all.filter(w=>requested.has(w.setLinkId)):all;
  const pending=opts.forceRepeat?requestedWords:requestedWords.filter(w=>!w.firstContactCompletedAt);
  if(!pending.length){toast('Diese Abschreib-Einheit ist bereits erledigt.','good');showView('homeView');renderAll();return}
  const first=pending[0],link=firstContactLink(first.setLinkId);
  session={mode:'firstContact',setId,queue:pending.map(w=>w.setLinkId),index:0,phase:opts.forceRepeat?'copy':(link?.firstContactCopiedAt?'recall':'copy'),blockSize:firstContactBlockSize(),isDaily:false,optional:true,forceRepeat:!!opts.forceRepeat,completedInUnit:0,startedAt:new Date().toISOString()};
  showView('learnView');renderFirstContact();
}
function firstContactWord(){const linkId=session?.queue?.[session?.index||0];return linkId?wordByLinkId(linkId):null}
function firstContactProgressText(){
  const total=session?.queue?.length||0,done=Math.min(Number(session?.completedInUnit)||0,total);
  return total?`${done} von ${total} in dieser Einheit`:'';
}
function firstContactHeader(eyebrow){
  const set=state.sets.find(x=>x.id===session?.setId);return `<div class="first-contact-head"><div><div class="eyebrow">${esc(eyebrow)}</div><h2>${esc(set?.title||'Vokabeln abschreiben')}</h2></div><span class="pill">${esc(firstContactProgressText())}</span></div>`;
}
function renderFirstContact(){
  if(!session||session.mode!=='firstContact')return;
  if(session.index>=session.queue.length){renderFirstContactFinish();return}
  const w=firstContactWord();if(!w){session.index++;renderFirstContact();return}
  const link=firstContactLink(w.setLinkId);if(!session.forceRepeat&&link?.firstContactCompletedAt){session.index++;renderFirstContact();return}
  $('#modePill').textContent='Abschreiben';
  const batchTotal=session.queue.length,batchDone=Math.min(Number(session.completedInUnit)||0,batchTotal);$('#sessionPill').textContent=`${Math.min(batchDone+1,batchTotal)} / ${batchTotal}`;
  if(session.phase==='blockRecall'||session.phase==='blockReveal'){renderFirstContactBlockReview();return}
  if(session.phase==='recall')return renderFirstContactRecall(w);
  if(session.phase==='compare')return renderFirstContactCompare(w);
  renderFirstContactCopy(w);
}
function renderFirstContactCopy(w){
  const lrs=!!learner()?.lrsMode;
  $('#studyArea').innerHTML=`<div class="study-card first-contact-card">${firstContactHeader('1 · Anschauen & abschreiben')}<div class="first-contact-pair"><strong>${esc(w.term)}</strong><span>${esc(w.translation)}</span>${w.extra?`<small>${esc(w.extra)}</small>`:''}</div><p class="first-contact-instruction">Schreibe die Vokabel einmal <strong>von Hand auf</strong>. Papier oder Heft reichen – diese Einheit ist freiwillig.</p>${lrs?'<div class="notice subtle">Nimm dir Zeit. Wichtig ist die genaue Wortform, nicht die Geschwindigkeit.</div>':''}<div class="row gap center-actions wrap top-space"><button id="firstContactSpeakBtn" class="ghost" type="button">🔊 Anhören</button><button id="firstContactCopiedBtn" class="primary" type="button">Von Hand abgeschrieben</button></div></div>`;
  $('#firstContactSpeakBtn').onclick=()=>speak(w.term);
  $('#firstContactCopiedBtn').onclick=()=>{const link=firstContactLink(w.setLinkId);if(link&&!link.firstContactCopiedAt)link.firstContactCopiedAt=new Date().toISOString();session.phase='recall';persistOnly();renderFirstContact()};
}
function renderFirstContactRecall(w){
  $('#studyArea').innerHTML=`<div class="study-card first-contact-card">${firstContactHeader('2 · Abdecken & erinnern')}<div class="first-contact-memory"><span>Bedeutung</span><strong>${esc(w.translation)}</strong></div><p class="first-contact-instruction">Verdecke deine erste Abschrift. Schreibe die Vokabel <strong>noch einmal aus dem Kopf</strong>.</p><div class="notice subtle">Die App bewertet deine Handschrift nicht. Du vergleichst gleich selbst mit der geprüften Wortform.</div><div class="row center-actions top-space"><button id="firstContactRevealBtn" class="primary" type="button">Aufdecken & vergleichen</button></div></div>`;
  $('#firstContactRevealBtn').onclick=()=>{session.phase='compare';renderFirstContact()};
}
function renderFirstContactCompare(w){
  const lrs=!!learner()?.lrsMode;
  $('#studyArea').innerHTML=`<div class="study-card first-contact-card">${firstContactHeader('3 · Vergleichen')}<div class="first-contact-compare"><span>Geprüfte Wortform</span><strong>${esc(w.term)}</strong><small>${esc(w.translation)}</small>${audioButtonHtml(w.term,'Anhören')}</div><p class="first-contact-instruction">Vergleiche Buchstabe für Buchstabe mit deiner zweiten Abschrift.</p><div class="row gap center-actions wrap top-space"><button id="firstContactRetryBtn" class="ghost" type="button">${lrs?'Noch einmal anschauen':'Noch einmal'}</button><button id="firstContactCorrectBtn" class="primary" type="button">Stimmt</button></div></div>`;
  $('#firstContactRetryBtn').onclick=()=>{session.phase='copy';renderFirstContact()};
  $('#firstContactCorrectBtn').onclick=()=>{
    const link=firstContactLink(w.setLinkId),now=new Date().toISOString();if(link){link.firstContactCopiedAt=link.firstContactCopiedAt||now;link.firstContactRecalledAt=now;link.firstContactCompletedAt=link.firstContactCompletedAt||now}
    recordActivity('firstContact',{setId:session.setId,setLinkId:w.setLinkId,vocabId:w.vocabId,senseId:w.senseId});persistOnly();session.completedInUnit=(Number(session.completedInUnit)||0)+1;session.index++;
    if(session.index<session.queue.length&&session.index%session.blockSize===0){session.phase='blockRecall'}else{const next=firstContactWord(),nextLink=next&&firstContactLink(next.setLinkId);session.phase=session.forceRepeat?'copy':(nextLink?.firstContactCopiedAt?'recall':'copy')}
    renderFirstContact();
  };
}
function renderFirstContactBlockReview(){
  const end=session.index,start=Math.max(0,end-session.blockSize),words=session.queue.slice(start,end).map(wordByLinkId).filter(Boolean),revealed=session.phase==='blockReveal';
  $('#modePill').textContent='Abschreiben · kurze Wiederholung';$('#sessionPill').textContent=`Block ${Math.ceil(end/session.blockSize)}`;
  $('#studyArea').innerHTML=`<div class="study-card first-contact-card">${firstContactHeader('Kurze Wiederholung')}<p class="first-contact-instruction">Versuche zu jeder Bedeutung die Vokabel zuerst <strong>im Kopf abzurufen</strong>.</p><div class="first-contact-review-list">${words.map(w=>`<div><span>${esc(w.translation)}</span><strong class="${revealed?'':'first-contact-hidden-word'}">${revealed?esc(w.term):'••••••'}</strong>${revealed?audioButtonHtml(w.term,'Anhören'):''}</div>`).join('')}</div><div class="row center-actions top-space">${revealed?'<button id="firstContactNextBlockBtn" class="primary" type="button">Nächster Block</button>':'<button id="firstContactRevealBlockBtn" class="primary" type="button">Antworten aufdecken</button>'}</div></div>`;
  if(revealed)$('#firstContactNextBlockBtn').onclick=()=>{const next=firstContactWord(),link=next&&firstContactLink(next.setLinkId);session.phase=session.forceRepeat?'copy':(link?.firstContactCopiedAt?'recall':'copy');renderFirstContact()};
  else $('#firstContactRevealBlockBtn').onclick=()=>{session.phase='blockReveal';renderFirstContact()};
}
function renderFirstContactFinish(){
  const setId=session?.setId,set=state.sets.find(x=>x.id===setId),batchTotal=session?.queue?.length||0;
  $('#modePill').textContent='Abschreiben';$('#sessionPill').textContent='Fertig';
  $('#studyArea').innerHTML=`<div class="study-card first-contact-card first-contact-finish"><div class="eyebrow">Freiwillige Lerneinheit</div><div class="study-prompt">✓</div><h2>${esc(set?.title||'Lernbereich')}</h2><p><strong>${batchTotal}</strong> Vokabel${batchTotal===1?'':'n'} wurden abgeschrieben, abgedeckt und aktiv erinnert.</p><div class="notice good">Abschreiben ist eine zusätzliche Übung. Sie zählt nicht zum Tagesziel und schaltet keine Kampfaktion frei.</div><div class="row gap center-actions wrap top-space"><button id="firstContactDoneBtn" class="secondary" type="button">Zur Übersicht</button><button id="firstContactLearnBtn" class="primary" type="button">Jetzt lernen</button></div></div>`;
  renderAll();persistOnly();
  $('#firstContactDoneBtn').onclick=()=>{session=null;showView('homeView');renderAll()};
  $('#firstContactLearnBtn').onclick=()=>{session=null;startSession('adaptive',setId,null,false)};
}

function startSession(mode='adaptive',setId=null,wordIds=null,isDaily=false){
  const queue=buildQueue(mode,setId,wordIds); if(!queue.length){toast('Noch keine geprüften Vokabeln vorhanden.','warn');return}
  const blocked=queue.find(w=>setNeedsPairReview(state.sets.find(s=>s.id===w.setId)));
  if(blocked){const blockedSet=state.sets.find(s=>s.id===blocked.setId);toast('Vor dem Lernen bitte zuerst die erkannten Vokabelpaare bestätigen.','warn');showView('homeView');renderAll();setTimeout(()=>openSetPairAudit?.(blockedSet?.id),80);return}
  session={mode,setId,queue:queue.map(quizQueueRef),index:0,correct:0,answered:0,currentSubmode:null,locked:false,retryCounts:{},followupCounts:{},hintUsed:false,isDaily,scaffoldedWords:{},activeAttemptedWords:{},grammarIntroShown:false,results:[],startedAt:new Date().toISOString(),currentQuestion:null,currentQuestionIssues:[]}; showView('learnView'); $('#modePill').textContent=modeLabel(mode); renderStudy();
}
function modeLabel(m){return ({adaptive:'Adaptiv',allWords:'Alle Vokabeln',weakWords:'Unsichere Vokabeln',flash:'Wortblitz',shower:'Vokabeldusche',chunks:'Wortbausteine',handwriting:'Handschrift',firstContact:'Abschreiben',recognition:'Erkennen',recall:'Abrufen',reverseRecall:'Bedeutung abrufen',spelling:'Schreiben',listening:'Hören',context:'Kontext',latinGrammar:'Latein Formen',practiceTest:'Prüfung',cards:'Karteikarten'})[m]||m}
function currentWord(){const token=session?.queue?.[session.index];return resolveQuizQueueRef(token,session?.setId||'')}
function renderStudy(){
  if(!session||session.index>=session.queue.length){finishSession();return}
  const w=currentWord(); if(!w){session.index++;renderStudy();return}
  $('#sessionPill').textContent=`${session.index+1} / ${session.queue.length}`;
  session.locked=false; session.hintUsed=false;session.currentQuestion=null;session.currentQuestionIssues=[];
  if(session.mode==='practiceTest') return renderPracticeTest(w);
  if(session.mode==='latinGrammar') return renderLatinGrammar(w);
  if(session.mode==='shower') return renderShower(w);
  if(session.mode==='flash') return renderFlash(w);
  if(session.mode==='chunks') return renderChunks(w);
  if(session.mode==='handwriting') return renderHandwriting(w);
  if(session.mode==='cards') return renderLeitnerCard(w);
  const adaptiveLike=['adaptive','allWords','weakWords'].includes(session.mode);let sub=adaptiveLike?chooseAdaptiveMode(w):session.mode;if(sub==='reverseRecall'&&!meaningRecallHasCue(w))sub='recall';session.currentSubmode=sub;
  const prepared=setCurrentQuizQuestion(w,sub);
  if(prepared.issues.length){renderQuizIntegrityStop(w,prepared.issues);return}
  $('#modePill').textContent=adaptiveLike?`${modeLabel(session.mode)} · ${modeLabel(sub)}`:modeLabel(sub);
  if(sub==='recognition')renderRecognition(w); else if(sub==='listening')renderListening(w); else if(sub==='chunks')renderChunks(w); else if(sub==='reverseRecall')renderReverseRecall(w); else if(sub==='spelling')renderSpelling(w); else if(sub==='context')renderContext(w); else renderRecall(w);
}
function cardExtras(w){
  const conf=detectConfusions(w,myWords()); const c=conf.length?`<div class="confusion-box"><strong>Verwechslungsalarm</strong><br>${conf.map(x=>`<span class="pill">${esc(x.term)} = ${esc(x.translation)}</span>`).join(' ')}</div>`:'';
  const s={...defaultSkills(),...(w.skills||{})}; return `${c}<div class="skill-strip" title="Erkennen · Hören · Abruf · Schreiben · Kontext">${['recognition','listening','retrieval','spelling','context'].map(k=>`<span class="${s[k]>=3?'on':''}"></span>`).join('')}</div>`;
}
function renderLatinGrammar(w){
  const g=grammarTarget(w); session.currentSubmode='latinGrammar';
  $('#modePill').textContent=`Latein · ${g.label}`;
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Latein Formen · ${esc(g.label)}</div><div class="notice subtle"><strong>Mini-Regel</strong><br>${esc(g.rule)}</div><div class="study-prompt compact-prompt">${esc(g.prompt)}</div><div class="study-sub">Aus dem Gedächtnis antworten. Danach bekommst du sofort die richtige Form und die Vokabel im Zusammenhang.</div><input id="answerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off" autocapitalize="none" spellcheck="false"><div class="row gap center-actions top-space"><button id="answerBtn" class="primary">Prüfen</button><button id="grammarHintBtn" class="ghost">Regelhilfe</button></div></div>`;
  const submit=()=>gradeGrammar(w,g,$('#answerField').value); $('#answerBtn').onclick=submit; $('#answerField').onkeydown=e=>{if(e.key==='Enter')submit()}; $('#grammarHintBtn').onclick=()=>{session.hintUsed=true;$('#grammarHintBtn').textContent=g.target.slice(0,Math.max(1,Math.ceil(g.target.length*.25)))+'…'}; setTimeout(()=>$('#answerField')?.focus(),40);
}
function grammarMatches(answer,target,key){
  if(key==='gender'){const a=normalize(answer).replace(/\./g,''),t=normalize(target).replace(/\./g,'');const aliases={maskulin:'m',masculine:'m',feminin:'f',feminine:'f',neutrum:'n',neuter:'n'};return (aliases[a]||a)===(aliases[t]||t)}
  if(key==='principalParts'){const norm=x=>normalize(x).replace(/\s+/g,' ');const a=norm(answer),t=norm(target);if(a===t)return true;const ap=a.split(/[,;]\s*/).filter(Boolean),tp=t.split(/[,;]\s*/).filter(Boolean);return tp.length>1&&ap.length===tp.length&&ap.every((x,i)=>x===tp[i]);}
  return answerMatches(answer,target);
}
function gradeGrammar(w,g,answer){if(session.locked)return;const targetSession=session;session.locked=true;const ok=grammarMatches(answer,g.target,g.key),assisted=!!session.hintUsed,before=leitnerBox(w);$('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}"><strong>${ok?(assisted?'Richtig mit Hilfe.':'Richtig.'):'Noch nicht richtig.'}</strong><br>${ok?'':`Deine Antwort: ${esc(answer||'–')}<br>`}Richtig: <strong>${esc(g.target)}</strong>${w.example?`<br><small>Im Kontext: ${esc(w.example)}</small>`:''}</div>`);recordGrammarResult(w,g.key,ok,assisted);const after=leitnerBox(w);logSessionResult(w,{answer,target:[g.target],correct:ok,skill:'latinGrammar',assisted,prompt:g.prompt,boxBefore:before,boxAfter:after,reason:sessionResultReason({correct:ok,answer,targets:[g.target],mode:'latinGrammar',assisted})});scheduleSessionAdvance(targetSession,ok,w,ok?850:2300)}
function recordGrammarResult(w,key,ok,assisted){w.grammarSkills=w.grammarSkills||{genitive:0,gender:0,principalParts:0,form:0};w.grammarSuccessDays=w.grammarSuccessDays||[];if(ok){w.grammarSkills[key]=clamp((w.grammarSkills[key]||0)+(assisted?.5:1),0,4);if(!assisted)w.grammarSuccessDays=[...new Set([...w.grammarSuccessDays,today()])];session.correct++;learner().xp+=assisted?1:2}else{w.grammarSkills[key]=clamp((w.grammarSkills[key]||0)-1,0,4);w.errorProfile.grammar=(w.errorProfile.grammar||0)+1}w.repetitions++;w.lastReviewedAt=new Date().toISOString();w.practiceDays=[...new Set([...(w.practiceDays||[]),today()])];session.answered++;recordActivity('latinGrammar',{wordId:w.id,key,correct:ok,assisted});persistOnly()}
function renderRecognition(w){
  const q=currentQuizQuestion(w,'recognition'),pool=schoolYearWords().filter(x=>x.id!==w.id);
  const reverse=q.answerSide==='term',primary=q.targets[0]||'';
  const distractors=shuffle(pool).map(x=>reverse?x.term:x.translation);
  const opts=uniqueOptions(primary,distractors),promptAudio=reverse?'':audioButtonHtml(q.term,'Wort anhören');
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Erkennen</div><div class="study-prompt">${esc(q.prompt)}</div>${promptAudio}${reverse?'':meaningCueHtml(w)}<div class="study-sub">${reverse?'Welche Vokabel passt zu dieser Bedeutung?':'Welche Bedeutung passt?'}</div><div class="answer-grid">${opts.map(o=>`<button class="answer-option" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div>${cardExtras(w)}</div>`;
  $$('[data-answer]').forEach(b=>b.onclick=()=>gradeChoice(b,w,b.dataset.answer,q.targets,'recognition',false,q));
}
function leitnerBoxesHtml(w){
  const active=leitnerBox(w),counts=leitnerDistribution();
  return `<div class="leitner-track" aria-label="Karteikartenstufen">${[1,2,3,4,5].map(box=>`<div class="leitner-box ${box===active?'active':''} ${box<active?'passed':''}"><span>${box}</span><small>${esc(leitnerLabel(box))}</small><b>${counts[box]||0}</b></div>`).join('')}</div>`;
}
function renderLeitnerCard(w){
  session.currentSubmode='cards';
  const q=setCurrentQuizQuestion(w,'recall',{strictOrthography:true}).question;
  $('#modePill').textContent='Karteikarten';
  $('#studyArea').innerHTML=`<div class="study-card leitner-card"><div class="study-prompt">${esc(q.prompt)}</div><input id="answerField" class="answer-input" aria-label="Vokabel eingeben" placeholder="Vokabel eingeben" autocomplete="off" autocapitalize="none" spellcheck="false"><div class="top-space"><button id="answerBtn" class="primary">Prüfen</button></div></div>`;
  const submit=()=>gradeLeitnerCard(w,$('#answerField').value,q);$('#answerBtn').onclick=submit;$('#answerField').onkeydown=e=>{if(e.key==='Enter')submit()};setTimeout(()=>$('#answerField')?.focus(),40);
}
function gradeLeitnerCard(w,answer,q){
  if(session.locked)return;const targetSession=session;session.locked=true;
  const grade=gradeQuizQuestion(q,answer),ok=grade.correct,before=leitnerBox(w);
  recordResult(w,ok,'retrieval',ok?null:'retrieval',{orthographyOk:grade.orthographyOk});
  const move=session.lastLeitnerMove||{before,after:leitnerBox(w),moved:false,blockedBySpacing:false};
  const movement=!ok?`Box ${move.before} → Box ${move.after}`:move.moved?`Box ${move.before} → Box ${move.after}`:move.blockedBySpacing?`Bleibt in Box ${move.after}: Für die nächste Stufe braucht es einen richtigen Abruf an einem späteren Tag.`:`Bleibt in Box ${move.after}.`;
  const mastered=move.after===5&&isMastered(w),track=$('#studyArea .leitner-track');
  if(track){const holder=document.createElement('div');holder.innerHTML=leitnerBoxesHtml(w);const next=holder.firstElementChild;if(next){next.classList.add(move.moved?'just-moved':'just-confirmed');track.replaceWith(next)}}
  $('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}"><strong>${ok?'Richtig.':'Noch nicht richtig.'}</strong><br>${ok?'':errorFeedbackHtml(answer,q.targets)}<div><strong>${esc(w.term)}</strong> ${audioButtonHtml(w.term,'Anhören')}</div><div class="leitner-move ${ok?'forward':'back'}">${esc(movement)}</div>${mastered?'<div class="leitner-mastered">✓ Nachhaltig gemeistert</div>':''}</div>`);
  if(!ok)maybeSpeakCorrection(w);
  logSessionResult(w,{answer,target:q.targets,correct:ok,skill:'cards',orthographyOk:grade.orthographyOk,prompt:q.prompt,note:movement,boxBefore:move.before,boxAfter:move.after,reason:sessionResultReason({correct:ok,orthographyOk:grade.orthographyOk,answer,targets:q.targets,mode:'cards',assisted:false})});
  if(typeof focusedDisableAnswerControls==='function'&&typeof focusedContinue==='function'){focusedDisableAnswerControls();focusedContinue(ok,w)}
  else scheduleSessionAdvance(targetSession,ok,w,ok?1000:2600);
}
function renderRecall(w){
  const q=currentQuizQuestion(w,'recall');
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Aktiver Abruf</div><div class="study-prompt">${esc(q.prompt)}</div><div class="study-sub">Schreibe die Vokabel aus dem Gedächtnis.</div><input id="answerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off" autocapitalize="none"><div class="row gap center-actions top-space"><button id="answerBtn" class="primary">Prüfen</button><button id="hintBtn" class="ghost">Hinweis</button></div>${cardExtras(w)}</div>`;
  $('#answerBtn').onclick=()=>gradeText(w,$('#answerField').value,q.targets,'retrieval','retrieval'); $('#answerField').onkeydown=e=>{if(e.key==='Enter')$('#answerBtn').click()}; $('#hintBtn').onclick=()=>{session.hintUsed=true;const t=q.targets[0]||'';$('#hintBtn').textContent=`${t.slice(0,Math.max(1,Math.ceil(t.length*.3)))}…`}; setTimeout(()=>$('#answerField').focus(),40);
}
function renderReverseRecall(w){
  const q=currentQuizQuestion(w,'reverseRecall');
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Aktiver Abruf · Bedeutung</div><div class="study-prompt">${esc(q.prompt)}</div>${audioButtonHtml(q.term,'Wort anhören')}${meaningCueHtml(w)}<div class="study-sub">Schreibe die deutsche Bedeutung aus dem Gedächtnis.</div><input id="answerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off"><div class="row gap center-actions top-space"><button id="answerBtn" class="primary">Prüfen</button><button id="hintBtn" class="ghost">Hinweis</button></div>${cardExtras(w)}</div>`;
  $('#answerBtn').onclick=()=>gradeText(w,$('#answerField').value,q.targets,'retrieval','retrieval');$('#answerField').onkeydown=e=>{if(e.key==='Enter')$('#answerBtn').click()};$('#hintBtn').onclick=()=>{session.hintUsed=true;const t=q.targets[0]||'';$('#hintBtn').textContent=`${t.slice(0,Math.max(1,Math.ceil(t.length*.3)))}…`};setTimeout(()=>$('#answerField')?.focus(),40);
}
function renderSpelling(w){
  const q=currentQuizQuestion(w,'spelling');
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Schreiben</div><button id="speakBtn" class="secondary">🔊 Anhören</button><div class="study-prompt">${esc(q.prompt)}</div><div class="study-sub">Hören → erinnern → vollständig schreiben.</div><input id="answerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off" autocapitalize="none"><div class="top-space"><button id="answerBtn" class="primary">Prüfen</button></div>${cardExtras(w)}</div>`;
  $('#speakBtn').onclick=()=>speak(q.term); $('#answerBtn').onclick=()=>gradeText(w,$('#answerField').value,q.targets,'spelling','spelling'); $('#answerField').onkeydown=e=>{if(e.key==='Enter')$('#answerBtn').click()}; setTimeout(()=>speak(q.term),120);
}

function renderHandwriting(w){
  session.currentSubmode='handwriting';
  session.handwritingPhase=session.handwritingPhase||'trace';
  const trace=session.handwritingPhase==='trace';
  $('#modePill').textContent='Handschrift';
  $('#studyArea').innerHTML=`<div class="study-card handwriting-card"><div class="eyebrow">Handschrift · ${trace?'Einprägen':'Aus dem Gedächtnis'}</div><div class="study-prompt compact-prompt">${esc(trace?w.term:w.translation)}</div><div class="study-sub">${trace?'Sprich die Buchstaben leise mit und fahre das Wort mit dem Finger nach.':'Das Wort ist abgedeckt. Schreibe es jetzt aus dem Gedächtnis.'}</div><div class="handwriting-wrap ${trace?'trace-phase':''}"><canvas id="handwritingCanvas" class="handwriting-canvas" aria-label="Handschrift-Schreibfeld"></canvas>${trace?`<div class="trace-word" aria-hidden="true">${esc(w.term)}</div>`:''}</div><div id="handwritingActionRow" class="row gap center-actions wrap top-space"><button id="undoStrokeBtn" class="ghost">↶ Rückgängig</button><button id="clearHandwritingBtn" class="ghost">Leeren</button><button id="speakHandwritingBtn" class="secondary">🔊 Anhören</button>${trace?'<button id="memoryWriteBtn" class="primary">Abdecken & schreiben</button>':'<button id="compareHandwritingBtn" class="primary">Lösung vergleichen</button>'}</div><div id="handwritingDecision" class="handwriting-compare-slot" aria-live="polite"></div><p class="study-sub handwriting-note">Ohne Zeitdruck. Handschrift unterstützt die Einprägung; Mastery wird erst durch einen anschließend geprüften Abruf bestimmt.</p></div>`;
  const canvas=$('#handwritingCanvas'),ctx=setupHandwritingCanvas(canvas),strokes=[];
  let current=null,drawing=false;
  const redraw=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#172033';ctx.lineWidth=Math.max(4,canvas.width/120);for(const stroke of strokes){if(stroke.length<2)continue;ctx.beginPath();ctx.moveTo(stroke[0].x,stroke[0].y);for(const pt of stroke.slice(1))ctx.lineTo(pt.x,pt.y);ctx.stroke()}};
  const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
  canvas.onpointerdown=e=>{drawing=true;current=[point(e)];strokes.push(current);canvas.setPointerCapture?.(e.pointerId);e.preventDefault()};
  canvas.onpointermove=e=>{if(!drawing)return;current.push(point(e));redraw();e.preventDefault()};
  const stop=e=>{drawing=false;current=null;try{canvas.releasePointerCapture?.(e.pointerId)}catch{}};
  canvas.onpointerup=stop;canvas.onpointercancel=stop;canvas.onpointerleave=e=>{if(e.buttons===0)stop(e)};
  $('#undoStrokeBtn').onclick=()=>{strokes.pop();redraw()};
  $('#clearHandwritingBtn').onclick=()=>{strokes.length=0;redraw()};
  $('#speakHandwritingBtn').onclick=()=>speak(w.term);
  if(trace){
    $('#memoryWriteBtn').onclick=()=>{session.handwritingPhase='memory';renderHandwriting(w)};
  }else{
    $('#compareHandwritingBtn').onclick=()=>showHandwritingCompare(w,strokes.length>0);
  }
}
function setupHandwritingCanvas(canvas){
  const ratio=Math.max(1,window.devicePixelRatio||1),rect=canvas.getBoundingClientRect(),w=Math.max(280,Math.round(rect.width)),h=Math.max(220,Math.round(rect.height));
  canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);
  return canvas.getContext('2d');
}
function showHandwritingCompare(w,hasInk){
  if(!hasInk){toast('Schreibe das Wort zuerst einmal aus dem Gedächtnis.','warn');return}
  const slot=$('#handwritingDecision'),compare=$('#compareHandwritingBtn');
  if(!slot||slot.children.length)return;
  if(compare){compare.disabled=true;compare.textContent='Lösung angezeigt'}
  for(const id of ['undoStrokeBtn','clearHandwritingBtn']){const el=$('#'+id);if(el)el.disabled=true}
  slot.innerHTML=`<div class="feedback notice subtle handwriting-compare"><strong>Lösung: ${esc(w.term)}</strong> ${audioButtonHtml(w.term,'Anhören')}<br><small>Vergleiche Buchstabenfolge und Endung mit deiner Handschrift.</small><div class="row gap center-actions wrap top-space"><button id="handwritingAgainBtn" class="secondary">Noch einmal schreiben</button><button id="handwritingMatchesBtn" class="primary">Passt · nächstes Wort</button></div></div>`;
  let decided=false;
  const finish=matched=>{if(decided)return;decided=true;$('#handwritingAgainBtn').disabled=true;$('#handwritingMatchesBtn').disabled=true;recordHandwriting(w,matched);session.handwritingPhase='trace';nextStudy(matched,w)};
  $('#handwritingAgainBtn').onclick=()=>finish(false);
  $('#handwritingMatchesBtn').onclick=()=>finish(true);
  setTimeout(()=>{slot.scrollIntoView?.({block:'nearest'});$('#handwritingMatchesBtn')?.focus()},0);
}
function recordHandwriting(w,matched){
  w.modesSeen=[...new Set([...(w.modesSeen||[]),'handwriting'])];
  recordActivity('handwriting',{wordId:w.id,selfChecked:!!matched});
  session.answered++;if(matched)session.correct++;
  persistOnly();
}
function renderListening(w){
  const q=currentQuizQuestion(w,'listening'),pool=schoolYearWords().filter(x=>x.id!==w.id),primary=q.targets[0]||'',opts=uniqueOptions(primary,shuffle(pool).map(x=>x.term));
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Hören</div><button id="speakBtn" class="secondary">🔊 Wort anhören</button><div class="study-sub top-space-lg">Welches Wort hast du gehört?</div><div class="answer-grid">${opts.map(o=>`<button class="answer-option" data-answer="${esc(o)}">${esc(o)}</button>`).join('')}</div>${cardExtras(w)}</div>`;
  $('#speakBtn').onclick=()=>speak(q.term); $$('[data-answer]').forEach(b=>b.onclick=()=>gradeChoice(b,w,b.dataset.answer,q.targets,'listening',false,q)); setTimeout(()=>speak(q.term),200);
}
function renderContext(w){
  const q=currentQuizQuestion(w,'context');
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Kontext</div><div class="study-prompt compact-prompt">${esc(q.prompt)}</div>${audioButtonHtml(String(q.prompt||'').replace(/_+/g,'…'),'Satz anhören')}<div class="study-sub">Setze die passende Vokabel ein.</div><input id="answerField" class="answer-input" aria-label="Deine Antwort" autocomplete="off" autocapitalize="none"><div class="top-space"><button id="answerBtn" class="primary">Prüfen</button></div>${cardExtras(w)}</div>`;
  $('#answerBtn').onclick=()=>gradeText(w,$('#answerField').value,q.targets,'context','context'); $('#answerField').onkeydown=e=>{if(e.key==='Enter')$('#answerBtn').click()};
}
function wordLearningCard(w,compact=false){const chunks=learningChunksFor(w);return `<div class="learning-card"><div><small>Wort</small><strong>${esc(w.term)}</strong> ${audioButtonHtml(w.term,'Anhören')}${w.extra?` · ${esc(w.extra)}`:''}</div><div><small>Bedeutung</small>${esc(w.translation)}</div>${w.example?`<div><small>Kontext</small>${esc(w.example)} ${audioButtonHtml(w.example,'Satz anhören')}</div>`:''}${w.mnemonic?`<div><small>Wortkniff / Eselsbrücke</small>${esc(w.mnemonic)}</div>`:''}${!compact&&chunks.length>1?`<div><small>Lernbausteine</small>${esc(chunks.join(' · '))}</div>`:''}</div>`}
function renderChunks(w){
  if(!session.currentQuestion)setCurrentQuizQuestion(w,'spelling');
  const q=currentQuizQuestion(w,'spelling'),chunks=learningChunksFor(w,q.term);if(chunks.length<2){session.currentSubmode='spelling';return renderSpelling(w)}
  const shuffled=shuffle(chunks.map((x,i)=>({x,i,key:uid('c')}))),separator=/\s/.test(q.term)?' ':'';session.chunkBuilt=[];
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Wortbausteine · Rechtschreibung</div><button id="speakBtn" class="secondary">🔊 Anhören</button><div class="study-prompt compact-prompt">${esc(q.prompt)}</div><div class="study-sub">Baue das Wort aus sinnvollen Lernbausteinen. Bei ganzen Sätzen wird diese Übung nicht verwendet.</div><div id="assembled" class="assembled">&nbsp;</div><div class="word-chunks">${shuffled.map(c=>`<button class="chunk" data-chunk="${esc(c.x)}">${esc(c.x)}</button>`).join('')}</div><div class="row gap center-actions"><button id="chunkReset" class="ghost">Neu</button><button id="chunkCheck" class="primary">Prüfen</button></div>${cardExtras(w)}</div>`;
  $('#speakBtn').onclick=()=>speak(q.term);$$('[data-chunk]').forEach(b=>b.onclick=()=>{if(b.classList.contains('used'))return;b.classList.add('used');session.chunkBuilt.push(b.dataset.chunk);$('#assembled').textContent=session.chunkBuilt.join(separator)});$('#chunkReset').onclick=()=>{session.chunkBuilt=[];$$('[data-chunk]').forEach(b=>b.classList.remove('used'));$('#assembled').innerHTML='&nbsp;'};$('#chunkCheck').onclick=()=>{session.hintUsed=true;session.scaffoldedWords[w.id]=true;gradeText(w,session.chunkBuilt.join(separator),q.targets,'spelling','spelling')};setTimeout(()=>speak(q.term),150);
}

function renderFlash(w){
  const speed=learner().lrsMode?Math.max(learner().flashSpeed,2000):learner().flashSpeed,reverse=ambiguousSenseWord(w)&&!meaningRecallHasCue(w);
  const prepared=setCurrentQuizQuestion(w,'recognition',{prompt:reverse?w.translation:w.term,targets:reverse?termTargets(w):translationTargets(w)}),q=prepared.question;
  if(prepared.issues.length){renderQuizIntegrityStop(w,prepared.issues);return}
  if(reverse){$('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Wortblitz · eindeutig</div><div id="flashWord" class="flash-word">…</div><div id="flashAnswer" class="hidden"><div class="study-sub">Welche Vokabel passt zu dieser Bedeutung?</div><div class="answer-grid" id="flashOptions"></div></div></div>`;setTimeout(()=>{$('#flashWord').textContent=q.prompt;setTimeout(()=>{$('#flashWord').textContent='';const pool=schoolYearWords().filter(x=>x.id!==w.id),opts=uniqueOptions(q.targets[0]||q.term,shuffle(pool).map(x=>x.term));$('#flashOptions').innerHTML=opts.map(o=>`<button class="answer-option" data-answer="${esc(o)}">${esc(o)}</button>`).join('');$('#flashAnswer').classList.remove('hidden');$$('#flashOptions [data-answer]').forEach(b=>b.onclick=()=>gradeChoice(b,w,b.dataset.answer,q.targets,'reading',true,q));},speed)},500);return}
  $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Wortblitz · Genauigkeit vor Tempo</div><button id="speakBtn" class="secondary">🔊 zuerst anhören</button><div id="flashWord" class="flash-word">…</div><div id="flashAnswer" class="hidden">${meaningCueHtml(w)}<div class="study-sub">Welche Bedeutung hat das Wort?</div><div class="answer-grid" id="flashOptions"></div></div></div>`; $('#speakBtn').onclick=()=>speak(q.term); speak(q.term);
  setTimeout(()=>{$('#flashWord').textContent=q.prompt;setTimeout(()=>{$('#flashWord').textContent='';const pool=schoolYearWords().filter(x=>x.id!==w.id);const opts=uniqueOptions(q.targets[0]||q.translation,shuffle(pool).map(x=>x.translation));$('#flashOptions').innerHTML=opts.map(o=>`<button class="answer-option" data-answer="${esc(o)}">${esc(o)}</button>`).join('');$('#flashAnswer').classList.remove('hidden');$$('#flashOptions [data-answer]').forEach(b=>b.onclick=()=>gradeChoice(b,w,b.dataset.answer,q.targets,'reading',true,q));},speed)},500);
}
function renderShower(w){
  const all=session.queue.map(token=>resolveQuizQueueRef(token,session?.setId||'')).filter(Boolean); $('#studyArea').innerHTML=`<div class="study-card"><div class="eyebrow">Vokabeldusche</div><h2>Anhören und mitlesen</h2><div class="learning-card">${all.map((x,i)=>`<div class="row spread align-center"><span><strong>${esc(x.term)}</strong><br><small>${esc(x.translation)}</small></span><button class="ghost" data-shower="${i}">🔊</button></div>`).join('')}</div><div class="row gap center-actions wrap"><button id="playActiveBtn" class="primary">Aktiv: Bedeutung → Denkpause → Wort</button><button id="playAllBtn" class="secondary">Passiv nacheinander</button><button id="finishShowerBtn" class="ghost">Fertig</button></div><p class="study-sub">Aktiv: Erst Bedeutung hören und im Kopf erinnern; nach kurzer Denkpause folgt die Lösung. Beide Varianten verändern Mastery und Wiederholungsabstände nicht.</p></div>`;
  $$('[data-shower]').forEach(b=>b.onclick=()=>speak(all[+b.dataset.shower].term)); $('#playAllBtn').onclick=()=>speakSequence(all.map(x=>x.term)); $('#playActiveBtn').onclick=()=>speakActiveShower(all); $('#finishShowerBtn').onclick=()=>{recordActivity('shower',{count:all.length});session.index=session.queue.length;renderStudy()};
}
function speechLang(foreign=true){return foreign?(subjectSpeechLang(state.activeSubject)||'en-GB'):'de-DE'}
function makeUtterance(text,foreign=true,rate=null){const u=new SpeechSynthesisUtterance(text);u.lang=speechLang(foreign);u.rate=rate??(learner().lrsMode?.75:.9);return u}
function speak(text){if(!('speechSynthesis'in window))return; speechSynthesis.cancel();speechSynthesis.speak(makeUtterance(text,true))}
function audioButtonHtml(text,label='Anhören'){const value=String(text||'').trim();if(!value)return '';return `<button type="button" class="ghost" data-speak="${esc(value)}" aria-label="${esc(label)}">🔊</button>`}
function maybeSpeakCorrection(w){if(learner()?.autoSpeakCorrection===false||!w?.term)return;setTimeout(()=>speak(w.term),80)}
function speakSequence(items){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();let i=0;const next=()=>{if(i>=items.length)return;const u=makeUtterance(items[i++],true,learner().lrsMode?.72:.88);u.onend=()=>setTimeout(next,350);speechSynthesis.speak(u)};next()}
function speakActiveShower(words){if(!('speechSynthesis'in window))return;speechSynthesis.cancel();let i=0;const next=()=>{if(i>=words.length)return;const w=words[i++],prompt=makeUtterance(w.translation,false,.85);prompt.onend=()=>setTimeout(()=>{const answer=makeUtterance(w.term,true,learner().lrsMode?.72:.86);answer.onend=()=>setTimeout(next,550);speechSynthesis.speak(answer)},learner().lrsMode?2800:2200);speechSynthesis.speak(prompt)};next()}
function shuffle(a){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function uniqueOptions(correct,candidates,max=4){const seen=new Set([semanticNormalize(correct)]),out=[correct];for(const c of candidates){const k=semanticNormalize(c);if(!k||seen.has(k))continue;seen.add(k);out.push(c);if(out.length>=max)break}return shuffle(out)}

function closestTargetForm(answer,target){const raw=Array.isArray(target)?target:[target],parts=raw.map(x=>String(x||'').trim()).filter(Boolean);if(!parts.length)return '';return parts.sort((a,b)=>levenshtein(answer,a)-levenshtein(answer,b))[0]}
function diffMarkup(value,other){const a=String(value||''),b=String(other||'');let start=0;while(start<a.length&&start<b.length&&a[start].toLowerCase()===b[start].toLowerCase())start++;let ae=a.length-1,be=b.length-1;while(ae>=start&&be>=start&&a[ae].toLowerCase()===b[be].toLowerCase()){ae--;be--}const pre=esc(a.slice(0,start)),mid=esc(a.slice(start,ae+1)),suf=esc(a.slice(ae+1));return `${pre}${mid?`<mark>${mid}</mark>`:'<mark>∅</mark>'}${suf}`}
function errorFeedbackHtml(answer,target){const t=closestTargetForm(answer,target),d=levenshtein(answer,t),near=d>0&&d<=2&&d<=Math.max(1,Math.ceil(normalize(t).length*.25));return `<div class="spelling-feedback"><strong>${near?'Fast richtig – bleibt als Fehler markiert.':'Noch nicht richtig.'}</strong><div><small>Deine Eingabe</small>${diffMarkup(answer,t)}</div><div><small>Richtig</small>${diffMarkup(t,answer)}</div></div>`}
function gradeChoice(btn,w,answer,target,skill,nonEvaluative=false,questionSnapshot=null){if(session.locked)return;const targetSession=session;session.locked=true;const q=questionSnapshot||currentQuizQuestion(w,session.currentSubmode||skill),grade=gradeQuizQuestion(q,answer),ok=grade.correct,before=leitnerBox(w);btn.classList.add(ok?'correct':'wrong');if(!ok){Array.from(document.querySelectorAll('[data-answer]')).find(b=>gradeQuizQuestion(q,b.dataset.answer).correct)?.classList.add('correct')}if(['recognition','listening'].includes(skill))session.scaffoldedWords[w.id]=true;if(nonEvaluative){recordNonEvaluative(w,'flash',ok,skill)}else{recordResult(w,ok,skill,ok?null:skill);logSessionResult(w,{answer,target:q.targets,correct:ok,skill,orthographyOk:grade.orthographyOk,prompt:q.prompt,boxBefore:before,boxAfter:leitnerBox(w),reason:sessionResultReason({correct:ok,orthographyOk:grade.orthographyOk,answer,targets:q.targets,mode:skill,assisted:!!session.hintUsed})});if(!ok){$('#studyArea .study-card')?.insertAdjacentHTML('beforeend',`<div class="feedback notice bad">${wordLearningCard(w,true)}</div>`);maybeSpeakCorrection(w)}}scheduleSessionAdvance(targetSession,ok,w,650)}
function gradeText(w,answer,target,errorType,skill){if(session.locked)return;const targetSession=session;session.locked=true;const q=currentQuizQuestion(w,session.currentSubmode||skill),grade=gradeQuizQuestion(q,answer),ok=grade.correct,before=leitnerBox(w);const detail=ok?(session.hintUsed?'Richtig mit Hinweis.':'Richtig.'):' ';$('#studyArea .study-card').insertAdjacentHTML('beforeend',`<div class="feedback notice ${ok?'good':'bad'}">${ok?`<strong>${detail}</strong>`:errorFeedbackHtml(answer,q.targets)}<div><strong>${esc(w.term)}</strong> ${audioButtonHtml(w.term,'Anhören')}</div>${!ok?wordLearningCard(w):''}</div>`);recordResult(w,ok,skill,ok?null:errorType,{orthographyOk:grade.orthographyOk});logSessionResult(w,{answer,target:q.targets,correct:ok,skill,orthographyOk:grade.orthographyOk,assisted:!!session.hintUsed,prompt:q.prompt,boxBefore:before,boxAfter:leitnerBox(w),reason:sessionResultReason({correct:ok,orthographyOk:grade.orthographyOk,answer,targets:q.targets,mode:skill,assisted:!!session.hintUsed})});if(!ok)maybeSpeakCorrection(w);scheduleSessionAdvance(targetSession,ok,w,ok?700:2400)}
function recordNonEvaluative(w,mode,ok,skill){w.modesSeen=[...new Set([...(w.modesSeen||[]),mode])];recordActivity(mode,{wordId:w.id,correct:ok});session.answered++;if(ok)session.correct++}
function isActiveSkill(skill){return ['retrieval','spelling','context'].includes(skill)}
function skillCredits(skill,opts={}){if(skill==='retrieval'&&session?.currentSubmode==='reverseRecall')return ['retrieval'];if(skill==='retrieval')return opts.orthographyOk===false?['retrieval']:['retrieval','spelling'];if(skill==='spelling')return ['spelling','listening'];if(skill==='context')return opts.orthographyOk===false?['context','retrieval']:['context','retrieval','spelling'];return [skill]}
function recordResult(w,ok,skill,errorType,opts={}){
  const leitnerBefore=leitnerBox(w);
  w.repetitions++; w.lastReviewedAt=new Date().toISOString(); w.practiceDays=[...new Set([...(w.practiceDays||[]),today()])]; w.modesSeen=[...new Set([...(w.modesSeen||[]),session.currentSubmode||session.mode])];
  const supportMode=['recognition','listening','chunks'].includes(session.currentSubmode);
  if(supportMode){
    const key=session.currentSubmode||skill;
    session.scaffoldedWords[w.id]=true;session.answered++;if(ok){session.correct++;learner().xp+=1}
    session.lastLeitnerMove={before:leitnerBefore,after:leitnerBefore,moved:false,blockedBySpacing:false};
    recordActivity(key,{wordId:w.id,correct:ok,errorType,support:true,active:false});persistOnly();return;
  }
  const assisted=!!(ok&&session.hintUsed),active=isActiveSkill(skill),now=new Date().toISOString(),firstActiveToday=active&&!(w.activePracticeDays||[]).includes(today()),cold=active&&!assisted&&skill!=='spelling'&&firstActiveToday&&!session.scaffoldedWords?.[w.id];
  if(active){session.activeAttemptedWords[w.id]=true;if(!assisted){w.activePracticeDays=[...new Set([...(w.activePracticeDays||[]),today()])];if(session?.isDaily)markDailyPlanWordDone(w)}w.recentActiveResults=[...(w.recentActiveResults||[]),!!ok].slice(-8)}
  if(ok){
    w.successes++; w.lastSuccessAt=now; skillCredits(skill,opts).forEach((k,i)=>{const gain=(assisted?.5:1)*(i===0?1:.55);w.skills[k]=clamp((w.skills[k]||0)+gain,0,4)});
    if(active&&assisted){w.assistedSuccesses=(w.assistedSuccesses||0)+1;w.intervalDays=Math.min(Math.max(w.intervalDays||0,1),1);w.dueDate=datePlusDays(1);learner().xp+=1;}
    else if(active){
      const previousDay=w.lastActiveSuccessAt?dateKey(new Date(w.lastActiveSuccessAt)):null,gap=previousDay?Math.max(0,dayNumber(today())-dayNumber(previousDay)):0;
      w.independentSuccesses=(w.independentSuccesses||0)+1;w.activeSuccessDays=[...new Set([...(w.activeSuccessDays||[]),today()])];w.maxActiveGapDays=Math.max(Number(w.maxActiveGapDays)||0,gap);w.lastActiveSuccessAt=now;
      if(cold){w.coldRecallDays=[...new Set([...(w.coldRecallDays||[]),today()])];w.coldRecallSuccesses=(w.coldRecallSuccesses||0)+1;}
      const seq=[0,1,3,7,14,30,60],acc=recentActiveAccuracy(w);let idx=Math.max(1,(w.independentSuccesses||0)-w.failures);if(cold&&acc!==null&&acc>=.85)idx+=1;if(acc!==null&&acc<.65)idx=Math.min(idx,1);w.intervalDays=seq[Math.min(seq.length-1,idx)];w.dueDate=datePlusDays(w.intervalDays);learner().xp+=3;
    }else{learner().xp+=1;session.scaffoldedWords[w.id]=true;}
    if(opts.orthographyOk===false){
      w.errorProfile.spelling=(w.errorProfile.spelling||0)+1;
      w.skills.spelling=clamp((w.skills.spelling||0)-.5,0,4);
      w.intervalDays=Math.min(Math.max(Number(w.intervalDays)||1,1),1);
      w.dueDate=datePlusDays(1);
    }
    session.correct++;
  } else {
    w.failures++;skillCredits(skill,opts).forEach((k,i)=>{w.skills[k]=clamp((w.skills[k]||0)-(i===0?1:.35),0,4)});if(errorType)w.errorProfile[errorType]=(w.errorProfile[errorType]||0)+1;
    if(active){w.intervalDays=0;w.dueDate=today();}
  }
  session.answered++;refreshMastery(w);session.lastLeitnerMove=updateLeitnerBox(w,ok,{assisted,active,orthographyOk:opts.orthographyOk!==false,beforeBox:leitnerBefore});recordActivity(session.currentSubmode||session.mode,{wordId:w.id,correct:ok,errorType,assisted,active,cold,orthographyOk:opts.orthographyOk!==false,leitnerBefore:session.lastLeitnerMove.before,leitnerAfter:session.lastLeitnerMove.after});persistOnly();
}
function scheduleRetry(targetSession,word){const ref=word&&typeof word==='object'&&('setLinkId' in word)?quizQueueRef(word):word,key=typeof ref==='string'?ref:(ref?.setLinkId||ref?.progressId||'');if(!key)return false;const n=targetSession.retryCounts[key]||0;if(n>=1)return false;targetSession.retryCounts[key]=n+1;const pos=Math.min(targetSession.index+3,targetSession.queue.length);targetSession.queue.splice(pos,0,ref);return true;}
function scheduleScaffoldFollowup(targetSession,word){targetSession.followupCounts=targetSession.followupCounts||{};const ref=word&&typeof word==='object'&&('setLinkId' in word)?quizQueueRef(word):word,key=typeof ref==='string'?ref:(ref?.setLinkId||ref?.progressId||'');if(!key)return false;const n=targetSession.followupCounts[key]||0;if(n>=2)return false;targetSession.followupCounts[key]=n+1;const pos=Math.min(targetSession.index+3,targetSession.queue.length);targetSession.queue.splice(pos,0,ref);return true;}
function scheduleSessionAdvance(targetSession,ok,w,delay){
  setTimeout(()=>{if(session===targetSession)nextStudy(ok,w)},delay);
}
function nextStudy(ok,w){
  if(!ok && w && !['flash','shower'].includes(session.mode))scheduleRetry(session,w);
  if(ok&&w&&['adaptive','allWords','weakWords'].includes(session.mode)&&['recognition','listening','chunks'].includes(session.currentSubmode))scheduleScaffoldFollowup(session,w);
  session.index++;renderStudy();
}
function sessionResultTargets(target){
  const raw=Array.isArray(target)?target:[target],out=[];
  for(const value of raw){const clean=String(value||'').trim();if(clean&&!out.includes(clean))out.push(clean)}
  return out;
}
function sessionResultMode(skill=session?.currentSubmode||session?.mode||''){
  const labels={retrieval:'Abruf',reverseRecall:'Bedeutung',spelling:'Schreiben',recognition:'Erkennen',listening:'Hören',context:'Kontext',chunks:'Wortbausteine',latinGrammar:'Latein-Formen',cards:'Karteikarte'};
  return labels[skill]||modeLabel(skill)||String(skill||'Aufgabe');
}
function sessionResultReason({correct=false,orthographyOk=true,answer='',targets=[],mode='',assisted=false}={}){
  if(correct&&orthographyOk===false)return 'Inhaltlich richtig erinnert, aber die Schreibweise war nicht vollständig korrekt.';
  if(correct&&assisted)return 'Richtig mit Hilfe. Der Lernfortschritt wird deshalb vorsichtiger gewertet.';
  if(correct)return 'Richtig beantwortet.';
  if(!String(answer||'').trim())return 'Keine Antwort eingegeben.';
  if(['recognition','listening'].includes(mode))return 'Die gewählte Antwort gehört nicht zu dieser Vokabel.';
  const target=closestTargetForm(answer,targets),distance=target?levenshtein(answer,target):99,near=target&&distance>0&&distance<=2&&distance<=Math.max(1,Math.ceil(normalize(target).length*.25));
  return near?'Fast richtig: Die Eingabe weicht in der Schreibweise von der akzeptierten Lösung ab.':'Die Antwort entspricht keiner akzeptierten Lösung.';
}
function logSessionResult(w,{answer='',target=[],correct=false,skill='',orthographyOk=true,assisted=false,prompt='',note='',reason='',boxBefore=null,boxAfter=null}={}){
  if(!session||session.mode==='practiceTest')return;
  session.results=Array.isArray(session.results)?session.results:[];
  const q=session.currentQuestion,set=state.sets.find(s=>s.id===(q?.setId||w?.setId)),targets=sessionResultTargets(q?.targets?.length?q.targets:target);
  const visiblePrompt=String(q?.prompt||prompt||$('#studyArea .study-prompt')?.textContent||'').trim();
  const liveBox=leitnerBox(w),rawBefore=Math.round(Number(boxBefore)||0),rawAfter=Math.round(Number(boxAfter)||0);
  const safeBefore=rawBefore>=1&&rawBefore<=5?rawBefore:liveBox,safeAfter=rawAfter>=1&&rawAfter<=5?rawAfter:liveBox;
  session.results.push({
    order:session.results.length+1,questionId:q?.id||'',wordId:q?.progressId||w?.id||'',vocabId:q?.vocabId||w?.vocabId||'',senseId:q?.senseId||w?.senseId||'',setLinkId:q?.setLinkId||w?.setLinkId||'',setId:q?.setId||w?.setId||'',setTitle:set?.title||'',term:String(q?.term||w?.term||''),
    mode:sessionResultMode(q?.mode||skill||session.currentSubmode||session.mode),prompt:visiblePrompt,answer:String(answer||'').trim(),targets,correct:!!correct,
    orthographyOk:orthographyOk!==false,assisted:!!assisted,note:String(note||''),reason:String(reason||''),boxBefore:safeBefore,boxAfter:safeAfter,at:new Date().toISOString()
  });
}
function sessionResultsText(results=session?.results||[]){
  const lines=['Vokabeltrainer – Ergebnisübersicht'];
  for(const r of results){
    const status=!r.correct?'FALSCH':r.orthographyOk===false?'INHALTLICH RICHTIG · SCHREIBWEISE':'RICHTIG';
    const boxMove=r.boxBefore&&r.boxAfter?'Box: '+r.boxBefore+' → '+r.boxAfter:'';
    lines.push('',r.order+'. '+r.mode+' · '+status,(r.setTitle?'Lernset: '+r.setTitle:''),(r.term?'Vokabel: '+r.term:''),'Frage: '+(r.prompt||'–'),'Meine Antwort: '+(r.answer||'–'),'Erwartet: '+((r.targets||[]).join(' | ')||'–'),r.reason?'Warum: '+r.reason:'',boxMove,r.assisted?'Mit Hilfe: ja':'Mit Hilfe: nein');
  }
  return lines.filter((x,i)=>x!==''||i>0).join('\n');
}
async function copySessionResults(results=session?.results||[]){
  const text=sessionResultsText(results);if(!text)return;
  try{await navigator.clipboard.writeText(text);toast('Ergebnisübersicht kopiert.','good')}
  catch(_e){const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand?.('copy');ta.remove();toast(ok?'Ergebnisübersicht kopiert.':'Kopieren nicht möglich.','subtle')}
}
function sessionResultsHtml(results=[]){
  if(!results.length)return '';
  return `<section class="session-review" aria-labelledby="sessionReviewTitle"><div class="row spread align-center wrap"><div><div class="eyebrow">Ergebnisübersicht</div><h3 id="sessionReviewTitle">Alle Abfragen dieser Einheit</h3><p class="session-review-intro">Du siehst genau, was gefragt, geantwortet und bewertet wurde.</p></div><button id="copySessionResultsBtn" class="ghost">Ergebnisse kopieren</button></div><div class="session-result-list">${results.map(r=>{const cls=!r.correct?'bad':r.orthographyOk===false?'warn':'good',status=!r.correct?'Falsch':r.orthographyOk===false?'Richtig erinnert · Schreibweise':'Richtig',before=Number(r.boxBefore),after=Number(r.boxAfter),hasBox=before>=1&&before<=5&&after>=1&&after<=5,box=hasBox?`<span class="session-box-move" aria-label="Karteikasten Box ${before} zu Box ${after}">Box ${before} → Box ${after}</span>`:'',termAudio=r.term?`<div class="session-result-vocab"><span>Vokabel: <strong>${esc(r.term)}</strong></span>${audioButtonHtml(r.term,'Vokabel anhören')}</div>`:'';return `<article class="session-result ${cls}" data-session-result="${r.correct&&r.orthographyOk!==false?'correct':'review'}" data-word-id="${esc(r.wordId||'')}"><div class="session-result-head"><strong>${r.order}. ${esc(r.mode)}</strong><div class="session-result-status"><span class="pill">${esc(status)}</span>${box}</div></div>${r.setTitle?`<small class="session-result-set">${esc(r.setTitle)}</small>`:''}${termAudio}<div class="session-result-grid"><div><small>Frage</small><strong>${esc(r.prompt||'–')}</strong></div><div><small>Deine Antwort</small><span>${esc(r.answer||'–')}</span></div><div><small>Richtige / akzeptierte Antwort</small><span>${esc((r.targets||[]).join(' · ')||'–')}</span></div></div>${r.reason?`<div class="session-result-reason"><small>Bewertung</small><span>${esc(r.reason)}</span></div>`:''}${r.note?`<small class="session-result-note">${esc(r.note)}</small>`:r.assisted?'<small class="session-result-note">Mit Hilfe beantwortet</small>':''}</article>`}).join('')}</div></section>`;
}

function sessionRepeatIds(results=[],onlyErrors=false){
  const seen=new Set(),ids=[];
  for(const r of results){
    if(onlyErrors&&r.correct&&r.orthographyOk!==false)continue;
    const id=String(r.wordId||'');if(!id||seen.has(id))continue;seen.add(id);ids.push(id);
  }
  return ids;
}
function finishSession(){
  if(session?.mode==='practiceTest')return finishPracticeTest();
  const c=session?.correct||0,a=session?.answered||0,results=[...(session?.results||[])],finishedMode=session?.mode||'adaptive',finishedSetId=session?.setId||null,isDaily=!!session?.isDaily,plan=isDaily?buildDailyPlan():null,status=plan?dailyPlanStatus(plan):null;const more=status?.remaining>0;
  const errorIds=sessionRepeatIds(results,true),allIds=sessionRepeatIds(results,false);
  if(isDaily&&a>0&&!more)grantBattleTicket('dailyGoal');
  const battleAvailable=isDaily&&!more&&battleActionAvailableToday();
  const repeatActions=allIds.length?`<div class="session-repeat-actions"><div><strong>Noch einmal üben</strong><small>Diese Zusatzrunde ist freiwillig und gibt keine weitere Kampfaktion.</small></div><div class="row gap wrap">${errorIds.length?`<button id="repeatErrorsBtn" class="secondary" type="button">↻ Fehler nochmal üben (${errorIds.length})</button>`:''}<button id="repeatAllBtn" class="ghost" type="button">Alle nochmal üben (${allIds.length})</button></div></div>`:'';
  $('#studyArea').innerHTML=`<div class="study-card session-finish-card"><div class="eyebrow">Einheit beendet</div><div class="study-prompt">${a?Math.round(c/a*100):'✓'}${a?'%':''}</div><p>${a?`${c} von ${a} Aufgaben richtig.`:'Training abgeschlossen.'}</p>${isDaily?`<p class="notice ${more?'subtle':'good'}">${more?`Noch ${status.remaining} Vokabel${status.remaining===1?'':'n'} im Tagesziel.`:'Tagesziel für heute geschafft.'}</p>`:''}${battleAvailable?'<div class="battle-unlock"><strong>⚔ Tagesangriff freigeschaltet!</strong><span>Deine Testfestung bleibt sichtbar. Heute steht genau eine Kampfaktion bereit.</span><button id="rewardBattleBtn" class="battle-unlock-btn" type="button">Zur Schlacht</button></div>':''}${sessionResultsHtml(results)}${repeatActions}<div class="row gap center-actions wrap top-space">${more?'<button id="continueDailyBtn" class="primary">Nächste kurze Einheit</button>':''}<button id="doneBtn" class="${more?'secondary':'primary'}">Zur Übersicht</button></div></div>`;
  const repeat=(ids)=>{if(!ids.length)return;session=null;startSession(finishedMode,finishedSetId,ids,false)};
  $('#sessionPill').textContent='Fertig';$('#copySessionResultsBtn')?.addEventListener('click',()=>copySessionResults(results));$('#repeatErrorsBtn')?.addEventListener('click',()=>repeat(errorIds));$('#repeatAllBtn')?.addEventListener('click',()=>repeat(allIds));$('#rewardBattleBtn')?.addEventListener('click',()=>{session=null;openBattleView()});$('#continueDailyBtn')?.addEventListener('click',()=>{session=null;startDailyTodo()});$('#doneBtn').onclick=()=>{session=null;showView('homeView');renderAll()};persistOnly();
}
