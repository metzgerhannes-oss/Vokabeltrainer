import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('B-018 free-writing UI smoke failed: '+m)};

async function drawAndFinish(){
  const canvas=page.locator('#foundationTraceCanvas');
  const box=await canvas.boundingBox();
  assert(!!box,'writing canvas is visible');
  await page.mouse.move(box.x+70,box.y+80);
  await page.mouse.down();
  await page.mouse.move(box.x+260,box.y+210,{steps:10});
  await page.mouse.up();
  assert(await page.locator('#foundationDrawDone').isEnabled(),'finger/stylus stroke enables free-practice completion');
  await page.click('#foundationDrawDone');
}

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&!!window.VTGermanFoundation);

  await page.evaluate(()=>{
    state=defaultState();
    learner().activeSubjects=['german'];
    learner().gradeLevel='1';
    state.activeSubject='german';
    renderAll();
    showView('practiceView');
  });
  await page.waitForSelector('#germanFoundationCard:not(.hidden)');
  assert(await page.locator('#germanFoundationFreeWritingBtn').count()===1,'learning hub exposes free writing');
  await page.click('#germanFoundationFreeWritingBtn');
  await page.waitForSelector('.foundation-free-selector');

  const before=await page.evaluate(()=>({
    foundation:JSON.stringify(learner().germanFoundation),
    xp:learner().xp,
    tickets:JSON.stringify(learner().battleTickets),
    words:state.learnerVocabulary.length
  }));

  for(const letter of ['A','E','M','S'])await page.click('[data-free-letter="'+letter+'"]');
  assert((await page.locator('#freeWritingSelectionSummary').textContent())?.includes('a, e, m, s'),'manual group selection shows a, e, m, s');
  await page.click('#freeWritingStart');

  const seen=[];
  for(let i=0;i<4;i++){
    await page.waitForSelector('.foundation-free-glyph');
    const glyph=(await page.locator('.foundation-free-glyph').textContent())?.trim();
    seen.push(glyph);
    assert(['a','e','m','s'].includes(glyph),'task stays inside manual lowercase selection');
    assert(await page.locator('.foundation-lineature-legend span').count()===3,'all three writing zones are visible');
    const labels=await page.locator('.foundation-lineature-legend').textContent();
    assert(labels.includes('Dachgeschoss')&&labels.includes('Erdgeschoss')&&labels.includes('Keller'),'Dachgeschoss, Erdgeschoss and Keller are named');
    assert(await page.locator('#foundationLetterSoundBtn').count()===1,'letter sound remains available');
    await drawAndFinish();
    await page.waitForTimeout(520);
  }
  assert(seen.join(',')==='a,e,m,s','group tasks contain exactly a, e, m, s');
  await page.waitForSelector('#freeWritingRepeat');
  const retained=await page.evaluate(()=>window.VTGermanFoundation.freeWritingState());
  assert(retained.selection.join(',')==='A,E,M,S'&&retained.caseMode==='lower','manual selection is retained after a round');

  const afterGroup=await page.evaluate(()=>({
    foundation:JSON.stringify(learner().germanFoundation),
    xp:learner().xp,
    tickets:JSON.stringify(learner().battleTickets),
    words:state.learnerVocabulary.length
  }));
  assert(JSON.stringify(before)===JSON.stringify(afterGroup),'free repetitions do not mutate foundation evidence, XP, tickets or vocabulary');

  await page.click('#freeWritingChoose');
  await page.click('#freeWritingReset');
  await page.click('[data-free-letter="M"]');
  await page.click('[data-free-case="pair"]');
  await page.click('#freeWritingStart');
  assert((await page.locator('.foundation-free-glyph').textContent())?.trim()==='M','M/m pair starts with M');
  await drawAndFinish();
  await page.waitForTimeout(520);
  assert((await page.locator('.foundation-free-glyph').textContent())?.trim()==='m','M/m pair continues with m');

  await page.evaluate(()=>window.VTGermanFoundation.openFreeWriting());
  await page.click('#freeWritingReset');
  await page.click('[data-free-letter="M"]');
  await page.click('[data-free-case="lower"]');
  await page.click('#freeWritingStart');
  assert((await page.locator('.foundation-free-glyph').textContent())?.trim()==='m','single-letter mode can practice only m');

  const layout=await page.evaluate(()=>({
    scrollWidth:document.documentElement.scrollWidth,
    clientWidth:document.documentElement.clientWidth,
    canvasWidth:document.querySelector('#foundationTraceCanvas')?.getBoundingClientRect().width||0,
    viewport:window.innerWidth
  }));
  assert(layout.scrollWidth<=layout.clientWidth+1,'free-writing selector and lineature stay overflow-free on small display');
  assert(layout.canvasWidth>0&&layout.canvasWidth<=layout.viewport,'writing canvas fits the iPhone viewport');
  assert(errors.length===0,'free-writing UI produces no browser errors: '+errors.join(' | '));
  console.log('B-018 free-writing UI smoke: passed');
}finally{
  await browser.close();
}
