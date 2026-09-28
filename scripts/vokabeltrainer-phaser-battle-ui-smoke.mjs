import { webkit, devices } from 'playwright';

const base = process.env.APP_BASE || 'http://127.0.0.1:4173';
const browser = await webkit.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(18000);

const errors = [];
const external = [];
page.on('pageerror', error => errors.push(String(error?.message || error)));
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('request', request => {
  try {
    const url = new URL(request.url());
    const app = new URL(base);
    if (url.origin !== app.origin) external.push(request.url());
  } catch {}
});

const assert = (value, message) => {
  if (!value) throw new Error('Phaser battle smoke failed: ' + message);
};

async function openVariant(attack, outcome = 'capture') {
  const response = await page.goto(
    base + '/phaser-battle-demo.html?autoplay=0&attack=' + encodeURIComponent(attack) + '&outcome=' + encodeURIComponent(outcome),
    { waitUntil: 'domcontentloaded', timeout: 20000 }
  );
  assert(response?.ok(), attack + ' demo loads');
  await page.waitForFunction(() => window.__VT_PHASER_BATTLE_READY__ === true, null, { timeout: 20000 });

  const ready = await page.evaluate(() => {
    const stage = document.querySelector('#phaserBattleStage');
    const canvas = document.querySelector('#phaserBattleCanvas canvas');
    const rect = stage?.getBoundingClientRect();
    const canvasRect = canvas?.getBoundingClientRect();
    return {
      canvasCount: document.querySelectorAll('#phaserBattleCanvas canvas').length,
      canvasWidth: canvas?.width || 0,
      canvasHeight: canvas?.height || 0,
      displayWidth: canvasRect?.width || 0,
      displayHeight: canvasRect?.height || 0,
      stageWidth: rect?.width || 0,
      stageHeight: rect?.height || 0,
      readyClass: stage?.classList.contains('phaser-ready') === true,
      fallbackHidden: document.querySelector('#phaserBattleFallback')?.hidden === true,
      buttonEnabled: document.querySelector('#phaserBattleStart')?.disabled === false,
      phaseCount: document.querySelectorAll('[data-phaser-battle-phase]').length,
      attackCount: document.querySelectorAll('[data-phaser-attack]').length,
      activeAttackCount: document.querySelectorAll('[data-phaser-attack].active').length,
      phase: stage?.dataset.phase || '',
      attack: stage?.dataset.attack || '',
      outcome: stage?.dataset.outcome || '',
      reducedMotion: stage?.dataset.reducedMotion || '',
      label: document.querySelector('#phaserBattleCinematicLabel')?.textContent?.trim() || ''
    };
  });

  assert(ready.canvasCount === 1, 'exactly one Phaser canvas is mounted');
  assert(ready.canvasWidth === 1280 && ready.canvasHeight === 720, 'Phaser uses the fixed cinematic render resolution');
  assert(ready.displayWidth > 300 && ready.displayHeight > 160, 'canvas is visibly rendered in the mobile viewport');
  assert(ready.stageWidth > 300 && ready.stageHeight > 180, 'stage has usable mobile geometry');
  assert(ready.readyClass, 'stage marks Phaser renderer ready');
  assert(ready.fallbackHidden, 'fallback stays hidden when Phaser starts');
  assert(ready.buttonEnabled, 'sequence button becomes enabled');
  assert(ready.phaseCount === 5, 'five cinematic phases are visible');
  assert(ready.attackCount === 5, 'five attack variants are selectable');
  assert(ready.activeAttackCount === 1, 'exactly one attack variant is active');
  assert(ready.phase === 'ready' && ready.label === 'BEREIT', 'scene starts in ready state');
  assert(ready.attack === attack, 'selected attack is reflected on the stage');
  assert(ready.outcome === outcome, 'selected outcome is reflected on the stage');
  assert(ready.reducedMotion === 'true', 'matrix runs in reduced-motion mode for CI speed');
  assert(external.length === 0, 'Phaser battle uses no external CDN requests');

  await page.locator('#phaserBattleStart').click();
  await page.waitForFunction(() => window.__VT_PHASER_BATTLE_COMPLETE__ === true, null, { timeout: 26000 });

  const result = await page.evaluate(() => {
    const stage = document.querySelector('#phaserBattleStage');
    return {
      phase: stage?.dataset.phase || '',
      complete: stage?.classList.contains('is-complete') === true,
      buttonText: document.querySelector('#phaserBattleStart')?.textContent?.trim() || '',
      buttonEnabled: document.querySelector('#phaserBattleStart')?.disabled === false,
      resultText: document.querySelector('#phaserBattleMessage')?.textContent?.trim() || '',
      cinematic: document.querySelector('#phaserBattleCinematicTitle')?.textContent?.trim() || '',
      phases: window.__VT_PHASER_BATTLE_PHASES__ || [],
      beats: window.__VT_PHASER_BATTLE_BEATS__ || [],
      attack: window.__VT_PHASER_BATTLE_ATTACK__ || '',
      outcome: window.__VT_PHASER_BATTLE_OUTCOME__ || '',
      damage: stage?.dataset.damage || '',
      control: stage?.dataset.control || '',
      beat: stage?.dataset.beat || ''
    };
  });

  for (const phase of ['rally', 'advance', 'barrage', 'impact', 'result']) {
    assert(result.phases.includes(phase), attack + ' phase sequence contains ' + phase);
  }
  assert(result.phase === 'result', attack + ' scene ends in result phase');
  assert(result.complete, attack + ' result completion state is visible');
  assert(result.buttonEnabled && result.buttonText.includes('Nochmal'), attack + ' scene can be replayed');
  assert(result.attack === attack, attack + ' is preserved through completion');
  assert(result.outcome === outcome, outcome + ' is preserved through completion');
  return result;
}

