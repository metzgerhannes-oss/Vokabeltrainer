import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Desktop UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof syncResponsiveHomeLayout==='function');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'desktop_set',learnerId:'learner_demo',subject:'english',title:'Desktop Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'window',translation:'Fenster',source:'desktop-smoke',verified:true,firstContactCopiedAt:'test',firstContactRecalledAt:'test',firstContactCompletedAt:'test'});
    rebuildWordIndexes();renderAll();showView('homeView');syncResponsiveHomeLayout();
  });

  await page.waitForSelector('#homeView.active');
  const today=await page.locator('.today-focus').boundingBox();
  const nav=await page.locator('.bottom-nav').boundingBox();
  assert(today&&nav&&nav.x<today.x&&nav.width<170&&nav.y<180,'mobile bottom navigation becomes a compact desktop side rail');

  await page.click('.nav-btn[data-view="practiceView"]');
  await page.waitForSelector('#practiceView.active');
  assert(await page.locator('.practice-path').count()===4,'practice hub exposes exactly four primary routes');
  assert(!(await page.locator('#optionalLearningCard').isVisible()),'special training starts collapsed');
  await page.click('#practiceSpecialBtn');
  assert(await page.locator('#optionalLearningCard').isVisible(),'special training opens on demand');
  assert(await page.locator('#recommendations .recommend').count()>=5,'special training keeps the targeted learning modes');

  await page.setViewportSize({width:820,height:900});
  assert(await page.locator('.practice-path').count()===4,'tablet layout keeps all four practice routes');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer desktop UI smoke: passed');
}finally{
  await browser.close();
}
