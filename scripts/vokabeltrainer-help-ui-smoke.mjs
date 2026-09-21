import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const errors=[];
const assert=(value,message)=>{if(!value)throw new Error('Help UI smoke failed: '+message)};
const capture=page=>{page.on('pageerror',e=>errors.push(String(e?.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())})};

try{
  const desktop=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await desktop.newPage();
  capture(page);
  let response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'desktop app loads');
  assert(await page.locator('#homeView [data-help]').count()===0,'child home stays free of contextual-help clutter');
  assert(await page.locator('#childProgressView [data-help]').count()===0,'child progress stays free of contextual-help clutter');
  await page.click('#helpBtn');
  await page.waitForSelector('#modal[open]');
  let text=await page.locator('#modalContent').textContent();
  assert(text?.includes('Heute')&&text?.includes('Erfolge')&&text?.includes('Du musst nichts verwalten'),'child help explains only the child path');
  await page.locator('#modal').evaluate(el=>el.close());

  await page.click('#parentAreaBtn');
  await page.waitForSelector('#modal[open] #confirmParentMode');
  await page.click('#confirmParentMode');
  await page.waitForSelector('#parentView.active');
  assert(await page.locator('body.parent-mode').count()===1,'parent mode is visibly active');
  await page.click('#parentLibraryBtn');
  await page.waitForSelector('#libraryView.active [data-help="library"]');
  await page.hover('#libraryView [data-help="library"]');
  await page.waitForSelector('#helpPopover:not([hidden])');
  text=await page.locator('#helpPopover').textContent();
  assert(text?.includes('Vokabelbibliothek'),'parent contextual help remains available');
  await desktop.close();

  const mobile=await browser.newContext(devices['iPhone 13']);
  const phone=await mobile.newPage();
  capture(phone);
  response=await phone.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'mobile app loads');
  assert(await phone.locator('#homeView [data-help]').count()===0,'mobile child home has no help clutter');
  await phone.click('#helpBtn');
  await phone.waitForSelector('#modal[open]');
  text=await phone.locator('#modalContent').textContent();
  assert(text?.includes('Heute')&&text?.includes('Lernen')&&text?.includes('Erfolge'),'mobile child help is short and role-specific');
  await phone.locator('#modal').evaluate(el=>el.close());

  await phone.click('#parentAreaBtn');
  await phone.waitForSelector('#modal[open] #confirmParentMode');
  await phone.click('#confirmParentMode');
  await phone.waitForSelector('#parentView.active');
  await phone.click('#parentLibraryBtn');
  await phone.waitForSelector('#libraryView.active [data-help="library"]');
  await phone.click('#libraryView [data-help="library"]');
  await phone.waitForSelector('#helpPopover:not([hidden])');
  assert(await phone.locator('#helpPopover [data-help-close]').isVisible(),'mobile contextual help has an explicit close button');
  await phone.click('#helpPopover [data-help-close]');
  assert(await phone.locator('#helpPopover').evaluate(el=>el.hidden),'mobile contextual help closes via close button');

  await phone.click('#libraryView [data-help="library"]');
  await phone.waitForSelector('#helpPopover:not([hidden])');
  await phone.tap('#librarySearchInput');
  assert(await phone.locator('#helpPopover').evaluate(el=>el.hidden),'mobile contextual help closes when tapping outside');
  await mobile.close();

  const fatal=errors.filter(x=>/ReferenceError|TypeError|SyntaxError|Content Security Policy|Refused to/i.test(x));
  if(fatal.length)throw new Error(fatal.join(' | '));
  console.log('Vokabeltrainer help UI smoke: passed');
}finally{
  await browser.close();
}
