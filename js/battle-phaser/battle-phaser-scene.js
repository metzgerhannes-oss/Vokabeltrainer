'use strict';

const WORLD_WIDTH = 1480;
const WORLD_HEIGHT = 720;

const C = {
  skyTop: 0x90b6c7,
  skyBottom: 0xd8cfac,
  haze: 0xf2dfb6,
  mountainFar: 0x748b83,
  mountainNear: 0x566e5c,
  grassFar: 0x70815b,
  grassNear: 0x475c3e,
  earth: 0x8b704f,
  path: 0xb69a72,
  stone: 0x8d8a7e,
  stoneDark: 0x67675f,
  stoneLight: 0xb2ad9e,
  wood: 0x65442f,
  woodDark: 0x3d2c25,
  blue: 0x385f86,
  blueLight: 0x5f86aa,
  gold: 0xd2a84f,
  goldLight: 0xf0cf76,
  red: 0x9e4439,
  redDark: 0x6b312d,
  steel: 0x7f9097,
  steelLight: 0xb8c3c7,
  leather: 0x6a4b38,
  skin: 0xd7a77e,
  horse: 0x8b8175,
  horseDark: 0x574f48,
  dust: 0xc9ab7a,
  fire: 0xe86f2a,
  fireLight: 0xffd36a,
  ember: 0xffa13a,
  smoke: 0x4d4a45
};

function g(scene) {
  return scene.add.graphics();
}

function drawBackdrop(scene) {
  const sky = g(scene).setScrollFactor(0);
  sky.fillStyle(C.skyTop, 1).fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  sky.fillStyle(C.skyBottom, 0.45).fillRect(0, 210, WORLD_WIDTH, 250);
  sky.setDepth(-100);

  const sun = scene.add.circle(1110, 122, 70, 0xffe4a1, 0.34).setScrollFactor(0.08).setDepth(-96);
  const sunCore = scene.add.circle(1110, 122, 34, 0xffefba, 0.55).setScrollFactor(0.08).setDepth(-95);

  const far = g(scene).setScrollFactor(0.12).setDepth(-90);
  far.fillStyle(C.mountainFar, 0.52);
  far.fillTriangle(-80, 420, 240, 150, 520, 420);
  far.fillTriangle(260, 420, 620, 190, 900, 420);
  far.fillTriangle(760, 420, 1120, 170, 1510, 420);
  far.fillStyle(C.haze, 0.18).fillRect(0, 350, WORLD_WIDTH, 90);

  const near = g(scene).setScrollFactor(0.32).setDepth(-80);
  near.fillStyle(C.mountainNear, 0.78);
  near.beginPath();
  near.moveTo(0, 450);
  near.lineTo(0, 348);
  near.lineTo(120, 300);
  near.lineTo(260, 338);
  near.lineTo(420, 278);
  near.lineTo(570, 330);
  near.lineTo(740, 285);
  near.lineTo(930, 350);
  near.lineTo(1100, 292);
  near.lineTo(1260, 344);
  near.lineTo(1480, 296);
  near.lineTo(1480, 450);
  near.closePath();
  near.fillPath();

  const mid = g(scene).setScrollFactor(0.62).setDepth(-70);
  mid.fillStyle(C.grassFar, 1);
  mid.beginPath();
  mid.moveTo(0, 430);
  mid.lineTo(0, 380);
  mid.lineTo(160, 390);
  mid.lineTo(310, 358);
  mid.lineTo(460, 392);
  mid.lineTo(650, 362);
  mid.lineTo(840, 395);
  mid.lineTo(1050, 360);
  mid.lineTo(1240, 392);
  mid.lineTo(1480, 370);
  mid.lineTo(1480, 530);
  mid.lineTo(0, 530);
  mid.closePath();
  mid.fillPath();

  const ground = g(scene).setDepth(-60);
  ground.fillStyle(C.grassNear, 1).fillRect(0, 465, WORLD_WIDTH, 255);
  ground.fillStyle(C.earth, 0.5);
  ground.beginPath();
  ground.moveTo(0, 650);
  ground.lineTo(350, 600);
  ground.lineTo(760, 570);
  ground.lineTo(1130, 530);
  ground.lineTo(1480, 510);
  ground.lineTo(1480, 720);
  ground.lineTo(0, 720);
  ground.closePath();
  ground.fillPath();

  const path = g(scene).setDepth(-58);
  path.fillStyle(C.path, 0.9);
  path.beginPath();
  path.moveTo(0, 675);
  path.lineTo(300, 618);
  path.lineTo(700, 590);
  path.lineTo(1100, 548);
  path.lineTo(1480, 536);
  path.lineTo(1480, 650);
  path.lineTo(1100, 640);
  path.lineTo(700, 665);
  path.lineTo(300, 690);
  path.lineTo(0, 720);
  path.closePath();
  path.fillPath();

  const detail = g(scene).setDepth(-55);
  for (let i = 0; i < 52; i += 1) {
    const x = 18 + ((i * 97) % 1420);
    const y = 474 + ((i * 43) % 205);
    const h = 5 + (i % 4) * 2;
    detail.lineStyle(1 + (i % 2), 0x91a16c, 0.5);
    detail.lineBetween(x, y, x - 2, y - h);
    detail.lineBetween(x + 2, y, x + 4, y - h + 1);
  }

  return { sky, sun, sunCore, far, near, mid, ground, path, detail };
}

function createBanner(scene, x, y, color, crest = true) {
  const c = scene.add.container(x, y);
  const pole = g(scene);
  pole.fillStyle(C.woodDark, 1).fillRect(-3, -58, 6, 116);
  pole.fillStyle(C.gold, 1).fillCircle(0, -62, 6);
  const cloth = g(scene);
  cloth.fillStyle(color, 1);
  cloth.beginPath();
  cloth.moveTo(4, -52);
  cloth.lineTo(52, -46);
  cloth.lineTo(43, -15);
  cloth.lineTo(5, -22);
  cloth.closePath();
  cloth.fillPath();
  if (crest) {
    cloth.fillStyle(C.goldLight, 0.95).fillCircle(26, -34, 8);
    cloth.fillStyle(C.gold, 1).fillTriangle(19, -29, 33, -29, 26, -16);
  }
  c.add([pole, cloth]);
  c.setDepth(5);
  c.__cloth = cloth;
  c.__baseRotation = 0;
  return c;
}

