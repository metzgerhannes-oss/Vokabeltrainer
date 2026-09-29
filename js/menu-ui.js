'use strict';

(() => {
  function currentCapturedFortresses(){
    if(typeof learner!=='function'||!learner())return 0;
    const forts=Object.values(learner().testFortresses||{});
    return forts.filter(f=>f&&f.subject===state.activeSubject&&f.capturedAt).length;
  }

  function applyAvatarArt(){
    const img=document.querySelector('#projectMenuAvatarArt');
    const fallback=document.querySelector('#projectMenuAvatarFallback');
    const frame=document.querySelector('#projectMenuAvatarFrame');
    if(!img||!fallback||!frame||typeof state!=='object'||!state||!state.activeSubject)return;
    const level=Math.max(1,Math.min(6,Number(frame.dataset.avatarStage)||1));
    const isGermanAdventure=state.activeSubject==='german'&&typeof learnerWorldMode==='function'&&learnerWorldMode('german')==='adventure';
    const style=learner()?.avatarStyle==='female'?'female':'male';
    frame.classList.toggle('german-fox-avatar',isGermanAdventure);
    const key=`${state.activeSubject}-${style}-stage-${level}`;
    frame.dataset.avatarStyle=style;
    frame.dataset.worldMode=typeof learnerWorldMode==='function'?learnerWorldMode(state.activeSubject):'battle';
    const finalUrl=isGermanAdventure?'':(window.VTMenuAvatarArt?.get?.(state.activeSubject,style,level)||'');
    const armyUrl=isGermanAdventure?'':(window.VTArmyArt?.ready?window.VTArmyArt.heroUrl:'');
    const url=finalUrl||armyUrl;
    if(url){
      if(img.src!==url)img.src=url;
      img.dataset.avatarFinal=finalUrl?'true':'false';
      img.dataset.avatarArtKey=finalUrl?key:'fallback';
      img.classList.remove('hidden');
      fallback.classList.add('hidden');
    }else{
      img.removeAttribute('data-avatar-final');
      img.removeAttribute('data-avatar-art-key');
      img.classList.add('hidden');
      fallback.classList.remove('hidden');
    }
  }

  function renderAvatarStage(pct){
    const frame=document.querySelector('#projectMenuAvatarFrame');
    const label=document.querySelector('#menuAvatarStageLabel');
    const pips=document.querySelector('#menuAvatarStagePips');
    const next=document.querySelector('#menuAvatarNextStage');
    if(!frame||typeof avatarStageFor!=='function')return null;
    const stage=avatarStageFor(pct,state.activeSubject);
    frame.dataset.avatarStage=String(stage.level);
    const style=learner()?.avatarStyle==='female'?'female':'male';
    frame.dataset.avatarVisualKey=`${state.activeSubject}-${style}-stage-${stage.level}`;
    frame.dataset.avatarSubject=state.activeSubject;
    frame.dataset.avatarStyle=style;
    const profileName=String(learner()?.name||'Profil').trim()||'Profil';
    if(label)label.textContent=`${profileName} · Stufe ${stage.level}/${stage.maxLevel}`;
    if(pips)pips.innerHTML=Array.from({length:stage.maxLevel},(_,i)=>`<i class="${i<stage.level?'filled':''}"></i>`).join('');
    if(next)next.textContent=stage.nextAt===null?`${stage.label} · maximal entwickelt`:`${stage.label} · nächste Stufe bei ${stage.nextAt}%`;
    return stage;
  }

  function renderSubjectSwitcher(){
    const root=document.querySelector('#menuSubjectSwitcher');
    if(!root||typeof learner!=='function'||!learner())return;
    const subjects=typeof learnerActiveSubjects==='function'?learnerActiveSubjects(learner()):[state.activeSubject];
    root.innerHTML=subjects.map(subject=>`<button type="button" data-menu-subject="${esc(subject)}" class="${subject===state.activeSubject?'active':''}" aria-pressed="${subject===state.activeSubject?'true':'false'}">${esc(subjectShort(subject))}</button>`).join('');
    root.classList.toggle('hidden',subjects.length<=1);
    root.querySelectorAll('[data-menu-subject]').forEach(button=>{
      button.onclick=()=>{
        const subject=button.dataset.menuSubject;
        if(typeof isSubjectActive==='function'&&!isSubjectActive(subject))return;
        state.activeSubject=subject;
        if(typeof save==='function')save();
      };
    });
  }

  function render(){
    if(typeof state!=='object'||!state||typeof learner!=='function'||!learner())return;
    const p=typeof subjectProgress==='function'?subjectProgress():{mastered:0,pct:0,schoolYear:currentSchoolYear()};
    const growth=typeof campaignGrowthState==='function'?campaignGrowthState(state.activeSubject,p.schoolYear):{pct:p.pct};
    const subject=document.querySelector('#menuSubjectLabel');
    const rank=document.querySelector('#menuRankLabel');
    const learned=document.querySelector('#menuLearnedCount');
    const castles=document.querySelector('#menuFortressCount');
    const avatarStage=renderAvatarStage(growth.pct);
    const stageRoot=document.querySelector('.project-menu-stage');
    const visualTheme=typeof subjectVisualTheme==='function'?subjectVisualTheme(state.activeSubject):'campaign';
    if(stageRoot){
      stageRoot.dataset.visualTheme=visualTheme;
      stageRoot.dataset.subject=state.activeSubject;
    }
    if(subject)subject.textContent=subjectLabel(state.activeSubject);
    if(rank)rank.textContent=avatarStage?.rank||rankFor(growth.pct,state.activeSubject);
    if(learned)learned.textContent=String(p.mastered||0);
    if(castles)castles.textContent=String(currentCapturedFortresses());
    const navGame=document.querySelector('.nav-btn[data-view="armyView"]');
    const germanAdventure=state.activeSubject==='german'&&typeof learnerWorldMode==='function'&&learnerWorldMode('german')==='adventure';
    if(navGame)navGame.innerHTML=germanAdventure?'<span aria-hidden="true">🦊</span>Abenteuer':state.activeSubject==='german'?'<span aria-hidden="true">⚔</span>Wortreich':'<span aria-hidden="true">⚔</span>Armee';
    const testRoot=document.querySelector('#menuNextTestProgress');
    const testPct=document.querySelector('#menuNextTestPct');
    const testDetail=document.querySelector('#menuNextTestDetail');
    const ctx=typeof upcomingTestContext==='function'?upcomingTestContext(state.activeSubject):null;
    const readiness=ctx&&typeof testReadinessForContext==='function'?testReadinessForContext(ctx):null;
    const hasTest=!!(ctx&&readiness&&readiness.total>0);
    if(testRoot){
      testRoot.classList.toggle('hidden',!hasTest);
      if(hasTest){
        if(testPct)testPct.textContent=`${readiness.pct}%`;
        if(testDetail)testDetail.textContent=`${readiness.ready} von ${readiness.total} Vokabeln sicher`;
        testRoot.setAttribute('aria-label',`Nächster Test: ${readiness.pct} Prozent. ${readiness.ready} von ${readiness.total} Vokabeln sicher.`);
      }else{
        if(testPct)testPct.textContent='0%';
        if(testDetail)testDetail.textContent='Kein Test geplant';
        testRoot.removeAttribute('aria-label');
      }
    }
    renderSubjectSwitcher();
    applyAvatarArt();
  }

  function showProgressTarget(id){
    if(typeof showView!=='function')return;
    showView('childProgressView');
    requestAnimationFrame(()=>{
      const target=document.querySelector('#'+id);
      if(!target)return;
      target.focus({preventScroll:true});
      target.scrollIntoView({block:'start',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
    });
  }

  function openHome(){
    if(typeof showView==='function')showView('homeView');
    render();
  }

  function bind(){
    document.querySelector('#menuArmyBtn')?.addEventListener('click',()=>window.VTArmyUi?.open?.());
    document.querySelector('#menuCampaignBtn')?.addEventListener('click',()=>window.VTCampaignMap?.open?.());
    document.querySelector('#menuCardboxBtn')?.addEventListener('click',()=>showProgressTarget('cardboxOverviewCard'));
    document.querySelector('#menuAchievementsBtn')?.addEventListener('click',()=>showProgressTarget('progressOverviewCard'));
    document.querySelector('#progressMenuBtn')?.addEventListener('click',openHome);
    document.addEventListener('vt-army-art-ready',applyAvatarArt);
    document.addEventListener('vt-menu-avatar-art-ready',applyAvatarArt);
    render();
  }

  window.VTMenuUi={render,openHome,showProgressTarget,applyAvatarArt,renderAvatarStage,avatarStage:()=>typeof avatarStageFor==='function'?avatarStageFor(campaignGrowthState(state.activeSubject,subjectProgress().schoolYear).pct,state.activeSubject):null};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
