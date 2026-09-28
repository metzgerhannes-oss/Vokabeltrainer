import { webkit, devices } from 'playwright';

const base = process.env.APP_BASE || 'http://127.0.0.1:4173';
const browser = await webkit.launch({ headless: true });
const context = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'no-preference' });
const page = await context.newPage();
page.setDefaultTimeout(15000);

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

try {
  const response = await page.goto(base + '/phaser-battle-demo.html?autoplay=0', {
    waitUntil: 'domcontentloaded',
    timeout: 20000
  });
  assert(response?.ok(), 'Phaser battle demo loads');

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
      phase: stage?.dataset.phase || '',
      label: document.querySelector('#phaserBattleCinematicLabel')?.textContent?.trim() || '',
      phases: window.__VT_PHASER_BATTLE_PHASES__ || []
    };
  });

  assert(ready.canvasCount === 1, 'exactly one Phaser canvas is mounted');
  assert(ready.canvasWidth === 1280 && ready.canvasHeight === 720, 'Phaser uses the fixed cinematic render resolution');
  assert(ready.displayWidth > 300 && ready.displayHeight > 160, 'canvas is visibly rendered in the mobile viewport');
  assert(ready.stageWidth > 300 && ready.stageHeight > 180, 'stage has usable mobile geometry');
  assert(ready.readyClass, 'stage marks Phaser renderer ready');
  assert(ready.fallbackHidden, 'fallback stays hidden when Phaser starts');
  assert(ready.buttonEnabled, 'sequence button becomes enabled');
  assert(ready.phaseCount === 5, 'five battle phases are visible');
  assert(ready.phase === 'ready' && ready.label === 'BEREIT', 'scene starts in ready state');
  assert(ready.phases.includes('ready'), 'phase recorder contains ready state');
  assert(external.length === 0, 'Phaser battle uses no external CDN requests');

  await page.locator('#phaserBattleStart').click();
  await page.waitForFunction(() => window.__VT_PHASER_BATTLE_COMPLETE__ === true, null, { timeout: 20000 });

  const result = await page.evaluate(() => {
    const stage = document.querySelector('#phaserBattleStage');
    return {
      phase: stage?.dataset.phase || '',
      complete: stage?.classList.contains('is-complete') === true,
      buttonText: document.querySelector('#phaserBattleStart')?.textContent?.trim() || '',
      buttonEnabled: document.querySelector('#phaserBattleStart')?.disabled === false,
      resultText: document.querySelector('#phaserBattleMessage')?.textContent?.trim() || '',
      cinematic: document.querySelector('#phaserBattleCinematicTitle')?.textContent?.trim() || '',
      phases: window.__VT_PHASER_BATTLE_PHASES__ || []
    };
  });

  for (const phase of ['rally', 'advance', 'barrage', 'impact', 'result']) {
    assert(result.phases.includes(phase), 'phase sequence contains ' + phase);
  }
  assert(result.phase === 'result', 'scene ends in result phase');
  assert(result.complete, 'result completion state is visible');
  assert(result.buttonEnabled && result.buttonText.includes('Nochmal'), 'scene can be replayed');
  assert(result.resultText.includes('Festung bezwungen'), 'result message is explicit');
  assert(result.cinematic.includes('Festung'), 'cinematic result headline remains readable');

  if (errors.length) throw new Error(errors.join(' | '));
  console.log('Vokabeltrainer Phaser battle smoke: passed');
} finally {
  await browser.close();
}
