'use strict';

import Phaser from '../vendor/phaser-4.2.1.esm.min.js';
import { createBattleSceneClass } from './battle-phaser-scene.js';

const stage = document.querySelector('#phaserBattleStage');
const mount = document.querySelector('#phaserBattleCanvas');
const start = document.querySelector('#phaserBattleStart');
const message = document.querySelector('#phaserBattleMessage');
const actionTitle = document.querySelector('#phaserBattleActionTitle');
const actionHint = document.querySelector('#phaserBattleActionHint');
const phaseLabel = document.querySelector('#phaserBattleCinematicLabel');
const phaseTitle = document.querySelector('#phaserBattleCinematicTitle');
const fallback = document.querySelector('#phaserBattleFallback');

const phaseCopy = {
  ready: ['BEREIT', 'Die Armee wartet auf dein Signal'],
  rally: ['SAMMELN', 'Die Reihen sammeln sich'],
  advance: ['VORRÜCKEN', 'Die Armee setzt sich in Bewegung'],
  barrage: ['ANGRIFF', 'Die Pfeilsalve steigt über das Feld'],
  impact: ['EINSCHLAG', 'Der Rammbock trifft das Tor'],
  result: ['ÜBERNAHME', 'Die Festung wird übernommen']
};

let game = null;
let scene = null;
let running = false;

function setPhase(phase) {
  window.__VT_PHASER_BATTLE_PHASES__ = window.__VT_PHASER_BATTLE_PHASES__ || [];
  window.__VT_PHASER_BATTLE_PHASES__.push(phase);
  stage.dataset.phase = phase;
  const [label, title] = phaseCopy[phase] || phaseCopy.ready;
  phaseLabel.textContent = label;
  phaseTitle.textContent = title;

  const order = { rally: 1, advance: 2, barrage: 3, impact: 4, result: 5 };
  document.querySelectorAll('[data-phaser-battle-phase]').forEach(el => {
    const here = el.dataset.phaserBattlePhase;
    el.classList.toggle('active', here === phase);
    el.classList.toggle('done', (order[here] || 0) < (order[phase] || 0));
  });
}

function setStatus(text) {
  message.textContent = text;
}

function setBeat(beat) {
  window.__VT_PHASER_BATTLE_BEATS__ = window.__VT_PHASER_BATTLE_BEATS__ || [];
  window.__VT_PHASER_BATTLE_BEATS__.push(beat);
  stage.dataset.beat = beat;
  if (beat === 'damage-1') stage.dataset.damage = 'medium';
  if (beat === 'damage-2' || beat === 'fire') stage.dataset.damage = 'heavy';
  if (beat === 'takeover' || beat === 'secured') stage.dataset.control = 'own';
}

function readyUi() {
  running = false;
  start.disabled = false;
  start.textContent = 'Sequenz abspielen';
  actionTitle.textContent = 'Angriff bereit';
  actionHint.textContent = 'Phaser steuert Bewegung, Kamera und Trefferinszenierung.';
  message.className = 'phaser-battle-message';
  setStatus('Phaser 4 ist geladen. Bereit für die Bewegungsstudie.');
}

function completeUi() {
  window.__VT_PHASER_BATTLE_COMPLETE__ = true;
  running = false;
  start.disabled = false;
  start.textContent = 'Nochmal abspielen';
  actionTitle.textContent = 'Vorschau abgeschlossen';
  actionHint.textContent = 'Die Szene kann direkt erneut abgespielt werden.';
  message.className = 'phaser-battle-message victory';
  message.innerHTML = '<strong>Festung übernommen</strong><span>Das Tor ist aufgebrochen, das eigene Banner steht und die Feuer beruhigen sich.</span>';
  stage.classList.add('is-complete');
}

function failUi(error) {
  console.error('Phaser battle demo failed', error);
  stage.classList.add('phaser-failed');
  fallback.hidden = false;
  start.disabled = true;
  actionTitle.textContent = 'Phaser-Vorschau nicht verfügbar';
  actionHint.textContent = 'Die bestehende CSS-Demo bleibt als technischer Fallback erhalten.';
  message.className = 'phaser-battle-message';
  message.textContent = 'Der Phaser-Renderer konnte auf diesem Gerät nicht gestartet werden.';
}

async function boot() {
  try {
    const BattleScene = createBattleSceneClass(Phaser, {
      onReady: ({ reducedMotion }) => {
        scene = game.scene.getScene('BattleSpike');
        stage.classList.add('phaser-ready');
        fallback.hidden = true;
        stage.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
        window.__VT_PHASER_BATTLE_READY__ = true;
        readyUi();

        if (new URLSearchParams(location.search).get('autoplay') !== '0') {
          window.setTimeout(() => start.click(), 650);
        }
      },
      onPhase: setPhase,
      onBeat: setBeat,
      onStatus: setStatus,
      onComplete: completeUi
    });

    game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: mount,
      width: 1280,
      height: 720,
      backgroundColor: '#263944',
      transparent: false,
      antialias: true,
      roundPixels: false,
      render: {
        antialias: true,
        pixelArt: false,
        powerPreference: 'high-performance'
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
      },
      scene: [BattleScene]
    });
  } catch (error) {
    failUi(error);
  }
}

start.addEventListener('click', () => {
  if (running || !scene) return;
  running = true;
  stage.classList.remove('is-complete');
  delete stage.dataset.damage;
  delete stage.dataset.control;
  window.__VT_PHASER_BATTLE_COMPLETE__ = false;
  window.__VT_PHASER_BATTLE_BEATS__ = [];
  start.disabled = true;
  actionTitle.textContent = 'Schlacht läuft';
  actionHint.textContent = 'Einheiten, Kamera und Effekte laufen in einer gemeinsamen Timeline.';
  message.className = 'phaser-battle-message active';
  scene.playSequence();
});

window.addEventListener('error', event => {
  if (!stage.classList.contains('phaser-ready')) failUi(event.error || new Error(event.message));
});

setPhase('ready');
boot();
