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
assert(core.includes("id==='german'&&learnerWorldMode('german',l)==='adventure'"),'German adventure selects its own visual theme');
assert(ui.includes('name="profileGermanWorldMode"')&&ui.includes('id="profileGermanWorld"')&&ui.includes('Deutsch · Spielwelt'),'profile editor exposes German adventure/battle choice');
assert(ui.includes('Bitte für Deutsch Abenteuer oder Kampf auswählen.')&&ui.includes("const germanWorldMode=existing?learnerWorldMode('german',existing):''"),'new German profiles require an explicit world choice');
assert(ui.includes('Neutral / Divers')&&ui.includes('profile-choice-read'),'profile editor combines m/w/d with readable choice controls');
assert(ui.includes('setLearnerWorldMode(existing,\'german\',worldMode)')&&ui.includes('worldModeBySubject.german=worldMode'),'profile save persists German world mode');
assert(storage.includes('l.worldModeBySubject=normalizeWorldModeBySubject(l.worldModeBySubject)'),'migration and backup hardening normalize world mode');
assert(storage.includes("['male','female','neutral'].includes(l.avatarStyle)"),'storage preserves the neutral/diverse avatar value');
assert(sync.includes("'worldModeBySubject'")&&sync.includes('normalizeWorldModeBySubject(l.worldModeBySubject)'),'family sync carries and normalizes world mode');
assert(sync.includes("['male','female','neutral'].includes(l.avatarStyle)"),'family sync accepts m/w/d setup values');
assert(menu.includes("german-fox-avatar',isGermanAdventure")&&menu.includes("german-knight-avatar',isGerman&&!isGermanAdventure"),'project menu follows German world choice');
assert(army.includes('function adventureHeroMarkup')&&army.includes("root.classList.toggle('german-adventure-mode',germanAdventure)"),'German adventure has its own game hub');
assert(wordrealm.includes('const ADVENTURE_STAGES=Object.freeze')&&wordrealm.includes('function adventureFoxSvg'),'German adventure has its own six-stage vector fox series');
assert(army.includes('adventureFoxSvg')&&!army.includes('>🦊</div>'),'adventure hub uses the vector fox instead of an emoji placeholder');
assert(map.includes("'german-adventure':Object.freeze")&&map.includes("viewTitle:'Meine Wortreise'"),'German adventure has a dedicated route theme');
assert(css.includes('#armyView.german-adventure-mode .army-game-hub')&&css.includes('.german-adventure-route'),'combat sections are hidden in German adventure mode');
assert(army.includes("openGermanAdventureAction")&&army.includes("Abenteuer fortsetzen"),'German adventure uses a non-combat daily action');
assert(!army.includes('refreshMastery(')&&!map.includes('refreshMastery('),'world rendering does not change academic mastery');
console.log('Vokabeltrainer German world choice smoke: passed');
