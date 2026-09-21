import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('First-contact UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof startFirstContact==='function'&&typeof firstContactStatus==='function'&&state!==null&&document.querySelector('#profileBtn')?.textContent!=='Profil');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'intro_set',learnerId:'learner_demo',subject:'english',title:'Unit Erstkontakt',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    const pairs=[['alpha','eins'],['bravo','zwei'],['charlie','drei'],['delta','vier'],['echo','fünf'],['foxtrot','sechs']];
    for(const [term,translation] of pairs)attachVocabularyToSet(set.id,{term,translation,source:'first-contact-smoke',verified:true});
    rebuildWordIndexes();renderAll();showView('homeView');
  });

  assert(await page.locator('[data-set-study="intro_set"]').isDisabled(),'ordinary learning is blocked before first contact');
  assert(await page.locator('[data-set-intro="intro_set"]').count()===1,'first-contact action is visible');
  const before=await page.evaluate(()=>firstContactStatus('intro_set'));
  assert(before.pending===6&&before.completed===0,'all new set links begin pending');

  await page.click('[data-set-intro="intro_set"]');
  for(let i=0;i<5;i++){
    await page.waitForSelector('#firstContactCopiedBtn');
    await page.click('#firstContactCopiedBtn');
    await page.waitForSelector('#firstContactRevealBtn');
    await page.click('#firstContactRevealBtn');
    await page.waitForSelector('#firstContactCorrectBtn');
    await page.click('#firstContactCorrectBtn');
  }

  await page.waitForSelector('#firstContactRevealBlockBtn');
  const hiddenReview=await page.locator('#studyArea').textContent();
  assert(hiddenReview?.includes('eins')&&!hiddenReview?.includes('alpha'),'block review asks for active recall before revealing terms');
  await page.click('#firstContactRevealBlockBtn');
  const revealedReview=await page.locator('#studyArea').textContent();
  assert(revealedReview?.includes('alpha')&&revealedReview?.includes('echo'),'block review reveals the checked terms only on request');
  await page.click('#firstContactNextBlockBtn');

  await page.waitForSelector('#firstContactCopiedBtn');
  await page.click('#firstContactCopiedBtn');
  await page.click('#firstContactRevealBtn');
  await page.click('#firstContactCorrectBtn');
  await page.waitForSelector('#firstContactDoneBtn');

  const after=await page.evaluate(()=>firstContactStatus('intro_set'));
  assert(after.completed===6&&after.pending===0,'all six vocabulary links are marked first-contact complete');
  assert((await page.locator('#studyArea').textContent())?.includes('Lektion vorbereitet'),'completion clearly hands off to the normal learning path');
  await page.click('#firstContactDoneBtn');
  assert(!(await page.locator('[data-set-study="intro_set"]').isDisabled()),'ordinary learning is unlocked after first contact');
  assert(errors.length===0,'no browser errors: '+errors.join(' | '));

  console.log('Vokabeltrainer first-contact WebKit smoke: passed');
  console.log('✓ new vocabulary is blocked from ordinary learning');
  console.log('✓ copy → cover/recall → compare is required');
  console.log('✓ five-word block review hides answers before reveal');
  console.log('✓ completion unlocks the normal learning path');
}finally{
  await browser.close();
}
