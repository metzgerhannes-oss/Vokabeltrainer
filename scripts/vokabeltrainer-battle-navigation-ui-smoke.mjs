import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const {browser,page,assert,activate,reset,errors,diagnose}=await createBattleHarness();

try{
  await page.setViewportSize({width:375,height:667});
  await reset({revealed:false,ticket:false});
  assert(!(await page.locator('#attackBtn').isDisabled()),'planned fortress remains viewable before daily reward');
  assert((await page.locator('#attackBtn').textContent())?.toUpperCase().includes('FESTUNG'),'game command points clearly to the current fortress');

  await activate('#attackBtn','battle entry');
  await page.waitForSelector('#battleView.active');
  await page.waitForFunction(()=>window.VTBattleArt?.ready===true&&document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  assert(await page.locator('#battleStage [data-battle-scene-art]').evaluate(img=>img.naturalWidth>0),'painted battle artwork loads on the iPhone path');
  assert(!(await page.evaluate(()=>document.body.classList.contains('battle-immersive'))),'fortress preview no longer auto-enters legacy immersive mode');
  assert(!(await page.evaluate(()=>document.body.classList.contains('battle-focus-fallback'))),'fortress preview does not lock the page before an explicit fullscreen action');
  assert(await page.evaluate(()=>document.body.classList.contains('battle-preview')),'locked fortress uses the dedicated preview state');
  assert((await page.evaluate(()=>getComputedStyle(document.body).overflow))!=='hidden','normal fortress preview keeps body scrolling available');
  assert(await page.locator('.bottom-nav').isVisible(),'normal fortress preview keeps primary navigation available');
  assert(await page.locator('.battle-stage-wrap > .battle-scene-hud').count()===1,'battle KPIs stay structurally attached to the battle composition');
  assert(await page.locator('.battle-scene-hud').isHidden(),'locked fortress preview hides all battle KPIs');
  assert(await page.locator('.battle-stage-wrap > .battle-scene-tactics').count()===1,'battle tactics stay structurally attached for the active-battle state');
  assert(await page.locator('.battle-scene-tactics').isHidden(),'locked fortress preview hides battle tactics');
  assert(await page.locator('.battle-action-dock').isHidden(),'locked fortress preview hides the disabled action block');
  const armyPreviewGeometry=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage')?.getBoundingClientRect(),art=document.querySelector('#battleStage [data-battle-scene-art]')?.getBoundingClientRect();
    return {width:stage?.width||0,height:stage?.height||0,top:stage?.top||0,bottom:stage?.bottom||0,artWidth:art?.width||0,artHeight:art?.height||0,vw:innerWidth,vh:innerHeight};
  });
  console.log('FORTRESS_PREVIEW_GEOMETRY',JSON.stringify(armyPreviewGeometry));
  assert(armyPreviewGeometry.width>=armyPreviewGeometry.vw*.9&&armyPreviewGeometry.height>=160,'Army "Festung ansehen" keeps a real visible 16:9 battlefield on compact iPhone viewports: '+JSON.stringify(armyPreviewGeometry));
  assert(armyPreviewGeometry.artWidth>=armyPreviewGeometry.width*.95&&armyPreviewGeometry.artHeight>=armyPreviewGeometry.height*.95,'Army fortress preview artwork fills its visible stage instead of collapsing to a line');
  assert(await page.locator('#battleFullscreenBtn').isVisible(),'battle exposes fullscreen only as an explicit user action');
  assert((await page.locator('#battleFullscreenBtn').textContent())?.includes('Vollbild'),'fullscreen control is labelled as an optional fullscreen action');
  assert(await page.locator('.battle-story').isVisible(),'normal scrollable battle view keeps the story card in document flow');
  assert(await page.locator('#battleStorySpeakBtn').count()===1,'battle story narration control remains available in the DOM');
  assert((await page.locator('#battleStorySpeakBtn').textContent()).includes('Geschichte hören'),'battle story control describes listening instead of overpromising a dramatic narrator');
  assert(await page.locator('#battleStorySpeakBtn').getAttribute('aria-pressed')==='false','battle story narration starts stopped');
  const storyCopy=await page.locator('#battleStoryText').textContent();
  assert(storyCopy?.includes('Dein nächster Test ist am'),'battle story speaks in natural sentences about the next test');
  assert(!storyCopy?.includes('steht für')&&!storyCopy?.includes('ausgewählt am'),'battle story avoids technical planner wording in narration');
  await page.evaluate(()=>updateBattleStoryNarrationUi(true));
  assert(await page.locator('#battleStorySpeakBtn').getAttribute('aria-pressed')==='true','battle story narration exposes active state');
  assert((await page.locator('#battleStorySpeakBtn').textContent()).includes('Stop'),'battle story narration offers an explicit stop control');
  await page.evaluate(()=>updateBattleStoryNarrationUi(false));
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
  assert(await page.locator('#battleStage').isVisible(),'battle artwork remains visible in normal scrollable mode');
  assert(await page.locator('#battleFocusAttackBtn').isHidden(),'obsolete focus-only attack control stays hidden');
  assert(await page.locator('#battleStage .battle-fortress-state-badge').isHidden(),'duplicate fortress status plaque never covers the painted fortress');
  assert(await page.evaluate(()=>document.fullscreenElement===null),'battle does not enter browser fullscreen without an explicit tap');

  await activate('#battleBackBtn','battle return action');
  await page.waitForSelector('#armyView.active');

  await page.evaluate(()=>window.VTCampaignMap.open());
  await page.waitForSelector('#campaignMapView.active');
  assert(await page.locator('#campaignMapBattleBtn').isVisible(),'current fortress exposes the campaign-map "Zur Schlacht" entry');
  await activate('#campaignMapBattleBtn','campaign map battle entry');
  await page.waitForSelector('#battleView.active');
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  assert((await page.locator('#battleBackBtn').textContent())?.includes('Feldzug'),'campaign-map preview keeps the correct return destination');
  const mapPreviewGeometry=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage')?.getBoundingClientRect();
    return {width:stage?.width||0,height:stage?.height||0,bottom:stage?.bottom||0,vw:innerWidth,vh:innerHeight};
  });
  assert(mapPreviewGeometry.width>=mapPreviewGeometry.vw*.9&&mapPreviewGeometry.height>=160,'campaign-map "Zur Schlacht" opens the same visible, scrollable fortress preview instead of a blank screen');
  await activate('#battleBackBtn','campaign map preview return');
  await page.waitForSelector('#campaignMapView.active');
  await page.evaluate(()=>window.VTArmyUi.open());
  await page.waitForSelector('#armyView.active');

  await page.evaluate(()=>{grantBattleTicket('dailyGoal');renderAll()});
  assert(await page.locator('#gameLoopLearn.done').count()===1,'learning step becomes complete after the daily reward');
  assert(await page.locator('#gameLoopAttack.current').count()===1,'attack becomes the current game step after learning');
  assert((await page.locator('#attackBtn').textContent())?.includes('ANGRIFF STARTEN'),'primary action changes to attack when a ticket is ready');
  assert((await page.locator('#gameTicketCount').textContent())?.includes('bereit'),'HUD shows the available game action');
  assert(await page.evaluate(()=>grantBattleTicket('duplicate-smoke'))===false,'same day cannot earn duplicate battle action');

  await activate('#attackBtn','battle entry');
  await page.waitForSelector('#battleView.active');
  assert(!(await page.evaluate(()=>document.body.classList.contains('battle-preview'))),'earned daily action opens the full battle instead of preview mode');
  const visibleBattleKpis=await page.locator('.battle-scene-hud>div:visible').count();
  assert(visibleBattleKpis===4,'all four battle KPIs are readable outside the artwork when an action is ready');
  assert(await page.locator('.battle-scene-tactics').isVisible(),'battle tactics are usable below the artwork when an action is ready');
  assert(await page.locator('.battle-action-dock').isVisible(),'active battle shows the primary action block');
  const composition=await page.evaluate(()=>{
    const readout=document.querySelector('.battle-scene-hud')?.getBoundingClientRect();
    const stage=document.querySelector('#battleStage')?.getBoundingClientRect();
    const tactics=document.querySelector('.battle-scene-tactics')?.getBoundingClientRect();
    const dock=document.querySelector('.battle-action-dock')?.getBoundingClientRect();
    return {
      readoutAbove:!!readout&&!!stage&&readout.bottom<=stage.top+1,
      tacticsBelow:!!tactics&&!!stage&&tactics.top>=stage.bottom-1,
      dockBelow:!!dock&&!!tactics&&dock.top>=tactics.bottom-1
    };
  });
  assert(composition.readoutAbove&&composition.tacticsBelow&&composition.dockBelow,'active battle information never overlaps the campaign artwork');
  const second=await page.evaluate(()=>({
    seenAt:currentTestFortress()?.revealedAt||'',
    hidden:document.querySelector('#battleStage [data-battle-target-reveal]')?.hidden??true
  }));
  assert(second.seenAt===first.seenAt,'reopening preserves original reveal timestamp');
  assert(second.hidden===true,'same fortress is not revealed twice');
  assert((await page.locator('#battleBackBtn').textContent())?.includes('Armee'),'battle return destination remains inside the game area');
  await page.evaluate(()=>{showView('childProgressView');openBattleView()});
  await page.waitForSelector('#battleView.active');
  assert((await page.locator('#battleBackBtn').textContent())?.includes('Armee'),'battle entered from progress falls back to Army instead of crossing into learning/progress');
  await activate('#battleBackBtn','battle progress fallback return');
  await page.waitForSelector('#armyView.active');
  await activate('#attackBtn','battle re-entry after progress fallback');
  await page.waitForSelector('#battleView.active');

  await page.evaluate(()=>{window.VTCampaignMap.open()});
  await page.waitForSelector('#campaignMapView.active');
  const station=page.locator('[data-campaign-station]').first();
  if(await station.evaluate(el=>el.classList.contains('selected')))await station.click();
  await station.click();
  assert(await page.locator('#campaignMapDetail [data-campaign-detail-close]').count()===1,'campaign target detail has an explicit close control');
  await page.locator('#campaignMapDetail [data-campaign-detail-close]').click();
  assert(await page.locator('#campaignMapDetail').isHidden(),'campaign detail closes with explicit close control');
  await station.click();
  await station.click();
  assert(await page.locator('#campaignMapDetail').isHidden(),'repeated station click toggles the detail closed');
  await station.click();
  await page.keyboard.press('Escape');
  assert(await page.locator('#campaignMapDetail').isHidden(),'Escape closes campaign detail');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle navigation smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-battle-navigation-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
