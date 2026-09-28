'use strict';

import Phaser from '../vendor/phaser-4.2.1.esm.min.js?v=0.21.28';
import { createBattleSceneClass } from './battle-phaser-scene.js?v=0.21.28';

let activeGame = null;
let activeMount = null;
let activeStage = null;
let activeWrap = null;

function initialsFor(name) {
  const text = String(name || '').trim();
  if (!text) return 'P';
  const parts = text.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'P';
}

function destroyProductionBattle() {
  if (activeGame) {
    try { activeGame.destroy(true); } catch (_error) {}
  }
  if (activeMount?.isConnected) activeMount.remove();
  activeWrap?.classList.remove('phaser-production-layout');
  if (activeStage) {
    activeStage.classList.remove('phaser-production-active', 'phaser-production-running', 'phaser-production-complete');
    delete activeStage.dataset.renderer;
    delete activeStage.dataset.phaserAttack;
    delete activeStage.dataset.phaserOutcome;
    delete activeStage.dataset.phaserProfile;
    delete activeStage.dataset.phaserReady;
  }
  activeGame = null;
  activeMount = null;
  activeStage = null;
  activeWrap = null;
}

function safeCall(fn, ...args) {
  if (typeof fn !== 'function') return;
  try { fn(...args); } catch (error) { console.error('Phaser production callback failed', error); }
}

export function playProductionBattle({
  stage,
  attack = 'charge',
  captureOutcome = false,
  profileName = 'Mein Profil',
  initialDamagePct = 0,
  onReady,
  onPhase,
  onBeat,
  onStatus,
  onComplete,
  onError
} = {}) {
  if (!(stage instanceof HTMLElement)) {
    return Promise.reject(new Error('Battle stage is missing'));
  }

  destroyProductionBattle();

  const wrap = stage.closest('.battle-stage-wrap');
  wrap?.classList.add('phaser-production-layout');

  const mount = document.createElement('div');
  mount.className = 'battle-phaser-production';
  mount.setAttribute('aria-hidden', 'true');
  stage.prepend(mount);
  stage.classList.add('phaser-production-active', 'phaser-production-running');
  stage.dataset.renderer = 'phaser4';
  stage.dataset.phaserAttack = attack;
  stage.dataset.phaserOutcome = captureOutcome ? 'capture' : 'hit';
  stage.dataset.phaserProfile = initialsFor(profileName);
  mount.dataset.version = 'v0.21.28 · Phaser';

  activeMount = mount;
  activeStage = stage;
  activeWrap = wrap;

  return new Promise((resolve, reject) => {
    let settled = false;
    let game = null;

    const fail = error => {
      if (settled) return;
      settled = true;
      console.error('Production Phaser battle failed', error);
      stage.classList.remove('phaser-production-running');
      stage.classList.add('phaser-production-failed');
      safeCall(onError, error);
      try { game?.destroy(true); } catch (_error) {}
      if (mount.isConnected) mount.remove();
      wrap?.classList.remove('phaser-production-layout');
      if (activeGame === game) {
        activeGame = null;
        activeMount = null;
        activeStage = null;
        activeWrap = null;
      }
      reject(error);
    };

    try {
      const Scene = createBattleSceneClass(Phaser, {
        profileInitials: initialsFor(profileName),
        initialDamagePct,
        onReady: detail => {
          const scene = game.scene.getScene('BattleSpike');
          stage.dataset.phaserReady = 'true';
          safeCall(onReady, detail);
          requestAnimationFrame(() => {
            if (settled || !mount.isConnected) return;
            const started = scene?.playSequence?.(attack, captureOutcome);
            if (!started) fail(new Error('Phaser sequence did not start'));
          });
        },
        onPhase: phase => safeCall(onPhase, phase),
        onBeat: beat => safeCall(onBeat, beat),
        onStatus: status => safeCall(onStatus, status),
        onComplete: () => {
          if (settled) return;
          settled = true;
          stage.classList.remove('phaser-production-running');
          stage.classList.add('phaser-production-complete');
          safeCall(onComplete);
          resolve({ renderer: 'phaser4', attack, outcome: captureOutcome ? 'capture' : 'hit' });
        }
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
        scene: [Scene]
      });
      activeGame = game;
    } catch (error) {
      fail(error);
    }
  });
}

export { destroyProductionBattle };

if (typeof window !== 'undefined') {
  window.VTBattlePhaserProduction = {
    playProductionBattle,
    destroyProductionBattle,
    version: '0.21.28-phaser-production.1'
  };
}
