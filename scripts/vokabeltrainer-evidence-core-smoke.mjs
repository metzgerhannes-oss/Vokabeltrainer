import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const index=read('index.html');
const model=read('js/model.js');
const quiz=read('js/quiz-engine.js');
const learning=read('js/learning.js');
const storage=read('js/storage.js');
const core=read('js/core.js');

function ok(cond,msg){if(!cond)throw new Error(msg)}

ok(core.includes("const VERSION = '0.19.0';"),'v0.19.0 core version missing');
for(const id of ['homeView','practiceView','childProgressView','armyView'])ok(index.includes(`data-view="${id}"`),`child nav missing ${id}`);
for(const id of ['practiceCardsBtn','practiceWeakBtn','practiceAllBtn','practiceSpecialBtn'])ok(index.includes(`id="${id}"`),`practice path missing ${id}`);
ok(index.includes('id="autoSpeakCorrection"'),'auto correction setting missing');
ok(storage.includes('autoSpeakCorrection:l.autoSpeakCorrection!==false'),'audio setting migration missing');

const mastery=model.slice(model.indexOf('function masteryScore'),model.indexOf('function meetsMasteryCriteria'));
ok(mastery.includes('productiveCore'),'productive mastery core missing');
ok(!mastery.includes('recognition')&&!mastery.includes('listening'),'support skills must not contribute to mastery score');
ok(learning.includes("supportMode=['recognition','listening','chunks']"),'support modes are not blocked from active mastery');
ok(learning.includes('maybeSpeakCorrection(w)'),'post-error pronunciation missing');
ok(learning.includes('data-speak'),'on-demand audio controls missing');
ok(learning.includes("Math.min(targetSession.index+3,targetSession.queue.length)"),'delayed retry spacing missing');
ok(quiz.includes("base.prompt='🔊 Diktat'"),'spelling must be explicit dictation when audio supplies the word');

const recall=learning.slice(learning.indexOf('function renderRecall'),learning.indexOf('function renderReverseRecall'));
ok(!recall.includes('speak(q.term)')&&!recall.includes('audioButtonHtml(q.term'),'normal meaning-to-word recall leaks the answer through audio');
const reverse=learning.slice(learning.indexOf('function renderReverseRecall'),learning.indexOf('function renderSpelling'));
ok(reverse.includes("audioButtonHtml(q.term,'Wort anhören')"),'visible foreign-word prompt should expose audio');
ok(!learning.includes('Multisensorisches Schreiben'),'unsupported multisensory label still exposed');

console.log('Evidence-based learning core smoke: ok');
