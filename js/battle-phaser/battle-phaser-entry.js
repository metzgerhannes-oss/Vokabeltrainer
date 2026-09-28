'use strict';

import Phaser from '../vendor/phaser-4.2.1.esm.min.js';
import { createBattleSceneClass } from './battle-phaser-scene.js';

const PREVIEW_VERSION = '0.21.25-phaser.3.1';
const PREVIEW_BUILD = 'attacks-gate-entry-profile-banner';
window.__VT_PHASER_PREVIEW_VERSION__ = PREVIEW_VERSION;
window.__VT_PHASER_PREVIEW_BUILD__ = PREVIEW_BUILD;

const stage = document.querySelector('#phaserBattleStage');
const mount = document.querySelector('#phaserBattleCanvas');
const start = document.querySelector('#phaserBattleStart');
const message = document.querySelector('#phaserBattleMessage');
const actionTitle = document.querySelector('#phaserBattleActionTitle');
const actionHint = document.querySelector('#phaserBattleActionHint');
const phaseLabel = document.querySelector('#phaserBattleCinematicLabel');
const phaseTitle = document.querySelector('#phaserBattleCinematicTitle');
const fallback = document.querySelector('#phaserBattleFallback');
const selector = document.querySelector('#phaserAttackSelector');

const ATTACKS = {
  charge: {
    label: 'Sturmangriff',
    short: 'Sturm',
    role: 'Infanterie',
    icon: '⚔',
    phase: {
      barrage: ['STURM', 'Die geschlossene Front beschleunigt'],
      impact: ['AUFPRALL', 'Die Formation trifft auf die Verteidigung']
    }
  },
  volley: {
    label: 'Pfeilhagel',
    short: 'Pfeile',
    role: 'Bogenschützen',
    icon: '➶',
    phase: {
      barrage: ['SALVEN', 'Mehrere Pfeilwellen steigen über das Feld'],
      impact: ['TREFFER', 'Die Salven erreichen Zinnen und Tor']
    }
  },
  ram: {
    label: 'Rammbock',
    short: 'Rammbock',
    role: 'Belagerung',
    icon: '▰',
    phase: {
      barrage: ['ANGRIFF', 'Pfeile decken den Vormarsch des Rammbocks'],
      impact: ['DURCHBRUCH', 'Der Rammbock trifft das Tor']
    }
  },
  cavalry: {
    label: 'Reiterangriff',
    short: 'Reiter',
    role: 'Kavallerie',
    icon: '♞',
    phase: {
      barrage: ['FLANKE', 'Die Reiter ziehen an der Verteidigung vorbei'],
      impact: ['ZUGRIFF', 'Die schnelle Flanke erreicht die Torzone']
    }
  },
  special: {
    label: 'Eliteangriff',
    short: 'Elite',
    role: 'Eliteverbund',
    icon: '★',
    phase: {
      barrage: ['ELITE', 'Salve, Flanke und Belagerung greifen ineinander'],
      impact: ['KOORDINIERT', 'Der kombinierte Angriff trifft die Torzone']
    }
  }
};

const params = new URLSearchParams(location.search);
const requestedAttack = params.get('attack');
let selectedAttack = ATTACKS[requestedAttack] ? requestedAttack : 'ram';
const captureOutcome = params.get('outcome') !== 'hit';
const profileName = String(params.get('profile') || 'Mein Profil').trim();
const profileInitials = profileName.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'P';

const genericPhaseCopy = {
  ready: ['BEREIT', 'Die Armee wartet auf dein Signal'],
  rally: ['SAMMELN', 'Die Reihen sammeln sich'],
  advance: ['VORRÜCKEN', 'Die Armee setzt sich in Bewegung'],
  barrage: ['ANGRIFF', 'Die Angriffswelle beginnt'],
  impact: ['EINSCHLAG', 'Der Angriff erreicht die Verteidigung'],
  result: captureOutcome ? ['ÜBERNAHME', 'Die Festung wird übernommen'] : ['TREFFER', 'Die Festung bleibt beschädigt zurück']
};

let game = null;
let scene = null;
let running = false;

function attackMeta() {
  return ATTACKS[selectedAttack] || ATTACKS.ram;
}

function phaseCopyFor(phase) {
  return attackMeta().phase?.[phase] || genericPhaseCopy[phase] || genericPhaseCopy.ready;
}

function setPhase(phase) {
  window.__VT_PHASER_BATTLE_PHASES__ = window.__VT_PHASER_BATTLE_PHASES__ || [];
  window.__VT_PHASER_BATTLE_PHASES__.push(phase);
  stage.dataset.phase = phase;
  const [label, title] = phaseCopyFor(phase);
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
  if (beat === 'profile-banner' || beat === 'secured') stage.dataset.control = 'own';
  if (beat === 'breach-entry') stage.dataset.captureStep = 'entering';
  if (beat === 'profile-banner') stage.dataset.captureStep = 'banner';
  if (beat === 'secured') stage.dataset.captureStep = 'secured';
}

