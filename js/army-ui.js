'use strict';

(() => {
  const UNIT_DEFS = [
    {
      id:'infantry',icon:'⚔',names:{english:'Infanterie',latin:'Legionäre'},
      description:{english:'Die verlässliche Basis deiner Armee.',latin:'Das Rückgrat deiner Legion.'},
      thresholds:[0,20,40,65,85],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'archers',icon:'➶',names:{english:'Bogenschützen',latin:'Sagittarii'},
      description:{english:'Treffen aus der Distanz und eröffnen neue Angriffsmöglichkeiten.',latin:'Fernkämpfer für gezielte Salven.'},
      thresholds:[20,35,55,75,90],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'cavalry',icon:'♞',names:{english:'Kavallerie',latin:'Equites'},
      description:{english:'Schnelle Eliteeinheiten für den späteren Feldzug.',latin:'Schnelle Reitereinheiten für die Flanke.'},
      thresholds:[55,65,75,85,95],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'ram',icon:'▰',names:{english:'Rammbock',latin:'Belagerungsgerät'},
      description:{english:'Wird mit wachsendem Feldzug immer stärker.',latin:'Schweres Gerät für befestigte Ziele.'},
      thresholds:[35,50,70,85,100],metric:c=>c.p.pct,metricName:'Lernfortschritt',suffix:'%'
    },
    {
      id:'shield',icon:'⬟',names:{english:'Schildträger',latin:'Scutum-Träger'},
      description:{english:'Belohnt Wissen, das schon über mehrere Tage stabil bleibt.',latin:'Stabile Reihen aus nachhaltig gefestigtem Wissen.'},
      thresholds:[15,35,55,75,90],metric:c=>c.stablePct,metricName:'stabile Wörter',suffix:'%'
    },
    {
      id:'support',icon:'✚',names:{english:'Sanitäter',latin:'Unterstützung'},
      description:{english:'Regelmäßiges Lernen baut deine Unterstützungseinheit aus.',latin:'Regelmäßigkeit stärkt die Versorgung deiner Legion.'},
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
    const wins=typeof fortressWins==='function'?fortressWins():[];
    const stablePct=p.total?Math.round((p.stable/p.total)*100):0;
    return {
      p,l,learningDays,currentStreak,wins,stablePct,
      strength:armyStrength(),
      next:nextFortress(),
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
    const wins=new Set(c.wins);
    return fortresses.map(f=>`<span class="army-fortress-step ${wins.has(f.id)?'won':''} ${c.next?.id===f.id?'next':''}" title="${safe(f.name)}"><i>${wins.has(f.id)?'✓':'♜'}</i><small>${safe(f.req)}%</small></span>`).join('');
  }
  function heroMarkup(c){
    const morale=moraleMeta(c);
    return `
      <div class="army-camp-sky" aria-hidden="true"></div>
      <div class="army-camp-banner" aria-hidden="true"><span>♜</span></div>
      <div class="army-camp-copy">
        <span class="army-kicker">${safe(state.activeSubject==='latin'?'Legion':'Armee')} · ${safe(c.p.schoolYear)}</span>
        <strong>${safe(c.rank)}</strong>
        <small>${safe(c.gear)}</small>
      </div>
      <div class="army-camp-strength">
        <span>Armeestärke</span><strong>${safe(c.strength)}</strong>
        <div class="army-morale-line"><i style="width:${morale.score}%"></i></div>
        <small>Moral: ${safe(morale.label)}</small>
      </div>
      <div class="army-camp-campaign" aria-label="${safe(c.wins.length)} von ${fortresses.length} Festungen erobert">
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
      <span class="army-unit-emblem" aria-hidden="true">${def.icon}</span>
      <strong>${safe(name)}</strong>
      <small>${safe(def.description?.[state.activeSubject]||def.description.english)}</small>
      <span class="army-unit-meter"><i style="width:${s.progress}%"></i></span>
      <span class="army-unit-state">${s.unlocked?metricText(def,s):`Freischaltung: ${nextText(def,s)}`}</span>
      <span class="army-unit-next">${s.unlocked?nextText(def,s):'Noch nicht freigeschaltet'}</span>
    </button>`;
  }
  function previewMarkup(def,c){
    const s=unitState(def,c),name=subjectName(def);
    return `
      <div class="army-preview-emblem unit-${safe(def.id)}" aria-hidden="true">${def.icon}</div>
      <div class="army-preview-copy">
        <span class="army-kicker">Einheit</span>
        <h3>${safe(name)}</h3>
        <p>${safe(def.description?.[state.activeSubject]||def.description.english)}</p>
      </div>
      <div class="army-preview-level">
        <span>Aktuell</span><strong>Stufe ${s.level||0}</strong>
        <small>${safe(metricText(def,s))}</small>
      </div>
      <div class="army-preview-upgrade">
        <span>Nächste Aufwertung</span>
        <strong>${safe(nextText(def,s))}</strong>
        <progress max="100" value="${s.progress}" aria-label="Fortschritt zur nächsten Aufwertung"></progress>
        <small>Aufwertungen entstehen automatisch aus dem Lernfortschritt.</small>
      </div>
    `;
  }

  function render(){
    const root=document.querySelector('#armyView');
    if(!root||!state||typeof learner!=='function'||!learner())return;
    const c=context();
    const selected=UNIT_DEFS.find(x=>x.id===selectedUnitId)||UNIT_DEFS[0];
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
        <div><small>Festungen</small><strong>${safe(c.wins.length)} / ${safe(fortresses.length)}</strong></div>
        <div><small>Ausrüstung</small><strong>${safe(c.gear)}</strong></div>
      `;
    }
    const bonus=document.querySelector('#armyBonusGrid');
    if(bonus)bonus.innerHTML=bonusMarkup(c);
    const grid=document.querySelector('#armyUnitGrid');
    if(grid)grid.innerHTML=UNIT_DEFS.map(d=>unitCardMarkup(d,c)).join('');
    const preview=document.querySelector('#armyUnitPreview');
    if(preview)preview.innerHTML=previewMarkup(selected,c);
    const goal=document.querySelector('#armyNextGoal');
    if(goal){
      goal.innerHTML=next
        ?`<span>Nächstes Upgrade</span><strong>${safe(subjectName(next.def))}</strong><small>${safe(nextText(next.def,next.s))}</small>`
        :'<span>Armee</span><strong>Maximal ausgebaut</strong><small>Alle sichtbaren Aufwertungen sind erreicht.</small>';
    }
    const battle=document.querySelector('#armyBattleBtn');
    if(battle){
      battle.disabled=c.tickets<1;
      battle.textContent=c.tickets>0?`Zur Schlacht · ${c.tickets}`:'Schlacht nach dem Lernen';
    }
  }

  function open(){
    if(typeof isParentMode==='function'&&isParentMode())return;
    render();
    if(typeof showView==='function')showView('armyView');
  }
  function select(id){
    if(!UNIT_DEFS.some(x=>x.id===id))return;
    selectedUnitId=id;
    render();
    document.querySelector('#armyUnitPreview')?.scrollIntoView({behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  }
  function focusNextUpgrade(){
    const c=context(),next=nextUpgrade(c);
    if(next)select(next.def.id);
  }
  function bind(){
    document.querySelector('#armyBtn')?.addEventListener('click',open);
    document.querySelector('#armyBackBtn')?.addEventListener('click',()=>showView('childProgressView'));
    document.querySelector('#armyBattleBtn')?.addEventListener('click',()=>{if(typeof openBattleView==='function')openBattleView()});
    document.querySelector('#armyUpgradeFocusBtn')?.addEventListener('click',focusNextUpgrade);
    document.querySelector('#armyUnitGrid')?.addEventListener('click',e=>{
      const card=e.target.closest('[data-army-unit]');
      if(card)select(card.dataset.armyUnit);
    });
  }

  window.VTArmyUi={render,open,select};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
