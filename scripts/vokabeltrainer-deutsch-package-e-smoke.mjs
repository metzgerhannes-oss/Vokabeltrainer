import fs from 'node:fs';

const assert=(v,n)=>{if(!v)throw new Error('Deutsch Paket E smoke failed: '+n);console.log('✓ '+n)};
const ui=fs.readFileSync('js/ui.js','utf8');
const bridge=fs.readFileSync('js/battle-phaser/battle-phaser-production.js','utf8');
const scene=fs.readFileSync('js/battle-phaser/battle-phaser-scene.js','utf8');
const result=fs.readFileSync('js/battle-result-ui.js','utf8');

assert(ui.includes("['english','latin','french','german'].includes(state.activeSubject)"),'production Phaser gate includes German in the all-subject battle allow-list');
assert(ui.includes("subject:state.activeSubject")&&ui.includes("theme:battlePresentation(state.activeSubject).theme"),'battle bridge receives subject and visual theme');
assert(ui.includes("isGerman?'Belagerung läuft':'Schlacht läuft'"),'German production battle uses Wortreich battle copy');
assert(bridge.includes("['english','latin','french','german'].includes(subject)")&&bridge.includes("['campaign','wordrealm','roman','french-battle'].includes(theme)"),'production bridge allow-lists German Wortreich identity inside the cross-subject bridge');
assert(bridge.includes("stage.dataset.phaserSubject = safeSubject")&&bridge.includes("stage.dataset.phaserTheme = safeTheme"),'renderer identity is observable for regression tests');
assert(bridge.includes("v0.21.57 · Wortreich Phaser"),'Wortreich renderer has its own visible build marker');
assert(scene.includes('const WORDREALM = {')&&scene.includes("pc(scene,'skyTop')")&&scene.includes("scene?.__theme==='wordrealm'"),'Phaser scene has a dedicated Wortreich palette');
assert(scene.includes("'DAS WORTREICH'")&&scene.includes('forest.fillStyle'),'Wortreich battlefield includes medieval forest identity');
assert(scene.includes("['english','latin','french','german'].includes(hooks.subject)")&&scene.includes("['campaign','wordrealm','roman','french-battle'].includes(hooks.theme)"),'scene receives safe German theme state inside the cross-subject allow-lists');
assert(result.includes("'Burg erobert!'")&&result.includes("isGerman?'Belagerung gelungen!'"),'result overlay uses Burg and Belagerung language');
assert(!scene.includes('masteryPercent(')&&!scene.includes('refreshMastery(')&&!scene.includes('grantBattleTicket(')&&!scene.includes('spendBattleTicket('),'Phaser scene remains presentation-only');
console.log('Vokabeltrainer Deutsch Paket E smoke: passed');
