import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const assert=(v,m)=>{if(!v)throw new Error('Start-page matrix failed: '+m)};

const expectedThemes={
  english:{adventure:'english-adventure',battle:'campaign'},
  latin:{adventure:'latin-adventure',battle:'roman'},
  german:{adventure:'german-adventure',battle:'wordrealm'},
  french:{adventure:'voyage',battle:'french-battle'}
};
const expectedSources={
  english:'final',
  latin:'approved-atlas',
  french:'approved-atlas'
};

const overlap=(a,b)=>{
  if(!a||!b)return 0;
  const w=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
  const h=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  return w*h;
};

for(const viewport of [{width:390,height:844,label:'iPhone'},{width:1200,height:800,label:'desktop'}]){
  const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
  const page=await context.newPage();
  page.setDefaultTimeout(12000);
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.message||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});

  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),viewport.label+' app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&window.VTMenuAvatarArt?.atlasReady===true&&!!window.VTMenuUi&&!!window.VTWordrealmUi);

  const results=[];
  for(const subject of Object.keys(expectedThemes)){
    for(const mode of ['adventure','battle']){
      const result=await page.evaluate(({subject,mode})=>{
        state=defaultState();
        const l=learner();
        l.activeSubjects=['english','latin','german','french'];
        l.avatarStyle='male';
        state.activeSubject=subject;
        setLearnerWorldMode(l,subject,mode);
        renderAll();
        showView('homeView');
        window.VTMenuUi.render();

        const stage=document.querySelector('.project-menu-stage');
        const frame=document.querySelector('#projectMenuAvatarFrame');
        const fallback=document.querySelector('#projectMenuAvatarFallback');
        const img=document.querySelector('#projectMenuAvatarArt');
        const scene=document.querySelector('#projectMenuScenery .wordrealm-approved-home-scene');
        const panel=document.querySelector('.project-menu-avatar-panel');
        const main=document.querySelector('.project-menu-main');
        const learning=document.querySelector('.project-menu-learning-card');
        const evolution=document.querySelector('.project-menu-avatar-evolution');
        const evolutionStrong=document.querySelector('#menuAvatarStageLabel');
        const evolutionSmall=document.querySelector('#menuAvatarNextStage');
        const quick=document.querySelector('#quickLearnHeroBtn');
        const worldActions=document.querySelector('#wordrealmHomeActions');
        const worldTitle=document.querySelector('#wordrealmEnterTitle');
        const germanRead=document.querySelector('.wordrealm-stage-read');

        const visible=el=>{
          if(!el)return false;
          const r=el.getBoundingClientRect(),st=getComputedStyle(el);
          return st.display!=='none'&&st.visibility!=='hidden'&&Number(st.opacity||1)>0&&r.width>0&&r.height>0;
        };
        const rect=el=>{
          if(!el)return null;
          const r=el.getBoundingClientRect();
          return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};
        };
        const stageStyle=stage?getComputedStyle(stage):null;
        const evolutionStyle=evolution?getComputedStyle(evolution):null;
        return {
          subject,mode,
          theme:stage?.dataset.visualTheme||'',
          subjectAttr:stage?.dataset.subject||'',
          worldMode:stage?.dataset.worldMode||'',
          renderKey:frame?.dataset.avatarRenderKey||'',
          source:frame?.dataset.avatarArtSource||'',
          technicalFallback:frame?.dataset.avatarArtSource==='technical-fallback',
          imgVisible:visible(img),
          atlasVisible:visible(fallback?.querySelector('.avatar-atlas-art')),
          fallbackVisible:visible(fallback),
          sceneVisible:visible(scene),
          frameVisible:visible(frame),
          worldActionsVisible:visible(worldActions),
          worldTitle:worldTitle?.textContent?.trim()||'',
          germanReadVisible:visible(germanRead),
          stage:rect(stage),
          panel:rect(panel),
          main:rect(main),
          learning:rect(learning),
          quick:rect(quick),
          scrollWidth:document.documentElement.scrollWidth,
          innerWidth:window.innerWidth,
          accent:stageStyle?.getPropertyValue('--menu-accent').trim()||'',
          stageBackground:stageStyle?.backgroundColor||'',
          stageBorder:stageStyle?.borderTopColor||'',
          evolutionBackground:evolutionStyle?.backgroundImage||'',
          evolutionStrongColor:evolutionStrong?getComputedStyle(evolutionStrong).color:'',
          evolutionSmallColor:evolutionSmall?getComputedStyle(evolutionSmall).color:''
        };
      },{subject,mode});
      results.push(result);
    }
  }

  for(const item of results){
    const label=viewport.label+' '+item.subject+'/'+item.mode;
    assert(item.theme===expectedThemes[item.subject][item.mode],label+' uses wrong visual theme '+item.theme);
    assert(item.subjectAttr===item.subject,label+' does not expose the active subject on the start-stage CSS hook');
    assert(item.worldMode===item.mode,label+' exposes wrong world mode '+item.worldMode);
    assert(item.renderKey.includes(item.subject+'-'+item.mode+'-'),label+' avatar render key is not world-specific');
    assert(!item.technicalFallback,label+' uses technical avatar fallback');
    assert(item.scrollWidth<=item.innerWidth+2,label+' has horizontal overflow '+item.scrollWidth+'>'+item.innerWidth);
    assert(item.stage&&item.stage.left>=-2&&item.stage.right<=item.innerWidth+2,label+' stage leaves viewport');
    assert(item.quick&&item.quick.width>=43.5&&item.quick.height>=43.5,label+' primary learning CTA is below 44px');
    assert(overlap(item.panel,item.main)<4,label+' avatar/scene panel overlaps learning/content column');
    assert(overlap(item.learning,item.panel)<4,label+' learning card overlaps avatar/scene panel');

    if(item.subject==='german'){
      assert(item.source==='wordrealm-approved-scene',label+' does not use the approved integrated German scene');
      assert(item.sceneVisible,label+' approved German scene is not visible');
      assert(!item.imgVisible&&!item.fallbackVisible,label+' exposes a separate avatar tile on top of the integrated scene');
      assert(item.germanReadVisible,label+' loses the German read-aloud control');
      assert(item.worldActionsVisible,label+' loses the German world-entry actions');
      assert(item.evolutionBackground.includes('255, 253, 246')||item.evolutionBackground.includes('255,253,246'),label+' progression card is still the generic dark overlay: '+item.evolutionBackground);
      if(item.mode==='adventure')assert(item.worldTitle.includes('Fuchs-Abenteuer'),label+' world entry does not name Fuchs-Abenteuer');
      else assert(item.worldTitle.includes('Wortreich'),label+' world entry does not name Das Wortreich');
    }else{
      assert(item.source===expectedSources[item.subject],label+' uses unexpected avatar source '+item.source);
      assert(item.imgVisible||item.atlasVisible,label+' approved avatar art is not visible');
      assert(!item.sceneVisible,label+' leaks the German integrated scene');
      assert(!item.worldActionsVisible,label+' leaks German-only start actions');
    }
  }

  for(const subject of Object.keys(expectedThemes)){
    const adventure=results.find(x=>x.subject===subject&&x.mode==='adventure');
    const battle=results.find(x=>x.subject===subject&&x.mode==='battle');
    assert(adventure&&battle,viewport.label+' '+subject+' does not expose both world starts');
    assert(adventure.theme!==battle.theme,viewport.label+' '+subject+' adventure/battle theme is not distinct');
    assert(adventure.accent!==battle.accent,viewport.label+' '+subject+' adventure/battle visual accent is not distinct');
  }

  assert(errors.length===0,viewport.label+' browser errors: '+errors.join(' | '));
  await context.close();
}

await browser.close();
console.log('Vokabeltrainer all-world start-page matrix: passed');
console.log('✓ 4 subjects × 2 worlds × iPhone/desktop');
console.log('✓ approved avatar/scene source, no technical fallback, no overflow/overlap');
console.log('✓ German integrated scene is light, tile-free and keeps world-specific CTA/read-aloud');
