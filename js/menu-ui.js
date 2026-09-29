'use strict';

(() => {
  function currentCapturedFortresses(){
    if(typeof learner!=='function'||!learner())return 0;
    const forts=Object.values(learner().testFortresses||{});
    return forts.filter(f=>f&&f.subject===state.activeSubject&&f.capturedAt).length;
  }

  function resetAvatarSurface(img,fallback,frame){
    window.VTWordrealmUi?.clearHome?.();
    frame.classList.remove('wordrealm-rendered','german-fox-avatar','german-knight-avatar','world-adventure-avatar','world-battle-avatar');
    frame.removeAttribute('data-avatar-render-key');
    img.removeAttribute('src');
    img.removeAttribute('data-avatar-final');
    img.removeAttribute('data-avatar-art-key');
    img.classList.add('hidden');
    fallback.classList.remove('hidden','wordrealm-svg-avatar','adventure-svg-avatar');
    fallback.innerHTML='<span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-shield">V</span>';
  }

  function applyAvatarArt(){
    const img=document.querySelector('#projectMenuAvatarArt');
    const fallback=document.querySelector('#projectMenuAvatarFallback');
    const frame=document.querySelector('#projectMenuAvatarFrame');
    if(!img||!fallback||!frame||typeof state!=='object'||!state||!state.activeSubject)return;
    const level=Math.max(1,Math.min(6,Number(frame.dataset.avatarStage)||1));
    const isGerman=state.activeSubject==='german',worldMode=typeof learnerWorldMode==='function'?learnerWorldMode(state.activeSubject):'battle',adventure=worldMode==='adventure';
    const style=['male','female','neutral'].includes(learner()?.avatarStyle)?learner().avatarStyle:'male';
    const key=`${state.activeSubject}-${worldMode}-${style}-stage-${level}`;
    resetAvatarSurface(img,fallback,frame);
    frame.dataset.avatarRenderKey=key;
    frame.classList.toggle('german-fox-avatar',isGerman&&adventure);
    frame.classList.toggle('german-knight-avatar',isGerman&&!adventure);
    frame.classList.toggle('world-adventure-avatar',adventure);
    frame.classList.toggle('world-battle-avatar',!adventure);
    frame.dataset.avatarStyle=style;
    frame.dataset.worldMode=worldMode;
    if(isGerman&&!adventure){
      window.VTWordrealmUi?.renderHome?.(level);
      frame.dataset.avatarRenderKey=key;
      return;
    }
    if(isGerman&&adventure){
      fallback.innerHTML=window.VTWordrealmUi?.adventureFoxSvg?.(level)||'<span class="avatar-head"></span><span class="avatar-body"></span><span class="avatar-shield">⌖</span>';
      fallback.classList.add('wordrealm-svg-avatar','adventure-svg-avatar');
      frame.dataset.avatarRenderKey=key;
    }
    const finalUrl=adventure||isGerman?'':(window.VTMenuAvatarArt?.get?.(state.activeSubject,style,level)||'');
    const armyUrl=adventure||isGerman||style!=='male'?'':(window.VTArmyArt?.ready?window.VTArmyArt.heroUrl:'');
    const shield=fallback.querySelector?.('.avatar-shield');if(shield)shield.textContent=adventure?'⌖':isGerman?'W':'V';
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
    const style=['male','female','neutral'].includes(learner()?.avatarStyle)?learner().avatarStyle:'male',worldMode=learnerWorldMode(state.activeSubject);
    frame.dataset.avatarVisualKey=`${state.activeSubject}-${worldMode}-${style}-stage-${stage.level}`;
    frame.dataset.avatarSubject=state.activeSubject;
    frame.dataset.avatarStyle=style;
    frame.dataset.worldMode=worldMode;
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
    document.body.dataset.activeSubject=state.activeSubject;
    if(subject)subject.textContent=subjectLabel(state.activeSubject);
    if(rank)rank.textContent=avatarStage?.rank||rankFor(growth.pct,state.activeSubject);
    if(learned)learned.textContent=String(p.mastered||0);
    if(castles)castles.textContent=String(currentCapturedFortresses());
    const navGame=document.querySelector('.nav-btn[data-view="armyView"]');
    const world=typeof subjectWorldPresentation==='function'?subjectWorldPresentation(state.activeSubject):{icon:'⚔',short:'Armee'};
    if(navGame)navGame.innerHTML=`<span aria-hidden="true">${esc(world.icon||'⚔')}</span>${esc(world.short||world.title||'Spiel')}`;
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
    window.VTReadAloud?.syncPageButton?.();
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
    document.querySelector('#wordrealmLearningWordsBtn')?.addEventListener('click',()=>typeof showView==='function'&&showView('practiceView'));
    document.querySelector('#wordrealmEnterBtn')?.addEventListener('click',()=>window.VTArmyUi?.open?.());
    document.querySelector('#wordrealmSignWords')?.addEventListener('click',()=>typeof showView==='function'&&showView('practiceView'));
    document.querySelector('#wordrealmSignSentences')?.addEventListener('click',()=>window.VTGermanFoundation?.open?.('sentences'));
    document.querySelector('#wordrealmSignAdventure')?.addEventListener('click',()=>window.VTArmyUi?.open?.());
    document.addEventListener('vt-army-art-ready',applyAvatarArt);
    document.addEventListener('vt-menu-avatar-art-ready',applyAvatarArt);
    render();
  }

  window.VTMenuUi={render,openHome,showProgressTarget,applyAvatarArt,renderAvatarStage,avatarStage:()=>typeof avatarStageFor==='function'?avatarStageFor(campaignGrowthState(state.activeSubject,subjectProgress().schoolYear).pct,state.activeSubject):null};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
