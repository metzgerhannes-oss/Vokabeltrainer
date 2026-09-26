import { webkit, devices } from 'playwright';

export const base=process.env.APP_BASE||'http://127.0.0.1:4173';

export async function createBattleHarness(){
  const browser=await webkit.launch({headless:true});
  const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce'});
  const page=await context.newPage();
  page.setDefaultTimeout(10000);
  await page.addInitScript(()=>{window.__VT_BATTLE_TEST_MODE__=true});
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e?.message||e)));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  const assert=(value,message)=>{if(!value)throw new Error('Battle UI smoke failed: '+message)};
  const activate=async(selector,label=selector)=>{
    const loc=page.locator(selector);
    assert(await loc.count()===1,label+' exists exactly once');
    assert(await loc.isVisible(),label+' is visible');
    assert(!(await loc.isDisabled()),label+' is enabled');
    await loc.evaluate(el=>el.click());
  };
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&state!==null&&typeof grantBattleTicket==='function'&&typeof openBattleView==='function');

  const reset=async({revealed=true,ticket=true}={})=>{
    await page.evaluate(({revealed,ticket})=>{
      state=defaultState();
      const set={id:'battle_set',learnerId:'learner_demo',subject:'english',title:'Battle Unit',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:datePlusDays(1),testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
      state.sets.push(set);
      attachVocabularyToSet(set.id,{term:'shield',translation:'Schild',source:'battle-smoke',verified:true});
      for(const link of state.setVocabulary){link.firstContactCopiedAt=link.firstContactRecalledAt=link.firstContactCompletedAt=new Date().toISOString()}
      const p=state.learnerVocabulary[0];
      p.skills={recognition:4,listening:4,retrieval:4,spelling:4,context:4};
      p.independentSuccesses=8;
      p.activeSuccessDays=['2026-09-10','2026-09-14','2026-09-18'];
      p.activePracticeDays=[...p.activeSuccessDays];
      p.maxActiveGapDays=7;
      p.coldRecallDays=['2026-09-14','2026-09-18'];
      p.coldRecallSuccesses=2;
      p.intervalDays=14;
      p.errorProfile={meaning:0,retrieval:0,spelling:0,listening:0,context:0,grammar:0};
      refreshMastery(p);
      state.learners[0].milestones[`hundred_english_${currentSchoolYear()}`]=new Date().toISOString();
      rebuildWordIndexes();
      renderAll();
      const fortress=currentTestFortress();
      if(revealed&&fortress)fortress.revealedAt=new Date().toISOString();
      if(ticket)grantBattleTicket('dailyGoal');
      renderAll();
      showView('armyView');
    },{revealed,ticket});
  };

  const openBattle=async()=>{
    await activate('#attackBtn','battle entry');
    await page.waitForSelector('#battleView.active');
    await page.waitForFunction(()=>{
      const stage=document.querySelector('#battleStage');
      return !!stage?.querySelector('.battle-sky')&&!!stage.querySelector('.battle-ground')&&!!stage.querySelector('.battle-fortress');
    });
  };

  const diagnose=async(label,error)=>{
    let snapshot=null;
    try{
      snapshot=await page.evaluate(()=>({
        href:location.href,
        activeView:document.querySelector('.view.active')?.id||'',
        stageClass:document.querySelector('#battleStage')?.className||'',
        phase:document.querySelector('#battleStage')?.dataset.phase||'',
        fortressState:document.querySelector('#battleStage')?.dataset.fortressState||'',
        resultClass:document.querySelector('#battleResultOverlay')?.className||'',
        resultTitle:document.querySelector('#battleResultTitle')?.textContent||'',
        ticket:document.querySelector('#battleTicketPill')?.textContent||'',
        campaignLog:typeof learner==='function'?(learner()?.campaignLog||[]).slice(-3):[]
      }));
    }catch{}
    console.error('BATTLE_DIAGNOSTIC',JSON.stringify({label,error:String(error?.stack||error),snapshot}));
  };

  return {browser,context,page,errors,assert,activate,reset,openBattle,diagnose};
}
