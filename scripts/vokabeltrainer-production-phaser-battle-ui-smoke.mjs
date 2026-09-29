import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const h=await createBattleHarness();
const {browser,page,assert,activate,reset,openBattle,waitForBattleResult,errors,diagnose}=h;

try{
  await reset({revealed:true,ticket:true,subject:'english'});
  await page.evaluate(()=>{
    const f=currentTestFortress();
    f.defense=100;
    f.maxDefense=100;
    window.__VT_BATTLE_TEST_MODE__=false;
    renderAll();
  });
  await openBattle();
  await activate('[data-battle-attack="ram"]','ram attack choice');
  const masteryBefore=await page.evaluate(()=>subjectProgress().pct);
  await activate('#battleAttackBtn','live Phaser battle action');

  await page.waitForFunction(()=>{
    const stage=document.querySelector('#battleStage');
    const canvas=stage?.querySelector('.battle-phaser-production canvas');
    return stage?.dataset.renderer==='phaser4'
      &&stage?.dataset.phaserReady==='true'
      &&stage.classList.contains('phaser-production-active')
      &&!!canvas;
  },null,{timeout:20000});

  const live=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage'),mount=stage?.querySelector('.battle-phaser-production'),canvas=mount?.querySelector('canvas');
    const rect=canvas?.getBoundingClientRect(),stageRect=stage?.getBoundingClientRect(),mountRect=mount?.getBoundingClientRect();
    return {
      renderer:stage?.dataset.renderer||'',
      ready:stage?.dataset.phaserReady||'',
      attack:stage?.dataset.phaserAttack||'',
      outcome:stage?.dataset.phaserOutcome||'',
      profile:stage?.dataset.phaserProfile||'',
      sound:stage?.dataset.phaserSound||'',
      version:mount?.dataset.version||'',
      width:rect?.width||0,
      height:rect?.height||0,
      stageWidth:stageRect?.width||0,
      stageHeight:stageRect?.height||0,
      mountWidth:mountRect?.width||0,
      mountHeight:mountRect?.height||0,
      moduleVersion:window.VTBattlePhaserProduction?.version||''
    };
  });
  assert(live.renderer==='phaser4','English production attack mounts Phaser 4');
  assert(live.ready==='true','production Phaser scene reports ready before choreography');
  assert(live.attack==='ram','selected production attack is passed to Phaser');
  assert(live.outcome==='capture','actual fortress state selects capture outcome');
  assert(live.profile==='MP','profile initials are passed into the capture banner');
  assert(live.sound==='web-audio'||live.sound==='silent','production bridge reports battle-sound capability');
  assert(live.version.includes('v0.21.28'),'visible live renderer badge shows the cinematic release version');
  assert(live.moduleVersion==='0.21.37-phaser-production.3','production bridge exposes the current cinematic renderer version');
  console.log('PRODUCTION_PHASER_GEOMETRY',JSON.stringify(live));
  assert(live.stageWidth>300&&live.stageHeight>160,'battle stage keeps a cinematic mobile viewport');
  const stageRatio=live.stageWidth/live.stageHeight;
  assert(stageRatio>1.65&&stageRatio<1.9,'production battle keeps a near-16:9 stage');
  assert(live.mountWidth>=live.stageWidth*.98&&live.mountHeight>=live.stageHeight*.98,'Phaser mount fills the battle stage');
  assert(live.width>0&&live.height>0,'Phaser canvas has visible geometry');
  assert(live.width>=live.stageWidth*.75&&live.height>=live.stageHeight*.75,'Phaser canvas visibly occupies the battle stage');

  await waitForBattleResult({timeout:30000});
  const capture=await page.evaluate(()=>({
    beats:window.__VT_PRODUCTION_BATTLE_BEATS__||[],
    result:learner().campaignLog.at(-1)||null,
    tickets:battleTickets(),
    mastery:subjectProgress().pct,
    stageState:document.querySelector('#battleStage')?.dataset.fortressState||''
  }));
  assert(capture.beats.includes('defense-volley'),'fortress visibly answers with defensive arrows');
  assert(capture.beats.includes('defense-catapult'),'fortress visibly answers with a catapult shot');
  assert(capture.beats.includes('friendly-loss'),'defensive fire can cause visual player losses without changing learning state');
  assert(capture.beats.includes('breach-entry'),'capture sends surviving units through the gate');
  assert(capture.beats.includes('profile-banner'),'capture raises the profile banner');
  assert(capture.beats.indexOf('breach-entry')<capture.beats.indexOf('profile-banner'),'all-unit gate entry starts before profile banner');
  assert(capture.beats.at(-1)==='secured','capture settles after profile banner');
  assert(capture.result?.result==='win'&&capture.result?.attack==='ram','business logic records the real ram conquest');
  assert(capture.tickets===0,'Phaser production attack consumes exactly one daily action');
  assert(capture.mastery===masteryBefore,'Phaser animation cannot alter academic mastery');
  assert(capture.stageState==='captured','live battle ends in captured fortress state');
  assert(!(await page.locator('#battleMessage').isVisible()),'phase narration stays hidden after the choreography');
  assert(await page.locator('#battleResultOverlay').isVisible(),'result overlay appears after the choreography');

  await activate('#battleResultContinue','capture result continue');
  await page.waitForFunction(()=>document.querySelector('#battleResultOverlay')?.classList.contains('visible')!==true);

  await reset({revealed:true,ticket:true,subject:'english'});
  await page.evaluate(()=>{
    const f=currentTestFortress();
    f.defense=420;
    f.maxDefense=420;
    window.__VT_BATTLE_TEST_MODE__=false;
    renderAll();
  });
  await openBattle();
  await activate('[data-battle-attack="volley"]','volley attack choice');
  await activate('#battleAttackBtn','live Phaser damage-only action');
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.dataset.renderer==='phaser4',null,{timeout:20000});
  assert(await page.locator('#battleStage').getAttribute('data-phaser-outcome')==='hit','non-lethal damage is sent to Phaser as hit outcome');

  await waitForBattleResult({timeout:30000});
  const hit=await page.evaluate(()=>({
    beats:window.__VT_PRODUCTION_BATTLE_BEATS__||[],
    result:learner().campaignLog.at(-1)||null,
    captured:!!currentTestFortress()?.capturedAt,
    mastery:subjectProgress().pct
  }));
  assert(hit.beats.includes('defense-volley')&&hit.beats.includes('defense-catapult'),'damage-only battle still includes fortress counterfire');
  assert(hit.beats.includes('hold')&&hit.beats.includes('settled'),'normal hit visibly settles without capture');
  assert(!hit.beats.includes('breach-entry')&&!hit.beats.includes('profile-banner'),'normal hit never shows conquest choreography');
  assert(hit.result?.result==='damage'&&hit.result?.attack==='volley','business logic records damage-only volley');
  assert(hit.captured===false,'damage-only attack does not capture fortress');
  assert(hit.mastery===100,'damage-only Phaser attack leaves mastery untouched');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer production Phaser battle smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-production-phaser-battle-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
