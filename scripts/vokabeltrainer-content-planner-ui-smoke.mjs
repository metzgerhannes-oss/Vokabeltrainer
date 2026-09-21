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

  assert((await page.locator('#parentLibraryBtn').textContent())?.includes('Lernstoff festlegen'),'parent has one primary learning-content entry');
  await page.click('#parentLibraryBtn');
  await page.waitForSelector('#modal[open] #contentWordPicker');
  assert((await page.locator('#modalContent').textContent())?.includes('Welche Vokabeln soll das Kind lernen?'),'content flow hides technical set creation');
  assert(await page.locator('#contentWordPicker [data-book-row]').count()>0,'known book words are directly selectable');
  await page.locator('#modal').evaluate(el=>el.close());

  await page.click('#parentTestPlanBtn');
  await page.waitForSelector('#modal[open] #planWordPicker');
  const total=await page.locator('#planWordPicker [data-plan-row]').count();
  assert(total>6,'test planner exposes individual vocabulary choices');
  await page.click('#planSelectNone');
  const boxes=page.locator('#planWordPicker [data-plan-row]');
  for(let i=0;i<6;i++)await boxes.nth(i).check();
  await page.locator('#testPlanDate').fill(await page.evaluate(()=>datePlusDays(7)));
  assert((await page.locator('#planSelectionCount').textContent())?.startsWith('6 '),'selection counter follows the checked words');
  const preview=await page.locator('#planDailyPreview').textContent();
  assert(preview?.includes('6 ausgewählt')&&preview?.includes('neue Wörter pro Tag'),'daily learning preview is calculated before save');
  await page.click('#saveTestPlan');
  await page.waitForSelector('#parentView.active');

  const saved=await page.evaluate(()=>{
    const ctx=upcomingTestContext('english');
    const set=ctx?.sets?.[0];
    return {count:ctx?.words?.length||0,mode:set?.testScopeMode||'',selected:set?.testSelectedLinkIds?.length||0,title:set?.title||''};
  });
  assert(saved.count===6&&saved.mode==='selected'&&saved.selected===6,'saved test plan contains exactly the selected vocabulary');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer unified content planner UI smoke: passed');
}finally{
  await browser.close();
}
