'use strict';

let appRole='child';
const PARENT_VIEW_IDS=new Set(['parentView','libraryView','dashboardView','settingsView']);
function isPairedChildDevice(){const s=window.VTFamilySync?.status?.();return !!(s?.enabled&&s.role==='child')}
function isParentMode(){return appRole==='parent'&&!isPairedChildDevice()}
function isStandaloneWebApp(){return window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true}
function isIOSDevice(){const ua=String(navigator.userAgent||'');return /iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function renderStandaloneSyncNotice(){
  const card=$('#iosStandaloneSyncCard');if(!card)return;
  const connected=!!window.VTFamilySync?.status?.().enabled;
  card.classList.toggle('hidden',!(isIOSDevice()&&isStandaloneWebApp()&&!connected));
}


let battleAttackMode='charge';
const BATTLE_ATTACKS={
  charge:{label:'Sturmangriff',short:'Sturm',unlock:0,icon:'⚔',role:'Front',message:'Die Infanterie stürmt geschlossen vor!'},
  volley:{label:'Pfeilhagel',short:'Pfeile',unlock:20,icon:'➶',role:'Fernkampf',message:'Bogenschützen legen einen Pfeilhagel auf die Mauer!'},
  ram:{label:'Rammbock',short:'Rammbock',unlock:35,icon:'▰',role:'Belagerung',message:'Der Rammbock rollt direkt auf das Tor zu!'},
  cavalry:{label:'Reiterangriff',short:'Reiter',unlock:55,icon:'♞',role:'Mobilität',message:'Die Reiter brechen aus der Flanke hervor!'},
  special:{label:'Spezialangriff',short:'Spezial',unlock:70,icon:'★',role:'Eliteverbund',message:'Die Elite setzt zum Spezialangriff an!'}
};
const BATTLE_BOSSES={
  citadel:{name:'Der Torwächter',text:'Er hält den Zugang zur Bergzitadelle.'},
  capital:{name:'Der Hauptmann',text:'Die stärksten Verteidiger stehen vor der Hauptfestung.'},
  final:{name:'Der Adlerwächter',text:'Der letzte Wächter schützt die Jahresfestung.'}
};
const BATTLE_BOSSES_LATIN={
  citadel:{name:'Custos Portae',text:'Der Torwächter sichert den Zugang zum Bergkastell.'},
  capital:{name:'Praefectus',text:'Die stärkste Wache steht vor dem Provinzkastell.'},
  final:{name:'Aquilifer',text:'Der Standartenträger bewacht die letzte große Prüfungsetappe.'}
};
const BATTLE_STORY={
  outpost:{title:'Der erste Vorposten',text:'Am Rand des Feldzugs versperrt ein kleiner Vorposten den Weg. Deine Truppe sammelt sich zum ersten Angriff.'},
  tower:{title:'Der Wachturm',text:'Vom hohen Turm aus wird jeder Schritt beobachtet. Deine Armee muss weiterlernen, um näher heranzukommen.'},
  wall:{title:'Die Grenzmauer',text:'Hinter der langen Mauer beginnt das Kernland. Neue Einheiten schließen sich deinem Feldzug an.'},
  citadel:{title:'Die Bergzitadelle',text:'Vor der Zitadelle wartet der Torwächter. Nur gefestigtes Wissen bringt die Armee durch das Tor.'},
  capital:{title:'Vor der Hauptfestung',text:'Der Hauptmann hat seine besten Truppen versammelt. Dein bisheriger Lernweg entscheidet, wie stark deine Armee ist.'},
  final:{title:'Die große Testfestung',text:'Ein großer Testumfang liegt vor dir. Jeder abgeschlossene Lerntag schwächt die Verteidigung; gefestigtes Wissen macht die Angriffe stärker.'}
};
const BATTLE_STORY_LATIN={
  outpost:{title:'Das erste Marschlager',text:'Die Legion erreicht ihre erste Etappe. Ordnung, Wiederholung und sichere Formen bringen sie weiter.'},
  tower:{title:'Der römische Wachturm',text:'Vom Turm aus ist die Straße gut zu überblicken. Die Legion rückt mit jedem gefestigten Lerntag näher.'},
  wall:{title:'Am Grenzkastell',text:'Das Kastell markiert die nächste große Etappe. Die Formation wächst mit deinem Lernfortschritt.'},
  citadel:{title:'Vor dem Bergkastell',text:'Das Tor zum Kastell ist gut bewacht. Nur gefestigtes Wissen bringt die Legion sicher durch die Etappe.'},
  capital:{title:'Das Provinzkastell',text:'Die nächste Prüfungsetappe verlangt eine geordnete Vorbereitung. Dein bisheriger Lernweg bestimmt die Stärke der Legion.'},
  final:{title:'Der große Triumphort',text:'Ein großer Testumfang liegt vor dir. Jeder abgeschlossene Lerntag bringt die Legion auf der Marschroute weiter.'}
};
const BATTLE_STORY_FRENCH={
  outpost:{title:'Die erste Station',text:'Die Sprachreise beginnt mit einer kleinen Etappe. Jedes gefestigte Wort öffnet den Weg zum nächsten Ort.'},
  tower:{title:'Ein neuer Blick über die Stadt',text:'Von hier aus wird das nächste Reiseziel sichtbar. Weiterlernen bringt dich Schritt für Schritt näher.'},
  wall:{title:'Über die Brücke',text:'Eine neue Etappe verbindet Bekanntes mit Neuem. Dein Wortschatz macht den Weg frei.'},
  citadel:{title:'Eine besondere Kulturstation',text:'Die nächste Sprachmission wartet. Sicheres Wissen hilft dir, die Etappe abzuschließen.'},
  capital:{title:'Die große Reiseetappe',text:'Viele gelernte Wörter führen jetzt zu einem wichtigen Ziel deiner Sprachreise.'},
  final:{title:'Das Jahresziel',text:'Die große Abschlussstation steht für deinen langfristigen Lernfortschritt über das Schuljahr.'}
};
function battlePresentation(subject=state.activeSubject){
  if(subject==='latin')return {
    theme:'roman',kicker:'Römische Prüfungsetappe',unitLabel:'Legion',ownLabel:'DEINE LEGION',targetLabel:'KASTELL',moveLabel:'MARSCH',
    targetNoun:'Kastell',capturedLabel:'Eingenommen',securedLabel:'Gesichert',mapBack:'← Marschroute',mapBottom:'Zurück zur Marschroute',
    revealKicker:'NEUES KASTELL ENTDECKT',noTarget:'Für die nächste Prüfungsetappe muss zuerst ein Test geplant sein.',
    targetNames:{outpost:'Marschlager',tower:'Wachturm',wall:'Grenzkastell',citadel:'Bergkastell',capital:'Provinzkastell',final:'Großes Kastell'}
  };
  if(subject==='french')return {
    theme:'voyage',kicker:'Sprachmission',unitLabel:'Reise',ownLabel:'DEINE REISE',targetLabel:'ZIELORT',moveLabel:'WEITER',
    targetNoun:'Etappe',capturedLabel:'Erreicht',securedLabel:'Gefestigt',mapBack:'← Sprachreise',mapBottom:'Zurück zur Sprachreise',
    revealKicker:'NEUES REISEZIEL ENTDECKT',noTarget:'Für die nächste Sprachmission muss zuerst ein Test geplant sein.',
    targetNames:{outpost:'Erste Station',tower:'Stadtetappe',wall:'Brückenetappe',citadel:'Kulturstation',capital:'Große Etappe',final:'Abschlussetappe'}
  };
  return {
    theme:'campaign',kicker:'Schlacht',unitLabel:'Armee',ownLabel:'DEINE ARMEE',targetLabel:'ZIEL',moveLabel:'VORRÜCKEN',
    targetNoun:'Festung',capturedLabel:'Erobert',securedLabel:'Gesichert',mapBack:'← Mein Feldzug',mapBottom:'Zurück zum Feldzug',
    revealKicker:'NEUES TESTZIEL ENTDECKT',noTarget:'Für die nächste Schlacht muss zuerst ein Test geplant sein.',
    targetNames:{outpost:'Vorposten',tower:'Wachturm',wall:'Grenzfestung',citadel:'Zitadelle',capital:'Hauptfestung',final:'Große Festung'}
  };
}
function battleTargetName(f,subject=state.activeSubject){
  if(!f)return '';
  const p=battlePresentation(subject);
  return p.targetNames[f.id]||f.name||p.targetNoun;
}
function specialAttackMeta(subject=state.activeSubject){
  return subject==='latin'
    ?{label:'Adlerstandarte',short:'Adler',icon:'★',message:'Die Adlerstandarte wird gehoben. Die Elite rückt geschlossen vor!'}
    :{label:'Eliteangriff',short:'Elite',icon:'★',message:'Die Eliteeinheiten führen den Angriff an!'};
}
function battleAttackMeta(mode){return mode==='special'?{...BATTLE_ATTACKS.special,...specialAttackMeta()}:BATTLE_ATTACKS[mode]}
function battleAttackTacticalMeta(mode,subject=state.activeSubject){
  const a=BATTLE_ATTACKS[mode]||BATTLE_ATTACKS.charge;
  const tactical=typeof battleTacticalBonusForAttack==='function'?battleTacticalBonusForAttack(mode,subject):{power:0,bonus:0};
  return {role:a.role||'',power:tactical.power||0,bonus:tactical.bonus||0};
}
function attackUnlocked(mode,pct=subjectProgress().pct){const a=BATTLE_ATTACKS[mode];return !!a&&pct>=a.unlock}
function battleBossFor(f,subject=state.activeSubject){
  if(!f)return null;
  return subject==='latin'?(BATTLE_BOSSES_LATIN[f.id]||null):(BATTLE_BOSSES[f.id]||null);
}
function battleStoryScopeLabel(f){
  const raw=String(f?.scopeText||'').trim();
  if(!raw)return '';
  return raw.split('·')[0].trim().replace(/[.!?]+$/,'');
}
function battleStoryDateLabel(value){
  if(!value)return '';
  const date=new Date(String(value)+'T12:00:00');
  if(Number.isNaN(date.getTime()))return formatDateShort(value);
  return new Intl.DateTimeFormat('de-DE',{day:'numeric',month:'long'}).format(date);
}
function battleStoryFor(f){
  const p=battlePresentation();
  if(!f)return {title:`Noch kein ${p.targetNoun}-Ziel`,text:`Sobald ein Test geplant ist, erscheint hier automatisch die passende ${p.targetNoun.toLowerCase()}-Etappe.`};
  const stories=state.activeSubject==='latin'?BATTLE_STORY_LATIN:state.activeSubject==='french'?BATTLE_STORY_FRENCH:BATTLE_STORY;
  const base=stories[f.id]||{title:battleTargetName(f),text:`${p.unitLabel} bereitet den nächsten Schritt vor.`};
  const wordCount=Math.max(0,Number(f.wordCount)||0),scope=battleStoryScopeLabel(f),date=battleStoryDateLabel(f.testDate);
  let objective=date?`Dein nächster Test ist am ${date}.`:'';
  if(wordCount&&scope)objective+=` Dafür bereitest du ${wordCount} ${wordCount===1?'Vokabel':'Vokabeln'} aus „${scope}“ vor.`;
  else if(wordCount)objective+=` Dafür bereitest du ${wordCount} ${wordCount===1?'Vokabel':'Vokabeln'} vor.`;
  else if(scope)objective+=` Dafür bereitest du den Lernstoff „${scope}“ vor.`;
  return {title:base.title,text:[base.text,objective].filter(Boolean).join(' ')};
}
let battleStoryNarrationToken=0;
let battleStoryNarrating=false;
function battleStoryVoiceScore(voice){
  const name=String(voice?.name||'').toLowerCase(),uri=String(voice?.voiceURI||'').toLowerCase(),all=name+' '+uri;
  let score=0;
  const quality=[['premium',120],['enhanced',110],['neural',100],['natural',95],['siri',90],['google',72],['microsoft',68],['anna',54],['petra',52],['helena',50],['katja',48],['markus',46],['martin',44]];
  for(const [key,value] of quality)if(all.includes(key))score=Math.max(score,value);
  if(voice?.localService)score+=8;
  if(voice?.default)score+=2;
  for(const bad of ['compact','novelty','whisper','zarvox','trinoids','bad news','good news'])if(all.includes(bad))score-=140;
  return score;
}
function preferredBattleStoryVoice(){
  if(!('speechSynthesis'in window))return null;
  const voices=speechSynthesis.getVoices?.()||[],german=voices.filter(v=>/^de(?:-|_)/i.test(String(v.lang||'')));
  return [...german].sort((a,b)=>battleStoryVoiceScore(b)-battleStoryVoiceScore(a))[0]||null;
}
function updateBattleStoryNarrationUi(on=false){
  battleStoryNarrating=!!on;
  const btn=$('#battleStorySpeakBtn');if(!btn)return;
  btn.setAttribute('aria-pressed',String(battleStoryNarrating));
  btn.textContent=battleStoryNarrating?'Stop':'Geschichte hören';
  btn.setAttribute('aria-label',battleStoryNarrating?'Vorlesen stoppen':'Geschichte anhören');
}
function stopBattleStoryNarration(){
  battleStoryNarrationToken+=1;
  if('speechSynthesis'in window)speechSynthesis.cancel();
  updateBattleStoryNarrationUi(false);
}
function battleNarrationUtterance(text,{title=false}={}){
  const u=new SpeechSynthesisUtterance(text);
  u.lang='de-DE';
  const readingSupport=readingSupportEnabled();
  u.rate=readingSupport?(title?.84:.86):(title?.9:.93);
  u.pitch=title?1.02:1;
  u.volume=1;
  const voice=preferredBattleStoryVoice();if(voice)u.voice=voice;
  return u;
}
function battleNarrationSegments(title,text){
  const body=String(text||'').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[];
  return [
    ...(title?[{text:title.trim(),title:true,pause:300}]:[]),
    ...body.map((part,index)=>({text:part.trim(),title:false,pause:index===body.length-1?0:220}))
  ].filter(part=>part.text);
}
function speakBattleNarrationSegments(segments,index,token){
  if(token!==battleStoryNarrationToken)return;
  if(index>=segments.length){updateBattleStoryNarrationUi(false);return}
  const part=segments[index],utterance=battleNarrationUtterance(part.text,{title:part.title});
  const next=()=>{
    if(token!==battleStoryNarrationToken)return;
    if(part.pause)setTimeout(()=>speakBattleNarrationSegments(segments,index+1,token),part.pause);
    else speakBattleNarrationSegments(segments,index+1,token);
  };
  utterance.onend=next;
  utterance.onerror=next;
  speechSynthesis.speak(utterance);
}
function toggleBattleStoryNarration(){
  if(!('speechSynthesis'in window)){toast('Vorlesen wird auf diesem Gerät nicht unterstützt.','subtle');return}
  if(battleStoryNarrating){stopBattleStoryNarration();return}
  const title=$('#battleStoryTitle')?.textContent?.trim()||'',text=$('#battleStoryText')?.textContent?.trim()||'';
  if(!title&&!text)return;
  const token=++battleStoryNarrationToken;
  speechSynthesis.cancel();
  updateBattleStoryNarrationUi(true);
  speakBattleNarrationSegments(battleNarrationSegments(title,text),0,token);
}
function battleUnitType(i,pct){
  if(pct>=55&&i>2&&i%6===0)return 'cavalry';
  if(pct>=20&&i%4===2)return 'archer';
  if(pct>=40&&i%5===3)return 'elite';
  return 'infantry';
}
function battleUnitsMarkup(count,large=false,pct=subjectProgress().pct){
  let out='';
  for(let i=0;i<count;i++){
    const type=battleUnitType(i,pct);
    out+=`<div class="${large?'battle-unit':'soldier'} unit-${i%3} unit-${type} subject-${esc(state.activeSubject)} delay-${i%8}"><i class="mount"></i><i class="helmet"></i><i class="body"></i><i class="shield"></i><i class="weapon"></i><i class="spear"></i></div>`;
  }
  return out;
}
function fortressMarkup(f,large=false){
  if(!f)return '';
  const id=f.id||'outpost',name=battleTargetName(f),captured=!!f.capturedAt;
  if(!large)return `<div class="fortress fortress-${esc(id)} ${captured?'captured':''}" aria-label="${esc(name)}"><div class="gate"></div><div class="flag enemy-flag"></div><div class="own-flag" aria-hidden="true"></div><div class="mini-keep"></div></div>`;
  return `<div class="battle-fortress fortress-${esc(id)} ${captured?'captured':''}"><div class="tower tower-left"></div><div class="tower tower-right"></div><div class="wall"><div class="battle-gate"></div><div class="crack c1"></div><div class="crack c2"></div><div class="crack c3"></div><div class="crack c4"></div><div class="crack c5"></div><div class="battle-rubble" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div><div class="battle-keep"></div><div class="battle-enemy-flag"></div><div class="battle-own-flag" aria-hidden="true"></div></div>`;
}
function seasonEffectsMarkup(){
  return `<div class="battle-season-fx" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i class="season-particle season-d${i%6}"></i>`).join('')}</div>`;
}
function battleFortressVisualState(f){
  const p=battlePresentation();
  if(!f)return {id:'none',label:`Kein ${p.targetNoun}-Ziel`,remainingPct:0};
  if(f.capturedAt)return {id:'captured',label:p.capturedLabel,remainingPct:0};
  const max=Math.max(1,Number(f.maxDefense)||1),remaining=Math.max(0,Number(f.defense)||0),remainingPct=clamp(Math.round(remaining/max*100),0,100);
  if(remainingPct<=25)return {id:'critical',label:'Kurz vor dem Fall',remainingPct};
  if(remainingPct<=50)return {id:'damaged',label:'Stark beschädigt',remainingPct};
  if(remainingPct<=75)return {id:'scratched',label:'Beschädigt',remainingPct};
  return {id:'intact',label:'Intakt',remainingPct};
}
function battleAttackFxMarkup(){
  return `<div class="battle-attack-fx" aria-hidden="true">
    <div class="battle-charge-streaks">${Array.from({length:6},(_,i)=>`<i class="charge-streak charge-streak-${i+1}"></i>`).join('')}</div>
    <div class="battle-ram-trail"><i></i><i></i><i></i></div>
    <div class="battle-volley-sky">${Array.from({length:7},(_,i)=>`<i class="volley-wave volley-wave-${i+1}"></i>`).join('')}</div>
    <div class="battle-cavalry-flank"><i></i><i></i><i></i><b></b></div>
    <div class="battle-special-aura"><i></i><i></i><i></i><strong>★</strong></div>
  </div>
  <div class="battle-impact-callout" data-battle-impact-callout aria-hidden="true">
    <strong data-battle-impact-title>TREFFER!</strong>
    <span><b data-battle-impact-damage>0 Schaden</b><small data-battle-impact-tactic></small></span>
  </div>`;
}
function applyProgressArmyArt(){
  const field=$('#battlefield');if(!field)return;
  const img=field.querySelector?.('[data-progress-army-art]');
  const integrated=state?.activeSubject==='english'&&window.VTBattleArt?.ready?window.VTBattleArt.sceneUrl||'':'';
  const fallback=state?.activeSubject==='english'&&window.VTArmyArt?.ready?window.VTArmyArt.heroUrl||'':'';
  const url=integrated||fallback;
  field.classList.toggle('progress-army-artwork',!!url);
  field.classList.toggle('integrated-campaign-artwork',!!integrated);
  if(!img)return;
  if(url){
    if(img.getAttribute('src')!==url)img.setAttribute('src',url);
    img.hidden=false;
  }else{
    img.removeAttribute('src');
    img.hidden=true;
  }
}
function renderBattlefield(){
  const p=subjectProgress(),f=currentTestFortress(),sea=seasonInfo(),count=soldiersFor(p.pct),tickets=battleTickets();
  const siege=p.pct>=35?'<div class="siege" title="Belagerungsgerät freigeschaltet"></div>':'';
  const campaign=subjectCampaign(state.activeSubject),present=battlePresentation(),field=$('#battlefield');if(!field)return;
  const damagePct=f?clamp(Math.round((1-(Number(f.defense)||0)/Math.max(1,Number(f.maxDefense)||1))*100),0,100):0,fortressVisual=battleFortressVisualState(f),targetName=battleTargetName(f),ownBanner=learner()?.name||campaign.unitLabel,targetBanner=testFortressLabel(f);
  field.className=`battlefield ${sea.class} subject-${state.activeSubject} gear-${gearTier(p.pct)} ${tickets?'battle-ready':''} ${f?.capturedAt?'battle-captured':''} fortress-visual-${fortressVisual.id}`;
  field.dataset.visualTheme=present.theme;
  field.dataset.damage=damagePct>=66?'high':damagePct>=33?'mid':damagePct>0?'low':'none';
  field.dataset.damagePercent=String(damagePct);
  field.dataset.fortressState=fortressVisual.id;
  field.setAttribute('aria-label',`${campaign.unitLabel}: ${p.pct}% Schuljahresfortschritt, Rang ${rankFor(p.pct,state.activeSubject)}, ${f?`${present.targetNoun} ${targetName} am ${formatDateShort(f.testDate)}`:'kein Test geplant'}`);
  field.innerHTML=`<img class="progress-army-art" data-progress-army-art alt="" aria-hidden="true" hidden><div class="progress-army-art-shade" aria-hidden="true"></div><div class="frontline-label frontline-own" aria-hidden="true"><span>${esc(ownBanner)}</span></div><div class="frontline-label frontline-target" aria-hidden="true"><span>${esc(targetBanner)}</span></div><div class="frontline-center" aria-hidden="true"><i></i><span>${esc(present.moveLabel)}</span></div><div class="sun"></div><div class="preview-cloud cloud-a"></div><div class="preview-cloud cloud-b"></div>${sea.class==='winter'?'<div class="snow"></div>':''}${sea.festive?`<div class="festive">${esc(campaign.festive)}</div>`:''}<div class="army"><div class="preview-standard"></div>${battleUnitsMarkup(count,false,p.pct)}${siege}</div>${fortressMarkup(f,true)}`;
  applyProgressArmyArt();
}
if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){
  document.addEventListener('vt-army-art-ready',()=>{if(state&&document.querySelector?.('#battlefield'))applyProgressArmyArt()});
  document.addEventListener('vt-battle-art-ready',()=>{
    if(state&&document.querySelector?.('#battlefield'))applyProgressArmyArt();
    if(state&&document.querySelector?.('#battleAttackChoices'))renderBattleAttackChoices(subjectProgress().pct);
  });
}
function renderBattleAttackChoices(pct=subjectProgress().pct){
  const box=$('#battleAttackChoices');if(!box)return;
  if(!attackUnlocked(battleAttackMode,pct))battleAttackMode='charge';
  const art=state?.activeSubject==='english'&&window.VTBattleArt?.ready?window.VTBattleArt.sceneUrl||'':'';
  box.innerHTML=Object.entries(BATTLE_ATTACKS).map(([id,a])=>{
    const meta=battleAttackMeta(id),tactical=battleAttackTacticalMeta(id),unlocked=attackUnlocked(id,pct),active=id===battleAttackMode;
    const status=unlocked?`${tactical.role} · +${tactical.bonus} Taktik`:`ab ${a.unlock}%`;
    const visual=art?`<img src="${esc(art)}" alt="" aria-hidden="true">`:'';
    return `<button type="button" class="battle-attack-choice attack-${esc(id)} ${active?'active':''} ${id==='special'?'special':''}" data-battle-attack="${esc(id)}" ${unlocked?'':'disabled'} aria-pressed="${active?'true':'false'}"><span class="battle-attack-visual" aria-hidden="true">${visual}<b>${meta.icon}</b></span><span class="battle-attack-copy"><strong>${esc(meta.label)}</strong><small>${esc(status)}</small></span><i class="battle-attack-arrow" aria-hidden="true">›</i></button>`;
  }).join('');
}
function selectBattleAttack(mode){
  const p=subjectProgress().pct;if(!attackUnlocked(mode,p))return;
  battleAttackMode=mode;renderBattleAttackChoices(p);
  const a=battleAttackMeta(mode),tactical=battleAttackTacticalMeta(mode);
  $('#battleMessage').className='battle-message';$('#battleMessage').textContent=`${a.label} gewählt. ${a.message} ${tactical.role}: +${tactical.bonus} Taktikschaden.`;
  if($('#battleAttackBtn'))$('#battleAttackBtn').textContent=`${a.short}: Angriff starten`;
}
let battleFortressRevealTimer=null;
let battleFortressRevealKey='';
let battleFortressRevealUntil=0;
function battleFortressRevealActive(f=currentTestFortress()){
  return !!f&&battleFortressRevealKey===f.key&&Date.now()<battleFortressRevealUntil;
}
function battleFortressRevealMarkup(f,active=false){
  if(!f)return '';
  const days=Math.max(1,Number(f.plannedAttackDays)||1),words=Math.max(0,Number(f.wordCount)||0),p=battlePresentation(),name=battleTargetName(f);
  return `<div class="battle-target-reveal" data-battle-target-reveal aria-hidden="true" ${active?'':'hidden'}><div class="battle-target-reveal-light"></div><div class="battle-target-reveal-copy"><small>${esc(p.revealKicker)}</small><strong>${esc(name)}</strong><span>${esc(p.targetNoun)} · Test ${formatDateShort(f.testDate)}</span><b>${words} ${words===1?'Vokabel':'Vokabeln'} · ${days} ${days===1?'Lerntag':'Lerntage'} eingeplant</b></div></div>`;
}
function startBattleFortressReveal(f=currentTestFortress()){
  const stage=$('#battleStage');if(!stage||!f||f.revealedAt)return false;
  if(battleFortressRevealTimer){clearTimeout(battleFortressRevealTimer);battleFortressRevealTimer=null}
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,duration=reduced?1400:2900;
  battleFortressRevealKey=f.key||'';
  battleFortressRevealUntil=Date.now()+duration;
  f.revealedAt=new Date().toISOString();
  persistOnly();
  renderBattleView();
  const live=$('#battleStage');if(live)live.dataset.revealKey=f.key||'';
  battleFortressRevealTimer=setTimeout(()=>{
    if(battleFortressRevealKey===f.key){battleFortressRevealKey='';battleFortressRevealUntil=0}
    const stage=$('#battleStage'),overlay=stage?.querySelector('[data-battle-target-reveal]');
    stage?.classList.remove('fortress-reveal');
    if(overlay)overlay.hidden=true;
    battleFortressRevealTimer=null;
  },duration);
  return true;
}

function renderBattleView(){
  const stage=$('#battleStage');if(!stage)return;
  const p=subjectProgress(),f=currentTestFortress(),tickets=battleTickets(),count=Math.min(18,Math.max(7,soldiersFor(p.pct)+4)),sea=seasonInfo(),revealActive=battleFortressRevealActive(f);
  const campaign=subjectCampaign(state.activeSubject),present=battlePresentation(),isRoman=state.activeSubject==='latin',isVoyage=state.activeSubject==='french';
  const rank=rankFor(p.pct,state.activeSubject),gear=gearLabelFor(p.pct,state.activeSubject),secure=!!f?.capturedAt,boss=!secure&&!isVoyage?battleBossFor(f):null,story=battleStoryFor(f),attack=battleAttackMeta(battleAttackMode),targetName=battleTargetName(f),ownBanner=learner()?.name||campaign.unitLabel,targetBanner=testFortressLabel(f);
  const damagePct=f?clamp(Math.round((1-(Number(f.defense)||0)/Math.max(1,Number(f.maxDefense)||1))*100),0,100):0,fortressVisual=battleFortressVisualState(f);
  const usedToday=!!battleDayState(state.activeSubject,false)?.actionUsed;
  const grade=testFortressGrade(f);
  const view=$('#battleView');if(view)view.dataset.visualTheme=present.theme;
  const kicker=document.querySelector('#battleView .battle-kicker');if(kicker)kicker.textContent=present.kicker;

  $('#battleTicketPill').textContent=!f?'Kein Test':isVoyage?(secure?(tickets?'1 Festigung':'0 Festigungen'):(tickets?'1 Mission':'0 Missionen')):secure?(tickets?'1 Sicherung':'0 Sicherungen'):(tickets?'1 Angriff':'0 Angriffe');
  $('#battleStrength').textContent=armyStrength();
  $('#battleFortressName').textContent=f?`${targetName} · Test ${formatDateShort(f.testDate)}`:'Kein Test geplant';
  $('#battleFortressProgress').textContent=!f?'–':isVoyage?(secure?`Erreicht · gefestigt ${f.securedDates?.length||0}×`:`${f.defense} / ${f.maxDefense} Etappenstärke`):isRoman?(secure?`Eingenommen · gesichert ${f.securedDates?.length||0}×`:`${f.defense} / ${f.maxDefense} Kastellstärke`):secure?'Erobert · gesichert '+(f.securedDates?.length||0)+'×':`${f.defense} / ${f.maxDefense} Verteidigung`;
  $('#battleRankGear').textContent=`${rank} · ${gear}`;

  $('#battleTitle').textContent=!f?(isRoman?'Die Legion ist bereit':isVoyage?'Die Sprachreise geht weiter':'Deine Armee ist bereit'):secure?`${targetName} ${isVoyage?'festigen':'sichern'}`:isRoman?`${campaign.unitLabel} vor ${targetName}`:isVoyage?`Sprachmission · ${targetName}`:`${campaign.unitLabel} gegen ${targetName}`;
  $('#battleSubtitle').textContent=!f?(isRoman?'Sobald ein Test geplant ist, erscheint hier das nächste Kastell.':isVoyage?'Sobald ein Test geplant ist, erscheint hier die nächste Reiseetappe.':'Sobald ein Test geplant ist, erscheint hier die nächste Festung.'):secure?(tickets?(isVoyage?'Die Etappe ist erreicht. Heute kannst du sie weiter festigen.':isRoman?'Das Kastell ist eingenommen. Heute kannst du es für den Test sichern.':'Die Festung ist erobert. Heute kannst du sie für den Test sichern.'):`${present.capturedLabel} · ${f.scopeText}${grade?` · Note ${grade.grade}`:''}`):(tickets?(isVoyage?'Deine heutige Sprachmission ist bereit. Jeder Lerntag bringt dich dem Zielort näher.':isRoman?'Der Tagesangriff der Legion ist bereit. Jeder Lerntag bringt das Kastell näher.':'Dein Tagesangriff ist bereit. Jeder Lerntag schwächt die Festung.'):`${f.scopeText} · Test ${formatDateShort(f.testDate)}`);

  $('#battleStoryTitle').textContent=story.title;$('#battleStoryText').textContent=story.text+(grade?` Ergebnis eingetragen: Note ${grade.grade}.`:'');$('#battleStory').classList.toggle('story-complete',secure);
  const bossPanel=$('#battleBossPanel');bossPanel.classList.toggle('hidden',!boss);
  if(boss){$('#battleBossName').textContent=boss.name;$('#battleBossText').textContent=boss.text;$('#battleBossProgress').value=damagePct;$('#battleBossProgressText').textContent=`${damagePct}%`;}
  const tactics=$('#battleAttackChoices')?.closest('.battle-tactics');tactics?.classList.toggle('hidden',secure||!f||isVoyage);

  $('#battleAttackBtn').disabled=!f||tickets<1;
  $('#battleAttackBtn').textContent=!f?'Kein Test geplant':isVoyage?(tickets?(secure?'Etappe festigen':'Mission starten'):usedToday?(secure?'Heute bereits gefestigt ✓':'Mission heute abgeschlossen ✓'):(secure?'Nach Tagesziel: festigen':'Nach Tagesziel verfügbar')):tickets?(secure?(isRoman?'Kastell sichern':'Festung sichern'):`${attack.short}: Angriff starten`):usedToday?(secure?'Heute bereits gesichert ✓':'Heute bereits angegriffen ✓'):(secure?'Nach Tagesziel: sichern':'Nach Tagesziel verfügbar');
  if($('#battleActionTitle'))$('#battleActionTitle').textContent=!f?(isRoman?'Kein Kastell aktiv':isVoyage?'Keine Etappe aktiv':'Keine Festung aktiv'):tickets?(secure?(isVoyage?'Festigung bereit':'Sicherungseinsatz bereit'):(isVoyage?'Deine Mission ist bereit':'Dein Angriff ist bereit')):usedToday?(secure?(isVoyage?'Heute gefestigt':'Heute gesichert'):(isVoyage?'Heutige Mission abgeschlossen':'Tagesangriff verbraucht')):'Tagesziel noch offen';
  if($('#battleActionHint'))$('#battleActionHint').textContent=!f?'Plane zuerst einen Test.':tickets?(secure?(isVoyage?'Festige die erreichte Etappe bis zum Test.':isRoman?'Halte das eingenommene Kastell bis zum Test sicher.':'Halte die eroberte Festung bis zum Test sicher.'):(isVoyage?'Schließe die Sprachmission ab und erreiche die nächste Etappe.':isRoman?`${attack.label} wählen und am Kastell weiter vorankommen.`:`${attack.label} wählen und die Festung weiter schwächen.`)):usedToday?'Morgen gibt es nach dem nächsten Tagesziel wieder eine Aktion.':'Schließe zuerst dein Tagesziel ab.';
  $('#battleMessage').className='battle-message';$('#battleMessage').textContent=!f?(isVoyage?'Kein Test – keine Sprachmission.':isRoman?'Kein Test – kein Kastellziel.':'Kein Test – keine Belagerung.'):tickets?(secure?(isVoyage?'Festigung ist bereit.':'Sicherung ist bereit.'):(isVoyage?'Die Sprachmission ist bereit.':isRoman?`${attack.label} ist bereit. Erwartete Wirkung: ${testFortressDamage(f,state.activeSubject,battleAttackMode).damage}.`:`${attack.label} ist bereit. Erwarteter Schaden: ${testFortressDamage(f,state.activeSubject,battleAttackMode).damage}.`)):secure?(isVoyage?'Die Etappe bleibt erreicht.':isRoman?'Das Kastell bleibt eingenommen.':'Festung bleibt erobert.'):(isVoyage?'Jeder abgeschlossene Lerntag bringt die Reise voran.':isRoman?'Jeder abgeschlossene Lerntag bringt die Legion auf der Marschroute voran.':'Jeder abgeschlossene Lerntag bringt die Belagerung voran.');

  if(!secure&&f&&!isVoyage)renderBattleAttackChoices(p.pct);else if($('#battleAttackChoices'))$('#battleAttackChoices').innerHTML='';
  stage.className=`battle-stage season-${sea.class} subject-${state.activeSubject} gear-${gearTier(p.pct)} fortress-stage-${f?.id||'none'} fortress-visual-${fortressVisual.id} ${boss?'boss-stage':''} ${secure?'fortress-secured':''} ${revealActive?'fortress-reveal':''}`;
  stage.dataset.visualTheme=present.theme;
  stage.dataset.damage=damagePct>=66?'high':damagePct>=33?'mid':damagePct>0?'low':'none';
  stage.dataset.damagePercent=String(damagePct);
  stage.dataset.fortressState=fortressVisual.id;
  stage.setAttribute('aria-label',f?`${campaign.unitLabel} im Rang ${rank} vor ${targetName}. Fortschritt am ${present.targetNoun}: ${damagePct} Prozent. Test am ${formatDateShort(f.testDate)}.`:`${campaign.unitLabel}: aktuell kein Testziel.`);

  const activePhases=isRoman?['Formieren','Marsch','Angriff','Durchbruch','Ergebnis']:isVoyage?['Vorbereiten','Weiterreisen','Mission','Ankunft','Ergebnis']:['Sammeln','Vorrücken','Angriff','Einschlag','Ergebnis'];
  const securePhases=isVoyage?['Ankommen','Ordnen','Wiederholen','Festigen','Ergebnis']:['Sammeln','Beziehen','Patrouille','Sichern','Ergebnis'];
  const phases=secure?securePhases:activePhases;
  stage.innerHTML=`<div class="battle-sky"><i class="battle-sun"></i><i class="battle-cloud cloud-1"></i><i class="battle-cloud cloud-2"></i></div>${seasonEffectsMarkup()}<div class="battle-hills"></div><div class="battle-ground"></div><div class="battle-ground-path" aria-hidden="true"></div><div class="battle-scene-vignette" aria-hidden="true"></div><div class="battle-scene-banner battle-scene-banner-own" aria-label="Eigene Armee: ${esc(ownBanner)}"><span>${esc(ownBanner)}</span></div><div class="battle-scene-banner battle-scene-banner-target" aria-label="Ziel: ${esc(targetBanner)}"><span>${esc(targetBanner)}</span></div><div class="battle-fortress-state-badge" aria-hidden="true"><small>${esc(present.targetNoun)}</small><strong>${esc(fortressVisual.label)}</strong><span>${esc(f?(`${f.defense} / ${f.maxDefense} ${isVoyage?'Etappenstärke':isRoman?'Kastellstärke':'Verteidigung'}`):'')}</span></div><div class="battle-phase-strip" aria-hidden="true">${phases.map((label,index)=>`<span data-battle-phase="${['rally','advance','barrage','impact','result'][index]}"><i>${index+1}</i>${esc(label)}</span>`).join('')}</div><div class="battle-rank-badge"><span>${esc(rank)}</span><small>${esc(gear)}</small></div><div class="battle-army"><div class="battle-standard"><i></i></div><div class="battle-formation">${battleUnitsMarkup(count,true,p.pct)}</div>${p.pct>=35&&!isVoyage?'<div class="battle-ram"><i></i><b></b></div>':''}</div><div class="battle-projectiles">${Array.from({length:9},(_,i)=>`<i class="arrow arrow-${i+1}"></i>`).join('')}</div><div class="battle-impact"><i></i><i></i><i></i></div><div class="battle-special-flare"><i></i><i></i><i></i></div><div class="battle-shockwave"></div>${battleAttackFxMarkup()}${boss?`<div class="battle-boss-character boss-${esc(f.id)}" aria-label="${esc(boss.name)}"><i class="boss-helmet"></i><i class="boss-body"></i><i class="boss-shield"></i></div>`:''}${fortressMarkup(f,true)}<div class="battle-dust"></div>${battleFortressRevealMarkup(f,revealActive)}`;
}

let battleReturnView='armyView';
const BATTLE_RETURN_META={
  armyView:{back:'← Meine Armee',bottom:'Zurück zu meiner Armee'},
  armyUnitView:{back:'← Einheit',bottom:'Zurück zur Einheit'},
  campaignMapView:{back:'',bottom:''}
};
function captureBattleReturnView(){
  const source=document.querySelector('.view.active')?.id;
  if(BATTLE_RETURN_META[source])battleReturnView=source;
  else battleReturnView='armyView';
}
function renderBattleReturnUi(){
  let meta=BATTLE_RETURN_META[battleReturnView]||BATTLE_RETURN_META.armyView;
  if(battleReturnView==='campaignMapView'){
    const p=battlePresentation();
    meta={back:p.mapBack,bottom:p.mapBottom};
  }
  if($('#battleBackBtn'))$('#battleBackBtn').textContent=meta.back;
  if($('#battleReturnBtn'))$('#battleReturnBtn').textContent=meta.bottom;
}
const BATTLE_PREVIEW_HIDDEN_SELECTORS=[
  '#battleTicketPill',
  '#battleView .battle-readout',
  '#battleView .battle-scene-tactics',
  '#battleView .battle-action-dock'
];
function setBattlePreviewMode(on){
  document.body.classList.toggle('battle-preview',!!on);
  for(const selector of BATTLE_PREVIEW_HIDDEN_SELECTORS){
    const el=document.querySelector(selector);if(!el)continue;
    if(on){
      el.dataset.battlePreviewHidden='1';
      el.style.setProperty('display','none','important');
      el.setAttribute('aria-hidden','true');
    }else if(el.dataset.battlePreviewHidden==='1'){
      el.style.removeProperty('display');
      el.removeAttribute('aria-hidden');
      delete el.dataset.battlePreviewHidden;
    }
  }
}
function returnFromBattle(){if(battleStoryNarrating)stopBattleStoryNarration();setBattlePreviewMode(false);showView(BATTLE_RETURN_META[battleReturnView]?battleReturnView:'armyView')}
function openBattleView(){
  if(isParentMode())return;
  const f=currentTestFortress(),present=battlePresentation();
  if(!f){toast(present.noTarget,'subtle');return}
  captureBattleReturnView();
  const reveal=!f.revealedAt,preview=battleTickets()<1;
  renderBattleView();renderBattleReturnUi();showView('battleView');setBattlePreviewMode(preview);
  if(reveal)startBattleFortressReveal(f);
}
function setBattleImmersive(on){
  document.body.classList.toggle('battle-immersive',!!on);
  const btn=$('#battleFullscreenBtn');
  btn?.setAttribute('aria-pressed',String(!!on));
  btn?.setAttribute('aria-label',on?'Schlachtansicht verlassen':'Schlachtansicht öffnen');
  if(btn)btn.textContent=on?'✕ Schlacht verlassen':'⛶ Schlacht';
  $('#battleFocusAttackBtn')?.classList.add('hidden');
}
function closeBattleImmersive(){setBattleImmersive(false)}
function openBattleAttackPickerFromFocus(){
  const tactics=$('#battleAttackChoices')?.closest('.battle-tactics');
  if(tactics)requestAnimationFrame(()=>tactics.scrollIntoView({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
}
function toggleBattleFullscreen(){setBattleImmersive(true)}
let battleSequenceGeneration=0;
const battleSequenceTimers=new Set();
function cancelBattleSequence(){
  battleSequenceGeneration+=1;
  for(const id of battleSequenceTimers)clearTimeout(id);
  battleSequenceTimers.clear();
}
function battleAnimationTiming(reduced){
  if(typeof window!=='undefined'&&window.__VT_BATTLE_TEST_MODE__===true){
    return {advance:0,barrage:0,impact:0,result:0,ready:0,settle:0};
  }
  return reduced?{advance:35,barrage:70,impact:105,result:145,ready:190,settle:25}:{advance:900,barrage:2450,impact:4050,result:5550,ready:6550,settle:1080};
}
function scheduleBattleStep(generation,delay,callback){
  const id=setTimeout(()=>{
    battleSequenceTimers.delete(id);
    if(generation!==battleSequenceGeneration)return;
    callback();
  },Math.max(0,Number(delay)||0));
  battleSequenceTimers.add(id);
  return id;
}
function runBattleAnimation(){
  const f=currentTestFortress(),stage=$('#battleStage'),button=$('#battleAttackBtn');if(!f||!stage||!button)return;
  const secureBefore=!!f.capturedAt,present=battlePresentation(),isRoman=state.activeSubject==='latin',isVoyage=state.activeSubject==='french',targetName=battleTargetName(f);
  if(!spendBattleTicket()){toast('Die heutige Aktion wird erst nach dem Tagesziel freigeschaltet.','subtle');renderBattleView();return}
  cancelBattleSequence();
  const generation=battleSequenceGeneration;
  const p=subjectProgress(),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,attack=battleAttackMeta(battleAttackMode)||battleAttackMeta('charge'),boss=!secureBefore&&!isVoyage?battleBossFor(f):null;
  const visualHit=secureBefore?null:testFortressDamage(f,state.activeSubject,battleAttackMode),tactical=battleAttackTacticalMeta(battleAttackMode);
  const timing=battleAnimationTiming(reduced);

  const phaseCopy=secureBefore?(isVoyage?{
    rally:'Du kommst an der erreichten Etappe an.',
    advance:'Wörter und Wendungen werden noch einmal geordnet.',
    barrage:'Die wichtigsten Inhalte werden wiederholt.',
    impact:'Die Etappe ist für den Test weiter gefestigt.'
  }:isRoman?{
    rally:'Die Legion sammelt sich im eingenommenen Kastell.',
    advance:'Wachen beziehen Tore und Mauern.',
    barrage:'Patrouillen sichern Straße und Umgebung.',
    impact:'Das Kastell ist für den Testtag gesichert.'
  }:{
    rally:'Die Truppen sammeln sich in der eroberten Festung.',
    advance:'Wachen beziehen Tore und Mauern.',
    barrage:'Patrouillen sichern die Umgebung.',
    impact:'Vorräte und Verteidigung sind für den Testtag gesichert.'
  }):(isVoyage?{
    rally:'Die nächste Sprachmission beginnt.',
    advance:'Du machst dich auf den Weg zur nächsten Etappe.',
    barrage:'Gelernte Wörter öffnen den Weg zum Zielort.',
    impact:'Die neue Etappe ist erreicht.'
  }:isRoman?{
    rally:'Die Legion formiert sich. Standarten hoch!',
    advance:`Die Legion marschiert geschlossen auf ${targetName} zu.`,
    barrage:battleAttackMode==='volley'?'Die Sagittarii eröffnen den Beschuss.':battleAttackMode==='ram'?'Das Belagerungsgerät wird nach vorne gebracht.':battleAttackMode==='cavalry'?'Die Equites setzen zur Flanke an.':battleAttackMode==='special'?attack.message:'Die Formation beginnt den Vorstoß.',
    impact:battleAttackMode==='special'?'Die Adlerstandarte führt die Elite durch die Verteidigung!':battleAttackMode==='volley'?'Die Salven erreichen Mauern und Tor.':battleAttackMode==='cavalry'?'Die Equites erreichen das Kastell.':battleAttackMode==='ram'?'Das Belagerungsgerät trifft das Tor.':'Die Legion erreicht die Verteidigung.'
  }:{
    rally:'Die Reihen schließen sich. Standarten hoch!',
    advance:'Die Armee rückt geschlossen auf die Testfestung vor.',
    barrage:battleAttackMode==='volley'?'Bogenschützen eröffnen den Pfeilhagel!':battleAttackMode==='ram'?'Der Rammbock wird nach vorne gebracht!':battleAttackMode==='cavalry'?'Die Reiter setzen zum Flankenangriff an!':battleAttackMode==='special'?attack.message:'Die Angriffswelle beginnt!',
    impact:battleAttackMode==='special'?'Die Elite trifft mit voller Wucht!':battleAttackMode==='volley'?'Die Salven schlagen auf Zinnen und Tor ein!':battleAttackMode==='cavalry'?'Die Reiter erreichen die Festungsmauer!':battleAttackMode==='ram'?'Der Rammbock kracht gegen das Tor!':'Die Truppen treffen auf die Verteidigung!'
  });

  const setPhase=(phase,message)=>{
    stage.dataset.phase=phase;stage.classList.remove('phase-rally','phase-advance','phase-barrage','phase-impact','phase-result');stage.classList.add('phase-'+phase);
    $$('.battle-phase-strip [data-battle-phase]').forEach(el=>{const order={rally:1,advance:2,barrage:3,impact:4,result:5},here=el.dataset.battlePhase;el.classList.toggle('active',here===phase);el.classList.toggle('done',(order[here]||0)<(order[phase]||0));});
    if(message)$('#battleMessage').textContent=message;
  };
  button.disabled=true;$('#battleFullscreenBtn').disabled=true;$$('.battle-attack-choice').forEach(b=>b.disabled=true);
  const impactTitle=stage.querySelector('[data-battle-impact-title]'),impactDamage=stage.querySelector('[data-battle-impact-damage]'),impactTactic=stage.querySelector('[data-battle-impact-tactic]');
  if(impactTitle)impactTitle.textContent=secureBefore?(isVoyage?'GEFESTIGT!':'GESICHERT!'):isVoyage?'ETAPPE ERREICHT!':battleAttackMode==='ram'?'TOR-TREFFER!':battleAttackMode==='volley'?'PFEILHAGEL!':battleAttackMode==='cavalry'?'FLANKENTREFFER!':battleAttackMode==='special'?(isRoman?'ADLERSCHLAG!':'ELITESCHLAG!'):'TREFFER!';
  if(impactDamage)impactDamage.textContent=secureBefore?(isVoyage?'Etappe gefestigt':'Stellung gehalten'):isVoyage?`+${visualHit?.damage||0} Fortschritt`:isRoman?`${visualHit?.damage||0} Wirkung`:`${visualHit?.damage||0} Schaden`;
  if(impactTactic)impactTactic.textContent=secureBefore?'':isVoyage?'Lernfortschritt':tactical.bonus?`+${tactical.bonus} durch ${tactical.role}`:(isRoman?'Grundwirkung':'Basisschaden');
  stage.classList.remove('battle-finished','is-victory','is-hold','is-impact','is-attacking','is-strike','show-impact-callout','battle-sequence');stage.classList.add('battle-sequence',`attack-${secureBefore?'charge':battleAttackMode}`);
  $('#battleMessage').className='battle-message active';
  if($('#battleActionTitle'))$('#battleActionTitle').textContent=secureBefore?(isVoyage?'Festigung läuft':'Sicherung läuft'):(isVoyage?'Sprachmission läuft':isRoman?'Vorstoß läuft':'Schlacht läuft');
  if($('#battleActionHint'))$('#battleActionHint').textContent='Die Sequenz läuft bis zum Ergebnis.';
  setPhase('rally',phaseCopy.rally);
  scheduleBattleStep(generation,timing.advance,()=>{stage.classList.add('is-attacking');setPhase('advance',phaseCopy.advance);});
  scheduleBattleStep(generation,timing.barrage,()=>{stage.classList.add('is-barrage','is-strike');setPhase('barrage',phaseCopy.barrage);});
  scheduleBattleStep(generation,timing.impact,()=>{stage.classList.add('is-impact','show-impact-callout');setPhase('impact',phaseCopy.impact);});
  scheduleBattleStep(generation,timing.result,()=>{
    const result=resolveTestFortressAction(secureBefore?'secure':battleAttackMode);const won=result?.result==='win',secured=result?.result==='secure';
    stage.classList.remove('is-attacking','is-barrage','is-strike');stage.classList.add('battle-finished',(won||secured)?'is-victory':'is-hold');if(won)stage.classList.add('conquest-transition');setPhase('result');
    const visual=battleFortressVisualState(f);stage.dataset.fortressState=visual.id;stage.classList.remove('fortress-visual-intact','fortress-visual-scratched','fortress-visual-damaged','fortress-visual-critical','fortress-visual-captured');stage.classList.add('fortress-visual-'+visual.id);
    const fortressBadge=stage.querySelector('.battle-fortress-state-badge strong');if(fortressBadge)fortressBadge.textContent=visual.label;
    if(won){
      const conquered=stage.querySelector('.battle-fortress');
      const settle=()=>{conquered?.classList.add('captured');stage.classList.remove('conquest-transition');};
      scheduleBattleStep(generation,timing.settle,settle);
    }
    if(secured){
      $('#battleMessage').className='battle-message victory';
      $('#battleMessage').innerHTML=isVoyage?'<strong>Etappe gefestigt!</strong><span>Das Reiseziel bleibt bis zum Test sicher verankert.</span>':isRoman?'<strong>Kastell gesichert!</strong><span>Die Etappe bleibt bis zum Test unter Kontrolle.</span>':'<strong>Festung gesichert!</strong><span>Die Stellung bleibt bis zum Test unter Kontrolle.</span>';
    }else if(won){
      $('#battleMessage').className='battle-message victory';
      $('#battleMessage').innerHTML=isVoyage?`<strong>Etappe erreicht!</strong><span>${esc(targetName)} ist geschafft. +20 XP · Jetzt bis zum Test festigen.</span>`:isRoman?`<strong>${boss?'Wächter überwunden!':'Kastell eingenommen!'}</strong><span>${esc(targetName)} ist erreicht. +20 XP · Jetzt bis zum Test sichern.</span>`:`<strong>${boss?'Boss besiegt!':'Festung erobert!'}</strong><span>${esc(f.name)} ist gefallen. +20 XP · Jetzt bis zum Test sichern.</span>`;
    }else{
      $('#battleMessage').className='battle-message hold';
      $('#battleMessage').innerHTML=isVoyage?`<strong>Mission gelungen!</strong><span>+${result?.damage||0} Fortschritt. Noch ${result?.remaining||0} Etappenstärke bis zum Ziel.</span>`:isRoman?`<strong>Vorstoß gelungen!</strong><span>${result?.damage||0} Wirkung. Noch ${result?.remaining||0} Kastellstärke bis zur Einnahme.</span>`:`<strong>Angriff gelungen!</strong><span>${result?.damage||0} Schaden. Noch ${result?.remaining||0} Verteidigung bis zur Eroberung.</span>`;
    }
    persistOnly();
    document.dispatchEvent(new CustomEvent('vt-battle-result',{detail:{result:result?.result||'',won,secured,generation}}));
  });
  scheduleBattleStep(generation,timing.ready,()=>{
    $('#battleFullscreenBtn').disabled=false;stage.classList.remove('battle-sequence','is-impact','show-impact-callout');
    const live=currentTestFortress(),left=battleTickets(),secure=!!live?.capturedAt,usedToday=!!battleDayState(state.activeSubject,false)?.actionUsed,liveName=battleTargetName(live);
    $('#battleTicketPill').textContent=isVoyage?(secure?(left?'1 Festigung':'0 Festigungen'):(left?'1 Mission':'0 Missionen')):secure?(left?'1 Sicherung':'0 Sicherungen'):(left?'1 Angriff':'0 Angriffe');
    $('#battleStrength').textContent=armyStrength();
    $('#battleFortressName').textContent=live?`${liveName} · Test ${formatDateShort(live.testDate)}`:'Kein Test geplant';
    $('#battleFortressProgress').textContent=!live?'–':isVoyage?(secure?`Erreicht · gefestigt ${live.securedDates?.length||0}×`:`${live.defense} / ${live.maxDefense} Etappenstärke`):isRoman?(secure?`Eingenommen · gesichert ${live.securedDates?.length||0}×`:`${live.defense} / ${live.maxDefense} Kastellstärke`):secure?'Erobert · gesichert '+(live.securedDates?.length||0)+'×':`${live.defense} / ${live.maxDefense} Verteidigung`;
    button.disabled=!live||left<1;
    button.textContent=!live?'Kein Test geplant':isVoyage?(left?(secure?'Etappe festigen':'Mission starten'):usedToday?(secure?'Heute bereits gefestigt ✓':'Mission heute abgeschlossen ✓'):'Nach Tagesziel verfügbar'):left?(secure?(isRoman?'Kastell sichern':'Festung sichern'):`${battleAttackMeta(battleAttackMode).short}: Angriff starten`):usedToday?(secure?'Heute bereits gesichert ✓':'Heute bereits angegriffen ✓'):'Nach Tagesziel verfügbar';
    if($('#battleActionTitle'))$('#battleActionTitle').textContent=secure?(isVoyage?'Etappe erreicht':isRoman?'Kastell eingenommen':'Festung erobert'):(isVoyage?'Reise geht weiter':isRoman?'Vorstoß läuft':'Belagerung läuft');
    if($('#battleActionHint'))$('#battleActionHint').textContent=secure?(isVoyage?'Bis zum Test bleibt diese Etappe dein Ziel.':isRoman?'Bis zum Test bleibt dieses Kastell dein Ziel.':'Bis zum Test bleibt diese Festung dein Ziel.'):(isVoyage?'Morgen bringt das nächste Tagesziel die nächste Reiseaktion.':isRoman?'Morgen bringt das nächste Tagesziel einen neuen Vorstoß.':'Morgen bringt das nächste Tagesziel einen neuen Angriff.');
    renderBattlefield();
  });
}
function cardboxStageDescription(box){
  return ({
    1:'Noch neu – diese Wörter stehen am Anfang.',
    2:'Im Lernen – schon richtig erinnert, aber noch nicht sicher.',
    3:'Bekannt – mehrfach richtig erinnert.',
    4:'Sicher – über mehrere Lerntage gefestigt.',
    5:'Nachhaltig gemeistert – langfristig sicher gelernt.'
  })[box]||'';
}
function openCardboxBox(box){
  const stage=clamp(Math.round(Number(box)||1),1,5),words=schoolYearVerifiedWords().filter(w=>leitnerBox(w)===stage)
    .sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||'')||String(a.term||'').localeCompare(String(b.term||''),'de'));
  const due=words.filter(w=>!w.dueDate||w.dueDate<=today()).length,label=leitnerLabel(stage);
  const list=words.length
    ?`<div class="cardbox-word-list">${words.map(w=>`<div class="cardbox-word-row"><div><strong>${esc(w.term)}</strong> ${audioButtonHtml(w.term,'Anhören')}<span>${esc(w.translation)}</span></div><small>${!w.dueDate||w.dueDate<=today()?'heute fällig':`wieder am ${esc(formatDateShort(w.dueDate))}`}</small></div>`).join('')}</div>`
    :'<div class="empty-state compact"><strong>Diese Box ist noch leer.</strong><span>Beim Lernen wandern Wörter automatisch durch die fünf Stufen.</span></div>';
  modal(`<div class="eyebrow">Karteikasten · Box ${stage}</div><h2>${esc(label)}</h2><p>${esc(cardboxStageDescription(stage))}</p><div class="notice subtle"><strong>${words.length} ${words.length===1?'Vokabel':'Vokabeln'}</strong>${words.length?` · ${due} heute fällig`:''}</div>${list}<div class="modal-actions stack-mobile"><button value="cancel" class="ghost">Schließen</button>${words.length?`<button type="button" id="practiceCardboxStageBtn" class="primary">Diese Box üben</button>`:''}</div>`);
  $('#practiceCardboxStageBtn')?.addEventListener('click',()=>{closeModal();startSession('cards',null,words.map(quizQueueRef),false)});
}
function renderCardboxOverview(){
  const card=$('#cardboxOverviewCard'),root=$('#cardboxOverview');
  if(!card||!root)return;
  const words=schoolYearVerifiedWords(),total=words.length,counts=leitnerDistribution(words);
  const due=words.filter(w=>!w.dueDate||w.dueDate<=today()).length;
  card.classList.toggle('hidden',!total);
  if(!total){root.innerHTML='';return}
  $('#cardboxDuePill').textContent=`${due} heute fällig`;
  $('#cardboxTotalPill').textContent=`${total} ${total===1?'Karte':'Karten'}`;
  const dueText=due?`${due} ${due===1?'Karte ist':'Karten sind'} heute fällig.`:'Heute ist keine Karte fällig.';
  $('#cardboxOverviewText').textContent=`Wie viele Vokabeln kannst du wie sicher? ${dueText} Tippe eine Box an, um die Wörter zu sehen.`;
  root.innerHTML=[1,2,3,4,5].map(box=>{
    const count=counts[box]||0,pct=total?Math.round(count/total*100):0,label=leitnerLabel(box);
    return `<button type="button" class="cardbox-stage" data-cardbox-box="${box}" aria-label="Box ${box}: ${esc(label)}, ${count} ${count===1?'Vokabel':'Vokabeln'}. Wörter ansehen">
      <div class="cardbox-stage-top"><span>Box ${box}</span><strong>${count}</strong></div>
      <b>${esc(label)}</b>
      <progress class="cardbox-stage-progress" max="100" value="${pct}" aria-label="${pct} Prozent des Karteikastens in ${esc(label)}"></progress>
      <small>${pct}% · Wörter ansehen ›</small>
    </button>`;
  }).join('');
  $$('[data-cardbox-box]').forEach(b=>b.onclick=()=>openCardboxBox(b.dataset.cardboxBox));
  const practice=$('#cardboxPracticeBtn');if(practice){practice.disabled=!total;practice.textContent=due?`▥ ${due} fällige ${due===1?'Karte':'Karten'} üben`:'▥ Karteikarten üben'}
}

function renderAll(){
  const l=learner(); if(!l) return; ensureActiveSubject();applyPreferences();
  const profileBtn=$('#profileBtn'),lockedChild=isPairedChildDevice();profileBtn.textContent=l.name;profileBtn.disabled=lockedChild;profileBtn.classList.toggle('profile-locked',lockedChild);profileBtn.setAttribute('aria-label',lockedChild?`Kinderprofil: ${l.name}. Dieses Gerät ist fest zugeordnet.`:`Lernprofil wechseln. Aktiv: ${l.name}`);profileBtn.title=lockedChild?`Dieses Kindergerät ist fest mit ${l.name} verbunden`:'Profil wechseln'; $('#lrsBadge').classList.toggle('hidden',!literacySupportActive(l)); applyRoleUi();
  const activeSubjects=learnerActiveSubjects(l),switcher=$('#subjectSwitcher');
  if(switcher){switcher.innerHTML=activeSubjects.map(subject=>`<button data-subject="${esc(subject)}" class="subject-btn ${subject===state.activeSubject?'active':''}" aria-pressed="${subject===state.activeSubject?'true':'false'}">${esc(subjectShort(subject))}</button>`).join('');switcher.classList.toggle('hidden',activeSubjects.length<=1);$$('.subject-btn').forEach(b=>b.onclick=()=>{if(!isSubjectActive(b.dataset.subject))return;state.activeSubject=b.dataset.subject;save()})}
  $('#subjectLabel').textContent=subjectLabel(state.activeSubject);
  const p=subjectProgress(); $('#masteryPct').textContent=`${p.pct}%`; $('#masteryProgress').value=p.pct; $('#masteryProgress').setAttribute('aria-valuetext',`${p.pct} Prozent nachhaltig gemeistert`); $('#masteryWords').textContent=`${p.mastered} / ${p.total} gemeistert`; $('#schoolYearPill').textContent=p.schoolYear; $('#dueCount').textContent=dueWords().length; $('#streakCount').textContent=streak(); $('#xpCount').textContent=l.xp; $('#stableCount').textContent=p.stable;
  const campaign=subjectCampaign(state.activeSubject);$('#campaignTitle').textContent=campaign.title;$('#campaignEyebrow').textContent=campaign.eyebrow; $('#armyRank').textContent=rankFor(p.pct,state.activeSubject); $('#armyStrength').textContent=armyStrength(); $('#gearLevel').textContent=gearFor(p.pct);
  const nf=currentTestFortress(),tickets=battleTickets(),usedToday=!!battleDayState(state.activeSubject,false)?.actionUsed,secured=!!nf?.capturedAt;
  $('#fortressRequirement').textContent=!nf?'Kein Test geplant':secured?`Erobert · Test ${formatDateShort(nf.testDate)}`:`${nf.defense} Verteidigung · Test ${formatDateShort(nf.testDate)}`;
  const ticketEl=$('#gameTicketCount');if(ticketEl)ticketEl.textContent=!nf?'–':tickets?`${tickets} bereit`:usedToday?'genutzt':'gesperrt';
  const missionStatus=$('#gameMissionStatus'),missionTitle=$('#gameMissionTitle'),missionMeta=$('#gameMissionMeta');
  if(missionStatus){
    missionStatus.className=`game-mission-status ${!nf?'idle':secured?'captured':tickets?'ready':usedToday?'spent':'locked'}`;
    missionStatus.textContent=!nf?'WARTE AUF ZIEL':secured?(tickets?'SICHERUNG BEREIT':'FESTUNG EROBERT'):tickets?'ANGRIFF BEREIT':usedToday?'ANGRIFF HEUTE GENUTZT':'ANGRIFF GESPERRT';
  }
  if(missionTitle)missionTitle.textContent=nf?nf.name:'Noch keine Testfestung';
  if(missionMeta)missionMeta.textContent=nf?`${nf.scopeText||'Testumfang'} · Test ${formatDateShort(nf.testDate)}`:'Sobald ein Test geplant ist, erscheint hier automatisch das nächste Ziel.';
  const learnDone=!!nf&&(tickets>0||usedToday||secured),attackDone=!!nf&&(usedToday||secured),captureDone=!!secured;
  const loopState=(el,done,current,locked)=>{if(!el)return;el.classList.toggle('done',done);el.classList.toggle('current',current);el.classList.toggle('locked',locked)};
  loopState($('#gameLoopLearn'),learnDone,!!nf&&!learnDone,!nf);
  loopState($('#gameLoopAttack'),attackDone,!!nf&&learnDone&&!attackDone,!nf||!learnDone);
  loopState($('#gameLoopCapture'),captureDone,!!nf&&attackDone&&!captureDone,!nf||!attackDone);
  $('#attackBtn').disabled=!nf;$('#attackBtn').textContent=!nf?'KEIN ZIEL':tickets?(secured?'FESTUNG SICHERN':'ANGRIFF STARTEN'):(secured?'FESTUNG ANSEHEN':'FESTUNG ANSEHEN');
  $('#campaignMessage').className=`game-mission-message ${tickets?'ready':secured?'captured':usedToday?'spent':'locked'}`;$('#campaignMessage').textContent=!nf?'Plane einen Test – daraus entsteht automatisch dein nächstes Ziel.':tickets?(secured?'Heute kannst du die eroberte Festung weiter sichern.':'Dein Tagesziel ist geschafft. Eine Angriffsaktion ist bereit.'):secured?`Erobert. Bis zum Test am ${formatDateShort(nf.testDate)} hältst du die Festung.`:usedToday?`Angriff ausgeführt. Die Festung hat noch ${nf.defense} Verteidigung. Morgen kannst du erneut angreifen.`:`Erledige zuerst dein heutiges Lernziel. Dann erhältst du genau eine Angriffsaktion.`;
  const hasSubjectWords=myWords().length>0; $('#campaignCard').classList.toggle('hidden',!hasSubjectWords); if(!hasSubjectWords)$('#optionalLearningCard')?.classList.add('hidden'); renderCardboxOverview(); renderToday(); renderTestCheck(); renderBattlefield(); renderBattleView(); renderRecommendations(); renderSets(); renderDashboard(); renderLibrary(); renderProfiles();
  $('#fontSizeRange').value=l.fontSize; $('#letterSpacingRange').value=l.letterSpacing; $('#flashSpeedSelect').value=String(l.flashSpeed); if($('#autoSpeakCorrection'))$('#autoSpeakCorrection').checked=l.autoSpeakCorrection!==false;
  renderParentOverview(); renderFamilySync(); checkHundredPercent(); renderStorageStatus(); window.VTMenuUi?.render?.();
}
function applyPreferences(){const l=learner();document.documentElement.dataset.fontSize=String(clamp(Number(l.fontSize)||17,16,24));document.documentElement.dataset.letterSpace=String(clamp(Number(l.letterSpacing)||0,0,3));document.documentElement.classList.toggle('lrs-mode',literacySupportActive(l));document.documentElement.classList.toggle('reduced-load',reducedLoadEnabled(l))}

function fireTestCompletionConfetti(){
  if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
  document.querySelector('.test-completion-confetti')?.remove();
  const canvas=document.createElement('canvas');
  canvas.className='test-completion-confetti';
  canvas.setAttribute('aria-hidden','true');
  document.body.appendChild(canvas);
  const ctx=canvas.getContext('2d');
  if(!ctx){canvas.remove();return}
  const width=Math.max(window.innerWidth||document.documentElement.clientWidth||320,320),height=Math.max(window.innerHeight||document.documentElement.clientHeight||480,480),dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.scale(dpr,dpr);
  const palette=['#7c3aed','#1d4ed8','#f59e0b','#10b981','#ef4444','#0ea5e9'];
  const particles=Array.from({length:34},(_,i)=>{
    const spread=(i/(34-1)-.5)*Math.PI*.72,force=8+Math.random()*4.2;
    return {x:width/2,y:height+8,vx:Math.sin(spread)*force,vy:-Math.cos(spread)*force-2.6,w:5+Math.random()*4,h:8+Math.random()*6,rotation:Math.random()*Math.PI,spin:(Math.random()-.5)*.34,color:palette[i%palette.length]};
  });
  let start=performance.now(),last=start;
  const frame=now=>{
    const step=Math.min((now-last)/16.667,2);last=now;
    ctx.clearRect(0,0,width,height);
    const elapsed=now-start,alpha=elapsed<850?1:Math.max(0,1-(elapsed-850)/300);
    particles.forEach(p=>{
      p.x+=p.vx*step;p.y+=p.vy*step;p.vy+=.34*step;p.vx*=Math.pow(.992,step);p.rotation+=p.spin*step;
      ctx.save();ctx.globalAlpha=alpha;ctx.translate(p.x,p.y);ctx.rotate(p.rotation);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();
    });
    if(elapsed<1150)requestAnimationFrame(frame);else canvas.remove();
  };
  requestAnimationFrame(frame);
  setTimeout(()=>canvas.isConnected&&canvas.remove(),1500);
}

function openCompleteCurrentTest(){
  const ctx=upcomingTestContext();if(!ctx||ctx.days>0){toast('Der aktuelle Test kann noch nicht abgeschlossen werden.','subtle');return}
  const overdue=ctx.days<0,subjectName=subjectLabel(state.activeSubject),scope=ctx.scopeText||ctx.sets?.map(s=>s.title).join(' + ')||'Testbereich';
  modal(`<div class="eyebrow">Test ${overdue?'nachtragen':'heute'}</div><h2>Test abschließen?</h2><p><strong>${esc(subjectName)} · ${esc(formatDateShort(ctx.date))}</strong></p><p>${esc(scope)}</p><div class="notice subtle">Bestätige erst, wenn der Test wirklich geschrieben wurde. Danach verschwindet dieser Test aus dem aktuellen Lernweg und der nächste Test bzw. dessen Vorbereitung erscheint automatisch.</div><div class="modal-actions"><button value="cancel" class="ghost">Noch nicht</button><button type="button" id="confirmCompleteTestBtn" class="primary">Test abschließen</button></div>`);
  $('#confirmCompleteTestBtn').onclick=()=>{const done=completeTestContext(ctx);if(!done)return;closeModal();save();window.VTCampaignMap?.render?.();window.VTArmyUi?.render?.();fireTestCompletionConfetti();toast('Test abgeschlossen. Der nächste Schritt ist bereit.','good')};
}

function renderTestCheck(){
  const card=$('#testCheckCard'); if(!card)return; const ctx=upcomingTestContext();
  if(!ctx||!ctx.words.length||ctx.days>3){card.classList.add('hidden');return}
  const r=testReadinessForContext(ctx); card.classList.remove('hidden');
  $('#testCheckTitle').textContent=ctx.days===0?'Test heute – kurzer Check?':ctx.days===1?'Test morgen – bereit?':'Testcheck vor dem Termin';
  $('#testCheckContext').textContent=`${ctx.scopeText||ctx.sets.map(s=>s.title).join(' + ')} · ${r.ready} von ${r.total} Wörtern testbereit`;
  $('#testReadyPct').textContent=`${r.pct}%`; $('#testReadyProgress').value=r.pct; $('#testReadyProgress').setAttribute('aria-valuetext',`${r.ready} von ${r.total} Vokabeln testbereit`);
  $('#testReadyDetail').textContent=r.ready===r.total?'Alle Wörter sind nach dem Lernmodell testbereit.':`${r.total-r.ready} ${r.total-r.ready===1?'Wort braucht':'Wörter brauchen'} noch Festigung.`;
}
function renderToday(){
  const parent=isParentMode(),reviewSet=mySets().find(setNeedsPairReview),practiceDisclosure=$('#practiceDisclosure'),cardCount=schoolYearVerifiedWords().length,cardsBtn=$('#quickCardsBtn'),hero=$('#quickLearnHeroBtn');
  if(hero)hero.dataset.action='learn';if($('#todayTestBtn'))$('#todayTestBtn').dataset.setId='';
  if(cardsBtn){cardsBtn.disabled=!cardCount;cardsBtn.textContent=cardCount?'▥ Karteikarten':'▥ Noch keine Karten'}
  practiceDisclosure?.classList.remove('hidden');
  if(reviewSet){
    const count=setWords(reviewSet.id).length,progressRow=$('#todayProgress')?.closest('.today-progress-row');
    progressRow?.classList.add('hidden');$('#todayProgressText').textContent='';
    $('#todaySummary').textContent=parent?'Vokabelpaare prüfen':'Neue Wörter werden vorbereitet';
    $('#todayContext').textContent=`${reviewSet.title} · ${count} ${count===1?'Vokabel':'Vokabeln'}`;
    $('#todayEstimate').textContent=parent?'Prüfe Wort und Bedeutung, bevor das Kind mit diesen Vokabeln lernt.':'Ein Erwachsener prüft noch, ob Wort und Bedeutung richtig zusammengehören.';
    $('#quickLearnHeroBtn').disabled=!parent;$('#quickLearnHeroBtn').textContent=parent?'Paare prüfen':'Noch nicht bereit';if(parent)$('#quickLearnHeroBtn').dataset.action='pairReview';
    $('#todayTestPill').classList.add('hidden');$('#todayTestBtn').classList.add('hidden');return;
  }
  const ctx=upcomingTestContext(),pending=seriesScopePending(),pendingIsNext=!!(pending&&(!ctx||pending.date<=ctx.date)),progressRow=$('#todayProgress')?.closest('.today-progress-row');
  if(ctx&&ctx.days<=0){
    progressRow?.classList.add('hidden');$('#todayProgressText').textContent='';
    $('#todaySummary').textContent=ctx.days===0?'Test heute':'Test noch abschließen';
    $('#todayContext').textContent=`${subjectLabel(state.activeSubject)} · ${ctx.scopeText||ctx.sets.map(s=>s.title).join(' + ')}`;
    $('#todayEstimate').textContent=ctx.days===0?'Wenn der Test geschrieben ist, schließe ihn hier ab. Danach erscheint automatisch der nächste Test oder seine Vorbereitung.':`Der Test vom ${formatDateShort(ctx.date)} ist noch offen. Schließe ihn ab, sobald er geschrieben wurde.`;
    $('#quickLearnHeroBtn').disabled=false;$('#quickLearnHeroBtn').textContent='Test abschließen';$('#quickLearnHeroBtn').dataset.action='completeTest';
    $('#todayTestPill').textContent=ctx.days===0?'Test heute':`Test ${formatDateShort(ctx.date)}`;$('#todayTestPill').classList.remove('hidden');
    if(parent){$('#todayTestBtn').textContent='Test bearbeiten';$('#todayTestBtn').dataset.setId=ctx.sets[0]?.id||'';$('#todayTestBtn').classList.remove('hidden')}else $('#todayTestBtn').classList.add('hidden');
    return;
  }
  if(pendingIsNext){
    const subjectName=subjectLabel(state.activeSubject),when=pending.days===0?'heute':pending.days===1?'morgen':`in ${pending.days} Tagen`;
    $('#todaySummary').textContent=parent?'Testumfang festlegen':'Der nächste Test wird vorbereitet';
    $('#todayContext').textContent=`${subjectName}-Test ${when}`;
    $('#todayEstimate').textContent=parent?'Lege fest, welche Lektion oder welcher Vokabelbereich drankommt.':'Ein Erwachsener trägt noch ein, welche Vokabeln im nächsten Test drankommen.';
    progressRow?.classList.add('hidden');$('#todayProgressText').textContent='';$('#quickLearnHeroBtn').disabled=!parent||!mySets().length;$('#quickLearnHeroBtn').textContent=parent?'Testumfang festlegen':'Noch nicht bereit';if(parent)$('#quickLearnHeroBtn').dataset.action='planTest';
    $('#todayTestPill').textContent=`↻ ${WEEKDAYS_SHORT[Number(pending.series.weekday)||0]} · ${formatDateShort(pending.date)}`;$('#todayTestPill').classList.remove('hidden');
    if(parent){$('#todayTestBtn').textContent='Serientermin ändern';$('#todayTestBtn').classList.remove('hidden')}else $('#todayTestBtn').classList.add('hidden');
    return;
  }
  if(!ctx&&latestTestCompletion()){
    progressRow?.classList.add('hidden');$('#todayProgressText').textContent='';$('#todayTestPill').classList.add('hidden');$('#todayTestBtn').classList.add('hidden');
    $('#todaySummary').textContent=parent?'Nächsten Test vorbereiten':'Der nächste Test wird vorbereitet';
    $('#todayContext').textContent=`${subjectLabel(state.activeSubject)} · letzter Test abgeschlossen`;
    $('#todayEstimate').textContent=parent?'Plane jetzt den nächsten Testtermin und den passenden Vokabelbereich.':'Ein Erwachsener plant als Nächstes den neuen Test und die Vokabeln dafür.';
    $('#quickLearnHeroBtn').disabled=!parent||!mySets().length;$('#quickLearnHeroBtn').textContent=parent?'Nächsten Test vorbereiten':'Noch nicht bereit';if(parent)$('#quickLearnHeroBtn').dataset.action='planTest';
    return;
  }
  const plan=buildDailyPlan(),status=dailyPlanStatus(plan),rescue=t1RescuePlan(plan),hasWords=(ctx?.words.length||schoolYearVerifiedWords().length)>0;
  progressRow?.classList.remove('hidden');
  if(!hasWords){
    practiceDisclosure?.classList.add('hidden');
    $('#todaySummary').textContent=parent?'Noch keine Vokabeln':'Heute ist noch nichts vorbereitet';
    $('#todayContext').textContent=parent?'Plane einen Test oder bereite Vokabeln ohne Testtermin vor.':'Bitte einen Erwachsenen, neue Vokabeln vorzubereiten.';
    $('#todayEstimate').textContent=parent?'Danach erscheinen die freigegebenen Wörter automatisch im Kindermodus.':'Sobald alles vorbereitet ist, erscheint hier automatisch deine nächste Lernaufgabe.';
  }else if(!status.total){$('#todaySummary').textContent='Tagesziel geschafft';$('#todayContext').textContent=ctx?testContextLabel(ctx):'Heute ist keine Pflicht-Wiederholung offen.';$('#todayEstimate').textContent='Weitere Übungen sind optional.';}
  else if(!status.remaining){$('#todaySummary').textContent=`${status.total} von ${status.total} erledigt ✓`;$('#todayContext').textContent=ctx?testContextLabel(ctx):'Dein heutiges Lernpensum ist erledigt.';$('#todayEstimate').textContent=rescue.available?`Morgen ist Test. Noch ${rescue.weakTotal} Vokabel${rescue.weakTotal===1?' ist':'n sind'} nicht testbereit. Eine Rettungsrunde mit ${rescue.refs.length} Fokuswörtern ist empfohlen – freiwillig und ohne zusätzliche Kampfaktion.`:rescue.recommended?`Rettungsrunde für jetzt abgeschlossen. ${rescue.weakTotal} Vokabel${rescue.weakTotal===1?' erfüllt':'n erfüllen'} wegen der kurzen Vorlaufzeit noch nicht alle Testbereitschaftskriterien. Jetzt ist eine Pause sinnvoll.`:status.extraRemaining?(plan.recommendSecondRound?`Pflichtteil geschafft. Später sind ${status.extraRemaining} Vokabel${status.extraRemaining===1?'':'n'} als zweite kurze Runde empfohlen – freiwillig.`:`${status.extraRemaining} zusätzliche Vokabel${status.extraRemaining===1?'':'n'} ${status.extraRemaining===1?'steht':'stehen'} als freiwilliger Vorsprung bereit. Das Tagesziel bleibt abgeschlossen.`):status.extraDone?`${status.extraDone} zusätzliche Vokabel${status.extraDone===1?'':'n'} heute sicher. Das Tagesziel bleibt unverändert.`:'Weitere Übungen sind optional.';}
  else{
    const mix=[];if(status.introRemaining)mix.push(`${status.introRemaining} neu`);if(status.reviewRemaining)mix.push(`${status.reviewRemaining} Wiederholung${status.reviewRemaining===1?'':'en'}`);
    $('#todaySummary').textContent=status.done?`Noch ${status.remaining} von ${status.total} Vokabeln`:`${status.total} Vokabel${status.total===1?'':'n'} heute`;
    $('#todayContext').textContent=ctx?testContextLabel(ctx):(mix.length?mix.join(' · '):'Automatisch aus fälligen und unsicheren Vokabeln');
    const shortMode=reducedLoadEnabled(learner()),mins=Math.max(2,Math.ceil(status.remaining*(shortMode?1.0:1.1))),phaseText=plan.phase==='acquire'?' · Neue Wörter früh aufbauen.':plan.phase==='consolidate'?' · Schwerpunkt: aktiv festigen.':plan.phase==='rehearse'?' · Kurz vor dem Test: überwiegend abrufen und wiederholen.':'';
    const maintenance=plan.maintenanceCount?` · ${plan.maintenanceCount} ältere Wiederholung${plan.maintenanceCount===1?'':'en'} dabei.`:'',deadline=plan.deadlineOverload?' · Der offene Stoff ist zu groß für eine einzige kurze Pflicht-Einheit; eine zweite kurze Runde wird empfohlen oder der Testumfang sollte geprüft werden.':'';
    const paceText=ctx?(plan.spacingRisk?' · Der Test ist sehr nah; neue Wörter können heute nicht mehr ausreichend verteilt gefestigt werden.':plan.pace==='ahead'?' · Du liegst vor dem Plan; der Pflichtblock bleibt besonders klein.':plan.pace==='overload'?' · Trotz Rückstand bleibt der Pflichtblock bewusst kurz.':' · Der Pflichtblock passt zum aktuellen Lernstand.'):'';
    const secondRound=plan.recommendSecondRound?' · Danach kann eine zweite kurze Runde sinnvoll sein; sie bleibt freiwillig.':'';
    $('#todayEstimate').textContent=`1 kurze Pflicht-Einheit · noch ca. ${mins} Min. · ${status.total} Fokuswörter.${phaseText}${maintenance}${paceText}${deadline}${secondRound}`;
  }
  $('#todayProgress').max=Math.max(1,status.total); $('#todayProgress').value=status.done; $('#todayProgress').setAttribute('aria-valuetext',`${status.done} von ${status.total} Vokabeln heute erledigt`); $('#todayProgressText').textContent=status.total?`${status.done} / ${status.total} erledigt`:'';
  const rescueAvailable=!status.remaining&&rescue.available,bonusAvailable=!status.remaining&&status.extraRemaining>0;
  $('#quickLearnHeroBtn').disabled=!hasWords||(!status.remaining&&!rescueAvailable&&!bonusAvailable); $('#quickLearnHeroBtn').textContent=!hasWords?'Noch nicht bereit':status.remaining?(status.done?'Weiterlernen':'Jetzt lernen'):rescueAvailable?'Rettungsrunde starten':bonusAvailable?(plan.recommendSecondRound?'Zweite Runde (optional)':'Vorsprung weiterlernen'):'Heute erledigt ✓';
  if(ctx){$('#todayTestPill').textContent=(ctx.source==='series'||ctx.source==='mixed')?`↻ ${WEEKDAYS_SHORT[Number(ctx.series?.weekday)||0]} · ${formatDateShort(ctx.date)}`:`Test ${formatDateShort(ctx.date)}`;$('#todayTestPill').classList.remove('hidden');if(parent){$('#todayTestBtn').textContent='Testplan ändern';$('#todayTestBtn').classList.remove('hidden');$('#todayTestBtn').dataset.setId=ctx.sets[0]?.id||'';}else $('#todayTestBtn').classList.add('hidden');}
  else{$('#todayTestPill').classList.add('hidden');if(parent&&mySets().length){$('#todayTestBtn').textContent='Testplan festlegen';$('#todayTestBtn').classList.remove('hidden');}else $('#todayTestBtn').classList.add('hidden');}
}function renderRecommendations(){
  const l=learner(),cardPool=schoolYearVerifiedWords(),weak=cardPool.filter(w=>!isMastered(w)).sort((a,b)=>masteryScore(a)-masteryScore(b)),chunkWords=cardPool.filter(w=>chunkEligibleWord(w)&&(w.errorProfile?.spelling||0)>0),contextWords=cardPool.filter(w=>String(w.example||'').trim());
  const cards=$('#practiceCardsBtn'),weakBtn=$('#practiceWeakBtn'),allBtn=$('#practiceAllBtn'),specialBtn=$('#practiceSpecialBtn');
  if(cards)cards.disabled=!cardPool.length;if(weakBtn)weakBtn.disabled=!weak.length;if(allBtn)allBtn.disabled=!cardPool.length;if(specialBtn)specialBtn.disabled=!cardPool.length;
  const copyPending=cardPool.filter(w=>!w.firstContactCompletedAt).length;
  const recs=[
    {icon:'🔊',title:'Hören',sub:'Aussprache hören und wiedererkennen',mode:'listening'},
    {icon:'✎',title:'Rechtschreibung',sub:'Diktat: hören und genau schreiben',mode:'spelling'},
    {icon:'▣',title:'Kontext',sub:contextWords.length?`${contextWords.length} Wörter mit Beispielsatz`:'Noch keine Beispielsätze vorhanden',mode:'context',disabled:!contextWords.length},
    {icon:'✍',title:'Handschrift',sub:'nachfahren · abdecken · selbst vergleichen',mode:'handwriting'},
    {icon:'📝',title:'Abschreiben',sub:copyPending?`freiwillig · ${copyPending} noch offen`:'freiwillige zusätzliche Schreibeinheit',mode:'copy'},
    {icon:'⚡',title:'Wortblitz',sub:readingSupportEnabled(l)?'ruhiges Tempo · Lesen üben · ohne Mastery-Wertung':'Leseflüssigkeit ohne Mastery-Wertung',mode:'flash'},
    {icon:'🔊',title:'Vokabeldusche',sub:'mit Denkpause oder passiv anhören',mode:'shower'}
  ];
  if(chunkWords.length)recs.splice(2,0,{icon:'🧩',title:'Wortbausteine',sub:`${chunkWords.length} Rechtschreib-Lernwörter · keine ganzen Sätze`,mode:'chunks'});
  if(subjectHasCapability(state.activeSubject,'latinGrammar'))recs.push({icon:'Ⅳ',title:'Latein Formen',sub:'Genitiv · Genus · Stammformen · Anwendung',mode:'latinGrammar'});
  $('#recommendations').innerHTML=recs.map(r=>`<button class="recommend" data-mode="${r.mode}" ${r.disabled?'disabled':''}><span class="icon">${r.icon}</span><strong>${r.title}</strong><small>${r.sub}</small></button>`).join('');
  document.querySelectorAll('#recommendations [data-mode]').forEach(b=>b.onclick=()=>{const mode=b.dataset.mode;if(mode==='copy')startCopyPractice();else if(mode==='context')startSession('context',null,contextWords.map(w=>w.id));else startSession(mode)});
}
function setPairAuditText(setId){
  const s=state.sets.find(x=>x.id===setId),words=s?setWords(setId):[];
  const lines=[`Lernbereich: ${s?.title||''}`,`Fach: ${subjectLabel(s?.subject||state.activeSubject)}`,''];
  words.forEach((w,i)=>{lines.push(`${i+1}. ${w.term} = ${w.translation}`);const ta=termTargets(w).filter(x=>x!==w.term),tr=translationTargets(w).filter(x=>x!==w.translation);if(ta.length)lines.push('   weitere Wortformen: '+ta.join(' | '));if(tr.length)lines.push('   weitere Bedeutungen: '+tr.join(' | '))});
  return lines.join('\n');
}
async function copySetPairAudit(setId){
  const text=setPairAuditText(setId);
  try{await navigator.clipboard.writeText(text);toast('Vokabelpaare kopiert.','good')}
  catch(_e){const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const ok=document.execCommand?.('copy');ta.remove();toast(ok?'Vokabelpaare kopiert.':'Kopieren nicht möglich.','subtle')}
}
function resetSetForReimport(setId){
  const s=state.sets.find(x=>x.id===setId);if(!s)return false;
  const links=(state.setVocabulary||[]).filter(x=>x.setId===setId),senseIds=new Set(links.map(x=>x.senseId).filter(Boolean));
  state.setVocabulary=(state.setVocabulary||[]).filter(x=>x.setId!==setId);
  const remainingSetIds=new Set((state.sets||[]).filter(x=>x.learnerId===s.learnerId).map(x=>x.id));
  state.learnerVocabulary=(state.learnerVocabulary||[]).filter(p=>{
    if(p.learnerId!==s.learnerId||!senseIds.has(p.senseId))return true;
    return (state.setVocabulary||[]).some(link=>link.senseId===p.senseId&&remainingSetIds.has(link.setId));
  });
  (state.vocabulary||[]).forEach(v=>{v.sources=(v.sources||[]).filter(src=>src.setId!==setId)});
  if(s.bookId&&s.bookSection){
    const shared=(state.sets||[]).some(x=>x.id!==s.id&&x.bookId===s.bookId&&x.bookSection===s.bookSection);
    if(!shared)state.bookVocabulary=(state.bookVocabulary||[]).filter(x=>!(x.bookId===s.bookId&&x.section===s.bookSection));
  }
  const owner=(state.learners||[]).find(x=>x.id===s.learnerId);if(owner?.dailyPlans){for(const key of Object.keys(owner.dailyPlans)){if(key.endsWith(':'+s.subject))delete owner.dailyPlans[key]}}
  s.pairReviewRequired=true;s.pairVerifiedAt='';s.pairVerifiedSignature='';rebuildWordIndexes();return true;
}
function activatePendingTestPlan(set){
  const pending=set?.pendingTestPlan;if(!pending)return false;
  const owner=(state.learners||[]).find(l=>l.id===set.learnerId);if(!owner)return false;
  const links=(state.setVocabulary||[]).filter(x=>x.setId===set.id);if(!links.length)return false;
  const selectedLinkIds=links.map(x=>x.id),mode=pending.mode==='weekly'?'weekly':'single',format=pending.testFormat||set.testFormat||'target';
  if(mode==='weekly'){
    owner.testSeries={...defaultTestSeries(),...(owner.testSeries||{})};
    owner.testSeries[set.subject]={enabled:true,weekday:Number(pending.weekday)||0,scopeMode:'selected',setId:set.id,from:1,to:selectedLinkIds.length,selectedLinkIds,scopeDate:pending.testDate||nextWeeklyDate(Number(pending.weekday)||0),testFormat:format,updatedAt:new Date().toISOString()};
    set.testDate='';
  }else{
    set.testDate=pending.testDate||'';
  }
  set.testScopeMode='selected';set.testSelectedLinkIds=selectedLinkIds;set.testFrom=1;set.testTo=selectedLinkIds.length;set.testFormat=format;
  delete set.pendingTestPlan;
  owner.dailyPlans={};
  return true;
}
function openSetPairAudit(setId){
  const s=state.sets.find(x=>x.id===setId);if(!s)return;
  const words=setWords(setId),required=setNeedsPairReview(s);
  const rows=words.map((w,i)=>`<tr><td>${i+1}</td><td><strong>${esc(w.term)}</strong> <button type="button" class="ghost" data-speak="${esc(w.term)}" aria-label="Vokabel anhören">🔊</button></td><td>${esc(w.translation)}</td><td><small>${esc(termTargets(w).join(' · '))}</small></td><td><small>${esc(translationTargets(w).join(' · '))}</small></td></tr>`).join('');
  const pendingTest=!!s.pendingTestPlan,pendingDate=s.pendingTestPlan?.testDate||'';
  modal(`<div class="eyebrow">${pendingTest?'Test vorbereiten · letzter Schritt':'Vokabeln prüfen'}</div><h2>${esc(s.title)}</h2>${pendingTest?`<div class="notice warn"><strong>Der Testplan ist noch nicht aktiv.</strong><br>Erst wenn diese Paare bestätigt sind, wird ${s.pendingTestPlan?.mode==='weekly'?'die Testserie':`der Test am ${esc(formatDateShort(pendingDate))}`} gespeichert und für das Lernen verwendet.</div>`:required?'<div class="notice warn"><strong>Vor dem Lernen erforderlich.</strong><br>Bitte jedes Wort↔Bedeutung-Paar prüfen und erst danach freigeben.</div>':''}<p>Hier stehen exakt die Wort↔Bedeutung-Paare, die die Abfrage verwendet. Wenn diese Liste falsch ist, liegt der Fehler im Import – nicht in deiner Antwort.</p>${words.length?`<div class="table-wrap set-pair-audit"><table><thead><tr><th>#</th><th>Vokabel</th><th>Lehrwerksbedeutung</th><th>akzeptierte Wortformen</th><th>akzeptierte Bedeutungen</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="notice warn">Dieser Lernbereich enthält aktuell keine Vokabeln.</div>'}<div class="notice subtle top-space"><strong>Bei einem fehlerhaften Fotoimport:</strong> „Vokabeln neu einlesen“ entfernt nur die Zuordnungen und den bisherigen Lernstand dieses Lernbereichs. Profil, Lehrwerk und andere Lernbereiche bleiben erhalten.</div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button>${words.length?'<button type="button" id="copySetPairsBtn" class="ghost">Paare kopieren</button>':''}<button type="button" id="reimportSetBtn" class="secondary">Vokabeln neu einlesen</button>${required&&words.length?`<button type="button" id="confirmSetPairsBtn" class="primary">${pendingTest?'Paare stimmen · Test speichern':'Paare stimmen · fürs Lernen freigeben'}</button>`:''}</div>`);
  $('#copySetPairsBtn')?.addEventListener('click',()=>copySetPairAudit(setId));
  $('#confirmSetPairsBtn')?.addEventListener('click',()=>{const now=new Date().toISOString();s.pairReviewRequired=false;s.pairVerifiedAt=now;s.pairVerifiedSignature=pairReviewSignatureForSet(setId);for(const link of (state.setVocabulary||[]).filter(x=>x.setId===setId)){const v=(state.vocabulary||[]).find(x=>x.id===link.vocabId);if(v&&!v.verifiedAt)v.verifiedAt=now;if(v)v.updatedAt=now}syncSetToBookVocabulary(setId,now);const activatedTest=activatePendingTestPlan(s);closeModal();save();if(isParentMode()){showView('parentView');renderAll();toast(activatedTest?`Testplan gespeichert · ${words.length} geprüfte Vokabel${words.length===1?'':'n'}.`:'Vokabelpaare bestätigt. Das Kind kann die Wörter jetzt direkt lernen.','good')}else{showView('homeView');renderAll();toast(activatedTest?'Testplan gespeichert.':'Vokabelpaare bestätigt. Die Wörter sind jetzt direkt lernbereit.','good')}});
  $('#reimportSetBtn').onclick=()=>{if(!confirm(`Vokabel-Zuordnungen und den bisherigen Lernstand von „${s.title}“ löschen und die Vokabeln neu per Foto einlesen? Andere Lernbereiche bleiben unverändert.`))return;if(!resetSetForReimport(setId))return;closeModal();save();setTimeout(()=>openScanImport(setId),100)};
}

