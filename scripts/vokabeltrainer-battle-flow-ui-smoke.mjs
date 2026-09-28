import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const h=await createBattleHarness();
const {browser,page,assert,activate,reset,openBattle,waitForBattleResult,errors,diagnose}=h;

try{
  await reset({revealed:true,ticket:true});
  await page.evaluate(()=>{
    const l=learner();
    for(let i=1;i<=40;i++){
      const d=datePlusDays(-i);
      if(!dateInSchoolYear(d,currentSchoolYear()))continue;
      l.completedTests[`english:${d}`]={subject:'english',date:d,completedAt:new Date().toISOString(),scopeText:'Battle growth fixture',wordCount:1};
    }
    renderAll();
  });
  await openBattle();

  const rolePowerSpread=await page.evaluate(()=>({
    front:armyUnitPowerFromValue('infantry',30),
    ranged:armyUnitPowerFromValue('archers',30),
    mobility:armyUnitPowerFromValue('cavalry',30)
  }));
  assert(rolePowerSpread.front>rolePowerSpread.ranged&&rolePowerSpread.ranged>rolePowerSpread.mobility,'different unit progressions create distinct tactical role strength');
  assert(!(await page.locator('[data-battle-attack="ram"]').isDisabled()),'ram attack unlocks from fully developed year-campaign progress');
  assert((await page.locator('[data-battle-attack="ram"] small').textContent())?.includes('Belagerung'),'attack choice names the matching army role');
  assert((await page.locator('[data-battle-attack="ram"] small').textContent())?.includes('+10 Taktik'),'maxed siege unit exposes only the capped 10-point tactical bonus');
  await activate('[data-battle-attack="ram"]','ram attack choice');
  assert(await page.locator('[data-battle-attack="ram"].active').count()===1,'attack type can be selected');
  assert((await page.locator('#battleMessage').textContent())?.includes('+10 Taktikschaden'),'selected attack explains its small tactical bonus');

  const expectedRamDamage=await page.evaluate(()=>testFortressDamage(currentTestFortress(),'english','ram').damage);
  assert((await page.locator('#battleTicketPill').textContent())?.includes('1'),'battle screen shows earned attack');
  assert(await page.locator('body.battle-immersive').count()===0,'battle stays scrollable until full-screen is explicitly requested');
  assert(await page.locator('#battleFullscreenBtn').isVisible(),'optional full-screen remains directly available');
  assert(await page.locator('.bottom-nav').isHidden(),'primary navigation stays hidden during battle');
  assert(await page.locator('#battleAttackBtn').isVisible(),'primary attack action remains available below the artwork');
  await activate('#battleAttackBtn','battle primary action');
  assert((await page.locator('[data-battle-impact-title]').textContent())==='TOR-TREFFER!','ram attack prepares a clear gate-hit callout immediately');
  assert((await page.locator('[data-battle-impact-damage]').textContent())===expectedRamDamage+' Schaden','visual hit callout uses the exact calculated damage');
  assert((await page.locator('[data-battle-impact-tactic]').textContent())?.includes('+10 durch Belagerung'),'visual hit callout explains the tactical contribution');

  await waitForBattleResult();
  assert((await page.locator('#battleResultTitle').textContent())?.includes('Festung erobert'),'victory opens a dedicated result view');
  const resultText=await page.locator('#battleResultOverlay').textContent();
  assert(resultText?.includes('+20 XP'),'result view shows the conquest reward');
  assert(resultText?.includes('+10 Taktik'),'result view shows the tactical damage contribution');
  assert(resultText?.includes('Testtermin'),'result view keeps the real test as campaign target');
  assert(await page.evaluate(()=>battleTickets())===0,'attack consumes exactly one earned action');
  assert(await page.evaluate(()=>learner().campaignLog.length)===1,'battle result is stored in campaign log');
  assert(await page.evaluate(()=>learner().campaignLog[0]?.attack)==='ram','selected attack is stored in campaign log');
  assert(await page.evaluate(()=>learner().campaignLog[0]?.damage)===expectedRamDamage,'stored damage matches attack preview');
  assert(await page.evaluate(()=>subjectProgress().pct)===100,'battle tactics do not alter academic mastery');
  assert(await page.locator('#battleStage').getAttribute('data-fortress-state')==='captured','victory switches fortress state to captured');

  await activate('#battleResultContinue','battle result continue');
  await page.waitForFunction(()=>document.querySelector('#battleResultOverlay')?.classList.contains('visible')!==true);
  assert((await page.locator('#battleResultOverlay').getAttribute('aria-hidden'))==='true','hidden battle result is removed from assistive technology');

  await page.evaluate(()=>{
    const f=currentTestFortress();
    f.id='citadel';f.name='Zitadelle';f.subtitle='Bergzitadelle';f.capturedAt='';f.defense=100;f.maxDefense=100;
    const day=battleDayState('english',true);day.unlocked=true;day.actionUsed=false;
    renderBattleView();
  });
  assert(await page.locator('#battleBossPanel:not(.hidden)').count()===1,'citadel opens boss presentation');
  assert((await page.locator('#battleBossName').textContent())?.includes('Torwächter'),'boss has a child-friendly name');
  assert(!(await page.locator('[data-battle-attack="special"]').isDisabled()),'high progress unlocks special attack');
  await activate('[data-battle-attack="special"]','special attack choice');
  await activate('#battleAttackBtn','battle primary action');
  await waitForBattleResult();
  assert((await page.locator('#battleResultTitle').textContent())?.includes('Boss besiegt'),'boss conquest opens result view');
  assert(await page.evaluate(()=>subjectProgress().pct)===100,'boss attack does not change academic mastery');

  await activate('#battleResultClose','battle result close');
  await page.waitForFunction(()=>document.querySelector('#battleResultOverlay')?.classList.contains('visible')!==true);
  await page.evaluate(()=>{
    const day=battleDayState('english',true);day.unlocked=true;day.actionUsed=false;
    renderBattleView();
  });
  assert(await page.locator('.battle-tactics.hidden').count()===1,'after conquest tactics disappear and mission becomes securing');
  assert((await page.locator('#battleAttackBtn').textContent())?.includes('sichern'),'captured fortress offers securing action');
  await activate('#battleAttackBtn','battle primary action');
  await waitForBattleResult();
  assert((await page.locator('#battleResultTitle').textContent())?.includes('Festung gesichert'),'securing opens dedicated result');
  assert(await page.evaluate(()=>currentTestFortress().securedDates.length===1),'securing is stored on fortress');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle flow smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-battle-flow-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
