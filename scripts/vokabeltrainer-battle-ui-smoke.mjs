import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Battle UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof grantBattleTicket==='function'&&typeof openBattleView==='function');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'battle_set',learnerId:'learner_demo',subject:'english',title:'Battle Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(1),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'shield',translation:'Schild',source:'battle-smoke',verified:true});
    for(const link of state.setVocabulary){link.firstContactCopiedAt=link.firstContactRecalledAt=link.firstContactCompletedAt=new Date().toISOString()}
    const p=state.learnerVocabulary[0];
    p.skills={recognition:4,listening:4,retrieval:4,spelling:4,context:4};p.independentSuccesses=8;p.activeSuccessDays=['2026-09-10','2026-09-14','2026-09-18'];p.activePracticeDays=[...p.activeSuccessDays];p.maxActiveGapDays=7;p.coldRecallDays=['2026-09-14','2026-09-18'];p.coldRecallSuccesses=2;p.intervalDays=14;p.errorProfile={meaning:0,retrieval:0,spelling:0,listening:0,context:0,grammar:0};refreshMastery(p);
    state.learners[0].milestones[`hundred_english_${currentSchoolYear()}`]=new Date().toISOString();
    rebuildWordIndexes();renderAll();showView('childProgressView');
  });

  assert(!(await page.locator('#attackBtn').isDisabled()),'planned test fortress remains viewable before the daily reward');
  assert((await page.locator('#attackBtn').textContent())?.includes('Festung'),'campaign card points to the persistent test fortress');
  await page.click('#attackBtn');
  await page.waitForSelector('#battleView.active');
  assert(await page.locator('#battleAttackBtn').isDisabled(),'only the attack action is locked before the daily goal');
  await page.click('#battleReturnBtn');
  await page.waitForSelector('#childProgressView.active');
  await page.evaluate(()=>{grantBattleTicket('dailyGoal');renderAll();});
  assert(await page.evaluate(()=>grantBattleTicket('duplicate-smoke'))===false,'same day cannot earn a second battle action');
  assert((await page.locator('#attackBtn').textContent())?.includes('Angriff'),'completed daily goal marks the attack as ready');

  await page.click('#attackBtn');
  await page.waitForSelector('#battleView.active');
  await page.waitForFunction(()=>window.VTBattleArt?.ready===true);
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  assert(await page.locator('#battleStage [data-battle-art-stack]').count()===1,'battle stage receives one layered artwork stack');
  assert(await page.locator('#battleStage [data-battle-layer]').count()===4,'battle artwork is split into background, army, fortress and atmosphere');
  assert(await page.locator('#battleStage [data-battle-layer="background"]').count()===1,'background layer exists');
  assert(await page.locator('#battleStage [data-battle-layer="army"]').count()===1,'army layer exists');
  assert(await page.locator('#battleStage [data-battle-layer="fortress"]').count()===1,'fortress layer exists');
  assert(await page.locator('#battleStage [data-battle-layer="atmosphere"]').count()===1,'atmosphere layer exists');
  assert(await page.locator('#battleStage [data-battle-layer="background"]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'layered battle background loads');
  assert(await page.locator('#battleStage [data-battle-layer="army"]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'army artwork layer loads');
  assert(await page.locator('#battleStage [data-battle-layer="fortress"]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'fortress artwork layer loads');
  assert(await page.locator('#battleStage .battle-own-flag').count()===1,'battle fortress includes a dedicated player flag for conquest');

  await page.emulateMedia({reducedMotion:'no-preference'});
  const conquestMotion=await page.evaluate(async()=>{
    const stage=document.querySelector('#battleStage');
    stage.classList.add('conquest-transition');
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const result={
      gate:getComputedStyle(document.querySelector('#battleStage .battle-gate')).animationName,
      enemy:getComputedStyle(document.querySelector('#battleStage .battle-enemy-flag')).animationName,
      own:getComputedStyle(document.querySelector('#battleStage .battle-own-flag')).animationName
    };
    stage.classList.remove('conquest-transition');
    return result;
  });
  assert(conquestMotion.gate.includes('conquestGateFall'),'conquest visibly drops the fortress gate');
  assert(conquestMotion.enemy.includes('conquestEnemyFlagExit'),'conquest visibly removes the enemy flag');
  assert(conquestMotion.own.includes('conquestOwnFlagRise'),'conquest visibly raises the player flag');

  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForTimeout(60);
  const reducedConquest=await page.evaluate(async()=>{
    const stage=document.querySelector('#battleStage');
    stage.classList.add('conquest-transition');
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const result={
      gate:getComputedStyle(document.querySelector('#battleStage .battle-gate')).animationName,
      enemy:getComputedStyle(document.querySelector('#battleStage .battle-enemy-flag')).animationName,
      own:getComputedStyle(document.querySelector('#battleStage .battle-own-flag')).animationName,
      enemyOpacity:Number(getComputedStyle(document.querySelector('#battleStage .battle-enemy-flag')).opacity),
      ownOpacity:Number(getComputedStyle(document.querySelector('#battleStage .battle-own-flag')).opacity)
    };
    stage.classList.remove('conquest-transition');
    return result;
  });
  assert(reducedConquest.gate==='none'&&reducedConquest.enemy==='none'&&reducedConquest.own==='none','reduced-motion disables conquest animations');
  assert(reducedConquest.enemyOpacity===0&&reducedConquest.ownOpacity===1,'reduced-motion still shows the final conquered state');

  const originalFortressState=await page.evaluate(()=>{
    const f=currentTestFortress();
    return {defense:f.defense,maxDefense:f.maxDefense,capturedAt:f.capturedAt};
  });

  async function setDamageRatio(ratio){
    await page.evaluate(r=>{
      const f=currentTestFortress();
      f.capturedAt='';
      f.defense=Math.max(0,Math.round(f.maxDefense*r));
      renderBattleView();
    },ratio);
    await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
    await page.waitForTimeout(80);
    return page.evaluate(()=>({
      tier:document.querySelector('#battleStage')?.dataset.damage,
      percent:Number(document.querySelector('#battleStage')?.dataset.damagePercent||0),
      c1:Number(getComputedStyle(document.querySelector('#battleStage .c1')).opacity),
      c3:Number(getComputedStyle(document.querySelector('#battleStage .c3')).opacity),
      c5:Number(getComputedStyle(document.querySelector('#battleStage .c5')).opacity),
      rubble:Number(getComputedStyle(document.querySelector('#battleStage .battle-rubble')).opacity),
      artFilter:getComputedStyle(document.querySelector('#battleStage [data-battle-layer="fortress"]')).filter,
      smoke:Number(getComputedStyle(document.querySelector('#battleStage [data-battle-layer="atmosphere"]'),'::after').opacity)
    }));
  }

  const damageLow=await setDamageRatio(.75);
  assert(damageLow.tier==='low'&&damageLow.percent>=20&&damageLow.percent<33,'light siege damage is derived from stored fortress defense');
  assert(damageLow.c1>.3&&damageLow.c5===0,'light damage shows only early cracks');

  const damageMid=await setDamageRatio(.5);
  assert(damageMid.tier==='mid'&&damageMid.percent>=45&&damageMid.percent<66,'medium siege damage is derived from stored fortress defense');
  assert(damageMid.c3>.5&&damageMid.rubble>.4,'medium damage adds deeper cracks and rubble');
  assert(damageMid.smoke>.2,'medium damage becomes visible on the illustrated fortress atmosphere');

  const damageHigh=await setDamageRatio(.2);
  assert(damageHigh.tier==='high'&&damageHigh.percent>=66,'heavy siege damage is derived from stored fortress defense');
  assert(damageHigh.c5>.8&&damageHigh.rubble>.8,'heavy damage exposes all cracks and substantial rubble');
  assert(damageHigh.smoke>damageMid.smoke,'heavy damage increases persistent smoke');
  assert(damageHigh.artFilter!==damageLow.artFilter,'illustrated fortress visibly degrades with siege progress');

  await page.evaluate(snapshot=>{
    const f=currentTestFortress();
    f.defense=snapshot.defense;
    f.maxDefense=snapshot.maxDefense;
    f.capturedAt=snapshot.capturedAt;
    renderBattleView();
  },originalFortressState);
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));

  const reducedTransforms=await page.evaluate(()=>({
    stack:getComputedStyle(document.querySelector('#battleStage [data-battle-art-stack]')).transform,
    army:getComputedStyle(document.querySelector('#battleStage [data-battle-layer="army"]')).transform,
    fortress:getComputedStyle(document.querySelector('#battleStage [data-battle-layer="fortress"]')).transform
  }));
  assert(reducedTransforms.stack==='none'&&reducedTransforms.army==='none'&&reducedTransforms.fortress==='none','reduced-motion keeps layered battle artwork static');

  await page.emulateMedia({reducedMotion:'no-preference'});
  const motionTransforms=await page.evaluate(async()=>{
    const stage=document.querySelector('#battleStage');
    const stack=document.querySelector('#battleStage [data-battle-art-stack]');
    const army=document.querySelector('#battleStage [data-battle-layer="army"]');
    const fortress=document.querySelector('#battleStage [data-battle-layer="fortress"]');
    stage.classList.add('battle-sequence','phase-advance');
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const advance={stack:getComputedStyle(stack).transform,army:getComputedStyle(army).transform,fortress:getComputedStyle(fortress).transform};
    stage.classList.remove('phase-advance');
    stage.classList.add('phase-impact','is-impact');
    await new Promise(resolve=>setTimeout(resolve,80));
    const impactEl=document.querySelector('#battleStage .battle-impact');
    const gate=document.querySelector('#battleStage .battle-gate');
    const dust=document.querySelector('#battleStage .battle-dust');
    const shock=document.querySelector('#battleStage .battle-shockwave');
    const impact={
      stack:getComputedStyle(stack).transform,
      army:getComputedStyle(army).transform,
      fortress:getComputedStyle(fortress).transform,
      impactAnimation:getComputedStyle(impactEl).animationName,
      gateAnimation:getComputedStyle(gate).animationName,
      dustAnimation:getComputedStyle(dust).animationName,
      shockAnimation:getComputedStyle(shock).animationName,
      impactWidth:getComputedStyle(impactEl).width
    };
    stage.classList.remove('battle-sequence','phase-impact','is-impact');
    return {advance,impact};
  });
  assert(motionTransforms.advance.army!=='none','advance phase moves the army artwork layer');
  assert(motionTransforms.impact.fortress!=='none','impact phase focuses the fortress artwork layer');
  assert(motionTransforms.advance.army!==motionTransforms.impact.army,'army artwork changes position between advance and impact');
  assert(motionTransforms.advance.fortress!==motionTransforms.impact.fortress,'fortress artwork changes focus between advance and impact');
  assert(motionTransforms.impact.impactAnimation.includes('battleImpactBloom'),'impact phase runs the cinematic impact burst');
  assert(motionTransforms.impact.gateAnimation.includes('battleGateFlash'),'impact phase flashes the fortress gate');
  assert(motionTransforms.impact.dustAnimation.includes('battleDustCloud'),'impact phase raises a deeper dust cloud');
  assert(motionTransforms.impact.shockAnimation.includes('battleShockDepth'),'impact phase expands the shockwave');
  assert(parseFloat(motionTransforms.impact.impactWidth)>=100,'impact burst has a visibly larger footprint');

  await page.emulateMedia({reducedMotion:'reduce'});
  const reducedImpactAnimations=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage');
    stage.classList.add('phase-impact','is-impact');
    const result={
      impact:getComputedStyle(document.querySelector('#battleStage .battle-impact')).animationName,
      gate:getComputedStyle(document.querySelector('#battleStage .battle-gate')).animationName,
      dust:getComputedStyle(document.querySelector('#battleStage .battle-dust')).animationName,
      shock:getComputedStyle(document.querySelector('#battleStage .battle-shockwave')).animationName
    };
    stage.classList.remove('phase-impact','is-impact');
    return result;
  });
  assert(Object.values(reducedImpactAnimations).every(name=>name==='none'),'reduced-motion disables all new cinematic impact animations');
  assert(await page.locator('#battleStage [data-battle-scene-art]').getAttribute('data-battle-asset')==='dedicated','battle image comes from dedicated battlefield asset');
  assert((await page.evaluate(()=>window.VTBattleArt?.source))==='dedicated-battlefield','dedicated battlefield loader is active');
  assert(await page.locator('#battleStage .battle-unit').count()>=6,'animated army contains multiple units');
  assert(await page.locator('#battleStage .unit-archer').count()>=1,'progress unlocks archer units');
  assert(await page.locator('#battleStage .unit-cavalry').count()>=1,'high progress unlocks cavalry units');
  assert(await page.locator('#battleStage.fortress-stage-outpost').count()===1,'first campaign target has its own fortress stage');
  const expectedSeason=await page.evaluate(()=>seasonInfo().class);
  assert(await page.locator('#battleStage.season-'+expectedSeason).count()===1,'current season changes the battle stage dynamically');
  assert((await page.locator('#battleRankGear').textContent())?.length>3,'rank and equipment are visible');
  assert(await page.locator('[data-battle-attack]').count()===5,'four standard attacks plus one special attack are available');
  const rolePowerSpread=await page.evaluate(()=>({
    front:armyUnitPowerFromValue('infantry',30),
    ranged:armyUnitPowerFromValue('archers',30),
    mobility:armyUnitPowerFromValue('cavalry',30)
  }));
  assert(rolePowerSpread.front>rolePowerSpread.ranged&&rolePowerSpread.ranged>rolePowerSpread.mobility,'different unit progressions create distinct tactical role strength');
  assert(!(await page.locator('[data-battle-attack="ram"]').isDisabled()),'ram attack unlocks from learning progress');
  assert((await page.locator('[data-battle-attack="ram"] small').textContent())?.includes('Belagerung'),'attack choice names the matching army role');
  assert((await page.locator('[data-battle-attack="ram"] small').textContent())?.includes('+10 Taktik'),'maxed siege unit exposes only the capped 10-point tactical bonus');
  await page.click('[data-battle-attack="ram"]');
  assert(await page.locator('[data-battle-attack="ram"].active').count()===1,'attack type can be selected');
  assert((await page.locator('#battleMessage').textContent())?.includes('+10 Taktikschaden'),'selected attack explains its small tactical bonus');
  const expectedRamDamage=await page.evaluate(()=>testFortressDamage(currentTestFortress(),'english','ram').damage);
  assert((await page.locator('#battleTicketPill').textContent())?.includes('1'),'battle screen shows earned attack');
  assert(await page.locator('.battle-phase-strip [data-battle-phase]').count()===5,'battle shows a five-phase sequence');
  const attackButtonRect=await page.locator('#battleAttackBtn').boundingBox();
  const viewport=page.viewportSize();
  assert(!!attackButtonRect&&!!viewport&&attackButtonRect.y>=0&&attackButtonRect.y+attackButtonRect.height<=viewport.height,'primary battle action stays inside the visible iPhone viewport without scrolling');

  await page.click('#battleFullscreenBtn');
  assert(await page.locator('body.battle-immersive').count()===1,'immersive fullscreen fallback activates');
  await page.click('#battleAttackBtn');
  await page.waitForSelector('#battleStage.attack-ram.battle-finished',{timeout:3000});
  const msg=await page.locator('#battleMessage').textContent();
  assert(/Angriff|Festung|Mauer/i.test(msg||''),'battle ends with a visible result');
  await page.waitForSelector('#battleResultOverlay.visible');
  assert((await page.locator('#battleResultTitle').textContent())?.includes('Festung erobert'),'victory opens a dedicated cinematic result view');
  const resultText=await page.locator('#battleResultOverlay').textContent();
  assert(resultText?.includes('+20 XP'),'result view shows the actual conquest reward');
  assert(resultText?.includes('+10 Taktik'),'result view transparently shows the role-based tactical part of the damage');
  assert(resultText?.includes('Testtermin'),'result view keeps the real test as the campaign target');
  assert(await page.locator('#battleResultArt').evaluate(img=>img.naturalWidth>0),'result view reuses a loaded local battle illustration');
  assert(await page.evaluate(()=>battleTickets())===0,'attack consumes exactly one earned battle action');
  assert(await page.evaluate(()=>learner().campaignLog.length)===1,'battle result is stored in campaign log');
  assert(await page.evaluate(()=>learner().campaignLog[0]?.attack)==='ram','selected tactical attack is stored in the campaign log');
  assert(await page.evaluate(()=>learner().campaignLog[0]?.tacticalBonus)===10,'campaign log stores the capped tactical bonus');
  assert(await page.evaluate(()=>learner().campaignLog[0]?.damage)===expectedRamDamage,'stored damage exactly matches the transparent attack preview');
  assert(await page.evaluate(()=>subjectProgress().pct)===100,'battle tactics do not alter academic mastery');
  assert((await page.locator('#battleFortressProgress').textContent())?.includes('Erobert'),'winning keeps the same test fortress and switches it to securing');
  assert(await page.locator('#battleStage .battle-fortress.captured').count()===1,'winning settles the battle fortress into the persistent captured state');
  assert(Number(await page.locator('#battleStage .battle-enemy-flag').evaluate(el=>getComputedStyle(el).opacity))===0,'captured fortress no longer shows the enemy flag');
  assert(Number(await page.locator('#battleStage .battle-own-flag').evaluate(el=>getComputedStyle(el).opacity))===1,'captured fortress permanently shows the player flag');
  await page.evaluate(()=>renderBattlefield());
  assert(await page.locator('#battlefield.battle-captured .fortress.captured .own-flag').count()===1,'campaign overview also keeps the player flag on the conquered fortress');
  await page.click('#battleResultContinue');
  await page.waitForSelector('#battleResultOverlay',{state:'hidden'});
  await page.evaluate(()=>renderBattleView());
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  assert(await page.locator('#battleStage.fortress-secured .battle-fortress.captured .battle-own-flag').count()===1,'reopening the battle restores the conquered visual state from capturedAt');

  await page.evaluate(()=>{
    const f=currentTestFortress();f.id='citadel';f.name='Zitadelle';f.subtitle='Bergzitadelle';f.capturedAt='';f.defense=100;f.maxDefense=100;
    const day=battleDayState('english',true);day.unlocked=true;day.actionUsed=false;renderBattleView();
  });
  assert(await page.locator('#battleBossPanel:not(.hidden)').count()===1,'a large test-fortress type can open a boss presentation');
  assert((await page.locator('#battleBossName').textContent())?.includes('Torwächter'),'boss fight has a child-friendly named opponent');
  assert(await page.locator('#battleStage .battle-boss-character').count()===1,'boss character is visible in battle stage');
  assert((await page.locator('#battleStoryTitle').textContent())?.includes('Bergzitadelle'),'visual fortress type selects the matching campaign story');
  assert(!(await page.locator('[data-battle-attack="special"]').isDisabled()),'high long-term progress unlocks a special attack');
  await page.click('[data-battle-attack="special"]');
  await page.click('#battleAttackBtn');
  await page.waitForSelector('#battleStage.attack-special.battle-finished',{timeout:3000});
  await page.waitForSelector('#battleResultOverlay.visible');
  assert((await page.locator('#battleResultTitle').textContent())?.includes('Boss besiegt'),'boss conquest uses the cinematic result view');
  assert(await page.evaluate(()=>subjectProgress().pct)===100,'boss and special attack do not change academic mastery');
  await page.click('#battleResultClose');
  await page.waitForSelector('#battleResultOverlay',{state:'hidden'});

  await page.evaluate(()=>{const day=battleDayState('english',true);day.unlocked=true;day.actionUsed=false;renderBattleView();});
  assert(await page.locator('.battle-tactics.hidden').count()===1,'after conquest attack tactics disappear and the mission becomes securing');
  assert((await page.locator('#battleAttackBtn').textContent())?.includes('sichern'),'captured fortress offers a securing action instead of a new target');
  await page.click('#battleAttackBtn');
  await page.waitForSelector('#battleStage.battle-finished',{timeout:3000});
  await page.waitForSelector('#battleResultOverlay.visible');
  assert((await page.locator('#battleResultTitle').textContent())?.includes('Festung gesichert'),'early conquest is followed by securing the same fortress');
  assert(await page.evaluate(()=>currentTestFortress().securedDates.length===1),'securing is stored on the current test fortress');
  await page.click('#battleResultClose');
  await page.waitForSelector('#battleResultOverlay',{state:'hidden'});

  const privacy=await page.evaluate(()=>{const p=duelPayload(),raw=JSON.parse(decodeURIComponent(escape(atob(encodeDuel(p)))));return {payload:p,raw,profile:learner().name}});
  assert(privacy.raw.name!==privacy.profile,'duel code never contains the learner profile name');
  assert(!Object.hasOwn(privacy.raw,'mastered')&&!Object.hasOwn(privacy.raw,'total')&&!Object.hasOwn(privacy.raw,'stable')&&!Object.hasOwn(privacy.raw,'strength'),'duel code contains only comparison-minimum learning data');
  await page.evaluate(()=>openDuel());
  const duelCode=await page.evaluate(()=>encodeDuel({...duelPayload(),progress:80,stability:0}));
  await page.fill('#opponentCode',duelCode);
  await page.click('#duelCompare');
  assert(await page.locator('.duel-arena').count()===1,'friendship duel has an animated arena');
  assert((await page.locator('#duelResult').textContent())?.includes('Sieg'),'deterministic duel still uses academic progress');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle UI smoke: passed');
}finally{
  await browser.close();
}
