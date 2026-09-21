'use strict';

function exportCsv(){
  const header=['set','subject','schoolYear','isbn13','bookTitle','bookSection','term','translation','senseTranslation','senseAliases','acceptedTranslations','partOfSpeech','extra','example','mnemonic','chunks']; const rows=[header.join(';')]; mySets().forEach(s=>{const b=s.bookId?bookById(s.bookId):null;setWords(s.id).forEach(w=>{const v=(state.vocabulary||[]).find(x=>x.id===w.vocabId),sense=senseById(v,w.senseId),link=(state.setVocabulary||[]).find(x=>x.id===w.setLinkId);rows.push([s.title,s.subject,s.schoolYear,b?.isbn13||'',b?.title||'',s.bookSection||'',w.term,w.translation,sense?.translation||w.translation,(sense?.translations||[]).join('|'),(link?.acceptedTranslationOverrides||[]).join('|'),sense?.partOfSpeech||'',w.extra,w.example,w.mnemonic,(w.chunks||[]).join('|')].map(csvCell).join(';'))})});download(`vokabeln_${state.activeSubject}_${today()}.csv`,rows.join('\n'),'text/csv;charset=utf-8')
}
function csvCell(v){const s=String(v??'');return /[;"\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
function detectCsvSeparator(text){
  let semi=0,comma=0,q=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(q&&text[i+1]==='"'){i++;continue}q=!q;continue}if(!q&&(c==='\n'||c==='\r'))break;if(!q&&c===';')semi++;if(!q&&c===',')comma++;}return semi>=comma?';':',';
}
function parseCsv(text){
  const src=String(text||'').replace(/^\uFEFF/,'');if(!src.trim())return[];const sep=detectCsvSeparator(src),rows=[];let row=[],field='',q=false;
  const pushField=()=>{row.push(field);field=''};const pushRow=()=>{pushField();if(row.some(v=>String(v).trim()!==''))rows.push(row);row=[]};
  for(let i=0;i<src.length;i++){
    const c=src[i];
    if(c==='"'){if(q&&src[i+1]==='"'){field+='"';i++;}else q=!q;continue;}
    if(c===sep&&!q){pushField();continue;}
    if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&src[i+1]==='\n')i++;pushRow();continue;}
    field+=c;
  }
  if(field.length||row.length)pushRow();if(rows.length<2)return[];
  const header=rows.shift().map(x=>String(x||'').trim().toLowerCase());
  return rows.slice(0,20000).map(values=>{const o={};header.forEach((k,i)=>{if(k)o[k]=values[i]??''});return o});
}
function importCsv(text){
  const rows=parseCsv(text);if(!rows.length){toast('CSV enthält keine Daten.','warn');return}
  const keys=new Set(Object.keys(rows[0]||{}));if(!keys.has('term')||!keys.has('translation')){toast('CSV benötigt die Spalten „term“ und „translation“.','bad');return}
  let linked=0,existingGlobal=0,newGlobal=0,duplicates=0,skipped=0;
  const setIndex=new Map(mySets().map(s=>[`${s.subject}\u0000${s.schoolYear}\u0000${s.title}`,s]));
  rows.forEach(r=>{
    const subj=subjectFromExternal(r.subject||state.activeSubject,state.activeSubject);if(subj!==state.activeSubject){skipped++;return}
    const term=safeText(r.term,300).trim(),translation=safeText(r.translation,700).trim();if(!term||!translation){skipped++;return}
    const importYear=safeText(r.schoolyear||currentSchoolYear(),24),title=safeText(r.set||'Import',200)||'Import',setKey=`${subj}\u0000${importYear}\u0000${title}`;let set=setIndex.get(setKey);
    if(!set){let bookId='';const isbn=normalizeIsbn(r.isbn13||r.isbn||'');if(isbn){try{bookId=upsertBook(isbn,subj,{title:safeText(r.booktitle||'',200)}).book.id}catch(_e){}}set={id:uid('set'),learnerId:learner().id,subject:subj,title,schoolYear:importYear,bookId,bookSection:safeText(r.booksection||title,200),testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};state.sets.push(set);setIndex.set(setKey,set);rebuildWordIndexes();}
    const senseTranslation=safeText(r.sensetranslation||translation,700).trim(),senseAliases=safeText(r.sensealiases,3000).split('|').slice(0,20).map(x=>safeText(x.trim(),700)).filter(Boolean),acceptedTranslations=safeText(r.acceptedtranslations,3000).split('|').slice(0,20).map(x=>safeText(x.trim(),700)).filter(Boolean);const result=attachVocabularyToSet(set.id,{term,translation,senseTranslation,senseAliases,acceptedTranslations,partOfSpeech:safeText(r.partofspeech,80).trim(),extra:safeText(r.extra,700),example:safeText(r.example,2000),mnemonic:safeText(r.mnemonic,1200),chunks:safeText(r.chunks,3000).split('|').slice(0,30).map(x=>safeText(x.trim(),120)).filter(Boolean),source:'csv-import',verified:true});
    if(result.alreadyLinked){duplicates++;return}linked++;if(result.newVocabulary)newGlobal++;else existingGlobal++;
  });
  save();toast(`${linked} Zuordnung${linked===1?'':'en'} importiert · ${newGlobal} neue globale Vokabel${newGlobal===1?'':'n'}${existingGlobal?` · ${existingGlobal} aus Bibliothek`:''}${duplicates?` · ${duplicates} bereits im Lernset`:''}${skipped?` · ${skipped} ausgelassen`:''}.`,linked?'good':'warn');
}


