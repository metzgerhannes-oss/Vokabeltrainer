'use strict';

(() => {
  let overlay=null;
  let lastSignature='';
  let pendingShowTimer=null;
  let pendingHideTimer=null;
  let pendingVisibleFrame=null;

  function escResult(value){
    const text=String(value??'');
    if(typeof esc==='function')return esc(text);
    return text.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  function ensureOverlay(){
    if(overlay)return overlay;
    overlay=document.createElement('section');
    overlay.id='battleResultOverlay';
    overlay.className='battle-result-overlay hidden';
    overlay.setAttribute('aria-live','polite');
    overlay.setAttribute('aria-labelledby','battleResultTitle');
    overlay.innerHTML=`
      <div class="battle-result-card">
        <img id="battleResultArt" class="battle-result-art" alt="" aria-hidden="true">
        <div class="battle-result-shade" aria-hidden="true"></div>
        <button id="battleResultClose" class="battle-result-close" type="button" aria-label="Ergebnis schließen">×</button>
        <div class="battle-result-content">
          <div class="battle-result-kicker">Ergebnis</div>
          <h2 id="battleResultTitle">Festung erobert</h2>
          <p id="battleResultLead"></p>

          <div id="battleResultRewards" class="battle-result-rewards"></div>

          <div class="battle-result-actions">
            <button id="battleResultContinue" class="battle-result-primary" type="button">Weiter</button>
            <button id="battleResultArmy" class="battle-result-secondary" type="button">Meine Armee</button>
          </div>
        </div>
      </div>
    `;
    document.querySelector('#battleView')?.appendChild(overlay);
    overlay.querySelector('#battleResultClose')?.addEventListener('click',hide);
    overlay.querySelector('#battleResultContinue')?.addEventListener('click',hide);
    overlay.querySelector('#battleResultArmy')?.addEventListener('click',()=>{
      hide();
      if(window.VTArmyUi?.open)window.VTArmyUi.open();
      else if(typeof showView==='function')showView('childProgressView');
    });
    return overlay;
  }

  function resultData(){
    const l=typeof learner==='function'?learner():null;
    const entry=l?.campaignLog?.[l.campaignLog.length-1];
    if(!entry)return null;
    const fortress=(entry.fortressKey&&l?.testFortresses?.[entry.fortressKey])||(typeof currentTestFortress==='function'?currentTestFortress(entry.subject):null);
    const attack=entry.attack==='secure'?null:(typeof battleAttackMeta==='function'?battleAttackMeta(entry.attack):null);
    const campaign=typeof subjectCampaign==='function'?subjectCampaign(entry.subject):{unitLabel:'Armee'};
    const boss=entry.result==='win'&&typeof battleBossFor==='function'?battleBossFor(fortress):null;
    const strength=typeof armyStrength==='function'?armyStrength():0;
    const rank=typeof rankFor==='function'?rankFor(entry.progress,entry.subject):'';
    return {entry,fortress,attack,campaign,boss,strength,rank};
  }

  function rewardTile(icon,title,text){
    return `<div class="battle-result-reward"><span aria-hidden="true">${icon}</span><strong>${escResult(title)}</strong><small>${escResult(text)}</small></div>`;
  }

  function applyArt(){
    const img=ensureOverlay().querySelector('#battleResultArt');
    if(!img)return;
    const art=window.VTBattleResultArt?.ready?window.VTBattleResultArt:window.VTBattleArt;
    if(!art?.ready)return;
    const src=art.sceneUrl||art.resultUrl;
    if(!src)return;
    img.src=src;
  }

  function render(){
    const root=ensureOverlay(),data=resultData();
    if(!data)return;
    const {entry,fortress,attack,boss,strength,rank}=data;
    const win=entry.result==='win',secure=entry.result==='secure',damage=entry.result==='damage';
    root.classList.toggle('is-victory',win||secure);
    root.classList.toggle('is-hold',damage);

    const title=root.querySelector('#battleResultTitle');
    const lead=root.querySelector('#battleResultLead');
    const rewards=root.querySelector('#battleResultRewards');
    const cont=root.querySelector('#battleResultContinue');
    const testDate=entry.testDate||(fortress?.testDate||'');

    if(secure){
      title.textContent='Festung gesichert!';
      lead.textContent=`${fortress?.name||entry.fortressName||'Die Festung'} bleibt für den Test am ${typeof formatDateShort==='function'?formatDateShort(testDate):testDate} unter Kontrolle.`;
      rewards.innerHTML=[
        rewardTile('✓','Sicherung abgeschlossen','heutiger Lernauftrag genutzt'),
        rewardTile('♜',String(fortress?.securedDates?.length||1),'Sicherungstage'),
        rewardTile('◷',typeof formatDateShort==='function'?formatDateShort(testDate):testDate,'Testtermin'),
        rewardTile('⚔',String(strength),rank?`Armeestärke · ${rank}`:'Armeestärke')
      ].join('');
      cont.textContent='Festung ansehen';
    }else if(win){
      title.textContent=boss?'Boss besiegt!':'Festung erobert!';
      lead.textContent=`${fortress?.name||entry.fortressName||'Die Testfestung'} ist gefallen. Jetzt wird sie bis zum Test am ${typeof formatDateShort==='function'?formatDateShort(testDate):testDate} gesichert.`;
      rewards.innerHTML=[
        rewardTile('★','+20 XP','Belohnung für die Eroberung'),
        rewardTile('⚔',String(entry.damage||0),entry.tacticalBonus?`Schaden · davon +${entry.tacticalBonus} Taktik`:'Schaden des letzten Angriffs'),
        rewardTile('◷',typeof formatDateShort==='function'?formatDateShort(testDate):testDate,'Testtermin'),
        rewardTile('♜',fortress?.scopeText||'Teststoff','Diese Festung steht für den Test')
      ].join('');
      cont.textContent='Eroberte Festung ansehen';
    }else{
      title.textContent='Angriff gelungen!';
      lead.textContent=`${entry.damage||0} Schaden. Noch ${entry.defenseAfter||0} Verteidigung bis zur Eroberung.`;
      rewards.innerHTML=[
        rewardTile('⚔',String(entry.damage||0),entry.tacticalBonus?`heutiger Schaden · +${entry.tacticalBonus} Taktik`:'heutiger Schaden'),
        rewardTile('♜',String(entry.defenseAfter||0),'Verteidigung übrig'),
        rewardTile('▰',`${entry.readiness||0}%`,'aktuelle Testbereitschaft'),
        rewardTile('◷',typeof formatDateShort==='function'?formatDateShort(testDate):testDate,'Testtermin')
      ].join('');
      cont.textContent='Zurück zur Belagerung';
    }
    applyArt();
  }

  function show(){
    render();
    const root=ensureOverlay();
    const data=resultData();
    if(!data)return;
    const signature=`${data.entry.date}|${data.entry.result}|${data.entry.fortressKey||data.entry.fortress}|${data.entry.defenseAfter??''}`;
    if(signature===lastSignature&&root.classList.contains('visible')&&!root.classList.contains('hidden'))return;
    lastSignature=signature;
    if(pendingHideTimer){clearTimeout(pendingHideTimer);pendingHideTimer=null}
    if(pendingVisibleFrame){cancelAnimationFrame(pendingVisibleFrame);pendingVisibleFrame=null}
    root.classList.remove('hidden');
    pendingVisibleFrame=requestAnimationFrame(()=>{
      pendingVisibleFrame=null;
      root.classList.add('visible');
    });
    document.body.classList.add('battle-result-open');
  }

  function hide(){
    const root=ensureOverlay();
    if(pendingVisibleFrame){cancelAnimationFrame(pendingVisibleFrame);pendingVisibleFrame=null}
    if(pendingHideTimer){clearTimeout(pendingHideTimer);pendingHideTimer=null}
    root.classList.remove('visible');
    document.body.classList.remove('battle-result-open');
    pendingHideTimer=setTimeout(()=>{
      pendingHideTimer=null;
      if(!root.classList.contains('visible'))root.classList.add('hidden');
    },180);
  }

  function scheduleShow(){
    const stage=document.querySelector('#battleStage');
    if(!stage?.classList.contains('battle-finished'))return;
    if(stage.classList.contains('conquest-transition')){
      if(pendingShowTimer)return;
      const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const deterministic=window.__VT_BATTLE_TEST_MODE__===true;
      pendingShowTimer=setTimeout(()=>{
        pendingShowTimer=null;
        if(stage.classList.contains('battle-finished'))show();
      },deterministic?0:(reduced?40:1140));
      return;
    }
    if(!pendingShowTimer)queueMicrotask(show);
  }

  function observe(){
    const stage=document.querySelector('#battleStage');
    if(!stage)return;
    const sync=()=>{
      if(stage.classList.contains('battle-finished'))scheduleShow();
      else{
        if(pendingShowTimer){clearTimeout(pendingShowTimer);pendingShowTimer=null}
        if(!overlay?.classList.contains('hidden'))hide();
      }
    };
    new MutationObserver(sync).observe(stage,{attributes:true,attributeFilter:['class'],childList:true});
    sync();
  }

  function boot(){
    ensureOverlay();
    observe();
    document.addEventListener('vt-battle-result',scheduleShow);
    document.addEventListener('vt-battle-art-ready',applyArt);
  }

  window.VTBattleResultUi={show,hide,render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
