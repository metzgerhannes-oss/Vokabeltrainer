import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Answer review UI smoke failed: '+m)};

async function submitAnswer(answer,{expectReview=true}={}){
  await page.evaluate(()=>{
    const w=setWords('review_set')[0];
    startSession('reverseRecall','review_set',[quizQueueRef(w)],false);
  });
  await page.waitForSelector('#answerField');
  await page.fill('#answerField',answer);
  await page.click('#answerBtn');
  if(expectReview)await page.waitForSelector('#answerReviewBtn');
  else await page.waitForSelector('#continueStudyBtn');
}
async function enterParent(){
  await page.evaluate(()=>{session=null;showView('homeView');renderAll()});
  await page.click('#parentAreaBtn');
  await page.waitForSelector('#modal[open] #confirmParentMode');
  await page.click('#confirmParentMode');
  await page.waitForSelector('#parentView.active');
}

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>typeof startSession==='function'&&typeof flagAnswerForParentReview==='function'&&typeof acceptAnswerReview==='function');
  await page.waitForFunction(()=>state!==null&&document.querySelector('#profileBtn')?.textContent!=='Profil');

  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'review_set',learnerId:'learner_demo',subject:'english',title:'Satztraining',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'source',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    attachVocabularyToSet(set.id,{term:'Nice to meet you.',translation:'Nett, dich kennen zu lernen.',source:'review-test',verified:true,firstContactCopiedAt:'x',firstContactRecalledAt:'x',firstContactCompletedAt:'x'});
    set.pairVerifiedSignature=pairReviewSignatureForSet(set.id);
    rebuildWordIndexes();renderAll();showView('homeView');
  });

  const before=await page.evaluate(()=>{const w=setWords('review_set')[0];return {failures:w.failures,successes:w.successes,independent:w.independentSuccesses,box:leitnerBox(w),retrieval:w.skills.retrieval,spelling:w.skills.spelling}});
  await submitAnswer('Schön, dich kennenzulernen.');
  const afterWrong=await page.evaluate(()=>{const w=setWords('review_set')[0];return {failures:w.failures,box:leitnerBox(w)}});
  assert(afterWrong.failures===before.failures+1,'initial system-wrong result applies the normal error before child disputes it');

  await page.click('#answerReviewBtn');
  const pending=await page.evaluate(()=>{const w=setWords('review_set')[0],r=pendingAnswerReviews()[0];return {failures:w.failures,successes:w.successes,independent:w.independentSuccesses,box:leitnerBox(w),retrieval:w.skills.retrieval,spelling:w.skills.spelling,count:pendingAnswerReviews().length,answer:r?.answer,status:r?.status,result:session.results.at(-1)}});
  assert(pending.count===1&&pending.status==='pending','child report creates one pending parent review');
  assert(pending.answer==='Schön, dich kennenzulernen.','reported answer is stored verbatim');
  assert(pending.failures===before.failures&&pending.successes===before.successes&&pending.independent===before.independent&&pending.box===before.box&&pending.retrieval===before.retrieval&&pending.spelling===before.spelling,'pending review restores the complete graded learning effect');
  assert(pending.result?.reviewPending===true&&pending.result?.correct===null,'session result becomes neutral pending review');
  assert((await page.locator('.feedback').textContent())?.includes('Kein Lernnachteil'),'child is explicitly told the disputed answer is neutral');

  await enterParent();
  const task=page.locator('[data-parent-answer-reviews]');
  assert(await task.isVisible(),'parent dashboard surfaces disputed answers');
  await task.click();
  await page.waitForSelector('#modal[open] [data-review-accept]');
  const reviewText=await page.locator('#modalContent').textContent();
  assert(reviewText?.includes('Schön, dich kennenzulernen.')&&reviewText?.includes('Nett, dich kennen zu lernen.'),'parent sees child answer and accepted target side by side');
  await page.click('[data-review-accept]');
  await page.waitForSelector('#parentView.active');
  const accepted=await page.evaluate(()=>{const w=setWords('review_set')[0],link=state.setVocabulary.find(x=>x.setId==='review_set'),r=state.answerReviews[0];return {status:r.status,variants:link.acceptedTranslationOverrides,failures:w.failures,successes:w.successes,independent:w.independentSuccesses}});
  assert(accepted.status==='accepted','parent approval resolves the request');
  assert(accepted.variants.includes('Schön, dich kennenzulernen.'),'approved answer becomes a local accepted translation variant');
  assert(accepted.failures===before.failures&&accepted.successes===before.successes+1&&accepted.independent===before.independent+1,'parent approval is retroactively counted as a correct active recall');

  await page.click('#childModeBtn');
  await page.waitForSelector('#homeView.active');
  await submitAnswer('Schön, dich kennenzulernen.',{expectReview:false});
  assert(!(await page.locator('#answerReviewBtn').count()),'approved variant is no longer graded wrong');
  assert((await page.locator('.feedback').textContent())?.includes('Richtig'),'approved variant grades correct on the next occurrence');

  await page.click('#continueStudyBtn');
  await page.evaluate(()=>{session=null;showView('homeView');renderAll()});
  await submitAnswer('Ganz falsche Antwort');
  await page.click('#answerReviewBtn');
  await enterParent();
  await page.click('[data-parent-answer-reviews]');
  await page.waitForSelector('#modal[open] [data-review-reject]');
  const failuresBeforeReject=await page.evaluate(()=>setWords('review_set')[0].failures);
  await page.click('[data-review-reject]');
  const rejected=await page.evaluate(()=>{const w=setWords('review_set')[0],r=state.answerReviews.find(x=>x.answer==='Ganz falsche Antwort');return {status:r?.status,failures:w.failures}});
  assert(rejected.status==='rejected'&&rejected.failures===failuresBeforeReject+1,'parent-confirmed system error applies exactly one fachlich relevant failure');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer answer review UI smoke: passed');
  console.log('✓ child can dispute wrong grading without learning penalty');
  console.log('✓ parent can approve a local answer variant and future grading learns it');
  console.log('✓ parent rejection applies the error only after confirmation');
}finally{
  await browser.close();
}