function cleanImportText(text){
  return String(text||'')
    .replace(/\r/g,'')
    .replace(/[\u00A0\u202F]/g,' ')
    .replace(/[•·▪◦]/g,' ')
    .split('\n')
    .map(x=>x.replace(/[ \f\v]{3,}/g,'  ').replace(/ *\t */g,'\t').trim())
    .filter(Boolean);
}
function importTitleHint(lines){
  const candidates=lines.filter(line=>/^(?:camden\s*town\b|unit\s*\d+\b|theme\s*\d+\b|part\s*[a-z0-9]+\s*$|word\s*bank\b|wordbank\b|vocabulary\b|vokabeln\b)/i.test(line));
  const best=candidates.find(x=>x.length<=70)||candidates[0]||'';
  return best.replace(/^[–—\-:|\s]+|[–—\-:|\s]+$/g,'').slice(0,80);
}
function germanScore(text){
  const t=` ${normalize(text)} `; let score=0;
  if(/[äöüß]/i.test(text))score+=3;
  [' der ',' die ',' das ',' ein ',' eine ',' einen ',' einem ',' einer ',' sich ',' jemand ',' jemanden ',' etwas ',' bzw ',' oder ',' zu '].forEach(x=>{if(t.includes(x))score+=1});
  if(/\b(jdn|jdm|etw)\.?\b/i.test(text))score+=2;
  return score;
}
function foreignScore(text,subject){
  const t=` ${normalize(text)} `;let score=0,profile=subjectImportProfile(subject);
  subjectFunctionWords(subject).forEach(word=>{if(t.includes(` ${normalize(word)} `))score+=1});
  if(profile==='latin'){
    if(/\b(us|um|ae|is|ibus|orum|arum|ere|ire|are|ri)\b/i.test(text))score+=1;
    if(/\b[fmna]\.?\b/i.test(text))score+=1;
  }else if(/\b[a-zÀ-ÿ][a-zÀ-ÿ'’-]{2,}\b/i.test(text))score+=1;
  return score;
}
function splitImportColumns(line){
  const splitters=[/\t+/,/\s+\|\s+/,/\s+[–—]\s+/,/\s+-\s+/,/\s*=\s*/,/\s{2,}/];
  for(const rx of splitters){
    const parts=line.split(rx).map(x=>x.trim()).filter(Boolean);
    if(parts.length>=2)return parts;
  }
  return [line];
}
function looksLikeExample(text,term,subject){
  const t=String(text||'').trim(); if(!t)return false;
  const words=t.split(/\s+/).length;
  if(/[.!?]$/.test(t)&&words>=3)return true;
  if(term && normalize(t).includes(normalize(term)) && words>=3)return true;
  const normalizedWords=new Set(normalize(t).split(/\s+/));if(words>=3&&subjectFunctionWords(subject).some(x=>normalizedWords.has(normalize(x))))return true;
  return subjectImportProfile(subject)==='latin' && words>=3 && !/[=:|]/.test(t);
}
function splitTermExtra(term,subject){
  let value=String(term||'').trim(), extra='';
  if(subjectImportProfile(subject)==='latin'){
    const m=value.match(/^([^,;]+)[,;]\s*(.+)$/);
    if(m && m[1].trim().split(/\s+/).length<=3){value=m[1].trim();extra=m[2].trim();}
  }else{
    const m=value.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if(m){value=m[1].trim();extra=m[2].trim();}
  }
  return {term:value,extra};
}
function makeImportRow(term,translation,extra='',example='',confidence='check',origin='ocr'){
  const tx=splitTermExtra(term,state.activeSubject);
  return {term:tx.term,translation:String(translation||'').trim(),extra:String(extra||tx.extra||'').trim(),example:String(example||'').trim(),include:true,confidence,origin};
}
function parseVocabularyText(text,subject=state.activeSubject,opts={}){
  let lines=cleanImportText(text); const profile=opts?.profile||'';if(profile==='camden-town')lines=lines.map(stripOcrPronunciation).filter(line=>line&&!/^\d{1,2}$/.test(line)&&!ocrEditorialNoise(line,subject,profile)); const titleHint=importTitleHint(lines); const rows=[]; const unresolved=[];
  const headingRx=/^(?:camden\s*town\b|unit\s*\d+\b|theme\s*\d+\b|part\s*[a-z0-9]+\s*$|word\s*bank\b|wordbank\b|vocabulary\b|vokabeln\b)/i;
  for(const line of lines){
    if(line.length<2 || /^\d{1,3}$/.test(line) || headingRx.test(line))continue;
    const parts=splitImportColumns(line);
    if(parts.length>=2){
      let left=parts[0],right=parts[1];
      if(germanScore(left)>germanScore(right)+1 && foreignScore(right,subject)>=foreignScore(left,subject)){[left,right]=[right,left];}
      let extra='',example='';
      for(const tail of parts.slice(2)){
        if(!example && looksLikeExample(tail,left,subject))example=tail;
        else if(!extra)extra=tail;
        else example=[example,tail].filter(Boolean).join(' · ');
      }
      rows.push(makeImportRow(left,right,extra,example,'good'));
    }else unresolved.push(line);
  }
  for(let i=0;i<unresolved.length-1;){
    let a=unresolved[i],b=unresolved[i+1];
    const ga=germanScore(a),gb=germanScore(b),fa=foreignScore(a,subject),fb=foreignScore(b,subject);
    if(ga>gb+1 || fb>fa+1){[a,b]=[b,a];}
    rows.push(makeImportRow(a,b,'','','check')); i+=2;
  }
  return {titleHint,rows};
}
function scanStatus(text,type='subtle'){
  const el=$('#scanStatus'); if(!el)return; el.className=`notice ${type}`; el.textContent=text;
}
function scanLibraryContext(sectionHint=''){
  const selected=$('#scanSetSelect')?.value||'',existing=selected&&selected!=='__new__'?(state.sets||[]).find(s=>s.id===selected):null;
  if(existing){const book=existing.bookId?bookById(existing.bookId):null;return {bookId:existing.bookId||'',bookTitle:book?.title||'',isbn13:book?.isbn13||'',section:existing.bookSection||existing.title||''};}
  const book=currentBook(learner()?.id,state.activeSubject),section=String(sectionHint||$('#scanNewTitle')?.value||scanImportState.titleHint||'').trim();
  return {bookId:book?.id||'',bookTitle:book?.title||'',isbn13:book?.isbn13||'',section};
}
function ocrBookProfile(context={},plainText=''){
  if(state.activeSubject!=='english')return '';
  const title=normalize(String(context?.bookTitle||'')),text=normalize(String(plainText||''));
  if(title.includes('camden town'))return 'camden-town';
  if(text.includes('word lists')&&text.includes('camden'))return 'camden-town';
  return '';
}
function scanOcrProgress(progress=0,label=''){
  const wrap=$('#scanOcrWrap'),bar=$('#scanOcrProgress'),txt=$('#scanOcrLabel');
  if(!wrap||!bar||!txt)return;
  wrap.classList.remove('hidden');
  bar.value=clamp(Number(progress)||0,0,1); txt.textContent=label||'OCR wird vorbereitet …';
}
function scanReviewHtml(){
  if(!scanImportState.rows.length)return '<p class="notice subtle">Noch keine Vokabelpaare erkannt. Foto aufnehmen oder Text einfügen und analysieren.</p>';
  const autoCount=scanImportState.rows.filter(r=>r.confidence==='auto').length;
  const safety=autoCount?`<div class="notice warn"><strong>${autoCount} automatisch ergänzte Zeile${autoCount===1?'':'n'}.</strong><br>Diese Zeilen sind aus Sicherheitsgründen nicht vorausgewählt. Bitte Wort und Bedeutung prüfen und erst dann „übernehmen“ aktivieren.</div>`:'';
  const badge=r=>{
    if(r.libraryMatchStatus==='existing')return '<span class="pill scan-existing">bereits vorhanden</span>';
    if(r.libraryMatchStatus==='sense-choice')return '<span class="pill scan-check">Bedeutung prüfen</span>';
    if(r.confidence==='good')return '<span class="pill scan-good">erkannt</span>';
    if(r.confidence==='auto'){
      const source={memory:'aus globaler Bibliothek',school:'automatisch ergänzt',wikidict:'Wörterbuch',repair:'OCR korrigiert'}[r.origin]||'automatisch ergänzt';
      return `<span class="pill scan-auto" title="${esc(source)}">ergänzt · prüfen</span>`;
    }
    return '<span class="pill scan-check">prüfen</span>';
  };
  return safety+scanImportState.rows.map((r,i)=>{const choice=r.libraryMatchStatus==='sense-choice'?`<div class="notice subtle scan-source"><strong>Ist das eine neue Bedeutung oder nur eine andere Formulierung?</strong><label>Zuordnung<select id="scanSense_${i}"><option value="">Bitte wählen</option>${(r.librarySenseOptions||[]).map(s=>`<option value="${esc(s.id)}" ${r.selectedSenseId===s.id?'selected':''}>Gleiche Bedeutung wie „${esc(s.translation)}“${s.partOfSpeech?` · ${esc(s.partOfSpeech)}`:''}</option>`).join('')}<option value="__new__" ${r.selectedSenseId==='__new__'?'selected':''}>Neue Bedeutung · eigener Lernstand</option></select></label></div>`:'';return `<article class="scan-row ${r.confidence==='auto'?'scan-row-auto':''}"><div class="row spread align-center"><label class="scan-include"><input type="checkbox" id="scanUse_${i}" ${r.include?'checked':''}> übernehmen</label>${badge(r)}<button type="button" class="ghost" data-scan-remove="${i}">×</button></div><div class="scan-grid"><label>${esc(subjectLabel(state.activeSubject))}<input id="scanTerm_${i}" value="${esc(r.term)}"></label><label>Deutsch<input id="scanTrans_${i}" value="${esc(r.translation)}"></label><label>Zusatzform<input id="scanExtra_${i}" value="${esc(r.extra)}"></label><label>Beispielsatz / Phrase<input id="scanExample_${i}" value="${esc(r.example)}"></label></div>${choice}${r.libraryMatchStatus==='existing'?'<div class="microcopy scan-source">Globale Bibliothek: Bedeutung bereits vorhanden. Beim Import wird nur die Zuordnung zum Lernset angelegt.</div>':r.confidence==='auto'?`<div class="microcopy scan-source">${r.origin==='repair'?'OCR-Erkennung anhand der deutschen Bedeutung korrigiert':'Automatisch ergänzt'+(r.origin==='memory'?' aus der globalen Bibliothek':r.origin==='wikidict'?' aus lokalem Wörterbuch':'')}. Bitte kurz prüfen.</div>`:''}</article>`}).join('');
}
function renderScanReview(){
  const el=$('#scanReview'); if(!el)return; el.innerHTML=scanReviewHtml();
  const updateImportCount=()=>{const btn=$('#scanImportSave');if(!btn)return;const count=scanImportState.rows.filter((r,i)=>$(`#scanUse_${i}`)?.checked!==false).length;btn.textContent=`Importieren (${count})`};
  document.querySelectorAll('[data-scan-remove]').forEach(b=>b.onclick=()=>{scanImportState.rows.splice(Number(b.dataset.scanRemove),1);renderScanReview();scanStatus(`${scanImportState.rows.length} Zeilen zur Kontrolle.`)});
  scanImportState.rows.forEach((r,i)=>{
    $(`#scanSense_${i}`)?.addEventListener('change',e=>{r.selectedSenseId=e.target.value;renderScanReview()});
    $(`#scanUse_${i}`)?.addEventListener('change',e=>{r.include=e.target.checked;updateImportCount()});
  });
  updateImportCount();
}
async function analyzeScanText(text,source='Text'){
  const raw=String(text||'').trim();
  if(!raw){
    scanImportState.rows=[];renderScanReview();
    if(scanImportState.ocrBusy) scanStatus('OCR läuft noch. Bitte kurz warten, bis die Erkennung abgeschlossen ist.','subtle');
    else scanStatus('Kein Text erkannt. Foto möglichst gerade, nah und gut beleuchtet aufnehmen.','warn');
    return;
  }
  const profile=ocrBookProfile(scanLibraryContext(),raw);const parsed=parseVocabularyText(raw,state.activeSubject,{profile});
  scanImportState.rows=parsed.rows; scanImportState.titleHint=parsed.titleHint;
  await enrichHybridRows(scanImportState.rows,scanLibraryContext(parsed.titleHint));
  if(parsed.titleHint && ($('#scanNewTitle')?.value==='Foto-Import'||!$('#scanNewTitle')?.value.trim()))$('#scanNewTitle').value=parsed.titleHint;
  renderScanReview();
  const auto=scanImportState.rows.filter(r=>r.confidence==='auto').length;
  const open=scanImportState.rows.filter(r=>!(r.term&&r.translation)).length;
  const message=parsed.rows.length?`${source}: ${parsed.rows.length} Zeilen erkannt${auto?` · ${auto} automatisch ergänzt`:''}${open?` · ${open} noch offen`:''}. Bitte kurz prüfen.`:`${source}: Text erkannt, aber noch keine sicheren Vokabelpaare. Text unten prüfen oder Zeilen manuell ergänzen.`;
  scanStatus(message,parsed.rows.length?'good':'warn');
}
function medianNumber(values){
  const a=values.filter(Number.isFinite).sort((x,y)=>x-y); if(!a.length)return 0;
  const m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2;
}
function cleanOcrCell(text){
  return String(text||'')
    .replace(/[|¦]+/g,' ')
    .replace(/\s+/g,' ')
    .replace(/^[-–—_=;:,\s]+|[-–—_=;:,\s]+$/g,'')
    .trim();
}
function parseTesseractWords(tsv){
  const raw=String(tsv||'').trim(); if(!raw)return [];
  const rows=raw.split(/\r?\n/); if(rows.length<2)return [];
  const out=[];
  for(const row of rows.slice(1)){
    const c=row.split('\t'); if(c.length<12||Number(c[0])!==5)continue;
    const text=c.slice(11).join('\t').trim(); if(!text)continue;
    const conf=Number(c[10]); if(Number.isFinite(conf)&&conf<18)continue;
    out.push({
      text,
      page:Number(c[1])||0,block:Number(c[2])||0,paragraph:Number(c[3])||0,line:Number(c[4])||0,wordNum:Number(c[5])||0,
      left:Number(c[6])||0,top:Number(c[7])||0,width:Number(c[8])||0,height:Number(c[9])||0,
      conf:Number.isFinite(conf)?conf:0
    });
  }
  return out;
}
function groupOcrColumnLines(words,tolerance){
  const groups=[];
  for(const word of [...words].sort((a,b)=>(a.top+a.height/2)-(b.top+b.height/2)||a.left-b.left)){
    const yc=word.top+word.height/2;
    const g=groups.at(-1);
    if(g&&Math.abs(yc-g.yc)<=tolerance){
      g.words.push(word); g.yc=g.words.reduce((sum,w)=>sum+w.top+w.height/2,0)/g.words.length;
    }else groups.push({yc,words:[word]});
  }
  return groups.map(g=>{
    g.words.sort((a,b)=>a.left-b.left);
    const avgConf=g.words.reduce((sum,w)=>sum+(Number(w.conf)||0),0)/Math.max(1,g.words.length);
    return {...g,text:cleanOcrCell(g.words.map(w=>w.text).join(' ')),minX:Math.min(...g.words.map(w=>w.left)),maxX:Math.max(...g.words.map(w=>w.left+w.width)),avgConf};
  }).filter(g=>g.text);
}
function ocrUiNoise(text,profile=''){
  const t=cleanOcrCell(text);
  if(profile==='camden-town'&&/^finden$/i.test(t))return false;
  return /^(?:übersicht|finden|verwandte(?:s)?|herunterladen|download|suche|search|menü|menu|teilen|share|zurück|weiter|start|home|bookmark|lesezeichen)$/i.test(t);
}
function stripOcrPronunciation(text){
  return cleanOcrCell(text)
    .replace(/\/[^/\n]{1,180}\//g,' ')
    .replace(/\s+\/[\sˈˌA-Za-zəɐɑɒɔæɛɜɞɪʊʌŋθðʃʒçʔː,.'’-]{2,}$/g,' ')
    .replace(/^[°º•·*]+\s*/,'')
    .replace(/\bto\*/gi,'to')
    .replace(/\*+/g,'')
    .replace(/\s+/g,' ')
    .trim();
}
function ocrPronunciationOnly(text){
  const t=cleanOcrCell(text);if(!t)return true;
  const without=t.replace(/\/[^/\n]{1,140}\//g,' ').trim();
  if(without&&/[A-Za-zÀ-ÿ]/.test(without))return false;
  if(/^\/.*\/$/.test(t))return true;
  const ipa=(t.match(/[əɐɑɒɔæɛɜɞɪʊʌŋθðʃʒçʔˈˌː]/g)||[]).length;
  return (t.startsWith('/')||t.endsWith('/'))&&ipa>0;
}
function ocrEditorialNoise(text,subject,profile=''){
  const t=stripOcrPronunciation(text);if(!t||ocrUiNoise(t,profile))return true;
  if(/^(?:word\s*lists?|wordlist|vocabulary|vokabeln|(?:unit|test|theme|part)\s*(?:\d+|[a-z])?|arbeitsanweisungen\b|an\s+dem\s+wort\b|in\s+den\s+.+boxen\b|pick[- ]?up\s*:|hinweis\b|merke\b)$/i.test(t))return true;
  if(/^(?:arbeitsanweisungen\b|an\s+dem\s+wort\b|in\s+den\s+.+boxen\b|pick[- ]?up\s*:)/i.test(t))return true;
  if(profile==='camden-town'){
    if(/^\d{1,2}$/.test(t)||/^p\.?\s*\d+$/i.test(t)||/^theme\s*\d+\s*:/i.test(t))return true;
    if(/^(?:tipps?\s+zum\s+w[oö]rterlernen|weitere\s+listen\s+zum\s+nachschlagen|names\s*\(|numbers\s*\(|w[oö]rter,\s*die\s+im\s+deutschen|irregular\s+verbs\s*\()/i.test(t))return true;
    if(/^\/?.*(?:klingt\s+ungef[aä]hr|wird\s+immer\s+gro[sß]geschrieben|wird\s+nicht\s+ausgesprochen|steht\s+am\s+satzende)\.?$/i.test(t))return true;
  }
  const count=t.split(/\s+/).filter(Boolean).length;
  if(count>=7&&germanScore(t)>=2&&foreignScore(t,subject)<=1)return true;
  return false;
}
function clusterOcrLineStarts(words,medianH){
  const tolerance=Math.max(24,medianH*1.5);
  const starts=words
    .filter(w=>w.wordNum===1&&w.height>=Math.max(7,medianH*.42)&&!/^[|¦—–_\-]+$/.test(w.text))
    .map(w=>w.left)
    .filter(Number.isFinite)
    .sort((a,b)=>a-b);
  const clusters=[];
  for(const x of starts){
    const last=clusters.at(-1);
    if(last&&Math.abs(x-last.x)<=tolerance){
      last.values.push(x);last.count++;last.x=last.values.reduce((sum,v)=>sum+v,0)/last.values.length;
    }else clusters.push({x,count:1,values:[x]});
  }
  return clusters;
}
function detectOcrColumnLayout(words,medianH,deutsch,profile=''){
  const pageWidth=Math.max(...words.map(w=>w.left+w.width),1);
  const clusters=clusterOcrLineStarts(words,medianH);
  const minCount=profile==='camden-town'?2:(clusters.reduce((sum,c)=>sum+c.count,0)>=18?3:2);
  const strong=clusters.filter(c=>c.count>=minCount).sort((a,b)=>a.x-b.x);
  const minGap=Math.max(pageWidth*.16,medianH*5);
  let source=strong.find(c=>c.x<pageWidth*.48)||strong[0]||null;
  let translation=null;
  if(deutsch)translation={x:deutsch.left,count:999,values:[deutsch.left]};
  else if(source)translation=strong.find(c=>c.x>source.x+minGap)||null;
  if(!translation&&strong.length>=2){source=strong[0];translation=strong[1];}
  let divider=deutsch?Math.max(pageWidth*.32,deutsch.left-Math.max(28,medianH*1.45)):pageWidth*.5;
  let rightEnd=pageWidth+1;
  if(translation){
    divider=Math.max(pageWidth*.20,translation.x-Math.max(28,medianH*1.45));
    const third=strong.find(c=>c.x>translation.x+Math.max(pageWidth*.12,medianH*4));
    if(third)rightEnd=Math.max(divider+80,third.x-Math.max(18,medianH*.8));
  }
  return {pageWidth,divider,rightEnd,sourceX:source?.x??0,translationX:translation?.x??0,clusters:strong};
}
function cleanOcrTerm(text){
  return stripOcrPronunciation(text)
    .replace(/^[°º•·]+\s*/,'')
    .replace(/\s+([,;!?])/g,'$1')
    .replace(/\s+/g,' ')
    .trim();
}
function safeOcrPair(term,translation,subject,confidence='good',profile=''){
  let a=cleanOcrTerm(term),b=cleanOcrCell(translation);
  if(subjectMeta(subject)?.ocrRepairProfile==='english'){
    a=a.replace(/^l[’']m\b/i,"I'm").replace(/^I['’]m\s*\(=\s*am\)$/i,"I'm (= I am)");
    if(/^like$/i.test(a)&&/^ich mag[.!]?$/i.test(b))a='I like';
    b=b.replace(/\(beij\/in\)/i,'(bei/in)').replace(/\bPI\./g,'Pl.');
  }
  const row=makeImportRow(a,b,'','',confidence);
  if(profile==='camden-town'){
    const m=a.match(/^(.+\s)\(([^)]+)\)$/);
    if(m&&!/^(?:=|informal\b|formal\b|pl\.?\b|sing\.?\b|ugs\.?\b)/i.test(m[2].trim())){row.term=a;row.extra='';}
    if(/[A-Za-z]\([A-Za-z]+\)$/.test(a)){row.term=a;row.extra='';}
  }
  return row;
}

function camdenVerifiedBookRows(){
  const book=(state?.books||[]).find(b=>b.id==='book_builtin_camden_town_1'||b.builtinSource==='verified-book-photos'&&normalize(b.title).includes('camden town'));
  if(!book)return [];
  return (state?.bookVocabulary||[]).filter(r=>r.bookId===book.id&&r.verifiedAt&&!r.verificationBlocked).map(r=>{
    const v=(state?.vocabulary||[]).find(x=>x.id===r.vocabId),sense=v?(senseById(v,r.senseId)||primarySense(v)):null;
    const term=String(r.termOverride||v?.term||'').trim(),translation=String(r.translationOverride||sense?.translation||'').trim();
    return {
      row:r,page:Number(r.sourcePage)||0,section:r.section||'',position:Number(r.position)||0,
      term,translation,
      terms:[term,...(r.acceptedTermOverrides||[]),v?.term,...(v?.termVariants||[])].filter(Boolean),
      translations:[translation,...(r.acceptedTranslationOverrides||[]),sense?.translation,...(sense?.translations||[])].filter(Boolean)
    };
  }).filter(x=>x.term&&x.translation&&x.page>=170&&x.page<=177);
}
function ocrFuzzyKey(value){
  return normalize(stripOcrPronunciation(value)).replace(/…/g,' ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
}
function ocrPhraseSimilarity(needle,haystack){
  const n=ocrFuzzyKey(needle),h=ocrFuzzyKey(haystack);if(!n||!h)return 0;
  if(n===h||(' '+h+' ').includes(' '+n+' '))return 1;
  const nt=n.split(' '),ht=h.split(' ');let best=0;
  const minSize=Math.max(1,nt.length-1),maxSize=Math.min(ht.length,nt.length+1);
  for(let size=minSize;size<=maxSize;size++){
    for(let i=0;i+size<=ht.length;i++){
      const chunk=ht.slice(i,i+size).join(' '),d=levenshtein(n,chunk),score=1-d/Math.max(n.length,chunk.length,1);
      if(score>best)best=score;
    }
  }
  return clamp(best,0,1);
}
function camdenObservedWindows(words,medianH){
  const lines=groupOcrColumnLines(words,Math.max(13,medianH*.72)).sort((a,b)=>a.yc-b.yc);
  const windows=[];
  for(let i=0;i<lines.length;i++){
    const one=stripOcrPronunciation(lines[i].text);if(one)windows.push({index:i,text:one,y:lines[i].yc});
    if(i+1<lines.length&&lines[i+1].yc-lines[i].yc<=medianH*2.8){
      const two=stripOcrPronunciation(lines[i].text+' '+lines[i+1].text);if(two)windows.push({index:i,text:two,y:lines[i].yc});
    }
    if(i+2<lines.length&&lines[i+2].yc-lines[i].yc<=medianH*4.2){
      const three=stripOcrPronunciation(lines[i].text+' '+lines[i+1].text+' '+lines[i+2].text);if(three)windows.push({index:i,text:three,y:lines[i].yc});
    }
  }
  return windows;
}
function camdenEvidence(entry,windows){
  let best=null;
  for(const w of windows){
    const termScore=Math.max(0,...entry.terms.map(x=>ocrPhraseSimilarity(x,w.text)));
    const translationScore=Math.max(0,...entry.translations.map(x=>ocrPhraseSimilarity(x,w.text)));
    const score=termScore*.56+translationScore*.44;
    const strong=(termScore>=.78&&translationScore>=.72&&score>=.78)||
      (termScore>=.91&&translationScore>=.58&&ocrFuzzyKey(entry.term).length>=12)||
      (translationScore>=.91&&termScore>=.62&&ocrFuzzyKey(entry.translation).length>=12);
    if(strong&&(!best||score>best.score))best={entry,window:w,termScore,translationScore,score};
  }
  return best;
}
function camdenVerifiedImportRow(entry){
  const out=safeOcrPair(entry.term,entry.translation,'english','good','camden-town');
  out.origin='verified-book';out.sourcePage=entry.page;out.sourceSection=entry.section;out.include=true;
  return out;
}
function reconcileCamdenWithVerifiedBook(words,rows,medianH){
  const known=camdenVerifiedBookRows();if(!known.length)return {rows,bookGuided:false,bookGuidedCount:0,bookPage:0};
  const pageNumbers=[...new Set(words.map(w=>String(w.text||'').trim()).filter(x=>/^(?:17[0-7])$/.test(x)).map(Number))];
  const windows=camdenObservedWindows(words,medianH),hits=known.map(entry=>camdenEvidence(entry,windows)).filter(Boolean);
  const byPage=new Map();
  for(const hit of hits){const a=byPage.get(hit.entry.page)||[];a.push(hit);byPage.set(hit.entry.page,a);}
  let page=pageNumbers.find(p=>known.some(x=>x.page===p))||0;
  if(!page&&byPage.size){
    page=[...byPage.entries()].sort((a,b)=>b[1].length-a[1].length||b[1].reduce((s,x)=>s+x.score,0)-a[1].reduce((s,x)=>s+x.score,0))[0][0];
  }
  const pageHits=page?(byPage.get(page)||[]):[];
  const distinctive=pageHits.some(h=>ocrFuzzyKey(h.entry.term).length>=12&&h.score>=.82);
  const numbered=pageNumbers.includes(page);
  const confident=!!page&&((numbered&&pageHits.length>=1)||pageHits.length>=2||distinctive);
  if(!confident)return {rows,bookGuided:false,bookGuidedCount:0,bookPage:0};

  let selected;
  if(pageNumbers.includes(page)){
    selected=known.filter(x=>x.page===page).sort((a,b)=>a.position-b.position);
  }else{
    const seen=new Set();
    selected=pageHits.sort((a,b)=>a.window.y-b.window.y||a.entry.position-b.entry.position).map(h=>h.entry).filter(x=>{
      const key=x.row.id||x.term+'\u0000'+x.translation;if(seen.has(key))return false;seen.add(key);return true;
    });
  }
  const guided=selected.map(camdenVerifiedImportRow);
  return {rows:guided,bookGuided:true,bookGuidedCount:guided.length,bookPage:page};
}

function tesseractTsvToVocabulary(tsv,subject=state.activeSubject,opts={}){
  const words=parseTesseractWords(tsv); if(!words.length)return {rows:[],text:''};
  const profile=opts?.profile||'';
  const heights=words.map(w=>w.height).filter(h=>h>2); const medianH=Math.max(12,medianNumber(heights)||20);
  const tolerance=Math.max(13,medianH*.72),allLines=groupOcrColumnLines(words,tolerance);
  const wordListsHeading=profile==='camden-town'?allLines.find(g=>/\bword\s*lists?\b/i.test(cleanOcrCell(g.text))):null;
  const minTop=Math.min(...words.map(w=>w.top));
  const profileStart=wordListsHeading?wordListsHeading.yc+Math.max(8,medianH*.35):minTop-medianH*.25;
  const canon=x=>normalize(x).replace(/[^a-zäöüß]/g,'');
  const deutsch=words.filter(w=>w.top>=profileStart&&canon(w.text)==='deutsch').sort((a,b)=>a.top-b.top)[0];
  const layoutWords=words.filter(w=>w.top>=profileStart);
  const layout=detectOcrColumnLayout(layoutWords.length?layoutWords:words,medianH,deutsch,profile);
  const dataStart=deutsch?Math.max(profileStart,deutsch.top+deutsch.height+Math.max(16,medianH*.55)):Math.max(0,profileStart);
  const noiseToken=w=>(w.height<Math.max(5,medianH*.22)&&!/^\.{2,}$/.test(w.text))||/^[|¦Il1—–_\-]+$/.test(w.text)||(profile==='camden-town'&&/^\d{1,2}$/.test(w.text.trim())&&w.width<=medianH*2.2);
  const data=words.filter(w=>w.top>=dataStart&&!noiseToken(w));
  let left=groupOcrColumnLines(data.filter(w=>w.left<layout.divider),tolerance)
    .map(g=>({...g,text:cleanOcrTerm(g.text)}))
    .filter(g=>g.text&&!ocrPronunciationOnly(g.text)&&!ocrEditorialNoise(g.text,subject,profile));
  let right=groupOcrColumnLines(data.filter(w=>w.left>=layout.divider&&w.left<layout.rightEnd),tolerance)
    .filter(g=>g.text&&!ocrPronunciationOnly(g.text)&&!ocrUiNoise(g.text,profile));

  const records=[]; const usedRight=new Set(); let consecutiveMissing=0;
  const firstY=left[0]?.yc??0;
  let parsedLastY=firstY;

  for(let i=0;i<left.length;i++){
    const l=left[i]; if(!l.text)continue;
    const prev=i?(left[i-1].yc+l.yc)/2:l.yc-medianH*1.25;
    const next=i+1<left.length?(l.yc+left[i+1].yc)/2:l.yc+medianH*1.35;
    const matches=right.map((r,idx)=>({r,idx}))
      .filter(x=>!usedRight.has(x.idx)&&x.r.yc>=prev&&x.r.yc<next&&!ocrUiNoise(x.r.text,profile));
    if(!matches.length){
      parsedLastY=l.yc;
      consecutiveMissing++;
      if(l.text.length<=120)records.push({y:l.yc,row:makeImportRow(l.text,'','','','check','ocr')});
      if(consecutiveMissing>=5&&i>14)break;
      continue;
    }
    consecutiveMissing=0;
    parsedLastY=l.yc;
    matches.forEach(x=>usedRight.add(x.idx));
    const translation=cleanOcrCell(matches.map(x=>x.r.text).join(' '));
    const term=cleanOcrTerm(l.text);
    if(!term||!translation||ocrEditorialNoise(term,subject,profile)||ocrUiNoise(translation,profile))continue;
    if(subjectMeta(subject)?.ocrRepairProfile==='english'&&germanScore(term)>2&&foreignScore(term,subject)===0&&records.length>3)continue;
    const pairConfidence=Math.min(l.avgConf||100,...matches.map(x=>x.r.avgConf||100))>=55?'good':'check';
    records.push({y:l.yc,row:safeOcrPair(term,translation,subject,pairConfidence,profile)});
    if(records.length>=250)break;
  }

  right.forEach((r,idx)=>{
    if(usedRight.has(idx)||r.yc<firstY-medianH||r.yc>parsedLastY+medianH*1.25||ocrUiNoise(r.text,profile))return;
    const translation=cleanOcrCell(r.text); if(!translation||translation.length>100||translation.split(/\s+/).length>10)return;
    const nearLeft=left.some(l=>Math.abs(l.yc-r.yc)<=tolerance*.65);
    if(!nearLeft)records.push({y:r.yc,row:makeImportRow('',translation,'','','check','ocr')});
  });

  records.sort((a,b)=>a.y-b.y);
  let rows=records.map(x=>x.row).filter(r=>r.term||r.translation).slice(0,250);
  let guided={rows,bookGuided:false,bookGuidedCount:0,bookPage:0};
  if(profile==='camden-town')guided=reconcileCamdenWithVerifiedBook(words,rows,medianH);
  rows=guided.rows;
  const text=rows.map(r=>String(r.term||'')+'\t'+String(r.translation||'')).join('\n');
  return {rows,text,bookGuided:guided.bookGuided,bookGuidedCount:guided.bookGuidedCount,bookPage:guided.bookPage};
}
function tesseractTsvToText(tsv,opts={}){
  const parsed=tesseractTsvToVocabulary(tsv,state.activeSubject,opts);
  if(parsed.text)return parsed.text;
  const words=parseTesseractWords(tsv); if(!words.length)return '';
  const tolerance=Math.max(13,(medianNumber(words.map(w=>w.height).filter(h=>h>2))||20)*.72);
  return groupOcrColumnLines(words,tolerance).map(g=>g.text).join('\n');
}
async function prepareOcrImage(file){
  if(!('createImageBitmap' in window))return file;
  try{
    const bitmap=await createImageBitmap(file); const longest=Math.max(bitmap.width,bitmap.height); const scale=longest>2800?2800/longest:Math.min(1.8,2600/longest);
    const width=Math.max(1,Math.round(bitmap.width*scale)),height=Math.max(1,Math.round(bitmap.height*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(bitmap,0,0,width,height);bitmap.close?.();
    const img=ctx.getImageData(0,0,width,height),d=img.data;
    for(let i=0;i<d.length;i+=4){const lum=.299*d[i]+.587*d[i+1]+.114*d[i+2];const v=clamp((lum-128)*1.28+128,0,255);d[i]=d[i+1]=d[i+2]=v;}
    ctx.putImageData(img,0,0);
    return await new Promise(resolve=>canvas.toBlob(blob=>resolve(blob||file),'image/jpeg',.92));
  }catch(e){console.warn('OCR preprocessing',e);return file;}
}
let tesseractLoadPromise=null;
function loadTesseract(){
  if(window.Tesseract?.createWorker)return Promise.resolve(window.Tesseract);
  if(tesseractLoadPromise)return tesseractLoadPromise;
  tesseractLoadPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='ocr/tesseract/tesseract.min.js';
    script.async=true; script.crossOrigin='anonymous';
    script.onload=()=>window.Tesseract?.createWorker?resolve(window.Tesseract):reject(new Error('OCR-Bibliothek konnte nicht initialisiert werden.'));
    script.onerror=()=>reject(new Error('OCR-Bibliothek konnte nicht geladen werden. Internetverbindung prüfen.'));
    document.head.appendChild(script);
  });
  return tesseractLoadPromise;
}
function humanOcrStatus(m){
  const p=Number(m?.progress)||0,status=String(m?.status||'');
  const labels={
    'loading tesseract core':'OCR-Engine wird geladen …','initializing tesseract':'OCR wird gestartet …','loading language traineddata':'Sprachmodell wird geladen …',
    'initializing api':'Sprachmodell wird vorbereitet …','recognizing text':'Text wird erkannt …'
  };
  return {progress:p,label:labels[status]||'OCR arbeitet …'};
}
async function runTesseractOcr(file){
  if(scanImportState.ocrBusy||!file)return;
  scanImportState.ocrBusy=true;
  const retry=$('#scanOcrRetry'),analyze=$('#scanAnalyzeBtn');
  if(retry)retry.disabled=true; if(analyze)analyze.disabled=true;
  let watchdog=null;
  try{
    scanStatus('OCR wird auf diesem iPhone gestartet …');scanOcrProgress(.02,'OCR wird vorbereitet …');
    const T=await loadTesseract();
    const prepared=await prepareOcrImage(file);
    const ocrBase=new URL('ocr/',window.location.href);
    const foreignLang=subjectOcrLang(state.activeSubject);if(!foreignLang)throw new Error(`Für ${subjectLabel(state.activeSubject)} ist kein OCR-Sprachmodell konfiguriert.`);const langs=[foreignLang,'deu'];
    const createPromise=T.createWorker(langs,T.OEM?.LSTM_ONLY??1,{
      workerPath:new URL('tesseract/worker.min.js',ocrBase).href,
      corePath:new URL('core/tesseract-core-lstm.wasm.js',ocrBase).href,
      langPath:new URL('lang',ocrBase).href.replace(/\/$/,''),
      workerBlobURL:false,
      gzip:false,
      logger:m=>{const x=humanOcrStatus(m);scanOcrProgress(x.progress,x.label)},
      errorHandler:e=>console.warn('OCR worker',e)
    });
    const timeoutPromise=new Promise((_,reject)=>{watchdog=setTimeout(()=>reject(new Error('OCR-Start-Timeout')),45000)});
    const worker=await Promise.race([createPromise,timeoutPromise]);
    if(watchdog){clearTimeout(watchdog);watchdog=null;}
    try{
      await worker.setParameters({preserve_interword_spaces:'1',user_defined_dpi:'300',tessedit_pageseg_mode:String(T.PSM?.AUTO??3)});
      scanOcrProgress(.18,'Text wird erkannt …');
      const result=await worker.recognize(prepared,{rotateAuto:true},{text:true,tsv:true});
      const plainText=String(result?.data?.text||'').trim(),scanContext=scanLibraryContext(),profile=ocrBookProfile(scanContext,plainText);
      const table=tesseractTsvToVocabulary(result?.data?.tsv,state.activeSubject,{profile});
      const text=(table.text||tesseractTsvToText(result?.data?.tsv,{profile})||plainText).trim();
      if(!text)throw new Error('OCR lieferte keinen Text');
      $('#scanRawText').value=text; scanImportState.nativeOcr=true; scanOcrProgress(1,'OCR abgeschlossen');
      if(table.rows.length){
        scanImportState.rows=table.rows;
        await enrichHybridRows(scanImportState.rows,scanLibraryContext());
        renderScanReview();
        const good=scanImportState.rows.filter(r=>r.confidence==='good'&&r.term&&r.translation).length;
        const auto=scanImportState.rows.filter(r=>r.confidence==='auto'&&r.term&&r.translation).length;
        const open=scanImportState.rows.filter(r=>!(r.term&&r.translation)).length;
        const bookGuide=table.bookGuided?` · Buchseite ${table.bookPage}: ${table.bookGuidedCount} mit geprüfter Bibliothek abgeglichen`:'';
        scanStatus(`OCR${profile==='camden-town'?' · Camden-Town-Profil':''}: ${good} Originalpaare erkannt${bookGuide}${auto?` · ${auto} automatisch ergänzt`:''}${open?` · ${open} noch offen`:''}.`,'good');
      }else await analyzeScanText(text,'OCR');
    }finally{await worker.terminate().catch(()=>{});}
  }catch(e){
    if(watchdog){clearTimeout(watchdog);watchdog=null;}
    console.warn('Tesseract OCR',e); scanOcrProgress(0,'OCR konnte nicht abgeschlossen werden');
    const timeout=String(e?.message||e).includes('Timeout');
    scanStatus(timeout?'OCR-Engine startet auf diesem iPhone nicht innerhalb von 45 Sekunden. Bitte Seite neu laden und noch einmal versuchen.':'OCR-Fehler: Die Erkennung konnte auf diesem Gerät nicht abgeschlossen werden. Bitte erneut starten.','warn');
  }finally{
    scanImportState.ocrBusy=false;
    if(retry)retry.disabled=false; if(analyze)analyze.disabled=false;
  }
}

function openScanImport(preferredSetId=''){
  scanImportState.rows=[]; scanImportState.titleHint=''; scanImportState.nativeOcr=false;scanImportState.ocrBusy=false;scanImportState.lastFile=null;
  if(scanImportState.imageUrl){URL.revokeObjectURL(scanImportState.imageUrl);scanImportState.imageUrl=null;}
  const sets=mySets();
  modal(`<div class="eyebrow">Fotoimport mit OCR</div><h2>Vokabelseite fotografieren</h2><p>Foto aufnehmen oder auswählen. Erkannte Originalpaare bleiben erhalten; fehlende Wort- oder Bedeutungsseiten ergänzt die App aus bereits bekannten Daten soweit möglich automatisch. Automatische Ergänzungen sind immer als „prüfen“ markiert. Das Foto bleibt auf diesem Gerät.</p><div class="scan-layout"><div><div id="scanImageBox" class="scan-image-box"><span>Noch kein Foto</span></div><button type="button" id="scanPhotoBtn" class="primary top-space">📷 Foto aufnehmen / auswählen</button><p class="microcopy">Tipp: Seite gerade, nah und ohne Schatten fotografieren. Die kostenlose OCR-Engine und Sprachmodelle werden vom Vokabeltrainer selbst geladen und anschließend lokal zwischengespeichert.</p></div><div><label>OCR-Text<textarea id="scanRawText" rows="10" placeholder="Der erkannte Text erscheint hier …"></textarea></label><div id="scanOcrWrap" class="ocr-progress hidden"><progress id="scanOcrProgress" max="1" value="0"></progress><span id="scanOcrLabel">OCR wird vorbereitet …</span></div><div class="row gap wrap"><button type="button" id="scanAnalyzeBtn" class="secondary">Text neu analysieren</button><button type="button" id="scanOcrRetry" class="ghost">OCR erneut starten</button><button type="button" id="scanAddRowBtn" class="ghost">+ leere Zeile</button></div><div id="scanStatus" class="notice subtle">Foto auswählen – OCR startet automatisch.</div></div></div><hr><div class="scan-target"><label>Ziel-Lernset<select id="scanSetSelect">${sets.map(s=>`<option value="${s.id}" ${preferredSetId===s.id?'selected':''}>${esc(s.title)} · ${esc(s.schoolYear)}</option>`).join('')}<option value="__new__" ${(!sets.length||!sets.some(s=>s.id===preferredSetId)&&preferredSetId==='__new__')?'selected':''}>+ Neues Lernset</option></select></label><label id="scanNewTitleWrap" class="${sets.length?'hidden':''}">Titel für neues Lernset<input id="scanNewTitle" value="Foto-Import"></label><label id="scanNewYearWrap" class="${sets.length?'hidden':''}">Schuljahr<input id="scanNewYear" value="${esc(currentSchoolYear())}"></label></div><h3>Kontrolle vor dem Import</h3><div id="scanReview"></div><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="scanImportSave" class="primary">Importieren (0)</button></div>`);
  renderScanReview();
  const toggleNew=()=>{const show=$('#scanSetSelect').value==='__new__';$('#scanNewTitleWrap').classList.toggle('hidden',!show);$('#scanNewYearWrap').classList.toggle('hidden',!show)};
  $('#scanSetSelect').onchange=toggleNew;
  $('#scanPhotoBtn').onclick=()=>$('#photoInput').click();
  $('#scanAnalyzeBtn').onclick=()=>void analyzeScanText($('#scanRawText').value,'Textanalyse');
  $('#scanOcrRetry').onclick=()=>scanImportState.lastFile?runTesseractOcr(scanImportState.lastFile):scanStatus('Bitte zuerst ein Foto auswählen.','warn');
  $('#scanAddRowBtn').onclick=()=>{scanImportState.rows.push(makeImportRow('','','','','check'));renderScanReview()};
  $('#scanImportSave').onclick=importScannedRows;
}
async function handleScanPhoto(file){
  if(!file || !file.type.startsWith('image/'))return;
  if(file.size>MAX_PHOTO_BYTES){scanStatus('Das Foto ist größer als 20 MB. Bitte ein kleineres Bild verwenden.','warn');return;}
  scanImportState.lastFile=file;
  if(scanImportState.imageUrl)URL.revokeObjectURL(scanImportState.imageUrl);
  scanImportState.imageUrl=URL.createObjectURL(file);
  const box=$('#scanImageBox'); if(box)box.innerHTML=`<img src="${scanImportState.imageUrl}" alt="Ausgewählte Vokabelseite">`;
  $('#scanRawText').value=''; scanImportState.rows=[];renderScanReview();
  await runTesseractOcr(file);
}
function importScannedRows(){
  const rows=scanImportState.rows.map((r,i)=>({include:$(`#scanUse_${i}`)?.checked!==false,term:$(`#scanTerm_${i}`)?.value.trim()||'',translation:$(`#scanTrans_${i}`)?.value.trim()||'',extra:$(`#scanExtra_${i}`)?.value.trim()||'',example:$(`#scanExample_${i}`)?.value.trim()||'',confidence:r.confidence||'check',libraryMatchStatus:r.libraryMatchStatus||'',librarySenseId:r.librarySenseId||'',selectedSenseId:$(`#scanSense_${i}`)?.value||r.selectedSenseId||''})).filter(r=>r.include&&r.term&&r.translation);
  if(!rows.length){scanStatus('Es gibt noch keine vollständige Vokabelzeile zum Importieren.','warn');return;}const unresolved=rows.filter(r=>r.libraryMatchStatus==='sense-choice'&&!r.selectedSenseId);if(unresolved.length){scanStatus(`${unresolved.length} Bedeutung${unresolved.length===1?'':'en'} noch nicht zugeordnet. Bitte „gleiche Bedeutung“ oder „neue Bedeutung“ wählen.`,'warn');return;}for(const r of rows){if(r.libraryMatchStatus!=='sense-choice'||r.selectedSenseId==='__new__')continue;const ctx=scanLibraryContext(),match=typeof libraryMatchForContext==='function'?libraryMatchForContext(state.activeSubject,r.term,r.extra||'',r.translation,ctx.bookId,ctx.section):{vocab:vocabularyMatch(state.activeSubject,r.term,r.extra||'')};if(!(match.vocab?.senses||[]).some(s=>s.id===r.selectedSenseId)){scanStatus('Eine Bedeutungszuordnung passt nach der Bearbeitung nicht mehr zum Wort. Bitte Foto/Text erneut analysieren.','warn');return;}}
  let setId=$('#scanSetSelect').value;
  if(setId==='__new__'){const title=$('#scanNewTitle').value.trim()||scanImportState.titleHint||'Foto-Import',schoolYear=$('#scanNewYear').value.trim()||currentSchoolYear(),book=currentBook(learner().id,state.activeSubject);const set={id:uid('set'),learnerId:learner().id,subject:state.activeSubject,title,schoolYear,bookId:book?.id||'',bookSection:book?title:'',testDate:'',testScopeMode:'set',testFrom:1,testTo:0,testFormat:'target',from:'',to:''};state.sets.push(set);setId=set.id;rebuildWordIndexes();}
  let linked=0,alreadyLinked=0,newGlobal=0,fromLibrary=0,newMeanings=0;
  rows.forEach(r=>{const senseId=r.libraryMatchStatus==='sense-choice'?(r.selectedSenseId==='__new__'?'':r.selectedSenseId):(r.librarySenseId||'');const result=attachVocabularyToSet(setId,{term:r.term,translation:r.translation,senseId,extra:r.extra,example:r.example,chunks:autoChunks(r.term),source:'photo-text-import',verified:false});if(result.alreadyLinked){alreadyLinked++;return}linked++;if(result.newVocabulary)newGlobal++;else fromLibrary++;if(result.newSense)newMeanings++;});
  const targetSet=state.sets.find(x=>x.id===setId);if(targetSet){targetSet.pairReviewRequired=true;targetSet.pairVerifiedAt='';}
  closeModal();if(scanImportState.imageUrl){URL.revokeObjectURL(scanImportState.imageUrl);scanImportState.imageUrl=null;}save();
  toast(`${linked} Zuordnung${linked===1?'':'en'} gespeichert. Vor dem Lernen bitte die Wort↔Bedeutung-Paare bestätigen.`,'good');
  setTimeout(()=>openSetPairAudit?.(setId),120);
}

function extractIsbnFromText(text){
  const src=String(text||'').toUpperCase();
  const candidates=[];
  for(const m of src.matchAll(/(?:ISBN(?:-1[03])?\s*:?)?\s*((?:97[89][\s-]*)?[0-9X][0-9X\s-]{8,20}[0-9X])/g)){const raw=m[1]||m[0],isbn=normalizeIsbn(raw);if(isbn&&!candidates.includes(isbn))candidates.push(isbn)}
  if(!candidates.length){const digits=src.replace(/[^0-9X]/g,'');for(let i=0;i<=digits.length-13;i++){const isbn=normalizeIsbn(digits.slice(i,i+13));if(isbn&&!candidates.includes(isbn))candidates.push(isbn)}}
  return candidates[0]||'';
}
function isbnStatus(text,type='subtle'){const el=$('#isbnScanStatus');if(!el)return;el.className=`notice ${type}`;el.textContent=text}
async function handleIsbnPhoto(file){
  if(!file||!file.type.startsWith('image/'))return;if(file.size>MAX_PHOTO_BYTES){isbnStatus('Foto ist zu groß. Bitte ein kleineres Bild verwenden.','warn');return}
  isbnStatus('ISBN wird aus dem Foto gelesen …');
  try{
    if('BarcodeDetector' in window&&'createImageBitmap' in window){
      try{const formats=await BarcodeDetector.getSupportedFormats?.()||[];if(formats.includes('ean_13')){const bitmap=await createImageBitmap(file),detector=new BarcodeDetector({formats:['ean_13']}),codes=await detector.detect(bitmap);bitmap.close?.();for(const code of codes){const isbn=normalizeIsbn(code.rawValue);if(isbn){const input=$('#bookIsbn');if(input){input.value=isbn;input.dispatchEvent(new Event('input',{bubbles:true}))}isbnStatus(`ISBN erkannt: ${formatIsbn(isbn)}`,'good');return}}}}catch(e){console.warn('Barcode ISBN',e)}
    }
    const T=await loadTesseract(),prepared=await prepareOcrImage(file),ocrBase=new URL('ocr/',window.location.href);
    const worker=await T.createWorker('eng',T.OEM?.LSTM_ONLY??1,{workerPath:new URL('tesseract/worker.min.js',ocrBase).href,corePath:new URL('core/tesseract-core-lstm.wasm.js',ocrBase).href,langPath:new URL('lang',ocrBase).href.replace(/\/$/,''),workerBlobURL:false,gzip:false});
    try{await worker.setParameters({user_defined_dpi:'300',tessedit_pageseg_mode:String(T.PSM?.AUTO??3),tessedit_char_whitelist:'ISBNisbn-0123456789Xx '});const result=await worker.recognize(prepared,{rotateAuto:true},{text:true});const isbn=extractIsbnFromText(result?.data?.text||'');if(!isbn){isbnStatus('Keine gültige ISBN erkannt. Bitte näher auf ISBN/Barcode fotografieren oder Nummer eingeben.','warn');return}const input=$('#bookIsbn');if(input){input.value=isbn;input.dispatchEvent(new Event('input',{bubbles:true}))}isbnStatus(`ISBN erkannt: ${formatIsbn(isbn)}`,'good')}finally{await worker.terminate().catch(()=>{})}
  }catch(e){console.warn('ISBN OCR',e);isbnStatus('ISBN konnte aus dem Foto nicht gelesen werden. Bitte Nummer eingeben.','warn')}
}

function backup(){const payload={...deepClone(state),backupMeta:{appVersion:VERSION,exportedAt:new Date().toISOString()}};download(`vokabeltrainer_backup_${today()}.json`,JSON.stringify(payload,null,2),'application/json')}
function backupSummary(x){return {profiles:Array.isArray(x?.learners)?x.learners.length:0,books:Array.isArray(x?.books)?x.books.length:0,learnerBooks:Array.isArray(x?.learnerBooks)?x.learnerBooks.length:0,bookVocabulary:Array.isArray(x?.bookVocabulary)?x.bookVocabulary.length:0,sets:Array.isArray(x?.sets)?x.sets.length:0,words:Array.isArray(x?.vocabulary)?x.vocabulary.length:(Array.isArray(x?.words)?x.words.length:0),links:Array.isArray(x?.setVocabulary)?x.setVocabulary.length:(Array.isArray(x?.words)?x.words.length:0),progress:Array.isArray(x?.learnerVocabulary)?x.learnerVocabulary.length:(Array.isArray(x?.words)?x.words.length:0),grades:Array.isArray(x?.grades)?x.grades.length:0,practiceTests:Array.isArray(x?.practiceTests)?x.practiceTests.length:0,activity:Array.isArray(x?.activity)?x.activity.length:0,activeLearnerId:String(x?.activeLearnerId||''),activeSubject:String(x?.activeSubject||'')}}
function restore(text){
  try{
    const x=JSON.parse(text),issue=inspectBackup(x); if(issue)throw new Error(issue); const b=backupSummary(x),current=backupSummary(state);
    modal(`<div class="eyebrow">Backup einspielen</div><h2>Aktuelle Daten ersetzen?</h2><p>Das Backup enthält <strong>${b.profiles} Profil${b.profiles===1?'':'e'}, ${b.sets} Lernsets und ${b.words} globale Vokabeln</strong>.</p><div class="notice warn">Aktuell auf diesem Gerät: ${current.profiles} Profil${current.profiles===1?'':'e'}, ${current.sets} Lernsets, ${current.words} globale Vokabeln. Diese Daten werden ersetzt.</div><p class="microcopy">Empfehlung: Vorher ein aktuelles Backup herunterladen.</p><div class="modal-actions wrap"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="backupBeforeRestore" class="secondary">Vorher sichern</button><button type="button" id="confirmRestore" class="primary">Backup einspielen</button></div>`);
    $('#backupBeforeRestore').onclick=backup;
    $('#confirmRestore').onclick=async()=>{const btn=$('#confirmRestore');btn.disabled=true;btn.textContent='Wird gespeichert …';const previous=state;state=migrate(x);const ok=await persistState();let verified=false;if(ok){try{let check=null;if(persistenceMode==='indexeddb')check=await idbGet();else{const raw=localStorage.getItem(STORAGE_KEY);check=raw?JSON.parse(raw):null}verified=!!check&&JSON.stringify(backupSummary(check))===JSON.stringify(backupSummary(state))}catch(e){verified=false}}if(!verified){state=previous;await persistState();btn.disabled=false;btn.textContent='Backup einspielen';toast('Backup konnte nicht sicher gespeichert werden. Aktuelle Daten wurden beibehalten.','bad');return}closeModal();renderAll();toast('Backup vollständig geprüft und eingespielt.','good')};
  }catch(e){console.warn(e);toast(e?.message||'Backup ist ungültig oder konnte nicht gelesen werden.','bad')}
}
async function resetAppData(){
  modal(`<div class="eyebrow">Gefahrenbereich</div><h2>Alle App-Daten löschen</h2><p>Profile, Vokabeln, Lernfortschritt und Noten werden auf diesem Gerät gelöscht. Ein vorhandenes Backup kann später wieder eingespielt werden.</p><label>Zur Bestätigung <strong>LÖSCHEN</strong> eingeben<input id="resetConfirm" autocomplete="off"></label><div class="modal-actions"><button value="cancel" class="ghost">Abbrechen</button><button type="button" id="confirmReset" class="danger-btn" disabled>Alles löschen</button></div>`);
  const input=$('#resetConfirm'),btn=$('#confirmReset'); input.oninput=()=>btn.disabled=input.value.trim().toUpperCase()!=='LÖSCHEN';
  btn.onclick=async()=>{await persistChain.catch(()=>{});try{if(persistenceMode==='indexeddb')await idbClear();else localStorage.removeItem(STORAGE_KEY)}catch(e){console.warn(e)}state=defaultState();await persistState();closeModal();showView('homeView');renderAll();toast('App-Daten wurden zurückgesetzt.','good')};
}
function stateBytes(){try{return new Blob([JSON.stringify(state)]).size}catch(e){return 0}}
function fmtBytes(n){if(n<1024)return `${n} B`;if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;return `${(n/1024/1024).toFixed(2)} MB`}
async function renderStorageStatus(){
  const el=$('#storageStatus'); if(!el)return; const own=stateBytes(); let extra='';
  if(navigator.storage?.estimate){try{const est=await navigator.storage.estimate();if(est.usage&&est.quota)extra=` · Browser gesamt ${fmtBytes(est.usage)} von ${fmtBytes(est.quota)}`}catch(e){}}
  el.className='notice subtle';el.textContent=`Speicherung: ${persistenceMode==='indexeddb'?'IndexedDB':'localStorage-Fallback'} · App-Daten ca. ${fmtBytes(own)}${extra}`;
}
function download(name,text,type){const blob=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}