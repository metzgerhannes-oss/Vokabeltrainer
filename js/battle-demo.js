'use strict';

(() => {
  const stage = document.querySelector('#battleDemoStage');
  const start = document.querySelector('#battleDemoStart');
  const message = document.querySelector('#battleDemoMessage');
  const title = document.querySelector('#battleDemoActionTitle');
  const hint = document.querySelector('#battleDemoActionHint');
  const choices = [...document.querySelectorAll('[data-demo-attack]')];
  let attack = 'charge';
  let timers = [];
  let running = false;

  const copy = {
    charge: {
      label: 'Sturmangriff',
      barrage: 'Die erste Angriffswelle beginnt!',
      impact: 'Die Truppen prallen auf die Verteidigung!'
    },
    volley: {
      label: 'Pfeilhagel',
      barrage: 'Bogenschützen eröffnen den Pfeilhagel!',
      impact: 'Die Salven schlagen auf Zinnen und Tor ein!'
    },
    ram: {
      label: 'Rammbock',
      barrage: 'Der Rammbock wird nach vorne gebracht!',
      impact: 'Der Rammbock kracht gegen das Tor!'
    },
    cavalry: {
      label: 'Reiterangriff',
      barrage: 'Die Reiter setzen zum Flankenangriff an!',
      impact: 'Die Reiter erreichen die Festungsmauer!'
    },
    special: {
      label: 'Eliteangriff',
      barrage: 'Die Eliteeinheiten führen den Angriff an!',
      impact: 'Die Elite trifft mit voller Wucht!'
    }
  };

  const timings = {
    advance: 1150,
    barrage: 3200,
    impact: 5200,
    result: 7150,
    ready: 8350
  };

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function setPhase(phase, text) {
    stage.dataset.phase = phase;
    stage.classList.remove('phase-rally', 'phase-advance', 'phase-barrage', 'phase-impact', 'phase-result');
    stage.classList.add('phase-' + phase);
    const order = {rally:1, advance:2, barrage:3, impact:4, result:5};
    document.querySelectorAll('.battle-phase-strip [data-battle-phase]').forEach(el => {
      const here = el.dataset.battlePhase;
      el.classList.toggle('active', here === phase);
      el.classList.toggle('done', (order[here] || 0) < (order[phase] || 0));
    });
    if (text) message.textContent = text;
  }

  function reset() {
    clearTimers();
    running = false;
    stage.className = 'battle-stage season-autumn subject-english gear-3 fortress-stage-citadel boss-stage';
    delete stage.dataset.phase;
    document.querySelectorAll('.battle-phase-strip [data-battle-phase]').forEach(el => el.classList.remove('active','done'));
    message.className = 'battle-message';
    message.textContent = 'Bereit für die Vorschau.';
    title.textContent = 'Angriff bereit';
    hint.textContent = copy[attack].label + ' auswählen und die Schlacht starten.';
    start.disabled = false;
    start.textContent = 'Sequenz abspielen';
    choices.forEach(btn => btn.disabled = false);
  }

  function play() {
    if (running) return;
    clearTimers();
    running = true;
    stage.classList.remove('battle-finished','is-victory','is-hold','is-impact','is-attacking','is-barrage','battle-sequence');
    stage.classList.add('battle-sequence', 'attack-' + attack);
    message.className = 'battle-message active';
    title.textContent = 'Schlacht läuft';
    hint.textContent = 'Die 5-Phasen-Sequenz läuft bis zum Ergebnis.';
    start.disabled = true;
    choices.forEach(btn => btn.disabled = true);

    setPhase('rally', 'Die Reihen schließen sich. Standarten hoch!');

    timers.push(setTimeout(() => {
      stage.classList.add('is-attacking');
      setPhase('advance', 'Die Armee rückt geschlossen auf die Festung vor.');
    }, timings.advance));

    timers.push(setTimeout(() => {
      stage.classList.add('is-barrage');
      setPhase('barrage', copy[attack].barrage);
    }, timings.barrage));

    timers.push(setTimeout(() => {
      stage.classList.add('is-impact');
      setPhase('impact', copy[attack].impact);
    }, timings.impact));

    timers.push(setTimeout(() => {
      stage.classList.remove('is-attacking','is-barrage');
      stage.classList.add('battle-finished','is-victory');
      setPhase('result');
      message.className = 'battle-message victory';
      message.innerHTML = '<strong>Boss besiegt!</strong><span>Der Torwächter gibt den Weg frei. Die Bergzitadelle ist bezwungen.</span>';
    }, timings.result));

    timers.push(setTimeout(() => {
      stage.classList.remove('battle-sequence','is-impact');
      running = false;
      title.textContent = 'Vorschau abgeschlossen';
      hint.textContent = 'Du kannst die Sequenz erneut oder mit einer anderen Angriffsart abspielen.';
      start.disabled = false;
      start.textContent = 'Nochmal abspielen';
      choices.forEach(btn => btn.disabled = false);
    }, timings.ready));
  }

  choices.forEach(btn => btn.addEventListener('click', () => {
    if (running) return;
    attack = btn.dataset.demoAttack || 'charge';
    choices.forEach(x => x.classList.toggle('active', x === btn));
    reset();
  }));

  start.addEventListener('click', play);

  window.addEventListener('load', () => {
    const auto = new URLSearchParams(location.search).get('autoplay');
    if (auto !== '0') timers.push(setTimeout(play, 550));
  });
})();
