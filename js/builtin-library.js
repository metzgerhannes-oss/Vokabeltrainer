'use strict';

const BUILTIN_LIBRARY_VERSION=1;
const BUILTIN_LIBRARY_VERIFIED_AT='2026-09-21T17:30:00.000Z';
const BUILTIN_CAMDEN_BOOK=Object.freeze({
  id:'book_builtin_camden_town_1',
  subject:'english',
  title:'Camden Town 1',
  source:'verified-book-photos',
  version:BUILTIN_LIBRARY_VERSION
});
const BUILTIN_CAMDEN_SOURCES=Object.freeze([
  {section:'Welcome to Camden Town!',path:'./data/camden-town-1-welcome.tsv'},
  {section:'Theme 1: At school',path:'./data/camden-town-1-theme1.tsv'}
]);

const CAMDEN_CANONICAL_TERMS=Object.freeze({
  'a, an':'a',
  'Where is ...? / Where are ...?':'Where is ...?',
  'to write (down)':'to write',
  'to play (a game)':'to play',
  '(for) example':'for example',
  'thanks, thank you':'thanks',
  'bye (informal)/goodbye':'bye',
  "(I'm) sorry.":"I'm sorry.",
  "that's (not), that is (not)":"that's",
  'science lab(oratory)':'science lab'
});
const CAMDEN_TERM_ALIASES=Object.freeze({
  'a, an':['a','an'],
  'Where is ...? / Where are ...?':['Where is ...?','Where are ...?'],
  'to write (down)':['to write','to write down'],
  'to play (a game)':['to play','to play a game'],
  '(for) example':['for example','example'],
  "he's (= he is)":["he's",'he is'],
  "you're (= you are)":["you're",'you are'],
  "what's (= what is)":["what's",'what is'],
  "it's (= it is)":["it's",'it is'],
  'mobile (= mobile phone)':['mobile','mobile phone'],
  "that's (not), that is (not)":["that's",'that is',"that's not",'that is not'],
  "isn't (= is not)":["isn't",'is not'],
  'Mr (= Mister)':['Mr','Mister'],
  "they're (= they are)":["they're",'they are'],
  "let's (= let us)":["let's",'let us'],
  'gym (= gymnasium)':['gym','gymnasium'],
  'science lab(oratory)':['science lab','science laboratory'],
  'to talk (to)':['to talk','to talk to'],
  'bye (informal)/goodbye':['bye','goodbye'],
  "(I'm) sorry.":["I'm sorry.",'Sorry.'],
  'thanks, thank you':['thanks','thank you']
});
const CAMDEN_TRANSLATION_ALIASES=Object.freeze({
  'ein(e)':['ein','eine'],
  'Wo ist ...? / Wo sind ...?':['Wo ist ...?','Wo sind ...?'],
  'diese(r, s); das':['dieser','diese','dieses','das'],
  'der / die / das':['der','die','das'],
  '(auf)schreiben, (nieder)schreiben':['aufschreiben','niederschreiben','schreiben'],
  '(ein Spiel) spielen':['spielen','ein Spiel spielen'],
  'Freund/in':['Freund','Freundin'],
  'sein(e, r)':['sein','seine','seiner'],
  'hier: du bist':['du bist'],
  '(zum) Beispiel':['zum Beispiel','Beispiel'],
  'das ist (nicht)':['das ist','das ist nicht'],
  'hier: es ist nie an seinem Platz':['es ist nie an seinem Platz'],
  '(zu) spät':['spät','zu spät'],
  'dein(e); euer/eure; Ihr(e)':['dein','deine','euer','eure','Ihr','Ihre'],
  'Entschuldigung. / Tut mir leid.':['Entschuldigung.','Tut mir leid.'],
  'Was ist mit ...? hier auch: Wie wäre es mit ...?':['Was ist mit ...?','Wie wäre es mit ...?'],
  'Herr (Anrede)':['Herr'],
  '(Schul)klasse':['Klasse','Schulklasse'],
  'Klassenkamerad/in, Mitschüler/in':['Klassenkamerad','Klassenkameradin','Mitschüler','Mitschülerin'],
  'Mathe(unterricht)':['Mathe','Matheunterricht'],
  'Lass(t) (uns)':['Lass uns','Lasst uns'],
  '(Unterrichts)stunde':['Stunde','Unterrichtsstunde'],
  'groß, hoch (gewachsen)':['groß','hoch gewachsen'],
  'Inder/in; indisch':['Inder','Inderin','indisch'],
  'Grieche/Griechin; griechisch':['Grieche','Griechin','griechisch'],
  'Hindi (Amtssprache in Indien)':['Hindi'],
  'andere(r, s)':['anderer','andere','anderes'],
  '(noch) mehr, weitere(r, s)':['mehr','noch mehr','weiterer','weitere','weiteres'],
  'Deutsche/r; deutsch':['Deutscher','Deutsche','deutsch'],
  'Englisch; englisch':['Englisch','englisch'],
  '(Versammlungs)saal, Aula':['Versammlungssaal','Saal','Aula'],
  'sprechen, reden (mit)':['sprechen','reden','reden mit'],
  '(sich) fühlen':['sich fühlen','fühlen'],
  'sich (hin)setzen':['sich setzen','sich hinsetzen'],
  'Lehrer/in':['Lehrer','Lehrerin'],
  'Hausaufgabe(n)':['Hausaufgabe','Hausaufgaben'],
  'Schüler/in':['Schüler','Schülerin']
});

