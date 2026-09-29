import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const module=read('js/german-foundation.js');
const css=read('css/app.css');
const backlog=read('docs/project/BACKLOG.md');
const assert=(v,n)=>{if(!v)throw new Error('B-018 smoke failed: '+n);console.log('✓ '+n)};

assert(module.includes('FREE_WRITING_LETTERS')&&module.includes("letter:'G',lower:'g'")&&module.includes("letter:'J',lower:'j'")&&module.includes("letter:'P',lower:'p'")&&module.includes("letter:'Q',lower:'q'")&&module.includes("letter:'Y',lower:'y'"),'free-writing alphabet includes letters with descenders');
assert(module.includes('freeWritingSelection=new Set()')&&module.includes('data-free-form=')&&module.includes('selectedFreeWritingForms'),'manual single, pair, and multiple-letter selection exists');
assert(module.includes('Dachgeschoss')&&module.includes('Erdgeschoss')&&module.includes('Keller')&&module.includes('drawSchoolLineature'),'school lineature has roof, middle, and cellar zones');
assert(module.includes('foundationFreeSoundBtn')&&module.includes('speak(meta.sound)'),'letter sound remains available');
assert(module.includes("run={stage:'freeWriting',freePractice:true")&&module.includes('forms:[...forms]'),'free-writing queue is built only from chosen forms');
const freeStart=module.indexOf('function openFreeWriting()');
const freeEnd=module.indexOf('function task(){',freeStart);
const freeBlock=module.slice(freeStart,freeEnd);
assert(freeStart>=0&&freeEnd>freeStart,'free-writing implementation block is detectable');
assert(!freeBlock.includes('bump(')&&!freeBlock.includes('saveProgress(')&&!freeBlock.includes('recordResult(')&&!freeBlock.includes('grantBattleTicket'),'free repetition has no academic or game progress mutation');
assert(css.includes('.free-letter-grid')&&css.includes('.foundation-lineature-legend')&&css.includes('@media(max-width:520px)'),'selection and lineature are responsive for small displays');
assert(backlog.includes('## B-018 – Freies Schreiben')&&/\*\*Status:\*\* (?:IMPLEMENTED|VERIFIED|PRODUCTION)/.test(backlog),'B-018 backlog status records implementation or later verification');
console.log('Vokabeltrainer B-018 free writing smoke: passed');
