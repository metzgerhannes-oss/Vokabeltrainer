'use strict';

(() => {
  const stage = document.querySelector('#battleDemoStage');
  const start = document.querySelector('#battleDemoStart');
  const message = document.querySelector('#battleDemoMessage');
  const title = document.querySelector('#battleDemoActionTitle');
  const hint = document.querySelector('#battleDemoActionHint');
  const cinematicLabel = document.querySelector('#battleDemoCinematicLabel');
  const cinematicTitle = document.querySelector('#battleDemoCinematicTitle');
  const impactTitle = document.querySelector('[data-battle-impact-title]');
  const impactDamage = document.querySelector('[data-battle-impact-damage]');
  const impactTactic = document.querySelector('[data-battle-impact-tactic]');
  const choices = [...document.querySelectorAll('[data-demo-attack]')];

  const phaseClasses = ['phase-rally','phase-advance','phase-barrage','phase-impact','phase-result'];
  const transientClasses = [
    'battle-finished','is-victory','is-hold','is-impact','is-attacking','is-barrage',
    'is-strike','show-impact-callout','battle-sequence','fortress-secured',
    'attack-charge','attack-volley','attack-ram','attack-cavalry','attack-special'
  ];

  let attack = 'charge';
  let timers = [];
  let running = false;

  const copy = {
    charge: {
      label: 'Sturmangriff',
      rally: 'Die Reihen sammeln sich',
      advance: 'Die Front setzt sich in Bewegung',
      barrage: 'Der Sturmangriff beginnt',
      impact: 'Die Truppen erreichen die Verteidigung',
      result: 'Die Festung ist bezwungen',
      hit: 'Front durchbrochen'
    },
    volley: {
      label: 'Pfeilhagel',
      rally: 'Bogenschützen gehen in Stellung',
      advance: 'Die Linie rückt in Reichweite',
      barrage: 'Die Salve steigt über das Feld',
      impact: 'Pfeile treffen Zinnen und Tor',
      result: 'Die Verteidigung bricht',
      hit: 'Salve trifft'
    },
    ram: {
      label: 'Rammbock',
      rally: 'Der Rammbock wird ausgerichtet',
      advance: 'Die Mannschaft zieht zum Tor',
      barrage: 'Der letzte Anlauf beginnt',
      impact: 'Der Rammbock trifft das Tor',
      result: 'Das Tor gibt nach',
      hit: 'Tor getroffen'
    },
    cavalry: {
      label: 'Reiterangriff',
      rally: 'Die Reiter sammeln sich',
      advance: 'Die Flanke setzt sich in Bewegung',
      barrage: 'Der Angriff beschleunigt',
      impact: 'Die Reiter erreichen die Mauer',
      result: 'Die Flanke ist durchbrochen',
      hit: 'Flanke durchbrochen'
    },
    special: {
      label: 'Eliteangriff',
      rally: 'Die Elite übernimmt die Spitze',
      advance: 'Der entscheidende Vorstoß beginnt',
      barrage: 'Alle Einheiten greifen gemeinsam an',
      impact: 'Der finale Schlag trifft',
      result: 'Die Bergzitadelle fällt',
      hit: 'Entscheidender Treffer'
    }
  };

  const timings = {
    advance: 1100,
    barrage: 3000,
    impact: 4850,
    result: 6600,
    ready: 7900
  };

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  function setCinematic(labelText, titleText) {
    if (cinematicLabel) cinematicLabel.textContent = labelText;
    if (cinematicTitle) cinematicTitle.textContent = titleText;
  }

  function setPhase(phase, text) {
    stage.dataset.phase = phase;
    phaseClasses.forEach(className => stage.classList.remove(className));
    stage.classList.add('phase-' + phase);

    const order = {rally:1, advance:2, barrage:3, impact:4, result:5};
    document.querySelectorAll('.battle-phase-strip [data-battle-phase]').forEach(el => {
      const here = el.dataset.battlePhase;
      el.classList.toggle('active', here === phase);
      el.classList.toggle('done', (order[here] || 0) < (order[phase] || 0));
    });

    const labels = {
      rally: 'SAMMELN',
      advance: 'VORRÜCKEN',
      barrage: 'ANGRIFF',
      impact: 'EINSCHLAG',
      result: 'ERGEBNIS'
    };
    setCinematic(labels[phase] || 'BEREIT', copy[attack][phase] || '');
    if (text) message.textContent = text;
  }

  function layer(name, className, src) {
    const img = document.createElement('img');
    img.className = className;
    img.setAttribute('data-battle-layer', name);
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.src = src;
    return img;
  }

  function applyBattleArt() {
    const art = window.VTBattleArt;
    if (!art?.ready || stage.querySelector('[data-battle-art-stack]')) return;

    const stack = document.createElement('div');
    stack.className = 'battle-art-stack';
    stack.setAttribute('data-battle-art-stack', '');
    stack.setAttribute('aria-hidden', 'true');

    const background = layer('background', 'battle-art-layer battle-art-background', art.sceneUrl);
    background.setAttribute('data-battle-scene-art', '');
    background.dataset.battleAsset = 'dedicated';
    const army = layer('army', 'battle-art-layer battle-art-army', art.sceneUrl);
    const fortress = layer('fortress', 'battle-art-layer battle-art-fortress', art.sceneUrl);
    const atmosphere = document.createElement('div');
    atmosphere.className = 'battle-art-atmosphere';
    atmosphere.setAttribute('data-battle-layer', 'atmosphere');

    stack.append(background, army, fortress, atmosphere);
    stage.prepend(stack);

    let loaded = 0;
    const markLoaded = () => {
      loaded += 1;
      if (loaded >= 3) {
        stage.classList.add('battle-art-ready', 'battle-art-layered');
        message.className = 'battle-message';
        message.textContent = 'Kampfszene geladen. Bereit für die Vorschau.';
      }
    };
    [background, army, fortress].forEach(img => {
      img.addEventListener('load', markLoaded, {once:true});
      img.addEventListener('error', () => {
        message.className = 'battle-message';
        message.textContent = 'Kampfillustration konnte nicht geladen werden – Fallback bleibt sichtbar.';
      }, {once:true});
      if (img.complete && img.naturalWidth) markLoaded();
    });
  }

  function resetImpactCallout() {
    stage.classList.remove('show-impact-callout');
    if (impactTitle) impactTitle.textContent = 'TREFFER!';
    if (impactDamage) impactDamage.textContent = copy[attack].hit;
    if (impactTactic) impactTactic.textContent = copy[attack].label;
  }

  function reset() {
    clearTimers();
    running = false;
    [...phaseClasses, ...transientClasses].forEach(className => stage.classList.remove(className));
    delete stage.dataset.phase;
    stage.dataset.damage = 'low';
    resetImpactCallout();

    document.querySelectorAll('.battle-phase-strip [data-battle-phase]').forEach(el => {
      el.classList.remove('active','done');
    });

    message.className = 'battle-message';
    message.textContent = stage.classList.contains('battle-art-ready')
      ? 'Kampfszene geladen. Bereit für die Vorschau.'
      : 'Kampfszene wird geladen …';
    title.textContent = 'Angriff bereit';
    hint.textContent = copy[attack].label + ' auswählen und die Schlacht starten.';
    setCinematic('BEREIT', copy[attack].rally);
    start.disabled = false;
    start.textContent = 'Sequenz abspielen';
    choices.forEach(btn => btn.disabled = false);
  }

  function play() {
    if (running) return;

    clearTimers();
    running = true;
    transientClasses.forEach(className => stage.classList.remove(className));
    resetImpactCallout();
    stage.dataset.damage = 'low';
    stage.classList.add('battle-sequence', 'attack-' + attack);

    message.className = 'battle-message active';
    title.textContent = 'Schlacht läuft';
    hint.textContent = 'Die Szene folgt dem Angriff bis zum Ergebnis.';
    start.disabled = true;
    choices.forEach(btn => btn.disabled = true);

    setPhase('rally', 'Die Truppe sammelt sich vor dem Angriff.');

    timers.push(setTimeout(() => {
      stage.classList.add('is-attacking');
      setPhase('advance', 'Die Armee rückt auf die Festung vor.');
    }, timings.advance));

    timers.push(setTimeout(() => {
      stage.classList.add('is-barrage', 'is-strike');
      setPhase('barrage', copy[attack].barrage + '.');
    }, timings.barrage));

    timers.push(setTimeout(() => {
      stage.dataset.damage = 'mid';
      stage.classList.add('is-impact', 'show-impact-callout');
      setPhase('impact', copy[attack].impact + '.');
      if (impactDamage) impactDamage.textContent = copy[attack].hit;
      if (impactTactic) impactTactic.textContent = copy[attack].label;
    }, timings.impact));

    timers.push(setTimeout(() => {
      stage.classList.remove('is-attacking','is-barrage','is-strike','is-impact','show-impact-callout');
      stage.classList.add('battle-finished','is-victory','fortress-secured');
      stage.dataset.damage = 'high';
      setPhase('result', 'Die Festung ist bezwungen.');
      message.className = 'battle-message victory';
      message.innerHTML = '<strong>Festung bezwungen</strong><span>Die Szene beruhigt sich und zeigt das Ergebnis klar.</span>';
    }, timings.result));

    timers.push(setTimeout(() => {
      stage.classList.remove('battle-sequence');
      running = false;
      title.textContent = 'Vorschau abgeschlossen';
      hint.textContent = 'Andere Angriffsart wählen oder die Sequenz erneut abspielen.';
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
  document.addEventListener('vt-battle-art-ready', applyBattleArt);

  window.addEventListener('load', () => {
    applyBattleArt();

    const params = new URLSearchParams(location.search);
    const requested = params.get('attack');
    const requestedButton = choices.find(btn => btn.dataset.demoAttack === requested);
    if (requestedButton) {
      attack = requested;
      choices.forEach(x => x.classList.toggle('active', x === requestedButton));
      reset();
    }

    if (params.get('autoplay') !== '0') timers.push(setTimeout(play, 900));
  });
})();
