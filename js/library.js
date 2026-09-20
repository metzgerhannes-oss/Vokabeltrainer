
'use strict';

const LIBRARY_INDEX_VERSION=1;

function libraryIndexList(map,key,value){
  if(!key)return;
  let arr=map.get(key);
  if(!arr){arr=[];map.set(key,arr)}
  if(!arr.includes(value))arr.push(value);
}
function libraryLexemeKey(subject,term){
  const key=lexicalKey(term,subject);
  return key?subject+'::'+key:'';
}
function libraryMeaningKey(subject,value){
  const key=meaningKey(value);
  return key?subject+'::'+key:'';
}
function librarySectionKey(bookId,section){
  return String(bookId||'')+'::'+normalize(String(section||'Lernset'));
}
function buildGlobalLibraryIndex(s=state){
  if(!s)return null;
  const idx={
    version:LIBRARY_INDEX_VERSION,
    vocabById:new Map(),vocabByLexeme:new Map(),senseById:new Map(),sensesByMeaning:new Map(),
    booksById:new Map(),bookByIsbn:new Map(),rowsById:new Map(),rowsByBook:new Map(),rowsByBookSection:new Map(),rowsByVocab:new Map(),
    linksByVocab:new Map(),setsById:new Map(),docs:new Map()
  };
  (s.books||[]).forEach(b=>{idx.booksById.set(b.id,b);if(b.isbn13)idx.bookByIsbn.set(b.isbn13,b)});
  (s.sets||[]).forEach(x=>idx.setsById.set(x.id,x));
  (s.vocabulary||[]).forEach(v=>{
    attachVocabularySenseApi(v);idx.vocabById.set(v.id,v);
    for(const form of [v.term,...(v.termVariants||[])])libraryIndexList(idx.vocabByLexeme,libraryLexemeKey(v.subject,form),v);
    for(const sense of (v.senses||[])){
      idx.senseById.set(sense.id,{sense,vocab:v});
      for(const text of [sense.translation,...(sense.translations||[])])libraryIndexList(idx.sensesByMeaning,libraryMeaningKey(v.subject,text),{sense,vocab:v});
    }
  });
  (s.bookVocabulary||[]).forEach(row=>{
    idx.rowsById.set(row.id,row);
    libraryIndexList(idx.rowsByBook,row.bookId,row);
    libraryIndexList(idx.rowsByBookSection,librarySectionKey(row.bookId,row.section),row);
    libraryIndexList(idx.rowsByVocab,row.vocabId,row);
  });
  (s.setVocabulary||[]).forEach(link=>libraryIndexList(idx.linksByVocab,link.vocabId,link));
  for(const v of (s.vocabulary||[])){
    const rows=idx.rowsByVocab.get(v.id)||[],links=idx.linksByVocab.get(v.id)||[];
    const setIds=[...new Set(links.map(x=>x.setId))],sets=setIds.map(id=>idx.setsById.get(id)).filter(Boolean);
    const bookIds=[...new Set(rows.map(x=>x.bookId))],books=bookIds.map(id=>idx.booksById.get(id)).filter(Boolean);
    const sections=[...new Set(rows.map(x=>x.section||'Lernset'))];
    const senseText=(v.senses||[]).flatMap(x=>[x.translation,...(x.translations||[]),x.partOfSpeech,...(x.examples||[])]);
    const rowText=rows.flatMap(x=>[x.termOverride,x.translationOverride,...(x.acceptedTermOverrides||[]),...(x.acceptedTranslationOverrides||[]),x.extraOverride,x.section]);
    const bookText=books.flatMap(x=>[x.title,x.isbn13,x.publisher,x.edition]);
    const setText=sets.flatMap(x=>[x.title,x.bookSection]);
    idx.docs.set(v.id,{
      vocab:v,subject:v.subject,
      searchText:normalize([v.term,...(v.termVariants||[]),v.extra,...senseText,...rowText,...bookText,...setText].filter(Boolean).join(' ')),
      bookIds:new Set(bookIds),sectionKeys:new Set(sections.map(normalize)),setIds:new Set(setIds),sections
    });
  }
  Object.defineProperty(s,'_libraryIndex',{value:idx,writable:true,configurable:true,enumerable:false});
  return idx;
}
function globalLibraryIndex(s=state){
  return s?(s._libraryIndex||buildGlobalLibraryIndex(s)):null;
}
function invalidateGlobalLibraryIndex(s=state){
  if(!s)return;
  try{Object.defineProperty(s,'_libraryIndex',{value:null,writable:true,configurable:true,enumerable:false})}catch(_e){}
}
const _coreRebuildWordIndexes=rebuildWordIndexes;
rebuildWordIndexes=function(s=state){
  const result=_coreRebuildWordIndexes(s);
  buildGlobalLibraryIndex(s);
  return result;
};

