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
  const fatal=[...pageErrors,...consoleErrors].filter(x=>/ReferenceError|TypeError|SyntaxError|Content Security Policy/i.test(x));
  if(fatal.length)throw new Error(fatal.join(' | '));
  console.log('Vokabeltrainer WebKit iPhone smoke: passed');
}finally{
  await browser.close();
}
