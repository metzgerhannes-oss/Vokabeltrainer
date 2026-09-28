'use strict';

import Phaser from '../vendor/phaser-4.2.1.esm.min.js?v=0.21.28';
import { createBattleSceneClass } from './battle-phaser-scene.js?v=0.21.28';

let activeGame = null;
let activeMount = null;
let activeStage = null;
let activeWrap = null;
let activeAudio = null;

function createBattleAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return { available: false, playForBeat() {}, close() {} };

  let ctx;
  let master;
  try {
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0.035;
    master.connect(ctx.destination);
    ctx.resume?.().catch(() => {});
  } catch (_error) {
    return { available: false, playForBeat() {}, close() {} };
  }

  const tone = ({ freq = 220, endFreq = freq, duration = 0.12, type = 'sine', gain = 0.5, delay = 0 } = {}) => {
    try {
      const now = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(35, freq), now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(35, endFreq), now + duration);
      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), now + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(env);
      env.connect(master);
      osc.start(now);
      osc.stop(now + duration + 0.03);
    } catch (_error) {}
  };

  const chord = (base = 220) => {
    tone({ freq: base, endFreq: base * 1.02, duration: 0.34, type: 'triangle', gain: 0.34 });
    tone({ freq: base * 1.25, endFreq: base * 1.28, duration: 0.38, type: 'sine', gain: 0.24, delay: 0.05 });
    tone({ freq: base * 1.5, endFreq: base * 1.54, duration: 0.42, type: 'sine', gain: 0.22, delay: 0.09 });
  };

  return {
    available: true,
    playForBeat(beat) {
      if (ctx.state === 'suspended') ctx.resume?.().catch(() => {});
      if (beat === 'rally') tone({ freq: 105, endFreq: 78, duration: 0.24, type: 'sine', gain: 0.42 });
      else if (beat === 'defense-volley') {
        tone({ freq: 1500, endFreq: 520, duration: 0.11, type: 'triangle', gain: 0.12 });
        tone({ freq: 1250, endFreq: 430, duration: 0.13, type: 'triangle', gain: 0.10, delay: 0.08 });
      } else if (beat === 'defense-catapult') tone({ freq: 150, endFreq: 58, duration: 0.42, type: 'sawtooth', gain: 0.28 });
      else if (beat.startsWith('volley')) tone({ freq: 1180, endFreq: 390, duration: 0.10, type: 'triangle', gain: 0.10 });
      else if (beat.startsWith('damage') || beat.startsWith('ram-charge')) tone({ freq: 92, endFreq: 45, duration: 0.34, type: 'sawtooth', gain: 0.46 });
      else if (beat === 'breach-entry') tone({ freq: 118, endFreq: 76, duration: 0.26, type: 'square', gain: 0.20 });
      else if (beat === 'profile-banner') chord(247);
      else if (beat === 'secured') chord(294);
    },
    close() {
      try { ctx.close?.(); } catch (_error) {}
    }
  };
}

function initialsFor(name) {
  const text = String(name || '').trim();
  if (!text) return 'P';
  const parts = text.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'P';
}

function destroyProductionBattle() {
  activeAudio?.close?.();
  activeAudio = null;
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
    delete activeStage.dataset.phaserSound;
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
  mount.dataset.version = 'v0.21.28 · Phaser Cinematic';
  const audio = createBattleAudio();
  activeAudio = audio;
  stage.dataset.phaserSound = audio.available ? 'web-audio' : 'silent';

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
        activeAudio?.close?.();
        activeAudio = null;
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
        onBeat: beat => {
          audio.playForBeat(beat);
          safeCall(onBeat, beat);
        },
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
    version: '0.21.28-phaser-production.2'
  };
}