function indexedVocabularyMatch(subject,term,extra=''){
  const idx=globalLibraryIndex(),bucket=libraryLexemeKey(subject,term);
  if(!idx||!bucket)return null;
  const candidates=idx.vocabByLexeme.get(bucket)||[];
  if(!candidates.length)return null;
  if(candidates.length===1)return candidates[0];
  const ex=lexicalKey(extra,subject);
  if(subjectHasCapability(subject,'extraIdentity')&&ex){
    const exact=candidates.find(v=>lexicalKey(v.extra,subject)===ex);
    if(exact)return exact;
  }
  return candidates[0];
}
function indexedBookByIsbn(isbn){
  const normalized=normalizeIsbn(isbn);
  return normalized?(globalLibraryIndex()?.bookByIsbn.get(normalized)||null):null;
}
function indexedVocabularyUsage(vocabId,senseId=''){
  const idx=globalLibraryIndex(),all=idx?.linksByVocab.get(String(vocabId||''))||[],links=senseId?all.filter(x=>x.senseId===senseId):all;
  const setIds=new Set(links.map(x=>x.setId)),learnerIds=new Set([...setIds].map(id=>idx?.setsById.get(id)?.learnerId).filter(Boolean));
  return {links:links.length,sets:setIds.size,learners:learnerIds.size,setIds:[...setIds],learnerIds:[...learnerIds]};
}
function libraryRowsForVocabulary(vocabId,bookId='',section=''){
  const idx=globalLibraryIndex();let rows=[...(idx?.rowsByVocab.get(String(vocabId||''))||[])];
  if(bookId)rows=rows.filter(x=>x.bookId===bookId);
  const sectionNorm=normalize(section);
  if(sectionNorm){const exact=rows.filter(x=>normalize(x.section||'Lernset')===sectionNorm);if(exact.length)rows=exact}
  return rows;
}
function globalLibraryBooks(subject=state?.activeSubject){
  const idx=globalLibraryIndex();
  return [...(idx?.booksById.values()||[])].filter(b=>b.subject===subject&&(idx.rowsByBook.get(b.id)||[]).length).sort((a,b)=>(a.title||a.isbn13).localeCompare(b.title||b.isbn13,'de'));
}
function globalLibrarySections(subject=state?.activeSubject,bookId=''){
  const idx=globalLibraryIndex(),rows=bookId?[...(idx?.rowsByBook.get(bookId)||[])]:[...(state?.bookVocabulary||[])];
  return [...new Set(rows.filter(r=>idx?.booksById.get(r.bookId)?.subject===subject).map(r=>r.section||'Lernset'))].sort((a,b)=>a.localeCompare(b,'de'));
}
function searchGlobalLibrary({subject=state?.activeSubject,query='',bookId='',section='',setId=''}={}){
  const idx=globalLibraryIndex(),q=normalize(query),sectionNorm=normalize(section);
  if(!idx)return [];
  return [...idx.docs.values()].filter(doc=>
    doc.subject===subject&&
    (!bookId||doc.bookIds.has(bookId))&&
    (!sectionNorm||doc.sectionKeys.has(sectionNorm))&&
    (!setId||doc.setIds.has(setId))&&
    (!q||doc.searchText.includes(q))
  ).map(doc=>doc.vocab);
}
function libraryMatchForContext(subject,term,extra='',translation='',bookId='',section=''){
  const v=indexedVocabularyMatch(subject,term,extra);
  if(!v)return {vocab:null,sense:null,matchedBy:'',bookRows:[],senseOptions:[]};
  const rows=libraryRowsForVocabulary(v.id,bookId,section),direct=senseMatch(v,translation);
  if(direct)return {vocab:v,sense:direct,matchedBy:'global',bookRows:rows,senseOptions:[direct,...(v.senses||[]).filter(x=>x.id!==direct.id)]};
  const key=meaningKey(translation);
  if(key&&rows.length){
    for(const row of rows){
      const sense=senseById(v,row.senseId)||primarySense(v);if(!sense)continue;
      const accepted=[row.translationOverride,...(row.acceptedTranslationOverrides||[]),sense.translation,...(sense.translations||[])].map(meaningKey).filter(Boolean);
      if(accepted.includes(key))return {vocab:v,sense,matchedBy:'book',bookRows:rows,senseOptions:[sense,...(v.senses||[]).filter(x=>x.id!==sense.id)]};
    }
  }
  const preferred=[];
  for(const row of rows){const sense=senseById(v,row.senseId)||primarySense(v);if(sense&&!preferred.some(x=>x.id===sense.id))preferred.push(sense)}
  return {vocab:v,sense:null,matchedBy:'lexeme',bookRows:rows,senseOptions:[...preferred,...(v.senses||[]).filter(x=>!preferred.some(y=>y.id===x.id))]};
}
function globalLibraryMemoryEntries(subject=state?.activeSubject,bookId='',section=''){
  const preferred=bookId?searchGlobalLibrary({subject,bookId,section}):[],all=searchGlobalLibrary({subject}),ordered=[...preferred,...all.filter(v=>!preferred.some(p=>p.id===v.id))],out=[],seen=new Set();
  for(const v of ordered){
    const rows=bookId?libraryRowsForVocabulary(v.id,bookId,section):[];
    for(const row of rows){
      const sense=senseById(v,row.senseId)||primarySense(v);if(!sense)continue;
      const item={term:row.termOverride||v.term,translation:row.translationOverride||sense.translation,termVariants:[...(v.termVariants||[]),...(row.acceptedTermOverrides||[])],translations:[...(sense.translations||[]),...(row.acceptedTranslationOverrides||[])],senseId:sense.id,vocabId:v.id,bookPreferred:true};
      const key=meaningKey(item.term)+'::'+meaningKey(item.translation)+'::'+item.senseId;if(!seen.has(key)){seen.add(key);out.push(item)}
    }
    for(const sense of (v.senses||[])){
      const item={term:v.term,translation:sense.translation,termVariants:v.termVariants||[],translations:sense.translations||[],senseId:sense.id,vocabId:v.id,bookPreferred:false};
      const key=meaningKey(item.term)+'::'+meaningKey(item.translation)+'::'+item.senseId;if(!seen.has(key)){seen.add(key);out.push(item)}
    }
  }
  return out;
}
