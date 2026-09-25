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


  const camdenRow=(word,left,top,width=120,height=22,conf=95,line=1,wordNum=1)=>['5','1','1','1',String(line),String(wordNum),String(left),String(top),String(width),String(height),String(conf),word].join('\\t');
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
  ].join('\\n');
  const camden=tesseractTsvToVocabulary(camdenTsv,'english',{profile:'camden-town'});
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

  if(ocrBookProfile({bookTitle:'Camden Town 1'},'')!=='camden-town')throw new Error('Camden book title does not activate OCR profile');
  if(ocrBookProfile({bookTitle:''},'Word lists Welcome to Camden Town!')!=='camden-town')throw new Error('Camden page text does not activate OCR profile');

  const camdenPage2=[
    header,
    camdenRow('Welcome to Camden Town!',90,20,260,24,96,1,1),camdenRow('Word lists',670,20,120,24,96,1,1),
    camdenRow('this /ðɪs/',90,75,130,22,96,2,1),camdenRow('diese(r, s); das',350,75,170,22,96,2,1),
    camdenRow('and /ænd/',90,110,125,22,96,3,1),camdenRow('und',350,110,80,22,96,3,1),
    camdenRow('too /tu:/',90,145,110,22,96,4,1),camdenRow('auch',350,145,80,22,96,4,1),camdenRow('I like elephants, too.',590,145,185,22,92,4,1),
    camdenRow('4',35,195,18,20,92,5,1),
    camdenRow('°Write down and learn “your” sentences.',90,195,270,22,95,5,2),camdenRow('Schreib „deine“ Sätze auf und lerne sie.',350,195,240,22,95,5,1),
    camdenRow('to read /ri:d/',90,245,150,22,96,6,1),camdenRow('lesen',350,245,80,22,96,6,1),camdenRow('Read the text.',590,245,130,22,93,6,1),
    camdenRow('picture /ˈpɪktʃə/',90,280,180,22,96,7,1),camdenRow('Bild',350,280,70,22,96,7,1),
    camdenRow('What’s ... in English?',90,315,230,22,96,8,1),camdenRow('Was bedeutet ... auf Englisch?',350,315,250,22,96,8,1),camdenRow('What’s “Bild” in English? – Picture.',590,315,190,22,91,8,1),
    camdenRow('5',35,355,18,20,92,9,1),
    camdenRow('to write (down) /raɪt daʊn/',90,355,230,22,96,9,2),camdenRow('(auf)schreiben, (nieder)schreiben',350,355,260,22,96,9,1),
    camdenRow('dog /dɒg/',90,395,120,22,96,10,1),camdenRow('Hund',350,395,80,22,96,10,1),
    camdenRow('phone number /fəʊn ˌnʌmbə/',90,430,245,22,96,11,1),camdenRow('Telefonnummer',350,430,150,22,96,11,1),
    camdenRow('to find /faɪnd/',90,465,140,22,96,12,1),camdenRow('finden',350,465,90,22,96,12,1),camdenRow('Where is my bag? I can’t find it.',590,465,190,22,90,12,1),
    camdenRow('pet /pet/',90,500,110,22,96,13,1),camdenRow('Haustier',350,500,100,22,96,13,1),
    camdenRow('to play (a game) /pleɪ ə geɪm/',90,535,245,22,96,14,1),camdenRow('(ein Spiel) spielen',350,535,180,22,96,14,1),
    camdenRow('How many ...? /haʊ meni/',90,570,210,22,96,15,1),camdenRow('Wie viele ...?',350,570,140,22,96,15,1),
    camdenRow('thing /θɪŋ/',90,605,125,22,96,16,1),camdenRow('Ding, Gegenstand, Sache',350,605,220,22,96,16,1)
  ].join('\\n');
  const c2=tesseractTsvToVocabulary(camdenPage2,'english',{profile:'camden-town'});
  const c2pairs=c2.rows.filter(r=>r.term&&r.translation).map(r=>r.term+'='+r.translation);
  for(const expected of [
    'this=diese(r, s); das',
    'and=und',
    'too=auch',
    'Write down and learn “your” sentences.=Schreib „deine“ Sätze auf und lerne sie.',
    'to read=lesen',
    'picture=Bild',
    'What’s ... in English?=Was bedeutet ... auf Englisch?',
    'to write (down)=(auf)schreiben, (nieder)schreiben',
    'dog=Hund',
    'phone number=Telefonnummer',
    'to find=finden',
    'pet=Haustier',
    'to play (a game)=(ein Spiel) spielen',
    'How many ...?=Wie viele ...?',
    'thing=Ding, Gegenstand, Sache'
  ])if(!c2pairs.includes(expected))throw new Error('Camden page 2 OCR pair missing: '+expected+' | '+c2pairs.join(' | '));
  if(c2.rows.some(r=>/^[0-9]+$/.test(r.term||'')||/I like elephants|Read the text|Where is my bag/.test(r.translation||'')))throw new Error('Camden page 2 kept yellow marker or third-column example: '+JSON.stringify(c2.rows));

  const camdenPage3=[
    header,
    camdenRow('Word lists',90,20,120,24,96,1,1),
    camdenRow('shut up (informal) /ʃʌt ʌp/',90,80,250,22,96,2,1),camdenRow('Halt deinen Mund!',360,80,180,22,96,2,1),
    camdenRow('I’m at Camden School for Girls.',90,120,270,22,96,3,1),camdenRow('Ich bin auf der Camden School',360,120,235,22,96,3,1),
    camdenRow('/aɪm æt kæmdən sku:l fə gɜ:lz/',115,150,245,20,90,4,1),camdenRow('for Girls.',390,150,100,22,95,4,1),
    camdenRow('school /sku:l/',90,195,140,22,96,5,1),camdenRow('Schule',360,195,90,22,96,5,1),
    camdenRow('for /fɔ:/',90,230,110,22,96,6,1),camdenRow('für',360,230,70,22,96,6,1),
    camdenRow('girl /gɜ:l/',90,265,115,22,96,7,1),camdenRow('Mädchen',360,265,100,22,96,7,1),
    camdenRow('to go to school together',90,300,230,22,96,8,1),camdenRow('zusammen zur Schule gehen',360,300,220,22,96,8,1),
    camdenRow('/gəʊ tə sku:l təgeðə/',115,330,190,20,90,9,1),
    camdenRow('he’s (= he is) /hi:z, hi iz/',90,370,210,22,96,10,1),camdenRow('er ist',360,370,80,22,96,10,1),
    camdenRow('friend /frend/',90,405,140,22,96,11,1),camdenRow('Freund/in',360,405,110,22,96,11,1),
    camdenRow('yes /jes/',90,440,110,22,96,12,1),camdenRow('ja',360,440,60,22,96,12,1),camdenRow('yes ↔ no',670,440,90,22,92,12,1),
    camdenRow('his /hɪz/',90,475,110,22,96,13,1),camdenRow('sein(e, r)',360,475,110,22,96,13,1),
    camdenRow('So he isn’t a baby like George.',90,525,270,22,96,14,1),camdenRow('Also ist er kein Baby wie George.',360,525,260,22,96,14,1),
    camdenRow('on /ɒn/',90,560,105,22,96,15,1),camdenRow('auf',360,560,60,22,96,15,1),
    camdenRow('bed /bed/',90,595,110,22,96,16,1),camdenRow('Bett',360,595,70,22,96,16,1),camdenRow('bed',670,595,50,22,92,16,1),
    camdenRow('10',35,645,22,20,92,17,1),
    camdenRow('°Complete the sentences. Write them down.',90,645,280,22,95,17,2),camdenRow('Vervollständige die Sätze. Schreibe sie auf.',360,645,275,22,95,17,1),
    camdenRow('(for) example /fər ɪgˈzɑ:mp(ə)l/',90,695,250,22,96,18,1),camdenRow('(zum) Beispiel',360,695,140,22,96,18,1),
    camdenRow('Theme 1: At school',90,750,200,26,96,19,1)
  ].join('\\n');
  const c3=tesseractTsvToVocabulary(camdenPage3,'english',{profile:'camden-town'});
  const c3pairs=c3.rows.filter(r=>r.term&&r.translation).map(r=>r.term+'='+r.translation);
  for(const expected of [
    'shut up=Halt deinen Mund!',
    'I’m at Camden School for Girls.=Ich bin auf der Camden School for Girls.',
    'school=Schule',
    'for=für',
    'girl=Mädchen',
    'to go to school together=zusammen zur Schule gehen',
    'he’s=er ist',
    'friend=Freund/in',
    'yes=ja',
    'his=sein(e, r)',
    'So he isn’t a baby like George.=Also ist er kein Baby wie George.',
    'on=auf',
    'bed=Bett',
    'Complete the sentences. Write them down.=Vervollständige die Sätze. Schreibe sie auf.',
    '(for) example=(zum) Beispiel'
  ])if(!c3pairs.includes(expected))throw new Error('Camden page 3 OCR pair missing: '+expected+' | '+c3pairs.join(' | '));
  const shut=c3.rows.find(r=>r.term==='shut up'),hes=c3.rows.find(r=>r.term==='he’s');
  if(shut?.extra!=='informal'||hes?.extra!=='= he is')throw new Error('Camden metadata was not kept as extra information: '+JSON.stringify({shut,hes}));
  const guidedBook=makeBook('','english',{id:'book_builtin_camden_town_1',title:'Camden Town 1'});
  guidedBook.builtinSource='verified-book-photos';state.books.push(guidedBook);
  const addGuided=(page,term,translation,position)=>{
    const v=makeVocabulary('english',term,translation,{verifiedAt:'2026-09-21T17:30:00.000Z'});state.vocabulary.push(v);
    const sense=primarySense(v);const br=ensureBookVocabulary(guidedBook.id,v.id,{senseId:sense.id,section:'Welcome to Camden Town!',position,termOverride:term,translationOverride:translation,verifiedAt:'2026-09-21T17:30:00.000Z'});
    br.sourcePage=page;br.source='builtin-verified-book-photo';
  };
  addGuided(170,'What can you see?','Was siehst du?',1);
  addGuided(170,'can','können',2);
  addGuided(170,'to see','sehen',3);
  addGuided(170,'car','Auto',4);
  addGuided(171,'phone number','Telefonnummer',5);
  addGuided(171,'to find','finden',6);
  rebuildWordIndexes();

  const guided170=[
    header,
    camdenRow('170',35,20,40,20,96,1,1),
    camdenRow('°What can you sce?',90,90,220,22,82,2,1),camdenRow('Was siehst du?',350,90,160,22,96,2,1),
    camdenRow('can /kæn/',90,130,130,22,96,3,1),camdenRow('konnen',350,130,95,22,75,3,1),
    camdenRow('YELLOW BOX IGNORE',650,130,170,22,96,3,1)
  ].join('\\n');
  const g170=tesseractTsvToVocabulary(guided170,'english',{profile:'camden-town'});
  if(!g170.bookGuided||g170.bookPage!==170||g170.rows.length!==4)throw new Error('Camden known page number did not restore verified page rows: '+JSON.stringify(g170));
  for(const expected of ['What can you see?=Was siehst du?','can=können','to see=sehen','car=Auto']){
    if(!g170.rows.some(r=>r.term+'='+r.translation===expected))throw new Error('Verified Camden page row missing: '+expected+' '+JSON.stringify(g170.rows));
  }
  if(g170.rows.some(r=>/YELLOW|kæn|konnen/.test((r.term||'')+' '+(r.translation||''))))throw new Error('Verified Camden guidance kept OCR noise instead of canonical book data');

  const guided171=[
    header,
    camdenRow('phone number /fəʊn ˌnʌmbə/',90,80,245,22,90,1,1),camdenRow('Telefonnummer',350,80,150,22,96,1,1),
    camdenRow('to find /faɪnd/',90,120,140,22,90,2,1),camdenRow('finden',350,120,90,22,96,2,1),
    camdenRow('5',35,160,18,20,92,3,1),camdenRow('yellow exercise text',620,160,180,22,96,3,2)
  ].join('\\n');
  const g171=tesseractTsvToVocabulary(guided171,'english',{profile:'camden-town'});
  if(!g171.bookGuided||g171.bookPage!==171||g171.rows.length!==2)throw new Error('Camden fuzzy page guidance failed: '+JSON.stringify(g171));
  if(!g171.rows.every(r=>r.origin==='verified-book'))throw new Error('Camden guided rows are not marked as verified-book');

  state=defaultState();state.activeSubject='english';
  const book=upsertBook('9780140449136','english',{title:'Test Book'}).book;
  let photoSet={id:'photo_set',learnerId:'learner_demo',subject:'english',title:'Unit 1',schoolYear:currentSchoolYear(),bookId:book.id,bookSection:'Unit 1',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:'',pairReviewRequired:true,pairVerifiedAt:''};
  state.sets.push(photoSet);
  const photo=attachVocabularyToSet(photoSet.id,{term:'look',translation:'schauen',source:'photo-text-import',verified:false});
  if(state.bookVocabulary.length!==0)throw new Error('unreviewed OCR leaked into book library');
  if(knownBookSections(book.id).length!==0)throw new Error('unreviewed OCR became reusable book content');
  if(!setNeedsPairReview(photoSet))throw new Error('fresh photo import is not blocked before review');
  if(syncSetToBookVocabulary(photoSet.id,'2026-09-20T11:59:00.000Z')!==0)throw new Error('explicit verifiedAt bypassed open OCR pair review');
  photoSet.pairReviewRequired=false;photoSet.pairVerifiedAt='2026-09-20T12:00:00.000Z';photoSet.pairVerifiedSignature=pairReviewSignatureForSet(photoSet.id);
  if(setNeedsPairReview(photoSet))throw new Error('approved OCR set still blocked despite matching signature');
  if(state.sets.find(setNeedsPairReview))throw new Error('pair-review predicate is not safe when used as Array.find callback');
  syncSetToBookVocabulary(photoSet.id,photoSet.pairVerifiedAt);
  if(state.bookVocabulary.length!==1||!state.bookVocabulary[0].verifiedAt)throw new Error('confirmed OCR was not published as verified book content');
  if(knownBookSections(book.id)[0]?.items?.length!==1)throw new Error('verified OCR is not reusable after approval');

  const approvedPhotoSnapshot=JSON.parse(JSON.stringify(storagePayload(state)));
  const approvedLink=state.setVocabulary.find(x=>x.setId===photoSet.id);
  approvedLink.translationOverride='ansehen';
  if(!setNeedsPairReview(photoSet))throw new Error('post-approval pair change did not invalidate OCR approval');
  if(syncSetToBookVocabulary(photoSet.id,new Date().toISOString())!==0)throw new Error('changed OCR pair bypassed approval through explicit timestamp');
  approvedLink.translationOverride='';
  photoSet.pairVerifiedSignature=pairReviewSignatureForSet(photoSet.id);
  if(setNeedsPairReview(photoSet))throw new Error('restored approved OCR signature did not clear review requirement');

  const missingApproval=JSON.parse(JSON.stringify(approvedPhotoSnapshot));
  const missingApprovalSet=missingApproval.sets.find(x=>x.id==='photo_set');
  missingApprovalSet.pairReviewRequired=false;missingApprovalSet.pairVerifiedAt='';missingApprovalSet.pairVerifiedSignature='';missingApproval.pairAuditVersion=99;
  state=migrate(missingApproval);
  const migratedMissingApproval=state.sets.find(x=>x.id==='photo_set');
  if(!migratedMissingApproval?.pairReviewRequired||!setNeedsPairReview(migratedMissingApproval))throw new Error('current-version photo import without approval was not quarantined');

  const changedAfterApproval=JSON.parse(JSON.stringify(approvedPhotoSnapshot));
  const changedSet=changedAfterApproval.sets.find(x=>x.id==='photo_set');
  const changedLink=changedAfterApproval.setVocabulary.find(x=>x.setId==='photo_set');
  changedLink.translationOverride='falsche Bedeutung';
  changedSet.pairReviewRequired=false;changedAfterApproval.pairAuditVersion=99;
  state=migrate(changedAfterApproval);
  const migratedChanged=state.sets.find(x=>x.id==='photo_set');
  if(!migratedChanged?.pairReviewRequired||migratedChanged.pairVerifiedAt||migratedChanged.pairVerifiedSignature)throw new Error('changed approved OCR pair was not invalidated during migration');

  state=migrate(JSON.parse(JSON.stringify(approvedPhotoSnapshot)));
  photoSet=state.sets.find(x=>x.id==='photo_set');

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
if(!io.includes('reconcileCamdenWithVerifiedBook'))throw new Error('OCR safety smoke failed: verified Camden library guidance is missing');
if(!translation.includes("row.include=false"))throw new Error('OCR safety smoke failed: automatic repairs are still preselected');

console.log('Vokabeltrainer OCR pairing safety smoke: passed');
for(const pair of result)console.log('✓ '+pair);
console.log('✓ wide German column is preserved');
console.log('✓ automatic dictionary/repair rows require explicit confirmation');
console.log('✓ unreviewed OCR cannot enter reusable book content');
console.log('✓ pair approval publishes verified book content');
console.log('✓ explicit timestamps cannot bypass open OCR review');
console.log('✓ post-approval pair changes invalidate learning readiness');
console.log('✓ current-version malformed OCR approvals are quarantined during migration');
console.log('✓ historical unverified OCR clones are quarantined');
console.log('✓ trusted historical book rows are backfilled');
