import { createBattleHarness } from './helpers/vokabeltrainer-battle-harness.mjs';

const {browser,page,assert,activate,reset,errors}=await createBattleHarness();

try{
  await reset({revealed:true,ticket:false});

  const privacy=await page.evaluate(()=>{
    const payload=duelPayload();
    const raw=JSON.parse(decodeURIComponent(escape(atob(encodeDuel(payload)))));
    return {raw,profile:learner().name};
  });
  assert(privacy.raw.name!==privacy.profile,'duel code never contains learner profile name');
  assert(!Object.hasOwn(privacy.raw,'mastered')&&!Object.hasOwn(privacy.raw,'total')&&!Object.hasOwn(privacy.raw,'stable')&&!Object.hasOwn(privacy.raw,'strength'),'duel code contains only comparison-minimum learning data');

  await page.evaluate(()=>openDuel());
  const duelCode=await page.evaluate(()=>encodeDuel({...duelPayload(),progress:80,stability:0}));
  await page.fill('#opponentCode',duelCode);
  await activate('#duelCompare','duel compare action');
  assert(await page.locator('.duel-arena').count()===1,'friendship duel has an arena');
  assert((await page.locator('#duelResult').textContent())?.includes('Sieg'),'duel result remains deterministic from academic progress');

  if(errors.length)throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer battle duel smoke: passed');
}finally{
  await browser.close();
}
