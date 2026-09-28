import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{},navigator:{},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/storage.js','js/model.js','js/quiz-engine.js','js/learning.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const checks=vm.runInContext(`
(()=>{
  const passed=[];const assert=(value,name)=>{if(!value)throw new Error('Deutsch Paket B smoke failed: '+name);passed.push(name)};
  assert(availableSubjectIds().includes('german'),'Deutsch is selectable');
  assert(subjectSpeechLang('german')==='de-DE','German audio locale is de-DE');
  assert(subjectOcrLang('german')==='deu','German OCR locale is configured');
  assert(subjectHasCapability('german','nativeLiteracy'),'Deutsch uses native-literacy capability');
  assert(subjectCampaign('german').visualTheme==='wordrealm'&&subjectCampaign('german').unitLabel==='Ritterheer','Wortreich campaign metadata is separate');

  const base=makeLearnerVocabulary('l','v','s');
  for(const key of ['recognized','decoded','fluency','meaning','phonologicalSpelling','orthographicSpelling','dictation','sentenceUse']){
    assert(Object.hasOwn(base.literacySkills,key),'literacy dimension '+key+' is persisted');
  }

  state=defaultState();state.learners[0].activeSubjects=['german'];state.activeSubject='german';ensureActiveSubject();
  const word={id:'w',setLinkId:'sv',setId:'set',vocabId:'v',senseId:'s',learnerId:'learner_demo',subject:'german',term:'Haus',translation:'Gebäude',acceptedTerms:['Haus'],acceptedTranslations:['Gebäude'],skills:defaultSkills(),literacySkills:defaultLiteracySkills(),errorProfile:{spelling:0,context:0},modesSeen:[],recentActiveResults:[],repetitions:0,activeSuccessDays:[],activePracticeDays:[],practiceDays:[],maxActiveGapDays:0,independentSuccesses:0,intervalDays:0};
  const q=makeQuizQuestion(word,'spelling');
  assert(q.audio&&q.caseSensitiveOrthography&&q.strictOrthography,'German learning-word spelling is audio-led and case-sensitive');
  assert(gradeQuizQuestion(q,'Haus').correct===true,'correct German capitalization passes');
  assert(gradeQuizQuestion(q,'haus').correct===false,'wrong German capitalization fails');
  session={isDaily:false,index:0,scaffoldedWords:{},currentSubmode:null};
  assert(chooseAdaptiveMode(word)==='listening','new German word starts with calm hear-and-recognize scaffold');

  word.literacySkills={...defaultLiteracySkills(),recognized:1.5,orthographicSpelling:2.5,dictation:2.5,phonologicalSpelling:1.5};
  word.activeSuccessDays=['2026-09-20','2026-09-24','2026-09-28'];word.maxActiveGapDays=4;word.independentSuccesses=4;word.intervalDays=7;
  assert(nativeLiteracyWordSecure(word)===true,'German learning-word safety derives from literacy evidence, not foreign-language retrieval');
  assert((word.skills.retrieval||0)===0,'German word safety does not require foreign-language translation retrieval');
  return passed;
})()
`,context,{filename:'deutsch-package-b-smoke'});

const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('css/app.css','utf8'),ui=fs.readFileSync('js/ui.js','utf8');
const staticChecks=[
  [html.includes('id="germanLearningPath"')&&html.includes('german-fox')&&html.includes('wood-sword'),'German learning hub has fox and wooden-sword motifs'],
  [css.includes('.german-learning-path')&&css.includes('.wood-sword'),'German learning visuals are styled without battle coupling'],
  [ui.includes("theme:'wordrealm'")&&ui.includes("unitLabel:'Ritterheer'")&&ui.includes("targetLabel:'BURG'"),'Wortreich keeps the knight/castle presentation'],
  [ui.includes("nativeGerman?'Wortreich':'Armee'"),'German game navigation is labelled Wortreich']
];
for(const [value,name] of staticChecks){if(!value)throw new Error('Deutsch Paket B smoke failed: '+name);checks.push(name)}
console.log('Vokabeltrainer Deutsch Paket B smoke: '+checks.length+' checks passed');
for(const name of checks)console.log('✓ '+name);
