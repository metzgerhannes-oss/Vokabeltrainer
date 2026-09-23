'use strict';

(() => {
  let overlay=null;
  let lastSignature='';

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
    const list=typeof fortresses!=='undefined'?fortresses:[];
    const fortress=list.find(x=>x.id===entry.fortress)||null;
    const attack=typeof battleAttackMeta==='function'?battleAttackMeta(entry.attack):null;
    const next=typeof nextFortress==='function'?nextFortress():null;
    const campaign=typeof subjectCampaign==='function'?subjectCampaign(entry.subject):{unitLabel:'Armee'};
    const boss=typeof battleBossFor==='function'?battleBossFor(fortress):null;
    const strength=typeof armyStrength==='function'?armyStrength():0;
    const rank=typeof rankFor==='function'?rankFor(entry.progress,entry.subject):'';
    const missing=fortress?Math.max(0,Number(fortress.req||0)-Number(entry.progress||0)):0;
    return {entry,fortress,attack,next,campaign,boss,strength,rank,missing};
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
    const {entry,fortress,attack,next,boss,strength,rank,missing}=data;
    const win=entry.result==='win';
    root.classList.toggle('is-victory',win);
    root.classList.toggle('is-hold',!win);

    const title=root.querySelector('#battleResultTitle');
    const lead=root.querySelector('#battleResultLead');
    const rewards=root.querySelector('#battleResultRewards');
    const cont=root.querySelector('#battleResultContinue');

    if(win){
      title.textContent=boss?'Boss besiegt!':'Festung erobert!';
      lead.textContent=`${fortress?.name||'Die Festung'} ist gefallen. ${attack?.label||'Der Angriff'} war erfolgreich.`;
      rewards.innerHTML=[
        rewardTile('★','+20 XP','Belohnung für den Sieg'),
        rewardTile('▰',`${entry.progress}%`,'Lernfortschritt'),
        rewardTile('♜',next?next.name:'Jahresfeldzug gewonnen',next?'Nächstes Ziel':'Alle Festungen bezwungen'),
        rewardTile('⚔',String(strength),rank? `Armeestärke · ${rank}` : 'Armeestärke')
      ].join('');
      cont.textContent=next?'Weiter zur nächsten Festung':'Kampagne ansehen';
    }else{
      title.textContent=boss?`${boss.name} hält stand`:'Die Verteidigung hält';
      lead.textContent=missing>0
        ?`Noch ${missing} Prozentpunkte Lernfortschritt bis zum Durchbruch.`
        :'Der nächste Lernschritt macht den Unterschied.';
      rewards.innerHTML=[
        rewardTile('▰',`${entry.progress}%`,'Lernfortschritt'),
        rewardTile('⚔',attack?.label||'Angriff','gewählte Taktik'),
        rewardTile('♜',fortress?.name||'Festung','bleibt das nächste Ziel')
      ].join('');
      cont.textContent='Zurück zur Schlacht';
    }
    applyArt();
  }

  function show(){
    render();
    const root=ensureOverlay();
    const data=resultData();
    if(!data)return;
    const signature=`${data.entry.date}|${data.entry.result}|${data.entry.fortress}`;
    if(signature===lastSignature&&root.classList.contains('visible'))return;
    lastSignature=signature;
    root.classList.remove('hidden');
    requestAnimationFrame(()=>root.classList.add('visible'));
    document.body.classList.add('battle-result-open');
  }

  function hide(){
    const root=ensureOverlay();
    root.classList.remove('visible');
    document.body.classList.remove('battle-result-open');
    setTimeout(()=>root.classList.add('hidden'),180);
  }

  function observe(){
    const stage=document.querySelector('#battleStage');
    if(!stage)return;
    const sync=()=>{
      const finished=stage.classList.contains('battle-finished');
      if(finished){
        queueMicrotask(show);
      }else if(!overlay?.classList.contains('hidden')){
        hide();
      }
    };
    new MutationObserver(sync).observe(stage,{attributes:true,attributeFilter:['class'],childList:true});
    sync();
  }

  function boot(){
    ensureOverlay();
    observe();
    document.addEventListener('vt-battle-art-ready',applyArt);
  }

  window.VTBattleResultUi={show,hide,render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
