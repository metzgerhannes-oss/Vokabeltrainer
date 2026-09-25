import { webkit, devices } from 'playwright';

const base=process.env.APP_BASE||'http://127.0.0.1:4173';
const browser=await webkit.launch({headless:true});
const context=await browser.newContext({...devices['iPhone 13']});
const page=await context.newPage();
page.setDefaultTimeout(10000);
const errors=[];
page.on('pageerror',e=>errors.push(String(e?.message||e)));
page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const assert=(value,message)=>{if(!value)throw new Error('Accessibility UI smoke failed: '+message)};

try{
  const response=await page.goto(base+'/index.html',{waitUntil:'domcontentloaded',timeout:15000});
  assert(response?.ok(),'app loads');
  await page.waitForFunction(()=>window.__VT_APP_READY__===true&&state!==null&&typeof modal==='function'&&typeof enterParentMode==='function');

  const profile=page.locator('#profileBtn');
  assert(await profile.isVisible(),'profile switcher is visible');
  await profile.focus();
  assert(await page.evaluate(()=>document.activeElement?.id)==='profileBtn','profile switcher receives keyboard focus');
  const focusStyle=await profile.evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
  assert(focusStyle.style!=='none'&&parseFloat(focusStyle.width)>=2,'keyboard focus is visibly outlined');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#modal[open]');
  assert(await page.locator('#modal').getAttribute('aria-modal')==='true','modal exposes modal semantics');
  assert(await page.locator('#modal').getAttribute('aria-labelledby')==='modalTitle','modal points to its generated title');
  assert(await page.locator('#modalTitle').count()===1,'modal has one accessible title');
  await page.waitForFunction(()=>document.activeElement?.id==='modalTitle');
  assert(await page.locator('#modalTitle').getAttribute('tabindex')==='-1','modal title is programmatically focusable');
  await page.keyboard.press('Escape');
  await page.waitForFunction(()=>!document.querySelector('#modal')?.open);
  await page.waitForFunction(()=>document.activeElement?.id==='profileBtn');
  assert(await page.evaluate(()=>document.activeElement?.id)==='profileBtn','closing modal restores focus to opener');

  const practiceNav=page.locator('.bottom-nav [data-view="practiceView"]');
  await practiceNav.focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('#practiceView.active');
  assert(await practiceNav.getAttribute('aria-current')==='page','keyboard navigation updates aria-current');
  assert(await page.locator('.bottom-nav [aria-current="page"]').count()===1,'exactly one bottom-nav item is current');
  assert(await page.locator('.bottom-nav [data-view="homeView"]').getAttribute('aria-current')===null,'previous nav item loses aria-current');

  await page.evaluate(()=>{
    const extra=deepClone(state.learners[0]);
    extra.id='learner_accessibility_extra';
    extra.name='Zweites Profil';
    extra.createdAt=new Date().toISOString();
    state.learners.push(extra);
    enterParentMode('settingsView');
    renderProfiles();
  });
  await page.waitForSelector('#settingsView.active');
  const deleteBtn=page.locator('[data-profile-del="learner_accessibility_extra"]');
  assert(await deleteBtn.count()===1,'profile delete control exists when multiple profiles are present');
  assert((await deleteBtn.getAttribute('aria-label'))==='Profil Zweites Profil löschen','icon-only delete control has a specific accessible name');
  const deleteBox=await deleteBtn.boundingBox();
  assert(!!deleteBox&&deleteBox.width>=44&&deleteBox.height>=44,'profile delete touch target is at least 44 by 44 CSS pixels');

  await page.setViewportSize({width:667,height:375});
  const parentHome=page.locator('#settingsView [data-parent-home]');
  assert(await parentHome.isVisible(),'parent return action remains visible in landscape');
  await page.evaluate(()=>showView('homeView'));
  await page.locator('#profileBtn').focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('#modal[open]');
  const landscape=await page.evaluate(()=>{
    const dialog=document.querySelector('#modal');
    const rect=dialog.getBoundingClientRect();
    return {
      viewport:innerWidth,
      left:rect.left,
      right:rect.right,
      documentWidth:document.documentElement.scrollWidth,
      active:document.activeElement?.id||''
    };
  });
  assert(landscape.left>=-1&&landscape.right<=landscape.viewport+1,'modal remains inside landscape viewport');
  assert(landscape.documentWidth<=landscape.viewport+1,'modal does not create horizontal page overflow in landscape');
  assert(landscape.active==='modalTitle','modal focus rule also holds in landscape');

  await page.keyboard.press('Escape');
  await page.evaluate(()=>showView('libraryView'));
  await page.locator('[data-help="library"]').click();
  await page.waitForSelector('#helpPopover:not([hidden])');
  const helpClose=page.locator('.help-popover-close');
  const helpCloseBox=await helpClose.boundingBox();
  assert(!!helpCloseBox&&helpCloseBox.width>=44&&helpCloseBox.height>=44,'help popover close target is at least 44 by 44 CSS pixels');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer accessibility UI smoke: passed');
}finally{
  await browser.close();
}
