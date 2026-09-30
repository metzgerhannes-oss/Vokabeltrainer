import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const core=read('js/core.js');
const ui=read('js/ui.js');
const army=read('js/army-ui.js');
const map=read('js/campaign-map.js');
const menu=read('js/menu-ui.js');
const menuArt=read('js/menu-avatar-art.js');
const sw=read('sw.js');
const cssArmy=read('css/army.css');
const cssMenu=read('css/menu.css');
const cssMap=read('css/campaign-map.css');

const assert=(v,n)=>{if(!v)throw new Error('All-subject world choice smoke failed: '+n);console.log('✓ '+n)};

for(const subject of ['english','latin','german','french']){
  assert(core.includes(subject+':Object.freeze({'),'world presentation exists for '+subject);
}
for(const theme of ['english-adventure','latin-adventure','german-adventure','french-battle']){
  assert(core.includes("theme:'"+theme+"'"),'core exposes '+theme+' visual theme');
  assert(theme==='german-adventure'||map.includes("'"+theme+"':Object.freeze"),'map theme exists for '+theme);
}
assert(core.includes("const isAdventureWorld=")&&core.includes("subjectWorldPresentation"),'world mode is generic and presentation-only');
assert(ui.includes('data-profile-world-subject')&&ui.includes('profileWorldMode-\${esc(meta.id)}'),'profile editor builds one world selector per subject');
assert(ui.includes('const missingWorld=subjects.find'),'new profiles cannot silently accept a world for an active subject');
assert(ui.includes("subjects.forEach(subject=>setLearnerWorldMode(existing,subject,worldModes[subject]))"),'profile updates persist each active subject world');
assert(ui.includes("function openAdventureAction(subject=state.activeSubject)"),'all adventure worlds share the non-combat action path');
assert(ui.includes("if(typeof isAdventureWorld==='function'&&isAdventureWorld()){window.VTCampaignMap?.open?.();return}"),'battle view refuses to open in adventure mode');
assert(ui.includes("BATTLE_STORY_FRENCH_BATTLE")&&ui.includes("theme:'french-battle'"),'French battle has a distinct fictional combat presentation');
assert(army.includes("ADVENTURE_META")&&army.includes("english:Object.freeze")&&army.includes("latin:Object.freeze")&&army.includes("french:Object.freeze"),'adventure hub has subject-specific six-stage metadata');
assert(army.includes("root.classList.toggle('adventure-mode',adventure)"),'combat hub switches to generic adventure mode');
assert(cssArmy.includes('#armyView.adventure-mode .army-game-hub')&&cssArmy.includes('.subject-adventure-route'),'adventure mode hides combat sections and renders route');
assert(menu.includes("world-adventure-avatar")&&menu.includes("subjectWorldPresentation"),'home shell distinguishes adventure and battle');
assert(menuArt.includes("approved-atlas-v1.webp.b64")&&menuArt.includes('getSprite(subject,style,stage)'),'approved atlas is wired into the avatar art loader');
assert(menuArt.includes("german:Object.freeze({male:8,female:8,neutral:8})"),'German m/w/d profile styles resolve to the approved fox row');
assert(menu.includes("state.activeSubject==='english'")&&menu.includes("avatarArtSource='approved-atlas'"),'cross-subject army fallback is blocked and approved atlas source is explicit');
assert(menu.includes("frame.classList.toggle('german-fox-avatar',isGerman)"),'German home avatar stays a fox independent of world mode');
assert(cssMenu.includes('.avatar-atlas-art')&&cssMenu.includes('avatar-atlas-rendered'),'home CSS renders the approved atlas as a real avatar surface');
assert(sw.includes('./assets/menu-avatar/approved-atlas-v1.webp.b64'),'approved avatar atlas is cached for offline/PWA use');
assert(cssMenu.includes('data-visual-theme="english-adventure"')&&cssMenu.includes('data-visual-theme="latin-adventure"')&&cssMenu.includes('data-visual-theme="french-battle"'),'home palettes cover new variants');
assert(cssMap.includes('data-visual-theme="english-adventure"')&&cssMap.includes('data-visual-theme="latin-adventure"')&&cssMap.includes('data-visual-theme="french-battle"'),'map palettes cover new variants');
assert(!army.includes('refreshMastery(')&&!map.includes('refreshMastery('),'world renderers remain read-only for academic mastery');

console.log('Vokabeltrainer all-subject world choice smoke: passed');
