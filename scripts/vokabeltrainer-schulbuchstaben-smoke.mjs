import fs from 'node:fs';
import vm from 'node:vm';

const assert=(v,n)=>{if(!v)throw new Error('Schulbuchstaben smoke failed: '+n);console.log('✓ '+n)};
const module=fs.readFileSync('js/german-foundation.js','utf8');
const storage=fs.readFileSync('js/storage.js','utf8');
const core=fs.readFileSync('js/core.js','utf8');
const family=fs.readFileSync('js/family-sync.js','utf8');
const css=fs.readFileSync('css/app.css','utf8');
const progress={germanFoundation:null};
const sandbox={window:{},state:{activeSubject:'german'},learner:()=>progress,console};
vm.runInNewContext(module,sandbox,{filename:'german-foundation.js'});
const api=sandbox.window.VTGermanFoundation;
assert(!!api?.stageTasks&&!!api?.letterPlan,'school-letter API is exposed');
assert(!api.letterPlan().configured&&api.stageTasks('handwriting').length===0,'without setup the app does not assume alphabet knowledge');
progress.germanFoundation.letterPlan={configured:true,learned:['A'],current:['M'],updatedAt:'2026-10-14T00:00:00Z'};
const writing=api.stageTasks('handwriting');
assert(writing.length===2&&writing[0].upper==='M'&&writing[1].upper==='A','current school letter is practised before learned letters');
assert(api.stageTasks('letters').every(t=>t.options.every(v=>['M','m','A','a'].includes(v))),'unknown letters cannot appear as answer distractors');
assert(api.stageTasks('sounds').every(t=>t.options.every(v=>['M m','A a'].includes(v))),'unknown pairs cannot appear in phoneme choice');
assert(api.stageTasks('words').length===0&&api.stageTasks('sentences').length===0,'words and sentences are held back if their graphemes are unavailable');
progress.germanFoundation.letterPlan={configured:true,learned:['A','O','L','T'],current:['M'],updatedAt:'2026-10-14T00:00:00Z'};
assert(api.stageTasks('words').some(t=>t.word==='Oma'),'whole words are enabled once all required graphemes are known');
assert(api.stageTasks('sentences').length===2,'only readable complete sentences are enabled');
progress.germanFoundation.completedStages.handwriting='2026-10-14T00:00:00Z';
progress.germanFoundation.completedScopes.handwriting='A,L,M,O,T';
assert(api.completion().done===1,'completion counts the current letter scope');
progress.germanFoundation.letterPlan.current=[];
progress.germanFoundation.letterPlan.learned.push('M');
assert(api.completion().done===1,'a school letter moving from current to learned retains its completion');
progress.germanFoundation.letterPlan.learned.push('S');
assert(api.completion().done===0,'expanding the letter scope does not falsely complete new exercises');
assert(!!progress.germanFoundation.completedStages.handwriting,'old academic evidence is preserved');

const a=storage.indexOf('function safeGermanFoundation(raw){'),b=storage.indexOf('\n}',a)+2;
assert(a>=0&&b>a,'foundation storage sanitizer exists');
const safeContext={
  safeText:(v,n)=>String(v??'').slice(0,n),
  safeNumber:(v,lo,hi,def)=>Math.min(hi,Math.max(lo,Number.isFinite(Number(v))?Number(v):def))
};
vm.runInNewContext(storage.slice(a,b),safeContext);
const out=safeContext.safeGermanFoundation({letterPlan:{configured:true,current:['M','UNKNOWN','M'],learned:['A','M','😈']},completedScopes:{handwriting:'A|M'}});
assert(JSON.stringify(out.letterPlan.current)==='["M"]'&&JSON.stringify(out.letterPlan.learned)==='["A"]','invalid and duplicate letters are sanitized and statuses remain disjoint');
assert(out.completedScopes.handwriting==='A|M','letter scope is preserved across load and backup');
assert(family.includes("'germanFoundation'"),'existing family-sync progress document transports the school letter plan');
assert(core.includes('letterPlan:{configured:false')&&module.includes('letterSetupLearnerId'),'new and switched profiles have independent initial selection');
assert(css.includes('.german-school-letter-grid')&&css.includes('min-height:60px'),'letter selection is mobile and touch friendly');
console.log('Vokabeltrainer Schulbuchstaben smoke: passed');
