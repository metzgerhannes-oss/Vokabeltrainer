import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const {browser,page,assert,activate,reset,errors,diagnose}=await createBattleHarness();

try{
  await reset({revealed:false,ticket:false});
  assert(!(await page.locator('#attackBtn').isDisabled()),'planned fortress remains viewable before daily reward');
  assert((await page.locator('#attackBtn').textContent())?.includes('Festung'),'campaign card points to test fortress');

  await activate('#attackBtn','battle entry');
  await page.waitForSelector('#battleView.active');
  const first=await page.evaluate(()=>{
    const f=currentTestFortress(),stage=document.querySelector('#battleStage'),overlay=stage?.querySelector('[data-battle-target-reveal]');
    return {
      seenAt:f?.revealedAt||'',
      key:f?.key||'',
      revealKey:stage?.dataset.revealKey||'',
      copy:overlay?.textContent||'',
      hidden:overlay?.hidden??true
    };
  });
  assert(first.seenAt,'first opening records fortress reveal');
  assert(first.key===first.revealKey,'reveal belongs to current fortress');
  assert(first.copy.includes('NEUES TESTZIEL ENTDECKT')&&first.copy.includes('Vokabel'),'reveal explains target and learning scope');
  assert(first.hidden===false,'first fortress reveal is visible');
  assert(await page.locator('#battleAttackBtn').isDisabled(),'attack remains locked before daily goal');

  await page.evaluate(()=>{
    if(battleFortressRevealTimer){clearTimeout(battleFortressRevealTimer);battleFortressRevealTimer=null}
    battleFortressRevealKey='';
    battleFortressRevealUntil=0;
    renderBattleView();
  });
  assert(await page.locator('#battleStage [data-battle-target-reveal]').isHidden(),'reveal reaches stable hidden state');

  await activate('#battleReturnBtn','battle return action');
  await page.waitForSelector('#armyView.active');
  await page.evaluate(()=>{grantBattleTicket('dailyGoal');renderAll()});
  assert(await page.locator('#gameLoopLearn.done').count()===1,'learning step becomes complete after the daily reward');
  assert(await page.locator('#gameLoopAttack.current').count()===1,'attack becomes the current game step after learning');
  assert((await page.locator('#attackBtn').textContent())?.includes('ANGRIFF STARTEN'),'primary action changes to attack when a ticket is ready');
  assert((await page.locator('#gameTicketCount').textContent())?.includes('bereit'),'HUD shows the available game action');
  assert(await page.evaluate(()=>grantBattleTicket('duplicate-smoke'))===false,'same day cannot earn duplicate battle action');

  await activate('#attackBtn','battle entry');
  await page.waitForSelector('#battleView.active');
  const second=await page.evaluate(()=>({
    seenAt:currentTestFortress()?.revealedAt||'',
    hidden:document.querySelector('#battleStage [data-battle-target-reveal]')?.hidden??true
  }));
  assert(second.seenAt===first.seenAt,'reopening preserves original reveal timestamp');
  assert(second.hidden===true,'same fortress is not revealed twice');
  assert((await page.locator('#battleReturnBtn').textContent())?.includes('Armee'),'battle return destination remains inside the game area');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle navigation smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-battle-navigation-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
