import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(15000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('B-013 story 3D spike failed: '+m)};

try{
  const index=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded'});
  assert(index?.ok(),'main app loads');
  const mainScripts=await page.evaluate(()=>Array.from(document.scripts).map(s=>s.src).join('\n'));
  assert(!mainScripts.includes('three-r186'),'main app does not eagerly load Three.js');

  const response=await page.goto(base+'/story-3d-spike.html?subject=english',{waitUntil:'domcontentloaded'});
  assert(response?.ok(),'isolated spike page loads');
  await page.waitForFunction(()=>document.querySelector('#story3dMount')?.dataset.story3d==='three',null,{timeout:15000});

  const start=await page.evaluate(()=>({
    renderer:document.querySelector('#story3dMount')?.dataset.story3d||'',
    reduced:document.querySelector('#story3dMount')?.dataset.reducedMotion||'',
    canvas:document.querySelectorAll('#story3dMount canvas').length,
    skip:document.querySelectorAll('.story3d-skip').length,
    status:document.querySelector('#story3dStatus')?.textContent||''
  }));
  assert(start.renderer==='three','Three.js renderer starts');
  assert(start.reduced==='true','reduced-motion preference reaches the renderer');
  assert(start.canvas===1,'renderer creates exactly one WebGL canvas');
  assert(start.skip===1,'scene exposes a visible skip action');

  await page.locator('.story3d-skip').click();
  await page.waitForFunction(()=>document.querySelector('#story3dMount')?.dataset.story3dState==='skipped');
  assert((await page.locator('#story3dStatus').textContent())==='übersprungen','skip exits without waiting for the scene');

  await page.locator('#replay').click();
  await page.waitForFunction(()=>document.querySelector('#story3dMount')?.dataset.story3dState==='complete',null,{timeout:6000});
  const complete=await page.evaluate(()=>({
    state:document.querySelector('#story3dMount')?.dataset.story3dState||'',
    fps:Number(document.querySelector('#story3dMount')?.dataset.story3dAvgFps||0),
    status:document.querySelector('#story3dStatus')?.textContent||'',
    subject:document.querySelector('#story3dMount')?.dataset.story3dSubject||''
  }));
  assert(complete.state==='complete','replayed reveal reaches a deterministic completion state');
  assert(complete.status==='fertig','completion returns control to the host page');
  assert(complete.subject==='english','scene receives only the visual subject identity');
  assert(complete.fps>0,'technical spike records a browser FPS sample without treating it as real-device acceptance');

  const source=await (await fetch(base+'/js/story-3d/story-scene-renderer.js')).text();
  for(const forbidden of ['refreshMastery(','grantBattleTicket(','spendBattleTicket(','resolveTestFortressAction(','persistOnly(','saveState(']){
    assert(!source.includes(forbidden),'3D renderer never calls '+forbidden);
  }
  assert(errors.length===0,'spike produces no browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer B-013 Story 3D spike: passed');
}finally{
  await browser.close();
}
