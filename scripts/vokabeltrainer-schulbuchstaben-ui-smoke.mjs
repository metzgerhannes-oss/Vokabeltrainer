import {webkit} from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
const assert=(v,m)=>{if(!v)throw new Error('Schulbuchstaben UI smoke failed: '+m)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTGermanFoundation);
  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['german'];learner().gradeLevel='1';state.activeSubject='german';
    renderAll();showView('practiceView');
  });
  await page.waitForSelector('#practiceView.active #germanSchoolNext');
  assert((await page.locator('#germanFoundationCard').textContent()).includes('Welche Buchstaben wurden schon gelernt?'),'first German visit asks for already learned letters');
  assert(await page.locator('[data-german-stage]').count()===0,'no unrestricted foundational exercises before setup');
  for(const key of ['A','L','O','T'])await page.click('[data-school-letter="'+key+'"]');
  await page.click('#germanSchoolNext');
  assert((await page.locator('#germanFoundationCard').textContent()).includes('Welche Buchstaben werden gerade gelernt?'),'second setup asks for current school letters');
  assert(await page.locator('[data-school-letter="A"]').isDisabled(),'already learned letters cannot accidentally be selected as current');
  await page.click('[data-school-letter="M"]');
  await page.click('#germanSchoolNext');
  const plan=await page.evaluate(()=>window.VTGermanFoundation.letterPlan());
  assert(plan.configured&&plan.current.join(',')==='M'&&plan.learned.join(',')==='A,L,O,T','school letters are saved separately by status');
  assert(await page.locator('[data-german-stage]').count()===5,'five foundation stations remain visible');
  assert((await page.locator('.german-letter-plan-summary').textContent()).includes('Gerade dran: M'),'saved school scope is shown and editable');
  await page.evaluate(()=>window.VTGermanFoundation.open('handwriting'));
  await page.waitForSelector('#learnView.active #foundationTraceCanvas');
  assert((await page.locator('.foundation-letter-pair').textContent()).includes('M m'),'first handwriting task starts with the new school letter M');
  await page.evaluate(()=>{showView('practiceView');renderAll()});
  await page.click('#germanSchoolEdit');
  assert(await page.locator('[data-school-letter="O"]').getAttribute('aria-pressed')==='true','editing retains the learned-letter selection');
  await page.click('[data-school-letter="O"]');
  await page.click('#germanSchoolNext');
  await page.click('#germanSchoolNext');
  const filtered=await page.evaluate(()=>({
    plan:window.VTGermanFoundation.letterPlan(),
    words:window.VTGermanFoundation.stageTasks('words').map(x=>x.word),
    sentences:window.VTGermanFoundation.stageTasks('sentences').map(x=>x.sentence)
  }));
  assert(!filtered.plan.learned.includes('O')&&filtered.words.length===0,'a removed school letter immediately removes unlearnable words');
  assert(filtered.sentences.length===1&&filtered.sentences[0]==='Mama malt.','sentences are filtered on their exact required graphemes');
  await page.evaluate(()=>{
    const next={...defaultState().learners[0],id:'new-profile',name:'Weiteres Kind',activeSubjects:['german'],gradeLevel:'1',germanFoundation:defaultGermanFoundation()};
    state.learners.push(next);state.activeLearnerId=next.id;state.activeSubject='german';
    renderAll();showView('practiceView');
  });
  assert(await page.locator('#germanSchoolNext').isVisible(),'another learner starts with an independent school-letter prompt');
  assert((await page.locator('#germanLetterPlanSummary').textContent()).includes('0 schon gelernt'),'draft selection does not leak between children');
  const geometry=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:document.documentElement.clientWidth}));
  assert(geometry.scroll<=geometry.width+1,'setup fits iPhone width');
  assert(errors.length===0,'no page errors');
  console.log('Vokabeltrainer Schulbuchstaben UI smoke: passed');
}finally{await browser.close()}