function createSoldier(scene, x, y, opts = {}) {
  const { elite = false, archer = false, cavalry = false, scale = 1 } = opts;
  const c = scene.add.container(x, y).setScale(scale);
  const shadow = scene.add.ellipse(0, 27, cavalry ? 62 : 38, 12, 0x000000, 0.22);
  const body = g(scene);

  if (cavalry) {
    body.fillStyle(C.horseDark, 1).fillEllipse(-3, 8, 66, 30);
    body.fillStyle(C.horse, 1).fillEllipse(24, -2, 25, 31);
    body.fillStyle(C.horseDark, 1).fillTriangle(31, -18, 39, -32, 43, -13);
    body.fillStyle(C.horseDark, 1).fillRect(-24, 18, 6, 26);
    body.fillRect(8, 18, 6, 26);
    body.fillStyle(C.blue, 1).fillRoundedRect(-14, -30, 26, 42, 7);
    body.fillStyle(C.steel, 1).fillCircle(-2, -40, 12);
    body.fillStyle(C.skin, 1).fillCircle(-2, -36, 9);
    body.fillStyle(C.steel, 1).fillRect(-14, -42, 24, 5);
    body.lineStyle(3, C.steelLight, 1).lineBetween(7, -24, 28, -54);
    body.fillStyle(C.blueLight, 1).fillTriangle(-18, -18, -37, 10, -7, 7);
  } else {
    body.fillStyle(elite ? C.blueLight : C.blue, 1).fillRoundedRect(-13, -18, 26, 42, 7);
    body.fillStyle(C.leather, 0.9).fillRect(-11, 8, 22, 5);
    body.fillStyle(C.steel, 1).fillCircle(0, -30, 12);
    body.fillStyle(C.skin, 1).fillCircle(0, -26, 9);
    body.fillStyle(C.steel, 1).fillRect(-12, -32, 24, 5);
    body.lineStyle(2, C.steelLight, 0.8).lineBetween(-11, -31, 11, -31);
    body.fillStyle(C.steelLight, 1).fillRect(-11, 23, 8, 19);
    body.fillRect(3, 23, 8, 19);

    if (archer) {
      body.lineStyle(3, C.wood, 1);
      body.beginPath();
      body.arc(18, -4, 16, -1.15, 1.15, false);
      body.strokePath();
      body.lineStyle(1, C.goldLight, 0.9).lineBetween(24, -19, 24, 11);
    } else {
      body.fillStyle(elite ? C.goldLight : C.steel, 1).fillCircle(-18, 1, 14);
      body.lineStyle(2, C.gold, 0.9).strokeCircle(-18, 1, 14);
      body.lineStyle(3, C.steelLight, 1).lineBetween(13, -10, 37, -42);
      body.fillStyle(C.steelLight, 1).fillTriangle(34, -40, 42, -50, 39, -35);
    }
  }

  c.add([shadow, body]);
  c.setDepth(10 + Math.round(y / 10));
  c.__body = body;
  c.__shadow = shadow;
  c.__baseY = y;
  c.__phase = (x * 0.021 + y * 0.013) % (Math.PI * 2);
  c.__speed = 0.0034 + ((x + y) % 7) * 0.00008;
  c.__cavalry = cavalry;
  c.__archer = archer;
  c.__elite = elite;
  return c;
}

function createRam(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(25);
  const shadow = scene.add.ellipse(0, 29, 110, 18, 0x000000, 0.22);
  const body = g(scene);
  body.fillStyle(C.woodDark, 1).fillRoundedRect(-54, -28, 108, 42, 10);
  body.fillStyle(C.blue, 1).fillTriangle(-56, -25, 0, -55, 56, -25);
  body.lineStyle(3, C.gold, 0.9).lineBetween(-47, -25, 47, -25);
  body.fillStyle(C.wood, 1).fillRoundedRect(-74, -2, 128, 12, 6);
  body.fillStyle(C.steelLight, 1).fillTriangle(54, -8, 79, 4, 54, 16);
  body.fillStyle(C.gold, 1).fillCircle(-34, 24, 15);
  body.fillCircle(31, 24, 15);
  body.fillStyle(C.woodDark, 1).fillCircle(-34, 24, 8);
  body.fillCircle(31, 24, 8);
  c.add([shadow, body]);
  c.__baseY = y;
  c.__body = body;
  return c;
}

