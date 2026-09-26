import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const {browser,page,assert,reset,openBattle,errors,diagnose}=await createBattleHarness();

try{
  await reset({revealed:true,ticket:true});
  await openBattle();
  await page.setViewportSize({width:1180,height:720});
  await page.evaluate(()=>renderBattleView());

  await page.waitForFunction(()=>window.VTBattleArt?.ready===true);
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  assert(await page.locator('#battleStage [data-battle-art-stack]').count()===1,'dedicated painted battle artwork is mounted in the current scene');
  assert(await page.locator('#battleStage [data-battle-scene-art]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'dedicated battlefield artwork loads successfully');
  assert(await page.locator('#battleStage .battle-sky').count()===1,'CSS sky remains available only as artwork fallback');
  assert(await page.locator('#battleStage .battle-hills').count()===1,'CSS landscape remains available only as artwork fallback');
  assert(await page.locator('#battleStage .battle-ground').count()===1,'CSS ground remains available only as artwork fallback');
  const paintedScene=await page.evaluate(()=>({
    cssArmyOpacity:parseFloat(getComputedStyle(document.querySelector('#battleStage .battle-army')).opacity||'1'),
    cssFortressOpacity:parseFloat(getComputedStyle(document.querySelector('#battleStage .battle-fortress')).opacity||'1'),
    artBrightness:getComputedStyle(document.querySelector('#battleStage .battle-art-background')).filter
  }));
  assert(paintedScene.cssArmyOpacity===0&&paintedScene.cssFortressOpacity===0,'cartoon CSS army and fortress are hidden when painted artwork is ready');
  assert(!paintedScene.artBrightness.includes('brightness(0.76)'),'painted battle artwork is no longer heavily darkened');
  assert(await page.locator('#battleStage .battle-unit').count()>=6,'fallback army formation remains structurally available');
  assert(await page.locator('#battleStage .unit-archer').count()>=1,'progress unlocks archers');
  assert(await page.locator('#battleStage .unit-cavalry').count()>=1,'high progress unlocks cavalry');
  assert(await page.locator('[data-battle-attack]').count()===5,'battle exposes four standard attacks plus special');

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
    button?.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    button?.focus({preventScroll:true});
    const action=button?.getBoundingClientRect(),navRect=nav?.getBoundingClientRect();
    if(!button||!action||!navRect)return {overlap:true,hit:false,focused:false};
    const overlap=!(action.right<=navRect.left||action.left>=navRect.right||action.bottom<=navRect.top||action.top>=navRect.bottom);
    const x=action.left+action.width/2,y=action.top+action.height/2;
    const hit=document.elementFromPoint(x,y);
    return {
      overlap,
      hit:hit===button||button.contains(hit),
      focused:document.activeElement===button
    };
  });
  assert(actionAccess.overlap===false,'navigation never geometrically overlaps the battle action');
  assert(actionAccess.hit,'battle action remains the topmost hit target after scrolling');
  assert(actionAccess.focused,'battle action remains keyboard-focusable');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#battleResultOverlay.visible');
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
