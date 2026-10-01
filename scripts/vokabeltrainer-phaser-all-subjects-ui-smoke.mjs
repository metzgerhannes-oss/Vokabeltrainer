import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const h=await createBattleHarness();
const {browser,page,assert,activate,reset,openBattle,waitForBattleResult,errors,diagnose}=h;

try{
  for(const expected of [
    {subject:'latin',theme:'roman',version:'Roman Phaser'},
    {subject:'french',theme:'french-battle',version:'Français Phaser'}
  ]){
    await reset({revealed:true,ticket:true,subject:expected.subject});
    await page.evaluate(subject=>{
      const l=learner();
      l.worldModeBySubject={...(l.worldModeBySubject||{}),[subject]:'battle'};
      const f=currentTestFortress();
      f.defense=100;f.maxDefense=100;
      window.__VT_BATTLE_TEST_MODE__=false;
      renderAll();
    },expected.subject);

    await openBattle();
    await activate('[data-battle-attack="ram"]',expected.subject+' ram attack');
    const masteryBefore=await page.evaluate(()=>subjectProgress().pct);
    await activate('#battleAttackBtn',expected.subject+' production Phaser action');

    await page.waitForFunction(()=>document.querySelector('#battleStage')?.dataset.phaserReady==='true',null,{timeout:20000});
    const live=await page.evaluate(()=>({
      renderer:document.querySelector('#battleStage')?.dataset.renderer||'',
      subject:document.querySelector('#battleStage')?.dataset.phaserSubject||'',
      theme:document.querySelector('#battleStage')?.dataset.phaserTheme||'',
      version:document.querySelector('#battleStage .battle-phaser-production')?.dataset.version||'',
      moduleVersion:window.VTBattlePhaserProduction?.version||''
    }));

    assert(live.renderer==='phaser4',expected.subject+' uses production Phaser');
    assert(live.subject===expected.subject,expected.subject+' is preserved in the Phaser bridge');
    assert(live.theme===expected.theme,expected.subject+' receives its own visual theme');
    assert(live.version.includes(expected.version),expected.subject+' exposes its own visible renderer identity');
    assert(live.moduleVersion==='0.21.57-phaser-production.4','shared production bridge version is current');

    await waitForBattleResult({timeout:30000});
    const result=await page.evaluate(()=>({
      log:learner().campaignLog.at(-1)||null,
      tickets:battleTickets(),
      mastery:subjectProgress().pct,
      beats:window.__VT_PRODUCTION_BATTLE_BEATS__||[]
    }));
    assert(result.log?.result==='win'&&result.log?.attack==='ram',expected.subject+' records the same real battle result');
    assert(result.tickets===0,expected.subject+' consumes exactly one battle action');
    assert(result.mastery===masteryBefore,expected.subject+' Phaser renderer cannot change academic mastery');
    assert(result.beats.includes('defense-volley')&&result.beats.includes('defense-catapult'),expected.subject+' keeps cinematic fortress counterfire');
    assert(result.beats.includes('breach-entry')&&result.beats.includes('profile-banner'),expected.subject+' capture keeps gate entry and profile banner');

    await page.evaluate(()=>window.VTBattlePhaserProduction?.destroyProductionBattle?.());
  }

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer Latin/French production Phaser smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-phaser-all-subjects-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
