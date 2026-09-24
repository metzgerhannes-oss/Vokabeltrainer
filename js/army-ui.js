'use strict';

(() => {
  const UNIT_DEFS = [
    {
      id:'infantry',icon:'⚔',names:{english:'Infanterie',latin:'Legionäre'},role:'Front',roleText:'Hält die Linie und bildet die verlässliche Basis des Heeres.',
      description:{english:'Die verlässliche Basis deiner Armee.',latin:'Das Rückgrat deiner Legion.'},
      tiers:['Grundausrüstung','Verstärkte Schilde','Stahlhelme','Veteranenrüstung','Eliteformation'],
      thresholds:[0,20,40,65,85],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'archers',icon:'➶',names:{english:'Bogenschützen',latin:'Sagittarii'},role:'Fernkampf',roleText:'Unterstützt Angriffe aus der Distanz und deckt das Vorrücken.',
      description:{english:'Treffen aus der Distanz und eröffnen neue Angriffsmöglichkeiten.',latin:'Fernkämpfer für gezielte Salven.'},
      tiers:['Übungsbögen','Langbögen','Große Köcher','Veteranenbogen','Präzisionssalve'],
      thresholds:[20,35,55,75,90],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'cavalry',icon:'♞',names:{english:'Kavallerie',latin:'Equites'},role:'Mobilität',roleText:'Bewegt sich schnell, flankiert und macht die Armee beweglicher.',
      description:{english:'Schnelle Eliteeinheiten für den späteren Feldzug.',latin:'Schnelle Reitereinheiten für die Flanke.'},
      tiers:['Späher','Leichte Reiterei','Gepanzerte Reiter','Veteranenreiter','Elite-Kavallerie'],
      thresholds:[55,65,75,85,95],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'ram',icon:'▰',names:{english:'Rammbock',latin:'Belagerungsgerät'},role:'Belagerung',roleText:'Konzentriert die Kraft der Armee auf Tore und befestigte Ziele.',
      description:{english:'Wird mit wachsendem Feldzug immer stärker.',latin:'Schweres Gerät für befestigte Ziele.'},
      tiers:['Leichter Rammbock','Verstärkter Balken','Schutzdach','Belagerungsramme','Festungsbrecher'],
      thresholds:[35,50,70,85,100],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'shield',icon:'⬟',names:{english:'Schildträger',latin:'Scutum-Träger'},role:'Schutz',roleText:'Sichert die Formation und bereits eroberte Stellungen.',
      description:{english:'Belohnt Wissen, das schon über mehrere Tage stabil bleibt.',latin:'Stabile Reihen aus nachhaltig gefestigtem Wissen.'},
      tiers:['Holzschild','Verstärkter Schild','Schildwall','Veteranenwall','Elite-Schildwall'],
      thresholds:[15,35,55,75,90],metric:c=>c.stablePct,metricName:'stabile Wörter',suffix:'%'
    },
    {
      id:'support',icon:'✚',names:{english:'Sanitäter',latin:'Unterstützung'},role:'Versorgung',roleText:'Hält die Truppe einsatzbereit und stützt Moral und Ausdauer.',
      description:{english:'Regelmäßiges Lernen baut deine Unterstützungseinheit aus.',latin:'Regelmäßigkeit stärkt die Versorgung deiner Legion.'},
      tiers:['Feldversorgung','Verbandskiste','Versorgungswagen','Erfahrenes Team','Elite-Unterstützung'],
      thresholds:[3,7,14,30,60],metric:c=>c.learningDays,metricName:'Lerntage',suffix:''
    }
  ];

  const BONUS_DEFS = [
    {id:'banner',icon:'⚑',title:'Banner',text:'Moralbonus',ready:c=>c.p.pct>=15,goal:'15% Lernfortschritt'},
    {id:'armor',icon:'⛨',title:'Rüstung',text:'stabilere Formation',ready:c=>c.stablePct>=35,goal:'35% stabile Wörter'},
    {id:'formation',icon:'◆',title:'Formation',text:'geschlossene Reihen',ready:c=>c.learningDays>=3,goal:'3 Lerntage'},
    {id:'special',icon:'✦',title:'Spezialfähigkeit',text:'Eliteangriff',ready:c=>c.p.pct>=70,goal:'70% Lernfortschritt'}
  ];

  let selectedUnitId='infantry';

  function safe(value){
    const text=String(value??'');
    if(typeof esc==='function')return esc(text);
    return text.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function subjectName(def){
    return def.names?.[state?.activeSubject]||def.names?.english||def.id;
  }
  function context(){
    const p=subjectProgress();
    const l=learner();
    const learningDays=new Set(l?.streakDays||[]).size;
    const currentStreak=typeof streak==='function'?streak():0;
    const history=typeof testFortressHistory==='function'?testFortressHistory():[];
    const captured=history.filter(f=>f.capturedAt);
    const mission=typeof currentTestFortress==='function'?currentTestFortress():null;
    const stablePct=p.total?Math.round((p.stable/p.total)*100):0;
    return {
      p,l,learningDays,currentStreak,history,captured,mission,stablePct,
      testBadges:typeof testBadgeCount==='function'?testBadgeCount():0,
      strength:armyStrength(),
      rank:rankFor(p.pct,state.activeSubject),
      gear:gearLabelFor(p.pct,state.activeSubject),
      tickets:battleTickets()
    };
  }
  function unitState(def,c){
    const value=Number(def.metric(c))||0;
    let level=def.thresholds.filter(t=>value>=t).length;
    level=Math.min(5,level);
    const unlocked=level>0;
    const next=level<5?def.thresholds[level]:null;
    const previous=level?def.thresholds[level-1]:0;
    const span=next===null?1:Math.max(1,next-previous);
    const progress=next===null?100:Math.max(0,Math.min(100,Math.round(((value-previous)/span)*100)));
    return {value,level,unlocked,next,previous,progress};
  }
  function metricText(def,s){
    if(def.suffix==='%')return `${Math.round(s.value)}%`;
    return `${Math.round(s.value)} ${def.metricName}`;
  }
  function unitPower(def,c){
    const s=unitState(def,c);
    if(!s.unlocked)return 0;
    if(s.level>=5)return 100;
    return Math.max(1,Math.min(99,Math.round(((s.level-1)+(s.progress/100))/5*100)));
  }
  function roleStrengthMarkup(c){
    return UNIT_DEFS.map(def=>{
      const s=unitState(def,c),power=unitPower(def,c),name=subjectName(def);
      return `<button type="button" class="army-role-card ${s.unlocked?'ready':'locked'}" data-army-unit="${safe(def.id)}" aria-label="${safe(def.role)}: ${power} von 100 · ${safe(name)}">
        <span class="army-role-icon" aria-hidden="true">${def.icon}</span>
        <span class="army-role-copy"><small>${safe(def.role)}</small><strong>${safe(name)}</strong><em>${safe(def.roleText)}</em></span>
        <span class="army-role-value"><b>${power}</b><small>/ 100</small></span>
        <progress max="100" value="${power}" aria-label="${safe(def.role)} Stärke"></progress>
      </button>`;
    }).join('');
  }
  function nextText(def,s){
    if(s.next===null)return 'Maximale Stufe erreicht';
    return def.suffix==='%'?`${s.next}% ${def.metricName}`:`${s.next} ${def.metricName}`;
  }
  function moraleMeta(c){
    const score=Math.max(0,Math.min(100,45+c.currentStreak*9+Math.round(c.p.pct*.25)));
    const label=score>=80?'Hoch':score>=60?'Stabil':'Im Aufbau';
    return {score,label};
  }
  function nextUpgrade(c){
    const pending=UNIT_DEFS.map(def=>({def,s:unitState(def,c)})).filter(x=>x.s.next!==null);
    pending.sort((a,b)=>{
      const ar=a.s.progress,br=b.s.progress;
      if(ar!==br)return br-ar;
      return a.s.next-b.s.next;
    });
    return pending[0]||null;
  }
  function campaignStrip(c){
    const list=[...c.history].slice(-6);
    if(!list.length)return '<span class="army-fortress-step next" title="Noch kein Test geplant"><i>♜</i><small>Test</small></span>';
    return list.map(f=>{
      const active=c.mission?.key===f.key,won=!!f.capturedAt,grade=typeof testFortressGrade==='function'?testFortressGrade(f):null;
      return `<span class="army-fortress-step ${won?'won':''} ${active?'next':''}" title="${safe(f.name)} · Test ${safe(formatDateShort(f.testDate))}"><i>${won?'✓':'♜'}</i><small>${grade?safe('Note '+grade.grade):safe(formatDateShort(f.testDate))}</small></span>`;
    }).join('');
  }
  function heroMarkup(c){
    const morale=moraleMeta(c);
    return `
      <img class="army-camp-art" data-army-hero-art alt="" aria-hidden="true">
      <div class="army-camp-sky" aria-hidden="true"></div>
      <div class="army-camp-banner" aria-hidden="true"><span>♜</span></div>
      <div class="army-camp-copy">
        <span class="army-kicker">${safe(state.activeSubject==='latin'?'Legion':'Armee')} · ${safe(c.p.schoolYear)}</span>
        <strong id="armyRankLabel">${safe(c.rank)}</strong>
        <small>${safe(c.gear)}</small>
      </div>
      <div class="army-camp-strength">
        <span>Armeestärke</span><strong>${safe(c.strength)}</strong>
        <progress class="army-morale-progress" max="100" value="${morale.score}" aria-label="Moral"></progress>
        <small>Moral: ${safe(morale.label)}</small>
      </div>
      <div class="army-camp-campaign" aria-label="${safe(c.captured.length)} Testfestungen erobert">
        ${campaignStrip(c)}
      </div>
    `;
  }
  function bonusMarkup(c){
    return BONUS_DEFS.map(b=>{
      const ready=b.ready(c);
      return `<div class="army-bonus ${ready?'ready':'locked'}">
        <span class="army-bonus-icon" aria-hidden="true">${b.icon}</span>
        <strong>${safe(b.title)}</strong>
        <small>${ready?safe(b.text):safe(b.goal)}</small>
        <b>${ready?'Freigeschaltet':'Gesperrt'}</b>
      </div>`;
    }).join('');
  }
  function unitCardMarkup(def,c){
    const s=unitState(def,c),name=subjectName(def);
    return `<button type="button" class="army-unit-card unit-${safe(def.id)} ${s.unlocked?'unlocked':'locked'} ${selectedUnitId===def.id?'selected':''}" data-army-unit="${safe(def.id)}" aria-pressed="${selectedUnitId===def.id?'true':'false'}">
      <span class="army-unit-level">Stufe <b>${s.level||0}</b></span>
      <span class="army-unit-art unit-art-${safe(def.id)}" aria-hidden="true"><img data-army-unit-art alt=""><b>${def.icon}</b></span>
      <strong>${safe(name)}</strong>
      <span class="army-unit-role">${safe(def.role)}</span>
      <small>${safe(def.description?.[state.activeSubject]||def.description.english)}</small>
      <progress class="army-unit-progress" max="100" value="${s.progress}" aria-label="Fortschritt zur nächsten Stufe"></progress>
      <span class="army-unit-state">${s.unlocked?metricText(def,s):`Freischaltung: ${nextText(def,s)}`}</span>
      <span class="army-unit-next">${s.unlocked?nextText(def,s):'Noch nicht freigeschaltet'}</span>
      <span class="army-unit-open">Details & Aufwertung <b aria-hidden="true">›</b></span>
    </button>`;
  }
  function thresholdSentence(def,value){
    if(def.suffix==='%')return `Erreiche ${value}% ${def.metricName}.`;
    return `Lerne an ${value} verschiedenen Tagen.`;
  }
  function upgradePathMarkup(def,s){
    return def.tiers.map((label,index)=>{
      const level=index+1,threshold=def.thresholds[index];
      const status=level<s.level?'done':level===s.level&&s.level>0?'current':level===s.level+1?'next':'locked';
      return `<div class="army-upgrade-step ${status}">
        <span class="army-upgrade-node">${level<s.level?'✓':level}</span>
        <div>
          <small>Stufe ${level}</small>
          <strong>${safe(label)}</strong>
          <span>${safe(thresholdSentence(def,threshold))}</span>
        </div>
      </div>`;
    }).join('');
  }
  function detailMarkup(def,c){
    const s=unitState(def,c),name=subjectName(def);
    const current=s.level?def.tiers[s.level-1]:'Noch nicht freigeschaltet';
    const next=s.next===null?'Maximal ausgebaut':def.tiers[s.level];
    const condition=s.next===null?'Alle fünf Stufen sind erreicht.':thresholdSentence(def,s.next);
    return `
      <section class="army-detail-hero unit-${safe(def.id)}">
        <div class="army-detail-art unit-art-${safe(def.id)}" aria-hidden="true">
          <img data-army-unit-art alt=""><b>${def.icon}</b>
          <span class="army-detail-level-badge">Stufe ${s.level}</span>
        </div>
        <div class="army-detail-copy">
          <span class="army-kicker">${s.unlocked?'Freigeschaltete Einheit':'Noch gesperrt'}</span>
          <h3>${safe(name)}</h3>
          <p>${safe(def.description?.[state.activeSubject]||def.description.english)}</p>
          <div class="army-detail-role"><small>Aufgabe in deiner Armee</small><strong>${safe(def.role)}</strong><span>${safe(def.roleText)}</span><b>${unitPower(def,c)} / 100</b></div>
          <div class="army-detail-current"><small>Aktuelle Ausbaustufe</small><strong>${safe(current)}</strong><span>${safe(metricText(def,s))}</span></div>
        </div>
        <div class="army-detail-next">
          <span class="army-kicker">Nächste sichtbare Verbesserung</span>
          <strong>${safe(next)}</strong>
          <p>${safe(condition)}</p>
          <progress max="100" value="${s.progress}" aria-label="Fortschritt zur nächsten Aufwertung"></progress>
          <small>${s.next===null?'100% erreicht':`${s.progress}% bis zur nächsten Stufe`}</small>
        </div>
      </section>
      <section class="army-upgrade-road" aria-labelledby="armyUpgradeRoadTitle">
        <div class="army-section-head">
          <div><small>Aufwertungspfad</small><h3 id="armyUpgradeRoadTitle">5 Stufen</h3></div>
          <p>Keine Münzen, kein Kauf: Nur der echte Lernfortschritt zählt.</p>
        </div>
        <div class="army-upgrade-steps">${upgradePathMarkup(def,s)}</div>
      </section>
      <section class="army-detail-rule" aria-label="Aufwertungsregel">
        <span aria-hidden="true">✦</span>
        <div><strong>Automatische Aufwertung</strong><p>Die Einheit wird sofort aufgewertet, sobald die Lernbedingung erfüllt ist. Das Betrachten dieser Seite verändert deinen Lernstand nicht.</p></div>
      </section>
    `;
  }

  function applyArmyArt(){
    const art=window.VTArmyArt;
    const command=document.querySelector('.army-command');
    if(state?.activeSubject!=='english'){
      command?.classList.remove('art-ready');
      return;
    }
    if(!art?.ready)return;
    const hero=document.querySelector('[data-army-hero-art]');
    if(hero&&!hero.dataset.armyArtBound){
      hero.dataset.armyArtBound='1';
      hero.addEventListener('load',()=>hero.closest('.army-command')?.classList.add('art-ready'),{once:true});
      hero.src=art.heroUrl;
      if(hero.complete&&hero.naturalWidth)hero.closest('.army-command')?.classList.add('art-ready');
    }
    document.querySelectorAll('[data-army-unit-art]').forEach(img=>{
      if(img.dataset.armyArtBound)return;
      img.dataset.armyArtBound='1';
      const wrap=img.closest('.army-unit-art,.army-detail-art');
      img.addEventListener('load',()=>wrap?.classList.add('art-loaded'),{once:true});
      img.src=art.unitsUrl;
      if(img.complete&&img.naturalWidth)wrap?.classList.add('art-loaded');
    });
  }

  function render(){
    const root=document.querySelector('#armyView');
    if(!root||!state||typeof learner!=='function'||!learner())return;
    const c=context();
    const next=nextUpgrade(c);
    const subjectLabel=state.activeSubject==='latin'?'Latein · Legion':'Englisch · Armee';

    const hero=document.querySelector('#armyHero');
    if(hero)hero.innerHTML=heroMarkup(c);
    const subject=document.querySelector('#armySubjectLabel');
    if(subject)subject.textContent=subjectLabel;
    const rank=document.querySelector('#armyRankLabel');
    if(rank)rank.textContent=c.rank;
    const summary=document.querySelector('#armySummary');
    if(summary){
      const morale=moraleMeta(c);
      summary.innerHTML=`
        <div><small>Armeestärke</small><strong>${safe(c.strength)}</strong></div>
        <div><small>Moral</small><strong>${safe(morale.label)}</strong></div>
        <div><small>Testfestungen</small><strong>${safe(c.captured.length)}</strong></div>
        <div><small>Prüfungsabzeichen</small><strong>${safe(c.testBadges)}</strong></div>
      `;
    }
    const roles=document.querySelector('#armyRoleGrid');
    if(roles)roles.innerHTML=roleStrengthMarkup(c);
    const bonus=document.querySelector('#armyBonusGrid');
    if(bonus)bonus.innerHTML=bonusMarkup(c);
    const grid=document.querySelector('#armyUnitGrid');
    if(grid)grid.innerHTML=UNIT_DEFS.map(d=>unitCardMarkup(d,c)).join('');
    const goal=document.querySelector('#armyNextGoal');
    if(goal){
      goal.innerHTML=next
        ?`<span>Nächstes Upgrade</span><strong>${safe(subjectName(next.def))}</strong><small>${safe(nextText(next.def,next.s))}</small>`
        :'<span>Armee</span><strong>Maximal ausgebaut</strong><small>Alle sichtbaren Aufwertungen sind erreicht.</small>';
    }
    const battle=document.querySelector('#armyBattleBtn');
    if(battle){
      battle.disabled=!c.mission;
      battle.textContent=!c.mission?'Kein Test geplant':c.tickets>0?(c.mission.capturedAt?'Sicherung bereit':'Angriff bereit'):(c.mission.capturedAt?'Eroberte Festung ansehen':'Festung ansehen');
    }
    applyArmyArt();
  }

  function open(){
    if(typeof isParentMode==='function'&&isParentMode())return;
    render();
    if(typeof showView==='function')showView('armyView');
  }
  function renderDetail(){
    const root=document.querySelector('#armyUnitView');
    if(!root||!state||typeof learner!=='function'||!learner())return;
    const c=context(),def=UNIT_DEFS.find(x=>x.id===selectedUnitId)||UNIT_DEFS[0];
    const label=document.querySelector('#armyUnitSubjectLabel');
    if(label)label.textContent=state.activeSubject==='latin'?'Latein · Legion':'Englisch · Armee';
    const title=document.querySelector('#armyUnitViewTitle');
    if(title)title.textContent=subjectName(def);
    const detail=document.querySelector('#armyUnitDetail');
    if(detail)detail.innerHTML=detailMarkup(def,c);
    const battle=document.querySelector('#armyUnitBattleBtn');
    if(battle){
      battle.disabled=!c.mission;
      battle.textContent=!c.mission?'Kein Test geplant':c.tickets>0?(c.mission.capturedAt?'Sicherung bereit':'Angriff bereit'):'Zur Testfestung';
    }
    applyArmyArt();
  }
  function openDetail(id){
    if(!UNIT_DEFS.some(x=>x.id===id))return;
    selectedUnitId=id;
    renderDetail();
    if(typeof showView==='function')showView('armyUnitView');
  }
  function select(id){openDetail(id)}
  function focusNextUpgrade(){
    const c=context(),next=nextUpgrade(c);
    if(next)openDetail(next.def.id);
  }
  function bind(){
    document.querySelector('#armyBtn')?.addEventListener('click',open);
    document.querySelector('#armyBackBtn')?.addEventListener('click',()=>showView('childProgressView'));
    document.querySelector('#armyBattleBtn')?.addEventListener('click',()=>{if(typeof openBattleView==='function')openBattleView()});
    document.querySelector('#armyUnitBattleBtn')?.addEventListener('click',()=>{if(typeof openBattleView==='function')openBattleView()});
    document.querySelector('#armyUnitBackBtn')?.addEventListener('click',()=>{render();showView('armyView')});
    document.querySelector('#armyUpgradeFocusBtn')?.addEventListener('click',focusNextUpgrade);
    document.querySelector('#armyUnitGrid')?.addEventListener('click',e=>{
      const card=e.target.closest('[data-army-unit]');
      if(card)openDetail(card.dataset.armyUnit);
    });
    document.querySelector('#armyRoleGrid')?.addEventListener('click',e=>{
      const card=e.target.closest('[data-army-unit]');
      if(card)openDetail(card.dataset.armyUnit);
    });
  }

  document.addEventListener('vt-army-art-ready',applyArmyArt);
  window.VTArmyUi={render,renderDetail,open,openDetail,select,applyArt:applyArmyArt};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
