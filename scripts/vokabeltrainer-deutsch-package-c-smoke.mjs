import fs from 'node:fs';

const assert=(v,n)=>{if(!v)throw new Error('Deutsch Paket C smoke failed: '+n);console.log('✓ '+n)};
const core=fs.readFileSync('js/core.js','utf8');
const storage=fs.readFileSync('js/storage.js','utf8');
const module=fs.readFileSync('js/german-foundation.js','utf8');
const family=fs.readFileSync('js/family-sync.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const version=(core.match(/const VERSION = '([^']+)'/)||[])[1]||'';

assert(core.includes('const defaultGermanFoundation = () => ({version:1,letters:{},words:{},sentences:{},completedStages:{},updatedAt:null});'),'separate German foundation state exists');
assert(core.includes('germanFoundation:defaultGermanFoundation()'),'new profiles receive foundation state');
assert(storage.includes('function safeGermanFoundation(raw)')&&storage.includes("['letters','sounds','handwriting','words','sentences']"),'foundation progress is hardened and stage allow-listed');
assert(module.includes("id:'letters'")&&module.includes("id:'sounds'")&&module.includes("id:'handwriting'")&&module.includes("id:'words'")&&module.includes("id:'sentences'"),'five Paket-C stages exist');
assert(module.includes('foundation-trace-canvas')&&module.includes("skill:'freeProduction'"),'guided tracing transitions to free production');
assert(module.includes('Die App bewertet deine Handschrift hier bewusst nicht automatisch als richtig oder falsch.'),'handwriting is not falsely auto-graded');
assert(module.includes("a===t.word?correct('words',t.id,'written'):wrong()"),'first-word writing is deterministically graded');
assert(module.includes("answer===t.sentence?correct('sentences',t.id,'formation'):wrong()"),'simple sentence formation is deterministically graded');
assert(!module.includes('grantBattleTicket')&&!module.includes('spendBattleTicket')&&!module.includes('.xp'),'foundation module has no XP or battle-ticket mutation');
assert(family.includes("'germanFoundation'"),'Family Sync transports foundation progress');
assert(html.includes('id="germanFoundationCard"')&&html.includes('js/german-foundation.js?v='+version),'foundation UI is part of the current app shell');
console.log('Vokabeltrainer Deutsch Paket C smoke: passed');
