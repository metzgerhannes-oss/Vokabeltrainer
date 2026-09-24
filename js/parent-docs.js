'use strict';

(function(){
  const DOCS={
    guide:{
      title:'Anleitung für Eltern',
      eyebrow:'Bedienung',
      path:'./docs/ELTERN_ANLEITUNG.md',
      filename:'Vokabeltrainer_Anleitung_Eltern.pdf'
    },
    pedagogy:{
      title:'Pädagogische Dokumentation',
      eyebrow:'Lernkonzept',
      path:'./docs/PAEDAGOGISCHE_DOKUMENTATION.md',
      filename:'Vokabeltrainer_Paedagogische_Dokumentation.pdf'
    }
  };
  const cache=new Map();

  const htmlEscape=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function inlineHtml(value){
    let s=htmlEscape(value);
    s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
    s=s.replace(/\`([^\`]+)\`/g,'<code>$1</code>');
    return s;
  }
  function isTableSeparator(line){
    const cells=String(line||'').trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim());
    return cells.length>1&&cells.every(x=>/^:?-{3,}:?$/.test(x));
  }
  function tableCells(line){return String(line||'').trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim())}
  function markdownToHtml(markdown){
    const lines=String(markdown||'').replace(/\r/g,'').split('\n'),out=[];
    let i=0;
    while(i<lines.length){
      const line=lines[i],trim=line.trim();
      if(!trim){i++;continue}
      if(/^\|/.test(trim)&&i+1<lines.length&&isTableSeparator(lines[i+1])){
        const head=tableCells(line);i+=2;const rows=[];
        while(i<lines.length&&/^\|/.test(lines[i].trim())){rows.push(tableCells(lines[i]));i++}
        out.push('<div class="parent-doc-table-wrap"><table class="parent-doc-table"><thead><tr>'+head.map(c=>'<th>'+inlineHtml(c)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+inlineHtml(c)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>');
        continue;
      }
      const heading=trim.match(/^(#{1,4})\s+(.+)$/);
      if(heading){const level=Math.min(4,heading[1].length+1);out.push('<h'+level+'>'+inlineHtml(heading[2])+'</h'+level+'>');i++;continue}
      if(/^---+$/.test(trim)){out.push('<hr>');i++;continue}
      if(/^>\s?/.test(trim)){out.push('<blockquote>'+inlineHtml(trim.replace(/^>\s?/,''))+'</blockquote>');i++;continue}
      if(/^[-*]\s+/.test(trim)){
        const items=[];
        while(i<lines.length&&/^\s*[-*]\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*[-*]\s+/,''));i++}
        out.push('<ul>'+items.map(x=>'<li>'+inlineHtml(x)+'</li>').join('')+'</ul>');continue;
      }
      if(/^\d+\.\s+/.test(trim)){
        const items=[];
        while(i<lines.length&&/^\s*\d+\.\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*\d+\.\s+/,''));i++}
        out.push('<ol>'+items.map(x=>'<li>'+inlineHtml(x)+'</li>').join('')+'</ol>');continue;
      }
      const para=[trim];i++;
      while(i<lines.length){
        const next=lines[i].trim();
        if(!next||/^(#{1,4})\s+/.test(next)||/^[-*]\s+/.test(next)||/^\d+\.\s+/.test(next)||/^>\s?/.test(next)||/^---+$/.test(next)||(next.startsWith('|')&&i+1<lines.length&&isTableSeparator(lines[i+1])))break;
        para.push(next);i++;
      }
      out.push('<p>'+inlineHtml(para.join(' '))+'</p>');
    }
    return out.join('');
  }

  async function loadDoc(kind){
    if(cache.has(kind))return cache.get(kind);
    const spec=DOCS[kind];if(!spec)throw new Error('Dokument nicht gefunden.');
    const response=await fetch(spec.path,{credentials:'same-origin'});
    if(!response.ok)throw new Error('Dokument konnte nicht geladen werden.');
    const text=await response.text();cache.set(kind,text);return text;
  }

  function cleanInline(value){
    return String(value||'')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'$1 ($2)')
      .replace(/\*\*([^*]+)\*\*/g,'$1')
      .replace(/\`([^\`]+)\`/g,'$1')
      .replace(/\s+/g,' ')
      .trim();
  }
  function markdownBlocks(markdown){
    const lines=String(markdown||'').replace(/\r/g,'').split('\n'),blocks=[];let i=0;
    while(i<lines.length){
      const trim=lines[i].trim();
      if(!trim){i++;continue}
      if(/^\|/.test(trim)&&i+1<lines.length&&isTableSeparator(lines[i+1])){
        blocks.push({type:'h3',text:cleanInline(tableCells(trim).join(' | '))});i+=2;
        while(i<lines.length&&/^\|/.test(lines[i].trim())){blocks.push({type:'table',text:cleanInline(tableCells(lines[i]).join(' | '))});i++}
        continue;
      }
      const heading=trim.match(/^(#{1,4})\s+(.+)$/);
      if(heading){blocks.push({type:heading[1].length===1?'h1':heading[1].length===2?'h2':'h3',text:cleanInline(heading[2])});i++;continue}
      if(/^---+$/.test(trim)){blocks.push({type:'space',text:''});i++;continue}
      if(/^>\s?/.test(trim)){blocks.push({type:'quote',text:cleanInline(trim.replace(/^>\s?/,''))});i++;continue}
      if(/^[-*]\s+/.test(trim)){blocks.push({type:'bullet',text:cleanInline(trim.replace(/^[-*]\s+/,''))});i++;continue}
      if(/^\d+\.\s+/.test(trim)){blocks.push({type:'number',text:cleanInline(trim)});i++;continue}
      const para=[trim];i++;
      while(i<lines.length){
        const next=lines[i].trim();
        if(!next||/^(#{1,4})\s+/.test(next)||/^[-*]\s+/.test(next)||/^\d+\.\s+/.test(next)||/^>\s?/.test(next)||/^---+$/.test(next)||(next.startsWith('|')&&i+1<lines.length&&isTableSeparator(lines[i+1])))break;
        para.push(next);i++;
      }
      blocks.push({type:'p',text:cleanInline(para.join(' '))});
    }
    return blocks;
  }

  const CP1252={
    '€':0x80,'‚':0x82,'ƒ':0x83,'„':0x84,'…':0x85,'†':0x86,'‡':0x87,'ˆ':0x88,'‰':0x89,'Š':0x8a,'‹':0x8b,'Œ':0x8c,'Ž':0x8e,
    '‘':0x91,'’':0x92,'“':0x93,'”':0x94,'•':0x95,'–':0x96,'—':0x97,'˜':0x98,'™':0x99,'š':0x9a,'›':0x9b,'œ':0x9c,'ž':0x9e,'Ÿ':0x9f
  };
  function pdfText(value){
    const normalized=String(value||'')
      .replace(/→/g,'->').replace(/←/g,'<-').replace(/≥/g,'>=').replace(/≤/g,'<=').replace(/×/g,'x')
      .replace(/‑/g,'-').replace(/−/g,'-').replace(/✓/g,'OK').replace(/…/g,'...')
      .replace(/\t/g,' ').replace(/[\r\n]+/g,' ');
    let out='';
    for(const ch of normalized){
      let code=CP1252[ch]??ch.codePointAt(0);
      if(code>255)code=63;
      if(code===40||code===41||code===92){out+='\\'+String.fromCharCode(code);continue}
      if(code<32||code>126){out+='\\'+code.toString(8).padStart(3,'0');continue}
      out+=String.fromCharCode(code);
    }
    return out;
  }
  function wrapText(text,size,maxWidth){
    const words=String(text||'').split(/\s+/).filter(Boolean);if(!words.length)return [''];
    const canvas=wrapText.canvas||(wrapText.canvas=document.createElement('canvas'));
    const ctx=canvas.getContext('2d');ctx.font=`${Math.max(8,size*96/72)}px Arial`;
    const maxPx=maxWidth*96/72,lines=[];let line='';
    const pushLongWord=word=>{
      let part='';
      for(const ch of word){
        const test=part+ch;
        if(part&&ctx.measureText(test).width>maxPx){lines.push(part);part=ch}else part=test;
      }
      return part;
    };
    for(const word of words){
      if(!line&&ctx.measureText(word).width>maxPx){line=pushLongWord(word);continue}
      const test=line?line+' '+word:word;
      if(line&&ctx.measureText(test).width>maxPx){lines.push(line);line=ctx.measureText(word).width>maxPx?pushLongWord(word):word}else line=test;
    }
    if(line)lines.push(line);return lines;
  }
  function buildPdf(markdown,docTitle){
    const PAGE_W=595.28,PAGE_H=841.89,MARGIN=48,BOTTOM=42,CONTENT_W=PAGE_W-MARGIN*2;
    const pages=[[]];let page=pages[0],y=PAGE_H-MARGIN;
    const addLine=(text,{size=10.5,bold=false,x=MARGIN,lineHeight=15,spaceBefore=0}={})=>{
      if(spaceBefore)y-=spaceBefore;
      const width=CONTENT_W-(x-MARGIN),lines=wrapText(text,size,width);
      for(const line of lines){
        if(y-lineHeight<BOTTOM){page=[];pages.push(page);y=PAGE_H-MARGIN}
        page.push({text:line,size,bold,x,y});y-=lineHeight;
      }
    };
    for(const block of markdownBlocks(markdown)){
      if(block.type==='h1'){addLine(block.text,{size:20,bold:true,lineHeight:25,spaceBefore:y<PAGE_H-MARGIN?8:0});y-=7}
      else if(block.type==='h2'){addLine(block.text,{size:15,bold:true,lineHeight:20,spaceBefore:12});y-=3}
      else if(block.type==='h3'){addLine(block.text,{size:12,bold:true,lineHeight:17,spaceBefore:8});y-=2}
      else if(block.type==='bullet'){addLine('- '+block.text,{x:MARGIN+12,lineHeight:15});y-=2}
      else if(block.type==='number'){addLine(block.text,{x:MARGIN+12,lineHeight:15});y-=2}
      else if(block.type==='quote'){addLine(block.text,{x:MARGIN+14,lineHeight:15});y-=4}
      else if(block.type==='table'){addLine(block.text,{x:MARGIN+8,size:9.4,lineHeight:13.5});y-=1}
      else if(block.type==='space'){y-=5}
      else {addLine(block.text,{lineHeight:15});y-=6}
    }
    pages.forEach((p,idx)=>p.push({text:`${docTitle}  -  Seite ${idx+1} von ${pages.length}`,size:8,bold:false,x:MARGIN,y:23}));
    const objects=[];
    objects[1]='<< /Type /Catalog /Pages 2 0 R >>';
    const pageIds=pages.map((_,i)=>5+i*2);
    objects[2]=`<< /Type /Pages /Kids [${pageIds.map(id=>id+' 0 R').join(' ')}] /Count ${pages.length} >>`;
    objects[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objects[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    pages.forEach((lines,i)=>{
      const pageId=5+i*2,contentId=pageId+1;
      const stream=lines.map(line=>`BT /${line.bold?'F2':'F1'} ${line.size.toFixed(2)} Tf 0.08 0.09 0.12 rg 1 0 0 1 ${line.x.toFixed(2)} ${line.y.toFixed(2)} Tm (${pdfText(line.text)}) Tj ET`).join('\n')+'\n';
      objects[pageId]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W.toFixed(2)} ${PAGE_H.toFixed(2)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
      objects[contentId]=`<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
    });
    let pdf='%PDF-1.4\n% Vokabeltrainer\n',offsets=[0];
    for(let i=1;i<objects.length;i++){offsets[i]=pdf.length;pdf+=`${i} 0 obj\n${objects[i]}\nendobj\n`}
    const xref=pdf.length;pdf+=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for(let i=1;i<objects.length;i++)pdf+=String(offsets[i]).padStart(10,'0')+' 00000 n \n';
    pdf+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
    return new Blob([pdf],{type:'application/pdf'});
  }
  function downloadBlob(blob,filename){
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  async function exportPdf(kind){
    const spec=DOCS[kind];if(!spec)return;
    try{
      const md=await loadDoc(kind),blob=buildPdf(md,spec.title);downloadBlob(blob,spec.filename);toast('PDF wurde erstellt.','good');
    }catch(err){console.warn(err);toast('PDF konnte nicht erstellt werden.','bad')}
  }
  async function openDoc(kind){
    const spec=DOCS[kind];if(!spec)return;
    modal(`<div class="parent-doc-loading"><div class="eyebrow">${htmlEscape(spec.eyebrow)}</div><h2>${htmlEscape(spec.title)}</h2><p class="muted-line">Dokument wird geladen …</p></div>`);
    try{
      const md=await loadDoc(kind);
      $('#modalContent').innerHTML=`<div class="parent-doc-shell"><div class="parent-doc-toolbar"><div><div class="eyebrow">${htmlEscape(spec.eyebrow)}</div><h2>${htmlEscape(spec.title)}</h2></div><button type="button" id="parentDocPdfBtn" class="secondary">PDF exportieren</button></div><article class="parent-doc-reader">${markdownToHtml(md)}</article><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button><button type="button" id="parentDocPdfBtnBottom" class="secondary">PDF exportieren</button></div></div>`;
      $('#parentDocPdfBtn').onclick=()=>exportPdf(kind);$('#parentDocPdfBtnBottom').onclick=()=>exportPdf(kind);
    }catch(err){
      console.warn(err);$('#modalContent').innerHTML=`<div class="eyebrow">Dokumentation</div><h2>${htmlEscape(spec.title)}</h2><p class="notice bad">Das Dokument konnte nicht geladen werden.</p><div class="modal-actions"><button value="cancel" class="ghost">Schließen</button></div>`;
    }
  }
  function bind(){
    const map=[
      ['parentGuideOpenBtn',()=>openDoc('guide')],
      ['parentGuidePdfBtn',()=>exportPdf('guide')],
      ['parentPedagogyOpenBtn',()=>openDoc('pedagogy')],
      ['parentPedagogyPdfBtn',()=>exportPdf('pedagogy')]
    ];
    for(const [id,handler] of map){const el=document.getElementById(id);if(el&&!el.dataset.parentDocBound){el.dataset.parentDocBound='1';el.addEventListener('click',handler)}}
  }
  window.VTParentDocs={bind,open:openDoc,exportPdf,loadDoc,markdownToHtml,buildPdf};
})();
