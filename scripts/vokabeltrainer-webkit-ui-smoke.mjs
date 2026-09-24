import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const consoleErrors=[];
const pageErrors=[];
page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
page.on('pageerror',err=>pageErrors.push(String(err?.message||err)));

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  if(!response?.ok())throw new Error('HTTP '+(response?.status()||'no response'));
  const title=await page.title();
  if(!/Vokabeltrainer/i.test(title))throw new Error('unexpected title: '+title);
  const html=await page.content();
  if(!/Vokabeltrainer|Lernen|Lern/i.test(html))throw new Error('app content missing');

  // Regression: a compact iPhone must expose the child-device path directly.
  await page.setViewportSize({width:375,height:667});
  await page.locator('#parentAreaBtn').click();
  await page.locator('#confirmParentMode').click();
  await page.locator('#parentSettingsBtn').click();
  await page.locator('#familySyncSetupBtn').click();
  await page.locator('#familySyncChildJoinChoiceBtn').waitFor({state:'visible'});
  if((await page.locator('#familySyncChildJoinChoiceBtn').textContent())?.trim()!=='Kindergerät verbinden')throw new Error('child-device choice missing');
  if(!/Weiteres Eltern-Gerät verbinden/.test(await page.locator('#familySyncJoinChoiceBtn').textContent()||''))throw new Error('parent-device choice not clearly separated');
  const setupDialog=await page.locator('#modal').evaluate(el=>({overflowY:getComputedStyle(el).overflowY,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}));
  if(!['auto','scroll'].includes(setupDialog.overflowY))throw new Error('setup dialog is not vertically scrollable on compact iPhone');
  if(setupDialog.clientHeight>667)throw new Error('setup dialog exceeds compact iPhone viewport');

  await page.locator('#familySyncChildJoinChoiceBtn').click();
  await page.locator('#familyChildJoinInput').waitFor({state:'visible'});
  await page.locator('#familyChildJoinBtn').waitFor({state:'visible'});
  if(!/Verbindungslink oder Gerätecode/.test(await page.locator('#modalContent').textContent()||''))throw new Error('child invite input guidance missing');

  // Regression: buttons inside an already-open dialog must remain tappable.
  await page.locator('#familyChildJoinInput').fill('kein-gueltiger-link');
  await page.locator('#familyChildJoinBtn').click();
  if(!/Bitte den Verbindungslink/.test(await page.locator('#familyChildJoinError').textContent()||''))throw new Error('child connect button did not react');
  await page.locator('#familySyncBackBtn').click();
  await page.locator('#familySyncChildJoinChoiceBtn').waitFor({state:'visible'});

  const fatal=[...pageErrors,...consoleErrors].filter(x=>/ReferenceError|TypeError|SyntaxError|Content Security Policy|InvalidStateError|DOMException/i.test(x));
  if(fatal.length)throw new Error(fatal.join(' | '));
  console.log('Vokabeltrainer WebKit iPhone smoke: passed');
}finally{
  await browser.close();
}
