import { chromium, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const hardStop=setTimeout(()=>{console.error('FATAL_VOKABELTRAINER_SW_BROWSER_TIMEOUT');process.exit(1)},45000);
const browser=await chromium.launch({headless:true});
const context=await browser.newContext(devices['Desktop Chrome']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
page.setDefaultNavigationTimeout(15000);
const errors=[];
page.on('pageerror',err=>errors.push(String(err?.message||err)));
page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
const assert=(condition,message)=>{if(!condition)throw new Error('Vokabeltrainer SW browser smoke failed: '+message)};
const fetchWithTimeout=async relative=>page.evaluate(async url=>{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),7000);
  try{
    const response=await fetch(url,{signal:controller.signal});
    return {ok:response.ok,text:await response.text(),status:response.status};
  }catch(error){
    return {ok:false,text:String(error),status:0};
  }finally{clearTimeout(timer)}
},relative);

try{
  await page.goto(base+'/manifest.webmanifest',{waitUntil:'commit'});
  const foreignCacheName='jgw-shell-v5';
  await page.evaluate(async cacheName=>{
    const cache=await caches.open(cacheName);
    await cache.put(new Request(location.origin+'/__vocab_cache_sentinel__'),new Response('keep-me'));
  },foreignCacheName);

  const workerPromise=context.waitForEvent('serviceworker',{timeout:12000});
  await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  const worker=await workerPromise;
  if(!new URL(worker.url()).pathname.endsWith('/sw.js'))throw new Error('unexpected worker '+worker.url());

  await page.evaluate(async()=>{
    const registration=await navigator.serviceWorker.getRegistration('./');
    if(registration?.active?.state==='activated'&&navigator.serviceWorker.controller?.scriptURL&&new URL(navigator.serviceWorker.controller.scriptURL).pathname.endsWith('/sw.js'))return;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('controllerchange timeout')),10000);
      navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timer);resolve()},{once:true});
    });
  });
  let controller=await page.evaluate(()=>navigator.serviceWorker.controller?.scriptURL||'');
  if(!controller||!new URL(controller).pathname.endsWith('/sw.js')){
    await page.reload({waitUntil:'domcontentloaded'});
    controller=await page.evaluate(()=>navigator.serviceWorker.controller?.scriptURL||'');
  }
  if(!controller||!new URL(controller).pathname.endsWith('/sw.js'))throw new Error('service worker does not control app');

  const online=await fetchWithTimeout('./dict/wikidict/en-de/0_.json?v=1');
  if(!(online.ok&&online.text.includes('"0"')))throw new Error('dictionary shard failed online');

  const cacheState=await page.evaluate(async foreignName=>{
    const keys=await caches.keys();
    const foreign=await caches.open(foreignName);
    const sentinel=await foreign.match(new Request(location.origin+'/__vocab_cache_sentinel__'));
    return {keys,sentinel:sentinel?await sentinel.text():''};
  },foreignCacheName);
  if(!cacheState.keys.includes(foreignCacheName)||cacheState.sentinel!=='keep-me')throw new Error('foreign cache was touched');
  if(!cacheState.keys.includes('vokabeltrainer-shell-v0.9.19'))throw new Error('shell cache missing');
  if(!cacheState.keys.includes('vokabeltrainer-resources-v1'))throw new Error('resource cache missing');

  await context.setOffline(true);
  const offline=await fetchWithTimeout('./dict/wikidict/en-de/0_.json?v=1');
  if(!(offline.ok&&offline.text.includes('"0"')))throw new Error('dictionary shard failed offline');
  await context.setOffline(false);

  const fatal=errors.filter(x=>/ReferenceError|TypeError|SyntaxError|Content Security Policy/i.test(x));
  if(fatal.length)throw new Error(fatal.join(' | '));
  console.log('Vokabeltrainer service-worker browser smoke: passed');
}finally{
  await context.setOffline(false).catch(()=>{});
  await browser.close().catch(()=>{});
  clearTimeout(hardStop);
}
