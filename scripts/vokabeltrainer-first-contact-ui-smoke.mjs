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

  assert((await page.locator('#todaySummary').textContent())?.includes('Neue Vokabeln kennenlernen'),'today identifies first contact as the next child task');
  assert((await page.locator('#quickLearnHeroBtn').textContent())?.includes('Kennenlernen'),'primary child action starts first contact');
  assert(await page.locator('#setList').count()===1&&!(await page.locator('#setList').isVisible()),'learning-set administration is not visible in child mode');

  const before=await page.evaluate(()=>firstContactStatus('intro_set'));
  assert(before.pending===6&&before.completed===0,'all new set links begin pending');

  await page.click('#quickLearnHeroBtn');
  for(let i=0;i<5;i++){
    await page.waitForSelector('#firstContactCopiedBtn');
    await page.click('#firstContactCopiedBtn');
    await page.waitForSelector('#firstContactRevealBtn');
    await page.click('#firstContactRevealBtn');
    await page.waitForSelector('#firstContactCorrectBtn');
    await page.click('#firstContactCorrectBtn');
  }
  await page.waitForSelector('#firstContactRevealBlockBtn');
  await page.click('#firstContactRevealBlockBtn');
  await page.waitForSelector('#firstContactNextBlockBtn');
  await page.click('#firstContactNextBlockBtn');

  await page.waitForSelector('#firstContactCopiedBtn');
  await page.click('#firstContactCopiedBtn');
  await page.waitForSelector('#firstContactRevealBtn');
  await page.click('#firstContactRevealBtn');
  await page.waitForSelector('#firstContactCorrectBtn');
  await page.click('#firstContactCorrectBtn');

  await page.waitForSelector('#firstContactDoneBtn');
  const after=await page.evaluate(()=>firstContactStatus('intro_set'));
  assert(after.pending===0&&after.completed===6,'all words complete first contact');
  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer first-contact UI smoke: passed');
}finally{
  await browser.close();
}
