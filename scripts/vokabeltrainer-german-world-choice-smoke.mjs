import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const core=read('js/core.js');
const ui=read('js/ui.js');
const storage=read('js/storage.js');
const sync=read('js/family-sync.js');
const menu=read('js/menu-ui.js');
const army=read('js/army-ui.js');
const map=read('js/campaign-map.js');
const css=read('css/army.css');
const wordrealm=read('js/wordrealm-ui.js');

const assert=(v,n)=>{if(!v)throw new Error('German world choice smoke failed: '+n);console.log('✓ '+n)};

assert(core.includes("const WORLD_MODES=Object.freeze(['adventure','battle'])"),'world modes are allow-listed');
assert(core.includes("defaultWorldModes=()=>({english:'battle',latin:'battle',german:'battle',french:'adventure'})"),'legacy-safe world defaults are defined');
assert(core.includes("function learnerWorldMode(")&&core.includes("function setLearnerWorldMode("),'per-profile world mode helpers exist');
assert(core.includes('function subjectWorldPresentation')&&core.includes('const isAdventureWorld='),'world presentation and adventure detection are generic');
assert(ui.includes('name="profileWorldMode-${esc(meta.id)}"')&&ui.includes('data-profile-world-subject')&&ui.includes("german:{adventure:'Fuchspfad"),'profile editor exposes German through the generic adventure/battle choice');
assert(ui.includes('const missingWorld=subjects.find')&&ui.includes('Bitte für ${subjectLabel(missingWorld)} Abenteuer oder Kampf auswählen.'),'new active subjects require an explicit world choice');
assert(ui.includes('Neutral / Divers')&&ui.includes('profile-choice-read'),'profile editor combines m/w/d with readable choice controls');
assert(ui.includes('subjects.forEach(subject=>setLearnerWorldMode(existing,subject,worldModes[subject]))')&&ui.includes('worldModeBySubject[subject]=worldModes[subject]'),'profile save persists world mode per active subject');
assert(storage.includes('l.worldModeBySubject=normalizeWorldModeBySubject(l.worldModeBySubject)'),'migration and backup hardening normalize world mode');
assert(storage.includes("['male','female','neutral'].includes(l.avatarStyle)"),'storage preserves the neutral/diverse avatar value');
assert(sync.includes("'worldModeBySubject'")&&sync.includes('normalizeWorldModeBySubject(l.worldModeBySubject)'),'family sync carries and normalizes world mode');
assert(sync.includes("['male','female','neutral'].includes(l.avatarStyle)"),'family sync accepts m/w/d setup values');
assert(menu.includes("german-fox-avatar',isGerman&&adventure")&&menu.includes("german-knight-avatar',isGerman&&!adventure"),'project menu follows German world choice');
assert(army.includes('function adventureHeroMarkup')&&army.includes("root.classList.toggle('adventure-mode',adventure)"),'German adventure uses the generic adventure hub');
assert(wordrealm.includes('const ADVENTURE_STAGES=Object.freeze')&&wordrealm.includes('function adventureFoxSvg'),'German adventure has its own six-stage vector fox series');
assert(army.includes('adventureFoxSvg')&&!army.includes('>🦊</div>'),'adventure hub uses the vector fox instead of an emoji placeholder');
assert(map.includes("'german-adventure':Object.freeze")&&map.includes("viewTitle:'Meine Wortreise'"),'German adventure has a dedicated route theme');
assert(css.includes('#armyView.adventure-mode .army-game-hub')&&css.includes('.subject-adventure-route'),'combat sections are hidden in adventure mode');
assert(ui.includes('function openAdventureAction(subject=state.activeSubject)')&&army.includes("openAdventureAction"),'German adventure uses the generic non-combat daily action');
assert(!army.includes('refreshMastery(')&&!map.includes('refreshMastery('),'world rendering does not change academic mastery');
console.log('Vokabeltrainer German world choice smoke: passed');
