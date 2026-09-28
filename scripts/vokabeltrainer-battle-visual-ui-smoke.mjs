import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const {browser,page,assert,reset,openBattle,waitForBattleResult,errors,diagnose}=await createBattleHarness();

try{
  await reset({revealed:true,ticket:false});
  await openBattle();
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  const previewState=await page.evaluate(()=>({
    preview:document.body.classList.contains('battle-preview'),
    immersive:document.body.classList.contains('battle-immersive'),
    nav:getComputedStyle(document.querySelector('.bottom-nav')).display,
    ticket:getComputedStyle(document.querySelector('#battleTicketPill')).display,
    readout:getComputedStyle(document.querySelector('#battleView .battle-readout')).display,
    tactics:getComputedStyle(document.querySelector('#battleView .battle-scene-tactics')).display,
    dock:getComputedStyle(document.querySelector('#battleView .battle-action-dock')).display,
    stageVisible:getComputedStyle(document.querySelector('#battleStage')).display!=='none',
    ownBanner:document.querySelector('#battleStage .battle-scene-banner-own')?.textContent?.trim()||'',
    targetBanner:document.querySelector('#battleStage .battle-scene-banner-target')?.textContent?.trim()||''
  }));
  assert(previewState.preview&&!previewState.immersive,'locked fortress opens as a dedicated scrollable preview');
  assert(previewState.nav==='none','fortress preview keeps the app navigation out of the scene');
  assert(previewState.ticket==='none'&&previewState.readout==='none'&&previewState.tactics==='none'&&previewState.dock==='none','fortress preview hides battle-only HUD, tactics and disabled action controls');
  assert(previewState.stageVisible&&previewState.ownBanner==='Mein Profil'&&previewState.targetBanner==='Test 1','fortress preview keeps the approved campaign artwork and both identity banners');
  await page.evaluate(()=>returnFromBattle());
  assert(await page.locator('body.battle-preview').count()===0,'leaving fortress preview clears preview mode');

  await reset({revealed:true,ticket:true});
  await openBattle();
  await page.setViewportSize({width:1180,height:720});
  await page.evaluate(()=>renderBattleView());
  assert(!(await page.evaluate(()=>document.body.classList.contains('battle-immersive'))),'battle opens in normal scrollable mode by default');
  assert(await page.locator('.bottom-nav').evaluate(el=>getComputedStyle(el).display)==='none','primary navigation is hidden for the entire battle view');

  await page.waitForFunction(()=>window.VTBattleArt?.ready===true);
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  assert(await page.locator('#battleStage [data-battle-art-stack]').count()===1,'dedicated painted battle artwork is mounted in the current scene');
  assert((await page.locator('#battleStage .battle-scene-banner-own').textContent())?.trim()==='Mein Profil','attack scene identifies the player side with the profile name instead of a generic army label');
  assert((await page.locator('#battleStage .battle-scene-banner-target').textContent())?.trim()==='Test 1','attack scene identifies the target as Test plus its school-year sequence number');
  const attackBannerVisual=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage')?.getBoundingClientRect();
    const own=document.querySelector('#battleStage .battle-scene-banner-own');
    const target=document.querySelector('#battleStage .battle-scene-banner-target');
    const ownRect=own?.getBoundingClientRect(),targetRect=target?.getBoundingClientRect();
    return {
      ownWidth:ownRect?.width||0,ownHeight:ownRect?.height||0,
      targetWidth:targetRect?.width||0,targetHeight:targetRect?.height||0,
      ownRelativeTop:stage&&ownRect?(ownRect.top-stage.top)/stage.height:null,
      targetRelativeTop:stage&&targetRect?(targetRect.top-stage.top)/stage.height:null,
      ownShieldWidth:own?parseFloat(getComputedStyle(own,'::before').width||'0'):0,
      targetShieldWidth:target?parseFloat(getComputedStyle(target,'::before').width||'0'):0,
      ownShieldHeight:own?parseFloat(getComputedStyle(own,'::before').height||'0'):0,
      targetShieldHeight:target?parseFloat(getComputedStyle(target,'::before').height||'0'):0,
      ownRodWidth:own?parseFloat(getComputedStyle(own,'::after').width||'0'):0,
      targetRodWidth:target?parseFloat(getComputedStyle(target,'::after').width||'0'):0,
      ownScrollCapWidth:own?.querySelector('span')?parseFloat(getComputedStyle(own.querySelector('span'),'::before').width||'0'):0,
      targetScrollCapWidth:target?.querySelector('span')?parseFloat(getComputedStyle(target.querySelector('span'),'::after').width||'0'):0
    };
  });
  assert(attackBannerVisual.ownWidth>attackBannerVisual.ownHeight*2.5&&attackBannerVisual.targetWidth>attackBannerVisual.targetHeight*2.5,'attack identity uses horizontal scroll banners');
  assert(attackBannerVisual.ownRelativeTop<0.15&&attackBannerVisual.targetRelativeTop<0.15,'attack scroll banners stay at the top edge of the artwork');
  assert(attackBannerVisual.ownShieldWidth>=36&&attackBannerVisual.targetShieldWidth>=36,'attack banners include the large hanging heraldic crests from the reference');
  assert(attackBannerVisual.ownShieldHeight>attackBannerVisual.ownHeight&&attackBannerVisual.targetShieldHeight>attackBannerVisual.targetHeight,'attack crests hang below the parchment like the approved reference');
  assert(attackBannerVisual.ownRodWidth>attackBannerVisual.ownWidth+50&&attackBannerVisual.targetRodWidth>attackBannerVisual.targetWidth+50,'attack banners include spear-ended rods extending well beyond the parchment');
  assert(attackBannerVisual.ownScrollCapWidth>=7&&attackBannerVisual.targetScrollCapWidth>=7,'attack parchment has visible rolled ends instead of flat card edges');
  assert(!(await page.locator('#battleStage').textContent())?.includes('DEINE ARMEE'),'attack scene no longer needs the generic DEINE ARMEE image label');
  assert(await page.locator('#battleStage [data-battle-scene-art]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'dedicated battlefield artwork loads successfully');
  assert(await page.locator('#battleStage .battle-sky').count()===1,'CSS sky remains available only as artwork fallback');
  assert(await page.locator('#battleStage .battle-hills').count()===1,'CSS landscape remains available only as artwork fallback');
  assert(await page.locator('#battleStage .battle-ground').count()===1,'CSS ground remains available only as artwork fallback');
  const paintedScene=await page.evaluate(()=>({
    cssArmyOpacity:parseFloat(getComputedStyle(document.querySelector('#battleStage .battle-army')).opacity||'1'),
    cssFortressOpacity:parseFloat(getComputedStyle(document.querySelector('#battleStage .battle-fortress')).opacity||'1'),
    artOpacity:parseFloat(getComputedStyle(document.querySelector('#battleStage .battle-art-background')).opacity||'0'),
    artBrightness:getComputedStyle(document.querySelector('#battleStage .battle-art-background')).filter,
    readoutPosition:getComputedStyle(document.querySelector('#battleView .battle-readout')).position,
    readoutColumns:getComputedStyle(document.querySelector('#battleView .battle-readout')).gridTemplateColumns,
    fortressBadgeDisplay:getComputedStyle(document.querySelector('#battleStage .battle-fortress-state-badge')).display,
    rankBadgeDisplay:getComputedStyle(document.querySelector('#battleStage .battle-rank-badge')).display,
    phaseDisplay:getComputedStyle(document.querySelector('#battleStage .battle-phase-strip')).display
  }));
  assert(paintedScene.cssArmyOpacity===0&&paintedScene.cssFortressOpacity===0,'cartoon CSS army and fortress are hidden when painted artwork is ready');
  assert(paintedScene.artOpacity>=0.95,'approved painted scene is the primary battle visual instead of a faint texture');
  assert(!paintedScene.artBrightness.includes('brightness(0.76)'),'painted battle artwork is no longer heavily darkened');
  assert(paintedScene.readoutPosition==='static'&&paintedScene.readoutColumns.split(' ').length===4,'battle KPIs sit outside the illustration instead of covering it');
  assert(paintedScene.fortressBadgeDisplay==='none'&&paintedScene.rankBadgeDisplay==='none','duplicate fortress and rank plaques never cover the painted scene');
  assert(paintedScene.phaseDisplay==='none','technical phase strip does not clutter the approved target scene');
  const cleanComposition=await page.evaluate(()=>{
    const readout=document.querySelector('#battleView .battle-readout')?.getBoundingClientRect();
    const stage=document.querySelector('#battleStage')?.getBoundingClientRect();
    const tactics=document.querySelector('#battleView .battle-scene-tactics')?.getBoundingClientRect();
    const dock=document.querySelector('#battleView .battle-action-dock')?.getBoundingClientRect();
    const view=document.querySelector('#battleView');
    const bodyStyle=getComputedStyle(document.body),viewStyle=view?getComputedStyle(view):null;
    return {
      readoutAboveStage:!!readout&&!!stage&&readout.bottom<=stage.top+1,
      tacticsBelowStage:!!tactics&&!!stage&&tactics.top>=stage.bottom-1,
      dockBelowTactics:!!dock&&!!tactics&&dock.top>=tactics.bottom-1,
      normalScrollable:!!view&&!document.body.classList.contains('battle-immersive')&&viewStyle?.position!=='fixed'&&bodyStyle.overflow!=='hidden'&&bodyStyle.overflowY!=='hidden'
    };
  });
  assert(cleanComposition.readoutAboveStage&&cleanComposition.tacticsBelowStage&&cleanComposition.dockBelowTactics,'persistent battle controls are laid out around the artwork with no geometric overlap');
  assert(cleanComposition.normalScrollable,'battle view stays in the normal scrollable page unless full-screen is explicitly requested');
  assert(await page.locator('#battleStage .battle-unit').count()>=6,'fallback army formation remains structurally available');
  assert(await page.locator('#battleStage .unit-archer').count()>=1,'progress unlocks archers');
  assert(await page.locator('#battleStage .unit-cavalry').count()>=1,'high progress unlocks cavalry');
  assert(await page.locator('[data-battle-attack]').count()===5,'battle exposes four standard attacks plus special');
  assert(await page.locator('[data-battle-attack] .battle-attack-visual').count()===5,'every attack is presented as a large visual card');
  assert(await page.locator('[data-battle-attack] .battle-attack-visual img').count()===5,'English attack cards reuse the campaign illustration instead of text-only controls');

  const fortressProgression=await page.evaluate(()=>{
    const f=currentTestFortress();
    const original={id:f.id,name:f.name};
    const result={};
    for(const id of ['outpost','tower','wall','citadel','capital','final']){
      f.id=id;f.name=id;renderBattleView();
      const fortress=document.querySelector('#battleStage .battle-fortress');
      const keep=fortress.querySelector('.battle-keep');
      const rect=fortress.getBoundingClientRect();
      const stageRect=document.querySelector('#battleStage').getBoundingClientRect();
      const armyRect=document.querySelector('#battleStage .battle-army').getBoundingClientRect();
      result[id]={
        width:Math.round(rect.width),
        height:Math.round(rect.height),
        keepDisplay:getComputedStyle(keep).display,
        keepHeight:Math.round(keep.getBoundingClientRect().height),
        stageClass:document.querySelector('#battleStage').className,
        centerGap:Math.round(rect.left-armyRect.right),
        stageWidth:Math.round(stageRect.width)
      };
    }
    f.id=original.id;f.name=original.name;renderBattleView();
    return result;
  });
  assert(fortressProgression.outpost.height<fortressProgression.tower.height,'outpost is smaller than tower');
  assert(fortressProgression.citadel.keepDisplay!=='none'&&fortressProgression.citadel.keepHeight>0,'citadel has visible keep');
  assert(fortressProgression.capital.height>fortressProgression.citadel.height,'capital escalates beyond citadel');
  assert(fortressProgression.final.height>fortressProgression.capital.height,'final fortress is largest target');
  assert(new Set(Object.values(fortressProgression).map(v=>v.width+'x'+v.height)).size>=5,'fortress geometry remains materially distinct');
  assert(Object.entries(fortressProgression).every(([id,v])=>v.stageClass.includes('fortress-stage-'+id)),'each fortress keeps matching atmosphere class');
  assert(fortressProgression.final.centerGap>=fortressProgression.final.stageWidth*.07,'largest fortress preserves a readable center battlefield between army and target');

  await page.emulateMedia({reducedMotion:'no-preference'});
  const motion=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage');
    const sample=(attack,phase)=>{stage.className=stage.className.replace(/\battack-\S+|\bphase-\S+|\bis-\S+/g,'').replace(/\s+/g,' ').trim();stage.classList.add('battle-sequence',attack,phase,'is-attacking','is-strike','is-impact');return {
      impact:getComputedStyle(document.querySelector('#battleStage .battle-impact')).animationName,
      gate:getComputedStyle(document.querySelector('#battleStage .battle-gate')).animationName,
      ram:getComputedStyle(document.querySelector('#battleStage .battle-ram')).animationName,
      volley:getComputedStyle(document.querySelector('#battleStage .battle-volley-sky i')).animationName,
      cavalry:getComputedStyle(document.querySelector('#battleStage .battle-cavalry-flank i')).animationName,
      special:getComputedStyle(document.querySelector('#battleStage .battle-special-aura i')).animationName
    }};
    return {
      ram:sample('attack-ram','phase-impact'),
      volley:sample('attack-volley','phase-barrage'),
      cavalry:sample('attack-cavalry','phase-barrage'),
      special:sample('attack-special','phase-barrage')
    };
  });
  assert(motion.ram.impact.includes('battleImpactBloom'),'impact phase runs cinematic burst');
  assert(motion.ram.gate.includes('battleRamGateImpact')||motion.ram.gate.includes('battleGateFlash'),'ram impact targets fortress gate');
  assert(motion.volley.volley.includes('battleVolleyArc'),'volley has dedicated sky animation');
  assert(motion.cavalry.cavalry.includes('battleCavalryDust'),'cavalry has dedicated flank animation');
  assert(motion.special.special.includes('battleSpecialRing'),'special attack has dedicated aura animation');

  await page.emulateMedia({reducedMotion:'reduce'});
  const reduced=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage');
    stage.classList.add('battle-sequence','attack-ram','phase-impact','is-impact');
    return {
      impact:getComputedStyle(document.querySelector('#battleStage .battle-impact')).animationName,
      ram:getComputedStyle(document.querySelector('#battleStage .battle-ram')).animationName,
      trail:getComputedStyle(document.querySelector('#battleStage .battle-ram-trail')).display
    };
  });
  assert(reduced.impact==='none'&&reduced.ram==='none'&&reduced.trail==='none','reduced motion disables battle movement effects');

  await reset({revealed:true,ticket:true,subject:'latin'});
  await openBattle();
  await page.evaluate(()=>renderBattleView());
  assert((await page.locator('#battleView').getAttribute('data-visual-theme'))==='roman','Latin battle view uses Roman visual theme');
  assert((await page.locator('#battleStage').getAttribute('data-visual-theme'))==='roman','Latin battle stage exposes Roman theme');
  assert((await page.locator('#battleView .battle-kicker').textContent())?.includes('Römische Prüfungsetappe'),'Latin test scene has Roman framing');
  assert((await page.locator('#battleTitle').textContent())?.includes('Legion'),'Latin title names the legion');
  assert((await page.locator('#battleStage .battle-fortress-state-badge').textContent())?.includes('Kastell'),'Latin target is presented as a Kastell');
  const latinStandard=await page.locator('#battleStage .battle-standard i').evaluate(el=>getComputedStyle(el,'::after').content);
  assert(String(latinStandard).includes('SPQR'),'Latin standard carries the Roman SPQR identity');

  const actionAccess=await page.evaluate(()=>{
    const button=document.querySelector('#battleAttackBtn'),nav=document.querySelector('.bottom-nav');
    if(!button)return {navHidden:false,hit:false,focused:false};
    button.scrollIntoView({block:'center',inline:'nearest'});
    button.focus({preventScroll:true});
    const action=button.getBoundingClientRect();
    const x=action.left+action.width/2,y=action.top+action.height/2;
    const hit=document.elementFromPoint(x,y);
    return {
      navHidden:!!nav&&getComputedStyle(nav).display==='none',
      hit:hit===button||button.contains(hit),
      focused:document.activeElement===button
    };
  });
  assert(actionAccess.navHidden,'navigation remains hidden while battle actions are used');
  assert(actionAccess.hit,'battle action remains the topmost hit target');
  assert(actionAccess.focused,'battle action remains keyboard-focusable');
  await page.keyboard.press('Enter');
  await waitForBattleResult();
  assert((await page.locator('#battleResultOverlay').getAttribute('aria-hidden'))==='false','visible battle result is exposed to assistive technology');
  const latinResultTitle=await page.locator('#battleResultTitle').textContent();
  assert(/Kastell|Vorstoß|Wächter/.test(latinResultTitle||''),'Latin result stays in Roman vocabulary');
  assert(!(latinResultTitle||'').includes('Festung'),'Latin result does not fall back to the English fortress label');
  assert((await page.locator('#battleResultOverlay').getAttribute('data-visual-theme'))==='roman','Latin result overlay uses Roman theme');
  assert(await page.locator('#battleResultArt').isHidden(),'Latin result does not borrow the English campaign artwork');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle visual smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-battle-visual-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
