import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('js/german-foundation.js','utf8');
const storage=fs.readFileSync('js/storage.js','utf8');
const core=fs.readFileSync('js/core.js','utf8');
const sync=fs.readFileSync('js/family-sync.js','utf8');
const profiles=[{id:'one',germanFoundation:undefined},{id:'two',germanFoundation:undefined}];
let active=0,saves=0;
const context={
  window:{},state:{activeSubject:'german'},learner:()=>profiles[active],
  save:()=>{saves++},console,Set,Audio:function(){},document:{querySelector:()=>null}
};
vm.runInNewContext(source,context);
const model=context.window.VTGermanFoundation;
assert.ok(model,'German foundation is exported');
assert.equal(model.letterPlan().configured,false);
assert.equal(model.stageTasks('handwriting').length,0,'first-run tasks are blocked until a school letter level is chosen');
profiles[0].germanFoundation.letterPlan={configured:true,learned:['A','M','M','?'],current:['N','A']};
assert.deepEqual(Array.from(model.letterPlan().learned),['M'],'school states are de-duplicated and disjoint');
assert.deepEqual(Array.from(model.letterPlan().current),['A','N']);
assert.deepEqual(Array.from(model.stageTasks('handwriting'),x=>x.id),['A','N','M'],'current letters come first');
assert.deepEqual(Array.from(model.stageTasks('letters'),x=>x.id),['A','N','M']);
assert.equal(model.stageTasks('words').length,0,'unknown characters never enter required word tasks');
assert.equal(model.stageTasks('sentences').length,0,'unknown characters never enter required sentence tasks');
const p=model.progress();p.completedStages.handwriting='2026-10-14T12:00:00Z';p.completedScopes.handwriting='A,M,N';
assert.equal(model.completion().done,1,'matching school letter scope retains completed stage');
profiles[0].germanFoundation.letterPlan={configured:true,learned:['A','M','N'],current:[]};
assert.equal(model.completion().done,1,'moving current letters into learned retains completion');
profiles[0].germanFoundation.letterPlan={configured:true,learned:['A','M','N'],current:['O']};
assert.equal(model.completion().done,0,'new school letters invalidate the old stage completion');
assert.ok(model.stageTasks('words').every(x=>/^[AMNO]+$/i.test(x.word)),'first words are decodable from the allowed characters');
active=1;
assert.equal(model.letterPlan().configured,false,'each child has a separate school letter level');
assert.equal(model.stageTasks('sounds').length,0,'new profile has no premature tasks');
assert.ok(core.includes('letterPlan:{configured:false,learned:[],current:[],updatedAt:null}'),'default profile starts unconfigured');
assert.ok(storage.includes('function safeGermanFoundation(raw)')&&storage.includes('completedScopes'),'storage sanitizer keeps school level and scoped progress');
assert.ok(sync.includes("'germanFoundation'"),'family sync carries the per-child selection');
assert.equal(saves,0,'reading the school letter level never creates mastery or saves progress');
console.log('Vokabeltrainer German school letter level smoke: passed');
