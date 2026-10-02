import { webkit } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const page=await context.newPage();
page.setDefaultTimeout(12000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(v,m)=>{if(!v)throw new Error('Start layout all worlds failed: '+m)};

const expectedThemes={
  english:{adventure:'english-adventure',battle:'campaign'},
  latin:{adventure:'latin-adventure',battle:'roman'},
  german:{adventure:'german-adventure',battle:'wordrealm'},
  french:{adventure:'voyage',battle:'french-battle'}
};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&window.VTMenuAvatarArt?.atlasReady===true&&!!window.VTMenuUi&&!!window.VTWordrealmUi);

  const results=await page.evaluate((expectedThemes)=>{
    state=defaultState();
    const l=learner();
    l.activeSubjects=['english','latin','german','french'];
    l.avatarStyle='male';
    showView('homeView');
    const out=[];

    for(const subject of Object.keys(expectedThemes)){
      for(const mode of ['adventure','battle']){
        state.activeSubject=subject;
        setLearnerWorldMode(l,subject,mode);
        window.VTMenuUi.renderAvatarStage(38);
        const stage=document.querySelector('.project-menu-stage');
        if(stage){
          stage.dataset.visualTheme=subjectVisualTheme(subject,l);
          stage.dataset.subject=subject;
        }
        document.body.dataset.activeSubject=subject;
        window.VTMenuUi.applyAvatarArt();

        const frame=document.querySelector('#projectMenuAvatarFrame');
        const fallback=document.querySelector('#projectMenuAvatarFallback');
        const img=document.querySelector('#projectMenuAvatarArt');
        const scenery=document.querySelector('#projectMenuScenery');
        const panel=document.querySelector('.project-menu-avatar-panel');
        const main=document.querySelector('.project-menu-main');
        const evolution=document.querySelector('.project-menu-avatar-evolution');
        const learn=document.querySelector('#quickLearnHeroBtn');
        const germanRead=document.querySelector('.german-only.read-aloud-btn');
        const wordrealmAction=document.querySelector('#wordrealmHomeActions');
        const rect=el=>{const r=el?.getBoundingClientRect?.();return r?{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height}:null};
        const visible=el=>{
          if(!el)return false;
          const st=getComputedStyle(el),r=el.getBoundingClientRect();
          return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;
        };

        out.push({
          subject,mode,
          theme:stage?.dataset.visualTheme||'',
          source:frame?.dataset.avatarArtSource||'',
          renderKey:frame?.dataset.avatarRenderKey||'',
          atlas:!!frame?.classList.contains('avatar-atlas-rendered'),
          approvedScene:!!frame?.classList.contains('wordrealm-approved-scene'),
          adventureSvg:!!fallback?.querySelector('.wordrealm-fox-svg.adventure'),
          wordrealmScene:!!scenery?.querySelector('.wordrealm-approved-home-scene'),
          imgVisible:visible(img),
          germanReadVisible:visible(germanRead),
          wordrealmActionsVisible:visible(wordrealmAction),
          stageRect:rect(stage),panelRect:rect(panel),mainRect:rect(main),learnRect:rect(learn),
          evolutionColor:evolution?getComputedStyle(evolution).color:'',
          evolutionBackground:evolution?getComputedStyle(evolution).backgroundImage:'',
          scrollWidth:document.documentElement.scrollWidth,
          innerWidth:window.innerWidth
        });
      }
    }
    return out;
  },expectedThemes);

  for(const item of results){
    assert(item.theme===expectedThemes[item.subject][item.mode],item.subject+'/'+item.mode+' uses the expected visual theme');
    assert(item.renderKey.includes(item.subject+'-'+item.mode+'-'),item.subject+'/'+item.mode+' has a world-specific render key');
    assert(item.scrollWidth<=item.innerWidth+2,item.subject+'/'+item.mode+' has no horizontal overflow');
    assert(item.stageRect&&item.stageRect.left>=-2&&item.stageRect.right<=item.innerWidth+2,item.subject+'/'+item.mode+' home stage stays inside the iPhone viewport');
    assert(item.panelRect&&item.mainRect&&item.panelRect.bottom<=item.mainRect.top+2,item.subject+'/'+item.mode+' keeps avatar/scene and learning content vertically separated');
    assert(item.learnRect&&item.learnRect.width>=44&&item.learnRect.height>=44,item.subject+'/'+item.mode+' keeps the learning CTA touch-safe');

    if(item.subject==='german'){
      assert(item.germanReadVisible,item.subject+'/'+item.mode+' keeps read-aloud controls visible');
      assert(item.evolutionColor!=='rgb(255, 255, 255)',item.subject+'/'+item.mode+' uses the light German progression card instead of the generic dark overlay');
      assert(item.evolutionBackground!=='none',item.subject+'/'+item.mode+' keeps the themed progression surface');
      if(item.mode==='adventure'){
        assert(item.source==='german-adventure-illustration','German adventure uses its integrated fox illustration');
        assert(item.adventureSvg&&!item.atlas&&!item.imgVisible,'German adventure does not fall back to a portrait/atlas card');
        assert(!item.wordrealmActionsVisible,'German adventure hides Wortreich-only action cards');
      }else{
        assert(item.source==='wordrealm-approved-scene','German battle uses the approved Wortreich home scene');
        assert(item.approvedScene&&item.wordrealmScene&&!item.atlas&&!item.imgVisible,'German Wortreich has one integrated scene without a second avatar card');
        assert(item.wordrealmActionsVisible,'German Wortreich keeps its dedicated action cards');
      }
    }else{
      assert(item.source==='final'||item.source==='approved-atlas',item.subject+'/'+item.mode+' never uses a technical avatar fallback');
      assert(item.imgVisible||item.atlas,item.subject+'/'+item.mode+' shows approved avatar artwork');
      assert(!item.germanReadVisible,item.subject+'/'+item.mode+' does not leak German-only read-aloud controls');
      assert(!item.wordrealmActionsVisible,item.subject+'/'+item.mode+' does not leak Wortreich actions');
    }
  }

  for(const subject of Object.keys(expectedThemes)){
    const pair=results.filter(x=>x.subject===subject);
    assert(pair.length===2,subject+' has both start-page worlds');
    assert(pair[0].theme!==pair[1].theme,subject+' adventure and battle keep distinct world themes');
  }

  assert(errors.length===0,'browser errors: '+errors.join(' | '));
  console.log('Vokabeltrainer start layout all worlds: passed');
  console.log('✓ 4 subjects × 2 worlds checked at iPhone width');
  console.log('✓ German fox stays integrated in adventure and Wortreich scene stays single-layered');
  console.log('✓ no technical avatar fallback, overflow or avatar/content overlap');
}finally{
  await browser.close();
}
