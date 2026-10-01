import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const h=await createBattleHarness();
const {browser,page,assert,activate,reset,openBattle,waitForBattleResult,errors,diagnose}=h;

try{
  await reset({revealed:true,ticket:true,subject:'german'});
  await page.evaluate(()=>{
    const p=state.learnerVocabulary[0];
    p.literacySkills={...defaultLiteracySkills(),recognized:4,decoded:4,meaning:4,phonologicalSpelling:4,orthographicSpelling:4,dictation:4,sentenceUse:1};
    refreshMastery(p);
    const f=currentTestFortress();
    f.defense=100;f.maxDefense=100;
    window.__VT_BATTLE_TEST_MODE__=false;
    renderAll();
  });
  await openBattle();
  assert((await page.locator('#battleActionTitle').textContent())?.includes('Belagerung'),'German battle view uses Belagerung language');
  await activate('[data-battle-attack="ram"]','Wortreich ram choice');
  const before=await page.evaluate(()=>({mastery:subjectProgress().pct,xp:learner().xp,tickets:battleTickets()}));
  await activate('#battleAttackBtn','Wortreich live Phaser battle');
  await page.waitForFunction(()=>{
    const stage=document.querySelector('#battleStage'),mount=stage?.querySelector('.battle-phaser-production');
    return stage?.dataset.renderer==='phaser4'&&stage?.dataset.phaserReady==='true'&&stage?.dataset.phaserSubject==='german'&&stage?.dataset.phaserTheme==='wordrealm'&&mount?.classList.contains('theme-wordrealm');
  },null,{timeout:20000});
  const live=await page.evaluate(()=>{
    const stage=document.querySelector('#battleStage'),mount=stage?.querySelector('.battle-phaser-production'),canvas=mount?.querySelector('canvas'),rect=canvas?.getBoundingClientRect();
    return {subject:stage?.dataset.phaserSubject||'',theme:stage?.dataset.phaserTheme||'',attack:stage?.dataset.phaserAttack||'',outcome:stage?.dataset.phaserOutcome||'',version:mount?.dataset.version||'',width:rect?.width||0,height:rect?.height||0};
  });
  assert(live.subject==='german'&&live.theme==='wordrealm','German battle mounts the Wortreich Phaser renderer');
  assert(live.attack==='ram'&&live.outcome==='capture','Wortreich receives selected ram attack and real capture outcome');
  assert(live.version.includes('v0.21.57 · Wortreich Phaser'),'Wortreich renderer exposes the current cross-subject release marker');
  assert(live.width>0&&live.height>0,'Wortreich Phaser canvas is visible on iPhone');

  const resultState=await waitForBattleResult({timeout:30000});
  const after=await page.evaluate(()=>({
    mastery:subjectProgress().pct,xp:learner().xp,tickets:battleTickets(),
    log:learner().campaignLog.at(-1)||null,
    theme:document.querySelector('#battleResultOverlay')?.dataset.visualTheme||'',
    title:document.querySelector('#battleResultTitle')?.textContent||'',
    lead:document.querySelector('#battleResultLead')?.textContent||'',
    scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth
  }));
  assert(resultState.title.includes('Burg'),'capture result speaks about a Burg');
  assert(after.theme==='wordrealm','result overlay retains Wortreich theme');
  assert(after.log?.result==='win'&&after.log?.attack==='ram','business logic records the German siege result');
  assert(after.mastery===before.mastery,'Wortreich Phaser does not change academic mastery');
  assert(after.tickets===Math.max(0,before.tickets-1),'Wortreich consumes exactly one existing battle action');
  assert(after.xp===before.xp+20,'existing conquest reward remains unchanged');
  assert(after.scrollWidth<=after.clientWidth+1,'Wortreich production battle stays overflow-free on iPhone');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer Deutsch Paket E UI smoke: passed');
}catch(error){
  await diagnose('vokabeltrainer-deutsch-paket-e-ui-smoke',error);
  throw error;
}finally{
  await browser.close();
}
