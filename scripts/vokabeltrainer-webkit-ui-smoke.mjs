import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext(devices['iPhone 13']);
const page=await context.newPage();
page.setDefaultTimeout(10000);
const consoleErrors=[];
const pageErrors=[];
page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text())});
page.on('pageerror',err=>pageErrors.push(String(err?.message||err)));

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  if(!response?.ok())throw new Error('HTTP '+(response?.status()||'no response'));
  const title=await page.title();
  if(!/Vokabeltrainer/i.test(title))throw new Error('unexpected title: '+title);
  const html=await page.content();
  if(!/Vokabeltrainer|Lernen|Lern/i.test(html))throw new Error('app content missing');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true);

  // Regression: a compact iPhone must expose the child-device path directly.
  await page.setViewportSize({width:375,height:667});
  await page.locator('#parentAreaBtn').click();
  await page.locator('#confirmParentMode').click();
  await page.locator('#parentManageDisclosure > summary').click();
  await page.locator('#parentSettingsBtn').click();
  await page.locator('#familySyncSetupBtn').click();
  await page.locator('#familySyncChildJoinChoiceBtn').waitFor({state:'visible'});
  if((await page.locator('#familySyncChildJoinChoiceBtn').textContent())?.trim()!=='Kindergerät verbinden')throw new Error('child-device choice missing');
  if(!/Weiteres Eltern-Gerät verbinden/.test(await page.locator('#familySyncJoinChoiceBtn').textContent()||''))throw new Error('parent-device choice not clearly separated');
  const setupDialog=await page.locator('#modal').evaluate(el=>({overflowY:getComputedStyle(el).overflowY,clientHeight:el.clientHeight,scrollHeight:el.scrollHeight}));
  if(!['auto','scroll'].includes(setupDialog.overflowY))throw new Error('setup dialog is not vertically scrollable on compact iPhone');
  if(setupDialog.clientHeight>667)throw new Error('setup dialog exceeds compact iPhone viewport');

  await page.locator('#familySyncChildJoinChoiceBtn').click();
  await page.locator('#familyChildJoinInput').waitFor({state:'visible'});
  await page.locator('#familyChildJoinBtn').waitFor({state:'visible'});
  if(!/Verbindungslink oder Gerätecode/.test(await page.locator('#modalContent').textContent()||''))throw new Error('child invite input guidance missing');

  // Regression: buttons inside an already-open dialog must remain tappable.
  await page.locator('#familyChildJoinInput').fill('kein-gueltiger-link');
  await page.locator('#familyChildJoinBtn').click();
  if(!/Bitte den Verbindungslink/.test(await page.locator('#familyChildJoinError').textContent()||''))throw new Error('child connect button did not react');
  await page.locator('#familySyncBackBtn').click();
  await page.locator('#familySyncChildJoinChoiceBtn').waitFor({state:'visible'});

  // Regression: on iOS Safari, a fresh child invite must be preserved for the
  // Home Screen app instead of being consumed in Safari's separate storage.
  await page.evaluate(()=>{
    closeModal();
    const params=new URLSearchParams();
    params.set('childInvite','a'.repeat(48));
    params.set('childName','Testkind');
    history.replaceState(null,'',location.pathname+'#'+params.toString());
    window.handleChildInviteFromUrl?.();
  });
  await page.locator('#copyIosHomeInviteBtn').waitFor({state:'visible'});
  if(await page.locator('#claimChildInviteBtn').count())throw new Error('iOS Safari must not claim a child invite before Home Screen installation');
  if(!/Home-Bildschirm/.test(await page.locator('#modalContent').textContent()||''))throw new Error('iOS Home Screen handoff guidance missing');
  await page.evaluate(()=>{closeModal();history.replaceState(null,'',location.pathname)});

  // Livetest regression: a paired child device is permanently assigned to one
  // profile. Parent devices may switch profiles, child devices may not.
  const childLock=await page.evaluate(()=>{
    const originalStatus=window.VTFamilySync.status;
    const originalLearners=structuredClone(state.learners);
    const originalActive=state.activeLearnerId;
    try{
      const current=learner();
      state.learners.push({...structuredClone(current),id:'learner_other',name:'Anderes Kind'});
      window.VTFamilySync.status=()=>({enabled:true,role:'child',profileId:originalActive,lastSync:null,dirty:0,conflicts:0,busy:false});
      renderAll();
      const btn=document.querySelector('#profileBtn');
      switchLearnerProfile('learner_other');
      return {disabled:!!btn?.disabled,locked:btn?.classList.contains('profile-locked'),active:state.activeLearnerId,aria:btn?.getAttribute('aria-label')||''};
    }finally{
      state.learners=originalLearners;state.activeLearnerId=originalActive;window.VTFamilySync.status=originalStatus;renderAll();
    }
  });
  if(!childLock.disabled||!childLock.locked)throw new Error('paired child profile remains switchable in the header');
  if(childLock.active==='learner_other')throw new Error('paired child device changed to another learner profile');
  if(!/fest zugeordnet/.test(childLock.aria))throw new Error('paired child profile is not labelled as fixed');

  // Livetest: pairing and friendship challenge use local QR codes instead of
  // forcing long links/codes to be copied manually.
  const qrReady=await page.evaluate(()=>typeof window.qrcode==='function'&&typeof window.VTQr?.render==='function');
  if(!qrReady)throw new Error('local QR generator did not load');

  await page.evaluate(()=>{
    closeModal();
    const originalStatus=window.VTFamilySync.status;
    const originalCreateChild=window.VTFamilySync.createChildInvite;
    window.__qrRestoreChild=()=>{window.VTFamilySync.status=originalStatus;window.VTFamilySync.createChildInvite=originalCreateChild};
    window.VTFamilySync.status=()=>({enabled:true,role:'parent',familyId:'family_smoke',lastSync:null,dirty:0,conflicts:0,busy:false});
    window.VTFamilySync.createChildInvite=async()=>({ok:true,token:'b'.repeat(48),expires_at:new Date(Date.now()+900000).toISOString()});
    window.openChildDeviceInvite?.();
  });
  await page.locator('#familyChildInviteBtn').click();
  await page.waitForSelector('#familyChildQr svg');
  if(!/QR-Code/.test(await page.locator('#familyChildInviteResult').textContent()||''))throw new Error('child pairing does not present QR as primary handoff');
  await page.evaluate(()=>{window.__qrRestoreChild?.();delete window.__qrRestoreChild;closeModal()});

  await page.evaluate(()=>{
    const originalStatus=window.VTFamilySync.status;
    const originalCreateParent=window.VTFamilySync.createParentInvite;
    window.__qrRestoreParent=()=>{window.VTFamilySync.status=originalStatus;window.VTFamilySync.createParentInvite=originalCreateParent};
    window.VTFamilySync.status=()=>({enabled:true,role:'parent',familyId:'family_smoke',lastSync:null,dirty:0,conflicts:0,busy:false});
    window.VTFamilySync.createParentInvite=async()=>({ok:true,token:'c'.repeat(48),expires_at:new Date(Date.now()+900000).toISOString()});
    window.openParentDeviceInvite?.();
  });
  await page.locator('#familyParentInviteBtn').click();
  await page.waitForSelector('#familyParentQr svg');
  if(!/Familien-PIN/.test(await page.locator('#familyParentInviteResult').textContent()||''))throw new Error('parent QR pairing does not keep reusable family PIN out of the handoff');
  await page.evaluate(()=>{window.__qrRestoreParent?.();delete window.__qrRestoreParent;closeModal()});

  await page.evaluate(()=>{openDuel()});
  await page.waitForSelector('#duelQr svg');
  if(await page.locator('#duelShareBtn').count()!==1)throw new Error('duel QR lacks share fallback');
  await page.evaluate(()=>{
    closeModal();
    const params=new URLSearchParams();params.set('duel',encodeDuel(duelPayload()));
    history.replaceState(null,'',location.pathname+'#'+params.toString());
    window.handleDuelInviteFromUrl?.();
  });
  await page.waitForSelector('#duelResult .duel-arena');
  if(!/Unentschieden/.test(await page.locator('#duelResult').textContent()||''))throw new Error('duel QR deep link was not consumed');
  await page.evaluate(()=>{closeModal();history.replaceState(null,'',location.pathname)});

  const fatal=[...pageErrors,...consoleErrors].filter(x=>/ReferenceError|TypeError|SyntaxError|Content Security Policy|InvalidStateError|DOMException/i.test(x));
  if(fatal.length)throw new Error(fatal.join(' | '));
  console.log('Vokabeltrainer WebKit iPhone smoke: passed');
}finally{
  await browser.close();
}
