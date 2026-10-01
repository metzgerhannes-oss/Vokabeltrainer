import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';

const assert=(value,name)=>{if(!value)throw new Error('French subject smoke failed: '+name);console.log('✓ '+name)};

const modelPath='ocr/lang/fra.traineddata';
assert(fs.existsSync(modelPath),'offline French OCR model exists');
const bytes=fs.readFileSync(modelPath);
assert(bytes.length===1130365,'French OCR model has pinned size');
const blobSha=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
assert(blobSha==='d9e2b2160be0d1ca3b8f1bf2730fae476ef3b4a6','French OCR model matches pinned official tessdata_fast blob');

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,Blob,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{location:{href:'https://example.test/Vokabeltrainer/index.html'}},
  navigator:{},
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/quiz-engine.js','js/learning.js','js/translation.js','js/io.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}

const passed=vm.runInContext(`
(()=>{
  const ok=[];const check=(value,name)=>{if(!value)throw new Error('French subject smoke failed: '+name);ok.push(name)};
  check(availableSubjectIds().includes('french'),'French is available through subject metadata');
  check(subjectSpeechLang('french')==='fr-FR','French TTS locale is fr-FR');
  check(subjectOcrLang('french')==='fra','French OCR locale is fra');
  check(subjectHasCapability('french','strictTermOrthography'),'French productive orthography capability is active');
  check(lexicalKey('ou','french')!==lexicalKey('où','french'),'accent distinguishes French lexical identity');
  check(lexicalKey('cote','french')!==lexicalKey('côte','french'),'circumflex distinguishes French lexical identity');

  state=defaultState();
  learner().activeSubjects=['french'];
  state.activeSubject='french';
  ensureActiveSubject();
  check(state.activeSubject==='french','French activates in an ordinary learner profile');

  const set={id:'fr_set',learnerId:learner().id,subject:'french',title:'Unité 1',schoolYear:currentSchoolYear(),bookId:'',bookSection:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:new Date().toISOString()};
  state.sets.push(set);
  const attached=attachVocabularyToSet(set.id,{term:"l'école",translation:'die Schule',acceptedTerms:["l'école"],source:'french-smoke',verified:true});
  const word=attached.word;
  const recall=makeQuizQuestion(word,'recall');
  check(recall.answerSide==='term'&&recall.strictOrthography===true,'productive French recall is orthographically strict');
  check(gradeQuizQuestion(recall,'lecole').correct===false,'missing French apostrophe is rejected');
  check(gradeQuizQuestion(recall,"l’école").correct===true,'typographic apostrophe variant is normalized safely');

  const accent=attachVocabularyToSet(set.id,{term:'école',translation:'Schule',acceptedTerms:['école'],source:'french-smoke',verified:true});
  const accentWord=accent.word;
  check(gradeQuizQuestion(makeQuizQuestion(accentWord,'recall'),'ecole').correct===false,'missing acute accent is rejected');
  check(gradeQuizQuestion(makeQuizQuestion(accentWord,'recall'),'école').correct===true,'correct accented spelling is accepted');

  const forms=attachVocabularyToSet(set.id,{term:'beau',translation:'schön',acceptedTerms:['beau','belle'],source:'french-smoke',verified:true});
  const formWord=forms.word;
  const formRecall=makeQuizQuestion(formWord,'recall');
  check(gradeQuizQuestion(formRecall,'belle').correct===true,'explicitly stored French form variant is accepted');
  check(gradeQuizQuestion(formRecall,'bele').correct===false,'unstored French form is not invented by tolerant grading');

  const reverse=makeQuizQuestion(accentWord,'reverseRecall');
  check(reverse.answerSide==='translation'&&reverse.strictOrthography===false,'German meaning recall remains semantically tolerant');
  const spelling=makeQuizQuestion(accentWord,'spelling');
  check(spelling.strictOrthography===true&&spelling.trackOrthography===true,'French dictation is orthographically strict');

  const header='level\\tpage_num\\tblock_num\\tpar_num\\tline_num\\tword_num\\tleft\\ttop\\twidth\\theight\\tconf\\ttext';
  const row=(word,left,top,width=130,height=22,conf=96)=>['5','1','1','1',String(top),String(top),String(left),String(top),String(width),String(height),String(conf),word].join('\\t');
  const tsv=[
    header,
    row("l'école",100,100,160),row('die Schule',1450,100,180),
    row('garçon',100,140,130),row('Junge',1450,140,100),
    row('être',100,180,100),row('sein',1450,180,90),
    row('où',100,220,70),row('wo',1450,220,70)
  ].join('\\n');
  const parsed=tesseractTsvToVocabulary(tsv,'french');
  const pairs=parsed.rows.map(r=>r.term+'='+r.translation);
  for(const expected of ["l'école=die Schule",'garçon=Junge','être=sein','où=wo'])check(pairs.includes(expected),'French OCR pairing preserves '+expected);

  setLearnerWorldMode(learner(),'french','adventure');
  check(subjectVisualTheme('french')==='voyage','French adventure uses Voyage Français');
  setLearnerWorldMode(learner(),'french','battle');
  check(subjectVisualTheme('french')==='french-battle','French battle world remains separately available');

  return ok;
})()
`,context,{filename:'french-subject-runtime'});

const io=fs.readFileSync('js/io.js','utf8');
assert(io.includes('subjectOcrLang(state.activeSubject)'),'OCR worker language stays metadata driven');
assert(io.includes("langPath:new URL('ocr/lang/',document.baseURI).href"),'OCR worker uses bundled local language path');
const learning=fs.readFileSync('js/learning.js','utf8');
assert(learning.includes("subjectSpeechLang(state.activeSubject)||'en-GB'"),'learning audio takes locale from subject metadata');

console.log('Vokabeltrainer French subject smoke: '+(passed.length+5)+' checks passed');