function createFortress(scene, x, y, profileInitials = 'P') {
  const root = scene.add.container(x, y).setDepth(2);

  const back = g(scene);
  back.fillStyle(0x000000, 0.18).fillRoundedRect(-177, -183, 368, 220, 18);
  back.fillStyle(C.stoneDark, 1).fillRoundedRect(-170, -176, 350, 205, 14);
  back.fillStyle(C.stone, 1).fillRect(-152, -148, 314, 176);
  back.fillStyle(C.stoneLight, 0.42).fillRect(-144, -140, 298, 12);

  const towerLeft = g(scene);
  towerLeft.fillStyle(C.stoneDark, 1).fillRect(-205, -188, 78, 220);
  towerLeft.fillStyle(C.stone, 1).fillRect(-197, -178, 62, 202);
  towerLeft.fillStyle(C.stoneLight, 0.45).fillRect(-190, -170, 48, 10);
  towerLeft.fillStyle(C.stoneDark, 1);
  for (let i = 0; i < 4; i += 1) towerLeft.fillRect(-203 + i * 22, -205, 15, 28);

  const towerRight = g(scene);
  towerRight.fillStyle(C.stoneDark, 1).fillRect(125, -188, 78, 220);
  towerRight.fillStyle(C.stone, 1).fillRect(133, -178, 62, 202);
  towerRight.fillStyle(C.stoneLight, 0.45).fillRect(140, -170, 48, 10);
  towerRight.fillStyle(C.stoneDark, 1);
  for (let i = 0; i < 4; i += 1) towerRight.fillRect(127 + i * 22, -205, 15, 28);

  const keep = g(scene);
  keep.fillStyle(C.stoneDark, 1).fillRoundedRect(-86, -250, 172, 102, 8);
  keep.fillStyle(C.stone, 1).fillRect(-78, -240, 156, 95);
  keep.fillStyle(C.stoneLight, 0.5).fillRect(-67, -230, 134, 9);
  keep.fillStyle(C.stoneDark, 1);
  for (let i = 0; i < 5; i += 1) keep.fillRect(-82 + i * 41, -266, 22, 28);

  const blocks = g(scene);
  blocks.lineStyle(1, C.stoneDark, 0.28);
  for (let yy = -135; yy < 15; yy += 24) {
    blocks.lineBetween(-145, yy, 155, yy);
  }
  for (let xx = -136; xx < 155; xx += 42) {
    blocks.lineBetween(xx, -140, xx, 16);
  }

  const gate = g(scene);
  gate.fillStyle(C.woodDark, 1).fillRoundedRect(-42, -72, 84, 100, 38);
  gate.fillStyle(C.wood, 1).fillRoundedRect(-34, -66, 68, 94, 32);
  gate.lineStyle(4, C.woodDark, 0.75);
  for (let xx = -22; xx <= 22; xx += 22) gate.lineBetween(xx, -58, xx, 20);
  gate.lineStyle(3, C.steel, 0.8).lineBetween(-31, -4, 31, -4);

  const enemyBanner = createBanner(scene, 0, -278, C.red, false);
  enemyBanner.setScale(0.78).setDepth(4);
  enemyBanner.__cloth.fillStyle(C.goldLight, 1).fillCircle(26, -34, 6);

  const ownBanner = createBanner(scene, 0, -245, C.blue, false);
  const profileMark = scene.add.text(27, -34, String(profileInitials || 'P').slice(0, 2).toUpperCase(), {
    fontFamily: 'Arial, sans-serif',
    fontSize: '15px',
    fontStyle: 'bold',
    color: '#fff1c4'
  }).setOrigin(0.5);
  ownBanner.add(profileMark);
  ownBanner.setScale(0.82).setAlpha(0).setY(ownBanner.y + 38).setDepth(5);
  ownBanner.__profileMark = profileMark;

  const cracks = g(scene).setAlpha(0);
  cracks.lineStyle(4, 0x423a34, 0.8);
  cracks.lineBetween(-52, -98, -35, -72);
  cracks.lineBetween(-35, -72, -47, -51);
  cracks.lineBetween(59, -74, 42, -51);
  cracks.lineBetween(42, -51, 55, -32);

  const damage1 = g(scene).setAlpha(0);
  damage1.fillStyle(C.stoneDark, 0.9);
  damage1.fillTriangle(-71, -35, -48, -58, -41, -25);
  damage1.fillTriangle(46, -36, 70, -62, 63, -24);
  damage1.fillStyle(C.woodDark, 1).fillRect(-31, -31, 14, 7);
  damage1.fillRect(10, -7, 18, 7);
  damage1.lineStyle(3, 0x3c342f, 0.82);
  damage1.lineBetween(-78, -94, -61, -74);
  damage1.lineBetween(-61, -74, -70, -55);
  damage1.lineBetween(78, -85, 61, -68);
  damage1.lineBetween(61, -68, 70, -48);

  const breach = g(scene).setAlpha(0);
  breach.fillStyle(0x373632, 0.96);
  breach.beginPath();
  breach.moveTo(-59, 26);
  breach.lineTo(-62, -43);
  breach.lineTo(-47, -71);
  breach.lineTo(-24, -86);
  breach.lineTo(7, -82);
  breach.lineTo(39, -62);
  breach.lineTo(55, -35);
  breach.lineTo(54, 26);
  breach.closePath();
  breach.fillPath();

  const rubblePile = g(scene).setAlpha(0);
  rubblePile.fillStyle(C.stoneDark, 1);
  rubblePile.fillTriangle(-72, 28, -42, -12, -18, 28);
  rubblePile.fillTriangle(-31, 28, -4, -20, 22, 28);
  rubblePile.fillTriangle(8, 28, 41, -10, 68, 28);
  rubblePile.fillStyle(C.stone, 1);
  rubblePile.fillRect(-55, 12, 23, 15);
  rubblePile.fillRect(-12, 7, 27, 20);
  rubblePile.fillRect(31, 15, 22, 12);

  const scorch = g(scene).setAlpha(0);
  scorch.fillStyle(0x1f1d1b, 0.36).fillEllipse(-45, -51, 56, 42);
  scorch.fillStyle(0x1f1d1b, 0.28).fillEllipse(48, -36, 62, 48);
  scorch.fillStyle(0x34231d, 0.25).fillEllipse(4, -12, 90, 54);

  root.add([back, towerLeft, towerRight, keep, blocks, gate, breach, scorch, rubblePile, cracks, damage1]);
  root.add(enemyBanner);
  root.add(ownBanner);

  root.__gate = gate;
  root.__cracks = cracks;
  root.__damage1 = damage1;
  root.__breach = breach;
  root.__rubblePile = rubblePile;
  root.__scorch = scorch;
  root.__enemyBanner = enemyBanner;
  root.__ownBanner = ownBanner;
  root.__baseX = x;
  root.__baseY = y;
  return root;
}

function createCampProps(scene) {
  const flag = createBanner(scene, 92, 480, C.blue, true);
  flag.setDepth(4);
  const stakes = g(scene).setDepth(8);
  stakes.lineStyle(5, C.woodDark, 0.85);
  for (let i = 0; i < 7; i += 1) {
    const x = 40 + i * 34;
    stakes.lineBetween(x, 650, x + 10, 602);
    stakes.lineBetween(x + 2, 611, x + 22, 632);
  }
  return { flag, stakes };
}

function emitDust(scene, x, y, amount = 18) {
  for (let i = 0; i < amount; i += 1) {
    const p = scene.add.circle(
      x + scene.__Phaser.Math.Between(-24, 24),
      y + scene.__Phaser.Math.Between(-8, 14),
      scene.__Phaser.Math.Between(6, 15),
      C.dust,
      0.32 + Math.random() * 0.28
    ).setDepth(40);
    scene.__dynamic.push(p);
    const tx = p.x + scene.__Phaser.Math.Between(-80, 80);
    const ty = p.y - scene.__Phaser.Math.Between(35, 115);
    scene.tweens.add({
      targets: p,
      x: tx,
      y: ty,
      alpha: 0,
      scale: 1.8 + Math.random() * 1.5,
      duration: scene.__Phaser.Math.Between(650, 1150),
      ease: 'Sine.Out',
      onComplete: () => p.destroy()
    });
  }
}

function emitRubble(scene, x, y, amount = 16) {
  for (let i = 0; i < amount; i += 1) {
    const p = scene.add.rectangle(
      x + scene.__Phaser.Math.Between(-16, 16),
      y + scene.__Phaser.Math.Between(-20, 12),
      scene.__Phaser.Math.Between(5, 12),
      scene.__Phaser.Math.Between(4, 10),
      i % 3 === 0 ? C.wood : C.stoneDark,
      1
    ).setDepth(45);
    scene.__dynamic.push(p);
    const vx = scene.__Phaser.Math.Between(-120, 120);
    const vy = scene.__Phaser.Math.Between(-150, -55);
    const duration = scene.__Phaser.Math.Between(700, 1100);
    const startX = p.x;
    const startY = p.y;
    const state = { t: 0 };
    scene.tweens.add({
      targets: state,
      t: 1,
      duration,
      ease: 'Quad.Out',
      onUpdate: () => {
        const t = state.t;
        p.x = startX + vx * t;
        p.y = startY + vy * t + 210 * t * t;
        p.rotation += 0.12;
        p.alpha = 1 - Math.max(0, (t - 0.72) / 0.28);
      },
      onComplete: () => p.destroy()
    });
  }
}

