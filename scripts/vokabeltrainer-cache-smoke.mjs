import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('sw.js','utf8');
const listeners={};
const store=new Map();
const keyOf=input=>typeof input==='string'?input:input.url;

class MockCache{
  constructor(){this.entries=new Map()}
  async match(request){const hit=this.entries.get(keyOf(request));return hit?hit.clone():undefined}
  async put(request,response){this.entries.set(keyOf(request),response.clone())}
  async keys(){return [...this.entries.keys()].map(url=>new Request(url))}
  async addAll(){return undefined}
}
const cachesMock={
  async open(name){if(!store.has(name))store.set(name,new MockCache());return store.get(name)},
  async keys(){return [...store.keys()]},
  async delete(name){return store.delete(name)},
  async match(request){for(const cache of store.values()){const hit=await cache.match(request);if(hit)return hit}return undefined}
};

let networkCalls=0;
let networkMode='throw';
const context=vm.createContext({
  console,URL,Request,Response,Promise,Map,Set,
  caches:cachesMock,
  fetch:async request=>{
    networkCalls++;
    if(networkMode==='throw')throw new Error('offline');
    return new Response(networkMode,{status:200});
  },
  self:{
    location:new URL('https://example.test/Vokabeltrainer/sw.js'),
    addEventListener:(type,handler)=>{listeners[type]=handler},
    skipWaiting:async()=>{},
    clients:{claim:async()=>{}}
  }
});
vm.runInContext(source,context,{filename:'sw.js'});

const assert=(condition,message)=>{if(!condition)throw new Error('Cache smoke failed: '+message)};
const legacyBase='https://example.test/JohannasGartenwelt/vokabeltrainer/';
const currentBase='https://example.test/Vokabeltrainer/';
const legacyName='vokabeltrainer-v0.9.16-subject-system-hardened';
const resourceName='vokabeltrainer-resources-v1';
const jgwName='jgw-shell-v5';
const unrelatedName='other-app-cache';

const existingResources=await cachesMock.open(resourceName);
await existingResources.put(new Request(legacyBase+'dict/wikidict/en-de/aa.json?v=1'),new Response('DICT-OLD-PATH'));
const legacy=await cachesMock.open(legacyName);
await legacy.put(new Request(legacyBase+'ocr/lang/eng.traineddata'),new Response('OCR-V1'));
await legacy.put(new Request(legacyBase+'js/core.js?v=0.9.16'),new Response('OLD-SHELL'));
await cachesMock.open(jgwName);
await cachesMock.open(unrelatedName);

let activation;
listeners.activate({waitUntil:p=>{activation=p}});
await activation;

const keys=await cachesMock.keys();
assert(keys.includes(jgwName),'activation must preserve the Gartenwelt cache');
assert(keys.includes(unrelatedName),'activation must preserve unrelated origin caches');
assert(!keys.includes(legacyName),'legacy Vokabeltrainer shell cache should be removed after migration');
assert(keys.includes(resourceName),'resource cache revision must survive app/repository migration');

const resources=await cachesMock.open(resourceName);
assert((await (await resources.match(new Request(currentBase+'ocr/lang/eng.traineddata'))).text())==='OCR-V1','legacy OCR data must map to new repository path');
assert((await (await resources.match(new Request(currentBase+'dict/wikidict/en-de/aa.json?v=1'))).text())==='DICT-OLD-PATH','existing persistent resources must map from old to new repository path');

let responsePromise;
networkCalls=0;networkMode='throw';
listeners.fetch({request:new Request(currentBase+'ocr/lang/eng.traineddata'),respondWith:p=>{responsePromise=p}});
let response=await responsePromise;
assert(await response.text()==='OCR-V1','migrated OCR resource must work offline');
assert(networkCalls===0,'migrated persistent resource must not hit network');

networkCalls=0;networkMode='DICT-NEW';
const newShard=currentBase+'dict/wikidict/de-en/ab.json?v=1';
listeners.fetch({request:new Request(newShard),respondWith:p=>{responsePromise=p}});
response=await responsePromise;
assert(await response.text()==='DICT-NEW','new dictionary resource should load from network');
assert(networkCalls===1,'new dictionary resource should fetch exactly once');

networkMode='throw';
listeners.fetch({request:new Request(newShard),respondWith:p=>{responsePromise=p}});
response=await responsePromise;
assert(await response.text()==='DICT-NEW','newly fetched dictionary resource must survive offline reuse');
assert(networkCalls===1,'second dictionary request must come from persistent cache');

assert(!source.includes("keys.filter(key=>key!==CACHE)"),'service worker must never delete every other origin cache');
assert(source.includes("LEGACY_APP_BASES=['/JohannasGartenwelt/vokabeltrainer/']"),'old repository path must remain an explicit migration source');
assert(source.includes('migratePersistentResourcePaths()'),'persistent resource cache must be path-migrated');

console.log('Vokabeltrainer cache smoke: passed');
console.log('✓ foreign origin caches are preserved');
console.log('✓ old repository cache URLs map to the new repository');
console.log('✓ OCR and dictionary resources remain cache-first');