try {
  const ram = await openVariant('ram', 'capture');
  for (const beat of ['rally','advance','volley-1','ram-charge-1','damage-1','volley-2','ram-charge-2','damage-2','fire','breach','takeover','secured']) {
    assert(ram.beats.includes(beat), 'ram capture contains beat ' + beat);
  }
  assert(ram.damage === 'heavy', 'ram capture keeps heavy fortress damage');
  assert(ram.control === 'own', 'ram capture transfers control');
  assert(ram.resultText.includes('Festung übernommen'), 'ram capture result confirms takeover');

  const charge = await openVariant('charge', 'capture');
  assert(charge.beats.includes('charge-1'), 'charge uses infantry-specific attack beat');
  assert(charge.beats.includes('damage-1'), 'charge has a visible damage beat');
  assert(charge.beats.includes('takeover'), 'charge capture can show takeover only after capture outcome');

  const volley = await openVariant('volley', 'capture');
  assert(volley.beats.includes('volley-1') && volley.beats.includes('volley-2'), 'volley uses multiple arrow waves');
  assert(volley.beats.includes('fire'), 'volley can leave small stylized fire effects');
  assert(volley.beats.includes('takeover'), 'volley capture resolves through takeover outcome');

  const cavalry = await openVariant('cavalry', 'capture');
  assert(cavalry.beats.includes('flank-1'), 'cavalry uses a dedicated flank beat');
  assert(cavalry.beats.includes('damage-1'), 'cavalry ends in a visible target reaction');
  assert(cavalry.beats.includes('takeover'), 'cavalry capture resolves through takeover outcome');

  const special = await openVariant('special', 'capture');
  assert(special.beats.includes('elite-wave-1'), 'special starts a combined elite wave');
  assert(special.beats.includes('ram-charge'), 'special includes the ram role');
  assert(special.beats.includes('damage-2'), 'special has a coordinated second impact');
  assert(special.beats.includes('takeover'), 'special capture resolves through takeover outcome');

  const hitOnly = await openVariant('ram', 'hit');
  assert(hitOnly.beats.includes('hold') && hitOnly.beats.includes('settled'), 'normal hit resolves without capture');
  assert(!hitOnly.beats.includes('takeover') && !hitOnly.beats.includes('secured'), 'normal hit never fakes takeover');
  assert(hitOnly.control === '', 'normal hit keeps enemy control');
  assert(hitOnly.resultText.includes('noch nicht übernommen'), 'normal hit result explicitly keeps fortress uncaptured');

  if (errors.length) throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer Phaser battle attack matrix smoke: passed');
} finally {
  await browser.close();
}