function createFireCluster(scene, x, y, scale = 1) {
  const root = scene.add.container(x, y).setDepth(52).setScale(scale);
  const glow = scene.add.circle(0, 0, 25, C.ember, 0.16);
  glow.setBlendMode?.(scene.__Phaser.BlendModes.ADD);

  const flameOuter = scene.add.ellipse(0, -8, 24, 42, C.fire, 0.9);
  const flameInner = scene.add.ellipse(0, -10, 12, 29, C.fireLight, 0.95);
  const ember = scene.add.circle(4, -3, 5, C.fireLight, 0.9);
  const smoke1 = scene.add.circle(-4, -30, 13, C.smoke, 0.28);
  const smoke2 = scene.add.circle(7, -47, 17, C.smoke, 0.2);
  root.add([glow, flameOuter, flameInner, ember, smoke1, smoke2]);
  scene.__dynamic.push(root);

  scene.tweens.add({
    targets: flameOuter,
    scaleX: 0.72,
    scaleY: 1.17,
    x: 2,
    duration: 260,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.InOut'
  });
  scene.tweens.add({
    targets: flameInner,
    scaleX: 0.78,
    scaleY: 1.2,
    x: -2,
    duration: 190,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.InOut'
  });
  scene.tweens.add({
    targets: [smoke1, smoke2],
    y: '-=34',
    x: '+=8',
    alpha: 0.04,
    scale: 1.45,
    duration: 1250,
    stagger: 220,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.Out'
  });
  scene.tweens.add({
    targets: glow,
    alpha: 0.27,
    scale: 1.18,
    duration: 360,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.InOut'
  });

  return root;
}

function igniteFortress(scene) {
  if (scene.__fires?.length) return scene.__fires;
  scene.__fires = [
    createFireCluster(scene, 1162, 520, 0.82),
    createFireCluster(scene, 1218, 491, 0.62),
    createFireCluster(scene, 1262, 526, 0.72)
  ];
  return scene.__fires;
}

function calmFires(scene, duration = 950) {
  for (const fire of scene.__fires || []) {
    if (!fire?.active) continue;
    scene.tweens.add({
      targets: fire,
      alpha: 0.28,
      scaleX: fire.scaleX * 0.78,
      scaleY: fire.scaleY * 0.78,
      duration,
      ease: 'Sine.Out'
    });
  }
}

function marchUnitsIntoFortress(scene, units, scale = 1) {
  const ordered = [...units].sort((a, b) => (b.x || 0) - (a.x || 0));
  ordered.forEach((u, i) => {
    const delay = i * 115 * scale;
    const laneOffset = (i % 3 - 1) * 10;
    scene.tweens.add({
      targets: u,
      x: 1155 - (i % 2) * 12,
      y: 548 + laneOffset,
      duration: 720 * scale,
      delay,
      ease: 'Sine.InOut',
      onComplete: () => {
        u.setDepth(1);
        scene.tweens.add({
          targets: u,
          x: 1225 + (i % 2) * 8,
          y: 512 + (i % 3) * 4,
          alpha: 0,
          scaleX: u.scaleX * 0.68,
          scaleY: u.scaleY * 0.68,
          duration: 430 * scale,
          ease: 'Cubic.In'
        });
      }
    });
  });
  return 720 + 430 + Math.max(0, ordered.length - 1) * 115;
}

function createArrow(scene, x, y) {
  const c = scene.add.container(x, y).setDepth(35).setVisible(false);
  const a = g(scene);
  a.lineStyle(3, 0x3a3027, 1).lineBetween(-16, 0, 12, 0);
  a.fillStyle(C.steelLight, 1).fillTriangle(12, -4, 22, 0, 12, 4);
  a.fillStyle(C.red, 0.9).fillTriangle(-16, 0, -23, -5, -20, 0);
  a.fillTriangle(-16, 0, -23, 5, -20, 0);
  c.add(a);
  return c;
}

function animateArrow(scene, arrow, from, to, delay, duration = 960) {
  const state = { t: 0 };
  scene.time.delayedCall(delay, () => {
    arrow.setVisible(true).setAlpha(1);
    scene.tweens.add({
      targets: state,
      t: 1,
      duration,
      ease: 'Linear',
      onUpdate: () => {
        const t = state.t;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t - Math.sin(Math.PI * t) * 150;
        const dx = to.x - from.x;
        const dy = (to.y - from.y) - Math.PI * 150 * Math.cos(Math.PI * t);
        arrow.setPosition(x, y);
        arrow.setRotation(Math.atan2(dy, dx));
        if (t > 0.88) arrow.setAlpha((1 - t) / 0.12);
      },
      onComplete: () => arrow.setVisible(false)
    });
  });
}

