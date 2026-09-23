'use strict';

let appRole='child';
const PARENT_VIEW_IDS=new Set(['parentView','libraryView','dashboardView','settingsView']);
function isParentMode(){return appRole==='parent'}


let battleAttackMode='charge';
const BATTLE_ATTACKS={
  charge:{label:'Sturmangriff',short:'Sturm',unlock:0,icon:'⚔',message:'Die Infanterie stürmt geschlossen vor!'},
  volley:{label:'Pfeilhagel',short:'Pfeile',unlock:20,icon:'➶',message:'Bogenschützen legen einen Pfeilhagel auf die Mauer!'},
  ram:{label:'Rammbock',short:'Rammbock',unlock:35,icon:'▰',message:'Der Rammbock rollt direkt auf das Tor zu!'},
  cavalry:{label:'Reiterangriff',short:'Reiter',unlock:55,icon:'♞',message:'Die Reiter brechen aus der Flanke hervor!'},
  special:{label:'Spezialangriff',short:'Spezial',unlock:70,icon:'★',message:'Die Elite setzt zum Spezialangriff an!'}
};
const BATTLE_BOSSES={
  citadel:{name:'Der Torwächter',text:'Er hält den Zugang zur Bergzitadelle.'},
  capital:{name:'Der Hauptmann',text:'Die stärksten Verteidiger stehen vor der Hauptfestung.'},
  final:{name:'Der Adlerwächter',text:'Der letzte Wächter schützt die Jahresfestung.'}
};
const BATTLE_STORY={
  outpost:{title:'Der erste Vorposten',text:'Am Rand des Feldzugs versperrt ein kleiner Vorposten den Weg. Deine Truppe sammelt sich zum ersten Angriff.'},
  tower:{title:'Der Wachturm',text:'Vom hohen Turm aus wird jeder Schritt beobachtet. Deine Armee muss weiterlernen, um näher heranzukommen.'},
  wall:{title:'Die Grenzmauer',text:'Hinter der langen Mauer beginnt das Kernland. Neue Einheiten schließen sich deinem Feldzug an.'},
  citadel:{title:'Die Bergzitadelle',text:'Vor der Zitadelle wartet der Torwächter. Nur gefestigtes Wissen bringt die Armee durch das Tor.'},
  capital:{title:'Vor der Hauptfestung',text:'Der Hauptmann hat seine besten Truppen versammelt. Dein bisheriger Lernweg entscheidet, wie stark deine Armee ist.'},
  final:{title:'Die große Testfestung',text:'Ein großer Testumfang liegt vor dir. Jeder abgeschlossene Lerntag schwächt die Verteidigung; gefestigtes Wissen macht die Angriffe stärker.'}
};
function specialAttackMeta(subject=state.activeSubject){
  return subject==='latin'
    ?{label:'Adlerstandarte',short:'Adler',icon:'★',message:'Die Adlerstandarte wird gehoben. Die Elite rückt geschlossen vor!'}
    :{label:'Eliteangriff',short:'Elite',icon:'★',message:'Die Eliteeinheiten führen den Angriff an!'};
}
function battleAttackMeta(mode){return mode==='special'?{...BATTLE_ATTACKS.special,...specialAttackMeta()}:BATTLE_ATTACKS[mode]}
function attackUnlocked(mode,pct=subjectProgress().pct){const a=BATTLE_ATTACKS[mode];return !!a&&pct>=a.unlock}
function battleBossFor(f){return f?BATTLE_BOSSES[f.id]||null:null}
function battleStoryFor(f){
  if(!f)return {title:'Noch keine Testfestung',text:'Sobald ein Test geplant ist, entsteht hier automatisch die passende Festung.'};
  const base=BATTLE_STORY[f.id]||{title:f.name,text:'Deine Armee bereitet den nächsten Schritt vor.'};
  return {title:base.title,text:`${base.text} Diese Festung steht für ${f.scopeText||'deinen nächsten Test'} am ${formatDateShort(f.testDate)}.`};
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
  const id=f.id||'outpost',name=f.name||'Festung',captured=!!f.capturedAt;
  if(!large)return `<div class="fortress fortress-${esc(id)} ${captured?'captured':''}" aria-label="${esc(name)}"><div class="gate"></div><div class="flag"></div><div class="mini-keep"></div></div>`;
  return `<div class="battle-fortress fortress-${esc(id)} ${captured?'captured':''}"><div class="tower tower-left"></div><div class="tower tower-right"></div><div class="wall"><div class="battle-gate"></div><div class="crack c1"></div><div class="crack c2"></div></div><div class="battle-keep"></div><div class="battle-enemy-flag"></div></div>`;
}
function seasonEffectsMarkup(){
  return `<div class="battle-season-fx" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i class="season-particle season-d${i%6}"></i>`).join('')}</div>`;
}
function renderBattlefield(){
  const p=subjectProgress(),f=currentTestFortress(),sea=seasonInfo(),count=soldiersFor(p.pct),tickets=battleTickets();
  const siege=p.pct>=35?'<div class="siege" title="Belagerungsgerät freigeschaltet"></div>':'';
  const campaign=subjectCampaign(state.activeSubject),field=$('#battlefield');if(!field)return;
  const damagePct=f?clamp(Math.round((1-(Number(f.defense)||0)/Math.max(1,Number(f.maxDefense)||1))*100),0,100):0;
  field.className=`battlefield ${sea.class} subject-${state.activeSubject} gear-${gearTier(p.pct)} ${tickets?'battle-ready':''} ${f?.capturedAt?'battle-captured':''}`;
  field.dataset.damage=damagePct>=66?'high':damagePct>=33?'mid':damagePct>0?'low':'none';
  field.setAttribute('aria-label',`${campaign.unitLabel}: ${p.pct}% Schuljahresfortschritt, Rang ${rankFor(p.pct,state.activeSubject)}, ${f?`Testfestung ${f.name} am ${formatDateShort(f.testDate)}`:'kein Test geplant'}`);
  field.innerHTML=`<div class="sun"></div><div class="preview-cloud cloud-a"></div><div class="preview-cloud cloud-b"></div>${sea.class==='winter'?'<div class="snow"></div>':''}${sea.festive?`<div class="festive">${esc(campaign.festive)}</div>`:''}<div class="army"><div class="preview-standard"></div>${battleUnitsMarkup(count,false,p.pct)}${siege}</div>${fortressMarkup(f,false)}`;
}
function renderBattleAttackChoices(pct=subjectProgress().pct){
  const box=$('#battleAttackChoices');if(!box)return;
  if(!attackUnlocked(battleAttackMode,pct))battleAttackMode='charge';
  box.innerHTML=Object.entries(BATTLE_ATTACKS).map(([id,a])=>{
    const meta=battleAttackMeta(id),unlocked=attackUnlocked(id,pct),active=id===battleAttackMode;
    return `<button type="button" class="battle-attack-choice ${active?'active':''} ${id==='special'?'special':''}" data-battle-attack="${esc(id)}" ${unlocked?'':'disabled'} aria-pressed="${active?'true':'false'}"><span>${meta.icon}</span><strong>${esc(meta.label)}</strong><small>${unlocked?'bereit':`ab ${a.unlock}%`}</small></button>`;
  }).join('');
}
function selectBattleAttack(mode){
  const p=subjectProgress().pct;if(!attackUnlocked(mode,p))return;
  battleAttackMode=mode;renderBattleAttackChoices(p);
  const a=battleAttackMeta(mode);$('#battleMessage').className='battle-message';$('#battleMessage').textContent=`${a.label} gewählt. ${a.message}`;
  if($('#battleAttackBtn'))$('#battleAttackBtn').textContent=`${a.short}: Angriff starten`;
}
function renderBattleView(){
  const stage=$('#battleStage');if(!stage)return;
  const p=subjectProgress(),f=currentTestFortress(),tickets=battleTickets(),count=Math.min(18,Math.max(7,soldiersFor(p.pct)+4)),sea=seasonInfo();
  const campaign=subjectCampaign(state.activeSubject),rank=rankFor(p.pct,state.activeSubject),gear=gearLabelFor(p.pct,state.activeSubject),secure=!!f?.capturedAt,boss=!secure?battleBossFor(f):null,story=battleStoryFor(f),attack=battleAttackMeta(battleAttackMode);
  const damagePct=f?clamp(Math.round((1-(Number(f.defense)||0)/Math.max(1,Number(f.maxDefense)||1))*100),0,100):0;
  const usedToday=!!battleDayState(state.activeSubject,false)?.actionUsed;
  const grade=testFortressGrade(f);
  $('#battleTicketPill').textContent=!f?'Kein Test':secure?(tickets?'1 Sicherung':'0 Sicherungen'):(tickets?'1 Angriff':'0 Angriffe');
  $('#battleStrength').textContent=armyStrength();
  $('#battleFortressName').textContent=f?`${f.name} · Test ${formatDateShort(f.testDate)}`:'Kein Test geplant';
  $('#battleFortressProgress').textContent=!f?'–':secure?'Erobert · gesichert '+(f.securedDates?.length||0)+'×':`${f.defense} / ${f.maxDefense} Verteidigung`;
  $('#battleRankGear').textContent=`${rank} · ${gear}`;
  $('#battleTitle').textContent=f?(secure?`${f.name} sichern`:`${campaign.unitLabel} gegen ${f.name}`):'Deine Armee ist bereit';
  $('#battleSubtitle').textContent=!f?'Sobald ein Test geplant ist, erscheint hier die nächste Festung.':secure?(tickets?'Die Festung ist erobert. Heute kannst du sie für den Test sichern.':`Erobert · ${f.scopeText}${grade?` · Note ${grade.grade}`:''}`):(tickets?'Dein Tagesangriff ist bereit. Jeder Lerntag schwächt die Festung.':`${f.scopeText} · Test ${formatDateShort(f.testDate)}`);
  $('#battleStoryTitle').textContent=story.title;$('#battleStoryText').textContent=story.text+(grade?` Ergebnis eingetragen: Note ${grade.grade}.`:'');$('#battleStory').classList.toggle('story-complete',secure);
  const bossPanel=$('#battleBossPanel');bossPanel.classList.toggle('hidden',!boss);
  if(boss){$('#battleBossName').textContent=boss.name;$('#battleBossText').textContent=boss.text;$('#battleBossProgress').value=damagePct;$('#battleBossProgressText').textContent=`${damagePct}%`;}
  const tactics=$('#battleAttackChoices')?.closest('.battle-tactics');tactics?.classList.toggle('hidden',secure||!f);
  $('#battleAttackBtn').disabled=!f||tickets<1;
  $('#battleAttackBtn').textContent=!f?'Kein Test geplant':tickets?(secure?'Festung sichern':`${attack.short}: Angriff starten`):usedToday?(secure?'Heute bereits gesichert ✓':'Heute bereits angegriffen ✓'):(secure?'Nach Tagesziel: sichern':'Nach Tagesziel verfügbar');
  if($('#battleActionTitle'))$('#battleActionTitle').textContent=!f?'Keine Festung aktiv':tickets?(secure?'Sicherungseinsatz bereit':'Dein Angriff ist bereit'):usedToday?(secure?'Heute gesichert':'Tagesangriff verbraucht'):'Tagesziel noch offen';
  if($('#battleActionHint'))$('#battleActionHint').textContent=!f?'Plane zuerst einen Test.':tickets?(secure?'Halte die eroberte Festung bis zum Test sicher.':`${attack.label} wählen und die Festung weiter schwächen.`):usedToday?'Morgen gibt es nach dem nächsten Tagesziel wieder eine Aktion.':'Schließe zuerst dein Tagesziel ab.';
  $('#battleMessage').className='battle-message';$('#battleMessage').textContent=!f?'Kein Test – keine Belagerung.':tickets?(secure?'Sicherung ist bereit.':`${attack.label} ist bereit. Erwarteter Schaden: ${testFortressDamage(f).damage}.`):secure?'Festung bleibt erobert.':'Jeder abgeschlossene Lerntag bringt die Belagerung voran.';
  if(!secure&&f)renderBattleAttackChoices(p.pct);else if($('#battleAttackChoices'))$('#battleAttackChoices').innerHTML='';
  stage.className=`battle-stage season-${sea.class} subject-${state.activeSubject} gear-${gearTier(p.pct)} fortress-stage-${f?.id||'none'} ${boss?'boss-stage':''} ${secure?'fortress-secured':''}`;
  stage.dataset.damage=damagePct>=66?'high':damagePct>=33?'mid':damagePct>0?'low':'none';
  stage.setAttribute('aria-label',f?`${campaign.unitLabel} im Rang ${rank} vor ${f.name}. Festungsschaden ${damagePct} Prozent. Test am ${formatDateShort(f.testDate)}.`:`${campaign.unitLabel}: aktuell keine Testfestung.`);
  stage.innerHTML=`<div class="battle-sky"><i class="battle-sun"></i><i class="battle-cloud cloud-1"></i><i class="battle-cloud cloud-2"></i></div>${seasonEffectsMarkup()}<div class="battle-hills"></div><div class="battle-ground"></div><div class="battle-phase-strip" aria-hidden="true"><span data-battle-phase="rally"><i>1</i>${secure?'Sammeln':'Sammeln'}</span><span data-battle-phase="advance"><i>2</i>${secure?'Beziehen':'Vorrücken'}</span><span data-battle-phase="barrage"><i>3</i>${secure?'Patrouille':'Angriff'}</span><span data-battle-phase="impact"><i>4</i>${secure?'Sichern':'Einschlag'}</span><span data-battle-phase="result"><i>5</i>Ergebnis</span></div><div class="battle-rank-badge"><span>${esc(rank)}</span><small>${esc(gear)}</small></div><div class="battle-army"><div class="battle-standard"><i></i></div>${battleUnitsMarkup(count,true,p.pct)}${p.pct>=35?'<div class="battle-ram"><i></i><b></b></div>':''}</div><div class="battle-projectiles">${Array.from({length:9},(_,i)=>`<i class="arrow arrow-${i+1}"></i>`).join('')}</div><div class="battle-impact"><i></i><i></i><i></i></div><div class="battle-special-flare"><i></i><i></i><i></i></div><div class="battle-shockwave"></div>${boss?`<div class="battle-boss-character boss-${esc(f.id)}" aria-label="${esc(boss.name)}"><i class="boss-helmet"></i><i class="boss-body"></i><i class="boss-shield"></i></div>`:''}${fortressMarkup(f,true)}<div class="battle-dust"></div>`;
}
function openBattleView(){
  if(isParentMode())return;
  if(!currentTestFortress()){toast('Für die nächste Schlacht muss zuerst ein Test geplant sein.','subtle');return}
  renderBattleView();showView('battleView');
}
function closeBattleImmersive(){
  document.body.classList.remove('battle-immersive');$('#battleFullscreenBtn')?.setAttribute('aria-pressed','false');if($('#battleFullscreenBtn'))$('#battleFullscreenBtn').textContent='⛶ Vollbild';
  if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
}
function toggleBattleFullscreen(){
  const on=!document.body.classList.contains('battle-immersive');document.body.classList.toggle('battle-immersive',on);
  $('#battleFullscreenBtn')?.setAttribute('aria-pressed',String(on));if($('#battleFullscreenBtn'))$('#battleFullscreenBtn').textContent=on?'✕ Vollbild verlassen':'⛶ Vollbild';
  if(on){const el=$('#battleView');if(el?.requestFullscreen)el.requestFullscreen().catch(()=>{});}else if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(()=>{});
}
function runBattleAnimation(){
  const f=currentTestFortress(),stage=$('#battleStage'),button=$('#battleAttackBtn');if(!f||!stage||!button)return;
  const secureBefore=!!f.capturedAt;
  if(!spendBattleTicket()){toast('Die heutige Aktion wird erst nach dem Tagesziel freigeschaltet.','subtle');renderBattleView();return}
  const p=subjectProgress(),reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,attack=battleAttackMeta(battleAttackMode)||battleAttackMeta('charge'),boss=!secureBefore?battleBossFor(f):null;
  const timing=reduced?{advance:35,barrage:70,impact:105,result:145,ready:190}:{advance:1150,barrage:3200,impact:5200,result:7150,ready:8350};
  const phaseCopy=secureBefore?{
    rally:'Die Truppen sammeln sich in der eroberten Festung.',
    advance:'Wachen beziehen Tore und Mauern.',
    barrage:'Patrouillen sichern die Umgebung.',
    impact:'Vorräte und Verteidigung sind für den Testtag gesichert.'
  }:{
    rally:'Die Reihen schließen sich. Standarten hoch!',
    advance:'Die Armee rückt geschlossen auf die Testfestung vor.',
    barrage:battleAttackMode==='volley'?'Bogenschützen eröffnen den Pfeilhagel!':battleAttackMode==='ram'?'Der Rammbock wird nach vorne gebracht!':battleAttackMode==='cavalry'?'Die Reiter setzen zum Flankenangriff an!':battleAttackMode==='special'?attack.message:'Die Angriffswelle beginnt!',
    impact:battleAttackMode==='special'?(state.activeSubject==='latin'?'Die Adlerstandarte führt die Elite durch die Verteidigung!':'Die Elite trifft mit voller Wucht!'):battleAttackMode==='volley'?'Die Salven schlagen auf Zinnen und Tor ein!':battleAttackMode==='cavalry'?'Die Reiter erreichen die Festungsmauer!':battleAttackMode==='ram'?'Der Rammbock kracht gegen das Tor!':'Die Truppen treffen auf die Verteidigung!'
  };
  const setPhase=(phase,message)=>{
    stage.dataset.phase=phase;stage.classList.remove('phase-rally','phase-advance','phase-barrage','phase-impact','phase-result');stage.classList.add('phase-'+phase);
    $$('.battle-phase-strip [data-battle-phase]').forEach(el=>{const order={rally:1,advance:2,barrage:3,impact:4,result:5},here=el.dataset.battlePhase;el.classList.toggle('active',here===phase);el.classList.toggle('done',(order[here]||0)<(order[phase]||0));});
    if(message)$('#battleMessage').textContent=message;
  };
  button.disabled=true;$('#battleFullscreenBtn').disabled=true;$$('.battle-attack-choice').forEach(b=>b.disabled=true);
  stage.classList.remove('battle-finished','is-victory','is-hold','is-impact','is-attacking','battle-sequence');stage.classList.add('battle-sequence',`attack-${secureBefore?'charge':battleAttackMode}`);
  $('#battleMessage').className='battle-message active';if($('#battleActionTitle'))$('#battleActionTitle').textContent=secureBefore?'Sicherung läuft':'Schlacht läuft';if($('#battleActionHint'))$('#battleActionHint').textContent='Die Sequenz läuft bis zum Ergebnis.';setPhase('rally',phaseCopy.rally);
  setTimeout(()=>{stage.classList.add('is-attacking');setPhase('advance',phaseCopy.advance);},timing.advance);
  setTimeout(()=>{stage.classList.add('is-barrage');setPhase('barrage',phaseCopy.barrage);},timing.barrage);
  setTimeout(()=>{stage.classList.add('is-impact');setPhase('impact',phaseCopy.impact);},timing.impact);
  setTimeout(()=>{
    const result=resolveTestFortressAction(secureBefore?'secure':battleAttackMode);const won=result?.result==='win',secured=result?.result==='secure';
    stage.classList.remove('is-attacking','is-barrage');stage.classList.add('battle-finished',(won||secured)?'is-victory':'is-hold');setPhase('result');
    if(secured){$('#battleMessage').className='battle-message victory';$('#battleMessage').innerHTML='<strong>Festung gesichert!</strong><span>Die Stellung bleibt bis zum Test unter Kontrolle.</span>';}
    else if(won){$('#battleMessage').className='battle-message victory';$('#battleMessage').innerHTML=`<strong>${boss?'Boss besiegt!':'Festung erobert!'}</strong><span>${esc(f.name)} ist gefallen. +20 XP · Jetzt bis zum Test sichern.</span>`;}
    else{$('#battleMessage').className='battle-message hold';$('#battleMessage').innerHTML=`<strong>Angriff gelungen!</strong><span>${result?.damage||0} Schaden. Noch ${result?.remaining||0} Verteidigung bis zur Eroberung.</span>`;}
    persistOnly();
  },timing.result);
  setTimeout(()=>{
    $('#battleFullscreenBtn').disabled=false;stage.classList.remove('battle-sequence','is-impact');
    const live=currentTestFortress(),left=battleTickets(),secure=!!live?.capturedAt,usedToday=!!battleDayState(state.activeSubject,false)?.actionUsed;
    $('#battleTicketPill').textContent=secure?(left?'1 Sicherung':'0 Sicherungen'):(left?'1 Angriff':'0 Angriffe');$('#battleStrength').textContent=armyStrength();$('#battleFortressName').textContent=live?`${live.name} · Test ${formatDateShort(live.testDate)}`:'Kein Test geplant';$('#battleFortressProgress').textContent=!live?'–':secure?'Erobert · gesichert '+(live.securedDates?.length||0)+'×':`${live.defense} / ${live.maxDefense} Verteidigung`;
    button.disabled=!live||left<1;button.textContent=!live?'Kein Test geplant':left?(secure?'Festung sichern':`${battleAttackMeta(battleAttackMode).short}: Angriff starten`):usedToday?(secure?'Heute bereits gesichert ✓':'Heute bereits angegriffen ✓'):'Nach Tagesziel verfügbar';
    if($('#battleActionTitle'))$('#battleActionTitle').textContent=secure?'Festung erobert':'Belagerung läuft';if($('#battleActionHint'))$('#battleActionHint').textContent=secure?'Bis zum Test bleibt diese Festung dein Ziel.':'Morgen bringt das nächste Tagesziel einen neuen Angriff.';
    renderBattlefield();
  },timing.ready);
}
function renderAll(){
  const l=learner(); if(!l) return; ensureActiveSubject();applyPreferences();
  const profileBtn=$('#profileBtn');profileBtn.textContent=l.name;profileBtn.setAttribute('aria-label',`Lernprofil wechseln. Aktiv: ${l.name}`);profileBtn.title='Profil wechseln'; $('#lrsBadge').classList.toggle('hidden',!l.lrsMode); applyRoleUi();
  const activeSubjects=learnerActiveSubjects(l),switcher=$('#subjectSwitcher');
  if(switcher){switcher.innerHTML=activeSubjects.map(subject=>`<button data-subject="${esc(subject)}" class="subject-btn ${subject===state.activeSubject?'active':''}" aria-pressed="${subject===state.activeSubject?'true':'false'}">${esc(subjectShort(subject))}</button>`).join('');switcher.classList.toggle('hidden',activeSubjects.length<=1);$$('.subject-btn').forEach(b=>b.onclick=()=>{if(!isSubjectActive(b.dataset.subject))return;state.activeSubject=b.dataset.subject;save()})}
  $('#subjectLabel').textContent=subjectLabel(state.activeSubject);
  const p=subjectProgress(); $('#masteryPct').textContent=`${p.pct}%`; $('#masteryProgress').value=p.pct; $('#masteryProgress').setAttribute('aria-valuetext',`${p.pct} Prozent nachhaltig gemeistert`); $('#masteryWords').textContent=`${p.mastered} / ${p.total} gemeistert`; $('#schoolYearPill').textContent=p.schoolYear; $('#dueCount').textContent=dueWords().length; $('#streakCount').textContent=streak(); $('#xpCount').textContent=l.xp; $('#stableCount').textContent=p.stable;
  const campaign=subjectCampaign(state.activeSubject);$('#campaignTitle').textContent=campaign.title;$('#campaignEyebrow').textContent=campaign.eyebrow; $('#armyRank').textContent=rankFor(p.pct,state.activeSubject); $('#armyStrength').textContent=armyStrength(); $('#gearLevel').textContent=gearFor(p.pct);
  const nf=currentTestFortress(),tickets=battleTickets(),usedToday=!!battleDayState(state.activeSubject,false)?.actionUsed,secured=!!nf?.capturedAt;
  $('#fortressRequirement').textContent=!nf?'Kein Test geplant':secured?`Erobert · Test ${formatDateShort(nf.testDate)}`:`${nf.defense} Verteidigung · Test ${formatDateShort(nf.testDate)}`;
  $('#attackBtn').disabled=!nf;$('#attackBtn').textContent=!nf?'Keine Festung':tickets?(secured?'Sicherung bereit':'Angriff bereit'):'Zur Festung';
  $('#campaignMessage').className=`notice ${tickets?'good':'subtle'}`;$('#campaignMessage').textContent=!nf?'Für einen geplanten Test entsteht automatisch eine Festung.':tickets?(secured?'Dein heutiger Sicherungseinsatz ist bereit.':'Dein Tagesangriff ist bereit.'):secured?`Festung erobert. Bis zum Test ${formatDateShort(nf.testDate)} sichern.`:usedToday?`Heute angegriffen · noch ${nf.defense} Verteidigung.`:`Noch ${nf.defense} Verteidigung. Nach dem Tagesziel kannst du angreifen.`;
  const hasSubjectWords=myWords().length>0; $('#campaignCard').classList.toggle('hidden',!hasSubjectWords); $('#optionalLearningCard').classList.toggle('hidden',!hasSubjectWords); renderToday(); renderTestCheck(); renderBattlefield(); renderBattleView(); renderRecommendations(); renderSets(); renderDashboard(); renderLibrary(); renderProfiles();
  $('#fontSizeRange').value=l.fontSize; $('#letterSpacingRange').value=l.letterSpacing; $('#flashSpeedSelect').value=String(l.flashSpeed);
  renderParentOverview(); renderFamilySync(); checkHundredPercent(); renderStorageStatus();
}
function applyPreferences(){const l=learner();document.documentElement.dataset.fontSize=String(clamp(Number(l.fontSize)||17,16,24));document.documentElement.dataset.letterSpace=String(clamp(Number(l.letterSpacing)||0,0,3));document.documentElement.classList.toggle('lrs-mode',!!l.lrsMode)}

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
  const parent=isParentMode(),reviewSet=mySets().find(setNeedsPairReview),practiceDisclosure=$('#practiceDisclosure'),cardCount=schoolYearVerifiedWords().length,cardsBtn=$('#quickCardsBtn');
  if(cardsBtn){cardsBtn.disabled=!cardCount;cardsBtn.textContent=cardCount?'▥ Karteikarten':'▥ Noch keine Karten'}
  practiceDisclosure?.classList.remove('hidden');
  if(reviewSet){
    const count=setWords(reviewSet.id).length,progressRow=$('#todayProgress')?.closest('.today-progress-row');
    progressRow?.classList.add('hidden');$('#todayProgressText').textContent='';
    $('#todaySummary').textContent=parent?'Vokabelpaare prüfen':'Neue Wörter werden vorbereitet';
    $('#todayContext').textContent=`${reviewSet.title} · ${count} ${count===1?'Vokabel':'Vokabeln'}`;
    $('#todayEstimate').textContent=parent?'Prüfe Wort und Bedeutung, bevor das Kind mit diesen Vokabeln lernt.':'Ein Erwachsener prüft noch, ob Wort und Bedeutung richtig zusammengehören.';
    $('#quickLearnHeroBtn').disabled=!parent;$('#quickLearnHeroBtn').textContent=parent?'Paare prüfen':'Noch nicht bereit';
    $('#todayTestPill').classList.add('hidden');$('#todayTestBtn').classList.add('hidden');return;
  }
  const plan=buildDailyPlan(),status=dailyPlanStatus(plan),ctx=upcomingTestContext(),pending=seriesScopePending(),pendingIsNext=!!(pending&&(!ctx||pending.date<=ctx.date)),hasWords=(ctx?.words.length||schoolYearVerifiedWords().length)>0; const progressRow=$('#todayProgress')?.closest('.today-progress-row');
  if(pendingIsNext){
    const subjectName=subjectLabel(state.activeSubject),when=pending.days===0?'heute':pending.days===1?'morgen':`in ${pending.days} Tagen`;
    $('#todaySummary').textContent=parent?'Testumfang festlegen':'Der nächste Test wird vorbereitet';
    $('#todayContext').textContent=`${subjectName}-Test ${when}`;
    $('#todayEstimate').textContent=parent?'Lege fest, welche Lektion oder welcher Vokabelbereich drankommt.':'Ein Erwachsener trägt noch ein, welche Vokabeln im nächsten Test drankommen.';
    progressRow?.classList.add('hidden');$('#todayProgressText').textContent='';$('#quickLearnHeroBtn').disabled=!parent||!mySets().length;$('#quickLearnHeroBtn').textContent=parent?'Testumfang festlegen':'Noch nicht bereit';
    $('#todayTestPill').textContent=`↻ ${WEEKDAYS_SHORT[Number(pending.series.weekday)||0]} · ${formatDateShort(pending.date)}`;$('#todayTestPill').classList.remove('hidden');
    if(parent){$('#todayTestBtn').textContent='Serientermin ändern';$('#todayTestBtn').classList.remove('hidden')}else $('#todayTestBtn').classList.add('hidden');
    return;
  }
  progressRow?.classList.remove('hidden');
  if(!hasWords){
    practiceDisclosure?.classList.add('hidden');
    $('#todaySummary').textContent=parent?'Noch keine Vokabeln':'Heute ist noch nichts vorbereitet';
    $('#todayContext').textContent=parent?'Plane einen Test oder bereite Vokabeln ohne Testtermin vor.':'Bitte einen Erwachsenen, neue Vokabeln vorzubereiten.';
    $('#todayEstimate').textContent=parent?'Danach erscheinen die freigegebenen Wörter automatisch im Kindermodus.':'Sobald alles vorbereitet ist, erscheint hier automatisch deine nächste Lernaufgabe.';
  }else if(!status.total){$('#todaySummary').textContent='Tagesziel geschafft';$('#todayContext').textContent=ctx?testContextLabel(ctx):'Heute ist keine Pflicht-Wiederholung offen.';$('#todayEstimate').textContent='Weitere Übungen sind optional.';}
  else if(!status.remaining){$('#todaySummary').textContent=`${status.total} von ${status.total} erledigt ✓`;$('#todayContext').textContent=ctx?testContextLabel(ctx):'Dein heutiges Lernpensum ist erledigt.';$('#todayEstimate').textContent='Weitere Übungen sind optional.';}
  else{
    const mix=[];if(status.introRemaining)mix.push(`${status.introRemaining} neu`);if(status.reviewRemaining)mix.push(`${status.reviewRemaining} Wiederholung${status.reviewRemaining===1?'':'en'}`);
    $('#todaySummary').textContent=status.done?`Noch ${status.remaining} von ${status.total} Vokabeln`:`${status.total} Vokabel${status.total===1?'':'n'} heute`;
    $('#todayContext').textContent=ctx?testContextLabel(ctx):(mix.length?mix.join(' · '):'Automatisch aus fälligen und unsicheren Vokabeln');
    const mins=Math.max(2,Math.ceil(status.remaining*(learner().lrsMode?.9:.65))),phaseText=plan.phase==='acquire'?' · Neue Wörter früh aufbauen.':plan.phase==='consolidate'?' · Schwerpunkt: aktiv festigen.':plan.phase==='rehearse'?' · Kurz vor dem Test: überwiegend abrufen und wiederholen.':'';
    const maintenance=plan.maintenanceCount?` · ${plan.maintenanceCount} ältere Wiederholung${plan.maintenanceCount===1?'':'en'} dabei.`:'',deadline=plan.deadlineOverload?` · Mit maximal 7 neuen Wörtern pro Tag reicht die Zeit bis zum Test rechnerisch nicht ganz; Testumfang oder Starttermin prüfen.`:'';
    const paceText=ctx?(plan.spacingRisk?' · Der Test ist sehr nah; für neue Wörter fehlt ausreichender Wiederholungsabstand.':plan.pace==='ahead'?' · Du liegst vor dem Plan; das Tagesziel wurde reduziert.':plan.pace==='catchup'?' · Es gibt Nachholbedarf; das Tagesziel wurde erhöht.':plan.pace==='overload'?' · Deutlicher Rückstand: maximale neue Wörter plus zusätzliche Wiederholungen.':' · Das Tagesziel passt zum aktuellen Lernstand.'):'';
    $('#todayEstimate').textContent=`${status.units} kurze ${status.units===1?'Einheit':'Einheiten'} · ca. ${mins} Min. · Ziel heute: ${plan.dailyTarget} Kontakte.${phaseText}${maintenance}${paceText}${deadline}`;
  }
  $('#todayProgress').max=Math.max(1,status.total); $('#todayProgress').value=status.done; $('#todayProgress').setAttribute('aria-valuetext',`${status.done} von ${status.total} Vokabeln heute erledigt`); $('#todayProgressText').textContent=status.total?`${status.done} / ${status.total} erledigt`:'';
  $('#quickLearnHeroBtn').disabled=!hasWords||!status.remaining; $('#quickLearnHeroBtn').textContent=!hasWords?'Noch nicht bereit':!status.remaining?'Heute erledigt ✓':status.done?'Weiterlernen':'Tagesziel starten';
  if(ctx){$('#todayTestPill').textContent=(ctx.source==='series'||ctx.source==='mixed')?`↻ ${WEEKDAYS_SHORT[Number(ctx.series?.weekday)||0]} · ${formatDateShort(ctx.date)}`:`Test ${formatDateShort(ctx.date)}`;$('#todayTestPill').classList.remove('hidden');if(parent){$('#todayTestBtn').textContent='Testplan ändern';$('#todayTestBtn').classList.remove('hidden');$('#todayTestBtn').dataset.setId=ctx.sets[0]?.id||'';}else $('#todayTestBtn').classList.add('hidden');}
  else{$('#todayTestPill').classList.add('hidden');if(parent&&mySets().length){$('#todayTestBtn').textContent='Testplan festlegen';$('#todayTestBtn').classList.remove('hidden');}else $('#todayTestBtn').classList.add('hidden');}
}function renderRecommendations(){
  const l=learner(),due=dueWords(),cardPool=schoolYearVerifiedWords(),weak=cardPool.filter(w=>!isMastered(w)).sort((a,b)=>masteryScore(a)-masteryScore(b)),chunkWords=cardPool.filter(chunkEligibleWord);
  const recs=[];
  recs.push({icon:'∞',title:'Alle Vokabeln',sub:`${cardPool.length} Wörter · Bereich frei wählen`,mode:'allWords'});
  recs.push({icon:'◎',title:'Unsichere üben',sub:weak.length?`${weak.length} noch nicht sicher`:'Aktuell nichts offen',mode:'weakWords',disabled:!weak.length});
  recs.push({icon:'✦',title:'Adaptiv lernen',sub:due.length?`${Math.min(due.length,l.lrsMode?6:10)} fällige Wörter`:'Schwächste Wörter festigen',mode:'adaptive'});
  const boxes=leitnerDistribution(cardPool),cardDue=cardPool.filter(w=>!w.dueDate||w.dueDate<=today()).length;
  recs.push({icon:'▥',title:'Karteikarten',sub:`schriftlich · 5 Boxen · ${cardDue} fällig · ${boxes[5]} gemeistert`,mode:'cards'});
  const copyPending=cardPool.filter(w=>!w.firstContactCompletedAt).length;
  recs.push({icon:'📝',title:'Abschreiben',sub:copyPending?`freiwillig · ${copyPending} noch nicht gemacht`:'freiwillig · als zusätzliche Schreibeinheit',mode:'copy'});
  recs.push({icon:'⚡',title:'Wortblitz',sub:l.lrsMode?'ruhiges Tempo · Audio zuerst':'Leseflüssigkeit ohne Wertungsdruck',mode:'flash'});
  recs.push({icon:'🔊',title:'Vokabeldusche',sub:'aktiv mit Denkpause oder passiv anhören',mode:'shower'});
  if(chunkWords.length)recs.push({icon:'🧩',title:'Wortbausteine',sub:`${chunkWords.length} geeignete Wörter · keine ganzen Sätze`,mode:'chunks'});
  const spellingWeak=weak.filter(w=>(w.errorProfile?.spelling||0)>0||(w.skills?.spelling||0)<2);
  if(l.lrsMode||spellingWeak.length)recs.push({icon:'✍️',title:'Handschrift',sub:'nachfahren · abdecken · aus dem Gedächtnis schreiben',mode:'handwriting'});
  if(subjectHasCapability(state.activeSubject,'latinGrammar'))recs.push({icon:'Ⅳ',title:'Latein Formen',sub:'Genitiv · Genus · Stammformen · Anwendung',mode:'latinGrammar'});
  $('#recommendations').innerHTML=recs.map(r=>`<button class="recommend" data-mode="${r.mode}" ${r.disabled?'disabled':''}><span class="icon">${r.icon}</span><strong>${r.title}</strong><small>${r.sub}</small></button>`).join('');
  $$('#recommendations [data-mode]').forEach(b=>b.onclick=()=>{const mode=b.dataset.mode;if(mode==='copy')startCopyPractice();else if(mode==='allWords')openAllWordsPracticeChooser();else if(mode==='weakWords')startWeakWordsPractice();else startSession(mode)});
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
  s.pairReviewRequired=true;s.pairVerifiedAt='';rebuildWordIndexes();return true;
}
function openSetPairAudit(setId){
  const s=state.sets.find(x=>x.id===setId);if(!s)return;
  const words=setWords(setId),required=setNeedsPairReview(s);
  const rows=words.map((w,i)=>`<tr><td>${i+1}</td><td><strong>${esc(w.term)}</strong></td><td>${esc(w.translation)}</td><td><small>${esc(termTargets(w).join(' · '))}</small></td><td><small>${esc(translationTargets(w).join(' · '))}</small></td></tr>`).join('');
  modal(`<div class="eyebrow">Vokabeln prüfen</div><h2>${esc(s.title)}</h2>${required?'<div class="notice warn"><strong>Vor dem Lernen erforderlich.</strong><br>Bitte jedes Wort↔Bedeutung-Paar prüfen und erst danach freigeben.</div>':''}<p>Hier stehen exakt die Wort↔Bedeutung-Paare, die die Abfrage verwendet. Wenn diese Liste falsch ist, liegt der Fehler im Import – nicht in deiner Antwort.</p>${words.length?`<div class="table-wrap set-pair-audit"><table><thead><tr><th>#</th><th>Vokabel</th><th>Lehrwerksbedeutung</th><th>akzeptierte Wortformen</th><th>akzeptierte Bedeutungen</th></tr></thead><tbody>${rows}</tbody></table></div>`:'<div class="notice warn">Dieser Lernbereich enthält aktuell keine Vokabeln.</div>'}<div class="notice subtle top-space"><strong>Bei einem fehlerhaften Fotoimport:</strong> „Vokabeln neu einlesen“ entfernt nur die Zuordnungen und den bisherigen Lernstand dieses Lernbereichs. Profil, Lehrwerk und andere Lernbereiche bleiben erhalten.</div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button>${words.length?'<button type="button" id="copySetPairsBtn" class="ghost">Paare kopieren</button>':''}<button type="button" id="reimportSetBtn" class="secondary">Vokabeln neu einlesen</button>${required&&words.length?'<button type="button" id="confirmSetPairsBtn" class="primary">Paare stimmen · fürs Lernen freigeben</button>':''}</div>`);
  $('#copySetPairsBtn')?.addEventListener('click',()=>copySetPairAudit(setId));
  $('#confirmSetPairsBtn')?.addEventListener('click',()=>{const now=new Date().toISOString();s.pairReviewRequired=false;s.pairVerifiedAt=now;s.pairVerifiedSignature=pairReviewSignatureForSet(setId);for(const link of (state.setVocabulary||[]).filter(x=>x.setId===setId)){const v=(state.vocabulary||[]).find(x=>x.id===link.vocabId);if(v&&!v.verifiedAt)v.verifiedAt=now;if(v)v.updatedAt=now}syncSetToBookVocabulary(setId,now);closeModal();save();if(isParentMode()){showView('parentView');renderAll();toast('Vokabelpaare bestätigt. Das Kind kann die Wörter jetzt direkt lernen.','good')}else{showView('homeView');renderAll();toast('Vokabelpaare bestätigt. Die Wörter sind jetzt direkt lernbereit.','good')}});
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
  const desktopRows=visible.map(v=>`<tr><td><strong>${esc(v.term)}</strong>${v.extra?`<br><small>${esc(v.extra)}</small>`:''}${v.termVariants?.length?`<br><small>Varianten: ${esc(v.termVariants.join(' · '))}</small>`:''}</td><td>${meanings(v)}</td><td>${esc(info(v))}</td><td><button class="ghost" data-vocab-edit="${v.id}">Bearbeiten</button></td></tr>`).join('');
  const mobileRows=visible.map(v=>`<button class="library-word-card" data-vocab-edit="${v.id}"><span class="library-word-main"><strong>${esc(v.term)}</strong><span>${mobileMeaning(v)}</span></span><span class="library-word-meta">${esc(info(v))}</span><span class="library-word-chevron">›</span></button>`).join('');
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
  const days=testDate?Math.max(0,daysUntil(testDate)):null,pace=testDate?dailyPacePlan(newCount,weakCount,{days},!!l?.lrsMode):dailyPacePlan(newCount,weakCount,null,!!l?.lrsMode);
  return {l,count,newCount,weakCount,days,pace};
}
function contentPlanPreviewText(rows,learnerId,testDate=''){
  const {count,newCount,days,pace}=contentPlanPreviewData(rows,learnerId,testDate);
  if(!count)return 'Noch keine Vokabel ausgewählt.';
  if(!testDate)return `${count} Vokabeln ausgewählt. Ohne Testtermin startet die App normalerweise mit bis zu ${pace.quota||5} neuen Wörtern und ungefähr ${pace.dailyTarget} Kontakten pro Tag.`;
  if(days<1)return `${count} Vokabeln ausgewählt · Test ist heute. Für neue Wörter bleibt kein sinnvoller Lernabstand mehr; heute nur gezielt wiederholen.`;
  const windowText=pace.reviewOnlyDays?`${pace.acquisitionDays} Tag${pace.acquisitionDays===1?'':'e'} für neue Wörter + 1 Wiederholungstag`:`${pace.acquisitionDays} Lerntag${pace.acquisitionDays===1?'':'e'} vor dem Test`;
  if(pace.overload)return `${count} ausgewählt · Test in ${days} Tag${days===1?'':'en'} · ${newCount} noch neu · rechnerisch ${pace.requiredPerDay} neue Wörter pro Lerntag nötig. Maximal 7 werden angesetzt; das Tagesziel steigt auf bis zu etwa ${pace.dailyTarget} Kontakte. Zeit bis zum Test ist zu knapp für den vorgesehenen Abstand.`;
  if(pace.spacingRisk)return `${count} ausgewählt · Test ${days===1?'morgen':'heute'} · ${newCount} noch neu. Neue Wörter können noch begonnen werden, aber für verteilte Wiederholungen bleibt zu wenig Zeit. Der Plan priorisiert deshalb die wichtigsten Abrufe und markiert die Situation als knapp.`;
  if(!newCount)return `${count} ausgewählt · Test in ${days} Tag${days===1?'':'en'} · alle Wörter kennengelernt. Das Tagesziel wird anhand der noch unsicheren Wörter dynamisch auf etwa ${pace.dailyTarget} Kontakte angepasst.`;
  return `${count} ausgewählt · Test in ${days} Tag${days===1?'':'en'} · ${newCount} noch neu · ${windowText}. Aktuell etwa ${pace.quota} neue Wörter und insgesamt ${pace.dailyTarget} Kontakte pro Tag. Der Plan wird jeden Tag aus dem tatsächlichen Lernstand neu berechnet.`;
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
  modal(`<div class="eyebrow">Ohne Test lernen</div><h2>Welche Vokabeln soll das Kind ohne Testtermin lernen?</h2><p class="muted-line">Für einen anstehenden Test gehst du direkt über „Test planen“. Hier bereitest du nur zusätzlichen Lernstoff ohne Termin vor.</p><div class="content-source-row"><span>Quelle</span><div class="row gap wrap"><button type="button" id="contentSourceBook" class="secondary compact-action">Lehrwerk</button><button type="button" id="contentSourcePhoto" class="ghost compact-action">Foto / Text</button><button type="button" id="contentSourceManual" class="ghost compact-action">Manuell</button></div></div><label>Kind<select id="contentLearner">${learners.map(l=>`<option value="${esc(l.id)}" ${l.id===defaultLearner.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label><label>Lehrwerk<select id="contentBook">${books.map(b=>`<option value="${esc(b.id)}" ${b.id===defaultBook.id?'selected':''}>${esc(b.title||formatIsbn(b.isbn13))}${b.builtinSource?' · geprüft':''}</option>`).join('')}</select></label><label>Kapitel / Abschnitt<select id="contentSection"></select></label><div class="row spread align-center wrap content-picker-head"><strong id="contentSelectionCount">0 ausgewählt</strong><div class="row gap"><button type="button" id="contentSelectAll" class="ghost compact-action">Alle</button><button type="button" id="contentSelectNone" class="ghost compact-action">Keine</button></div></div><div class="vocab-range-picker"><span>Bereich</span><label>Von<input id="contentRangeFrom" type="number" inputmode="numeric" min="1" value="1"></label><label>Bis<input id="contentRangeTo" type="number" inputmode="numeric" min="1"></label><button type="button" id="contentSelectRange" class="secondary compact-action">Nur Bereich</button></div><div id="contentWordPicker" class="vocab-picker"></div><div id="contentPlanPreview" class="notice subtle"></div><div class="modal-actions wrap"><button type="button" id="contentManageLibrary" class="ghost">Bibliothek verwalten</button><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="contentSave" class="primary">Ohne Test vorbereiten</button></div>`);
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
  const meta=l=>{const active=learnerActiveSubjects(l).map(subjectShort).join(' · '),parts=[];if(l.gradeLevel)parts.push(`Klasse ${l.gradeLevel}`);if(l.lrsMode)parts.push('LRS');if(active)parts.push(active);parts.push(`${l.xp} XP`);return parts.join(' · ')};
  const books=l=>learnerActiveSubjects(l).map(subject=>{const b=currentBook(l.id,subject);return `<span class="profile-book-chip">${subjectShort(subject)} · ${b?esc(b.title||formatIsbn(b.isbn13)):'kein Lehrwerk'}</span>`}).join('');
  $('#profileList').innerHTML=state.learners.map(l=>`<div class="profile-row profile-row-rich"><div class="profile-main"><strong>${esc(l.name)}</strong><small class="profile-meta">${esc(meta(l))}</small><div class="profile-books">${books(l)}</div></div><div class="profile-actions"><button class="ghost" data-profile-use="${l.id}">${l.id===state.activeLearnerId?'Aktiv':'Wählen'}</button><button class="ghost" data-profile-edit="${l.id}">Bearbeiten</button><button class="ghost" data-profile-books="${l.id}">Lehrwerke</button><button class="ghost" data-profile-clear="${l.id}">Lernstoff löschen</button>${state.learners.length>1?`<button class="ghost" data-profile-del="${l.id}">×</button>`:''}</div></div>`).join('');
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
function decodeDuel(code){const raw=String(code||'').trim();if(!raw||raw.length>4096)throw new Error('Ungültiger Code');const x=JSON.parse(decodeURIComponent(escape(atob(raw))));if(!x||typeof x!=='object'||!isKnownSubject(x.subject)||typeof x.schoolYear!=='string')throw new Error('Ungültiger Code');const total=Math.max(0,Math.round(safeNumber(x.total,0,100000,0))),stable=Math.max(0,Math.round(safeNumber(x.stable,0,100000,0))),legacyStability=total?Math.round(stable/total*1000):0;return {v:3,name:subjectCampaign(x.subject).unitLabel,subject:x.subject,schoolYear:safeText(x.schoolYear,24),progress:safeNumber(x.progress,0,100,0),stability:Number.isFinite(Number(x.stability))?safeNumber(x.stability,0,1000,0):legacyStability,ts:safeNumber(x.ts,0,Number.MAX_SAFE_INTEGER,0)};}
function openDuel(){
  const own=duelPayload(),code=encodeDuel(own); modal(`<div class="eyebrow">Freundschaftsduell</div><h2>Armeen vergleichen</h2><p>Teile deinen Herausforderungscode. Der höhere fachliche Fortschritt gewinnt; bei Gleichstand zählt die Langzeitstabilität. Keine Zufallsentscheidung.</p><p class="notice subtle">Freundschaftsmodus ohne Server: Der Code enthält keinen Profilnamen, sondern nur Fach, Schuljahr und die nötigen Vergleichswerte. Er ist nicht fälschungssicher.</p><label>Dein Code<div class="duel-code">${esc(code)}</div></label><label>Code des Gegenübers<textarea id="opponentCode" rows="5"></textarea></label><div id="duelResult"></div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button><button type="button" id="duelCompare" class="primary">Duell starten</button></div>`);
  $('#duelCompare').onclick=()=>{try{const other=decodeDuel($('#opponentCode').value);if(other.subject!==state.activeSubject)throw new Error('Fach passt nicht');const result=compareDuel(own,other);$('#duelResult').innerHTML=`<div class="duel-arena duel-${result.outcome}" aria-label="Animiertes Freundschaftsduell"><div class="duel-side duel-own"><div class="duel-banner"></div><div class="duel-troops"><i></i><i></i><i></i></div><strong>${esc(own.name)}</strong><span>${own.progress}%</span></div><div class="duel-clash">⚔</div><div class="duel-side duel-other"><div class="duel-banner"></div><div class="duel-troops"><i></i><i></i><i></i></div><strong>${esc(other.name||'Gegner')}</strong><span>${other.progress}%</span></div></div><div class="notice ${result.outcome==='win'?'good':result.outcome==='loss'?'warn':'subtle'}"><strong>${esc(result.title)}</strong><br><small>${esc(result.reason)}</small></div>`;recordActivity('duel',{result:result.outcome,opponent:other.name||'Gegner'});persistOnly()}catch(e){$('#duelResult').innerHTML='<div class="notice bad">Der Herausforderungscode ist ungültig oder gehört zu einem anderen Fach.</div>'}}
}
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

function openTestDatePlanner(){
  if(!isParentMode()){openParentGate();return}
  const subject=state.activeSubject,learners=(state.learners||[]).filter(l=>learnerActiveSubjects(l).includes(subject)),books=globalLibraryBooks(subject);
  if(!learners.length){toast('Für dieses Fach ist noch kein Lernprofil aktiv.','warn');return}
  if(!books.length){openLearningContentPlanner();return}
  const activeL=learners.find(l=>l.id===state.activeLearnerId)||learners[0],activeFuture=(state.sets||[]).filter(s=>s.learnerId===activeL.id&&s.subject===subject&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate))[0];
  const defaultBook=(activeFuture?.bookId&&bookById(activeFuture.bookId))||currentBook(activeL.id,subject)||books[0];
  const defaultDate=activeFuture?.testDate||datePlusDays(7),seriesCfg=activeL.testSeries?.[subject],defaultMode=seriesCfg?.enabled?'weekly':'single';
  modal(`<div class="eyebrow">Lernplan</div><h2>Vokabeltest planen</h2><p class="notice subtle">Sobald ein Testtermin bekannt ist, ist dies der normale Weg: Termin und Vokabeln auswählen. Die App übernimmt diese Wörter automatisch als Lernstoff und berechnet daraus das tägliche Pensum.</p><label>Kind<select id="planLearner">${learners.map(l=>`<option value="${esc(l.id)}" ${l.id===activeL.id?'selected':''}>${esc(l.name)}</option>`).join('')}</select></label><label>Terminart<select id="testPlanMode"><option value="single" ${defaultMode==='single'?'selected':''}>Einmaliger Test</option><option value="weekly" ${defaultMode==='weekly'?'selected':''}>Wöchentlich</option></select></label><div id="singleWhen"><label>Testdatum<input id="testPlanDate" type="date" value="${esc(defaultDate)}"></label></div><div id="weeklyWhen" class="hidden"><label>Wöchentlicher Testtag<select id="weeklyTestDay">${WEEKDAYS.map((name,i)=>`<option value="${i}">${name}</option>`).join('')}</select></label></div><hr><h3>Was kommt dran?</h3><label>Lehrwerk<select id="planBook">${books.map(b=>`<option value="${esc(b.id)}" ${b.id===defaultBook.id?'selected':''}>${esc(b.title||formatIsbn(b.isbn13))}${b.builtinSource?' · geprüft':''}</option>`).join('')}</select></label><label>Kapitel / Abschnitt<select id="planSection"></select></label><div class="row spread align-center wrap content-picker-head"><strong id="planSelectionCount">0 ausgewählt</strong><div class="row gap"><button type="button" id="planSelectAll" class="ghost compact-action">Alle</button><button type="button" id="planSelectNone" class="ghost compact-action">Keine</button></div></div><div class="vocab-range-picker"><span>Bereich</span><label>Von<input id="planRangeFrom" type="number" inputmode="numeric" min="1" value="1"></label><label>Bis<input id="planRangeTo" type="number" inputmode="numeric" min="1"></label><button type="button" id="planSelectRange" class="secondary compact-action">Nur Bereich</button></div><div id="planWordPicker" class="vocab-picker"></div><label>Abfrageformat<select id="planTestFormat"><option value="target">Deutsch → Fremdsprache</option><option value="source">Fremdsprache → Deutsch</option><option value="mixed">Gemischt</option><option value="dictation">Diktat / Hören → Schreiben</option></select></label><div id="planDailyPreview" class="notice subtle"></div><div class="modal-actions wrap"><button type="button" id="planOpenContent" class="ghost">Vokabeln neu erfassen</button><button type="button" id="clearTestPlan" class="ghost">Plan löschen</button><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="saveTestPlan" class="primary">Plan speichern</button></div>`);
  const learnerEl=$('#planLearner'),mode=$('#testPlanMode'),date=$('#testPlanDate'),weekday=$('#weeklyTestDay'),bookEl=$('#planBook'),sectionEl=$('#planSection'),picker=$('#planWordPicker'),format=$('#planTestFormat'),counter=$('#planSelectionCount'),preview=$('#planDailyPreview'),rangeFrom=$('#planRangeFrom'),rangeTo=$('#planRangeTo');
  let rows=[];
  const targetLearner=()=>state.learners.find(l=>l.id===learnerEl.value)||activeL;
  const targetFuture=()=>{const l=targetLearner();return (state.sets||[]).filter(s=>s.learnerId===l.id&&s.subject===subject&&s.testDate&&daysUntil(s.testDate)>=0).sort((a,b)=>a.testDate.localeCompare(b.testDate))[0]||null};
  const selectedRows=()=>rows.filter(r=>picker.querySelector(`[data-plan-row="${CSS.escape(r.id)}"]`)?.checked);
  const plannedDate=()=>mode.value==='weekly'?nextWeeklyDate(Number(weekday.value)):date.value;
  const matchingSet=()=>{const l=targetLearner();return (state.sets||[]).find(s=>s.learnerId===l.id&&s.subject===subject&&s.bookId===bookEl.value&&s.bookSection===sectionEl.value&&((mode.value==='single'&&s.testDate&&daysUntil(s.testDate)>=0)||(mode.value==='weekly'&&l.testSeries?.[subject]?.setId===s.id)))||null};
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
    mode.value=cfg?.enabled?'weekly':'single';date.value=future?.testDate||datePlusDays(7);weekday.value=String(Number(cfg?.weekday??new Date().getDay()));const b=(future?.bookId&&bookById(future.bookId))||currentBook(l.id,subject)||books[0];if(b)bookEl.value=b.id;format.value=cfg?.enabled?(cfg.testFormat||'target'):(future?.testFormat||'target');syncMode();updateSections();
  };
  const syncMode=()=>{$('#singleWhen').classList.toggle('hidden',mode.value!=='single');$('#weeklyWhen').classList.toggle('hidden',mode.value!=='weekly');updatePreview()};
  $('#planSelectAll').onclick=()=>{picker.querySelectorAll('[data-plan-row]').forEach(x=>x.checked=true);updatePreview()};
  $('#planSelectNone').onclick=()=>{picker.querySelectorAll('[data-plan-row]').forEach(x=>x.checked=false);updatePreview()};
  $('#planSelectRange').onclick=()=>applyVocabularyPickerRange(picker,'[data-plan-row]',rangeFrom,rangeTo,updatePreview);
  learnerEl.onchange=loadLearnerDefaults;mode.onchange=()=>{syncMode();renderRows()};date.onchange=updatePreview;weekday.onchange=updatePreview;bookEl.onchange=updateSections;sectionEl.onchange=renderRows;format.onchange=updatePreview;
  $('#planOpenContent').onclick=()=>{const l=learnerEl.value,b=bookEl.value,sec=sectionEl.value;closeModal();openLearningContentPlanner({learnerId:l,bookId:b,section:sec})};
  $('#saveTestPlan').onclick=()=>{
    const selected=selectedRows();if(!selected.length){preview.className='notice warn';preview.textContent='Bitte mindestens eine Vokabel für den Test auswählen.';return}
    const l=targetLearner(),when=plannedDate();if(mode.value==='single'&&!date.value){preview.className='notice warn';preview.textContent='Bitte ein Testdatum wählen.';return}
    const result=assignBookRowsToLearner(bookEl.value,sectionEl.value,l.id,selected.map(r=>r.id));if(!result.set)return;
    if(mode.value==='weekly'){
      l.testSeries={...defaultTestSeries(),...(l.testSeries||{})};l.testSeries[subject]={enabled:true,weekday:Number(weekday.value),scopeMode:'selected',setId:result.set.id,from:1,to:result.linkIds.length,selectedLinkIds:result.linkIds,scopeDate:when,testFormat:format.value,updatedAt:new Date().toISOString()};
    }else{
      for(const other of (state.sets||[]).filter(x=>x.learnerId===l.id&&x.subject===subject&&x.id!==result.set.id&&x.testDate&&daysUntil(x.testDate)>=0))other.testDate='';
      result.set.testDate=date.value;result.set.testScopeMode='selected';result.set.testSelectedLinkIds=result.linkIds;result.set.testFrom=1;result.set.testTo=result.linkIds.length;result.set.testFormat=format.value;
    }
    l.dailyPlans={};closeModal();save();toast(`Testplan gespeichert · ${selected.length} Vokabeln für ${l.name}.`,'good');
  };
  $('#clearTestPlan').onclick=()=>{const l=targetLearner();if(mode.value==='weekly'){l.testSeries={...defaultTestSeries(),...(l.testSeries||{})};l.testSeries[subject]=null}else for(const set of (state.sets||[]).filter(s=>s.learnerId===l.id&&s.subject===subject&&s.testDate&&daysUntil(s.testDate)>=0)){set.testDate='';set.testScopeMode='set';set.testSelectedLinkIds=[]}l.dailyPlans={};closeModal();save();toast('Testplan entfernt.','subtle')};
  weekday.value=String(Number(seriesCfg?.weekday??new Date().getDay()));format.value=activeFuture?.testFormat||seriesCfg?.testFormat||'target';syncMode();updateSections();
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
  modal(`<div class="eyebrow">${v?'Vokabelbibliothek':'Vokabel'}</div><div class="row gap align-center"><h2>${v?'Vokabel bearbeiten':'Neu anlegen'}</h2>${helpIcon(v?'library':'sense')}</div>${v?`<div class="notice subtle"><strong>${usage.sets} Lernbereich${usage.sets===1?'':'s'} · ${usage.learners} Profil${usage.learners===1?'':'e'}</strong><br>Das Wort wird einmal global gespeichert. Jede Bedeutung hat einen eigenen Lernstand.</div>`:`<label>Lernbereich<select id="wordSet">${sets.map(set=>`<option value="${set.id}" ${preferredSetId===set.id?'selected':''}>${esc(set.title)}</option>`).join('')}</select></label>`}<label>Vokabel<input id="wordTerm" value="${esc(v?.term||'')}"></label>${v?`<label>Schreib-/Formvarianten · mit | trennen<input id="wordVariants" value="${esc((v.termVariants||[]).join('|'))}"></label><div class="row spread align-center"><div class="row gap align-center"><h3>Bedeutungen</h3>${helpIcon('sense')}</div><button type="button" id="addSenseBtn" class="ghost">+ Bedeutung</button></div><div id="wordSenseList">${senses.map(senseRow).join('')}</div>`:`<label>Deutsche Bedeutung<input id="wordTrans" value=""></label><label>Wortart (optional)<input id="wordSensePos" placeholder="z. B. Nomen, Verb, Adjektiv"></label><label><span class="label-with-help">Akzeptierte Synonyme · mit | trennen${helpIcon('synonyms')}</span><input id="wordAliases" placeholder="optional"></label><label>Beispielsatz / Phrase<input id="wordExample" value=""></label>`}<label>${subjectHasCapability(state.activeSubject,'latinGrammar')?'Latein: Genitiv + Genus / Stammformen':'Zusatzform (optional)'}<input id="wordExtra" value="${esc(v?.extra||'')}"></label><label>Eselsbrücke / Wortkniff<input id="wordMnemonic" value="${esc(v?.mnemonic||'')}"></label><label>Wortbausteine, mit | trennen<input id="wordChunks" value="${esc((v?.chunks||[]).join('|'))}"></label>${v&&usageHtml?`<h3>Verwendung</h3><div class="global-usage-list">${usageHtml}</div>`:''}<div id="wordEditorError" class="notice subtle">Synonyme innerhalb einer Bedeutung werden gemeinsam akzeptiert; unterschiedliche Bedeutungen werden getrennt gelernt.</div><div class="modal-actions wrap"><button value="cancel" class="ghost">Abbrechen</button>${v?'<button type="button" id="deleteWord" class="ghost">Global löschen</button>':''}<button type="button" id="saveWord" class="primary">Speichern</button></div>`);
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
      const tr=$('#wordTrans').value.trim();if(!tr){err.className='notice warn';err.textContent='Bitte eine Bedeutung eingeben.';return}const aliases=$('#wordAliases').value.split('|').map(x=>x.trim()).filter(Boolean),example=$('#wordExample').value.trim(),partOfSpeech=$('#wordSensePos').value.trim();const result=attachVocabularyToSet($('#wordSet').value,{term,translation:tr,senseAliases:aliases,acceptedTranslations:aliases,partOfSpeech,extra,example,mnemonic,chunks,source:'manual',verified:true});toast(result.alreadyLinked?'Diese Bedeutung war in diesem Lernbereich bereits vorhanden.':result.newVocabulary?'Neue Vokabel global angelegt und dem Lernbereich zugeordnet.':result.newSense?'Neue Bedeutung zur globalen Vokabel angelegt.':'Vorhandene Bedeutung dem Lernbereich zugeordnet.','good');
    }rebuildWordIndexes();closeModal();save()};
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
  modal(`<div class="eyebrow">Vokabeltest</div><h2>Schulnote eintragen</h2>${pt?`<div class="notice subtle"><strong>Übung davor:</strong> ${pt.percent}% · Notenvorschlag ${esc(pt.suggestedGrade||'–')}<br>${esc(pt.scopeText||'Testbereich')}</div>`:''}<label>Datum<input id="gradeDate" type="date" value="${esc(defaultDate)}"></label><label>Fach<select id="gradeSubject">${learnerActiveSubjects().map(x=>`<option value="${x}">${subjectLabel(x)}</option>`).join('')}</select></label><label>Note<input id="gradeValue" placeholder="z. B. 2+ oder 1,7"></label><label>Kommentar<input id="gradeNote"></label><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="saveGrade" class="primary">Speichern</button></div>`);
  $('#gradeSubject').value=subject; if(pt)$('#gradeSubject').disabled=true;
  $('#saveGrade').onclick=()=>{if(!$('#gradeValue').value.trim())return;const existing=practiceId?state.grades.find(g=>g.learnerId===learner().id&&g.practiceTestId===practiceId):null;const data={learnerId:learner().id,date:$('#gradeDate').value,subject:$('#gradeSubject').value,grade:$('#gradeValue').value.trim(),note:$('#gradeNote').value.trim(),practiceTestId:practiceId||null};if(existing)Object.assign(existing,data);else state.grades.push({id:uid('g'),...data});closeModal();save();}
}
function switchLearnerProfile(id){
  const next=state.learners.find(x=>x.id===id);if(!next){closeModal();return}
  if(next.id===state.activeLearnerId){closeModal();return}
  state.activeLearnerId=next.id;session=null;ensureActiveSubject();closeModal();showView('homeView');save();toast(`${next.name} ist jetzt aktiv.`,'good');
}
function openProfileSwitcher(){
  const learners=state.learners||[];if(!learners.length)return;
  modal(`<div class="eyebrow">Lernprofil</div><h2>Profil wechseln</h2><p class="muted-line">Wer lernt gerade?</p><div class="profile-switch-list">${learners.map(l=>{const active=l.id===state.activeLearnerId,meta=[l.gradeLevel?`Klasse ${esc(l.gradeLevel)}`:'',learnerActiveSubjects(l).map(subjectShort).join(' · ')].filter(Boolean).join(' · ');return `<button type="button" class="profile-switch-option ${active?'active':''}" data-profile-switch="${esc(l.id)}" aria-pressed="${active?'true':'false'}"><span><strong>${esc(l.name)}</strong><small>${esc(meta||'Lernprofil')}</small></span><b>${active?'Aktiv':'Wechseln'}</b></button>`}).join('')}</div><div class="modal-actions wrap"><button type="button" id="manageProfilesBtn" class="ghost">Profile verwalten</button><button value="cancel" class="primary">Schließen</button></div>`);
  $$('[data-profile-switch]').forEach(b=>b.onclick=()=>switchLearnerProfile(b.dataset.profileSwitch));
  $('#manageProfilesBtn').onclick=()=>{closeModal();openParentGate('settingsView')};
}
function addProfile(){openProfileEditor()}
function openProfileEditor(id=null){
  const existing=id?state.learners.find(x=>x.id===id):null,active=normalizeLearnerSubjects(existing||{},existing?[]:[availableSubjectIds()[0]||'english']);
  const gradeOptions=['','1','2','3','4','5','6','7','8','9','10','11','12','13'].map(x=>`<option value="${x}" ${String(existing?.gradeLevel||'')===x?'selected':''}>${x?`Klasse ${x}`:'Klasse wählen'}</option>`).join('');
  const subjectRows=Object.values(SUBJECT_META).map((meta,index)=>`<label class="switch-row ${meta.available?'':'disabled-row'}"><span><strong>${esc(meta.label)}</strong><small>${meta.available?(index===0?'nur aktivierte Fächer werden in der App angezeigt':'aktivierbar'):'vorbereitet · noch nicht freigeschaltet'}</small></span><input data-profile-subject="${esc(meta.id)}" type="checkbox" ${active.includes(meta.id)?'checked':''} ${meta.available?'':'disabled'}></label>`).join('');
  modal(`<div class="eyebrow">Profil</div><h2>${existing?'Profil bearbeiten':'Neues Lernprofil'}</h2><label>Name<input id="profileName" value="${esc(existing?.name||'')}"></label><label>Klasse<select id="profileGrade">${gradeOptions}</select></label><label class="switch-row"><span><span class="label-with-help"><strong>LRS</strong>${helpIcon('lrs')}</span><small>kürzere Einheiten, Audio zuerst, ruhigeres Layout</small></span><input id="profileLrs" type="checkbox" ${existing?.lrsMode?'checked':''}></label><fieldset class="subject-fieldset"><legend>Fremdsprachen</legend>${subjectRows}</fieldset><div id="profileError" class="notice subtle">Mindestens eine aktive Fremdsprache auswählen.</div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="saveProfile" class="primary">${existing?'Speichern':'Anlegen'}</button></div>`);
  $('#saveProfile').onclick=()=>{const name=$('#profileName').value.trim(),subjects=$$('[data-profile-subject]').filter(x=>x.checked&&!x.disabled).map(x=>x.dataset.profileSubject);if(!name){$('#profileError').className='notice warn';$('#profileError').textContent='Bitte einen Namen eingeben.';return}if(!subjects.length){$('#profileError').className='notice warn';$('#profileError').textContent='Mindestens eine aktive Fremdsprache auswählen.';return}const gradeLevel=$('#profileGrade').value,lrsMode=$('#profileLrs').checked;if(existing){existing.name=name;existing.gradeLevel=gradeLevel;existing.lrsMode=lrsMode;existing.activeSubjects=subjects}else{const learnerId=uid('learner');state.learners.push({id:learnerId,name,gradeLevel,activeSubjects:subjects,xp:0,lrsMode,fontSize:17,letterSpacing:0,flashSpeed:1600,streakDays:[],milestones:{},fortressWins:defaultSubjectArrays(),fortressWinsByYear:{},battleTickets:defaultSubjectNumbers(),campaignLog:[],dailyPlans:{},testSeries:defaultTestSeries(),gradeScales:defaultGradeScales(),createdAt:new Date().toISOString()});state.activeLearnerId=learnerId}ensureActiveSubject();closeModal();save()};
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
function deleteProfile(id){if(id===state.activeLearnerId)return;if(!confirm('Profil mit Lernbereichen, Lernständen und Noten löschen? Die globale Vokabelbibliothek bleibt erhalten.'))return;const setIds=new Set(state.sets.filter(s=>s.learnerId===id).map(s=>s.id));state.setVocabulary=state.setVocabulary.filter(x=>!setIds.has(x.setId));state.vocabulary.forEach(v=>{v.sources=(v.sources||[]).filter(src=>!setIds.has(src.setId))});state.sets=state.sets.filter(s=>s.learnerId!==id);state.learnerBooks=state.learnerBooks.filter(x=>x.learnerId!==id);state.learnerVocabulary=state.learnerVocabulary.filter(x=>x.learnerId!==id);state.grades=state.grades.filter(g=>g.learnerId!==id);state.practiceTests=state.practiceTests.filter(t=>t.learnerId!==id);state.activity=state.activity.filter(a=>a.learnerId!==id);state.learners=state.learners.filter(l=>l.id!==id);rebuildWordIndexes();save()}

function modal(html){$('#modalContent').innerHTML=html;$('#modal').showModal()}
function closeModal(){$('#modal').close()}
function toast(text,type='subtle'){const el=$('#toastRegion');if(!el)return;clearTimeout(toastTimer);el.className=`toast-region show ${type}`;el.textContent=text;toastTimer=setTimeout(()=>{el.className='toast-region';el.textContent=''},4200)}
function applyRoleUi(){
  document.body.classList.toggle('parent-mode',isParentMode());
  $('#parentAreaBtn')?.classList.toggle('hidden',isParentMode());
  $('#childModeBtn')?.classList.toggle('hidden',!isParentMode());
  $('#appTitle').textContent=isParentMode()?'Vokabeltrainer · Eltern':'Vokabeltrainer';
}
function openParentGate(target='parentView'){
  modal('<div class="eyebrow">Rollenwechsel</div><h2>Elternbereich öffnen?</h2><p>Hier werden Lernstoff, Testpläne, Noten, Profile, Lehrwerke und Datensicherung verwaltet.</p><p class="notice subtle">Der Kindermodus bleibt bewusst frei von diesen Verwaltungsaufgaben.</p><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="confirmParentMode" class="primary">Elternbereich öffnen</button></div>');
  $('#confirmParentMode').onclick=()=>{closeModal();enterParentMode(target)};
}
function enterParentMode(target='parentView'){appRole='parent';applyRoleUi();showView(target);renderAll()}
function exitParentMode(){appRole='child';session=null;applyRoleUi();showView('homeView');renderAll()}
function familySyncTime(value){if(!value)return 'noch nie';try{return new Date(value).toLocaleString('de-DE',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}catch(_){return value}}
function renderFamilySync(){
  const box=$('#familySyncStatus'),setup=$('#familySyncSetupBtn'),now=$('#familySyncNowBtn'),child=$('#familySyncChildBtn'),switchBtn=$('#familySyncSwitchBtn');if(!box||!window.VTFamilySync)return;
  const s=VTFamilySync.status();
  setup.classList.toggle('hidden',s.enabled);
  now.classList.toggle('hidden',!s.enabled);
  child.classList.toggle('hidden',!s.enabled||s.role!=='parent');
  switchBtn?.classList.toggle('hidden',!s.enabled||s.role!=='parent');
  if(!s.enabled){box.className='notice subtle';box.innerHTML='<strong>Noch nicht verbunden.</strong><br>Neue Familie anlegen oder einem bestehenden Familienverbund beitreten.';return}
  if(s.conflicts){box.className='notice warn';box.innerHTML=`<strong>Synchronisationskonflikt</strong><br>${s.conflicts} Dokument${s.conflicts===1?'':'e'} wurde${s.conflicts===1?'':'n'} auf mehreren Geräten geändert. Nichts wird automatisch überschrieben.`;return}
  if(s.busy){box.className='notice subtle';box.innerHTML='<strong>Synchronisierung läuft …</strong><br>Lokales Lernen bleibt verfügbar.';return}
  box.className='notice good';box.innerHTML=`<strong>Familiensync aktiv</strong><br>Familie: ${esc(s.familyId)} · ${s.role==='parent'?'Eltern-Gerät':'Kindergerät'} · zuletzt ${esc(familySyncTime(s.lastSync))}${s.dirty?` · ${s.dirty} Änderung${s.dirty===1?'':'en'} wartet${s.dirty===1?'':'en'} auf Upload`:''}`;
}
function openFamilySyncSetup(){
  if(!window.VTFamilySync)return;
  if(VTFamilySync.status().enabled){openFamilySyncSwitch();return}
  modal('<div class="eyebrow">Familie & Geräte</div><h2>Familiensync einrichten</h2><p>Nutze auf allen Eltern- und Kindergeräten denselben Familienverbund.</p><div class="notice subtle"><strong>Schon auf einem anderen Gerät eingerichtet?</strong><br>Dann der bestehenden Familie beitreten – keine neue Familie anlegen.</div><div class="modal-actions stack-mobile"><button type="button" id="familySyncJoinChoiceBtn" class="primary">Bestehender Familie beitreten</button><button type="button" id="familySyncCreateChoiceBtn" class="secondary">Neue Familie anlegen</button><button value="cancel" class="ghost">Abbrechen</button></div>');
  $('#familySyncJoinChoiceBtn').onclick=openFamilySyncJoin;
  $('#familySyncCreateChoiceBtn').onclick=openFamilySyncCreate;
}
function openFamilySyncCreate(){
  modal('<div class="eyebrow">Familie & Geräte</div><h2>Neue Familie anlegen</h2><p>Nur verwenden, wenn noch auf keinem Gerät ein Familienverbund existiert. Der aktuelle Stand dieses Geräts wird als erster Familienstand hochgeladen.</p><label>Familien-PIN<input id="familyPin" type="password" minlength="6" autocomplete="new-password" placeholder="mindestens 6 Zeichen"></label><label>PIN wiederholen<input id="familyPin2" type="password" minlength="6" autocomplete="new-password"></label><div id="familySyncSetupError" class="notice subtle">Die PIN wird nicht gespeichert. Weitere Geräte treten später mit Familien-ID und PIN bei.</div><div class="modal-actions"><button type="button" id="familySyncBackBtn" class="ghost">Zurück</button><button type="button" id="familySyncCreateBtn" class="primary">Familie anlegen</button></div>');
  $('#familySyncBackBtn').onclick=openFamilySyncSetup;
  $('#familySyncCreateBtn').onclick=async()=>{const p1=$('#familyPin').value,p2=$('#familyPin2').value,err=$('#familySyncSetupError'),btn=$('#familySyncCreateBtn');if(p1.length<6){err.className='notice warn';err.textContent='Die PIN muss mindestens 6 Zeichen lang sein.';return}if(p1!==p2){err.className='notice warn';err.textContent='Die beiden PINs stimmen nicht überein.';return}btn.disabled=true;btn.textContent='Wird eingerichtet …';try{await VTFamilySync.createFamily(p1,'Eltern-Gerät');closeModal();renderFamilySync();toast('Familiensync eingerichtet.','good')}catch(e){err.className='notice bad';err.textContent=e.message||'Einrichtung fehlgeschlagen.';btn.disabled=false;btn.textContent='Familie anlegen'}};
}
function openFamilySyncJoin(){
  modal('<div class="eyebrow">Familie & Geräte</div><h2>Bestehender Familie beitreten</h2><p>Übernimm die Familien-ID von einem bereits verbundenen Eltern-Gerät und verwende dieselbe Familien-PIN.</p><label>Familien-ID<input id="familyJoinId" type="text" autocomplete="off" spellcheck="false" placeholder="family_…"></label><label>Familien-PIN<input id="familyJoinPin" type="password" minlength="6" autocomplete="current-password" placeholder="mindestens 6 Zeichen"></label><div id="familySyncJoinError" class="notice subtle">Nach dem Beitritt wird der vorhandene Familienstand geladen und mit diesem Gerät synchronisiert.</div><div class="modal-actions"><button type="button" id="familySyncBackBtn" class="ghost">Zurück</button><button type="button" id="familySyncJoinBtn" class="primary">Familie beitreten</button></div>');
  $('#familySyncBackBtn').onclick=()=>VTFamilySync.status().enabled?openFamilySyncSwitch():openFamilySyncSetup();
  $('#familySyncJoinBtn').onclick=async()=>{const id=$('#familyJoinId').value.trim().toLowerCase(),pin=$('#familyJoinPin').value,err=$('#familySyncJoinError'),btn=$('#familySyncJoinBtn');if(!/^family_[a-z0-9]{6,40}$/.test(id)){err.className='notice warn';err.textContent='Bitte eine gültige Familien-ID eingeben.';return}if(pin.length<6){err.className='notice warn';err.textContent='Die Familien-PIN muss mindestens 6 Zeichen lang sein.';return}btn.disabled=true;btn.textContent='Wird verbunden …';try{await VTFamilySync.joinParent(id,pin,'Eltern-Gerät');closeModal();renderAll();VTFamilySync.bootstrap();toast('Dieses Gerät ist jetzt mit der bestehenden Familie verbunden.','good')}catch(e){err.className='notice bad';err.textContent=e.message||'Beitritt fehlgeschlagen.';btn.disabled=false;btn.textContent='Familie beitreten'}};
}
function openFamilySyncSwitch(){
  if(!window.VTFamilySync)return;const s=VTFamilySync.status();if(!s.enabled){openFamilySyncSetup();return}
  modal(`<div class="eyebrow">Familie & Geräte</div><h2>Familienverbindung ändern</h2><p>Dieses Gerät ist aktuell mit <strong>${esc(s.familyId)}</strong> verbunden.</p><div class="notice subtle">Beim Trennen bleiben die lokalen Lern- und Vokabeldaten auf diesem Gerät erhalten. Nur die Synchronisationsverbindung wird entfernt.</div><div class="modal-actions stack-mobile"><button type="button" id="familySwitchJoinBtn" class="primary">Zu bestehender Familie wechseln</button><button type="button" id="familyDisconnectBtn" class="danger-outline">Verbindung auf diesem Gerät lösen</button><button value="cancel" class="ghost">Abbrechen</button></div>`);
  $('#familySwitchJoinBtn').onclick=()=>{VTFamilySync.disconnectLocal();renderFamilySync();openFamilySyncJoin()};
  $('#familyDisconnectBtn').onclick=()=>{VTFamilySync.disconnectLocal();closeModal();renderAll();toast('Familiensync auf diesem Gerät getrennt. Lokale Daten bleiben erhalten.','subtle')};
}
async function runFamilySync(){
  if(!window.VTFamilySync)return;const btn=$('#familySyncNowBtn');btn.disabled=true;renderFamilySync();try{await VTFamilySync.syncNow(true);renderAll();toast('Synchronisierung abgeschlossen.','good')}catch(e){toast(e.message||'Synchronisierung fehlgeschlagen.','bad');renderFamilySync()}finally{btn.disabled=false}
}
function openChildDeviceInvite(){
  if(!window.VTFamilySync)return;const learners=state.learners||[];if(!learners.length){toast('Zuerst ein Kinderprofil anlegen.','subtle');return}
  modal(`<div class="eyebrow">Kindergerät</div><h2>Gerät einem Kind zuordnen</h2><p>Der Gerätecode wird genau an ein Profil gebunden und ist 15 Minuten gültig.</p><label>Profil<select id="familyChildProfile">${learners.map(l=>`<option value="${esc(l.id)}">${esc(l.name)}</option>`).join('')}</select></label><div id="familyChildInviteResult" class="notice subtle">Im nächsten Schritt kann daraus ein QR-Code für das Kindergerät erzeugt werden.</div><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button><button type="button" id="familyChildInviteBtn" class="primary">Gerätecode erzeugen</button></div>`);
  $('#familyChildInviteBtn').onclick=async()=>{const btn=$('#familyChildInviteBtn'),out=$('#familyChildInviteResult'),profileId=$('#familyChildProfile').value;btn.disabled=true;try{const r=await VTFamilySync.createChildInvite(profileId);out.className='notice good';out.innerHTML=`<strong>Gerätecode erstellt</strong><br><span class="duel-code">${esc(r.token)}</span><br>Gültig bis ${esc(familySyncTime(r.expires_at))}. Der QR-/Übernahmeschritt für die Kinder-App folgt als nächster Ausbau.`;btn.textContent='Neuen Code erzeugen'}catch(e){out.className='notice bad';out.textContent=e.message||'Code konnte nicht erzeugt werden.'}finally{btn.disabled=false}};
}
function renderParentOverview(){
  const box=$('#parentAttention');if(!box)return;
  const tasks=[],review=mySets().find(setNeedsPairReview),pending=seriesScopePending();
  if(review)tasks.push(`<div class="parent-task"><div><strong>Vokabelpaare prüfen</strong><small>${esc(review.title)} muss vor dem ersten Lernen fachlich bestätigt werden.</small></div><button class="primary" data-parent-audit="${review.id}">Jetzt prüfen</button></div>`);
  if(pending)tasks.push('<div class="parent-task"><div><strong>Testumfang festlegen</strong><small>Für den nächsten wöchentlichen Test fehlen noch die konkreten Vokabeln.</small></div><button class="primary" data-parent-plan>Test planen</button></div>');
  if(!mySets().length)tasks.push('<div class="parent-task"><div><strong>Noch kein Lernstoff</strong><small>Steht ein Test an, plane ihn direkt. Sonst kannst du Vokabeln ohne Testtermin vorbereiten.</small></div><div class="row gap wrap"><button class="primary" data-parent-plan-first>Test planen</button><button class="secondary" data-parent-newset>Ohne Test vorbereiten</button></div></div>');
  box.innerHTML=tasks.join('');
  box.querySelector('[data-parent-audit]')?.addEventListener('click',e=>openSetPairAudit(e.currentTarget.dataset.parentAudit));
  box.querySelector('[data-parent-plan]')?.addEventListener('click',openTestDatePlanner);
  box.querySelector('[data-parent-plan-first]')?.addEventListener('click',openTestDatePlanner);
  box.querySelector('[data-parent-newset]')?.addEventListener('click',()=>openLearningContentPlanner());
}
function isDesktopLayout(){return !!window.matchMedia?.('(min-width: 1100px)').matches}
function syncResponsiveHomeLayout(){
  const practice=$('#practiceDisclosure');if(practice)practice.open=isDesktopLayout();
}
function showView(id){
  if(id!=='battleView'&&document.body.classList.contains('battle-immersive'))closeBattleImmersive();
  if(PARENT_VIEW_IDS.has(id)&&!isParentMode()){toast('Diese Funktion liegt im Elternbereich.','subtle');id='homeView'}
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.nav-btn[data-view]').forEach(b=>{const active=!isParentMode()&&b.dataset.view===id;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  if(id==='homeView')document.querySelectorAll('.home-disclosure').forEach(d=>{d.open=isDesktopLayout()&&d.id==='practiceDisclosure'});
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:reduced?'auto':'smooth'});
}

