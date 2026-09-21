import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,Blob,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{matchMedia:()=>({matches:false})},
  navigator:{},
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/quiz-engine.js','js/learning.js','js/io.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const passed=vm.runInContext(`
(()=>{
  const ok=[];const assert=(v,n)=>{if(!v)throw new Error('Release audit smoke failed: '+n);ok.push(n)};

  const strict={target:"can't",targets:["can't"],strictOrthography:true};
  const tolerant={target:"can't",targets:["can't"],strictOrthography:false};
  assert(practiceAnswerMatches('cant',strict)===false,'testcheck target spelling preserves apostrophes');
  assert(practiceAnswerMatches('cant',tolerant)===true,'semantic comparison remains separately tolerant');

  state=defaultState();
  session={practiceContext:{testFormat:'target'},index:0};
  let d=practiceDirection({term:"can't",translation:'nicht können',acceptedTerms:["can't"],acceptedTranslations:['nicht können']});
  assert(d.strictOrthography===true,'target-direction testcheck is orthographically strict');
  session={practiceContext:{testFormat:'dictation'},index:0};
  d=practiceDirection({term:'café',translation:'Café',acceptedTerms:['café'],acceptedTranslations:['Café']});
  assert(d.strictOrthography===true&&practiceAnswerMatches('cafe',d)===false,'dictation preserves diacritics');

  const within={
    learners:[{}],sets:[],vocabulary:[],
    setVocabulary:new Array(250000),learnerVocabulary:new Array(150000),
    books:new Array(5000),learnerBooks:new Array(10000),bookVocabulary:new Array(250000)
  };
  assert(inspectBackup(within)==='','backup accepts the same maximum normalized sizes as hardening');
  const tooLarge={...within,setVocabulary:new Array(250001)};
  assert(!!inspectBackup(tooLarge),'backup rejects normalized data beyond the hardening limit');

  const s=defaultState();
  const summary=backupSummary(s);
  for(const key of ['profiles','books','learnerBooks','bookVocabulary','sets','words','links','progress','grades','practiceTests','activity','activeLearnerId','activeSubject']){
    assert(Object.hasOwn(summary,key),'backup summary includes '+key);
  }

  const payload=storagePayload(s);
  assert(!Object.hasOwn(payload,'words'),'persisted payload excludes runtime word views');
  assert(!Object.hasOwn(payload,'_wordIndexes')&&!Object.hasOwn(payload,'_libraryIndex'),'persisted payload excludes runtime indexes');

  assert(streakActivityTypes.has('latinGrammar'),'Latin grammar counts as an active learning day');
  assert(streakActivityTypes.has('handwriting'),'handwriting counts as an active learning day');
  assert(streakActivityTypes.has('firstContact'),'first contact counts as an active learning day without granting mastery');
  assert(streakActivityTypes.has('practiceTest'),'completed testcheck counts as an active learning day');

  return ok;
})()
`,context,{filename:'release-audit-runtime'});

const learning=fs.readFileSync('js/learning.js','utf8');
const ui=fs.readFileSync('js/ui.js','utf8');
const io=fs.readFileSync('js/io.js','utf8');
const ci=fs.readFileSync('.github/workflows/ci.yml','utf8');
const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');
const staticChecks=[
  [learning.includes("recordActivity('practiceTest'"),'testcheck completion records activity'],
  [learning.includes("recordActivity('firstContact'")&&learning.includes('renderFirstContactBlockReview'),'first contact records preparation and includes block review'],
  [(()=>{const s=ui.slice(ui.indexOf('function duelPayload'),ui.indexOf('function openDuel'));return s.includes('subjectCampaign(state.activeSubject).unitLabel')&&!s.includes('learner().name')&&!s.includes('mastered:p.mastered')&&!s.includes('strength:armyStrength')})(),'friendship duel code excludes profile name and unnecessary detailed learning fields'],
  [io.includes("JSON.stringify(backupSummary(check))===JSON.stringify(backupSummary(state))"),'restore compares the full persisted summary'],
  [io.includes("persistenceMode==='indexeddb'")&&io.includes("localStorage.getItem(STORAGE_KEY)"),'restore verifies both persistence backends'],
  [ci.includes('actions/checkout@v7')&&ci.includes('actions/setup-node@v7'),'CI uses current Node-24 GitHub Actions'],
  [pages.includes('actions/checkout@v7')&&pages.includes('actions/configure-pages@v6')&&pages.includes('actions/upload-pages-artifact@v5')&&pages.includes('actions/deploy-pages@v5'),'Pages workflow uses current stable action majors']
];
for(const [value,name] of staticChecks){if(!value)throw new Error('Release audit smoke failed: '+name);passed.push(name)}

console.log('Vokabeltrainer release audit smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
