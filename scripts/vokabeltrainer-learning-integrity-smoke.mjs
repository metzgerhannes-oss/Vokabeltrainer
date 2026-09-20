import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/learning.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const passed=vm.runInContext(`
(()=>{
  const ok=[];const assert=(v,n)=>{if(!v)throw new Error('Learning integrity smoke failed: '+n);ok.push(n)};
  const s=defaultState();delete s.spellingLeakRepairVersion;s.version='0.9.20';
  const v=makeVocabulary('english','write','schreiben');
  s.vocabulary.push(v);
  const sense=primarySense(v);
  const p=makeLearnerVocabulary('learner_demo',v.id,sense.id,{
    skills:{recognition:2,listening:1,retrieval:3,spelling:3,context:1},
    repetitions:8,successes:7,failures:1,independentSuccesses:6,
    activeSuccessDays:['2026-09-10','2026-09-14','2026-09-18'],
    coldRecallDays:['2026-09-14','2026-09-18'],maxActiveGapDays:4,intervalDays:14,
    dueDate:'2026-10-04',masteredAt:'2026-09-18T12:00:00.000Z'
  });
  s.learnerVocabulary.push(p);
  const repaired=migrate(s);
  const rp=repaired.learnerVocabulary[0];
  assert(repaired.spellingLeakRepairVersion===1,'migration marker is written');
  assert(rp.skills.spelling===0,'old spelling credit is reset');
  assert(rp.masteredAt===null,'mastery based on leaked spelling is revoked');
  assert(rp.lastMasteredAt==='2026-09-18T12:00:00.000Z','previous mastery timestamp is retained for history');
  assert(rp.dueDate===today(),'revalidation becomes due immediately');
  assert(!meetsMasteryCriteria(rp),'repaired progress cannot remain mastered');
  assert(answerMatches('cant',"can't")===true,'general recall stays punctuation tolerant');
  assert(spellingMatches('cant',"can't")===false,'spelling requires the apostrophe');
  assert(spellingMatches('cafe','café')===false&&spellingMatches('café','café')===true,'spelling preserves diacritics');
  session={currentSubmode:'recall'};assert(!skillCredits('retrieval',{orthographyOk:false}).includes('spelling'),'imprecise recall receives no spelling credit');
  return ok;
})()
`,context,{filename:'learning-integrity-runtime'});

const learning=fs.readFileSync('js/learning.js','utf8');
const start=learning.indexOf('function renderSpelling(');
const end=learning.indexOf('\nfunction ',start+20);
const block=learning.slice(start,end<0?learning.length:end);
if(block.includes('wordLearningCard('))throw new Error('Learning integrity smoke failed: spelling prompt reveals learning card before answer');
if(!block.includes('aria-label="Deine Antwort"'))throw new Error('Learning integrity smoke failed: spelling answer input lacks accessible name');

console.log('Vokabeltrainer learning integrity smoke: '+(passed.length+2)+' checks passed');
for(const name of passed)console.log('✓ '+name);
console.log('✓ spelling prompt does not reveal the answer');
console.log('✓ spelling answer field remains accessible');
