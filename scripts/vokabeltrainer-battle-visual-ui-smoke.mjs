import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const {browser,page,assert,reset,openBattle,errors,diagnose}=await createBattleHarness();

try{
  await reset({revealed:true,ticket:true});
  await openBattle();

  assert(await page.locator('#battleStage [data-battle-art-stack]').count()===1,'battle stage receives one layered artwork stack');
  assert(await page.locator('#battleStage [data-battle-layer]').count()===4,'battle artwork has four layers');
  for(const layer of ['background','army','fortress','atmosphere']){
    assert(await page.locator(`#battleStage [data-battle-layer="${layer}"]`).count()===1,`${layer} layer exists`);
  }
  assert(await page.locator('#battleStage [data-battle-layer="background"]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'battle background loads');
  assert(await page.locator('#battleStage [data-battle-layer="army"]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'army artwork loads');
  assert(await page.locator('#battleStage [data-battle-layer="fortress"]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'fortress artwork loads');
  assert(await page.locator('#battleStage .battle-unit').count()>=6,'army formation contains multiple units');
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
      result[id]={
        width:Math.round(rect.width),
        height:Math.round(rect.height),
        keepDisplay:getComputedStyle(keep).display,
        keepHeight:Math.round(keep.getBoundingClientRect().height),
        stageClass:document.querySelector('#battleStage').className
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

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle visual smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-battle-visual-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