function builtinStableHash(value){
  let h=2166136261;
  for(const c of String(value||'')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}
  return (h>>>0).toString(36);
}
function builtinId(prefix,value){return prefix+'_'+builtinStableHash(value)}
function camdenCanonicalTerm(value){
  const exact=String(value||'').trim();
  return CAMDEN_CANONICAL_TERMS[exact]||exact
    .replace(/\s*\((?:informal(?:,\s*pl)?|no pl)\)\s*$/i,'')
    .replace(/\s*\(=\s*[^)]+\)\s*$/i,'')
    .trim();
}
function camdenTermAliases(value){
  const exact=String(value||'').trim(),canonical=camdenCanonicalTerm(exact);
  return [...new Set([canonical,exact,...(CAMDEN_TERM_ALIASES[exact]||[])].filter(Boolean))];
}
function camdenTranslationAliases(value){
  const exact=String(value||'').trim(),fixed=CAMDEN_TRANSLATION_ALIASES[exact];
  if(fixed)return [...new Set(fixed)];
  if(/[.!?…]/.test(exact)||exact.split(/\s+/).length>8)return [];
  return /[;,]/.test(exact)
    ? [...new Set(exact.split(/[;,]/).map(x=>x.trim().replace(/^hier:\s*/i,'')).filter(Boolean))]
    : [];
}
function builtinFindVocabulary(subject,term){
  const key=lexicalKey(term,subject);
  return (state?.vocabulary||[]).find(v=>v.subject===subject&&[v.term,...(v.termVariants||[])].some(x=>lexicalKey(x,subject)===key))||null;
}
function builtinFindSense(v,translation,aliases=[]){
  const keys=new Set([translation,...aliases].map(meaningKey).filter(Boolean));
  return (v?.senses||[]).find(s=>[s.translation,...(s.translations||[])].some(x=>keys.has(meaningKey(x))))||null;
}
function builtinSet(obj,key,value){
  if(JSON.stringify(obj?.[key]??null)===JSON.stringify(value??null))return 0;
  obj[key]=value;
  return 1;
}
async function loadBuiltinCamdenRows(source){
  const response=await fetch(source.path,{cache:'no-cache'});
  if(!response.ok)throw new Error('Lehrwerksdaten nicht verfügbar: '+source.path);
  const text=await response.text();
  return text.split(/\r?\n/).map(line=>line.trimEnd()).filter(Boolean).map(line=>{
    const cols=line.split('\t');
    return {page:Number(cols.shift())||0,term:String(cols.shift()||'').trim(),translation:cols.join('\t').trim()};
  }).filter(x=>x.term&&x.translation);
}
function ensureBuiltinCamdenVocabulary(entry,section,position,book){
  const subject='english',bookTerm=entry.term,bookTranslation=entry.translation;
  const canonicalTerm=camdenCanonicalTerm(bookTerm),termAliases=camdenTermAliases(bookTerm),translationAliases=camdenTranslationAliases(bookTranslation);
  let changes=0,v=builtinFindVocabulary(subject,canonicalTerm);
  if(!v){
    const vocabId=builtinId('builtin_ct1_v',subject+'\0'+lexicalKey(canonicalTerm,subject));
    const senseId=builtinId('builtin_ct1_s',lexicalKey(canonicalTerm,subject)+'\0'+meaningKey(bookTranslation));
    v=makeVocabulary(subject,canonicalTerm,bookTranslation,{
      id:vocabId,
      termVariants:termAliases.filter(x=>x!==canonicalTerm),
      verifiedAt:BUILTIN_LIBRARY_VERIFIED_AT,
      sources:[{kind:'builtin-book',bookId:book.id,at:BUILTIN_LIBRARY_VERIFIED_AT}],
      senses:[{id:senseId,translation:bookTranslation,translations:translationAliases}]
    });
    state.vocabulary.push(v);changes++;
  }else{
    attachVocabularySenseApi(v);
    changes+=builtinSet(v,'termVariants',[...new Set([...(v.termVariants||[]),...termAliases].filter(x=>x&&x!==v.term))]);
    if(!v.verifiedAt){v.verifiedAt=BUILTIN_LIBRARY_VERIFIED_AT;changes++}
    v.sources=Array.isArray(v.sources)?v.sources:[];
    if(!v.sources.some(x=>x.kind==='builtin-book'&&x.bookId===book.id)){
      v.sources.push({kind:'builtin-book',bookId:book.id,at:BUILTIN_LIBRARY_VERIFIED_AT});changes++;
    }
  }

  let sense=builtinFindSense(v,bookTranslation,translationAliases);
  if(!sense){
    sense=makeVocabularySense(bookTranslation,{
      id:builtinId('builtin_ct1_s',lexicalKey(canonicalTerm,subject)+'\0'+meaningKey(bookTranslation)),
      translations:translationAliases
    });
    v.senses.push(sense);changes++;
  }else{
    changes+=builtinSet(sense,'translations',[...new Set([...(sense.translations||[]),...translationAliases].filter(x=>meaningKey(x)!==meaningKey(sense.translation)))]);
  }

  const row=ensureBookVocabulary(book.id,v.id,{
    senseId:sense.id,section,position,
    termOverride:bookTerm,translationOverride:bookTranslation,
    acceptedTermOverrides:termAliases,
    acceptedTranslationOverrides:translationAliases,
    verifiedAt:BUILTIN_LIBRARY_VERIFIED_AT
  });
  if(row){
    changes+=builtinSet(row,'id',builtinId('builtin_ct1_bv',book.id+'\0'+section+'\0'+position));
    changes+=builtinSet(row,'termOverride',bookTerm);
    changes+=builtinSet(row,'translationOverride',bookTranslation);
    changes+=builtinSet(row,'acceptedTermOverrides',termAliases);
    changes+=builtinSet(row,'acceptedTranslationOverrides',translationAliases);
    changes+=builtinSet(row,'position',position);
    changes+=builtinSet(row,'verifiedAt',BUILTIN_LIBRARY_VERIFIED_AT);
    changes+=builtinSet(row,'source','builtin-verified-book-photo');
    changes+=builtinSet(row,'sourcePage',entry.page);
  }
  return changes;
}
async function installBuiltinLibraries(){
  if(!state)return {changed:false,rows:0};
  const groups=await Promise.all(BUILTIN_CAMDEN_SOURCES.map(async source=>({...source,entries:await loadBuiltinCamdenRows(source)})));
  state.books=Array.isArray(state.books)?state.books:[];
  state.bookVocabulary=Array.isArray(state.bookVocabulary)?state.bookVocabulary:[];
  state.vocabulary=Array.isArray(state.vocabulary)?state.vocabulary:[];

  let changes=0,book=state.books.find(b=>b.id===BUILTIN_CAMDEN_BOOK.id);
  if(!book){
    book=makeBook('',BUILTIN_CAMDEN_BOOK.subject,{
      id:BUILTIN_CAMDEN_BOOK.id,title:BUILTIN_CAMDEN_BOOK.title,
      createdAt:BUILTIN_LIBRARY_VERIFIED_AT,updatedAt:BUILTIN_LIBRARY_VERIFIED_AT
    });
    book.builtinSource=BUILTIN_CAMDEN_BOOK.source;
    book.builtinVersion=BUILTIN_CAMDEN_BOOK.version;
    state.books.push(book);changes++;
  }else{
    changes+=builtinSet(book,'subject',BUILTIN_CAMDEN_BOOK.subject);
    changes+=builtinSet(book,'title',BUILTIN_CAMDEN_BOOK.title);
    changes+=builtinSet(book,'builtinSource',BUILTIN_CAMDEN_BOOK.source);
    changes+=builtinSet(book,'builtinVersion',BUILTIN_CAMDEN_BOOK.version);
  }

  let rows=0;
  for(const group of groups)group.entries.forEach((entry,index)=>{changes+=ensureBuiltinCamdenVocabulary(entry,group.section,index+1,book);rows++});
  rebuildWordIndexes();
  return {changed:changes>0,changes,books:1,rows,sections:groups.length};
}
