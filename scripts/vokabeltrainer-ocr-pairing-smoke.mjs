import fs from 'node:fs';
import vm from 'node:vm';

const context=vm.createContext({
  console,Date,Math,JSON,Set,Map,WeakMap,WeakSet,Number,String,Boolean,Array,Object,RegExp,Error,TypeError,Promise,URL,Blob,
  setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,
  document:{querySelector:()=>null,querySelectorAll:()=>[]},
  window:{location:{href:'https://example.test/Vokabeltrainer/index.html'}},
  navigator:{},
  localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}}
});
for(const file of ['js/core.js','js/library.js','js/storage.js','js/model.js','js/translation.js','js/io.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}
const result=vm.runInContext(`
(()=>{
  state=defaultState();state.activeSubject='english';
  const header='level\\tpage_num\\tblock_num\\tpar_num\\tline_num\\tword_num\\tleft\\ttop\\twidth\\theight\\tconf\\ttext';
  const row=(word,left,top,width=100,height=20,conf=95)=>['5','1','1','1',String(top),String(top),String(left),String(top),String(width),String(height),String(conf),word].join('\\t');
  const tsv=[
    header,
    row('Vocabulary',80,0,180),
    row('Unit',80,25,90),
    row('Test',80,50,80),
    row('look',100,100,120),row('schauen',1500,100,210),
    row('write',100,140,120),row('schreiben',1500,140,230),
    row('house',100,180,130),row('Haus',1500,180,130)
  ].join('\\n');
  const parsed=tesseractTsvToVocabulary(tsv,'english');
  if(parsed.rows.length!==3)throw new Error('expected 3 OCR pairs, got '+parsed.rows.length+' '+JSON.stringify(parsed.rows));
  const pairs=parsed.rows.map(r=>r.term+'='+r.translation);
  if(!pairs.includes('look=schauen')||!pairs.includes('write=schreiben')||!pairs.includes('house=Haus'))throw new Error('wide right column paired incorrectly: '+pairs.join(' | '));


  const camdenRow=(word,left,top,width=120,height=22,conf=95,line=1,wordNum=1)=>['5','1','1','1',String(line),String(wordNum),String(left),String(top),String(width),String(height),String(conf),word].join('\t');
  const camdenTsv=[
    header,
    camdenRow('Word lists',120,20,150,26,95,1,1),
    camdenRow('Welcome to Camden Town!',120,70,300,24,96,2,1),camdenRow('Willkommen in Camden Town!',510,70,270,24,96,2,1),
    camdenRow("/'welkam to ,kaemdan 'taun/",150,102,275,20,90,3,1),
    camdenRow('Arbeitsanweisungen, die häufig im Buch vorkommen, kannst du in der Liste nachlesen.',120,140,350,20,92,4,1),
    camdenRow('°What can you see?',120,190,245,22,96,5,1),camdenRow('Was siehst du?',510,190,180,22,96,5,1),
    camdenRow('can /kæn/',120,230,150,22,96,6,1),camdenRow('können',510,230,105,22,96,6,1),camdenRow('can © car',820,230,115,22,90,6,1),
    camdenRow('to* see /si:/',120,270,175,22,96,7,1),camdenRow('sehen',510,270,95,22,96,7,1),camdenRow('can see a',820,270,110,22,90,7,1),
    camdenRow('*An dem Wort to erkennst du, dass es sich um den Infinitiv handelt.',120,310,350,20,92,8,1),
    camdenRow('a, an /ə, ən/',120,355,165,22,96,9,1),camdenRow('ein(e)',510,355,95,22,96,9,1),camdenRow('a car',820,355,90,22,90,9,1),
    camdenRow('car /kɑ:/',120,395,135,22,96,10,1),camdenRow('Auto',510,395,80,22,96,10,1),
    camdenRow('I /aɪ/',120,435,100,22,96,11,1),camdenRow('ich',510,435,70,22,96,11,1),
    camdenRow('°Listen.',120,475,110,22,96,12,1),camdenRow('Hör zu.',510,475,110,22,96,12,1),
    camdenRow('to listen to /ˈlɪs(ə)n tə/',120,515,245,22,96,13,1),camdenRow('zuhören; (an)hören',510,515,220,22,96,13,1),camdenRow('Listen!',820,515,90,22,90,13,1),
    camdenRow('°Where is ...? / Where are ...?',120,555,300,22,96,14,1),camdenRow('Wo ist ...? / Wo sind ...?',510,555,245,22,96,14,1),
    camdenRow("/'weər ɪz, 'weər ɑ:/",150,588,230,20,90,15,1)
  ].join('\n');
  const camden=tesseractTsvToVocabulary(camdenTsv,'english');
  const camdenPairs=camden.rows.filter(r=>r.term&&r.translation).map(r=>r.term+'='+r.translation);
  for(const expected of [
    'Welcome to Camden Town!=Willkommen in Camden Town!',
    'What can you see?=Was siehst du?',
    'can=können',
    'to see=sehen',
    'a, an=ein(e)',
    'car=Auto',
    'I=ich',
    'Listen.=Hör zu.',
    'to listen to=zuhören; (an)hören',
    'Where is ...? / Where are ...?=Wo ist ...? / Wo sind ...?'
  ])if(!camdenPairs.includes(expected))throw new Error('Camden OCR pair missing: '+expected+' | '+camdenPairs.join(' | '));
  if(camden.rows.some(r=>/Arbeitsanweisungen|An dem Wort|welkam|kæn|si:/.test((r.term||'')+' '+(r.translation||''))))throw new Error('Camden OCR kept pronunciation/editorial noise: '+JSON.stringify(camden.rows));
  if(camden.rows.some(r=>/can © car|can see a|a car|Listen!/.test(r.translation||'')))throw new Error('Camden OCR leaked third-column examples into German translations: '+JSON.stringify(camden.rows));

  const book=upsertBook('9780140449136','english',{title:'Test Book'}).book;
  const photoSet={id:'photo_set',learnerId:'learner_demo',subject:'english',title:'Unit 1',schoolYear:currentSchoolYear(),bookId:book.id,bookSection:'Unit 1',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:true,pairVerifiedAt:''};
  state.sets.push(photoSet);
  const photo=attachVocabularyToSet(photoSet.id,{term:'look',translation:'schauen',source:'photo-text-import',verified:false});
  if(state.bookVocabulary.length!==0)throw new Error('unreviewed OCR leaked into book library');
  if(knownBookSections(book.id).length!==0)throw new Error('unreviewed OCR became reusable book content');
  photoSet.pairReviewRequired=false;photoSet.pairVerifiedAt='2026-09-20T12:00:00.000Z';
  syncSetToBookVocabulary(photoSet.id,photoSet.pairVerifiedAt);
  if(state.bookVocabulary.length!==1||!state.bookVocabulary[0].verifiedAt)throw new Error('confirmed OCR was not published as verified book content');
  if(knownBookSections(book.id)[0]?.items?.length!==1)throw new Error('verified OCR is not reusable after approval');

  state.learners.push({...state.learners[0],id:'learner_two',name:'Zweites Profil',dailyPlans:{},streakDays:[],milestones:{},fortressWinsByYear:{},campaignLog:[]});
  const copied=cloneKnownBookToLearner(book.id,'learner_two');
  if(copied.links!==1)throw new Error('verified book content was not cloned to second profile');
  const copiedSet=state.sets.find(s=>s.learnerId==='learner_two'&&s.bookId===book.id);
  if(!copiedSet||setNeedsPairReview(copiedSet))throw new Error('verified book content should remain learnable when cloned');

  const legacy=JSON.parse(JSON.stringify(storagePayload(state)));
  const historicalRow=legacy.bookVocabulary[0];
  delete historicalRow.verifiedAt;
  const original=legacy.sets.find(s=>s.id==='photo_set');original.pairReviewRequired=true;original.pairVerifiedAt='';
  const derivative=legacy.sets.find(s=>s.learnerId==='learner_two'&&s.bookId===book.id);derivative.pairReviewRequired=false;derivative.pairVerifiedAt='';
  legacy.setVocabulary.find(x=>x.setId==='photo_set').source='photo-text-import';
  legacy.setVocabulary.find(x=>x.setId===derivative.id).source='book-library';
  legacy.pairAuditVersion=1;
  state=migrate(legacy);
  const migratedDerivative=state.sets.find(s=>s.learnerId==='learner_two'&&s.bookId===book.id);
  if(!migratedDerivative?.pairReviewRequired)throw new Error('historical clone from unverified OCR was not quarantined');
  if(knownBookSections(book.id).length!==0)throw new Error('historical unverified OCR stayed reusable after migration');

  state=defaultState();state.activeSubject='english';
  const trustedBook=upsertBook('9783161484100','english',{title:'Trusted Book'}).book;
  const manualSet={id:'manual_set',learnerId:'learner_demo',subject:'english',title:'Unit M',schoolYear:currentSchoolYear(),bookId:trustedBook.id,bookSection:'Unit M',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:false,pairVerifiedAt:''};
  state.sets.push(manualSet);
  attachVocabularyToSet(manualSet.id,{term:'house',translation:'Haus',source:'manual',verified:true});
  const trustedLegacy=JSON.parse(JSON.stringify(storagePayload(state)));delete trustedLegacy.bookVocabulary[0].verifiedAt;
  state=migrate(trustedLegacy);
  if(!state.bookVocabulary[0]?.verifiedAt)throw new Error('trusted legacy book row was not backfilled as verified');
  if(knownBookSections(trustedBook.id).length!==1)throw new Error('trusted legacy book content disappeared during migration');

  return pairs;
})()
`,context,{filename:'ocr-wide-column-runtime'});

const io=fs.readFileSync('js/io.js','utf8');
const translation=fs.readFileSync('js/translation.js','utf8');
if(/right=right\.filter\(g=>g\.minX<divider\+/.test(io))throw new Error('OCR safety smoke failed: aggressive right-column x cutoff returned');
if(!io.includes("tessedit_pageseg_mode:String(T.PSM?.AUTO??3)"))throw new Error('OCR safety smoke failed: textbook OCR no longer uses automatic page segmentation');
if(!translation.includes("row.include=false"))throw new Error('OCR safety smoke failed: automatic repairs are still preselected');

console.log('Vokabeltrainer OCR pairing safety smoke: passed');
for(const pair of result)console.log('✓ '+pair);
console.log('✓ wide German column is preserved');
console.log('✓ automatic dictionary/repair rows require explicit confirmation');
console.log('✓ unreviewed OCR cannot enter reusable book content');
console.log('✓ pair approval publishes verified book content');
console.log('✓ historical unverified OCR clones are quarantined');
console.log('✓ trusted historical book rows are backfilled');