export function createBattleSceneClass(PhaserArg, hooks = {}) {
  globalThis.Phaser = PhaserArg;

  return class BattleSpikeScene extends PhaserArg.Scene {
    constructor() {
      super({ key: 'BattleSpike' });
      this.__Phaser = PhaserArg;
      this.__running = false;
      this.__elapsed = 0;
      this.__dynamic = [];
      this.__reduced = false;
      this.__units = [];
      this.__archers = [];
      this.__cavalry = [];
      this.__phase = 'ready';
    }

    create() {
      this.cameras.main.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
      this.cameras.main.setBackgroundColor('#263944');
      this.__reduced = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      drawBackdrop(this);
      this.__props = createCampProps(this);

      const rows = [
        { y: 610, count: 5, x: 165, gap: 48 },
        { y: 565, count: 5, x: 120, gap: 52 },
        { y: 520, count: 4, x: 170, gap: 55 }
      ];
      let idx = 0;
      for (const row of rows) {
        for (let i = 0; i < row.count; i += 1) {
          const archer = idx === 3 || idx === 7 || idx === 11;
          const elite = idx === 0 || idx === 6;
          const unit = createSoldier(this, row.x + i * row.gap, row.y, { archer, elite, scale: row.y > 590 ? 1.03 : 0.94 });
          this.__units.push(unit);
          if (archer) this.__archers.push(unit);
          idx += 1;
        }
      }

      const cav1 = createSoldier(this, 70, 595, { cavalry: true, scale: 1.05 });
      const cav2 = createSoldier(this, 15, 625, { cavalry: true, scale: 0.95 });
      this.__units.push(cav1, cav2);
      this.__cavalry.push(cav1, cav2);

      this.__ram = createRam(this, 235, 622);
      this.__fortress = createFortress(this, 1225, 535, hooks.profileInitials || 'P');

      const initialDamagePct = Math.max(0, Math.min(100, Number(hooks.initialDamagePct) || 0));
      if (initialDamagePct >= 18) this.__fortress.__cracks.setAlpha(0.82);
      if (initialDamagePct >= 38) this.__fortress.__damage1.setAlpha(0.88);
      if (initialDamagePct >= 62) {
        this.__fortress.__scorch.setAlpha(0.4);
        this.__fortress.__rubblePile.setAlpha(0.42);
        this.__fortress.__gate.setRotation(0.035).setAlpha(0.94);
      }
      if (initialDamagePct >= 82) {
        this.__fortress.__cracks.setAlpha(1);
        this.__fortress.__damage1.setAlpha(1);
        this.__fortress.__scorch.setAlpha(0.62);
        this.__fortress.__rubblePile.setAlpha(0.68);
        this.__fortress.__gate.setRotation(0.075).setAlpha(0.88);
      }

      const mist = g(this).setDepth(1);
      mist.fillStyle(0xe8e0c8, 0.08).fillRect(680, 420, 720, 180);
      this.__mist = mist;

      this.__flash = this.add.circle(1120, 502, 8, 0xffe6a5, 0).setDepth(60);
      this.__flash.setBlendMode?.(PhaserArg.BlendModes.ADD);

      this.__saveInitial();
      this.__setPhase('ready');
      hooks.onReady?.({ reducedMotion: this.__reduced });
    }

    __saveInitial() {
      this.__initial = {
        cameraX: this.cameras.main.scrollX,
        ram: { x: this.__ram.x, y: this.__ram.y, rotation: this.__ram.rotation },
        units: this.__units.map(u => ({ x: u.x, y: u.y, alpha: u.alpha, rotation: u.rotation, scaleX: u.scaleX, scaleY: u.scaleY, depth: u.depth })),
        gate: { x: this.__fortress.__gate.x, y: this.__fortress.__gate.y, rotation: this.__fortress.__gate.rotation, alpha: this.__fortress.__gate.alpha },
        cracksAlpha: this.__fortress.__cracks.alpha,
        damage1Alpha: this.__fortress.__damage1.alpha,
        breachAlpha: this.__fortress.__breach.alpha,
        rubblePileAlpha: this.__fortress.__rubblePile.alpha,
        scorchAlpha: this.__fortress.__scorch.alpha,
        enemy: { alpha: this.__fortress.__enemyBanner.alpha, y: this.__fortress.__enemyBanner.y, rotation: this.__fortress.__enemyBanner.rotation },
        own: { alpha: this.__fortress.__ownBanner.alpha, y: this.__fortress.__ownBanner.y, rotation: this.__fortress.__ownBanner.rotation }
      };
    }

    __setPhase(phase) {
      this.__phase = phase;
      hooks.onPhase?.(phase);
    }

    resetBattle() {
      this.tweens.killAll?.();
      for (const obj of this.__dynamic.splice(0)) {
        if (obj?.active) obj.destroy();
      }
      this.__running = false;
      this.__elapsed = 0;
      this.cameras.main.setScroll(this.__initial.cameraX, 0);
      this.cameras.main.setZoom(1);
      this.__ram.setPosition(this.__initial.ram.x, this.__initial.ram.y).setRotation(this.__initial.ram.rotation).setAlpha(1);
      this.__units.forEach((u, i) => {
        const p = this.__initial.units[i];
        u.setPosition(p.x, p.y).setAlpha(p.alpha).setRotation(p.rotation).setScale(p.scaleX, p.scaleY).setDepth(p.depth);
        u.__baseY = p.y;
      });
      const gate = this.__fortress.__gate;
      gate.setPosition(this.__initial.gate.x, this.__initial.gate.y).setRotation(this.__initial.gate.rotation).setAlpha(this.__initial.gate.alpha);
      this.__fortress.__cracks.setAlpha(this.__initial.cracksAlpha);
      this.__fortress.__damage1.setAlpha(this.__initial.damage1Alpha);
      this.__fortress.__breach.setAlpha(this.__initial.breachAlpha);
      this.__fortress.__rubblePile.setAlpha(this.__initial.rubblePileAlpha);
      this.__fortress.__scorch.setAlpha(this.__initial.scorchAlpha);
      this.__fires = [];
      this.__fortress.__enemyBanner.setAlpha(this.__initial.enemy.alpha).setY(this.__initial.enemy.y).setRotation(this.__initial.enemy.rotation);
      this.__fortress.__ownBanner.setAlpha(this.__initial.own.alpha).setY(this.__initial.own.y).setRotation(this.__initial.own.rotation);
      this.__flash.setAlpha(0).setScale(1);
      this.__setPhase('ready');
    }

    playSequence(mode = 'ram', captureOutcome = true) {
      const attackMode = ['charge', 'volley', 'ram', 'cavalry', 'special'].includes(mode) ? mode : 'ram';
      if (attackMode !== 'ram') return this.playVariantSequence(attackMode, captureOutcome);
      if (this.__running) return false;
      this.resetBattle();
      this.__captureOutcome = captureOutcome !== false;
      this.__running = true;
      this.__elapsed = 0;
      const scale = this.__reduced ? 0.22 : 1;
      const at = (ms, fn) => this.time.delayedCall(Math.max(40, ms * scale), fn);
      const beat = id => hooks.onBeat?.(id);

      this.__setPhase('rally');
      beat('rally');
      hooks.onStatus?.('Die Reihen sammeln sich und der Rammbock wird ausgerichtet.');

      at(1250, () => {
        this.__setPhase('advance');
        beat('advance');
        hooks.onStatus?.('Die Armee rückt gestaffelt über das Feld vor.');

        this.tweens.add({
          targets: this.cameras.main,
          scrollX: this.__reduced ? 75 : 165,
          duration: 3300 * scale,
          ease: 'Sine.InOut'
        });

        this.__units.forEach((u, i) => {
          const isCavalry = u.__cavalry;
          const dist = isCavalry ? 585 : 445 + (i % 3) * 20;
          this.tweens.add({
            targets: u,
            x: u.x + dist,
            duration: (isCavalry ? 2500 : 3250 + (i % 4) * 150) * scale,
            delay: (i % 7) * 120 * scale,
            ease: 'Sine.InOut',
            onUpdate: () => { u.__baseY = u.y; }
          });
        });

        this.tweens.add({
          targets: this.__ram,
          x: 760,
          duration: 4200 * scale,
          ease: 'Sine.InOut'
        });

        if (!this.__reduced) {
          at(2050, () => emitDust(this, 505, 635, 11));
          at(3250, () => emitDust(this, 680, 620, 14));
          at(4350, () => emitDust(this, 825, 607, 12));
        }
      });

      at(4300, () => {
        this.__setPhase('barrage');
        beat('volley-1');
        hooks.onStatus?.('Die erste Pfeilsalve deckt den letzten Vormarsch.');

        for (let i = 0; i < 18; i += 1) {
          const arrow = createArrow(this, 520, 500);
          this.__dynamic.push(arrow);
          animateArrow(
            this,
            arrow,
            { x: 520 + (i % 5) * 16, y: 485 + (i % 4) * 12 },
            { x: 1090 + (i % 6) * 28, y: 372 + (i % 5) * 26 },
            i * 68 * scale,
            (860 + (i % 4) * 90) * scale
          );
        }
      });

      at(5700, () => {
        beat('ram-charge-1');
        hooks.onStatus?.('Der Rammbock beschleunigt zum ersten Treffer.');
        this.tweens.add({
          targets: this.__ram,
          x: 1022,
          duration: 900 * scale,
          ease: 'Cubic.In'
        });
      });

      at(6550, () => {
        this.__setPhase('impact');
        beat('damage-1');
        hooks.onStatus?.('Erster Treffer: Tor und Mauer zeigen deutliche Schäden.');

        this.__fortress.__cracks.setAlpha(1);
        this.__fortress.__damage1.setAlpha(1);
        this.__flash.setPosition(1124, 505).setAlpha(0.92).setScale(0.28);
        this.tweens.add({
          targets: this.__flash,
          alpha: 0,
          scale: 6.3,
          duration: 560 * scale,
          ease: 'Quad.Out'
        });

        this.tweens.add({
          targets: this.__fortress.__gate,
          x: 9,
          rotation: 0.08,
          alpha: 0.9,
          duration: 150 * scale,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.InOut'
        });

        if (!this.__reduced) {
          this.cameras.main.shake(230, 0.0055);
          emitRubble(this, 1123, 520, 13);
          emitDust(this, 1125, 548, 20);
        }

        this.tweens.add({
          targets: this.__ram,
          x: 980,
          duration: 250 * scale,
          ease: 'Quad.Out'
        });
      });

      at(7350, () => {
        beat('volley-2');
        hooks.onStatus?.('Eine zweite Salve trifft die bereits beschädigte Verteidigung.');

        for (let i = 0; i < 12; i += 1) {
          const arrow = createArrow(this, 660, 490);
          this.__dynamic.push(arrow);
          animateArrow(
            this,
            arrow,
            { x: 640 + (i % 4) * 17, y: 480 + (i % 3) * 12 },
            { x: 1110 + (i % 5) * 25, y: 395 + (i % 4) * 22 },
            i * 62 * scale,
            (700 + (i % 3) * 75) * scale
          );
        }

        this.tweens.add({
          targets: this.__ram,
          x: 925,
          duration: 320 * scale,
          ease: 'Sine.Out'
        });
      });

      at(8050, () => {
        beat('ram-charge-2');
        hooks.onStatus?.('Der zweite Rammbockstoß zielt auf das geschwächte Tor.');
        this.tweens.add({
          targets: this.__ram,
          x: 1042,
          duration: 520 * scale,
          ease: 'Cubic.In'
        });
      });

      at(8580, () => {
        beat('damage-2');
        hooks.onStatus?.('Zweiter Treffer: Das Tor bricht auf, Steine lösen sich.');

        this.__fortress.__breach.setAlpha(1);
        this.__fortress.__rubblePile.setAlpha(1);
        this.__fortress.__scorch.setAlpha(0.88);
        this.__flash.setPosition(1120, 510).setAlpha(1).setScale(0.35);
        this.tweens.add({
          targets: this.__flash,
          alpha: 0,
          scale: 8,
          duration: 720 * scale,
          ease: 'Quad.Out'
        });
        this.tweens.add({
          targets: this.__fortress.__gate,
          y: 25,
          rotation: 0.28,
          alpha: 0.32,
          duration: 620 * scale,
          ease: 'Back.In'
        });

        if (!this.__reduced) {
          this.cameras.main.shake(300, 0.007);
          emitRubble(this, 1120, 515, 27);
          emitDust(this, 1120, 548, 30);
        }

        this.tweens.add({
          targets: this.__ram,
          x: 985,
          duration: 300 * scale,
          ease: 'Quad.Out'
        });
      });

      at(9000, () => {
        beat('fire');
        hooks.onStatus?.('Kleine Feuerstellen und Rauch markieren die beschädigte Torzone.');
        const fires = igniteFortress(this);
        if (this.__reduced) fires.forEach(fire => fire.setAlpha(0.42));
      });

      at(9650, () => {
        beat('breach');
        hooks.onStatus?.('Die Verteidigung gibt nach. Die vorderen Reihen rücken zum Tor.');
        this.__units.slice(0, 8).forEach((u, i) => {
          this.tweens.add({
            targets: u,
            x: u.x + 120 + (i % 3) * 24,
            duration: (850 + (i % 4) * 120) * scale,
            delay: i * 55 * scale,
            ease: 'Sine.InOut'
          });
        });
      });

      at(10450, () => {
        this.__setPhase('result');

        if (this.__captureOutcome) {
          beat('breach-entry');
          hooks.onStatus?.('Die Festung ist offen. Die Einheiten ziehen nacheinander durch das Tor.');

          this.tweens.add({
            targets: this.__fortress.__enemyBanner,
            y: this.__fortress.__enemyBanner.y + 62,
            alpha: 0,
            rotation: -0.16,
            duration: 780 * scale,
            ease: 'Sine.In'
          });
          marchUnitsIntoFortress(this, this.__units, scale);
        } else {
          beat('hold');
          hooks.onStatus?.('Treffer bestätigt: Die Festung bleibt beschädigt, ist aber noch nicht erobert.');
        }

        this.tweens.add({
          targets: this.cameras.main,
          scrollX: this.__reduced ? 105 : 185,
          duration: 1050 * scale,
          ease: 'Sine.InOut'
        });
        calmFires(this, 1100 * scale);
      });

      at(13500, () => {
        if (this.__captureOutcome) {
          beat('profile-banner');
          hooks.onStatus?.('Alle Einheiten sind in der Festung. Jetzt wird der Profilbanner gehisst.');
          this.tweens.add({
            targets: this.__fortress.__ownBanner,
            y: this.__fortress.__ownBanner.y - 38,
            alpha: 1,
            duration: 1050 * scale,
            ease: 'Back.Out'
          });
        } else {
          beat('settled');
          hooks.onStatus?.('Die Angriffswelle endet. Die sichtbaren Schäden bleiben zurück.');
        }
      });

      at(14800, () => {
        if (this.__captureOutcome) {
          beat('secured');
          hooks.onStatus?.('Die Festung ist übernommen. Der Profilbanner steht über der eroberten Stellung.');
        }
      });

      at(15600, () => {
        this.__running = false;
        hooks.onComplete?.();
      });

      return true;
    }

    playVariantSequence(mode = 'charge', captureOutcome = true) {
      if (this.__running) return false;
      this.resetBattle();
      this.__running = true;
      this.__captureOutcome = captureOutcome !== false;
      this.__elapsed = 0;

      const scale = this.__reduced ? 0.22 : 1;
      const at = (ms, fn) => this.time.delayedCall(Math.max(40, ms * scale), fn);
      const beat = id => hooks.onBeat?.(id);
      const infantry = this.__units.filter(u => !u.__cavalry);
      const cavalry = this.__cavalry;
      const is = id => mode === id;

      const labels = {
        charge: {
          rally: 'Die Infanterie schließt die Reihen.',
          advance: 'Schilde vor – die Front rückt geschlossen vor.',
          attack: 'Die Sturmreihe beschleunigt zum Tor.',
          impact: 'Die geschlossene Formation trifft auf die Verteidigung.'
        },
        volley: {
          rally: 'Die Bogenschützen beziehen ihre Positionen.',
          advance: 'Die Front sichert den Raum für die Fernkämpfer.',
          attack: 'Mehrere Pfeilwellen steigen nacheinander über das Feld.',
          impact: 'Die Salven treffen Zinnen, Tor und Verteidigungszone.'
        },
        cavalry: {
          rally: 'Die Reiter sammeln sich an der Flanke.',
          advance: 'Die Front bindet die Verteidigung, während die Reiter ausscheren.',
          attack: 'Die Kavallerie zieht schnell an der Flanke vorbei.',
          impact: 'Die Reiter erreichen die offene Torzone.'
        },
        special: {
          rally: 'Elite, Reiter, Bogenschützen und Rammbock werden gemeinsam vorbereitet.',
          advance: 'Alle Einheitenrollen setzen sich gestaffelt in Bewegung.',
          attack: 'Die Elite verbindet Salve, Flanke und Belagerungsstoß.',
          impact: 'Der koordinierte Angriff trifft die geschwächte Verteidigung.'
        }
      };
      const copy = labels[mode] || labels.charge;

      this.__ram.setAlpha(is('special') ? 1 : 0.08);
      if (is('volley')) cavalry.forEach(u => u.setAlpha(0.48));
      if (is('cavalry')) infantry.forEach(u => u.setAlpha(0.82));

      this.__setPhase('rally');
      beat('rally');
      hooks.onStatus?.(copy.rally);

      at(950, () => {
        this.__setPhase('advance');
        beat('advance');
        hooks.onStatus?.(copy.advance);

        const cameraTarget = is('cavalry') ? 180 : is('volley') ? 120 : 150;
        this.tweens.add({
          targets: this.cameras.main,
          scrollX: this.__reduced ? Math.round(cameraTarget * 0.5) : cameraTarget,
          duration: 2800 * scale,
          ease: 'Sine.InOut'
        });

        infantry.forEach((u, i) => {
          const dist = is('volley') ? 220 + (i % 3) * 12 : is('cavalry') ? 260 + (i % 3) * 10 : 455 + (i % 3) * 22;
          this.tweens.add({
            targets: u,
            x: u.x + dist,
            duration: (is('charge') ? 2550 : 3000 + (i % 4) * 120) * scale,
            delay: (i % 7) * (is('charge') ? 70 : 105) * scale,
            ease: is('charge') ? 'Cubic.InOut' : 'Sine.InOut',
            onUpdate: () => { u.__baseY = u.y; }
          });
        });

        cavalry.forEach((u, i) => {
          const dist = is('cavalry') ? 760 + i * 55 : is('special') ? 610 + i * 35 : 360 + i * 20;
          this.tweens.add({
            targets: u,
            x: u.x + dist,
            y: u.y - (is('cavalry') ? 40 + i * 16 : 10),
            duration: (is('cavalry') ? 2150 : 2600) * scale,
            delay: i * 160 * scale,
            ease: 'Cubic.InOut'
          });
        });

        if (is('special')) {
          this.tweens.add({
            targets: this.__ram,
            x: 760,
            duration: 3900 * scale,
            ease: 'Sine.InOut'
          });
        }

        if (!this.__reduced) {
          at(1650, () => emitDust(this, is('cavalry') ? 470 : 500, 635, is('cavalry') ? 18 : 10));
          at(2700, () => emitDust(this, is('cavalry') ? 760 : 690, 615, is('cavalry') ? 20 : 12));
        }
      });

      at(is('cavalry') ? 3300 : 3800, () => {
        this.__setPhase('barrage');
        beat(is('volley') ? 'volley-1' : is('cavalry') ? 'flank-1' : is('special') ? 'elite-wave-1' : 'charge-1');
        hooks.onStatus?.(copy.attack);

        if (is('volley') || is('special')) {
          const count = is('special') ? 16 : 22;
          for (let i = 0; i < count; i += 1) {
            const arrow = createArrow(this, 520, 500);
            this.__dynamic.push(arrow);
            animateArrow(
              this,
              arrow,
              { x: 500 + (i % 5) * 20, y: 478 + (i % 4) * 13 },
              { x: 1085 + (i % 6) * 30, y: 365 + (i % 5) * 28 },
              i * (is('volley') ? 62 : 72) * scale,
              (800 + (i % 4) * 85) * scale
            );
          }
        }

        if (is('charge')) {
          infantry.slice(0, 10).forEach((u, i) => {
            this.tweens.add({
              targets: u,
              x: u.x + 135 + (i % 3) * 18,
              duration: (620 + (i % 4) * 70) * scale,
              delay: i * 38 * scale,
              ease: 'Cubic.In'
            });
          });
        }

        if (is('cavalry') && !this.__reduced) {
          emitDust(this, 930, 600, 26);
        }
      });

      if (is('volley')) {
        at(5000, () => {
          beat('volley-2');
          hooks.onStatus?.('Die zweite Salve folgt versetzt und hält die Verteidigung unter Druck.');
          for (let i = 0; i < 18; i += 1) {
            const arrow = createArrow(this, 610, 490);
            this.__dynamic.push(arrow);
            animateArrow(
              this,
              arrow,
              { x: 600 + (i % 4) * 18, y: 474 + (i % 3) * 12 },
              { x: 1100 + (i % 5) * 27, y: 385 + (i % 4) * 25 },
              i * 58 * scale,
              (700 + (i % 3) * 80) * scale
            );
          }
        });
      }

      if (is('special')) {
        at(5100, () => {
          beat('ram-charge');
          hooks.onStatus?.('Der Rammbock nutzt die durch Salve und Flanke entstandene Lücke.');
          this.tweens.add({
            targets: this.__ram,
            x: 1035,
            duration: 820 * scale,
            ease: 'Cubic.In'
          });
        });
      }

      at(is('volley') ? 6450 : is('special') ? 6000 : is('cavalry') ? 5200 : 5300, () => {
        this.__setPhase('impact');
        beat('damage-1');
        hooks.onStatus?.(copy.impact);

        this.__fortress.__cracks.setAlpha(1);
        this.__fortress.__damage1.setAlpha(1);
        this.__flash.setPosition(1122, 505).setAlpha(is('volley') ? 0.66 : 0.88).setScale(0.28);
        this.tweens.add({
          targets: this.__flash,
          alpha: 0,
          scale: is('special') ? 7.2 : 5.5,
          duration: 560 * scale,
          ease: 'Quad.Out'
        });

        if (is('volley')) {
          this.__fortress.__scorch.setAlpha(0.46);
          const fires = igniteFortress(this);
          fires.forEach(fire => fire.setScale(fire.scaleX * 0.72, fire.scaleY * 0.72).setAlpha(0.72));
          beat('fire');
        }

        if (is('special')) {
          this.__fortress.__scorch.setAlpha(0.72);
          this.tweens.add({
            targets: this.__fortress.__gate,
            x: 8,
            rotation: 0.08,
            alpha: 0.88,
            duration: 145 * scale,
            yoyo: true,
            repeat: 2,
            ease: 'Sine.InOut'
          });
        }

        if (!this.__reduced) {
          this.cameras.main.shake(is('special') ? 260 : 180, is('special') ? 0.006 : 0.004);
          emitRubble(this, 1120, 520, is('special') ? 18 : 10);
          emitDust(this, 1120, 548, is('cavalry') ? 18 : 15);
        }
      });

      if (is('special')) {
        at(6900, () => {
          beat('damage-2');
          hooks.onStatus?.('Der koordinierte zweite Impuls öffnet die Torzone sichtbar.');
          this.__fortress.__breach.setAlpha(1);
          this.__fortress.__rubblePile.setAlpha(1);
          this.__fortress.__scorch.setAlpha(0.84);
          this.tweens.add({
            targets: this.__fortress.__gate,
            y: 22,
            rotation: 0.24,
            alpha: 0.35,
            duration: 580 * scale,
            ease: 'Back.In'
          });
          if (!this.__reduced) {
            emitRubble(this, 1120, 515, 23);
            emitDust(this, 1120, 548, 24);
          }
          igniteFortress(this);
          beat('fire');
        });
      }

      const resultAt = is('volley') ? 7900 : is('special') ? 8200 : is('cavalry') ? 6800 : 6900;
      at(resultAt, () => {
        this.__setPhase('result');

        if (this.__captureOutcome) {
          beat('breach-entry');
          hooks.onStatus?.('Die Verteidigung gibt nach. Alle Einheiten ziehen durch das Tor.');
          this.__fortress.__breach.setAlpha(1);
          this.__fortress.__rubblePile.setAlpha(1);

          this.tweens.add({
            targets: this.__fortress.__enemyBanner,
            y: this.__fortress.__enemyBanner.y + 58,
            alpha: 0,
            rotation: -0.14,
            duration: 700 * scale,
            ease: 'Sine.In'
          });
          marchUnitsIntoFortress(this, this.__units, scale);
        } else {
          beat('hold');
          hooks.onStatus?.('Der Angriff endet mit sichtbaren Schäden. Die Festung bleibt unter gegnerischer Kontrolle.');
        }

        calmFires(this, 900 * scale);
        this.tweens.add({
          targets: this.cameras.main,
          scrollX: this.__reduced ? 100 : 180,
          duration: 900 * scale,
          ease: 'Sine.InOut'
        });
      });

      at(resultAt + 3100, () => {
        if (this.__captureOutcome) {
          beat('profile-banner');
          hooks.onStatus?.('Die letzten Einheiten verschwinden im Tor. Der Profilbanner wird gehisst.');
          this.tweens.add({
            targets: this.__fortress.__ownBanner,
            y: this.__fortress.__ownBanner.y - 38,
            alpha: 1,
            duration: 900 * scale,
            ease: 'Back.Out'
          });
        } else {
          beat('settled');
          hooks.onStatus?.('Die Truppen lösen sich vom Ziel. Die Beschädigung bleibt sichtbar.');
        }
      });

      at(resultAt + 4200, () => {
        if (this.__captureOutcome) {
          beat('secured');
          hooks.onStatus?.('Die Stellung ist übernommen. Der Profilbanner bleibt sichtbar.');
        }
      });

      at(resultAt + 4900, () => {
        this.__running = false;
        hooks.onComplete?.();
      });

      return true;
    }

    update(_time, delta) {
      this.__elapsed += delta;
      const t = this.__elapsed;

      if (!this.__running || this.__phase === 'rally' || this.__phase === 'advance') {
        for (const u of this.__units) {
          const amp = u.__cavalry ? 1.8 : 1.2;
          const bob = Math.sin(t * u.__speed + u.__phase) * amp;
          if (!this.__running || this.__phase === 'rally') {
            u.y = u.__baseY + bob;
          }
          u.rotation = Math.sin(t * 0.0015 + u.__phase) * 0.008;
        }
      }

      if (this.__props?.flag) {
        this.__props.flag.rotation = Math.sin(t * 0.0018) * 0.012;
      }
      if (this.__fortress?.__enemyBanner?.alpha > 0.01) {
        this.__fortress.__enemyBanner.rotation = Math.sin(t * 0.0015) * 0.009;
      }
      if (this.__fortress?.__ownBanner?.alpha > 0.01) {
        this.__fortress.__ownBanner.rotation = Math.sin(t * 0.0015 + 1.1) * 0.009;
      }
    }
  };
}

export const BATTLE_WORLD = { width: WORLD_WIDTH, height: WORLD_HEIGHT };
