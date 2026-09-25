'use strict';
(() => {
  const PLACES=['Silberhain','Graufurt','Rotfels','Nebelpass','Eichenwacht','Morgenfels','Falkenfurt','Sternklamm','Westhain','Hochwacht','Mondfurt','Steinbrück'];
  const REGIONS={autumn:'Herbstmark',winter:'Winterwald',spring:'Frühlingslande',summer:'Sommerhöhe'};
  let selectedKey='';
  const safe=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
  function bounds(year=currentSchoolYear()){const y=Number(String(year).split('/')[0])||new Date().getFullYear();return {start:`${y}-08-01`,end:`${y+1}-07-31`}}
  function inYear(date,year=currentSchoolYear()){if(!/^\d{4}-\d{2}-\d{2}$/.test(String(date||'')))return false;const b=bounds(year);return date>=b.start&&date<=b.end}
  function region(date){const m=Number(String(date||'').slice(5,7))||9;if(m===12||m<=2)return'winter';if(m<=5&&m>=3)return'spring';if(m<=7&&m>=6)return'summer';return'autumn'}
  function hash(v){let h=2166136261;for(const ch of String(v||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
  const place=(subject,date)=>PLACES[hash(subject+':'+date)%PLACES.length];
  const dateLabel=d=>typeof formatDateShort==='function'?formatDateShort(d):d;

  function grouped(subject,year){
    const map=new Map();
    const add=date=>{if(!date||!inYear(date,year))return null;let r=map.get(date);if(!r){r={date,sets:[],series:false,scopeText:'',wordCount:0,fortress:null,grade:null};map.set(date,r)}return r};
    const sets=(typeof mySets==='function'?mySets(subject):[]).filter(s=>s.schoolYear===year&&s.testDate&&inYear(s.testDate,year));
    for(const set of sets){const r=add(set.testDate);if(r&&!r.sets.some(x=>x.id===set.id))r.sets.push(set)}
    for(const r of map.values()){
      const words=r.sets.flatMap(set=>{const scoped=typeof scopedWordsForSet==='function'?scopedWordsForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds):[];return scoped.length?scoped:(typeof setWords==='function'?setWords(set.id):[])});
      const seen=new Set();r.wordCount=words.filter(w=>w&&!seen.has(w.id)&&seen.add(w.id)).length;
      r.scopeText=r.sets.map(set=>typeof scopeTextForSet==='function'?scopeTextForSet(set,set.testScopeMode,set.testFrom,set.testTo,set.testSelectedLinkIds):set.title).filter(Boolean).join(' + ');
      r.reviewOpen=r.sets.some(set=>typeof setNeedsPairReview==='function'&&setNeedsPairReview(set));
    }
    if(typeof activeSeries==='function'&&typeof nextWeeklyDate==='function'){
      const cfg=activeSeries(subject);
      if(cfg){const d=nextWeeklyDate(cfg.weekday),r=add(d);if(r){r.series=true;const set=(state.sets||[]).find(s=>s.id===cfg.setId&&s.learnerId===state.activeLearnerId&&s.subject===subject);if(set&&!r.sets.some(x=>x.id===set.id))r.sets.push(set);const words=typeof scopedWordsForSeries==='function'?scopedWordsForSeries(cfg,subject):[];if(words.length)r.wordCount=Math.max(r.wordCount,words.length);if(!r.scopeText&&typeof seriesScopeText==='function')r.scopeText=seriesScopeText(cfg)}}
    }
    const hist=typeof testFortressHistory==='function'?testFortressHistory(subject):[];
    for(const f of hist){const r=add(f.testDate);if(r&&!r.fortress)r.fortress=f}
    for(const g of (state.grades||[]).filter(g=>g.learnerId===state.activeLearnerId&&g.subject===subject&&inYear(g.date,year))){const r=add(g.date);if(r&&!r.grade)r.grade=g}
    return map;
  }

  function status(row,current){
    if(row.grade)return'completed';
    if(row.fortress?.capturedAt)return(row.fortress.securedDates||[]).length?'secured':'captured';
    if(current?.testDate===row.date)return'active';
    if(row.date<today())return'awaiting';
    return'planned';
  }
  function meta(st,row){
    const d=typeof daysUntil==='function'?daysUntil(row.date):0;
    if(st==='completed')return['Test abgeschlossen',`Note ${row.grade?.grade||'–'} eingetragen`];
    if(st==='secured')return['Festung gesichert',`${row.fortress?.securedDates?.length||0} Sicherungstage`];
    if(st==='captured')return['Festung erobert','Bis zum Test halten'];
    if(st==='active')return['Aktuelles Testziel',d===0?'Test ist heute':d===1?'Test ist morgen':`Test in ${d} Tagen`];
    if(st==='awaiting')return['Ergebnis offen','Test vorbei · Note noch nicht eingetragen'];
    return['Ziel entdeckt',d===0?'heute':d===1?'morgen':d>1?`in ${d} Tagen`:'geplant'];
  }
  function stations(subject=state.activeSubject,year=currentSchoolYear()){
    const rows=[...grouped(subject,year).values()].sort((a,b)=>a.date.localeCompare(b.date));
    const current=typeof currentTestFortress==='function'?currentTestFortress(subject):null;
    return rows.map((row,index)=>{
      if(!row.fortress&&current?.testDate===row.date)row.fortress=current;
      const st=status(row,current),m=meta(st,row),reg=region(row.date),mx=Math.max(1,Number(row.fortress?.maxDefense)||1),def=Math.max(0,Number(row.fortress?.defense)||0);
      return {key:`test:${subject}:${row.date}`,index,date:row.date,subject,region:reg,status:st,title:row.fortress?.name?`${row.fortress.name} von ${place(subject,row.date)}`:`Ziel bei ${place(subject,row.date)}`,statusLabel:m[0],statusDetail:m[1],scopeText:row.scopeText||row.fortress?.scopeText||'Testumfang noch nicht festgelegt',wordCount:row.wordCount||row.fortress?.wordCount||0,reviewOpen:!!row.reviewOpen,fortress:row.fortress,grade:row.grade,series:row.series,siegePct:row.fortress?Math.max(0,Math.min(100,Math.round((1-def/mx)*100))):0};
    });
  }
  function icon(s){if(s.status==='completed')return'✓';if(s.status==='secured'||s.status==='captured')return'⚑';if(s.status==='active')return'♜';if(s.status==='awaiting')return'!';return'◇'}
  function stop(s){
    const side=s.index%2?'right':'left';
    return `<article class="campaign-map-stop region-${s.region} side-${side} status-${s.status}"><div class="campaign-map-route-node" aria-hidden="true"><span>${icon(s)}</span></div><button type="button" class="campaign-map-station" data-campaign-station="${safe(s.key)}"><small>${safe(REGIONS[s.region])} · ${safe(dateLabel(s.date))}</small><strong>${safe(s.title)}</strong><span>${safe(s.statusLabel)} · ${safe(s.statusDetail)}</span>${s.fortress?`<progress max="100" value="${s.siegePct}" aria-label="Belagerungsfortschritt"></progress>`:''}${s.grade?`<b class="campaign-map-grade">Note ${safe(s.grade.grade)}</b>`:''}</button></article>`;
  }
  function markup(list,pct){
    return `<div class="campaign-map-start"><span aria-hidden="true">⚑</span><div><small>Startlager</small><strong>Hier beginnt dein Schuljahresfeldzug</strong></div></div><div class="campaign-map-route">${list.map(stop).join('')}<article class="campaign-map-stop campaign-map-unknown"><div class="campaign-map-route-node" aria-hidden="true"><span>?</span></div><div class="campaign-map-fog-card"><small>Unbekanntes Land</small><strong>Der Weg geht weiter</strong><span>Neue Tests erscheinen automatisch, sobald sie geplant werden.</span></div></article><article class="campaign-map-stop campaign-map-year-goal ${pct>=100?'completed':''}"><div class="campaign-map-route-node" aria-hidden="true"><span>${pct>=100?'✓':'♛'}</span></div><button type="button" class="campaign-map-station campaign-map-year-fortress" data-campaign-station="year-goal"><small>Fernziel</small><strong>Jahresfestung</strong><span>${pct>=100?'Schuljahr gemeistert':`${pct}% Schuljahresfortschritt`}</span><progress max="100" value="${pct}" aria-label="Fortschritt zur Jahresfestung"></progress></button></article></div>`;
  }
  function detail(st){
    const root=document.querySelector('#campaignMapDetail'),battle=document.querySelector('#campaignMapBattleBtn');if(!root)return;
    if(!st){root.innerHTML='<strong>Wähle ein Ziel auf der Karte.</strong>';battle?.classList.add('hidden');return}
    const grade=st.grade?`<div><small>Testergebnis</small><strong>Note ${safe(st.grade.grade)}</strong></div>`:'';
    const defense=st.fortress?`<div><small>Belagerung</small><strong>${st.siegePct}%</strong><span>${Math.max(0,Number(st.fortress.defense)||0)} Verteidigung übrig</span></div>`:'';
    root.innerHTML=`<div class="campaign-map-detail-head"><small>${safe(REGIONS[st.region])}</small><h3>${safe(st.title)}</h3><p>${safe(st.statusLabel)} · ${safe(st.statusDetail)}</p></div><div class="campaign-map-detail-grid"><div><small>Test</small><strong>${safe(dateLabel(st.date))}</strong><span>${safe(st.scopeText)}</span></div><div><small>Umfang</small><strong>${st.wordCount?st.wordCount+' Vokabeln':'noch offen'}</strong><span>${st.series?'wiederkehrender Test':'geplanter Test'}</span></div>${defense}${grade}</div>${st.reviewOpen?'<div class="campaign-map-note">Die Vokabelpaare für dieses Ziel müssen im Elternbereich noch geprüft werden.</div>':''}`;
    const current=typeof currentTestFortress==='function'?currentTestFortress(st.subject):null,can=current?.testDate===st.date;
    if(battle){battle.classList.toggle('hidden',!can);battle.disabled=!can;battle.textContent=st.fortress?.capturedAt?'Festung ansehen / sichern':'Zur Schlacht'}
  }
  function yearDetail(pct){
    const root=document.querySelector('#campaignMapDetail');if(!root)return;
    root.innerHTML=`<div class="campaign-map-detail-head"><small>Fernziel</small><h3>Jahresfestung</h3><p>${pct>=100?'Das Schuljahresziel ist erreicht.':'Sie steht für deinen langfristigen Schuljahresfortschritt – nicht für eine feste Zahl von Tests.'}</p></div><div class="campaign-map-detail-grid"><div><small>Schuljahresfortschritt</small><strong>${pct}%</strong><span>nachhaltig gemeisterte Vokabeln</span></div><div><small>Regel</small><strong>Dynamischer Feldzug</strong><span>Neue Testziele werden unterwegs ergänzt.</span></div></div>`;
    document.querySelector('#campaignMapBattleBtn')?.classList.add('hidden');
  }
  function select(key){
    selectedKey=key;document.querySelectorAll('[data-campaign-station]').forEach(b=>b.classList.toggle('selected',b.dataset.campaignStation===key));
    const pct=subjectProgress().pct;if(key==='year-goal'){yearDetail(pct);return}detail(stations().find(s=>s.key===key)||null);
  }
  function render(){
    const board=document.querySelector('#campaignMapBoard');if(!board||!state||typeof learner!=='function'||!learner())return;
    const subject=state.activeSubject,year=currentSchoolYear(),list=stations(subject,year),p=subjectProgress(subject,year);
    const label=document.querySelector('#campaignMapSubjectLabel');if(label)label.textContent=`${subjectLabel(subject)} · ${year}`;
    const sum=document.querySelector('#campaignMapSummary');if(sum){const done=list.filter(s=>s.status==='completed').length,won=list.filter(s=>['captured','secured','completed'].includes(s.status)).length;sum.textContent=list.length?`${done} Tests abgeschlossen · ${won} Ziele erobert · weitere Ziele erscheinen automatisch`:'Noch kein Test geplant · die Karte wächst mit deinem Schuljahr'}
    board.innerHTML=markup(list,p.pct);
    const active=list.find(s=>s.status==='active')||list.find(s=>s.date>=today())||list[list.length-1],want=selectedKey==='year-goal'||list.some(s=>s.key===selectedKey)?selectedKey:(active?.key||'year-goal');select(want);
  }
  function open(){if(typeof isParentMode==='function'&&isParentMode())return;render();if(typeof showView==='function')showView('campaignMapView')}
  function bind(){
    document.querySelector('#campaignMapBtn')?.addEventListener('click',open);
    document.querySelector('#campaignMapBackBtn')?.addEventListener('click',()=>window.VTMenuUi?.openHome?.()||showView('homeView'));
    document.querySelector('#campaignMapArmyBtn')?.addEventListener('click',()=>window.VTArmyUi?.open?.());
    document.querySelector('#campaignMapBattleBtn')?.addEventListener('click',()=>{if(typeof openBattleView==='function')openBattleView()});
    document.querySelector('#campaignMapBoard')?.addEventListener('click',e=>{const b=e.target.closest('[data-campaign-station]');if(b)select(b.dataset.campaignStation)});
  }
  window.VTCampaignMap={open,render,select,stations};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();