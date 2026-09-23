
'use strict';

const _libraryBaseBind=bind;
bind=function(){
  _libraryBaseBind();
  const book=$('#libraryBookFilter'),section=$('#librarySectionFilter');
  if(book)book.onchange=()=>{if(section)section.value='';libraryRenderLimit=200;renderLibrary()};
  if(section)section.onchange=()=>{libraryRenderLimit=200;renderLibrary()};
};

renderLibrary=function(){
  const subject=state.activeSubject,sets=state.sets.filter(s=>s.subject===subject),allWords=searchGlobalLibrary({subject});
  const query=$('#librarySearchInput')?.value||'',requestedSet=$('#librarySetFilter')?.value||'',setFilter=sets.some(s=>s.id===requestedSet)?requestedSet:'';
  const books=globalLibraryBooks(subject),requestedBook=$('#libraryBookFilter')?.value||'',bookFilter=books.some(b=>b.id===requestedBook)?requestedBook:'';
  const sections=bookFilter?globalLibrarySections(subject,bookFilter):[],requestedSection=$('#librarySectionFilter')?.value||'',sectionFilter=sections.includes(requestedSection)?requestedSection:'';
  const filtered=searchGlobalLibrary({subject,query,bookId:bookFilter,section:sectionFilter,setId:setFilter});

  $('#librarySetFilter').innerHTML='<option value="">Alle Verwendungen</option>'+sets.map(set=>{const owner=state.learners.find(l=>l.id===set.learnerId);return '<option value="'+esc(set.id)+'" '+(setFilter===set.id?'selected':'')+'>'+esc(owner?.name||'Profil')+' · '+esc(set.title)+'</option>'}).join('');
  if($('#libraryBookFilter'))$('#libraryBookFilter').innerHTML='<option value="">Alle Lehrwerke</option>'+books.map(b=>'<option value="'+esc(b.id)+'" '+(bookFilter===b.id?'selected':'')+'>'+esc(b.title||formatIsbn(b.isbn13))+(b.builtinSource?' · geprüft':'')+(b.isbn13?' · '+esc(formatIsbn(b.isbn13)):'')+'</option>').join('');
  if($('#librarySectionFilter')){
    $('#librarySectionFilter').disabled=!bookFilter;
    $('#librarySectionFilter').innerHTML='<option value="">Alle Abschnitte</option>'+sections.map(x=>'<option value="'+esc(x)+'" '+(sectionFilter===x?'selected':'')+'>'+esc(x)+'</option>').join('');
  }
  if($('#libraryCountPill'))$('#libraryCountPill').textContent=allWords.length+(allWords.length===1?' Vokabel':' Vokabeln')+' · gemeinsam für alle Profile auf diesem Gerät'+(books.length?' · '+books.length+' Lehrwerk'+(books.length===1?'':'e'):'');
  const visible=filtered.slice(0,libraryRenderLimit),more=filtered.length-visible.length;
  if(!allWords.length){$('#wordLibrary').innerHTML='<div class="empty-state library-empty"><strong>Noch keine Vokabeln</strong><p>Ein importiertes Wort wird hier einmal gespeichert und kann danach von allen Profilen auf diesem Gerät wiederverwendet werden. Die Lernstände bleiben getrennt.</p><button id="emptyLibraryAddBtn" class="primary">+ Vokabeln hinzufügen</button></div>';$('#emptyLibraryAddBtn')?.addEventListener('click',openLibraryAddMenu);return}
  if(!filtered.length){$('#wordLibrary').innerHTML='<div class="empty-state library-empty"><strong>Keine Treffer</strong><p>Suche, Lehrwerk, Abschnitt oder Verwendung anpassen.</p></div>';return}

  const info=v=>{
    const u=indexedVocabularyUsage(v.id),ps=progressesForVocabulary(v.id),rows=libraryRowsForVocabulary(v.id),bookCount=new Set(rows.map(x=>x.bookId)).size,sectionCount=new Set(rows.map(x=>x.section)).size;
    const parts=[(v.senses||[]).length+' Bedeutung'+((v.senses||[]).length===1?'':'en'),u.sets+' Lernset'+(u.sets===1?'':'s'),u.learners+' Profil'+(u.learners===1?'':'e')];
    if(bookCount)parts.push(bookCount+' Lehrwerk'+(bookCount===1?'':'e'));
    if(sectionCount)parts.push(sectionCount+' Abschnitt'+(sectionCount===1?'':'e'));
    if(ps.length){const mastered=ps.filter(isMastered).length;parts.push('dieses Profil: '+mastered+'/'+ps.length+' gemeistert')}
    return parts.join(' · ');
  };
  const meanings=v=>(v.senses||[]).map(s=>'<div class="library-sense"><strong>'+esc(s.translation)+'</strong>'+(s.partOfSpeech?'<small> · '+esc(s.partOfSpeech)+'</small>':'')+(s.translations?.length?'<small> · akzeptiert: '+esc(s.translations.join(' · '))+'</small>':'')+'</div>').join('');
  const mobileMeaning=v=>{const arr=(v.senses||[]).map(x=>x.translation);return arr.slice(0,2).map(esc).join(' · ')+(arr.length>2?' · +'+(arr.length-2):'')};
  const desktopRows=visible.map(v=>'<tr><td><div class="library-term-audio"><strong>'+esc(v.term)+'</strong><button type="button" class="ghost library-audio-btn" data-speak="'+esc(v.term)+'" aria-label="Vokabel anhören">🔊</button></div>'+(v.extra?'<br><small>'+esc(v.extra)+'</small>':'')+(v.termVariants?.length?'<br><small>Varianten: '+esc(v.termVariants.join(' · '))+'</small>':'')+'</td><td>'+meanings(v)+'</td><td>'+esc(info(v))+'</td><td><button class="ghost" data-vocab-edit="'+esc(v.id)+'">Bearbeiten</button></td></tr>').join('');
  const mobileRows=visible.map(v=>'<div class="library-word-audio-row"><button class="library-word-card" data-vocab-edit="'+esc(v.id)+'"><span class="library-word-main"><strong>'+esc(v.term)+'</strong><span>'+mobileMeaning(v)+'</span></span><span class="library-word-meta">'+esc(info(v))+'</span><span class="library-word-chevron">›</span></button><button type="button" class="ghost library-audio-btn" data-speak="'+esc(v.term)+'" aria-label="Vokabel anhören">🔊</button></div>').join('');
  $('#wordLibrary').innerHTML='<div class="library-result-line"><span>'+(filtered.length===allWords.length?allWords.length+' Vokabel'+(allWords.length===1?'':'n'):filtered.length+' von '+allWords.length)+'</span><span class="microcopy">Wort einmal gespeichert · Lernstand je Profil · Suche über Wort, Bedeutung, ISBN und Unit</span></div><div class="library-table-desktop table-wrap"><table><thead><tr><th>Vokabel</th><th>Bedeutungen</th><th>Verwendung</th><th></th></tr></thead><tbody>'+desktopRows+'</tbody></table></div><div class="library-word-list">'+mobileRows+'</div>'+(more?'<div class="load-more"><button id="libraryMoreBtn" class="ghost">Weitere '+Math.min(200,more)+' anzeigen</button><span class="microcopy">'+visible.length+' von '+filtered.length+' sichtbar</span></div>':'');
  $$('[data-vocab-edit]').forEach(b=>b.onclick=()=>openWordEditor(b.dataset.vocabEdit));
  $('#libraryMoreBtn')?.addEventListener('click',()=>{libraryRenderLimit+=200;renderLibrary()});
};