function renderSets(){
  const sets=mySets(); if(!sets.length){$('#setList').innerHTML='<div class="empty-state"><strong>Noch kein aktiver Lernstoff</strong><p>Wenn ein Test ansteht, plane ihn direkt. Ohne Testtermin kannst du Vokabeln separat vorbereiten.</p><div class="row gap wrap center-actions"><button id="emptyTestPlanBtn" class="primary">Test planen</button><button id="emptyNewSetBtn" class="secondary">Ohne Test vorbereiten</button></div></div>';$('#emptyTestPlanBtn').onclick=openTestDatePlanner;$('#emptyNewSetBtn').onclick=()=>openLearningContentPlanner();return}
  const series=activeSeries(),pending=seriesScopePending();
  $('#setList').innerHTML=[...sets].sort((a,b)=>(b.schoolYear===currentSchoolYear())-(a.schoolYear===currentSchoolYear())).map(s=>{
    const w=setWords(s.id),m=w.filter(isMastered).length,p=w.length?Math.round(m/w.length*100):0,review=setNeedsPairReview(s),fc=firstContactStatus(s.id),copyOpen=!review&&fc.pending>0;
    const seriesCount=series?.setId===s.id?scopedWordsForSet(s,series.scopeMode,series.from,series.to,series.selectedLinkIds).length:0;
    const seriesInfo=series?.setId===s.id?` · <strong>↻ ${WEEKDAYS_SHORT[Number(series.weekday)||0]}${pending?' · Umfang neu festlegen':seriesCount?` · ${seriesCount} Vokabeln`:''}</strong>`:'';
    const testCount=s.testDate&&daysUntil(s.testDate)>=0?scopedWordsForSet(s,s.testScopeMode,s.testFrom,s.testTo,s.testSelectedLinkIds).length:0;
    const statusPill=review?'<span class="pill warn">Prüfung offen</span>':copyOpen?`<span class="pill">Lernbereit · Abschreiben optional ${fc.completed}/${fc.total}</span>`:'<span class="pill">Lernbereit</span>';
    return `<div class="set-item ${s.schoolYear===currentSchoolYear()?'current-year':'other-year'}"><div><div class="row gap align-center"><h3>${esc(s.title)}</h3>${statusPill}</div><p>${esc(s.schoolYear)}${s.bookId&&bookById(s.bookId)?` · ${esc(bookById(s.bookId).title||formatIsbn(bookById(s.bookId).isbn13))}`:''} · ${w.length} Vokabeln · ${p}% gemeistert${s.testDate&&daysUntil(s.testDate)>=0?` · <strong>Test ${formatDateShort(s.testDate)} · ${testCount} Vokabeln</strong>`:''}${seriesInfo}</p><progress class="set-progress" max="100" value="${p}" aria-label="${esc(s.title)}: ${p}% gemeistert"></progress></div><div class="row gap wrap">${review?`<button class="primary" data-set-audit="${s.id}">Paare prüfen</button>`:''}<button class="ghost" data-set-edit="${s.id}">Details</button><button class="ghost" data-set-plan="${s.id}">Test planen</button></div></div>`;
  }).join('');
  document.querySelectorAll('[data-set-audit]').forEach(b=>b.onclick=()=>openSetPairAudit(b.dataset.setAudit));
  document.querySelectorAll('[data-set-edit]').forEach(b=>b.onclick=()=>openSetEditor(b.dataset.setEdit));
  document.querySelectorAll('[data-set-plan]').forEach(b=>b.onclick=()=>openTestDatePlanner());
}function renderDashboard(){
  const l=learner(), p=subjectProgress(); const grades=state.grades.filter(g=>g.learnerId===l.id).sort((a,b)=>b.date.localeCompare(a.date));
  const activity=state.activity.filter(a=>a.learnerId===l.id).slice(-30); const last7=new Set(activity.filter(a=>Date.now()-new Date(a.date).getTime()<=7*864e5).map(a=>dateKey(new Date(a.date)))).size;
  const practice=state.practiceTests.filter(t=>t.learnerId===l.id&&t.subject===state.activeSubject).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,8);
  const scale=gradeScaleFor(state.activeSubject);
  $('#dashboardContent').innerHTML=`<div class="metric-grid"><div><span class="metric">${p.pct}%</span><small>${subjectLabel(state.activeSubject)} Schuljahr</small></div><div><span class="metric">${last7}</span><small>aktive Tage / 7</small></div><div><span class="metric">${l.xp}</span><small>XP</small></div><div><span class="metric">${grades.length}</span><small>eingetragene Tests</small></div></div><div class="row spread align-center wrap"><h3>Testchecks</h3><button id="gradeScaleBtn" class="ghost">Notenschlüssel</button></div><p class="microcopy">${esc(gradeScaleText(scale))} · gilt für neue Testchecks in ${subjectLabel(state.activeSubject)}.</p>${practice.length?`<div class="table-wrap"><table><thead><tr><th>Datum</th><th>Umfang</th><th>Ergebnis</th><th>Vorschlag</th><th>Schulnote</th></tr></thead><tbody>${practice.map(t=>{const actual=actualGradeForPractice(t.id);return `<tr><td>${esc(t.date)}</td><td>${esc(t.scopeText||'Testbereich')}</td><td><strong>${t.percent}%</strong> · ${t.correct}/${t.total}</td><td><strong>${esc(t.suggestedGrade||'–')}</strong></td><td>${actual?`<strong>${esc(actual.grade)}</strong>`:`<button class="ghost" data-grade-practice="${t.id}">Note eintragen</button>`}</td></tr>`}).join('')}</tbody></table></div>`:'<p class="notice subtle">Noch keine Prüfungssimulation durchgeführt.</p>'}<h3>Noten</h3>${grades.length?`<div class="table-wrap"><table><thead><tr><th>Datum</th><th>Fach</th><th>Note</th><th>Vergleich</th><th>Kommentar</th></tr></thead><tbody>${grades.map(g=>{const pt=g.practiceTestId?state.practiceTests.find(t=>t.id===g.practiceTestId):null;const comparison=pt?`${pt.percent}% → Vorschlag ${esc(pt.suggestedGrade||'–')}`:'–';return `<tr><td>${esc(g.date)}</td><td>${subjectLabel(g.subject)}</td><td><strong>${esc(g.grade)}</strong></td><td>${comparison}</td><td>${esc(g.note||'')}</td></tr>`}).join('')}</tbody></table></div>`:'<p class="notice subtle">Noch keine Testnoten eingetragen.</p>'}`;
  $('#gradeScaleBtn')?.addEventListener('click',()=>openGradeScaleSettings(state.activeSubject));
  $$('[data-grade-practice]').forEach(b=>b.onclick=()=>addGrade({practiceTestId:b.dataset.gradePractice}));
}
function renderLibrary(){
  const sets=state.sets.filter(s=>s.subject===state.activeSubject),words=globalVocabulary();
  const query=normalize($('#librarySearchInput')?.value||''),requestedFilter=$('#librarySetFilter')?.value||'',setFilter=sets.some(s=>s.id===requestedFilter)?requestedFilter:'';
  const senseSearch=v=>(v.senses||[]).flatMap(x=>[x.translation,...(x.translations||[]),x.partOfSpeech||'']).join(' ');
  const filtered=words.filter(v=>{const usage=vocabularyUsage(v.id),usedInSet=!setFilter||usage.setIds.includes(setFilter);const relatedSets=sets.filter(s=>usage.setIds.includes(s.id)).map(s=>s.title).join(' ');return usedInSet&&(!query||normalize(`${v.term} ${senseSearch(v)} ${(v.termVariants||[]).join(' ')} ${v.extra||''} ${relatedSets}`).includes(query))});
  $('#librarySetFilter').innerHTML=`<option value="">Alle Verwendungen</option>${sets.map(set=>{const owner=state.learners.find(l=>l.id===set.learnerId);return `<option value="${set.id}" ${setFilter===set.id?'selected':''}>${esc(owner?.name||'Profil')} · ${esc(set.title)}</option>`}).join('')}`;
  if($('#libraryCountPill'))$('#libraryCountPill').textContent=`${words.length} globale${words.length===1?' Vokabel':' Vokabeln'}`;
  const visible=filtered.slice(0,libraryRenderLimit),more=filtered.length-visible.length;
  if(!words.length){$('#wordLibrary').innerHTML='<div class="empty-state library-empty"><strong>Noch keine Vokabeln</strong><p>Für einen anstehenden Test wählst du die Wörter direkt unter „Test planen“. Ohne Termin nutzt du „Ohne Test lernen“.</p><button id="emptyLibraryAddBtn" class="primary">Ohne Test vorbereiten</button></div>';$('#emptyLibraryAddBtn')?.addEventListener('click',openLearningContentPlanner);return;}
  if(!filtered.length){$('#wordLibrary').innerHTML='<div class="empty-state library-empty"><strong>Keine Treffer</strong><p>Ändere die Suche oder den Verwendungsfilter.</p></div>';return;}
  const info=v=>{const u=vocabularyUsage(v.id),ps=progressesForVocabulary(v.id),bookCount=new Set((state.bookVocabulary||[]).filter(x=>x.vocabId===v.id).map(x=>x.bookId)).size,parts=[`${(v.senses||[]).length} Bedeutung${(v.senses||[]).length===1?'':'en'}`,`${u.sets} Lernbereich${u.sets===1?'':'e'}`,`${u.learners} Profil${u.learners===1?'':'e'}`];if(bookCount)parts.push(`${bookCount} Lehrwerk${bookCount===1?'':'e'}`);if(ps.length){const mastered=ps.filter(isMastered).length;parts.push(mastered===ps.length?`dieses Profil: ${mastered}/${ps.length} gemeistert`:`dieses Profil: ${mastered}/${ps.length} gemeistert`)}return parts.join(' · ')};
  const meanings=v=>(v.senses||[]).map((sense,i)=>`<div class="library-sense"><strong>${esc(sense.translation)}</strong>${sense.partOfSpeech?`<small> · ${esc(sense.partOfSpeech)}</small>`:''}${sense.translations?.length?`<small> · akzeptiert: ${esc(sense.translations.join(' · '))}</small>`:''}</div>`).join('');
  const mobileMeaning=v=>{const arr=(v.senses||[]).map(x=>x.translation);return `${arr.slice(0,2).map(esc).join(' · ')}${arr.length>2?` · +${arr.length-2}`:''}`};
  const desktopRows=visible.map(v=>`<tr><td><div class="library-term-audio"><strong>${esc(v.term)}</strong><button type="button" class="ghost library-audio-btn" data-speak="${esc(v.term)}" aria-label="Vokabel anhören">🔊</button></div>${v.extra?`<br><small>${esc(v.extra)}</small>`:''}${v.termVariants?.length?`<br><small>Varianten: ${esc(v.termVariants.join(' · '))}</small>`:''}</td><td>${meanings(v)}</td><td>${esc(info(v))}</td><td><button class="ghost" data-vocab-edit="${v.id}">Bearbeiten</button></td></tr>`).join('');
  const mobileRows=visible.map(v=>`<div class="library-word-audio-row"><button class="library-word-card" data-vocab-edit="${v.id}"><span class="library-word-main"><strong>${esc(v.term)}</strong><span>${mobileMeaning(v)}</span></span><span class="library-word-meta">${esc(info(v))}</span><span class="library-word-chevron">›</span></button><button type="button" class="ghost library-audio-btn" data-speak="${esc(v.term)}" aria-label="Vokabel anhören">🔊</button></div>`).join('');
  $('#wordLibrary').innerHTML=`<div class="library-result-line"><span>${filtered.length===words.length?`${words.length} globale Vokabel${words.length===1?'':'n'}`:`${filtered.length} von ${words.length}`}</span><span class="microcopy">Lexem einmal gespeichert · Bedeutungen getrennt gelernt</span></div><div class="library-table-desktop table-wrap"><table><thead><tr><th>Vokabel</th><th>Bedeutungen</th><th>Verwendung</th><th></th></tr></thead><tbody>${desktopRows}</tbody></table></div><div class="library-word-list">${mobileRows}</div>${more?`<div class="load-more"><button id="libraryMoreBtn" class="ghost">Weitere ${Math.min(200,more)} anzeigen</button><span class="microcopy">${visible.length} von ${filtered.length} sichtbar</span></div>`:''}`;
  $$('[data-vocab-edit]').forEach(b=>b.onclick=()=>openWordEditor(b.dataset.vocabEdit));$('#libraryMoreBtn')?.addEventListener('click',()=>{libraryRenderLimit+=200;renderLibrary()});
}

