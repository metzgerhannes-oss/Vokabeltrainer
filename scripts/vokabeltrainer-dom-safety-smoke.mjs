import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
const assert=(v,m)=>{if(!v)throw new Error('DOM safety smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof state==='object'&&typeof renderAll==='function'&&typeof attachVocabularyToSet==='function');

  const seeded=await page.evaluate(()=>{
    state=defaultState();
    state.learners[0].name='<img id="xss-profile" src=x>';
    const set={id:'xss_set',learnerId:'learner_demo',subject:'english',title:'<svg id="xss-set"></svg>',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:true,pairVerifiedAt:''};
    state.sets.push(set);
    const linked=attachVocabularyToSet(set.id,{term:'<img id="xss-term" src=x>',translation:'<iframe id="xss-trans"></iframe>',source:'photo-text-import',verified:false});
    rebuildWordIndexes();renderAll();
    return {vocabId:linked.vocab.id};
  });

  assert(await page.locator('#xss-profile,#xss-set,#xss-term,#xss-trans').count()===0,'user text must not become executable/rendered elements');
  assert((await page.locator('#profileBtn').textContent())?.includes('<img'),'profile name remains text');

  await page.evaluate(()=>enterParentMode('parentView'));
  await page.waitForSelector('#parentView.active');
  assert(await page.locator('#xss-profile,#xss-set,#xss-term,#xss-trans').count()===0,'parent overview escapes user content');

  await page.evaluate(()=>openSetPairAudit('xss_set'));
  await page.waitForSelector('#modal[open]');
  assert(await page.locator('#xss-profile,#xss-set,#xss-term,#xss-trans').count()===0,'pair review escapes OCR/user content');
  assert((await page.locator('#modal').textContent())?.includes('<img id="xss-term"'),'pair review shows literal term text');

  await page.evaluate(id=>{closeModal();openWordEditor(id)},seeded.vocabId);
  await page.waitForSelector('#modal[open]');
  assert(await page.locator('#xss-profile,#xss-set,#xss-term,#xss-trans').count()===0,'word editor escapes stored vocabulary content');
  assert((await page.locator('#wordTerm').inputValue()).includes('<img'),'word editor preserves literal value in input');

  assert(errors.length===0,'browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer DOM safety smoke: passed');
  console.log('✓ profile, set, OCR pair review and vocabulary editor escape stored user content');
}finally{
  await browser.close();
}
