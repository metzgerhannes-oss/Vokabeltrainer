import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Pair review UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof attachVocabularyToSet==='function'&&typeof openSetPairAudit==='function'&&typeof startSession==='function');
  await page.waitForFunction(()=>state!==null&&document.querySelector('#profileBtn')?.textContent!=='Profil');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'ocr_set',learnerId:'learner_demo',subject:'english',title:'OCR Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:true,pairVerifiedAt:''};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'write',translation:'schreiben',source:'photo-text-import',verified:false});
    rebuildWordIndexes();renderAll();showView('homeView');
  });

  assert((await page.locator('#todaySummary').textContent())?.includes('Neue Wörter werden vorbereitet'),'child sees preparation status instead of an audit task');
  assert(await page.locator('#quickLearnHeroBtn').isDisabled(),'child cannot start unreviewed vocabulary');
  assert(await page.locator('[data-set-audit="ocr_set"]').count()===1&&!(await page.locator('[data-set-audit="ocr_set"]').isVisible()),'pair-review control is not visible to the child');
  assert(await page.evaluate(()=>!state.vocabulary[0]?.verifiedAt),'OCR vocabulary is not verified before parent confirmation');

  await page.click('#parentAreaBtn');
  await page.waitForSelector('#modal[open] #confirmParentMode');
  await page.click('#confirmParentMode');
  await page.waitForSelector('#parentView.active');
  assert(await page.locator('body.parent-mode').count()===1,'explicit parent mode is active');

  const audit=page.locator('[data-set-audit="ocr_set"]');
  assert(await audit.isVisible(),'pair review is visible in parent area');
  await audit.click();
  await page.waitForSelector('#modal[open] #confirmSetPairsBtn');
  const modal=await page.locator('#modalContent').textContent();
  assert(modal?.includes('write')&&modal?.includes('schreiben'),'review shows exact word↔meaning pair used by quiz');
  await page.click('#confirmSetPairsBtn');
  await page.waitForSelector('#parentView.active');
  assert(await page.evaluate(()=>!!state.vocabulary[0]?.verifiedAt),'parent confirmation verifies vocabulary');
  assert(await page.evaluate(()=>!setNeedsPairReview(state.sets.find(s=>s.id==='ocr_set'))),'pair-review requirement is cleared');
  assert(await page.locator('body.learning-focus').count()===0,'parent confirmation does not launch the child learning flow');

  await page.click('#childModeBtn');
  await page.waitForSelector('#homeView.active');
  assert((await page.locator('#todaySummary').textContent())?.includes('Vokabel heute'),'verified words become part of the bounded daily child learning task');
  await page.click('#quickLearnHeroBtn');
  await page.waitForSelector('#firstContactCopiedBtn');
  assert(await page.locator('body.learning-focus').count()===1,'child can start first contact only after parent verification');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer pair-review UI smoke: passed');
}finally{
  await browser.close();
}
