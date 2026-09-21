'use strict';

const APP_VERSION='0.12.4';
const RESOURCE_REVISION='1';
const SHELL_CACHE=`vokabeltrainer-shell-v${APP_VERSION}`;
const RESOURCE_CACHE=`vokabeltrainer-resources-v${RESOURCE_REVISION}`;
const SHELL_CACHE_PREFIX='vokabeltrainer-shell-';
const RESOURCE_CACHE_PREFIX='vokabeltrainer-resources-';
const LEGACY_CACHE_PREFIX='vokabeltrainer-v';
const LEGACY_APP_BASES=['/JohannasGartenwelt/vokabeltrainer/'];

const ASSETS=[
  './','./index.html','./css/app.css?v=0.12.4','./js/core.js?v=0.12.4','./js/help.js?v=0.12.4','./js/library.js?v=0.12.4','./js/storage.js?v=0.12.4',
  './js/model.js?v=0.12.4','./js/quiz-engine.js?v=0.12.4','./js/learning.js?v=0.12.4','./js/translation.js?v=0.12.4',
  './js/io.js?v=0.12.4','./js/ui.js?v=0.12.4','./js/library-ui.js?v=0.12.4','./js/focus-ui.js?v=0.12.4','./js/app.js?v=0.12.4','./manifest.webmanifest',
  './assets/icons/icon-180.png','./assets/icons/icon-192.png','./assets/icons/icon-512.png'
];

function appBasePath(){
  return new URL('./',self.location.href).pathname;
}

function persistentResourceRelative(url){
  if(url.origin!==self.location.origin)return '';
  const bases=[appBasePath(),...LEGACY_APP_BASES];
  for(const base of bases){
    if(url.pathname.startsWith(`${base}ocr/`)||url.pathname.startsWith(`${base}dict/wikidict/`)){
      return url.pathname.slice(base.length);
    }
  }
  return '';
}

function isPersistentResource(url){
  if(url.origin!==self.location.origin)return false;
  const base=appBasePath();
  return url.pathname.startsWith(`${base}ocr/`)||url.pathname.startsWith(`${base}dict/wikidict/`);
}

function currentResourceRequest(url){
  const relative=persistentResourceRelative(url);
  if(!relative)return null;
  const target=new URL(relative,self.location.href);
  target.search=url.search;
  return new Request(target.href);
}

function isOwnedObsoleteCache(key){
  if(key===SHELL_CACHE||key===RESOURCE_CACHE)return false;
  return key.startsWith(SHELL_CACHE_PREFIX)||key.startsWith(RESOURCE_CACHE_PREFIX)||key.startsWith(LEGACY_CACHE_PREFIX);
}

async function migrateCacheEntries(source,target){
  const requests=await source.keys();
  for(const request of requests){
    let url;try{url=new URL(request.url)}catch(_e){continue}
    const mapped=currentResourceRequest(url);
    if(!mapped)continue;
    if(await target.match(mapped))continue;
    const response=await source.match(request);
    if(response)await target.put(mapped,response.clone()).catch(()=>{});
  }
}

async function migratePersistentResourcePaths(){
  const target=await caches.open(RESOURCE_CACHE);
  await migrateCacheEntries(target,target);
}

async function migrateLegacyResources(){
  const names=await caches.keys();
  const legacy=names.filter(key=>key.startsWith(LEGACY_CACHE_PREFIX)&&key!==SHELL_CACHE&&key!==RESOURCE_CACHE);
  if(!legacy.length)return;
  const target=await caches.open(RESOURCE_CACHE);
  for(const name of legacy){
    await migrateCacheEntries(await caches.open(name),target);
  }
}

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(SHELL_CACHE);
  const requests=ASSETS.map(path=>new Request(new URL(path,self.location).href,{cache:'reload'}));
  await cache.addAll(requests);
  await self.skipWaiting();
})()));

self.addEventListener('activate',event=>event.waitUntil((async()=>{
  await migratePersistentResourcePaths();
  await migrateLegacyResources();
  const keys=await caches.keys();
  await Promise.all(keys.filter(isOwnedObsoleteCache).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));

async function persistentResourceResponse(request){
  const cache=await caches.open(RESOURCE_CACHE);
  const cached=await cache.match(request);
  if(cached)return cached;
  try{
    const response=await fetch(request,{cache:'reload'});
    if(response&&response.status===200)await cache.put(request,response.clone()).catch(()=>{});
    return response;
  }catch(err){
    return new Response('Offline',{status:503,statusText:'Offline'});
  }
}

async function navigationResponse(request){
  const shell=await caches.open(SHELL_CACHE);
  try{
    const response=await fetch(request,{cache:'no-cache'});
    if(response&&response.ok)await shell.put(request,response.clone()).catch(()=>{});
    return response;
  }catch(err){
    return (await shell.match(request))||(await shell.match(new URL('./index.html',self.location).href))||Response.error();
  }
}

async function shellResponse(request){
  const shell=await caches.open(SHELL_CACHE);
  const cached=await shell.match(request);
  if(cached)return cached;
  try{
    const response=await fetch(request);
    if(response&&response.status===200)await shell.put(request,response.clone()).catch(()=>{});
    return response;
  }catch(err){
    return new Response('Offline',{status:503,statusText:'Offline'});
  }
}

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;
  if(isPersistentResource(url)){
    event.respondWith(persistentResourceResponse(request));
    return;
  }
  if(request.mode==='navigate'){
    event.respondWith(navigationResponse(request));
    return;
  }
  event.respondWith(shellResponse(request));
});
