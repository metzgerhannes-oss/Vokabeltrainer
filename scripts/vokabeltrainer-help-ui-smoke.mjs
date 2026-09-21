import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const errors=[];
const assert=(value,message)=>{if(!value)throw new Error('Help UI smoke failed: '+message)};

try{
  const desktop=await browser.newContext({viewport:{width:1280,height:800}});
  const page=await desktop.newPage();
  page.on('pageerror',e=>errors.push(String(e?.message||e)));
  let response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'desktop app loads');
  await page.waitForSelector('[data-help="mastery"]');
  await page.hover('[data-help="mastery"]');
  await page.waitForSelector('#helpPopover:not([hidden])');
  let text=await page.locator('#helpPopover').textContent();
  assert(text?.includes('Nachhaltig gemeistert'),'desktop mouseover shows contextual mastery help');
  await page.hover('#appTitle');
  await page.waitForFunction(()=>document.querySelector('#helpPopover')?.hidden===true);
  await desktop.close();

  const mobile=await browser.newContext(devices['iPhone 13']);
  const phone=await mobile.newPage();
  phone.on('pageerror',e=>errors.push(String(e?.message||e)));
  response=await phone.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'mobile app loads');
  await phone.waitForSelector('[data-help="dailyGoal"]');
  await phone.click('[data-help="dailyGoal"]');
  await phone.waitForSelector('#helpPopover:not([hidden])');
  text=await phone.locator('#helpPopover').textContent();
  assert(text?.includes('Tagesziel')&&text?.includes('automatisch'),'tap shows persistent contextual help on iPhone');
  const expanded=await phone.locator('[data-help="dailyGoal"]').getAttribute('aria-expanded');
  assert(expanded==='true','open touch help exposes its expanded state');
  await phone.click('[data-help="dailyGoal"]');
  await phone.waitForFunction(()=>document.querySelector('#helpPopover')?.hidden===true);

  await phone.click('#helpBtn');
  await phone.waitForSelector('#modal[open]');
  const modalText=await phone.locator('#modalContent').textContent();
  assert(modalText?.includes('So funktioniert der Vokabeltrainer'),'central help opens the short orientation');
  assert(modalText?.includes('Heute')&&modalText?.includes('Lernen')&&modalText?.includes('Mehr'),'orientation explains the three main areas');
  await phone.locator('#modal button[value="ok"]').click();
  assert(errors.length===0,'help interactions produce no browser errors: '+errors.join(' | '));
  await mobile.close();

  console.log('Vokabeltrainer help UI WebKit smoke: passed');
  console.log('✓ desktop mouseover shows contextual help');
  console.log('✓ iPhone tap opens and closes contextual help');
  console.log('✓ central help explains the main navigation');
}finally{
  await browser.close();
}
