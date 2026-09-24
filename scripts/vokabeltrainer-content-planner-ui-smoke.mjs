import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Unified content planner UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>state!==null&&typeof openLearningContentPlanner==='function'&&typeof assignBookRowsToLearner==='function'&&state.books.some(b=>b.builtinSource));

  await page.click('#parentAreaBtn');
  await page.waitForSelector('#modal[open] #confirmParentMode');
  await page.click('#confirmParentMode');
  await page.waitForSelector('#parentView.active');

  assert((await page.locator('#parentTestPlanBtn').textContent())?.includes('Test vorbereiten'),'test planning is the primary path when a test exists');
  assert((await page.locator('#parentLibraryBtn').textContent())?.includes('Vokabeln vorbereiten')&&(await page.locator('#parentLibraryBtn').textContent())?.includes('Ohne festen Testtermin'),'separate no-test path is explicitly labeled');
  const order=await page.evaluate(()=>Array.from(document.querySelectorAll('.parent-primary-actions .parent-primary-action')).map(x=>x.id));
  assert(order.indexOf('parentTestPlanBtn')<order.indexOf('parentLibraryBtn'),'test planning is shown before no-test learning');
  await page.click('#parentLibraryBtn');
  await page.waitForSelector('#modal[open] #contentWordPicker');
  assert((await page.locator('#modalContent').textContent())?.includes('ohne Testtermin'),'no-test flow states its purpose explicitly');
  assert(await page.locator('#contentWordPicker [data-book-row]').count()>0,'known book words are directly selectable');
  await page.locator('#modal').evaluate(el=>el.close());

  await page.click('#parentTestPlanBtn');
  await page.waitForSelector('#modal[open] #planWordPicker');
  assert((await page.locator('#modalContent').textContent())?.includes('automatisch als Lernstoff'),'test planner explains that selected words become learning content automatically');
  const total=await page.locator('#planWordPicker [data-plan-row]').count();
  assert(total>6,'test planner exposes individual vocabulary choices');
  await page.locator('#planRangeFrom').fill('3');
  await page.locator('#planRangeTo').fill('8');
  await page.click('#planSelectRange');
  const boxes=page.locator('#planWordPicker [data-plan-row]');
  assert(await boxes.nth(1).isChecked()===false&&await boxes.nth(2).isChecked()&&await boxes.nth(7).isChecked()&&await boxes.nth(8).isChecked()===false,'von-bis selection checks exactly the requested inclusive range');
  await page.locator('#testPlanDate').fill(await page.evaluate(()=>datePlusDays(7)));
  assert((await page.locator('#planSelectionCount').textContent())?.startsWith('6 '),'selection counter follows the range selection');
  const preview=await page.locator('#planDailyPreview').textContent();
  assert(preview?.includes('6 ausgewählt')&&preview?.includes('Test in 7 Tagen'),'preview shows the exact selected vocabulary count and calendar distance to the test');
  assert(preview?.includes('3 neue Wörter')&&preview?.includes('8 Kontakte'),'preview uses the same adaptive pacing formula as the daily plan');
  await page.click('#saveTestPlan');
  await page.waitForSelector('#parentView.active');

  const saved=await page.evaluate(()=>{
    const ctx=upcomingTestContext('english');
    const set=ctx?.sets?.[0];
    const plan=buildDailyPlan('english');
    return {count:ctx?.words?.length||0,days:ctx?.days,mode:set?.testScopeMode||'',selected:set?.testSelectedLinkIds?.length||0,title:set?.title||'',links:set?setWords(set.id).length:0,intro:plan.introCount,target:plan.dailyTarget,acquisitionDays:plan.acquisitionDays};
  });
  assert(saved.count===6&&saved.days===7&&saved.mode==='selected'&&saved.selected===6&&saved.links>=6,'test plan keeps exact vocabulary count and exact test-day distance');
  assert(saved.intro===3&&saved.target===8&&saved.acquisitionDays===6,'saved daily plan matches the preview and adapts workload to the available time');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer unified content planner UI smoke: passed');
}finally{
  await browser.close();
}
