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
    rebuildWordIndexes();renderAll();showView('childProgressView');
  });

  assert(await page.locator('#attackBtn').isDisabled(),'battle area is locked before a lesson reward');
  await page.evaluate(()=>{grantBattleTicket('smoke');renderAll();});
  assert(!(await page.locator('#attackBtn').isDisabled()),'completed lesson reward unlocks battle area');
  assert((await page.locator('#attackBtn').textContent())?.includes('Schlacht'),'campaign card points to battle area');

  await page.click('#attackBtn');
  await page.waitForSelector('#battleView.active');
  assert(await page.locator('#battleStage .battle-unit').count()>=6,'animated army contains multiple units');
  assert((await page.locator('#battleTicketPill').textContent())?.includes('1'),'battle screen shows earned attack');

  await page.click('#battleFullscreenBtn');
  assert(await page.locator('body.battle-immersive').count()===1,'immersive fullscreen fallback activates');
  await page.click('#battleAttackBtn');
  await page.waitForSelector('#battleStage.battle-finished',{timeout:3000});
  const msg=await page.locator('#battleMessage').textContent();
  assert(/Angriff|Festung|Mauer/i.test(msg||''),'battle ends with a visible result');
  assert(await page.evaluate(()=>battleTickets())===0,'attack consumes exactly one earned battle ticket');
  assert(await page.evaluate(()=>learner().campaignLog.length)===1,'battle result is stored in campaign log');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle UI smoke: passed');
}finally{
  await browser.close();
}