function openLibraryAddMenu(){
  modal(`<div class="eyebrow">Vokabeln</div><h2>Vokabeln hinzufügen</h2><p class="muted-line">Wähle den schnellsten Weg für deine Liste.</p><div class="add-vocab-grid"><button type="button" id="addByPhoto" class="add-vocab-option"><span>📷</span><strong>Foto / Text</strong><small>Liste fotografieren oder Text einfügen</small></button><button type="button" id="addManualWord" class="add-vocab-option"><span>＋</span><strong>Manuell</strong><small>Eine einzelne Vokabel eingeben</small></button><button type="button" id="addByCsv" class="add-vocab-option"><span>⇩</span><strong>CSV</strong><small>Vorhandene Liste importieren</small></button></div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button></div>`);
  $('#addByPhoto').onclick=()=>{closeModal();openScanImport()};
  $('#addManualWord').onclick=()=>{closeModal();openWordEditor()};
  $('#addByCsv').onclick=()=>{closeModal();const f=$('#fileInput');f.accept='.csv,text/csv';f.dataset.mode='csv';f.click()};
}
function bookRowDisplay(row){
  const v=(state.vocabulary||[]).find(x=>x.id===row.vocabId),sense=v&&(senseById(v,row.senseId)||primarySense(v));
  return {term:row.termOverride||v?.term||'',translation:row.translationOverride||sense?.translation||'',position:Number(row.position)||0};
}
function selectedRowsForCurrentPlan(learnerId,bookId,section){
  const sets=(state.sets||[]).filter(s=>s.learnerId===learnerId&&s.subject===state.activeSubject&&s.bookId===bookId&&s.bookSection===section);
  const active=sets.find(s=>s.testDate&&daysUntil(s.testDate)>=0)||sets.find(s=>s.testScopeMode==='selected');
  if(!active)return [];
  const selected=new Set(active.testScopeMode==='selected'?(active.testSelectedLinkIds||[]):(state.setVocabulary||[]).filter(x=>x.setId===active.id).map(x=>x.id));
  const links=(state.setVocabulary||[]).filter(x=>x.setId===active.id&&selected.has(x.id));
  const rows=knownBookSections(bookId).find(g=>g.section===section)?.items||[];
  return rows.filter(r=>links.some(l=>l.vocabId===r.vocabId&&l.senseId===r.senseId)).map(r=>r.id);
}
function contentPlanPreviewData(rows,learnerId,testDate=''){
  const l=(state.learners||[]).find(x=>x.id===learnerId),count=rows.length,newCount=rows.filter(r=>!learnerAlreadyKnowsSense(learnerId,r.senseId)).length;
  const knownRows=rows.filter(r=>learnerAlreadyKnowsSense(learnerId,r.senseId)),weakCount=knownRows.filter(r=>{const p=progressForSense(r.senseId,learnerId);return !p||!isTestReady(p)}).length;
  const days=testDate?Math.max(0,daysUntil(testDate)):null,pace=testDate?dailyPacePlan(newCount,weakCount,{days},reducedLoadEnabled(l)):dailyPacePlan(newCount,weakCount,null,reducedLoadEnabled(l));
  return {l,count,newCount,weakCount,days,pace};
}
function contentPlanPreviewText(rows,learnerId,testDate=''){
  const {count,newCount,days,pace}=contentPlanPreviewData(rows,learnerId,testDate),newLabel=`${pace.quota} neue${pace.quota===1?'s':''} Wort${pace.quota===1?'':'e'}`;
  if(!count)return 'Noch keine Vokabel ausgewählt.';
  if(!testDate)return `${count} Vokabeln ausgewählt. Der Pflichtkern bleibt kurz: ${newLabel} in höchstens ${pace.dailyTarget} Fokuswörtern.`;
  if(days<1)return `${count} Vokabeln ausgewählt · Test ist heute. Für neue Wörter bleibt kein sinnvoller Lernabstand mehr; heute nur gezielt wiederholen.`;
  const windowText=pace.reviewOnlyDays?`${pace.acquisitionDays} Tag${pace.acquisitionDays===1?'':'e'} für neue Wörter + 1 Wiederholungstag`:`${pace.acquisitionDays} Lerntag${pace.acquisitionDays===1?'':'e'} vor dem Test`;
  if(pace.overload)return `${count} ausgewählt · Test in ${days} Tag${days===1?'':'en'} · ${newCount} noch neu · rechnerisch ${pace.requiredPerDay} neue Wörter pro Lerntag nötig. Der Pflichtkern bleibt trotzdem bei höchstens ${pace.dailyTarget} Fokuswörtern mit maximal ${pace.maxNew} neuen Wörtern. Danach wird eine zweite kurze Runde empfohlen. Zeit bis zum Test ist zu knapp für den vorgesehenen Abstand.`;
  if(pace.spacingRisk)return `${count} ausgewählt · Test ${days===1?'morgen':'heute'} · ${newCount} noch neu. Der Pflichtkern bleibt bei höchstens ${pace.dailyTarget} Fokuswörtern; danach kann eine zweite kurze Runde sinnvoll sein. Für verteilte Wiederholungen bleibt zu wenig Zeit.`;
  if(!newCount)return `${count} ausgewählt · Test in ${days} Tag${days===1?'':'en'} · alle Wörter kennengelernt. Der Pflichtkern umfasst höchstens ${pace.dailyTarget} Fokuswörter und priorisiert die noch unsicheren Wörter.`;
  return `${count} ausgewählt · Test in ${days} Tag${days===1?'':'en'} · ${newCount} noch neu · ${windowText}. Aktuell ${newLabel} in einem Pflichtkern von höchstens ${pace.dailyTarget} Fokuswörtern. Der Plan wird jeden Tag aus dem tatsächlichen Lernstand neu berechnet.`;
}
function applyVocabularyPickerRange(picker,selector,fromInput,toInput,onChange){
  const boxes=[...picker.querySelectorAll(selector)],count=boxes.length;if(!count)return;
  let from=clamp(Math.round(Number(fromInput.value)||1),1,count),to=clamp(Math.round(Number(toInput.value)||count),1,count);
  if(from>to)[from,to]=[to,from];
  fromInput.value=String(from);toInput.value=String(to);
  boxes.forEach((box,index)=>box.checked=index+1>=from&&index+1<=to);
  onChange();
}
function syncVocabularyRangeInputs(fromInput,toInput,count){
  fromInput.min=toInput.min='1';fromInput.max=toInput.max=String(Math.max(1,count));
  const from=Number(fromInput.value),to=Number(toInput.value);
  if(!from||from>count)fromInput.value=count?'1':'';
  if(!to||to>count)toInput.value=count?String(count):'';
}
function openLearningContentPlanner(opts={}){
  if(!isParentMode()){openParentGate();return}
  const subject=state.activeSubject,learners=(state.learners||[]).filter(l=>learnerActiveSubjects(l).includes(subject)),books=globalLibraryBooks(subject);
  if(!learners.length){toast('Für dieses Fach ist noch kein Lernprofil aktiv.','warn');return}
  if(!books.length){
    modal(`<div class="eyebrow">Ohne Test lernen</div><h2>Vokabeln ohne Testtermin vorbereiten</h2><p>Dieser Weg ist nur für Lernstoff ohne konkreten Testtermin. Sobald ein Test feststeht, nutze „Test planen“.</p><div class="add-vocab-grid"><button type="button" id="contentByPhoto" class="add-vocab-option"><span>📷</span><strong>Foto / Text</strong><small>Liste erfassen und prüfen</small></button><button type="button" id="contentManual" class="add-vocab-option"><span>＋</span><strong>Manuell</strong><small>Einzelne Wörter erfassen</small></button><button type="button" id="contentLibrary" class="add-vocab-option"><span>▤</span><strong>Bibliothek</strong><small>Bestehenden Bestand ansehen</small></button></div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button></div>`);
    $('#contentByPhoto').onclick=()=>{closeModal();openScanImport('__new__')};
    $('#contentManual').onclick=()=>{closeModal();openSetEditor(null,'manual')};
    $('#contentLibrary').onclick=()=>{closeModal();showView('libraryView')};
    return;
  }
  const requestedLearner=opts.learnerId||state.activeLearnerId,defaultLearner=learners.find(l=>l.id===requestedLearner)||learners[0],defaultBook=books.find(b=>b.id===opts.bookId)||currentBook(defaultLearner.id,subject)||books[0];
  modal(`<div class="eyebrow">Ohne Test lernen</div><h2>Welche Vokabeln soll das Kind ohne Testtermin lernen?</h2><p class="muted-line">Für einen anstehenden Test gehst du direkt über „Test planen“. Hier bereitest du nur zusätzlichen Lernstoff ohne Termin vor.</p><div class="content-source-row"><span>Quelle</span><div class="row gap wrap"><button type="button" id="contentSourceBook" class="secondary compact-action">Lehrwerk</button><button type="button" id="contentSourcePhoto" class="ghost compact-action">Foto / Text</button><button type="button" id="contentSourceManual" class="ghost compact-action">Manuell</button></div></div><label>Kind<select id="contentLearner">${learners.map(l=>`<option value="${esc(l.id)}" ${l.id===defaultLearner.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label><label>Lehrwerk<select id="contentBook">${books.map(b=>`<option value="${esc(b.id)}" ${b.id===defaultBook?.id?'selected':''}>${esc(b.title||formatIsbn(b.isbn13))}${b.builtinSource?' · geprüft':''}</option>`).join('')}</select></label><label>Kapitel / Abschnitt<select id="contentSection"></select></label><div class="row spread align-center wrap content-picker-head"><strong id="contentSelectionCount">0 ausgewählt</strong><div class="row gap"><button type="button" id="contentSelectAll" class="ghost compact-action">Alle</button><button type="button" id="contentSelectNone" class="ghost compact-action">Keine</button></div></div><div class="vocab-range-picker"><span>Bereich</span><label>Von<input id="contentRangeFrom" type="number" inputmode="numeric" min="1" value="1"></label><label>Bis<input id="contentRangeTo" type="number" inputmode="numeric" min="1"></label><button type="button" id="contentSelectRange" class="secondary compact-action">Nur Bereich</button></div><div id="contentWordPicker" class="vocab-picker"></div><div id="contentPlanPreview" class="notice subtle"></div><div class="modal-actions wrap"><button type="button" id="contentManageLibrary" class="ghost">Bibliothek verwalten</button><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="contentSave" class="primary">Ohne Test vorbereiten</button></div>`);
  const learnerEl=$('#contentLearner'),bookEl=$('#contentBook'),sectionEl=$('#contentSection'),picker=$('#contentWordPicker'),counter=$('#contentSelectionCount'),preview=$('#contentPlanPreview'),rangeFrom=$('#contentRangeFrom'),rangeTo=$('#contentRangeTo');
  let rows=[];
  const checkedRows=()=>rows.filter(r=>picker.querySelector(`[data-book-row="${CSS.escape(r.id)}"]`)?.checked);
  const updateSummary=()=>{const selected=checkedRows();counter.textContent=`${selected.length} von ${rows.length} ausgewählt`;preview.textContent=contentPlanPreviewText(selected,learnerEl.value)};
  const renderRows=()=>{
    const group=knownBookSections(bookEl.value).find(g=>g.section===sectionEl.value);rows=group?.items||[];
    const existing=new Set(selectedRowsForCurrentPlan(learnerEl.value,bookEl.value,sectionEl.value));const useExisting=existing.size>0;
    picker.innerHTML=rows.map((r,i)=>{const d=bookRowDisplay(r),checked=useExisting?existing.has(r.id):true;return `<label class="vocab-picker-row"><input type="checkbox" data-book-row="${esc(r.id)}" ${checked?'checked':''}><span class="vocab-picker-num">${i+1}</span><span><strong>${esc(d.term)}</strong><small>${esc(d.translation)}</small></span></label>`}).join('');
    syncVocabularyRangeInputs(rangeFrom,rangeTo,rows.length);
    picker.querySelectorAll('[data-book-row]').forEach(x=>x.onchange=updateSummary);updateSummary();
  };
  const updateSections=()=>{const groups=knownBookSections(bookEl.value);sectionEl.innerHTML=groups.map(g=>`<option value="${esc(g.section)}">${esc(g.section)} · ${g.items.length}</option>`).join('');if(opts.section&&groups.some(g=>g.section===opts.section))sectionEl.value=opts.section;renderRows()};
  bookEl.onchange=updateSections;sectionEl.onchange=renderRows;learnerEl.onchange=renderRows;
  $('#contentSelectAll').onclick=()=>{picker.querySelectorAll('[data-book-row]').forEach(x=>x.checked=true);updateSummary()};
  $('#contentSelectNone').onclick=()=>{picker.querySelectorAll('[data-book-row]').forEach(x=>x.checked=false);updateSummary()};
  $('#contentSelectRange').onclick=()=>applyVocabularyPickerRange(picker,'[data-book-row]',rangeFrom,rangeTo,updateSummary);
  $('#contentSourcePhoto').onclick=()=>{state.activeLearnerId=learnerEl.value;ensureActiveSubject();closeModal();save();setTimeout(()=>openScanImport('__new__'),60)};
  $('#contentSourceManual').onclick=()=>{state.activeLearnerId=learnerEl.value;ensureActiveSubject();closeModal();save();setTimeout(()=>openSetEditor(null,'manual'),60)};
  $('#contentManageLibrary').onclick=()=>{showView('libraryView');closeModal();renderLibrary()};
  $('#contentSave').onclick=()=>{const selected=checkedRows();if(!selected.length){preview.className='notice warn';preview.textContent='Bitte mindestens eine Vokabel auswählen.';return}const result=assignBookRowsToLearner(bookEl.value,sectionEl.value,learnerEl.value,selected.map(r=>r.id));if(!result.set)return;closeModal();save();const l=state.learners.find(x=>x.id===learnerEl.value);toast(`${selected.length} Vokabeln für ${l?.name||'das Profil'} ohne Testtermin vorbereitet.`,'good')};
  updateSections();
}
function openLibraryAssignDialog(){openLearningContentPlanner()}

function topError(w){const entries=Object.entries(w.errorProfile||{}).sort((a,b)=>b[1]-a[1]);return entries[0]?.[1]?({meaning:'Bedeutung',retrieval:'Abruf',spelling:'Schreibung',listening:'Hören',context:'Kontext',grammar:'Latein-Formen'}[entries[0][0]]):'–'}
function renderProfiles(){
  const meta=l=>{const active=learnerActiveSubjects(l).map(subjectShort).join(' · '),parts=[],support=literacySupportFor(l);if(l.gradeLevel)parts.push(`Klasse ${l.gradeLevel}`);parts.push(`Avatar ${l.avatarStyle==='female'?'weiblich':'männlich'}`);if(support.reading&&support.spelling)parts.push('LRS Lesen + Schreiben');else if(support.reading)parts.push('LRS Lesen');else if(support.spelling)parts.push('LRS Schreiben');if(support.reducedLoad)parts.push('kurze Einheiten');if(active)parts.push(active);parts.push(`${l.xp} XP`);return parts.join(' · ')};
  const books=l=>learnerActiveSubjects(l).map(subject=>{const b=currentBook(l.id,subject);return `<span class="profile-book-chip">${subjectShort(subject)} · ${b?esc(b.title||formatIsbn(b.isbn13)):'kein Lehrwerk'}</span>`}).join('');
  $('#profileList').innerHTML=state.learners.map(l=>`<div class="profile-row profile-row-rich"><div class="profile-main"><strong>${esc(l.name)}</strong><small class="profile-meta">${esc(meta(l))}</small><div class="profile-books">${books(l)}</div></div><div class="profile-actions"><button class="ghost" data-profile-use="${l.id}">${l.id===state.activeLearnerId?'Aktiv':'Wählen'}</button><button class="ghost" data-profile-edit="${l.id}">Bearbeiten</button><button class="ghost" data-profile-books="${l.id}">Lehrwerke</button><button class="ghost" data-profile-clear="${l.id}">Lernstoff löschen</button>${state.learners.length>1?`<button class="ghost" data-profile-del="${l.id}" aria-label="Profil ${esc(l.name)} löschen" title="Profil löschen">×</button>`:''}</div></div>`).join('');
  $$('[data-profile-use]').forEach(b=>b.onclick=()=>{state.activeLearnerId=b.dataset.profileUse;ensureActiveSubject();save()});
  $$('[data-profile-edit]').forEach(b=>b.onclick=()=>openProfileEditor(b.dataset.profileEdit));
  $$('[data-profile-books]').forEach(b=>b.onclick=()=>openBookManager(b.dataset.profileBooks));
  $$('[data-profile-clear]').forEach(b=>b.onclick=()=>{const id=b.dataset.profileClear,l=state.learners.find(x=>x.id===id);if(!l)return;if(!confirm(`Lernstoff und Lernstände von „${l.name}“ löschen? Profil, Einstellungen, manuell eingetragene Schulnoten und die globale Bibliothek bleiben erhalten.`))return;const removed=clearLearnerLearningData(id);if(id===state.activeLearnerId)session=null;save();toast(`${l.name}: ${removed.sets} Lernbereich${removed.sets===1?'':'e'} und persönliche Lernstände gelöscht.`,'good')});
  $$('[data-profile-del]').forEach(b=>b.onclick=()=>deleteProfile(b.dataset.profileDel));
}
function esc(s){return String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function attackFortress(){openBattleView()}
function duelPayload(){const p=subjectProgress();return {v:3,name:subjectCampaign(state.activeSubject).unitLabel,subject:state.activeSubject,schoolYear:p.schoolYear,progress:p.pct,stability:p.total?Math.round(p.stable/p.total*1000):0,ts:Date.now()}}
function encodeDuel(obj){return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))}
function duelInviteLink(code){
  const url=new URL(location.href);url.hash='';
  const params=new URLSearchParams();params.set('duel',String(code||''));url.hash=params.toString();
  return url.toString();
}
function duelCodeFromInput(value){
  const raw=String(value||'').trim();if(!raw)return '';
  try{
    const url=new URL(raw,location.href),params=new URLSearchParams(String(url.hash||'').replace(/^#/,''));
    const fromLink=String(params.get('duel')||'').trim();if(fromLink)return fromLink;
  }catch(_e){}
  return raw;
}
function decodeDuel(code){const raw=duelCodeFromInput(code);if(!raw||raw.length>4096)throw new Error('Ungültiger Code');const x=JSON.parse(decodeURIComponent(escape(atob(raw))));if(!x||typeof x!=='object'||!isKnownSubject(x.subject)||typeof x.schoolYear!=='string')throw new Error('Ungültiger Code');const total=Math.max(0,Math.round(safeNumber(x.total,0,100000,0))),stable=Math.max(0,Math.round(safeNumber(x.stable,0,100000,0))),legacyStability=total?Math.round(stable/total*1000):0;return {v:3,name:subjectCampaign(x.subject).unitLabel,subject:x.subject,schoolYear:safeText(x.schoolYear,24),progress:safeNumber(x.progress,0,100,0),stability:Number.isFinite(Number(x.stability))?safeNumber(x.stability,0,1000,0):legacyStability,ts:safeNumber(x.ts,0,Number.MAX_SAFE_INTEGER,0)};}
function openDuel(initialOpponent=''){
  const own=duelPayload(),code=encodeDuel(own),link=duelInviteLink(code);
  modal(`<div class="eyebrow">Freundschaftsduell</div><h2>Armeen vergleichen</h2><p>Zeige deinem Gegenüber den QR-Code. Alternativ kann der Link oder der Herausforderungscode geteilt werden.</p><div class="duel-qr-panel"><div id="duelQr" class="pairing-qr"></div><div><strong>QR-Code scannen</strong><small>Der höhere fachliche Fortschritt gewinnt; bei Gleichstand zählt die Langzeitstabilität.</small><div class="row gap wrap top-space"><button type="button" id="duelShareBtn" class="secondary">Duell-Link teilen</button><button type="button" id="duelCopyBtn" class="ghost">Link kopieren</button></div></div></div><p class="notice subtle">Freundschaftsmodus ohne Server: QR-Code und Link enthalten keinen Profilnamen, sondern nur Fach, Schuljahr und die nötigen Vergleichswerte. Sie sind nicht fälschungssicher.</p><details class="duel-code-fallback"><summary>Code manuell anzeigen</summary><div class="duel-code">${esc(code)}</div></details><label>Code oder Link des Gegenübers<textarea id="opponentCode" rows="4" placeholder="Code oder Duell-Link einfügen">${esc(initialOpponent)}</textarea></label><div id="duelResult"></div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button><button type="button" id="duelCompare" class="primary">Duell starten</button></div>`);
  window.VTQr?.render?.('#duelQr',link,'QR-Code für das Freundschaftsduell');
  $('#duelShareBtn').onclick=()=>window.VTQr?.shareUrl?.(link,'Vokabeltrainer Freundschaftsduell','Herausforderung zum Freundschaftsduell');
  $('#duelCopyBtn').onclick=()=>window.VTQr?.copyText?.(link,'Duell-Link kopiert.');
  const compare=()=>{try{const other=decodeDuel($('#opponentCode').value);if(other.subject!==state.activeSubject)throw new Error('Fach passt nicht');const result=compareDuel(own,other);$('#duelResult').innerHTML=`<div class="duel-arena duel-${result.outcome}" aria-label="Animiertes Freundschaftsduell"><div class="duel-side duel-own"><div class="duel-banner"></div><div class="duel-troops"><i></i><i></i><i></i></div><strong>${esc(own.name)}</strong><span>${own.progress}%</span></div><div class="duel-clash">⚔</div><div class="duel-side duel-other"><div class="duel-banner"></div><div class="duel-troops"><i></i><i></i><i></i></div><strong>${esc(other.name||'Gegner')}</strong><span>${other.progress}%</span></div></div><div class="notice ${result.outcome==='win'?'good':result.outcome==='loss'?'warn':'subtle'}"><strong>${esc(result.title)}</strong><br><small>${esc(result.reason)}</small></div>`;recordActivity('duel',{result:result.outcome,opponent:other.name||'Gegner'});persistOnly()}catch(e){$('#duelResult').innerHTML='<div class="notice bad">Der Herausforderungscode ist ungültig oder gehört zu einem anderen Fach.</div>'}};
  $('#duelCompare').onclick=compare;
  if(initialOpponent)setTimeout(compare,0);
}
window.handleDuelInviteFromUrl=function(){
  const params=new URLSearchParams(String(location.hash||'').replace(/^#/,''));
  const code=String(params.get('duel')||'').trim();if(!code)return false;
  params.delete('duel');history.replaceState(null,'',location.pathname+location.search+(params.toString()?'#'+params.toString():''));
  openDuel(code);return true;
};
function compareDuel(a,b){
  if(a.schoolYear!==b.schoolYear)return {outcome:'draw',title:'Nicht vergleichbar',reason:'Die Codes gehören zu unterschiedlichen Schuljahren.'};
  if(a.progress!==b.progress)return a.progress>b.progress?{outcome:'win',title:'Sieg',reason:'Mehr Schuljahresfortschritt.'}:{outcome:'loss',title:'Niederlage',reason:'Der Gegner hat mehr Schuljahresfortschritt.'};
  const as=Number.isFinite(a.stability)?a.stability:(a.total?Math.round((a.stable||0)/a.total*1000):0),bs=Number.isFinite(b.stability)?b.stability:(b.total?Math.round((b.stable||0)/b.total*1000):0);
  if(as!==bs)return as>bs?{outcome:'win',title:'Sieg',reason:'Höherer Anteil langzeitstabiler Wörter.'}:{outcome:'loss',title:'Niederlage',reason:'Der Gegner hat einen höheren Anteil langzeitstabiler Wörter.'};
  return {outcome:'draw',title:'Unentschieden',reason:'Beide fachlichen Lernstände sind gleich.'};
}

function checkHundredPercent(){
  const p=subjectProgress(),key=`hundred_${state.activeSubject}_${p.schoolYear}`; if(p.total && p.pct===100 && !learner().milestones[key]){learner().milestones[key]=new Date().toISOString();persistOnly();setTimeout(()=>modal(`<div class="celebration"><div class="celebration-icon">🏛️</div><div class="eyebrow">100 % Schuljahr</div><h2>Die Jahresfestung ist bereit.</h2><p>Alle ${p.total} Vokabeln des Schuljahres ${esc(p.schoolYear)} sind nachhaltig gemeistert.</p><div class="modal-actions center-actions"><button value="ok" class="primary">Weiter</button></div></div>`),300)}
}

function editableTestSetsForLearner(l,subject=state.activeSubject){
  if(!l)return [];
  return (state.sets||[]).filter(s=>s.learnerId===l.id&&s.subject===subject&&!setNeedsPairReview(s)&&s.testDate&&!isTestCompletedForLearner(l,s.testDate,subject)&&setWords(s.id).length);
}
function editableTestSetForLearner(l,subject=state.activeSubject,preferredSetId=''){
  const sets=editableTestSetsForLearner(l,subject),preferred=preferredSetId?sets.find(s=>s.id===preferredSetId):null;if(preferred)return preferred;
  const overdue=sets.filter(s=>daysUntil(s.testDate)<=0).sort((a,b)=>b.testDate.localeCompare(a.testDate)),future=sets.filter(s=>daysUntil(s.testDate)>0).sort((a,b)=>a.testDate.localeCompare(b.testDate));
  return overdue[0]||future[0]||null;
}
function explicitTestContextForSets(date,sets,subject=state.activeSubject){
  const active=(sets||[]).filter(Boolean),words=uniqueWords(active.flatMap(set=>scopedWordsForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds)));
  return {date,days:daysUntil(date),sets:active,words,source:'single',testFormat:active[0]?.testFormat||'target',scopeText:active.map(set=>scopeTextForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds)).join(' + ')};
}
function openTestDatePlanner(preferredSetId=''){
  if(!isParentMode()){openParentGate();return}
  const subject=state.activeSubject,learners=(state.learners||[]).filter(l=>learnerActiveSubjects(l).includes(subject)),books=globalLibraryBooks(subject);
  if(!learners.length){toast('Für dieses Fach ist noch kein Lernprofil aktiv.','warn');return}
  const activeL=learners.find(l=>l.id===state.activeLearnerId)||learners[0];
  let requestedSetId=typeof preferredSetId==='string'?preferredSetId:'';
  if(!requestedSetId){const live=upcomingTestContext(subject);if(live?.days<=0)requestedSetId=live.sets?.[0]?.id||''}
  const requestedSet=requestedSetId?editableTestSetsForLearner(activeL,subject).find(s=>s.id===requestedSetId)||null:null;
  const activeFuture=(state.sets||[]).filter(s=>s.learnerId===activeL.id&&s.subject===subject&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate))[0];
  const activePlan=requestedSet||activeFuture;
  const defaultBook=(activePlan?.bookId&&bookById(activePlan.bookId))||currentBook(activeL.id,subject)||books[0]||null;
  const defaultDate=activePlan?.testDate||datePlusDays(7),seriesCfg=activeL.testSeries?.[subject],defaultMode=seriesCfg?.enabled?'weekly':'single';
  modal(`<div class="eyebrow">Lernplan</div><h2>${requestedSet?'Vokabeltest bearbeiten':'Vokabeltest planen'}</h2><p class="notice subtle">${requestedSet?'Datum und Testumfang können geändert werden. Bereits erzielter Lernfortschritt der Vokabeln bleibt erhalten.':'Sobald ein Testtermin bekannt ist, ist dies der normale Weg: Termin und Vokabeln auswählen. Die App übernimmt diese Wörter automatisch als Lernstoff und berechnet daraus das tägliche Pensum.'}</p><label>Kind<select id="planLearner">${learners.map(l=>`<option value="${esc(l.id)}" ${l.id===activeL.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label><label>Terminart<select id="testPlanMode"><option value="single" ${defaultMode==='single'?'selected':''}>Einmaliger Test</option><option value="weekly" ${defaultMode==='weekly'?'selected':''}>Wöchentlich</option></select></label><div id="singleWhen"><label>Testdatum<input id="testPlanDate" type="date" value="${esc(defaultDate)}"></label></div><div id="weeklyWhen" class="hidden"><label>Wöchentlicher Testtag<select id="weeklyTestDay">${WEEKDAYS.map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select></label></div><hr><h3>Vokabeln hinzufügen</h3><p class="muted-line">Wähle zuerst die Quelle. Vorhandene Vokabeln kannst du direkt aus der Bibliothek auswählen; neue Wörter lassen sich manuell oder per Foto/OCR erfassen.</p><div class="add-vocab-grid test-source-grid"><button type="button" id="planSourceLibrary" class="add-vocab-option is-active"><span>▤</span><strong>Bibliothek</strong><small>Vorhandene Vokabeln auswählen</small></button><button type="button" id="planSourceManual" class="add-vocab-option"><span>＋</span><strong>Manuell</strong><small>Neue Vokabeln eingeben</small></button><button type="button" id="planSourceOcr" class="add-vocab-option"><span>📷</span><strong>Foto / OCR</strong><small>Vokabelseite fotografieren</small></button></div><div id="planLibrarySource"><h3>Bibliothek auswählen</h3><label>Lehrwerk<select id="planBook">${books.map(b=>`<option value="${esc(b.id)}" ${b.id===defaultBook?.id?'selected':''}>${esc(b.title||formatIsbn(b.isbn13))}${b.builtinSource?' · geprüft':''}</option>`).join('')}</select></label><label>Kapitel / Abschnitt<select id="planSection"></select></label><div class="row spread align-center wrap content-picker-head"><strong id="planSelectionCount">0 ausgewählt</strong><div class="row gap"><button type="button" id="planSelectAll" class="ghost compact-action">Alle</button><button type="button" id="planSelectNone" class="ghost compact-action">Keine</button></div></div><div class="vocab-range-picker"><span>Bereich</span><label>Von<input id="planRangeFrom" type="number" inputmode="numeric" min="1" value="1"></label><label>Bis<input id="planRangeTo" type="number" inputmode="numeric" min="1"></label><button type="button" id="planSelectRange" class="secondary compact-action">Nur Bereich</button></div><div id="planWordPicker" class="vocab-picker"></div></div><label>Abfrageformat<select id="planTestFormat"><option value="target">Deutsch → Fremdsprache</option><option value="source">Fremdsprache → Deutsch</option><option value="mixed">Gemischt</option><option value="dictation">Diktat / Hören → Schreiben</option></select></label><div id="planDailyPreview" class="notice subtle"></div><div class="modal-actions wrap"><button type="button" id="planOpenContent" class="ghost">Vokabeln neu erfassen</button><button type="button" id="clearTestPlan" class="ghost">Plan löschen</button><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="saveTestPlan" class="primary">Plan speichern</button></div>`);
  const learnerEl=$('#planLearner'),mode=$('#testPlanMode'),date=$('#testPlanDate'),weekday=$('#weeklyTestDay'),bookEl=$('#planBook'),sectionEl=$('#planSection'),picker=$('#planWordPicker'),format=$('#planTestFormat'),counter=$('#planSelectionCount'),preview=$('#planDailyPreview'),rangeFrom=$('#planRangeFrom'),rangeTo=$('#planRangeTo');
  let rows=[];
  const targetLearner=()=>state.learners.find(l=>l.id===learnerEl.value)||activeL;
  const targetFuture=()=>{const l=targetLearner(),preferred=requestedSetId&&l.id===activeL.id?editableTestSetsForLearner(l,subject).find(s=>s.id===requestedSetId)||null:null;if(preferred)return preferred;return (state.sets||[]).filter(s=>s.learnerId===l.id&&s.subject===subject&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate))[0]||null};
  const selectedRows=()=>rows.filter(r=>picker.querySelector(`[data-plan-row="${CSS.escape(r.id)}"]`)?.checked);
  const plannedDate=()=>mode.value==='weekly'?nextWeeklyDate(Number(weekday.value)):date.value;
  const matchingSet=()=>{const l=targetLearner();if(mode.value==='single'){const preferred=targetFuture();if(preferred&&preferred.bookId===bookEl.value&&preferred.bookSection===sectionEl.value)return preferred}return (state.sets||[]).find(s=>s.learnerId===l.id&&s.subject===subject&&s.bookId===bookEl.value&&s.bookSection===sectionEl.value&&((mode.value==='single'&&s.testDate===date.value)||(mode.value==='weekly'&&l.testSeries?.[subject]?.setId===s.id)))||null};
  const selectedRowIdsFromSet=set=>{
    if(!set)return [];
    const l=targetLearner(),cfg=l.testSeries?.[subject],selected=new Set(mode.value==='weekly'&&cfg?.setId===set.id&&cfg.scopeMode==='selected'?(cfg.selectedLinkIds||[]):set.testScopeMode==='selected'?(set.testSelectedLinkIds||[]):[]);
    if(!selected.size)return [];
    const links=(state.setVocabulary||[]).filter(x=>x.setId===set.id&&selected.has(x.id));
    return rows.filter(r=>links.some(link=>link.vocabId===r.vocabId&&link.senseId===r.senseId)).map(r=>r.id);
  };
  const updatePreview=()=>{
    const selected=selectedRows(),when=plannedDate();counter.textContent=`${selected.length} von ${rows.length} ausgewählt`;preview.className='notice subtle';preview.textContent=contentPlanPreviewText(selected,learnerEl.value,when);
    const pace=contentPlanPreviewData(selected,learnerEl.value,when).pace;if(pace.overload||pace.spacingRisk)preview.className='notice warn';
  };
  const renderRows=()=>{
    const group=knownBookSections(bookEl.value).find(g=>g.section===sectionEl.value);rows=group?.items||[];const existing=new Set(selectedRowIdsFromSet(matchingSet())),useExisting=existing.size>0;
    picker.innerHTML=rows.map((r,i)=>{const d=bookRowDisplay(r),checked=useExisting?existing.has(r.id):true;return `<label class="vocab-picker-row"><input type="checkbox" data-plan-row="${esc(r.id)}" ${checked?'checked':''}><span class="vocab-picker-num">${i+1}</span><span><strong>${esc(d.term)}</strong><small>${esc(d.translation)}</small></span></label>`}).join('');
    syncVocabularyRangeInputs(rangeFrom,rangeTo,rows.length);
    picker.querySelectorAll('[data-plan-row]').forEach(x=>x.onchange=updatePreview);updatePreview();
  };
  const updateSections=()=>{const groups=knownBookSections(bookEl.value),existing=matchingSet();sectionEl.innerHTML=groups.map(g=>`<option value="${esc(g.section)}">${esc(g.section)} · ${g.items.length} Vokabeln</option>`).join('');const preferred=existing?.bookSection||targetFuture()?.bookSection;if(preferred&&groups.some(g=>g.section===preferred))sectionEl.value=preferred;renderRows()};
  const loadLearnerDefaults=()=>{
    const l=targetLearner(),future=(state.sets||[]).filter(s=>s.learnerId===l.id&&s.subject===subject&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate))[0],cfg=l.testSeries?.[subject];
    const preferred=requestedSetId&&l.id===activeL.id?editableTestSetsForLearner(l,subject).find(s=>s.id===requestedSetId)||null:null,target=preferred||future;mode.value=cfg?.enabled?'weekly':'single';date.value=target?.testDate||datePlusDays(7);weekday.value=String(Number(cfg?.weekday??new Date().getDay()));const b=(target?.bookId&&bookById(target.bookId))||currentBook(l.id,subject)||books[0];if(b)bookEl.value=b.id;format.value=cfg?.enabled?(cfg.testFormat||'target'):(target?.testFormat||'target');syncMode();updateSections();
  };
  const syncMode=()=>{$('#singleWhen').classList.toggle('hidden',mode.value!=='single');$('#weeklyWhen').classList.toggle('hidden',mode.value!=='weekly');updatePreview()};
  const prepareCaptureSet=source=>{
    const l=targetLearner(),when=plannedDate();if(mode.value==='single'&&!date.value){preview.className='notice warn';preview.textContent='Bitte zuerst ein Testdatum wählen.';return null}
    state.activeLearnerId=l.id;ensureActiveSubject();
    const title='Test '+when,book=bookById(bookEl.value)||currentBook(l.id,subject);
    const set={id:uid('set'),learnerId:l.id,subject,title,schoolYear:currentSchoolYear(),bookId:book?.id||'',bookSection:'',testDate:'',testScopeMode:'set',testSelectedLinkIds:[],testFrom:1,testTo:0,testFormat:format.value,from:'',to:'',captureSource:source,pairReviewRequired:true,pairVerifiedAt:'',pairVerifiedSignature:'',pendingTestPlan:{mode:mode.value,testDate:when,weekday:Number(weekday.value)||0,testFormat:format.value,createdAt:new Date().toISOString()}};
    state.sets.push(set);save();return set;
  };
  $('#planSourceLibrary').onclick=()=>$('#planLibrarySource').scrollIntoView({block:'nearest'});
  $('#planSourceManual').onclick=()=>{const set=prepareCaptureSet('manual');if(!set)return;closeModal();setTimeout(()=>openWordEditor(null,set.id),60)};
  $('#planSourceOcr').onclick=()=>{const set=prepareCaptureSet('ocr');if(!set)return;closeModal();setTimeout(()=>openScanImport(set.id),60)};
  $('#planSelectAll').onclick=()=>{picker.querySelectorAll('[data-plan-row]').forEach(x=>x.checked=true);updatePreview()};
  $('#planSelectNone').onclick=()=>{picker.querySelectorAll('[data-plan-row]').forEach(x=>x.checked=false);updatePreview()};
  $('#planSelectRange').onclick=()=>applyVocabularyPickerRange(picker,'[data-plan-row]',rangeFrom,rangeTo,updatePreview);
  learnerEl.onchange=loadLearnerDefaults;mode.onchange=()=>{syncMode();renderRows()};date.onchange=()=>{if(matchingSet())renderRows();else updatePreview()};weekday.onchange=updatePreview;bookEl.onchange=updateSections;sectionEl.onchange=renderRows;format.onchange=updatePreview;
  $('#planOpenContent').onclick=()=>{const l=learnerEl.value,b=bookEl.value,sec=sectionEl.value;closeModal();openLearningContentPlanner({learnerId:l,bookId:b,section:sec})};
  $('#saveTestPlan').onclick=()=>{
    const selected=selectedRows();if(!selected.length){preview.className='notice warn';preview.textContent='Bitte mindestens eine Vokabel für den Test auswählen.';return}
    const l=targetLearner(),when=plannedDate();if(mode.value==='single'&&!date.value){preview.className='notice warn';preview.textContent='Bitte ein Testdatum wählen.';return}
    const editSet=mode.value==='single'&&requestedSetId&&l.id===activeL.id?(state.sets||[]).find(s=>s.id===requestedSetId&&s.learnerId===l.id&&s.subject===subject)||null:null;
    const oldDate=editSet?.testDate||'',oldTestSets=oldDate?editableTestSetsForLearner(l,subject).filter(s=>s.testDate===oldDate):[],oldSetIds=oldTestSets.map(s=>s.id);
    const sameSource=!!(editSet&&editSet.bookId===bookEl.value&&editSet.bookSection===sectionEl.value);
    const assignOpts=mode.value==='single'?(sameSource?{setId:editSet.id}:{testDate:date.value,forceNewSet:true}):{};
    const result=assignBookRowsToLearner(bookEl.value,sectionEl.value,l.id,selected.map(r=>r.id),assignOpts);if(!result.set)return;
    if(mode.value==='weekly'){
      l.testSeries={...defaultTestSeries(),...(l.testSeries||{})};l.testSeries[subject]={enabled:true,weekday:Number(weekday.value),scopeMode:'selected',setId:result.set.id,from:1,to:result.linkIds.length,selectedLinkIds:result.linkIds,scopeDate:when,testFormat:format.value,updatedAt:new Date().toISOString()};
    }else{
      if(editSet&&oldDate&&oldDate!==date.value)for(const set of oldTestSets)set.testDate=date.value;
      if(editSet&&editSet.id!==result.set.id){editSet.testDate='';editSet.testScopeMode='set';editSet.testSelectedLinkIds=[]}
      result.set.testDate=date.value;result.set.testScopeMode='selected';result.set.testSelectedLinkIds=result.linkIds;result.set.testFrom=1;result.set.testTo=result.linkIds.length;result.set.testFormat=format.value;
      if(editSet&&oldDate){
        const currentSets=editableTestSetsForLearner(l,subject).filter(s=>s.testDate===date.value),newCtx=explicitTestContextForSets(date.value,currentSets,subject);
        retargetTestFortress(l,subject,oldDate,oldSetIds,newCtx);
      }
    }
    l.dailyPlans={};closeModal();save();toast(`${editSet?'Test aktualisiert':'Testplan gespeichert'} · ${selected.length} Vokabeln für ${l.name}.`,'good');
  };
  $('#clearTestPlan').onclick=()=>{const l=targetLearner();if(mode.value==='weekly'){l.testSeries={...defaultTestSeries(),...(l.testSeries||{})};l.testSeries[subject]=null}else for(const set of (state.sets||[]).filter(s=>s.learnerId===l.id&&s.subject===subject&&s.testDate===date.value)){set.testDate='';set.testScopeMode='set';set.testSelectedLinkIds=[]}l.dailyPlans={};closeModal();save();toast('Testplan für diesen Termin entfernt.','subtle')};
  weekday.value=String(Number(seriesCfg?.weekday??new Date().getDay()));format.value=activePlan?.testFormat||seriesCfg?.testFormat||'target';syncMode();updateSections();
}

function openFirstWordsChooser(){
  const sets=mySets(); if(!sets.length){openLearningContentPlanner();return}
  modal(`<div class="eyebrow">Lernstoff</div><h2>Vokabeln erfassen</h2><p>Wie möchtest du die Wörter ergänzen?</p><div class="setup-choice-grid"><button type="button" id="setupScan" class="primary">Foto / Text</button><button type="button" id="setupManual" class="secondary">Manuell</button><button type="button" id="setupCsv" class="ghost">CSV</button></div><div class="modal-actions"><button value="cancel" class="ghost">Später</button></div>`);
  $('#setupScan').onclick=()=>{closeModal();openScanImport()};
  $('#setupManual').onclick=()=>{closeModal();openWordEditor()};
  $('#setupCsv').onclick=()=>{closeModal();const f=$('#fileInput');f.accept='.csv,text/csv';f.dataset.mode='csv';f.click()};
}

function openSetEditor(id=null,nextAction='chooser'){
  const s=id?state.sets.find(x=>x.id===id):null,books=(state.books||[]).filter(b=>b.subject===state.activeSubject),assigned=currentBook(learner().id,state.activeSubject),defaultBookId=s?.bookId||assigned?.id||'';
  modal(`<div class="eyebrow">Lernstoff · Details</div><h2>${s?'Lernstoff bearbeiten':'Eigener Lernbereich'}</h2><label>Titel<input id="setTitle" value="${esc(s?.title||'')}"></label><label>Schuljahr<input id="setYear" value="${esc(s?.schoolYear||currentSchoolYear())}"></label><label>Lehrwerk<select id="setBook"><option value="">Ohne Lehrwerk / Arbeitsblatt</option>${books.map(b=>`<option value="${b.id}" ${defaultBookId===b.id?'selected':''}>${esc(b.title||formatIsbn(b.isbn13))}${b.builtinSource?' · geprüft':''}</option>`).join('')}</select></label><label id="setSectionWrap">Abschnitt / Unit<input id="setSection" value="${esc(s?.bookSection||s?.title||'')}" placeholder="z. B. Unit 1 · Theme 2"></label><p class="test-plan-hint">Hier werden nur die Inhaltsdetails verwaltet. Testdatum und Testvokabeln werden ausschließlich über „Test planen“ festgelegt.</p><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button>${s?'<button type="button" id="deleteSet" class="ghost">Löschen</button>':''}<button type="button" id="saveSet" class="primary">Speichern</button></div>`);
  const syncSection=()=>$('#setSectionWrap').classList.toggle('hidden',!$('#setBook').value);$('#setBook').onchange=syncSection;syncSection();
  $('#saveSet').onclick=()=>{const title=$('#setTitle').value.trim();if(!title)return;const bookId=$('#setBook').value,bookSection=bookId?($('#setSection').value.trim()||title):'';let target=s,created=false;if(target){target.title=title;target.schoolYear=$('#setYear').value.trim();target.bookId=bookId;target.bookSection=bookSection}else{target={id:uid('set'),learnerId:learner().id,subject:state.activeSubject,title,schoolYear:$('#setYear').value.trim()||currentSchoolYear(),bookId,bookSection,testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};state.sets.push(target);created=true}if(target.bookId)syncSetToBookVocabulary(target.id);closeModal();save();if(created)setTimeout(()=>nextAction==='manual'?openWordEditor(null,target.id):openFirstWordsChooser(),80)};
  if(s)$('#deleteSet').onclick=()=>{if(confirm('Diesen Lernbereich löschen? Die globale Bibliothek und bereits gelernte Fortschritte bleiben erhalten.')){removeSetWithLinks(s.id);state.learners.forEach(l=>{l.testSeries={...defaultTestSeries(),...(l.testSeries||{})};knownSubjectIds().forEach(sub=>{if(l.testSeries[sub]?.setId===s.id)l.testSeries[sub]=null})});closeModal();save()}}
}
function openWordEditor(id=null,preferredSetId=''){
  const v=id?(state.vocabulary||[]).find(x=>x.id===id):null,sets=mySets();if(!v&&!sets.length){openSetEditor();return}if(v)attachVocabularySenseApi(v);const pairSignatureBefore=v?vocabularyPairSignature(v):'';
  const usage=v?vocabularyUsage(v.id):null;
  const usageHtml=v?(state.setVocabulary||[]).filter(x=>x.vocabId===v.id).map(link=>{const set=state.sets.find(s=>s.id===link.setId),owner=state.learners.find(l=>l.id===set?.learnerId),sense=senseById(v,link.senseId);return set?`<div class="profile-row"><div><strong>${esc(owner?.name||'Profil')}</strong><small class="profile-meta">${esc(set.title)} · ${esc(sense?.translation||'Bedeutung')} · ${esc(set.schoolYear)}</small></div><button type="button" class="ghost" data-unlink-vocab="${link.id}">Entfernen</button></div>`:''}).join(''):'';
  const senseUsage=senseId=>(state.setVocabulary||[]).some(x=>x.senseId===senseId)||(state.bookVocabulary||[]).some(x=>x.senseId===senseId)||(state.learnerVocabulary||[]).some(x=>x.senseId===senseId);
  const senseRow=(sense,index)=>`<fieldset class="sense-editor" data-sense-editor data-sense-id="${esc(sense?.id||'')}"><legend><span class="label-with-help">Bedeutung ${index+1}${helpIcon('sense')}</span></legend><label>Hauptbedeutung<input data-sense-translation value="${esc(sense?.translation||'')}"></label><label>Wortart (optional)<input data-sense-pos value="${esc(sense?.partOfSpeech||'')}" placeholder="z. B. Nomen, Verb, Adjektiv"></label><label><span class="label-with-help">Akzeptierte Synonyme · mit | trennen${helpIcon('synonyms')}</span><input data-sense-aliases value="${esc((sense?.translations||[]).join('|'))}" placeholder="z. B. nett|freundlich"></label><label>Beispielsatz / Phrase<input data-sense-example value="${esc((sense?.examples||[])[0]||'')}"></label>${sense?.id&&!senseUsage(sense.id)?'<button type="button" class="ghost" data-remove-sense>Diese Bedeutung entfernen</button>':''}</fieldset>`;
  const senses=v?(v.senses||[]):[makeVocabularySense('')];
  const preferredSet=(state.sets||[]).find(s=>s.id===preferredSetId),pendingTestCapture=!v&&!!preferredSet?.pendingTestPlan;
  let pendingWordAfterSave='next';
  modal(`<div class="eyebrow">${v?'Vokabelbibliothek':'Vokabel'}</div><div class="row gap align-center"><h2>${v?'Vokabel bearbeiten':'Neu anlegen'}</h2>${helpIcon(v?'library':'sense')}</div>${v?`<div class="notice subtle"><strong>${usage.sets} Lernbereich${usage.sets===1?'':'s'} · ${usage.learners} Profil${usage.learners===1?'':'e'}</strong><br>Das Wort wird einmal global gespeichert. Jede Bedeutung hat einen eigenen Lernstand.</div>`:`<label>Lernbereich<select id="wordSet">${sets.map(set=>`<option value="${set.id}" ${preferredSetId===set.id?'selected':''}>${esc(set.title)}</option>`).join('')}</select></label>`}<label>Vokabel<input id="wordTerm" value="${esc(v?.term||'')}"></label>${v?`<button type="button" class="ghost" data-speak="${esc(v.term)}" aria-label="Vokabel anhören">🔊 Anhören</button>`:''}${v?`<label>Schreib-/Formvarianten · mit | trennen<input id="wordVariants" value="${esc((v.termVariants||[]).join('|'))}"></label><div class="row spread align-center"><div class="row gap align-center"><h3>Bedeutungen</h3>${helpIcon('sense')}</div><button type="button" id="addSenseBtn" class="ghost">+ Bedeutung</button></div><div id="wordSenseList">${senses.map(senseRow).join('')}</div>`:`<label>Deutsche Bedeutung<input id="wordTrans" value=""></label><label>Wortart (optional)<input id="wordSensePos" placeholder="z. B. Nomen, Verb, Adjektiv"></label><label><span class="label-with-help">Akzeptierte Synonyme · mit | trennen${helpIcon('synonyms')}</span><input id="wordAliases" placeholder="optional"></label><label>Beispielsatz / Phrase<input id="wordExample" value=""></label>`}<label>${subjectHasCapability(state.activeSubject,'latinGrammar')?'Latein: Genitiv + Genus / Stammformen':'Zusatzform (optional)'}<input id="wordExtra" value="${esc(v?.extra||'')}"></label><label>Eselsbrücke / Wortkniff<input id="wordMnemonic" value="${esc(v?.mnemonic||'')}"></label><label>Wortbausteine, mit | trennen<input id="wordChunks" value="${esc((v?.chunks||[]).join('|'))}"></label>${v&&usageHtml?`<h3>Verwendung</h3><div class="global-usage-list">${usageHtml}</div>`:''}<div id="wordEditorError" class="notice subtle">${pendingTestCapture?'Testvorbereitung: Speichere beliebig viele Wörter. Der Test wird erst nach der gemeinsamen Paarprüfung aktiv.':'Synonyme innerhalb einer Bedeutung werden gemeinsam akzeptiert; unterschiedliche Bedeutungen werden getrennt gelernt.'}</div><div class="modal-actions wrap"><button value="cancel" class="ghost">${pendingTestCapture?'Später weiter':'Abbrechen'}</button>${v?'<button type="button" id="deleteWord" class="ghost">Global löschen</button>':''}${pendingTestCapture?'<button type="button" id="finishTestCaptureBtn" class="secondary">Fertig · Paare prüfen</button>':''}<button type="button" id="saveWord" class="primary">${pendingTestCapture?'Speichern & weiteres Wort':'Speichern'}</button></div>`);
  if(pendingTestCapture&&$('#wordSet'))$('#wordSet').disabled=true;
  $$('[data-unlink-vocab]').forEach(b=>b.onclick=()=>{if(!confirm('Diese Bedeutung nur aus diesem Lernbereich entfernen? Der globale Bibliothekseintrag und Lernstand bleiben erhalten.'))return;removeSetVocabularyLink(b.dataset.unlinkVocab);closeModal();save()});
  const bindSenseRemove=()=>$$('[data-remove-sense]').forEach(b=>b.onclick=()=>b.closest('[data-sense-editor]')?.remove());bindSenseRemove();
  $('#addSenseBtn')?.addEventListener('click',()=>{const wrap=$('#wordSenseList'),index=$$('[data-sense-editor]').length;wrap.insertAdjacentHTML('beforeend',senseRow(null,index));bindSenseRemove()});
  $('#saveWord').onclick=()=>{const term=$('#wordTerm').value.trim();if(!term)return;const extra=$('#wordExtra').value.trim(),mnemonic=$('#wordMnemonic').value.trim(),chunks=$('#wordChunks').value.split('|').map(x=>x.trim()).filter(Boolean),err=$('#wordEditorError');
    if(v){
      const rows=$$('[data-sense-editor]').map(el=>({id:el.dataset.senseId||'',translation:el.querySelector('[data-sense-translation]').value.trim(),partOfSpeech:el.querySelector('[data-sense-pos]').value.trim(),translations:el.querySelector('[data-sense-aliases]').value.split('|').map(x=>x.trim()).filter(Boolean),example:el.querySelector('[data-sense-example]').value.trim()})).filter(x=>x.translation);if(!rows.length){err.className='notice warn';err.textContent='Mindestens eine Bedeutung ist erforderlich.';return}
      const owner=new Map();for(const row of rows){for(const text of [row.translation,...row.translations]){const key=meaningKey(text);if(!key)continue;if(owner.has(key)&&owner.get(key)!==row){err.className='notice warn';err.textContent=`„${text}“ ist mehreren Bedeutungen zugeordnet. Synonyme gehören in dieselbe Bedeutung.`;return}owner.set(key,row)}}
      const removed=(v.senses||[]).filter(s=>!rows.some(r=>r.id===s.id));if(removed.some(sense=>senseUsage(sense.id))){err.className='notice warn';err.textContent='Eine bereits verwendete Bedeutung kann nicht gelöscht werden. Entferne sie zuerst aus den Lernbereichen.';return}
      let target=v;const collision=(state.vocabulary||[]).find(x=>x.id!==v.id&&x.subject===v.subject&&lexicalKey(x.term,x.subject)===lexicalKey(term,v.subject)&&(!subjectHasCapability(v.subject,'extraIdentity')||!extra||!x.extra||lexicalKey(x.extra,v.subject)===lexicalKey(extra,v.subject)));if(collision){if(!confirm('Dieses Wort existiert bereits global. Beide Lexeme und ihre Bedeutungen zusammenführen?'))return;target=mergeVocabularyEntries(collision.id,v.id)||collision}
      target.term=term;target.extra=extra;target.mnemonic=mnemonic;target.chunks=chunks;target.termVariants=[...new Set($('#wordVariants').value.split('|').map(x=>x.trim()).filter(Boolean))].filter(x=>normalize(x)!==normalize(term));
      const next=[];for(const row of rows){let sense=senseById(target,row.id)||senseMatch(target,row.translation);if(!sense)sense=makeVocabularySense(row.translation);sense.translation=row.translation;sense.translations=[...new Set(row.translations)].filter(x=>meaningKey(x)!==meaningKey(row.translation));sense.partOfSpeech=row.partOfSpeech;sense.examples=row.example?[row.example,...(sense.examples||[]).filter(x=>x!==row.example)].slice(0,12):(sense.examples||[]);sense.updatedAt=new Date().toISOString();if(!next.some(x=>x.id===sense.id))next.push(sense)}if(target===v)target.senses=next;else for(const sense of next)if(!target.senses.some(x=>x.id===sense.id))target.senses.push(sense);target.updatedAt=new Date().toISOString();attachVocabularySenseApi(target);if(target!==v||vocabularyPairSignature(target)!==pairSignatureBefore)requirePairReviewForVocabulary(target.id);
    }else{
      const tr=$('#wordTrans').value.trim();if(!tr){err.className='notice warn';err.textContent='Bitte eine Bedeutung eingeben.';return}const aliases=$('#wordAliases').value.split('|').map(x=>x.trim()).filter(Boolean),example=$('#wordExample').value.trim(),partOfSpeech=$('#wordSensePos').value.trim(),targetSetId=$('#wordSet').value,targetSet=(state.sets||[]).find(s=>s.id===targetSetId),pending=!!targetSet?.pendingTestPlan;const result=attachVocabularyToSet(targetSetId,{term,translation:tr,senseAliases:aliases,acceptedTranslations:aliases,partOfSpeech,extra,example,mnemonic,chunks,source:'manual',verified:!pending});if(pending){targetSet.pairReviewRequired=true;targetSet.pairVerifiedAt='';targetSet.pairVerifiedSignature=''}toast(result.alreadyLinked?'Diese Bedeutung war in diesem Lernbereich bereits vorhanden.':result.newVocabulary?'Neue Vokabel global angelegt und dem Lernbereich zugeordnet.':result.newSense?'Neue Bedeutung zur globalen Vokabel angelegt.':'Vorhandene Bedeutung dem Lernbereich zugeordnet.','good');
      rebuildWordIndexes();closeModal();save();if(pending){setTimeout(()=>pendingWordAfterSave==='audit'?openSetPairAudit(targetSetId):openWordEditor(null,targetSetId),60);return}
    }rebuildWordIndexes();closeModal();save()};
  $('#finishTestCaptureBtn')?.addEventListener('click',()=>{
    const targetSetId=$('#wordSet')?.value||preferredSetId,targetSet=(state.sets||[]).find(s=>s.id===targetSetId);if(!targetSet?.pendingTestPlan)return;
    const hasDraftInput=!!($('#wordTerm')?.value.trim()||$('#wordTrans')?.value.trim());
    if(hasDraftInput){pendingWordAfterSave='audit';$('#saveWord').click();return}
    if(!setWords(targetSetId).length){$('#wordEditorError').className='notice warn';$('#wordEditorError').textContent='Bitte zuerst mindestens eine Vokabel erfassen.';return}
    closeModal();setTimeout(()=>openSetPairAudit(targetSetId),60);
  });
  if(v)$('#deleteWord').onclick=()=>{const u=vocabularyUsage(v.id);if(!confirm(`Globale Vokabel wirklich löschen? Alle ${(v.senses||[]).length} Bedeutungen werden aus ${u.sets} Lernbereich${u.sets===1?'':'s'} und für ${u.learners} Profil${u.learners===1?'':'e'} entfernt.`))return;deleteGlobalVocabulary(v.id);closeModal();save()};
}

function openGradeScaleSettings(subject=state.activeSubject){
  const current={...gradeScaleFor(subject)},label=subjectLabel(subject);
  modal(`<div class="eyebrow">Notenvorschlag</div><h2>Notenschlüssel · ${label}</h2><p>Der Schlüssel dient nur zur Orientierung für Übungstests. Trage den Schlüssel der Lehrkraft ein, wenn er bekannt ist.</p><div class="grade-scale-grid"><label>Note 1 ab %<input id="scale1" type="number" min="0" max="100" value="${current.n1}"></label><label>Note 2 ab %<input id="scale2" type="number" min="0" max="100" value="${current.n2}"></label><label>Note 3 ab %<input id="scale3" type="number" min="0" max="100" value="${current.n3}"></label><label>Note 4 ab %<input id="scale4" type="number" min="0" max="100" value="${current.n4}"></label><label>Note 5 ab %<input id="scale5" type="number" min="0" max="100" value="${current.n5}"></label></div><div id="scalePreview" class="notice subtle">${esc(gradeScaleText(current))}</div><div class="modal-actions wrap"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="resetScale" class="ghost">Standard</button><button type="button" id="saveScale" class="primary">Speichern</button></div>`);
  const values=()=>[1,2,3,4,5].map(i=>clamp(Number($(`#scale${i}`).value)||0,0,100));
  const update=()=>{const v=values(),tmp={n1:v[0],n2:v[1],n3:v[2],n4:v[3],n5:v[4]};$('#scalePreview').textContent=gradeScaleText(tmp)};
  [1,2,3,4,5].forEach(i=>$(`#scale${i}`).oninput=update);
  $('#resetScale').onclick=()=>{const d=defaultGradeScale();[1,2,3,4,5].forEach(i=>$(`#scale${i}`).value=d[`n${i}`]);update()};
  $('#saveScale').onclick=()=>{const v=values();if(!(v[0]>=v[1]&&v[1]>=v[2]&&v[2]>=v[3]&&v[3]>=v[4])){$('#scalePreview').className='notice bad';$('#scalePreview').textContent='Die Prozentgrenzen müssen von Note 1 bis 5 absteigend sein.';return}learner().gradeScales=learner().gradeScales||defaultGradeScales();learner().gradeScales[subject]={n1:v[0],n2:v[1],n3:v[2],n4:v[3],n5:v[4]};closeModal();save();};
}
function addGrade(opts={}){
  const practiceId=opts&&typeof opts==='object'&&!('target' in opts)?opts.practiceTestId||'':'';
  const pt=practiceId?state.practiceTests.find(t=>t.id===practiceId&&t.learnerId===learner().id):null;
  const defaultDate=pt?.testDate||today(),subject=pt?.subject||state.activeSubject;
  modal(`<div class="eyebrow">Vokabeltest</div><h2>Schulnote eintragen</h2>${pt?`<div class="notice subtle"><strong>Übung davor:</strong> ${pt.percent}% · Notenvorschlag ${esc(pt.suggestedGrade||'–')}<br>${esc(pt.scopeText||'Testbereich')}</div>`:''}<div class="notice subtle"><strong>Jeder absolvierte Test zählt.</strong><br>Eine eingetragene Note von 1 bis 6 gibt immer ein Prüfungsabzeichen und 50 Abschluss-XP. Die Note verändert nur einen kleinen Bonus von 0 bis 10 XP.</div><label>Datum<input id="gradeDate" type="date" value="${esc(defaultDate)}"></label><label>Fach<select id="gradeSubject">${learnerActiveSubjects().map(x=>`<option value="${x}">${subjectLabel(x)}</option>`).join('')}</select></label><label>Note<input id="gradeValue" inputmode="decimal" placeholder="z. B. 2+ oder 1,7"></label><label>Kommentar<input id="gradeNote"></label><div id="gradeRewardPreview" class="notice subtle">Auch eine 6 erhält die volle Abschlussbelohnung.</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="saveGrade" class="primary">Speichern</button></div>`);
  $('#gradeSubject').value=subject; if(pt)$('#gradeSubject').disabled=true;
  const preview=()=>{const reward=testGradeReward($('#gradeValue').value),box=$('#gradeRewardPreview');if(!box)return;if(!$('#gradeValue').value.trim()){box.className='notice subtle';box.textContent='Auch eine 6 erhält die volle Abschlussbelohnung.';return}if(!reward){box.className='notice warn';box.textContent='Bitte eine Schulnote von 1 bis 6 eingeben, z. B. 2+, 3 oder 1,7.';return}box.className='notice good';box.textContent=`Prüfungsabzeichen +1 · ${reward.baseXp} Abschluss-XP${reward.bonusXp?` + ${reward.bonusXp} Bonus-XP`:''} = ${reward.totalXp} XP`;};
  $('#gradeValue').addEventListener('input',preview);
  $('#saveGrade').onclick=()=>{
    const grade=$('#gradeValue').value.trim(),rewardPreview=testGradeReward(grade),error=$('#gradeRewardPreview');
    if(!rewardPreview){if(error){error.className='notice warn';error.textContent='Bitte eine Schulnote von 1 bis 6 eingeben, z. B. 2+, 3 oder 1,7.';}return}
    const existing=practiceId?state.grades.find(g=>g.learnerId===learner().id&&g.practiceTestId===practiceId):null;
    const data={learnerId:learner().id,date:$('#gradeDate').value,subject:$('#gradeSubject').value,grade,note:$('#gradeNote').value.trim(),practiceTestId:practiceId||null};
    let row=existing;
    if(row)Object.assign(row,data);else{row={id:uid('g'),...data};state.grades.push(row)}
    const reward=grantTestGradeReward(row);
    closeModal();save();
    if(reward)toast(`Test eingetragen · Prüfungsabzeichen +1 · +${reward.totalXp} XP`,'good');
    else toast('Schulnote gespeichert.','good');
  }
}
function switchLearnerProfile(id){
  if(isPairedChildDevice()){toast('Dieses Kindergerät ist fest mit einem Lernprofil verbunden.','subtle');return}
  const next=state.learners.find(x=>x.id===id);if(!next){closeModal();return}
  if(next.id===state.activeLearnerId){closeModal();return}
  state.activeLearnerId=next.id;session=null;ensureActiveSubject();closeModal();showView('homeView');save();toast(`${next.name} ist jetzt aktiv.`,'good');
}
function openProfileSwitcher(){
  const learners=state.learners||[];if(!learners.length)return;
  if(isPairedChildDevice()){toast(`Dieses Kindergerät gehört zum Lernprofil ${learner()?.name||''}.`,'subtle');return}
  modal(`<div class="eyebrow">Lernprofil</div><h2>Profil wechseln</h2><p class="muted-line">Wer lernt gerade?</p><div class="profile-switch-list">${learners.map(l=>{const active=l.id===state.activeLearnerId,meta=[l.gradeLevel?`Klasse ${esc(l.gradeLevel)}`:'',learnerActiveSubjects(l).map(subjectShort).join(' · ')].filter(Boolean).join(' · ');return `<button type="button" class="profile-switch-option ${active?'active':''}" data-profile-switch="${esc(l.id)}" aria-pressed="${active?'true':'false'}"><span><strong>${esc(l.name)}</strong><small>${esc(meta||'Lernprofil')}</small></span><b>${active?'Aktiv':'Wechseln'}</b></button>`}).join('')}</div><div class="modal-actions wrap"><button type="button" id="manageProfilesBtn" class="ghost">Profile verwalten</button><button value="cancel" class="primary">Schließen</button></div>`);
  $$('[data-profile-switch]').forEach(b=>b.onclick=()=>switchLearnerProfile(b.dataset.profileSwitch));
  $('#manageProfilesBtn').onclick=()=>{closeModal();openParentGate('settingsView')};
}
function addProfile(){openProfileEditor()}
function openProfileEditor(id=null){
  const existing=id?state.learners.find(x=>x.id===id):null,active=normalizeLearnerSubjects(existing||{},existing?[]:[availableSubjectIds()[0]||'english']),avatarStyle=existing?.avatarStyle==='female'?'female':'male',support=literacySupportFor(existing||{});
  const gradeOptions=['','1','2','3','4','5','6','7','8','9','10','11','12','13'].map(x=>`<option value="${x}" ${String(existing?.gradeLevel||'')===x?'selected':''}>${x?`Klasse ${x}`:'Klasse wählen'}</option>`).join('');
  const subjectRows=Object.values(SUBJECT_META).map((meta,index)=>`<label class="switch-row ${meta.available?'':'disabled-row'}"><span><strong>${esc(meta.label)}</strong><small>${meta.available?(index===0?'nur aktivierte Fächer werden in der App angezeigt':'aktivierbar'):'vorbereitet · noch nicht freigeschaltet'}</small></span><input data-profile-subject="${esc(meta.id)}" type="checkbox" ${active.includes(meta.id)?'checked':''} ${meta.available?'':'disabled'}></label>`).join('');
  modal(`<div class="eyebrow">Profil</div><h2>${existing?'Profil bearbeiten':'Neues Lernprofil'}</h2><label>Name<input id="profileName" value="${esc(existing?.name||'')}"></label><label>Klasse<select id="profileGrade">${gradeOptions}</select></label><fieldset class="subject-fieldset"><legend>Avatar</legend><div class="avatar-style-choice"><label><input type="radio" name="profileAvatarStyle" value="male" ${avatarStyle==='male'?'checked':''}><span><strong>Männlich</strong><small>männliche Avatarserie</small></span></label><label><input type="radio" name="profileAvatarStyle" value="female" ${avatarStyle==='female'?'checked':''}><span><strong>Weiblich</strong><small>weibliche Avatarserie</small></span></label></div></fieldset><fieldset class="subject-fieldset"><legend><span class="label-with-help">LRS-/Lernunterstützung ${helpIcon('lrs')}</span></legend><p class="muted-line">Keine Diagnose durch die App. Aktiviere nur die Bereiche, in denen das Kind Unterstützung braucht.</p><label class="switch-row"><span><strong>Lesen</strong><small>mehr Laut-Schrift-Verknüpfung, ruhiger Wortblitz und langsamere Audioführung</small></span><input id="profileLrsReading" type="checkbox" ${support.reading?'checked':''}></label><label class="switch-row"><span><strong>Rechtschreiben</strong><small>Schreibabruf, Diktat und Wortbausteine werden im Lernpfad stärker priorisiert</small></span><input id="profileLrsSpelling" type="checkbox" ${support.spelling?'checked':''}></label></fieldset><label class="switch-row"><span><strong>Kurze Einheiten</strong><small>weniger Aufgaben pro Einheit und höchstens zwei freiwillige Nachrücker · unabhängig von LRS</small></span><input id="profileReducedLoad" type="checkbox" ${support.reducedLoad?'checked':''}></label><fieldset class="subject-fieldset"><legend>Fremdsprachen</legend>${subjectRows}</fieldset><div id="profileError" class="notice subtle">Mindestens eine aktive Fremdsprache auswählen.</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="saveProfile" class="primary">${existing?'Speichern':'Anlegen'}</button></div>`);
  $('#saveProfile').onclick=()=>{const name=$('#profileName').value.trim(),subjects=$$('[data-profile-subject]').filter(x=>x.checked&&!x.disabled).map(x=>x.dataset.profileSubject),avatarStyle=$('input[name="profileAvatarStyle"]:checked')?.value==='female'?'female':'male';if(!name){$('#profileError').className='notice warn';$('#profileError').textContent='Bitte einen Namen eingeben.';return}if(!subjects.length){$('#profileError').className='notice warn';$('#profileError').textContent='Mindestens eine aktive Fremdsprache auswählen.';return}const gradeLevel=$('#profileGrade').value,literacySupport={reading:$('#profileLrsReading').checked,spelling:$('#profileLrsSpelling').checked},reducedLoad=$('#profileReducedLoad').checked,lrsMode=literacySupport.reading||literacySupport.spelling;if(existing){existing.name=name;existing.gradeLevel=gradeLevel;existing.avatarStyle=avatarStyle;existing.literacySupport=literacySupport;existing.reducedLoad=reducedLoad;existing.lrsMode=lrsMode;existing.activeSubjects=subjects;normalizeLiteracySupport(existing)}else{const learnerId=uid('learner');state.learners.push({id:learnerId,name,gradeLevel,avatarStyle,activeSubjects:subjects,xp:0,literacySupport,reducedLoad,lrsMode,fontSize:17,letterSpacing:0,flashSpeed:1600,autoSpeakCorrection:true,streakDays:[],milestones:{},fortressWins:defaultSubjectArrays(),fortressWinsByYear:{},battleTickets:defaultSubjectNumbers(),completedTests:{},campaignLog:[],dailyPlans:{},testSeries:defaultTestSeries(),gradeScales:defaultGradeScales(),createdAt:new Date().toISOString()});state.activeLearnerId=learnerId}ensureActiveSubject();closeModal();save()};
}
function openBookManager(learnerId=state.activeLearnerId){
  const l=state.learners.find(x=>x.id===learnerId);if(!l)return;const subjects=learnerActiveSubjects(l);
  modal(`<div class="eyebrow">Lehrwerke</div><div class="row gap align-center"><h2>${esc(l.name)}</h2>${helpIcon('book')}</div><p class="muted-line">ISBN-13 ist die eindeutige Referenz. Bereits bekannte Buchinhalte können von mehreren Profilen genutzt werden.</p><div class="book-manager-list">${subjects.map(subject=>{const b=currentBook(l.id,subject),u=b?bookUsage(b.id):null;return `<article class="book-manager-item"><div><strong>${subjectLabel(subject)}</strong><span>${b?esc(b.title||'Lehrwerk'):'Kein Lehrwerk hinterlegt'}</span>${b?`<small>ISBN ${esc(formatIsbn(b.isbn13))}${u?.vocabulary?` · ${u.vocabulary} bekannte Vokabeln`:''}</small>`:''}</div><button type="button" class="secondary" data-book-subject="${subject}">${b?'Ändern':'Hinzufügen'}</button></article>`}).join('')}</div><div class="modal-actions"><button value="cancel" class="primary">Fertig</button></div>`);
  $$('[data-book-subject]').forEach(b=>b.onclick=()=>{closeModal();openBookEditor(learnerId,b.dataset.bookSubject)});
}
function openBookEditor(learnerId,subject){
  const l=state.learners.find(x=>x.id===learnerId);if(!l)return;const assigned=currentBook(learnerId,subject),known=(state.books||[]).filter(x=>x.subject===subject).sort((a,b)=>(a.title||a.isbn13).localeCompare(b.title||b.isbn13,'de'));
  modal(`<div class="eyebrow">${subjectLabel(subject)}</div><div class="row gap align-center"><h2>Lehrwerk über ISBN</h2>${helpIcon('isbn')}</div><p>Barcode/ISBN fotografieren oder die ISBN eingeben. Die App normalisiert ISBN-10 automatisch auf ISBN-13.</p>${known.length?`<label>Bereits bekannte Lehrwerke<select id="knownBookSelect"><option value="">ISBN eingeben / neues Lehrwerk</option>${known.map(b=>`<option value="${b.id}" ${assigned?.id===b.id?'selected':''}>${esc(b.title||formatIsbn(b.isbn13))} · ${esc(formatIsbn(b.isbn13))}</option>`).join('')}</select></label>`:''}<div class="isbn-row"><label>ISBN<input id="bookIsbn" inputmode="numeric" autocomplete="off" value="${esc(assigned?.isbn13||'')}" placeholder="978…"></label><button type="button" id="scanIsbnBtn" class="secondary">📷 ISBN fotografieren</button></div><div id="isbnScanStatus" class="notice subtle">ISBN-13 wird über die Prüfziffer validiert.</div><label>Titel<input id="bookTitle" value="${esc(assigned?.title||'')}" placeholder="z. B. Camden Town 1"></label><div class="planner-grid"><label>Verlag<input id="bookPublisher" value="${esc(assigned?.publisher||'')}"></label><label>Ausgabe / Auflage<input id="bookEdition" value="${esc(assigned?.edition||'')}"></label></div><div id="bookKnownPreview" class="notice subtle"></div><label id="cloneBookWrap" class="switch-row hidden"><span><strong>Bekannte Inhalte übernehmen</strong><small>legt bekannte Abschnitte für ${esc(l.name)} an; Lernstände bleiben persönlich</small></span><input id="cloneBookContent" type="checkbox" checked></label><label id="seedBookWrap" class="switch-row hidden"><span><strong>Vorhandene Lernbereiche diesem Lehrwerk zuordnen</strong><small>macht bestehende ${subjectLabel(subject)}-Vokabeln unter dieser ISBN für weitere Profile wiederverwendbar</small></span><input id="seedBookContent" type="checkbox"></label><div class="modal-actions wrap"><button value="cancel" class="ghost">Abbrechen</button>${assigned?'<button type="button" id="removeBook" class="ghost">Lehrwerk entfernen</button>':''}<button type="button" id="saveBook" class="primary">Speichern</button></div>`);
  const fillBook=b=>{if(!b)return;$('#bookIsbn').value=b.isbn13;$('#bookTitle').value=b.title||'';$('#bookPublisher').value=b.publisher||'';$('#bookEdition').value=b.edition||'';updatePreview()};
  const updatePreview=()=>{const isbn=normalizeIsbn($('#bookIsbn').value),preview=$('#bookKnownPreview'),status=$('#isbnScanStatus');if(!isbn){preview.textContent='';$('#cloneBookWrap').classList.add('hidden');$('#seedBookWrap').classList.add('hidden');status.className='notice subtle';status.textContent=$('#bookIsbn').value.trim()?'ISBN noch nicht gültig.':'ISBN-13 wird über die Prüfziffer validiert.';return}$('#bookIsbn').value=isbn;status.className='notice good';status.textContent=`Gültige ISBN-13: ${formatIsbn(isbn)}`;const knownBook=bookByIsbn(isbn),u=knownBook?bookUsage(knownBook.id):{sections:0,vocabulary:0};if(knownBook){if(!$('#bookTitle').value.trim())$('#bookTitle').value=knownBook.title||'';if(!$('#bookPublisher').value.trim())$('#bookPublisher').value=knownBook.publisher||'';if(!$('#bookEdition').value.trim())$('#bookEdition').value=knownBook.edition||''}preview.textContent=knownBook?`Bereits global bekannt${knownBook.title?`: ${knownBook.title}`:''} · ${u.sections} Abschnitt${u.sections===1?'':'e'} · ${u.vocabulary} Vokabeln`:'Neue ISBN – wird als globales Lehrwerk angelegt.';const hasImport=u.vocabulary>0&&!state.sets.some(s=>s.learnerId===learnerId&&s.bookId===knownBook?.id);$('#cloneBookWrap').classList.toggle('hidden',!hasImport);const seedable=state.sets.some(s=>s.learnerId===learnerId&&s.subject===subject&&!s.bookId);$('#seedBookWrap').classList.toggle('hidden',!seedable)};
  $('#knownBookSelect')?.addEventListener('change',e=>fillBook(bookById(e.target.value)));
  $('#bookIsbn').addEventListener('input',updatePreview);$('#bookIsbn').addEventListener('blur',updatePreview);
  $('#scanIsbnBtn').onclick=()=>{const f=$('#isbnPhotoInput');f.value='';f.click()};updatePreview();
  $('#saveBook').onclick=()=>{const isbn=normalizeIsbn($('#bookIsbn').value);if(!isbn){$('#isbnScanStatus').className='notice warn';$('#isbnScanStatus').textContent='Bitte eine gültige ISBN-10 oder ISBN-13 eingeben bzw. fotografieren.';return}const result=upsertBook(isbn,subject,{title:$('#bookTitle').value.trim(),publisher:$('#bookPublisher').value.trim(),edition:$('#bookEdition').value.trim()}),book=result.book;assignBookToLearner(learnerId,subject,book.id,{gradeLevel:l.gradeLevel,schoolYear:currentSchoolYear()});let copied={sets:0,links:0},seeded={sets:0,links:0};if(!$('#seedBookWrap').classList.contains('hidden')&&$('#seedBookContent').checked)seeded=associateExistingSetsToBook(learnerId,subject,book.id);if(!$('#cloneBookWrap').classList.contains('hidden')&&$('#cloneBookContent').checked)copied=cloneKnownBookToLearner(book.id,learnerId);closeModal();save();const details=[];if(seeded.links)details.push(`${seeded.links} vorhandene Vokabeln dem Buch zugeordnet`);if(copied.links)details.push(`${copied.links} bekannte Vokabeln übernommen`);toast(`${book.title||'Lehrwerk'} gespeichert${details.length?` · ${details.join(' · ')}`:''}.`,'good')};
  $('#removeBook')?.addEventListener('click',()=>{unassignBook(learnerId,subject);closeModal();save();toast('Lehrwerk-Zuordnung entfernt. Die globale Buchbibliothek bleibt erhalten.','subtle')});
}
function deleteProfile(id){
  if(id===state.activeLearnerId)return;
  if(window.VTFamilySync?.status?.().enabled){
    modal('<div class="eyebrow">Familiensync</div><h2>Profil nicht nur auf einem Gerät löschen</h2><p>Dieses Profil gehört zu einem aktiven Familienverbund. Die aktuelle Sync-Version kann Profil-Löschungen noch nicht als Löschvorgang an alle Geräte übertragen.</p><div class="notice warn"><strong>Deshalb wird hier nichts gelöscht.</strong><br>Lernstoff und Lernstände können weiterhin über „Lernstoff löschen“ familienweit geleert werden. Eine vollständige Profil-Löschung wird erst freigegeben, wenn sie im Sync-Protokoll eindeutig übertragen werden kann.</div><div class="modal-actions"><button value="cancel" class="primary">Verstanden</button></div>');
    return;
  }
  if(!confirm('Profil mit Lernbereichen, Lernständen und Noten löschen? Die globale Vokabelbibliothek bleibt erhalten.'))return;
  const setIds=new Set(state.sets.filter(s=>s.learnerId===id).map(s=>s.id));state.setVocabulary=state.setVocabulary.filter(x=>!setIds.has(x.setId));state.vocabulary.forEach(v=>{v.sources=(v.sources||[]).filter(src=>!setIds.has(src.setId))});state.sets=state.sets.filter(s=>s.learnerId!==id);state.learnerBooks=state.learnerBooks.filter(x=>x.learnerId!==id);state.learnerVocabulary=state.learnerVocabulary.filter(x=>x.learnerId!==id);state.grades=state.grades.filter(g=>g.learnerId!==id);state.practiceTests=state.practiceTests.filter(t=>t.learnerId!==id);state.activity=state.activity.filter(a=>a.learnerId!==id);state.learners=state.learners.filter(l=>l.id!==id);rebuildWordIndexes();save();
}

let modalReturnFocus=null;
function prepareModalAccessibility(dialog){
  const heading=dialog?.querySelector('#modalContent h1,#modalContent h2,#modalContent h3');
  if(heading){
    heading.id='modalTitle';
    heading.setAttribute('tabindex','-1');
    dialog.setAttribute('aria-labelledby','modalTitle');
  }else dialog?.removeAttribute('aria-labelledby');
  queueMicrotask(()=>{
    const target=dialog?.querySelector('#modalTitle');
    if(dialog?.open&&target)target.focus({preventScroll:true});
  });
}
function restoreModalFocus(){
  const target=modalReturnFocus;modalReturnFocus=null;
  queueMicrotask(()=>{
    if(target?.isConnected&&!target.disabled&&target.getClientRects().length)target.focus({preventScroll:true});
  });
}
function modal(html){
  const dialog=$('#modal');
  if(!dialog)return;
  if(!dialog.open){
    const active=document.activeElement;
    modalReturnFocus=active&&active!==document.body&&!dialog.contains(active)?active:null;
  }
  $('#modalContent').innerHTML=html;
  if(!dialog.open){
    try{dialog.showModal()}catch(_e){dialog.setAttribute('open','')}
  }
  prepareModalAccessibility(dialog);
}
function closeModal(){
  const dialog=$('#modal');if(!dialog)return;
  if(!dialog.open){restoreModalFocus();return}
  try{dialog.close()}catch(_e){dialog.removeAttribute('open');restoreModalFocus()}
}
function toast(text,type='subtle'){const el=$('#toastRegion');if(!el)return;clearTimeout(toastTimer);el.className=`toast-region show ${type}`;el.textContent=text;toastTimer=setTimeout(()=>{el.className='toast-region';el.textContent=''},4200)}
function applyRoleUi(){
  if(isPairedChildDevice())appRole='child';
  const parent=isParentMode(),childDevice=isPairedChildDevice();
  document.body.classList.toggle('parent-mode',parent);
  $('#parentAreaBtn')?.classList.toggle('hidden',parent||childDevice);
  $('#childModeBtn')?.classList.toggle('hidden',!parent);
  $('#appTitle').textContent=parent?'Vokabeltrainer · Eltern':'Vokabeltrainer';
}
function openParentGate(target='parentView'){
  if(isPairedChildDevice()){toast('Der Elternbereich ist auf diesem Kindergerät gesperrt.','subtle');return}
  modal('<div class="eyebrow">Rollenwechsel</div><h2>Elternbereich öffnen?</h2><p>Hier werden Lernstoff, Testpläne, Noten, Profile, Lehrwerke und Datensicherung verwaltet.</p><p class="notice subtle">Der Kindermodus bleibt bewusst frei von diesen Verwaltungsaufgaben.</p><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="confirmParentMode" class="primary">Elternbereich öffnen</button></div>');
  $('#confirmParentMode').onclick=()=>{closeModal();enterParentMode(target)};
}
function enterParentMode(target='parentView'){if(isPairedChildDevice()){appRole='child';applyRoleUi();showView('homeView');toast('Der Elternbereich ist auf diesem Kindergerät gesperrt.','subtle');return false}appRole='parent';applyRoleUi();showView(target);renderAll();return true}
function exitParentMode(){appRole='child';session=null;applyRoleUi();showView('homeView');renderAll()}
function familySyncTime(value){if(!value)return 'noch nie';try{return new Date(value).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(_){return value}}
function renderFamilySync(){
  renderStandaloneSyncNotice();
  const box=$('#familySyncStatus'),setup=$('#familySyncSetupBtn'),now=$('#familySyncNowBtn'),child=$('#familySyncChildBtn'),parent=$('#familySyncParentBtn'),switchBtn=$('#familySyncSwitchBtn');if(!box||!window.VTFamilySync)return;
  const s=VTFamilySync.status();
  setup.classList.toggle('hidden',s.enabled);
  now.classList.toggle('hidden',!s.enabled);
  child.classList.toggle('hidden',!s.enabled||s.role!=='parent');
  parent?.classList.toggle('hidden',!s.enabled||s.role!=='parent');
  switchBtn?.classList.toggle('hidden',!s.enabled||s.role!=='parent');
  if(!s.enabled){
    box.className=`notice ${s.revoked?'warn':'subtle'}`;
    box.innerHTML=s.revoked?'<strong>Dieses Gerät wurde aus dem Familienverbund entfernt.</strong><br>Lokale Daten bleiben erhalten. Für erneute Synchronisierung das Gerät neu verbinden.':'<strong>Noch nicht verbunden.</strong><br>Neue Familie anlegen oder einem bestehenden Familienverbund beitreten.';
    return
  }
  if(s.conflicts){box.className='notice warn';box.innerHTML=`<strong>Synchronisationskonflikt</strong><br>${s.conflicts} Datenbereich${s.conflicts===1?' wurde':'e wurden'} auf mehreren Geräten geändert. Nichts wird automatisch überschrieben.<div class="top-space"><button type="button" id="familyConflictResolveBtn" class="secondary">Konflikt lösen</button></div>`;$('#familyConflictResolveBtn').onclick=openFamilySyncConflictResolver;return}
  if(s.busy){box.className='notice subtle';box.innerHTML='<strong>Synchronisierung läuft …</strong><br>Lokales Lernen bleibt verfügbar.';return}
  box.className='notice good';box.innerHTML=`<strong>Familiensync aktiv</strong><br>Familie: ${esc(s.familyId)} · ${s.role==='parent'?'Eltern-Gerät':'Kindergerät'} · zuletzt ${esc(familySyncTime(s.lastSync))}${s.dirty?` · ${s.dirty} Änderung${s.dirty===1?'':'en'} wartet${s.dirty===1?'':'en'} auf Upload`:''}`;
}
function familySyncConflictLabel(key){
  if(key==='shared')return 'Gemeinsame Vokabel- und Lehrwerksdaten';
  const m=String(key||'').match(/^profile\/([^/]+)\/(setup|progress)$/),l=m?state.learners.find(x=>x.id===m[1]):null;
  if(!m)return 'Synchronisierte Daten';
  return `${l?.name||'Lernprofil'} · ${m[2]==='setup'?'Einstellungen, Lernsets und Noten':'Lernfortschritt'}`;
}
function openFamilySyncConflictResolver(){
  if(!window.VTFamilySync)return;const syncStatus=VTFamilySync.status(),keys=syncStatus.conflictKeys||[];
  if(!keys.length){renderFamilySync();toast('Kein Synchronisationskonflikt mehr vorhanden.','good');return}
  modal(`<div class="eyebrow">Familiensync</div><h2>Konflikt lösen</h2><p>Für diese Datenbereiche gibt es Änderungen auf diesem Gerät und in der Cloud. Entscheide bewusst, welcher Stand gelten soll.</p><div class="notice warn"><strong>Es wird nichts automatisch überschrieben.</strong><br>„Cloud übernehmen“ verwirft nur den lokalen Stand des jeweiligen Datenbereichs. „Dieses Gerät behalten“ überschreibt bewusst den neueren Cloud-Stand.</div><div class="global-usage-list">${keys.map((key,i)=>`<div class="profile-row"><div><strong>${esc(familySyncConflictLabel(key))}</strong><small class="profile-meta">Konflikt ${i+1} von ${keys.length}</small></div><div class="row gap wrap"><button type="button" class="secondary" data-sync-conflict-remote="${esc(key)}">Cloud übernehmen</button><button type="button" class="ghost" data-sync-conflict-local="${esc(key)}">Dieses Gerät behalten</button></div></div>`).join('')}</div><div id="familyConflictError" class="notice subtle">Bei Unsicherheit zuerst ein Backup erstellen.</div><div class="modal-actions wrap"><button type="button" id="familyConflictBackupBtn" class="ghost">Backup erstellen</button><button value="cancel" class="primary">Später</button></div>`);
  $('#familyConflictBackupBtn').onclick=()=>backup();
  $$('[data-sync-conflict-remote]').forEach(b=>b.onclick=async()=>{const err=$('#familyConflictError');b.disabled=true;try{await VTFamilySync.resolveConflict(b.dataset.syncConflictRemote,'remote');closeModal();renderAll();const left=VTFamilySync.status().conflicts;if(left)openFamilySyncConflictResolver();else toast('Cloud-Stand übernommen. Synchronisierung läuft wieder.','good')}catch(e){err.className='notice bad';err.textContent=e.message||'Konflikt konnte nicht aufgelöst werden.';b.disabled=false}});
  $$('[data-sync-conflict-local]').forEach(b=>b.onclick=async()=>{if(!confirm('Den Stand dieses Geräts wirklich über den neueren Cloud-Stand schreiben?'))return;const err=$('#familyConflictError');b.disabled=true;try{await VTFamilySync.resolveConflict(b.dataset.syncConflictLocal,'local');closeModal();renderAll();const left=VTFamilySync.status().conflicts;if(left)openFamilySyncConflictResolver();else toast('Stand dieses Geräts übernommen. Synchronisierung läuft wieder.','good')}catch(e){err.className='notice bad';err.textContent=e.message||'Konflikt konnte nicht aufgelöst werden.';b.disabled=false}});
}
function openFamilySyncSetup(){
  if(!window.VTFamilySync)return;
  if(VTFamilySync.status().enabled){openFamilySyncSwitch();return}
  modal('<div class="eyebrow">Familie & Geräte</div><h2>Familiensync einrichten</h2><p>Wähle, wofür dieses Gerät verwendet wird.</p><div class="notice subtle"><strong>Kindergerät?</strong><br>Ein Kindergerät wird nicht mit Familien-ID und Familien-PIN verbunden. Es bekommt einen einmaligen Verbindungslink vom Eltern-Gerät und wird dabei direkt einem Kinderprofil zugeordnet.</div><div class="modal-actions stack-mobile"><button type="button" id="familySyncChildJoinChoiceBtn" class="primary">Kindergerät verbinden</button><button type="button" id="familySyncJoinChoiceBtn" class="secondary">Weiteres Eltern-Gerät verbinden</button><button type="button" id="familySyncCreateChoiceBtn" class="ghost">Neue Familie anlegen</button><button value="cancel" class="ghost">Abbrechen</button></div>');
  $('#familySyncChildJoinChoiceBtn').onclick=openFamilySyncChildJoin;
  $('#familySyncJoinChoiceBtn').onclick=openFamilySyncJoin;
  $('#familySyncCreateChoiceBtn').onclick=openFamilySyncCreate;
}
function childInviteTokenFromInput(value){
  const raw=String(value||'').trim();
  if(/^[0-9a-f]{48}$/i.test(raw))return raw.toLowerCase();
  try{
    const url=new URL(raw,location.href);
    const params=new URLSearchParams(String(url.hash||'').replace(/^#/,''));
    const token=String(params.get('childInvite')||'').trim();
    if(/^[0-9a-f]{48}$/i.test(token))return token.toLowerCase();
  }catch(_e){}
  return '';
}
function openFamilySyncChildJoin(){
  modal('<div class="eyebrow">Kindergerät</div><h2>Kindergerät verbinden</h2><p>Auf dem Eltern-Gerät zuerst <strong>Einstellungen → Familie & Geräte → Kindergerät hinzufügen</strong> öffnen, das Kind auswählen und einen Verbindungslink erstellen.</p><label>Verbindungslink oder Gerätecode<input id="familyChildJoinInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Link hier einfügen"></label><div id="familyChildJoinError" class="notice warn"><strong>Vorhandene lokale Lerndaten werden ersetzt.</strong><br>Der Link ist einmalig und 15 Minuten gültig. Falls auf diesem Gerät bereits Daten liegen, vorher ein Backup erstellen.</div><div class="modal-actions wrap"><button type="button" id="familyChildBackupBtn" class="ghost">Backup erstellen</button><button type="button" id="familySyncBackBtn" class="ghost">Zurück</button><button type="button" id="familyChildJoinBtn" class="primary">Kindergerät verbinden</button></div>');
  $('#familySyncBackBtn').onclick=openFamilySyncSetup;
  $('#familyChildBackupBtn').onclick=()=>backup();
  $('#familyChildJoinBtn').onclick=async()=>{
    const input=$('#familyChildJoinInput'),err=$('#familyChildJoinError'),btn=$('#familyChildJoinBtn');
    const token=childInviteTokenFromInput(input.value);
    if(!token){err.className='notice warn';err.textContent='Bitte den Verbindungslink vom Eltern-Gerät einfügen. Falls nur der Gerätecode vorliegt, muss er vollständig übernommen werden.';return}
    btn.disabled=true;btn.textContent='Wird verbunden …';
    try{
      await VTFamilySync.claimChildInvite(token,'Kindergerät');
      appRole='child';applyRoleUi();closeModal();showView('homeView');renderAll();VTFamilySync.bootstrap();
      toast('Kindergerät ist verbunden.','good');
    }catch(e){
      err.className='notice bad';err.textContent=(e.message||'Kindergerät konnte nicht verbunden werden.')+' Falls der Link älter als 15 Minuten ist, auf dem Eltern-Gerät einen neuen Verbindungslink erstellen.';
      btn.disabled=false;btn.textContent='Erneut versuchen';
    }
  };
}
function openFamilySyncCreate(){
  modal('<div class="eyebrow">Familie & Geräte</div><h2>Neue Familie anlegen</h2><p>Nur verwenden, wenn noch auf keinem Gerät ein Familienverbund existiert. Der aktuelle Stand dieses Geräts wird als erster Familienstand hochgeladen.</p><label>Familien-PIN<input id="familyPin" type="password" minlength="6" autocomplete="new-password" placeholder="mindestens 6 Zeichen"></label><label>PIN wiederholen<input id="familyPin2" type="password" minlength="6" autocomplete="new-password"></label><div id="familySyncSetupError" class="notice subtle">Die PIN wird nicht gespeichert. Weitere Geräte treten später mit Familien-ID und PIN bei.</div><div class="modal-actions"><button type="button" id="familySyncBackBtn" class="ghost">Zurück</button><button type="button" id="familySyncCreateBtn" class="primary">Familie anlegen</button></div>');
  $('#familySyncBackBtn').onclick=openFamilySyncSetup;
  $('#familySyncCreateBtn').onclick=async()=>{const p1=$('#familyPin').value,p2=$('#familyPin2').value,err=$('#familySyncSetupError'),btn=$('#familySyncCreateBtn');if(p1.length<6){err.className='notice warn';err.textContent='Die PIN muss mindestens 6 Zeichen lang sein.';return}if(p1!==p2){err.className='notice warn';err.textContent='Die beiden PINs stimmen nicht überein.';return}btn.disabled=true;btn.textContent='Wird eingerichtet …';try{await VTFamilySync.createFamily(p1,'Eltern-Gerät');closeModal();renderFamilySync();toast('Familiensync eingerichtet.','good')}catch(e){err.className='notice bad';err.textContent=e.message||'Einrichtung fehlgeschlagen.';btn.disabled=false;btn.textContent='Familie anlegen'}};
}
function parentInviteTokenFromInput(value){
  const raw=String(value||'').trim();
  if(/^[0-9a-f]{48}$/i.test(raw))return raw.toLowerCase();
  try{
    const url=new URL(raw,location.href);
    const params=new URLSearchParams(String(url.hash||'').replace(/^#/,''));
    const token=String(params.get('parentInvite')||'').trim();
    if(/^[0-9a-f]{48}$/i.test(token))return token.toLowerCase();
  }catch(_e){}
  return '';
}
function openFamilySyncJoin(){
  modal('<div class="eyebrow">Familie & Geräte</div><h2>Weiteres Eltern-Gerät verbinden</h2><p>Am einfachsten: Auf einem bereits verbundenen Eltern-Gerät <strong>Eltern-Gerät hinzufügen</strong> wählen und den QR-Code scannen. Falls der Link auf iOS zuerst in Safari geöffnet wurde, kannst du ihn hier einfügen.</p><label>Einmal-Link oder Gerätecode<input id="familyParentJoinInvite" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="QR-/Verbindungslink hier einfügen"></label><details class="manual-parent-join"><summary>Stattdessen Familien-ID und PIN verwenden</summary><label>Familien-ID<input id="familyJoinId" type="text" autocomplete="off" spellcheck="false" placeholder="family_…"></label><label>Familien-PIN<input id="familyJoinPin" type="password" minlength="6" autocomplete="current-password" placeholder="mindestens 6 Zeichen"></label></details><div id="familySyncJoinError" class="notice warn"><strong>Der Familienstand wird auf dieses Gerät übernommen.</strong><br>Vorhandene lokale Daten können dabei ersetzt werden. Die bisherige Sync-Verbindung bleibt bis zu einem erfolgreichen Wechsel erhalten.</div><div class="modal-actions wrap"><button type="button" id="familyParentJoinBackupBtn" class="ghost">Backup erstellen</button><button type="button" id="familySyncBackBtn" class="ghost">Zurück</button><button type="button" id="familySyncJoinBtn" class="primary">Eltern-Gerät verbinden</button></div>');
  $('#familySyncBackBtn').onclick=()=>VTFamilySync.status().enabled?openFamilySyncSwitch():openFamilySyncSetup();
  $('#familyParentJoinBackupBtn').onclick=()=>backup();
  $('#familySyncJoinBtn').onclick=async()=>{
    const invite=parentInviteTokenFromInput($('#familyParentJoinInvite').value),id=$('#familyJoinId').value.trim().toLowerCase(),pin=$('#familyJoinPin').value,err=$('#familySyncJoinError'),btn=$('#familySyncJoinBtn');
    if(!invite&&!/^family_[a-z0-9]{6,40}$/.test(id)){err.className='notice warn';err.textContent='Bitte den QR-/Verbindungslink einfügen oder eine gültige Familien-ID und PIN verwenden.';return}
    if(!invite&&pin.length<6){err.className='notice warn';err.textContent='Die Familien-PIN muss mindestens 6 Zeichen lang sein.';return}
    btn.disabled=true;btn.textContent='Wird verbunden …';
    try{
      if(invite)await VTFamilySync.claimParentInvite(invite,'Eltern-Gerät');
      else await VTFamilySync.joinParent(id,pin,'Eltern-Gerät');
      closeModal();appRole='parent';applyRoleUi();renderAll();VTFamilySync.bootstrap();toast('Eltern-Gerät ist mit der bestehenden Familie verbunden.','good');
    }catch(e){err.className='notice bad';err.textContent=e.message||'Beitritt fehlgeschlagen.';btn.disabled=false;btn.textContent='Eltern-Gerät verbinden'}
  };
}
function openFamilySyncSwitch(){
  if(!window.VTFamilySync)return;const s=VTFamilySync.status();if(!s.enabled){openFamilySyncSetup();return}
  modal(`<div class="eyebrow">Familie & Geräte</div><h2>Familienverbindung ändern</h2><p>Dieses Gerät ist aktuell mit <strong>${esc(s.familyId)}</strong> verbunden.</p><div class="notice subtle">Beim Wechsel bleibt die bisherige Verbindung bestehen, bis die neue Familie erfolgreich verbunden ist. Beim bewussten Trennen bleiben die lokalen Lern- und Vokabeldaten erhalten.</div><div class="modal-actions stack-mobile"><button type="button" id="familySwitchJoinBtn" class="primary">Zu bestehender Familie wechseln</button><button type="button" id="familyDisconnectBtn" class="danger-outline">Verbindung auf diesem Gerät lösen</button><button value="cancel" class="ghost">Abbrechen</button></div>`);
  $('#familySwitchJoinBtn').onclick=()=>openFamilySyncJoin();
  $('#familyDisconnectBtn').onclick=()=>{VTFamilySync.disconnectLocal();closeModal();renderAll();toast('Familiensync auf diesem Gerät getrennt. Lokale Daten bleiben erhalten.','subtle')};
}
async function runFamilySync(){
  if(!window.VTFamilySync)return;const btn=$('#familySyncNowBtn');btn.disabled=true;renderFamilySync();try{await VTFamilySync.syncNow(true);renderAll();toast('Synchronisierung abgeschlossen.','good')}catch(e){toast(e.message||'Synchronisierung fehlgeschlagen.','bad');renderFamilySync()}finally{btn.disabled=false}
}
function renderParentOverview(){
  const box=$('#parentAttention');if(!box)return;
  const sets=mySets(),draft=sets.find(s=>s.pendingTestPlan),review=sets.find(s=>!s.pendingTestPlan&&setNeedsPairReview(s)),pending=seriesScopePending(),ctx=upcomingTestContext(),tasks=[];
  if(draft){
    const count=setWords(draft.id).length,when=draft.pendingTestPlan?.testDate?formatDateShort(draft.pendingTestPlan.testDate):'offen';
    tasks.push(`<div class="parent-task"><div><strong>Testvorbereitung abschließen</strong><small>${esc(draft.title)} · ${count} Vokabel${count===1?'':'n'} · Termin ${esc(when)}. Der Entwurf beeinflusst das Lernen noch nicht.</small></div><button class="primary" data-parent-draft="${draft.id}">Fortsetzen</button></div>`);
  }
  if(review)tasks.push(`<div class="parent-task"><div><strong>Vokabelpaare prüfen</strong><small>${esc(review.title)} muss vor dem ersten Lernen fachlich bestätigt werden.</small></div><button class="primary" data-parent-audit="${review.id}">Jetzt prüfen</button></div>`);
  if(pending)tasks.push('<div class="parent-task"><div><strong>Testumfang festlegen</strong><small>Für den nächsten wöchentlichen Test fehlen noch die konkreten Vokabeln.</small></div><button class="primary" data-parent-plan>Test planen</button></div>');
  if(!sets.length)tasks.push('<div class="parent-task"><div><strong>Noch kein Lernstoff</strong><small>Steht ein Test an, plane ihn direkt. Sonst kannst du Vokabeln ohne Testtermin vorbereiten.</small></div><div class="row gap wrap"><button class="primary" data-parent-plan-first>Test planen</button><button class="secondary" data-parent-newset>Ohne Test vorbereiten</button></div></div>');
  if(!tasks.length){
    const ready=ctx?`Nächster Test ${formatDateShort(ctx.date)} · ${ctx.words.length} Vokabel${ctx.words.length===1?'':'n'} vorbereitet.`:'Aktuell ist keine Eltern-Aufgabe offen. Das Kind kann mit dem vorhandenen Lernstoff weiterlernen.';
    tasks.push(`<div class="parent-ready"><span aria-hidden="true">✓</span><div><strong>Alles vorbereitet</strong><small>${esc(ready)}</small></div></div>`);
  }
  box.innerHTML=tasks.join('');
  box.querySelector('[data-parent-draft]')?.addEventListener('click',e=>{const set=state.sets.find(s=>s.id===e.currentTarget.dataset.parentDraft);if(!set)return;if(set.captureSource==='manual')openWordEditor(null,set.id);else if(setWords(set.id).length)openSetPairAudit(set.id);else openScanImport(set.id)});
  box.querySelector('[data-parent-audit]')?.addEventListener('click',e=>openSetPairAudit(e.currentTarget.dataset.parentAudit));
  box.querySelector('[data-parent-plan]')?.addEventListener('click',openTestDatePlanner);
  box.querySelector('[data-parent-plan-first]')?.addEventListener('click',openTestDatePlanner);
  box.querySelector('[data-parent-newset]')?.addEventListener('click',()=>openLearningContentPlanner());
  const summary=$('#parentLearningSummary');if(summary){const active=sets.filter(s=>setWords(s.id).length).length;summary.textContent=active?`${active} aktive${active===1?'r Lernbereich':' Lernbereiche'}${ctx?` · nächster Test ${formatDateShort(ctx.date)}`:''}`:'Noch kein aktiver Lernstoff'}
}
function isDesktopLayout(){return !!window.matchMedia?.('(min-width: 1100px)').matches}
function syncResponsiveHomeLayout(){
  const practice=$('#practiceDisclosure');if(practice)practice.open=isDesktopLayout();
}
function childNavRootView(id){
  if(['armyView','armyUnitView','campaignMapView','battleView','battleResultView'].includes(id))return 'armyView';
  if(id==='practiceView')return 'practiceView';
  if(id==='childProgressView')return 'childProgressView';
  return id==='homeView'?'homeView':'';
}
function showView(id){
  if(id!=='battleView'){
    cancelBattleSequence();
    window.VTBattleResultUi?.hide?.();
    setBattlePreviewMode(false);
    if(document.body.classList.contains('battle-immersive'))closeBattleImmersive();
  }
  if(PARENT_VIEW_IDS.has(id)&&!isParentMode()){toast(isPairedChildDevice()?'Der Elternbereich ist auf diesem Kindergerät gesperrt.':'Diese Funktion liegt im Elternbereich.','subtle');id='homeView'}
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  if(id==='battleView')setBattleImmersive(true);
  const navRoot=childNavRootView(id);
  document.querySelectorAll('.nav-btn[data-view]').forEach(b=>{const active=!isParentMode()&&b.dataset.view===navRoot;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  if(id==='homeView'){document.querySelectorAll('.home-disclosure').forEach(d=>{d.open=isDesktopLayout()&&d.id==='practiceDisclosure'});window.VTMenuUi?.render?.();}
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
}

function bind(){
  document.querySelectorAll('.nav-btn[data-view]').forEach(b=>b.onclick=()=>{if(b.dataset.view==='armyView'&&window.VTArmyUi?.open){window.VTArmyUi.open();return}showView(b.dataset.view)}); $('#quickLearnHeroBtn').onclick=()=>{const action=$('#quickLearnHeroBtn')?.dataset.action||'learn';if(action==='completeTest')return openCompleteCurrentTest();if(action==='planTest')return openTestDatePlanner();if(action==='pairReview'){const set=mySets().find(setNeedsPairReview);if(set)return openSetPairAudit(set.id)}startDailyTodo()}; $('#quickCardsBtn')?.addEventListener('click',()=>startSession('cards')); $('#cardboxPracticeBtn').onclick=()=>startSession('cards'); $('#todayTestBtn').onclick=()=>openTestDatePlanner($('#todayTestBtn')?.dataset.setId||''); $('#backHomeBtn').onclick=()=>{session=null;showView('homeView')};
  $('#practiceCardsBtn')?.addEventListener('click',()=>startSession('cards')); $('#practiceWeakBtn')?.addEventListener('click',startWeakWordsPractice); $('#practiceAllBtn')?.addEventListener('click',openAllWordsPracticeChooser); $('#practiceSpecialBtn')?.addEventListener('click',()=>{const panel=$('#optionalLearningCard'),btn=$('#practiceSpecialBtn');if(!panel)return;const open=panel.classList.contains('hidden');panel.classList.toggle('hidden',!open);btn.setAttribute('aria-expanded',String(open));if(open)panel.scrollIntoView({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
  $('#newSetBtn').onclick=()=>openLearningContentPlanner(); $('#addGradeBtn').onclick=()=>addGrade(); $('#practiceTestBtn').onclick=openPracticeTestChooser; $('#addProfileBtn').onclick=addProfile; $('#profileBtn').onclick=openProfileSwitcher; $('#attackBtn').onclick=openBattleView; $('#duelBtn').onclick=openDuel;
  $('#battleBackBtn').onclick=returnFromBattle; $('#battleReturnBtn').onclick=returnFromBattle; $('#battleAttackBtn').onclick=runBattleAnimation; $('#battleFullscreenBtn').onclick=toggleBattleFullscreen; $('#battleFocusAttackBtn').onclick=openBattleAttackPickerFromFocus; $('#battleStorySpeakBtn').onclick=toggleBattleStoryNarration;
  $('#battleAttackChoices').addEventListener('click',e=>{const b=e.target.closest('[data-battle-attack]');if(b&&!b.disabled)selectBattleAttack(b.dataset.battleAttack)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('battle-immersive'))returnFromBattle()});
  $('#parentAreaBtn').onclick=()=>openParentGate(); $('#childModeBtn').onclick=exitParentMode;
  $('#parentLibraryBtn').onclick=openLearningContentPlanner; $('#parentTestPlanBtn').onclick=openTestDatePlanner; $('#parentDashboardBtn').onclick=()=>showView('dashboardView'); $('#parentSettingsBtn').onclick=()=>showView('settingsView');
  window.VTParentDocs?.bind?.();
  $$('[data-parent-home]').forEach(b=>b.onclick=()=>showView('parentView'));
  document.addEventListener('click',e=>{const b=e.target.closest?.('[data-speak]');if(!b)return;e.preventDefault();e.stopPropagation();speak(b.dataset.speak||'')});
  $('#fontSizeRange').oninput=e=>{learner().fontSize=+e.target.value;save()}; $('#letterSpacingRange').oninput=e=>{learner().letterSpacing=+e.target.value;save()}; $('#flashSpeedSelect').onchange=e=>{learner().flashSpeed=+e.target.value;save()}; $('#autoSpeakCorrection')?.addEventListener('change',e=>{learner().autoSpeakCorrection=!!e.target.checked;save()});
  $('#familySyncSetupBtn').onclick=openFamilySyncSetup; $('#familySyncNowBtn').onclick=runFamilySync; $('#familySyncChildBtn').onclick=()=>window.openChildDeviceInvite?window.openChildDeviceInvite():toast('Geräteverbindung konnte nicht geladen werden.','bad'); $('#familySyncParentBtn').onclick=()=>window.openParentDeviceInvite?window.openParentDeviceInvite():toast('Geräteverbindung konnte nicht geladen werden.','bad'); $('#familySyncSwitchBtn').onclick=openFamilySyncSwitch;
  $('#backupBtn').onclick=backup; $('#resetAppBtn').onclick=resetAppData; $('#restoreBtn').onclick=()=>{const f=$('#fileInput');f.accept='.json,application/json';f.dataset.mode='restore';f.click()}; $('#exportCsvBtn').onclick=exportCsv; $('#libraryUseBtn').onclick=openLearningContentPlanner; $('#librarySearchInput').oninput=()=>{libraryRenderLimit=200;renderLibrary()}; $('#librarySetFilter').onchange=()=>{libraryRenderLimit=200;renderLibrary()};
  $('#fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const mode=e.target.dataset.mode,limit=mode==='restore'?MAX_BACKUP_BYTES:MAX_CSV_BYTES;if(f.size>limit){toast(`${mode==='restore'?'Backup':'CSV'} ist zu groß (${fmtBytes(f.size)}).`,'bad');e.target.value='';return}try{const text=await f.text();if(mode==='restore')restore(text);else importCsv(text)}catch(err){console.warn(err);toast('Datei konnte nicht gelesen werden.','bad')}e.target.value=''}; $('#photoInput').onchange=async e=>{const f=e.target.files[0];if(f)await handleScanPhoto(f);e.target.value=''}; $('#isbnPhotoInput').onchange=async e=>{const f=e.target.files[0];if(f)await handleIsbnPhoto(f);e.target.value=''};
  $('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()}); $('#modal').addEventListener('close',()=>{restoreModalFocus();if(scanImportState.imageUrl){URL.revokeObjectURL(scanImportState.imageUrl);scanImportState.imageUrl=null;}scanImportState.lastFile=null;});
  const openIosInstallGuide=()=>modal(`<div class="eyebrow">iPhone / iPad</div><h2>Ohne Safari-Leiste öffnen</h2><p>Lege den Vokabeltrainer einmal als Web-App auf den Home-Bildschirm:</p><ol><li>Unten in Safari auf <strong>Teilen</strong> tippen.</li><li><strong>Zum Home-Bildschirm</strong> wählen.</li><li><strong>Als Web-App öffnen</strong> eingeschaltet lassen.</li><li><strong>Hinzufügen</strong> bestätigen.</li><li>Danach das neue <strong>Vokabeltrainer</strong>-Symbol öffnen.</li></ol><div class="notice warn"><strong>Wichtig bei iOS 15:</strong><br>Safari und die Home-Bildschirm-Web-App verwenden getrennten lokalen Speicher. Eine Kindergeräte-Verbindung aus Safari wird deshalb nicht automatisch übernommen. Verbinde das Kindergerät nach dem Hinzufügen einmalig in der Home-Bildschirm-App mit einem frischen Verbindungslink oder Gerätecode.</div><div class="modal-actions"><button value="ok" class="primary">Verstanden</button></div>`);
  const syncInstallUi=()=>{const iosSafariMode=isIOSDevice()&&!isStandaloneWebApp();$('#iosInstallCard')?.classList.toggle('hidden',!iosSafariMode);if(iosSafariMode)$('#installBtn')?.classList.add('hidden');renderStandaloneSyncNotice()};
  syncInstallUi();$('#iosInstallBtn').onclick=openIosInstallGuide;$('#iosStandaloneSyncBtn').onclick=openFamilySyncChildJoin;
  syncResponsiveHomeLayout();window.addEventListener('resize',syncResponsiveHomeLayout,{passive:true});
  window.addEventListener('pagehide',()=>persistOnly());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistOnly()});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(!isIOSDevice())$('#installBtn').classList.remove('hidden')}); $('#installBtn').onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').classList.add('hidden');return}openIosInstallGuide()};
}