function syncAttackUi() {
  const meta = attackMeta();
  stage.dataset.attack = selectedAttack;
  stage.dataset.outcome = captureOutcome ? 'capture' : 'hit';
  window.__VT_PHASER_BATTLE_ATTACK__ = selectedAttack;
  window.__VT_PHASER_BATTLE_OUTCOME__ = captureOutcome ? 'capture' : 'hit';

  document.querySelectorAll('[data-phaser-attack]').forEach(button => {
    const active = button.dataset.phaserAttack === selectedAttack;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    button.disabled = running;
  });

  if (!running) {
    start.textContent = meta.short + ': Sequenz abspielen';
    actionTitle.textContent = meta.label + ' bereit';
    actionHint.textContent = meta.role + ' steht im visuellen Mittelpunkt. Fachlicher Schaden wird hier nicht berechnet.';
    message.className = 'phaser-battle-message';
    setStatus(captureOutcome
      ? meta.label + ' gewählt. Die Vorschau endet mit einer tatsächlichen Übernahme.'
      : meta.label + ' gewählt. Die Vorschau endet als normaler Treffer ohne Bannerwechsel.');
    setPhase('ready');
  }
}

function readyUi() {
  running = false;
  start.disabled = false;
  syncAttackUi();
}

function completeUi() {
  window.__VT_PHASER_BATTLE_COMPLETE__ = true;
  running = false;
  start.disabled = false;
  const meta = attackMeta();
  start.textContent = meta.short + ': Nochmal abspielen';
  actionTitle.textContent = 'Vorschau abgeschlossen';
  actionHint.textContent = captureOutcome
    ? 'Die Eroberung ist als eigenes Outcome sichtbar und nicht Teil jedes Angriffs.'
    : 'Dieser Angriff zeigt nur Beschädigung; die Festung bleibt gegnerisch.';
  message.className = captureOutcome ? 'phaser-battle-message victory' : 'phaser-battle-message';
  message.innerHTML = captureOutcome
    ? '<strong>Festung übernommen</strong><span>Das eigene Banner erscheint erst nach dem bestätigten Eroberungs-Outcome.</span>'
    : '<strong>Angriff abgeschlossen</strong><span>Die Festung ist sichtbar beschädigt, aber noch nicht übernommen.</span>';
  stage.classList.add('is-complete');
  document.querySelectorAll('[data-phaser-attack]').forEach(button => { button.disabled = false; });
}

function failUi(error) {
  console.error('Phaser battle demo failed', error);
  stage.classList.add('phaser-failed');
  fallback.hidden = false;
  start.disabled = true;
  actionTitle.textContent = 'Phaser-Vorschau nicht verfügbar';
  actionHint.textContent = 'Der Renderer konnte auf diesem Gerät nicht gestartet werden.';
  message.className = 'phaser-battle-message';
  message.textContent = 'Die Kampfvorschau konnte nicht gestartet werden.';
}

function selectAttack(mode) {
  if (running || !ATTACKS[mode]) return;
  selectedAttack = mode;
  syncAttackUi();
  const url = new URL(location.href);
  url.searchParams.set('attack', mode);
  url.searchParams.set('outcome', captureOutcome ? 'capture' : 'hit');
  history.replaceState(null, '', url);
}

async function boot() {
  try {
    const BattleScene = createBattleSceneClass(Phaser, {
      profileInitials,
      onReady: ({ reducedMotion }) => {
        scene = game.scene.getScene('BattleSpike');
        stage.classList.add('phaser-ready');
        fallback.hidden = true;
        stage.dataset.reducedMotion = reducedMotion ? 'true' : 'false';
        window.__VT_PHASER_BATTLE_READY__ = true;
        readyUi();

        if (params.get('autoplay') !== '0') {
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

selector?.addEventListener('click', event => {
  const button = event.target.closest('[data-phaser-attack]');
  if (button) selectAttack(button.dataset.phaserAttack);
});

start.addEventListener('click', () => {
  if (running || !scene) return;
  running = true;
  stage.classList.remove('is-complete');
  delete stage.dataset.damage;
  delete stage.dataset.control;
  window.__VT_PHASER_BATTLE_COMPLETE__ = false;
  window.__VT_PHASER_BATTLE_BEATS__ = [];
  window.__VT_PHASER_BATTLE_PHASES__ = [];
  start.disabled = true;
  document.querySelectorAll('[data-phaser-attack]').forEach(button => { button.disabled = true; });
  actionTitle.textContent = attackMeta().label + ' läuft';
  actionHint.textContent = 'Phaser animiert nur die Darstellung. Ergebnis und Schaden bleiben externe Zustände.';
  message.className = 'phaser-battle-message active';
  scene.playSequence(selectedAttack, captureOutcome);
});

window.addEventListener('error', event => {
  if (!stage.classList.contains('phaser-ready')) failUi(event.error || new Error(event.message));
});

syncAttackUi();
boot();
