import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const assert=(v,m)=>{if(!v)throw new Error('Deep UI audit failed: '+m)};

async function seed(page){
  await page.evaluate(()=>{
    state=defaultState();
    const set={id:'audit_set',learnerId:'learner_demo',subject:'english',title:'Audit Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'Audit Unit',testDate:datePlusDays(6),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
    state.sets.push(set);
    const rows=[
      ['window','Fenster','Open the window, please.'],
      ['write','schreiben','Please write your name.'],
      ['friendly','freundlich','She is very friendly.'],
      ['playground','Spielplatz','We meet at the playground.'],
      ['look','anschauen','Look at the picture.'],
      ['school','Schule','Our school is nearby.']
    ];
    rows.forEach(([term,translation,example])=>attachVocabularyToSet(set.id,{term,translation,example,source:'audit',verified:true,firstContactCopiedAt:'test',firstContactRecalledAt:'test',firstContactCompletedAt:'test'}));
    rebuildWordIndexes();renderAll();showView('homeView');
  });
}

async function noOverflow(page,label){
  const m=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:window.innerWidth,bw:document.body.scrollWidth}));
  assert(m.sw<=m.iw+2&&m.bw<=m.iw+2,label+' has horizontal overflow: '+JSON.stringify(m));
}
async function targetSize(page,selector,label){
  const items=await page.locator(selector).evaluateAll(els=>els.filter(el=>{
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0;
  }).map(el=>{const r=el.getBoundingClientRect();return {w:r.width,h:r.height,text:(el.getAttribute('aria-label')||el.textContent||'').trim().slice(0,80)}}));
  assert(items.length>0,label+' has no visible targets');
  for(const item of items)assert(item.w>=43.5&&item.h>=43.5,label+' target smaller than 44px: '+JSON.stringify(item));
}

try{
  const widths=[320,375,390,820,1440];
  for(const width of widths){
    const page=await browser.newPage({viewport:{width,height:width>=1000?900:844},reducedMotion:'reduce'});
    const errors=[];page.on('pageerror',e=>errors.push(String(e?.message||e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
    const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
    assert(response?.ok(),'app loads at '+width+'px');
    await page.waitForFunction(()=>typeof state==='object'&&typeof renderAll==='function'&&typeof window.VTFamilySync?.status==='function');
    await seed(page);

    await page.waitForSelector('#homeView.active');
    await noOverflow(page,'home '+width);
    await targetSize(page,'.bottom-nav .nav-btn','navigation '+width);
    await targetSize(page,'#quickLearnHeroBtn','today CTA '+width);

    await page.click('.nav-btn[data-view="practiceView"]');
    await page.waitForSelector('#practiceView.active');
    assert(await page.locator('.practice-path').count()===4,'practice hub has exactly four routes at '+width);
    await noOverflow(page,'practice '+width);
    await targetSize(page,'.practice-path','practice paths '+width);
    await page.click('#practiceSpecialBtn');
    await page.waitForFunction(()=>!document.querySelector('#optionalLearningCard')?.classList.contains('hidden'));
    await noOverflow(page,'special training '+width);

    await page.click('.nav-btn[data-view="childProgressView"]');
    await page.waitForSelector('#childProgressView.active');
    await noOverflow(page,'progress '+width);

    await page.evaluate(()=>window.VTArmyUi?.open?.());
    await page.waitForSelector('#armyView.active');
    await noOverflow(page,'army '+width);

    if(width===375){
      await page.evaluate(()=>{
        localStorage.setItem('vokabeltrainer_family_sync_v1',JSON.stringify({enabled:true,familyId:'family_a1b2c3d4e5f6',deviceId:'device_audit_child',deviceSecret:'x'.repeat(64),role:'child',profileId:'learner_demo',revisions:{},dirtyKeys:[],conflicts:{},lastSync:''}));
        appRole='child';showView('homeView');applyRoleUi();
      });
      assert(await page.locator('#parentAreaBtn').evaluate(el=>el.classList.contains('hidden')),'paired child device hides parent entry');
      const gate=await page.evaluate(()=>({entered:enterParentMode('parentView'),parent:isParentMode(),parentActive:document.querySelector('#parentView')?.classList.contains('active')}));
      assert(gate.entered===false&&!gate.parent&&!gate.parentActive,'paired child device cannot enter parent mode');
      await page.evaluate(()=>showView('settingsView'));
      assert(await page.locator('#homeView').evaluate(el=>el.classList.contains('active')),'direct parent-view navigation is redirected on paired child device');

      await page.evaluate(()=>{
        localStorage.removeItem('vokabeltrainer_family_sync_v1');appRole='child';applyRoleUi();enterParentMode('libraryView');renderAll();
      });
      await page.waitForSelector('#libraryView.active');
      await page.waitForSelector('.library-audio-btn');
      await targetSize(page,'.library-audio-btn','library audio');
      const audioLabels=await page.locator('.library-audio-btn').evaluateAll(els=>els.every(el=>(el.getAttribute('aria-label')||'').trim().length>0));
      assert(audioLabels,'library audio buttons have accessible labels');
      await noOverflow(page,'library 375');
    }

    assert(errors.length===0,'browser errors at '+width+'px: '+errors.join(' | '));
    await page.close();
  }

  console.log('Vokabeltrainer deep responsive UI audit: passed');
  console.log('✓ 320/375/390/820/1440 px without horizontal overflow');
  console.log('✓ primary child and audio targets are at least 44×44 px');
  console.log('✓ paired child device cannot enter parent administration');
}finally{
  await browser.close();
}
