import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const core=read('js/core.js');
const model=read('js/model.js');
const html=read('index.html');
const wordrealm=read('js/wordrealm-ui.js');
const readAloud=read('js/read-aloud-ui.js');
const foundation=read('js/german-foundation.js');
const menuCss=read('css/menu.css');
const appCss=read('css/app.css');
const ui=read('js/ui.js');
const storage=read('js/storage.js');
const menu=read('js/menu-ui.js');
const avatarArt=read('js/menu-avatar-art.js');
const decisions=read('docs/project/DECISIONS.md');
const layout=read('docs/project/DEUTSCH_WORTREICH_LAYOUT_V1.md');
const visual=read('VISUAL_DNA.md');
const version=core.match(/const VERSION\s*=\s*'([^']+)'/)?.[1]||'';

const ok=[];
const assert=(value,name)=>{if(!value)throw new Error('Deutsch Wortreich layout smoke failed: '+name);ok.push(name)};

const stageOrder=['Grundausrüstung','Lederzeug','Ritterlehrling','Ritter','Kronritter','König'];
let last=-1;
for(const label of stageOrder){
  const at=wordrealm.indexOf("label:'"+label+"'");
  assert(at>last,'Wortreich stage order contains '+label);
  last=at;
}
assert(core.includes("ranks:['Grundausrüstung','Lederzeug','Ritterlehrling','Ritter','Kronritter','König']"),'German campaign uses the approved six-stage story');
assert(model.includes("const german=['Grundausrüstung','Lederzeug','Ritterlehrling','Ritter','Kronritter','König']"),'German gear labels use the approved six-stage story');
assert(model.includes("if(subject==='german')return arr[Math.max(0,Math.min(arr.length-1,gearTier(pct)-1))]"),'German visible rank follows the same 18-percent stage thresholds');
assert(wordrealm.includes("function foxSvg(stage=1")&&wordrealm.includes("function castleSvg()")&&wordrealm.includes("function stageStrip(activeLevel=1)"),'Wortreich UI owns real fox, scenery and progression renderers');
assert(wordrealm.includes("if(crownKnight)")&&wordrealm.includes("if(king)")&&wordrealm.includes("fill=\"#f6c84b\""),'upper stages build incrementally and reserve crown rendering for the king branch');
assert(html.includes('id="wordrealmStageStrip"')&&html.includes('id="wordrealmLearningWordsBtn"')&&html.includes('id="wordrealmEnterBtn"'),'German home exposes stage strip and the two approved quick actions');
assert(wordrealm.includes('assets/wordrealm/home-approved-v1.webp')&&menu.includes("avatarArtSource='wordrealm-approved-scene'"),'Wortreich home renders the exact approved scene and bypasses the atlas tile');
assert(html.includes('js/read-aloud-ui.js?v='+version)&&html.includes('js/wordrealm-ui.js?v='+version),'approved layout modules load in the current versioned shell');
assert(readAloud.includes("view.id!=='learnView'"),'global page read-aloud stays out of focused learning');
assert(readAloud.includes("button.dataset.readTargets")&&readAloud.includes("speechSynthesis")&&html.includes("data-read-targets="),'read-aloud layer supports target-based German narration');
assert(foundation.includes("Audio gibt es nach der Lösung."),'word-reading evidence still withholds target-word audio until after the answer');
assert(foundation.includes("readButton('Welches Bild passt zum Wort? Lies das Wort erst selbst.')"),'word-picture instruction can be read without reading the tested word');
assert(foundation.includes("readButton('Welches Bild passt zum ganzen Satz? Lies den Satz ohne Zeitdruck.')"),'sentence-picture instruction can be read without reading the tested sentence');
assert(!foundation.includes("readButton(t.sentence"),'tested sentence is never passed to pre-answer instruction read-aloud');
assert(menuCss.includes('.wordrealm-stage-strip')&&menuCss.includes('.wordrealm-home-action')&&menuCss.includes('.wordrealm-approved-home-scene'),'approved Wortreich home hierarchy and exact scene asset are styled');
assert(appCss.includes('width:44px;height:44px;min-width:44px;min-height:44px'),'read-aloud controls keep 44px touch targets');
assert(ui.includes('value="neutral"')&&ui.includes('Neutral / Divers'),'profile editor exposes the third m/w/d avatar choice');
assert(storage.includes("['male','female','neutral'].includes(l.avatarStyle)"),'persistence preserves male, female and neutral avatar styles');
assert(menu.includes("['male','female','neutral'].includes(learner()?.avatarStyle)"),'home renderer preserves the selected m/w/d avatar style');
assert(avatarArt.includes("german:Object.freeze({male:8,female:8,neutral:8})")&&avatarArt.includes("function safeStyle(style){return ['male','female','neutral'].includes(style)?style:'male'}"),'avatar art layer has an explicit neutral mapping; German m/w/d all resolve to the approved fox series');
assert(decisions.includes('D-20260929-003')&&layout.includes('Status: **VERBINDLICH FREIGEGEBEN**'),'approved visual/audio decision is canonical in the repository');
assert(layout.includes('Ritterlehrling → Ritter → Kronritter → König'),'canonical layout records the approved upper-stage progression');
assert(layout.includes('Audio darf **nicht** vor der Antwort angeboten werden'),'canonical layout preserves evidence-safe audio');
assert(layout.includes('**Neutral / Divers**')&&layout.includes('nicht** still auf die männliche Bildserie'),'canonical layout records the m/w/d fallback rule');
assert(visual.includes('assets/wordrealm/home-approved-v1.webp')&&visual.includes('Eine separate Avatar-Kachel'),'Visual DNA locks the approved integrated Wortreich scene and forbids the old avatar tile');

console.log('Vokabeltrainer Deutsch Wortreich layout smoke: '+ok.length+' checks passed');
for(const name of ok)console.log('✓ '+name);
