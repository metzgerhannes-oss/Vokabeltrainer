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
    const set={id:'battle_set',learnerId:'learner_demo',subject:'english',title:'Battle Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'shield',translation:'Schild',source:'battle-smoke',verified:true});
    for(const link of state.setVocabulary){link.firstContactCopiedAt=link.firstContactRecalledAt=link.firstContactCompletedAt=new Date().toISOString()}
    const p=state.learnerVocabulary[0];
    p.skills={recognition:4,listening:4,retrieval:4,spelling:4,context:4};p.independentSuccesses=8;p.activeSuccessDays=['2026-09-10','2026-09-14','2026-09-18'];p.activePracticeDays=[...p.activeSuccessDays];p.maxActiveGapDays=7;p.coldRecallDays=['2026-09-14','2026-09-18'];p.coldRecallSuccesses=2;p.intervalDays=14;p.errorProfile={meaning:0,retrieval:0,spelling:0,listening:0,context:0,grammar:0};refreshMastery(p);
    state.learners[0].milestones[`hundred_english_${currentSchoolYear()}`]=new Date().toISOString();
    rebuildWordIndexes();renderAll();showView('childProgressView');
  });

  assert(await page.locator('#attackBtn').isDisabled(),'battle area is locked before a lesson reward');
  await page.evaluate(()=>{grantBattleTicket('smoke');renderAll();});
  assert(!(await page.locator('#attackBtn').isDisabled()),'completed lesson reward unlocks battle area');
  assert((await page.locator('#attackBtn').textContent())?.includes('Schlacht'),'campaign card points to battle area');

  await page.click('#attackBtn');
  await page.waitForSelector('#battleView.active');
  await page.waitForFunction(()=>window.VTBattleArt?.ready===true);
  await page.waitForFunction(()=>document.querySelector('#battleStage')?.classList.contains('battle-art-ready'));
  assert(await page.locator('#battleStage [data-battle-scene-art]').count()===1,'battle stage receives one illustrated background layer');
  assert(await page.locator('#battleStage [data-battle-scene-art]').evaluate(img=>img.naturalWidth>0&&img.naturalHeight>0),'illustrated battle background loads');
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
  assert(!(await page.locator('[data-battle-attack="ram"]').isDisabled()),'ram attack unlocks from learning progress');
  await page.click('[data-battle-attack="ram"]');
  assert(await page.locator('[data-battle-attack="ram"].active').count()===1,'attack type can be selected');
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
  assert(resultText?.includes('+20 XP'),'result view shows the actual XP reward');
  assert(resultText?.includes('100%'),'result view shows the actual learning progress');
  assert(resultText?.includes('Wachturm'),'result view shows the actual next fortress');
  assert(await page.locator('#battleResultArt').evaluate(img=>img.naturalWidth>0),'result view reuses a loaded local battle illustration');
  assert(await page.evaluate(()=>battleTickets())===0,'attack consumes exactly one earned battle ticket');
  assert(await page.evaluate(()=>learner().campaignLog.length)===1,'battle result is stored in campaign log');
  assert(await page.evaluate(()=>learner().campaignLog[0]?.attack)==='ram','selected attack is stored only as campaign presentation metadata');
  assert(await page.evaluate(()=>subjectProgress().pct)===100,'battle presentation does not alter academic mastery');
  await page.waitForFunction(()=>document.querySelector('#battleFortressName')?.textContent?.includes('Wachturm'));
  assert((await page.locator('#battleFortressName').textContent())?.includes('Wachturm'),'winning advances to a visually different fortress');
  await page.click('#battleResultContinue');
  await page.waitForSelector('#battleResultOverlay.hidden');

  await page.evaluate(()=>{
    const wins=fortressWins();wins.splice(0,wins.length,'outpost','tower','wall');
    grantBattleTicket('boss-smoke');renderBattleView();
  });
  assert(await page.locator('#battleBossPanel:not(.hidden)').count()===1,'citadel opens a boss fight panel');
  assert((await page.locator('#battleBossName').textContent())?.includes('Torwächter'),'boss fight has a child-friendly named opponent');
  assert(await page.locator('#battleStage .battle-boss-character').count()===1,'boss character is visible in battle stage');
  assert((await page.locator('#battleStoryTitle').textContent())?.includes('Bergzitadelle'),'campaign story advances with the fortress');
  assert(!(await page.locator('[data-battle-attack="special"]').isDisabled()),'high progress unlocks a special attack');
  await page.click('[data-battle-attack="special"]');
  await page.click('#battleAttackBtn');
  await page.waitForSelector('#battleStage.attack-special.battle-finished',{timeout:3000});
  await page.waitForSelector('#battleResultOverlay.visible');
  assert((await page.locator('#battleResultTitle').textContent())?.includes('Boss besiegt'),'boss victory uses the cinematic result view');
  assert(await page.evaluate(()=>subjectProgress().pct)===100,'boss and special attack do not change academic mastery');
  await page.click('#battleResultClose');
  await page.waitForSelector('#battleResultOverlay.hidden');

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
