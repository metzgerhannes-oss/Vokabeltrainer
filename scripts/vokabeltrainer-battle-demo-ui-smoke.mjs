import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'no-preference'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(value,message)=>{if(!value)throw new Error('Battle demo smoke failed: '+message)};

try{
  const response=await page.goto(base+'/battle-demo.html?autoplay=0',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'battle demo loads');
  await page.waitForFunction(()=>window.VTBattleArt?.ready===true);
  await page.waitForFunction(()=>document.querySelector('#battleDemoStage')?.classList.contains('battle-art-ready'));

  const visible=await page.evaluate(()=>{
    const stage=document.querySelector('#battleDemoStage');
    const background=stage?.querySelector('.battle-art-background');
    const army=stage?.querySelector('.battle-art-army');
    const fortress=stage?.querySelector('.battle-art-fortress');
    const sky=stage?.querySelector('.battle-sky');
    const dock=document.querySelector('.battle-demo-action-dock');
    const rect=stage?.getBoundingClientRect();
    return {
      artMounted:!!stage?.querySelector('[data-battle-art-stack]'),
      backgroundOpacity:background?parseFloat(getComputedStyle(background).opacity||'0'):0,
      armyOpacity:army?parseFloat(getComputedStyle(army).opacity||'0'):0,
      fortressOpacity:fortress?parseFloat(getComputedStyle(fortress).opacity||'0'):0,
      naturalWidth:background?.naturalWidth||0,
      naturalHeight:background?.naturalHeight||0,
      skyOpacity:sky?parseFloat(getComputedStyle(sky).opacity||'1'):1,
      stageRatio:rect&&rect.width?rect.height/rect.width:0,
      dockPosition:dock?getComputedStyle(dock).position:'',
      summaryCount:document.querySelectorAll('.battle-demo-summary').length,
      genericImpactOpacity:parseFloat(getComputedStyle(stage.querySelector('.battle-impact')||stage).opacity||'0')
    };
  });
  assert(visible.artMounted,'painted scene stack is mounted');
  assert(visible.backgroundOpacity>=0.95&&visible.armyOpacity>=0.95&&visible.fortressOpacity>=0.95,'painted background, army and fortress layers are visibly rendered');
  assert(visible.naturalWidth>0&&visible.naturalHeight>0,'painted scene image is loaded');
  assert(visible.skyOpacity===0,'fallback sky is hidden when painted scene is ready');
  assert(visible.stageRatio>0.5&&visible.stageRatio<0.72,'mobile stage keeps a cinematic landscape ratio');
  assert(visible.dockPosition==='static','action dock does not overlap the result as a fixed layer');
  assert(visible.summaryCount===0,'oversized attacker/target summary card is removed');
  assert(visible.genericImpactOpacity===0,'legacy generic impact artifact is suppressed');

  await page.locator('#battleDemoStart').click();
  await page.waitForFunction(()=>document.querySelector('#battleDemoStage')?.dataset.phase==='advance');
  await page.waitForFunction(()=>document.querySelector('#battleDemoStage')?.dataset.phase==='barrage');
  await page.waitForFunction(()=>document.querySelector('#battleDemoStage')?.dataset.phase==='impact');

  const impact=await page.evaluate(()=>{
    const stage=document.querySelector('#battleDemoStage');
    const flash=stage?.querySelector('.battle-demo-impact-flash');
    const callout=stage?.querySelector('.battle-demo-impact-callout');
    return {
      flashAnimation:flash?getComputedStyle(flash).animationName:'',
      calloutVisible:callout?parseFloat(getComputedStyle(callout).opacity||'0')>0:false,
      legacyImpactOpacity:parseFloat(getComputedStyle(stage?.querySelector('.battle-impact')||stage).opacity||'0')
    };
  });
  assert(impact.flashAnimation.includes('demoImpactFlash'),'clean dedicated impact flash runs');
  assert(impact.calloutVisible,'impact callout is visible during the hit');
  assert(impact.legacyImpactOpacity===0,'legacy impact artifact stays hidden during impact');

  await page.waitForFunction(()=>document.querySelector('#battleDemoStage')?.dataset.phase==='result');
  const result=await page.evaluate(()=>({
    title:document.querySelector('#battleDemoCinematicTitle')?.textContent?.trim()||'',
    message:document.querySelector('#battleDemoMessage')?.textContent?.trim()||'',
    calloutOpacity:parseFloat(getComputedStyle(document.querySelector('.battle-demo-impact-callout')).opacity||'0')
  }));
  assert(result.title.includes('Festung')&&result.message.includes('Festung bezwungen'),'result phase is explicit and readable');
  assert(result.calloutOpacity===0,'hit callout does not linger into the result');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle demo smoke: passed');
}finally{
  await browser.close();
}