function bind(){
  $$('.nav-btn[data-view]').forEach(b=>b.onclick=()=>showView(b.dataset.view)); $('[data-action="quickLearn"]').onclick=startDailyTodo; $('#quickLearnHeroBtn').onclick=startDailyTodo; $('#quickCardsBtn').onclick=()=>startSession('cards'); $('#todayTestBtn').onclick=openTestDatePlanner; $('#backHomeBtn').onclick=()=>{session=null;showView('homeView')};
  $('#newSetBtn').onclick=()=>openLearningContentPlanner(); $('#addGradeBtn').onclick=()=>addGrade(); $('#practiceTestBtn').onclick=openPracticeTestChooser; $('#addProfileBtn').onclick=addProfile; $('#profileBtn').onclick=openProfileSwitcher; $('#attackBtn').onclick=openBattleView; $('#duelBtn').onclick=openDuel;
  $('#battleBackBtn').onclick=()=>showView('childProgressView'); $('#battleReturnBtn').onclick=()=>showView('childProgressView'); $('#battleAttackBtn').onclick=runBattleAnimation; $('#battleFullscreenBtn').onclick=toggleBattleFullscreen;
  $('#battleAttackChoices').addEventListener('click',e=>{const b=e.target.closest('[data-battle-attack]');if(b&&!b.disabled)selectBattleAttack(b.dataset.battleAttack)});
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&document.body.classList.contains('battle-immersive')){document.body.classList.remove('battle-immersive');$('#battleFullscreenBtn')?.setAttribute('aria-pressed','false');if($('#battleFullscreenBtn'))$('#battleFullscreenBtn').textContent='⛶ Vollbild';}});
  $('#parentAreaBtn').onclick=()=>openParentGate(); $('#childModeBtn').onclick=exitParentMode;
  $('#parentLibraryBtn').onclick=openLearningContentPlanner; $('#parentTestPlanBtn').onclick=openTestDatePlanner; $('#parentDashboardBtn').onclick=()=>showView('dashboardView'); $('#parentSettingsBtn').onclick=()=>showView('settingsView');
  $$('[data-parent-home]').forEach(b=>b.onclick=()=>showView('parentView'));
  $('#fontSizeRange').oninput=e=>{learner().fontSize=+e.target.value;save()}; $('#letterSpacingRange').oninput=e=>{learner().letterSpacing=+e.target.value;save()}; $('#flashSpeedSelect').onchange=e=>{learner().flashSpeed=+e.target.value;save()};
  $('#familySyncSetupBtn').onclick=openFamilySyncSetup; $('#familySyncNowBtn').onclick=runFamilySync; $('#familySyncChildBtn').onclick=openChildDeviceInvite; $('#familySyncSwitchBtn').onclick=openFamilySyncSwitch;
  $('#backupBtn').onclick=backup; $('#resetAppBtn').onclick=resetAppData; $('#restoreBtn').onclick=()=>{const f=$('#fileInput');f.accept='.json,application/json';f.dataset.mode='restore';f.click()}; $('#exportCsvBtn').onclick=exportCsv; $('#libraryUseBtn').onclick=openLearningContentPlanner; $('#librarySearchInput').oninput=()=>{libraryRenderLimit=200;renderLibrary()}; $('#librarySetFilter').onchange=()=>{libraryRenderLimit=200;renderLibrary()};
  $('#fileInput').onchange=async e=>{const f=e.target.files[0];if(!f)return;const mode=e.target.dataset.mode,limit=mode==='restore'?MAX_BACKUP_BYTES:MAX_CSV_BYTES;if(f.size>limit){toast(`${mode==='restore'?'Backup':'CSV'} ist zu groß (${fmtBytes(f.size)}).`,'bad');e.target.value='';return}try{const text=await f.text();if(mode==='restore')restore(text);else importCsv(text)}catch(err){console.warn(err);toast('Datei konnte nicht gelesen werden.','bad')}e.target.value=''}; $('#photoInput').onchange=async e=>{const f=e.target.files[0];if(f)await handleScanPhoto(f);e.target.value=''}; $('#isbnPhotoInput').onchange=async e=>{const f=e.target.files[0];if(f)await handleIsbnPhoto(f);e.target.value=''};
  $('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()}); $('#modal').addEventListener('close',()=>{if(scanImportState.imageUrl){URL.revokeObjectURL(scanImportState.imageUrl);scanImportState.imageUrl=null;}scanImportState.lastFile=null;});
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const ua=String(navigator.userAgent||''),isiOS=/iphone|ipad|ipod/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const openIosInstallGuide=()=>modal(`<div class="eyebrow">iPhone / iPad</div><h2>Ohne Safari-Leiste öffnen</h2><p>Wie bei Johanna´s Gartenwelt muss der Vokabeltrainer einmal als Web-App auf den Home-Bildschirm gelegt werden:</p><ol><li>Unten in Safari auf <strong>Teilen</strong> tippen.</li><li><strong>Zum Home-Bildschirm</strong> wählen.</li><li><strong>Als Web-App öffnen</strong> eingeschaltet lassen.</li><li><strong>Hinzufügen</strong> bestätigen.</li><li>Safari schließen und künftig das neue <strong>Vokabeltrainer</strong>-Symbol öffnen.</li></ol><p>Dann läuft die App im Standalone-Modus ohne Safari-Navigationsleiste.</p><div class="modal-actions"><button value="ok" class="primary">Verstanden</button></div>`);
  const syncInstallUi=()=>{const iosSafariMode=isiOS&&!standalone();$('#iosInstallCard')?.classList.toggle('hidden',!iosSafariMode);if(iosSafariMode)$('#installBtn')?.classList.add('hidden')};
  syncInstallUi();$('#iosInstallBtn').onclick=openIosInstallGuide;
  syncResponsiveHomeLayout();window.addEventListener('resize',syncResponsiveHomeLayout,{passive:true});
  window.addEventListener('pagehide',()=>persistOnly());document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')persistOnly()});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;if(!isiOS)$('#installBtn').classList.remove('hidden')}); $('#installBtn').onclick=async()=>{if(installPrompt){installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').classList.add('hidden');return}openIosInstallGuide()};
}